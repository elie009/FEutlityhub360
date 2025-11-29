export enum AccountType {
  BANK = 'bank',
  CREDIT_CARD = 'credit_card',
  INVESTMENT = 'investment',
  SAVINGS = 'savings',
  CHECKING = 'checking',
}

export enum SyncFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  MANUAL = 'MANUAL',
}

export interface BankAccount {
  id: string;
  userId: string;
  accountName: string;
  accountType: string;
  initialBalance: number;
  currentBalance: number;
  currency: string;
  description?: string;
  financialInstitution?: string;
  accountNumber?: string;
  routingNumber?: string;
  syncFrequency: string;
  isConnected: boolean;
  connectionId?: string;
  lastSyncedAt?: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  iban?: string;
  swiftCode?: string;
  transactionCount: number;
  totalIncoming: number;
  totalOutgoing: number;
}

export interface CreateBankAccountRequest {
  accountName: string;
  accountType: string;
  initialBalance: number;
  currency: string;
  description?: string;
  financialInstitution?: string;
  accountNumber?: string;
  routingNumber?: string;
  syncFrequency: string;
  iban?: string;
  swiftCode?: string;
}

export interface UpdateBankAccountRequest {
  accountName?: string;
  accountType?: string;
  currentBalance?: number;
  currency?: string;
  description?: string;
  financialInstitution?: string;
  accountNumber?: string;
  routingNumber?: string;
  syncFrequency?: string;
  iban?: string;
  swiftCode?: string;
  isActive?: boolean;
  isConnected?: boolean;
}

export interface BankAccountFilters {
  accountType?: string;
  isActive?: boolean;
  isConnected?: boolean;
  page?: number;
  limit?: number;
}

export interface PaginatedBankAccountsResponse {
  data: BankAccount[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface BankAccountAnalytics {
  totalBalance: number;
  totalAccounts: number;
  activeAccounts: number;
  connectedAccounts: number;
  totalIncoming: number;
  totalOutgoing: number;
  accounts: BankAccount[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  errors: string[];
}
