import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  IsPositive,
  Min,
  Max,
} from 'class-validator';
import { AppointmentType } from '../entities/appointment.entity';

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'ID do cuidador',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  caregiverId: number;

  @ApiProperty({
    description: 'Tipo de agendamento',
    enum: AppointmentType,
    example: AppointmentType.HOURLY,
  })
  @IsNotEmpty()
  @IsEnum(AppointmentType)
  type: AppointmentType;

  @ApiProperty({
    description: 'Data e hora de início',
    example: '2024-01-15T08:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  startDate: string;

  @ApiProperty({
    description: 'Data e hora de término',
    example: '2024-01-15T16:00:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty({
    description: 'Valor por hora em reais',
    example: 25.5,
  })
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  hourlyRate: number;

  @ApiProperty({
    description: 'Observações adicionais',
    example: 'Paciente com mobilidade reduzida, necessita ajuda para locomoção',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Requisitos especiais',
    example: ['medicação', 'fisioterapia', 'alimentação especial'],
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialRequirements?: string[];

  @ApiProperty({
    description: 'Endereço onde será realizado o cuidado',
    example: 'Rua das Flores, 123, Jardim Primavera, São Paulo - SP',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'Nome do contato de emergência',
    example: 'Maria Silva',
    required: false,
  })
  @IsOptional()
  @IsString()
  emergencyContact?: string;

  @ApiProperty({
    description: 'Telefone do contato de emergência',
    example: '(11) 99999-9999',
    required: false,
  })
  @IsOptional()
  @IsString()
  emergencyPhone?: string;
}
