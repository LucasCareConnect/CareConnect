import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
  NotificationStatus,
} from '../entities/notification.entity';

export class NotificationResponseDto {
  @ApiProperty({ description: 'ID único da notificação', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID do usuário', example: 1 })
  userId: number;

  @ApiProperty({
    description: 'Dados do usuário',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Tipo da notificação',
    enum: NotificationType,
    example: NotificationType.APPOINTMENT_CREATED,
  })
  type: NotificationType;

  @ApiProperty({
    description: 'Canal da notificação',
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL,
  })
  channel: NotificationChannel;

  @ApiProperty({
    description: 'Prioridade da notificação',
    enum: NotificationPriority,
    example: NotificationPriority.NORMAL,
  })
  priority: NotificationPriority;

  @ApiProperty({
    description: 'Status da notificação',
    enum: NotificationStatus,
    example: NotificationStatus.SENT,
  })
  status: NotificationStatus;

  @ApiProperty({
    description: 'Título da notificação',
    example: 'Novo agendamento criado',
  })
  title: string;

  @ApiProperty({
    description: 'Mensagem da notificação',
    example: 'Você tem um novo agendamento para amanhã às 14:00',
  })
  message: string;

  @ApiProperty({
    description: 'Dados adicionais',
    example: { appointmentId: 123, caregiverName: 'João Silva' },
    required: false,
  })
  data?: Record<string, any>;

  @ApiProperty({
    description: 'ID do template usado',
    example: 'appointment_created_email',
    required: false,
  })
  templateId?: string;

  @ApiProperty({
    description: 'Tipo da entidade relacionada',
    example: 'appointment',
    required: false,
  })
  relatedEntityType?: string;

  @ApiProperty({
    description: 'ID da entidade relacionada',
    example: 123,
    required: false,
  })
  relatedEntityId?: number;

  @ApiProperty({
    description: 'Data agendada para envio',
    example: '2024-01-15T14:00:00Z',
    required: false,
  })
  scheduledFor?: Date;

  @ApiProperty({
    description: 'Data de envio',
    example: '2024-01-15T14:05:00Z',
    required: false,
  })
  sentAt?: Date;

  @ApiProperty({
    description: 'Data de entrega',
    example: '2024-01-15T14:05:30Z',
    required: false,
  })
  deliveredAt?: Date;

  @ApiProperty({
    description: 'Data de leitura',
    example: '2024-01-15T15:30:00Z',
    required: false,
  })
  readAt?: Date;

  @ApiProperty({
    description: 'Data de falha',
    example: '2024-01-15T14:05:00Z',
    required: false,
  })
  failedAt?: Date;

  @ApiProperty({
    description: 'Motivo da falha',
    example: 'Email address not found',
    required: false,
  })
  failureReason?: string;

  @ApiProperty({
    description: 'Número de tentativas',
    example: 1,
  })
  retryCount: number;

  @ApiProperty({
    description: 'Máximo de tentativas',
    example: 3,
  })
  maxRetries: number;

  @ApiProperty({
    description: 'ID externo',
    example: 'msg_123456789',
    required: false,
  })
  externalId?: string;

  @ApiProperty({
    description: 'URL de ação',
    example: 'https://app.careconnect.com/appointments/123',
    required: false,
  })
  actionUrl?: string;

  @ApiProperty({
    description: 'Texto da ação',
    example: 'Ver agendamento',
    required: false,
  })
  actionText?: string;

  @ApiProperty({
    description: 'Data de expiração',
    example: '2024-01-20T23:59:59Z',
    required: false,
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Se está arquivada',
    example: false,
  })
  isArchived: boolean;

  @ApiProperty({
    description: 'Se está expirada',
    example: false,
  })
  isExpired: boolean;

  @ApiProperty({
    description: 'Se pode tentar novamente',
    example: true,
  })
  canRetry: boolean;

  @ApiProperty({
    description: 'Se foi lida',
    example: false,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Se está pendente',
    example: true,
  })
  isPending: boolean;

  @ApiProperty({
    description: 'Se está agendada',
    example: false,
  })
  isScheduled: boolean;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}

export class NotificationPreferenceResponseDto {
  @ApiProperty({ description: 'ID único da preferência', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID do usuário', example: 1 })
  userId: number;

  @ApiProperty({
    description: 'Tipo da notificação',
    enum: NotificationType,
    example: NotificationType.APPOINTMENT_CREATED,
  })
  type: NotificationType;

  @ApiProperty({
    description: 'Canal da notificação',
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL,
  })
  channel: NotificationChannel;

  @ApiProperty({
    description: 'Se está habilitada',
    example: true,
  })
  isEnabled: boolean;

  @ApiProperty({
    description: 'Horário de início do período silencioso',
    example: '22:00',
    required: false,
  })
  quietHoursStart?: string;

  @ApiProperty({
    description: 'Horário de fim do período silencioso',
    example: '08:00',
    required: false,
  })
  quietHoursEnd?: string;

  @ApiProperty({
    description: 'Configurações específicas',
    example: { emailFormat: 'html' },
    required: false,
  })
  settings?: Record<string, any>;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}
