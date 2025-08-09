import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan, LessThan } from 'typeorm';
import { DashboardWidget } from './entities/dashboard-widget.entity';
import {
  DashboardMetric,
  MetricType,
  MetricPeriod,
} from './entities/dashboard-metric.entity';
import {
  CreateWidgetDto,
  UpdateWidgetDto,
  QueryDashboardDto,
  QueryMetricsDto,
  CreateMetricDto,
} from './dto/dashboard.dto';

@Injectable()
export class DashboardRepository {
  constructor(
    @InjectRepository(DashboardWidget)
    private readonly widgetRepository: Repository<DashboardWidget>,
    @InjectRepository(DashboardMetric)
    private readonly metricRepository: Repository<DashboardMetric>,
  ) {}

  // Widget methods
  async createWidget(
    userId: number,
    createWidgetDto: CreateWidgetDto,
  ): Promise<DashboardWidget> {
    const widget = this.widgetRepository.create({
      userId,
      ...createWidgetDto,
    });
    return await this.widgetRepository.save(widget);
  }

  async findWidgetsByUserId(
    userId: number,
    query?: QueryDashboardDto,
  ): Promise<DashboardWidget[]> {
    const queryBuilder = this.widgetRepository
      .createQueryBuilder('widget')
      .where('widget.userId = :userId', { userId });

    if (query?.category) {
      queryBuilder.andWhere('widget.category = :category', {
        category: query.category,
      });
    }

    if (query?.type) {
      queryBuilder.andWhere('widget.type = :type', { type: query.type });
    }

    if (query?.activeOnly) {
      queryBuilder.andWhere('widget.isActive = :isActive', { isActive: true });
    }

    if (query?.visibleOnly) {
      queryBuilder.andWhere('widget.isVisible = :isVisible', {
        isVisible: true,
      });
    }

    return await queryBuilder
      .orderBy('widget.position', 'ASC')
      .addOrderBy('widget.row', 'ASC')
      .addOrderBy('widget.column', 'ASC')
      .getMany();
  }

  async findWidgetById(
    id: number,
    userId: number,
  ): Promise<DashboardWidget | null> {
    return await this.widgetRepository.findOne({
      where: { id, userId },
    });
  }

  async updateWidget(
    id: number,
    userId: number,
    updateWidgetDto: UpdateWidgetDto,
  ): Promise<DashboardWidget | null> {
    await this.widgetRepository.update({ id, userId }, updateWidgetDto);
    return await this.findWidgetById(id, userId);
  }

  async deleteWidget(id: number, userId: number): Promise<boolean> {
    const result = await this.widgetRepository.delete({ id, userId });
    return (result.affected || 0) > 0;
  }

  async updateWidgetPositions(
    userId: number,
    positions: Array<{
      id: number;
      position: number;
      row: number;
      column: number;
    }>,
  ): Promise<void> {
    for (const pos of positions) {
      await this.widgetRepository.update(
        { id: pos.id, userId },
        { position: pos.position, row: pos.row, column: pos.column },
      );
    }
  }

  async refreshWidget(
    id: number,
    userId: number,
  ): Promise<DashboardWidget | null> {
    await this.widgetRepository.update(
      { id, userId },
      { lastRefreshedAt: new Date() },
    );
    return await this.findWidgetById(id, userId);
  }

  // Metric methods
  async createMetric(
    createMetricDto: CreateMetricDto,
  ): Promise<DashboardMetric> {
    const metric = this.metricRepository.create(createMetricDto);
    return await this.metricRepository.save(metric);
  }

  async findMetrics(query: QueryMetricsDto): Promise<DashboardMetric[]> {
    const queryBuilder = this.metricRepository.createQueryBuilder('metric');

    if (query.type) {
      queryBuilder.andWhere('metric.type = :type', { type: query.type });
    }

    if (query.period) {
      queryBuilder.andWhere('metric.period = :period', {
        period: query.period,
      });
    }

    if (query.startDate && query.endDate) {
      queryBuilder.andWhere('metric.date BETWEEN :startDate AND :endDate', {
        startDate: query.startDate,
        endDate: query.endDate,
      });
    } else if (query.startDate) {
      queryBuilder.andWhere('metric.date >= :startDate', {
        startDate: query.startDate,
      });
    } else if (query.endDate) {
      queryBuilder.andWhere('metric.date <= :endDate', {
        endDate: query.endDate,
      });
    }

    if (query.category) {
      queryBuilder.andWhere('metric.category = :category', {
        category: query.category,
      });
    }

    if (query.userType) {
      queryBuilder.andWhere('metric.userType = :userType', {
        userType: query.userType,
      });
    }

    return await queryBuilder
      .orderBy('metric.date', 'DESC')
      .limit(query.limit || 100)
      .offset(query.offset || 0)
      .getMany();
  }

  async getMetricsByType(
    type: MetricType,
    period: MetricPeriod,
    startDate: Date,
    endDate: Date,
  ): Promise<DashboardMetric[]> {
    return await this.metricRepository.find({
      where: {
        type,
        period,
        date: Between(startDate, endDate),
      },
      order: { date: 'ASC' },
    });
  }

