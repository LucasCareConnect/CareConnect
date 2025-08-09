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

export enum NotificationType {
  APPOINTMENT_CREATED = 'appointment_created',
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  REVIEW_RECEIVED = 'review_received',
  CAREGIVER_APPROVED = 'caregiver_approved',
  CAREGIVER_SUSPENDED = 'caregiver_suspended',
  PAYMENT_RECEIVED = 'payment_received',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  PROFILE_UPDATE = 'profile_update',
  PASSWORD_CHANGED = 'password_changed',
  PASSWORD_RESET = 'password_reset',
  WELCOME = 'welcome',
  OTHER = 'other',
}

export enum NotificationChannel {
  IN_APP = 'in_app',
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  type: NotificationType;

  @Column({ type: 'varchar', length: 20 })
  channel: NotificationChannel;

  @Column({ type: 'varchar', length: 20, default: NotificationPriority.NORMAL })
  priority: NotificationPriority;

  @Column({ type: 'varchar', length: 20, default: NotificationStatus.PENDING })
  @Index()
  status: NotificationStatus;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'json', nullable: true })
  data?: Record<string, any>; // Dados adicionais específicos da notificação

  @Column({ name: 'template_id', type: 'varchar', length: 100, nullable: true })
  templateId?: string; // ID do template usado

  @Column({
    name: 'related_entity_type',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  relatedEntityType?: string; // Ex: 'appointment', 'review', 'user'

  @Column({ name: 'related_entity_id', type: 'integer', nullable: true })
  @Index()
  relatedEntityId?: number; // ID da entidade relacionada

  @Column({ name: 'scheduled_for', type: 'timestamp', nullable: true })
  @Index()
  scheduledFor?: Date; // Para notificações agendadas

  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt?: Date;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt?: Date;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  readAt?: Date;

  @Column({ name: 'failed_at', type: 'timestamp', nullable: true })
  failedAt?: Date;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason?: string;

  @Column({ name: 'retry_count', type: 'integer', default: 0 })
  retryCount: number;

  @Column({ name: 'max_retries', type: 'integer', default: 3 })
  maxRetries: number;

  @Column({ name: 'external_id', type: 'varchar', length: 255, nullable: true })
  externalId?: string; // ID externo (ex: ID do provedor de email/SMS)

  @Column({ name: 'action_url', type: 'varchar', length: 500, nullable: true })
  actionUrl?: string; // URL para ação relacionada à notificação

  @Column({ name: 'action_text', type: 'varchar', length: 100, nullable: true })
  actionText?: string; // Texto do botão de ação

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt?: Date; // Data de expiração da notificação

  @Column({ name: 'is_archived', type: 'boolean', default: false })
  isArchived: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<Notification>) {
    Object.assign(this, partial);
  }

  // Métodos auxiliares
  get isExpired(): boolean {
    return this.expiresAt ? new Date() > this.expiresAt : false;
  }

  get canRetry(): boolean {
    return (
      this.retryCount < this.maxRetries &&
      this.status === NotificationStatus.FAILED
    );
  }

  get isRead(): boolean {
    return this.status === NotificationStatus.READ;
  }

  get isPending(): boolean {
    return this.status === NotificationStatus.PENDING;
  }

  get isScheduled(): boolean {
    return this.scheduledFor ? new Date() < this.scheduledFor : false;
  }
}
