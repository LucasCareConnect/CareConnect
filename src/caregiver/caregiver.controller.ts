import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { CaregiverService } from './caregiver.service';
import { CreateCaregiverDto } from './dto/create-caregiver.dto';
import { UpdateCaregiverDto } from './dto/update-caregiver.dto';
import { QueryCaregiversDto } from './dto/query-caregivers.dto';
import { CaregiverResponseDto } from './dto/caregiver-response.dto';
import type { PaginatedCaregivers } from './interfaces/paginated-caregivers.interface';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enum/user-role.enum';

@ApiTags('Caregivers')
@Controller('caregivers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class CaregiverController {
  constructor(private readonly caregiverService: CaregiverService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo perfil de cuidador' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Perfil de cuidador criado com sucesso',
    type: CaregiverResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou usuário não é do tipo CAREGIVER',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Já existe um perfil de cuidador para este usuário',
  })
  create(
    @Body() createCaregiverDto: CreateCaregiverDto,
  ): Promise<CaregiverResponseDto> {
    return this.caregiverService.create(createCaregiverDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cuidadores com filtros' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de cuidadores retornada com sucesso',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Busca por nome, bio ou especialidades',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filtrar por status',
  })
  @ApiQuery({
    name: 'experienceLevel',
    required: false,
    description: 'Filtrar por nível de experiência',
  })
  @ApiQuery({
    name: 'isAvailable',
    required: false,
    description: 'Filtrar apenas disponíveis',
  })
  @ApiQuery({
    name: 'minHourlyRate',
    required: false,
    description: 'Valor mínimo por hora',
  })
  @ApiQuery({
    name: 'maxHourlyRate',
    required: false,
    description: 'Valor máximo por hora',
  })
  @ApiQuery({
    name: 'minRating',
    required: false,
    description: 'Avaliação mínima',
  })
  @ApiQuery({
    name: 'backgroundCheck',
    required: false,
    description: 'Com verificação de antecedentes',
  })
  @ApiQuery({
    name: 'specialty',
    required: false,
    description: 'Especialidade específica',
  })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    description: 'Campo para ordenação',
  })
  @ApiQuery({
    name: 'sortOrder',
    required: false,
    description: 'Direção da ordenação',
  })
  @ApiQuery({ name: 'page', required: false, description: 'Número da página' })
  @ApiQuery({ name: 'limit', required: false, description: 'Itens por página' })
  async findAll(
    @Query() query: QueryCaregiversDto,
  ): Promise<PaginatedCaregivers> {
    return this.caregiverService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar cuidador por ID' })
  @ApiParam({ name: 'id', description: 'ID do cuidador' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cuidador encontrado',
    type: CaregiverResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cuidador não encontrado',
  })
  findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CaregiverResponseDto> {
    return this.caregiverService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Buscar cuidador por ID do usuário' })
  @ApiParam({ name: 'userId', description: 'ID do usuário' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cuidador encontrado',
    type: CaregiverResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Perfil de cuidador não encontrado para este usuário',
  })
  findByUserId(
    @Param('userId', ParseIntPipe) userId: number,
  ): Promise<CaregiverResponseDto> {
    return this.caregiverService.findByUserId(userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar perfil de cuidador' })
  @ApiParam({ name: 'id', description: 'ID do cuidador' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cuidador atualizado com sucesso',
    type: CaregiverResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cuidador não encontrado',
  })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCaregiverDto: UpdateCaregiverDto,
  ): Promise<CaregiverResponseDto> {
    return this.caregiverService.update(id, updateCaregiverDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CAREGIVER)
  @ApiOperation({ summary: 'Remover perfil de cuidador' })
  @ApiParam({ name: 'id', description: 'ID do cuidador' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Cuidador removido com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cuidador não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado',
  })
  remove(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.caregiverService.remove(id);
  }

  @Patch(':id/approve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN) // Apenas admins podem aprovar
  @ApiOperation({ summary: 'Aprovar cuidador (Admin)' })
  @ApiParam({ name: 'id', description: 'ID do cuidador' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cuidador aprovado com sucesso',
    type: CaregiverResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cuidador não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado - apenas administradores',
  })
  approve(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CaregiverResponseDto> {
    return this.caregiverService.approve(id);
  }

  @Patch(':id/suspend')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN) // Apenas admins podem suspender
  @ApiOperation({ summary: 'Suspender cuidador (Admin)' })
  @ApiParam({ name: 'id', description: 'ID do cuidador' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cuidador suspenso com sucesso',
    type: CaregiverResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cuidador não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado - apenas administradores',
  })
  suspend(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CaregiverResponseDto> {
    return this.caregiverService.suspend(id);
  }

  @Patch(':id/reactivate')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN) // Apenas admins podem reativar
  @ApiOperation({ summary: 'Reativar cuidador (Admin)' })
  @ApiParam({ name: 'id', description: 'ID do cuidador' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cuidador reativado com sucesso',
    type: CaregiverResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Cuidador não encontrado',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Acesso negado - apenas administradores',
  })
  reactivate(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<CaregiverResponseDto> {
    return this.caregiverService.reactivate(id);
  }

  @Get('specialty/:specialty')
  @ApiOperation({ summary: 'Buscar cuidadores por especialidade' })
  @ApiParam({ name: 'specialty', description: 'Nome da especialidade' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Cuidadores encontrados',
    type: [CaregiverResponseDto],
  })
  findBySpecialty(
    @Param('specialty') specialty: string,
  ): Promise<CaregiverResponseDto[]> {
    return this.caregiverService.findBySpecialty(specialty);
  }
}
