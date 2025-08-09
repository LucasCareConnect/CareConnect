import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import {
  Gender,
  Relationship,
  MobilityLevel,
  CareLevel,
} from '../entities/family-member.entity';

export class QueryFamilyMembersDto {
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
    description: 'Filtrar por gênero',
    enum: Gender,
    required: false,
  })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiProperty({
    description: 'Filtrar por relacionamento',
    enum: Relationship,
    required: false,
  })
  @IsOptional()
  @IsEnum(Relationship)
  relationship?: Relationship;

  @ApiProperty({
    description: 'Filtrar por nível de cuidado',
    enum: CareLevel,
    required: false,
  })
  @IsOptional()
  @IsEnum(CareLevel)
  careLevel?: CareLevel;

  @ApiProperty({
    description: 'Filtrar por nível de mobilidade',
    enum: MobilityLevel,
    required: false,
  })
  @IsOptional()
  @IsEnum(MobilityLevel)
  mobilityLevel?: MobilityLevel;

  @ApiProperty({
    description: 'Idade mínima',
    example: 18,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  minAge?: number;

  @ApiProperty({
    description: 'Idade máxima',
    example: 100,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(0)
  maxAge?: number;

  @ApiProperty({
    description: 'Filtrar apenas membros ativos',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({
    description: 'Buscar por texto (nome)',
    example: 'Maria',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filtrar por condição médica',
    example: 'Diabetes',
    required: false,
  })
  @IsOptional()
  @IsString()
  medicalCondition?: string;

  @ApiProperty({
    description: 'Filtrar por alergia',
    example: 'Penicilina',
    required: false,
  })
  @IsOptional()
  @IsString()
  allergy?: string;
}
