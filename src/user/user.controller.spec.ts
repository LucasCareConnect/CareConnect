import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UserRole } from './enum/user-role.enum';
import { UserResponseDto } from './dto/user-response.dto';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';

describe('UserController', () => {
  let controller: UserController;

  const mockUserResponse: UserResponseDto = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    phone: '123456789',
    userType: UserRole.FAMILY,
    createdAt: new Date(),
  };

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'Password123!',
      userType: UserRole.FAMILY,
    };

    it('should create a user', async () => {
      mockUserService.create.mockResolvedValue(mockUserResponse);

      const result = await controller.create(createUserDto);

      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
      expect(result).toEqual(mockUserResponse);
    });

    it('should create a caregiver user', async () => {
      const createCaregiverDto: CreateUserDto = {
        ...createUserDto,
        userType: UserRole.CAREGIVER,
      };

      const mockCaregiverResponse: UserResponseDto = {
        ...mockUserResponse,
        userType: UserRole.CAREGIVER,
      };

      mockUserService.create.mockResolvedValue(mockCaregiverResponse);

      const result = await controller.create(createCaregiverDto);

      expect(mockUserService.create).toHaveBeenCalledWith(createCaregiverDto);
      expect(result).toEqual(mockCaregiverResponse);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const queryDto: QueryUsersDto = {
        page: 1,
        limit: 10,
      };

      const mockPaginatedResponse = {
        data: [mockUserResponse],
        count: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockUserService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(queryDto);

      expect(mockUserService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should return paginated users with search filter', async () => {
      const queryDto: QueryUsersDto = {
        search: 'Test',
        page: 1,
        limit: 10,
      };

      const mockPaginatedResponse = {
        data: [mockUserResponse],
        count: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockUserService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(queryDto);

      expect(mockUserService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockPaginatedResponse);
    });

    it('should return paginated users with userType filter', async () => {
      const queryDto: QueryUsersDto = {
        userType: UserRole.FAMILY,
        page: 1,
        limit: 10,
      };

      const mockPaginatedResponse = {
        data: [mockUserResponse],
        count: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      mockUserService.findAll.mockResolvedValue(mockPaginatedResponse);

      const result = await controller.findAll(queryDto);

      expect(mockUserService.findAll).toHaveBeenCalledWith(queryDto);
      expect(result).toEqual(mockPaginatedResponse);
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      mockUserService.findOne.mockResolvedValue(mockUserResponse);

      const result = await controller.findOne('1');

      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      const mockRequest = {
        user: {
          userId: 1,
          email: 'test@example.com',
          userType: UserRole.FAMILY,
        },
      } as unknown as AuthenticatedRequest;

      mockUserService.findOne.mockResolvedValue(mockUserResponse);

      const result = await controller.getProfile(mockRequest);

      expect(mockUserService.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockUserResponse);
    });
  });

  describe('update', () => {
    const updateUserDto: UpdateUserDto = {
      name: 'Updated User',
    };

    it('should update user own profile', async () => {
      const mockRequest = {
        user: {
          userId: 1,
          email: 'test@example.com',
          userType: UserRole.FAMILY,
        },
      } as unknown as AuthenticatedRequest;

      mockUserService.update.mockResolvedValue({
        ...mockUserResponse,
        name: 'Updated User',
      });

      const result = await controller.update('1', updateUserDto, mockRequest);

      expect(mockUserService.update).toHaveBeenCalledWith(1, updateUserDto);
      expect(result.name).toBe('Updated User');
    });

    it('should throw ForbiddenException when user tries to update another user', async () => {
      const mockRequest = {
        user: {
          userId: 2,
          email: 'other@example.com',
          userType: UserRole.FAMILY,
        },
      } as unknown as AuthenticatedRequest;

      await expect(
        controller.update('1', updateUserDto, mockRequest),
      ).rejects.toThrow(ForbiddenException);

      expect(mockUserService.update).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a user', async () => {
      mockUserService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(mockUserService.remove).toHaveBeenCalledWith(1);
      expect(result).toBeUndefined();
    });

    it('should remove a user with string id', async () => {
      mockUserService.remove.mockResolvedValue(undefined);

      const result = await controller.remove('123');

      expect(mockUserService.remove).toHaveBeenCalledWith(123);
      expect(result).toBeUndefined();
    });
  });
});
