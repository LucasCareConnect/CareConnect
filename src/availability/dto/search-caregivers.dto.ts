import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsDateString,
  IsString,
  IsOptional,
  Min,
  Max,
  Matches,
} from 'class-validator';
import { ServiceType } from '../entities/availability.entity';

export class SearchCaregiversDto {
  @ApiProperty({
    description: 'Data desejada para o serviço (formato YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Horário de início desejado (formato HH:MM)',
    example: '08:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime deve estar no formato HH:MM',
  })
  startTime: string;

  @ApiProperty({
    description: 'Horário de término desejado (formato HH:MM)',
    example: '18:00',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime deve estar no formato HH:MM',
  })
  endTime: string;

  @ApiProperty({
    description: 'Tipo de serviço desejado',
    enum: ServiceType,
    example: ServiceType.HOURLY,
  })
  @IsNotEmpty()
  @IsEnum(ServiceType)
  serviceType: ServiceType;

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
    description: 'Valor máximo por hora',
    example: 50.0,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(0)
  maxHourlyRate?: number;

  @ApiProperty({
    description: 'Especialidade desejada',
    example: 'elderly_care',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiProperty({
    description: 'Avaliação mínima (1-5)',
    example: 4.0,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;
}
