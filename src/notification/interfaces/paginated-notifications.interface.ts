import { NotificationResponseDto } from '../dto/notification-response.dto';

export interface PaginatedNotifications {
  data: NotificationResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount?: number;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byChannel: Record<string, number>;
  byStatus: Record<string, number>;
}
