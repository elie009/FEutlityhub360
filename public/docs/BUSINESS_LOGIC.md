# Business Logic Documentation

## Loan Application Flow

### 1. Application Submission
1. User fills out loan application form
2. System validates all required fields and data formats
3. System calculates preliminary loan terms based on:
   - Principal amount
   - Selected term (6, 12, 24, 36, 48, or 60 months)
   - Interest rate (fixed at 12% annually)
4. Application is saved with status 'PENDING'
5. User receives confirmation notification

### 2. Admin Review Process
1. Admin receives notification of new application
2. Admin reviews application details
3. Admin can either:
   - **Approve**: Change status to 'APPROVED', set approval date
   - **Reject**: Change status to 'REJECTED', provide rejection reason
4. User receives notification of decision

### 3. Loan Disbursement
1. Approved loans are ready for disbursement
2. Admin initiates disbursement process
3. System creates disbursement transaction
4. Loan status changes to 'ACTIVE'
5. Repayment schedule is generated
6. User receives disbursement notification

## Interest Calculation

### Formula
`
Monthly Interest = (Principal  Annual Interest Rate) / 12
Total Interest = Monthly Interest  Term (in months)
Monthly Payment = (Principal + Total Interest) / Term
`

### Example
- Principal: ,000
- Term: 12 months
- Annual Interest Rate: 12%
- Monthly Interest: ,000  0.12 / 12 = 
- Total Interest:   12 = ,200
- Monthly Payment: (,000 + ,200) / 12 = .33

## Repayment Schedule Generation

### Process
1. Calculate monthly payment amount
2. For each month in the term:
   - Calculate interest portion: (Remaining Balance  Monthly Interest Rate)
   - Calculate principal portion: (Monthly Payment - Interest Portion)
   - Update remaining balance
   - Create repayment schedule entry

### Schedule Entry
- Installment Number: Sequential (1, 2, 3, ...)
- Due Date: Monthly from disbursement date
- Principal Amount: Calculated principal portion
- Interest Amount: Calculated interest portion
- Total Amount: Monthly payment amount
- Status: 'PENDING' initially

## Payment Processing

### 1. Payment Submission
1. User submits payment with:
   - Loan ID
   - Payment amount
   - Payment method
   - Reference number
2. System validates payment details
3. Payment is saved with status 'PENDING'

### 2. Payment Processing
1. System processes payment
2. Updates loan remaining balance
3. Updates repayment schedule entries
4. Creates transaction record
5. Sends payment confirmation notification

### 3. Payment Allocation
- Payments are applied to oldest outstanding installments first
- Interest is paid before principal
- Any excess payment is applied to principal

## Loan Status Transitions

### Status Flow
`
PENDING  APPROVED  ACTIVE  COMPLETED
             
REJECTED   DEFAULTED
`

### Status Rules
- **PENDING**: Initial state after application
- **APPROVED**: Admin approved, ready for disbursement
- **REJECTED**: Admin rejected, final state
- **ACTIVE**: Disbursed and active, accepting payments
- **COMPLETED**: All payments made, loan closed
- **DEFAULTED**: Missed payments, requires intervention

## Risk Assessment

### Basic Risk Factors
1. **Employment Status**: Higher risk for unemployed/students
2. **Monthly Income**: Lower income = higher risk
3. **Loan Amount**: Larger loans = higher risk
4. **Loan Term**: Longer terms = higher risk

### Risk Scoring (Future Enhancement)
- Score 1-100 based on risk factors
- Higher scores = higher interest rates or rejection
- Implement credit check integration

## Notification System

### Automatic Notifications
1. **Application Submitted**: Confirmation to user
2. **Application Reviewed**: Decision notification to user
3. **Loan Disbursed**: Disbursement confirmation to user
4. **Payment Due**: 3 days before due date
5. **Payment Received**: Confirmation after payment
6. **Payment Overdue**: 1 day after due date
7. **Loan Completed**: Final payment confirmation

### Notification Types
- **PAYMENT_DUE**: Payment reminder
- **PAYMENT_RECEIVED**: Payment confirmation
- **LOAN_APPROVED**: Approval notification
- **LOAN_REJECTED**: Rejection notification
- **GENERAL**: System announcements

## Audit and Logging

### Audit Trail
- All loan status changes
- All payment transactions
- All admin actions
- User login/logout events
- System errors and exceptions

### Logging Requirements
- Timestamp for all events
- User ID performing action
- Before/after values for changes
- IP address for security
- Request/response data for API calls

## Business Rules

### Loan Limits
- Minimum loan amount: ,000
- Maximum loan amount: ,000
- Maximum term: 60 months
- Interest rate: 12% annually (fixed)

### Payment Rules
- Minimum payment: .01
- Payment methods: Bank Transfer, Card, Wallet, Cash
- Reference numbers must be unique per loan
- Payments processed immediately

### User Rules
- One active loan per user at a time
- Users must be 18+ years old
- Valid email and phone required
- Password minimum 6 characters

### Admin Rules
- Only admins can approve/reject loans
- Only admins can disburse loans
- Only admins can close loans
- All admin actions are logged

## Error Handling

### Validation Errors
- Field validation errors return 400 Bad Request
- Include specific field errors in response
- Provide user-friendly error messages

### Business Logic Errors
- Duplicate applications return 409 Conflict
- Invalid loan status transitions return 400 Bad Request
- Insufficient permissions return 403 Forbidden

### System Errors
- Database errors return 500 Internal Server Error
- External service failures return 503 Service Unavailable
- All errors are logged for debugging
