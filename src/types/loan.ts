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
  monthlyPayment: number;
  totalAmount: number;
  remainingBalance: number;
  appliedAt: string;
  approvedAt?: string;
  disbursedAt?: string;
  completedAt?: string;
  additionalInfo?: string;
  createdAt: string;
  updatedAt: string;
  outstandingBalance: number; // Keep for backward compatibility
  nextDueDate?: string | null; // ISO date string for next payment due date
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
  installmentNumber: number;
  dueDate: string;
  amountDue?: number; // Keep for backward compatibility
  totalAmount: number;
  principalAmount: number;
  interestAmount: number;
  status: PaymentStatus;
  paidAt?: string;
}

export interface UpcomingPayment {
  loanId: string;
  dueDate: string;
  amount: number;
  installmentNumber: number;
  daysUntilDue: number;
  loanPurpose: string;
}

export interface OverduePayment {
  loanId: string;
  dueDate: string;
  amount: number;
  installmentNumber: number;
  daysOverdue: number;
  loanPurpose: string;
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
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  metadata?: Record<string, any>;
}

export enum NotificationType {
  PAYMENT_REMINDER = 'PAYMENT_REMINDER',
  LOAN_APPROVED = 'LOAN_APPROVED',
  LOAN_REJECTED = 'LOAN_REJECTED',
  PAYMENT_DUE = 'PAYMENT_DUE',
  PAYMENT_CONFIRMED = 'PAYMENT_CONFIRMED',
  PAYMENT_OVERDUE = 'PAYMENT_OVERDUE',
  LOAN_CLOSED = 'LOAN_CLOSED',
  UPCOMING_DUE = 'UPCOMING_DUE',
  SYSTEM_UPDATE = 'SYSTEM_UPDATE',
  ACCOUNT_ALERT = 'ACCOUNT_ALERT'
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface NotificationPagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface NotificationSummary {
  totalNotifications: number;
  unreadCount: number;
  highPriorityCount: number;
  mediumPriorityCount: number;
  lowPriorityCount: number;
}

export interface NotificationsResponse {
  notifications: Notification[];
  pagination: NotificationPagination;
  summary: NotificationSummary;
}

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export enum NotificationStatus {
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  READ = 'READ',
  FAILED = 'FAILED'
}

export interface LoanApplication {
  principal: number;
  interestRate: number;
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
