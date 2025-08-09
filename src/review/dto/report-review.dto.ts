import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsEnum, MaxLength } from 'class-validator';

export enum ReportReason {
  INAPPROPRIATE_LANGUAGE = 'inappropriate_language',
  FALSE_INFORMATION = 'false_information',
  SPAM = 'spam',
  HARASSMENT = 'harassment',
  DISCRIMINATION = 'discrimination',
  OTHER = 'other',
}

export class ReportReviewDto {
  @ApiProperty({
    description: 'Motivo da denúncia',
    enum: ReportReason,
    example: ReportReason.INAPPROPRIATE_LANGUAGE,
  })
  @IsNotEmpty()
  @IsEnum(ReportReason)
  reason: ReportReason;

  @ApiProperty({
    description: 'Detalhes adicionais sobre a denúncia',
    example: 'A avaliação contém linguagem ofensiva e inadequada.',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  details?: string;
}
