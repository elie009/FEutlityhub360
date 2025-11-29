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
  extractedItems?: ReceiptItem[];
  ocrText?: string;
  isOcrProcessed: boolean;
  ocrProcessedAt?: string;
  thumbnailPath?: string;
  notes?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceiptItem {
  description: string;
  price?: number;
  quantity?: number;
}

export interface ReceiptSearchParams {
  startDate?: string;
  endDate?: string;
  merchant?: string;
  minAmount?: number;
  maxAmount?: number;
  isOcrProcessed?: boolean;
  searchText?: string;
  page?: number;
  limit?: number;
}

export interface ExpenseMatch {
  expenseId: string;
  description: string;
  amount: number;
  expenseDate: string;
  merchant?: string;
  category: string;
  matchScore: number;
  matchReason: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string | null;
  data: T | null;
  errors: string[];
}

