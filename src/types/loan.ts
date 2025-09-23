export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  kycVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Loan {
  id: string;
  userId: string;
  principal: number;
  interestRate: number;
  term: number; // in months
  status: LoanStatus;
  purpose: string;
  createdAt: string;
  updatedAt: string;
  disbursedAt?: string;
  closedAt?: string;
  outstandingBalance: number;
  totalAmount: number;
}

export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED',
  OVERDUE = 'OVERDUE'
}

export interface RepaymentSchedule {
  id: string;
  loanId: string;
  dueDate: string;
  amountDue: number;
  principalAmount: number;
  interestAmount: number;
  status: PaymentStatus;
  paidAt?: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  PARTIAL = 'PARTIAL'
}

export interface Payment {
  id: string;
  loanId: string;
  amount: number;
  date: string;
  method: PaymentMethod;
  status: PaymentStatus;
  reference: string;
  createdAt: string;
}

export enum PaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD',
  WALLET = 'WALLET',
  CASH = 'CASH'
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  loanId: string;
  userId: string;
  reference: string;
  date: string;
  description: string;
}

export enum TransactionType {
  DISBURSEMENT = 'DISBURSEMENT',
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  PENALTY = 'PENALTY'
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  message: string;
  status: NotificationStatus;
  sentAt: string;
  readAt?: string;
}

export enum NotificationType {
  LOAN_APPROVED = 'LOAN_APPROVED',
  LOAN_REJECTED = 'LOAN_REJECTED',
  PAYMENT_DUE = 'PAYMENT_DUE',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  PAYMENT_OVERDUE = 'PAYMENT_OVERDUE',
  LOAN_CLOSED = 'LOAN_CLOSED',
  UPCOMING_DUE = 'UPCOMING_DUE'
}

export enum NotificationStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
}

export interface LoanApplication {
  principal: number;
  purpose: string;
  term: number;
  monthlyIncome: number;
  employmentStatus: string;
  additionalInfo?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  data: {
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
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}
