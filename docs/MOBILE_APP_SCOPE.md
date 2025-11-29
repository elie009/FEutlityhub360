# UtilityHub360 Mobile App - Scope & API Documentation

## 📱 Overview

This document outlines the scope for the UtilityHub360 mobile application - a simplified, user-friendly mobile version focused on essential financial management features.

## 🎯 Core Principles

- **Straightforward Details**: Show only the most important information
- **Clean & Simple Design**: Minimal, intuitive UI with essential features only
- **User-Friendly**: Easy navigation with quick access to key functions
- **Offline-First**: Cache critical data for offline viewing
- **Fast Performance**: Optimized API calls and efficient data loading

---

## 📋 Mobile App Features

### 1. **Dashboard** 🏠
**Purpose**: Quick overview of financial status

**Essential Data to Display**:
- Total Balance (All Bank Accounts)
- Monthly Income Summary
- Total Pending Bills (Count & Amount)
- Upcoming Payments (Next 7 days)
- Recent Transactions (Last 5)

**Design**: Card-based layout with quick stats

**APIs Used**:
```
GET /api/BankAccounts/summary
GET /api/BillAnalytics/summary
GET /api/Transactions?limit=5
```

---

### 2. **Transactions** 💰
**Purpose**: View and track all financial transactions

**Essential Data**:
- Transaction List (Date, Description, Amount, Type)
- Filter by Type (Income/Expense)
- Search functionality
- Pull-to-refresh

**APIs Used**:
```
GET /api/Transactions?limit=50&page=1
GET /api/Transactions?transactionType=credit
GET /api/Transactions?transactionType=debit
```

**Request**:
```javascript
Headers: {
  Authorization: 'Bearer {token}'
}
QueryParams: {
  limit: 50,
  page: 1,
  transactionType: 'credit' | 'debit' | 'transfer', // optional
  category: 'food' | 'utilities' | etc, // optional
  dateFrom: 'YYYY-MM-DD', // optional
  dateTo: 'YYYY-MM-DD' // optional
}
```

**Response**:
```json
{
  "data": [
    {
      "id": "string",
      "transactionDate": "2024-01-15T10:30:00Z",
      "description": "Payment to Merchant",
      "amount": 150.00,
      "transactionType": "debit",
      "category": "food",
      "balanceAfterTransaction": 1850.00,
      "merchant": "Grocery Store",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### 3. **Bills & Utilities** 📄
**Purpose**: Track and pay bills

**Essential Data**:
- Pending Bills List
- Overdue Bills (highlighted)
- Upcoming Bills (next 7 days)
- Quick Mark as Paid
- Bill details with payment history

**APIs Used**:
```
GET /api/Bills?status=PENDING
GET /api/Bills/summary
GET /api/Bills/upcoming?days=7
GET /api/Bills/{billId}
PUT /api/Bills/{billId}/status
POST /api/Bills
```

**Request - Get Bills**:
```javascript
GET /api/Bills?status=PENDING&limit=20&page=1

