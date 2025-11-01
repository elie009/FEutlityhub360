# Add New Transaction - API Documentation & Flow Guide

## 📋 Overview

This document provides complete API and flow documentation for the "Add New Transaction" modal in the Bank Accounts page. This guide is designed for mobile app developers to implement the transaction creation feature.

**Endpoint**: `POST /api/bankaccounts/transactions`

**Authentication**: Required (Bearer Token)

---

## 🎯 User Flow

### 1. **Open Transaction Modal**
- User clicks "Add Transaction" button on Bank Accounts page
- Modal opens with empty form
- Load reference data (bills, loans, savings accounts) in background

### 2. **Fill Transaction Details**
- Select Bank Account (Required)
- Select Transaction Type: DEBIT or CREDIT (Required)
- Enter Amount (Required, must be > 0)
- Enter Description (Required)
- Select Category (Required for DEBIT, auto-set for CREDIT)
- Optional: Merchant, Location, Notes, Reference Number
- Optional: Enable Recurring Transaction
- If Recurring: Select Frequency (Daily, Weekly, Monthly, Quarterly, Yearly)

### 3. **Smart Category Linking** (Conditional)
Based on selected category, additional fields appear:
- **Bill Categories**: Show Bill Selector dropdown
- **Savings Categories**: Show Savings Account Selector dropdown  
- **Loan Categories**: Show Loan Selector dropdown

### 4. **Validation & Submission**
- Validate all required fields
- Validate category-specific requirements
- Submit transaction
- Handle success/error response
- Refresh transaction list

---

## 📝 Form Properties

### Complete Form Data Structure

```typescript
interface TransactionFormData {
  // Required Fields
  bankAccountId: string;          // Selected bank account ID
  amount: string;                  // Amount as string (e.g., "150.50")
  transactionType: 'DEBIT' | 'CREDIT';  // Transaction type
  description: string;            // Transaction description
  category: string;               // Category (required for DEBIT only)
  transactionDate: string;        // ISO datetime string (format: "YYYY-MM-DDTHH:mm")
  
  // Optional Fields
  merchant?: string;              // Merchant name
  location?: string;              // Transaction location
  notes?: string;                 // Additional notes
  referenceNumber?: string;       // Reference number
  currency: string;               // Currency code (default: 'USD')
  
  // Recurring Transaction
  isRecurring: boolean;           // Whether transaction is recurring
  recurringFrequency?: string;    // Required if isRecurring = true
                                   // Values: 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'
  
  // Smart Linking Fields (Conditional)
  billId?: string;                // Required if category is bill-related
  savingsAccountId?: string;     // Required if category is savings-related
  loanId?: string;                // Required if category is loan-related
}
```

---

## ✅ Required Fields

### Always Required:
1. **bankAccountId** - Must be a valid bank account ID
2. **amount** - Must be > 0, numeric value
3. **transactionType** - Must be 'DEBIT' or 'CREDIT'
4. **description** - Non-empty string (trimmed)
5. **transactionDate** - Valid ISO datetime string

### Conditionally Required:
6. **category** - Required ONLY for DEBIT transactions
   - CREDIT transactions: Category is automatically set to 'CREDIT'
   - DEBIT transactions: User must select/enter a category

7. **recurringFrequency** - Required ONLY if `isRecurring = true`
   - Valid values: 'daily', 'weekly', 'monthly', 'quarterly', 'yearly'

### Category-Specific Required Fields:
8. **billId** - Required if category is bill-related
   - Triggers when category contains: 'bill', 'utility', 'rent', 'insurance', 'subscription', 'payment'

9. **savingsAccountId** - Required if category is savings-related
   - Triggers when category contains: 'savings', 'deposit', 'investment', 'goal', 'fund'

10. **loanId** - Required if category is loan-related
    - Triggers when category contains: 'loan', 'repayment', 'debt', 'installment', 'mortgage'

---

## 🔄 Conditional Logic

### 1. Transaction Type Changes
**When transactionType = 'CREDIT':**
- Category field is hidden (auto-set to 'CREDIT')
- Bill/Savings/Loan selectors are hidden
- All reference fields (billId, savingsAccountId, loanId) are cleared

**When transactionType = 'DEBIT':**
- Category field is shown and required
- Category-based selectors may appear based on category selection

### 2. Category-Based Selectors
The following categories trigger specific selectors:

