# Loan Payment Schedule Management Guide

## 📋 Overview

This guide explains how to use the comprehensive loan payment schedule management system implemented in the UtilityHub360 frontend. The system allows you to manage payment schedules for loans with full CRUD operations.

## 🎯 Features

### ✅ What You Can Do

1. **View Payment Schedules**: See all payment installments with status indicators
2. **Add Custom Installments**: Insert specific payment months into existing schedules
3. **Extend Loan Terms**: Add additional months to the end of your loan
4. **Regenerate Schedules**: Replace entire payment schedule with new terms
5. **Update Installments**: Modify amount, status, due dates, and payment details
6. **Mark as Paid**: Record payment information with full details
7. **Delete Installments**: Remove pending installments (paid ones cannot be deleted)

## 🚀 Quick Start

### Accessing Schedule Management

1. Navigate to **Loans** section in the application
2. Click on any loan to view **Loan Details**
3. Click on the **"Schedule Management"** tab
4. You'll see the payment schedule table with action buttons

## 📖 User Guide

### 1. Viewing Payment Schedule

The schedule table displays:
- **Installment Number**: Sequential payment number
- **Due Date**: When payment is due
- **Amount**: Total payment amount
- **Principal**: Principal portion of payment
- **Interest**: Interest portion of payment
- **Status**: Current status (Pending, Paid, Overdue, Partial)
- **Payment Method**: How it was paid (if applicable)
- **Actions**: Menu for operations on each installment

#### Status Colors
- 🟢 **Green (Paid)**: Payment completed
- 🔴 **Red (Overdue)**: Payment past due date
- 🟡 **Yellow (Partial)**: Partial payment made
- ⚪ **Gray (Pending)**: Payment not yet due/made

### 2. Adding Custom Payment Installments

**Use Case**: You want to add specific payment months (e.g., catch-up payments)

**Steps**:
1. Click **"Add Schedule"** button
2. Navigate to **"Add Custom Installments"** tab
3. Fill in the form:
   - **Starting Installment Number**: Where to insert payments (e.g., 13)
   - **Number of Months**: How many payments to add (e.g., 3)
   - **First Due Date**: When first payment is due
   - **Monthly Payment**: Amount for each payment (e.g., $1200)
   - **Reason** (optional): Why you're adding these (e.g., "Adding catch-up payments")
4. Click **"Add Custom Schedule"**

**Example**:
```
Starting Installment: 13
Number of Months: 3
First Due Date: July 15, 2024
Monthly Payment: $1,200
Reason: Adding catch-up payments for missed period
```

**Result**: Adds installments #13, #14, #15 with monthly payments of $1,200

### 3. Extending Loan Term

**Use Case**: You need to extend your loan by adding months to the end

**Steps**:
1. Click **"Extend Term"** button
2. Navigate to **"Extend Term"** tab
3. Fill in:
   - **Additional Months**: Number of months to add (1-60)
   - **Reason** (optional): Why extending (e.g., "Financial hardship extension")
4. Review the impact preview showing current vs. new term
5. Click **"Extend Loan Term"**

**Example**:
```
Current Term: 12 months
Additional Months: 6
New Term: 18 months
Reason: Financial hardship - need more time to pay
```

### 4. Regenerating Entire Schedule

**Use Case**: You want to restructure the loan with completely new terms

**Steps**:
1. Click **"Regenerate Schedule"** button
2. Navigate to **"Regenerate Schedule"** tab
3. Fill in:
   - **New Monthly Payment**: New payment amount
   - **New Term**: New loan duration in months
   - **Start Date**: When new schedule begins
   - **Reason** (optional): Why regenerating (e.g., "Loan restructuring")
4. Review the comparison showing old vs. new terms
5. Click **"Regenerate Schedule"**

⚠️ **Warning**: This replaces your ENTIRE schedule. Cannot be undone!

**Example**:
```
Old Monthly Payment: $1,000
New Monthly Payment: $750
Old Term: 12 months
New Term: 24 months
Start Date: February 1, 2024
Reason: Lower monthly payment requested
```

### 5. Updating Individual Installments

**Use Case**: You need to modify a specific installment's details

