import { AppointmentResponseDto } from '../dto/appointment-response.dto';

export interface PaginatedAppointments {
  data: AppointmentResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
