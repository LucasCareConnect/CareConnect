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
import { NotificationType, NotificationChannel } from './notification.entity';

@Entity('notification_preferences')
@Unique(['userId', 'type', 'channel'])
export class NotificationPreference {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50 })
  type: NotificationType;

  @Column({ type: 'varchar', length: 20 })
  channel: NotificationChannel;

  @Column({ name: 'is_enabled', type: 'boolean', default: true })
  isEnabled: boolean;

  @Column({ name: 'quiet_hours_start', type: 'time', nullable: true })
  quietHoursStart?: string; // Ex: '22:00'

  @Column({ name: 'quiet_hours_end', type: 'time', nullable: true })
  quietHoursEnd?: string; // Ex: '08:00'

  @Column({ type: 'json', nullable: true })
  settings?: Record<string, any>; // Configurações específicas do canal

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<NotificationPreference>) {
    Object.assign(this, partial);
  }

  // Método para verificar se está no horário silencioso
  isInQuietHours(): boolean {
    if (!this.quietHoursStart || !this.quietHoursEnd) {
      return false;
    }

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    const [startHour, startMin] = this.quietHoursStart.split(':').map(Number);
    const [endHour, endMin] = this.quietHoursEnd.split(':').map(Number);

    const startTime = startHour * 60 + startMin;
    const endTime = endHour * 60 + endMin;

    // Se o horário de fim é menor que o de início, significa que passa da meia-noite
    if (endTime < startTime) {
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }
}
