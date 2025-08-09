import { IsEnum, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../enum/user-role.enum';

export class QueryUsersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(UserRole)
  userType?: UserRole;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;
}
