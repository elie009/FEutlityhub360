# ✅ FILE 3 — BACKEND API + DATA MODEL SPECIFICATION

## I. Required Modules

The backend must support the following modules:

1. **Banks** - Bank account management
2. **Wallets** - Digital wallet accounts
3. **Income** - Income source tracking
4. **Expenses** - Expense transaction management
5. **Bills** - Recurring bill management
6. **Utilities** - Utility bill tracking and forecasting
7. **Loans** - Loan management and amortization
8. **Savings** - Savings goal tracking
9. **Allocation Goals** - Budget allocation planning
10. **Notifications** - User notification system
11. **Reports** - Financial reporting and analytics
12. **Activity Logs** - Audit trail and activity tracking
13. **OCR Upload** - Receipt processing and extraction
14. **Transactions** - General transaction management
15. **Receivables** - Accounts receivable tracking

---

## II. Database Data Model (ERD Specification)

### Entity Relationship Diagram Overview

```
Users
├── BankAccounts (1-to-many)
├── SavingsAccounts (1-to-many)
├── Loans (1-to-many)
├── Bills (1-to-many)
├── Transactions (1-to-many)
├── IncomeSources (1-to-many)
├── Receivables (1-to-many)
├── Notifications (1-to-many)
└── ActivityLogs (1-to-many)

Loans
└── RepaymentSchedules (1-to-many)
└── Payments (1-to-many)

Bills
└── BillPayments (1-to-many)
└── BillHistory (1-to-many)

SavingsAccounts
└── SavingsTransactions (1-to-many)

BankAccounts
└── Transactions (1-to-many)
```

---

### Core Entities

#### 1. Users

**Table:** `users`

| Field | Type | Required | Validation | Constraints |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | UUID format | PRIMARY KEY |
| name | VARCHAR(100) | Yes | 2-100 chars | NOT NULL |
| email | VARCHAR(255) | Yes | Valid email | UNIQUE, NOT NULL |
| phone | VARCHAR(20) | Yes | Valid phone | NOT NULL |
| password_hash | VARCHAR(255) | Yes | Hashed | NOT NULL |
| kyc_verified | BOOLEAN | No | true/false | DEFAULT false |
| is_active | BOOLEAN | No | true/false | DEFAULT true |
| role | ENUM | No | USER/ADMIN | DEFAULT 'USER' |
| currency_preference | VARCHAR(3) | No | ISO 4217 | DEFAULT 'USD' |
| timezone | VARCHAR(50) | No | Valid timezone | DEFAULT 'UTC' |
| created_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |
| updated_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |

**Relationships:**
- One-to-Many: BankAccounts, SavingsAccounts, Loans, Bills, Transactions, IncomeSources, Receivables, Notifications, ActivityLogs

**Indexes:**
- PRIMARY KEY: id
- UNIQUE: email
- INDEX: is_active

---

#### 2. Bank Accounts

**Table:** `bank_accounts`

| Field | Type | Required | Validation | Constraints |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | UUID format | PRIMARY KEY |
| user_id | UUID | Yes | Valid UUID | FOREIGN KEY → users.id |
| account_name | VARCHAR(100) | Yes | 2-100 chars | NOT NULL |
| account_type | ENUM | Yes | bank/credit_card/investment/savings/checking | NOT NULL |
| initial_balance | DECIMAL(15,2) | Yes | >= 0 | NOT NULL, DEFAULT 0 |
| current_balance | DECIMAL(15,2) | Yes | >= 0 | NOT NULL, DEFAULT 0 |
| currency | VARCHAR(3) | Yes | ISO 4217 | NOT NULL, DEFAULT 'USD' |
| description | TEXT | No | Max 500 chars | NULL |
| financial_institution | VARCHAR(100) | No | 2-100 chars | NULL |
| account_number | VARCHAR(50) | No | 4-50 alphanumeric | NULL, ENCRYPTED |
| routing_number | VARCHAR(20) | No | 8-20 alphanumeric | NULL, ENCRYPTED |
| iban | VARCHAR(34) | No | Valid IBAN | NULL |
| swift_code | VARCHAR(11) | No | 8-11 alphanumeric | NULL |
| sync_frequency | ENUM | Yes | DAILY/WEEKLY/MONTHLY/MANUAL | DEFAULT 'MANUAL' |
| is_connected | BOOLEAN | No | true/false | DEFAULT false |
| connection_id | VARCHAR(100) | No | Provider connection ID | NULL |
| last_synced_at | TIMESTAMP | No | ISO 8601 | NULL |
| is_active | BOOLEAN | No | true/false | DEFAULT true |
| transaction_count | INTEGER | No | >= 0 | DEFAULT 0 |
| total_incoming | DECIMAL(15,2) | No | >= 0 | DEFAULT 0 |
| total_outgoing | DECIMAL(15,2) | No | >= 0 | DEFAULT 0 |
| created_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |
| updated_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |

**Relationships:**
- Many-to-One: Users (user_id)
- One-to-Many: Transactions (bank_account_id)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: user_id
- INDEX: user_id, is_active, account_type

**Business Rules:**
- current_balance cannot be negative (enforce in application)
- account_number and routing_number must be encrypted at rest
- When account is deleted, set is_active = false (soft delete)

---

#### 3. Transactions

**Table:** `transactions`

