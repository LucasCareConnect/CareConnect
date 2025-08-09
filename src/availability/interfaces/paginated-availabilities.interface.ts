import { AvailabilityResponseDto } from '../dto/availability-response.dto';

export interface PaginatedAvailabilities {
  data: AvailabilityResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface AvailableCaregiver {
  caregiver: {
    id: number;
    userId: number;
    user: {
      id: number;
      name: string;
      email: string;
      phone?: string;
    };
    bio?: string;
    experience: number;
    experienceLevel: string;
    hourlyRate?: number;
    specialties?: string[];
    certifications?: string[];
    languages?: string[];
    rating: number;
    totalReviews: number;
    totalAppointments: number;
    profilePicture?: string;
    backgroundCheck: boolean;
    backgroundCheckDate?: Date;
  };
  availableSlots: {
    startTime: string;
    endTime: string;
    serviceTypes: string[];
  }[];
}

export interface PaginatedAvailableCaregivers {
  data: AvailableCaregiver[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  searchCriteria: {
    date: string;
    startTime: string;
    endTime: string;
    serviceType: string;
  };
}