**Steps**:
1. Click the **three-dot menu (⋮)** on the installment row
2. Select **"Update Schedule"**
3. Modify any fields:
   - **Amount**: Change payment amount
   - **Status**: Update status (Pending, Paid, Overdue, Partial)
   - **Due Date**: Change when payment is due
   - **Paid Date**: When payment was made
   - **Payment Method**: Cash, Bank Transfer, Card, Wallet
   - **Payment Reference**: Reference number (e.g., PAY-001)
   - **Notes**: Additional information
4. Click **"Update Schedule"**

**Example**:
```
Installment #3
Amount: $900 (changed from $825)
Status: PAID
Due Date: December 20, 2024
Paid Date: December 1, 2024
Payment Method: CASH
Reference: PAY-001
Notes: Updated amount and marked as paid
```

### 6. Marking Installment as Paid

**Use Case**: You received a payment and want to record it

**Steps**:
1. Click the **three-dot menu (⋮)** on the installment row
2. Select **"Mark as Paid"**
3. Fill in payment details:
   - **Payment Amount**: Amount received (e.g., $825)
   - **Payment Method**: Cash, Bank Transfer, Card, Wallet
   - **Payment Reference**: Reference number (required)
   - **Payment Date**: When payment was received
   - **Notes** (optional): Additional information
4. Click **"Mark as Paid"**

**Example**:
```
Payment Amount: $825
Method: CASH
Reference: PAY-2024-001
Payment Date: December 1, 2024
Notes: Payment received in cash from borrower
```

### 7. Updating Due Date Only

**Use Case**: You need to change when a payment is due

**Steps**:
1. Click the **three-dot menu (⋮)** on the installment row
2. Select **"Update Due Date"**
3. Select the new due date
4. Click **"Update Date"**

**Example**:
```
Current Due Date: December 15, 2024
New Due Date: December 20, 2024
```

### 8. Deleting Installments

**Use Case**: You need to remove an installment that's no longer needed

**Steps**:
1. Click the **three-dot menu (⋮)** on the installment row
2. Select **"Delete Installment"**
3. Confirm the deletion

**Rules**:
- ✅ Can delete: PENDING installments
- ❌ Cannot delete: PAID installments
- Updates loan totals automatically

## 🔒 Business Rules

### What You Can Do
- ✅ Update any installment field
- ✅ Mark pending/overdue installments as paid
- ✅ Change due dates for any installment
- ✅ Delete pending installments
- ✅ Add installments anywhere in schedule
- ✅ Extend loan terms
- ✅ Regenerate entire schedules

### What You Cannot Do
- ❌ Delete paid installments
- ❌ Set paid date in the future
- ❌ Set monthly payment above $50,000
- ❌ Add more than 60 months at once
- ❌ Set due dates in the past (for new installments)

## 📊 API Integration

### Backend APIs Used

| Action | Method | Endpoint |
|--------|--------|----------|
| **Add Custom Installments** | POST | `/api/Loans/{loanId}/add-schedule` |
| **Extend Loan Term** | POST | `/api/Loans/{loanId}/extend-term` |
| **Regenerate Schedule** | POST | `/api/Loans/{loanId}/regenerate-schedule` |
| **Update Schedule** | PATCH | `/api/Loans/{loanId}/schedule/{installmentNumber}` |
| **Mark as Paid** | POST | `/api/Loans/{loanId}/schedule/{installmentNumber}/mark-paid` |
| **Change Due Date** | PUT | `/api/Loans/{loanId}/schedule/{installmentNumber}` |
| **Delete Installment** | DELETE | `/api/Loans/{loanId}/schedule/{installmentNumber}` |
| **Get Full Schedule** | GET | `/api/Loans/{loanId}/schedule` |
| **Get Upcoming Payments** | GET | `/api/Loans/upcoming-payments?days=30` |
| **Get Overdue Payments** | GET | `/api/Loans/overdue-payments` |

### Mock Data Support

The system includes mock data implementations for all APIs, allowing you to:
- Test without backend connectivity
- Develop new features independently
- Demo the functionality

To enable mock data mode, set `USE_MOCK_DATA=true` in your environment configuration.

## 🎨 UI Components

### Components Created

1. **PaymentScheduleManager** (`src/components/Loans/PaymentScheduleManager.tsx`)
   - Main schedule management interface
   - Schedule table with actions
   - Quick action buttons

2. **AddScheduleDialog** (`src/components/Loans/AddScheduleDialog.tsx`)
   - Multi-tab dialog for adding schedules
   - Form validation
   - Impact preview

