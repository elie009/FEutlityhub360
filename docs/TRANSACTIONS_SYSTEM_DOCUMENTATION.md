# 📊 Bank Account Transactions System Documentation

## Overview

The Bank Account Transactions System provides comprehensive transaction management and analytics for bank accounts. Users can view recent transactions, filter by various criteria, and analyze their spending patterns.

## 🚀 Features

### Core Functionality
- **Recent Transactions View**: Display the most recent transactions with detailed information
- **Transaction Filtering**: Filter by transaction type, category, date range, and more
- **Transaction Analytics**: Comprehensive analytics including spending patterns and trends
- **Bank Account Analytics**: Complete bank account overview with balance and account statistics
- **Transaction Details**: Detailed view of individual transactions with all metadata
- **Real-time Updates**: Refresh functionality to get the latest transaction data

### Transaction Information
- **Amount & Type**: Credit/debit amounts with proper formatting
- **Description**: Transaction description and merchant information
- **Category**: Automatic categorization (food, utilities, transportation, etc.)
- **Date & Time**: Transaction timestamp with timezone support
- **Location**: Merchant location and transaction location
- **Reference Numbers**: Internal and external transaction IDs
- **Recurring Status**: Identification of recurring transactions
- **Balance Tracking**: Balance after each transaction

## 🔧 API Integration

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/bankaccounts/transactions/recent?limit=10` | Get recent transactions |
| `GET` | `/api/bankaccounts/transactions` | Get transactions with filters |
| `GET` | `/api/bankaccounts/transactions/{id}` | Get specific transaction |
| `GET` | `/api/bankaccounts/transactions/analytics` | Get transaction analytics |

### Get Recent Transactions API Details

**Endpoint**: `GET /api/bankaccounts/transactions/recent?limit=10`

**Query Parameters**:
- `limit` (optional): Number of transactions to return (default: 10, max: 100)

**Response**:
```json
{
  "success": true,
  "message": "string",
  "data": [
    {
      "id": "string",
      "bankAccountId": "string",
      "userId": "string",
      "amount": 0,
      "transactionType": "string",
      "description": "string",
      "category": "string",
      "referenceNumber": "string",
      "externalTransactionId": "string",
      "transactionDate": "2025-09-25T18:20:34.369Z",
      "createdAt": "2025-09-25T18:20:34.369Z",
      "updatedAt": "2025-09-25T18:20:34.369Z",
      "notes": "string",
      "merchant": "string",
      "location": "string",
      "isRecurring": true,
      "recurringFrequency": "string",
      "currency": "string",
      "balanceAfterTransaction": 0
    }
  ],
  "errors": ["string"]
}
```

### Get Transactions with Filters API Details

**Endpoint**: `GET /api/bankaccounts/transactions`

**Query Parameters**:
- `bankAccountId` (optional): Filter by specific bank account
- `transactionType` (optional): Filter by transaction type (credit, debit, transfer)
- `category` (optional): Filter by category
- `startDate` (optional): Filter transactions from this date
- `endDate` (optional): Filter transactions until this date
- `page` (optional): Page number for pagination
- `limit` (optional): Number of transactions per page

**Response**:
```json
{
  "success": true,
  "message": "string",
  "data": {
    "data": [
      {
        "id": "string",
        "bankAccountId": "string",
        "userId": "string",
        "amount": 0,
        "transactionType": "string",
        "description": "string",
        "category": "string",
        "referenceNumber": "string",
        "externalTransactionId": "string",
        "transactionDate": "2025-09-25T18:20:34.369Z",
        "createdAt": "2025-09-25T18:20:34.369Z",
        "updatedAt": "2025-09-25T18:20:34.369Z",
        "notes": "string",
        "merchant": "string",
        "location": "string",
        "isRecurring": true,
        "recurringFrequency": "string",
        "currency": "string",
        "balanceAfterTransaction": 0
      }
    ],
    "page": 1,
    "limit": 10,
    "totalCount": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "errors": ["string"]
}
```

### Get Transaction Analytics API Details

**Endpoint**: `GET /api/bankaccounts/transactions/analytics`

**Response**:
```json
{
  "success": true,
  "message": "string",
  "data": {
    "totalTransactions": 150,
    "totalIncoming": 5000.00,
    "totalOutgoing": 3500.00,
    "averageTransactionAmount": 56.67,
    "mostActiveCategory": "food",
    "mostActiveMerchant": "Starbucks",
    "generatedAt": "2025-09-25T18:20:34.369Z"
  },
  "errors": ["string"]
}
```

## 🎨 UI Components

### TransactionCard Component

**Location**: `src/components/Transactions/TransactionCard.tsx`

**Features**:
- **Visual Transaction Type**: Color-coded icons for credit/debit/transfer
- **Category Display**: Category chips with appropriate colors
- **Amount Formatting**: Proper currency formatting with color coding
- **Date & Time**: Formatted transaction date and time
- **Merchant Information**: Merchant name and location
- **Recurring Indicator**: Special indicator for recurring transactions
- **Action Menu**: View details option
- **Balance Display**: Balance after transaction

**Props**:
```typescript
interface TransactionCardProps {
  transaction: BankAccountTransaction;
  onViewDetails?: (transaction: BankAccountTransaction) => void;
}
```

### TransactionsPage Component

**Location**: `src/pages/Transactions.tsx`

**Features**:
- **Analytics Dashboard**: Summary cards with key metrics
- **Filter Controls**: Transaction type, category, and limit filters
- **Transaction Grid**: Responsive grid layout for transaction cards
- **Details Dialog**: Modal for viewing detailed transaction information
- **Refresh Functionality**: Manual refresh button
- **Loading States**: Proper loading indicators
- **Error Handling**: User-friendly error messages

## 📊 Analytics Features

### Bank Account Analytics
- **Total Accounts**: Count of all bank accounts
- **Total Balance**: Sum of all account balances
- **Connected Accounts**: Number of connected accounts
- **Active Accounts**: Number of active accounts
- **Total Incoming**: Sum of all incoming transactions across accounts
- **Total Outgoing**: Sum of all outgoing transactions across accounts
- **Accounts in Analytics**: Count of accounts included in analytics

### Transaction Analytics
- **Total Transactions**: Count of all transactions
- **Transaction Incoming**: Sum of all credit transactions
- **Transaction Outgoing**: Sum of all debit transactions
- **Average Amount**: Average transaction amount
- **Most Active Category**: Category with most transactions
- **Most Active Merchant**: Merchant with most transactions

### Transaction Categories
- **Food**: Restaurants, groceries, coffee shops
- **Utilities**: Electricity, water, gas bills
- **Transportation**: Gas, parking, public transport
- **Income**: Salary, dividends, interest
- **Interest**: Bank interest payments
- **Dividend**: Investment dividends
- **Payment**: Credit card payments, loan payments
- **Cash**: ATM withdrawals, cash transactions

### Transaction Types
- **Credit**: Money coming into the account
- **Debit**: Money going out of the account
- **Transfer**: Money transfers between accounts

## 🔄 Data Flow

### 1. Page Load
1. User navigates to `/transactions`
2. `TransactionsPage` component loads
3. `useEffect` triggers data fetching
4. API calls made to get recent transactions and analytics
5. Data displayed in UI components

### 2. Filtering
1. User selects filter options
2. `handleFilterChange` updates filter state
3. `useEffect` triggers with new filters
4. API call made with filter parameters
5. Filtered results displayed

### 3. Transaction Details
1. User clicks "View Details" on transaction card
2. `handleViewDetails` opens dialog
3. Detailed transaction information displayed
4. User can close dialog to return to list

### 4. Refresh
1. User clicks refresh button
2. `handleRefresh` triggers data reload
3. Fresh data fetched from API
4. UI updated with latest information

## 🛠️ Technical Implementation

### TypeScript Interfaces

**Transaction Interface**:
```typescript
interface BankAccountTransaction {
  id: string;
  bankAccountId: string;
  userId: string;
  amount: number;
  transactionType: string;
  description: string;
  category: string;
  referenceNumber?: string;
  externalTransactionId?: string;
  transactionDate: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  merchant?: string;
  location?: string;
  isRecurring: boolean;
  recurringFrequency?: string;
  currency: string;
  balanceAfterTransaction: number;
}
```

**Filter Interface**:
```typescript
interface TransactionFilters {
  bankAccountId?: string;
  transactionType?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  page?: number;
}
```

**Analytics Interface**:
```typescript
interface TransactionAnalytics {
  totalTransactions: number;
  totalIncoming: number;
  totalOutgoing: number;
  averageTransactionAmount: number;
  mostActiveCategory: string;
  mostActiveMerchant: string;
  generatedAt: string;
}
```

### API Service Methods

**Get Recent Transactions**:
```typescript
async getRecentTransactions(limit: number = 10): Promise<BankAccountTransaction[]>
```

**Get Transactions with Filters**:
```typescript
async getTransactions(filters?: TransactionFilters): Promise<PaginatedTransactionsResponse>
```

**Get Transaction Analytics**:
```typescript
async getTransactionAnalytics(): Promise<TransactionAnalytics>
```

**Get Single Transaction**:
```typescript
async getTransaction(transactionId: string): Promise<BankAccountTransaction>
```

## 🎯 Usage Examples

### Basic Usage
```typescript
// Get recent transactions
const recentTransactions = await apiService.getRecentTransactions(10);

// Get transactions with filters
const filteredTransactions = await apiService.getTransactions({
  transactionType: 'debit',
  category: 'food',
  limit: 20
});

// Get analytics
const analytics = await apiService.getTransactionAnalytics();
```

### Component Usage
```tsx
// TransactionCard
<TransactionCard
  transaction={transaction}
  onViewDetails={handleViewDetails}
/>

// TransactionsPage
<TransactionsPage />
```

## 🔒 Security & Authentication

- All API endpoints require authentication
- User can only access their own transactions
- Proper error handling for unauthorized access
- Token-based authentication with JWT

## 📱 Responsive Design

- **Mobile**: Single column layout with stacked cards
- **Tablet**: Two column layout for transaction cards
- **Desktop**: Three column layout with full analytics dashboard
- **Touch-friendly**: Large touch targets for mobile devices

## 🚀 Future Enhancements

### Planned Features
- **Transaction Search**: Full-text search across transactions
- **Export Functionality**: Export transactions to CSV/PDF
- **Transaction Categories**: Custom category management
- **Budget Tracking**: Set budgets and track spending
- **Transaction Trends**: Visual charts and graphs
- **Recurring Transaction Management**: Manage recurring transactions
- **Transaction Splitting**: Split transactions across categories
- **Receipt Upload**: Upload and attach receipts to transactions

### API Enhancements
- **Bulk Operations**: Bulk update/delete transactions
- **Advanced Filtering**: More sophisticated filter options
- **Real-time Updates**: WebSocket support for real-time updates
- **Transaction Reconciliation**: Match transactions with bank statements

## 📝 Notes

- All monetary amounts are handled with proper precision
- Date/time handling includes timezone support
- Currency formatting follows international standards
- Error handling provides user-friendly messages
- Loading states improve user experience
- Mock data service supports development without backend