| Field | Type | Required | Validation | Constraints |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | UUID format | PRIMARY KEY |
| bank_account_id | UUID | Yes | Valid UUID | FOREIGN KEY → bank_accounts.id |
| user_id | UUID | Yes | Valid UUID | FOREIGN KEY → users.id |
| amount | DECIMAL(15,2) | Yes | != 0 | NOT NULL |
| transaction_type | ENUM | Yes | INCOME/EXPENSE/TRANSFER | NOT NULL |
| description | VARCHAR(200) | Yes | 2-200 chars | NOT NULL |
| category | VARCHAR(50) | No | Valid category | NULL |
| reference_number | VARCHAR(50) | No | 1-50 chars | NULL |
| external_transaction_id | VARCHAR(100) | No | External system ID | NULL, UNIQUE |
| transaction_date | DATE | Yes | Valid date | NOT NULL |
| currency | VARCHAR(3) | Yes | ISO 4217 | NOT NULL |
| notes | TEXT | No | Max 500 chars | NULL |
| merchant | VARCHAR(100) | No | 2-100 chars | NULL |
| location | VARCHAR(200) | No | 2-200 chars | NULL |
| is_recurring | BOOLEAN | No | true/false | DEFAULT false |
| recurring_frequency | VARCHAR(20) | No | Valid frequency | NULL |
| balance_after_transaction | DECIMAL(15,2) | Yes | Calculated | NOT NULL |
| bill_id | UUID | No | Valid UUID | FOREIGN KEY → bills.id |
| savings_account_id | UUID | No | Valid UUID | FOREIGN KEY → savings_accounts.id |
| loan_id | UUID | No | Valid UUID | FOREIGN KEY → loans.id |
| receipt_url | VARCHAR(500) | No | Valid URL | NULL |
| tags | JSON | No | Array of strings | NULL |
| created_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |
| updated_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |

**Relationships:**
- Many-to-One: BankAccounts (bank_account_id), Users (user_id)
- Many-to-One (Optional): Bills (bill_id), SavingsAccounts (savings_account_id), Loans (loan_id)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: bank_account_id, user_id
- INDEX: user_id, bank_account_id, transaction_date, category, transaction_type
- UNIQUE: external_transaction_id (where not null)

**Business Rules:**
- amount cannot be zero
- balance_after_transaction must be calculated and stored
- If transaction_type = TRANSFER, must have corresponding transaction in another account
- receipt_url must point to valid storage location

---

#### 4. Bills

**Table:** `bills`

| Field | Type | Required | Validation | Constraints |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | UUID format | PRIMARY KEY |
| user_id | UUID | Yes | Valid UUID | FOREIGN KEY → users.id |
| bill_name | VARCHAR(100) | Yes | 2-100 chars | NOT NULL |
| bill_type | ENUM | Yes | utility/insurance/subscription/school_tuition/credit_card/medical/other | NOT NULL |
| amount | DECIMAL(15,2) | Yes | > 0 | NOT NULL |
| due_date | DATE | Yes | Valid date | NOT NULL |
| frequency | ENUM | Yes | monthly/quarterly/yearly | NOT NULL |
| status | ENUM | Yes | PENDING/PAID/OVERDUE/AUTO_GENERATED | DEFAULT 'PENDING' |
| provider | VARCHAR(100) | No | 2-100 chars | NULL |
| reference_number | VARCHAR(50) | No | 1-50 chars | NULL |
| notes | TEXT | No | Max 500 chars | NULL |
| auto_generate_next | BOOLEAN | No | true/false | DEFAULT false |
| is_auto_generated | BOOLEAN | No | true/false | DEFAULT false |
| needs_confirmation | BOOLEAN | No | true/false | DEFAULT false |
| estimated_amount | DECIMAL(15,2) | No | > 0 | NULL |
| paid_at | TIMESTAMP | No | ISO 8601 | NULL |
| created_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |
| updated_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |

**Relationships:**
- Many-to-One: Users (user_id)
- One-to-Many: BillPayments (bill_id), BillHistory (bill_id)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: user_id
- INDEX: user_id, status, due_date, bill_type, provider

**Business Rules:**
- If status = PAID, paid_at must be set
- If auto_generate_next = true, system will create next bill automatically
- If is_auto_generated = true, needs_confirmation may be true for user approval

---

#### 5. Bill Payments

**Table:** `bill_payments`

| Field | Type | Required | Validation | Constraints |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | UUID format | PRIMARY KEY |
| bill_id | UUID | Yes | Valid UUID | FOREIGN KEY → bills.id |
| user_id | UUID | Yes | Valid UUID | FOREIGN KEY → users.id |
| amount | DECIMAL(15,2) | Yes | > 0 | NOT NULL |
| payment_date | DATE | Yes | Valid date | NOT NULL |
| payment_method | VARCHAR(50) | No | Valid method | NULL |
| transaction_id | UUID | No | Valid UUID | FOREIGN KEY → transactions.id |
| notes | TEXT | No | Max 500 chars | NULL |
| created_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |
| updated_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |

**Relationships:**
- Many-to-One: Bills (bill_id), Users (user_id), Transactions (transaction_id)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: bill_id, user_id, transaction_id
- INDEX: bill_id, payment_date

---

#### 6. Bill History

**Table:** `bill_history`

| Field | Type | Required | Validation | Constraints |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | UUID format | PRIMARY KEY |
| bill_id | UUID | Yes | Valid UUID | FOREIGN KEY → bills.id |
| month | INTEGER | Yes | 1-12 | NOT NULL |
| year | INTEGER | Yes | 2000-2100 | NOT NULL |
| amount | DECIMAL(15,2) | Yes | > 0 | NOT NULL |
| status | ENUM | Yes | PENDING/PAID/OVERDUE | NOT NULL |
| due_date | DATE | Yes | Valid date | NOT NULL |
| paid_date | DATE | No | Valid date | NULL |
| created_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |

**Relationships:**
- Many-to-One: Bills (bill_id)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: bill_id
- UNIQUE: bill_id, month, year

**Business Rules:**
- One record per bill per month/year
- Used for forecasting and analytics

---

#### 7. Loans

**Table:** `loans`

