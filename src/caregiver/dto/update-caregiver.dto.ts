import {
  IsString,
  IsOptional,
  IsNumber,
  IsEnum,
  IsArray,
  IsBoolean,
  Min,
  Max,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ExperienceLevel, CaregiverStatus } from '../entities/caregiver.entity';

export class UpdateCaregiverDto {
  @ApiProperty({
    description: 'Biografia do cuidador',
    example:
      'Cuidadora experiente com 5 anos de experiência em cuidados com idosos.',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  bio?: string;

  @ApiProperty({
    description: 'Anos de experiência',
    example: 5,
    minimum: 0,
    maximum: 50,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(50)
  experience?: number;

  @ApiProperty({
    description: 'Nível de experiência',
    enum: ExperienceLevel,
    example: ExperienceLevel.EXPERIENCED,
    required: false,
  })
  @IsOptional()
  @IsEnum(ExperienceLevel)
  experienceLevel?: ExperienceLevel;

  @ApiProperty({
    description: 'Valor por hora em reais',
    example: 25.5,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  hourlyRate?: number;

  @ApiProperty({
    description: 'Especialidades do cuidador',
    example: ['idosos', 'alzheimer', 'mobilidade reduzida'],
    required: false,
    type: [String],
    maxItems: 10,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  specialties?: string[];

  @ApiProperty({
    description: 'Certificações do cuidador',
    example: ['Primeiros Socorros', 'Cuidados com Idosos'],
    required: false,
    type: [String],
    maxItems: 10,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  certifications?: string[];

  @ApiProperty({
    description: 'Idiomas falados pelo cuidador',
    example: ['Português', 'Inglês', 'Espanhol'],
    required: false,
    type: [String],
    maxItems: 5,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(5)
  languages?: string[];

  @ApiProperty({
    description: 'Se o cuidador está disponível para novos trabalhos',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({
    description: 'Status do cuidador',
    enum: CaregiverStatus,
    example: CaregiverStatus.APPROVED,
    required: false,
  })
  @IsOptional()
  @IsEnum(CaregiverStatus)
  status?: CaregiverStatus;

  @ApiProperty({
    description: 'URL da foto de perfil',
    example: 'https://example.com/profile.jpg',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  profilePicture?: string;

  @ApiProperty({
    description: 'Se o cuidador passou por verificação de antecedentes',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  backgroundCheck?: boolean;

  @ApiProperty({
    description: 'Data da verificação de antecedentes',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  backgroundCheckDate?: Date;

  @ApiProperty({
    description: 'Data da última atividade',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  lastActive?: Date;
}