**Bill Categories** → Shows Bill Selector:
- utility, rent, insurance, subscription
- phone bill, internet bill, electricity bill
- water bill, gas bill, cable bill
- gym membership, streaming service

**Savings Categories** → Shows Savings Account Selector:
- savings, deposit, investment
- emergency fund, retirement savings
- vacation fund, house fund, car fund
- education fund

**Loan Categories** → Shows Loan Selector:
- loan payment, repayment, debt payment
- installment, mortgage payment
- car loan, personal loan, student loan
- credit card payment

### 3. Recurring Transaction
**When isRecurring = true:**
- recurringFrequency field becomes required
- Options: Daily, Weekly, Monthly, Quarterly, Yearly

**When isRecurring = false:**
- recurringFrequency is optional and can be empty

---

## 🔌 API Endpoints

### 1. **Get Bank Accounts** (Pre-load)
**Endpoint**: `GET /api/BankAccounts`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Response**:
```json
{
  "data": [
    {
      "id": "string",
      "accountName": "Main Checking",
      "accountType": "CHECKING",
      "currentBalance": 5000.00,
      "currency": "USD",
      "isActive": true
    }
  ]
}
```

**Purpose**: Populate bank account dropdown

---

### 2. **Get Bills** (Pre-load for Bill Selector)
**Endpoint**: `GET /api/Bills?status=PENDING`

**Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters**:
- `status`: 'PENDING' (optional)

**Response**:
```json
{
  "data": {
    "bills": [
      {
        "id": "string",
        "billName": "Electricity Bill",
        "amount": 250.00,
        "status": "PENDING",
        "provider": "Utility Company",
        "billType": "UTILITY"
      }
    ]
  }
}
```

**Purpose**: Populate bill selector when bill-related category is selected

---

### 3. **Get Loans** (Pre-load for Loan Selector)
**Endpoint**: `GET /api/Loans/user/{userId}?status=ACTIVE`

**Headers**:
```
Authorization: Bearer {token}
```

**Query Parameters**:
- `status`: 'ACTIVE' (optional, to filter only active loans)

**Response**:
```json
{
  "data": [
    {
      "id": "string",
      "purpose": "Home renovation",
      "principal": 10000.00,
      "status": "ACTIVE",
      "monthlyPayment": 888.49,
      "remainingBalance": 5000.00
    }
  ]
}
```

**Purpose**: Populate loan selector when loan-related category is selected

---

### 4. **Get Savings Accounts** (Pre-load for Savings Selector)
**Endpoint**: `GET /api/BankAccounts` (or dedicated savings endpoint if available)

**Response**: Same as Get Bank Accounts

**Purpose**: Populate savings account selector when savings-related category is selected

---

### 5. **Create Transaction** (Main API)
**Endpoint**: `POST /api/bankaccounts/transactions`

**Headers**:
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body**:
```json
{
  "bankAccountId": "string (required)",
  "amount": 150.50,
  "transactionType": "DEBIT" | "CREDIT",
  "description": "string (required)",
  "category": "string (required for DEBIT only)",
  "merchant": "string (optional)",
  "location": "string (optional)",
  "transactionDate": "2024-01-20T14:30:00.000Z",
  "notes": "string (optional)",
  "isRecurring": false,
  "recurringFrequency": "monthly (optional, required if isRecurring=true)",
  "referenceNumber": "string (optional)",
  "currency": "USD",
  "billId": "string (optional, required for bill categories)",
  "savingsAccountId": "string (optional, required for savings categories)",
  "loanId": "string (optional, required for loan categories)"
}
```

**Example Request - DEBIT Transaction with Bill**:
```json
{
  "bankAccountId": "bank-123",
  "amount": 250.00,
  "transactionType": "DEBIT",
  "description": "Electricity bill payment",
  "category": "utility",
  "merchant": "City Electric",
  "location": "Online",
  "transactionDate": "2024-01-20T10:00:00.000Z",
  "notes": "Monthly payment",
  "isRecurring": true,
  "recurringFrequency": "monthly",
  "referenceNumber": "ELEC-2024-001",
  "currency": "USD",
  "billId": "bill-456"
}
```

**Example Request - CREDIT Transaction**:
```json
{
  "bankAccountId": "bank-123",
  "amount": 3500.00,
  "transactionType": "CREDIT",
  "description": "Salary deposit",
  "transactionDate": "2024-01-20T09:00:00.000Z",
  "isRecurring": true,
  "recurringFrequency": "monthly",
  "currency": "USD"
}
```

