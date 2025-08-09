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

export enum AddressType {
  HOME = 'home',
  WORK = 'work',
  TEMPORARY = 'temporary',
  OTHER = 'other',
}

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50, default: AddressType.HOME })
  type: AddressType;

  @Column({ type: 'varchar', length: 100 })
  label: string; // Ex: "Casa da Vovó", "Escritório", etc.

  @Column({ name: 'street_address', type: 'varchar', length: 255 })
  streetAddress: string; // Rua, número, complemento

  @Column({ type: 'varchar', length: 100 })
  neighborhood: string; // Bairro

  @Column({ type: 'varchar', length: 100 })
  city: string;

  @Column({ type: 'varchar', length: 50 })
  state: string;

  @Column({ name: 'postal_code', type: 'varchar', length: 10 })
  @Index()
  postalCode: string; // CEP

  @Column({ type: 'varchar', length: 50, default: 'Brasil' })
  country: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  complement?: string; // Complemento, referências

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude?: number; // Para geolocalização futura

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude?: number; // Para geolocalização futura

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary: boolean; // Endereço principal

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean; // Se o endereço está ativo

  @Column({ type: 'text', nullable: true })
  notes?: string; // Observações sobre o endereço

  @Column({
    name: 'emergency_contact',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  emergencyContact?: string; // Contato de emergência no local

  @Column({
    name: 'emergency_phone',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  emergencyPhone?: string; // Telefone de emergência

  @Column({ name: 'access_instructions', type: 'text', nullable: true })
  accessInstructions?: string; // Instruções de acesso (portaria, código, etc.)

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<Address>) {
    Object.assign(this, partial);
  }
}
