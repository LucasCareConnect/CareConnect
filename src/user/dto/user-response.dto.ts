import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enum/user-role.enum';

export class UserResponseDto {
  @ApiProperty({ description: 'ID único do usuário', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva',
  })
  name: string;

  @ApiProperty({ description: 'Email do usuário', example: 'joao@example.com' })
  email: string;

  @ApiProperty({
    description: 'Telefone do usuário',
    example: '(11) 99999-9999',
    required: false,
  })
  phone?: string;

  @ApiProperty({
    description: 'Tipo de usuário',
    enum: UserRole,
    example: UserRole.FAMILY,
  })
  userType: UserRole;

  @ApiProperty({
    description: 'Data de criação do usuário',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
