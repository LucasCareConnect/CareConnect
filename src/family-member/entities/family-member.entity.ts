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

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  OTHER = 'other',
  PREFER_NOT_TO_SAY = 'prefer_not_to_say',
}

export enum Relationship {
  SELF = 'self',
  SPOUSE = 'spouse',
  PARENT = 'parent',
  CHILD = 'child',
  SIBLING = 'sibling',
  GRANDPARENT = 'grandparent',
  GRANDCHILD = 'grandchild',
  OTHER_FAMILY = 'other_family',
  FRIEND = 'friend',
  OTHER = 'other',
}

export enum MobilityLevel {
  INDEPENDENT = 'independent',
  ASSISTANCE_NEEDED = 'assistance_needed',
  WHEELCHAIR = 'wheelchair',
  BEDRIDDEN = 'bedridden',
}

export enum CareLevel {
  MINIMAL = 'minimal',
  MODERATE = 'moderate',
  EXTENSIVE = 'extensive',
  TOTAL = 'total',
}

@Entity('family_members')
export class FamilyMember {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'family_user_id' })
  @Index()
  familyUserId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'family_user_id' })
  familyUser: User;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'date' })
  birthDate: Date;

  @Column({ type: 'varchar', length: 20 })
  gender: Gender;

  @Column({ type: 'varchar', length: 30 })
  relationship: Relationship;

  @Column({ type: 'varchar', length: 500, nullable: true })
  photo?: string; // URL da foto

  @Column({ type: 'text', nullable: true })
  biography?: string; // Biografia/descrição da pessoa

  @Column({
    name: 'care_level',
    type: 'varchar',
    length: 20,
    default: CareLevel.MINIMAL,
  })
  careLevel: CareLevel;

  @Column({
    name: 'mobility_level',
    type: 'varchar',
    length: 20,
    default: MobilityLevel.INDEPENDENT,
  })
  mobilityLevel: MobilityLevel;

  @Column({ name: 'medical_conditions', type: 'json', nullable: true })
  medicalConditions?: string[]; // Lista de condições médicas

  @Column({ type: 'json', nullable: true })
  medications?: {
    name: string;
    dosage: string;
    frequency: string;
    instructions?: string;
  }[]; // Lista de medicamentos

  @Column({ type: 'json', nullable: true })
  allergies?: string[]; // Lista de alergias

  @Column({ name: 'dietary_restrictions', type: 'json', nullable: true })
  dietaryRestrictions?: string[]; // Restrições alimentares

  @Column({
    name: 'emergency_contact',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  emergencyContact?: string; // Nome do contato de emergência

  @Column({
    name: 'emergency_phone',
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  emergencyPhone?: string; // Telefone de emergência

  @Column({ name: 'doctor_name', type: 'varchar', length: 255, nullable: true })
  doctorName?: string; // Nome do médico

  @Column({ name: 'doctor_phone', type: 'varchar', length: 20, nullable: true })
  doctorPhone?: string; // Telefone do médico

  @Column({ name: 'insurance_info', type: 'text', nullable: true })
  insuranceInfo?: string; // Informações do plano de saúde

  @Column({ name: 'special_needs', type: 'json', nullable: true })
  specialNeeds?: string[]; // Necessidades especiais

  @Column({ name: 'care_instructions', type: 'text', nullable: true })
  careInstructions?: string; // Instruções específicas de cuidado

  @Column({ name: 'preferred_activities', type: 'json', nullable: true })
  preferredActivities?: string[]; // Atividades preferidas

  @Column({ name: 'behavioral_notes', type: 'text', nullable: true })
  behavioralNotes?: string; // Notas comportamentais

  @Column({ name: 'communication_needs', type: 'text', nullable: true })
  communicationNeeds?: string; // Necessidades de comunicação

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean; // Se o membro está ativo

  @Column({ type: 'text', nullable: true })
  notes?: string; // Observações gerais

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<FamilyMember>) {
    Object.assign(this, partial);
  }

  // Método para calcular idade
  get age(): number {
    const today = new Date();
    const birthDate = new Date(this.birthDate);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  }
}