**Success Response (200 OK)**:
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "id": "txn-1234567890",
    "bankAccountId": "bank-123",
    "userId": "user-123",
    "amount": -250.00,
    "transactionType": "debit",
    "description": "Bill Payment - Electricity bill payment",
    "category": "utility",
    "merchant": "City Electric",
    "location": "Online",
    "transactionDate": "2024-01-20T10:00:00.000Z",
    "createdAt": "2024-01-20T10:05:00.000Z",
    "updatedAt": "2024-01-20T10:05:00.000Z",
    "notes": "Monthly payment",
    "referenceNumber": "ELEC-2024-001",
    "isRecurring": true,
    "recurringFrequency": "monthly",
    "currency": "USD",
    "balanceAfterTransaction": 4750.00,
    "billId": "bill-456",
    "externalTransactionId": "EXT-1234567890"
  }
}
```

**Note**: 
- DEBIT transactions have negative `amount` values
- CREDIT transactions have positive `amount` values
- `balanceAfterTransaction` shows the account balance after this transaction

---

## ⚠️ Error Handling

### Validation Errors (400 Bad Request)

**Error Response Format**:
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "amount",
      "message": "Amount must be greater than 0"
    },
    {
      "field": "bankAccountId",
      "message": "Bank account is required"
    }
  ]
}
```

### Common Validation Errors:

1. **Missing Required Field**:
```json
{
  "success": false,
  "message": "Bank account is required",
  "errors": []
}
```

2. **Invalid Amount**:
```json
{
  "success": false,
  "message": "Amount must be greater than 0",
  "errors": []
}
```

3. **Missing Category for DEBIT**:
```json
{
  "success": false,
  "message": "Category is required for debit transactions",
  "errors": []
}
```

4. **Missing Bill Selection**:
```json
{
  "success": false,
  "message": "Bill selection is required for bill-related transactions",
  "errors": []
}
```

5. **Missing Savings Account Selection**:
```json
{
  "success": false,
  "message": "Savings account selection is required for savings-related transactions",
  "errors": []
}
```

6. **Missing Loan Selection**:
```json
{
  "success": false,
  "message": "Loan selection is required for loan-related transactions",
  "errors": []
}
```

7. **Missing Recurring Frequency**:
```json
{
  "success": false,
  "message": "Recurring frequency is required when transaction is recurring",
  "errors": []
}
```

### Authentication Errors (401 Unauthorized)

**Response**:
```json
{
  "success": false,
  "message": "Unauthorized. Please login again.",
  "errors": []
}
```

**Action**: Redirect user to login screen

### Not Found Errors (404)

**Bank Account Not Found**:
```json
{
  "success": false,
  "message": "Bank account not found",
  "errors": []
}
```

### Server Errors (500)

**Response**:
```json
{
  "success": false,
  "message": "Internal server error. Please try again later.",
  "errors": []
}
```

### Network Errors

**Handle**:
- Show user-friendly message: "Network error. Please check your connection."
- Allow retry functionality

---

## 🔍 Validation Rules

### Client-Side Validation (Before API Call):

```typescript
// Validation function
function validateTransactionForm(formData: TransactionFormData): string[] {
  const errors: string[] = [];
  
  // Required fields
  if (!formData.bankAccountId) {
    errors.push('Bank account is required');
  }
  
  if (!formData.amount || parseFloat(formData.amount) <= 0) {
    errors.push('Amount must be greater than 0');
  }
  
  if (!formData.description || formData.description.trim() === '') {
    errors.push('Description is required');
  }
  
  // Category required only for DEBIT
  if (formData.transactionType === 'DEBIT' && !formData.category) {
    errors.push('Category is required for debit transactions');
  }
  
  // Recurring frequency required if isRecurring is true
  if (formData.isRecurring && !formData.recurringFrequency) {
    errors.push('Recurring frequency is required when transaction is recurring');
  }
  
  // Category-specific validations (only for DEBIT with category)
  if (formData.transactionType === 'DEBIT' && formData.category) {
    // Check if category is bill-related
    if (isBillCategory(formData.category) && !formData.billId) {
      errors.push('Bill selection is required for bill-related transactions');
    }
    
    // Check if category is savings-related
    if (isSavingsCategory(formData.category) && !formData.savingsAccountId) {
      errors.push('Savings account selection is required for savings-related transactions');
    }
    
    // Check if category is loan-related
    if (isLoanCategory(formData.category) && !formData.loanId) {
      errors.push('Loan selection is required for loan-related transactions');
    }
  }
  
  return errors;
}

// Category detection functions
function isBillCategory(category: string): boolean {
  const billKeywords = ['bill', 'utility', 'rent', 'insurance', 'subscription', 'payment'];
  return billKeywords.some(keyword => category.toLowerCase().includes(keyword));
}

function isSavingsCategory(category: string): boolean {
  const savingsKeywords = ['savings', 'deposit', 'investment', 'goal', 'fund'];
  return savingsKeywords.some(keyword => category.toLowerCase().includes(keyword));
}

function isLoanCategory(category: string): boolean {
  const loanKeywords = ['loan', 'repayment', 'debt', 'installment', 'mortgage'];
  return loanKeywords.some(keyword => category.toLowerCase().includes(keyword));
}
```

