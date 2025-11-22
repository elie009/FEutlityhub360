export enum ReceivableStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

export enum PaymentFrequency {
  MONTHLY = 'MONTHLY',
  WEEKLY = 'WEEKLY',
  BIWEEKLY = 'BIWEEKLY',
  QUARTERLY = 'QUARTERLY',
}

export enum ReceivablePaymentMethod {
  BANK_TRANSFER = 'BANK_TRANSFER',
  CARD = 'CARD',
  WALLET = 'WALLET',
  CASH = 'CASH',
  CHECK = 'CHECK',
  OTHER = 'OTHER',
}

export interface Receivable {
  id: string;
  userId: string;
  borrowerName: string;
  borrowerContact?: string;
  principal: number;
  interestRate: number;
  term: number; // in months
  monthlyPayment: number;
  remainingBalance: number;
  totalPaid: number;
  paymentCount: number;
  status: ReceivableStatus;
  purpose?: string;
  paymentFrequency: PaymentFrequency;
  nextPaymentDueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface ReceivablePayment {
  id: string;
  receivableId: string;
  amount: number;
  method: ReceivablePaymentMethod;
  reference?: string;
  paymentDate: string;
  bankAccountId?: string | null;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReceivableRequest {
  borrowerName: string;
  borrowerContact?: string;
  principal: number;
  interestRate: number;
  term: number;
  monthlyPayment: number;
  purpose?: string;
  paymentFrequency: PaymentFrequency;
}

export interface UpdateReceivableRequest {
  borrowerName?: string;
  borrowerContact?: string;
  principal?: number;
  interestRate?: number;
  term?: number;
  monthlyPayment?: number;
  purpose?: string;
  paymentFrequency?: PaymentFrequency;
  status?: ReceivableStatus;
}

export interface CreateReceivablePaymentRequest {
  amount: number;
  method: ReceivablePaymentMethod;
  reference?: string;
  paymentDate: string;
  bankAccountId?: string | null;
  notes?: string;
}

export interface ReceivableFilters {
  status?: ReceivableStatus;
  borrowerName?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedReceivablesResponse {
  data: Receivable[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ReceivableAnalytics {
  totalOutstanding: number;
  totalPaid: number;
  totalReceivables: number;
  activeReceivables: number;
  completedReceivables: number;
  overdueReceivables: number;
}

