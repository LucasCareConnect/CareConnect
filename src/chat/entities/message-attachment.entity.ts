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
import { Message } from './message.entity';

export enum AttachmentType {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  DOCUMENT = 'document',
  OTHER = 'other',
}

@Entity('message_attachments')
export class MessageAttachment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'message_id' })
  @Index()
  messageId: number;

  @ManyToOne(() => Message, (message) => message.attachments, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'message_id' })
  message: Message;

  @Column({ type: 'varchar', length: 20 })
  @Index()
  type: AttachmentType;

  @Column({ name: 'file_name', type: 'varchar', length: 255 })
  fileName: string;

  @Column({ name: 'original_name', type: 'varchar', length: 255 })
  originalName: string;

  @Column({ name: 'file_path', type: 'varchar', length: 500 })
  filePath: string;

  @Column({ name: 'file_url', type: 'varchar', length: 500, nullable: true })
  fileUrl?: string;

  @Column({ name: 'file_size', type: 'bigint' })
  fileSize: number;

  @Column({ name: 'mime_type', type: 'varchar', length: 100 })
  mimeType: string;

  @Column({ type: 'integer', nullable: true })
  width?: number;

  @Column({ type: 'integer', nullable: true })
  height?: number;

  @Column({ type: 'integer', nullable: true })
  duration?: number; // Para áudio/vídeo em segundos

  @Column({
    name: 'thumbnail_path',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  thumbnailPath?: string;

  @Column({
    name: 'thumbnail_url',
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  thumbnailUrl?: string;

  @Column({ name: 'is_processed', type: 'boolean', default: false })
  isProcessed: boolean;

  @Column({
    name: 'processing_status',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  processingStatus?: string;

  @Column({ type: 'json', nullable: true })
  metadata?: {
    exif?: Record<string, any>;
    transcription?: string;
    checksum?: string;
  };

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  constructor(partial: Partial<MessageAttachment>) {
    Object.assign(this, partial);
  }

  // Métodos auxiliares
  get isImage(): boolean {
    return this.type === AttachmentType.IMAGE;
  }

  get isVideo(): boolean {
    return this.type === AttachmentType.VIDEO;
  }

  get isAudio(): boolean {
    return this.type === AttachmentType.AUDIO;
  }

  get isDocument(): boolean {
    return this.type === AttachmentType.DOCUMENT;
  }

  get isMedia(): boolean {
    return [
      AttachmentType.IMAGE,
      AttachmentType.VIDEO,
      AttachmentType.AUDIO,
    ].includes(this.type);
  }

  get fileSizeFormatted(): string {
    const bytes = this.fileSize;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
  }

  get durationFormatted(): string | null {
    if (!this.duration) return null;
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