| Field | Type | Required | Validation | Constraints |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | UUID format | PRIMARY KEY |
| user_id | UUID | Yes | Valid UUID | FOREIGN KEY → users.id |
| principal | DECIMAL(15,2) | Yes | >= 1000 | NOT NULL |
| interest_rate | DECIMAL(5,2) | Yes | 0-100 | NOT NULL |
| term | INTEGER | Yes | 6-360 | NOT NULL |
| status | ENUM | Yes | PENDING/APPROVED/ACTIVE/CLOSED/COMPLETED/CANCELLED/REJECTED/OVERDUE | DEFAULT 'PENDING' |
| purpose | VARCHAR(200) | Yes | 2-200 chars | NOT NULL |
| monthly_payment | DECIMAL(15,2) | Yes | Calculated | NOT NULL |
| total_amount | DECIMAL(15,2) | Yes | Calculated | NOT NULL |
| remaining_balance | DECIMAL(15,2) | Yes | >= 0 | NOT NULL |
| outstanding_balance | DECIMAL(15,2) | Yes | >= 0 | NOT NULL |
| next_due_date | DATE | No | Valid date | NULL |
| applied_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |
| approved_at | TIMESTAMP | No | ISO 8601 | NULL |
| disbursed_at | TIMESTAMP | No | ISO 8601 | NULL |
| completed_at | TIMESTAMP | No | ISO 8601 | NULL |
| interest_computation_method | ENUM | No | FLAT_RATE/AMORTIZED | DEFAULT 'AMORTIZED' |
| total_interest | DECIMAL(15,2) | No | Calculated | NULL |
| down_payment | DECIMAL(15,2) | No | >= 0 | DEFAULT 0 |
| processing_fee | DECIMAL(15,2) | No | >= 0 | DEFAULT 0 |
| actual_financed_amount | DECIMAL(15,2) | No | Calculated | NULL |
| payment_frequency | ENUM | No | MONTHLY/WEEKLY/BIWEEKLY/QUARTERLY | DEFAULT 'MONTHLY' |
| start_date | DATE | No | Valid date | NULL |
| additional_info | TEXT | No | Max 500 chars | NULL |
| created_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |
| updated_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |

**Relationships:**
- Many-to-One: Users (user_id)
- One-to-Many: RepaymentSchedules (loan_id), Payments (loan_id)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: user_id
- INDEX: user_id, status, next_due_date

**Business Rules:**
- monthly_payment calculated based on principal, rate, term, and method
- remaining_balance updated after each payment
- If status = COMPLETED, remaining_balance must be 0
- actual_financed_amount = principal - down_payment

---

#### 8. Repayment Schedules

**Table:** `repayment_schedules`

| Field | Type | Required | Validation | Constraints |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | UUID format | PRIMARY KEY |
| loan_id | UUID | Yes | Valid UUID | FOREIGN KEY → loans.id |
| installment_number | INTEGER | Yes | 1-360 | NOT NULL |
| due_date | DATE | Yes | Valid date | NOT NULL |
| total_amount | DECIMAL(15,2) | Yes | > 0 | NOT NULL |
| principal_amount | DECIMAL(15,2) | Yes | > 0 | NOT NULL |
| interest_amount | DECIMAL(15,2) | Yes | >= 0 | NOT NULL |
| status | ENUM | Yes | PENDING/PAID/OVERDUE/PARTIAL | DEFAULT 'PENDING' |
| paid_at | TIMESTAMP | No | ISO 8601 | NULL |
| paid_date | DATE | No | Valid date | NULL |
| payment_method | VARCHAR(50) | No | Valid method | NULL |
| payment_reference | VARCHAR(100) | No | 1-100 chars | NULL |
| notes | TEXT | No | Max 500 chars | NULL |
| created_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |
| updated_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |

**Relationships:**
- Many-to-One: Loans (loan_id)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: loan_id
- UNIQUE: loan_id, installment_number
- INDEX: loan_id, due_date, status

**Business Rules:**
- total_amount = principal_amount + interest_amount
- Installment numbers must be sequential (1, 2, 3, ...)
- If status = PAID, paid_at must be set
- Cannot delete paid installments

---

#### 9. Payments

**Table:** `payments`

| Field | Type | Required | Validation | Constraints |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | UUID format | PRIMARY KEY |
| loan_id | UUID | Yes | Valid UUID | FOREIGN KEY → loans.id |
| user_id | UUID | Yes | Valid UUID | FOREIGN KEY → users.id |
| amount | DECIMAL(15,2) | Yes | > 0 | NOT NULL |
| payment_date | DATE | Yes | Valid date | NOT NULL |
| method | ENUM | Yes | BANK_TRANSFER/CARD/WALLET/CASH | NOT NULL |
| reference | VARCHAR(100) | Yes | 3-100 chars | NOT NULL |
| status | ENUM | Yes | PENDING/COMPLETED/FAILED | DEFAULT 'PENDING' |
| processed_at | TIMESTAMP | No | ISO 8601 | NULL |
| transaction_id | UUID | No | Valid UUID | FOREIGN KEY → transactions.id |
| notes | TEXT | No | Max 500 chars | NULL |
| created_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |
| updated_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |

**Relationships:**
- Many-to-One: Loans (loan_id), Users (user_id), Transactions (transaction_id)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: loan_id, user_id, transaction_id
- INDEX: loan_id, payment_date, status
- UNIQUE: loan_id, reference

**Business Rules:**
- reference must be unique per loan
- If status = COMPLETED, processed_at must be set
- Payment must update loan remaining_balance

---

#### 10. Savings Accounts

**Table:** `savings_accounts`

| Field | Type | Required | Validation | Constraints |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | UUID format | PRIMARY KEY |
| user_id | UUID | Yes | Valid UUID | FOREIGN KEY → users.id |
| account_name | VARCHAR(100) | Yes | 2-100 chars | NOT NULL |
| savings_type | ENUM | Yes | EMERGENCY/VACATION/INVESTMENT/RETIREMENT/EDUCATION/HOME_DOWN_PAYMENT/CAR_PURCHASE/WEDDING/TRAVEL/BUSINESS/HEALTH/TAX_SAVINGS/GENERAL/OTHERS | NOT NULL |
| target_amount | DECIMAL(15,2) | Yes | > 0 | NOT NULL |
| current_balance | DECIMAL(15,2) | Yes | >= 0 | NOT NULL, DEFAULT 0 |
| currency | VARCHAR(3) | Yes | ISO 4217 | NOT NULL, DEFAULT 'USD' |
| description | TEXT | No | Max 500 chars | NULL |
| goal | VARCHAR(200) | No | 2-200 chars | NULL |
| target_date | DATE | Yes | Valid date, future | NOT NULL |
| is_active | BOOLEAN | No | true/false | DEFAULT true |
| created_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |
| updated_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |

