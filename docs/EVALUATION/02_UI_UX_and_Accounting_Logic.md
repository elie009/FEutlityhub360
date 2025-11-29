# ✅ FILE 2 — UI/UX FLOW + ACCOUNTING LOGIC (FRONTEND GUIDE)

## I. UI Flow (React)

### Pages Overview

1. **Dashboard** - `/`
2. **Bank & Wallet Accounts** - `/bank-accounts`
3. **Billing Manager** - `/bills`
4. **Utilities** - `/bills` (integrated)
5. **Expenses** - `/transactions`
6. **Loans** - `/loans`
7. **Savings** - `/savings`
8. **Allocation Planner** - `/apportioner`
9. **Reports** - `/analytics`
10. **Logs** - `/transactions` (activity log)
11. **Notifications** - `/notifications`
12. **OCR Receipt Upload** - `/transactions` (receipt upload)
13. **Income Sources** - `/income-sources`
14. **Receivables** - `/receivables`

---

## II. UI Component Requirements Per Page

### 1. Dashboard (`/`)

#### Component Structure
```
Dashboard
├── FinancialOverview
│   ├── SummaryCards (Income, Expenses, Balance, Disposable)
│   ├── PeriodSelector (Month/Year dropdown)
│   └── QuickActions
├── CashFlowChart
│   ├── BarChart (Monthly income vs expenses)
│   └── Legend
├── AccountBalances
│   ├── AccountCard[] (Bank accounts, Savings)
│   └── TotalBalance
├── UpcomingBills
│   ├── BillCard[] (Next 5 bills)
│   └── ViewAllButton
├── RecentTransactions
│   ├── TransactionRow[]
│   └── ViewAllButton
└── FinancialStatements (Future)
    ├── BalanceSheet
    ├── IncomeStatement
    └── CashFlowStatement
```

#### Input Fields
- **Period Selector:**
  - Year: Dropdown (2020-2030)
  - Month: Dropdown (January-December)
  - Type: `number` (year), `number` (month 1-12)

#### Buttons/Actions
- **Refresh Data** - Reload financial data
- **Export Report** - Download PDF/Excel
- **View Details** - Navigate to detailed views
- **Add Transaction** - Quick add transaction
- **View All Bills** - Navigate to bills page
- **View All Transactions** - Navigate to transactions page

#### Validation Rules
- Period must be valid date range
- Year: 2000-2100
- Month: 1-12

#### Chart Types
- **Bar Chart:** Monthly income vs expenses
- **Line Chart:** Cash flow trend (optional)
- **Pie Chart:** Expense categories (optional)
- **Donut Chart:** Account balance distribution

#### Card Formats
- **Summary Card:**
  - Icon
  - Label
  - Amount (large, bold)
  - Change indicator (↑/↓, percentage)
  - Period label

- **Account Card:**
  - Account name
  - Account type badge
  - Balance
  - Last updated timestamp
  - Quick action buttons

#### Microinteractions
- Hover: Card elevation increase
- Click: Navigate to detail page
- Loading: Skeleton loaders
- Error: Toast notification
- Success: Green checkmark animation

#### Tooltip Hints
- **Disposable Income:** "Money available after bills, loans, and fixed expenses"
- **Outstanding Balance:** "Total assets minus total liabilities (your net worth)"
- **Cash Flow:** "Difference between income and expenses for the selected period"

---

### 2. Bank & Wallet Accounts (`/bank-accounts`)

#### Component Structure
```
BankAccounts
├── Header
│   ├── Title
│   ├── AddAccountButton
│   └── Filters
├── AccountList
│   ├── AccountCard[]
│   │   ├── AccountInfo
│   │   ├── Balance
│   │   ├── TransactionCount
│   │   └── ActionsMenu
│   └── EmptyState
├── AccountDialog (Create/Edit)
│   ├── FormFields
│   ├── ValidationErrors
│   └── ActionButtons
└── AccountDetails (Modal)
    ├── TransactionHistory
    ├── BalanceChart
    └── ReconciliationButton
```

#### Input Fields
- **Account Name:** Text input, required, max 100 chars
- **Account Type:** Select (Bank, Credit Card, Investment, Savings, Checking)
- **Initial Balance:** Number input, required, min 0, 2 decimals
- **Currency:** Select (USD, EUR, GBP, etc.)
- **Financial Institution:** Text input, optional, max 100 chars
- **Account Number:** Text input, optional, masked display
- **Routing Number:** Text input, optional, masked display
- **IBAN:** Text input, optional, validated format
- **SWIFT Code:** Text input, optional, validated format
- **Sync Frequency:** Select (Daily, Weekly, Monthly, Manual)
- **Description:** Textarea, optional, max 500 chars

