import {
  ConversationResponseDto,
  MessageResponseDto,
  ConversationParticipantResponseDto,
} from '../dto/chat-response.dto';

export interface PaginatedConversations {
  data: ConversationResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedMessages {
  data: MessageResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedParticipants {
  data: ConversationParticipantResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ChatStats {
  totalConversations: number;
  activeConversations: number;
  totalMessages: number;
  unreadMessages: number;
  messagesByType: Record<string, number>;
  conversationsByType: Record<string, number>;
  averageMessagesPerConversation: number;
  mostActiveConversation?: {
    id: number;
    title?: string;
    messageCount: number;
  };
  recentActivity: {
    lastMessageAt?: Date;
    messagesLast24h: number;
    messagesLast7d: number;
  };
}

export interface ConversationStats {
  messageCount: number;
  participantCount: number;
  unreadCount: number;
  messagesByType: Record<string, number>;
  messagesByUser: Record<number, { count: number; userName: string }>;
  attachmentCount: number;
  reactionCount: number;
  firstMessageAt?: Date;
  lastMessageAt?: Date;
  averageMessagesPerDay: number;
}

export interface MessageSearchResult {
  message: MessageResponseDto;
  conversation: {
    id: number;
    title?: string;
    type: string;
  };
  matchedText: string;
  contextBefore?: string;
  contextAfter?: string;
}

export interface PaginatedMessageSearch {
  data: MessageSearchResult[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  searchTerm: string;
}
