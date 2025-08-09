import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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
import { NotificationService } from './notification.service';
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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enum/user-role.enum';
import {
  NotificationType,
  NotificationChannel,
} from './entities/notification.entity';

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar nova notificação (admin)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Notificação criada com sucesso',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  async create(
    @Body() createNotificationDto: CreateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return await this.notificationService.create(createNotificationDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Listar minhas notificações' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de notificações do usuário',
  })
  async findMy(@Request() req: any, @Query() query: QueryNotificationsDto) {
    return await this.notificationService.findMyNotifications(
      req.user.id,
      query,
    );
  }

  @Get('my/stats')
  @ApiOperation({ summary: 'Estatísticas das minhas notificações' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estatísticas das notificações',
  })
  async getMyStats(@Request() req: any) {
    return await this.notificationService.getStats(req.user.id);
  }

  @Get('my/unread-count')
  @ApiOperation({ summary: 'Contagem de notificações não lidas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Número de notificações não lidas',
  })
  async getUnreadCount(@Request() req: any) {
    const count = await this.notificationService.getUnreadCount(req.user.id);
    return { count };
  }

  @Patch('my/mark-all-read')
  @ApiOperation({ summary: 'Marcar todas as notificações como lidas' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Todas as notificações marcadas como lidas',
  })
  async markAllAsRead(@Request() req: any) {
    await this.notificationService.markAllAsRead(req.user.id);
    return { message: 'Todas as notificações foram marcadas como lidas' };
  }

  // Endpoints para preferências
  @Get('preferences')
  @ApiOperation({ summary: 'Listar minhas preferências de notificação' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de preferências do usuário',
    type: [NotificationPreferenceResponseDto],
  })
  async getPreferences(@Request() req: any) {
    return await this.notificationService.findPreferences(req.user.id);
  }

  @Get('preferences/defaults')
  @ApiOperation({ summary: 'Obter preferências padrão' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Preferências padrão do sistema',
  })
  async getDefaultPreferences() {
    return await this.notificationService.getDefaultPreferences();
  }

  @Post('preferences')
  @ApiOperation({ summary: 'Criar preferência de notificação' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Preferência criada com sucesso',
    type: NotificationPreferenceResponseDto,
  })
  async createPreference(
    @Request() req: any,
    @Body() createPreferenceDto: CreateNotificationPreferenceDto,
  ) {
    return await this.notificationService.createPreference(
      req.user.id,
      createPreferenceDto,
    );
  }

  @Patch('preferences/bulk')
  @ApiOperation({ summary: 'Atualizar múltiplas preferências' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Preferências atualizadas com sucesso',
    type: [NotificationPreferenceResponseDto],
  })
  async bulkUpdatePreferences(
    @Request() req: any,
    @Body() bulkUpdateDto: BulkUpdatePreferencesDto,
  ) {
    return await this.notificationService.bulkUpdatePreferences(
      req.user.id,
      bulkUpdateDto,
    );
  }

  @Patch('preferences/:type/:channel')
  @ApiOperation({ summary: 'Atualizar preferência específica' })
  @ApiParam({ name: 'type', enum: NotificationType })
  @ApiParam({ name: 'channel', enum: NotificationChannel })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Preferência atualizada com sucesso',
    type: NotificationPreferenceResponseDto,
  })
  async updatePreference(
    @Request() req: any,
    @Param('type') type: NotificationType,
    @Param('channel') channel: NotificationChannel,
    @Body() updatePreferenceDto: UpdateNotificationPreferenceDto,
  ) {
    return await this.notificationService.updatePreference(
      req.user.id,
      type,
      channel,
      updatePreferenceDto,
    );
  }

  @Delete('preferences/:type/:channel')
  @ApiOperation({ summary: 'Remover preferência específica' })
  @ApiParam({ name: 'type', enum: NotificationType })
  @ApiParam({ name: 'channel', enum: NotificationChannel })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Preferência removida com sucesso',
  })
  async removePreference(
    @Request() req: any,
    @Param('type') type: NotificationType,
    @Param('channel') channel: NotificationChannel,
  ) {
    await this.notificationService.removePreference(req.user.id, type, channel);
    return { message: 'Preferência removida com sucesso' };
  }

  // Endpoints administrativos
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todas as notificações (admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de todas as notificações',
  })
  async findAll(@Query() query: QueryNotificationsDto) {
    return await this.notificationService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar notificação por ID' })
  @ApiParam({ name: 'id', description: 'ID da notificação' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificação encontrada',
    type: NotificationResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Notificação não encontrada',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<NotificationResponseDto> {
    return await this.notificationService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar notificação' })
  @ApiParam({ name: 'id', description: 'ID da notificação' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificação atualizada com sucesso',
    type: NotificationResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() updateNotificationDto: UpdateNotificationDto,
  ): Promise<NotificationResponseDto> {
    return await this.notificationService.update(
      id,
      req.user.id,
      req.user.userType,
      updateNotificationDto,
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Marcar notificação como lida' })
  @ApiParam({ name: 'id', description: 'ID da notificação' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificação marcada como lida',
    type: NotificationResponseDto,
  })
  async markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<NotificationResponseDto> {
    return await this.notificationService.markAsRead(
      id,
      req.user.id,
      req.user.userType,
    );
  }

  @Patch(':id/archive')
  @ApiOperation({ summary: 'Arquivar notificação' })
  @ApiParam({ name: 'id', description: 'ID da notificação' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Notificação arquivada com sucesso',
    type: NotificationResponseDto,
  })
  async archive(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<NotificationResponseDto> {
    return await this.notificationService.archive(
      id,
      req.user.id,
      req.user.userType,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover notificação' })
  @ApiParam({ name: 'id', description: 'ID da notificação' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Notificação removida com sucesso',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<void> {
    return await this.notificationService.remove(
      id,
      req.user.id,
      req.user.userType,
    );
  }
}
