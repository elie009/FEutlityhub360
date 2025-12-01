export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  kycVerified: boolean;
  isActive: boolean;
  role?: string; // USER, ADMIN, etc.
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
  // New accounting system fields
  interestComputationMethod?: 'FLAT_RATE' | 'AMORTIZED'; // Default: AMORTIZED
  totalInterest?: number; // Total interest over loan term
  downPayment?: number; // Optional down payment
  processingFee?: number; // Optional processing fee
  actualFinancedAmount?: number; // Principal - DownPayment
  paymentFrequency?: 'MONTHLY' | 'WEEKLY' | 'BIWEEKLY' | 'QUARTERLY'; // Default: MONTHLY
  startDate?: string | null; // Loan start date (when disbursed)
  // New fields for enhanced loan management
  loanType?: LoanType; // Type of loan
  refinancedFromLoanId?: string | null; // ID of loan that was refinanced (if this is a refinanced loan)
  refinancedToLoanId?: string | null; // ID of loan that refinanced this loan (if this loan was refinanced)
  refinancingDate?: string | null; // Date when refinancing occurred
  effectiveInterestRate?: number | null; // Calculated effective interest rate (APR) including fees
}

export enum LoanType {
  PERSONAL = 'PERSONAL',
  MORTGAGE = 'MORTGAGE',
  AUTO = 'AUTO',
  STUDENT = 'STUDENT',
  BUSINESS = 'BUSINESS',
  CREDIT_CARD = 'CREDIT_CARD',
  LINE_OF_CREDIT = 'LINE_OF_CREDIT',
  OTHER = 'OTHER'
}

export enum LoanStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  CLOSED = 'CLOSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
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
  paidDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
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
  priority: NotificationPriority | string; // Allow string to handle API values like 'NORMAL'
  isRead: boolean;
  createdAt: string;
  readAt?: string;
  metadata?: Record<string, any>;
  templateVariables?: Record<string, string>; // Contains billId, loanId, etc. for navigation
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
  // Optional fields for accounting system
  downPayment?: number;
  processingFee?: number;
  interestComputationMethod?: 'FLAT_RATE' | 'AMORTIZED';
  // New fields for loan type and refinancing
  loanType?: LoanType;
  refinancedFromLoanId?: string | null; // If this is a refinancing application
}

// Payment Schedule Management Interfaces
export interface AddCustomScheduleRequest {
  startingInstallmentNumber: number;
  numberOfMonths: number;
  firstDueDate: string;
  monthlyPayment: number;
  reason?: string;
}

export interface ExtendLoanTermRequest {
  additionalMonths: number;
  reason?: string;
}

export interface RegenerateScheduleRequest {
  newMonthlyPayment: number;
  newTerm: number;
  startDate: string;
  reason?: string;
}

export interface UpdateScheduleRequest {
  amount?: number;
  status?: PaymentStatus;
  dueDate?: string;
  paidDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
}

export interface MarkAsPaidRequest {
  amount: number;
  method: string;
  reference: string;
  paymentDate: string;
  notes?: string;
}

export interface UpdateDueDateRequest {
  newDueDate: string;
}

// Response interfaces for schedule operations
export interface ScheduleOperationResponse {
  success: boolean;
  message: string;
  data?: RepaymentSchedule | RepaymentSchedule[] | boolean;
  errors?: string[];
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

// Loan Disbursement Interfaces
export interface DisburseLoanRequest {
  loanId: string;
  disbursedBy: string;
  disbursementMethod: 'BANK_TRANSFER' | 'CASH' | 'CHECK' | 'CASH_PICKUP';
  reference?: string;
  bankAccountId?: string; // ✅ NEW: Optional - If provided, credits loan to this account
}

export interface DisbursementResponse {
  success: boolean;
  message: string;
  data: {
    loanId: string;
    disbursedAmount: number;
    disbursedAt: string;
    disbursementMethod: string;
    reference?: string;
    bankAccountCredited: boolean; // ✅ NEW: Shows if bank account was credited
    bankAccountId?: string; // ✅ NEW: Bank account ID if credited
    message: string; // ✅ NEW: Detailed message
  };
}
