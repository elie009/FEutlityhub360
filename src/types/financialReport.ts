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
  monthsUntilDebtFree?: number;
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

export interface MonthlyCashFlowDto {
  month: string;
  startingBalance: number;
  income: number;
  expenses: number;
  bills: number;
  loanPayments: number;
  savings: number;
  endingBalance: number;
  netFlow: number;
}

export interface CashFlowProjectionDto {
  projectionDate: string;
  monthsAhead: number;
  startingBalance: number;
  projectedIncome: number;
  projectedExpenses: number;
  projectedBills: number;
  projectedLoanPayments: number;
  projectedSavings: number;
  projectedEndingBalance: number;
  netCashFlow: number;
  monthlyBreakdown: MonthlyCashFlowDto[];
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

// Balance Sheet Types
export interface BalanceSheetItemDto {
  accountName: string;
  accountType: string;
  amount: number;
  description?: string;
  referenceId?: string;
}

export interface AssetsSectionDto {
  currentAssets: BalanceSheetItemDto[];
  totalCurrentAssets: number;
  fixedAssets: BalanceSheetItemDto[];
  totalFixedAssets: number;
  otherAssets: BalanceSheetItemDto[];
  totalOtherAssets: number;
  totalAssets: number;
}

export interface LiabilitiesSectionDto {
  currentLiabilities: BalanceSheetItemDto[];
  totalCurrentLiabilities: number;
  longTermLiabilities: BalanceSheetItemDto[];
  totalLongTermLiabilities: number;
  totalLiabilities: number;
}

export interface EquitySectionDto {
  ownersCapital: number;
  retainedEarnings: number;
  totalEquity: number;
}

export interface BalanceSheetDto {
  asOfDate: string;
  assets: AssetsSectionDto;
  liabilities: LiabilitiesSectionDto;
  equity: EquitySectionDto;
  totalAssets: number;
  totalLiabilitiesAndEquity: number;
  isBalanced: boolean;
}

// Cash Flow Statement Types
export interface CashFlowItemDto {
  description: string;
  category: string;
  amount: number;
  transactionDate: string;
  referenceId?: string;
  referenceType?: string;
}

export interface OperatingActivitiesDto {
  incomeReceived: number;
  otherOperatingInflows: number;
  totalOperatingInflows: number;
  expensesPaid: number;
  billsPaid: number;
  interestPaid: number;
  otherOperatingOutflows: number;
  totalOperatingOutflows: number;
  netCashFromOperations: number;
  inflowItems: CashFlowItemDto[];
  outflowItems: CashFlowItemDto[];
}

export interface InvestingActivitiesDto {
  savingsWithdrawals: number;
  investmentReturns: number;
  otherInvestingInflows: number;
  totalInvestingInflows: number;
  savingsDeposits: number;
  investmentsMade: number;
  otherInvestingOutflows: number;
  totalInvestingOutflows: number;
  netCashFromInvesting: number;
  inflowItems: CashFlowItemDto[];
  outflowItems: CashFlowItemDto[];
}

export interface FinancingActivitiesDto {
  loanDisbursements: number;
  otherFinancingInflows: number;
  totalFinancingInflows: number;
  loanPayments: number;
  principalPayments: number;
  otherFinancingOutflows: number;
  totalFinancingOutflows: number;
  netCashFromFinancing: number;
  inflowItems: CashFlowItemDto[];
  outflowItems: CashFlowItemDto[];
}

export interface CashFlowStatementDto {
  periodStart: string;
  periodEnd: string;
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  operatingActivities: OperatingActivitiesDto;
  investingActivities: InvestingActivitiesDto;
  financingActivities: FinancingActivitiesDto;
  netCashFlow: number;
  beginningCash: number;
  endingCash: number;
  isBalanced: boolean;
}

// Income Statement Types
export interface IncomeStatementItemDto {
  accountName: string;
  category: string;
  amount: number;
  description?: string;
  referenceId?: string;
  referenceType?: string;
}

export interface RevenueSectionDto {
  salaryIncome: number;
  businessIncome: number;
  freelanceIncome: number;
  otherOperatingRevenue: number;
  totalOperatingRevenue: number;
  investmentIncome: number;
  interestIncome: number;
  rentalIncome: number;
  dividendIncome: number;
  otherIncome: number;
  totalOtherRevenue: number;
  totalRevenue: number;
  revenueItems: IncomeStatementItemDto[];
}

export interface ExpensesSectionDto {
  utilitiesExpense: number;
  rentExpense: number;
  insuranceExpense: number;
  subscriptionExpense: number;
  foodExpense: number;
  transportationExpense: number;
  healthcareExpense: number;
  educationExpense: number;
  entertainmentExpense: number;
  otherOperatingExpenses: number;
  totalOperatingExpenses: number;
  interestExpense: number;
  loanFeesExpense: number;
  totalFinancialExpenses: number;
  totalExpenses: number;
  expenseItems: IncomeStatementItemDto[];
}

export interface IncomeStatementComparisonDto {
  previousRevenue: number;
  previousExpenses: number;
  previousNetIncome: number;
  revenueChange: number;
  revenueChangePercentage: number;
  expensesChange: number;
  expensesChangePercentage: number;
  netIncomeChange: number;
  netIncomeChangePercentage: number;
}

export interface IncomeStatementDto {
  periodStart: string;
  periodEnd: string;
  period: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  revenue: RevenueSectionDto;
  expenses: ExpensesSectionDto;
  netIncome: number;
  comparison?: IncomeStatementComparisonDto;
}

// Financial Ratios Types
export interface LiquidityRatiosDto {
  currentRatio: number;
  currentRatioInterpretation: string;
  quickRatio: number;
  quickRatioInterpretation: string;
  cashRatio: number;
  cashRatioInterpretation: string;
  currentAssets: number;
  currentLiabilities: number;
  cashAndEquivalents: number;
}

export interface DebtRatiosDto {
  debtToEquityRatio: number;
  debtToEquityInterpretation: string;
  debtToAssetsRatio: number;
  debtToAssetsInterpretation: string;
  debtServiceCoverageRatio: number;
  debtServiceCoverageInterpretation: string;
  totalLiabilities: number;
  totalAssets: number;
  totalEquity: number;
  netIncome: number;
  totalDebtPayments: number;
}

export interface ProfitabilityRatiosDto {
  netProfitMargin: number;
  netProfitMarginInterpretation: string;
  returnOnAssets: number;
  returnOnAssetsInterpretation: string;
  returnOnEquity: number;
  returnOnEquityInterpretation: string;
  netIncome: number;
  totalRevenue: number;
  totalAssets: number;
  totalEquity: number;
}

export interface EfficiencyRatiosDto {
  assetTurnover: number;
  assetTurnoverInterpretation: string;
  expenseRatio: number;
  expenseRatioInterpretation: string;
  savingsRate: number;
  savingsRateInterpretation: string;
  totalRevenue: number;
  totalAssets: number;
  totalExpenses: number;
  totalSavings: number;
  totalIncome: number;
}

export interface RatioInsightDto {
  ratioName: string;
  ratioValue: number;
  category: 'LIQUIDITY' | 'DEBT' | 'PROFITABILITY' | 'EFFICIENCY';
  interpretation: string;
  recommendation: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
}

export interface FinancialRatiosDto {
  asOfDate: string;
  liquidity: LiquidityRatiosDto;
  debt: DebtRatiosDto;
  profitability: ProfitabilityRatiosDto;
  efficiency: EfficiencyRatiosDto;
  insights: RatioInsightDto[];
}

// Tax Reporting Types
export interface TaxIncomeItemDto {
  sourceName: string;
  incomeType: string;
  amount: number;
  incomeDate: string;
  isTaxable: boolean;
  referenceId?: string;
}

export interface TaxIncomeSummaryDto {
  totalIncome: number;
  salaryIncome: number;
  businessIncome: number;
  freelanceIncome: number;
  investmentIncome: number;
  interestIncome: number;
  rentalIncome: number;
  dividendIncome: number;
  otherIncome: number;
  taxableIncome: number;
  incomeItems: TaxIncomeItemDto[];
}

export interface TaxDeductionItemDto {
  description: string;
  category: string;
  amount: number;
  expenseDate: string;
  isDeductible: boolean;
  referenceId?: string;
  referenceType?: string;
}

export interface TaxDeductionsDto {
  businessExpenses: number;
  businessExpenseItems: TaxDeductionItemDto[];
  personalDeductions: number;
  personalDeductionItems: TaxDeductionItemDto[];
  standardDeduction: number;
  totalDeductions: number;
  deductionsByCategory: { [key: string]: number };
}

export interface TaxBracketDto {
  minIncome: number;
  maxIncome: number;
  taxRate: number;
  taxableAmount: number;
  taxAmount: number;
}

export interface TaxCalculationDto {
  adjustedGrossIncome: number;
  taxableIncome: number;
  estimatedTaxLiability: number;
  taxBrackets: TaxBracketDto[];
  effectiveTaxRate: number;
  marginalTaxRate: number;
  notes: string;
}

export interface TaxCategoryItemDto {
  itemName: string;
  amount: number;
  date: string;
  referenceId?: string;
}

export interface TaxCategoryDto {
  categoryName: string;
  categoryType: 'INCOME' | 'DEDUCTION' | 'EXPENSE';
  amount: number;
  percentage: number;
  description: string;
  items: TaxCategoryItemDto[];
}

export interface TaxQuarterlySummaryDto {
  quarter: number;
  quarterStart: string;
  quarterEnd: string;
  totalIncome: number;
  totalDeductions: number;
  taxableIncome: number;
  estimatedTaxLiability: number;
}

export interface TaxReportDto {
  taxYear: number;
  reportDate: string;
  periodStart: string;
  periodEnd: string;
  incomeSummary: TaxIncomeSummaryDto;
  deductions: TaxDeductionsDto;
  taxCalculation: TaxCalculationDto;
  taxCategories: TaxCategoryDto[];
  quarterlyBreakdown: TaxQuarterlySummaryDto[];
}

