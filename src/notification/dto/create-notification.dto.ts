import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsDateString,
  IsUrl,
  IsObject,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import {
  NotificationType,
  NotificationChannel,
  NotificationPriority,
} from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({
    description: 'ID do usuário que receberá a notificação',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Tipo da notificação',
    enum: NotificationType,
    example: NotificationType.APPOINTMENT_CREATED,
  })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Canal de entrega da notificação',
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL,
  })
  @IsNotEmpty()
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({
    description: 'Prioridade da notificação',
    enum: NotificationPriority,
    example: NotificationPriority.NORMAL,
    required: false,
    default: NotificationPriority.NORMAL,
  })
  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority = NotificationPriority.NORMAL;

  @ApiProperty({
    description: 'Título da notificação',
    example: 'Novo agendamento criado',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    description: 'Mensagem da notificação',
    example: 'Você tem um novo agendamento para amanhã às 14:00',
  })
  @IsNotEmpty()
  @IsString()
  message: string;

  @ApiProperty({
    description: 'Dados adicionais da notificação',
    example: { appointmentId: 123, caregiverName: 'João Silva' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiProperty({
    description: 'ID do template usado',
    example: 'appointment_created_email',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  templateId?: string;

  @ApiProperty({
    description: 'Tipo da entidade relacionada',
    example: 'appointment',
    required: false,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  relatedEntityType?: string;

  @ApiProperty({
    description: 'ID da entidade relacionada',
    example: 123,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  relatedEntityId?: number;

  @ApiProperty({
    description: 'Data e hora para envio agendado',
    example: '2024-01-15T14:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  scheduledFor?: string;

  @ApiProperty({
    description: 'Número máximo de tentativas de envio',
    example: 3,
    required: false,
    minimum: 1,
    maximum: 10,
    default: 3,
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  maxRetries?: number = 3;

  @ApiProperty({
    description: 'URL para ação relacionada',
    example: 'https://app.careconnect.com/appointments/123',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsUrl()
  @MaxLength(500)
  actionUrl?: string;

  @ApiProperty({
    description: 'Texto do botão de ação',
    example: 'Ver agendamento',
    required: false,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  actionText?: string;

  @ApiProperty({
    description: 'Data de expiração da notificação',
    example: '2024-01-20T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}