#### Buttons/Actions
- **Add Account** - Open create dialog
- **Edit Account** - Open edit dialog
- **Delete Account** - Confirm and delete
- **View Transactions** - Navigate to account transactions
- **Reconcile** - Open reconciliation dialog
- **Sync Now** - Manual sync trigger
- **Export Statement** - Download CSV/PDF

#### Validation Rules
- Account Name: Required, 2-100 characters
- Account Type: Required, must be valid enum
- Initial Balance: Required, >= 0, max 2 decimals
- Currency: Required, valid ISO currency code
- Account Number: If provided, 4-20 alphanumeric
- IBAN: If provided, valid IBAN format
- SWIFT Code: If provided, 8-11 alphanumeric

#### Chart Types
- **Line Chart:** Balance over time
- **Bar Chart:** Incoming vs Outgoing by month
- **Pie Chart:** Transaction categories

#### Card Formats
- **Account Card:**
  - Account name (header)
  - Account type badge
  - Current balance (large)
  - Financial institution
  - Transaction count
  - Last synced timestamp
  - Status indicator (Active/Inactive)
  - Action menu (3-dot menu)

#### Microinteractions
- Account card hover: Slight elevation
- Balance update: Animated number change
- Sync: Loading spinner, success checkmark
- Delete: Confirmation dialog with warning

#### Tooltip Hints
- **Initial Balance:** "Starting balance when account was created"
- **Current Balance:** "Current balance including all transactions"
- **Sync Frequency:** "How often to automatically sync with bank"
- **Reconcile:** "Match transactions with bank statement"

---

### 3. Billing Manager (`/bills`)

#### Component Structure
```
Bills
├── Header
│   ├── Title
│   ├── AddBillButton
│   └── Filters
├── BillSummary
│   ├── SummaryCards (Pending, Paid, Overdue)
│   └── TotalAmounts
├── BillList
│   ├── BillCard[]
│   │   ├── BillInfo
│   │   ├── Amount
│   │   ├── DueDate
│   │   ├── StatusBadge
│   │   └── Actions
│   └── EmptyState
├── BillDialog (Create/Edit)
│   ├── FormFields
│   ├── AutoGenerationToggle
│   └── ActionButtons
├── BillDetails (Modal)
│   ├── BillHistory
│   ├── PaymentHistory
│   ├── Forecast
│   └── VarianceAnalysis
└── BudgetManagement
    ├── BudgetCards
    └── BudgetDialog
```

#### Input Fields
- **Bill Name:** Text input, required, max 100 chars
- **Bill Type:** Select (Utility, Insurance, Subscription, School Tuition, Credit Card, Medical, Other)
- **Amount:** Number input, required, min 0.01, 2 decimals
- **Due Date:** Date picker, required
- **Frequency:** Select (Monthly, Quarterly, Yearly)
- **Provider:** Text input, optional, max 100 chars
- **Reference Number:** Text input, optional, max 50 chars
- **Notes:** Textarea, optional, max 500 chars
- **Auto Generate Next:** Checkbox
- **Estimated Amount:** Number input (for variable bills), 2 decimals

#### Buttons/Actions
- **Add Bill** - Open create dialog
- **Edit Bill** - Open edit dialog
- **Delete Bill** - Confirm and delete
- **Mark as Paid** - Update status to PAID
- **View Details** - Open bill details modal
- **Set Budget** - Open budget dialog
- **View History** - Show payment history
- **View Forecast** - Show cost forecast

#### Validation Rules
- Bill Name: Required, 2-100 characters
- Bill Type: Required, valid enum
- Amount: Required, > 0, max 2 decimals
- Due Date: Required, valid date, not in past (for new bills)
- Frequency: Required, valid enum
- Provider: If provided, 2-100 characters
- Reference Number: If provided, 1-50 characters

#### Chart Types
- **Bar Chart:** Bills by type
- **Line Chart:** Bill amount trends
- **Pie Chart:** Bills by status
- **Area Chart:** Monthly bill totals over time

#### Card Formats
- **Bill Card:**
  - Bill name (header)
  - Bill type badge
  - Amount (large, bold)
  - Due date with countdown
  - Status badge (Pending/Paid/Overdue)
  - Provider name
  - Auto-generation indicator
  - Action buttons (Mark Paid, Edit, Delete)

#### Microinteractions
- Status change: Smooth badge color transition
- Mark as paid: Checkmark animation
- Due date approaching: Warning color (yellow/red)
- Auto-generated badge: Pulsing indicator

#### Tooltip Hints
- **Auto Generate Next:** "Automatically create next bill based on frequency"
- **Estimated Amount:** "Predicted amount for variable bills (utilities)"
- **Due Date:** "Date when payment is due"
- **Frequency:** "How often this bill recurs"

---

### 4. Utilities (`/bills` - Filtered View)

