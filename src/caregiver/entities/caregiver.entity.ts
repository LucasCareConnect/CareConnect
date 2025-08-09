import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum CaregiverStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

export enum ExperienceLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  EXPERIENCED = 'experienced',
  EXPERT = 'expert',
}

@Entity('caregivers')
export class Caregiver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id', unique: true })
  @Index()
  userId: number;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'int', default: 0 })
  experience: number; // anos de experiência

  @Column({
    name: 'experience_level',
    type: 'varchar',
    length: 20,
    default: ExperienceLevel.BEGINNER,
  })
  experienceLevel: ExperienceLevel;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  hourlyRate?: number;

  @Column({ type: 'json', nullable: true })
  specialties?: string[]; // especialidades como ["idosos", "crianças", "deficientes"]

  @Column({ type: 'json', nullable: true })
  certifications?: string[]; // certificações

  @Column({ type: 'json', nullable: true })
  languages?: string[]; // idiomas falados

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({
    name: 'status',
    type: 'varchar',
    length: 20,
    default: CaregiverStatus.PENDING,
  })
  status: CaregiverStatus;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number; // avaliação média (0-5)

  @Column({ name: 'total_reviews', type: 'int', default: 0 })
  totalReviews: number;

  @Column({ name: 'total_appointments', type: 'int', default: 0 })
  totalAppointments: number;

  @Column({
    name: 'profile_picture',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  profilePicture?: string;

  @Column({ name: 'background_check', type: 'boolean', default: false })
  backgroundCheck: boolean;

  @Column({ name: 'background_check_date', type: 'timestamp', nullable: true })
  backgroundCheckDate?: Date;

  @Column({ name: 'last_active', type: 'timestamp', nullable: true })
  lastActive?: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<Caregiver>) {
    Object.assign(this, partial);
  }
}
