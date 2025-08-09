import { UserRole } from '../../user/enum/user-role.enum';
import { User } from '../../user/entities/user.entity';
import {
  Caregiver,
  ExperienceLevel,
  CaregiverStatus,
} from '../../caregiver/entities/caregiver.entity';
import {
  Appointment,
  AppointmentType,
  AppointmentStatus,
} from '../../appointment/entities/appointment.entity';
import { Review, ReviewStatus } from '../../review/entities/review.entity';
import {
  FamilyMember,
  Relationship,
  Gender,
  CareLevel,
  MobilityLevel,
} from '../../family-member/entities/family-member.entity';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { CaregiverResponseDto } from '../../caregiver/dto/caregiver-response.dto';

// Mock User Entity
export const mockUser: User = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword',
  phone: '123456789',
  userType: UserRole.FAMILY,
  createdAt: new Date('2023-01-01'),
};

// Mock User Response DTO
export const mockUserResponseDto: UserResponseDto = {
  id: 1,
  name: 'Test User',
  email: 'test@example.com',
  phone: '123456789',
  userType: UserRole.FAMILY,
  createdAt: new Date('2023-01-01'),
};

// Mock Caregiver Entity
export const mockCaregiver: Caregiver = {
  id: 1,
  userId: 1,
  bio: 'Experienced caregiver',
  experience: 5,
  experienceLevel: ExperienceLevel.INTERMEDIATE,
  hourlyRate: 25.0,
  specialties: ['elderly_care', 'medication_management'],
  certifications: ['CPR', 'First Aid'],
  languages: ['English', 'Spanish'],
  isAvailable: true,
  status: CaregiverStatus.APPROVED,
  rating: 4.5,
  totalReviews: 10,
  totalAppointments: 50,
  profilePicture: 'profile.jpg',
  backgroundCheck: true,
  backgroundCheckDate: new Date('2023-01-01'),
  lastActive: new Date(),
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  user: mockUser,
};

// Mock Caregiver Response DTO
export const mockCaregiverResponseDto: CaregiverResponseDto = {
  id: 1,
  userId: 1,
  bio: 'Experienced caregiver',
  experience: 5,
  experienceLevel: ExperienceLevel.INTERMEDIATE,
  hourlyRate: 25.0,
  specialties: ['elderly_care', 'medication_management'],
  certifications: ['CPR', 'First Aid'],
  languages: ['English', 'Spanish'],
  isAvailable: true,
  status: CaregiverStatus.APPROVED,
  rating: 4.5,
  totalReviews: 10,
  totalAppointments: 50,
  profilePicture: 'profile.jpg',
  backgroundCheck: true,
  backgroundCheckDate: new Date('2023-01-01'),
  lastActive: new Date(),
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  user: mockUserResponseDto,
};

// Mock Appointment Entity
export const mockAppointment: Appointment = {
  id: 1,
  familyUserId: 1,
  caregiverId: 1,
  type: AppointmentType.HOURLY,
  status: AppointmentStatus.PENDING,
  startDate: new Date('2023-12-01T10:00:00Z'),
  endDate: new Date('2023-12-01T14:00:00Z'),
  hourlyRate: 25.0,
  totalHours: 4,
  totalAmount: 100.0,
  notes: 'Regular care appointment',
  specialRequirements: ['medication_reminder'],
  address: '123 Main St, City, State',
  emergencyContact: 'John Doe',
  emergencyPhone: '987654321',
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  familyUser: mockUser,
  caregiver: mockCaregiver,
};

// Mock Review Entity
export const mockReview: Review = {
  id: 1,
  familyUserId: 1,
  caregiverId: 1,
  appointmentId: 1,
  rating: 5,
  comment: 'Excellent service!',
  status: ReviewStatus.PUBLISHED,
  isAnonymous: false,
  helpfulCount: 3,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  familyUser: mockUser,
  caregiver: mockCaregiver,
  appointment: mockAppointment,
};

// Mock Family Member Entity
export const mockFamilyMember: FamilyMember = {
  id: 1,
  familyUserId: 1,
  name: 'John Doe',
  relationship: Relationship.PARENT,
  birthDate: new Date('1950-01-01'),
  gender: Gender.MALE,
  careLevel: CareLevel.MODERATE,
  mobilityLevel: MobilityLevel.ASSISTANCE_NEEDED,
  age: 73,
  medicalConditions: ['diabetes', 'hypertension'],
  medications: [
    { name: 'metformin', dosage: '500mg', frequency: 'twice daily' },
    { name: 'lisinopril', dosage: '10mg', frequency: 'once daily' },
  ],
  allergies: ['penicillin'],
  emergencyContact: 'Jane Doe',
  emergencyPhone: '987654321',
  isActive: true,
  createdAt: new Date('2023-01-01'),
  updatedAt: new Date('2023-01-01'),
  familyUser: mockUser,
};

// Mock Repository Methods
export const createMockRepository = () => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  remove: jest.fn(),
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
    getMany: jest.fn(),
    getManyAndCount: jest.fn(),
  })),
});

// Mock Service Methods
export const createMockService = () => ({
  create: jest.fn(),
  findAll: jest.fn(),
  findOne: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
});

// Paginated Response Mock
export const createMockPaginatedResponse = <T>(
  data: T[],
  total: number = 1,
) => ({
  data,
  total,
  page: 1,
  limit: 10,
  totalPages: Math.ceil(total / 10),
});
