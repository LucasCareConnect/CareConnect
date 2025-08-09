import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Message } from './message.entity';
import { ConversationParticipant } from './conversation-participant.entity';

export enum ConversationType {
  DIRECT = 'direct',
  GROUP = 'group',
  SUPPORT = 'support',
}

export enum ConversationStatus {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  BLOCKED = 'blocked',
}

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 20, default: ConversationType.DIRECT })
  @Index()
  type: ConversationType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'created_by' })
  @Index()
  createdBy: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @Column({ type: 'varchar', length: 20, default: ConversationStatus.ACTIVE })
  @Index()
  status: ConversationStatus;

  @Column({ name: 'last_message_id', nullable: true })
  lastMessageId?: number;

  @ManyToOne(() => Message, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'last_message_id' })
  lastMessage?: Message;

  @Column({ name: 'last_activity_at', type: 'timestamp', nullable: true })
  @Index()
  lastActivityAt?: Date;

  @Column({ name: 'appointment_id', nullable: true })
  @Index()
  appointmentId?: number; // Referência ao agendamento relacionado

  @Column({ name: 'is_pinned', type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ name: 'is_muted', type: 'boolean', default: false })
  isMuted: boolean;

  @Column({ name: 'participant_count', type: 'integer', default: 0 })
  participantCount: number;

  @Column({ name: 'message_count', type: 'integer', default: 0 })
  messageCount: number;

  @Column({ type: 'json', nullable: true })
  metadata?: Record<string, any>;

  @OneToMany(() => Message, (message) => message.conversation)
  messages: Message[];

  @OneToMany(
    () => ConversationParticipant,
    (participant) => participant.conversation,
  )
  participants: ConversationParticipant[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<Conversation>) {
    Object.assign(this, partial);
  }

  // Métodos auxiliares
  get isActive(): boolean {
    return this.status === ConversationStatus.ACTIVE;
  }

  get isArchived(): boolean {
    return this.status === ConversationStatus.ARCHIVED;
  }

  get isBlocked(): boolean {
    return this.status === ConversationStatus.BLOCKED;
  }

  get isDirect(): boolean {
    return this.type === ConversationType.DIRECT;
  }

  get isGroup(): boolean {
    return this.type === ConversationType.GROUP;
  }

  get isSupport(): boolean {
    return this.type === ConversationType.SUPPORT;
  }
}
