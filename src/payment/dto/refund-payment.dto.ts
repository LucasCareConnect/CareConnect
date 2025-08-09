import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsPositive,
  MaxLength,
} from 'class-validator';

export class RefundPaymentDto {
  @ApiProperty({
    description: 'Valor a ser estornado',
    example: 75.0,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Motivo do estorno',
    example: 'Cancelamento do serviço pelo cliente',
    maxLength: 500,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  reason: string;

  @ApiProperty({
    description: 'Observações adicionais',
    example: 'Estorno solicitado via suporte',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;
}

export class CreateWalletTransactionDto {
  @ApiProperty({
    description: 'ID da carteira',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  walletId: number;

  @ApiProperty({
    description: 'Tipo da transação',
    example: 'deposit',
  })
  @IsNotEmpty()
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Valor da transação',
    example: 100.0,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  amount: number;

  @ApiProperty({
    description: 'Descrição da transação',
    example: 'Depósito via PIX',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  description: string;

  @ApiProperty({
    description: 'ID de referência externa',
    example: 'PIX_123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  referenceId?: string;

  @ApiProperty({
    description: 'ID do usuário relacionado (para transferências)',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  relatedUserId?: number;

  @ApiProperty({
    description: 'ID do pagamento relacionado',
    example: 123,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  paymentId?: number;
}
