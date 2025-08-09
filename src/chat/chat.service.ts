import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { ChatRepository } from './chat.repository';
import { UserService } from '../user/user.service';
import {
  CreateConversationDto,
  AddParticipantDto,
  UpdateParticipantDto,
} from './dto/create-conversation.dto';
import {
  CreateMessageDto,
  UpdateMessageDto,
  AddReactionDto,
  MarkAsReadDto,
} from './dto/create-message.dto';
import { QueryConversationsDto, QueryMessagesDto } from './dto/query-chat.dto';
import {
  ConversationResponseDto,
  MessageResponseDto,
  ConversationParticipantResponseDto,
  MessageAttachmentResponseDto,
  MessageReactionResponseDto,
} from './dto/chat-response.dto';
import {
  PaginatedConversations,
  PaginatedMessages,
  ChatStats,
  ConversationStats,
} from './interfaces/paginated-chat.interface';
import {
  Conversation,
  ConversationType,
  ConversationStatus,
} from './entities/conversation.entity';
import {
  ConversationParticipant,
  ParticipantRole,
  ParticipantStatus,
} from './entities/conversation-participant.entity';
import { Message, MessageType, MessageStatus } from './entities/message.entity';
import { MessageAttachment } from './entities/message-attachment.entity';
import { MessageReaction } from './entities/message-reaction.entity';
import { UserRole } from '../user/enum/user-role.enum';

@Injectable()
export class ChatService {
  constructor(
    private readonly chatRepository: ChatRepository,
    private readonly userService: UserService,
    @Inject(forwardRef(() => 'WebSocketService'))
    private readonly webSocketService?: any,
  ) {}

  /**
   * Cria uma nova conversa
   */
  async createConversation(
    userId: number,
    createConversationDto: CreateConversationDto,
  ): Promise<ConversationResponseDto> {
    // Verificar se o usuário existe
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se todos os participantes existem
    const participants = await Promise.all(
      createConversationDto.participantIds.map(async (participantId) => {
        const participant = await this.userService.findById(participantId);
        if (!participant) {
          throw new NotFoundException(
            `Usuário com ID ${participantId} não encontrado`,
          );
        }
        return participant;
      }),
    );

    // Para conversas diretas, verificar se já existe uma conversa entre os usuários
    if (createConversationDto.type === ConversationType.DIRECT) {
      if (createConversationDto.participantIds.length !== 1) {
        throw new BadRequestException(
          'Conversa direta deve ter exatamente 1 participante além do criador',
        );
      }

      // Verificar se já existe conversa direta entre estes usuários
      // TODO: Implementar verificação de conversa existente
    }

    // Criar a conversa
    const conversationData = {
      type: createConversationDto.type,
      title: createConversationDto.title,
      description: createConversationDto.description,
      createdBy: userId,
      status: ConversationStatus.ACTIVE,
      appointmentId: createConversationDto.appointmentId,
      metadata: createConversationDto.metadata,
      participantCount: createConversationDto.participantIds.length + 1, // +1 para o criador
      messageCount: 0,
    };

    const conversation =
      await this.chatRepository.createConversation(conversationData);

    // Adicionar o criador como participante admin
    await this.chatRepository.createParticipant({
      conversationId: conversation.id,
      userId,
      role: ParticipantRole.ADMIN,
      status: ParticipantStatus.ACTIVE,
      addedBy: userId,
    });

    // Adicionar os outros participantes
    for (const participantId of createConversationDto.participantIds) {
      await this.chatRepository.createParticipant({
        conversationId: conversation.id,
        userId: participantId,
        role: ParticipantRole.MEMBER,
        status: ParticipantStatus.ACTIVE,
        addedBy: userId,
      });
    }

    // Buscar a conversa completa
    const fullConversation = await this.chatRepository.findConversationById(
      conversation.id,
    );
    if (!fullConversation) {
      throw new NotFoundException('Erro ao criar conversa');
    }

    return this.toConversationResponseDto(fullConversation, userId);
  }

  /**
   * Busca conversa por ID
   */
  async findConversationById(
    id: number,
    userId: number,
  ): Promise<ConversationResponseDto> {
    const conversation = await this.chatRepository.findConversationById(id);
    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    // Verificar se o usuário é participante
    const participant = await this.chatRepository.findParticipant(id, userId);
    if (!participant || participant.status !== ParticipantStatus.ACTIVE) {
      throw new ForbiddenException('Você não tem acesso a esta conversa');
    }

    return this.toConversationResponseDto(conversation, userId);
  }