#### Component Structure
```
Utilities (Filtered Bills View)
├── UtilitySummary
│   ├── TotalUtilityCost
│   ├── AverageMonthly
│   └── SeasonalTrend
├── UtilityList
│   ├── UtilityCard[]
│   │   ├── UtilityInfo
│   │   ├── CurrentAmount
│   │   ├── Forecast
│   │   ├── HistoryChart
│   │   └── BudgetStatus
│   └── EmptyState
└── UtilityDetails
    ├── ConsumptionData (if available)
    ├── CostPerUnit
    ├── HistoricalChart
    └── ForecastChart
```

#### Input Fields
- Same as Billing Manager (filtered to utility type)
- **Consumption Units:** Number input (kWh, gallons, etc.)
- **Cost Per Unit:** Calculated field
- **Seasonal Factor:** Auto-calculated, editable

#### Buttons/Actions
- **Add Utility** - Open create dialog (pre-filled with utility type)
- **View Forecast** - Show 3-6 month forecast
- **View History** - Show historical consumption/cost
- **Set Budget** - Set monthly budget for utility
- **Compare Providers** - Compare with market rates

#### Chart Types
- **Line Chart:** Utility cost over time
- **Bar Chart:** Monthly consumption (if available)
- **Area Chart:** Seasonal trends
- **Comparison Chart:** Actual vs Forecast vs Budget

#### Card Formats
- **Utility Card:**
  - Utility name (Electricity, Water, Gas, Internet)
  - Provider name
  - Current amount
  - Forecast amount (with confidence indicator)
  - Budget status (Under/Over budget)
  - Trend indicator (↑/↓)
  - Historical chart (mini)

---

### 5. Expenses (`/transactions`)

#### Component Structure
```
Transactions
├── Header
│   ├── Title
│   ├── AddTransactionButton
│   ├── Filters
│   └── Search
├── TransactionSummary
│   ├── TotalExpenses
│   ├── TotalIncome
│   ├── NetAmount
│   └── CategoryBreakdown
├── TransactionList
│   ├── TransactionRow[]
│   │   ├── Date
│   │   ├── Description
│   │   ├── Category
│   │   ├── Amount
│   │   ├── Account
│   │   └── Actions
│   └── EmptyState
├── TransactionDialog (Create/Edit)
│   ├── FormFields
│   ├── ReceiptUpload
│   └── ActionButtons
└── CategoryManagement
    ├── CategoryList
    └── CategoryDialog
```

#### Input Fields
- **Date:** Date picker, required, default today
- **Description:** Text input, required, max 200 chars
- **Amount:** Number input, required, min 0.01, 2 decimals
- **Type:** Select (Income, Expense, Transfer)
- **Category:** Select/Text input, required
- **Account:** Select, required
- **Notes:** Textarea, optional, max 500 chars
- **Receipt:** File upload (image/PDF)
- **Tags:** Multi-select chips

#### Buttons/Actions
- **Add Transaction** - Open create dialog
- **Edit Transaction** - Open edit dialog
- **Delete Transaction** - Confirm and delete
- **Categorize** - Bulk categorize
- **Export** - Download CSV/Excel
- **Upload Receipt** - OCR receipt processing
- **View Receipt** - View attached receipt

#### Validation Rules
- Date: Required, valid date
- Description: Required, 2-200 characters
- Amount: Required, > 0, max 2 decimals
- Type: Required, valid enum
- Category: Required
- Account: Required, valid account ID

#### Chart Types
- **Pie Chart:** Expenses by category
- **Bar Chart:** Monthly expenses
- **Line Chart:** Expense trends
- **Stacked Bar:** Expenses by category over time

#### Card Formats
- **Transaction Row:**
  - Date (formatted)
  - Description
  - Category badge
  - Amount (color-coded: red expense, green income)
  - Account name
  - Receipt icon (if available)
  - Action menu

#### Microinteractions
- Category change: Smooth badge update
- Amount entry: Real-time format
- Receipt upload: Progress bar, preview
- Bulk actions: Checkbox selection

#### Tooltip Hints
- **Category:** "Categorize for better reporting"
- **Receipt:** "Upload receipt for expense tracking"
- **Tags:** "Add tags for advanced filtering"

---

### 6. Loans (`/loans`)

#### Component Structure
```
Loans
├── Header
│   ├── Title
│   ├── AddLoanButton
│   └── Filters
├── LoanSummary
│   ├── TotalLoans
│   ├── TotalBalance
│   ├── MonthlyPayment
│   └── NextPayment
├── LoanList
│   ├── LoanCard[]
│   │   ├── LoanInfo
│   │   ├── Balance
│   │   ├── PaymentSchedule
│   │   └── Actions
│   └── EmptyState
├── LoanDialog (Create/Edit)
│   ├── FormFields
│   ├── AmortizationPreview
│   └── ActionButtons
├── LoanDetails
│   ├── LoanInfo
│   ├── AmortizationSchedule
│   ├── PaymentHistory
│   └── PayoffProjection
└── PaymentDialog
    ├── PaymentForm
    └── PaymentConfirmation
```

