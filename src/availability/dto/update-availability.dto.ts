import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateAvailabilityDto } from './create-availability.dto';

export class UpdateAvailabilityDto extends PartialType(CreateAvailabilityDto) {
  @ApiProperty({
    description: 'Se a regra de disponibilidade está ativa',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
