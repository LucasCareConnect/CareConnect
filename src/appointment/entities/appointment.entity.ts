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
import { Caregiver } from '../../caregiver/entities/caregiver.entity';

export enum AppointmentStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  CANCELLED_BY_FAMILY = 'cancelled_by_family',
  CANCELLED_BY_CAREGIVER = 'cancelled_by_caregiver',
}

export enum AppointmentType {
  HOURLY = 'hourly',
  DAILY = 'daily',
  OVERNIGHT = 'overnight',
  LIVE_IN = 'live_in',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'family_user_id' })
  @Index()
  familyUserId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'family_user_id' })
  familyUser: User;

  @Column({ name: 'caregiver_id' })
  @Index()
  caregiverId: number;

  @ManyToOne(() => Caregiver, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caregiver_id' })
  caregiver: Caregiver;

  @Column({ type: 'varchar', length: 20, default: AppointmentStatus.PENDING })
  status: AppointmentStatus;

  @Column({ type: 'varchar', length: 20, default: AppointmentType.HOURLY })
  type: AppointmentType;

  @Column({ name: 'start_date', type: 'timestamp' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'timestamp' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  hourlyRate: number;

  @Column({ name: 'total_hours', type: 'decimal', precision: 5, scale: 2 })
  totalHours: number;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ name: 'special_requirements', type: 'json', nullable: true })
  specialRequirements?: string[];

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({
    name: 'emergency_contact',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  emergencyContact?: string;

  @Column({
    name: 'emergency_phone',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  emergencyPhone?: string;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt?: Date;

  @Column({ name: 'started_at', type: 'timestamp', nullable: true })
  startedAt?: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt?: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt?: Date;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason?: string;

  @Column({ name: 'cancelled_by', type: 'varchar', length: 20, nullable: true })
  cancelledBy?: 'family' | 'caregiver' | 'admin';

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<Appointment>) {
    Object.assign(this, partial);
  }
}
