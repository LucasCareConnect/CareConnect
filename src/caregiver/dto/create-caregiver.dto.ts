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
  IsPositive,
  ArrayMaxSize,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ExperienceLevel } from '../entities/caregiver.entity';

export class CreateCaregiverDto {
  @ApiProperty({
    description: 'ID do usuário associado ao cuidador',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  userId: number;

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
  })
  @IsNumber()
  @Min(0)
  @Max(50)
  experience: number;

  @ApiProperty({
    description: 'Nível de experiência',
    enum: ExperienceLevel,
    example: ExperienceLevel.EXPERIENCED,
  })
  @IsEnum(ExperienceLevel)
  experienceLevel: ExperienceLevel;

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
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean = true;

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
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  backgroundCheck?: boolean = false;

  @ApiProperty({
    description: 'Data da verificação de antecedentes',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  @IsOptional()
  @Type(() => Date)
  backgroundCheckDate?: Date;
}
