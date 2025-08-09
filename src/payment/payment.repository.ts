import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Wallet, WalletStatus } from './entities/wallet.entity';
import {
  WalletTransaction,
  TransactionStatus,
} from './entities/wallet-transaction.entity';
import { QueryPaymentsDto } from './dto/query-payments.dto';
import {
  PaymentStats,
  WalletStats,
} from './interfaces/paginated-payments.interface';

@Injectable()
export class PaymentRepository {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
  ) {}

  // Métodos para Payment
  async createPayment(paymentData: Partial<Payment>): Promise<Payment> {
    const payment = this.paymentRepository.create(paymentData);
    return await this.paymentRepository.save(payment);
  }

  async findPaymentById(id: number): Promise<Payment | null> {
    return await this.paymentRepository.findOne({
      where: { id },
      relations: ['user', 'recipient'],
    });
  }

  async findPaymentsByUser(
    userId: number,
    query: QueryPaymentsDto,
  ): Promise<{ payments: Payment[]; total: number }> {
    const queryBuilder = this.createPaymentQueryBuilder();

    queryBuilder.where('payment.userId = :userId', { userId });

    this.applyPaymentFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const payments = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .take(query.limit || 10)
      .orderBy('payment.createdAt', 'DESC')
      .getMany();

    return { payments, total };
  }

  async findPaymentsWithFilters(
    query: QueryPaymentsDto,
  ): Promise<{ payments: Payment[]; total: number }> {
    const queryBuilder = this.createPaymentQueryBuilder();

    this.applyPaymentFilters(queryBuilder, query);

    const total = await queryBuilder.getCount();

    const payments = await queryBuilder
      .skip(((query.page || 1) - 1) * (query.limit || 10))
      .take(query.limit || 10)
      .orderBy('payment.createdAt', 'DESC')
      .getMany();

    return { payments, total };
  }

  async updatePayment(
    id: number,
    updateData: Partial<Payment>,
  ): Promise<Payment | null> {
    await this.paymentRepository.update(id, updateData);
    return await this.findPaymentById(id);
  }

  async deletePayment(id: number): Promise<void> {
    await this.paymentRepository.delete(id);
  }

  async getPaymentStats(userId?: number): Promise<PaymentStats> {
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    if (userId) {
      queryBuilder.where('payment.userId = :userId', { userId });
    }

    const payments = await queryBuilder.getMany();

    const total = payments.length;
    const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const totalFees = payments.reduce(
      (sum, p) => sum + Number(p.platformFee) + Number(p.gatewayFee),
      0,
    );
    const totalRefunded = payments.reduce(
      (sum, p) => sum + Number(p.refundedAmount),
      0,
    );

    // Estatísticas por status
    const byStatus = payments.reduce(
      (acc, payment) => {
        if (!acc[payment.status]) {
          acc[payment.status] = { count: 0, amount: 0 };
        }
        acc[payment.status].count++;
        acc[payment.status].amount += Number(payment.amount);
        return acc;
      },
      {} as Record<string, { count: number; amount: number }>,
    );

    // Estatísticas por método
    const byMethod = payments.reduce(
      (acc, payment) => {
        if (!acc[payment.method]) {
          acc[payment.method] = { count: 0, amount: 0 };
        }
        acc[payment.method].count++;
        acc[payment.method].amount += Number(payment.amount);
        return acc;
      },
      {} as Record<string, { count: number; amount: number }>,
    );

    // Estatísticas por tipo
    const byType = payments.reduce(
      (acc, payment) => {
        if (!acc[payment.type]) {
          acc[payment.type] = { count: 0, amount: 0 };
        }
        acc[payment.type].count++;
        acc[payment.type].amount += Number(payment.amount);
        return acc;
      },
      {} as Record<string, { count: number; amount: number }>,
    );

    return {
      total,
      totalAmount,
      byStatus,
      byMethod,
      byType,
      averageAmount: total > 0 ? totalAmount / total : 0,
      totalFees,
      totalRefunded,
    };
  }

  // Métodos para Wallet
  async createWallet(walletData: Partial<Wallet>): Promise<Wallet> {
    const wallet = this.walletRepository.create(walletData);
    return await this.walletRepository.save(wallet);
  }

  async findWalletById(id: number): Promise<Wallet | null> {
    return await this.walletRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async findWalletByUser(
    userId: number,
    currency: string = 'BRL',
  ): Promise<Wallet | null> {
    return await this.walletRepository.findOne({
      where: { userId, currency: currency as any },
      relations: ['user'],
    });
  }

  async updateWallet(
    id: number,
    updateData: Partial<Wallet>,
  ): Promise<Wallet | null> {
    await this.walletRepository.update(id, updateData);
    return await this.findWalletById(id);
  }

  async getWalletStats(userId: number): Promise<WalletStats> {
    const wallet = await this.findWalletByUser(userId);

    if (!wallet) {
      return {
        totalBalance: 0,
        availableBalance: 0,
        pendingBalance: 0,
        reservedBalance: 0,
        totalReceived: 0,
        totalSent: 0,
        totalWithdrawn: 0,
        transactionCount: 0,
      };
    }

    const transactionCount = await this.walletTransactionRepository.count({
      where: { walletId: wallet.id },
    });

    return {
      totalBalance:
        Number(wallet.balance) +
        Number(wallet.pendingBalance) +
        Number(wallet.reservedBalance),
      availableBalance: Number(wallet.availableBalance),
      pendingBalance: Number(wallet.pendingBalance),
      reservedBalance: Number(wallet.reservedBalance),
      totalReceived: Number(wallet.totalReceived),
      totalSent: Number(wallet.totalSent),
      totalWithdrawn: Number(wallet.totalWithdrawn),
      transactionCount,
      lastTransactionAt: wallet.lastTransactionAt,
    };
  }

  // Métodos para WalletTransaction
  async createWalletTransaction(
    transactionData: Partial<WalletTransaction>,
  ): Promise<WalletTransaction> {
    const transaction =
      this.walletTransactionRepository.create(transactionData);
    return await this.walletTransactionRepository.save(transaction);
  }

  async findWalletTransactionById(
    id: number,
  ): Promise<WalletTransaction | null> {
    return await this.walletTransactionRepository.findOne({
      where: { id },
      relations: ['user', 'wallet', 'payment', 'relatedUser'],
    });
  }

  async findWalletTransactionsByWallet(
    walletId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ transactions: WalletTransaction[]; total: number }> {
    const queryBuilder = this.walletTransactionRepository
      .createQueryBuilder('transaction')
      .leftJoinAndSelect('transaction.user', 'user')
      .leftJoinAndSelect('transaction.wallet', 'wallet')
      .leftJoinAndSelect('transaction.payment', 'payment')
      .leftJoinAndSelect('transaction.relatedUser', 'relatedUser')
      .where('transaction.walletId = :walletId', { walletId });

    const total = await queryBuilder.getCount();

    const transactions = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('transaction.createdAt', 'DESC')
      .getMany();

    return { transactions, total };
  }

  async updateWalletTransaction(
    id: number,
    updateData: Partial<WalletTransaction>,
  ): Promise<WalletTransaction | null> {
    await this.walletTransactionRepository.update(id, updateData);
    return await this.findWalletTransactionById(id);
  }

  private createPaymentQueryBuilder(): SelectQueryBuilder<Payment> {
    return this.paymentRepository
      .createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .leftJoinAndSelect('payment.recipient', 'recipient');
  }

  private applyPaymentFilters(
    queryBuilder: SelectQueryBuilder<Payment>,
    query: QueryPaymentsDto,
  ): void {
    if (query.type) {
      queryBuilder.andWhere('payment.type = :type', { type: query.type });
    }

    if (query.method) {
      queryBuilder.andWhere('payment.method = :method', {
        method: query.method,
      });
    }

    if (query.status) {
      queryBuilder.andWhere('payment.status = :status', {
        status: query.status,
      });
    }

    if (query.currency) {
      queryBuilder.andWhere('payment.currency = :currency', {
        currency: query.currency,
      });
    }

    if (query.minAmount !== undefined) {
      queryBuilder.andWhere('payment.amount >= :minAmount', {
        minAmount: query.minAmount,
      });
    }

    if (query.maxAmount !== undefined) {
      queryBuilder.andWhere('payment.amount <= :maxAmount', {
        maxAmount: query.maxAmount,
      });
    }

    if (query.startDate) {
      queryBuilder.andWhere('payment.createdAt >= :startDate', {
        startDate: new Date(query.startDate),
      });
    }

    if (query.endDate) {
      queryBuilder.andWhere('payment.createdAt <= :endDate', {
        endDate: new Date(query.endDate),
      });
    }

    if (query.userId) {
      queryBuilder.andWhere('payment.userId = :userId', {
        userId: query.userId,
      });
    }

    if (query.recipientId) {
      queryBuilder.andWhere('payment.recipientId = :recipientId', {
        recipientId: query.recipientId,
      });
    }

    if (query.appointmentId) {
      queryBuilder.andWhere('payment.appointmentId = :appointmentId', {
        appointmentId: query.appointmentId,
      });
    }

    if (query.search) {
      queryBuilder.andWhere('LOWER(payment.description) LIKE LOWER(:search)', {
        search: `%${query.search}%`,
      });
    }

    if (query.externalId) {
      queryBuilder.andWhere('payment.externalId = :externalId', {
        externalId: query.externalId,
      });
    }
  }
}