#### Input Fields
- **Loan Name/Purpose:** Text input, required, max 200 chars
- **Principal Amount:** Number input, required, min 1000, 2 decimals
- **Interest Rate:** Number input, required, 0-100, 2 decimals (annual %)
- **Term (Months):** Number input, required, min 6, max 360
- **Start Date:** Date picker, required
- **Payment Frequency:** Select (Monthly, Weekly, Biweekly, Quarterly)
- **Interest Method:** Select (Amortized, Flat Rate)
- **Down Payment:** Number input, optional, 2 decimals
- **Processing Fee:** Number input, optional, 2 decimals
- **Additional Info:** Textarea, optional, max 500 chars

#### Buttons/Actions
- **Add Loan** - Open create dialog
- **Edit Loan** - Open edit dialog
- **Delete Loan** - Confirm and delete (only if balance = 0)
- **Make Payment** - Open payment dialog
- **View Schedule** - Show amortization schedule
- **View Details** - Open loan details
- **Extend Term** - Modify loan term
- **Pay Off Early** - Calculate early payoff

#### Validation Rules
- Loan Name: Required, 2-200 characters
- Principal: Required, >= 1000, max 2 decimals
- Interest Rate: Required, 0-100, max 2 decimals
- Term: Required, 6-360 months
- Start Date: Required, valid date
- Payment Frequency: Required, valid enum
- Down Payment: If provided, < Principal, max 2 decimals

#### Chart Types
- **Bar Chart:** Principal vs Interest over time
- **Line Chart:** Balance reduction over time
- **Pie Chart:** Payment breakdown (Principal/Interest)
- **Gantt Chart:** Payment schedule timeline

#### Card Formats
- **Loan Card:**
  - Loan purpose (header)
  - Status badge (Active/Completed/Overdue)
  - Remaining balance (large)
  - Monthly payment
  - Next due date
  - Progress bar (paid %)
  - Action buttons

#### Microinteractions
- Payment made: Balance update animation
- Schedule update: Smooth table update
- Payoff projection: Interactive chart
- Status change: Badge color transition

#### Tooltip Hints
- **Principal:** "Original loan amount"
- **Interest Rate:** "Annual percentage rate (APR)"
- **Amortized:** "Interest calculated on remaining balance"
- **Flat Rate:** "Fixed interest amount per period"

---

### 7. Savings (`/savings`)

#### Component Structure
```
Savings
├── Header
│   ├── Title
│   ├── AddSavingsButton
│   └── Filters
├── SavingsSummary
│   ├── TotalSavings
│   ├── TotalGoals
│   ├── ProgressPercentage
│   └── MonthlyTarget
├── SavingsList
│   ├── SavingsCard[]
│   │   ├── SavingsInfo
│   │   ├── CurrentBalance
│   │   ├── TargetAmount
│   │   ├── ProgressBar
│   │   ├── DaysRemaining
│   │   └── Actions
│   └── EmptyState
├── SavingsDialog (Create/Edit)
│   ├── FormFields
│   ├── GoalCalculator
│   └── ActionButtons
├── TransactionDialog
│   ├── TransactionForm
│   └── TransferOptions
└── SavingsDetails
    ├── TransactionHistory
    ├── ProgressChart
    └── GoalTimeline
```

#### Input Fields
- **Account Name:** Text input, required, max 100 chars
- **Savings Type:** Select (Emergency, Vacation, Investment, Retirement, Education, etc.)
- **Target Amount:** Number input, required, min 0.01, 2 decimals
- **Target Date:** Date picker, required
- **Current Balance:** Number input, default 0, 2 decimals
- **Description:** Textarea, optional, max 500 chars
- **Goal:** Text input, optional, max 200 chars
- **Currency:** Select, default USD

#### Buttons/Actions
- **Add Savings Account** - Open create dialog
- **Edit Savings** - Open edit dialog
- **Delete Savings** - Confirm and delete (only if balance = 0)
- **Add Deposit** - Open transaction dialog
- **Withdraw** - Open withdrawal dialog
- **Transfer** - Transfer to/from bank account
- **View History** - Show transaction history
- **Update Goal** - Modify target amount/date

#### Validation Rules
- Account Name: Required, 2-100 characters
- Savings Type: Required, valid enum
- Target Amount: Required, > 0, max 2 decimals
- Target Date: Required, valid date, future date
- Current Balance: >= 0, max 2 decimals

#### Chart Types
- **Progress Bar:** Current vs Target
- **Line Chart:** Balance growth over time
- **Bar Chart:** Monthly contributions
- **Pie Chart:** Savings by type

