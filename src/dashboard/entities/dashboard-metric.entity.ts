import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum MetricType {
  USER_REGISTRATION = 'user_registration',
  APPOINTMENT_CREATED = 'appointment_created',
  APPOINTMENT_COMPLETED = 'appointment_completed',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  MESSAGE_SENT = 'message_sent',
  REVIEW_CREATED = 'review_created',
  CAREGIVER_APPROVED = 'caregiver_approved',
  USER_LOGIN = 'user_login',
  NOTIFICATION_SENT = 'notification_sent',
  FAMILY_MEMBER_ADDED = 'family_member_added',
  ADDRESS_ADDED = 'address_added',
  AVAILABILITY_CREATED = 'availability_created',
  CONVERSATION_CREATED = 'conversation_created',
  WALLET_TRANSACTION = 'wallet_transaction',
}

export enum MetricPeriod {
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

@Entity('dashboard_metrics')
@Index(['type', 'period', 'date'])
@Index(['userId', 'type', 'date'])
@Index(['date', 'type'])
export class DashboardMetric {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'enum',
    enum: MetricType,
  })
  type: MetricType;

  @Column({
    type: 'enum',
    enum: MetricPeriod,
  })
  period: MetricPeriod;

  @Column({ type: 'date' })
  @Index()
  date: Date;

  @Column({ type: 'int', nullable: true })
  @Index()
  userId: number;

  @Column({ type: 'int', nullable: true })
  relatedEntityId: number;

  @Column({ type: 'varchar', length: 50, nullable: true })
  relatedEntityType: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1 })
  value: number;

  @Column({ type: 'decimal', precision: 15, scale: 2, nullable: true })
  amount: number;

  @Column({ type: 'varchar', length: 10, nullable: true })
  currency: string;

  @Column({ type: 'json', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  userType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subcategory: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
