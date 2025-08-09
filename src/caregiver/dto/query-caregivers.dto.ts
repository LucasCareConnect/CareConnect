import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ExperienceLevel, CaregiverStatus } from '../entities/caregiver.entity';

export class QueryCaregiversDto {
  @ApiProperty({
    description: 'Busca por nome, bio ou especialidades',
    example: 'cuidados com idosos',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filtrar por status do cuidador',
    enum: CaregiverStatus,
    example: CaregiverStatus.APPROVED,
    required: false,
  })
  @IsOptional()
  @IsEnum(CaregiverStatus)
  status?: CaregiverStatus;

  @ApiProperty({
    description: 'Filtrar por nível de experiência',
    enum: ExperienceLevel,
    example: ExperienceLevel.EXPERIENCED,
    required: false,
  })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiProperty({
    description: 'Filtrar apenas cuidadores disponíveis',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isAvailable?: boolean;

  @ApiProperty({
    description: 'Valor mínimo por hora',
    example: 20,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minHourlyRate?: number;

  @ApiProperty({
    description: 'Valor máximo por hora',
    example: 50,
    minimum: 0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxHourlyRate?: number;

  @ApiProperty({
    description: 'Avaliação mínima (0-5)',
    example: 4,
    minimum: 0,
    maximum: 5,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(5)
  @Type(() => Number)
  minRating?: number;

  @ApiProperty({
    description: 'Filtrar apenas com verificação de antecedentes',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  backgroundCheck?: boolean;

  @ApiProperty({
    description: 'Filtrar por especialidade específica',
    example: 'idosos',
    required: false,
  })
  @IsOptional()
  @IsString()
  specialty?: string;

  @ApiProperty({
    description: 'Ordenar por campo',
    example: 'rating',
    enum: ['rating', 'experience', 'hourlyRate', 'createdAt', 'totalReviews'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortBy?:
    | 'rating'
    | 'experience'
    | 'hourlyRate'
    | 'createdAt'
    | 'totalReviews';

  @ApiProperty({
    description: 'Direção da ordenação',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    required: false,
  })
  @IsOptional()
  @IsString()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiProperty({
    description: 'Número da página',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Itens por página',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