**Relationships:**
- Many-to-One: Users (user_id)
- One-to-Many: SavingsTransactions (savings_account_id)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: user_id
- INDEX: user_id, is_active, savings_type

**Business Rules:**
- current_balance cannot be negative
- target_date must be in the future
- Calculated fields: progress_percentage, remaining_amount, days_remaining, monthly_target

---

#### 11. Savings Transactions

**Table:** `savings_transactions`

| Field | Type | Required | Validation | Constraints |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | UUID format | PRIMARY KEY |
| savings_account_id | UUID | Yes | Valid UUID | FOREIGN KEY → savings_accounts.id |
| source_bank_account_id | UUID | No | Valid UUID | FOREIGN KEY → bank_accounts.id |
| amount | DECIMAL(15,2) | Yes | != 0 | NOT NULL |
| transaction_type | ENUM | Yes | DEPOSIT/WITHDRAWAL/TRANSFER/INTEREST/BONUS | NOT NULL |
| description | VARCHAR(200) | Yes | 2-200 chars | NOT NULL |
| category | ENUM | No | MONTHLY_SAVINGS/BONUS/TAX_REFUND/GIFT/SIDE_INCOME/INVESTMENT_RETURN/EMERGENCY_WITHDRAWAL/PLANNED_EXPENSE/TRANSFER/OTHER | NULL |
| notes | TEXT | No | Max 500 chars | NULL |
| transaction_date | DATE | Yes | Valid date | NOT NULL |
| currency | VARCHAR(3) | Yes | ISO 4217 | NOT NULL |
| is_recurring | BOOLEAN | No | true/false | DEFAULT false |
| recurring_frequency | VARCHAR(20) | No | Valid frequency | NULL |
| method | VARCHAR(50) | No | Valid method | NULL |
| created_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |
| updated_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |

**Relationships:**
- Many-to-One: SavingsAccounts (savings_account_id), BankAccounts (source_bank_account_id)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: savings_account_id, source_bank_account_id
- INDEX: savings_account_id, transaction_date, transaction_type

**Business Rules:**
- If transaction_type = WITHDRAWAL, amount must be negative or positive with sign handling
- If transaction_type = TRANSFER, source_bank_account_id must be set
- Transaction must update savings_account current_balance

---

#### 12. Income Sources

**Table:** `income_sources`

| Field | Type | Required | Validation | Constraints |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | UUID format | PRIMARY KEY |
| user_id | UUID | Yes | Valid UUID | FOREIGN KEY → users.id |
| source_name | VARCHAR(100) | Yes | 2-100 chars | NOT NULL |
| amount | DECIMAL(15,2) | Yes | > 0 | NOT NULL |
| frequency | ENUM | Yes | MONTHLY/WEEKLY/BIWEEKLY/QUARTERLY/YEARLY/ONE_TIME | NOT NULL |
| category | ENUM | No | SALARY/BUSINESS/INVESTMENT/OTHER | NULL |
| start_date | DATE | Yes | Valid date | NOT NULL |
| end_date | DATE | No | Valid date, >= start_date | NULL |
| notes | TEXT | No | Max 500 chars | NULL |
| is_active | BOOLEAN | No | true/false | DEFAULT true |
| created_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |
| updated_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |

**Relationships:**
- Many-to-One: Users (user_id)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: user_id
- INDEX: user_id, is_active, frequency

**Business Rules:**
- If frequency = ONE_TIME, end_date should equal start_date
- If end_date is set, income is inactive after that date

---

#### 13. Receivables

**Table:** `receivables`

| Field | Type | Required | Validation | Constraints |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | UUID format | PRIMARY KEY |
| user_id | UUID | Yes | Valid UUID | FOREIGN KEY → users.id |
| debtor_name | VARCHAR(100) | Yes | 2-100 chars | NOT NULL |
| amount | DECIMAL(15,2) | Yes | > 0 | NOT NULL |
| due_date | DATE | Yes | Valid date | NOT NULL |
| status | ENUM | Yes | PENDING/PAID/OVERDUE/PARTIAL | DEFAULT 'PENDING' |
| description | TEXT | No | Max 500 chars | NULL |
| paid_amount | DECIMAL(15,2) | No | >= 0 | DEFAULT 0 |
| paid_at | TIMESTAMP | No | ISO 8601 | NULL |
| created_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |
| updated_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |

**Relationships:**
- Many-to-One: Users (user_id)
- One-to-Many: ReceivablePayments (receivable_id)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: user_id
- INDEX: user_id, status, due_date

**Business Rules:**
- paid_amount cannot exceed amount
- If paid_amount = amount, status = PAID
- If paid_amount > 0 and < amount, status = PARTIAL

---

#### 14. Notifications

**Table:** `notifications`

| Field | Type | Required | Validation | Constraints |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | UUID format | PRIMARY KEY |
| user_id | UUID | Yes | Valid UUID | FOREIGN KEY → users.id |
| type | ENUM | Yes | PAYMENT_DUE/PAYMENT_RECEIVED/LOAN_APPROVED/LOAN_REJECTED/BILL_DUE/BILL_OVERDUE/GENERAL | NOT NULL |
| title | VARCHAR(200) | Yes | 2-200 chars | NOT NULL |
| message | TEXT | Yes | Max 1000 chars | NOT NULL |
| is_read | BOOLEAN | No | true/false | DEFAULT false |
| read_at | TIMESTAMP | No | ISO 8601 | NULL |
| related_entity_type | VARCHAR(50) | No | loan/bill/transaction/etc | NULL |
| related_entity_id | UUID | No | Valid UUID | NULL |
| created_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |
| updated_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |

**Relationships:**
- Many-to-One: Users (user_id)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: user_id
- INDEX: user_id, is_read, type, created_at

**Business Rules:**
- If is_read = true, read_at must be set
- Notifications older than 90 days can be archived

