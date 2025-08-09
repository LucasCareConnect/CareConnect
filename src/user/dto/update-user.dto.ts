import {
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
  IsEmail,
  Matches,
} from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[\d\s\-+()]+$/, {
    message: 'Telefone deve conter apenas números, espaços e símbolos válidos',
  })
  phone?: string;
}