  /**
   * Busca conversas do usuário
   */
  async findUserConversations(
    userId: number,
    query: QueryConversationsDto,
  ): Promise<PaginatedConversations> {
    const { conversations, total } =
      await this.chatRepository.findUserConversations(userId, query);

    return {
      data: conversations.map((conversation) =>
        this.toConversationResponseDto(conversation, userId),
      ),
      total,
      page: query.page || 1,
      limit: query.limit || 20,
      totalPages: Math.ceil(total / (query.limit || 20)),
    };
  }

  /**
   * Adiciona participante à conversa
   */
  async addParticipant(
    conversationId: number,
    userId: number,
    addParticipantDto: AddParticipantDto,
  ): Promise<ConversationParticipantResponseDto> {
    const conversation =
      await this.chatRepository.findConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    // Verificar se o usuário pode adicionar participantes
    const userParticipant = await this.chatRepository.findParticipant(
      conversationId,
      userId,
    );
    if (!userParticipant || !userParticipant.canModerate) {
      throw new ForbiddenException(
        'Você não tem permissão para adicionar participantes',
      );
    }

    // Verificar se o usuário a ser adicionado existe
    const newUser = await this.userService.findById(addParticipantDto.userId);
    if (!newUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se já é participante
    const existingParticipant = await this.chatRepository.findParticipant(
      conversationId,
      addParticipantDto.userId,
    );
    if (
      existingParticipant &&
      existingParticipant.status === ParticipantStatus.ACTIVE
    ) {
      throw new BadRequestException('Usuário já é participante desta conversa');
    }

    const participantData = {
      conversationId,
      userId: addParticipantDto.userId,
      role: addParticipantDto.role || ParticipantRole.MEMBER,
      status: ParticipantStatus.ACTIVE,
      addedBy: userId,
    };

    const participant =
      await this.chatRepository.createParticipant(participantData);

    // Atualizar contador de participantes
    await this.chatRepository.updateConversation(conversationId, {
      participantCount: conversation.participantCount + 1,
    });

    return this.toParticipantResponseDto(participant);
  }

  /**
   * Remove participante da conversa
   */
  async removeParticipant(
    conversationId: number,
    userId: number,
    participantId: number,
  ): Promise<void> {
    const conversation =
      await this.chatRepository.findConversationById(conversationId);
    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    // Verificar permissões
    const userParticipant = await this.chatRepository.findParticipant(
      conversationId,
      userId,
    );
    if (
      !userParticipant ||
      (!userParticipant.canModerate && userId !== participantId)
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para remover este participante',
      );
    }

    // Não permitir que o criador seja removido
    if (participantId === conversation.createdBy && userId !== participantId) {
      throw new BadRequestException(
        'O criador da conversa não pode ser removido',
      );
    }

    await this.chatRepository.removeParticipant(conversationId, participantId);

    // Atualizar contador de participantes
    await this.chatRepository.updateConversation(conversationId, {
      participantCount: Math.max(0, conversation.participantCount - 1),
    });
  }

