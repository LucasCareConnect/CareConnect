import { FamilyMemberResponseDto } from '../dto/family-member-response.dto';

export interface PaginatedFamilyMembers {
  data: FamilyMemberResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