---

## 📱 Mobile Implementation Flow

### Step 1: Initialize Form
```javascript
// On modal open
1. Reset all form fields
2. Set default values:
   - transactionType: 'DEBIT'
   - transactionDate: current date/time
   - currency: user's preferred currency
   - isRecurring: false
3. Load bank accounts list
```

### Step 2: Load Reference Data (Background)
```javascript
// Load in parallel (optional - can be lazy loaded)
Promise.all([
  loadBills({ status: 'PENDING' }),
  loadLoans({ status: 'ACTIVE' }),
  loadSavingsAccounts()
]).then(([bills, loans, savings]) => {
  // Store for later use
});
```

### Step 3: Handle User Input

#### Transaction Type Change:
```javascript
if (transactionType === 'CREDIT') {
  // Hide category field
  // Clear category, billId, savingsAccountId, loanId
  // Hide all reference selectors
}
```

#### Category Selection:
```javascript
if (category is selected) {
  if (isBillCategory(category)) {
    showBillSelector = true;
    // Bill selection becomes required
  }
  if (isSavingsCategory(category)) {
    showSavingsSelector = true;
    // Savings selection becomes required
  }
  if (isLoanCategory(category)) {
    showLoanSelector = true;
    // Loan selection becomes required
  }
}
```

#### Recurring Toggle:
```javascript
if (isRecurring === true) {
  showRecurringFrequency = true;
  recurringFrequency becomes required
}
```

### Step 4: Validation Before Submit
```javascript
const errors = validateTransactionForm(formData);
if (errors.length > 0) {
  // Display errors to user
  // Don't submit
  return;
}
```

### Step 5: Prepare Request
```javascript
const requestBody = {
  bankAccountId: formData.bankAccountId,
  amount: parseFloat(formData.amount),
  transactionType: formData.transactionType,
  description: formData.description.trim(),
  category: formData.transactionType === 'CREDIT' ? undefined : formData.category,
  merchant: formData.merchant.trim() || undefined,
  location: formData.location.trim() || undefined,
  transactionDate: new Date(formData.transactionDate).toISOString(),
  notes: formData.notes.trim() || undefined,
  isRecurring: formData.isRecurring,
  recurringFrequency: formData.isRecurring ? formData.recurringFrequency : undefined,
  referenceNumber: formData.referenceNumber.trim() || undefined,
  currency: formData.currency,
  // Conditional fields
  billId: formData.billId || undefined,
  savingsAccountId: formData.savingsAccountId || undefined,
  loanId: formData.loanId || undefined
};

// Remove undefined fields
Object.keys(requestBody).forEach(key => {
  if (requestBody[key] === undefined) {
    delete requestBody[key];
  }
});
```

### Step 6: API Call
```javascript
try {
  const response = await fetch('/api/bankaccounts/transactions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const result = await response.json();

  if (response.ok && result.success) {
    // Success: Close modal, refresh transaction list
    onSuccess();
    onClose();
  } else {
    // Handle validation errors
    displayErrors(result.errors || [result.message]);
  }
} catch (error) {
  // Handle network/server errors
  displayError('Failed to create transaction. Please try again.');
}
```

---

## 📋 Category Reference

### Bill Categories (Shows Bill Selector):
- utility
- rent
- insurance
- subscription
- phone bill
- internet bill
- electricity bill
- water bill
- gas bill
- cable bill
- gym membership
- streaming service
- phone service
- internet service

