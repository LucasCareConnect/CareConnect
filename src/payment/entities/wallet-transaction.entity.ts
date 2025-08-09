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
import { Wallet } from './wallet.entity';
import { Payment } from './payment.entity';
import { Currency } from './payment.entity';

export enum TransactionType {
  DEPOSIT = 'deposit',
  WITHDRAWAL = 'withdrawal',
  PAYMENT = 'payment',
  REFUND = 'refund',
  COMMISSION = 'commission',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
  FEE = 'fee',
  ADJUSTMENT = 'adjustment',
}

export enum TransactionStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('wallet_transactions')
export class WalletTransaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'wallet_id' })
  @Index()
  walletId: number;

  @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet: Wallet;

  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'payment_id', nullable: true })
  @Index()
  paymentId?: number;

  @ManyToOne(() => Payment, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'payment_id' })
  payment?: Payment;

  @Column({ name: 'related_user_id', nullable: true })
  @Index()
  relatedUserId?: number; // Para transferências

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'related_user_id' })
  relatedUser?: User;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  type: TransactionType;

  @Column({ type: 'varchar', length: 20, default: TransactionStatus.PENDING })
  @Index()
  status: TransactionStatus;

  @Column({ type: 'decimal', precision: 15, scale: 2 })
  amount: number;

  @Column({ type: 'varchar', length: 3, default: Currency.BRL })
  currency: Currency;

  @Column({ name: 'balance_before', type: 'decimal', precision: 15, scale: 2 })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 15, scale: 2 })
  balanceAfter: number;

  @Column({ type: 'varchar', length: 255 })
  description: string;

  @Column({
    name: 'reference_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  @Index()
  referenceId?: string; // ID de referência externa

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'processed_at', type: 'timestamp', nullable: true })
  processedAt?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<WalletTransaction>) {
    Object.assign(this, partial);
  }

  // Métodos auxiliares
  get isCompleted(): boolean {
    return this.status === TransactionStatus.COMPLETED;
  }

  get isPending(): boolean {
    return this.status === TransactionStatus.PENDING;
  }

  get isFailed(): boolean {
    return this.status === TransactionStatus.FAILED;
  }

  get isCredit(): boolean {
    return [
      TransactionType.DEPOSIT,
      TransactionType.REFUND,
      TransactionType.TRANSFER_IN,
    ].includes(this.type);
  }

  get isDebit(): boolean {
    return [
      TransactionType.WITHDRAWAL,
      TransactionType.PAYMENT,
      TransactionType.TRANSFER_OUT,
      TransactionType.FEE,
    ].includes(this.type);
  }
}
