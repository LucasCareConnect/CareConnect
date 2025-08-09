import { IsString, MinLength, MaxLength, IsNotEmpty } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @MinLength(8)
  @MaxLength(32)
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  confirmNewPassword: string;
}
