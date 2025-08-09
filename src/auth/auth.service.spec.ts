import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';
import { NotificationService } from '../notification/notification.service';
import { mockUser, mockUserResponseDto } from '../common/test/test-utils';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UserRole } from '../user/enum/user-role.enum';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;

  const mockUserService = {
    findByEmail: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updatePassword: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  const mockPasswordResetTokenRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
  };

  const mockNotificationService = {
    sendPasswordResetNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: mockUserService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: PasswordResetTokenRepository,
          useValue: mockPasswordResetTokenRepository,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const registerDto: RegisterDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '123456789',
      userType: UserRole.FAMILY,
    };

    it('should register a new user successfully', async () => {
      mockUserService.create.mockResolvedValue(mockUserResponseDto);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.register(registerDto);

      expect(mockUserService.create).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual({
        access_token: 'jwt-token',
        refresh_token: 'jwt-token',
      });
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should login user successfully', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(mockUserService.findByEmail).toHaveBeenCalledWith(loginDto.email);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        loginDto.password,
        mockUser.password,
      );
      expect(result).toEqual({
        access_token: 'jwt-token',
        refresh_token: 'jwt-token',
      });
    });

    it('should throw UnauthorizedException for invalid credentials', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateUser', () => {
    it('should validate user successfully', async () => {
      mockUserService.findByEmail.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);

      const result = await service.validateUser(
        'test@example.com',
        'password123',
      );

      expect(result).toEqual(
        expect.objectContaining({
          id: mockUser.id,
          email: mockUser.email,
        }),
      );
    });

    it('should throw UnauthorizedException for invalid user', async () => {
      mockUserService.findByEmail.mockResolvedValue(null);

      await expect(
        service.validateUser('test@example.com', 'password123'),
      ).rejects.toThrow('Usuário não encontrado');
    });
  });

  describe('changePassword', () => {
    const changePasswordDto: ChangePasswordDto = {
      oldPassword: 'oldPassword',
      newPassword: 'newPassword123',
      confirmNewPassword: 'newPassword123',
    };

    it('should change password successfully', async () => {
      mockUserService.findById.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(true as never);
      mockUserService.updatePassword.mockResolvedValue(undefined);

      const result = await service.changePassword(1, changePasswordDto);

      expect(mockUserService.findById).toHaveBeenCalledWith(1);
      expect(mockedBcrypt.compare).toHaveBeenCalledWith(
        changePasswordDto.oldPassword,
        mockUser.password,
      );
      expect(mockUserService.updatePassword).toHaveBeenCalledWith(
        1,
        changePasswordDto.newPassword,
      );
      expect(result).toEqual({ message: 'Senha alterada com sucesso' });
    });

    it('should throw UnauthorizedException for wrong current password', async () => {
      mockUserService.findById.mockResolvedValue(mockUser);
      mockedBcrypt.compare.mockResolvedValue(false as never);

      await expect(
        service.changePassword(1, changePasswordDto),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
