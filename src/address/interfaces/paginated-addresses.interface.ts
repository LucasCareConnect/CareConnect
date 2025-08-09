import { AddressResponseDto } from '../dto/address-response.dto';

export interface PaginatedAddresses {
  data: AddressResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