---

#### 15. Activity Logs

**Table:** `activity_logs`

| Field | Type | Required | Validation | Constraints |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | UUID format | PRIMARY KEY |
| user_id | UUID | Yes | Valid UUID | FOREIGN KEY → users.id |
| action | VARCHAR(50) | Yes | Valid action | NOT NULL |
| entity_type | VARCHAR(50) | Yes | Valid entity | NOT NULL |
| entity_id | UUID | Yes | Valid UUID | NOT NULL |
| description | TEXT | Yes | Max 500 chars | NOT NULL |
| ip_address | VARCHAR(45) | No | Valid IP | NULL |
| user_agent | VARCHAR(500) | No | Valid user agent | NULL |
| created_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |

**Relationships:**
- Many-to-One: Users (user_id)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: user_id
- INDEX: user_id, entity_type, entity_id, created_at

**Business Rules:**
- Logs are immutable (no updates/deletes)
- Logs older than 1 year can be archived

---

#### 16. Receipts (OCR)

**Table:** `receipts`

| Field | Type | Required | Validation | Constraints |
|-------|------|----------|------------|-------------|
| id | UUID | Yes | UUID format | PRIMARY KEY |
| user_id | UUID | Yes | Valid UUID | FOREIGN KEY → users.id |
| file_url | VARCHAR(500) | Yes | Valid URL | NOT NULL |
| file_type | VARCHAR(10) | No | image/pdf | NULL |
| file_size | INTEGER | No | > 0 | NULL |
| extracted_data | JSON | No | Valid JSON | NULL |
| amount | DECIMAL(15,2) | No | > 0 | NULL |
| merchant | VARCHAR(100) | No | 2-100 chars | NULL |
| transaction_date | DATE | No | Valid date | NULL |
| category | VARCHAR(50) | No | Valid category | NULL |
| status | ENUM | Yes | UPLOADED/PROCESSING/COMPLETED/FAILED | DEFAULT 'UPLOADED' |
| transaction_id | UUID | No | Valid UUID | FOREIGN KEY → transactions.id |
| confidence_score | DECIMAL(3,2) | No | 0-1 | NULL |
| created_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |
| updated_at | TIMESTAMP | Yes | ISO 8601 | NOT NULL |

**Relationships:**
- Many-to-One: Users (user_id), Transactions (transaction_id)

**Indexes:**
- PRIMARY KEY: id
- FOREIGN KEY: user_id, transaction_id
- INDEX: user_id, status, transaction_date

**Business Rules:**
- file_url must point to secure storage
- extracted_data contains OCR results
- If status = COMPLETED, amount and merchant should be populated

---

## III. API Structure

### Base URL
```
Production: https://api.utilityhub360.com/api
Development: http://localhost:5000/api
```

### Authentication
All endpoints (except auth endpoints) require Bearer token:
```
Authorization: Bearer <token>
```

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "errors": []
}
```

### Error Format
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    "Field 'amount' is required",
    "Field 'dueDate' must be a valid date"
  ]
}
```

---

### 1. Bank Accounts API

#### Endpoints

**GET /api/bank-accounts**
- Get all bank accounts for authenticated user
- Query params: `accountType`, `isActive`, `page`, `limit`
- Response: `PaginatedBankAccountsResponse`

**GET /api/bank-accounts/:id**
- Get single bank account
- Response: `BankAccount`

**POST /api/bank-accounts**
- Create new bank account
- Request: `CreateBankAccountRequest`
- Response: `BankAccount`

**PUT /api/bank-accounts/:id**
- Update bank account
- Request: `UpdateBankAccountRequest`
- Response: `BankAccount`

**DELETE /api/bank-accounts/:id**
- Delete bank account (soft delete)
- Response: `{ success: true, message: "Account deleted" }`

**GET /api/bank-accounts/:id/transactions**
- Get transactions for account
- Query params: `startDate`, `endDate`, `type`, `category`, `page`, `limit`
- Response: `PaginatedTransactionsResponse`

**POST /api/bank-accounts/:id/reconcile**
- Reconcile account with bank statement
- Request: `ReconciliationRequest`
- Response: `ReconciliationResponse`

**GET /api/bank-accounts/analytics**
- Get account analytics
- Query params: `startDate`, `endDate`
- Response: `BankAccountAnalytics`

#### Request JSON Examples

**Create Bank Account:**
```json
{
  "accountName": "BDO Savings",
  "accountType": "bank",
  "initialBalance": 45000.00,
  "currency": "USD",
  "description": "Primary savings account",
  "financialInstitution": "BDO",
  "accountNumber": "1234567890",
  "routingNumber": "123456789",
  "syncFrequency": "DAILY",
  "iban": "US64SVBKUS6S3300958879",
  "swiftCode": "SVBKUS6S"
}
```

**Update Bank Account:**
```json
{
  "accountName": "BDO Savings Updated",
  "currentBalance": 50000.00,
  "isActive": true
}
```

**Reconciliation Request:**
```json
{
  "statementBalance": 50000.00,
  "statementDate": "2024-01-31",
  "transactions": [
    {
      "date": "2024-01-15",
      "amount": 1000.00,
      "description": "Deposit",
      "reference": "DEP001"
    }
  ]
}
```

#### Response JSON Examples

**Bank Account:**
```json
{
  "success": true,
  "message": "Bank account retrieved successfully",
  "data": {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "userId": "123e4567-e89b-12d3-a456-426614174001",
    "accountName": "BDO Savings",
    "accountType": "bank",
    "initialBalance": 45000.00,
    "currentBalance": 50000.00,
    "currency": "USD",
    "description": "Primary savings account",
    "financialInstitution": "BDO",
    "accountNumber": "****7890",
    "syncFrequency": "DAILY",
    "isActive": true,
    "transactionCount": 25,
    "totalIncoming": 10000.00,
    "totalOutgoing": 5000.00,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  },
  "errors": []
}
```

#### Error Handling

