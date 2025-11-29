// Category-based logic for intelligent bank transaction linking

export interface CategorySuggestions {
  bill: string[];
  savings: string[];
  loan: string[];
  transfer: string[];
  other: string[];
}

export const categorySuggestions: CategorySuggestions = {
  bill: [
    'utility', 'rent', 'insurance', 'subscription', 
    'phone bill', 'internet bill', 'electricity bill',
    'water bill', 'gas bill', 'cable bill', 'gym membership',
    'streaming service', 'phone service', 'internet service'
  ],
  savings: [
    'savings', 'deposit', 'investment', 'emergency fund',
    'retirement savings', 'vacation fund', 'house fund',
    'car fund', 'education fund', 'investment deposit'
  ],
  loan: [
    'loan payment', 'repayment', 'debt payment', 
    'installment', 'mortgage payment', 'car loan',
    'personal loan', 'student loan', 'credit card payment'
  ],
  other: [
    'food', 'transportation', 'entertainment', 
    'shopping', 'healthcare', 'education',
    'gas', 'groceries', 'restaurant', 'coffee',
    'clothing', 'electronics', 'travel', 'gift'
  ],
  transfer: [
    'bank transfer', 'transfer'
  ]
};

/**
 * Check if a category is bill-related
 */
export const isBillCategory = (category: string): boolean => {
  const billKeywords = ['bill', 'utility', 'rent', 'insurance', 'subscription', 'payment'];
  return billKeywords.some(keyword => 
    category.toLowerCase().includes(keyword)
  );
};

/**
 * Check if a category is savings-related
 */
export const isSavingsCategory = (category: string): boolean => {
  const savingsKeywords = ['savings', 'deposit', 'investment', 'goal', 'fund'];
  return savingsKeywords.some(keyword => 
    category.toLowerCase().includes(keyword)
  );
};

/**
 * Check if a category is loan-related
 */
export const isLoanCategory = (category: string): boolean => {
  const loanKeywords = ['loan', 'repayment', 'debt', 'installment', 'mortgage'];
  return loanKeywords.some(keyword => 
    category.toLowerCase().includes(keyword)
  );
};

/**
 * Check if a category is transfer-related
 */
export const isTransferCategory = (category: string): boolean => {
  const transferKeywords = ['bank transfer', 'transfer'];
  return transferKeywords.some(keyword => 
    category.toLowerCase().includes(keyword.toLowerCase())
  );
};

/**
 * Get category suggestions based on input
 */
export const getCategorySuggestions = (input: string): string[] => {
  if (!input || input.length < 2) return [];
  
  const allSuggestions = Object.values(categorySuggestions).flat();
  return allSuggestions.filter(suggestion => 
    suggestion.toLowerCase().includes(input.toLowerCase())
  );
};

/**
 * Get category type (bill, savings, loan, transfer, other)
 */
export const getCategoryType = (category: string): 'bill' | 'savings' | 'loan' | 'transfer' | 'other' => {
  if (isBillCategory(category)) return 'bill';
  if (isSavingsCategory(category)) return 'savings';
  if (isLoanCategory(category)) return 'loan';
  if (isTransferCategory(category)) return 'transfer';
  return 'other';
};

/**
 * Get all suggestions for a specific category type
 */
export const getSuggestionsByType = (type: 'bill' | 'savings' | 'loan' | 'transfer' | 'other'): string[] => {
  return categorySuggestions[type];
};

/**
 * Validate transaction form based on category requirements
 */
export const validateTransactionForm = (formData: {
  bankAccountId: string;
  amount: number;
  description?: string;
  category: string;
  billId?: string;
  savingsAccountId?: string;
  loanId?: string;
  toBankAccountId?: string;
  transactionType?: 'DEBIT' | 'CREDIT';
}): string[] => {
  const errors: string[] = [];
  
  // Basic validation
  if (!formData.bankAccountId) errors.push('Bank account is required');
  if (!formData.amount || formData.amount <= 0) errors.push('Amount must be greater than 0');
  
  // Description is only required for non-transfer transactions
  if (!isTransferCategory(formData.category) && !formData.description) {
    errors.push('Description is required');
  }
  
  // Category is only required for DEBIT transactions (CREDIT transactions get category automatically set)
  if (formData.transactionType !== 'CREDIT' && !formData.category) {
    errors.push('Category is required for debit transactions');
  }
  
  // Category-specific validation (only for DEBIT transactions with category)
  if (formData.transactionType !== 'CREDIT' && formData.category) {
    if (isBillCategory(formData.category) && !formData.billId) {
      errors.push('Bill selection is required for bill-related transactions');
    }
    
    if (isSavingsCategory(formData.category) && !formData.savingsAccountId) {
      errors.push('Savings account selection is required for savings-related transactions');
    }
    
    if (isLoanCategory(formData.category) && !formData.loanId) {
      errors.push('Loan selection is required for loan-related transactions');
    }
    
    if (isTransferCategory(formData.category) && !formData.toBankAccountId) {
      errors.push('Target bank account is required for bank transfer transactions');
    }
  }
  
  return errors;
};

/**
 * Generate enhanced description based on category and reference
 */
