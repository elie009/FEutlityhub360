// Mock data service for Savings System

import { 
  SavingsAccount, 
  SavingsTransaction, 
  SavingsType, 
  SavingsTransactionType, 
  SavingsCategory,
  SavingsSummary,
  SavingsAnalytics
} from '../types/savings';

// Mock delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock savings accounts data
let mockSavingsAccounts: SavingsAccount[] = [
  {
    id: 'savings-1',
    userId: 'demo-user-123',
    accountName: 'Emergency Fund',
    savingsType: SavingsType.EMERGENCY,
    targetAmount: 10000.00,
    currentBalance: 3500.00,
    currency: 'USD',
    description: '6 months emergency savings',
    goal: 'Build emergency fund for unexpected expenses',
    targetDate: '2024-12-31T00:00:00Z',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    progressPercentage: 35.0,
    remainingAmount: 6500.00,
    daysRemaining: 350,
    monthlyTarget: 185.71
  },
  {
    id: 'savings-2',
    userId: 'demo-user-123',
    accountName: 'Summer Vacation',
    savingsType: SavingsType.VACATION,
    targetAmount: 3000.00,
    currentBalance: 1200.00,
    currency: 'USD',
    description: 'Summer vacation to Europe',
    goal: 'Save for 2-week European vacation',
    targetDate: '2024-06-30T00:00:00Z',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    progressPercentage: 40.0,
    remainingAmount: 1800.00,
    daysRemaining: 165,
    monthlyTarget: 327.27
  },
  {
    id: 'savings-3',
    userId: 'demo-user-123',
    accountName: 'Investment Fund',
    savingsType: SavingsType.INVESTMENT,
    targetAmount: 5000.00,
    currentBalance: 5000.00,
    currency: 'USD',
    description: 'Long-term investment savings',
    goal: 'Build investment portfolio',
    targetDate: '2024-12-31T00:00:00Z',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
    progressPercentage: 100.0,
    remainingAmount: 0.00,
    daysRemaining: 350,
    monthlyTarget: 0.00
  }
];

// Mock savings transactions data
let mockSavingsTransactions: SavingsTransaction[] = [
  {
    id: 'savings-txn-1',
    savingsAccountId: 'savings-1',
    sourceBankAccountId: 'bank-account-1',
    amount: 500.00,
    transactionType: SavingsTransactionType.DEPOSIT,
    description: 'Monthly emergency fund contribution',
    category: SavingsCategory.MONTHLY_SAVINGS,
    notes: '20% of salary saved',
    transactionDate: '2024-01-15T00:00:00Z',
    currency: 'USD',
    isRecurring: true,
    recurringFrequency: 'MONTHLY',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'savings-txn-2',
    savingsAccountId: 'savings-2',
    sourceBankAccountId: 'bank-account-1',
    amount: 300.00,
    transactionType: SavingsTransactionType.DEPOSIT,
    description: 'Vacation fund deposit',
    category: SavingsCategory.MONTHLY_SAVINGS,
    notes: 'Monthly vacation savings',
    transactionDate: '2024-01-15T00:00:00Z',
    currency: 'USD',
    isRecurring: true,
    recurringFrequency: 'MONTHLY',
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 'savings-txn-3',
    savingsAccountId: 'savings-1',
    sourceBankAccountId: 'bank-account-1',
    amount: 1000.00,
    transactionType: SavingsTransactionType.DEPOSIT,
    description: 'Tax refund deposit',
    category: SavingsCategory.TAX_REFUND,
    notes: 'Tax refund added to emergency fund',
    transactionDate: '2024-01-10T00:00:00Z',
    currency: 'USD',
    isRecurring: false,
    createdAt: '2024-01-10T00:00:00Z'
  }
];

