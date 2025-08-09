import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, MaxLength } from 'class-validator';
import { CreateReviewDto } from './create-review.dto';
import { ReviewStatus } from '../entities/review.entity';

export class UpdateReviewDto extends PartialType(CreateReviewDto) {
  @ApiProperty({
    description: 'Status da avaliação (apenas admin)',
    enum: ReviewStatus,
    example: ReviewStatus.PUBLISHED,
    required: false,
  })
  @IsOptional()
  @IsEnum(ReviewStatus)
  status?: ReviewStatus;

  @ApiProperty({
    description: 'Notas administrativas (apenas admin)',
    example: 'Avaliação revisada e aprovada',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNotes?: string;
}