**400 Bad Request:**
```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "errors": [
    "accountName is required",
    "initialBalance must be >= 0"
  ]
}
```

**401 Unauthorized:**
```json
{
  "success": false,
  "message": "Unauthorized",
  "data": null,
  "errors": ["Invalid or expired token"]
}
```

**404 Not Found:**
```json
{
  "success": false,
  "message": "Bank account not found",
  "data": null,
  "errors": []
}
```

#### Business Logic Rules

1. **Account Creation:**
   - Set `currentBalance = initialBalance`
   - Set `isActive = true`
   - Create activity log entry

2. **Balance Update:**
   - `currentBalance` can only be updated through transactions
   - Manual balance updates require reconciliation

3. **Account Deletion:**
   - Soft delete: Set `isActive = false`
   - Cannot delete if has transactions (or archive them)
   - Create activity log entry

4. **Reconciliation:**
   - Match transactions with statement
   - Identify missing transactions
   - Create adjustment entries if needed
   - Update `currentBalance` to match statement

---

### 2. Bills API

#### Endpoints

**GET /api/bills**
- Get all bills
- Query params: `status`, `billType`, `page`, `limit`
- Response: `PaginatedBillsResponse`

**GET /api/bills/:id**
- Get single bill
- Response: `Bill`

**POST /api/bills**
- Create new bill
- Request: `CreateBillRequest`
- Response: `Bill`

**PUT /api/bills/:id**
- Update bill
- Request: `UpdateBillRequest`
- Response: `Bill`

**DELETE /api/bills/:id**
- Delete bill
- Response: `{ success: true }`

**POST /api/bills/:id/mark-paid**
- Mark bill as paid
- Request: `{ paidAt?: string, notes?: string }`
- Response: `Bill`

**GET /api/bills/:id/history**
- Get bill payment history
- Response: `BillHistoryAnalytics`

**GET /api/bills/:id/forecast**
- Get bill forecast
- Query params: `months` (default: 3)
- Response: `BillForecast`

**GET /api/bills/analytics**
- Get bill analytics
- Query params: `startDate`, `endDate`
- Response: `BillAnalytics`

**POST /api/bills/budgets**
- Create budget for bill
- Request: `CreateBudgetRequest`
- Response: `BillBudget`

**GET /api/bills/budgets/status**
- Get budget statuses
- Response: `BudgetStatus[]`

#### Request JSON Examples

**Create Bill:**
```json
{
  "billName": "Electricity Bill",
  "billType": "utility",
  "amount": 150.00,
  "dueDate": "2024-02-15",
  "frequency": "monthly",
  "provider": "Meralco",
  "referenceNumber": "INV-2024-001",
  "notes": "Monthly electricity bill",
  "autoGenerateNext": true
}
```

**Mark as Paid:**
```json
{
  "paidAt": "2024-02-10T10:00:00Z",
  "notes": "Paid via online banking"
}
```

#### Business Logic Rules

1. **Bill Creation:**
   - If `autoGenerateNext = true`, schedule next bill generation
   - Create activity log entry

2. **Auto-Generation:**
   - Generate next bill based on `frequency`
   - Use `estimatedAmount` if bill is variable
   - Set `isAutoGenerated = true`
   - Set `needsConfirmation = true` if variance is high

3. **Mark as Paid:**
   - Update `status = PAID`
   - Set `paidAt = current timestamp`
   - Create transaction entry (if linked)
   - Create activity log entry

4. **Forecasting:**
   - Use last 3-6 months history
   - Apply seasonal factors
   - Calculate confidence based on data quality

---

### 3. Loans API

#### Endpoints

**GET /api/loans**
- Get all loans
- Query params: `status`, `page`, `limit`
- Response: `Loan[]`

**GET /api/loans/:id**
- Get single loan with schedule
- Response: `Loan` with `repaymentSchedules`

**POST /api/loans**
- Create new loan
- Request: `CreateLoanRequest`
- Response: `Loan` with generated schedule

**PUT /api/loans/:id**
- Update loan
- Request: `UpdateLoanRequest`
- Response: `Loan`

**DELETE /api/loans/:id**
- Delete loan (only if balance = 0)
- Response: `{ success: true }`

**GET /api/loans/:id/schedule**
- Get repayment schedule
- Response: `RepaymentSchedule[]`

**POST /api/loans/:id/payments**
- Make loan payment
- Request: `CreatePaymentRequest`
- Response: `Payment`

**POST /api/loans/:id/schedule/regenerate**
- Regenerate schedule (if loan terms changed)
- Request: `RegenerateScheduleRequest`
- Response: `ScheduleOperationResponse`

**GET /api/loans/:id/projections**
- Get payoff projections
- Response: `PayoffProjection`

#### Request JSON Examples

**Create Loan:**
```json
{
  "principal": 20000.00,
  "interestRate": 6.0,
  "term": 60,
  "purpose": "Home renovation",
  "interestComputationMethod": "AMORTIZED",
  "paymentFrequency": "MONTHLY",
  "startDate": "2024-02-01",
  "downPayment": 2000.00,
  "processingFee": 500.00
}
```

**Make Payment:**
```json
{
  "amount": 386.66,
  "paymentDate": "2024-02-01",
  "method": "BANK_TRANSFER",
  "reference": "PAY-2024-001",
  "notes": "Monthly payment"
}
```

#### Business Logic Rules

1. **Loan Creation:**
   - Calculate `monthlyPayment` based on formula
   - Calculate `totalAmount = principal + totalInterest`
   - Set `remainingBalance = principal - downPayment`
   - Generate amortization schedule
   - Create activity log entry

2. **Amortization Calculation:**
   ```typescript
   monthlyRate = interestRate / 12
   monthlyPayment = principal * (monthlyRate * (1 + monthlyRate)^term) / ((1 + monthlyRate)^term - 1)
   
   For each period:
     interest = remainingBalance * monthlyRate
     principal = monthlyPayment - interest
     newBalance = remainingBalance - principal
   ```

