import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { CreateNotificationDto } from './create-notification.dto';
import { NotificationStatus } from '../entities/notification.entity';

export class UpdateNotificationDto extends PartialType(CreateNotificationDto) {
  @ApiProperty({
    description: 'Status da notificação',
    enum: NotificationStatus,
    example: NotificationStatus.READ,
    required: false,
  })
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @ApiProperty({
    description: 'Se a notificação está arquivada',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
