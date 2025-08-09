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
import { Appointment } from '../../appointment/entities/appointment.entity';

export enum ReviewStatus {
  PENDING = 'pending',
  PUBLISHED = 'published',
  HIDDEN = 'hidden',
  REPORTED = 'reported',
}

@Entity('reviews')
export class Review {
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

  @Column({ name: 'appointment_id', unique: true })
  @Index()
  appointmentId: number;

  @ManyToOne(() => Appointment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'appointment_id' })
  appointment: Appointment;

  @Column({ type: 'int', width: 1 })
  rating: number; // 1-5 estrelas

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'varchar', length: 20, default: ReviewStatus.PUBLISHED })
  status: ReviewStatus;

  @Column({ name: 'is_anonymous', type: 'boolean', default: false })
  isAnonymous: boolean;

  @Column({ name: 'helpful_count', type: 'int', default: 0 })
  helpfulCount: number;

  @Column({
    name: 'report_reason',
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  reportReason?: string;

  @Column({ name: 'reported_at', type: 'timestamp', nullable: true })
  reportedAt?: Date;

  @Column({ name: 'reported_by', type: 'int', nullable: true })
  reportedBy?: number;

  @Column({ name: 'admin_notes', type: 'text', nullable: true })
  adminNotes?: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<Review>) {
    Object.assign(this, partial);
  }
}
