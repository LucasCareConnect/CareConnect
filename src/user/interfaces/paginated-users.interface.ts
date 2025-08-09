import { UserResponseDto } from '../dto/user-response.dto';

export interface PaginatedUsers {
  data: UserResponseDto[];
  count: number;
  page: number;
  limit: number;
  totalPages: number;
}
