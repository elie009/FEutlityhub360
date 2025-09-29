// Category-based logic for intelligent bank transaction linking

export interface CategorySuggestions {
  bill: string[];
  savings: string[];
  loan: string[];
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
 * Get category type (bill, savings, loan, other)
 */
export const getCategoryType = (category: string): 'bill' | 'savings' | 'loan' | 'other' => {
  if (isBillCategory(category)) return 'bill';
  if (isSavingsCategory(category)) return 'savings';
  if (isLoanCategory(category)) return 'loan';
  return 'other';
};

/**
 * Get all suggestions for a specific category type
 */
export const getSuggestionsByType = (type: 'bill' | 'savings' | 'loan' | 'other'): string[] => {
  return categorySuggestions[type];
};

/**
 * Validate transaction form based on category requirements
 */
export const validateTransactionForm = (formData: {
  bankAccountId: string;
  amount: number;
  description: string;
  category: string;
  billId?: string;
  savingsAccountId?: string;
  loanId?: string;
}): string[] => {
  const errors: string[] = [];
  
  // Basic validation
  if (!formData.bankAccountId) errors.push('Bank account is required');
  if (!formData.amount || formData.amount <= 0) errors.push('Amount must be greater than 0');
  if (!formData.description) errors.push('Description is required');
  if (!formData.category) errors.push('Category is required');
  
  // Category-specific validation
  if (isBillCategory(formData.category) && !formData.billId) {
    errors.push('Bill selection is required for bill-related transactions');
  }
  
  if (isSavingsCategory(formData.category) && !formData.savingsAccountId) {
    errors.push('Savings account selection is required for savings-related transactions');
  }
  
  if (isLoanCategory(formData.category) && !formData.loanId) {
    errors.push('Loan selection is required for loan-related transactions');
  }
  
  return errors;
};

/**
 * Generate enhanced description based on category and reference
 */
export const generateEnhancedDescription = (
  originalDescription: string,
  category: string,
  referenceType?: 'bill' | 'savings' | 'loan',
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
  return originalDescription;
};