  async getMetricsByUserId(
    userId: number,
    type?: MetricType,
    startDate?: Date,
    endDate?: Date,
  ): Promise<DashboardMetric[]> {
    const where: any = { userId };

    if (type) {
      where.type = type;
    }

    if (startDate && endDate) {
      where.date = Between(startDate, endDate);
    } else if (startDate) {
      where.date = MoreThan(startDate);
    } else if (endDate) {
      where.date = LessThan(endDate);
    }

    return await this.metricRepository.find({
      where,
      order: { date: 'DESC' },
    });
  }

  async aggregateMetrics(
    type: MetricType,
    period: MetricPeriod,
    startDate: Date,
    endDate: Date,
    groupBy?: string,
  ): Promise<any[]> {
    let queryBuilder = this.metricRepository
      .createQueryBuilder('metric')
      .select('DATE(metric.date)', 'date')
      .addSelect('SUM(metric.value)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('metric.type = :type', { type })
      .andWhere('metric.period = :period', { period })
      .andWhere('metric.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (groupBy) {
      queryBuilder = queryBuilder
        .addSelect(`metric.${groupBy}`, groupBy)
        .groupBy(`metric.${groupBy}`)
        .addGroupBy('DATE(metric.date)');
    } else {
      queryBuilder = queryBuilder.groupBy('DATE(metric.date)');
    }

    return await queryBuilder.orderBy('date', 'ASC').getRawMany();
  }

  async getTopMetrics(
    type: MetricType,
    period: MetricPeriod,
    startDate: Date,
    endDate: Date,
    limit: number = 10,
  ): Promise<any[]> {
    return await this.metricRepository
      .createQueryBuilder('metric')
      .select('metric.relatedEntityId', 'entityId')
      .addSelect('metric.relatedEntityType', 'entityType')
      .addSelect('SUM(metric.value)', 'total')
      .addSelect('COUNT(*)', 'count')
      .where('metric.type = :type', { type })
      .andWhere('metric.period = :period', { period })
      .andWhere('metric.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('metric.relatedEntityId IS NOT NULL')
      .groupBy('metric.relatedEntityId')
      .addGroupBy('metric.relatedEntityType')
      .orderBy('total', 'DESC')
      .limit(limit)
      .getRawMany();
  }

  async getTotalMetricValue(
    type: MetricType,
    period: MetricPeriod,
    startDate: Date,
    endDate: Date,
    userId?: number,
  ): Promise<number> {
    let queryBuilder = this.metricRepository
      .createQueryBuilder('metric')
      .select('SUM(metric.value)', 'total')
      .where('metric.type = :type', { type })
      .andWhere('metric.period = :period', { period })
      .andWhere('metric.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });

    if (userId) {
      queryBuilder = queryBuilder.andWhere('metric.userId = :userId', {
        userId,
      });
    }

    const result = await queryBuilder.getRawOne();
    return parseFloat(result?.total || '0');
  }

  async getTotalMetricAmount(
    type: MetricType,
    period: MetricPeriod,
    startDate: Date,
    endDate: Date,
    userId?: number,
  ): Promise<number> {
    let queryBuilder = this.metricRepository
      .createQueryBuilder('metric')
      .select('SUM(metric.amount)', 'total')
      .where('metric.type = :type', { type })
      .andWhere('metric.period = :period', { period })
      .andWhere('metric.date BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .andWhere('metric.amount IS NOT NULL');

    if (userId) {
      queryBuilder = queryBuilder.andWhere('metric.userId = :userId', {
        userId,
      });
    }

    const result = await queryBuilder.getRawOne();
    return parseFloat(result?.total || '0');
  }

  async deleteOldMetrics(beforeDate: Date): Promise<number> {
    const result = await this.metricRepository.delete({
      date: LessThan(beforeDate),
    });
    return result.affected || 0;
  }

  async upsertMetric(
    createMetricDto: CreateMetricDto,
  ): Promise<DashboardMetric> {
    const whereCondition: any = {
      type: createMetricDto.type,
      period: createMetricDto.period,
      date: new Date(createMetricDto.date),
    };

    if (createMetricDto.userId !== undefined) {
      whereCondition.userId = createMetricDto.userId;
    }

    if (createMetricDto.relatedEntityId !== undefined) {
      whereCondition.relatedEntityId = createMetricDto.relatedEntityId;
    }

    if (createMetricDto.relatedEntityType !== undefined) {
      whereCondition.relatedEntityType = createMetricDto.relatedEntityType;
    }

    const existing = await this.metricRepository.findOne({
      where: whereCondition,
    });

    if (existing) {
      existing.value += createMetricDto.value || 1;
      if (createMetricDto.amount) {
        existing.amount = (existing.amount || 0) + createMetricDto.amount;
      }
      if (createMetricDto.metadata) {
        existing.metadata = {
          ...existing.metadata,
          ...createMetricDto.metadata,
        };
      }
      return await this.metricRepository.save(existing);
    } else {
      return await this.createMetric(createMetricDto);
    }
  }
}