### Savings Categories (Shows Savings Selector):
- savings
- deposit
- investment
- emergency fund
- retirement savings
- vacation fund
- house fund
- car fund
- education fund
- investment deposit

### Loan Categories (Shows Loan Selector):
- loan payment
- repayment
- debt payment
- installment
- mortgage payment
- car loan
- personal loan
- student loan
- credit card payment

### Other Categories (No Selector):
- food
- transportation
- entertainment
- shopping
- healthcare
- education
- gas
- groceries
- restaurant
- coffee
- clothing
- electronics
- travel
- gift

---

## 🔄 Recurring Transaction

### Configuration:
- **Toggle**: `isRecurring` (boolean)
- **Frequency Options**:
  - `daily` - Daily
  - `weekly` - Weekly
  - `monthly` - Monthly
  - `quarterly` - Quarterly
  - `yearly` - Yearly

### Behavior:
- When `isRecurring = true`, `recurringFrequency` becomes **required**
- Recurring transactions are automatically repeated based on frequency
- Recurring transactions are tracked separately by the system

### API Handling:
- Include `isRecurring` and `recurringFrequency` in request
- Backend will schedule future occurrences
- Each occurrence will have same details but different `transactionDate`

---

## 💡 Enhanced Description Logic

The backend automatically enhances descriptions based on category:

```javascript
// If category is bill-related:
description = "Bill Payment - " + originalDescription

// If category is savings-related:
description = "Savings - " + originalDescription

// If category is loan-related:
description = "Loan Payment - " + originalDescription

// Otherwise:
description = originalDescription
```

---

## ✅ Success Response Handling

After successful transaction creation:

1. **Display Success Message**: "Transaction created successfully"
2. **Refresh Transaction List**: Call `GET /api/Transactions` to reload list
3. **Update Bank Account Balance**: The response includes `balanceAfterTransaction`
4. **Close Modal**: Return to bank accounts page
5. **Optional**: Show transaction details or confirmation

---

## 🎨 UI/UX Recommendations for Mobile

### Form Layout:
1. **Bank Account**: Dropdown with account name and balance
2. **Transaction Type**: Segmented control (DEBIT/CREDIT)
3. **Amount**: Number input with decimal support
4. **Category**: Autocomplete with suggestions (DEBIT only)
5. **Description**: Text input
6. **Date/Time**: Date-time picker
7. **Recurring Toggle**: Switch with label
8. **Frequency**: Dropdown (shown when recurring enabled)
9. **Optional Fields**: Collapsible section
10. **Reference Selectors**: Conditional dropdowns based on category

### Validation Display:
- Show errors inline below each field
- Highlight invalid fields with red border
- Display summary of errors at top if form fails validation
- Disable submit button during loading

### Loading States:
- Show loading spinner on submit button
- Disable all form fields during submission
- Display "Creating transaction..." message

---

## 📊 Example Scenarios

### Scenario 1: Simple DEBIT Transaction
```
Bank Account: Main Checking
Transaction Type: DEBIT
Amount: 50.00
Category: food
Description: Lunch at restaurant
Date: 2024-01-20 12:00
Recurring: No

Request Body:
{
  "bankAccountId": "bank-123",
  "amount": 50.00,
  "transactionType": "DEBIT",
  "description": "Lunch at restaurant",
  "category": "food",
  "transactionDate": "2024-01-20T12:00:00.000Z",
  "isRecurring": false,
  "currency": "USD"
}
```

### Scenario 2: Recurring Bill Payment
```
Bank Account: Main Checking
Transaction Type: DEBIT
Amount: 250.00
Category: utility (triggers bill selector)
Bill: Electricity Bill - 250.00
Description: Electricity bill payment
Date: 2024-01-20 10:00
Recurring: Yes
Frequency: Monthly

Request Body:
{
  "bankAccountId": "bank-123",
  "amount": 250.00,
  "transactionType": "DEBIT",
  "description": "Electricity bill payment",
  "category": "utility",
  "transactionDate": "2024-01-20T10:00:00.000Z",
  "isRecurring": true,
  "recurringFrequency": "monthly",
  "currency": "USD",
  "billId": "bill-456"
}
```

