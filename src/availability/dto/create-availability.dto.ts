import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsString,
  IsBoolean,
  IsOptional,
  IsArray,
  IsDateString,
  Matches,
  ValidateIf,
  ArrayNotEmpty,
} from 'class-validator';
import {
  AvailabilityType,
  DayOfWeek,
  ServiceType,
} from '../entities/availability.entity';

export class CreateAvailabilityDto {
  @ApiProperty({
    description: 'Tipo de disponibilidade',
    enum: AvailabilityType,
    example: AvailabilityType.RECURRING,
  })
  @IsNotEmpty()
  @IsEnum(AvailabilityType)
  type: AvailabilityType;

  @ApiProperty({
    description: 'Dia da semana (obrigatório para tipo RECURRING)',
    enum: DayOfWeek,
    example: DayOfWeek.MONDAY,
    required: false,
  })
  @ValidateIf((o) => o.type === AvailabilityType.RECURRING)
  @IsNotEmpty()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @ApiProperty({
    description: 'Data específica (obrigatório para tipos EXCEPTION e BLOCK)',
    example: '2024-01-15',
    required: false,
  })
  @ValidateIf(
    (o) =>
      o.type === AvailabilityType.EXCEPTION ||
      o.type === AvailabilityType.BLOCK,
  )
  @IsNotEmpty()
  @IsDateString()
  specificDate?: string;

  @ApiProperty({
    description: 'Horário de início (formato HH:MM)',
    example: '08:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime deve estar no formato HH:MM',
  })
  startTime: string;

  @ApiProperty({
    description: 'Horário de término (formato HH:MM)',
    example: '18:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime deve estar no formato HH:MM',
  })
  endTime: string;

  @ApiProperty({
    description: 'Tipos de serviço disponíveis neste horário',
    enum: ServiceType,
    isArray: true,
    example: [ServiceType.HOURLY, ServiceType.DAILY],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(ServiceType, { each: true })
  serviceTypes: ServiceType[];

  @ApiProperty({
    description: 'Se está disponível (true) ou bloqueado (false)',
    example: true,
    required: false,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean = true;

  @ApiProperty({
    description: 'Observações sobre a disponibilidade',
    example: 'Disponível apenas para cuidados básicos',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Data de início da validade (formato YYYY-MM-DD)',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  effectiveFrom?: string;

  @ApiProperty({
    description: 'Data de fim da validade (formato YYYY-MM-DD)',
    example: '2024-12-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  effectiveUntil?: string;
}
