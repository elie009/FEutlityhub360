import { 
  BankAccount, 
  CreateBankAccountRequest, 
  UpdateBankAccountRequest, 
  BankAccountFilters, 
  BankAccountAnalytics, 
  PaginatedBankAccountsResponse 
} from '../types/bankAccount';

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

export let mockBankAccounts: BankAccount[] = [
  {
    id: 'bank-001',
    userId: 'demo-user-123',
    accountName: 'Chase Checking Account',
    accountType: 'checking',
    initialBalance: 2500.00,
    currentBalance: 2750.50,
    currency: 'USD',
    description: 'Primary checking account for daily expenses',
    financialInstitution: 'Chase Bank',
    accountNumber: '****1234',
    routingNumber: '021000021',
    syncFrequency: 'DAILY',
    isConnected: true,
    connectionId: 'conn-001',
    lastSyncedAt: '2024-09-25T14:30:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-09-25T14:30:00Z',
    isActive: true,
    iban: 'US64SVBKUS6S3300958879',
    swiftCode: 'CHASUS33',
    transactionCount: 45,
    totalIncoming: 5000.00,
    totalOutgoing: 2250.00,
  },
  {
    id: 'bank-002',
    userId: 'demo-user-123',
    accountName: 'Wells Fargo Savings',
    accountType: 'savings',
    initialBalance: 10000.00,
    currentBalance: 12500.75,
    currency: 'USD',
    description: 'High-yield savings account',
    financialInstitution: 'Wells Fargo',
    accountNumber: '****5678',
    routingNumber: '121000248',
    syncFrequency: 'WEEKLY',
    isConnected: false,
    connectionId: undefined,
    lastSyncedAt: undefined,
    createdAt: '2024-02-01T09:00:00Z',
    updatedAt: '2024-09-20T11:15:00Z',
    isActive: true,
    iban: 'US64WFBIUS6S3300958879',
    swiftCode: 'WFBIUS6S',
    transactionCount: 12,
    totalIncoming: 3000.00,
    totalOutgoing: 500.00,
  },
  {
    id: 'bank-003',
    userId: 'demo-user-123',
    accountName: 'Capital One Credit Card',
    accountType: 'credit_card',
    initialBalance: 0.00,
    currentBalance: -1250.25,
    currency: 'USD',
    description: 'Cashback credit card',
    financialInstitution: 'Capital One',
    accountNumber: '****9012',
    routingNumber: '031176110',
    syncFrequency: 'DAILY',
    isConnected: true,
    connectionId: 'conn-003',
    lastSyncedAt: '2024-09-24T16:45:00Z',
    createdAt: '2024-03-10T14:00:00Z',
    updatedAt: '2024-09-24T16:45:00Z',
    isActive: true,
    iban: 'US64COFCUS6S3300958879',
    swiftCode: 'COFCUS6S',
    transactionCount: 28,
    totalIncoming: 0.00,
    totalOutgoing: 1250.25,
  },
  {
    id: 'bank-004',
    userId: 'demo-user-123',
    accountName: 'Fidelity Investment Account',
    accountType: 'investment',
    initialBalance: 5000.00,
    currentBalance: 5750.30,
    currency: 'USD',
    description: 'Retirement investment portfolio',
    financialInstitution: 'Fidelity Investments',
    accountNumber: '****3456',
    routingNumber: '011401533',
    syncFrequency: 'MONTHLY',
    isConnected: false,
    connectionId: undefined,
    lastSyncedAt: undefined,
    createdAt: '2024-04-05T11:30:00Z',
    updatedAt: '2024-09-15T10:20:00Z',
    isActive: true,
    iban: 'US64FIDLUS6S3300958879',
    swiftCode: 'FIDLUS6S',
    transactionCount: 8,
    totalIncoming: 1000.00,
    totalOutgoing: 250.00,
  },
];

