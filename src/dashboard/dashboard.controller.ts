import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { DashboardService } from './dashboard.service';
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
  DashboardResponseDto,
  ChartDataDto,
} from './dto/dashboard-response.dto';
import { UserRole } from '../user/enum/user-role.enum';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get()
  @ApiOperation({ summary: 'Obter dashboard completo do usuário' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dashboard obtido com sucesso',
    type: DashboardResponseDto,
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filtrar por categoria',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filtrar por tipo de widget',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    description: 'Apenas widgets ativos',
  })
  @ApiQuery({
    name: 'visibleOnly',
    required: false,
    description: 'Apenas widgets visíveis',
  })
  async getDashboard(
    @Request() req: any,
    @Query() query: QueryDashboardDto,
  ): Promise<DashboardResponseDto> {
    return await this.dashboardService.getDashboard(req.user.id, query);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Obter estatísticas do dashboard' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estatísticas obtidas com sucesso',
    type: DashboardStatsDto,
  })
  async getDashboardStats(@Request() req: any): Promise<DashboardStatsDto> {
    const user = req.user;
    return await this.dashboardService.getDashboardStats(
      user.id,
      user.userType,
    );
  }

  // Widget endpoints
  @Post('widgets')
  @ApiOperation({ summary: 'Criar novo widget' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Widget criado com sucesso',
    type: WidgetResponseDto,
  })
  async createWidget(
    @Request() req: any,
    @Body() createWidgetDto: CreateWidgetDto,
  ): Promise<WidgetResponseDto> {
    return await this.dashboardService.createWidget(
      req.user.id,
      createWidgetDto,
    );
  }

  @Get('widgets')
  @ApiOperation({ summary: 'Listar widgets do usuário' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Widgets listados com sucesso',
    type: [WidgetResponseDto],
  })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Filtrar por categoria',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filtrar por tipo de widget',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    description: 'Apenas widgets ativos',
  })
  @ApiQuery({
    name: 'visibleOnly',
    required: false,
    description: 'Apenas widgets visíveis',
  })
  async getMyWidgets(
    @Request() req: any,
    @Query() query: QueryDashboardDto,
  ): Promise<WidgetResponseDto[]> {
    return await this.dashboardService.getMyWidgets(req.user.id, query);
  }

  @Get('widgets/:id')
  @ApiOperation({ summary: 'Obter widget por ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Widget encontrado com sucesso',
    type: WidgetResponseDto,
  })
  @ApiParam({ name: 'id', description: 'ID do widget' })
  async getWidgetById(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WidgetResponseDto> {
    return await this.dashboardService.getWidgetById(id, req.user.id);
  }

  @Put('widgets/:id')
  @ApiOperation({ summary: 'Atualizar widget' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Widget atualizado com sucesso',
    type: WidgetResponseDto,
  })
  @ApiParam({ name: 'id', description: 'ID do widget' })
  async updateWidget(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateWidgetDto: UpdateWidgetDto,
  ): Promise<WidgetResponseDto> {
    return await this.dashboardService.updateWidget(
      id,
      req.user.id,
      updateWidgetDto,
    );
  }

  @Delete('widgets/:id')
  @ApiOperation({ summary: 'Deletar widget' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Widget deletado com sucesso',
  })
  @ApiParam({ name: 'id', description: 'ID do widget' })
  async deleteWidget(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return await this.dashboardService.deleteWidget(id, req.user.id);
  }

  @Put('widgets/positions')
  @ApiOperation({ summary: 'Atualizar posições dos widgets' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Posições atualizadas com sucesso',
  })
  async updateWidgetPositions(
    @Request() req: any,
    @Body()
    positions: Array<{
      id: number;
      position: number;
      row: number;
      column: number;
    }>,
  ): Promise<void> {
    return await this.dashboardService.updateWidgetPositions(
      req.user.id,
      positions,
    );
  }

  @Post('widgets/:id/refresh')
  @ApiOperation({ summary: 'Atualizar dados do widget' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Widget atualizado com sucesso',
    type: WidgetResponseDto,
  })
  @ApiParam({ name: 'id', description: 'ID do widget' })
  async refreshWidget(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<WidgetResponseDto> {
    return await this.dashboardService.refreshWidget(id, req.user.id);
  }

  // Metric endpoints
  @Post('metrics')
  @ApiOperation({ summary: 'Criar nova métrica' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Métrica criada com sucesso',
    type: MetricResponseDto,
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async createMetric(
    @Body() createMetricDto: CreateMetricDto,
  ): Promise<MetricResponseDto> {
    return await this.dashboardService.createMetric(createMetricDto);
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Listar métricas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Métricas listadas com sucesso',
    type: [MetricResponseDto],
  })
  @ApiQuery({ name: 'type', required: false, description: 'Tipo da métrica' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Período da métrica',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Data de início',
  })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data de fim' })
  @ApiQuery({
    name: 'category',
    required: false,
    description: 'Categoria da métrica',
  })
  @ApiQuery({
    name: 'userType',
    required: false,
    description: 'Tipo de usuário',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Limite de resultados',
  })
  @ApiQuery({
    name: 'offset',
    required: false,
    description: 'Offset dos resultados',
  })
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  async getMetrics(
    @Query() query: QueryMetricsDto,
  ): Promise<MetricResponseDto[]> {
    return await this.dashboardService.getMetrics(query);
  }

  // Chart data endpoints
  @Get('charts/:type')
  @ApiOperation({ summary: 'Obter dados para gráfico' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dados do gráfico obtidos com sucesso',
    type: ChartDataDto,
  })
  @ApiParam({
    name: 'type',
    description: 'Tipo do gráfico (line, bar, pie, doughnut)',
  })
  @ApiQuery({ name: 'metric', required: false, description: 'Tipo da métrica' })
  @ApiQuery({
    name: 'period',
    required: false,
    description: 'Período da métrica',
  })
  @ApiQuery({ name: 'days', required: false, description: 'Número de dias' })
  async getChartData(
    @Request() req: any,
    @Param('type') chartType: string,
    @Query('metric') metricType?: string,
    @Query('period') period?: string,
    @Query('days') days?: string,
  ): Promise<ChartDataDto> {
    // Simular widget para obter dados do gráfico
    const mockWidget: WidgetResponseDto = {
      id: 0,
      title: 'Chart',
      type: chartType as any,
      size: 'medium' as any,
      position: 0,
      row: 0,
      column: 0,
      isActive: true,
      isVisible: true,
      dataSource: {
        metricType,
        period: period || 'daily',
        days: days ? parseInt(days) : 30,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const widgetData = await this.dashboardService.getWidgetData(
      [mockWidget],
      req.user.id,
    );
    return widgetData[0]?.data || { labels: [], datasets: [] };
  }

  // Reports endpoints
  @Get('reports')
  @ApiOperation({ summary: 'Listar relatórios disponíveis' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Relatórios listados com sucesso',
  })
  async getAvailableReports(@Request() req: any): Promise<any[]> {
    // Implementar lista de relatórios disponíveis
    return [
      {
        id: 'appointments-summary',
        title: 'Resumo de Agendamentos',
        description: 'Relatório detalhado dos agendamentos do período',
        type: 'summary',
        category: 'appointments',
      },
      {
        id: 'payments-summary',
        title: 'Resumo de Pagamentos',
        description: 'Relatório financeiro do período',
        type: 'summary',
        category: 'payments',
      },
      {
        id: 'user-activity',
        title: 'Atividade dos Usuários',
        description: 'Relatório de atividade e engajamento',
        type: 'activity',
        category: 'users',
      },
    ];
  }

  @Get('reports/:id')
  @ApiOperation({ summary: 'Gerar relatório específico' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Relatório gerado com sucesso',
  })
  @ApiParam({ name: 'id', description: 'ID do relatório' })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Data de início',
  })
  @ApiQuery({ name: 'endDate', required: false, description: 'Data de fim' })
  @ApiQuery({
    name: 'format',
    required: false,
    description: 'Formato do relatório (json, csv, pdf)',
  })
  async generateReport(
    @Request() req: any,
    @Param('id') reportId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('format') format?: string,
  ): Promise<any> {
    // Implementar geração de relatórios
    return {
      id: reportId,
      title: 'Relatório Gerado',
      description: 'Relatório gerado com sucesso',
      type: 'generated',
      period: `${startDate} - ${endDate}`,
      data: {
        message: 'Report generation not implemented yet',
        parameters: { reportId, startDate, endDate, format },
      },
      generatedAt: new Date(),
      userId: req.user.id,
    };
  }
}
