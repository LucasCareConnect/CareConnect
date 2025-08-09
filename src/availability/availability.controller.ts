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
import { AvailabilityService } from './availability.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { QueryAvailabilityDto } from './dto/query-availability.dto';
import { SearchCaregiversDto } from './dto/search-caregivers.dto';
import { AvailabilityResponseDto } from './dto/availability-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enum/user-role.enum';

@ApiTags('Availability')
@Controller('availability')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.CAREGIVER)
  @ApiOperation({ summary: 'Criar nova disponibilidade (cuidador)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Disponibilidade criada com sucesso',
    type: AvailabilityResponseDto,
  })
  async create(
    @Request() req: any,
    @Body() createAvailabilityDto: CreateAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    return await this.availabilityService.create(
      req.user.id,
      createAvailabilityDto,
    );
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CAREGIVER)
  @ApiOperation({ summary: 'Listar minhas disponibilidades (cuidador)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de disponibilidades do cuidador',
  })
  async findMy(@Request() req: any, @Query() query: QueryAvailabilityDto) {
    return await this.availabilityService.findMyAvailabilities(
      req.user.id,
      query,
    );
  }

  @Get('my/active')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CAREGIVER)
  @ApiOperation({ summary: 'Listar minhas disponibilidades ativas (cuidador)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de disponibilidades ativas do cuidador',
    type: [AvailabilityResponseDto],
  })
  async findMyActive(@Request() req: any) {
    return await this.availabilityService.findActiveAvailabilities(req.user.id);
  }

  @Get('search/caregivers')
  @ApiOperation({ summary: 'Buscar cuidadores disponíveis' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de cuidadores disponíveis',
  })
  async searchCaregivers(@Query() searchDto: SearchCaregiversDto) {
    return await this.availabilityService.searchAvailableCaregivers(searchDto);
  }

  @Get('caregiver/:caregiverId')
  @ApiOperation({ summary: 'Buscar disponibilidades de um cuidador' })
  @ApiParam({ name: 'caregiverId', description: 'ID do cuidador' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de disponibilidades do cuidador',
    type: [AvailabilityResponseDto],
  })
  async findByCaregiver(
    @Param('caregiverId', ParseIntPipe) caregiverId: number,
    @Query() query: QueryAvailabilityDto,
  ) {
    return await this.availabilityService.findByCaregiverId(caregiverId, query);
  }

  @Get('date/:date')
  @ApiOperation({ summary: 'Buscar disponibilidades por data' })
  @ApiParam({ name: 'date', description: 'Data no formato YYYY-MM-DD' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de disponibilidades na data',
    type: [AvailabilityResponseDto],
  })
  async findByDate(
    @Param('date') date: string,
    @Query() query: QueryAvailabilityDto,
  ) {
    return await this.availabilityService.findByDate(new Date(date), query);
  }

  @Get('period')
  @ApiOperation({ summary: 'Buscar disponibilidades por período' })
  @ApiQuery({ name: 'startDate', description: 'Data de início (YYYY-MM-DD)' })
  @ApiQuery({ name: 'endDate', description: 'Data de fim (YYYY-MM-DD)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de disponibilidades no período',
    type: [AvailabilityResponseDto],
  })
  async findByPeriod(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @Query() query: QueryAvailabilityDto,
  ) {
    return await this.availabilityService.findByPeriod(
      new Date(startDate),
      new Date(endDate),
      query,
    );
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todas as disponibilidades (admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de todas as disponibilidades',
  })
  async findAll(@Query() query: QueryAvailabilityDto) {
    return await this.availabilityService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar disponibilidade por ID' })
  @ApiParam({ name: 'id', description: 'ID da disponibilidade' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Disponibilidade encontrada',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Disponibilidade não encontrada',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<AvailabilityResponseDto> {
    return await this.availabilityService.findById(id);
  }

  @Patch(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CAREGIVER)
  @ApiOperation({ summary: 'Atualizar disponibilidade (cuidador)' })
  @ApiParam({ name: 'id', description: 'ID da disponibilidade' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Disponibilidade atualizada com sucesso',
    type: AvailabilityResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Disponibilidade não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para atualizar esta disponibilidade',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    return await this.availabilityService.update(
      id,
      req.user.id,
      req.user.userType,
      updateAvailabilityDto,
    );
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CAREGIVER)
  @ApiOperation({ summary: 'Remover disponibilidade (cuidador)' })
  @ApiParam({ name: 'id', description: 'ID da disponibilidade' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Disponibilidade removida com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Disponibilidade não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para remover esta disponibilidade',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<void> {
    return await this.availabilityService.remove(
      id,
      req.user.id,
      req.user.userType,
    );
  }

  @Post('bulk')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CAREGIVER)
  @ApiOperation({ summary: 'Criar múltiplas disponibilidades (cuidador)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Disponibilidades criadas com sucesso',
    type: [AvailabilityResponseDto],
  })
  async createBulk(
    @Request() req: any,
    @Body() createAvailabilityDtos: CreateAvailabilityDto[],
  ): Promise<AvailabilityResponseDto[]> {
    return await this.availabilityService.createBulk(
      req.user.id,
      createAvailabilityDtos,
    );
  }

  @Patch(':id/toggle-active')
  @UseGuards(RolesGuard)
  @Roles(UserRole.CAREGIVER)
  @ApiOperation({
    summary: 'Alternar status ativo da disponibilidade (cuidador)',
  })
  @ApiParam({ name: 'id', description: 'ID da disponibilidade' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Status alterado com sucesso',
    type: AvailabilityResponseDto,
  })
  async toggleActive(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<AvailabilityResponseDto> {
    return await this.availabilityService.toggleActive(
      id,
      req.user.id,
      req.user.userType,
    );
  }
}
