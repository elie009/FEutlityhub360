import { BankAccountTransaction, TransactionFilters, PaginatedTransactionsResponse, TransactionAnalytics } from '../types/transaction';
import { mockBankAccounts } from './mockBankAccountData';
import { BankAccount } from '../types/bankAccount';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

let mockTransactions: BankAccountTransaction[] = [
  {
    id: 'txn-001',
    bankAccountId: 'bank-001',
    userId: 'demo-user-123',
    amount: -150.00,
    transactionType: 'debit',
    description: 'Electricity Bill Payment',
    category: 'utilities',
    referenceNumber: 'ELEC-2024-001',
    externalTransactionId: 'EXT-ELEC-001',
    transactionDate: '2024-09-25T10:30:00Z',
    createdAt: '2024-09-25T10:30:00Z',
    updatedAt: '2024-09-25T10:30:00Z',
    notes: 'Monthly electricity bill payment',
    merchant: 'City Electric Company',
    location: 'Online',
    isRecurring: true,
    recurringFrequency: 'monthly',
    currency: 'USD',
    balanceAfterTransaction: 2600.50,
  },
  {
    id: 'txn-002',
    bankAccountId: 'bank-001',
    userId: 'demo-user-123',
    amount: 2500.00,
    transactionType: 'credit',
    description: 'Salary Deposit',
    category: 'income',
    referenceNumber: 'SAL-2024-001',
    externalTransactionId: 'EXT-SAL-001',
    transactionDate: '2024-09-24T09:00:00Z',
    createdAt: '2024-09-24T09:00:00Z',
    updatedAt: '2024-09-24T09:00:00Z',
    notes: 'Monthly salary deposit',
    merchant: 'ABC Corporation',
    location: 'Direct Deposit',
    isRecurring: true,
    recurringFrequency: 'monthly',
    currency: 'USD',
    balanceAfterTransaction: 2750.50,
  },
  {
    id: 'txn-003',
    bankAccountId: 'bank-001',
    userId: 'demo-user-123',
    amount: -75.50,
    transactionType: 'debit',
    description: 'Grocery Shopping',
    category: 'food',
    referenceNumber: 'GROC-2024-001',
    externalTransactionId: 'EXT-GROC-001',
    transactionDate: '2024-09-23T14:20:00Z',
    createdAt: '2024-09-23T14:20:00Z',
    updatedAt: '2024-09-23T14:20:00Z',
    notes: 'Weekly grocery shopping',
    merchant: 'SuperMart',
    location: '123 Main St, City',
    isRecurring: false,
    currency: 'USD',
    balanceAfterTransaction: 400.50,
  },
  {
    id: 'txn-004',
    bankAccountId: 'bank-002',
    userId: 'demo-user-123',
    amount: 500.00,
    transactionType: 'credit',
    description: 'Interest Payment',
    category: 'interest',
    referenceNumber: 'INT-2024-001',
    externalTransactionId: 'EXT-INT-001',
    transactionDate: '2024-09-22T08:00:00Z',
    createdAt: '2024-09-22T08:00:00Z',
    updatedAt: '2024-09-22T08:00:00Z',
    notes: 'Monthly interest on savings account',
    merchant: 'Wells Fargo',
    location: 'Online',
    isRecurring: true,
    recurringFrequency: 'monthly',
    currency: 'USD',
    balanceAfterTransaction: 12500.75,
  },
  {
    id: 'txn-005',
    bankAccountId: 'bank-001',
    userId: 'demo-user-123',
    amount: -25.00,
    transactionType: 'debit',
    description: 'ATM Withdrawal',
    category: 'cash',
    referenceNumber: 'ATM-2024-001',
    externalTransactionId: 'EXT-ATM-001',
    transactionDate: '2024-09-21T16:45:00Z',
    createdAt: '2024-09-21T16:45:00Z',
    updatedAt: '2024-09-21T16:45:00Z',
    notes: 'Cash withdrawal from ATM',
    merchant: 'Chase Bank ATM',
    location: '456 Oak Ave, City',
    isRecurring: false,
    currency: 'USD',
    balanceAfterTransaction: 475.50,
  },
  {
    id: 'txn-006',
    bankAccountId: 'bank-003',
    userId: 'demo-user-123',
    amount: -89.99,
    transactionType: 'debit',
    description: 'Credit Card Payment',
    category: 'payment',
    referenceNumber: 'CC-2024-001',
    externalTransactionId: 'EXT-CC-001',
    transactionDate: '2024-09-20T11:15:00Z',
    createdAt: '2024-09-20T11:15:00Z',
    updatedAt: '2024-09-20T11:15:00Z',
    notes: 'Monthly credit card payment',
    merchant: 'Capital One',
    location: 'Online',
    isRecurring: true,
    recurringFrequency: 'monthly',
    currency: 'USD',
    balanceAfterTransaction: -1160.24,
  },
  {
    id: 'txn-007',
    bankAccountId: 'bank-001',
    userId: 'demo-user-123',
    amount: -45.00,
    transactionType: 'debit',
    description: 'Gas Station',
    category: 'transportation',
    referenceNumber: 'GAS-2024-001',
    externalTransactionId: 'EXT-GAS-001',
    transactionDate: '2024-09-19T18:30:00Z',
    createdAt: '2024-09-19T18:30:00Z',
    updatedAt: '2024-09-19T18:30:00Z',
    notes: 'Gas fill-up',
    merchant: 'Shell Gas Station',
    location: '789 Pine St, City',
    isRecurring: false,
    currency: 'USD',
    balanceAfterTransaction: 500.50,
  },
  {
    id: 'txn-008',
    bankAccountId: 'bank-001',
    userId: 'demo-user-123',
    amount: -120.00,
    transactionType: 'debit',
    description: 'Restaurant Dinner',
    category: 'food',
    referenceNumber: 'REST-2024-001',
    externalTransactionId: 'EXT-REST-001',
    transactionDate: '2024-09-18T19:45:00Z',
    createdAt: '2024-09-18T19:45:00Z',
    updatedAt: '2024-09-18T19:45:00Z',
    notes: 'Dinner with family',
    merchant: 'Bella Vista Restaurant',
    location: '321 Elm St, City',
    isRecurring: false,
    currency: 'USD',
    balanceAfterTransaction: 545.50,
  },
  {
    id: 'txn-009',
    bankAccountId: 'bank-004',
    userId: 'demo-user-123',
    amount: 150.00,
    transactionType: 'credit',
    description: 'Investment Dividend',
    category: 'dividend',
    referenceNumber: 'DIV-2024-001',
    externalTransactionId: 'EXT-DIV-001',
    transactionDate: '2024-09-17T10:00:00Z',
    createdAt: '2024-09-17T10:00:00Z',
    updatedAt: '2024-09-17T10:00:00Z',
    notes: 'Quarterly dividend payment',
    merchant: 'Fidelity Investments',
    location: 'Online',
    isRecurring: true,
    recurringFrequency: 'quarterly',
    currency: 'USD',
    balanceAfterTransaction: 5900.30,
  },
  {
    id: 'txn-010',
    bankAccountId: 'bank-001',
    userId: 'demo-user-123',
    amount: -35.00,
    transactionType: 'debit',
    description: 'Coffee Shop',
    category: 'food',
    referenceNumber: 'COFFEE-2024-001',
    externalTransactionId: 'EXT-COFFEE-001',
    transactionDate: '2024-09-16T08:15:00Z',
    createdAt: '2024-09-16T08:15:00Z',
    updatedAt: '2024-09-16T08:15:00Z',
    notes: 'Morning coffee and pastry',
    merchant: 'Starbucks',
    location: '654 Maple Ave, City',
    isRecurring: false,
    currency: 'USD',
    balanceAfterTransaction: 665.50,
  },
];

