// Expense Management Types

export enum ApprovalStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NOT_REQUIRED = 'NOT_REQUIRED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  BANK_TRANSFER = 'BANK_TRANSFER',
  WALLET = 'WALLET',
  CHECK = 'CHECK',
}

export enum PeriodType {
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export enum RecurringFrequency {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
}

export interface Expense {
  id: string;
  userId: string;
  description: string;
  amount: number;
  categoryId: string;
  categoryName: string;
  expenseDate: string;
  currency: string;
  notes?: string;
  merchant?: string;
  paymentMethod?: PaymentMethod;
  bankAccountId?: string;
  location?: string;
  isTaxDeductible: boolean;
  isReimbursable: boolean;
  reimbursementRequestId?: string;
  mileage?: number;
  mileageRate?: number;
  perDiemAmount?: number;
  numberOfDays?: number;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: string;
  approvalNotes?: string;
  hasReceipt: boolean;
  receiptId?: string;
  receipt?: Receipt;
  budgetId?: string;
  isRecurring: boolean;
  recurringFrequency?: RecurringFrequency;
  parentExpenseId?: string;
  tags?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseRequest {
  description: string;
  amount: number;
  categoryId: string;
  expenseDate: string;
  currency?: string;
  notes?: string;
  merchant?: string;
  paymentMethod?: PaymentMethod;
  bankAccountId?: string;
  location?: string;
  isTaxDeductible?: boolean;
  isReimbursable?: boolean;
  mileage?: number;
  mileageRate?: number;
  perDiemAmount?: number;
  numberOfDays?: number;
  approvalStatus?: ApprovalStatus;
  isRecurring?: boolean;
  recurringFrequency?: RecurringFrequency;
  tags?: string;
  budgetId?: string;
}

export interface UpdateExpenseRequest {
  description?: string;
  amount?: number;
  categoryId?: string;
  expenseDate?: string;
  currency?: string;
  notes?: string;
  merchant?: string;
  paymentMethod?: PaymentMethod;
  bankAccountId?: string;
  location?: string;
  isTaxDeductible?: boolean;
  isReimbursable?: boolean;
  mileage?: number;
  mileageRate?: number;
  perDiemAmount?: number;
  numberOfDays?: number;
  tags?: string;
  budgetId?: string;
}

export interface ExpenseCategory {
  id: string;
  userId: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  monthlyBudget?: number;
  yearlyBudget?: number;
  parentCategoryId?: string;
  parentCategoryName?: string;
  isTaxDeductible: boolean;
  taxCategory?: string;
  isActive: boolean;
  displayOrder: number;
  expenseCount: number;
  totalExpenses: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseCategoryRequest {
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  monthlyBudget?: number;
  yearlyBudget?: number;
  parentCategoryId?: string;
  isTaxDeductible?: boolean;
  taxCategory?: string;
  displayOrder?: number;
}

export interface UpdateExpenseCategoryRequest {
  name?: string;
  description?: string;
  icon?: string;
  color?: string;
  monthlyBudget?: number;
  yearlyBudget?: number;
  parentCategoryId?: string;
  isTaxDeductible?: boolean;
  taxCategory?: string;
  isActive?: boolean;
  displayOrder?: number;
}

export interface ExpenseBudget {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  periodType: PeriodType;
  startDate: string;
  endDate: string;
  notes?: string;
  alertThreshold?: number;
  isActive: boolean;
  spentAmount: number;
  remainingAmount: number;
  percentageUsed: number;
  isOverBudget: boolean;
  isNearLimit: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseBudgetRequest {
  categoryId: string;
  budgetAmount: number;
  periodType: PeriodType;
  startDate: string;
  endDate: string;
  notes?: string;
  alertThreshold?: number;
}

export interface UpdateExpenseBudgetRequest {
  budgetAmount?: number;
  periodType?: PeriodType;
  startDate?: string;
  endDate?: string;
  notes?: string;
  alertThreshold?: number;
  isActive?: boolean;
}

export interface Receipt {
  id: string;
  userId: string;
  expenseId?: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  originalFileName?: string;
  extractedAmount?: number;
  extractedDate?: string;
  extractedMerchant?: string;
  extractedItems?: string;
  ocrText?: string;
  isOcrProcessed: boolean;
  ocrProcessedAt?: string;
  thumbnailPath?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseApproval {
  id: string;
  expenseId: string;
  expense?: Expense;
  requestedBy: string;
  approvedBy?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  notes?: string;
  rejectionReason?: string;
  requestedAt: string;
  reviewedAt?: string;
  approvalLevel: number;
  nextApproverId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitExpenseForApprovalRequest {
  expenseId: string;
  notes?: string;
}

export interface ApproveExpenseRequest {
  approvalId: string;
  notes?: string;
}

export interface RejectExpenseRequest {
  approvalId: string;
  rejectionReason: string;
  notes?: string;
}

export interface ExpenseFilters {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  approvalStatus?: ApprovalStatus;
  minAmount?: number;
  maxAmount?: number;
  merchant?: string;
  isTaxDeductible?: boolean;
  isReimbursable?: boolean;
  hasReceipt?: boolean;
  tags?: string;
  page?: number;
  pageSize?: number;
}

export interface ExpenseReport {
  startDate: string;
  endDate: string;
  totalExpenses: number;
  totalCount: number;
  averageExpense: number;
  categorySummaries: CategoryExpenseSummary[];
  expenses: Expense[];
  dailyExpenses: Record<string, number>;
  monthlyExpenses: Record<string, number>;
  taxDeductibleTotal: number;
  reimbursableTotal: number;
}

export interface CategoryExpenseSummary {
  categoryId: string;
  categoryName: string;
  totalAmount: number;
  count: number;
  percentage: number;
  budgetAmount?: number;
  budgetRemaining?: number;
  isOverBudget: boolean;
}

export interface PaginatedExpensesResponse {
  data: Expense[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors: string[];
}

