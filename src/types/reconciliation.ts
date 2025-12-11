// Bank Statement Types
export interface BankStatement {
  id: string;
  userId: string;
  bankAccountId: string;
  statementName: string;
  statementStartDate: string;
  statementEndDate: string;
  openingBalance: number;
  closingBalance: number;
  importFormat?: string;
  importSource?: string;
  totalTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  isReconciled: boolean;
  reconciledAt?: string;
  reconciledBy?: string;
  createdAt: string;
  updatedAt: string;
  statementItems?: BankStatementItem[];
}

export interface BankStatementItem {
  id: string;
  bankStatementId: string;
  transactionDate: string;
  amount: number;
  transactionType: string;
  description?: string;
  referenceNumber?: string;
  merchant?: string;
  category?: string;
  balanceAfterTransaction: number;
  isMatched: boolean;
  matchedTransactionId?: string;
  matchedTransactionType?: string;
  matchedAt?: string;
  matchedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ImportBankStatementRequest {
  bankAccountId: string;
  statementName: string;
  statementStartDate: string;
  statementEndDate: string;
  openingBalance: number;
  closingBalance: number;
  importFormat?: string;
  importSource?: string;
  statementItems: BankStatementItemImport[];
}

export interface BankStatementItemImport {
  transactionDate: string;
  amount: number;
  transactionType: string;
  description?: string;
  referenceNumber?: string;
  merchant?: string;
  category?: string;
  balanceAfterTransaction: number;
}

// Reconciliation Types
export interface Reconciliation {
  id: string;
  userId: string;
  bankAccountId: string;
  bankStatementId?: string;
  reconciliationName: string;
  reconciliationDate: string;
  bookBalance: number;
  statementBalance: number;
  difference: number;
  totalTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  pendingTransactions: number;
  status: ReconciliationStatus;
  notes?: string;
  completedAt?: string;
  completedBy?: string;
  createdAt: string;
  updatedAt: string;
  matches?: ReconciliationMatch[];
}

export type ReconciliationStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DISCREPANCY';

export interface ReconciliationMatch {
  id: string;
  reconciliationId: string;
  systemTransactionId: string;
  systemTransactionType: string;
  statementItemId?: string;
  matchType: MatchType;
  amount: number;
  transactionDate: string;
  description?: string;
  matchStatus: MatchStatus;
  matchNotes?: string;
  amountDifference?: number;
  createdAt: string;
  updatedAt: string;
  matchedBy?: string;
}

export type MatchType = 'AUTO' | 'MANUAL' | 'SUGGESTED';
export type MatchStatus = 'MATCHED' | 'UNMATCHED' | 'PENDING' | 'DISPUTED';

export interface CreateReconciliationRequest {
  bankAccountId: string;
  bankStatementId?: string;
  reconciliationName: string;
  reconciliationDate: string;
  notes?: string;
}

export interface MatchTransactionRequest {
  reconciliationId: string;
  systemTransactionId: string;
  systemTransactionType: string;
  statementItemId?: string;
  matchType: MatchType;
  matchNotes?: string;
}

export interface UnmatchTransactionRequest {
  matchId: string;
}

export interface CompleteReconciliationRequest {
  reconciliationId: string;
  notes?: string;
}

export interface ReconciliationSummary {
  reconciliationId?: string;
  bankAccountId: string;
  bankAccountName: string;
  reconciliationDate: string;
  bookBalance: number;
  statementBalance: number;
  difference: number;
  totalTransactions: number;
  matchedTransactions: number;
  unmatchedTransactions: number;
  pendingTransactions: number;
  status: ReconciliationStatus;
  isBalanced: boolean;
}

export interface TransactionMatchSuggestion {
  systemTransactionId: string;
  systemTransactionType: string;
  statementItemId?: string;
  amount: number;
  transactionDate: string;
  description?: string;
  matchScore: number;
  matchReason: string;
}

// AI Extraction Types
export interface ExtractBankStatementResponse {
  statementName: string;
  statementStartDate?: string;
  statementEndDate?: string;
  openingBalance?: number;
  closingBalance?: number;
  importFormat: string;
  importSource: string;
  statementItems: BankStatementItemImport[];
  extractedText?: string;
  metadata?: Record<string, any>;
}

// Upload Limit Types
export interface BankStatementUploadLimit {
  canUpload: boolean;
  currentUploads: number;
  uploadLimit: number | null;
  remainingUploads: number | null;
  isFreeTier: boolean;
}

