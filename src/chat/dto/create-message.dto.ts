import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
  IsNumber,
  IsArray,
  IsObject,
  MaxLength,
} from 'class-validator';
import { MessageType } from '../entities/message.entity';

export class CreateMessageDto {
  @ApiProperty({
    description: 'ID da conversa',
    example: 1,
  })
  @IsNotEmpty()
  @IsNumber()
  conversationId: number;

  @ApiProperty({
    description: 'Tipo da mensagem',
    enum: MessageType,
    example: MessageType.TEXT,
    required: false,
    default: MessageType.TEXT,
  })
  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType = MessageType.TEXT;

  @ApiProperty({
    description: 'Conteúdo da mensagem',
    example: 'Olá! Como está o cuidado da Maria hoje?',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'ID da mensagem que está sendo respondida',
    example: 123,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  replyToId?: number;

  @ApiProperty({
    description: 'ID da mensagem que está sendo encaminhada',
    example: 456,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  forwardedFromId?: number;

  @ApiProperty({
    description: 'IDs dos usuários mencionados na mensagem',
    example: [2, 3],
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  mentions?: number[];

  @ApiProperty({
    description: 'Dados de localização (para mensagens de localização)',
    example: {
      latitude: -23.5505,
      longitude: -46.6333,
      address: 'São Paulo, SP, Brasil',
    },
    required: false,
  })
  @IsOptional()
  @IsObject()
  location?: {
    latitude: number;
    longitude: number;
    address?: string;
  };

  @ApiProperty({
    description: 'Metadados adicionais',
    example: { priority: 'high', category: 'urgent' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateMessageDto {
  @ApiProperty({
    description: 'Novo conteúdo da mensagem',
    example: 'Olá! Como está o cuidado da Maria hoje? (editado)',
    required: false,
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiProperty({
    description: 'Novos IDs dos usuários mencionados',
    example: [2, 3, 4],
    type: [Number],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  mentions?: number[];

  @ApiProperty({
    description: 'Se a mensagem está fixada',
    example: true,
    required: false,
  })
  @IsOptional()
  isPinned?: boolean;
}

export class AddReactionDto {
  @ApiProperty({
    description: 'Emoji da reação',
    example: '👍',
    maxLength: 10,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(10)
  emoji: string;
}

export class MarkAsReadDto {
  @ApiProperty({
    description: 'ID da última mensagem lida',
    example: 123,
  })
  @IsNotEmpty()
  @IsNumber()
  lastReadMessageId: number;
}
