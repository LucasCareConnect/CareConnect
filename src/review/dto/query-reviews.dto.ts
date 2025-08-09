import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ReviewStatus } from '../entities/review.entity';

export class QueryReviewsDto {
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
    description: 'Filtrar por status',
    enum: ReviewStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @ApiProperty({
    description: 'Filtrar por ID do cuidador',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  caregiverId?: number;

  @ApiProperty({
    description: 'Filtrar por ID do usuário da família',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  familyUserId?: number;

  @ApiProperty({
    description: 'Filtrar por avaliação mínima',
    example: 4,
    required: false,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(5)
  minRating?: number;

  @ApiProperty({
    description: 'Filtrar por avaliação máxima',
    example: 5,
    required: false,
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(5)
  maxRating?: number;

  @ApiProperty({
    description: 'Incluir apenas avaliações anônimas',
    example: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isAnonymous?: boolean;

  @ApiProperty({
    description: 'Ordenar por campo',
    example: 'createdAt',
    required: false,
    enum: ['createdAt', 'rating', 'helpfulCount'],
  })
  @IsOptional()
  sortBy?: 'createdAt' | 'rating' | 'helpfulCount' = 'createdAt';

  @ApiProperty({
    description: 'Ordem de classificação',
    example: 'DESC',
    required: false,
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}
