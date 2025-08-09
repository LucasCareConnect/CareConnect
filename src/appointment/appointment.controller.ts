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
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { QueryAppointmentsDto } from './dto/query-appointments.dto';
import { AppointmentResponseDto } from './dto/appointment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enum/user-role.enum';

@ApiTags('appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.FAMILY)
  @ApiOperation({ summary: 'Criar novo agendamento' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Agendamento criado com sucesso',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Conflito de horário',
  })
  async create(
    @Request() req: any,
    @Body() createAppointmentDto: CreateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return await this.appointmentService.create(
      req.user.id,
      createAppointmentDto,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos os agendamentos (admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de agendamentos',
  })
  async findAll(@Query() query: QueryAppointmentsDto) {
    return await this.appointmentService.findAll(query);
  }

  @Get('my')
  @ApiOperation({ summary: 'Listar meus agendamentos' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de agendamentos do usuário',
  })
  async findMy(@Request() req: any, @Query() query: QueryAppointmentsDto) {
    if (req.user.userType === UserRole.FAMILY) {
      return await this.appointmentService.findByFamilyUser(req.user.id, query);
    } else if (req.user.userType === UserRole.CAREGIVER) {
      // Buscar o ID do cuidador baseado no userId
      const caregiver = await this.appointmentService[
        'caregiverService'
      ].findByUserId(req.user.id);
      if (!caregiver) {
        return {
          data: [],
          total: 0,
          page: query.page,
          limit: query.limit,
          totalPages: 0,
        };
      }
      return await this.appointmentService.findByCaregiver(caregiver.id, query);
    }
    return {
      data: [],
      total: 0,
      page: query.page,
      limit: query.limit,
      totalPages: 0,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar agendamento por ID' })
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Agendamento encontrado',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Agendamento não encontrado',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AppointmentResponseDto> {
    return await this.appointmentService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar agendamento' })
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Agendamento atualizado com sucesso',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Agendamento não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para atualizar este agendamento',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return await this.appointmentService.update(
      id,
      req.user.id,
      req.user.userType,
      updateAppointmentDto,
    );
  }

  @Patch(':id/confirm')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CAREGIVER)
  @ApiOperation({ summary: 'Confirmar agendamento (apenas cuidador)' })
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Agendamento confirmado com sucesso',
    type: AppointmentResponseDto,
  })
  async confirm(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<AppointmentResponseDto> {
    return await this.appointmentService.confirm(id, req.user.id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancelar agendamento' })
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiQuery({
    name: 'reason',
    description: 'Motivo do cancelamento',
    required: false,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Agendamento cancelado com sucesso',
    type: AppointmentResponseDto,
  })
  async cancel(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Query('reason') reason?: string,
  ): Promise<AppointmentResponseDto> {
    return await this.appointmentService.cancel(
      id,
      req.user.id,
      req.user.userType,
      reason,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover agendamento' })
  @ApiParam({ name: 'id', description: 'ID do agendamento' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Agendamento removido com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Agendamento não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para remover este agendamento',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<void> {
    return await this.appointmentService.remove(
      id,
      req.user.id,
      req.user.userType,
    );
  }
}
