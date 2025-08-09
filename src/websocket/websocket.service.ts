import { Injectable, Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import {
  AuthenticatedSocket,
  SocketRoom,
  RoomType,
  WebSocketEvent,
  WebSocketMessage,
  MessageEventPayload,
  ReactionEventPayload,
  ReadEventPayload,
  NotificationEventPayload,
  AppointmentEventPayload,
  PaymentEventPayload,
  UserStatusPayload,
  SystemAnnouncementPayload,
  TypingPayload,
} from './interfaces/websocket.interface';

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);
  private server: Server;
  private connectedUsers = new Map<number, AuthenticatedSocket[]>();
  private rooms = new Map<string, SocketRoom>();
  private typingUsers = new Map<string, Set<number>>();

  setServer(server: Server) {
    this.server = server;
  }

  /**
   * Adiciona usuário conectado
   */
  addConnectedUser(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    const userSockets = this.connectedUsers.get(socket.userId) || [];
    userSockets.push(socket);
    this.connectedUsers.set(socket.userId, userSockets);

    this.logger.log(
      `User ${socket.userId} connected. Total connections: ${userSockets.length}`,
    );

    // Notificar outros usuários que este usuário está online
    this.broadcastUserStatus({
      userId: socket.userId,
      status: 'online',
    });

    // Adicionar usuário à sua room pessoal
    this.joinUserRoom(socket);
  }

  /**
   * Remove usuário conectado
   */
  removeConnectedUser(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    const userSockets = this.connectedUsers.get(socket.userId) || [];
    const updatedSockets = userSockets.filter((s) => s.id !== socket.id);

    if (updatedSockets.length === 0) {
      this.connectedUsers.delete(socket.userId);

      // Notificar outros usuários que este usuário está offline
      this.broadcastUserStatus({
        userId: socket.userId,
        status: 'offline',
        lastSeen: new Date(),
      });
    } else {
      this.connectedUsers.set(socket.userId, updatedSockets);
    }

    this.logger.log(
      `User ${socket.userId} disconnected. Remaining connections: ${updatedSockets.length}`,
    );
  }

  /**
   * Verifica se usuário está online
   */
  isUserOnline(userId: number): boolean {
    return this.connectedUsers.has(userId);
  }

  /**
   * Obtém sockets do usuário
   */
  getUserSockets(userId: number): AuthenticatedSocket[] {
    return this.connectedUsers.get(userId) || [];
  }

  /**
   * Adiciona usuário à sua room pessoal
   */
  private joinUserRoom(socket: AuthenticatedSocket) {
    if (!socket.userId) return;

    const roomId = `user_${socket.userId}`;
    socket.join(roomId);

    const room: SocketRoom = {
      id: roomId,
      type: RoomType.USER,
      participants: [socket.userId],
    };

    this.rooms.set(roomId, room);
  }

  /**
   * Adiciona usuário a uma room
   */
  joinRoom(
    socket: AuthenticatedSocket,
    roomId: string,
    roomType: RoomType,
    metadata?: Record<string, any>,
  ) {
    if (!socket.userId) return;

    socket.join(roomId);

    let room = this.rooms.get(roomId);
    if (!room) {
      room = {
        id: roomId,
        type: roomType,
        participants: [],
        metadata,
      };
    }

    if (!room.participants.includes(socket.userId)) {
      room.participants.push(socket.userId);
    }

    this.rooms.set(roomId, room);
    this.logger.log(`User ${socket.userId} joined room ${roomId}`);
  }

  /**
   * Remove usuário de uma room
   */
  leaveRoom(socket: AuthenticatedSocket, roomId: string) {
    if (!socket.userId) return;

    socket.leave(roomId);

    const room = this.rooms.get(roomId);
    if (room) {
      room.participants = room.participants.filter(
        (id) => id !== socket.userId,
      );

      if (room.participants.length === 0 && room.type !== RoomType.USER) {
        this.rooms.delete(roomId);
      } else {
        this.rooms.set(roomId, room);
      }
    }

    this.logger.log(`User ${socket.userId} left room ${roomId}`);
  }

  /**
   * Envia mensagem para usuário específico
   */
  sendToUser<T>(userId: number, event: WebSocketEvent, data: T) {
    const roomId = `user_${userId}`;
    this.sendToRoom(roomId, event, data);
  }

  /**
   * Envia mensagem para room específica
   */
  sendToRoom<T>(roomId: string, event: WebSocketEvent, data: T) {
    if (!this.server) return;

    const message: WebSocketMessage<T> = {
      event,
      data,
      timestamp: new Date(),
      roomId,
    };

    this.server.to(roomId).emit(event, message);
    this.logger.debug(`Sent ${event} to room ${roomId}`);
  }

  /**
   * Broadcast para todos os usuários conectados
   */
  broadcast<T>(event: WebSocketEvent, data: T, excludeUserId?: number) {
    if (!this.server) return;

    const message: WebSocketMessage<T> = {
      event,
      data,
      timestamp: new Date(),
    };

    if (excludeUserId) {
      const excludeRoomId = `user_${excludeUserId}`;
      this.server.except(excludeRoomId).emit(event, message);
    } else {
      this.server.emit(event, message);
    }

    this.logger.debug(`Broadcasted ${event} to all users`);
  }

  // Métodos específicos para eventos de chat

  /**
   * Notifica nova mensagem
   */
  notifyNewMessage(payload: MessageEventPayload) {
    const roomId = `conversation_${payload.conversationId}`;
    this.sendToRoom(roomId, WebSocketEvent.MESSAGE_RECEIVED, payload);
  }

  /**
   * Notifica mensagem atualizada
   */
  notifyMessageUpdated(payload: MessageEventPayload) {
    const roomId = `conversation_${payload.conversationId}`;
    this.sendToRoom(roomId, WebSocketEvent.MESSAGE_UPDATED, payload);
  }

  /**
   * Notifica mensagem deletada
   */
  notifyMessageDeleted(payload: MessageEventPayload) {
    const roomId = `conversation_${payload.conversationId}`;
    this.sendToRoom(roomId, WebSocketEvent.MESSAGE_DELETED, payload);
  }

  /**
   * Notifica reação adicionada
   */
  notifyReactionAdded(payload: ReactionEventPayload) {
    const roomId = `conversation_${payload.conversationId}`;
    this.sendToRoom(roomId, WebSocketEvent.MESSAGE_REACTION_ADDED, payload);
  }

  /**
   * Notifica reação removida
   */
  notifyReactionRemoved(payload: ReactionEventPayload) {
    const roomId = `conversation_${payload.conversationId}`;
    this.sendToRoom(roomId, WebSocketEvent.MESSAGE_REACTION_REMOVED, payload);
  }

  /**
   * Notifica mensagens lidas
   */
  notifyMessagesRead(payload: ReadEventPayload) {
    const roomId = `conversation_${payload.conversationId}`;
    this.sendToRoom(roomId, WebSocketEvent.MESSAGES_READ, payload);
  }

  /**
   * Gerencia status de digitação
   */
  handleTyping(socket: AuthenticatedSocket, payload: TypingPayload) {
    if (!socket.userId) return;

    const roomId = `conversation_${payload.conversationId}`;
    const typingKey = `${payload.conversationId}`;

    if (!this.typingUsers.has(typingKey)) {
      this.typingUsers.set(typingKey, new Set());
    }

    const typingSet = this.typingUsers.get(typingKey)!;

    if (payload.isTyping) {
      typingSet.add(socket.userId);
      socket.to(roomId).emit(WebSocketEvent.TYPING_START, {
        conversationId: payload.conversationId,
        userId: socket.userId,
      });
    } else {
      typingSet.delete(socket.userId);
      socket.to(roomId).emit(WebSocketEvent.TYPING_STOP, {
        conversationId: payload.conversationId,
        userId: socket.userId,
      });
    }

    // Auto-stop typing após 3 segundos
    if (payload.isTyping) {
      setTimeout(() => {
        if (socket.userId && typingSet.has(socket.userId)) {
          typingSet.delete(socket.userId);
          socket.to(roomId).emit(WebSocketEvent.TYPING_STOP, {
            conversationId: payload.conversationId,
            userId: socket.userId,
          });
        }
      }, 3000);
    }
  }

  // Métodos específicos para notificações

  /**
   * Envia notificação para usuário
   */
  sendNotification(payload: NotificationEventPayload) {
    this.sendToUser(payload.userId, WebSocketEvent.NOTIFICATION_SENT, payload);
  }

  /**
   * Notifica notificação lida
   */
  notifyNotificationRead(payload: NotificationEventPayload) {
    this.sendToUser(payload.userId, WebSocketEvent.NOTIFICATION_READ, payload);
  }

  // Métodos específicos para agendamentos

  /**
   * Notifica agendamento criado
   */
  notifyAppointmentCreated(payload: AppointmentEventPayload) {
    this.sendToUser(
      payload.familyUserId,
      WebSocketEvent.APPOINTMENT_CREATED,
      payload,
    );
    this.sendToUser(
      payload.caregiverId,
      WebSocketEvent.APPOINTMENT_CREATED,
      payload,
    );
  }

  /**
   * Notifica agendamento atualizado
   */
  notifyAppointmentUpdated(payload: AppointmentEventPayload) {
    this.sendToUser(
      payload.familyUserId,
      WebSocketEvent.APPOINTMENT_UPDATED,
      payload,
    );
    this.sendToUser(
      payload.caregiverId,
      WebSocketEvent.APPOINTMENT_UPDATED,
      payload,
    );
  }

  /**
   * Notifica agendamento confirmado
   */
  notifyAppointmentConfirmed(payload: AppointmentEventPayload) {
    this.sendToUser(
      payload.familyUserId,
      WebSocketEvent.APPOINTMENT_CONFIRMED,
      payload,
    );
    this.sendToUser(
      payload.caregiverId,
      WebSocketEvent.APPOINTMENT_CONFIRMED,
      payload,
    );
  }

  // Métodos específicos para pagamentos

  /**
   * Notifica pagamento criado
   */
  notifyPaymentCreated(payload: PaymentEventPayload) {
    this.sendToUser(payload.userId, WebSocketEvent.PAYMENT_CREATED, payload);
    if (payload.recipientId) {
      this.sendToUser(
        payload.recipientId,
        WebSocketEvent.PAYMENT_CREATED,
        payload,
      );
    }
  }

  /**
   * Notifica pagamento completado
   */
  notifyPaymentCompleted(payload: PaymentEventPayload) {
    this.sendToUser(payload.userId, WebSocketEvent.PAYMENT_COMPLETED, payload);
    if (payload.recipientId) {
      this.sendToUser(
        payload.recipientId,
        WebSocketEvent.PAYMENT_COMPLETED,
        payload,
      );
    }
  }

  // Métodos de sistema

  /**
   * Broadcast status do usuário
   */
  private broadcastUserStatus(payload: UserStatusPayload) {
    this.broadcast(WebSocketEvent.USER_ONLINE, payload, payload.userId);
  }

  /**
   * Envia anúncio do sistema
   */
  sendSystemAnnouncement(payload: SystemAnnouncementPayload) {
    if (payload.targetUsers && payload.targetUsers.length > 0) {
      payload.targetUsers.forEach((userId) => {
        this.sendToUser(userId, WebSocketEvent.SYSTEM_ANNOUNCEMENT, payload);
      });
    } else {
      this.broadcast(WebSocketEvent.SYSTEM_ANNOUNCEMENT, payload);
    }
  }

  /**
   * Obtém estatísticas de conexão
   */
  getConnectionStats() {
    return {
      connectedUsers: this.connectedUsers.size,
      totalConnections: Array.from(this.connectedUsers.values()).reduce(
        (sum, sockets) => sum + sockets.length,
        0,
      ),
      activeRooms: this.rooms.size,
      typingUsers: Array.from(this.typingUsers.values()).reduce(
        (sum, set) => sum + set.size,
        0,
      ),
    };
  }
}
