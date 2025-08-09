import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { AppointmentRepository } from './appointment.repository';
import { CaregiverService } from '../caregiver/caregiver.service';
import { UserService } from '../user/user.service';
import {
  mockAppointment,
  mockCaregiver,
  mockUser,
  createMockRepository,
  createMockPaginatedResponse,
} from '../common/test/test-utils';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import {
  AppointmentType,
  AppointmentStatus,
} from './entities/appointment.entity';
import { UserRole } from '../user/enum/user-role.enum';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let appointmentRepository: AppointmentRepository;
  let caregiverService: CaregiverService;
  let userService: UserService;

  const mockAppointmentRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findWithFilters: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByCaregiver: jest.fn(),
    findByFamilyUser: jest.fn(),
    findByDateRange: jest.fn(),
    checkConflicts: jest.fn(),
  };

  const mockCaregiverService = {
    findOne: jest.fn(),
  };

  const mockUserService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: AppointmentRepository,
          useValue: mockAppointmentRepository,
        },
        {
          provide: CaregiverService,
          useValue: mockCaregiverService,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    appointmentRepository = module.get<AppointmentRepository>(
      AppointmentRepository,
    );
    caregiverService = module.get<CaregiverService>(CaregiverService);
    userService = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 dias no futuro
    const endDate = new Date(futureDate);
    endDate.setHours(endDate.getHours() + 4); // 4 horas depois

    const createAppointmentDto: CreateAppointmentDto = {
      caregiverId: 1,
      type: AppointmentType.HOURLY,
      startDate: futureDate.toISOString(),
      endDate: endDate.toISOString(),
      hourlyRate: 25.0,
      notes: 'Regular care appointment',
      address: '123 Main St',
      emergencyContact: 'John Doe',
      emergencyPhone: '987654321',
    };

    it('should create an appointment successfully', async () => {
      const familyUser = { ...mockUser, userType: UserRole.FAMILY };
      mockUserService.findById.mockResolvedValue(familyUser);
      mockCaregiverService.findOne.mockResolvedValue(mockCaregiver);
      mockAppointmentRepository.checkConflicts.mockResolvedValue([]);
      mockAppointmentRepository.create.mockResolvedValue(mockAppointment);

      const result = await service.create(1, createAppointmentDto);

      expect(userService.findById).toHaveBeenCalledWith(1);
      expect(caregiverService.findOne).toHaveBeenCalledWith(
        createAppointmentDto.caregiverId,
      );
      expect(appointmentRepository.checkConflicts).toHaveBeenCalled();
      expect(appointmentRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          familyUserId: 1,
          caregiverId: createAppointmentDto.caregiverId,
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          id: mockAppointment.id,
        }),
      );
    });

    it('should throw ForbiddenException if family user not found', async () => {
      mockUserService.findById.mockResolvedValue(null);

      await expect(service.create(1, createAppointmentDto)).rejects.toThrow(
        'Apenas usuários do tipo família podem criar agendamentos',
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated appointments', async () => {
      const paginatedResponse = { appointments: [mockAppointment], total: 1 };
      mockAppointmentRepository.findWithFilters.mockResolvedValue(
        paginatedResponse,
      );

      const result = await service.findAll({});

      expect(appointmentRepository.findWithFilters).toHaveBeenCalledWith({});
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toEqual(
        expect.objectContaining({
          id: mockAppointment.id,
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return an appointment by id', async () => {
      mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);

      const result = await service.findById(1);

      expect(appointmentRepository.findById).toHaveBeenCalledWith(1);
      expect(result).toEqual(
        expect.objectContaining({
          id: mockAppointment.id,
        }),
      );
    });

    it('should throw NotFoundException if appointment not found', async () => {
      mockAppointmentRepository.findById.mockResolvedValue(null);

      await expect(service.findById(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateAppointmentDto: UpdateAppointmentDto = {
      notes: 'Updated notes',
      status: AppointmentStatus.CONFIRMED,
    };

    it('should update an appointment successfully', async () => {
      mockAppointmentRepository.findById.mockResolvedValue(mockAppointment);
      const updatedAppointment = {
        ...mockAppointment,
        ...updateAppointmentDto,
      };
      mockAppointmentRepository.update.mockResolvedValue(updatedAppointment);

      const result = await service.update(
        1,
        1,
        UserRole.FAMILY,
        updateAppointmentDto,
      );

      expect(appointmentRepository.findById).toHaveBeenCalledWith(1);
      expect(appointmentRepository.update).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          notes: updateAppointmentDto.notes,
          status: updateAppointmentDto.status,
        }),
      );
      expect(result).toEqual(
        expect.objectContaining({
          notes: updateAppointmentDto.notes,
          status: updateAppointmentDto.status,
        }),
      );
    });

    it('should throw NotFoundException if appointment not found', async () => {
      mockAppointmentRepository.findById.mockResolvedValue(null);

      await expect(
        service.update(1, 1, UserRole.FAMILY, updateAppointmentDto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
