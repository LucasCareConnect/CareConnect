import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import { AddressType } from '../entities/address.entity';

export class AddressResponseDto {
  @ApiProperty({ description: 'ID único do endereço', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID do usuário', example: 1 })
  userId: number;

  @ApiProperty({
    description: 'Dados do usuário',
    type: UserResponseDto,
    required: false,
  })
  user?: UserResponseDto;

  @ApiProperty({
    description: 'Tipo do endereço',
    enum: AddressType,
    example: AddressType.HOME,
  })
  type: AddressType;

  @ApiProperty({
    description: 'Rótulo identificador',
    example: 'Casa da Vovó',
  })
  label: string;

  @ApiProperty({
    description: 'Endereço completo',
    example: 'Rua das Flores, 123, Apto 45',
  })
  streetAddress: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Jardim Primavera',
  })
  neighborhood: string;

  @ApiProperty({
    description: 'Cidade',
    example: 'São Paulo',
  })
  city: string;

  @ApiProperty({
    description: 'Estado',
    example: 'SP',
  })
  state: string;

  @ApiProperty({
    description: 'CEP',
    example: '01234-567',
  })
  postalCode: string;

  @ApiProperty({
    description: 'País',
    example: 'Brasil',
  })
  country: string;

  @ApiProperty({
    description: 'Complemento e referências',
    example: 'Próximo ao mercado, portão azul',
    required: false,
  })
  complement?: string;

  @ApiProperty({
    description: 'Latitude para geolocalização',
    example: -23.5505,
    required: false,
  })
  latitude?: number;

  @ApiProperty({
    description: 'Longitude para geolocalização',
    example: -46.6333,
    required: false,
  })
  longitude?: number;

  @ApiProperty({
    description: 'Se é o endereço principal',
    example: true,
  })
  isPrimary: boolean;

  @ApiProperty({
    description: 'Se o endereço está ativo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Observações sobre o endereço',
    example: 'Casa térrea, fácil acesso',
    required: false,
  })
  notes?: string;

  @ApiProperty({
    description: 'Contato de emergência no local',
    example: 'Maria Silva (vizinha)',
    required: false,
  })
  emergencyContact?: string;

  @ApiProperty({
    description: 'Telefone de emergência',
    example: '(11) 99999-9999',
    required: false,
  })
  emergencyPhone?: string;

  @ApiProperty({
    description: 'Instruções de acesso',
    example: 'Tocar interfone apto 45',
    required: false,
  })
  accessInstructions?: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}
