import {
  PaymentResponseDto,
  WalletResponseDto,
  WalletTransactionResponseDto,
} from '../dto/payment-response.dto';

export interface PaginatedPayments {
  data: PaymentResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedWalletTransactions {
  data: WalletTransactionResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaymentStats {
  total: number;
  totalAmount: number;
  byStatus: Record<string, { count: number; amount: number }>;
  byMethod: Record<string, { count: number; amount: number }>;
  byType: Record<string, { count: number; amount: number }>;
  averageAmount: number;
  totalFees: number;
  totalRefunded: number;
}

export interface WalletStats {
  totalBalance: number;
  availableBalance: number;
  pendingBalance: number;
  reservedBalance: number;
  totalReceived: number;
  totalSent: number;
  totalWithdrawn: number;
  transactionCount: number;
  lastTransactionAt?: Date;
}
