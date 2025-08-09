import { Test, TestingModule } from '@nestjs/testing';
import { FamilyMemberService } from './family-member.service';
import { FamilyMemberRepository } from './family-member.repository';
import { UserService } from '../user/user.service';

describe('FamilyMemberService', () => {
  let service: FamilyMemberService;

  const mockFamilyMemberRepository = {
    create: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByFamilyUser: jest.fn(),
  };

  const mockUserService = {
    findById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FamilyMemberService,
        {
          provide: FamilyMemberRepository,
          useValue: mockFamilyMemberRepository,
        },
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    service = module.get<FamilyMemberService>(FamilyMemberService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
