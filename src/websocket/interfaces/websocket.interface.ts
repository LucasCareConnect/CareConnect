import { Socket } from 'socket.io';
import { User } from '../../user/entities/user.entity';

export interface AuthenticatedSocket extends Socket {
  user?: User;
  userId?: number;
}

export interface SocketRoom {
  id: string;
  type: RoomType;
  participants: number[];
  metadata?: Record<string, any>;
}

export enum RoomType {
  USER = 'user',
  CONVERSATION = 'conversation',
  APPOINTMENT = 'appointment',
  GLOBAL = 'global',
}

export enum WebSocketEvent {
  // Connection events
  CONNECTION = 'connection',
  DISCONNECT = 'disconnect',
  AUTHENTICATE = 'authenticate',
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',

  // Chat events
  MESSAGE_SENT = 'message_sent',
  MESSAGE_RECEIVED = 'message_received',
  MESSAGE_UPDATED = 'message_updated',
  MESSAGE_DELETED = 'message_deleted',
  MESSAGE_REACTION_ADDED = 'message_reaction_added',
  MESSAGE_REACTION_REMOVED = 'message_reaction_removed',
  MESSAGES_READ = 'messages_read',
  TYPING_START = 'typing_start',
  TYPING_STOP = 'typing_stop',
  USER_ONLINE = 'user_online',
  USER_OFFLINE = 'user_offline',

  // Notification events
  NOTIFICATION_SENT = 'notification_sent',
  NOTIFICATION_READ = 'notification_read',
  NOTIFICATION_UPDATED = 'notification_updated',

  // Appointment events
  APPOINTMENT_CREATED = 'appointment_created',
  APPOINTMENT_UPDATED = 'appointment_updated',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  APPOINTMENT_CONFIRMED = 'appointment_confirmed',
  APPOINTMENT_STARTED = 'appointment_started',
  APPOINTMENT_COMPLETED = 'appointment_completed',

  // Payment events
  PAYMENT_CREATED = 'payment_created',
  PAYMENT_UPDATED = 'payment_updated',
  PAYMENT_COMPLETED = 'payment_completed',
  PAYMENT_FAILED = 'payment_failed',
  PAYMENT_REFUNDED = 'payment_refunded',

  // System events
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  ERROR = 'error',
  SUCCESS = 'success',
}

export interface WebSocketMessage<T = any> {
  event: WebSocketEvent;
  data: T;
  timestamp: Date;
  userId?: number;
  roomId?: string;
  metadata?: Record<string, any>;
}

export interface JoinRoomPayload {
  roomId: string;
  roomType: RoomType;
  metadata?: Record<string, any>;
}

export interface LeaveRoomPayload {
  roomId: string;
}

export interface TypingPayload {
  conversationId: number;
  isTyping: boolean;
}

export interface MessageEventPayload {
  messageId: number;
  conversationId: number;
  senderId: number;
  content?: string;
  type?: string;
  metadata?: Record<string, any>;
}

export interface ReactionEventPayload {
  messageId: number;
  conversationId: number;
  userId: number;
  emoji: string;
}

export interface ReadEventPayload {
  conversationId: number;
  userId: number;
  lastReadMessageId: number;
}

export interface NotificationEventPayload {
  notificationId: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface AppointmentEventPayload {
  appointmentId: number;
  familyUserId: number;
  caregiverId: number;
  status: string;
  startDate: Date;
  endDate: Date;
  metadata?: Record<string, any>;
}

export interface PaymentEventPayload {
  paymentId: number;
  userId: number;
  recipientId?: number;
  amount: number;
  status: string;
  type: string;
  metadata?: Record<string, any>;
}

export interface UserStatusPayload {
  userId: number;
  status: 'online' | 'offline';
  lastSeen?: Date;
}

export interface SystemAnnouncementPayload {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  targetUsers?: number[];
  metadata?: Record<string, any>;
}
