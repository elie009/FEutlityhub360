export interface SubscriptionPlan {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  maxBankAccounts?: number;
  maxTransactionsPerMonth?: number;
  maxBillsPerMonth?: number;
  maxLoans?: number;
  maxSavingsGoals?: number;
  maxReceiptOcrPerMonth?: number;
  maxAiQueriesPerMonth?: number;
  maxApiCallsPerMonth?: number;
  maxUsers?: number;
  transactionHistoryMonths?: number;
  hasAiAssistant: boolean;
  hasBankFeedIntegration: boolean;
  hasReceiptOcr: boolean;
  hasAdvancedReports: boolean;
  hasPrioritySupport: boolean;
  hasApiAccess: boolean;
  hasInvestmentTracking: boolean;
  hasTaxOptimization: boolean;
  hasMultiUserSupport: boolean;
  hasWhiteLabelOptions: boolean;
  hasCustomIntegrations: boolean;
  hasDedicatedSupport: boolean;
  hasAccountManager: boolean;
  hasCustomReporting: boolean;
  hasAdvancedSecurity: boolean;
  hasComplianceReports: boolean;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubscriptionPlanRequest {
  name: string;
  displayName: string;
  description?: string;
  monthlyPrice: number;
  yearlyPrice?: number;
  maxBankAccounts?: number;
  maxTransactionsPerMonth?: number;
  maxBillsPerMonth?: number;
  maxLoans?: number;
  maxSavingsGoals?: number;
  maxReceiptOcrPerMonth?: number;
  maxAiQueriesPerMonth?: number;
  maxApiCallsPerMonth?: number;
  maxUsers?: number;
  transactionHistoryMonths?: number;
  hasAiAssistant: boolean;
  hasBankFeedIntegration: boolean;
  hasReceiptOcr: boolean;
  hasAdvancedReports: boolean;
  hasPrioritySupport: boolean;
  hasApiAccess: boolean;
  hasInvestmentTracking: boolean;
  hasTaxOptimization: boolean;
  hasMultiUserSupport: boolean;
  hasWhiteLabelOptions: boolean;
  hasCustomIntegrations: boolean;
  hasDedicatedSupport: boolean;
  hasAccountManager: boolean;
  hasCustomReporting: boolean;
  hasAdvancedSecurity: boolean;
  hasComplianceReports: boolean;
  displayOrder: number;
}

export interface UpdateSubscriptionPlanRequest {
  displayName?: string;
  description?: string;
  monthlyPrice?: number;
  yearlyPrice?: number;
  maxBankAccounts?: number;
  maxTransactionsPerMonth?: number;
  maxBillsPerMonth?: number;
  maxLoans?: number;
  maxSavingsGoals?: number;
  maxReceiptOcrPerMonth?: number;
  maxAiQueriesPerMonth?: number;
  maxApiCallsPerMonth?: number;
  maxUsers?: number;
  transactionHistoryMonths?: number;
  hasAiAssistant?: boolean;
  hasBankFeedIntegration?: boolean;
  hasReceiptOcr?: boolean;
  hasAdvancedReports?: boolean;
  hasPrioritySupport?: boolean;
  hasApiAccess?: boolean;
  hasInvestmentTracking?: boolean;
  hasTaxOptimization?: boolean;
  hasMultiUserSupport?: boolean;
  hasWhiteLabelOptions?: boolean;
  hasCustomIntegrations?: boolean;
  hasDedicatedSupport?: boolean;
  hasAccountManager?: boolean;
  hasCustomReporting?: boolean;
  hasAdvancedSecurity?: boolean;
  hasComplianceReports?: boolean;
  isActive?: boolean;
  displayOrder?: number;
}

export interface UserSubscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  subscriptionPlanId: string;
  planName: string;
  planDisplayName: string;
  status: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED' | 'TRIAL';
  billingCycle: 'MONTHLY' | 'YEARLY';
  currentPrice: number;
  startDate: string;
  endDate?: string;
  nextBillingDate?: string;
  cancelledAt?: string;
  trialEndDate?: string;
  transactionsThisMonth: number;
  billsThisMonth: number;
  receiptOcrThisMonth: number;
  aiQueriesThisMonth: number;
  apiCallsThisMonth: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserSubscriptionRequest {
  userId: string;
  subscriptionPlanId: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  startDate?: string;
  trialEndDate?: string;
}

export interface UpdateUserSubscriptionRequest {
  subscriptionPlanId?: string;
  status?: 'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'SUSPENDED';
  billingCycle?: 'MONTHLY' | 'YEARLY';
  endDate?: string;
  nextBillingDate?: string;
}

export interface UserWithSubscription {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  isActive: boolean;
  subscriptionPlanId?: string;
  subscriptionPlanName?: string;
  subscriptionStatus?: string;
  subscriptionBillingCycle?: string;
  subscriptionStartDate?: string;
  subscriptionEndDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsageStats {
  transactionsThisMonth: number;
  transactionsLimit?: number;
  billsThisMonth: number;
  billsLimit?: number;
  receiptOcrThisMonth: number;
  receiptOcrLimit?: number;
  aiQueriesThisMonth: number;
  aiQueriesLimit?: number;
  apiCallsThisMonth: number;
  apiCallsLimit?: number;
  lastUsageResetDate?: string;
}