QueryParams: {
  status: 'PENDING' | 'PAID' | 'OVERDUE',
  limit: 20,
  page: 1,
  provider: 'string', // optional filter
  billType: 'UTILITY' | 'INSURANCE' | etc // optional
}
```

**Response**:
```json
{
  "data": {
    "bills": [
      {
        "id": "string",
        "billName": "Electricity Bill",
        "amount": 250.00,
        "dueDate": "2024-01-20",
        "status": "PENDING",
        "provider": "Utility Company",
        "billType": "UTILITY",
        "frequency": "MONTHLY"
      }
    ],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

**Mark as Paid**:
```javascript
PUT /api/Bills/{billId}/status
Body: {
  "status": "PAID",
  "notes": "Payment completed via online banking"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Bill marked as paid",
  "data": { /* Updated bill object */ }
}
```

---

### 4. **Loan Management** 💳
**Purpose**: Track loans and make payments

**Essential Data**:
- Active Loans List
- Next Payment Due Date
- Outstanding Balance
- Payment History
- Quick Payment

**APIs Used**:
```
GET /api/Loans/user/{userId}
GET /api/Loans/user/{loanId}
GET /api/Loans/user/{loanId}/schedule
POST /api/payments
GET /api/Loans/user/{loanId}/payments
```

**Request - Get User Loans**:
```javascript
GET /api/Loans/user/{userId}?status=ACTIVE

QueryParams: {
  status: 'PENDING' | 'APPROVED' | 'ACTIVE' | 'COMPLETED', // optional
  page: 1,
  limit: 20
}
```

**Response**:
```json
{
  "data": [
    {
      "id": "string",
      "principal": 10000.00,
      "interestRate": 12.0,
      "term": 12,
      "status": "ACTIVE",
      "monthlyPayment": 888.49,
      "remainingBalance": 5000.00,
      "nextDueDate": "2024-02-01",
      "purpose": "Home renovation",
      "appliedAt": "2023-12-01T10:00:00Z"
    }
  ]
}
```

**Make Payment**:
```javascript
POST /api/payments
Body: {
  "loanId": "string",
  "amount": 888.49,
  "method": "BANK_TRANSFER",
  "reference": "TXN123456789"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Payment processed successfully",
  "data": {
    "id": "string",
    "loanId": "string",
    "amount": 888.49,
    "method": "BANK_TRANSFER",
    "status": "COMPLETED",
    "processedAt": "2024-01-20T14:30:00Z"
  }
}
```

---

### 5. **Income Sources** 💵
**Purpose**: Manage income streams

**Essential Data**:
- Income Sources List
- Monthly Income Total
- Add/Edit Income Source
- Frequency (Monthly, Weekly, etc.)

**APIs Used**:
```
GET /api/IncomeSources?includeSummary=true
POST /api/IncomeSources
PUT /api/IncomeSources/{incomeSourceId}
DELETE /api/IncomeSources/{incomeSourceId}
```

**Request - Get Income Sources**:
```javascript
GET /api/IncomeSources?includeSummary=true
```

**Response**:
```json
{
  "success": true,
  "data": {
    "incomeSources": [
      {
        "id": "string",
        "name": "Salary",
        "amount": 35000.00,
        "frequency": "MONTHLY",
        "category": "PRIMARY",
        "currency": "PHP",
        "monthlyAmount": 35000.00,
        "isActive": true,
        "company": "ABC Corp"
      }
    ],
    "totalMonthlyIncome": 35000.00,
    "totalSources": 1
  }
}
```

**Create/Update Income Source**:
```javascript
POST /api/IncomeSources
Body: {
  "name": "Salary",
  "amount": 35000.00,
  "frequency": "MONTHLY",
  "category": "PRIMARY",
  "currency": "PHP",
  "company": "ABC Corp",
  "description": "Monthly salary"
}

PUT /api/IncomeSources/{incomeSourceId}
Body: {
  // Same as POST
}
```

---

### 6. **Bank Accounts** 🏦
**Purpose**: Track bank account balances

**Essential Data**:
- Account List (Name, Balance, Status)
- Account Balance Summary
- Recent Transactions per Account

**APIs Used**:
```
GET /api/BankAccounts
GET /api/BankAccounts/summary
GET /api/BankAccounts/{accountId}/transactions
```

**Request - Get Bank Accounts**:
```javascript
GET /api/BankAccounts?isActive=true
```

**Response**:
```json
{
  "data": [
    {
      "id": "string",
      "accountName": "Main Checking",
      "accountNumber": "****1234",
      "accountType": "CHECKING",
      "balance": 5000.00,
      "initialBalance": 5000.00,
      "currency": "PHP",
      "isActive": true,
      "financialInstitution": "BDO"
    }
  ]
}
```

---

### 7. **Notifications** 🔔
**Purpose**: Important alerts and updates

**Essential Data**:
- Unread Notifications Count
- Notification List
- Mark as Read

**APIs Used**:
```
GET /api/notifications/{userId}?status=unread
PUT /api/notifications/{notificationId}/read
```

**Request**:
```javascript
GET /api/notifications/{userId}?status=unread&limit=10&page=1

QueryParams: {
  status: 'unread' | 'read' | 'all',
  type: 'PAYMENT_DUE' | 'BILL_OVERDUE' | 'LOAN_APPROVED' | etc,
  limit: 10,
  page: 1
}
```

**Response**:
```json
{
  "data": [
    {
      "id": "string",
      "type": "PAYMENT_DUE",
      "title": "Payment Due Soon",
      "message": "Your loan payment of ₱888.49 is due in 3 days",
      "isRead": false,
      "createdAt": "2024-01-17T10:00:00Z"
    }
  ]
}
```

---

### 8. **Profile & Settings** ⚙️
**Purpose**: Manage user profile and preferences

**Essential Data**:
- User Profile (Name, Email, Phone)
- Profile Picture
- Preferred Currency
- Notification Settings

**APIs Used**:
```
GET /api/UserProfile
PUT /api/UserProfile
GET /api/Auth/me
```

**Request - Get User Profile**:
```javascript
GET /api/UserProfile
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "string",
    "jobTitle": "Software Engineer",
    "company": "ABC Corp",
    "preferredCurrency": "PHP",
    "totalMonthlyIncome": 35000.00,
    "netMonthlyIncome": 35000.00,
    "incomeSources": [
      {
        "id": "string",
        "name": "Salary",
        "amount": 35000.00,
        "frequency": "MONTHLY"
      }
    ]
  }
}
```

---

## 🔑 Authentication

### Login
```javascript
POST /api/Auth/login
Body: {
  "email": "user@example.com",
  "password": "password123"
}

Response: {
  "success": true,
  "data": {
    "token": "jwt_token_here",
    "refreshToken": "refresh_token_here",
    "expiresAt": "2024-01-20T10:00:00Z",
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "user@example.com",
      "phone": "+1234567890"
    }
  }
}
```

### Register
```javascript
POST /api/Auth/register
Body: {
  "name": "John Doe",
  "email": "user@example.com",
  "phone": "+1234567890",
  "password": "password123",
  "confirmPassword": "password123"
}

Response: {
  "success": true,
  "message": "User registered successfully",
  "data": { /* User object */ }
}
```

### Token Refresh
```javascript
POST /api/Auth/refresh
Body: {
  "refreshToken": "refresh_token_here"
}

Response: {
  "success": true,
  "data": {
    "token": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

---

## 📱 Navigation Structure

```
Bottom Navigation Bar:
├── 🏠 Dashboard (Home)
├── 💰 Transactions
├── 📄 Bills
└── ➕ More Menu
    ├── 💳 Loans
    ├── 💵 Income Sources
    ├── 🏦 Bank Accounts
    ├── 🔔 Notifications
    └── ⚙️ Settings
```

---

## 🎨 Design Guidelines

### Color Palette
- Primary: Blue (#1976d2)
- Success: Green (#2e7d32)
- Warning: Orange (#ed6c02)
- Error: Red (#d32f2f)
- Background: White/Light Gray

### Typography
- Headers: Bold, 18-24px
- Body: Regular, 14-16px
- Captions: Light, 12px

### Spacing
- Card Padding: 16px
- Section Margin: 24px
- Element Gap: 8-12px

### Components
- Cards: Rounded corners, subtle shadow
- Buttons: Full width, clear CTA
- Lists: Swipe actions (pay, delete)
- Forms: Clear labels, inline validation
- Loading: Skeleton screens or spinners

---

## 🔒 Security & Best Practices

1. **Token Storage**: Secure storage (Keychain on iOS, Keystore on Android)
2. **SSL Pinning**: Verify backend certificates
3. **Biometric Auth**: Optional Face ID / Fingerprint
4. **Session Timeout**: Auto-logout after inactivity
5. **Data Encryption**: Encrypt sensitive data at rest
6. **Error Handling**: Graceful fallbacks, user-friendly messages
7. **Offline Mode**: Cache critical data for offline viewing
8. **Pull-to-Refresh**: Manual data sync
9. **Pagination**: Load data in chunks (limit: 20-50)
10. **Rate Limiting**: Handle API rate limits gracefully

---

## 📊 API Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

### Common Error Codes
- `400`: Bad Request (validation error)
- `401`: Unauthorized (invalid/expired token)
- `403`: Forbidden (insufficient permissions)
- `404`: Not Found
- `429`: Too Many Requests (rate limit)
- `500`: Server Error
- `503`: Service Unavailable

### Error Handling Strategy
```javascript
if (error.status === 401) {
  // Redirect to login
  navigateToLogin();
} else if (error.status === 429) {
  // Show retry message
  showMessage("Too many requests. Please wait a moment.");
} else {
  // Show user-friendly error
  showMessage(error.message || "Something went wrong");
}
```

---

## 🚀 Performance Optimization

1. **Image Optimization**: Compress images, use thumbnails
2. **Lazy Loading**: Load data as user scrolls
3. **Caching**: Cache API responses for 5-15 minutes
4. **Debouncing**: Debounce search inputs (300ms)
5. **Background Sync**: Sync data in background
6. **Minimal API Calls**: Batch requests when possible
7. **Code Splitting**: Load features on-demand
8. **Memory Management**: Release unused resources

---

## 📦 Required Mobile Permissions

### iOS
- Camera: For receipt scanning (future feature)
- Photo Library: For receipt upload
- Notifications: Push notifications

### Android
- Internet: API communication
- Read/Write Storage: Receipt files
- Camera: Receipt scanning
- Notifications: Push notifications

---

## 🧪 Testing Requirements

### Functional Testing
- [ ] Login/Logout flow
- [ ] Data loading and display
- [ ] Create/Edit/Delete operations
- [ ] Payment processing
- [ ] Offline mode
- [ ] Error scenarios

### Performance Testing
- [ ] App launch time < 2 seconds
- [ ] API response time < 3 seconds
- [ ] Smooth scrolling (60 FPS)
- [ ] Memory usage < 200MB

### Security Testing
- [ ] Token management
- [ ] Secure data storage
- [ ] SSL verification
- [ ] Biometric authentication

---

## 📞 Support & Contact

**API Base URL**: `https://api.utilityhub360.com/api`

**Documentation**: Refer to full API documentation for complete details

**Support**: contact@utilityhub360.com

---

## ✅ Success Criteria

- ✅ All critical APIs implemented and tested
- ✅ Offline viewing capability
- ✅ Fast load times (< 2s for main screens)
- ✅ Zero critical bugs
- ✅ User-friendly error messages
- ✅ Responsive design (iOS & Android)
- ✅ Biometric authentication working
- ✅ Push notifications functional
- ✅ App store approval ready

