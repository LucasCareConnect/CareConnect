import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../user/dto/user-response.dto';
import {
  ConversationType,
  ConversationStatus,
} from '../entities/conversation.entity';
import {
  ParticipantRole,
  ParticipantStatus,
} from '../entities/conversation-participant.entity';
import { MessageType, MessageStatus } from '../entities/message.entity';
import { AttachmentType } from '../entities/message-attachment.entity';

export class ConversationResponseDto {
  @ApiProperty({ description: 'ID único da conversa', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Tipo da conversa',
    enum: ConversationType,
    example: ConversationType.DIRECT,
  })
  type: ConversationType;

  @ApiProperty({
    description: 'Título da conversa',
    example: 'Cuidado da Maria - Janeiro 2024',
    required: false,
  })
  title?: string;

  @ApiProperty({
    description: 'Descrição da conversa',
    example: 'Conversa para coordenar o cuidado da Maria',
    required: false,
  })
  description?: string;

  @ApiProperty({ description: 'ID do criador', example: 1 })
  createdBy: number;

  @ApiProperty({
    description: 'Dados do criador',
    type: UserResponseDto,
  })
  creator: UserResponseDto;

  @ApiProperty({
    description: 'Status da conversa',
    enum: ConversationStatus,
    example: ConversationStatus.ACTIVE,
  })
  status: ConversationStatus;

  @ApiProperty({
    description: 'ID da última mensagem',
    example: 123,
    required: false,
  })
  lastMessageId?: number;

  @ApiProperty({
    description: 'Última mensagem',
    required: false,
  })
  lastMessage?: any;

  @ApiProperty({
    description: 'Data da última atividade',
    example: '2024-01-15T14:30:00Z',
    required: false,
  })
  lastActivityAt?: Date;

  @ApiProperty({
    description: 'ID do agendamento relacionado',
    example: 123,
    required: false,
  })
  appointmentId?: number;

  @ApiProperty({
    description: 'Se está fixada',
    example: false,
  })
  isPinned: boolean;

  @ApiProperty({
    description: 'Se está silenciada',
    example: false,
  })
  isMuted: boolean;

  @ApiProperty({
    description: 'Número de participantes',
    example: 3,
  })
  participantCount: number;

  @ApiProperty({
    description: 'Número de mensagens',
    example: 45,
  })
  messageCount: number;

  @ApiProperty({
    description: 'Número de mensagens não lidas',
    example: 2,
  })
  unreadCount: number;

  @ApiProperty({
    description: 'Lista de participantes',
    type: 'array',
  })
  participants: ConversationParticipantResponseDto[];

  @ApiProperty({
    description: 'Se está ativa',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Se está arquivada',
    example: false,
  })
  isArchived: boolean;

  @ApiProperty({
    description: 'Se está bloqueada',
    example: false,
  })
  isBlocked: boolean;

  @ApiProperty({
    description: 'Se é conversa direta',
    example: true,
  })
  isDirect: boolean;

  @ApiProperty({
    description: 'Se é grupo',
    example: false,
  })
  isGroup: boolean;

  @ApiProperty({
    description: 'Se é suporte',
    example: false,
  })
  isSupport: boolean;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}

