import { Test, TestingModule } from '@nestjs/testing';
import { FamilyMemberController } from './family-member.controller';
import { FamilyMemberService } from './family-member.service';

describe('FamilyMemberController', () => {
  let controller: FamilyMemberController;

  const mockFamilyMemberService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FamilyMemberController],
      providers: [
        {
          provide: FamilyMemberService,
          useValue: mockFamilyMemberService,
        },
      ],
    }).compile();

    controller = module.get<FamilyMemberController>(FamilyMemberController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
