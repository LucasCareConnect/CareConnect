import { CaregiverResponseDto } from '../dto/caregiver-response.dto';

export interface PaginatedCaregivers {
  data: CaregiverResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