export class ConversationParticipantResponseDto {
  @ApiProperty({ description: 'ID único do participante', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID da conversa', example: 1 })
  conversationId: number;

  @ApiProperty({ description: 'ID do usuário', example: 2 })
  userId: number;

  @ApiProperty({
    description: 'Dados do usuário',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Papel do participante',
    enum: ParticipantRole,
    example: ParticipantRole.MEMBER,
  })
  role: ParticipantRole;

  @ApiProperty({
    description: 'Status do participante',
    enum: ParticipantStatus,
    example: ParticipantStatus.ACTIVE,
  })
  status: ParticipantStatus;

  @ApiProperty({
    description: 'Data de entrada',
    example: '2024-01-01T00:00:00.000Z',
  })
  joinedAt: Date;

  @ApiProperty({
    description: 'Data de saída',
    example: '2024-01-15T10:30:00Z',
    required: false,
  })
  leftAt?: Date;

  @ApiProperty({
    description: 'ID da última mensagem lida',
    example: 120,
    required: false,
  })
  lastReadMessageId?: number;

  @ApiProperty({
    description: 'Data da última leitura',
    example: '2024-01-15T14:00:00Z',
    required: false,
  })
  lastReadAt?: Date;

  @ApiProperty({
    description: 'Número de mensagens não lidas',
    example: 3,
  })
  unreadCount: number;

  @ApiProperty({
    description: 'Se está silenciado',
    example: false,
  })
  isMuted: boolean;

  @ApiProperty({
    description: 'Se está fixado',
    example: true,
  })
  isPinned: boolean;

  @ApiProperty({
    description: 'Se está ativo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Se saiu da conversa',
    example: false,
  })
  hasLeft: boolean;

  @ApiProperty({
    description: 'Se foi removido',
    example: false,
  })
  isRemoved: boolean;

  @ApiProperty({
    description: 'Se está bloqueado',
    example: false,
  })
  isBlocked: boolean;

  @ApiProperty({
    description: 'Se é admin',
    example: false,
  })
  isAdmin: boolean;

  @ApiProperty({
    description: 'Se é moderador',
    example: false,
  })
  isModerator: boolean;

  @ApiProperty({
    description: 'Se pode moderar',
    example: false,
  })
  canModerate: boolean;

  @ApiProperty({
    description: 'Se tem mensagens não lidas',
    example: true,
  })
  hasUnreadMessages: boolean;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}

export class MessageResponseDto {
  @ApiProperty({ description: 'ID único da mensagem', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID da conversa', example: 1 })
  conversationId: number;

  @ApiProperty({ description: 'ID do remetente', example: 2 })
  senderId: number;

  @ApiProperty({
    description: 'Dados do remetente',
    type: UserResponseDto,
  })
  sender: UserResponseDto;

  @ApiProperty({
    description: 'Tipo da mensagem',
    enum: MessageType,
    example: MessageType.TEXT,
  })
  type: MessageType;

  @ApiProperty({
    description: 'Conteúdo da mensagem',
    example: 'Olá! Como está o cuidado da Maria hoje?',
    required: false,
  })
  content?: string;

  @ApiProperty({
    description: 'Status da mensagem',
    enum: MessageStatus,
    example: MessageStatus.READ,
  })
  status: MessageStatus;

  @ApiProperty({
    description: 'ID da mensagem respondida',
    example: 123,
    required: false,
  })
  replyToId?: number;

  @ApiProperty({
    description: 'Mensagem respondida',
    required: false,
  })
  replyTo?: MessageResponseDto;

  @ApiProperty({
    description: 'ID da mensagem encaminhada',
    example: 456,
    required: false,
  })
  forwardedFromId?: number;

  @ApiProperty({
    description: 'Data de edição',
    example: '2024-01-15T15:00:00Z',
    required: false,
  })
  editedAt?: Date;

  @ApiProperty({
    description: 'Data de exclusão',
    example: '2024-01-15T16:00:00Z',
    required: false,
  })
  deletedAt?: Date;

  @ApiProperty({
    description: 'Se está fixada',
    example: false,
  })
  isPinned: boolean;

  @ApiProperty({
    description: 'Se é mensagem do sistema',
    example: false,
  })
  isSystem: boolean;

  @ApiProperty({
    description: 'Número de leituras',
    example: 2,
  })
  readCount: number;

  @ApiProperty({
    description: 'Número de reações',
    example: 3,
  })
  reactionCount: number;

  @ApiProperty({
    description: 'Número de anexos',
    example: 1,
  })
  attachmentCount: number;

  @ApiProperty({
    description: 'Lista de anexos',
    type: 'array',
  })
  attachments: MessageAttachmentResponseDto[];

  @ApiProperty({
    description: 'Lista de reações',
    type: 'array',
  })
  reactions: MessageReactionResponseDto[];

  @ApiProperty({
    description: 'Se foi enviada',
    example: true,
  })
  isSent: boolean;

  @ApiProperty({
    description: 'Se foi entregue',
    example: true,
  })
  isDelivered: boolean;

  @ApiProperty({
    description: 'Se foi lida',
    example: true,
  })
  isRead: boolean;

  @ApiProperty({
    description: 'Se falhou',
    example: false,
  })
  isFailed: boolean;

  @ApiProperty({
    description: 'Se foi deletada',
    example: false,
  })
  isDeleted: boolean;

  @ApiProperty({
    description: 'Se foi editada',
    example: false,
  })
  isEdited: boolean;

  @ApiProperty({
    description: 'Se é resposta',
    example: false,
  })
  isReply: boolean;

  @ApiProperty({
    description: 'Se foi encaminhada',
    example: false,
  })
  isForwarded: boolean;

  @ApiProperty({
    description: 'Se tem anexos',
    example: true,
  })
  hasAttachments: boolean;

  @ApiProperty({
    description: 'Se tem reações',
    example: true,
  })
  hasReactions: boolean;

  @ApiProperty({
    description: 'Se tem menções',
    example: false,
  })
  hasMentions: boolean;

  @ApiProperty({
    description: 'Se é mensagem de texto',
    example: true,
  })
  isTextMessage: boolean;

  @ApiProperty({
    description: 'Se é mensagem de mídia',
    example: false,
  })
  isMediaMessage: boolean;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}

export class MessageAttachmentResponseDto {
  @ApiProperty({ description: 'ID único do anexo', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID da mensagem', example: 1 })
  messageId: number;

  @ApiProperty({
    description: 'Tipo do anexo',
    enum: AttachmentType,
    example: AttachmentType.IMAGE,
  })
  type: AttachmentType;

  @ApiProperty({
    description: 'Nome do arquivo',
    example: 'image_123.jpg',
  })
  fileName: string;

  @ApiProperty({
    description: 'Nome original do arquivo',
    example: 'foto_maria.jpg',
  })
  originalName: string;

  @ApiProperty({
    description: 'URL do arquivo',
    example: 'https://storage.example.com/files/image_123.jpg',
    required: false,
  })
  fileUrl?: string;

  @ApiProperty({
    description: 'Tamanho do arquivo em bytes',
    example: 1024000,
  })
  fileSize: number;

  @ApiProperty({
    description: 'Tipo MIME',
    example: 'image/jpeg',
  })
  mimeType: string;

  @ApiProperty({
    description: 'Largura (para imagens)',
    example: 1920,
    required: false,
  })
  width?: number;

  @ApiProperty({
    description: 'Altura (para imagens)',
    example: 1080,
    required: false,
  })
  height?: number;

  @ApiProperty({
    description: 'Duração em segundos (para áudio/vídeo)',
    example: 120,
    required: false,
  })
  duration?: number;

  @ApiProperty({
    description: 'URL da miniatura',
    example: 'https://storage.example.com/thumbnails/thumb_123.jpg',
    required: false,
  })
  thumbnailUrl?: string;

  @ApiProperty({
    description: 'Se foi processado',
    example: true,
  })
  isProcessed: boolean;

  @ApiProperty({
    description: 'Se é imagem',
    example: true,
  })
  isImage: boolean;

  @ApiProperty({
    description: 'Se é vídeo',
    example: false,
  })
  isVideo: boolean;

  @ApiProperty({
    description: 'Se é áudio',
    example: false,
  })
  isAudio: boolean;

  @ApiProperty({
    description: 'Se é documento',
    example: false,
  })
  isDocument: boolean;

  @ApiProperty({
    description: 'Se é mídia',
    example: true,
  })
  isMedia: boolean;

  @ApiProperty({
    description: 'Tamanho formatado',
    example: '1.02 MB',
  })
  fileSizeFormatted: string;

  @ApiProperty({
    description: 'Duração formatada',
    example: '2:00',
    required: false,
  })
  durationFormatted?: string | null;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2024-01-15T10:30:00Z',
  })
  updatedAt: Date;
}

export class MessageReactionResponseDto {
  @ApiProperty({ description: 'ID único da reação', example: 1 })
  id: number;

  @ApiProperty({ description: 'ID da mensagem', example: 1 })
  messageId: number;

  @ApiProperty({ description: 'ID do usuário', example: 2 })
  userId: number;

  @ApiProperty({
    description: 'Dados do usuário',
    type: UserResponseDto,
  })
  user: UserResponseDto;

  @ApiProperty({
    description: 'Emoji da reação',
    example: '👍',
  })
  emoji: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt: Date;
}