3. **Payment Processing:**
   - Update `remainingBalance`
   - Mark schedule entry as PAID
   - Create transaction entry
   - Update `nextDueDate`
   - If `remainingBalance = 0`, set `status = COMPLETED`

4. **Schedule Regeneration:**
   - Recalculate all future installments
   - Preserve paid installments
   - Update `monthlyPayment` if needed

---

### 4. Savings API

#### Endpoints

**GET /api/savings**
- Get all savings accounts
- Query params: `savingsType`, `isActive`, `page`, `limit`
- Response: `PaginatedSavingsAccountsResponse`

**GET /api/savings/:id**
- Get single savings account
- Response: `SavingsAccount`

**POST /api/savings**
- Create savings account
- Request: `CreateSavingsAccountRequest`
- Response: `SavingsAccount`

**PUT /api/savings/:id**
- Update savings account
- Request: `UpdateSavingsAccountRequest`
- Response: `SavingsAccount`

**DELETE /api/savings/:id**
- Delete savings account (only if balance = 0)
- Response: `{ success: true }`

**POST /api/savings/:id/transactions**
- Add transaction (deposit/withdrawal)
- Request: `CreateSavingsTransactionRequest`
- Response: `SavingsTransaction`

**GET /api/savings/:id/transactions**
- Get transaction history
- Query params: `startDate`, `endDate`, `type`, `page`, `limit`
- Response: `PaginatedSavingsTransactionsResponse`

**POST /api/savings/transfer/bank-to-savings**
- Transfer from bank to savings
- Request: `BankToSavingsTransferRequest`
- Response: `TransferResponse`

**POST /api/savings/transfer/savings-to-bank**
- Transfer from savings to bank
- Request: `SavingsToBankTransferRequest`
- Response: `TransferResponse`

**GET /api/savings/summary**
- Get savings summary
- Response: `SavingsSummary`

**GET /api/savings/analytics**
- Get savings analytics
- Query params: `startDate`, `endDate`
- Response: `SavingsAnalytics`

#### Business Logic Rules

1. **Savings Account Creation:**
   - Calculate `monthlyTarget = (targetAmount - currentBalance) / monthsRemaining`
   - Set `isActive = true`
   - Create activity log entry

2. **Transaction Processing:**
   - Update `currentBalance`
   - If `transactionType = TRANSFER`, create corresponding transaction in source account
   - Create activity log entry

3. **Monthly Target Calculation:**
   ```typescript
   monthsRemaining = (targetDate - today) / 30
   monthlyTarget = (targetAmount - currentBalance) / monthsRemaining
   ```

4. **Progress Tracking:**
   ```typescript
   progressPercentage = (currentBalance / targetAmount) * 100
   remainingAmount = targetAmount - currentBalance
   daysRemaining = targetDate - today
   ```

---

### 5. Transactions API

#### Endpoints

**GET /api/transactions**
- Get all transactions
- Query params: `bankAccountId`, `type`, `category`, `startDate`, `endDate`, `page`, `limit`
- Response: `PaginatedTransactionsResponse`

**GET /api/transactions/:id**
- Get single transaction
- Response: `BankAccountTransaction`

**POST /api/transactions**
- Create transaction
- Request: `CreateTransactionRequest`
- Response: `BankAccountTransaction`

**PUT /api/transactions/:id**
- Update transaction
- Request: `UpdateTransactionRequest`
- Response: `BankAccountTransaction`

**DELETE /api/transactions/:id**
- Delete transaction
- Response: `{ success: true }`

**POST /api/transactions/bulk**
- Bulk create transactions
- Request: `CreateTransactionRequest[]`
- Response: `BulkTransactionResponse`

**GET /api/transactions/analytics**
- Get transaction analytics
- Query params: `startDate`, `endDate`, `bankAccountId`
- Response: `TransactionAnalytics`

**POST /api/transactions/categorize**
- Auto-categorize transactions
- Request: `{ transactionIds: string[] }`
- Response: `CategorizationResponse`

#### Business Logic Rules

1. **Transaction Creation:**
   - Update account `currentBalance`
   - Calculate `balanceAfterTransaction`
   - If linked to bill/loan/savings, update related entity
   - Create activity log entry

2. **Double-Entry for Transfers:**
   - Create two transactions:
     - Debit: Destination account
     - Credit: Source account
   - Both must have same amount, opposite signs

3. **Balance Calculation:**
   ```typescript
   if (transactionType === 'INCOME' || transactionType === 'TRANSFER' && isDestination) {
     newBalance = currentBalance + amount
   } else {
     newBalance = currentBalance - amount
   }
   ```

---

## IV. Accounting Computation Rules

### 1. Outstanding Balance

**Formula:**
```
Outstanding Balance = Total Assets - Total Liabilities
```

**Implementation:**
```typescript
async function calculateOutstandingBalance(userId: string): Promise<number> {
  const assets = await getTotalAssets(userId); // Sum of bank accounts + savings
  const liabilities = await getTotalLiabilities(userId); // Sum of loans + unpaid bills
  return assets - liabilities;
}
```

**Database Query:**
```sql
SELECT 
  (SELECT COALESCE(SUM(current_balance), 0) FROM bank_accounts WHERE user_id = ? AND is_active = true)
  + (SELECT COALESCE(SUM(current_balance), 0) FROM savings_accounts WHERE user_id = ? AND is_active = true)
  AS total_assets,
  (SELECT COALESCE(SUM(remaining_balance), 0) FROM loans WHERE user_id = ? AND status IN ('ACTIVE', 'OVERDUE'))
  + (SELECT COALESCE(SUM(amount), 0) FROM bills WHERE user_id = ? AND status = 'PENDING')
  AS total_liabilities;
```

---

### 2. Loan Amortization