export const mockTransactionDataService = {
  async getRecentTransactions(userId: string, limit: number = 10): Promise<BankAccountTransaction[]> {
    await delay(500);
    const userTransactions = mockTransactions
      .filter(transaction => transaction.userId === userId)
      .sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime())
      .slice(0, limit);
    
    return userTransactions;
  },

  async getTransactions(userId: string, filters?: TransactionFilters): Promise<PaginatedTransactionsResponse> {
    await delay(600);
    let filteredTransactions = mockTransactions.filter(transaction => transaction.userId === userId);

    if (filters?.bankAccountId) {
      filteredTransactions = filteredTransactions.filter(transaction => transaction.bankAccountId === filters.bankAccountId);
    }
    if (filters?.transactionType) {
      filteredTransactions = filteredTransactions.filter(transaction => transaction.transactionType === filters.transactionType);
    }
    if (filters?.category) {
      filteredTransactions = filteredTransactions.filter(transaction => transaction.category === filters.category);
    }
    if (filters?.startDate) {
      filteredTransactions = filteredTransactions.filter(transaction => 
        new Date(transaction.transactionDate) >= new Date(filters.startDate!)
      );
    }
    if (filters?.endDate) {
      filteredTransactions = filteredTransactions.filter(transaction => 
        new Date(transaction.transactionDate) <= new Date(filters.endDate!)
      );
    }

    // Sort by transaction date (newest first)
    filteredTransactions.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedData = filteredTransactions.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      page,
      limit,
      totalCount: filteredTransactions.length,
      totalPages: Math.ceil(filteredTransactions.length / limit),
      hasNextPage: endIndex < filteredTransactions.length,
      hasPreviousPage: startIndex > 0,
    };
  },

  async getTransaction(transactionId: string): Promise<BankAccountTransaction> {
    await delay(300);
    const transaction = mockTransactions.find(t => t.id === transactionId);
    if (!transaction) throw new Error('Transaction not found');
    return transaction;
  },

  async deleteTransaction(transactionId: string): Promise<boolean> {
    await delay(500);
    
    const transactionIndex = mockTransactions.findIndex(t => t.id === transactionId);
    if (transactionIndex === -1) {
      throw new Error('Transaction not found');
    }
    
    // Get the transaction before removing it
    const transaction = mockTransactions[transactionIndex];
    
    // Remove the transaction from the mock data
    mockTransactions.splice(transactionIndex, 1);
    
    // Update the bank account balance (reverse the transaction effect)
    if (transaction) {
      const bankAccount = mockBankAccounts.find(acc => acc.id === transaction.bankAccountId);
      if (bankAccount) {
        // Reverse the transaction effect on the balance
        if (transaction.transactionType === 'credit') {
          bankAccount.currentBalance -= transaction.amount;
        } else {
          bankAccount.currentBalance += transaction.amount;
        }
        bankAccount.updatedAt = new Date().toISOString();
      }
    }
    
    return true;
  },

  async getTransactionAnalytics(userId: string): Promise<TransactionAnalytics> {
    await delay(600);
    const userTransactions = mockTransactions.filter(transaction => transaction.userId === userId);
    
    const totalIncoming = userTransactions
      .filter(t => t.transactionType === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalOutgoing = Math.abs(userTransactions
      .filter(t => t.transactionType === 'debit')
      .reduce((sum, t) => sum + t.amount, 0));
    
    const averageTransactionAmount = userTransactions.length > 0 
      ? userTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0) / userTransactions.length
      : 0;

    // Find most active category
    const categoryCounts = userTransactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostActiveCategory = Object.keys(categoryCounts).reduce((a, b) => 
      categoryCounts[a] > categoryCounts[b] ? a : b, 'none'
    );

    // Find most active merchant
    const merchantCounts = userTransactions.reduce((acc, t) => {
      if (t.merchant) {
        acc[t.merchant] = (acc[t.merchant] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
    const mostActiveMerchant = Object.keys(merchantCounts).reduce((a, b) => 
      merchantCounts[a] > merchantCounts[b] ? a : b, 'none'
    );

    return {
      totalTransactions: userTransactions.length,
      totalIncoming,
      totalOutgoing,
      averageTransactionAmount,
      mostActiveCategory,
      mostActiveMerchant,
      generatedAt: new Date().toISOString(),
    };
  },

  async createBankTransaction(userId: string, transactionData: {
    bankAccountId: string;
    amount: number;
    transactionType: 'DEBIT' | 'CREDIT';
    description: string;
    category: string;
    merchant?: string;
    location?: string;
    transactionDate: string;
    notes?: string;
    isRecurring?: boolean;
    recurringFrequency?: string;
  }): Promise<BankAccountTransaction> {
    await delay(500);
    
    // Generate new transaction ID
    const newId = `txn-${Date.now()}`;
    
    // Get the bank account to calculate balance
    const bankAccount = mockBankAccounts.find((acc: BankAccount) => acc.id === transactionData.bankAccountId);
    if (!bankAccount) {
      throw new Error('Bank account not found');
    }

    // Calculate new balance
    const amount = transactionData.transactionType === 'DEBIT' 
      ? -Math.abs(transactionData.amount) 
      : Math.abs(transactionData.amount);
    const balanceAfterTransaction = bankAccount.currentBalance + amount;

    // Create new transaction
    const newTransaction: BankAccountTransaction = {
      id: newId,
      bankAccountId: transactionData.bankAccountId,
      userId: userId,
      amount: amount,
      transactionType: transactionData.transactionType.toLowerCase() as 'debit' | 'credit',
      description: transactionData.description,
      category: transactionData.category.toLowerCase(),
      referenceNumber: `REF-${Date.now()}`,
      externalTransactionId: `EXT-${Date.now()}`,
      transactionDate: transactionData.transactionDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: transactionData.notes || '',
      merchant: transactionData.merchant || '',
      location: transactionData.location || '',
      isRecurring: transactionData.isRecurring || false,
      recurringFrequency: transactionData.recurringFrequency || '',
      currency: 'USD',
      balanceAfterTransaction: balanceAfterTransaction,
    };

    // Add to mock data
    mockTransactions.push(newTransaction);

    // Update bank account balance
    const accountIndex = mockBankAccounts.findIndex((acc: BankAccount) => acc.id === transactionData.bankAccountId);
    if (accountIndex !== -1) {
      mockBankAccounts[accountIndex].currentBalance = balanceAfterTransaction;
      mockBankAccounts[accountIndex].updatedAt = new Date().toISOString();
    }

    return newTransaction;
  },
};
