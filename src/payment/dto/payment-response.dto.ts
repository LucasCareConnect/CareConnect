import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import {
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  Currency,
} from '../entities/payment.entity';
import { WalletStatus } from '../entities/wallet.entity';
import {
  TransactionType,
  TransactionStatus,
} from '../entities/wallet-transaction.entity';

export class PaymentResponseDto {
  @ApiProperty({ description: 'ID único do pagamento', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID do usuário pagador', example: 1 })
  userId: number;

  @ApiProperty({
    description: 'Dados do usuário pagador',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'ID do usuário recebedor',
    example: 2,
    required: false,
  })
  recipientId?: number;

  @ApiProperty({
    description: 'Dados do usuário recebedor',
    type: UserResponseDto,
    required: false,
  })
  recipient?: UserResponseDto;

  @ApiProperty({
    description: 'ID do agendamento',
    example: 123,
    required: false,
  })
  appointmentId?: number;

  @ApiProperty({
    description: 'Tipo do pagamento',
    enum: PaymentType,
    example: PaymentType.APPOINTMENT,
  })
  type: PaymentType;

  @ApiProperty({
    description: 'Método de pagamento',
    enum: PaymentMethod,
    example: PaymentMethod.CREDIT_CARD,
  })
  method: PaymentMethod;

  @ApiProperty({
    description: 'Status do pagamento',
    enum: PaymentStatus,
    example: PaymentStatus.COMPLETED,
  })
  status: PaymentStatus;

  @ApiProperty({ description: 'Valor do pagamento', example: 150.0 })
  amount: number;

  @ApiProperty({
    description: 'Moeda',
    enum: Currency,
    example: Currency.BRL,
  })
  currency: Currency;

  @ApiProperty({ description: 'Taxa da plataforma', example: 15.0 })
  platformFee: number;

  @ApiProperty({ description: 'Taxa do gateway', example: 5.0 })
  gatewayFee: number;

  @ApiProperty({ description: 'Valor líquido', example: 130.0 })
  netAmount: number;

  @ApiProperty({
    description: 'Descrição do pagamento',
    example: 'Pagamento por serviço de cuidado - 3 horas',
  })
  description: string;

  @ApiProperty({
    description: 'ID externo do gateway',
    example: 'pay_123456789',
    required: false,
  })
  externalId?: string;

  @ApiProperty({
    description: 'Dados do pagamento',
    example: { cardLast4: '1234', cardBrand: 'visa' },
    required: false,
  })
  paymentData?: Record<string, any>;

  @ApiProperty({
    description: 'Data de processamento',
    example: '2024-01-15T14:30:00Z',
    required: false,
  })
  processedAt?: Date;

  @ApiProperty({
    description: 'Data de falha',
    example: '2024-01-15T14:30:00Z',
    required: false,
  })
  failedAt?: Date;

  @ApiProperty({
    description: 'Motivo da falha',
    example: 'Cartão recusado',
    required: false,
  })
  failureReason?: string;

  @ApiProperty({ description: 'Valor estornado', example: 0.0 })
  refundedAmount: number;

  @ApiProperty({
    description: 'Data do estorno',
    example: '2024-01-16T10:00:00Z',
    required: false,
  })
  refundedAt?: Date;

  @ApiProperty({
    description: 'Motivo do estorno',
    example: 'Cancelamento do serviço',
    required: false,
  })
  refundReason?: string;

  @ApiProperty({
    description: 'Data de vencimento',
    example: '2024-01-20T23:59:59Z',
    required: false,
  })
  dueDate?: Date;

  @ApiProperty({
    description: 'Data de expiração',
    example: '2024-01-15T23:59:59Z',
    required: false,
  })
  expiresAt?: Date;

  @ApiProperty({
    description: 'Se está completo',
    example: true,
  })
  isCompleted: boolean;

  @ApiProperty({
    description: 'Se falhou',
    example: false,
  })
  isFailed: boolean;

  @ApiProperty({
    description: 'Se está pendente',
    example: false,
  })
  isPending: boolean;

  @ApiProperty({
    description: 'Se pode ser estornado',
    example: true,
  })
  canRefund: boolean;

  @ApiProperty({
    description: 'Se está expirado',
    example: false,
  })
  isExpired: boolean;

  @ApiProperty({
    description: 'Valor disponível para estorno',
    example: 150.0,
  })
  availableRefundAmount: number;

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

export class WalletResponseDto {
  @ApiProperty({ description: 'ID único da carteira', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID do usuário', example: 1 })
  userId: number;

  @ApiProperty({
    description: 'Dados do usuário',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Moeda',
    enum: Currency,
    example: Currency.BRL,
  })
  currency: Currency;

  @ApiProperty({ description: 'Saldo total', example: 1500.0 })
  balance: number;

  @ApiProperty({ description: 'Saldo disponível', example: 1200.0 })
  availableBalance: number;

  @ApiProperty({ description: 'Saldo pendente', example: 200.0 })
  pendingBalance: number;

  @ApiProperty({ description: 'Saldo reservado', example: 100.0 })
  reservedBalance: number;

  @ApiProperty({
    description: 'Status da carteira',
    enum: WalletStatus,
    example: WalletStatus.ACTIVE,
  })
  status: WalletStatus;

  @ApiProperty({
    description: 'Data da última transação',
    example: '2024-01-15T14:30:00Z',
    required: false,
  })
  lastTransactionAt?: Date;

  @ApiProperty({ description: 'Total recebido histórico', example: 5000.0 })
  totalReceived: number;

  @ApiProperty({ description: 'Total enviado histórico', example: 3000.0 })
  totalSent: number;

  @ApiProperty({ description: 'Total sacado histórico', example: 500.0 })
  totalWithdrawn: number;

  @ApiProperty({
    description: 'Se está ativa',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Se pode sacar',
    example: true,
  })
  canWithdraw: boolean;

  @ApiProperty({
    description: 'Saldo total (incluindo pendente e reservado)',
    example: 1500.0,
  })
  totalBalance: number;

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

export class WalletTransactionResponseDto {
  @ApiProperty({ description: 'ID único da transação', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID da carteira', example: 1 })
  walletId: number;

  @ApiProperty({ description: 'ID do usuário', example: 1 })
  userId: number;

  @ApiProperty({
    description: 'Dados do usuário',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'ID do pagamento',
    example: 123,
    required: false,
  })
  paymentId?: number;

  @ApiProperty({
    description: 'ID do usuário relacionado',
    example: 2,
    required: false,
  })
  relatedUserId?: number;

  @ApiProperty({
    description: 'Dados do usuário relacionado',
    type: UserResponseDto,
    required: false,
  })
  relatedUser?: UserResponseDto;

  @ApiProperty({
    description: 'Tipo da transação',
    enum: TransactionType,
    example: TransactionType.DEPOSIT,
  })
  type: TransactionType;

  @ApiProperty({
    description: 'Status da transação',
    enum: TransactionStatus,
    example: TransactionStatus.COMPLETED,
  })
  status: TransactionStatus;

  @ApiProperty({ description: 'Valor da transação', example: 100.0 })
  amount: number;

  @ApiProperty({
    description: 'Moeda',
    enum: Currency,
    example: Currency.BRL,
  })
  currency: Currency;

  @ApiProperty({ description: 'Saldo antes da transação', example: 1000.0 })
  balanceBefore: number;

  @ApiProperty({ description: 'Saldo após a transação', example: 1100.0 })
  balanceAfter: number;

  @ApiProperty({
    description: 'Descrição da transação',
    example: 'Depósito via PIX',
  })
  description: string;

  @ApiProperty({
    description: 'ID de referência externa',
    example: 'PIX_123456789',
    required: false,
  })
  referenceId?: string;

  @ApiProperty({
    description: 'Data de processamento',
    example: '2024-01-15T14:30:00Z',
    required: false,
  })
  processedAt?: Date;

  @ApiProperty({
    description: 'Se está completa',
    example: true,
  })
  isCompleted: boolean;

  @ApiProperty({
    description: 'Se está pendente',
    example: false,
  })
  isPending: boolean;

  @ApiProperty({
    description: 'Se falhou',
    example: false,
  })
  isFailed: boolean;

  @ApiProperty({
    description: 'Se é crédito',
    example: true,
  })
  isCredit: boolean;

  @ApiProperty({
    description: 'Se é débito',
    example: false,
  })
  isDebit: boolean;

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
