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
import { Conversation } from './conversation.entity';

export enum ParticipantRole {
  MEMBER = 'member',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export enum ParticipantStatus {
  ACTIVE = 'active',
  LEFT = 'left',
  REMOVED = 'removed',
  BLOCKED = 'blocked',
}

@Entity('conversation_participants')
@Unique(['conversationId', 'userId'])
export class ConversationParticipant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversation_id' })
  @Index()
  conversationId: number;

  @ManyToOne(() => Conversation, (conversation) => conversation.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ name: 'user_id' })
  @Index()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 20, default: ParticipantRole.MEMBER })
  role: ParticipantRole;

  @Column({ type: 'varchar', length: 20, default: ParticipantStatus.ACTIVE })
  @Index()
  status: ParticipantStatus;

  @Column({
    name: 'joined_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP',
  })
  joinedAt: Date;

  @Column({ name: 'left_at', type: 'timestamp', nullable: true })
  leftAt?: Date;

  @Column({ name: 'last_read_message_id', nullable: true })
  lastReadMessageId?: number;

  @Column({ name: 'last_read_at', type: 'timestamp', nullable: true })
  lastReadAt?: Date;

  @Column({ name: 'unread_count', type: 'integer', default: 0 })
  unreadCount: number;

  @Column({ name: 'is_muted', type: 'boolean', default: false })
  isMuted: boolean;

  @Column({ name: 'is_pinned', type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ name: 'notification_settings', type: 'json', nullable: true })
  notificationSettings?: {
    mentions?: boolean;
    messages?: boolean;
    reactions?: boolean;
  };

  @Column({ name: 'added_by', nullable: true })
  addedBy?: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'added_by' })
  addedByUser?: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<ConversationParticipant>) {
    Object.assign(this, partial);
  }

  // Métodos auxiliares
  get isActive(): boolean {
    return this.status === ParticipantStatus.ACTIVE;
  }

  get hasLeft(): boolean {
    return this.status === ParticipantStatus.LEFT;
  }

  get isRemoved(): boolean {
    return this.status === ParticipantStatus.REMOVED;
  }

  get isBlocked(): boolean {
    return this.status === ParticipantStatus.BLOCKED;
  }

  get isAdmin(): boolean {
    return this.role === ParticipantRole.ADMIN;
  }

  get isModerator(): boolean {
    return this.role === ParticipantRole.MODERATOR;
  }

  get canModerate(): boolean {
    return this.isAdmin || this.isModerator;
  }

  get hasUnreadMessages(): boolean {
    return this.unreadCount > 0;
  }
}
