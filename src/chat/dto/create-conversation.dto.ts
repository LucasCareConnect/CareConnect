import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsString,
  IsArray,
  IsNumber,
  IsObject,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { ConversationType } from '../entities/conversation.entity';
import { ParticipantRole } from '../entities/conversation-participant.entity';

export class CreateConversationDto {
  @ApiProperty({
    description: 'Tipo da conversa',
    enum: ConversationType,
    example: ConversationType.DIRECT,
  })
  @IsNotEmpty()
  @IsEnum(ConversationType)
  type: ConversationType;

  @ApiProperty({
    description: 'Título da conversa (obrigatório para grupos)',
    example: 'Cuidado da Maria - Janeiro 2024',
    required: false,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiProperty({
    description: 'Descrição da conversa',
    example:
      'Conversa para coordenar o cuidado da Maria durante o mês de janeiro',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'IDs dos participantes da conversa',
    example: [2, 3],
    type: [Number],
  })
  @IsNotEmpty()
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsNumber({}, { each: true })
  participantIds: number[];

  @ApiProperty({
    description: 'ID do agendamento relacionado (opcional)',
    example: 123,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  appointmentId?: number;

  @ApiProperty({
    description: 'Metadados adicionais',
    example: { priority: 'high', category: 'care' },
    required: false,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class AddParticipantDto {
  @ApiProperty({
    description: 'ID do usuário a ser adicionado',
    example: 4,
  })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({
    description: 'Papel do participante',
    enum: ParticipantRole,
    example: ParticipantRole.MEMBER,
    required: false,
    default: ParticipantRole.MEMBER,
  })
  @IsOptional()
  @IsEnum(ParticipantRole)
  role?: ParticipantRole = ParticipantRole.MEMBER;
}

export class UpdateParticipantDto {
  @ApiProperty({
    description: 'Novo papel do participante',
    enum: ParticipantRole,
    example: ParticipantRole.ADMIN,
    required: false,
  })
  @IsOptional()
  @IsEnum(ParticipantRole)
  role?: ParticipantRole;

  @ApiProperty({
    description: 'Se o participante está silenciado',
    example: false,
    required: false,
  })
  @IsOptional()
  isMuted?: boolean;

  @ApiProperty({
    description: 'Se a conversa está fixada para o participante',
    example: true,
    required: false,
  })
  @IsOptional()
  isPinned?: boolean;

  @ApiProperty({
    description: 'Configurações de notificação',
    example: { mentions: true, messages: false, reactions: true },
    required: false,
  })
  @IsOptional()
  @IsObject()
  notificationSettings?: {
    mentions?: boolean;
    messages?: boolean;
    reactions?: boolean;
  };
}