#### Card Formats
- **Savings Card:**
  - Account name (header)
  - Savings type badge
  - Current balance (large)
  - Target amount
  - Progress bar (percentage)
  - Days remaining
  - Monthly target
  - Action buttons

#### Microinteractions
- Deposit: Balance increase animation
- Withdrawal: Balance decrease animation
- Goal reached: Celebration animation
- Progress update: Smooth bar animation

#### Tooltip Hints
- **Target Amount:** "Goal amount to save"
- **Target Date:** "Date to reach goal"
- **Monthly Target:** "Required monthly savings to reach goal"
- **Progress:** "Percentage of goal achieved"

---

### 8. Allocation Planner (`/apportioner`)

#### Component Structure
```
Apportioner
├── Header
│   ├── Title
│   └── SettingsButton
├── IncomeInput
│   ├── MonthlyIncome
│   └── IncomeSources
├── AllocationSummary
│   ├── SurplusDeficit
│   ├── AllocationBreakdown
│   └── Recommendations
├── AllocationChart
│   ├── PieChart (Allocation %)
│   └── BarChart (Allocated vs Actual)
├── CategoryAllocations
│   ├── CategoryCard[]
│   │   ├── CategoryName
│   │   ├── AllocatedAmount
│   │   ├── ActualAmount
│   │   ├── Variance
│   │   └── ProgressBar
│   └── AddCategoryButton
└── RecommendationsPanel
    ├── RecommendationList
    └── ActionButtons
```

#### Input Fields
- **Monthly Income:** Number input, required, min 0, 2 decimals
- **Allocation Categories:**
  - Category Name: Text input, required
  - Allocated Amount: Number input, required, min 0, 2 decimals
  - Percentage: Auto-calculated
- **Allocation Method:** Select (Custom, 50/30/20, 60/20/20, etc.)

#### Buttons/Actions
- **Add Category** - Add allocation category
- **Remove Category** - Remove category
- **Apply Template** - Apply preset allocation (50/30/20, etc.)
- **Calculate** - Recalculate allocations
- **Save Plan** - Save allocation plan
- **Reset** - Reset to defaults
- **View Report** - Generate allocation report

#### Validation Rules
- Monthly Income: Required, > 0, max 2 decimals
- Category Name: Required, 2-50 characters
- Allocated Amount: Required, >= 0, max 2 decimals
- Total Allocations: Should not exceed 100% (warning, not error)

#### Chart Types
- **Pie Chart:** Allocation percentages
- **Bar Chart:** Allocated vs Actual by category
- **Stacked Bar:** Monthly allocation breakdown
- **Line Chart:** Allocation trends over time

#### Card Formats
- **Category Card:**
  - Category name (header)
  - Allocated amount
  - Actual amount (from transactions)
  - Variance (difference)
  - Percentage of income
  - Progress indicator
  - Status (On track/Over/Under)

#### Microinteractions
- Allocation change: Real-time chart update
- Variance calculation: Color-coded (green/red)
- Template apply: Smooth transition
- Recommendation: Highlight relevant category

#### Tooltip Hints
- **Surplus:** "Extra money after all allocations"
- **Deficit:** "Shortfall in allocations"
- **Variance:** "Difference between allocated and actual"
- **50/30/20 Rule:** "50% Needs, 30% Wants, 20% Savings"

---

### 9. Reports (`/analytics`)

#### Component Structure
```
Analytics
├── Header
│   ├── Title
│   ├── DateRangePicker
│   └── ExportButton
├── ReportTabs
│   ├── Overview
│   ├── IncomeStatement
│   ├── BalanceSheet
│   ├── CashFlow
│   └── Custom
├── ReportContent
│   ├── Charts
│   ├── Tables
│   └── SummaryCards
└── ReportSettings
    ├── CustomizationOptions
    └── SaveTemplate
```

#### Input Fields
- **Date Range:** Date range picker, required
- **Report Type:** Select (Overview, Income Statement, Balance Sheet, Cash Flow, Custom)
- **Group By:** Select (Day, Week, Month, Quarter, Year)
- **Categories:** Multi-select
- **Accounts:** Multi-select

#### Buttons/Actions
- **Generate Report** - Generate selected report
- **Export PDF** - Download as PDF
- **Export Excel** - Download as Excel
- **Save Template** - Save report configuration
- **Print** - Print report
- **Share** - Share report link

#### Chart Types
- **Line Chart:** Trends over time
- **Bar Chart:** Comparisons
- **Pie Chart:** Category breakdowns
- **Area Chart:** Cumulative totals
- **Waterfall Chart:** Cash flow changes

#### Card Formats
- **Report Card:**
  - Report title
  - Date range
  - Key metrics
  - Chart/Table
  - Export options

---

### 10. Income Sources (`/income-sources`)

