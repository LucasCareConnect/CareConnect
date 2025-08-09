import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, In } from 'typeorm';
import {
  Conversation,
  ConversationStatus,
} from './entities/conversation.entity';
import {
  ConversationParticipant,
  ParticipantStatus,
} from './entities/conversation-participant.entity';
import { Message, MessageStatus } from './entities/message.entity';
import { MessageAttachment } from './entities/message-attachment.entity';
import { MessageReaction } from './entities/message-reaction.entity';
import { QueryConversationsDto, QueryMessagesDto } from './dto/query-chat.dto';
import {
  ChatStats,
  ConversationStats,
} from './interfaces/paginated-chat.interface';

@Injectable()
export class ChatRepository {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(ConversationParticipant)
    private readonly participantRepository: Repository<ConversationParticipant>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(MessageAttachment)
    private readonly attachmentRepository: Repository<MessageAttachment>,
    @InjectRepository(MessageReaction)
    private readonly reactionRepository: Repository<MessageReaction>,
  ) {}

  // Métodos para Conversation
  async createConversation(
    conversationData: Partial<Conversation>,
  ): Promise<Conversation> {
    const conversation = this.conversationRepository.create(conversationData);
    return await this.conversationRepository.save(conversation);
  }

  async findConversationById(id: number): Promise<Conversation | null> {
    return await this.conversationRepository.findOne({
      where: { id },
      relations: [
        'creator',
        'lastMessage',
        'participants',
        'participants.user',
      ],
    });
  }

  async findUserConversations(
    userId: number,
    query: QueryConversationsDto,
  ): Promise<{ conversations: Conversation[]; total: number }> {
    const queryBuilder = this.createConversationQueryBuilder();

    // Filtrar apenas conversas onde o usuário é participante ativo
    queryBuilder
      .innerJoin('conversation.participants', 'userParticipant')
      .where('userParticipant.userId = :userId', { userId })
      .andWhere('userParticipant.status = :participantStatus', {
        participantStatus: ParticipantStatus.ACTIVE,
      });

    this.applyConversationFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const conversations = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 20))
      .take(query.limit || 20)
      .orderBy('conversation.lastActivityAt', 'DESC')
      .addOrderBy('conversation.createdAt', 'DESC')
      .getMany();

    return { conversations, total };
  }

  async updateConversation(
    id: number,
    updateData: Partial<Conversation>,
  ): Promise<Conversation | null> {
    await this.conversationRepository.update(id, updateData);
    return await this.findConversationById(id);
  }

  async deleteConversation(id: number): Promise<void> {
    await this.conversationRepository.delete(id);
  }

  // Métodos para ConversationParticipant
  async createParticipant(
    participantData: Partial<ConversationParticipant>,
  ): Promise<ConversationParticipant> {
    const participant = this.participantRepository.create(participantData);
    return await this.participantRepository.save(participant);
  }

  async findParticipant(
    conversationId: number,
    userId: number,
  ): Promise<ConversationParticipant | null> {
    return await this.participantRepository.findOne({
      where: { conversationId, userId },
      relations: ['user', 'conversation'],
    });
  }

  async findConversationParticipants(
    conversationId: number,
  ): Promise<ConversationParticipant[]> {
    return await this.participantRepository.find({
      where: { conversationId, status: ParticipantStatus.ACTIVE },
      relations: ['user'],
      order: { joinedAt: 'ASC' },
    });
  }

  async updateParticipant(
    id: number,
    updateData: Partial<ConversationParticipant>,
  ): Promise<ConversationParticipant | null> {
    await this.participantRepository.update(id, updateData);
    return await this.participantRepository.findOne({
      where: { id },
      relations: ['user', 'conversation'],
    });
  }

  async removeParticipant(
    conversationId: number,
    userId: number,
  ): Promise<void> {
    await this.participantRepository.update(
      { conversationId, userId },
      { status: ParticipantStatus.LEFT, leftAt: new Date() },
    );
  }

  // Métodos para Message
  async createMessage(messageData: Partial<Message>): Promise<Message> {
    const message = this.messageRepository.create(messageData);
    return await this.messageRepository.save(message);
  }

  async findMessageById(id: number): Promise<Message | null> {
    return await this.messageRepository.findOne({
      where: { id },
      relations: [
        'sender',
        'conversation',
        'replyTo',
        'replyTo.sender',
        'attachments',
        'reactions',
        'reactions.user',
      ],
    });
  }

  async findConversationMessages(
    conversationId: number,
    query: QueryMessagesDto,
  ): Promise<{ messages: Message[]; total: number }> {
    const queryBuilder = this.createMessageQueryBuilder();

    queryBuilder.where('message.conversationId = :conversationId', {
      conversationId,
    });

    this.applyMessageFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const messages = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 50))
      .take(query.limit || 50)
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    return { messages, total };
  }

  async updateMessage(
    id: number,
    updateData: Partial<Message>,
  ): Promise<Message | null> {
    await this.messageRepository.update(id, updateData);
    return await this.findMessageById(id);
  }

  async deleteMessage(id: number, deletedBy: number): Promise<void> {
    await this.messageRepository.update(id, {
      status: MessageStatus.DELETED,
      deletedAt: new Date(),
      deletedBy,
    });
  }

  async markMessagesAsRead(
    conversationId: number,
    userId: number,
    lastMessageId: number,
  ): Promise<void> {
    // Atualizar participant com última mensagem lida
    await this.participantRepository.update(
      { conversationId, userId },
      {
        lastReadMessageId: lastMessageId,
        lastReadAt: new Date(),
        unreadCount: 0,
      },
    );

    // Atualizar status das mensagens para lidas
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ status: MessageStatus.READ })
      .where('conversationId = :conversationId', { conversationId })
      .andWhere('id <= :lastMessageId', { lastMessageId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('status != :readStatus', { readStatus: MessageStatus.READ })
      .execute();
  }

  // Métodos para MessageAttachment
  async createAttachment(
    attachmentData: Partial<MessageAttachment>,
  ): Promise<MessageAttachment> {
    const attachment = this.attachmentRepository.create(attachmentData);
    return await this.attachmentRepository.save(attachment);
  }

  async findMessageAttachments(
    messageId: number,
  ): Promise<MessageAttachment[]> {
    return await this.attachmentRepository.find({
      where: { messageId },
      order: { createdAt: 'ASC' },
    });
  }

  // Métodos para MessageReaction
  async createReaction(
    reactionData: Partial<MessageReaction>,
  ): Promise<MessageReaction> {
    const reaction = this.reactionRepository.create(reactionData);
    return await this.reactionRepository.save(reaction);
  }

  async findReaction(
    messageId: number,
    userId: number,
    emoji: string,
  ): Promise<MessageReaction | null> {
    return await this.reactionRepository.findOne({
      where: { messageId, userId, emoji },
      relations: ['user'],
    });
  }

  async removeReaction(
    messageId: number,
    userId: number,
    emoji: string,
  ): Promise<void> {
    await this.reactionRepository.delete({ messageId, userId, emoji });
  }

  async findMessageReactions(messageId: number): Promise<MessageReaction[]> {
    return await this.reactionRepository.find({
      where: { messageId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  // Métodos de estatísticas
  async getChatStats(userId: number): Promise<ChatStats> {
    // Buscar conversas do usuário
    const userConversations = await this.participantRepository.find({
      where: { userId, status: ParticipantStatus.ACTIVE },
      relations: ['conversation'],
    });

    const conversationIds = userConversations.map((p) => p.conversationId);

    if (conversationIds.length === 0) {
      return {
        totalConversations: 0,
        activeConversations: 0,
        totalMessages: 0,
        unreadMessages: 0,
        messagesByType: {},
        conversationsByType: {},
        averageMessagesPerConversation: 0,
        recentActivity: {
          messagesLast24h: 0,
          messagesLast7d: 0,
        },
      };
    }

    // Estatísticas básicas
    const totalConversations = userConversations.length;
    const activeConversations = userConversations.filter(
      (p) => p.conversation.status === ConversationStatus.ACTIVE,
    ).length;

    const totalMessages = await this.messageRepository.count({
      where: { conversationId: In(conversationIds) },
    });

    const unreadMessages = userConversations.reduce(
      (sum, p) => sum + p.unreadCount,
      0,
    );

    // Mensagens por tipo
    const messagesByTypeQuery = await this.messageRepository
      .createQueryBuilder('message')
      .select('message.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('message.conversationId IN (:...conversationIds)', {
        conversationIds,
      })
      .groupBy('message.type')
      .getRawMany();

    const messagesByType = messagesByTypeQuery.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count);
      return acc;
    }, {});

    // Conversas por tipo
    const conversationsByTypeQuery = await this.conversationRepository
      .createQueryBuilder('conversation')
      .select('conversation.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('conversation.id IN (:...conversationIds)', { conversationIds })
      .groupBy('conversation.type')
      .getRawMany();

    const conversationsByType = conversationsByTypeQuery.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count);
      return acc;
    }, {});

    // Atividade recente
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const messagesLast24h = await this.messageRepository.count({
      where: {
        conversationId: In(conversationIds),
        createdAt: { $gte: last24h } as any,
      },
    });

    const messagesLast7d = await this.messageRepository.count({
      where: {
        conversationId: In(conversationIds),
        createdAt: { $gte: last7d } as any,
      },
    });

    return {
      totalConversations,
      activeConversations,
      totalMessages,
      unreadMessages,
      messagesByType,
      conversationsByType,
      averageMessagesPerConversation:
        totalConversations > 0 ? totalMessages / totalConversations : 0,
      recentActivity: {
        messagesLast24h,
        messagesLast7d,
      },
    };
  }

  private createConversationQueryBuilder(): SelectQueryBuilder<Conversation> {
    return this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.creator', 'creator')
      .leftJoinAndSelect('conversation.lastMessage', 'lastMessage')
      .leftJoinAndSelect('lastMessage.sender', 'lastMessageSender')
      .leftJoinAndSelect('conversation.participants', 'participants')
      .leftJoinAndSelect('participants.user', 'participantUser');
  }

  private createMessageQueryBuilder(): SelectQueryBuilder<Message> {
    return this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.replyTo', 'replyTo')
      .leftJoinAndSelect('replyTo.sender', 'replyToSender')
      .leftJoinAndSelect('message.attachments', 'attachments')
      .leftJoinAndSelect('message.reactions', 'reactions')
      .leftJoinAndSelect('reactions.user', 'reactionUser');
  }

  private applyConversationFilters(
    queryBuilder: SelectQueryBuilder<Conversation>,
    query: QueryConversationsDto,
  ): void {
    if (query.type) {
      queryBuilder.andWhere('conversation.type = :type', { type: query.type });
    }

    if (query.status) {
      queryBuilder.andWhere('conversation.status = :status', {
        status: query.status,
      });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(LOWER(conversation.title) LIKE LOWER(:search) OR LOWER(conversation.description) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }

    if (query.appointmentId) {
      queryBuilder.andWhere('conversation.appointmentId = :appointmentId', {
        appointmentId: query.appointmentId,
      });
    }

    if (query.isPinned !== undefined) {
      queryBuilder.andWhere('userParticipant.isPinned = :isPinned', {
        isPinned: query.isPinned,
      });
    }

    if (query.isMuted !== undefined) {
      queryBuilder.andWhere('userParticipant.isMuted = :isMuted', {
        isMuted: query.isMuted,
      });
    }

    if (query.hasUnreadMessages) {
      queryBuilder.andWhere('userParticipant.unreadCount > 0');
    }
  }

  private applyMessageFilters(
    queryBuilder: SelectQueryBuilder<Message>,
    query: QueryMessagesDto,
  ): void {
    if (query.type) {
      queryBuilder.andWhere('message.type = :type', { type: query.type });
    }

    if (query.status) {
      queryBuilder.andWhere('message.status = :status', {
        status: query.status,
      });
    }

    if (query.search) {
      queryBuilder.andWhere('LOWER(message.content) LIKE LOWER(:search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.senderId) {
      queryBuilder.andWhere('message.senderId = :senderId', {
        senderId: query.senderId,
      });
    }

    if (query.startDate) {
      queryBuilder.andWhere('message.createdAt >= :startDate', {
        startDate: new Date(query.startDate),
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('message.createdAt <= :endDate', {
        endDate: new Date(query.endDate),
      });
    }

    if (query.isPinned !== undefined) {
      queryBuilder.andWhere('message.isPinned = :isPinned', {
        isPinned: query.isPinned,
      });
    }

    if (query.hasAttachments) {
      queryBuilder.andWhere('message.attachmentCount > 0');
    }

    if (query.hasReactions) {
      queryBuilder.andWhere('message.reactionCount > 0');
    }

    if (query.beforeMessageId) {
      queryBuilder.andWhere('message.id < :beforeMessageId', {
        beforeMessageId: query.beforeMessageId,
      });
    }

    if (query.afterMessageId) {
      queryBuilder.andWhere('message.id > :afterMessageId', {
        afterMessageId: query.afterMessageId,
      });
    }
  }
}
