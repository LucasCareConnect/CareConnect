import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Currency } from './payment.entity';

export enum WalletStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  BLOCKED = 'blocked',
}

@Entity('wallets')
@Unique(['userId', 'currency'])
export class Wallet {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 3, default: Currency.BRL })
  currency: Currency;

  @Column({ type: 'decimal', precision: 15, scale: 2, default: 0 })
  balance: number;

  @Column({
    name: 'available_balance',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  availableBalance: number; // Saldo disponível para saque

  @Column({
    name: 'pending_balance',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  pendingBalance: number; // Saldo pendente (em processamento)

  @Column({
    name: 'reserved_balance',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  reservedBalance: number; // Saldo reservado (bloqueado)

  @Column({ type: 'varchar', length: 20, default: WalletStatus.ACTIVE })
  status: WalletStatus;

  @Column({ name: 'last_transaction_at', type: 'timestamp', nullable: true })
  lastTransactionAt?: Date;

  @Column({
    name: 'total_received',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  totalReceived: number; // Total recebido histórico

  @Column({
    name: 'total_sent',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  totalSent: number; // Total enviado histórico

  @Column({
    name: 'total_withdrawn',
    type: 'decimal',
    precision: 15,
    scale: 2,
    default: 0,
  })
  totalWithdrawn: number; // Total sacado histórico

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<Wallet>) {
    Object.assign(this, partial);
  }

  // Métodos auxiliares
  get isActive(): boolean {
    return this.status === WalletStatus.ACTIVE;
  }

  get canWithdraw(): boolean {
    return this.isActive && this.availableBalance > 0;
  }

  get totalBalance(): number {
    return this.balance + this.pendingBalance + this.reservedBalance;
  }
}