#### Component Structure
```
IncomeSources
├── Header
│   ├── Title
│   ├── AddIncomeButton
│   └── Filters
├── IncomeSummary
│   ├── TotalMonthlyIncome
│   ├── IncomeBySource
│   └── IncomeTrend
├── IncomeList
│   ├── IncomeCard[]
│   │   ├── SourceName
│   │   ├── Amount
│   │   ├── Frequency
│   │   └── Actions
│   └── EmptyState
└── IncomeDialog
    ├── FormFields
    └── ActionButtons
```

#### Input Fields
- **Source Name:** Text input, required, max 100 chars
- **Amount:** Number input, required, min 0.01, 2 decimals
- **Frequency:** Select (Monthly, Weekly, Biweekly, Quarterly, Yearly, One-time)
- **Start Date:** Date picker, required
- **End Date:** Date picker, optional
- **Category:** Select (Salary, Business, Investment, Other)
- **Notes:** Textarea, optional, max 500 chars

---

## III. Accounting Logic Per Page

### 1. Dashboard

#### Required Data
```typescript
interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  totalAssets: number;
  totalLiabilities: number;
  outstandingBalance: number; // Assets - Liabilities
  disposableIncome: number;
  monthlyCashFlow: MonthlyCashFlow[];
  accountBalances: AccountBalance[];
  upcomingBills: Bill[];
  recentTransactions: Transaction[];
}
```

#### Fields
- `totalIncome`: Sum of all income sources
- `totalExpenses`: Sum of all expenses
- `totalAssets`: Sum of bank accounts + savings
- `totalLiabilities`: Sum of loans + unpaid bills
- `outstandingBalance`: Calculated (Assets - Liabilities)
- `disposableIncome`: Calculated (Income - Bills - Loans - Fixed Expenses)

#### Datatypes
- All amounts: `number` (2 decimals)
- Dates: `string` (ISO 8601)
- Percentages: `number` (2 decimals)

#### Relations
- Income Sources → Dashboard (aggregation)
- Expenses → Dashboard (aggregation)
- Bank Accounts → Assets
- Loans → Liabilities
- Bills → Liabilities (if unpaid)

#### Required Formulas

**Outstanding Balance:**
```typescript
outstandingBalance = totalAssets - totalLiabilities
```

**Disposable Income:**
```typescript
disposableIncome = monthlyIncome - (bills + loans + fixedExpenses)
```

**Monthly Cash Flow:**
```typescript
monthlyCashFlow = monthlyIncome - monthlyExpenses
```

#### Double-Entry Accounting

**When receiving income:**
```
Debit:  Cash (Bank Account)        $5,000
Credit: Income (Salary Income)     $5,000
```

**When paying expense:**
```
Debit:  Expense (Category)          $150
Credit: Cash (Bank Account)        $150
```

#### Sample Computations

**Example 1 (Simple):**
- Assets: $50,000
- Liabilities: $25,000
- Outstanding Balance: $50,000 - $25,000 = $25,000

**Example 2 (Edge Case - Negative Equity):**
- Assets: $20,000
- Liabilities: $30,000
- Outstanding Balance: $20,000 - $30,000 = -$10,000 (Debt exceeds assets)

---

### 2. Bank & Wallet Accounts

#### Required Data
```typescript
interface BankAccountData {
  accounts: BankAccount[];
  totalBalance: number;
  totalIncoming: number;
  totalOutgoing: number;
  reconciliationStatus: ReconciliationStatus;
}
```

#### Fields
- `currentBalance`: Current account balance
- `initialBalance`: Starting balance
- `transactionCount`: Number of transactions
- `lastSyncedAt`: Last synchronization timestamp

#### Double-Entry Accounting

**Opening account:**
```
Debit:  Cash (Bank Account)        $10,000
Credit: Owner's Capital            $10,000
```

**Transfer between accounts:**
```
Debit:  Cash (Account B)            $1,000
Credit: Cash (Account A)           $1,000
```

**Reconciliation:**
- Match transactions with bank statement
- Identify discrepancies
- Create adjustment entries if needed

#### Sample Computations

**Example 1 (Balance Calculation):**
- Initial Balance: $10,000
- Incoming: $5,000
- Outgoing: $3,000
- Current Balance: $10,000 + $5,000 - $3,000 = $12,000

**Example 2 (Reconciliation):**
- Book Balance: $12,000
- Bank Statement: $12,150
- Difference: $150 (unreconciled transaction)

---

### 3. Billing Manager

#### Required Data
```typescript
interface BillData {
  bills: Bill[];
  totalPending: number;
  totalPaid: number;
  totalOverdue: number;
  budgets: Budget[];
  forecasts: BillForecast[];
}
```

#### Fields
- `amount`: Bill amount
- `dueDate`: Payment due date
- `status`: PENDING, PAID, OVERDUE
- `frequency`: MONTHLY, QUARTERLY, YEARLY
- `estimatedAmount`: For variable bills

