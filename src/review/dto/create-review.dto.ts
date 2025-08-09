import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateReviewDto {
  @ApiProperty({
    description: 'ID do agendamento que está sendo avaliado',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  appointmentId: number;

  @ApiProperty({
    description: 'Avaliação de 1 a 5 estrelas',
    example: 5,
    minimum: 1,
    maximum: 5,
  })
  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    description: 'Comentário sobre o cuidador e o serviço prestado',
    example: 'Excelente cuidadora! Muito atenciosa e carinhosa com minha mãe.',
    minLength: 10,
    maxLength: 1000,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(10, { message: 'O comentário deve ter pelo menos 10 caracteres' })
  @MaxLength(1000, {
    message: 'O comentário deve ter no máximo 1000 caracteres',
  })
  comment: string;

  @ApiProperty({
    description: 'Se a avaliação deve ser anônima',
    example: false,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isAnonymous?: boolean = false;
}
