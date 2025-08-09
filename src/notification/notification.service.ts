import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { NotificationRepository } from './notification.repository';
import { UserService } from '../user/user.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import {
  CreateNotificationPreferenceDto,
  UpdateNotificationPreferenceDto,
  BulkUpdatePreferencesDto,
} from './dto/notification-preference.dto';
import {
  NotificationResponseDto,
  NotificationPreferenceResponseDto,
} from './dto/notification-response.dto';
import {
  PaginatedNotifications,
  NotificationStats,
} from './interfaces/paginated-notifications.interface';
import {
  Notification,
  NotificationStatus,
  NotificationChannel,
  NotificationType,
} from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { UserRole } from '../user/enum/user-role.enum';

@Injectable()
export class NotificationService {
  constructor(
    private readonly notificationRepository: NotificationRepository,
    private readonly userService: UserService,
    @Inject(forwardRef(() => 'WebSocketService'))
    private readonly webSocketService?: any,
  ) {}

  /**
   * Cria uma nova notificação
   */
  async create(
    createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    // Verificar se o usuário existe
    const user = await this.userService.findById(createNotificationDto.userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar preferências do usuário
    const preference = await this.notificationRepository.findPreference(
      createNotificationDto.userId,
      createNotificationDto.type,
      createNotificationDto.channel,
    );

    // Se o usuário desabilitou este tipo de notificação, não enviar
    if (preference && !preference.isEnabled) {
      throw new BadRequestException(
        'Usuário desabilitou este tipo de notificação',
      );
    }

    // Verificar horário silencioso
    if (preference && preference.isInQuietHours()) {
      // Agendar para depois do horário silencioso
      const scheduledFor = this.calculateNextAvailableTime(preference);
      createNotificationDto.scheduledFor = scheduledFor.toISOString();
    }

    const notificationData = {
      userId: createNotificationDto.userId,
      type: createNotificationDto.type,
      channel: createNotificationDto.channel,
      priority: createNotificationDto.priority,
      status: NotificationStatus.PENDING,
      title: createNotificationDto.title,
      message: createNotificationDto.message,
      data: createNotificationDto.data,
      templateId: createNotificationDto.templateId,
      relatedEntityType: createNotificationDto.relatedEntityType,
      relatedEntityId: createNotificationDto.relatedEntityId,
      scheduledFor: createNotificationDto.scheduledFor
        ? new Date(createNotificationDto.scheduledFor)
        : undefined,
      maxRetries: createNotificationDto.maxRetries || 3,
      actionUrl: createNotificationDto.actionUrl,
      actionText: createNotificationDto.actionText,
      expiresAt: createNotificationDto.expiresAt
        ? new Date(createNotificationDto.expiresAt)
        : undefined,
      retryCount: 0,
      isArchived: false,
    };

    const notification =
      await this.notificationRepository.create(notificationData);

    // Enviar notificação via WebSocket se disponível
    if (this.webSocketService) {
      this.webSocketService.sendNotification?.({
        notificationId: notification.id,
        userId: notification.userId,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        data: notification.data,
      });
    }

    return this.toResponseDto(notification);
  }

  /**
   * Busca notificação por ID
   */
  async findById(id: number): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }
    return this.toResponseDto(notification);
  }

  /**
   * Busca notificações do usuário
   */
  async findByUser(
    userId: number,
    query: QueryNotificationsDto,
  ): Promise<PaginatedNotifications> {
    const { notifications, total } =
      await this.notificationRepository.findByUser(userId, query);
    const unreadCount =
      await this.notificationRepository.getUnreadCount(userId);

    return {
      data: notifications.map((notification) =>
        this.toResponseDto(notification),
      ),
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
      unreadCount,
    };
  }

  /**
   * Busca notificações do usuário logado
   */
  async findMyNotifications(
    userId: number,
    query: QueryNotificationsDto,
  ): Promise<PaginatedNotifications> {
    return await this.findByUser(userId, query);
  }

  /**
   * Busca todas as notificações (admin)
   */
  async findAll(query: QueryNotificationsDto): Promise<PaginatedNotifications> {
    const { notifications, total } =
      await this.notificationRepository.findWithFilters(query);

    return {
      data: notifications.map((notification) =>
        this.toResponseDto(notification),
      ),
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
    };
  }

  /**
   * Atualiza uma notificação
   */
  async update(
    id: number,
    userId: number,
    userRole: UserRole,
    updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    // Verificar permissões
    if (userRole !== UserRole.ADMIN && notification.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar esta notificação',
      );
    }

    const updateData: Partial<Notification> = {
      ...updateNotificationDto,
      scheduledFor: updateNotificationDto.scheduledFor
        ? new Date(updateNotificationDto.scheduledFor)
        : undefined,
      expiresAt: updateNotificationDto.expiresAt
        ? new Date(updateNotificationDto.expiresAt)
        : undefined,
    };

    const updatedNotification = await this.notificationRepository.update(
      id,
      updateData,
    );
    if (!updatedNotification) {
      throw new NotFoundException('Erro ao atualizar notificação');
    }

    return this.toResponseDto(updatedNotification);
  }

  /**
   * Remove uma notificação
   */
  async remove(id: number, userId: number, userRole: UserRole): Promise<void> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    // Verificar permissões
    if (userRole !== UserRole.ADMIN && notification.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para remover esta notificação',
      );
    }

    await this.notificationRepository.delete(id);
  }

  /**
   * Marca notificação como lida
   */
  async markAsRead(
    id: number,
    userId: number,
    userRole: UserRole,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    // Verificar permissões
    if (userRole !== UserRole.ADMIN && notification.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para marcar esta notificação como lida',
      );
    }

    const updatedNotification =
      await this.notificationRepository.markAsRead(id);
    if (!updatedNotification) {
      throw new NotFoundException('Erro ao marcar notificação como lida');
    }

    return this.toResponseDto(updatedNotification);
  }

  /**
   * Marca todas as notificações como lidas
   */
  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  /**
   * Arquiva uma notificação
   */
  async archive(
    id: number,
    userId: number,
    userRole: UserRole,
  ): Promise<NotificationResponseDto> {
    const notification = await this.notificationRepository.findById(id);
    if (!notification) {
      throw new NotFoundException('Notificação não encontrada');
    }

    // Verificar permissões
    if (userRole !== UserRole.ADMIN && notification.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para arquivar esta notificação',
      );
    }

    const updatedNotification = await this.notificationRepository.archive(id);
    if (!updatedNotification) {
      throw new NotFoundException('Erro ao arquivar notificação');
    }

    return this.toResponseDto(updatedNotification);
  }

  /**
   * Obtém estatísticas das notificações
   */
  async getStats(userId: number): Promise<NotificationStats> {
    return await this.notificationRepository.getStats(userId);
  }

  /**
   * Obtém contagem de não lidas
   */
  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.getUnreadCount(userId);
  }

  /**
   * Métodos auxiliares privados
   */
  private calculateNextAvailableTime(preference: NotificationPreference): Date {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (preference.quietHoursEnd) {
      const [endHour, endMin] = preference.quietHoursEnd.split(':').map(Number);

      // Se ainda estamos no horário silencioso de hoje
      if (preference.isInQuietHours()) {
        const nextAvailable = new Date(now);
        nextAvailable.setHours(endHour, endMin, 0, 0);

        // Se o horário de fim já passou hoje, agendar para amanhã
        if (nextAvailable <= now) {
          nextAvailable.setDate(nextAvailable.getDate() + 1);
        }

        return nextAvailable;
      }
    }

    // Se não está no horário silencioso, enviar imediatamente
    return now;
  }

  private toResponseDto(notification: Notification): NotificationResponseDto {
    return {
      id: notification.id,
      userId: notification.userId,
      user: {
        id: notification.user.id,
        name: notification.user.name,
        email: notification.user.email,
        phone: notification.user.phone,
        userType: notification.user.userType,
        createdAt: notification.user.createdAt,
      },
      type: notification.type,
      channel: notification.channel,
      priority: notification.priority,
      status: notification.status,
      title: notification.title,
      message: notification.message,
      data: notification.data,
      templateId: notification.templateId,
      relatedEntityType: notification.relatedEntityType,
      relatedEntityId: notification.relatedEntityId,
      scheduledFor: notification.scheduledFor,
      sentAt: notification.sentAt,
      deliveredAt: notification.deliveredAt,
      readAt: notification.readAt,
      failedAt: notification.failedAt,
      failureReason: notification.failureReason,
      retryCount: notification.retryCount,
      maxRetries: notification.maxRetries,
      externalId: notification.externalId,
      actionUrl: notification.actionUrl,
      actionText: notification.actionText,
      expiresAt: notification.expiresAt,
      isArchived: notification.isArchived,
      isExpired: notification.isExpired,
      canRetry: notification.canRetry,
      isRead: notification.isRead,
      isPending: notification.isPending,
      isScheduled: notification.isScheduled,
      createdAt: notification.createdAt,
      updatedAt: notification.updatedAt,
    };
  }

  // Métodos para preferências de notificação

  /**
   * Cria uma preferência de notificação
   */
  async createPreference(
    userId: number,
    createPreferenceDto: CreateNotificationPreferenceDto,
  ): Promise<NotificationPreferenceResponseDto> {
    // Verificar se já existe uma preferência para este tipo e canal
    const existing = await this.notificationRepository.findPreference(
      userId,
      createPreferenceDto.type,
      createPreferenceDto.channel,
    );

    if (existing) {
      throw new BadRequestException(
        'Preferência já existe para este tipo e canal',
      );
    }

    const preferenceData = {
      userId,
      type: createPreferenceDto.type,
      channel: createPreferenceDto.channel,
      isEnabled: createPreferenceDto.isEnabled,
      quietHoursStart: createPreferenceDto.quietHoursStart,
      quietHoursEnd: createPreferenceDto.quietHoursEnd,
      settings: createPreferenceDto.settings,
    };

    const preference =
      await this.notificationRepository.createPreference(preferenceData);
    return this.toPreferenceResponseDto(preference);
  }

  /**
   * Busca preferências do usuário
   */
  async findPreferences(
    userId: number,
  ): Promise<NotificationPreferenceResponseDto[]> {
    const preferences =
      await this.notificationRepository.findPreferencesByUser(userId);
    return preferences.map((preference) =>
      this.toPreferenceResponseDto(preference),
    );
  }

  /**
   * Atualiza uma preferência
   */
  async updatePreference(
    userId: number,
    type: NotificationType,
    channel: NotificationChannel,
    updatePreferenceDto: UpdateNotificationPreferenceDto,
  ): Promise<NotificationPreferenceResponseDto> {
    const preference = await this.notificationRepository.findPreference(
      userId,
      type,
      channel,
    );

    if (!preference) {
      throw new NotFoundException('Preferência não encontrada');
    }

    const updatedPreference =
      await this.notificationRepository.updatePreference(
        preference.id,
        updatePreferenceDto,
      );

    if (!updatedPreference) {
      throw new NotFoundException('Erro ao atualizar preferência');
    }

    return this.toPreferenceResponseDto(updatedPreference);
  }

  /**
   * Atualiza múltiplas preferências
   */
  async bulkUpdatePreferences(
    userId: number,
    bulkUpdateDto: BulkUpdatePreferencesDto,
  ): Promise<NotificationPreferenceResponseDto[]> {
    const results: NotificationPreferenceResponseDto[] = [];

    for (const preferenceDto of bulkUpdateDto.preferences) {
      try {
        // Tentar atualizar se existe
        const existing = await this.notificationRepository.findPreference(
          userId,
          preferenceDto.type,
          preferenceDto.channel,
        );

        if (existing) {
          const updated = await this.notificationRepository.updatePreference(
            existing.id,
            {
              isEnabled: preferenceDto.isEnabled,
              quietHoursStart: preferenceDto.quietHoursStart,
              quietHoursEnd: preferenceDto.quietHoursEnd,
              settings: preferenceDto.settings,
            },
          );
          if (updated) {
            results.push(this.toPreferenceResponseDto(updated));
          }
        } else {
          // Criar se não existe
          const created = await this.createPreference(userId, preferenceDto);
          results.push(created);
        }
      } catch (error) {
        // Continuar com as outras preferências em caso de erro
        console.error(
          `Erro ao processar preferência ${preferenceDto.type}/${preferenceDto.channel}:`,
          error,
        );
      }
    }

    return results;
  }

  /**
   * Remove uma preferência
   */
  async removePreference(
    userId: number,
    type: NotificationType,
    channel: NotificationChannel,
  ): Promise<void> {
    const preference = await this.notificationRepository.findPreference(
      userId,
      type,
      channel,
    );

    if (!preference) {
      throw new NotFoundException('Preferência não encontrada');
    }

    await this.notificationRepository.deletePreference(preference.id);
  }

  /**
   * Obtém preferências padrão para um usuário
   */
  async getDefaultPreferences(): Promise<CreateNotificationPreferenceDto[]> {
    const defaultPreferences: CreateNotificationPreferenceDto[] = [];

    // Definir preferências padrão para cada tipo de notificação
    const notificationTypes = Object.values(NotificationType);
    const channels = Object.values(NotificationChannel);

    for (const type of notificationTypes) {
      for (const channel of channels) {
        // Definir configurações padrão baseadas no tipo e canal
        let isEnabled = true;
        let quietHoursStart: string | undefined;
        let quietHoursEnd: string | undefined;

        // Configurações específicas por canal
        if (channel === NotificationChannel.SMS) {
          // SMS apenas para notificações urgentes por padrão
          isEnabled = [
            NotificationType.APPOINTMENT_REMINDER,
            NotificationType.APPOINTMENT_CANCELLED,
            NotificationType.CAREGIVER_APPROVED,
          ].includes(type);
          quietHoursStart = '22:00';
          quietHoursEnd = '08:00';
        } else if (channel === NotificationChannel.PUSH) {
          // Push notifications com horário silencioso
          quietHoursStart = '23:00';
          quietHoursEnd = '07:00';
        }

        defaultPreferences.push({
          type,
          channel,
          isEnabled,
          quietHoursStart,
          quietHoursEnd,
        });
      }
    }

    return defaultPreferences;
  }

  private toPreferenceResponseDto(
    preference: NotificationPreference,
  ): NotificationPreferenceResponseDto {
    return {
      id: preference.id,
      userId: preference.userId,
      type: preference.type,
      channel: preference.channel,
      isEnabled: preference.isEnabled,
      quietHoursStart: preference.quietHoursStart,
      quietHoursEnd: preference.quietHoursEnd,
      settings: preference.settings,
      createdAt: preference.createdAt,
      updatedAt: preference.updatedAt,
    };
  }

  /**
   * Envia notificação de reset de senha
   */
  async sendPasswordResetNotification(
    email: string,
    token: string,
    userName: string,
  ): Promise<void> {
    // Buscar usuário pelo email
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Criar notificação de reset de senha
    await this.create({
      userId: user.id,
      type: NotificationType.PASSWORD_RESET,
      channel: NotificationChannel.EMAIL,
      title: 'Redefinição de Senha - CareConnect',
      message: `Olá ${userName}, você solicitou a redefinição de sua senha. Use o código: ${token}`,
      data: {
        resetToken: token,
        email: email,
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutos
      },
    });

    // TODO: Implementar envio real de email
    console.log(`Password reset email sent to ${email} with token: ${token}`);
  }
}