#### Double-Entry Accounting

**Receiving bill (Accrual):**
```
Debit:  Expense (Utility Expense)      $150
Credit: Accounts Payable               $150
```

**Paying bill:**
```
Debit:  Accounts Payable                $150
Credit: Cash                            $150
```

**Auto-generated bill:**
```
Debit:  Expense (Utility Expense)      $150
Credit: Accounts Payable               $150
```

#### Required Formulas

**Variable Bill Prediction:**
```typescript
predictedAmount = average(last3Months) * seasonalFactor
```

**Budget Variance:**
```typescript
variance = actualAmount - budgetAmount
variancePercentage = (variance / budgetAmount) * 100
```

#### Sample Computations

**Example 1 (Fixed Bill):**
- Bill Amount: $150
- Status: PENDING
- Due Date: 2024-02-15
- No variance (fixed amount)

**Example 2 (Variable Bill with Forecast):**
- Last 3 months: [$150, $180, $160]
- Average: $163.33
- Seasonal Factor (Summer): 1.15
- Predicted: $163.33 × 1.15 = $187.83
- Budget: $200
- Variance: $187.83 - $200 = -$12.17 (under budget)

---

### 4. Loans

#### Required Data
```typescript
interface LoanData {
  loans: Loan[];
  totalBalance: number;
  monthlyPayment: number;
  nextPayment: UpcomingPayment;
  amortizationSchedule: RepaymentSchedule[];
}
```

#### Fields
- `principal`: Original loan amount
- `interestRate`: Annual interest rate (%)
- `term`: Loan term in months
- `remainingBalance`: Current balance
- `monthlyPayment`: Monthly payment amount

#### Double-Entry Accounting

**Loan Disbursement:**
```
Debit:  Cash                            $20,000
Credit: Loan Payable                   $20,000
```

**Loan Payment:**
```
Debit:  Loan Payable (Principal)       $500
Debit:  Interest Expense               $200
Credit: Cash                           $700
```

#### Required Formulas

**Monthly Payment (Amortized):**
```typescript
monthlyRate = annualRate / 12
monthlyPayment = principal * (monthlyRate * (1 + monthlyRate)^term) / ((1 + monthlyRate)^term - 1)
```

**Monthly Interest:**
```typescript
monthlyInterest = remainingBalance * (annualRate / 12)
```

**Principal Payment:**
```typescript
principalPayment = monthlyPayment - monthlyInterest
```

**Effective Interest Rate:**
```typescript
effectiveRate = ((1 + (annualRate / 12))^12) - 1
```

#### Sample Computations

**Example 1 (Amortization Calculation):**
- Principal: $20,000
- Annual Rate: 6% (0.06)
- Term: 60 months
- Monthly Rate: 0.06 / 12 = 0.005
- Monthly Payment: $20,000 × (0.005 × 1.005^60) / (1.005^60 - 1) = $386.66

**First Payment Breakdown:**
- Interest: $20,000 × 0.005 = $100
- Principal: $386.66 - $100 = $286.66
- New Balance: $20,000 - $286.66 = $19,713.34

**Example 2 (Early Payoff):**
- Remaining Balance: $10,000
- Monthly Payment: $386.66
- Monthly Rate: 0.005
- Payoff Months: -log(1 - (10000 × 0.005 / 386.66)) / log(1.005) ≈ 26.5 months

---

### 5. Savings

#### Required Data
```typescript
interface SavingsData {
  accounts: SavingsAccount[];
  totalBalance: number;
  totalTarget: number;
  progressPercentage: number;
  monthlyTarget: number;
  transactions: SavingsTransaction[];
}
```

#### Fields
- `currentBalance`: Current savings balance
- `targetAmount`: Goal amount
- `targetDate`: Goal date
- `progressPercentage`: (currentBalance / targetAmount) × 100

#### Double-Entry Accounting

**Deposit to Savings:**
```
Debit:  Savings Account                $1,000
Credit: Cash (Bank Account)            $1,000
```

**Withdrawal from Savings:**
```
Debit:  Cash (Bank Account)            $500
Credit: Savings Account                $500
```

**Interest Earned:**
```
Debit:  Savings Account                $50
Credit: Interest Income                $50
```

#### Required Formulas

**Monthly Target:**
```typescript
monthsRemaining = (targetDate - today) / (30 days)
monthlyTarget = (targetAmount - currentBalance) / monthsRemaining
```

**Progress Percentage:**
```typescript
progressPercentage = (currentBalance / targetAmount) * 100
```

#### Sample Computations

**Example 1 (Goal Tracking):**
- Target Amount: $10,000
- Current Balance: $2,000
- Target Date: 12 months from now
- Monthly Target: ($10,000 - $2,000) / 12 = $666.67
- Progress: ($2,000 / $10,000) × 100 = 20%

