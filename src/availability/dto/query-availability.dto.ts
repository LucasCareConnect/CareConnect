import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsBoolean,
  IsString,
  Min,
  Max,
  Matches,
} from 'class-validator';
import {
  AvailabilityType,
  DayOfWeek,
  ServiceType,
} from '../entities/availability.entity';

export class QueryAvailabilityDto {
  @ApiProperty({
    description: 'Número da página',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Número de itens por página',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({
    description: 'Filtrar por tipo de disponibilidade',
    enum: AvailabilityType,
    required: false,
  })
  @IsOptional()
  @IsEnum(AvailabilityType)
  type?: AvailabilityType;

  @ApiProperty({
    description: 'Filtrar por dia da semana',
    enum: DayOfWeek,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @ApiProperty({
    description: 'Filtrar por data específica (formato YYYY-MM-DD)',
    example: '2024-01-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  specificDate?: string;

  @ApiProperty({
    description: 'Filtrar por tipo de serviço',
    enum: ServiceType,
    required: false,
  })
  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @ApiProperty({
    description: 'Filtrar apenas disponíveis (true) ou bloqueados (false)',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({
    description: 'Filtrar apenas regras ativas',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Horário de início para busca (formato HH:MM)',
    example: '08:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  startTime?: string;

  @ApiProperty({
    description: 'Horário de término para busca (formato HH:MM)',
    example: '18:00',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
  endTime?: string;
}
