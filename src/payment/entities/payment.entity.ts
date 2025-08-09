import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  PIX = 'pix',
  BANK_TRANSFER = 'bank_transfer',
  DIGITAL_WALLET = 'digital_wallet',
  PLATFORM_WALLET = 'platform_wallet',
}

export enum PaymentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
}

export enum PaymentType {
  APPOINTMENT = 'appointment',
  SUBSCRIPTION = 'subscription',
  COMMISSION = 'commission',
  REFUND = 'refund',
  WITHDRAWAL = 'withdrawal',
  DEPOSIT = 'deposit',
}

export enum Currency {
  BRL = 'BRL',
  USD = 'USD',
}

@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'recipient_id', nullable: true })
  @Index()
  recipientId?: number; // Para transferências entre usuários

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'recipient_id' })
  recipient?: User;

  @Column({ name: 'appointment_id', nullable: true })
  @Index()
  appointmentId?: number; // Referência ao agendamento

  @Column({ type: 'varchar', length: 50 })
  @Index()
  type: PaymentType;

  @Column({ type: 'varchar', length: 50 })
  method: PaymentMethod;

  @Column({ type: 'varchar', length: 20, default: PaymentStatus.PENDING })
  @Index()
  status: PaymentStatus;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: Currency.BRL })
  currency: Currency;

  @Column({
    name: 'platform_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  platformFee: number; // Taxa da plataforma

  @Column({
    name: 'gateway_fee',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  gatewayFee: number; // Taxa do gateway de pagamento

  @Column({ name: 'net_amount', type: 'decimal', precision: 10, scale: 2 })
  netAmount: number; // Valor líquido após taxas

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({ name: 'external_id', type: 'varchar', length: 255, nullable: true })
  @Index()
  externalId?: string; // ID do gateway de pagamento

  @Column({ name: 'gateway_response', type: 'json', nullable: true })
  gatewayResponse?: Record<string, any>; // Resposta completa do gateway

  @Column({ name: 'payment_data', type: 'json', nullable: true })
  paymentData?: {
    cardLast4?: string;
    cardBrand?: string;
    pixKey?: string;
    bankAccount?: string;
    walletProvider?: string;
  };

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt?: Date;

  @Column({ name: 'failed_at', type: 'timestamp', nullable: true })
  failedAt?: Date;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string;

  @Column({
    name: 'refunded_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  refundedAmount: number;

  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refundedAt?: Date;

  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason?: string;

  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate?: Date; // Para pagamentos com vencimento

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date; // Para PIX e boletos

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>; // Dados adicionais

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<Payment>) {
    Object.assign(this, partial);
  }

  // Métodos auxiliares
  get isCompleted(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  get isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  get isPending(): boolean {
    return this.status === PaymentStatus.PENDING;
  }

  get canRefund(): boolean {
    return (
      this.status === PaymentStatus.COMPLETED &&
      this.refundedAmount < this.amount
    );
  }

  get isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  get availableRefundAmount(): number {
    return this.amount - this.refundedAmount;
  }
}
