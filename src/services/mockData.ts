// Mock data service for demonstration purposes
// This provides sample loan data without requiring a real backend

import { Loan, RepaymentSchedule, Payment, Transaction, Notification, LoanStatus, PaymentStatus, PaymentMethod, TransactionType, NotificationType, NotificationStatus } from '../types/loan';

// Mock loan data
export const mockLoans: Loan[] = [
  {
    id: 'loan-001',
    userId: 'demo-user-123',
    principal: 15000,
    interestRate: 8.5,
    term: 24,
    status: LoanStatus.ACTIVE,
    purpose: 'Home renovation project',
    monthlyPayment: 680.00,
    totalAmount: 16320,
    remainingBalance: 12500,
    appliedAt: '2024-01-15T10:30:00Z',
    approvedAt: '2024-01-18T14:00:00Z',
    disbursedAt: '2024-01-20T14:00:00Z',
    completedAt: undefined,
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    outstandingBalance: 12500,
  },
  {
    id: 'loan-002',
    userId: 'demo-user-123',
    principal: 5000,
    interestRate: 12.0,
    term: 12,
    status: LoanStatus.ACTIVE,
    purpose: 'Emergency medical expenses',
    monthlyPayment: 444.25,
    totalAmount: 5330,
    remainingBalance: 3200,
    appliedAt: '2024-02-10T09:15:00Z',
    approvedAt: '2024-02-11T10:00:00Z',
    disbursedAt: '2024-02-12T11:30:00Z',
    completedAt: undefined,
    createdAt: '2024-02-10T09:15:00Z',
    updatedAt: '2024-02-10T09:15:00Z',
    outstandingBalance: 3200,
  },
  {
    id: 'loan-003',
    userId: 'demo-user-123',
    principal: 25000,
    interestRate: 6.5,
    term: 36,
    status: LoanStatus.CLOSED,
    purpose: 'Vehicle purchase',
    monthlyPayment: 776.39,
    totalAmount: 27950,
    remainingBalance: 0,
    appliedAt: '2023-06-01T08:00:00Z',
    approvedAt: '2023-06-03T12:00:00Z',
    disbursedAt: '2023-06-05T10:00:00Z',
    completedAt: '2023-12-15T16:45:00Z',
    createdAt: '2023-06-01T08:00:00Z',
    updatedAt: '2023-12-15T16:45:00Z',
    outstandingBalance: 0,
  },
  {
    id: 'loan-004',
    userId: 'demo-user-123',
    principal: 8000,
    interestRate: 15.0,
    term: 6,
    status: LoanStatus.OVERDUE,
    purpose: 'Business equipment',
    monthlyPayment: 1433.33,
    totalAmount: 8600,
    remainingBalance: 6500,
    appliedAt: '2024-03-01T14:20:00Z',
    approvedAt: '2024-03-02T10:00:00Z',
    disbursedAt: '2024-03-03T09:00:00Z',
    completedAt: undefined,
    createdAt: '2024-03-01T14:20:00Z',
    updatedAt: '2024-03-01T14:20:00Z',
    outstandingBalance: 6500,
  },
];

// Mock repayment schedules
export const mockRepaymentSchedules: RepaymentSchedule[] = [
  // Loan 001 schedules
  {
    id: 'schedule-001-01',
    loanId: 'loan-001',
    dueDate: '2024-02-15T00:00:00Z',
    amountDue: 680,
    principalAmount: 580,
    interestAmount: 100,
    status: PaymentStatus.PAID,
    paidAt: '2024-02-14T10:30:00Z',
  },
  {
    id: 'schedule-001-02',
    loanId: 'loan-001',
    dueDate: '2024-03-15T00:00:00Z',
    amountDue: 680,
    principalAmount: 584,
    interestAmount: 96,
    status: PaymentStatus.PAID,
    paidAt: '2024-03-14T09:15:00Z',
  },
  {
    id: 'schedule-001-03',
    loanId: 'loan-001',
    dueDate: '2024-04-15T00:00:00Z',
    amountDue: 680,
    principalAmount: 588,
    interestAmount: 92,
    status: PaymentStatus.PENDING,
  },
  {
    id: 'schedule-001-04',
    loanId: 'loan-001',
    dueDate: '2024-05-15T00:00:00Z',
    amountDue: 680,
    principalAmount: 592,
    interestAmount: 88,
    status: PaymentStatus.PENDING,
  },
  // Loan 002 schedules
  {
    id: 'schedule-002-01',
    loanId: 'loan-002',
    dueDate: '2024-03-12T00:00:00Z',
    amountDue: 444,
    principalAmount: 394,
    interestAmount: 50,
    status: PaymentStatus.PAID,
    paidAt: '2024-03-11T14:20:00Z',
  },
  {
    id: 'schedule-002-02',
    loanId: 'loan-002',
    dueDate: '2024-04-12T00:00:00Z',
    amountDue: 444,
    principalAmount: 398,
    interestAmount: 46,
    status: PaymentStatus.PENDING,
  },
  // Loan 004 schedules (overdue)
  {
    id: 'schedule-004-01',
    loanId: 'loan-004',
    dueDate: '2024-04-03T00:00:00Z',
    amountDue: 1433,
    principalAmount: 1283,
    interestAmount: 150,
    status: PaymentStatus.OVERDUE,
  },
  {
    id: 'schedule-004-02',
    loanId: 'loan-004',
    dueDate: '2024-05-03T00:00:00Z',
    amountDue: 1433,
    principalAmount: 1300,
    interestAmount: 133,
    status: PaymentStatus.PENDING,
  },
];

