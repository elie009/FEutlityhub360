// Bill Management Types

export enum BillType {
  UTILITY = 'utility',
  SUBSCRIPTION = 'subscription',
  LOAN = 'loan',
  OTHERS = 'others',
}

export enum BillStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
}

export enum BillFrequency {
  MONTHLY = 'monthly',
  QUARTERLY = 'quarterly',
  YEARLY = 'yearly',
}

export interface Bill {
  id: string;
  userId: string;
  billName: string;
  billType: BillType;
  amount: number;
  dueDate: string;
  frequency: BillFrequency;
  status: BillStatus;
  createdAt: string;
  updatedAt: string;
  paidAt?: string;
  notes?: string;
  provider?: string;
  referenceNumber?: string;
}

export interface CreateBillRequest {
  billName: string;
  billType: BillType;
  amount: number;
  dueDate: string;
  frequency: BillFrequency;
  notes?: string;
  provider?: string;
  referenceNumber?: string;
}

export interface UpdateBillRequest {
  billName?: string;
  billType?: BillType;
  amount?: number;
  dueDate?: string;
  frequency?: BillFrequency;
  status?: BillStatus;
  notes?: string;
  provider?: string;
  referenceNumber?: string;
}

export interface BillFilters {
  status?: BillStatus;
  billType?: BillType;
  page?: number;
  limit?: number;
}

export interface BillAnalytics {
  totalPendingAmount: number;
  totalPaidAmount: number;
  totalOverdueAmount: number;
  totalPendingBills: number;
  totalPaidBills: number;
  totalOverdueBills: number;
  generatedAt: string;
}

export interface TotalPaidAnalytics {
  amount: number;
  count: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface PaginatedBillsResponse {
  data: Bill[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T;
  errors: string[];
}