**Example 2 (Goal Reached):**
- Target Amount: $10,000
- Current Balance: $10,500
- Progress: 105% (exceeded goal)

---

### 6. Allocation Planner

#### Required Data
```typescript
interface AllocationData {
  monthlyIncome: number;
  allocations: Allocation[];
  actuals: ActualSpending[];
  surplusDeficit: number;
  recommendations: string[];
}
```

#### Fields
- `allocatedAmount`: Budgeted amount per category
- `actualAmount`: Actual spending per category
- `variance`: Difference (allocated - actual)
- `percentage`: Percentage of income

#### Required Formulas

**Surplus/Deficit:**
```typescript
surplusDeficit = monthlyIncome - sum(allocatedAmounts)
```

**Variance:**
```typescript
variance = allocatedAmount - actualAmount
```

**Monthly Requirement:**
```typescript
monthlyRequirement = (goalAmount - currentProgress) / monthsRemaining
```

#### Sample Computations

**Example 1 (50/30/20 Rule):**
- Monthly Income: $5,000
- Needs (50%): $2,500
- Wants (30%): $1,500
- Savings (20%): $1,000
- Surplus: $0 (fully allocated)

**Example 2 (With Variance):**
- Allocated (Needs): $2,500
- Actual (Needs): $2,300
- Variance: $200 (under budget)
- Allocated (Wants): $1,500
- Actual (Wants): $1,600
- Variance: -$100 (over budget)

---

## IV. UX Recommendations

### General Principles

1. **Avoid Long Forms**
   - Use multi-step wizards for complex forms
   - Progressive disclosure (show advanced options on demand)
   - Auto-save draft forms
   - Smart defaults based on user history

2. **Auto-categorization**
   - ML-based transaction categorization
   - Learn from user corrections
   - Suggest categories for uncategorized items
   - Merchant-based auto-categorization

3. **Smart Defaults**
   - Pre-fill common values
   - Remember user preferences
   - Suggest based on patterns
   - Context-aware defaults

4. **Hints and Warnings**
   - Inline validation messages
   - Contextual tooltips
   - Warning for unusual transactions
   - Success confirmations
   - Error recovery suggestions

### Recommended Layout for React Developers

#### Component Hierarchy
```
App
└── Layout
    ├── Sidebar
    ├── Header
    └── MainContent
        └── Page Components
            ├── Dashboard
            ├── BankAccounts
            ├── Bills
            ├── Transactions
            ├── Loans
            ├── Savings
            ├── Apportioner
            └── Analytics
```

#### State Management
- Use React Context for global state (Auth, Currency)
- Use local state for component-specific data
- Consider Redux for complex state management
- Use React Query for server state

#### Form Handling
- Use React Hook Form for form management
- Yup or Zod for validation
- Show validation errors inline
- Disable submit until valid

#### Data Fetching
- Use React Query for API calls
- Implement loading states (skeletons)
- Error boundaries for error handling
- Optimistic updates for better UX

#### Performance
- Lazy load routes
- Memoize expensive calculations
- Virtualize long lists
- Debounce search/filter inputs

---

## V. Validation Rules Summary

### Common Validations

**Amounts:**
- Required
- >= 0
- Max 2 decimal places
- Max value: 999,999,999.99

**Dates:**
- Required
- Valid date format
- Not in past (for future events)
- Not too far in future (reasonable limits)

**Text Fields:**
- Required (where applicable)
- Min length: 2 characters
- Max length: varies by field
- No special characters (where applicable)

**Select Fields:**
- Required
- Must be valid enum value
- Cannot be empty

**Email/Phone:**
- Valid format
- Unique (where applicable)

---

## VI. Error Handling

### User-Friendly Error Messages

**Instead of:**
- "Validation failed"
- "Error 400"
- "Invalid input"

**Use:**
- "Please enter a valid amount (minimum $0.01)"
- "Due date must be in the future"
- "Account name must be between 2 and 100 characters"

### Error Recovery

- Provide clear action steps
- Highlight problematic fields
- Suggest corrections
- Allow partial saves
- Provide undo functionality

---

## VII. Accessibility

### Requirements

1. **Keyboard Navigation**
   - All interactive elements keyboard accessible
   - Logical tab order
   - Skip links for main content

2. **Screen Readers**
   - Proper ARIA labels
   - Descriptive alt text
   - Form field labels
   - Error announcements

3. **Visual**
   - Sufficient color contrast
   - Not color-only indicators
   - Resizable text
   - Focus indicators

4. **Mobile**
   - Touch-friendly targets (min 44x44px)
   - Responsive design
   - Mobile-optimized forms
   - Swipe gestures where appropriate

---

This document provides comprehensive guidance for implementing the UI/UX and accounting logic for each page in the React application.