  /**
   * Cria uma nova mensagem
   */
  async createMessage(
    userId: number,
    createMessageDto: CreateMessageDto,
  ): Promise<MessageResponseDto> {
    const conversation = await this.chatRepository.findConversationById(
      createMessageDto.conversationId,
    );
    if (!conversation) {
      throw new NotFoundException('Conversa não encontrada');
    }

    // Verificar se o usuário é participante ativo
    const participant = await this.chatRepository.findParticipant(
      createMessageDto.conversationId,
      userId,
    );
    if (!participant || participant.status !== ParticipantStatus.ACTIVE) {
      throw new ForbiddenException('Você não tem acesso a esta conversa');
    }

    // Verificar se a mensagem de resposta existe (se fornecida)
    if (createMessageDto.replyToId) {
      const replyToMessage = await this.chatRepository.findMessageById(
        createMessageDto.replyToId,
      );
      if (
        !replyToMessage ||
        replyToMessage.conversationId !== createMessageDto.conversationId
      ) {
        throw new BadRequestException(
          'Mensagem de resposta não encontrada nesta conversa',
        );
      }
    }

    const messageData = {
      conversationId: createMessageDto.conversationId,
      senderId: userId,
      type: createMessageDto.type || MessageType.TEXT,
      content: createMessageDto.content,
      status: MessageStatus.SENT,
      replyToId: createMessageDto.replyToId,
      forwardedFromId: createMessageDto.forwardedFromId,
      isSystem: false,
      metadata: {
        mentions: createMessageDto.mentions,
        location: createMessageDto.location,
        ...createMessageDto.metadata,
      },
    };

    const message = await this.chatRepository.createMessage(messageData);

    // Atualizar conversa
    await this.chatRepository.updateConversation(
      createMessageDto.conversationId,
      {
        lastMessageId: message.id,
        lastActivityAt: new Date(),
        messageCount: conversation.messageCount + 1,
      },
    );

    // Atualizar contadores de mensagens não lidas para outros participantes
    const participants = await this.chatRepository.findConversationParticipants(
      createMessageDto.conversationId,
    );
    for (const p of participants) {
      if (p.userId !== userId) {
        await this.chatRepository.updateParticipant(p.id, {
          unreadCount: p.unreadCount + 1,
        });
      }
    }

    const fullMessage = await this.chatRepository.findMessageById(message.id);
    if (!fullMessage) {
      throw new NotFoundException('Erro ao criar mensagem');
    }

    // Notificar via WebSocket se disponível
    if (this.webSocketService) {
      // Adicionar remetente à room da conversa se não estiver
      this.webSocketService.forceJoinRoom?.(
        userId,
        `conversation_${createMessageDto.conversationId}`,
        'conversation',
      );

      // Adicionar outros participantes à room da conversa
      for (const p of participants) {
        if (p.userId !== userId) {
          this.webSocketService.forceJoinRoom?.(
            p.userId,
            `conversation_${createMessageDto.conversationId}`,
            'conversation',
          );
        }
      }

      // Notificar nova mensagem
      this.webSocketService.notifyNewMessage?.({
        messageId: message.id,
        conversationId: createMessageDto.conversationId,
        senderId: userId,
        content: createMessageDto.content,
        type: createMessageDto.type || 'text',
        metadata: createMessageDto.metadata,
      });
    }

    return this.toMessageResponseDto(fullMessage);
  }

  /**
   * Busca mensagens da conversa
   */
  async findConversationMessages(
    conversationId: number,
    userId: number,
    query: QueryMessagesDto,
  ): Promise<PaginatedMessages> {
    // Verificar acesso à conversa
    const participant = await this.chatRepository.findParticipant(
      conversationId,
      userId,
    );
    if (!participant || participant.status !== ParticipantStatus.ACTIVE) {
      throw new ForbiddenException('Você não tem acesso a esta conversa');
    }

    const { messages, total } =
      await this.chatRepository.findConversationMessages(conversationId, query);

    return {
      data: messages.map((message) => this.toMessageResponseDto(message)),
      total,
      page: query.page || 1,
      limit: query.limit || 50,
      totalPages: Math.ceil(total / (query.limit || 50)),
      hasMore: total > (query.page || 1) * (query.limit || 50),
    };
  }

  /**
   * Marca mensagens como lidas
   */
  async markAsRead(
    conversationId: number,
    userId: number,
    markAsReadDto: MarkAsReadDto,
  ): Promise<void> {
    // Verificar acesso à conversa
    const participant = await this.chatRepository.findParticipant(
      conversationId,
      userId,
    );
    if (!participant || participant.status !== ParticipantStatus.ACTIVE) {
      throw new ForbiddenException('Você não tem acesso a esta conversa');
    }

    // Verificar se a mensagem existe na conversa
    const message = await this.chatRepository.findMessageById(
      markAsReadDto.lastReadMessageId,
    );
    if (!message || message.conversationId !== conversationId) {
      throw new BadRequestException('Mensagem não encontrada nesta conversa');
    }

    await this.chatRepository.markMessagesAsRead(
      conversationId,
      userId,
      markAsReadDto.lastReadMessageId,
    );

    // Notificar via WebSocket se disponível
    if (this.webSocketService) {
      this.webSocketService.notifyMessagesRead?.({
        conversationId,
        userId,
        lastReadMessageId: markAsReadDto.lastReadMessageId,
      });
    }
  }

