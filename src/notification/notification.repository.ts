import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, LessThan, MoreThan } from 'typeorm';
import {
  Notification,
  NotificationStatus,
} from './entities/notification.entity';
import { NotificationPreference } from './entities/notification-preference.entity';
import { QueryNotificationsDto } from './dto/query-notifications.dto';
import { NotificationStats } from './interfaces/paginated-notifications.interface';

@Injectable()
export class NotificationRepository {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(NotificationPreference)
    private readonly preferenceRepository: Repository<NotificationPreference>,
  ) {}

  async create(notificationData: Partial<Notification>): Promise<Notification> {
    const notification = this.notificationRepository.create(notificationData);
    return await this.notificationRepository.save(notification);
  }

  async findById(id: number): Promise<Notification | null> {
    return await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findByUser(
    userId: number,
    query: QueryNotificationsDto,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const queryBuilder = this.createQueryBuilder();

    queryBuilder.where('notification.userId = :userId', { userId });

    this.applyFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const notifications = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .take(query.limit || 10)
      .orderBy('notification.createdAt', 'DESC')
      .getMany();

    return { notifications, total };
  }

  async findWithFilters(
    query: QueryNotificationsDto,
  ): Promise<{ notifications: Notification[]; total: number }> {
    const queryBuilder = this.createQueryBuilder();

    this.applyFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const notifications = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .take(query.limit || 10)
      .orderBy('notification.createdAt', 'DESC')
      .getMany();

    return { notifications, total };
  }

  async findPendingScheduled(): Promise<Notification[]> {
    return await this.notificationRepository.find({
      where: {
        status: NotificationStatus.PENDING,
        scheduledFor: LessThan(new Date()),
      },
      relations: ['user'],
      order: { scheduledFor: 'ASC' },
    });
  }

  async findFailedRetryable(): Promise<Notification[]> {
    return await this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user')
      .where('notification.status = :status', {
        status: NotificationStatus.FAILED,
      })
      .andWhere('notification.retryCount < notification.maxRetries')
      .orderBy('notification.failedAt', 'ASC')
      .getMany();
  }

  async update(
    id: number,
    updateData: Partial<Notification>,
  ): Promise<Notification | null> {
    await this.notificationRepository.update(id, updateData);
    return await this.findById(id);
  }

  async delete(id: number): Promise<void> {
    await this.notificationRepository.delete(id);
  }

  async markAsRead(id: number): Promise<Notification | null> {
    await this.notificationRepository.update(id, {
      status: NotificationStatus.READ,
      readAt: new Date(),
    });
    return await this.findById(id);
  }

  async markAllAsRead(userId: number): Promise<void> {
    await this.notificationRepository.update(
      { userId, status: NotificationStatus.DELIVERED },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    );
  }

  async archive(id: number): Promise<Notification | null> {
    await this.notificationRepository.update(id, { isArchived: true });
    return await this.findById(id);
  }

  async getUnreadCount(userId: number): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        userId,
        status: NotificationStatus.DELIVERED,
        isArchived: false,
      },
    });
  }

  async getStats(userId: number): Promise<NotificationStats> {
    const queryBuilder = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId });

    const total = await queryBuilder.getCount();

    const unread = await queryBuilder
      .andWhere('notification.status = :status', {
        status: NotificationStatus.DELIVERED,
      })
      .andWhere('notification.isArchived = :isArchived', { isArchived: false })
      .getCount();

    // Estatísticas por tipo
    const byTypeQuery = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.type', 'type')
      .addSelect('COUNT(*)', 'count')
      .where('notification.userId = :userId', { userId })
      .groupBy('notification.type')
      .getRawMany();

    const byType = byTypeQuery.reduce((acc, item) => {
      acc[item.type] = parseInt(item.count);
      return acc;
    }, {});

    // Estatísticas por canal
    const byChannelQuery = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.channel', 'channel')
      .addSelect('COUNT(*)', 'count')
      .where('notification.userId = :userId', { userId })
      .groupBy('notification.channel')
      .getRawMany();

    const byChannel = byChannelQuery.reduce((acc, item) => {
      acc[item.channel] = parseInt(item.count);
      return acc;
    }, {});

    // Estatísticas por status
    const byStatusQuery = await this.notificationRepository
      .createQueryBuilder('notification')
      .select('notification.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('notification.userId = :userId', { userId })
      .groupBy('notification.status')
      .getRawMany();

    const byStatus = byStatusQuery.reduce((acc, item) => {
      acc[item.status] = parseInt(item.count);
      return acc;
    }, {});

    return {
      total,
      unread,
      byType,
      byChannel,
      byStatus,
    };
  }

  // Métodos para preferências
  async createPreference(
    preferenceData: Partial<NotificationPreference>,
  ): Promise<NotificationPreference> {
    const preference = this.preferenceRepository.create(preferenceData);
    return await this.preferenceRepository.save(preference);
  }

  async findPreferencesByUser(
    userId: number,
  ): Promise<NotificationPreference[]> {
    return await this.preferenceRepository.find({
      where: { userId },
      order: { type: 'ASC', channel: 'ASC' },
    });
  }

  async findPreference(
    userId: number,
    type: string,
    channel: string,
  ): Promise<NotificationPreference | null> {
    return await this.preferenceRepository.findOne({
      where: { userId, type: type as any, channel: channel as any },
    });
  }

  async updatePreference(
    id: number,
    updateData: Partial<NotificationPreference>,
  ): Promise<NotificationPreference | null> {
    await this.preferenceRepository.update(id, updateData);
    return await this.preferenceRepository.findOne({ where: { id } });
  }

  async deletePreference(id: number): Promise<void> {
    await this.preferenceRepository.delete(id);
  }

  private createQueryBuilder(): SelectQueryBuilder<Notification> {
    return this.notificationRepository
      .createQueryBuilder('notification')
      .leftJoinAndSelect('notification.user', 'user');
  }

  private applyFilters(
    queryBuilder: SelectQueryBuilder<Notification>,
    query: QueryNotificationsDto,
  ): void {
    if (query.type) {
      queryBuilder.andWhere('notification.type = :type', { type: query.type });
    }

    if (query.channel) {
      queryBuilder.andWhere('notification.channel = :channel', {
        channel: query.channel,
      });
    }

    if (query.priority) {
      queryBuilder.andWhere('notification.priority = :priority', {
        priority: query.priority,
      });
    }

    if (query.status) {
      queryBuilder.andWhere('notification.status = :status', {
        status: query.status,
      });
    }

    if (query.unreadOnly) {
      queryBuilder.andWhere('notification.status = :unreadStatus', {
        unreadStatus: NotificationStatus.DELIVERED,
      });
    }

    if (query.isArchived !== undefined) {
      queryBuilder.andWhere('notification.isArchived = :isArchived', {
        isArchived: query.isArchived,
      });
    }

    if (query.startDate) {
      queryBuilder.andWhere('notification.createdAt >= :startDate', {
        startDate: new Date(query.startDate),
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('notification.createdAt <= :endDate', {
        endDate: new Date(query.endDate),
      });
    }

    if (query.search) {
      queryBuilder.andWhere(
        '(LOWER(notification.title) LIKE LOWER(:search) OR LOWER(notification.message) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }

    if (query.relatedEntityType) {
      queryBuilder.andWhere(
        'notification.relatedEntityType = :relatedEntityType',
        {
          relatedEntityType: query.relatedEntityType,
        },
      );
    }

    if (query.relatedEntityId) {
      queryBuilder.andWhere('notification.relatedEntityId = :relatedEntityId', {
        relatedEntityId: query.relatedEntityId,
      });
    }
  }
}
