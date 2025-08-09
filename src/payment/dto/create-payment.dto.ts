import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsDateString,
  IsObject,
  IsPositive,
  MaxLength,
  Min,
} from 'class-validator';
import {
  PaymentMethod,
  PaymentType,
  Currency,
} from '../entities/payment.entity';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'ID do usuário que está fazendo o pagamento',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'ID do usuário que receberá o pagamento (opcional)',
    example: 2,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  recipientId?: number;

  @ApiProperty({
    description: 'ID do agendamento relacionado (opcional)',
    example: 123,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  appointmentId?: number;

  @ApiProperty({
    description: 'Tipo do pagamento',
    enum: PaymentType,
    example: PaymentType.APPOINTMENT,
  })
  @IsNotEmpty()
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty({
    description: 'Método de pagamento',
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
  })
  @IsNotEmpty()
  @IsEnum(PaymentMethod)
  method: PaymentMethod;

  @ApiProperty({
    description: 'Valor do pagamento',
    example: 150.0,
    minimum: 0.01,
  })
  @IsNotEmpty()
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Moeda',
    enum: Currency,
    example: Currency.BRL,
    required: false,
    default: Currency.BRL,
  })
  @IsOptional()
  @IsEnum(Currency)
  currency?: Currency = Currency.BRL;

  @ApiProperty({
    description: 'Taxa da plataforma',
    example: 15.0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  platformFee?: number = 0;

  @ApiProperty({
    description: 'Taxa do gateway',
    example: 5.0,
    required: false,
    minimum: 0,
  })
  @IsOptional()
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  gatewayFee?: number = 0;

  @ApiProperty({
    description: 'Descrição do pagamento',
    example: 'Pagamento por serviço de cuidado - 3 horas',
    maxLength: 255,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  description: string;

  @ApiProperty({
    description: 'Dados específicos do método de pagamento',
    example: {
      cardToken: 'card_token_123',
      installments: 1,
      pixKey: 'user@email.com',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  paymentData?: {
    // Cartão
    cardToken?: string;
    cardLast4?: string;
    cardBrand?: string;
    installments?: number;

    // PIX
    pixKey?: string;

    // Transferência bancária
    bankAccount?: string;
    bankCode?: string;

    // Carteira digital
    walletProvider?: string;
    walletAccount?: string;
  };

  @ApiProperty({
    description: 'Data de vencimento (para pagamentos com prazo)',
    example: '2024-01-20T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({
    description: 'Data de expiração (para PIX e boletos)',
    example: '2024-01-15T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;

  @ApiProperty({
    description: 'Metadados adicionais',
    example: { orderId: 'ORD-123', customerNotes: 'Pagamento urgente' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