3. **UpdateScheduleDialog** (`src/components/Loans/UpdateScheduleDialog.tsx`)
   - Flexible update interface
   - Three operation modes
   - Current vs. new comparison

### Integration

The components are integrated into the **LoanDetails** component with:
- New "Schedule Management" tab
- Success/error notifications
- Automatic schedule refresh after operations

## 🛠️ Technical Details

### Type Definitions

```typescript
// Add Custom Schedule
interface AddCustomScheduleRequest {
  startingInstallmentNumber: number;
  numberOfMonths: number;
  firstDueDate: string;
  monthlyPayment: number;
  reason?: string;
}

// Extend Loan Term
interface ExtendLoanTermRequest {
  additionalMonths: number;
  reason?: string;
}

// Regenerate Schedule
interface RegenerateScheduleRequest {
  newMonthlyPayment: number;
  newTerm: number;
  startDate: string;
  reason?: string;
}

// Update Schedule
interface UpdateScheduleRequest {
  amount?: number;
  status?: PaymentStatus;
  dueDate?: string;
  paidDate?: string;
  paymentMethod?: string;
  paymentReference?: string;
  notes?: string;
}

// Mark as Paid
interface MarkAsPaidRequest {
  amount: number;
  method: string;
  reference: string;
  paymentDate: string;
  notes?: string;
}
```

### Validation

All operations include comprehensive validation:
- Amount limits (max $50,000)
- Date validations (future/past constraints)
- Required field checks
- Business rule enforcement
- Payment reference format validation

See `src/utils/scheduleValidation.ts` for all validation functions.

## 🔧 Configuration

### Environment Variables

```env
# Backend API URL
REACT_APP_API_BASE_URL=https://your-api-url.com

# Enable mock data (for development/testing)
REACT_APP_USE_MOCK_DATA=false
```

### Dependencies

Required packages (already installed):
```json
{
  "@mui/material": "^5.18.0",
  "@mui/icons-material": "^5.14.19",
  "@mui/x-date-pickers": "^6.x.x",
  "date-fns": "^2.x.x"
}
```

## 🐛 Troubleshooting

### Common Issues

**Issue**: Date picker not showing
- **Solution**: Ensure `@mui/x-date-pickers` and `date-fns` are installed

**Issue**: "Cannot delete paid installments" error
- **Solution**: You can only delete PENDING installments

**Issue**: API errors
- **Solution**: Check backend connectivity and API endpoints

**Issue**: Validation errors
- **Solution**: Check that all required fields are filled and values are within allowed ranges

## 📝 Best Practices

1. **Always provide a reason** when modifying schedules (helps with audit trail)
2. **Review impact previews** before confirming changes
3. **Use the refresh button** to ensure you're seeing the latest data
4. **Keep payment references unique** for tracking
5. **Document notes** for significant changes
6. **Test with mock data** before production use

## 🎯 Common Use Cases

### Scenario 1: Borrower Makes Early Payment

1. Go to the installment that was paid
2. Click menu → "Mark as Paid"
3. Enter payment details
4. System automatically updates loan balance

### Scenario 2: Borrower Needs Extension

1. Click "Extend Term"
2. Add desired number of months
3. Provide reason (e.g., "Financial hardship")
4. System adds months to end of schedule

### Scenario 3: Loan Restructuring Required

1. Click "Regenerate Schedule"
2. Enter new monthly payment and term
3. Review comparison of old vs. new
4. Confirm to replace entire schedule

### Scenario 4: Missed Payment Catch-Up

1. Click "Add Schedule"
2. Go to "Add Custom Installments"
3. Insert catch-up payments where needed
4. System recalculates loan totals

## 📞 Support

For issues or questions:
- Check this documentation first
- Review the API documentation: `docs/API_ENDPOINTS.md`
- Check validation rules: `src/utils/scheduleValidation.ts`
- Contact development team for backend API issues

## 🚀 What's Next

Future enhancements planned:
- Bulk operations on multiple installments
- Payment schedule templates
- Automatic late fee calculations
- Payment reminder notifications
- Export schedule to PDF/Excel
- Schedule comparison view
- Payment analytics and insights

---

**Version**: 1.0.0  
**Last Updated**: October 2025  
**Status**: ✅ Production Ready
