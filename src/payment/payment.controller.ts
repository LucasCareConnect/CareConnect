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
import { PaymentService } from './payment.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { QueryPaymentsDto } from './dto/query-payments.dto';
import {
  RefundPaymentDto,
  CreateWalletTransactionDto,
} from './dto/refund-payment.dto';
import {
  PaymentResponseDto,
  WalletResponseDto,
  WalletTransactionResponseDto,
} from './dto/payment-response.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enum/user-role.enum';
import { Currency } from './entities/payment.entity';

@ApiTags('payments')
@Controller('payments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN, UserRole.FAMILY, UserRole.CAREGIVER)
  @ApiOperation({ summary: 'Criar novo pagamento' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Pagamento criado com sucesso',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Dados inválidos',
  })
  async create(
    @Body() createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return await this.paymentService.create(createPaymentDto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Listar meus pagamentos' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de pagamentos do usuário',
  })
  async findMy(@Request() req: any, @Query() query: QueryPaymentsDto) {
    return await this.paymentService.findMyPayments(req.user.id, query);
  }

  @Get('my/stats')
  @ApiOperation({ summary: 'Estatísticas dos meus pagamentos' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estatísticas dos pagamentos',
  })
  async getMyStats(@Request() req: any) {
    return await this.paymentService.getStats(req.user.id);
  }

  // Endpoints para carteira
  @Get('wallet')
  @ApiOperation({ summary: 'Obter minha carteira' })
  @ApiQuery({ name: 'currency', enum: Currency, required: false })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Dados da carteira do usuário',
    type: WalletResponseDto,
  })
  async getMyWallet(
    @Request() req: any,
    @Query('currency') currency?: Currency,
  ) {
    return await this.paymentService.getOrCreateWallet(req.user.id, currency);
  }

  @Get('wallet/stats')
  @ApiOperation({ summary: 'Estatísticas da minha carteira' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estatísticas da carteira',
  })
  async getMyWalletStats(@Request() req: any) {
    return await this.paymentService.getWalletStats(req.user.id);
  }

  @Get('wallet/transactions')
  @ApiOperation({ summary: 'Listar transações da minha carteira' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de transações da carteira',
  })
  async getMyWalletTransactions(
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.paymentService.findWalletTransactions(
      req.user.id,
      page || 1,
      limit || 10,
    );
  }

  @Post('wallet/transactions')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Criar transação na carteira (admin)' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Transação criada com sucesso',
    type: WalletTransactionResponseDto,
  })
  async createWalletTransaction(
    @Body() createTransactionDto: CreateWalletTransactionDto,
  ) {
    return await this.paymentService.createWalletTransaction(
      createTransactionDto,
    );
  }

  // Endpoints administrativos
  @Get()
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Listar todos os pagamentos (admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Lista de todos os pagamentos',
  })
  async findAll(@Query() query: QueryPaymentsDto) {
    return await this.paymentService.findAll(query);
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiOperation({ summary: 'Estatísticas gerais de pagamentos (admin)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estatísticas gerais dos pagamentos',
  })
  async getStats() {
    return await this.paymentService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar pagamento por ID' })
  @ApiParam({ name: 'id', description: 'ID do pagamento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pagamento encontrado',
    type: PaymentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Pagamento não encontrado',
  })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<PaymentResponseDto> {
    return await this.paymentService.findById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar pagamento' })
  @ApiParam({ name: 'id', description: 'ID do pagamento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Pagamento atualizado com sucesso',
    type: PaymentResponseDto,
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    return await this.paymentService.update(
      id,
      req.user.id,
      req.user.userType,
      updatePaymentDto,
    );
  }

  @Post(':id/refund')
  @ApiOperation({ summary: 'Estornar pagamento' })
  @ApiParam({ name: 'id', description: 'ID do pagamento' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Estorno processado com sucesso',
    type: PaymentResponseDto,
  })
  async refund(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
    @Body() refundDto: RefundPaymentDto,
  ): Promise<PaymentResponseDto> {
    return await this.paymentService.refund(
      id,
      req.user.id,
      req.user.userType,
      refundDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remover pagamento' })
  @ApiParam({ name: 'id', description: 'ID do pagamento' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Pagamento removido com sucesso',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req: any,
  ): Promise<void> {
    return await this.paymentService.remove(id, req.user.id, req.user.userType);
  }
}