// Mock payments
export const mockPayments: Payment[] = [
  {
    id: 'payment-001',
    loanId: 'loan-001',
    amount: 680,
    date: '2024-02-14T10:30:00Z',
    method: PaymentMethod.BANK_TRANSFER,
    status: PaymentStatus.PAID,
    reference: 'PAY-REF-001',
    createdAt: '2024-02-14T10:30:00Z',
  },
  {
    id: 'payment-002',
    loanId: 'loan-001',
    amount: 680,
    date: '2024-03-14T09:15:00Z',
    method: PaymentMethod.CARD,
    status: PaymentStatus.PAID,
    reference: 'PAY-REF-002',
    createdAt: '2024-03-14T09:15:00Z',
  },
  {
    id: 'payment-003',
    loanId: 'loan-002',
    amount: 444,
    date: '2024-03-11T14:20:00Z',
    method: PaymentMethod.WALLET,
    status: PaymentStatus.PAID,
    reference: 'PAY-REF-003',
    createdAt: '2024-03-11T14:20:00Z',
  },
];

// Mock transactions
export const mockTransactions: Transaction[] = [
  {
    id: 'txn-001',
    type: TransactionType.DISBURSEMENT,
    amount: 15000,
    loanId: 'loan-001',
    userId: 'demo-user-123',
    reference: 'DISB-001',
    date: '2024-01-20T14:00:00Z',
    description: 'Loan disbursement for home renovation',
  },
  {
    id: 'txn-002',
    type: TransactionType.PAYMENT,
    amount: 680,
    loanId: 'loan-001',
    userId: 'demo-user-123',
    reference: 'PAY-REF-001',
    date: '2024-02-14T10:30:00Z',
    description: 'Monthly payment received',
  },
  {
    id: 'txn-003',
    type: TransactionType.DISBURSEMENT,
    amount: 5000,
    loanId: 'loan-002',
    userId: 'demo-user-123',
    reference: 'DISB-002',
    date: '2024-02-12T11:30:00Z',
    description: 'Emergency loan disbursement',
  },
];

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-001',
    userId: 'demo-user-123',
    type: NotificationType.LOAN_APPROVED,
    message: 'Your loan application #loan-001 has been approved and disbursed.',
    status: NotificationStatus.READ,
    sentAt: '2024-01-20T14:30:00Z',
    readAt: '2024-01-20T15:00:00Z',
  },
  {
    id: 'notif-002',
    userId: 'demo-user-123',
    type: NotificationType.PAYMENT_CONFIRMED,
    message: 'Payment of $680 for loan #loan-001 has been confirmed.',
    status: NotificationStatus.READ,
    sentAt: '2024-02-14T10:35:00Z',
    readAt: '2024-02-14T11:00:00Z',
  },
  {
    id: 'notif-003',
    userId: 'demo-user-123',
    type: NotificationType.PAYMENT_DUE,
    message: 'Payment of $680 for loan #loan-001 is due on April 15, 2024.',
    status: NotificationStatus.SENT,
    sentAt: '2024-04-10T09:00:00Z',
  },
  {
    id: 'notif-004',
    userId: 'demo-user-123',
    type: NotificationType.PAYMENT_OVERDUE,
    message: 'Payment of $1,433 for loan #loan-004 is overdue. Please make payment immediately.',
    status: NotificationStatus.SENT,
    sentAt: '2024-04-05T08:00:00Z',
  },
  {
    id: 'notif-005',
    userId: 'demo-user-123',
    type: NotificationType.UPCOMING_DUE,
    message: 'Payment of $444 for loan #loan-002 is due in 3 days.',
    status: NotificationStatus.SENT,
    sentAt: '2024-04-09T10:00:00Z',
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockDataService = {
  async getUserLoans(userId: string): Promise<Loan[]> {
    await delay(800);
    return mockLoans.filter(loan => loan.userId === userId);
  },

  async getLoan(loanId: string): Promise<Loan> {
    await delay(500);
    const loan = mockLoans.find(loan => loan.id === loanId);
    if (!loan) {
      throw new Error('Loan not found');
    }
    return loan;
  },

  async getLoanSchedule(loanId: string): Promise<RepaymentSchedule[]> {
    await delay(400);
    return mockRepaymentSchedules.filter(schedule => schedule.loanId === loanId);
  },


  async getPayments(loanId: string): Promise<Payment[]> {
    await delay(400);
    return mockPayments.filter(payment => payment.loanId === loanId);
  },

  async getNotifications(userId: string): Promise<Notification[]> {
    await delay(600);
    return mockNotifications.filter(notification => notification.userId === userId);
  },

  async applyForLoan(application: any): Promise<Loan> {
    await delay(2000);
    const interestRate = application.interestRate || 10.0; // Use provided rate or default
    const totalAmount = application.principal * (1 + (interestRate / 100) * (application.term / 12));
    const monthlyPayment = totalAmount / application.term;
    
    const newLoan: Loan = {
      id: 'loan-' + Date.now(),
      userId: 'demo-user-123',
      principal: application.principal,
      interestRate: interestRate,
      term: application.term,
      status: LoanStatus.PENDING,
      purpose: application.purpose,
      monthlyPayment: monthlyPayment,
      totalAmount: totalAmount,
      remainingBalance: totalAmount,
      appliedAt: new Date().toISOString(),
      approvedAt: undefined,
      disbursedAt: undefined,
      completedAt: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      outstandingBalance: totalAmount,
    };
    return newLoan;
  },

  async updateLoan(loanId: string, updateData: {
    purpose?: string;
    additionalInfo?: string;
    status?: string;
    interestRate?: number;
    monthlyPayment?: number;
    remainingBalance?: number;
  }): Promise<Loan> {
    await delay(1000);
    
    // Find the loan to update
    const loanIndex = mockLoans.findIndex(loan => loan.id === loanId);
    if (loanIndex === -1) {
      throw new Error('Loan not found');
    }
    
    // Update the loan with new data, ensuring status is properly typed
    const updatedLoan: Loan = {
      ...mockLoans[loanIndex],
      ...updateData,
      status: updateData.status as LoanStatus || mockLoans[loanIndex].status,
      updatedAt: new Date().toISOString(),
    };
    
    // Update the mock data
    mockLoans[loanIndex] = updatedLoan;
    
    return updatedLoan;
  },

  async deleteLoan(loanId: string): Promise<boolean> {
    await delay(800);
    
    // Find the loan to delete
    const loanIndex = mockLoans.findIndex(loan => loan.id === loanId);
    if (loanIndex === -1) {
      throw new Error('Loan not found');
    }
    
    // Remove the loan from the mock data
    mockLoans.splice(loanIndex, 1);
    
    return true;
  },

  async getLoanTransactions(loanId: string): Promise<any[]> {
    await delay(800);
    
    // Find the loan to get transactions for
    const loan = mockLoans.find(l => l.id === loanId);
    if (!loan) {
      throw new Error('Loan not found');
    }
    
    // Generate mock transactions based on loan data
    const transactions = [
      {
        id: `transaction-${loanId}-1`,
        loanId: loanId,
        type: 'DISBURSEMENT',
        amount: loan.principal,
        description: 'Loan disbursement via bank transfer',
        reference: `DISB-${loanId.slice(-3)}`,
        createdAt: loan.appliedAt || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];
    
    // Add monthly payments if loan is active
    if (loan.status === 'ACTIVE' && loan.monthlyPayment) {
      const monthlyPayment = loan.monthlyPayment;
      const monthsSinceDisbursement = Math.floor((Date.now() - new Date(transactions[0].createdAt).getTime()) / (30 * 24 * 60 * 60 * 1000));
      
      for (let i = 1; i <= Math.min(monthsSinceDisbursement, 6); i++) {
        transactions.push({
          id: `transaction-${loanId}-${i + 1}`,
          loanId: loanId,
          type: 'PAYMENT',
          amount: monthlyPayment,
          description: 'Monthly payment',
          reference: `PAY-${String(i).padStart(3, '0')}`,
          createdAt: new Date(Date.now() - (monthsSinceDisbursement - i) * 30 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    }
    
    // Sort by creation date (newest first)
    return transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async makePayment(loanId: string, amount: number, method: PaymentMethod, reference: string): Promise<Payment> {
    await delay(1500);
    const payment: Payment = {
      id: 'payment-' + Date.now(),
      loanId,
      amount,
      date: new Date().toISOString(),
      method,
      status: PaymentStatus.PAID,
      reference,
      createdAt: new Date().toISOString(),
    };
    return payment;
  },

  async makeLoanPayment(loanId: string, paymentData: {
    amount: number;
    method: string;
    reference: string;
    bankAccountId?: string;
  }): Promise<any> {
    await delay(1200);
    
    // Find the loan to update
    const loanIndex = mockLoans.findIndex(loan => loan.id === loanId);
    if (loanIndex === -1) {
      throw new Error('Loan not found');
    }
    
    const loan = mockLoans[loanIndex];
    
    // Create payment response matching the new API structure
    const paymentResponse = {
      id: `payment-${Date.now()}`,
      loanId: loanId,
      userId: loan.userId,
      amount: paymentData.amount,
      method: paymentData.method,
      reference: paymentData.reference,
      bankAccountId: paymentData.bankAccountId,
      status: 'COMPLETED',
      processedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    
    // Update loan remaining balance
    const currentBalance = loan.remainingBalance || loan.outstandingBalance;
    const newBalance = Math.max(0, currentBalance - paymentData.amount);
    
    mockLoans[loanIndex] = {
      ...loan,
      remainingBalance: newBalance,
      outstandingBalance: newBalance,
      updatedAt: new Date().toISOString(),
    };
    
    return paymentResponse;
  },

  async deletePayment(paymentId: string): Promise<boolean> {
    await delay(500);
    
    // In a real implementation, this would delete from a payments table
    // For mock purposes, we'll just return success
    // The payment transactions are generated dynamically, so we can't actually delete them
    // This simulates the API behavior
    console.log(`Mock: Deleting payment ${paymentId}`);
    return true;
  },

  async getOutstandingAmount(): Promise<number> {
    await delay(500);
    
    // Calculate total outstanding amount from all active loans
    const totalOutstanding = mockLoans
      .filter(loan => loan.status === LoanStatus.ACTIVE)
      .reduce((total, loan) => {
        const balance = loan.remainingBalance || loan.outstandingBalance;
        return total + balance;
      }, 0);
    
    return totalOutstanding;
  },

  async register(registerData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }): Promise<{
    token: string;
    refreshToken: string;
    expiresAt: string;
    user: {
      id: string;
      name: string;
      email: string;
      phone: string;
      role: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    };
  }> {
    await delay(1000);
    
    // Simulate registration
    const userId = 'user-' + Date.now();
    const now = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(); // 24 hours
    
    return {
      token: 'mock-jwt-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
      expiresAt,
      user: {
        id: userId,
        name: registerData.name,
        email: registerData.email,
        phone: registerData.phone,
        role: 'user',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      },
    };
  },

  async createUserProfile(profileData: any): Promise<any> {
    await delay(1500);
    
    const now = new Date().toISOString();
    const profileId = 'profile-' + Date.now();
    
    // Calculate monthly amounts for income sources
    const incomeSources = profileData.incomeSources.map((source: any) => {
      let monthlyAmount = source.amount;
      switch (source.frequency) {
        case 'daily':
          monthlyAmount = source.amount * 30;
          break;
        case 'weekly':
          monthlyAmount = source.amount * 4.33;
          break;
        case 'monthly':
          monthlyAmount = source.amount;
          break;
        case 'quarterly':
          monthlyAmount = source.amount / 3;
          break;
        case 'yearly':
          monthlyAmount = source.amount / 12;
          break;
        default:
          monthlyAmount = source.amount;
      }
      
      return {
        id: 'income-' + Date.now() + Math.random(),
        userId: 'demo-user-123',
        name: source.name,
        amount: source.amount,
        frequency: source.frequency,
        category: source.category,
        currency: source.currency,
        isActive: true,
        description: source.description,
        company: source.company,
        createdAt: now,
        updatedAt: now,
        monthlyAmount: Math.round(monthlyAmount * 100) / 100,
      };
    });
    
    const totalMonthlyIncome = incomeSources.reduce((sum: number, source: any) => sum + source.monthlyAmount, 0);
    const totalMonthlyGoals = profileData.monthlySavingsGoal + profileData.monthlyInvestmentGoal + profileData.monthlyEmergencyFundGoal;
    const netMonthlyIncome = totalMonthlyIncome - (totalMonthlyIncome * profileData.taxRate / 100) - profileData.monthlyTaxDeductions;
    const disposableIncome = netMonthlyIncome - totalMonthlyGoals;
    
    return {
      id: profileId,
      userId: 'demo-user-123',
      jobTitle: profileData.jobTitle,
      company: profileData.company,
      employmentType: profileData.employmentType,
      monthlySavingsGoal: profileData.monthlySavingsGoal,
      monthlyInvestmentGoal: profileData.monthlyInvestmentGoal,
      monthlyEmergencyFundGoal: profileData.monthlyEmergencyFundGoal,
      taxRate: profileData.taxRate,
      monthlyTaxDeductions: profileData.monthlyTaxDeductions,
      industry: profileData.industry,
      location: profileData.location,
      notes: profileData.notes,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      totalMonthlyIncome: Math.round(totalMonthlyIncome * 100) / 100,
      netMonthlyIncome: Math.round(netMonthlyIncome * 100) / 100,
      totalMonthlyGoals: Math.round(totalMonthlyGoals * 100) / 100,
      disposableIncome: Math.round(disposableIncome * 100) / 100,
      incomeSources,
    };
  },

  async getUserProfile(): Promise<any> {
    await delay(800);
    
    // Return profile data with isActive: true to test the logic
    console.log('MockData: getUserProfile - returning profile data with isActive: true');
    return {
      "id": "string",
      "userId": "string",
      "jobTitle": "string",
      "company": "string",
      "employmentType": "string",
      "monthlySavingsGoal": 0,
      "monthlyInvestmentGoal": 0,
      "monthlyEmergencyFundGoal": 0,
      "taxRate": 0,
      "monthlyTaxDeductions": 0,
      "industry": "string",
      "location": "string",
      "notes": "string",
      "isActive": true,
      "createdAt": "2025-09-26T16:10:24.398Z",
      "updatedAt": "2025-09-26T16:10:24.398Z",
      "totalMonthlyIncome": 0,
      "netMonthlyIncome": 0,
      "totalMonthlyGoals": 0,
      "disposableIncome": 0,
      "incomeSources": [
        {
          "id": "string",
          "userId": "string",
          "name": "string",
          "amount": 0,
          "frequency": "string",
          "category": "string",
          "currency": "string",
          "isActive": true,
          "description": "string",
          "company": "string",
          "createdAt": "2025-09-26T16:10:24.398Z",
          "updatedAt": "2025-09-26T16:10:24.398Z",
          "monthlyAmount": 0
        }
      ]
    };
  },

  async updateUserProfile(profileData: any): Promise<any> {
    await delay(1000);
    
    const now = new Date().toISOString();
    
    // Simulate updating the profile with new data
    return {
      id: 'profile-123',
      userId: 'demo-user-123',
      jobTitle: profileData.jobTitle,
      company: profileData.company,
      employmentType: profileData.employmentType,
      monthlySavingsGoal: profileData.monthlySavingsGoal,
      monthlyInvestmentGoal: profileData.monthlyInvestmentGoal,
      monthlyEmergencyFundGoal: profileData.monthlyEmergencyFundGoal,
      taxRate: profileData.taxRate,
      monthlyTaxDeductions: profileData.monthlyTaxDeductions,
      industry: profileData.industry,
      location: profileData.location,
      notes: profileData.notes,
      isActive: true,
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: now,
      totalMonthlyIncome: 5000,
      netMonthlyIncome: 3450,
      totalMonthlyGoals: profileData.monthlySavingsGoal + profileData.monthlyInvestmentGoal + profileData.monthlyEmergencyFundGoal,
      disposableIncome: 1750,
      incomeSources: [
        {
          id: 'income-123',
          userId: 'demo-user-123',
          name: 'Company salary',
          amount: 5000,
          frequency: 'monthly',
          category: 'Primary',
          currency: 'USD',
          isActive: true,
          description: 'Monthly salary from full-time employment',
          company: profileData.company,
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: now,
          monthlyAmount: 5000,
        },
      ],
    };
  },

  // ==================== SAVINGS MANAGEMENT METHODS ====================

  // Create a new savings account
  async createSavingsAccount(userId: string, accountData: {
    accountName: string;
    savingsType: string;
    targetAmount: number;
    description?: string;
    goal?: string;
    targetDate: string;
    currency?: string;
  }): Promise<any> {
    // Import the mock savings data service
    const { mockSavingsDataService } = await import('./mockSavingsData');
    return mockSavingsDataService.createSavingsAccount(userId, accountData);
  },

  // Get all savings accounts for a user
  async getSavingsAccounts(userId: string, filters?: {
    savingsType?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<any> {
    const { mockSavingsDataService } = await import('./mockSavingsData');
    return mockSavingsDataService.getSavingsAccounts(userId, filters);
  },

  // Get a specific savings account
  async getSavingsAccount(accountId: string): Promise<any> {
    const { mockSavingsDataService } = await import('./mockSavingsData');
    return mockSavingsDataService.getSavingsAccount(accountId);
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
  }): Promise<any> {
    const { mockSavingsDataService } = await import('./mockSavingsData');
    return mockSavingsDataService.updateSavingsAccount(accountId, accountData);
  },

  // Delete a savings account
  async deleteSavingsAccount(accountId: string): Promise<void> {
    const { mockSavingsDataService } = await import('./mockSavingsData');
    return mockSavingsDataService.deleteSavingsAccount(accountId);
  },

  // Create a savings transaction
  async createSavingsTransaction(transactionData: {
    savingsAccountId: string;
    sourceBankAccountId?: string;
    amount: number;
    transactionType: 'DEPOSIT' | 'WITHDRAWAL';
    description: string;
    category?: string;
    notes?: string;
    transactionDate?: string;
    currency?: string;
    isRecurring?: boolean;
    recurringFrequency?: string;
    method?: string;
  }): Promise<any> {
    const { mockSavingsDataService } = await import('./mockSavingsData');
    return mockSavingsDataService.createSavingsTransaction(transactionData);
  },

  // Get savings transactions for an account
  async getSavingsTransactions(accountId: string, filters?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const { mockSavingsDataService } = await import('./mockSavingsData');
    return mockSavingsDataService.getSavingsTransactions(accountId, filters);
  },

  // Get savings summary
  async getSavingsSummary(userId: string): Promise<any> {
    const { mockSavingsDataService } = await import('./mockSavingsData');
    return mockSavingsDataService.getSavingsSummary(userId);
  },

  // Get savings analytics
  async getSavingsAnalytics(userId: string, period?: string): Promise<any> {
    const { mockSavingsDataService } = await import('./mockSavingsData');
    return mockSavingsDataService.getSavingsAnalytics(userId, period);
  },

  // Transfer from bank to savings
  async transferBankToSavings(transferData: {
    bankAccountId: string;
    savingsAccountId: string;
    amount: number;
    description: string;
  }): Promise<any> {
    const { mockSavingsDataService } = await import('./mockSavingsData');
    return mockSavingsDataService.transferBankToSavings(transferData);
  },

  // Transfer from savings to bank
  async transferSavingsToBank(transferData: {
    savingsAccountId: string;
    bankAccountId: string;
    amount: number;
    description: string;
  }): Promise<any> {
    const { mockSavingsDataService } = await import('./mockSavingsData');
    return mockSavingsDataService.transferSavingsToBank(transferData);
  },

  // Update savings goal
  async updateSavingsGoal(accountId: string, goalData: {
    targetAmount: number;
    targetDate: string;
  }): Promise<any> {
    const { mockSavingsDataService } = await import('./mockSavingsData');
    return mockSavingsDataService.updateSavingsGoal(accountId, goalData);
  }

};