export const mockBankAccountDataService = {
  async getUserBankAccounts(userId: string, filters?: BankAccountFilters): Promise<PaginatedBankAccountsResponse> {
    await delay(500);
    let filteredAccounts = mockBankAccounts.filter(account => account.userId === userId);

    if (filters?.accountType) {
      filteredAccounts = filteredAccounts.filter(account => account.accountType === filters.accountType);
    }
    if (filters?.isActive !== undefined) {
      filteredAccounts = filteredAccounts.filter(account => account.isActive === filters.isActive);
    }
    if (filters?.isConnected !== undefined) {
      filteredAccounts = filteredAccounts.filter(account => account.isConnected === filters.isConnected);
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const paginatedData = filteredAccounts.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      page,
      limit,
      totalCount: filteredAccounts.length,
      totalPages: Math.ceil(filteredAccounts.length / limit),
      hasNextPage: endIndex < filteredAccounts.length,
      hasPreviousPage: startIndex > 0,
    };
  },

  async getBankAccount(accountId: string): Promise<BankAccount> {
    await delay(300);
    const account = mockBankAccounts.find(a => a.id === accountId);
    if (!account) throw new Error('Bank account not found');
    return account;
  },

  async createBankAccount(userId: string, accountData: CreateBankAccountRequest): Promise<BankAccount> {
    await delay(800);
    const newAccount: BankAccount = {
      id: `bank-${Date.now()}`,
      userId,
      accountName: accountData.accountName,
      accountType: accountData.accountType,
      initialBalance: accountData.initialBalance,
      currentBalance: accountData.initialBalance,
      currency: accountData.currency,
      description: accountData.description,
      financialInstitution: accountData.financialInstitution,
      accountNumber: accountData.accountNumber,
      routingNumber: accountData.routingNumber,
      syncFrequency: accountData.syncFrequency,
      isConnected: false,
      connectionId: undefined,
      lastSyncedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      iban: accountData.iban,
      swiftCode: accountData.swiftCode,
      transactionCount: 0,
      totalIncoming: 0,
      totalOutgoing: 0,
    };
    mockBankAccounts.push(newAccount);
    return newAccount;
  },

  async updateBankAccount(accountId: string, updateData: UpdateBankAccountRequest): Promise<BankAccount> {
    await delay(800);
    const index = mockBankAccounts.findIndex(a => a.id === accountId);
    if (index === -1) throw new Error('Bank account not found');

    const updatedAccount: BankAccount = {
      ...mockBankAccounts[index],
      ...updateData,
      updatedAt: new Date().toISOString(),
    };
    mockBankAccounts[index] = updatedAccount;
    return updatedAccount;
  },

  async deleteBankAccount(accountId: string): Promise<boolean> {
    await delay(500);
    const initialLength = mockBankAccounts.length;
    mockBankAccounts = mockBankAccounts.filter(a => a.id !== accountId);
    return mockBankAccounts.length < initialLength;
  },

  async getAnalyticsSummary(userId: string): Promise<BankAccountAnalytics> {
    await delay(600);
    const userAccounts = mockBankAccounts.filter(account => account.userId === userId);
    
    const totalBalance = userAccounts.reduce((sum, account) => sum + account.currentBalance, 0);
    const totalIncoming = userAccounts.reduce((sum, account) => sum + account.totalIncoming, 0);
    const totalOutgoing = userAccounts.reduce((sum, account) => sum + account.totalOutgoing, 0);

    return {
      totalBalance,
      totalAccounts: userAccounts.length,
      activeAccounts: userAccounts.filter(a => a.isActive).length,
      connectedAccounts: userAccounts.filter(a => a.isConnected).length,
      totalIncoming,
      totalOutgoing,
      accounts: userAccounts,
    };
  },

  async connectAccount(accountId: string): Promise<BankAccount> {
    await delay(1000);
    const index = mockBankAccounts.findIndex(a => a.id === accountId);
    if (index === -1) throw new Error('Bank account not found');

    const account = mockBankAccounts[index];
    if (account.isConnected) return account; // Already connected

    const updatedAccount: BankAccount = {
      ...account,
      isConnected: true,
      updatedAt: new Date().toISOString(),
    };
    mockBankAccounts[index] = updatedAccount;
    return updatedAccount;
  },

  async disconnectAccount(accountId: string): Promise<BankAccount> {
    await delay(500);
    const index = mockBankAccounts.findIndex(a => a.id === accountId);
    if (index === -1) throw new Error('Bank account not found');

    const account = mockBankAccounts[index];
    if (!account.isConnected) return account; // Already disconnected

    const updatedAccount: BankAccount = {
      ...account,
      isConnected: false,
      updatedAt: new Date().toISOString(),
    };
    mockBankAccounts[index] = updatedAccount;
    return updatedAccount;
  },

  async syncAccount(accountId: string): Promise<BankAccount> {
    await delay(2000); // Simulate sync time
    const index = mockBankAccounts.findIndex(a => a.id === accountId);
    if (index === -1) throw new Error('Bank account not found');

    const account = mockBankAccounts[index];
    // Simulate balance update during sync
    const balanceChange = (Math.random() - 0.5) * 100; // Random change between -50 and +50
    const newBalance = Math.max(0, account.currentBalance + balanceChange);

    const updatedAccount: BankAccount = {
      ...account,
      currentBalance: newBalance,
      updatedAt: new Date().toISOString(),
    };
    mockBankAccounts[index] = updatedAccount;
    return updatedAccount;
  },

  async getBankAccountSummary(userId: string): Promise<{
    totalBalance: number;
    totalAccounts: number;
    activeAccounts: number;
    connectedAccounts: number;
    totalIncoming: number;
    totalOutgoing: number;
    accounts: BankAccount[];
  }> {
    await delay(500);
    
    const userAccounts = mockBankAccounts.filter(account => account.userId === userId);
    
    const totalBalance = userAccounts.reduce((sum, account) => sum + account.currentBalance, 0);
    const totalAccounts = userAccounts.length;
    const activeAccounts = userAccounts.filter(account => account.isActive).length;
    const connectedAccounts = userAccounts.filter(account => account.isConnected).length;
    const totalIncoming = userAccounts.reduce((sum, account) => sum + (account.totalIncoming || 0), 0);
    const totalOutgoing = userAccounts.reduce((sum, account) => sum + (account.totalOutgoing || 0), 0);
    
    return {
      totalBalance,
      totalAccounts,
      activeAccounts,
      connectedAccounts,
      totalIncoming,
      totalOutgoing,
      accounts: userAccounts,
    };
  },
};