**Complete Calculation:**
```typescript
interface AmortizationEntry {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

function generateAmortizationSchedule(
  principal: number,
  annualRate: number,
  termMonths: number
): AmortizationEntry[] {
  const monthlyRate = annualRate / 12;
  const monthlyPayment = calculateMonthlyPayment(principal, monthlyRate, termMonths);
  const schedule: AmortizationEntry[] = [];
  let remainingBalance = principal;
  
  for (let period = 1; period <= termMonths; period++) {
    const interest = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interest;
    remainingBalance = Math.max(0, remainingBalance - principalPayment);
    
    schedule.push({
      period,
      payment: monthlyPayment,
      principal: principalPayment,
      interest,
      remainingBalance
    });
  }
  
  return schedule;
}

function calculateMonthlyPayment(
  principal: number,
  monthlyRate: number,
  termMonths: number
): number {
  if (monthlyRate === 0) {
    return principal / termMonths;
  }
  const factor = Math.pow(1 + monthlyRate, termMonths);
  return principal * (monthlyRate * factor) / (factor - 1);
}
```

**Database Storage:**
- Store schedule in `repayment_schedules` table
- Recalculate if loan terms change
- Preserve paid installments

---

### 3. Bill Forecasting

**Formula:**
```typescript
function forecastBillAmount(
  billId: string,
  historicalMonths: number = 3
): number {
  // Get last N months of bill history
  const history = await getBillHistory(billId, historicalMonths);
  
  if (history.length === 0) {
    return currentBill.amount; // Use current amount if no history
  }
  
  // Calculate weighted average (more recent = higher weight)
  let weightedSum = 0;
  let totalWeight = 0;
  
  history.forEach((bill, index) => {
    const weight = index + 1; // More recent = higher weight
    weightedSum += bill.amount * weight;
    totalWeight += weight;
  });
  
  const average = weightedSum / totalWeight;
  
  // Apply seasonal factor
  const targetMonth = getNextBillMonth(billId);
  const seasonalFactor = getSeasonalFactor(bill.billType, targetMonth);
  
  return average * seasonalFactor;
}

function getSeasonalFactor(billType: string, month: number): number {
  if (billType === 'utility') {
    // Summer months (June, July, August) - higher electricity
    if (month >= 6 && month <= 8) return 1.3;
    // Winter months (December, January, February) - higher heating
    if (month === 12 || month <= 2) return 1.4;
  }
  return 1.0; // Default no seasonal adjustment
}
```

---

### 4. Savings Monthly Target

**Formula:**
```typescript
function calculateMonthlyTarget(
  targetAmount: number,
  currentBalance: number,
  targetDate: Date
): number {
  const today = new Date();
  const monthsRemaining = Math.max(1, 
    (targetDate.getFullYear() - today.getFullYear()) * 12 + 
    (targetDate.getMonth() - today.getMonth())
  );
  
  const remaining = targetAmount - currentBalance;
  return remaining / monthsRemaining;
}
```

**Database Query:**
```sql
SELECT 
  target_amount,
  current_balance,
  target_date,
  (target_amount - current_balance) / 
    GREATEST(1, 
      EXTRACT(YEAR FROM target_date) - EXTRACT(YEAR FROM CURRENT_DATE) * 12 +
      EXTRACT(MONTH FROM target_date) - EXTRACT(MONTH FROM CURRENT_DATE)
    ) AS monthly_target
FROM savings_accounts
WHERE id = ?;
```

---

## V. Integrations

### 1. OCR for Receipts

**Implementation:**
- Use Google Cloud Vision API, AWS Textract, or Tesseract
- Extract: amount, date, merchant, items, tax
- Store extracted data in `receipts.extracted_data` (JSON)
- Link to transaction if match found

**API Endpoint:**
```
POST /api/receipts/upload
Content-Type: multipart/form-data

Form Data:
- file: File (image/PDF)
- transactionId?: string (optional, to link)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "receipt-id",
    "amount": 150.00,
    "merchant": "Walmart",
    "transactionDate": "2024-02-01",
    "category": "Groceries",
    "confidenceScore": 0.95,
    "extractedData": {
      "items": [...],
      "tax": 12.00,
      "total": 150.00
    }
  }
}
```

---

### 2. Notification Scheduler

**Implementation:**
- Background job (cron/scheduler)
- Check for:
  - Bills due in 3 days
  - Bills overdue
  - Loan payments due
  - Savings goals approaching
- Create notifications in database
- Send email/SMS if user preferences allow

**Scheduled Jobs:**
```typescript
// Daily at 9 AM
schedule('0 9 * * *', async () => {
  await checkBillsDue();
  await checkLoansDue();
  await checkSavingsGoals();
});

// Every hour
schedule('0 * * * *', async () => {
  await processAutoGeneratedBills();
});
```

---

### 3. Bank API Integration (Optional)

**Providers:**
- Plaid (US, Canada)
- Yodlee
- Open Banking APIs

**Implementation:**
- Store connection credentials securely
- Sync transactions periodically
- Match with existing transactions
- Handle duplicates

**API Endpoints:**
```
POST /api/bank-accounts/:id/connect
GET /api/bank-accounts/:id/sync
DELETE /api/bank-accounts/:id/disconnect
```

---

## VI. Security Considerations

### Data Encryption
- Encrypt sensitive fields (account numbers, routing numbers)
- Use AES-256 encryption
- Store encryption keys securely

### API Security
- Use HTTPS for all endpoints
- Implement rate limiting
- Validate all inputs
- Sanitize outputs
- Use parameterized queries (prevent SQL injection)

### Authentication
- JWT tokens with expiration
- Refresh token rotation
- Password hashing (bcrypt, Argon2)
- Multi-factor authentication (optional)

### Authorization
- User can only access their own data
- Validate user_id on all operations
- Role-based access control (if multi-user)

---

## VII. Performance Optimization

### Database Indexing
- Index all foreign keys
- Index frequently queried fields (user_id, dates, status)
- Composite indexes for common queries

### Caching
- Cache frequently accessed data (user profile, summaries)
- Use Redis for session management
- Cache calculation results (outstanding balance, etc.)

### Pagination
- All list endpoints support pagination
- Default page size: 20
- Max page size: 100

### Query Optimization
- Use eager loading for related data
- Avoid N+1 queries
- Use database views for complex queries

---

This document provides comprehensive specifications for the backend API and data model implementation.

