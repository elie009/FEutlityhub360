// Validation utilities for the loan management system

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
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

export const validateLoanAmount = (amount: number, minAmount: number = 1000, maxAmount: number = 100000): { isValid: boolean; error?: string } => {
  if (amount < minAmount) {
    return { isValid: false, error: `Minimum loan amount is $${minAmount.toLocaleString()}` };
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
  if (!value || (typeof value === 'string' && value.trim() === '')) {
    return { isValid: false, error: `${fieldName} is required` };
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
