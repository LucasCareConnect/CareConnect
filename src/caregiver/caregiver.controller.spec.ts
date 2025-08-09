import { Test, TestingModule } from '@nestjs/testing';
import { CaregiverController } from './caregiver.controller';
import { CaregiverService } from './caregiver.service';

describe('CaregiverController', () => {
  let controller: CaregiverController;

  const mockCaregiverService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findBySpecialty: jest.fn(),
    updateStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaregiverController],
      providers: [
        {
          provide: CaregiverService,
          useValue: mockCaregiverService,
        },
      ],
    }).compile();

    controller = module.get<CaregiverController>(CaregiverController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
