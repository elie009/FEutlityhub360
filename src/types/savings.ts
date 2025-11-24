// Savings System Types and Interfaces

export enum SavingsType {
  EMERGENCY = 'EMERGENCY',
  VACATION = 'VACATION',
  INVESTMENT = 'INVESTMENT',
  RETIREMENT = 'RETIREMENT',
  EDUCATION = 'EDUCATION',
  HOME_DOWN_PAYMENT = 'HOME_DOWN_PAYMENT',
  CAR_PURCHASE = 'CAR_PURCHASE',
  WEDDING = 'WEDDING',
  TRAVEL = 'TRAVEL',
  BUSINESS = 'BUSINESS',
  HEALTH = 'HEALTH',
  TAX_SAVINGS = 'TAX_SAVINGS',
  GENERAL = 'GENERAL',
  OTHERS = 'OTHERS'
}

export enum SavingsTransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  TRANSFER = 'TRANSFER',
  INTEREST = 'INTEREST',
  BONUS = 'BONUS'
}

export enum SavingsCategory {
  MONTHLY_SAVINGS = 'MONTHLY_SAVINGS',
  BONUS = 'BONUS',
  TAX_REFUND = 'TAX_REFUND',
  GIFT = 'GIFT',
  SIDE_INCOME = 'SIDE_INCOME',
  INVESTMENT_RETURN = 'INVESTMENT_RETURN',
  EMERGENCY_WITHDRAWAL = 'EMERGENCY_WITHDRAWAL',
  PLANNED_EXPENSE = 'PLANNED_EXPENSE',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER'
}

export enum SavingsAccountType {
  REGULAR = 'REGULAR',
  HIGH_YIELD = 'HIGH_YIELD',
  CD = 'CD',
  MONEY_MARKET = 'MONEY_MARKET'
}

export enum InterestCompoundingFrequency {
  DAILY = 'DAILY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  ANNUALLY = 'ANNUALLY',
  YEARLY = 'YEARLY'
}

export interface SavingsAccount {
  id: string;
  userId: string;
  accountName: string;
  savingsType: SavingsType;
  accountType?: SavingsAccountType;
  interestRate?: number;
  interestCompoundingFrequency?: InterestCompoundingFrequency;
  lastInterestCalculationDate?: string;
  nextInterestCalculationDate?: string;
  targetAmount: number;
  currentBalance: number;
  currency: string;
  description?: string;
  goal?: string;
  targetDate: string;
  startDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  // Calculated fields
  progressPercentage: number;
  remainingAmount: number;
  daysRemaining: number;
  monthlyTarget: number;
}

export interface SavingsTransaction {
  id: string;
  savingsAccountId: string;
  sourceBankAccountId?: string;
  amount: number;
  transactionType: SavingsTransactionType;
  description: string;
  category?: SavingsCategory;
  notes?: string;
  transactionDate: string;
  currency: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  createdAt: string;
}

export interface CreateSavingsAccountRequest {
  accountName: string;
  savingsType: SavingsType;
  accountType?: SavingsAccountType;
  interestRate?: number;
  interestCompoundingFrequency?: InterestCompoundingFrequency;
  targetAmount: number;
  description?: string;
  goal?: string;
  targetDate: string;
  startDate?: string;
  currency?: string;
}

export interface UpdateSavingsAccountRequest {
  accountName?: string;
  savingsType?: SavingsType;
  accountType?: SavingsAccountType;
  interestRate?: number;
  interestCompoundingFrequency?: InterestCompoundingFrequency;
  targetAmount?: number;
  description?: string;
  goal?: string;
  targetDate?: string;
  startDate?: string;
  currency?: string;
}

export interface CreateSavingsTransactionRequest {
  savingsAccountId: string;
  sourceBankAccountId?: string;
  amount: number;
  transactionType: SavingsTransactionType;
  description: string;
  category?: SavingsCategory;
  notes?: string;
  transactionDate?: string;
  currency?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
  method?: string;
}

export interface SavingsSummary {
  totalSavingsAccounts: number;
  totalSavingsBalance: number;
  totalTargetAmount: number;
  overallProgressPercentage: number;
  activeGoals: number;
  completedGoals: number;
  monthlySavingsTarget: number;
  thisMonthSaved: number;
  recentAccounts: SavingsAccount[];
}

export interface SavingsAnalytics {
  totalSaved: number;
  totalWithdrawn: number;
  netSavings: number;
  totalTransactions: number;
  periodStart: string;
  periodEnd: string;
  savingsByType: Record<SavingsType, number>;
  savingsByCategory: Record<SavingsCategory, number>;
  recentTransactions: SavingsTransaction[];
  averageMonthlySavings: number;
  averageTransactionAmount: number;
}

export interface SavingsFilters {
  savingsType?: SavingsType;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface SavingsTransactionFilters {
  savingsAccountId?: string;
  transactionType?: SavingsTransactionType;
  category?: SavingsCategory;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedSavingsAccountsResponse {
  data: SavingsAccount[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface PaginatedSavingsTransactionsResponse {
  data: SavingsTransaction[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

// Transfer DTOs
export interface BankToSavingsTransferRequest {
  bankAccountId: string;
  savingsAccountId: string;
  amount: number;
  description: string;
}

export interface SavingsToBankTransferRequest {
  savingsAccountId: string;
  bankAccountId: string;
  amount: number;
  description: string;
}

// Goal Management
export interface UpdateSavingsGoalRequest {
  targetAmount: number;
  targetDate: string;
}

export interface SavingsProgress {
  totalProgress: number;
  accountsProgress: Array<{
    accountId: string;
    accountName: string;
    progress: number;
    remaining: number;
    daysLeft: number;
  }>;
}
