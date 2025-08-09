import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PaymentRepository } from './payment.repository';
import { UserService } from '../user/user.service';
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
import {
  PaginatedPayments,
  PaginatedWalletTransactions,
  PaymentStats,
  WalletStats,
} from './interfaces/paginated-payments.interface';
import { Payment, PaymentStatus, Currency } from './entities/payment.entity';
import { Wallet, WalletStatus } from './entities/wallet.entity';
import {
  WalletTransaction,
  TransactionType,
  TransactionStatus,
} from './entities/wallet-transaction.entity';
import { UserRole } from '../user/enum/user-role.enum';

@Injectable()
export class PaymentService {
  constructor(
    private readonly paymentRepository: PaymentRepository,
    private readonly userService: UserService,
  ) {}

  /**
   * Cria um novo pagamento
   */
  async create(
    createPaymentDto: CreatePaymentDto,
  ): Promise<PaymentResponseDto> {
    // Verificar se o usuário existe
    const user = await this.userService.findById(createPaymentDto.userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // Verificar se o recebedor existe (se fornecido)
    if (createPaymentDto.recipientId) {
      const recipient = await this.userService.findById(
        createPaymentDto.recipientId,
      );
      if (!recipient) {
        throw new NotFoundException('Usuário recebedor não encontrado');
      }
    }

    // Calcular valor líquido
    const netAmount =
      createPaymentDto.amount -
      (createPaymentDto.platformFee || 0) -
      (createPaymentDto.gatewayFee || 0);

    if (netAmount <= 0) {
      throw new BadRequestException('Valor líquido deve ser maior que zero');
    }

    const paymentData = {
      userId: createPaymentDto.userId,
      recipientId: createPaymentDto.recipientId,
      appointmentId: createPaymentDto.appointmentId,
      type: createPaymentDto.type,
      method: createPaymentDto.method,
      status: PaymentStatus.PENDING,
      amount: createPaymentDto.amount,
      currency: createPaymentDto.currency || Currency.BRL,
      platformFee: createPaymentDto.platformFee || 0,
      gatewayFee: createPaymentDto.gatewayFee || 0,
      netAmount,
      description: createPaymentDto.description,
      paymentData: createPaymentDto.paymentData,
      dueDate: createPaymentDto.dueDate
        ? new Date(createPaymentDto.dueDate)
        : undefined,
      expiresAt: createPaymentDto.expiresAt
        ? new Date(createPaymentDto.expiresAt)
        : undefined,
      metadata: createPaymentDto.metadata,
      refundedAmount: 0,
    };

    const payment = await this.paymentRepository.createPayment(paymentData);
    return this.toPaymentResponseDto(payment);
  }

  /**
   * Busca pagamento por ID
   */
  async findById(id: number): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findPaymentById(id);
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }
    return this.toPaymentResponseDto(payment);
  }

  /**
   * Busca pagamentos do usuário
   */
  async findByUser(
    userId: number,
    query: QueryPaymentsDto,
  ): Promise<PaginatedPayments> {
    const { payments, total } = await this.paymentRepository.findPaymentsByUser(
      userId,
      query,
    );

    return {
      data: payments.map((payment) => this.toPaymentResponseDto(payment)),
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
    };
  }

  /**
   * Busca pagamentos do usuário logado
   */
  async findMyPayments(
    userId: number,
    query: QueryPaymentsDto,
  ): Promise<PaginatedPayments> {
    return await this.findByUser(userId, query);
  }

  /**
   * Busca todos os pagamentos (admin)
   */
  async findAll(query: QueryPaymentsDto): Promise<PaginatedPayments> {
    const { payments, total } =
      await this.paymentRepository.findPaymentsWithFilters(query);

    return {
      data: payments.map((payment) => this.toPaymentResponseDto(payment)),
      total,
      page: query.page || 1,
      limit: query.limit || 10,
      totalPages: Math.ceil(total / (query.limit || 10)),
    };
  }

  /**
   * Atualiza um pagamento
   */
  async update(
    id: number,
    userId: number,
    userRole: UserRole,
    updatePaymentDto: UpdatePaymentDto,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findPaymentById(id);
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    // Verificar permissões
    if (userRole !== UserRole.ADMIN && payment.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para atualizar este pagamento',
      );
    }

    const updateData: Partial<Payment> = {
      ...updatePaymentDto,
      dueDate: updatePaymentDto.dueDate
        ? new Date(updatePaymentDto.dueDate)
        : undefined,
      expiresAt: updatePaymentDto.expiresAt
        ? new Date(updatePaymentDto.expiresAt)
        : undefined,
      processedAt: updatePaymentDto.processedAt
        ? new Date(updatePaymentDto.processedAt)
        : undefined,
    };

    // Recalcular valor líquido se necessário
    if (
      updatePaymentDto.amount ||
      updatePaymentDto.platformFee ||
      updatePaymentDto.gatewayFee
    ) {
      const amount = updatePaymentDto.amount || payment.amount;
      const platformFee =
        updatePaymentDto.platformFee !== undefined
          ? updatePaymentDto.platformFee
          : payment.platformFee;
      const gatewayFee =
        updatePaymentDto.gatewayFee !== undefined
          ? updatePaymentDto.gatewayFee
          : payment.gatewayFee;

      updateData.netAmount =
        Number(amount) - Number(platformFee) - Number(gatewayFee);
    }

    const updatedPayment = await this.paymentRepository.updatePayment(
      id,
      updateData,
    );
    if (!updatedPayment) {
      throw new NotFoundException('Erro ao atualizar pagamento');
    }

    return this.toPaymentResponseDto(updatedPayment);
  }

  /**
   * Remove um pagamento
   */
  async remove(id: number, userId: number, userRole: UserRole): Promise<void> {
    const payment = await this.paymentRepository.findPaymentById(id);
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    // Verificar permissões
    if (userRole !== UserRole.ADMIN && payment.userId !== userId) {
      throw new ForbiddenException(
        'Você não tem permissão para remover este pagamento',
      );
    }

    // Não permitir remoção de pagamentos processados
    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException(
        'Não é possível remover um pagamento já processado',
      );
    }

    await this.paymentRepository.deletePayment(id);
  }

  /**
   * Processa estorno de pagamento
   */
  async refund(
    id: number,
    userId: number,
    userRole: UserRole,
    refundDto: RefundPaymentDto,
  ): Promise<PaymentResponseDto> {
    const payment = await this.paymentRepository.findPaymentById(id);
    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    // Verificar permissões
    if (
      userRole !== UserRole.ADMIN &&
      payment.userId !== userId &&
      payment.recipientId !== userId
    ) {
      throw new ForbiddenException(
        'Você não tem permissão para estornar este pagamento',
      );
    }

    // Verificar se pode ser estornado
    if (!payment.canRefund) {
      throw new BadRequestException('Este pagamento não pode ser estornado');
    }

    // Verificar valor do estorno
    if (refundDto.amount > payment.availableRefundAmount) {
      throw new BadRequestException(
        'Valor do estorno excede o valor disponível',
      );
    }

    const newRefundedAmount = Number(payment.refundedAmount) + refundDto.amount;
    const newStatus =
      newRefundedAmount >= Number(payment.amount)
        ? PaymentStatus.REFUNDED
        : PaymentStatus.PARTIALLY_REFUNDED;

    const updateData = {
      refundedAmount: newRefundedAmount,
      refundedAt: new Date(),
      refundReason: refundDto.reason,
      status: newStatus,
    };

    const updatedPayment = await this.paymentRepository.updatePayment(
      id,
      updateData,
    );
    if (!updatedPayment) {
      throw new NotFoundException('Erro ao processar estorno');
    }

    return this.toPaymentResponseDto(updatedPayment);
  }

  /**
   * Obtém estatísticas de pagamentos
   */
  async getStats(userId?: number): Promise<PaymentStats> {
    return await this.paymentRepository.getPaymentStats(userId);
  }

  /**
   * Métodos auxiliares privados
   */
  private toPaymentResponseDto(payment: Payment): PaymentResponseDto {
    return {
      id: payment.id,
      userId: payment.userId,
      user: {
        id: payment.user.id,
        name: payment.user.name,
        email: payment.user.email,
        phone: payment.user.phone,
        userType: payment.user.userType,
        createdAt: payment.user.createdAt,
      },
      recipientId: payment.recipientId,
      recipient: payment.recipient
        ? {
            id: payment.recipient.id,
            name: payment.recipient.name,
            email: payment.recipient.email,
            phone: payment.recipient.phone,
            userType: payment.recipient.userType,
            createdAt: payment.recipient.createdAt,
          }
        : undefined,
      appointmentId: payment.appointmentId,
      type: payment.type,
      method: payment.method,
      status: payment.status,
      amount: Number(payment.amount),
      currency: payment.currency,
      platformFee: Number(payment.platformFee),
      gatewayFee: Number(payment.gatewayFee),
      netAmount: Number(payment.netAmount),
      description: payment.description,
      externalId: payment.externalId,
      paymentData: payment.paymentData,
      processedAt: payment.processedAt,
      failedAt: payment.failedAt,
      failureReason: payment.failureReason,
      refundedAmount: Number(payment.refundedAmount),
      refundedAt: payment.refundedAt,
      refundReason: payment.refundReason,
      dueDate: payment.dueDate,
      expiresAt: payment.expiresAt,
      isCompleted: payment.isCompleted,
      isFailed: payment.isFailed,
      isPending: payment.isPending,
      canRefund: payment.canRefund,
      isExpired: payment.isExpired,
      availableRefundAmount: payment.availableRefundAmount,
      createdAt: payment.createdAt,
      updatedAt: payment.updatedAt,
    };
  }

  // Métodos para Wallet

  /**
   * Cria ou obtém carteira do usuário
   */
  async getOrCreateWallet(
    userId: number,
    currency: Currency = Currency.BRL,
  ): Promise<WalletResponseDto> {
    let wallet = await this.paymentRepository.findWalletByUser(
      userId,
      currency,
    );

    if (!wallet) {
      const user = await this.userService.findById(userId);
      if (!user) {
        throw new NotFoundException('Usuário não encontrado');
      }

      const walletData = {
        userId,
        currency,
        balance: 0,
        availableBalance: 0,
        pendingBalance: 0,
        reservedBalance: 0,
        status: WalletStatus.ACTIVE,
        totalReceived: 0,
        totalSent: 0,
        totalWithdrawn: 0,
      };

      wallet = await this.paymentRepository.createWallet(walletData);
    }

    return this.toWalletResponseDto(wallet);
  }

  /**
   * Busca carteira do usuário
   */
  async findWalletByUser(
    userId: number,
    currency: Currency = Currency.BRL,
  ): Promise<WalletResponseDto | null> {
    const wallet = await this.paymentRepository.findWalletByUser(
      userId,
      currency,
    );
    return wallet ? this.toWalletResponseDto(wallet) : null;
  }

  /**
   * Obtém estatísticas da carteira
   */
  async getWalletStats(userId: number): Promise<WalletStats> {
    return await this.paymentRepository.getWalletStats(userId);
  }

  /**
   * Cria transação na carteira
   */
  async createWalletTransaction(
    createTransactionDto: CreateWalletTransactionDto,
  ): Promise<WalletTransactionResponseDto> {
    const wallet = await this.paymentRepository.findWalletById(
      createTransactionDto.walletId,
    );
    if (!wallet) {
      throw new NotFoundException('Carteira não encontrada');
    }

    const balanceBefore = Number(wallet.balance);
    const transactionAmount = createTransactionDto.amount;

    // Determinar se é crédito ou débito baseado no tipo
    const isCredit = [
      TransactionType.DEPOSIT,
      TransactionType.REFUND,
      TransactionType.TRANSFER_IN,
    ].includes(createTransactionDto.type as TransactionType);

    const balanceAfter = isCredit
      ? balanceBefore + transactionAmount
      : balanceBefore - transactionAmount;

    if (!isCredit && balanceAfter < 0) {
      throw new BadRequestException('Saldo insuficiente');
    }

    const transactionData = {
      walletId: createTransactionDto.walletId,
      userId: wallet.userId,
      paymentId: createTransactionDto.paymentId,
      relatedUserId: createTransactionDto.relatedUserId,
      type: createTransactionDto.type as TransactionType,
      status: TransactionStatus.COMPLETED,
      amount: transactionAmount,
      currency: wallet.currency,
      balanceBefore,
      balanceAfter,
      description: createTransactionDto.description,
      referenceId: createTransactionDto.referenceId,
      processedAt: new Date(),
    };

    const transaction =
      await this.paymentRepository.createWalletTransaction(transactionData);

    // Atualizar saldo da carteira
    await this.paymentRepository.updateWallet(wallet.id, {
      balance: balanceAfter,
      availableBalance: balanceAfter, // Simplificado - pode ser mais complexo
      lastTransactionAt: new Date(),
      totalReceived: isCredit
        ? Number(wallet.totalReceived) + transactionAmount
        : wallet.totalReceived,
      totalSent: !isCredit
        ? Number(wallet.totalSent) + transactionAmount
        : wallet.totalSent,
    });

    return this.toWalletTransactionResponseDto(transaction);
  }

  /**
   * Busca transações da carteira
   */
  async findWalletTransactions(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<PaginatedWalletTransactions> {
    const wallet = await this.paymentRepository.findWalletByUser(userId);
    if (!wallet) {
      throw new NotFoundException('Carteira não encontrada');
    }

    const { transactions, total } =
      await this.paymentRepository.findWalletTransactionsByWallet(
        wallet.id,
        page,
        limit,
      );

    return {
      data: transactions.map((transaction) =>
        this.toWalletTransactionResponseDto(transaction),
      ),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  private toWalletResponseDto(wallet: Wallet): WalletResponseDto {
    return {
      id: wallet.id,
      userId: wallet.userId,
      user: {
        id: wallet.user.id,
        name: wallet.user.name,
        email: wallet.user.email,
        phone: wallet.user.phone,
        userType: wallet.user.userType,
        createdAt: wallet.user.createdAt,
      },
      currency: wallet.currency,
      balance: Number(wallet.balance),
      availableBalance: Number(wallet.availableBalance),
      pendingBalance: Number(wallet.pendingBalance),
      reservedBalance: Number(wallet.reservedBalance),
      status: wallet.status,
      lastTransactionAt: wallet.lastTransactionAt,
      totalReceived: Number(wallet.totalReceived),
      totalSent: Number(wallet.totalSent),
      totalWithdrawn: Number(wallet.totalWithdrawn),
      isActive: wallet.isActive,
      canWithdraw: wallet.canWithdraw,
      totalBalance: wallet.totalBalance,
      createdAt: wallet.createdAt,
      updatedAt: wallet.updatedAt,
    };
  }

  private toWalletTransactionResponseDto(
    transaction: WalletTransaction,
  ): WalletTransactionResponseDto {
    return {
      id: transaction.id,
      walletId: transaction.walletId,
      userId: transaction.userId,
      user: {
        id: transaction.user.id,
        name: transaction.user.name,
        email: transaction.user.email,
        phone: transaction.user.phone,
        userType: transaction.user.userType,
        createdAt: transaction.user.createdAt,
      },
      paymentId: transaction.paymentId,
      relatedUserId: transaction.relatedUserId,
      relatedUser: transaction.relatedUser
        ? {
            id: transaction.relatedUser.id,
            name: transaction.relatedUser.name,
            email: transaction.relatedUser.email,
            phone: transaction.relatedUser.phone,
            userType: transaction.relatedUser.userType,
            createdAt: transaction.relatedUser.createdAt,
          }
        : undefined,
      type: transaction.type,
      status: transaction.status,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      balanceBefore: Number(transaction.balanceBefore),
      balanceAfter: Number(transaction.balanceAfter),
      description: transaction.description,
      referenceId: transaction.referenceId,
      processedAt: transaction.processedAt,
      isCompleted: transaction.isCompleted,
      isPending: transaction.isPending,
      isFailed: transaction.isFailed,
      isCredit: transaction.isCredit,
      isDebit: transaction.isDebit,
      createdAt: transaction.createdAt,
      updatedAt: transaction.updatedAt,
    };
  }
}
