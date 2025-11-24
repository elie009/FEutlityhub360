import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  AlertTitle,
  Chip,
  CircularProgress,
  LinearProgress,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  useTheme,
  useMediaQuery,
  Collapse,
  Switch,
  FormControlLabel,
  Checkbox,
  TextField,
} from '@mui/material';
// Using simple date inputs instead of DateRangePicker to avoid module resolution issues
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Warning,
  Info,
  Lightbulb,
  AccountBalance,
  CreditCard,
  Savings,
  MonetizationOn,
  Receipt,
  PieChart as PieChartIcon,
  Refresh,
  Download,
  Assessment,
  Schedule,
  Settings as SettingsIcon,
  ExpandMore,
  ExpandLess,
  CalendarToday,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import {
  FinancialReportDto,
  FinancialSummaryDto,
  FinancialInsightDto,
  FinancialPredictionDto,
} from '../types/financialReport';
import { Loan } from '../types/loan';
import { SavingsGoalDto } from '../types/financialReport';
import BalanceSheetTab from '../components/Reports/BalanceSheetTab';
import IncomeStatementTab from '../components/Reports/IncomeStatementTab';
import CashFlowStatementTab from '../components/Reports/CashFlowStatementTab';
import FinancialRatiosTab from '../components/Reports/FinancialRatiosTab';
import TaxReportTab from '../components/Reports/TaxReportTab';
import CustomReportTab from '../components/Reports/CustomReportTab';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const Analytics: React.FC = () => {
  const { getCurrencySymbol, formatCurrency: formatCurrencyWithSymbol } = useCurrency();
  const { user } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY'>('MONTHLY');
  const [activeTab, setActiveTab] = useState(0);
  const [reportData, setReportData] = useState<FinancialReportDto | null>(null);
  const [summary, setSummary] = useState<FinancialSummaryDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showReportSettings, setShowReportSettings] = useState(false);
  const [reportSettings, setReportSettings] = useState({
    includeComparison: true,
    includeInsights: true,
    includePredictions: true,
    includeTransactions: true,
    showCharts: true,
    showTables: true,
    showSummaryCards: true,
    currencyFormat: 'USD',
    dateFormat: 'MM/DD/YYYY',
  });
  const [bankAccountSummary, setBankAccountSummary] = useState<{
    accounts: any[];
    totalBalance: number;
  } | null>(null);
  const [savingsSummary, setSavingsSummary] = useState<{
    totalSavingsBalance: number;
  } | null>(null);

  useEffect(() => {
    fetchFinancialData();
  }, [period]);

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch full financial report
      const report = await apiService.getFullFinancialReport({
        period,
        includeComparison: true,
        includeInsights: true,
        includePredictions: true,
        includeTransactions: true,
      });

      // Fetch loans data if user is available
      if (user) {
        try {
          const userLoans = await apiService.getUserLoans(user.id);
          setLoans(userLoans);
        } catch (loanErr) {
          console.error('Error fetching loans:', loanErr);
          // Don't throw - just log, so we can still show other financial data
        }
      }

      // Fetch bank accounts and savings data for Net Worth breakdown
      try {
        const [bankSummary, savingsSumm] = await Promise.all([
          apiService.getBankAccountSummary().catch(() => ({ accounts: [], totalBalance: 0 })),
          apiService.getSavingsSummary().catch(() => ({ totalSavingsBalance: 0 })),
        ]);
        setBankAccountSummary(bankSummary);
        setSavingsSummary(savingsSumm);
      } catch (err) {
        console.error('Error fetching accounts for Net Worth breakdown:', err);
        setBankAccountSummary({ accounts: [], totalBalance: 0 });
        setSavingsSummary({ totalSavingsBalance: 0 });
      }

      // Add default values for missing data
      const safeReport = {
        ...report,
        summary: report?.summary || {
          totalIncome: 0,
          incomeChange: 0,
          totalExpenses: 0,
          expenseChange: 0,
          disposableIncome: 0,
          disposableChange: 0,
          totalSavings: 0,
          savingsGoal: 0,
          savingsProgress: 0,
          netWorth: 0,
          netWorthChange: 0,
        },
        incomeReport: report?.incomeReport || {
          totalIncome: 0,
          monthlyAverage: 0,
          growthRate: 0,
          incomeBySource: {},
          incomeByCategory: {},
          incomeTrend: [],
          topIncomeSource: 'N/A',
          topIncomeAmount: 0,
        },
        expenseReport: report?.expenseReport || {
          totalExpenses: 0,
          fixedExpenses: 0,
          variableExpenses: 0,
          expenseByCategory: {},
          expensePercentage: {},
          expenseTrend: [],
          highestExpenseCategory: 'N/A',
          highestExpenseAmount: 0,
          highestExpensePercentage: 0,
          averageMonthlyExpense: 0,
          categoryComparison: [],
        },
        disposableIncomeReport: report?.disposableIncomeReport || {
          currentDisposableIncome: 0,
          disposableTrend: [],
          averageDisposableIncome: 0,
          recommendedSavings: 0,
          comparisonWithPrevious: { previousAmount: 0, change: 0, changePercentage: 0 },
        },
        billsReport: report?.billsReport || {
          totalMonthlyBills: 0,
          averageBillAmount: 0,
          billsByType: {},
          billsByProvider: {},
          billsTrend: [],
          predictedNextMonth: 0,
          unpaidBillsCount: 0,
          overdueBillsCount: 0,
          upcomingBills: [],
        },
        loanReport: report?.loanReport || {
          activeLoansCount: 0,
          totalPrincipal: 0,
          totalRemainingBalance: 0,
          totalMonthlyPayment: 0,
          totalInterestPaid: 0,
          loans: [],
          projectedDebtFreeDate: null,
        },
        savingsReport: report?.savingsReport || {
          totalSavingsBalance: 0,
          monthlySavingsAmount: 0,
          savingsGoal: 0,
          goalProgress: 0,
          savingsRate: 0,
          savingsTrend: [],
          projectedGoalDate: null,
          monthsUntilGoal: null,
          goals: [],
        },
        netWorthReport: report?.netWorthReport || {
          currentNetWorth: 0,
          netWorthChange: 0,
          netWorthChangePercentage: 0,
          totalAssets: 0,
          totalLiabilities: 0,
          assetBreakdown: {},
          liabilityBreakdown: {},
          netWorthTrend: [],
          trendDescription: 'No data available',
        },
        insights: report?.insights || [],
        predictions: report?.predictions || [],
        recentTransactions: report?.recentTransactions || [],
      };

      setReportData(safeReport);
      setSummary(safeReport.summary);
    } catch (err: any) {
      console.error('Error fetching financial data:', err);
      // Don't show error if request was aborted (user navigated away or request timed out)
      if (err.name !== 'AbortError' && !err.message?.includes('aborted')) {
        setError(err.message || 'Failed to load financial data. The backend API may not be implemented yet.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.00';
    }
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatPercentage = (value: number | undefined | null) => {
    if (value === undefined || value === null || isNaN(value)) {
      return '0.0%';
    }
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const downloadReport = async () => {
    try {
      setLoading(true);
      
      // Fetch all reports
      const [
        balanceSheet,
        incomeStatement,
        cashFlowStatement,
        financialRatios,
        taxReport,
      ] = await Promise.all([
        apiService.getBalanceSheet().catch(() => null),
        apiService.getIncomeStatement(undefined, undefined, period).catch(() => null),
        apiService.getCashFlowStatement(undefined, undefined, period).catch(() => null),
        apiService.getFinancialRatios().catch(() => null),
        apiService.getTaxReport(new Date().getFullYear()).catch(() => null),
      ]);

      // Create PDF
      const doc = new jsPDF();
      let yPosition = 20;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const lineHeight = 7;

      // Helper function to add new page if needed
      const checkPageBreak = (requiredSpace: number = 20) => {
        if (yPosition + requiredSpace > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
      };

      // Helper function to add section title
      const addSectionTitle = (title: string) => {
        checkPageBreak(15);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text(title, margin, yPosition);
        yPosition += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
      };

      // Helper function to add text
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false) => {
        checkPageBreak();
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.text(text, margin, yPosition);
        yPosition += lineHeight;
      };

      // Helper function to add table
      const addTable = (headers: string[], rows: string[][]) => {
        checkPageBreak(30);
        autoTable(doc, {
          head: [headers],
          body: rows,
          startY: yPosition,
          margin: { left: margin, right: margin },
          styles: { fontSize: 8 },
          headStyles: { fillColor: [66, 139, 202], textColor: 255, fontStyle: 'bold' },
        });
        yPosition = (doc as any).lastAutoTable.finalY + 10;
      };

      // Title Page
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('Financial Reports', margin, yPosition);
      yPosition += 10;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 10;
      doc.text(`Period: ${period}`, margin, yPosition);
      yPosition += 15;

      // Financial Summary
      if (reportData?.summary) {
        addSectionTitle('Financial Summary');
        const summary = reportData.summary;
        addTable(
          ['Metric', 'Value', 'Change'],
          [
            ['Total Income', formatCurrency(summary.totalIncome), `${summary.incomeChange >= 0 ? '+' : ''}${summary.incomeChange.toFixed(2)}%`],
            ['Total Expenses', formatCurrency(summary.totalExpenses), `${summary.expenseChange >= 0 ? '+' : ''}${summary.expenseChange.toFixed(2)}%`],
            ['Disposable Income', formatCurrency(summary.disposableIncome), `${summary.disposableChange >= 0 ? '+' : ''}${summary.disposableChange.toFixed(2)}%`],
            ['Net Worth', formatCurrency(summary.netWorth), `${summary.netWorthChange >= 0 ? '+' : ''}${summary.netWorthChange.toFixed(2)}%`],
            ['Total Savings', formatCurrency(summary.totalSavings), ''],
            ['Savings Progress', `${summary.savingsProgress.toFixed(1)}%`, ''],
          ]
        );
      }

      // Balance Sheet
      if (balanceSheet) {
        addSectionTitle('Balance Sheet');
        addText(`As of: ${new Date(balanceSheet.asOfDate).toLocaleDateString()}`, 10, true);
        yPosition += 5;

        // Assets
        addText('ASSETS', 12, true);
        const assetRows: string[][] = [];
        balanceSheet.assets.currentAssets.forEach(asset => {
          assetRows.push([asset.accountName, asset.accountType, formatCurrency(asset.amount)]);
        });
        if (assetRows.length > 0) {
          addTable(['Account', 'Type', 'Amount'], assetRows);
        }
        addText(`Total Current Assets: ${formatCurrency(balanceSheet.assets.totalCurrentAssets)}`, 10, true);
        yPosition += 5;
        addText(`Total Assets: ${formatCurrency(balanceSheet.totalAssets)}`, 10, true);
        yPosition += 10;

        // Liabilities
        addText('LIABILITIES', 12, true);
        const liabilityRows: string[][] = [];
        balanceSheet.liabilities.currentLiabilities.forEach(liability => {
          liabilityRows.push([liability.accountName, liability.accountType, formatCurrency(liability.amount)]);
        });
        balanceSheet.liabilities.longTermLiabilities.forEach(liability => {
          liabilityRows.push([liability.accountName, liability.accountType, formatCurrency(liability.amount)]);
        });
        if (liabilityRows.length > 0) {
          addTable(['Account', 'Type', 'Amount'], liabilityRows);
        }
        addText(`Total Liabilities: ${formatCurrency(balanceSheet.liabilities.totalLiabilities)}`, 10, true);
        yPosition += 10;

        // Equity
        addText('EQUITY', 12, true);
        addText(`Owner's Capital: ${formatCurrency(balanceSheet.equity.ownersCapital)}`, 10);
        addText(`Retained Earnings: ${formatCurrency(balanceSheet.equity.retainedEarnings)}`, 10);
        addText(`Total Equity: ${formatCurrency(balanceSheet.equity.totalEquity)}`, 10, true);
        yPosition += 5;
        addText(`Total Liabilities & Equity: ${formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}`, 10, true);
        addText(`Balanced: ${balanceSheet.isBalanced ? 'Yes' : 'No'}`, 10);
        yPosition += 10;
      }

      // Income Statement
      if (incomeStatement) {
        addSectionTitle('Income Statement');
        addText(`Period: ${new Date(incomeStatement.periodStart).toLocaleDateString()} - ${new Date(incomeStatement.periodEnd).toLocaleDateString()}`, 10);
        yPosition += 5;

        // Revenue
        addText('REVENUE', 12, true);
        const revenueRows: string[][] = [];
        incomeStatement.revenue.revenueItems.forEach(item => {
          revenueRows.push([item.accountName, item.category, formatCurrency(item.amount)]);
        });
        if (revenueRows.length > 0) {
          addTable(['Source', 'Category', 'Amount'], revenueRows);
        }
        addText(`Total Revenue: ${formatCurrency(incomeStatement.revenue.totalRevenue)}`, 10, true);
        yPosition += 10;

        // Expenses
        addText('EXPENSES', 12, true);
        const expenseRows: string[][] = [];
        incomeStatement.expenses.expenseItems.forEach(item => {
          expenseRows.push([item.accountName, item.category, formatCurrency(item.amount)]);
        });
        if (expenseRows.length > 0) {
          addTable(['Item', 'Category', 'Amount'], expenseRows);
        }
        addText(`Total Expenses: ${formatCurrency(incomeStatement.expenses.totalExpenses)}`, 10, true);
        yPosition += 10;

        // Net Income
        addText(`NET INCOME: ${formatCurrency(incomeStatement.netIncome)}`, 14, true);
        yPosition += 10;
      }

      // Cash Flow Statement
      if (cashFlowStatement) {
        addSectionTitle('Cash Flow Statement');
        addText(`Period: ${new Date(cashFlowStatement.periodStart).toLocaleDateString()} - ${new Date(cashFlowStatement.periodEnd).toLocaleDateString()}`, 10);
        yPosition += 5;

        // Operating Activities
        addText('OPERATING ACTIVITIES', 12, true);
        addText(`Income Received: ${formatCurrency(cashFlowStatement.operatingActivities.incomeReceived)}`, 10);
        addText(`Expenses Paid: ${formatCurrency(cashFlowStatement.operatingActivities.expensesPaid)}`, 10);
        addText(`Bills Paid: ${formatCurrency(cashFlowStatement.operatingActivities.billsPaid)}`, 10);
        addText(`Net Cash from Operations: ${formatCurrency(cashFlowStatement.operatingActivities.netCashFromOperations)}`, 10, true);
        yPosition += 10;

        // Investing Activities
        addText('INVESTING ACTIVITIES', 12, true);
        addText(`Savings Deposits: ${formatCurrency(cashFlowStatement.investingActivities.savingsDeposits)}`, 10);
        addText(`Savings Withdrawals: ${formatCurrency(cashFlowStatement.investingActivities.savingsWithdrawals)}`, 10);
        addText(`Net Cash from Investing: ${formatCurrency(cashFlowStatement.investingActivities.netCashFromInvesting)}`, 10, true);
        yPosition += 10;

        // Financing Activities
        addText('FINANCING ACTIVITIES', 12, true);
        addText(`Loan Disbursements: ${formatCurrency(cashFlowStatement.financingActivities.loanDisbursements)}`, 10);
        addText(`Loan Payments: ${formatCurrency(cashFlowStatement.financingActivities.loanPayments)}`, 10);
        addText(`Net Cash from Financing: ${formatCurrency(cashFlowStatement.financingActivities.netCashFromFinancing)}`, 10, true);
        yPosition += 10;

        addText(`Net Cash Flow: ${formatCurrency(cashFlowStatement.netCashFlow)}`, 12, true);
        addText(`Beginning Cash: ${formatCurrency(cashFlowStatement.beginningCash)}`, 10);
        addText(`Ending Cash: ${formatCurrency(cashFlowStatement.endingCash)}`, 10, true);
        yPosition += 10;
      }

      // Financial Ratios
      if (financialRatios) {
        addSectionTitle('Financial Ratios');
        addText(`As of: ${new Date(financialRatios.asOfDate).toLocaleDateString()}`, 10);
        yPosition += 5;

        // Liquidity Ratios
        addText('LIQUIDITY RATIOS', 12, true);
        addText(`Current Ratio: ${financialRatios.liquidity.currentRatio.toFixed(2)} (${financialRatios.liquidity.currentRatioInterpretation})`, 10);
        addText(`Quick Ratio: ${financialRatios.liquidity.quickRatio.toFixed(2)} (${financialRatios.liquidity.quickRatioInterpretation})`, 10);
        addText(`Cash Ratio: ${financialRatios.liquidity.cashRatio.toFixed(2)} (${financialRatios.liquidity.cashRatioInterpretation})`, 10);
        yPosition += 10;

        // Debt Ratios
        addText('DEBT RATIOS', 12, true);
        addText(`Debt-to-Equity: ${financialRatios.debt.debtToEquityRatio.toFixed(2)} (${financialRatios.debt.debtToEquityInterpretation})`, 10);
        addText(`Debt-to-Assets: ${financialRatios.debt.debtToAssetsRatio.toFixed(2)} (${financialRatios.debt.debtToAssetsInterpretation})`, 10);
        addText(`Debt Service Coverage: ${financialRatios.debt.debtServiceCoverageRatio.toFixed(2)} (${financialRatios.debt.debtServiceCoverageInterpretation})`, 10);
        yPosition += 10;

        // Profitability Ratios
        addText('PROFITABILITY RATIOS', 12, true);
        addText(`Net Profit Margin: ${financialRatios.profitability.netProfitMargin.toFixed(2)}% (${financialRatios.profitability.netProfitMarginInterpretation})`, 10);
        addText(`Return on Assets (ROA): ${financialRatios.profitability.returnOnAssets.toFixed(2)}% (${financialRatios.profitability.returnOnAssetsInterpretation})`, 10);
        addText(`Return on Equity (ROE): ${financialRatios.profitability.returnOnEquity.toFixed(2)}% (${financialRatios.profitability.returnOnEquityInterpretation})`, 10);
        yPosition += 10;

        // Efficiency Ratios
        addText('EFFICIENCY RATIOS', 12, true);
        addText(`Asset Turnover: ${financialRatios.efficiency.assetTurnover.toFixed(2)} (${financialRatios.efficiency.assetTurnoverInterpretation})`, 10);
        addText(`Expense Ratio: ${financialRatios.efficiency.expenseRatio.toFixed(2)}% (${financialRatios.efficiency.expenseRatioInterpretation})`, 10);
        addText(`Savings Rate: ${financialRatios.efficiency.savingsRate.toFixed(2)}% (${financialRatios.efficiency.savingsRateInterpretation})`, 10);
        yPosition += 10;
      }

      // Tax Report
      if (taxReport) {
        addSectionTitle('Tax Report');
        addText(`Tax Year: ${taxReport.taxYear}`, 10, true);
        addText(`Period: ${new Date(taxReport.periodStart).toLocaleDateString()} - ${new Date(taxReport.periodEnd).toLocaleDateString()}`, 10);
        yPosition += 5;

        // Income Summary
        addText('INCOME SUMMARY', 12, true);
        addText(`Total Income: ${formatCurrency(taxReport.incomeSummary.totalIncome)}`, 10);
        addText(`Taxable Income: ${formatCurrency(taxReport.incomeSummary.taxableIncome)}`, 10, true);
        yPosition += 5;

        // Deductions
        addText('DEDUCTIONS', 12, true);
        addText(`Business Expenses: ${formatCurrency(taxReport.deductions.businessExpenses)}`, 10);
        addText(`Personal Deductions: ${formatCurrency(taxReport.deductions.personalDeductions)}`, 10);
        addText(`Standard Deduction: ${formatCurrency(taxReport.deductions.standardDeduction)}`, 10);
        addText(`Total Deductions: ${formatCurrency(taxReport.deductions.totalDeductions)}`, 10, true);
        yPosition += 5;

        // Tax Calculation
        addText('TAX CALCULATION', 12, true);
        addText(`Adjusted Gross Income: ${formatCurrency(taxReport.taxCalculation.adjustedGrossIncome)}`, 10);
        addText(`Taxable Income: ${formatCurrency(taxReport.taxCalculation.taxableIncome)}`, 10);
        addText(`Effective Tax Rate: ${taxReport.taxCalculation.effectiveTaxRate.toFixed(2)}%`, 10);
        addText(`Marginal Tax Rate: ${taxReport.taxCalculation.marginalTaxRate.toFixed(2)}%`, 10);
        addText(`Estimated Tax Liability: ${formatCurrency(taxReport.taxCalculation.estimatedTaxLiability)}`, 10, true);
        yPosition += 10;
      }

      // Generate filename with timestamp including milliseconds
      const now = new Date();
      const timestamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${String(now.getMilliseconds()).padStart(3, '0')}`;
      const filename = `Financial_Reports_${timestamp}.pdf`;

      // Save PDF
      doc.save(filename);
      
      setLoading(false);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      setError(`Failed to generate PDF: ${error.message}`);
      setLoading(false);
    }
  };

  // Calculate Net Worth breakdown
  const calculateNetWorthBreakdown = () => {
    // Calculate Bank Accounts: Sum of CurrentBalance from all active bank accounts
    const bankAccountsBalance = bankAccountSummary?.accounts
      ?.filter((account: any) => account.isActive)
      .reduce((sum: number, account: any) => sum + (account.currentBalance || 0), 0) || 0;

    // Calculate Savings Accounts: Sum of savings transactions (DEPOSITs added, WITHDRAWALs subtracted)
    // Using totalSavingsBalance which is calculated from transactions
    const savingsBalance = savingsSummary?.totalSavingsBalance || 0;

    // Total Assets
    const totalAssets = bankAccountsBalance + savingsBalance;

    // Calculate Active Loans: Sum of RemainingBalance from all active loans (excluding REJECTED and COMPLETED)
    const activeLoans = loans.filter(
      (loan) => loan.status !== 'REJECTED' && loan.status !== 'COMPLETED'
    );
    const totalLiabilities = activeLoans.reduce(
      (sum, loan) => sum + (loan.remainingBalance || 0),
      0
    );

    // Net Worth
    const netWorth = totalAssets - totalLiabilities;

    return {
      bankAccountsBalance,
      savingsBalance,
      totalAssets,
      totalLiabilities,
      netWorth,
      activeLoansCount: activeLoans.length,
    };
  };

  // Loan calculation helpers
  const getTotalBorrowed = (): number => {
    return loans.reduce((total, loan) => total + loan.principal, 0);
  };

  const getTotalOutstanding = (): number => {
    return loans.reduce((total, loan) => total + loan.outstandingBalance, 0);
  };

  const getTotalPaid = (): number => {
    return loans.reduce((total, loan) => total + (loan.totalAmount - loan.outstandingBalance), 0);
  };

  const getActiveLoansCount = (): number => {
    return loans.filter(loan => loan.status === 'ACTIVE').length;
  };

  const getClosedLoansCount = (): number => {
    return loans.filter(loan => loan.status === 'CLOSED').length;
  };

  const getOverdueLoansCount = (): number => {
    return loans.filter(loan => loan.status === 'OVERDUE').length;
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'ALERT':
        return <Warning />;
      case 'TIP':
        return <Lightbulb />;
      case 'FORECAST':
        return <TrendingUp />;
      default:
        return <Info />;
    }
  };

  const getInsightColor = (severity: string) => {
    switch (severity) {
      case 'ERROR':
        return 'error';
      case 'WARNING':
        return 'warning';
      case 'SUCCESS':
        return 'success';
      default:
        return 'info';
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  // Helper function to calculate months between two dates (inclusive of start, exclusive of end)
  const getMonthsBetween = (startDate: Date, endDate: Date): number => {
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    return Math.max(1, (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1);
  };

  // Helper function to get month labels between two dates with year (last 2 digits)
  const getMonthLabelsBetween = (startDate: Date, endDate: Date): string[] => {
    const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const months: string[] = [];
    const start = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
    
    let current = new Date(start);
    while (current <= end) {
      const year = current.getFullYear().toString().slice(-2); // Get last 2 digits of year
      months.push(`${monthNames[current.getMonth()]}${year}`); // No space between month and year
      current.setMonth(current.getMonth() + 1);
    }
    
    return months;
  };

  // Helper function to generate month labels and progress bars
  const generateProgressBar = (goal: SavingsGoalDto, earliestStartDate: Date) => {
    const startDate = new Date(goal.startDate);
    const targetDate = new Date(goal.targetDate);
    
    // Calculate total months from startDate to targetDate (inclusive)
    const totalMonths = getMonthsBetween(startDate, targetDate);
    
    // Calculate offset from earliest start date (how many months before this goal starts)
    const monthsOffset = getMonthsBetween(earliestStartDate, startDate) - 1;
    
    // Generate month labels for this goal's duration (from startDate to targetDate)
    const months = getMonthLabelsBetween(startDate, targetDate);
    
    // Calculate filled blocks based on currentAmount vs targetAmount
    // filledBlocks = (currentAmount / targetAmount) * totalMonths
    // Example: 100/1000 = 10%, if totalMonths = 4, then filledBlocks = 0.4 ≈ 0 or 1
    const progressPercentage = goal.targetAmount > 0 ? Math.min(1, goal.currentAmount / goal.targetAmount) : 0;
    const filledBlocks = Math.max(0, Math.min(totalMonths, Math.round(totalMonths * progressPercentage)));
    const emptyBlocks = totalMonths - filledBlocks;
    
    return {
      months,
      filledBlocks,
      emptyBlocks,
      totalBlocks: totalMonths,
      monthsOffset: Math.max(0, monthsOffset),
      startDate,
      targetDate,
    };
  };

  // Get all month labels across all goals
  const getAllMonthLabels = (goals: SavingsGoalDto[]) => {
    if (goals.length === 0) return [];
    
    // Find earliest start date and latest target date
    const startDates = goals.map(g => new Date(g.startDate));
    const targetDates = goals.map(g => new Date(g.targetDate));
    const earliestStart = new Date(Math.min(...startDates.map(d => d.getTime())));
    const latestTarget = new Date(Math.max(...targetDates.map(d => d.getTime())));
    
    // Generate all months from earliest start to latest target (inclusive)
    return getMonthLabelsBetween(earliestStart, latestTarget);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Loading Analytics...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error">
          <AlertTitle>Error Loading Analytics</AlertTitle>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!reportData || !summary) {
    return (
      <Box>
        <Alert severity="info">
          <AlertTitle>No Data Available</AlertTitle>
          No financial data available for the selected period.
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            📊 Financial Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive insights into your financial health
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Date Range Picker */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ minWidth: 150 }}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              to
            </Typography>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ minWidth: 150 }}
            />
          </Box>
          <FormControl sx={{ minWidth: 150 }} size="small">
            <InputLabel>Data Period</InputLabel>
            <Select
              value={period}
              label="Data Period"
              onChange={(e) => setPeriod(e.target.value as any)}
            >
              <MenuItem value="MONTHLY">Monthly</MenuItem>
              <MenuItem value="QUARTERLY">Quarterly</MenuItem>
              <MenuItem value="YEARLY">Yearly</MenuItem>
            </Select>
          </FormControl>
          {/* Variance Dashboard Button */}
          <Button
            variant="outlined"
            startIcon={<AnalyticsIcon />}
            onClick={() => navigate('/variance-dashboard')}
            size="small"
          >
            Variance Dashboard
          </Button>
          {/* Export Button */}
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={downloadReport}
            size="small"
            disabled={loading}
          >
            Export
          </Button>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchFinancialData} color="primary" size="small">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Financial Summary Cards */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(20% - 13px)' }, minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: '200px' } }}>
          <Card sx={{ height: '100%', backgroundColor: 'white', border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MonetizationOn sx={{ color: 'text.primary', mr: 1 }} />
                <Typography color="text.primary" variant="h6">
                  Total Income
                </Typography>
              </Box>
              <Typography variant="h4" component="h2" color="text.primary" gutterBottom>
                {formatCurrency(summary.totalIncome)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {summary.incomeChange >= 0 ? (
                  <TrendingUp sx={{ color: 'success.main', fontSize: 20, mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', fontSize: 20, mr: 0.5 }} />
                )}
                <Typography color="text.secondary" variant="body2">
                  {formatPercentage(summary.incomeChange)} from last period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(20% - 13px)' }, minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: '200px' } }}>
          <Card sx={{ height: '100%', backgroundColor: 'white', border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Receipt sx={{ color: 'text.primary', mr: 1 }} />
                <Typography color="text.primary" variant="h6">
                  Total Expenses
                </Typography>
              </Box>
              <Typography variant="h4" component="h2" color="text.primary" gutterBottom>
                {formatCurrency(summary.totalExpenses)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {summary.expenseChange <= 0 ? (
                  <TrendingDown sx={{ color: 'success.main', fontSize: 20, mr: 0.5 }} />
                ) : (
                  <TrendingUp sx={{ color: 'error.main', fontSize: 20, mr: 0.5 }} />
                )}
                <Typography color="text.secondary" variant="body2">
                  {formatPercentage(summary.expenseChange)} from last period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(20% - 13px)' }, minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: '200px' } }}>
          <Card sx={{ height: '100%', backgroundColor: 'white', border: '1px solid #e0e0e0' }}>
              <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ color: 'text.primary', mr: 1 }} />
                <Typography color="text.primary" variant="h6">
                  Disposable Amount
                </Typography>
              </Box>
              <Typography variant="h4" component="h2" color="text.primary" gutterBottom>
                {formatCurrency(summary.disposableIncome)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {summary.disposableChange >= 0 ? (
                  <TrendingUp sx={{ color: 'success.main', fontSize: 20, mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', fontSize: 20, mr: 0.5 }} />
                )}
                <Typography color="text.secondary" variant="body2">
                  {formatPercentage(summary.disposableChange)} from last period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(20% - 13px)' }, minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: '200px' } }}>
          <Card sx={{ height: '100%', backgroundColor: 'white', border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Savings sx={{ color: 'text.primary', mr: 1 }} />
                <Typography color="text.primary" variant="h6" sx={{ flexGrow: 1 }}>
                  Net Worth
                </Typography>
                <Tooltip
                  title={
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Description
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2 }}>
                        Net Worth is your financial position: what you own minus what you owe.
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Total Assets
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Bank Accounts: {formatCurrencyWithSymbol(calculateNetWorthBreakdown().bankAccountsBalance)}
                        <br />
                        <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                          (Sum of CurrentBalance from all active bank accounts)
                        </span>
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5, mt: 1 }}>
                        Savings Accounts: {formatCurrencyWithSymbol(calculateNetWorthBreakdown().savingsBalance)}
                        <br />
                        <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                          (Sum of savings transactions - DEPOSITs added, WITHDRAWALs subtracted)
                        </span>
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, mt: 1, fontWeight: 'bold' }}>
                        Total Assets = {formatCurrencyWithSymbol(calculateNetWorthBreakdown().totalAssets)}
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Total Liabilities
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        Active Loans: {formatCurrencyWithSymbol(calculateNetWorthBreakdown().totalLiabilities)}
                        <br />
                        <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                          (Sum of RemainingBalance from {calculateNetWorthBreakdown().activeLoansCount} active loans, excluding REJECTED and COMPLETED)
                        </span>
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 2, mt: 1, fontWeight: 'bold' }}>
                        Total Liabilities = {formatCurrencyWithSymbol(calculateNetWorthBreakdown().totalLiabilities)}
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Computation
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                        Net Worth = Total Assets - Total Liabilities
                        <br />
                        <span style={{ fontSize: '1rem', marginTop: '4px', display: 'block' }}>
                          = {formatCurrencyWithSymbol(calculateNetWorthBreakdown().totalAssets)} - {formatCurrencyWithSymbol(calculateNetWorthBreakdown().totalLiabilities)}
                          <br />
                          = {formatCurrencyWithSymbol(calculateNetWorthBreakdown().netWorth)}
                        </span>
                      </Typography>
                    </Box>
                  }
                  arrow
                  placement="top"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        bgcolor: 'rgba(0, 0, 0, 0.95)',
                        maxWidth: 400,
                        fontSize: '0.875rem',
                        '& .MuiTooltip-arrow': {
                          color: 'rgba(0, 0, 0, 0.95)',
                        },
                      },
                    },
                  }}
                >
                  <IconButton
                    size="small"
                    sx={{
                      color: 'text.primary',
                      p: 0.5,
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Info sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="h4" component="h2" color="text.primary" gutterBottom>
                {formatCurrency(summary.netWorth)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {summary.netWorthChange >= 0 ? (
                  <TrendingUp sx={{ color: 'success.main', fontSize: 20, mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', fontSize: 20, mr: 0.5 }} />
                )}
                <Typography color="text.secondary" variant="body2">
                  {formatPercentage(summary.netWorthChange)} from last period
                </Typography>
              </Box>
              </CardContent>
            </Card>
          </Box>

        {/* Savings Projection */}
        {reportData.savingsReport?.projectedGoalDate && (
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(20% - 13px)' }, minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: '200px' } }}>
            <Card sx={{ height: '100%', backgroundColor: 'white', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <Savings sx={{ color: 'text.primary', mr: 1, fontSize: 24 }} />
                  <Typography color="text.primary" variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                    Savings Goal
                  </Typography>
                </Box>
                {reportData.savingsReport.monthsUntilGoal !== null && (
                  <Typography variant="h5" component="h2" color="text.primary" gutterBottom sx={{ fontSize: '1.5rem' }}>
                    {reportData.savingsReport.monthsUntilGoal} mo
                  </Typography>
                )}
                <Typography color="text.secondary" variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                  Until completion
                </Typography>
                {reportData.savingsReport.projectedGoalDate && (
                  <Typography color="text.secondary" variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {new Date(reportData.savingsReport.projectedGoalDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </Typography>
                )}
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #e0e0e0' }}>
                  <Typography color="text.secondary" variant="caption" sx={{ fontSize: '0.7rem' }}>
                    Progress: {reportData.savingsReport.goalProgress?.toFixed(1) || 0}%
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={reportData.savingsReport.goalProgress || 0} 
                    sx={{ mt: 0.5, bgcolor: '#e0e0e0', height: 4, '& .MuiLinearProgress-bar': { bgcolor: 'primary.main' } }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}

        {/* Loan Payoff Projection */}
        {reportData.loanReport?.projectedDebtFreeDate && (
          <Box sx={{ flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(20% - 13px)' }, minWidth: { xs: '100%', sm: 'calc(50% - 8px)', md: '200px' } }}>
            <Card sx={{ height: '100%', backgroundColor: 'white', border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                  <AccountBalance sx={{ color: 'text.primary', mr: 1, fontSize: 24 }} />
                  <Typography color="text.primary" variant="subtitle1" sx={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                    Loan Payoff
                  </Typography>
                </Box>
                {reportData.loanReport.monthsUntilDebtFree !== undefined && (
                  <Typography variant="h5" component="h2" color="text.primary" gutterBottom sx={{ fontSize: '1.5rem' }}>
                    {reportData.loanReport.monthsUntilDebtFree} mo
                  </Typography>
                )}
                <Typography color="text.secondary" variant="caption" sx={{ mb: 0.5, display: 'block' }}>
                  Until debt-free
                </Typography>
                {reportData.loanReport.projectedDebtFreeDate && (
                  <Typography color="text.secondary" variant="caption" sx={{ fontSize: '0.7rem' }}>
                    {new Date(reportData.loanReport.projectedDebtFreeDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </Typography>
                )}
                <Box sx={{ mt: 1.5, pt: 1.5, borderTop: '1px solid #e0e0e0' }}>
                  <Typography color="text.secondary" variant="caption" sx={{ fontSize: '0.7rem' }}>
                    Remaining: {formatCurrency(reportData.loanReport.totalRemainingBalance || 0)}
                  </Typography>
                  <Typography color="text.secondary" variant="caption" sx={{ fontSize: '0.7rem', display: 'block', mt: 0.5 }}>
                    Monthly: {formatCurrency(reportData.loanReport.totalMonthlyPayment || 0)}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        )}
      </Box>

      {/* Insights & Alerts */}
      {reportData.insights && Array.isArray(reportData.insights) && reportData.insights.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Lightbulb sx={{ mr: 1 }} /> Financial Insights & Alerts
          </Typography>
          <Grid container spacing={2}>
            {reportData.insights.map((insight, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Alert
                  severity={getInsightColor(insight?.severity) as any}
                  icon={getInsightIcon(insight?.type)}
                  sx={{ height: '100%' }}
                >
                  <AlertTitle>{insight?.title || 'Insight'}</AlertTitle>
                  {insight?.message || ''}
                </Alert>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ReportTabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} variant="scrollable" scrollButtons="auto">
          <Tab label="Overview" />
          <Tab label="Income Statement" />
          <Tab label="Balance Sheet" />
          <Tab label="Cash Flow" />
          <Tab label="Financial Ratios" />
          <Tab label="Tax Report" />
          <Tab label="Custom" />
        </Tabs>
      </Paper>

      {/* ReportContent */}
      <Box sx={{ mt: 3 }}>
        {/* Tab 0: Overview */}
        {activeTab === 0 && (
          <Box>
            {/* Financial Summary Cards - Already shown above, but can be moved here if needed */}
            
            {/* Insights & Alerts */}
            {reportData.insights && Array.isArray(reportData.insights) && reportData.insights.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Lightbulb sx={{ mr: 1 }} /> Financial Insights & Alerts
                </Typography>
                <Grid container spacing={2}>
                  {reportData.insights.map((insight, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Alert
                        severity={getInsightColor(insight?.severity) as any}
                        icon={getInsightIcon(insight?.type)}
                        sx={{ height: '100%' }}
                      >
                        <AlertTitle>{insight?.title || 'Insight'}</AlertTitle>
                        {insight?.message || ''}
                      </Alert>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}

            {/* Quick Overview Charts */}
            <Grid container spacing={3}>
              {/* Income vs Expenses Trend */}
              <Grid item xs={12} lg={8}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Income vs Expenses Trend
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={reportData.incomeReport?.incomeTrend || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="label" />
                      <YAxis />
                      <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="value"
                        fill="#8884d8"
                        stroke="#8884d8"
                        name="Income"
                      />
                      <Line
                        type="monotone"
                        data={reportData.expenseReport?.expenseTrend || []}
                        dataKey="value"
                        stroke="#ff7300"
                        strokeWidth={2}
                        name="Expenses"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>

              {/* Income by Category */}
              <Grid item xs={12} lg={4}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Income by Category
                  </Typography>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={reportData.incomeReport?.incomeByCategory 
                          ? Object.entries(reportData.incomeReport.incomeByCategory).map(([name, value]) => ({
                              name,
                              value,
                            }))
                          : []
                        }
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {reportData.incomeReport?.incomeByCategory 
                          ? Object.keys(reportData.incomeReport.incomeByCategory).map((_, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))
                          : null
                        }
                      </Pie>
                      <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        )}

        {/* Tab 1: Income Statement */}
        {activeTab === 1 && (
          <IncomeStatementTab period={period} />
        )}

        {/* Tab 2: Balance Sheet */}
        {activeTab === 2 && (
          <BalanceSheetTab />
        )}

        {/* Tab 3: Cash Flow Statement */}
        {activeTab === 3 && (
          <CashFlowStatementTab period={period} />
        )}

        {/* Tab 4: Financial Ratios */}
        {activeTab === 4 && (
          <FinancialRatiosTab />
        )}

        {/* Tab 5: Tax Report */}
        {activeTab === 5 && (
          <TaxReportTab />
        )}

        {/* Tab 6: Custom */}
        {activeTab === 6 && (
          <CustomReportTab />
        )}
      </Box>

      {/* ReportSettings */}
      <Paper sx={{ mt: 3, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: 'action.hover',
            },
          }}
          onClick={() => setShowReportSettings(!showReportSettings)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SettingsIcon color="primary" />
            <Typography variant="h6">Report Settings</Typography>
          </Box>
          <IconButton size="small">
            {showReportSettings ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Box>
        <Collapse in={showReportSettings}>
          <Box sx={{ p: 3, pt: 0 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Data Inclusion
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reportSettings.includeComparison}
                      onChange={(e) =>
                        setReportSettings({ ...reportSettings, includeComparison: e.target.checked })
                      }
                    />
                  }
                  label="Include Comparison Data"
                />
                <Box sx={{ mt: 1 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={reportSettings.includeInsights}
                      onChange={(e) =>
                        setReportSettings({ ...reportSettings, includeInsights: e.target.checked })
                      }
                    />
                  }
                  label="Include Financial Insights"
                />
                <Box sx={{ mt: 1 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={reportSettings.includePredictions}
                      onChange={(e) =>
                        setReportSettings({ ...reportSettings, includePredictions: e.target.checked })
                      }
                    />
                  }
                  label="Include Predictions"
                />
                <Box sx={{ mt: 1 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={reportSettings.includeTransactions}
                      onChange={(e) =>
                        setReportSettings({ ...reportSettings, includeTransactions: e.target.checked })
                      }
                    />
                  }
                  label="Include Recent Transactions"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                  Display Options
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={reportSettings.showCharts}
                      onChange={(e) =>
                        setReportSettings({ ...reportSettings, showCharts: e.target.checked })
                      }
                    />
                  }
                  label="Show Charts"
                />
                <Box sx={{ mt: 1 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={reportSettings.showTables}
                      onChange={(e) =>
                        setReportSettings({ ...reportSettings, showTables: e.target.checked })
                      }
                    />
                  }
                  label="Show Tables"
                />
                <Box sx={{ mt: 1 }} />
                <FormControlLabel
                  control={
                    <Switch
                      checked={reportSettings.showSummaryCards}
                      onChange={(e) =>
                        setReportSettings({ ...reportSettings, showSummaryCards: e.target.checked })
                      }
                    />
                  }
                  label="Show Summary Cards"
                />
                <Box sx={{ mt: 2 }} />
                <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                  <InputLabel>Currency Format</InputLabel>
                  <Select
                    value={reportSettings.currencyFormat}
                    label="Currency Format"
                    onChange={(e) =>
                      setReportSettings({ ...reportSettings, currencyFormat: e.target.value })
                    }
                  >
                    <MenuItem value="USD">USD ($)</MenuItem>
                    <MenuItem value="EUR">EUR (€)</MenuItem>
                    <MenuItem value="GBP">GBP (£)</MenuItem>
                    <MenuItem value="JPY">JPY (¥)</MenuItem>
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small" sx={{ mt: 2 }}>
                  <InputLabel>Date Format</InputLabel>
                  <Select
                    value={reportSettings.dateFormat}
                    label="Date Format"
                    onChange={(e) =>
                      setReportSettings({ ...reportSettings, dateFormat: e.target.value })
                    }
                  >
                    <MenuItem value="MM/DD/YYYY">MM/DD/YYYY</MenuItem>
                    <MenuItem value="DD/MM/YYYY">DD/MM/YYYY</MenuItem>
                    <MenuItem value="YYYY-MM-DD">YYYY-MM-DD</MenuItem>
                    <MenuItem value="DD MMM YYYY">DD MMM YYYY</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={() => {
                  setReportSettings({
                    includeComparison: true,
                    includeInsights: true,
                    includePredictions: true,
                    includeTransactions: true,
                    showCharts: true,
                    showTables: true,
                    showSummaryCards: true,
                    currencyFormat: 'USD',
                    dateFormat: 'MM/DD/YYYY',
                  });
                }}
              >
                Reset to Defaults
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  fetchFinancialData();
                }}
              >
                Apply Settings
              </Button>
            </Box>
          </Box>
        </Collapse>
      </Paper>

      {/* Predictions Section */}
      {reportData.predictions && Array.isArray(reportData.predictions) && reportData.predictions.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <TrendingUp sx={{ mr: 1 }} /> Financial Predictions
          </Typography>
          <Grid container spacing={2}>
            {reportData.predictions.map((prediction, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" color="primary" gutterBottom>
                      {prediction?.type || 'Prediction'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      {prediction?.description || ''}
                    </Typography>
                    <Typography variant="h5" sx={{ my: 2 }}>
                      {formatCurrency(prediction?.predictedAmount)}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">
                        {prediction?.predictionDate ? new Date(prediction.predictionDate).toLocaleDateString() : 'N/A'}
                      </Typography>
                      <Chip label={`${prediction?.confidence || 0}% confidence`} size="small" color="primary" />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* Recent Transactions */}
      {reportData.recentTransactions && Array.isArray(reportData.recentTransactions) && reportData.recentTransactions.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h5" gutterBottom>
            Recent Transactions
          </Typography>
          <Paper>
            <Box sx={{ p: 2 }}>
              {reportData.recentTransactions.slice(0, 10).map((transaction, index) => (
                <Box
                  key={index}
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    p: 2,
                    mb: 1,
                    bgcolor: 'background.default',
                    borderRadius: 1,
                  }}
                >
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body1" fontWeight="medium">
                      {transaction?.description || 'Transaction'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {transaction?.date ? new Date(transaction.date).toLocaleDateString() : 'N/A'} • {transaction?.category || 'N/A'}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant="h6"
                      color={transaction?.type === 'CREDIT' ? 'success.main' : 'error.main'}
                    >
                      {transaction?.type === 'CREDIT' ? '+' : '-'}
                      {formatCurrency(transaction?.amount)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Balance: {formatCurrency(transaction?.balanceAfter)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default Analytics;
