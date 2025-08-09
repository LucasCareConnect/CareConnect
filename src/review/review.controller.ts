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
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReportReviewDto } from './dto/report-review.dto';
import { QueryReviewsDto } from './dto/query-reviews.dto';
import { ReviewResponseDto } from './dto/review-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enum/user-role.enum';

@ApiTags('reviews')
@Controller('reviews')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.FAMILY)
  @ApiOperation({ summary: 'Criar nova avaliação' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Avaliação criada com sucesso',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos ou agendamento não concluído',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Já existe uma avaliação para este agendamento',
  })
  async create(
    @Request() req: any,
    @Body() createReviewDto: CreateReviewDto,
  ): Promise<ReviewResponseDto> {
    return await this.reviewService.create(req.user.id, createReviewDto);
  }

  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todas as avaliações (admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de avaliações',
  })
  async findAll(@Query() query: QueryReviewsDto) {
    return await this.reviewService.findAll(query);
  }

  @Get('my')
  @UseGuards(RolesGuard)
  @Roles(UserRole.FAMILY)
  @ApiOperation({ summary: 'Listar minhas avaliações' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de avaliações do usuário',
  })
  async findMy(@Request() req: any, @Query() query: QueryReviewsDto) {
    return await this.reviewService.findByFamilyUser(req.user.id, query);
  }

  @Get('caregiver/:caregiverId')
  @ApiOperation({ summary: 'Listar avaliações de um cuidador' })
  @ApiParam({ name: 'caregiverId', description: 'ID do cuidador' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de avaliações do cuidador',
  })
  async findByCaregiver(
    @Param('caregiverId', ParseIntPipe) caregiverId: number,
    @Query() query: QueryReviewsDto,
  ) {
    return await this.reviewService.findByCaregiver(caregiverId, query);
  }

  @Get('caregiver/:caregiverId/stats')
  @ApiOperation({ summary: 'Obter estatísticas de avaliações de um cuidador' })
  @ApiParam({ name: 'caregiverId', description: 'ID do cuidador' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estatísticas de avaliações do cuidador',
  })
  async getCaregiverStats(
    @Param('caregiverId', ParseIntPipe) caregiverId: number,
  ) {
    return await this.reviewService.getCaregiverStats(caregiverId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar avaliação por ID' })
  @ApiParam({ name: 'id', description: 'ID da avaliação' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Avaliação encontrada',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Avaliação não encontrada',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ReviewResponseDto> {
    return await this.reviewService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar avaliação' })
  @ApiParam({ name: 'id', description: 'ID da avaliação' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Avaliação atualizada com sucesso',
    type: ReviewResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Avaliação não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para atualizar esta avaliação',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    return await this.reviewService.update(
      id,
      req.user.id,
      req.user.userType,
      updateReviewDto,
    );
  }

  @Patch(':id/report')
  @ApiOperation({ summary: 'Reportar avaliação' })
  @ApiParam({ name: 'id', description: 'ID da avaliação' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Avaliação reportada com sucesso',
    type: ReviewResponseDto,
  })
  async report(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() reportReviewDto: ReportReviewDto,
  ): Promise<ReviewResponseDto> {
    return await this.reviewService.report(id, req.user.id, reportReviewDto);
  }

  @Patch(':id/helpful')
  @ApiOperation({ summary: 'Marcar avaliação como útil' })
  @ApiParam({ name: 'id', description: 'ID da avaliação' })
  @ApiQuery({
    name: 'helpful',
    description: 'true para marcar como útil, false para desmarcar',
    type: 'boolean',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Avaliação marcada/desmarcada como útil',
    type: ReviewResponseDto,
  })
  async toggleHelpful(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Query('helpful') helpful: string,
  ): Promise<ReviewResponseDto> {
    const isHelpful = helpful === 'true';
    return await this.reviewService.toggleHelpful(id, req.user.id, isHelpful);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover avaliação' })
  @ApiParam({ name: 'id', description: 'ID da avaliação' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Avaliação removida com sucesso',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Avaliação não encontrada',
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Sem permissão para remover esta avaliação',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<void> {
    return await this.reviewService.remove(id, req.user.id, req.user.userType);
  }
}