export const mockSavingsDataService = {
  // Get all savings accounts for a user
  async getSavingsAccounts(userId: string, filters?: {
    savingsType?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ data: SavingsAccount[]; totalCount: number; page: number; limit: number }> {
    await delay(500);
    
    let filteredAccounts = mockSavingsAccounts.filter(account => account.userId === userId);
    
    if (filters?.savingsType) {
      filteredAccounts = filteredAccounts.filter(account => account.savingsType === filters.savingsType);
    }
    
    if (filters?.isActive !== undefined) {
      filteredAccounts = filteredAccounts.filter(account => account.isActive === filters.isActive);
    }
    
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: filteredAccounts.slice(startIndex, endIndex),
      totalCount: filteredAccounts.length,
      page,
      limit
    };
  },

  // Get a specific savings account
  async getSavingsAccount(accountId: string): Promise<SavingsAccount> {
    await delay(300);
    
    const account = mockSavingsAccounts.find(acc => acc.id === accountId);
    if (!account) {
      throw new Error('Savings account not found');
    }
    
    return account;
  },

  // Create a new savings account
  async createSavingsAccount(userId: string, accountData: {
    accountName: string;
    savingsType: string;
    targetAmount: number;
    description?: string;
    goal?: string;
    targetDate: string;
    currency?: string;
  }): Promise<SavingsAccount> {
    await delay(800);
    
    const newAccount: SavingsAccount = {
      id: `savings-${Date.now()}`,
      userId,
      accountName: accountData.accountName,
      savingsType: accountData.savingsType as SavingsType,
      targetAmount: accountData.targetAmount,
      currentBalance: 0.00,
      currency: accountData.currency || 'USD',
      description: accountData.description,
      goal: accountData.goal,
      targetDate: accountData.targetDate,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      progressPercentage: 0.0,
      remainingAmount: accountData.targetAmount,
      daysRemaining: Math.ceil((new Date(accountData.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      monthlyTarget: accountData.targetAmount / Math.max(1, Math.ceil((new Date(accountData.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24 * 30)))
    };
    
    mockSavingsAccounts.push(newAccount);
    return newAccount;
  },

  // Update a savings account
  async updateSavingsAccount(accountId: string, accountData: {
    accountName?: string;
    savingsType?: string;
    targetAmount?: number;
    description?: string;
    goal?: string;
    targetDate?: string;
    currency?: string;
  }): Promise<SavingsAccount> {
    await delay(600);
    
    const accountIndex = mockSavingsAccounts.findIndex(acc => acc.id === accountId);
    if (accountIndex === -1) {
      throw new Error('Savings account not found');
    }
    
    const updatedAccount = {
      ...mockSavingsAccounts[accountIndex],
      ...accountData,
      savingsType: accountData.savingsType as SavingsType,
      updatedAt: new Date().toISOString()
    };
    
    // Recalculate progress if target amount or date changed
    if (accountData.targetAmount || accountData.targetDate) {
      updatedAccount.progressPercentage = (updatedAccount.currentBalance / updatedAccount.targetAmount) * 100;
      updatedAccount.remainingAmount = updatedAccount.targetAmount - updatedAccount.currentBalance;
      updatedAccount.daysRemaining = Math.ceil((new Date(updatedAccount.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      updatedAccount.monthlyTarget = updatedAccount.remainingAmount / Math.max(1, Math.ceil(updatedAccount.daysRemaining / 30));
    }
    
    mockSavingsAccounts[accountIndex] = updatedAccount;
    return updatedAccount;
  },

  // Delete a savings account
  async deleteSavingsAccount(accountId: string): Promise<void> {
    await delay(400);
    
    const accountIndex = mockSavingsAccounts.findIndex(acc => acc.id === accountId);
    if (accountIndex === -1) {
      throw new Error('Savings account not found');
    }
    
    mockSavingsAccounts.splice(accountIndex, 1);
    
    // Also remove related transactions
    mockSavingsTransactions = mockSavingsTransactions.filter(txn => txn.savingsAccountId !== accountId);
  },

  // Create a savings transaction
  async createSavingsTransaction(transactionData: {
    savingsAccountId: string;
    sourceBankAccountId: string;
    amount: number;
    transactionType: string;
    description: string;
    category?: string;
    notes?: string;
    transactionDate?: string;
    currency?: string;
    isRecurring?: boolean;
    recurringFrequency?: string;
  }): Promise<SavingsTransaction> {
    await delay(500);
    
    const newTransaction: SavingsTransaction = {
      id: `savings-txn-${Date.now()}`,
      savingsAccountId: transactionData.savingsAccountId,
      sourceBankAccountId: transactionData.sourceBankAccountId,
      amount: transactionData.amount,
      transactionType: transactionData.transactionType as SavingsTransactionType,
      description: transactionData.description,
      category: transactionData.category as SavingsCategory,
      notes: transactionData.notes,
      transactionDate: transactionData.transactionDate || new Date().toISOString(),
      currency: transactionData.currency || 'USD',
      isRecurring: transactionData.isRecurring || false,
      recurringFrequency: transactionData.recurringFrequency,
      createdAt: new Date().toISOString()
    };
    
    mockSavingsTransactions.push(newTransaction);
    
    // Update savings account balance
    const accountIndex = mockSavingsAccounts.findIndex(acc => acc.id === transactionData.savingsAccountId);
    if (accountIndex !== -1) {
      const account = mockSavingsAccounts[accountIndex];
      if (transactionData.transactionType === 'DEPOSIT') {
        account.currentBalance += transactionData.amount;
      } else if (transactionData.transactionType === 'WITHDRAWAL') {
        account.currentBalance -= transactionData.amount;
      }
      
      // Recalculate progress
      account.progressPercentage = (account.currentBalance / account.targetAmount) * 100;
      account.remainingAmount = account.targetAmount - account.currentBalance;
      account.daysRemaining = Math.ceil((new Date(account.targetDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      account.monthlyTarget = account.remainingAmount / Math.max(1, Math.ceil(account.daysRemaining / 30));
      account.updatedAt = new Date().toISOString();
    }
    
    return newTransaction;
  },

  // Get savings transactions for an account
  async getSavingsTransactions(accountId: string, filters?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<{ data: SavingsTransaction[]; totalCount: number; page: number; limit: number }> {
    await delay(400);
    
    let filteredTransactions = mockSavingsTransactions.filter(txn => txn.savingsAccountId === accountId);
    
    if (filters?.startDate) {
      filteredTransactions = filteredTransactions.filter(txn => txn.transactionDate >= filters.startDate!);
    }
    
    if (filters?.endDate) {
      filteredTransactions = filteredTransactions.filter(txn => txn.transactionDate <= filters.endDate!);
    }
    
    // Sort by date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());
    
    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    return {
      data: filteredTransactions.slice(startIndex, endIndex),
      totalCount: filteredTransactions.length,
      page,
      limit
    };
  },

  // Get savings summary
  async getSavingsSummary(userId: string): Promise<SavingsSummary> {
    await delay(600);
    
    const userAccounts = mockSavingsAccounts.filter(acc => acc.userId === userId && acc.isActive);
    
    const totalSavingsBalance = userAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
    const totalTargetAmount = userAccounts.reduce((sum, acc) => sum + acc.targetAmount, 0);
    const overallProgressPercentage = totalTargetAmount > 0 ? (totalSavingsBalance / totalTargetAmount) * 100 : 0;
    const activeGoals = userAccounts.filter(acc => acc.progressPercentage < 100).length;
    const completedGoals = userAccounts.filter(acc => acc.progressPercentage >= 100).length;
    
    // Calculate monthly targets
    const monthlySavingsTarget = userAccounts.reduce((sum, acc) => sum + acc.monthlyTarget, 0);
    
    // Calculate this month's savings (simplified)
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const thisMonthSaved = mockSavingsTransactions
      .filter(txn => {
        const txnDate = new Date(txn.transactionDate);
        return txnDate.getMonth() === thisMonth && txnDate.getFullYear() === thisYear && txn.transactionType === 'DEPOSIT';
      })
      .reduce((sum, txn) => sum + txn.amount, 0);
    
    return {
      totalSavingsAccounts: userAccounts.length,
      totalSavingsBalance,
      totalTargetAmount,
      overallProgressPercentage,
      activeGoals,
      completedGoals,
      monthlySavingsTarget,
      thisMonthSaved,
      recentAccounts: userAccounts.slice(0, 5)
    };
  },

  // Get savings analytics
  async getSavingsAnalytics(userId: string, period?: string): Promise<SavingsAnalytics> {
    await delay(700);
    
    const userAccounts = mockSavingsAccounts.filter(acc => acc.userId === userId);
    const userTransactions = mockSavingsTransactions.filter(txn => 
      userAccounts.some(acc => acc.id === txn.savingsAccountId)
    );
    
    const totalSaved = userTransactions
      .filter(txn => txn.transactionType === 'DEPOSIT')
      .reduce((sum, txn) => sum + txn.amount, 0);
    
    const totalWithdrawn = userTransactions
      .filter(txn => txn.transactionType === 'WITHDRAWAL')
      .reduce((sum, txn) => sum + txn.amount, 0);
    
    const netSavings = totalSaved - totalWithdrawn;
    
    // Calculate savings by type
    const savingsByType: Record<SavingsType, number> = {} as Record<SavingsType, number>;
    userAccounts.forEach(acc => {
      savingsByType[acc.savingsType] = (savingsByType[acc.savingsType] || 0) + acc.currentBalance;
    });
    
    // Calculate savings by category
    const savingsByCategory: Record<SavingsCategory, number> = {} as Record<SavingsCategory, number>;
    userTransactions.forEach(txn => {
      if (txn.category) {
        savingsByCategory[txn.category] = (savingsByCategory[txn.category] || 0) + txn.amount;
      }
    });
    
    return {
      totalSaved,
      totalWithdrawn,
      netSavings,
      totalTransactions: userTransactions.length,
      periodStart: '2024-01-01T00:00:00Z',
      periodEnd: '2024-12-31T23:59:59Z',
      savingsByType,
      savingsByCategory,
      recentTransactions: userTransactions.slice(0, 10),
      averageMonthlySavings: totalSaved / 12, // Simplified calculation
      averageTransactionAmount: userTransactions.length > 0 ? totalSaved / userTransactions.length : 0
    };
  },

  // Transfer from bank to savings
  async transferBankToSavings(transferData: {
    bankAccountId: string;
    savingsAccountId: string;
    amount: number;
    description: string;
  }): Promise<SavingsTransaction> {
    await delay(600);
    
    // Create the savings transaction
    const transaction = await this.createSavingsTransaction({
      savingsAccountId: transferData.savingsAccountId,
      sourceBankAccountId: transferData.bankAccountId,
      amount: transferData.amount,
      transactionType: 'DEPOSIT',
      description: transferData.description,
      category: 'TRANSFER',
      currency: 'USD'
    });
    
    return transaction;
  },

  // Transfer from savings to bank
  async transferSavingsToBank(transferData: {
    savingsAccountId: string;
    bankAccountId: string;
    amount: number;
    description: string;
  }): Promise<SavingsTransaction> {
    await delay(600);
    
    // Create the savings transaction
    const transaction = await this.createSavingsTransaction({
      savingsAccountId: transferData.savingsAccountId,
      sourceBankAccountId: transferData.bankAccountId,
      amount: transferData.amount,
      transactionType: 'WITHDRAWAL',
      description: transferData.description,
      category: 'TRANSFER',
      currency: 'USD'
    });
    
    return transaction;
  },

  // Update savings goal
  async updateSavingsGoal(accountId: string, goalData: {
    targetAmount: number;
    targetDate: string;
  }): Promise<SavingsAccount> {
    await delay(500);
    
    return this.updateSavingsAccount(accountId, {
      targetAmount: goalData.targetAmount,
      targetDate: goalData.targetDate
    });
  }
};
