export interface BankAccountTransaction {
  id: string;
  bankAccountId: string;
  userId: string;
  amount: number;
  transactionType: string;
  description: string;
  category: string;
  referenceNumber?: string;
  externalTransactionId?: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  merchant?: string;
  location?: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  currency: string;
  balanceAfterTransaction: number;
  // NEW: Reference Fields for Smart Linking
  billId?: string;           // For bill-related transactions
  savingsAccountId?: string; // For savings-related transactions
  loanId?: string;           // For loan-related transactions
  accountName?: string;      // Account name for display
  // Soft delete fields
  isDeleted?: boolean;
  deletedAt?: string;
  deletedBy?: string;
  deleteReason?: string;
}

export interface TransactionFilters {
  bankAccountId?: string;
  transactionType?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}

export interface PaginatedTransactionsResponse {
  data: BankAccountTransaction[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface TransactionAnalytics {
  totalTransactions: number;
  totalIncoming: number;
  totalOutgoing: number;
  averageTransactionAmount: number;
  mostActiveCategory: string;
  mostActiveMerchant: string;
  generatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  errors: string[];
}
