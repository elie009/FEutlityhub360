// Validation utilities for the loan management system

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  // Remove all non-digit characters except + at the beginning
  const cleanedPhone = phone.replace(/[^\d+]/g, '');
  
  // Check if it contains only digits and optionally starts with +
  const phoneRegex = /^\+?[\d]+$/;
  
  // Must have at least 7 digits (minimum for most countries) and max 15 digits (international standard)
  const digitsOnly = cleanedPhone.replace(/^\+/, '');
  return phoneRegex.test(cleanedPhone) && digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

export const validatePassword = (password: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateLoanAmount = (amount: number, minAmount: number = 0.01, maxAmount: number = 100000): { isValid: boolean; error?: string } => {
  if (amount <= 0) {
    return { isValid: false, error: `Loan amount must be greater than $0` };
  }
  
  if (amount > maxAmount) {
    return { isValid: false, error: `Maximum loan amount is $${maxAmount.toLocaleString()}` };
  }
  
  return { isValid: true };
};

export const validatePaymentAmount = (amount: number, maxAmount: number): { isValid: boolean; error?: string } => {
  if (amount <= 0) {
    return { isValid: false, error: 'Payment amount must be greater than 0' };
  }
  
  if (amount > maxAmount) {
    return { isValid: false, error: `Payment amount cannot exceed $${maxAmount.toLocaleString()}` };
  }
  
  return { isValid: true };
};

export const validateRequired = (value: string | number, fieldName: string): { isValid: boolean; error?: string } => {
  // For numbers, check if it's a valid number (including 0)
  if (typeof value === 'number') {
    if (isNaN(value)) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    return { isValid: true };
  }
  
  // For strings, check if empty or whitespace only
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  
  return { isValid: true };
};

export const validateUsername = (username: string): { isValid: boolean; error?: string } => {
  if (!username || username.trim() === '') {
    return { isValid: false, error: 'Username is required' };
  }
  
  if (username.length < 3) {
    return { isValid: false, error: 'Username must be at least 3 characters long' };
  }
  
  if (username.length > 20) {
    return { isValid: false, error: 'Username must be no more than 20 characters long' };
  }
  
  // Username should only contain letters, numbers, underscores, and hyphens
  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  if (!usernameRegex.test(username)) {
    return { isValid: false, error: 'Username can only contain letters, numbers, underscores, and hyphens' };
  }
  
  return { isValid: true };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateMonthlyPayment = (principal: number, interestRate: number, term: number): number => {
  const monthlyRate = interestRate / 100 / 12;
  const numPayments = term;
  
  if (monthlyRate === 0) {
    return principal / numPayments;
  }
  
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
         (Math.pow(1 + monthlyRate, numPayments) - 1);
};

export const calculateTotalInterest = (principal: number, monthlyPayment: number, term: number): number => {
  return (monthlyPayment * term) - principal;
};

export const generateReferenceNumber = (prefix: string = 'REF'): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${prefix}-${timestamp}-${random}`.toUpperCase();
};

export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const validateLoanTerm = (term: number): { isValid: boolean; error?: string } => {
  const validTerms = [6, 12, 24, 36, 48, 60];
  
  if (!validTerms.includes(term)) {
    return { isValid: false, error: 'Invalid loan term selected' };
  }
  
  return { isValid: true };
};

export const validateEmploymentStatus = (status: string): { isValid: boolean; error?: string } => {
  const validStatuses = ['employed', 'self-employed', 'unemployed', 'retired', 'student'];
  
  if (!validStatuses.includes(status)) {
    return { isValid: false, error: 'Invalid employment status selected' };
  }
  
  return { isValid: true };
};

export const validateInterestRate = (rate: number, minRate: number = 0, maxRate: number = 50): { isValid: boolean; error?: string } => {
  if (rate < 0) {
    return { isValid: false, error: `Interest rate cannot be negative` };
  }
  
  if (rate > maxRate) {
    return { isValid: false, error: `Maximum interest rate is ${maxRate}%` };
  }
  
  return { isValid: true };
};

// Error handling utility
export const getErrorMessage = (err: unknown, fallback: string = 'An unknown error occurred'): string => {
  if (err instanceof Error) {
    return err.message;
  }
  if (typeof err === 'string') {
    return err;
  }
  return fallback;
};

// Enhanced error handling for API responses with errors array
export const getApiErrorMessage = (err: unknown, fallback: string = 'An unknown error occurred'): { message: string; fieldErrors: Record<string, string> } => {
  const fieldErrors: Record<string, string> = {};
  let message = fallback;
  
  if (err instanceof Error) {
    // Try to parse the error message as JSON to extract field-specific errors
    try {
      const errorData = JSON.parse(err.message);
      if (errorData.errors && Array.isArray(errorData.errors)) {
        // Parse field-specific errors from the errors array
        errorData.errors.forEach((error: string) => {
          // Look for field-specific error patterns like "Purpose: Invalid purpose"
          const fieldMatch = error.match(/^(\w+):\s*(.+)$/i);
          if (fieldMatch) {
            const [, field, errorMsg] = fieldMatch;
            fieldErrors[field.toLowerCase()] = errorMsg;
          } else {
            // If no field pattern, add to general message
            message = error;
          }
        });
        
        // If we have field errors but no general message, create one
        if (Object.keys(fieldErrors).length > 0 && message === fallback) {
          message = 'Please fix the following errors:';
        }
      } else if (errorData.message) {
        message = errorData.message;
      }
    } catch {
      // If parsing fails, use the error message as is
      message = err.message;
    }
  } else if (typeof err === 'string') {
    message = err;
  }
  
  return { message, fieldErrors };
};
