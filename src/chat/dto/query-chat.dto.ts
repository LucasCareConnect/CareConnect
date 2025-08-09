import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  IsDateString,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import {
  ConversationType,
  ConversationStatus,
} from '../entities/conversation.entity';
import { MessageType, MessageStatus } from '../entities/message.entity';
import { ParticipantStatus } from '../entities/conversation-participant.entity';

export class QueryConversationsDto {
  @ApiProperty({
    description: 'Número da página',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Número de itens por página',
    example: 20,
    required: false,
    default: 20,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiProperty({
    description: 'Filtrar por tipo de conversa',
    enum: ConversationType,
    required: false,
  })
  @IsOptional()
  @IsEnum(ConversationType)
  type?: ConversationType;

  @ApiProperty({
    description: 'Filtrar por status da conversa',
    enum: ConversationStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(ConversationStatus)
  status?: ConversationStatus;

  @ApiProperty({
    description: 'Buscar por texto no título ou descrição',
    example: 'cuidado',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'Filtrar conversas fixadas',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isPinned?: boolean;

  @ApiProperty({
    description: 'Filtrar conversas silenciadas',
    example: false,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isMuted?: boolean;

  @ApiProperty({
    description: 'Filtrar por ID do agendamento',
    example: 123,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  appointmentId?: number;

  @ApiProperty({
    description: 'Apenas conversas com mensagens não lidas',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasUnreadMessages?: boolean;
}

export class QueryMessagesDto {
  @ApiProperty({
    description: 'Número da página',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({
    description: 'Número de itens por página',
    example: 50,
    required: false,
    default: 50,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  @Min(1)
  @Max(200)
  limit?: number = 50;

  @ApiProperty({
    description: 'Filtrar por tipo de mensagem',
    enum: MessageType,
    required: false,
  })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @ApiProperty({
    description: 'Filtrar por status da mensagem',
    enum: MessageStatus,
    required: false,
  })
  @IsOptional()
  @IsEnum(MessageStatus)
  status?: MessageStatus;

  @ApiProperty({
    description: 'Buscar por texto no conteúdo',
    example: 'medicamento',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({
    description: 'ID do remetente',
    example: 2,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  senderId?: number;

  @ApiProperty({
    description: 'Data de início para filtro',
    example: '2024-01-01',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Data de fim para filtro',
    example: '2024-01-31',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({
    description: 'Apenas mensagens fixadas',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isPinned?: boolean;

  @ApiProperty({
    description: 'Apenas mensagens com anexos',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasAttachments?: boolean;

  @ApiProperty({
    description: 'Apenas mensagens com reações',
    example: true,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  hasReactions?: boolean;

  @ApiProperty({
    description: 'ID da mensagem para buscar mensagens antes dela',
    example: 100,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  beforeMessageId?: number;

  @ApiProperty({
    description: 'ID da mensagem para buscar mensagens depois dela',
    example: 50,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  afterMessageId?: number;
}
