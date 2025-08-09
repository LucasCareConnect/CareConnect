import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsDateString } from 'class-validator';
import { CreateAppointmentDto } from './create-appointment.dto';
import { AppointmentStatus } from '../entities/appointment.entity';

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {
  @ApiProperty({
    description: 'Status do agendamento',
    enum: AppointmentStatus,
    example: AppointmentStatus.CONFIRMED,
    required: false,
  })
  @IsOptional()
  @IsEnum(AppointmentStatus)
  status?: AppointmentStatus;

  @ApiProperty({
    description: 'Motivo do cancelamento (obrigatório se status for cancelled)',
    example: 'Conflito de agenda',
    required: false,
  })
  @IsOptional()
  @IsString()
  cancellationReason?: string;
}
