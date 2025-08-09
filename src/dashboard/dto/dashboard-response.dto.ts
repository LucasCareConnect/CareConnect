import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WidgetType, WidgetSize } from '../entities/dashboard-widget.entity';
import { MetricType, MetricPeriod } from '../entities/dashboard-metric.entity';

export class WidgetResponseDto {
  @ApiProperty({ description: 'ID do widget' })
  id: number;

  @ApiProperty({ description: 'Título do widget' })
  title: string;

  @ApiPropertyOptional({ description: 'Descrição do widget' })
  description?: string;

  @ApiProperty({ enum: WidgetType, description: 'Tipo do widget' })
  type: WidgetType;

  @ApiProperty({ enum: WidgetSize, description: 'Tamanho do widget' })
  size: WidgetSize;

  @ApiProperty({ description: 'Posição do widget' })
  position: number;

  @ApiProperty({ description: 'Linha do widget' })
  row: number;

  @ApiProperty({ description: 'Coluna do widget' })
  column: number;

  @ApiProperty({ description: 'Widget ativo' })
  isActive: boolean;

  @ApiProperty({ description: 'Widget visível' })
  isVisible: boolean;

  @ApiPropertyOptional({ description: 'Configurações do widget' })
  config?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Fonte de dados do widget' })
  dataSource?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Filtros do widget' })
  filters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Intervalo de atualização' })
  refreshInterval?: string;

  @ApiPropertyOptional({ description: 'Última atualização' })
  lastRefreshedAt?: Date;

  @ApiPropertyOptional({ description: 'Categoria do widget' })
  category?: string;

  @ApiPropertyOptional({ description: 'Subcategoria do widget' })
  subcategory?: string;

  @ApiPropertyOptional({ description: 'Permissões do widget' })
  permissions?: string[];

  @ApiPropertyOptional({ description: 'Estilos do widget' })
  styling?: Record<string, any>;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}

export class MetricResponseDto {
  @ApiProperty({ description: 'ID da métrica' })
  id: number;

  @ApiProperty({ enum: MetricType, description: 'Tipo da métrica' })
  type: MetricType;

  @ApiProperty({ enum: MetricPeriod, description: 'Período da métrica' })
  period: MetricPeriod;

  @ApiProperty({ description: 'Data da métrica' })
  date: Date;

  @ApiPropertyOptional({ description: 'ID do usuário relacionado' })
  userId?: number;

  @ApiPropertyOptional({ description: 'ID da entidade relacionada' })
  relatedEntityId?: number;

  @ApiPropertyOptional({ description: 'Tipo da entidade relacionada' })
  relatedEntityType?: string;

  @ApiProperty({ description: 'Valor da métrica' })
  value: number;

  @ApiPropertyOptional({ description: 'Valor monetário' })
  amount?: number;

  @ApiPropertyOptional({ description: 'Moeda' })
  currency?: string;

  @ApiPropertyOptional({ description: 'Metadados da métrica' })
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Tipo de usuário' })
  userType?: string;

  @ApiPropertyOptional({ description: 'Categoria da métrica' })
  category?: string;

  @ApiPropertyOptional({ description: 'Subcategoria da métrica' })
  subcategory?: string;

  @ApiProperty({ description: 'Data de criação' })
  createdAt: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updatedAt: Date;
}

export class DashboardStatsDto {
  @ApiProperty({ description: 'Total de usuários' })
  totalUsers: number;

  @ApiProperty({ description: 'Usuários ativos (últimos 30 dias)' })
  activeUsers: number;

  @ApiProperty({ description: 'Novos usuários (últimos 30 dias)' })
  newUsers: number;

  @ApiProperty({ description: 'Total de cuidadores' })
  totalCaregivers: number;

  @ApiProperty({ description: 'Cuidadores ativos' })
  activeCaregivers: number;

  @ApiProperty({ description: 'Total de agendamentos' })
  totalAppointments: number;

  @ApiProperty({ description: 'Agendamentos pendentes' })
  pendingAppointments: number;

  @ApiProperty({ description: 'Agendamentos confirmados' })
  confirmedAppointments: number;

  @ApiProperty({ description: 'Agendamentos completados' })
  completedAppointments: number;

  @ApiProperty({ description: 'Total de pagamentos' })
  totalPayments: number;

  @ApiProperty({ description: 'Valor total de pagamentos' })
  totalPaymentAmount: number;

  @ApiProperty({ description: 'Pagamentos completados' })
  completedPayments: number;

  @ApiProperty({ description: 'Total de mensagens' })
  totalMessages: number;

  @ApiProperty({ description: 'Conversas ativas' })
  activeConversations: number;

  @ApiProperty({ description: 'Total de notificações' })
  totalNotifications: number;

  @ApiProperty({ description: 'Notificações não lidas' })
  unreadNotifications: number;

  @ApiProperty({ description: 'Total de avaliações' })
  totalReviews: number;

  @ApiProperty({ description: 'Avaliação média' })
  averageRating: number;
}

export class ChartDataDto {
  @ApiProperty({ description: 'Rótulos do gráfico' })
  labels: string[];

  @ApiProperty({ description: 'Conjuntos de dados' })
  datasets: ChartDatasetDto[];
}

export class ChartDatasetDto {
  @ApiProperty({ description: 'Rótulo do conjunto de dados' })
  label: string;

  @ApiProperty({ description: 'Dados do conjunto' })
  data: number[];

  @ApiPropertyOptional({ description: 'Cor de fundo' })
  backgroundColor?: string | string[];

  @ApiPropertyOptional({ description: 'Cor da borda' })
  borderColor?: string | string[];

  @ApiPropertyOptional({ description: 'Largura da borda' })
  borderWidth?: number;

  @ApiPropertyOptional({ description: 'Preenchimento' })
  fill?: boolean;

  @ApiPropertyOptional({ description: 'Tensão da linha' })
  tension?: number;
}

export class WidgetDataDto {
  @ApiProperty({ description: 'ID do widget' })
  widgetId: number;

  @ApiProperty({ description: 'Tipo do widget' })
  type: WidgetType;

  @ApiProperty({ description: 'Dados do widget' })
  data: any;

  @ApiProperty({ description: 'Timestamp dos dados' })
  timestamp: Date;

  @ApiPropertyOptional({ description: 'Metadados dos dados' })
  metadata?: Record<string, any>;
}

export class DashboardResponseDto {
  @ApiProperty({
    description: 'Widgets do dashboard',
    type: [WidgetResponseDto],
  })
  widgets: WidgetResponseDto[];

  @ApiProperty({ description: 'Estatísticas gerais' })
  stats: DashboardStatsDto;

  @ApiProperty({ description: 'Dados dos widgets' })
  widgetData: WidgetDataDto[];

  @ApiProperty({ description: 'Última atualização' })
  lastUpdated: Date;
}

export class ReportDto {
  @ApiProperty({ description: 'ID do relatório' })
  id: string;

  @ApiProperty({ description: 'Título do relatório' })
  title: string;

  @ApiProperty({ description: 'Descrição do relatório' })
  description: string;

  @ApiProperty({ description: 'Tipo do relatório' })
  type: string;

  @ApiProperty({ description: 'Período do relatório' })
  period: string;

  @ApiProperty({ description: 'Dados do relatório' })
  data: any;

  @ApiProperty({ description: 'Data de geração' })
  generatedAt: Date;

  @ApiPropertyOptional({ description: 'Filtros aplicados' })
  filters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Metadados do relatório' })
  metadata?: Record<string, any>;
}