### Scenario 3: CREDIT Transaction (Salary)
```
Bank Account: Main Checking
Transaction Type: CREDIT
Amount: 3500.00
Description: Salary deposit
Date: 2024-01-20 09:00
Recurring: Yes
Frequency: Monthly

Request Body:
{
  "bankAccountId": "bank-123",
  "amount": 3500.00,
  "transactionType": "CREDIT",
  "description": "Salary deposit",
  "transactionDate": "2024-01-20T09:00:00.000Z",
  "isRecurring": true,
  "recurringFrequency": "monthly",
  "currency": "USD"
}
```

---

## 🚨 Error Handling Examples

### Example 1: Missing Required Field
```javascript
// Request missing bankAccountId
{
  "amount": 50.00,
  "transactionType": "DEBIT",
  "description": "Test"
}

// Response: 400 Bad Request
{
  "success": false,
  "message": "Bank account is required",
  "errors": []
}

// Mobile Action: 
// - Highlight bank account field in red
// - Show error message below field
```

### Example 2: Invalid Amount
```javascript
// Request with amount = 0
{
  "bankAccountId": "bank-123",
  "amount": 0,
  "transactionType": "DEBIT",
  "description": "Test"
}

// Response: 400 Bad Request
{
  "success": false,
  "message": "Amount must be greater than 0",
  "errors": []
}
```

### Example 3: Missing Bill Selection
```javascript
// Request with bill category but no billId
{
  "bankAccountId": "bank-123",
  "amount": 250.00,
  "transactionType": "DEBIT",
  "category": "utility",
  "description": "Bill payment"
}

// Response: 400 Bad Request
{
  "success": false,
  "message": "Bill selection is required for bill-related transactions",
  "errors": []
}
```

### Example 4: Missing Recurring Frequency
```javascript
// Request with isRecurring=true but no frequency
{
  "bankAccountId": "bank-123",
  "amount": 50.00,
  "transactionType": "DEBIT",
  "description": "Test",
  "isRecurring": true
}

// Response: 400 Bad Request
{
  "success": false,
  "message": "Recurring frequency is required when transaction is recurring",
  "errors": []
}
```

---

## 📱 Mobile-Specific Considerations

### 1. **Form Validation**
- Validate on blur (when user leaves field)
- Show errors immediately for better UX
- Don't block submit button, but show errors after validation

### 2. **Category Autocomplete**
- Show suggestions as user types
- Filter suggestions based on transaction type
- Highlight category type (bill/savings/loan/other) visually

### 3. **Reference Data Loading**
- Load bills/loans/savings accounts lazily (only when selector appears)
- Cache loaded data for faster subsequent selections
- Show loading state while fetching

### 4. **Date/Time Picker**
- Use native mobile date-time pickers
- Default to current date/time
- Format: `YYYY-MM-DDTHH:mm` (ISO 8601 without seconds)

### 5. **Amount Input**
- Use numeric keyboard
- Support decimal values (0.01 minimum)
- Format display: 1,234.56 (no currency symbol)

### 6. **Error Messages**
- Display at top of form (summary)
- Show inline errors below each field
- Auto-scroll to first error field
- Clear errors when user corrects field

### 7. **Success Handling**
- Show success toast/notification
- Close modal smoothly
- Refresh transaction list
- Optionally show created transaction in detail view

---

## 🔐 Security Notes

1. **Token Validation**: Always validate JWT token before API calls
2. **Bank Account Ownership**: Backend validates user owns the bank account
3. **Amount Limits**: Backend may enforce maximum transaction amounts
4. **Date Validation**: Cannot create transactions in the far future
5. **Rate Limiting**: Implement request throttling for API calls

---

## 📞 Support

**API Base URL**: `https://api.utilityhub360.com/api`

**Documentation**: Refer to main API documentation for complete endpoint details

**Support**: contact@utilityhub360.com

---

## ✅ Checklist for Mobile Implementation

- [ ] Form fields match specification
- [ ] Required field validation works
- [ ] Conditional fields appear/disappear correctly
- [ ] Category autocomplete with suggestions
- [ ] Bill/Loan/Savings selectors load data
- [ ] Recurring transaction toggle works
- [ ] Date/time picker implemented
- [ ] API request formatting correct
- [ ] Error handling implemented
- [ ] Success response handling
- [ ] Loading states shown
- [ ] Transaction list refreshes after creation
- [ ] Bank account balance updates
- [ ] Network error handling
- [ ] Authentication error handling (redirect to login)