  /**
   * Adiciona reação à mensagem
   */
  async addReaction(
    messageId: number,
    userId: number,
    addReactionDto: AddReactionDto,
  ): Promise<MessageReactionResponseDto> {
    const message = await this.chatRepository.findMessageById(messageId);
    if (!message) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    // Verificar acesso à conversa
    const participant = await this.chatRepository.findParticipant(
      message.conversationId,
      userId,
    );
    if (!participant || participant.status !== ParticipantStatus.ACTIVE) {
      throw new ForbiddenException('Você não tem acesso a esta conversa');
    }

    // Verificar se já existe esta reação do usuário
    const existingReaction = await this.chatRepository.findReaction(
      messageId,
      userId,
      addReactionDto.emoji,
    );
    if (existingReaction) {
      throw new BadRequestException('Você já reagiu com este emoji');
    }

    const reactionData = {
      messageId,
      userId,
      emoji: addReactionDto.emoji,
    };

    const reaction = await this.chatRepository.createReaction(reactionData);

    // Atualizar contador de reações
    await this.chatRepository.updateMessage(messageId, {
      reactionCount: message.reactionCount + 1,
    });

    // Notificar via WebSocket se disponível
    if (this.webSocketService) {
      this.webSocketService.notifyReactionAdded?.({
        messageId,
        conversationId: message.conversationId,
        userId,
        emoji: addReactionDto.emoji,
      });
    }

    return this.toReactionResponseDto(reaction);
  }

  /**
   * Remove reação da mensagem
   */
  async removeReaction(
    messageId: number,
    userId: number,
    emoji: string,
  ): Promise<void> {
    const message = await this.chatRepository.findMessageById(messageId);
    if (!message) {
      throw new NotFoundException('Mensagem não encontrada');
    }

    // Verificar acesso à conversa
    const participant = await this.chatRepository.findParticipant(
      message.conversationId,
      userId,
    );
    if (!participant || participant.status !== ParticipantStatus.ACTIVE) {
      throw new ForbiddenException('Você não tem acesso a esta conversa');
    }

    // Verificar se a reação existe
    const reaction = await this.chatRepository.findReaction(
      messageId,
      userId,
      emoji,
    );
    if (!reaction) {
      throw new NotFoundException('Reação não encontrada');
    }

    await this.chatRepository.removeReaction(messageId, userId, emoji);

    // Atualizar contador de reações
    await this.chatRepository.updateMessage(messageId, {
      reactionCount: Math.max(0, message.reactionCount - 1),
    });

    // Notificar via WebSocket se disponível
    if (this.webSocketService) {
      this.webSocketService.notifyReactionRemoved?.({
        messageId,
        conversationId: message.conversationId,
        userId,
        emoji,
      });
    }
  }

  /**
   * Obtém estatísticas do chat
   */
  async getChatStats(userId: number): Promise<ChatStats> {
    return await this.chatRepository.getChatStats(userId);
  }

  /**
   * Métodos auxiliares privados
   */
  private toConversationResponseDto(
    conversation: Conversation,
    userId: number,
  ): ConversationResponseDto {
    // Encontrar dados do participante atual
    const userParticipant = conversation.participants?.find(
      (p) => p.userId === userId,
    );

    return {
      id: conversation.id,
      type: conversation.type,
      title: conversation.title,
      description: conversation.description,
      createdBy: conversation.createdBy,
      creator: {
        id: conversation.creator.id,
        name: conversation.creator.name,
        email: conversation.creator.email,
        phone: conversation.creator.phone,
        userType: conversation.creator.userType,
        createdAt: conversation.creator.createdAt,
      },
      status: conversation.status,
      lastMessageId: conversation.lastMessageId,
      lastMessage: conversation.lastMessage
        ? this.toMessageResponseDto(conversation.lastMessage)
        : undefined,
      lastActivityAt: conversation.lastActivityAt,
      appointmentId: conversation.appointmentId,
      isPinned: userParticipant?.isPinned || false,
      isMuted: userParticipant?.isMuted || false,
      participantCount: conversation.participantCount,
      messageCount: conversation.messageCount,
      unreadCount: userParticipant?.unreadCount || 0,
      participants:
        conversation.participants?.map((p) =>
          this.toParticipantResponseDto(p),
        ) || [],
      isActive: conversation.isActive,
      isArchived: conversation.isArchived,
      isBlocked: conversation.isBlocked,
      isDirect: conversation.isDirect,
      isGroup: conversation.isGroup,
      isSupport: conversation.isSupport,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
    };
  }

