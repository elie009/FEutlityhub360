import { 
  AddCustomScheduleRequest, 
  ExtendLoanTermRequest, 
  RegenerateScheduleRequest, 
  UpdateScheduleRequest, 
  MarkAsPaidRequest, 
  UpdateDueDateRequest,
  RepaymentSchedule,
  PaymentStatus 
} from '../types/loan';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// Validation for Add Custom Schedule
export const validateAddCustomSchedule = (data: AddCustomScheduleRequest): ValidationResult => {
  const errors: string[] = [];

  if (!data.startingInstallmentNumber || data.startingInstallmentNumber < 1) {
    errors.push('Starting installment number must be greater than 0');
  }

  if (!data.numberOfMonths || data.numberOfMonths < 1 || data.numberOfMonths > 60) {
    errors.push('Number of months must be between 1 and 60');
  }

  if (!data.firstDueDate) {
    errors.push('First due date is required');
  } else {
    const dueDate = new Date(data.firstDueDate);
    const today = new Date();
    if (dueDate <= today) {
      errors.push('First due date must be in the future');
    }
  }

  if (!data.monthlyPayment || data.monthlyPayment <= 0) {
    errors.push('Monthly payment must be greater than 0');
  }

  if (data.monthlyPayment > 50000) {
    errors.push('Monthly payment cannot exceed $50,000');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation for Extend Loan Term
export const validateExtendLoanTerm = (data: ExtendLoanTermRequest): ValidationResult => {
  const errors: string[] = [];

  if (!data.additionalMonths || data.additionalMonths < 1 || data.additionalMonths > 60) {
    errors.push('Additional months must be between 1 and 60');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation for Regenerate Schedule
export const validateRegenerateSchedule = (data: RegenerateScheduleRequest): ValidationResult => {
  const errors: string[] = [];

  if (!data.newMonthlyPayment || data.newMonthlyPayment <= 0) {
    errors.push('New monthly payment must be greater than 0');
  }

  if (data.newMonthlyPayment > 50000) {
    errors.push('New monthly payment cannot exceed $50,000');
  }

  if (!data.newTerm || data.newTerm < 1 || data.newTerm > 60) {
    errors.push('New term must be between 1 and 60 months');
  }

  if (!data.startDate) {
    errors.push('Start date is required');
  } else {
    const startDate = new Date(data.startDate);
    const today = new Date();
    if (startDate <= today) {
      errors.push('Start date must be in the future');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation for Update Schedule
export const validateUpdateSchedule = (data: UpdateScheduleRequest): ValidationResult => {
  const errors: string[] = [];

  if (data.amount !== undefined && data.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (data.amount !== undefined && data.amount > 50000) {
    errors.push('Amount cannot exceed $50,000');
  }

  if (data.dueDate) {
    const dueDate = new Date(data.dueDate);
    if (isNaN(dueDate.getTime())) {
      errors.push('Due date must be a valid date');
    }
  }

  if (data.paidDate) {
    const paidDate = new Date(data.paidDate);
    if (isNaN(paidDate.getTime())) {
      errors.push('Paid date must be a valid date');
    }
    
    // Paid date should not be in the future
    const today = new Date();
    if (paidDate > today) {
      errors.push('Paid date cannot be in the future');
    }
  }

  if (data.status === 'PAID' && !data.paidDate && !data.paymentMethod) {
    errors.push('Paid date and payment method are required when marking as paid');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation for Mark as Paid
export const validateMarkAsPaid = (data: MarkAsPaidRequest): ValidationResult => {
  const errors: string[] = [];

  if (!data.amount || data.amount <= 0) {
    errors.push('Payment amount must be greater than 0');
  }

  if (data.amount > 50000) {
    errors.push('Payment amount cannot exceed $50,000');
  }

  if (!data.method || data.method.trim() === '') {
    errors.push('Payment method is required');
  }

  if (!data.reference || data.reference.trim() === '') {
    errors.push('Payment reference is required');
  }

  if (!data.paymentDate) {
    errors.push('Payment date is required');
  } else {
    const paymentDate = new Date(data.paymentDate);
    if (isNaN(paymentDate.getTime())) {
      errors.push('Payment date must be a valid date');
    }
    
    // Payment date should not be in the future
    const today = new Date();
    if (paymentDate > today) {
      errors.push('Payment date cannot be in the future');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Validation for Update Due Date
export const validateUpdateDueDate = (data: UpdateDueDateRequest): ValidationResult => {
  const errors: string[] = [];

  if (!data.newDueDate) {
    errors.push('New due date is required');
  } else {
    const dueDate = new Date(data.newDueDate);
    if (isNaN(dueDate.getTime())) {
      errors.push('New due date must be a valid date');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Business logic validations
export const canDeleteInstallment = (installment: RepaymentSchedule): ValidationResult => {
  const errors: string[] = [];

  if (installment.status === 'PAID') {
    errors.push('Cannot delete paid installments');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const canMarkAsPaid = (installment: RepaymentSchedule): ValidationResult => {
  const errors: string[] = [];

  if (installment.status === 'PAID') {
    errors.push('This installment is already marked as paid');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const canUpdateInstallment = (installment: RepaymentSchedule): ValidationResult => {
  const errors: string[] = [];

  // Generally, all installments can be updated, but add business rules here if needed
  // For example, you might not allow updating installments that are overdue by too long

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Utility functions for schedule operations
export const calculateScheduleImpact = (
  originalSchedule: RepaymentSchedule[],
  operation: 'add' | 'extend' | 'regenerate',
  data: AddCustomScheduleRequest | ExtendLoanTermRequest | RegenerateScheduleRequest
) => {
  const impact = {
    installmentsAdded: 0,
    totalAmountChange: 0,
    termChange: 0,
    monthlyPaymentChange: 0,
  };

  switch (operation) {
    case 'add':
      const addData = data as AddCustomScheduleRequest;
      impact.installmentsAdded = addData.numberOfMonths;
      impact.totalAmountChange = addData.monthlyPayment * addData.numberOfMonths;
      break;
      
    case 'extend':
      const extendData = data as ExtendLoanTermRequest;
      impact.termChange = extendData.additionalMonths;
      // Assuming the monthly payment remains the same for extended months
      if (originalSchedule.length > 0) {
        const avgMonthlyPayment = originalSchedule.reduce((sum, s) => sum + s.totalAmount, 0) / originalSchedule.length;
        impact.totalAmountChange = avgMonthlyPayment * extendData.additionalMonths;
      }
      break;
      
    case 'regenerate':
      const regenData = data as RegenerateScheduleRequest;
      const currentTotal = originalSchedule.reduce((sum, s) => sum + s.totalAmount, 0);
      const newTotal = regenData.newMonthlyPayment * regenData.newTerm;
      impact.totalAmountChange = newTotal - currentTotal;
      impact.termChange = regenData.newTerm - originalSchedule.length;
      if (originalSchedule.length > 0) {
        const avgCurrentPayment = currentTotal / originalSchedule.length;
        impact.monthlyPaymentChange = regenData.newMonthlyPayment - avgCurrentPayment;
      }
      break;
  }

  return impact;
};

// Format validation errors for display
export const formatValidationErrors = (errors: string[]): string => {
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return errors.map((error, index) => `${index + 1}. ${error}`).join('\n');
};

// Check if date is a valid business day (optional enhancement)
export const isBusinessDay = (date: Date): boolean => {
  const day = date.getDay();
  return day !== 0 && day !== 6; // Not Sunday (0) or Saturday (6)
};

// Suggest next business day if the given date is a weekend
export const getNextBusinessDay = (date: Date): Date => {
  const nextDay = new Date(date);
  while (!isBusinessDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  return nextDay;
};

// Validate payment reference format (customize as needed)
export const isValidPaymentReference = (reference: string): boolean => {
  // Basic validation - at least 3 characters, alphanumeric
  const referenceRegex = /^[A-Za-z0-9-_]{3,20}$/;
  return referenceRegex.test(reference);
};

// Calculate late fees if applicable
export const calculateLateFee = (installment: RepaymentSchedule, currentDate: Date = new Date()): number => {
  if (installment.status !== 'OVERDUE') return 0;
  
  const dueDate = new Date(installment.dueDate);
  const daysLate = Math.floor((currentDate.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (daysLate <= 0) return 0;
  
  // Example late fee calculation: 5% of the installment amount for every 30 days late
  const lateFeeRate = 0.05;
  const lateFeeMonths = Math.ceil(daysLate / 30);
  const lateFee = installment.totalAmount * lateFeeRate * lateFeeMonths;
  
  return Math.round(lateFee * 100) / 100; // Round to 2 decimal places
};
