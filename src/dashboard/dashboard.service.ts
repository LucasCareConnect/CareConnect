import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { DashboardRepository } from './dashboard.repository';
import { UserService } from '../user/user.service';
import {
  CreateWidgetDto,
  UpdateWidgetDto,
  QueryDashboardDto,
  QueryMetricsDto,
  CreateMetricDto,
} from './dto/dashboard.dto';
import {
  WidgetResponseDto,
  MetricResponseDto,
  DashboardStatsDto,
  ChartDataDto,
  ChartDatasetDto,
  WidgetDataDto,
  DashboardResponseDto,
  ReportDto,
} from './dto/dashboard-response.dto';
import {
  DashboardWidget,
  WidgetType,
} from './entities/dashboard-widget.entity';
import {
  DashboardMetric,
  MetricType,
  MetricPeriod,
} from './entities/dashboard-metric.entity';
import { UserRole } from '../user/enum/user-role.enum';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dashboardRepository: DashboardRepository,
    private readonly userService: UserService,
  ) {}

  // Widget methods
  async createWidget(
    userId: number,
    createWidgetDto: CreateWidgetDto,
  ): Promise<WidgetResponseDto> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const widget = await this.dashboardRepository.createWidget(
      userId,
      createWidgetDto,
    );
    return this.toWidgetResponseDto(widget);
  }

  async getMyWidgets(
    userId: number,
    query?: QueryDashboardDto,
  ): Promise<WidgetResponseDto[]> {
    const widgets = await this.dashboardRepository.findWidgetsByUserId(
      userId,
      query,
    );
    return widgets.map((widget) => this.toWidgetResponseDto(widget));
  }

  async getWidgetById(id: number, userId: number): Promise<WidgetResponseDto> {
    const widget = await this.dashboardRepository.findWidgetById(id, userId);
    if (!widget) {
      throw new NotFoundException('Widget não encontrado');
    }
    return this.toWidgetResponseDto(widget);
  }

  async updateWidget(
    id: number,
    userId: number,
    updateWidgetDto: UpdateWidgetDto,
  ): Promise<WidgetResponseDto> {
    const widget = await this.dashboardRepository.updateWidget(
      id,
      userId,
      updateWidgetDto,
    );
    if (!widget) {
      throw new NotFoundException('Widget não encontrado');
    }
    return this.toWidgetResponseDto(widget);
  }

  async deleteWidget(id: number, userId: number): Promise<void> {
    const deleted = await this.dashboardRepository.deleteWidget(id, userId);
    if (!deleted) {
      throw new NotFoundException('Widget não encontrado');
    }
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
    await this.dashboardRepository.updateWidgetPositions(userId, positions);
  }

  async refreshWidget(id: number, userId: number): Promise<WidgetResponseDto> {
    const widget = await this.dashboardRepository.refreshWidget(id, userId);
    if (!widget) {
      throw new NotFoundException('Widget não encontrado');
    }
    return this.toWidgetResponseDto(widget);
  }

  // Metric methods
  async createMetric(
    createMetricDto: CreateMetricDto,
  ): Promise<MetricResponseDto> {
    const metric = await this.dashboardRepository.createMetric(createMetricDto);
    return this.toMetricResponseDto(metric);
  }

  async recordMetric(
    type: MetricType,
    userId?: number,
    relatedEntityId?: number,
    relatedEntityType?: string,
    value: number = 1,
    amount?: number,
    metadata?: Record<string, any>,
  ): Promise<void> {
    const now = new Date();
    const periods = [
      MetricPeriod.DAILY,
      MetricPeriod.WEEKLY,
      MetricPeriod.MONTHLY,
      MetricPeriod.YEARLY,
    ];

    for (const period of periods) {
      const date = this.getDateForPeriod(now, period);

      await this.dashboardRepository.upsertMetric({
        type,
        period,
        date: date.toISOString().split('T')[0],
        userId,
        relatedEntityId,
        relatedEntityType,
        value,
        amount,
        metadata,
        userType: userId ? await this.getUserType(userId) : undefined,
        category: this.getCategoryForMetricType(type),
        subcategory: this.getSubcategoryForMetricType(type),
      });
    }
  }

  async getMetrics(query: QueryMetricsDto): Promise<MetricResponseDto[]> {
    const metrics = await this.dashboardRepository.findMetrics(query);
    return metrics.map((metric) => this.toMetricResponseDto(metric));
  }

  // Dashboard methods
  async getDashboard(
    userId: number,
    query?: QueryDashboardDto,
  ): Promise<DashboardResponseDto> {
    const user = await this.userService.findById(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Buscar widgets do usuário
    const widgets = await this.getMyWidgets(userId, query);

    // Gerar estatísticas
    const stats = await this.getDashboardStats(userId, user.userType);

    // Buscar dados dos widgets
    const widgetData = await this.getWidgetData(widgets, userId);

    return {
      widgets,
      stats,
      widgetData,
      lastUpdated: new Date(),
    };
  }

  async getDashboardStats(
    userId: number,
    userType: string,
  ): Promise<DashboardStatsDto> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const stats: DashboardStatsDto = {
      totalUsers: 0,
      activeUsers: 0,
      newUsers: 0,
      totalCaregivers: 0,
      activeCaregivers: 0,
      totalAppointments: 0,
      pendingAppointments: 0,
      confirmedAppointments: 0,
      completedAppointments: 0,
      totalPayments: 0,
      totalPaymentAmount: 0,
      completedPayments: 0,
      totalMessages: 0,
      activeConversations: 0,
      totalNotifications: 0,
      unreadNotifications: 0,
      totalReviews: 0,
      averageRating: 0,
    };

    // Buscar métricas baseadas no tipo de usuário
    if (userType === UserRole.ADMIN) {
      // Admin vê estatísticas globais
      stats.totalUsers = await this.dashboardRepository.getTotalMetricValue(
        MetricType.USER_REGISTRATION,
        MetricPeriod.DAILY,
        new Date('2020-01-01'),
        now,
      );
      stats.newUsers = await this.dashboardRepository.getTotalMetricValue(
        MetricType.USER_REGISTRATION,
        MetricPeriod.DAILY,
        thirtyDaysAgo,
        now,
      );
    } else {
      // Usuários normais veem suas próprias estatísticas
      stats.totalAppointments =
        await this.dashboardRepository.getTotalMetricValue(
          MetricType.APPOINTMENT_CREATED,
          MetricPeriod.DAILY,
          new Date('2020-01-01'),
          now,
          userId,
        );
      stats.completedAppointments =
        await this.dashboardRepository.getTotalMetricValue(
          MetricType.APPOINTMENT_COMPLETED,
          MetricPeriod.DAILY,
          new Date('2020-01-01'),
          now,
          userId,
        );
    }

    stats.totalMessages = await this.dashboardRepository.getTotalMetricValue(
      MetricType.MESSAGE_SENT,
      MetricPeriod.DAILY,
      new Date('2020-01-01'),
      now,
      userId,
    );

    stats.totalPaymentAmount =
      await this.dashboardRepository.getTotalMetricAmount(
        MetricType.PAYMENT_COMPLETED,
        MetricPeriod.DAILY,
        new Date('2020-01-01'),
        now,
        userId,
      );

    return stats;
  }

  async getWidgetData(
    widgets: WidgetResponseDto[],
    userId: number,
  ): Promise<WidgetDataDto[]> {
    const widgetData: WidgetDataDto[] = [];

    for (const widget of widgets) {
      let data: any = {};

      switch (widget.type) {
        case WidgetType.COUNTER:
          data = await this.getCounterData(widget, userId);
          break;
        case WidgetType.CHART_LINE:
        case WidgetType.CHART_BAR:
          data = await this.getChartData(widget, userId);
          break;
        case WidgetType.CHART_PIE:
        case WidgetType.CHART_DOUGHNUT:
          data = await this.getPieChartData(widget, userId);
          break;
        case WidgetType.TABLE:
          data = await this.getTableData(widget, userId);
          break;
        case WidgetType.ACTIVITY_FEED:
          data = await this.getActivityFeedData(widget, userId);
          break;
        default:
          data = { message: 'Widget type not implemented yet' };
      }

      widgetData.push({
        widgetId: widget.id,
        type: widget.type,
        data,
        timestamp: new Date(),
        metadata: widget.config,
      });
    }

    return widgetData;
  }

  // Widget data methods
  private async getCounterData(
    widget: WidgetResponseDto,
    userId: number,
  ): Promise<any> {
    const config = widget.dataSource || {};
    const metricType = config.metricType as MetricType;
    const period = (config.period as MetricPeriod) || MetricPeriod.DAILY;

    if (!metricType) {
      return { value: 0, label: 'No metric configured' };
    }

    const now = new Date();
    const startDate = this.getStartDateForPeriod(now, period);

    const value = await this.dashboardRepository.getTotalMetricValue(
      metricType,
      period,
      startDate,
      now,
      userId,
    );

    return {
      value,
      label: this.getLabelForMetricType(metricType),
      period: period,
      lastUpdated: new Date(),
    };
  }

  private async getChartData(
    widget: WidgetResponseDto,
    userId: number,
  ): Promise<ChartDataDto> {
    const config = widget.dataSource || {};
    const metricType = config.metricType as MetricType;
    const period = (config.period as MetricPeriod) || MetricPeriod.DAILY;
    const days = config.days || 30;

    if (!metricType) {
      return { labels: [], datasets: [] };
    }

    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const metrics = await this.dashboardRepository.getMetricsByType(
      metricType,
      period,
      startDate,
      now,
    );

    const labels = metrics.map((m) => m.date.toISOString().split('T')[0]);
    const data = metrics.map((m) => m.value);

    const dataset: ChartDatasetDto = {
      label: this.getLabelForMetricType(metricType),
      data,
      backgroundColor: config.backgroundColor || '#3B82F6',
      borderColor: config.borderColor || '#1D4ED8',
      borderWidth: 2,
      fill: widget.type === WidgetType.CHART_LINE ? false : true,
      tension: 0.4,
    };

    return {
      labels,
      datasets: [dataset],
    };
  }

  private async getPieChartData(
    widget: WidgetResponseDto,
    userId: number,
  ): Promise<ChartDataDto> {
    // Implementar dados para gráfico de pizza
    return {
      labels: ['Categoria 1', 'Categoria 2', 'Categoria 3'],
      datasets: [
        {
          label: 'Distribuição',
          data: [30, 45, 25],
          backgroundColor: ['#3B82F6', '#10B981', '#F59E0B'],
          borderWidth: 1,
        },
      ],
    };
  }

  private async getTableData(
    widget: WidgetResponseDto,
    userId: number,
  ): Promise<any> {
    // Implementar dados para tabela
    return {
      headers: ['Nome', 'Valor', 'Data'],
      rows: [
        ['Item 1', '100', '2024-01-01'],
        ['Item 2', '200', '2024-01-02'],
        ['Item 3', '150', '2024-01-03'],
      ],
    };
  }

  private async getActivityFeedData(
    widget: WidgetResponseDto,
    userId: number,
  ): Promise<any> {
    // Implementar feed de atividades
    return {
      activities: [
        {
          id: 1,
          type: 'appointment_created',
          message: 'Novo agendamento criado',
          timestamp: new Date(),
          user: 'João Silva',
        },
        {
          id: 2,
          type: 'payment_completed',
          message: 'Pagamento processado',
          timestamp: new Date(Date.now() - 3600000),
          user: 'Maria Santos',
        },
      ],
    };
  }

  // Helper methods
  private getDateForPeriod(date: Date, period: MetricPeriod): Date {
    const result = new Date(date);

    switch (period) {
      case MetricPeriod.HOURLY:
        result.setMinutes(0, 0, 0);
        break;
      case MetricPeriod.DAILY:
        result.setHours(0, 0, 0, 0);
        break;
      case MetricPeriod.WEEKLY:
        const dayOfWeek = result.getDay();
        result.setDate(result.getDate() - dayOfWeek);
        result.setHours(0, 0, 0, 0);
        break;
      case MetricPeriod.MONTHLY:
        result.setDate(1);
        result.setHours(0, 0, 0, 0);
        break;
      case MetricPeriod.YEARLY:
        result.setMonth(0, 1);
        result.setHours(0, 0, 0, 0);
        break;
    }

    return result;
  }

  private getStartDateForPeriod(date: Date, period: MetricPeriod): Date {
    const result = new Date(date);

    switch (period) {
      case MetricPeriod.DAILY:
        result.setDate(result.getDate() - 30);
        break;
      case MetricPeriod.WEEKLY:
        result.setDate(result.getDate() - 7 * 12);
        break;
      case MetricPeriod.MONTHLY:
        result.setMonth(result.getMonth() - 12);
        break;
      case MetricPeriod.YEARLY:
        result.setFullYear(result.getFullYear() - 5);
        break;
      default:
        result.setDate(result.getDate() - 30);
    }

    return result;
  }

  private async getUserType(userId: number): Promise<string | undefined> {
    const user = await this.userService.findById(userId);
    return user?.userType;
  }

  private getCategoryForMetricType(type: MetricType): string {
    const categoryMap: Record<MetricType, string> = {
      [MetricType.USER_REGISTRATION]: 'users',
      [MetricType.APPOINTMENT_CREATED]: 'appointments',
      [MetricType.APPOINTMENT_COMPLETED]: 'appointments',
      [MetricType.APPOINTMENT_CANCELLED]: 'appointments',
      [MetricType.PAYMENT_COMPLETED]: 'payments',
      [MetricType.PAYMENT_FAILED]: 'payments',
      [MetricType.MESSAGE_SENT]: 'chat',
      [MetricType.REVIEW_CREATED]: 'reviews',
      [MetricType.CAREGIVER_APPROVED]: 'caregivers',
      [MetricType.USER_LOGIN]: 'users',
      [MetricType.NOTIFICATION_SENT]: 'notifications',
      [MetricType.FAMILY_MEMBER_ADDED]: 'family',
      [MetricType.ADDRESS_ADDED]: 'addresses',
      [MetricType.AVAILABILITY_CREATED]: 'availability',
      [MetricType.CONVERSATION_CREATED]: 'chat',
      [MetricType.WALLET_TRANSACTION]: 'payments',
    };

    return categoryMap[type] || 'general';
  }

  private getSubcategoryForMetricType(type: MetricType): string {
    const subcategoryMap: Record<MetricType, string> = {
      [MetricType.USER_REGISTRATION]: 'registration',
      [MetricType.APPOINTMENT_CREATED]: 'created',
      [MetricType.APPOINTMENT_COMPLETED]: 'completed',
      [MetricType.APPOINTMENT_CANCELLED]: 'cancelled',
      [MetricType.PAYMENT_COMPLETED]: 'completed',
      [MetricType.PAYMENT_FAILED]: 'failed',
      [MetricType.MESSAGE_SENT]: 'sent',
      [MetricType.REVIEW_CREATED]: 'created',
      [MetricType.CAREGIVER_APPROVED]: 'approved',
      [MetricType.USER_LOGIN]: 'login',
      [MetricType.NOTIFICATION_SENT]: 'sent',
      [MetricType.FAMILY_MEMBER_ADDED]: 'added',
      [MetricType.ADDRESS_ADDED]: 'added',
      [MetricType.AVAILABILITY_CREATED]: 'created',
      [MetricType.CONVERSATION_CREATED]: 'created',
      [MetricType.WALLET_TRANSACTION]: 'transaction',
    };

    return subcategoryMap[type] || 'general';
  }

  private getLabelForMetricType(type: MetricType): string {
    const labelMap: Record<MetricType, string> = {
      [MetricType.USER_REGISTRATION]: 'Registros de Usuário',
      [MetricType.APPOINTMENT_CREATED]: 'Agendamentos Criados',
      [MetricType.APPOINTMENT_COMPLETED]: 'Agendamentos Completados',
      [MetricType.APPOINTMENT_CANCELLED]: 'Agendamentos Cancelados',
      [MetricType.PAYMENT_COMPLETED]: 'Pagamentos Completados',
      [MetricType.PAYMENT_FAILED]: 'Pagamentos Falharam',
      [MetricType.MESSAGE_SENT]: 'Mensagens Enviadas',
      [MetricType.REVIEW_CREATED]: 'Avaliações Criadas',
      [MetricType.CAREGIVER_APPROVED]: 'Cuidadores Aprovados',
      [MetricType.USER_LOGIN]: 'Logins de Usuário',
      [MetricType.NOTIFICATION_SENT]: 'Notificações Enviadas',
      [MetricType.FAMILY_MEMBER_ADDED]: 'Membros da Família Adicionados',
      [MetricType.ADDRESS_ADDED]: 'Endereços Adicionados',
      [MetricType.AVAILABILITY_CREATED]: 'Disponibilidades Criadas',
      [MetricType.CONVERSATION_CREATED]: 'Conversas Criadas',
      [MetricType.WALLET_TRANSACTION]: 'Transações da Carteira',
    };

    return labelMap[type] || 'Métrica';
  }

  // DTO conversion methods
  private toWidgetResponseDto(widget: DashboardWidget): WidgetResponseDto {
    return {
      id: widget.id,
      title: widget.title,
      description: widget.description,
      type: widget.type,
      size: widget.size,
      position: widget.position,
      row: widget.row,
      column: widget.column,
      isActive: widget.isActive,
      isVisible: widget.isVisible,
      config: widget.config,
      dataSource: widget.dataSource,
      filters: widget.filters,
      refreshInterval: widget.refreshInterval,
      lastRefreshedAt: widget.lastRefreshedAt,
      category: widget.category,
      subcategory: widget.subcategory,
      permissions: widget.permissions,
      styling: widget.styling,
      createdAt: widget.createdAt,
      updatedAt: widget.updatedAt,
    };
  }

  private toMetricResponseDto(metric: DashboardMetric): MetricResponseDto {
    return {
      id: metric.id,
      type: metric.type,
      period: metric.period,
      date: metric.date,
      userId: metric.userId,
      relatedEntityId: metric.relatedEntityId,
      relatedEntityType: metric.relatedEntityType,
      value: metric.value,
      amount: metric.amount,
      currency: metric.currency,
      metadata: metric.metadata,
      userType: metric.userType,
      category: metric.category,
      subcategory: metric.subcategory,
      createdAt: metric.createdAt,
      updatedAt: metric.updatedAt,
    };
  }
}
