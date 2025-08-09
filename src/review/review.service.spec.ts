import { Test, TestingModule } from '@nestjs/testing';
import { ReviewService } from './review.service';
import { ReviewRepository } from './review.repository';
import { AppointmentService } from '../appointment/appointment.service';
import { CaregiverService } from '../caregiver/caregiver.service';
import { UserService } from '../user/user.service';

describe('ReviewService', () => {
  let service: ReviewService;

  const mockReviewRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByCaregiver: jest.fn(),
    findByFamilyUser: jest.fn(),
  };

  const mockAppointmentService = {
    findById: jest.fn(),
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
        ReviewService,
        {
          provide: ReviewRepository,
          useValue: mockReviewRepository,
        },
        {
          provide: AppointmentService,
          useValue: mockAppointmentService,
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

    service = module.get<ReviewService>(ReviewService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
