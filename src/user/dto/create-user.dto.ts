import {
  IsString,
  MinLength,
  MaxLength,
  IsEmail,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enum/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Email do usuário',
    example: 'joao@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
    example: 'MinhaSenh@123',
    minLength: 8,
    maxLength: 32,
  })
  @IsString()
  @MinLength(8)
  @MaxLength(32)
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'A senha deve conter letras maiúsculas, minúsculas, números ou símbolos',
  })
  password: string;

  @ApiProperty({
    description: 'Telefone do usuário',
    example: '(11) 99999-9999',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  @Matches(/^[\d\s\-+()]+$/, {
    message: 'Telefone deve conter apenas números, espaços e símbolos válidos',
  })
  phone?: string;

  @ApiProperty({
    description: 'Tipo de usuário',
    enum: UserRole,
    example: UserRole.FAMILY,
  })
  @IsEnum(UserRole)
  userType: UserRole;
}
