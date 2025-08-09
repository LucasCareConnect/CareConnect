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
import { Caregiver } from '../../caregiver/entities/caregiver.entity';

export enum AvailabilityType {
  RECURRING = 'recurring',
  EXCEPTION = 'exception',
  BLOCK = 'block',
}

export enum DayOfWeek {
  SUNDAY = 0,
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
}

export enum ServiceType {
  HOURLY = 'hourly',
  DAILY = 'daily',
  OVERNIGHT = 'overnight',
  LIVE_IN = 'live_in',
}

@Entity('availabilities')
export class Availability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'caregiver_id' })
  @Index()
  caregiverId: number;

  @ManyToOne(() => Caregiver, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'caregiver_id' })
  caregiver: Caregiver;

  @Column({ type: 'varchar', length: 20 })
  type: AvailabilityType;

  @Column({ name: 'day_of_week', type: 'int', nullable: true })
  dayOfWeek?: DayOfWeek; // Para horários recorrentes

  @Column({ name: 'specific_date', type: 'date', nullable: true })
  @Index()
  specificDate?: Date; // Para exceções ou bloqueios específicos

  @Column({ name: 'start_time', type: 'time' })
  startTime: string; // Formato HH:MM

  @Column({ name: 'end_time', type: 'time' })
  endTime: string; // Formato HH:MM

  @Column({ name: 'service_types', type: 'json' })
  serviceTypes: ServiceType[]; // Tipos de serviço disponíveis neste horário

  @Column({ name: 'is_available', type: 'boolean', default: true })
  isAvailable: boolean; // true = disponível, false = bloqueado

  @Column({ type: 'text', nullable: true })
  notes?: string; // Observações sobre a disponibilidade

  @Column({ name: 'effective_from', type: 'date', nullable: true })
  effectiveFrom?: Date; // Data de início da validade

  @Column({ name: 'effective_until', type: 'date', nullable: true })
  effectiveUntil?: Date; // Data de fim da validade

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean; // Se a regra está ativa

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<Availability>) {
    Object.assign(this, partial);
  }
}
