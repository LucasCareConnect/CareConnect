import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  MaxLength,
  MinLength,
  Matches,
} from 'class-validator';
import { AddressType } from '../entities/address.entity';

export class CreateAddressDto {
  @ApiProperty({
    description: 'Tipo do endereço',
    enum: AddressType,
    example: AddressType.HOME,
    required: false,
    default: AddressType.HOME,
  })
  @IsOptional()
  @IsEnum(AddressType)
  type?: AddressType = AddressType.HOME;

  @ApiProperty({
    description: 'Rótulo identificador do endereço',
    example: 'Casa da Vovó',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  label: string;

  @ApiProperty({
    description: 'Endereço completo (rua, número, complemento)',
    example: 'Rua das Flores, 123, Apto 45',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  streetAddress: string;

  @ApiProperty({
    description: 'Bairro',
    example: 'Jardim Primavera',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  neighborhood: string;

  @ApiProperty({
    description: 'Cidade',
    example: 'São Paulo',
    maxLength: 100,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  city: string;

  @ApiProperty({
    description: 'Estado',
    example: 'SP',
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(50)
  state: string;

  @ApiProperty({
    description: 'CEP (apenas números ou formato 00000-000)',
    example: '01234-567',
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, {
    message: 'CEP deve estar no formato 00000-000 ou 00000000',
  })
  postalCode: string;

  @ApiProperty({
    description: 'País',
    example: 'Brasil',
    required: false,
    default: 'Brasil',
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  country?: string = 'Brasil';

  @ApiProperty({
    description: 'Complemento e referências',
    example: 'Próximo ao mercado, portão azul',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  complement?: string;

  @ApiProperty({
    description: 'Se este é o endereço principal',
    example: true,
    required: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean = false;

  @ApiProperty({
    description: 'Observações sobre o endereço',
    example: 'Casa térrea, fácil acesso para cadeirante',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Nome do contato de emergência no local',
    example: 'Maria Silva (vizinha)',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  emergencyContact?: string;

  @ApiProperty({
    description: 'Telefone do contato de emergência',
    example: '(11) 99999-9999',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Matches(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, {
    message: 'Telefone deve estar no formato (00) 00000-0000',
  })
  emergencyPhone?: string;

  @ApiProperty({
    description: 'Instruções de acesso ao local',
    example: 'Tocar interfone apto 45, código do portão: 1234',
    required: false,
  })
  @IsOptional()
  @IsString()
  accessInstructions?: string;
}