  private toParticipantResponseDto(
    participant: ConversationParticipant,
  ): ConversationParticipantResponseDto {
    return {
      id: participant.id,
      conversationId: participant.conversationId,
      userId: participant.userId,
      user: {
        id: participant.user.id,
        name: participant.user.name,
        email: participant.user.email,
        phone: participant.user.phone,
        userType: participant.user.userType,
        createdAt: participant.user.createdAt,
      },
      role: participant.role,
      status: participant.status,
      joinedAt: participant.joinedAt,
      leftAt: participant.leftAt,
      lastReadMessageId: participant.lastReadMessageId,
      lastReadAt: participant.lastReadAt,
      unreadCount: participant.unreadCount,
      isMuted: participant.isMuted,
      isPinned: participant.isPinned,
      isActive: participant.isActive,
      hasLeft: participant.hasLeft,
      isRemoved: participant.isRemoved,
      isBlocked: participant.isBlocked,
      isAdmin: participant.isAdmin,
      isModerator: participant.isModerator,
      canModerate: participant.canModerate,
      hasUnreadMessages: participant.hasUnreadMessages,
      createdAt: participant.createdAt,
      updatedAt: participant.updatedAt,
    };
  }

  private toMessageResponseDto(message: Message): MessageResponseDto {
    return {
      id: message.id,
      conversationId: message.conversationId,
      senderId: message.senderId,
      sender: {
        id: message.sender.id,
        name: message.sender.name,
        email: message.sender.email,
        phone: message.sender.phone,
        userType: message.sender.userType,
        createdAt: message.sender.createdAt,
      },
      type: message.type,
      content: message.content,
      status: message.status,
      replyToId: message.replyToId,
      replyTo: message.replyTo
        ? this.toMessageResponseDto(message.replyTo)
        : undefined,
      forwardedFromId: message.forwardedFromId,
      editedAt: message.editedAt,
      deletedAt: message.deletedAt,
      isPinned: message.isPinned,
      isSystem: message.isSystem,
      readCount: message.readCount,
      reactionCount: message.reactionCount,
      attachmentCount: message.attachmentCount,
      attachments:
        message.attachments?.map((a) => this.toAttachmentResponseDto(a)) || [],
      reactions:
        message.reactions?.map((r) => this.toReactionResponseDto(r)) || [],
      isSent: message.isSent,
      isDelivered: message.isDelivered,
      isRead: message.isRead,
      isFailed: message.isFailed,
      isDeleted: message.isDeleted,
      isEdited: message.isEdited,
      isReply: message.isReply,
      isForwarded: message.isForwarded,
      hasAttachments: message.hasAttachments,
      hasReactions: message.hasReactions,
      hasMentions: message.hasMentions,
      isTextMessage: message.isTextMessage,
      isMediaMessage: message.isMediaMessage,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }

  private toAttachmentResponseDto(
    attachment: MessageAttachment,
  ): MessageAttachmentResponseDto {
    return {
      id: attachment.id,
      messageId: attachment.messageId,
      type: attachment.type,
      fileName: attachment.fileName,
      originalName: attachment.originalName,
      fileUrl: attachment.fileUrl,
      fileSize: Number(attachment.fileSize),
      mimeType: attachment.mimeType,
      width: attachment.width,
      height: attachment.height,
      duration: attachment.duration,
      thumbnailUrl: attachment.thumbnailUrl,
      isProcessed: attachment.isProcessed,
      isImage: attachment.isImage,
      isVideo: attachment.isVideo,
      isAudio: attachment.isAudio,
      isDocument: attachment.isDocument,
      isMedia: attachment.isMedia,
      fileSizeFormatted: attachment.fileSizeFormatted,
      durationFormatted: attachment.durationFormatted,
      createdAt: attachment.createdAt,
      updatedAt: attachment.updatedAt,
    };
  }

  private toReactionResponseDto(
    reaction: MessageReaction,
  ): MessageReactionResponseDto {
    return {
      id: reaction.id,
      messageId: reaction.messageId,
      userId: reaction.userId,
      user: {
        id: reaction.user.id,
        name: reaction.user.name,
        email: reaction.user.email,
        phone: reaction.user.phone,
        userType: reaction.user.userType,
        createdAt: reaction.user.createdAt,
      },
      emoji: reaction.emoji,
      createdAt: reaction.createdAt,
    };
  }
}
