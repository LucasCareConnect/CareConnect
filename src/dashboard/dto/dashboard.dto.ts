import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  IsObject,
  IsArray,
  IsDateString,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { WidgetType, WidgetSize } from '../entities/dashboard-widget.entity';
import { MetricType, MetricPeriod } from '../entities/dashboard-metric.entity';

export class CreateWidgetDto {
  @ApiProperty({ description: 'Título do widget' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Descrição do widget' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: WidgetType, description: 'Tipo do widget' })
  @IsEnum(WidgetType)
  type: WidgetType;

  @ApiPropertyOptional({ enum: WidgetSize, description: 'Tamanho do widget' })
  @IsOptional()
  @IsEnum(WidgetSize)
  size?: WidgetSize;

  @ApiPropertyOptional({ description: 'Posição do widget' })
  @IsOptional()
  @IsNumber()
  position?: number;

  @ApiPropertyOptional({ description: 'Linha do widget' })
  @IsOptional()
  @IsNumber()
  row?: number;

  @ApiPropertyOptional({ description: 'Coluna do widget' })
  @IsOptional()
  @IsNumber()
  column?: number;

  @ApiPropertyOptional({ description: 'Configurações do widget' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Fonte de dados do widget' })
  @IsOptional()
  @IsObject()
  dataSource?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Filtros do widget' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Intervalo de atualização' })
  @IsOptional()
  @IsString()
  refreshInterval?: string;

  @ApiPropertyOptional({ description: 'Categoria do widget' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Subcategoria do widget' })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional({ description: 'Permissões do widget' })
  @IsOptional()
  @IsArray()
  permissions?: string[];

  @ApiPropertyOptional({ description: 'Estilos do widget' })
  @IsOptional()
  @IsObject()
  styling?: Record<string, any>;
}

export class UpdateWidgetDto {
  @ApiPropertyOptional({ description: 'Título do widget' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Descrição do widget' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ enum: WidgetSize, description: 'Tamanho do widget' })
  @IsOptional()
  @IsEnum(WidgetSize)
  size?: WidgetSize;

  @ApiPropertyOptional({ description: 'Posição do widget' })
  @IsOptional()
  @IsNumber()
  position?: number;

  @ApiPropertyOptional({ description: 'Linha do widget' })
  @IsOptional()
  @IsNumber()
  row?: number;

  @ApiPropertyOptional({ description: 'Coluna do widget' })
  @IsOptional()
  @IsNumber()
  column?: number;

  @ApiPropertyOptional({ description: 'Widget ativo' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Widget visível' })
  @IsOptional()
  @IsBoolean()
  isVisible?: boolean;

  @ApiPropertyOptional({ description: 'Configurações do widget' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Fonte de dados do widget' })
  @IsOptional()
  @IsObject()
  dataSource?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Filtros do widget' })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Intervalo de atualização' })
  @IsOptional()
  @IsString()
  refreshInterval?: string;

  @ApiPropertyOptional({ description: 'Categoria do widget' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Subcategoria do widget' })
  @IsOptional()
  @IsString()
  subcategory?: string;

  @ApiPropertyOptional({ description: 'Permissões do widget' })
  @IsOptional()
  @IsArray()
  permissions?: string[];

  @ApiPropertyOptional({ description: 'Estilos do widget' })
  @IsOptional()
  @IsObject()
  styling?: Record<string, any>;
}

export class QueryDashboardDto {
  @ApiPropertyOptional({ description: 'Categoria dos widgets' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Tipo dos widgets' })
  @IsOptional()
  @IsEnum(WidgetType)
  type?: WidgetType;

  @ApiPropertyOptional({ description: 'Apenas widgets ativos' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  activeOnly?: boolean;

  @ApiPropertyOptional({ description: 'Apenas widgets visíveis' })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  visibleOnly?: boolean;
}

export class QueryMetricsDto {
  @ApiPropertyOptional({ enum: MetricType, description: 'Tipo da métrica' })
  @IsOptional()
  @IsEnum(MetricType)
  type?: MetricType;

  @ApiPropertyOptional({
    enum: MetricPeriod,
    description: 'Período da métrica',
  })
  @IsOptional()
  @IsEnum(MetricPeriod)
  period?: MetricPeriod;

  @ApiPropertyOptional({ description: 'Data de início' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ description: 'Data de fim' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ description: 'Categoria da métrica' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Tipo de usuário' })
  @IsOptional()
  @IsString()
  userType?: string;

  @ApiPropertyOptional({ description: 'Limite de resultados', default: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  limit?: number = 100;

  @ApiPropertyOptional({ description: 'Offset dos resultados', default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  offset?: number = 0;
}

export class CreateMetricDto {
  @ApiProperty({ enum: MetricType, description: 'Tipo da métrica' })
  @IsEnum(MetricType)
  type: MetricType;

  @ApiProperty({ enum: MetricPeriod, description: 'Período da métrica' })
  @IsEnum(MetricPeriod)
  period: MetricPeriod;

  @ApiProperty({ description: 'Data da métrica' })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({ description: 'ID do usuário relacionado' })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @ApiPropertyOptional({ description: 'ID da entidade relacionada' })
  @IsOptional()
  @IsNumber()
  relatedEntityId?: number;

  @ApiPropertyOptional({ description: 'Tipo da entidade relacionada' })
  @IsOptional()
  @IsString()
  relatedEntityType?: string;

  @ApiPropertyOptional({ description: 'Valor da métrica', default: 1 })
  @IsOptional()
  @IsNumber()
  value?: number;

  @ApiPropertyOptional({ description: 'Valor monetário' })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiPropertyOptional({ description: 'Moeda' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional({ description: 'Metadados da métrica' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Tipo de usuário' })
  @IsOptional()
  @IsString()
  userType?: string;

  @ApiPropertyOptional({ description: 'Categoria da métrica' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Subcategoria da métrica' })
  @IsOptional()
  @IsString()
  subcategory?: string;
}
