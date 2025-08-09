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
import { Conversation } from './conversation.entity';
import { MessageAttachment } from './message-attachment.entity';
import { MessageReaction } from './message-reaction.entity';

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  AUDIO = 'audio',
  VIDEO = 'video',
  SYSTEM = 'system',
  LOCATION = 'location',
}

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  DELETED = 'deleted',
}

@Entity('messages')
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'conversation_id' })
  @Index()
  conversationId: number;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  @Column({ name: 'sender_id' })
  @Index()
  senderId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  @Column({ type: 'varchar', length: 20, default: MessageType.TEXT })
  @Index()
  type: MessageType;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ type: 'varchar', length: 20, default: MessageStatus.SENT })
  @Index()
  status: MessageStatus;

  @Column({ name: 'reply_to_id', nullable: true })
  replyToId?: number;

  @ManyToOne(() => Message, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'reply_to_id' })
  replyTo?: Message;

  @Column({ name: 'forwarded_from_id', nullable: true })
  forwardedFromId?: number;

  @ManyToOne(() => Message, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'forwarded_from_id' })
  forwardedFrom?: Message;

  @Column({ name: 'edited_at', type: 'timestamp', nullable: true })
  editedAt?: Date;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt?: Date;

  @Column({ name: 'deleted_by', nullable: true })
  deletedBy?: number;

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'deleted_by' })
  deletedByUser?: User;

  @Column({ name: 'is_pinned', type: 'boolean', default: false })
  isPinned: boolean;

  @Column({ name: 'is_system', type: 'boolean', default: false })
  @Index()
  isSystem: boolean;

  @Column({ name: 'read_count', type: 'integer', default: 0 })
  readCount: number;

  @Column({ name: 'reaction_count', type: 'integer', default: 0 })
  reactionCount: number;

  @Column({ name: 'attachment_count', type: 'integer', default: 0 })
  attachmentCount: number;

  @Column({ type: 'json', nullable: true })
  metadata?: {
    mentions?: number[];
    location?: {
      latitude: number;
      longitude: number;
      address?: string;
    };
    systemAction?: {
      type: string;
      data: any;
    };
  };

  @OneToMany(() => MessageAttachment, (attachment) => attachment.message)
  attachments: MessageAttachment[];

  @OneToMany(() => MessageReaction, (reaction) => reaction.message)
  reactions: MessageReaction[];

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<Message>) {
    Object.assign(this, partial);
  }

  // Métodos auxiliares
  get isSent(): boolean {
    return this.status === MessageStatus.SENT;
  }

  get isDelivered(): boolean {
    return this.status === MessageStatus.DELIVERED;
  }

  get isRead(): boolean {
    return this.status === MessageStatus.READ;
  }

  get isFailed(): boolean {
    return this.status === MessageStatus.FAILED;
  }

  get isDeleted(): boolean {
    return this.status === MessageStatus.DELETED || !!this.deletedAt;
  }

  get isEdited(): boolean {
    return !!this.editedAt;
  }

  get isReply(): boolean {
    return !!this.replyToId;
  }

  get isForwarded(): boolean {
    return !!this.forwardedFromId;
  }

  get hasAttachments(): boolean {
    return this.attachmentCount > 0;
  }

  get hasReactions(): boolean {
    return this.reactionCount > 0;
  }

  get hasMentions(): boolean {
    return !!(this.metadata?.mentions && this.metadata.mentions.length > 0);
  }

  get isTextMessage(): boolean {
    return this.type === MessageType.TEXT;
  }

  get isMediaMessage(): boolean {
    return [MessageType.IMAGE, MessageType.AUDIO, MessageType.VIDEO].includes(
      this.type,
    );
  }
}
