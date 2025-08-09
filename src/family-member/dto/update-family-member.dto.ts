import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsOptional, IsBoolean } from 'class-validator';
import { CreateFamilyMemberDto } from './create-family-member.dto';

export class UpdateFamilyMemberDto extends PartialType(CreateFamilyMemberDto) {
  @ApiProperty({
    description: 'Se o membro da família está ativo',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
