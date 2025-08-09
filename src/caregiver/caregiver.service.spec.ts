import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { CaregiverService } from './caregiver.service';
import { CaregiverRepository } from './caregiver.repository';
import { UserService } from '../user/user.service';
import {
  mockCaregiver,
  mockUser,
  createMockPaginatedResponse,
} from '../common/test/test-utils';
import { CreateCaregiverDto } from './dto/create-caregiver.dto';
import { UpdateCaregiverDto } from './dto/update-caregiver.dto';
import { ExperienceLevel } from './entities/caregiver.entity';
import { UserRole } from '../user/enum/user-role.enum';

describe('CaregiverService', () => {
  let service: CaregiverService;
  let caregiverRepository: CaregiverRepository;
  let userService: UserService;

  const mockCaregiverRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findByUserId: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockUserService = {
    findOne: jest.fn(),
    update: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CaregiverService,
        {
          provide: CaregiverRepository,
          useValue: mockCaregiverRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<CaregiverService>(CaregiverService);
    caregiverRepository = module.get<CaregiverRepository>(CaregiverRepository);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createCaregiverDto: CreateCaregiverDto = {
      userId: 1,
      bio: 'Experienced caregiver',
      experience: 5,
      experienceLevel: ExperienceLevel.INTERMEDIATE,
      hourlyRate: 25.0,
      specialties: ['elderly_care'],
      certifications: ['CPR'],
      languages: ['English'],
    };

    it('should create a caregiver successfully', async () => {
      const caregiverUser = { ...mockUser, userType: UserRole.CAREGIVER };
      mockUserService.findOne.mockResolvedValue(caregiverUser);
      mockCaregiverRepository.findByUserId.mockResolvedValue(null);
      mockCaregiverRepository.create.mockResolvedValue(mockCaregiver);
      mockCaregiverRepository.findById.mockResolvedValue(mockCaregiver);

      const result = await service.create(createCaregiverDto);

      expect(userService.findOne).toHaveBeenCalledWith(
        createCaregiverDto.userId,
      );
      expect(caregiverRepository.findByUserId).toHaveBeenCalledWith(
        createCaregiverDto.userId,
      );
      expect(caregiverRepository.create).toHaveBeenCalled();
      expect(caregiverRepository.findById).toHaveBeenCalledWith(
        mockCaregiver.id,
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: mockCaregiver.id,
          userId: mockCaregiver.userId,
        }),
      );
    });

    it('should throw TypeError if user does not exist', async () => {
      mockUserService.findOne.mockResolvedValue(null);

      await expect(service.create(createCaregiverDto)).rejects.toThrow(
        'Cannot read properties of null',
      );
      expect(userService.findOne).toHaveBeenCalledWith(
        createCaregiverDto.userId,
      );
    });

    it('should throw BadRequestException if caregiver already exists', async () => {
      mockUserService.findOne.mockResolvedValue(mockUser);
      mockCaregiverRepository.findByUserId.mockResolvedValue(mockCaregiver);

      await expect(service.create(createCaregiverDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated caregivers', async () => {
      const paginatedResponse = createMockPaginatedResponse([mockCaregiver]);
      mockCaregiverRepository.findAll.mockResolvedValue(paginatedResponse);

      const result = await service.findAll({});

      expect(caregiverRepository.findAll).toHaveBeenCalledWith({});
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          id: mockCaregiver.id,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a caregiver by id', async () => {
      mockCaregiverRepository.findById.mockResolvedValue(mockCaregiver);

      const result = await service.findOne(1);

      expect(caregiverRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(
        expect.objectContaining({
          id: mockCaregiver.id,
        }),
      );
    });

    it('should throw NotFoundException if caregiver not found', async () => {
      mockCaregiverRepository.findById.mockResolvedValue(null);

      await expect(service.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateCaregiverDto: UpdateCaregiverDto = {
      bio: 'Updated bio',
      hourlyRate: 30.0,
    };

    it('should update a caregiver successfully', async () => {
      mockCaregiverRepository.findById.mockResolvedValue(mockCaregiver);
      const updatedCaregiver = { ...mockCaregiver, ...updateCaregiverDto };
      mockCaregiverRepository.update.mockResolvedValue(updatedCaregiver);

      const result = await service.update(1, updateCaregiverDto);

      expect(caregiverRepository.findById).toHaveBeenCalledWith(1);
      expect(caregiverRepository.update).toHaveBeenCalledWith(
        1,
        updateCaregiverDto,
      );
      expect(result).toEqual(
        expect.objectContaining({
          bio: updateCaregiverDto.bio,
          hourlyRate: updateCaregiverDto.hourlyRate,
        }),
      );
    });

    it('should throw NotFoundException if caregiver not found', async () => {
      mockCaregiverRepository.findById.mockResolvedValue(null);

      await expect(service.update(1, updateCaregiverDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should remove a caregiver successfully', async () => {
      mockCaregiverRepository.findById.mockResolvedValue(mockCaregiver);
      mockCaregiverRepository.delete.mockResolvedValue(undefined);

      await service.remove(1);

      expect(caregiverRepository.findById).toHaveBeenCalledWith(1);
      expect(caregiverRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if caregiver not found', async () => {
      mockCaregiverRepository.findById.mockResolvedValue(null);

      await expect(service.remove(1)).rejects.toThrow(NotFoundException);
    });
  });
});