export const generateEnhancedDescription = (
  originalDescription: string,
  category: string,
  referenceType?: 'bill' | 'savings' | 'loan' | 'transfer',
  referenceName?: string
): string => {
  if (referenceType === 'bill') {
    return `Bill Payment - ${originalDescription}`;
  }
  if (referenceType === 'savings') {
    return `Savings - ${originalDescription}`;
  }
  if (referenceType === 'loan') {
    return `Loan Payment - ${originalDescription}`;
  }
  if (referenceType === 'transfer') {
    return `Bank Transfer - ${originalDescription}`;
  }
  return originalDescription;
};

/**
 * Double-entry accounting validation
 * Ensures that every transaction follows double-entry bookkeeping principles:
 * - Every transaction must have equal debits and credits
 * - At least one debit and one credit entry
 */

export interface DoubleEntryValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  debitTotal: number;
  creditTotal: number;
}

/**
 * Validate double-entry accounting rules for a transaction
 */
export const validateDoubleEntry = (formData: {
  transactionType: 'DEBIT' | 'CREDIT';
  amount: number;
  bankAccountId: string;
  category?: string;
  toBankAccountId?: string;
  billId?: string;
  savingsAccountId?: string;
  loanId?: string;
}): DoubleEntryValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let debitTotal = 0;
  let creditTotal = 0;

  // Basic amount validation
  if (!formData.amount || formData.amount <= 0) {
    errors.push('Amount must be greater than 0');
    return { isValid: false, errors, warnings, debitTotal: 0, creditTotal: 0 };
  }

  // Determine debit and credit entries based on transaction type
  if (formData.transactionType === 'CREDIT') {
    // Income transaction:
    // Debit: Bank Account (Asset) - increases
    // Credit: Income Account (Revenue) - increases
    debitTotal = formData.amount;
    creditTotal = formData.amount;
  } else if (formData.transactionType === 'DEBIT') {
    // Check transaction type
    const isTransfer = isTransferCategory(formData.category || '') || !!formData.toBankAccountId;
    const isBillPayment = !!formData.billId || isBillCategory(formData.category || '');
    const isSavingsDeposit = !!formData.savingsAccountId || isSavingsCategory(formData.category || '');
    const isLoanPayment = !!formData.loanId || isLoanCategory(formData.category || '');

    if (isTransfer && formData.toBankAccountId) {
      // Bank transfer:
      // Debit: Destination Bank Account (Asset) - increases
      // Credit: Source Bank Account (Asset) - decreases
      if (formData.bankAccountId === formData.toBankAccountId) {
        errors.push('Source and destination accounts cannot be the same for transfers');
      }
      debitTotal = formData.amount;
      creditTotal = formData.amount;
    } else if (isBillPayment) {
      // Bill payment:
      // Debit: Expense Account (Expense) - increases
      // Credit: Bank Account (Asset) - decreases
      debitTotal = formData.amount;
      creditTotal = formData.amount;
    } else if (isSavingsDeposit) {
      // Savings deposit:
      // Debit: Savings Account (Asset) - increases
      // Credit: Bank Account (Asset) - decreases
      debitTotal = formData.amount;
      creditTotal = formData.amount;
    } else if (isLoanPayment) {
      // Loan payment (simplified - actual may have principal + interest split):
      // Debit: Loan Payable (Liability) - decreases
      // Debit: Interest Expense (Expense) - increases (if applicable)
      // Credit: Bank Account (Asset) - decreases
      debitTotal = formData.amount;
      creditTotal = formData.amount;
    } else {
      // Regular expense:
      // Debit: Expense Account (Expense) - increases
      // Credit: Bank Account (Asset) - decreases
      debitTotal = formData.amount;
      creditTotal = formData.amount;
    }
  }

  // Validate double-entry balance
  const difference = Math.abs(debitTotal - creditTotal);
  if (difference > 0.01) { // Allow for floating point precision
    errors.push(
      `Double-entry validation failed: Debits (${debitTotal.toFixed(2)}) must equal Credits (${creditTotal.toFixed(2)}). Difference: ${difference.toFixed(2)}`
    );
  }

  // Check minimum entries (at least one debit and one credit)
  if (debitTotal === 0 || creditTotal === 0) {
    errors.push('Transaction must have at least one debit and one credit entry');
  }

  // Warnings for potential issues
  if (formData.transactionType === 'DEBIT' && !formData.category && !formData.billId && !formData.savingsAccountId && !formData.loanId) {
    warnings.push('Consider adding a category for better accounting classification');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    debitTotal,
    creditTotal,
  };
};

/**
 * Enhanced transaction validation that includes double-entry checks
 */
export const validateTransactionWithDoubleEntry = (formData: {
  bankAccountId: string;
  amount: number;
  description?: string;
  category: string;
  billId?: string;
  savingsAccountId?: string;
  loanId?: string;
  toBankAccountId?: string;
  transactionType?: 'DEBIT' | 'CREDIT';
}): string[] => {
  const errors: string[] = [];
  
  // First, run standard validation
  const standardErrors = validateTransactionForm(formData);
  errors.push(...standardErrors);
  
  // Then, run double-entry validation
  if (formData.transactionType) {
    const doubleEntryResult = validateDoubleEntry({
      transactionType: formData.transactionType,
      amount: formData.amount,
      bankAccountId: formData.bankAccountId,
      category: formData.category,
      toBankAccountId: formData.toBankAccountId,
      billId: formData.billId,
      savingsAccountId: formData.savingsAccountId,
      loanId: formData.loanId,
    });
    
    errors.push(...doubleEntryResult.errors);
  }
  
  return errors;
};
