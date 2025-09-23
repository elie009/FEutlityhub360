# Data Models Documentation

## Core Entities

### User
`	ypescript
interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
`

### Loan
`	ypescript
interface Loan {
  id: string;
  userId: string;
  principal: number;
  interestRate: number;
  term: number; // months
  purpose: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ACTIVE' | 'COMPLETED' | 'DEFAULTED';
  monthlyPayment: number;
  totalAmount: number;
  remainingBalance: number;
  appliedAt: string;
  approvedAt?: string;
  disbursedAt?: string;
  completedAt?: string;
  additionalInfo?: string;
}
`

### RepaymentSchedule
`	ypescript
interface RepaymentSchedule {
  id: string;
  loanId: string;
  installmentNumber: number;
  dueDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE';
  paidAt?: string;
}
`

### Payment
`	ypescript
interface Payment {
  id: string;
  loanId: string;
  userId: string;
  amount: number;
  method: 'BANK_TRANSFER' | 'CARD' | 'WALLET' | 'CASH';
  reference: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  processedAt: string;
  createdAt: string;
}
`

### Transaction
`	ypescript
interface Transaction {
  id: string;
  loanId: string;
  type: 'DISBURSEMENT' | 'PAYMENT' | 'INTEREST' | 'PENALTY';
  amount: number;
  description: string;
  reference?: string;
  createdAt: string;
}
`

### Notification
`	ypescript
interface Notification {
  id: string;
  userId: string;
  type: 'PAYMENT_DUE' | 'PAYMENT_RECEIVED' | 'LOAN_APPROVED' | 'LOAN_REJECTED' | 'GENERAL';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}
`

### LoanApplication
`	ypescript
interface LoanApplication {
  id: string;
  userId: string;
  principal: number;
  purpose: string;
  term: number;
  monthlyIncome: number;
  employmentStatus: 'employed' | 'self-employed' | 'unemployed' | 'retired' | 'student';
  additionalInfo?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}
`

## Request/Response Models

### LoginCredentials
`	ypescript
interface LoginCredentials {
  email: string;
  password: string;
}
`

### RegisterData
`	ypescript
interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}
`

### PaymentMethod
`	ypescript
interface PaymentMethod {
  type: 'BANK_TRANSFER' | 'CARD' | 'WALLET' | 'CASH';
  details?: {
    bankName?: string;
    accountNumber?: string;
    cardLast4?: string;
    walletProvider?: string;
  };
}
`

## Enums

### LoanStatus
- PENDING: Loan application submitted, awaiting review
- APPROVED: Loan approved by admin, ready for disbursement
- REJECTED: Loan application rejected
- ACTIVE: Loan disbursed and active
- COMPLETED: Loan fully repaid
- DEFAULTED: Loan in default due to missed payments

### PaymentMethod
- BANK_TRANSFER: Direct bank transfer
- CARD: Credit/Debit card payment
- WALLET: Digital wallet payment
- CASH: Cash payment

### NotificationType
- PAYMENT_DUE: Payment due reminder
- PAYMENT_RECEIVED: Payment confirmation
- LOAN_APPROVED: Loan approval notification
- LOAN_REJECTED: Loan rejection notification
- GENERAL: General system notification

### EmploymentStatus
- employed: Full-time or part-time employment
- self-employed: Self-employed or freelancer
- unemployed: Currently unemployed
- retired: Retired individual
- student: Full-time student

## Validation Rules

### User Validation
- name: 2-100 characters, required
- email: Valid email format, required, unique
- phone: Valid phone format, required
- password: Minimum 6 characters, required

### Loan Validation
- principal: 1000-100000, required
- purpose: 10-500 characters, required
- term: 6, 12, 24, 36, 48, or 60 months, required
- monthlyIncome: Minimum 1000, required
- employmentStatus: Must be one of the enum values, required

### Payment Validation
- amount: Minimum 0.01, required
- method: Must be one of the enum values, required
- reference: 3-50 characters, required, unique per loan
