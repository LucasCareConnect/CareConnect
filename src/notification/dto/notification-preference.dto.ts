import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsString,
  IsObject,
  Matches,
} from 'class-validator';
import {
  NotificationType,
  NotificationChannel,
} from '../entities/notification.entity';

export class CreateNotificationPreferenceDto {
  @ApiProperty({
    description: 'Tipo da notificação',
    enum: NotificationType,
    example: NotificationType.APPOINTMENT_CREATED,
  })
  @IsNotEmpty()
  @IsEnum(NotificationType)
  type: NotificationType;

  @ApiProperty({
    description: 'Canal da notificação',
    enum: NotificationChannel,
    example: NotificationChannel.EMAIL,
  })
  @IsNotEmpty()
  @IsEnum(NotificationChannel)
  channel: NotificationChannel;

  @ApiProperty({
    description: 'Se a notificação está habilitada',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean = true;

  @ApiProperty({
    description: 'Horário de início do período silencioso (HH:mm)',
    example: '22:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Horário deve estar no formato HH:mm',
  })
  quietHoursStart?: string;

  @ApiProperty({
    description: 'Horário de fim do período silencioso (HH:mm)',
    example: '08:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Horário deve estar no formato HH:mm',
  })
  quietHoursEnd?: string;

  @ApiProperty({
    description: 'Configurações específicas do canal',
    example: { emailFormat: 'html', smsShortFormat: true },
    required: false,
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class UpdateNotificationPreferenceDto {
  @ApiProperty({
    description: 'Se a notificação está habilitada',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @ApiProperty({
    description: 'Horário de início do período silencioso (HH:mm)',
    example: '22:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Horário deve estar no formato HH:mm',
  })
  quietHoursStart?: string;

  @ApiProperty({
    description: 'Horário de fim do período silencioso (HH:mm)',
    example: '08:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Horário deve estar no formato HH:mm',
  })
  quietHoursEnd?: string;

  @ApiProperty({
    description: 'Configurações específicas do canal',
    example: { emailFormat: 'html', smsShortFormat: true },
    required: false,
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

export class BulkUpdatePreferencesDto {
  @ApiProperty({
    description: 'Lista de preferências para atualizar',
    type: [CreateNotificationPreferenceDto],
  })
  @IsNotEmpty()
  preferences: CreateNotificationPreferenceDto[];
}
