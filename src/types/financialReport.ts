// Financial Reports & Analytics Types

export interface TrendDataPoint {
  date: string;
  label: string;
  value: number;
}

export interface CategoryData {
  [category: string]: number;
}

export interface FinancialSummaryDto {
  totalIncome: number;
  incomeChange: number;
  totalExpenses: number;
  expenseChange: number;
  disposableIncome: number;
  disposableChange: number;
  totalSavings: number;
  savingsGoal: number;
  savingsProgress: number;
  netWorth: number;
  netWorthChange: number;
}

export interface IncomeReportDto {
  totalIncome: number;
  monthlyAverage: number;
  growthRate: number;
  incomeBySource: CategoryData;
  incomeByCategory: CategoryData;
  incomeTrend: TrendDataPoint[];
  topIncomeSource: string;
  topIncomeAmount: number;
}

export interface CategoryComparison {
  category: string;
  currentAmount: number;
  previousAmount: number;
  change: number;
  changePercentage: number;
}

export interface ExpenseReportDto {
  totalExpenses: number;
  fixedExpenses: number;
  variableExpenses: number;
  expenseByCategory: CategoryData;
  expensePercentage: CategoryData;
  expenseTrend: TrendDataPoint[];
  highestExpenseCategory: string;
  highestExpenseAmount: number;
  highestExpensePercentage: number;
  averageMonthlyExpense: number;
  categoryComparison: CategoryComparison[];
}

export interface DisposableIncomeReportDto {
  currentDisposableIncome: number;
  disposableTrend: TrendDataPoint[];
  averageDisposableIncome: number;
  recommendedSavings: number;
  comparisonWithPrevious: {
    previousAmount: number;
    change: number;
    changePercentage: number;
  };
}

export interface BillsReportDto {
  totalMonthlyBills: number;
  averageBillAmount: number;
  billsByType: CategoryData;
  billsByProvider: CategoryData;
  billsTrend: TrendDataPoint[];
  predictedNextMonth: number;
  unpaidBillsCount: number;
  overdueBillsCount: number;
  upcomingBills: Array<{
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    daysUntilDue: number;
  }>;
}

export interface LoanDetail {
  id: string;
  purpose: string;
  principalAmount: number;
  remainingBalance: number;
  monthlyPayment: number;
  interestRate: number;
  repaymentProgress: number;
}

export interface LoanReportDto {
  activeLoansCount: number;
  totalPrincipal: number;
  totalRemainingBalance: number;
  totalMonthlyPayment: number;
  totalInterestPaid: number;
  loans: LoanDetail[];
  projectedDebtFreeDate: string | null;
}

export interface SavingsGoalDto {
  goalName: string;
  targetAmount: number;
  currentAmount: number;
  progress: number;
  targetDate: string;
  startDate: string;
}

export interface SavingsReportDto {
  totalSavingsBalance: number;
  monthlySavingsAmount: number;
  savingsGoal: number;
  goalProgress: number;
  savingsRate: number;
  savingsTrend: TrendDataPoint[];
  projectedGoalDate: string | null;
  monthsUntilGoal: number | null;
  goals?: SavingsGoalDto[];
}

export interface NetWorthReportDto {
  currentNetWorth: number;
  netWorthChange: number;
  netWorthChangePercentage: number;
  totalAssets: number;
  totalLiabilities: number;
  assetBreakdown: CategoryData;
  liabilityBreakdown: CategoryData;
  netWorthTrend: TrendDataPoint[];
  trendDescription: string;
}

export interface FinancialInsightDto {
  type: 'ALERT' | 'TIP' | 'FORECAST';
  title: string;
  message: string;
  category: string;
  amount?: number;
  percentage?: number;
  severity: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  icon: string;
}

export interface FinancialPredictionDto {
  type: 'INCOME' | 'EXPENSE' | 'BILLS' | 'SAVINGS' | 'DISPOSABLE';
  description: string;
  predictedAmount: number;
  predictionDate: string;
  confidence: number;
}

export interface RecentTransactionDto {
  date: string;
  category: string;
  description: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  balanceAfter: number;
}

export interface FinancialReportDto {
  reportDate: string;
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
  summary: FinancialSummaryDto;
  incomeReport: IncomeReportDto;
  expenseReport: ExpenseReportDto;
  disposableIncomeReport: DisposableIncomeReportDto;
  billsReport: BillsReportDto;
  loanReport: LoanReportDto;
  savingsReport: SavingsReportDto;
  netWorthReport: NetWorthReportDto;
  insights: FinancialInsightDto[];
  predictions: FinancialPredictionDto[];
  recentTransactions: RecentTransactionDto[];
}

export interface ReportQueryParams {
  period?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
  startDate?: string;
  endDate?: string;
  includeComparison?: boolean;
  includeInsights?: boolean;
  includePredictions?: boolean;
  includeTransactions?: boolean;
}

