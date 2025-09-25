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
    const interestRate = 10.0; // Default rate
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
};
