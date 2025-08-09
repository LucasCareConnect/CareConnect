import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Logger, UseGuards } from '@nestjs/common';
import { Server } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';
import { WebSocketService } from './websocket.service';
import type {
  AuthenticatedSocket,
  JoinRoomPayload,
  LeaveRoomPayload,
  TypingPayload,
} from './interfaces/websocket.interface';
import { WebSocketEvent, RoomType } from './interfaces/websocket.interface';

@WSGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/',
})
export class WebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly webSocketService: WebSocketService,
  ) {}

  afterInit(server: Server) {
    this.webSocketService.setServer(server);
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      this.logger.log(`Client attempting to connect: ${client.id}`);

      // Extrair token do handshake
      const token = this.extractTokenFromHandshake(client);
      if (!token) {
        this.logger.warn(`No token provided for client: ${client.id}`);
        client.emit(WebSocketEvent.ERROR, {
          message: 'Authentication required',
        });
        client.disconnect();
        return;
      }

      // Verificar e decodificar token
      const payload = await this.verifyToken(token);
      if (!payload) {
        this.logger.warn(`Invalid token for client: ${client.id}`);
        client.emit(WebSocketEvent.ERROR, { message: 'Invalid token' });
        client.disconnect();
        return;
      }

      // Buscar usuário
      const user = await this.userService.findById(payload.sub);
      if (!user) {
        this.logger.warn(`User not found for client: ${client.id}`);
        client.emit(WebSocketEvent.ERROR, { message: 'User not found' });
        client.disconnect();
        return;
      }

      // Autenticar socket
      client.user = user;
      client.userId = user.id;

      // Adicionar à lista de usuários conectados
      this.webSocketService.addConnectedUser(client);

      // Confirmar conexão
      client.emit(WebSocketEvent.SUCCESS, {
        message: 'Connected successfully',
        userId: user.id,
        timestamp: new Date(),
      });

      this.logger.log(`User ${user.id} (${user.name}) connected successfully`);
    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}:`, error);
      client.emit(WebSocketEvent.ERROR, { message: 'Connection failed' });
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    this.webSocketService.removeConnectedUser(client);
  }

  @SubscribeMessage(WebSocketEvent.JOIN_ROOM)
  handleJoinRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: JoinRoomPayload,
  ) {
    if (!client.userId) {
      client.emit(WebSocketEvent.ERROR, { message: 'Not authenticated' });
      return;
    }

    try {
      this.webSocketService.joinRoom(
        client,
        payload.roomId,
        payload.roomType,
        payload.metadata,
      );

      client.emit(WebSocketEvent.SUCCESS, {
        message: `Joined room ${payload.roomId}`,
        roomId: payload.roomId,
      });

      this.logger.log(`User ${client.userId} joined room ${payload.roomId}`);
    } catch (error) {
      this.logger.error(`Error joining room:`, error);
      client.emit(WebSocketEvent.ERROR, { message: 'Failed to join room' });
    }
  }

  @SubscribeMessage(WebSocketEvent.LEAVE_ROOM)
  handleLeaveRoom(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: LeaveRoomPayload,
  ) {
    if (!client.userId) {
      client.emit(WebSocketEvent.ERROR, { message: 'Not authenticated' });
      return;
    }

    try {
      this.webSocketService.leaveRoom(client, payload.roomId);

      client.emit(WebSocketEvent.SUCCESS, {
        message: `Left room ${payload.roomId}`,
        roomId: payload.roomId,
      });

      this.logger.log(`User ${client.userId} left room ${payload.roomId}`);
    } catch (error) {
      this.logger.error(`Error leaving room:`, error);
      client.emit(WebSocketEvent.ERROR, { message: 'Failed to leave room' });
    }
  }

  @SubscribeMessage(WebSocketEvent.TYPING_START)
  handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: TypingPayload,
  ) {
    if (!client.userId) {
      client.emit(WebSocketEvent.ERROR, { message: 'Not authenticated' });
      return;
    }

    this.webSocketService.handleTyping(client, { ...payload, isTyping: true });
  }

  @SubscribeMessage(WebSocketEvent.TYPING_STOP)
  handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() payload: TypingPayload,
  ) {
    if (!client.userId) {
      client.emit(WebSocketEvent.ERROR, { message: 'Not authenticated' });
      return;
    }

    this.webSocketService.handleTyping(client, { ...payload, isTyping: false });
  }

  @SubscribeMessage('ping')
  handlePing(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('pong', { timestamp: new Date() });
  }

  @SubscribeMessage('get_connection_stats')
  handleGetConnectionStats(@ConnectedSocket() client: AuthenticatedSocket) {
    if (!client.userId) {
      client.emit(WebSocketEvent.ERROR, { message: 'Not authenticated' });
      return;
    }

    const stats = this.webSocketService.getConnectionStats();
    client.emit('connection_stats', stats);
  }

  /**
   * Extrai token do handshake
   */
  private extractTokenFromHandshake(
    client: AuthenticatedSocket,
  ): string | null {
    // Tentar extrair do header Authorization
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      return authHeader.substring(7);
    }

    // Tentar extrair dos query parameters
    const token = client.handshake.query.token;
    if (typeof token === 'string') {
      return token;
    }

    // Tentar extrair do auth object
    const auth = client.handshake.auth;
    if (auth && auth.token) {
      return auth.token;
    }

    return null;
  }

  /**
   * Verifica e decodifica token JWT
   */
  private async verifyToken(token: string): Promise<any> {
    try {
      return await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_SECRET,
      });
    } catch (error) {
      this.logger.error('Token verification failed:', error);
      return null;
    }
  }

  /**
   * Métodos públicos para uso por outros serviços
   */

  /**
   * Envia mensagem para usuário específico
   */
  sendToUser<T>(userId: number, event: WebSocketEvent, data: T) {
    this.webSocketService.sendToUser(userId, event, data);
  }

  /**
   * Envia mensagem para room específica
   */
  sendToRoom<T>(roomId: string, event: WebSocketEvent, data: T) {
    this.webSocketService.sendToRoom(roomId, event, data);
  }

  /**
   * Broadcast para todos os usuários
   */
  broadcast<T>(event: WebSocketEvent, data: T, excludeUserId?: number) {
    this.webSocketService.broadcast(event, data, excludeUserId);
  }

  /**
   * Verifica se usuário está online
   */
  isUserOnline(userId: number): boolean {
    return this.webSocketService.isUserOnline(userId);
  }

  /**
   * Força usuário a entrar em uma room (para conversas automáticas)
   */
  forceJoinRoom(userId: number, roomId: string, roomType: RoomType) {
    const userSockets = this.webSocketService.getUserSockets(userId);
    userSockets.forEach((socket) => {
      this.webSocketService.joinRoom(socket, roomId, roomType);
    });
  }

  /**
   * Obtém estatísticas de conexão
   */
  getConnectionStats() {
    return this.webSocketService.getConnectionStats();
  }
}
