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
} from '@mui/material';
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
} from '@mui/icons-material';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import {
  FinancialReportDto,
  FinancialSummaryDto,
  FinancialInsightDto,
  FinancialPredictionDto,
} from '../types/financialReport';
import { Loan } from '../types/loan';

const Analytics: React.FC = () => {
  const { getCurrencySymbol, formatCurrency: formatCurrencyWithSymbol } = useCurrency();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY'>('MONTHLY');
  const [activeTab, setActiveTab] = useState(0);
  const [reportData, setReportData] = useState<FinancialReportDto | null>(null);
  const [summary, setSummary] = useState<FinancialSummaryDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
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
      setError(err.message || 'Failed to load financial data. The backend API may not be implemented yet.');
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

  const downloadReport = (type: string) => {
    // This would generate and download a PDF report
    console.log(`Downloading ${type} report for period: ${selectedPeriod}`);
    // Future implementation: Generate and download PDF report
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            📊 Financial Reports & Analytics
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Comprehensive insights into your financial health
        </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 120 }} size="small">
            <InputLabel>Report Period</InputLabel>
            <Select
              value={selectedPeriod}
              label="Report Period"
              onChange={(e) => setSelectedPeriod(e.target.value)}
            >
              <MenuItem value="all">All Time</MenuItem>
              <MenuItem value="year">This Year</MenuItem>
              <MenuItem value="month">This Month</MenuItem>
              <MenuItem value="quarter">This Quarter</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
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
          <Button
            variant="contained"
            startIcon={<Download />}
            onClick={() => downloadReport('summary')}
          >
            Download Report
          </Button>
          <Tooltip title="Refresh Data">
            <IconButton onClick={fetchFinancialData} color="primary">
              <Refresh />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Financial Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <MonetizationOn sx={{ color: 'white', mr: 1 }} />
                <Typography color="white" variant="h6">
                  Total Income
                </Typography>
              </Box>
              <Typography variant="h4" component="h2" color="white" gutterBottom>
                {formatCurrency(summary.totalIncome)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {summary.incomeChange >= 0 ? (
                  <TrendingUp sx={{ color: '#4ade80', fontSize: 20, mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ color: '#f87171', fontSize: 20, mr: 0.5 }} />
                )}
                <Typography color="white" variant="body2">
                  {formatPercentage(summary.incomeChange)} from last period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Receipt sx={{ color: 'white', mr: 1 }} />
                <Typography color="white" variant="h6">
                  Total Expenses
                </Typography>
              </Box>
              <Typography variant="h4" component="h2" color="white" gutterBottom>
                {formatCurrency(summary.totalExpenses)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {summary.expenseChange <= 0 ? (
                  <TrendingDown sx={{ color: '#4ade80', fontSize: 20, mr: 0.5 }} />
                ) : (
                  <TrendingUp sx={{ color: '#f87171', fontSize: 20, mr: 0.5 }} />
                )}
                <Typography color="white" variant="body2">
                  {formatPercentage(summary.expenseChange)} from last period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
              <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ color: 'white', mr: 1 }} />
                <Typography color="white" variant="h6">
                  Disposable Amount
                </Typography>
              </Box>
              <Typography variant="h4" component="h2" color="white" gutterBottom>
                {formatCurrency(summary.disposableIncome)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {summary.disposableChange >= 0 ? (
                  <TrendingUp sx={{ color: '#4ade80', fontSize: 20, mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ color: '#f87171', fontSize: 20, mr: 0.5 }} />
                )}
                <Typography color="white" variant="body2">
                  {formatPercentage(summary.disposableChange)} from last period
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Savings sx={{ color: 'white', mr: 1 }} />
                <Typography color="white" variant="h6" sx={{ flexGrow: 1 }}>
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
                      <Divider sx={{ my: 1.5, bgcolor: 'rgba(255,255,255,0.3)' }} />
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
                      <Divider sx={{ my: 1.5, bgcolor: 'rgba(255,255,255,0.3)' }} />
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
                      <Divider sx={{ my: 1.5, bgcolor: 'rgba(255,255,255,0.3)' }} />
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
                      color: 'white',
                      p: 0.5,
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    <Info sx={{ fontSize: 18 }} />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="h4" component="h2" color="white" gutterBottom>
                {formatCurrency(summary.netWorth)}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {summary.netWorthChange >= 0 ? (
                  <TrendingUp sx={{ color: '#4ade80', fontSize: 20, mr: 0.5 }} />
                ) : (
                  <TrendingDown sx={{ color: '#f87171', fontSize: 20, mr: 0.5 }} />
                )}
                <Typography color="white" variant="body2">
                  {formatPercentage(summary.netWorthChange)} from last period
                </Typography>
              </Box>
              </CardContent>
            </Card>
          </Grid>
      </Grid>

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

      {/* Tabs for Different Report Sections */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} variant="scrollable" scrollButtons="auto">
          <Tab label="📈 Income & Expenses" />
          <Tab label="💰 Disposable Amount" />
          <Tab label="🏦 Bills & Utilities" />
          <Tab label="💳 Loans & Debt" />
          <Tab label="💎 Savings & Goals" />
          <Tab label="📊 Net Worth" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ mt: 3 }}>
        {/* Tab 0: Income & Expenses */}
        {activeTab === 0 && (
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

            {/* Expense Distribution */}
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Expense Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={reportData.expenseReport?.expenseByCategory 
                      ? Object.entries(reportData.expenseReport.expenseByCategory).map(([category, amount]) => ({
                          category: category.length > 15 ? category.substring(0, 15) + '...' : category,
                          amount,
                          percentage: reportData.expenseReport?.expensePercentage?.[category] || 0,
                        }))
                      : []
                    }
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                    <Bar dataKey="amount" fill="#ff7300" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Top Income Source */}
            <Grid item xs={12} lg={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Income Summary
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">Total Income:</Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(reportData.incomeReport?.totalIncome)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">Monthly Average:</Typography>
                    <Typography variant="body1">
                      {formatCurrency(reportData.incomeReport?.monthlyAverage)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">Growth Rate:</Typography>
                    <Chip
                      label={formatPercentage(reportData.incomeReport?.growthRate)}
                      color={(reportData.incomeReport?.growthRate || 0) >= 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Top Income Source
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">{reportData.incomeReport?.topIncomeSource || 'N/A'}</Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(reportData.incomeReport?.topIncomeAmount)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tab 1: Disposable Amount */}
        {activeTab === 1 && (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Disposable Amount Trend
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={reportData.disposableIncomeReport?.disposableTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="value"
                      fill="#4facfe"
                      stroke="#4facfe"
                      name="Disposable Amount"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Disposable Amount Analysis
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Current Disposable Amount
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {formatCurrency(reportData.disposableIncomeReport?.currentDisposableIncome)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Average
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency(reportData.disposableIncomeReport?.averageDisposableIncome)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" color="text.secondary">
                      Recommended Savings (30%)
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(reportData.disposableIncomeReport?.recommendedSavings)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Comparison with Previous Period
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <Typography variant="body1">
                        {formatCurrency(
                          reportData.disposableIncomeReport?.comparisonWithPrevious?.previousAmount
                        )}
                      </Typography>
                      <Chip
                        label={formatPercentage(
                          reportData.disposableIncomeReport?.comparisonWithPrevious?.changePercentage
                        )}
                        color={
                          (reportData.disposableIncomeReport?.comparisonWithPrevious?.changePercentage || 0) >= 0
                            ? 'success'
                            : 'error'
                        }
                        size="small"
                      />
                    </Box>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tab 2: Bills & Utilities */}
        {activeTab === 2 && (
      <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                  Bills Trend
            </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={reportData.billsReport?.billsTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                <YAxis />
                    <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                    <Line type="monotone" dataKey="value" stroke="#ff7300" strokeWidth={2} name="Bills" />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Bills Summary
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Total Monthly Bills
                    </Typography>
                    <Typography variant="h5" color="error">
                      {formatCurrency(reportData.billsReport?.totalMonthlyBills)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Average Bill Amount
                    </Typography>
                    <Typography variant="body1">
                      {formatCurrency(reportData.billsReport?.averageBillAmount)}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Predicted Next Month
                    </Typography>
                    <Typography variant="body1" color="warning.main">
                      {formatCurrency(reportData.billsReport?.predictedNextMonth)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">Unpaid Bills:</Typography>
                    <Chip
                      label={reportData.billsReport?.unpaidBillsCount || 0}
                      color={(reportData.billsReport?.unpaidBillsCount || 0) > 0 ? 'warning' : 'default'}
                      size="small"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Overdue Bills:</Typography>
                    <Chip
                      label={reportData.billsReport?.overdueBillsCount || 0}
                      color={(reportData.billsReport?.overdueBillsCount || 0) > 0 ? 'error' : 'default'}
                      size="small"
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Bills by Type */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                  Bills by Type
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                      data={reportData.billsReport?.billsByType
                        ? Object.entries(reportData.billsReport.billsByType).map(([name, value]) => ({
                            name,
                            value,
                          }))
                        : []
                      }
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData.billsReport?.billsByType
                        ? Object.keys(reportData.billsReport.billsByType).map((_, index) => (
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

            {/* Upcoming Bills */}
        <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Upcoming Bills (Next 30 Days)
                </Typography>
                <Box sx={{ mt: 2 }}>
                  {reportData.billsReport?.upcomingBills && Array.isArray(reportData.billsReport.upcomingBills) && reportData.billsReport.upcomingBills.length > 0 ? (
                    reportData.billsReport.upcomingBills.slice(0, 5).map((bill, index) => (
                      <Box
                        key={bill?.id || index}
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
                        <Box>
                          <Typography variant="body1" fontWeight="medium">
                            {bill?.name || 'Bill'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Due in {bill?.daysUntilDue || 0} days
                          </Typography>
                        </Box>
                        <Typography variant="h6" color="error">
                          {formatCurrency(bill?.amount)}
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                      No upcoming bills
                    </Typography>
                  )}
                </Box>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tab 3: Loans & Debt */}
        {activeTab === 3 && (
          <Grid container spacing={3}>
            {/* Loan Summary Cards */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <AccountBalance sx={{ mr: 2, color: 'primary.main', fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6">
                        {formatCurrency(getTotalBorrowed())}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Borrowed
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <TrendingUp sx={{ mr: 2, color: 'success.main', fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6">
                        {formatCurrency(getTotalPaid())}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Paid
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Schedule sx={{ mr: 2, color: 'warning.main', fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6">
                        {formatCurrency(getTotalOutstanding())}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Outstanding Balance
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Assessment sx={{ mr: 2, color: 'info.main', fontSize: 40 }} />
                    <Box>
                      <Typography variant="h6">
                        {loans.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Loans
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Loan Repayment Overview
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Active Loans
                      </Typography>
                      <Typography variant="h4" color="primary">
                        {reportData.loanReport?.activeLoansCount || getActiveLoansCount()}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Total Principal
                      </Typography>
                      <Typography variant="h4">
                        {formatCurrency(reportData.loanReport?.totalPrincipal || getTotalBorrowed())}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Remaining Balance
                      </Typography>
                      <Typography variant="h4" color="error">
                        {formatCurrency(reportData.loanReport?.totalRemainingBalance || getTotalOutstanding())}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Payment
                      </Typography>
                      <Typography variant="h4" color="warning.main">
                        {formatCurrency(reportData.loanReport?.totalMonthlyPayment)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>

            {/* Detailed Loan Table */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Loan Summary & Details
                </Typography>
                {loans.length > 0 ? (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Loan ID</TableCell>
                          <TableCell>Purpose</TableCell>
                          <TableCell>Principal</TableCell>
                          <TableCell>Outstanding</TableCell>
                          <TableCell>Monthly Payment</TableCell>
                          <TableCell>Interest Rate</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Created Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {loans.map((loan) => (
                          <TableRow key={loan.id}>
                            <TableCell>#{loan.id.slice(-8)}</TableCell>
                            <TableCell>{loan.purpose}</TableCell>
                            <TableCell>{formatCurrency(loan.principal)}</TableCell>
                            <TableCell>{formatCurrency(loan.outstandingBalance)}</TableCell>
                            <TableCell>{formatCurrency(loan.monthlyPayment || 0)}</TableCell>
                            <TableCell>{loan.interestRate}%</TableCell>
                            <TableCell>
                              <Chip
                                label={loan.status}
                                color={
                                  loan.status === 'ACTIVE' ? 'success' :
                                  loan.status === 'CLOSED' ? 'default' :
                                  loan.status === 'OVERDUE' ? 'error' : 'warning'
                                }
                                size="small"
                              />
                            </TableCell>
                            <TableCell>{formatDate(loan.createdAt)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                ) : (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No loans found. Create a loan to see details here.
                  </Alert>
                )}
              </Paper>
            </Grid>

            {/* Performance Metrics */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Loan Status Distribution
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body1">Active Loans</Typography>
                    <Chip label={getActiveLoansCount()} color="success" />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body1">Closed Loans</Typography>
                    <Chip label={getClosedLoansCount()} />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body1">Overdue Loans</Typography>
                    <Chip label={getOverdueLoansCount()} color="error" />
                  </Box>
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Financial Summary
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body1">Total Borrowed</Typography>
                    <Typography variant="body1" fontWeight="bold">{formatCurrency(getTotalBorrowed())}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body1">Total Paid</Typography>
                    <Typography variant="body1" fontWeight="bold" color="success.main">{formatCurrency(getTotalPaid())}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="body1">Outstanding</Typography>
                    <Typography variant="body1" fontWeight="bold" color="warning.main">{formatCurrency(getTotalOutstanding())}</Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Individual Loans */}
            {reportData.loanReport?.loans && Array.isArray(reportData.loanReport.loans) && reportData.loanReport.loans.map((loan, index) => (
              <Grid item xs={12} md={6} key={loan?.id || index}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    {loan?.purpose || 'Loan'}
                  </Typography>
                  <Box sx={{ mt: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Principal Amount
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(loan.principalAmount)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Remaining Balance
                      </Typography>
                      <Typography variant="body1" color="error">
                        {formatCurrency(loan.remainingBalance)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Payment
                      </Typography>
                      <Typography variant="body1">
                        {formatCurrency(loan.monthlyPayment)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Interest Rate
                      </Typography>
                      <Typography variant="body1">{loan.interestRate}%</Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                        <Typography variant="body2" color="text.secondary">
                          Repayment Progress
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {loan.repaymentProgress.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={loan.repaymentProgress}
                        sx={{ height: 10, borderRadius: 5 }}
                      />
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}

            {reportData.loanReport?.projectedDebtFreeDate && (
              <Grid item xs={12}>
                <Alert severity="success" icon={<TrendingUp />}>
                  <AlertTitle>Debt-Free Projection</AlertTitle>
                  You'll be debt-free by{' '}
                  {new Date(reportData.loanReport.projectedDebtFreeDate).toLocaleDateString()} if you
                  maintain current payments.
                </Alert>
              </Grid>
            )}
          </Grid>
        )}

        {/* Tab 4: Savings & Goals */}
        {activeTab === 4 && (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Savings Growth Trend
                </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={reportData.savingsReport?.savingsTrend || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="value"
                      fill="#43e97b"
                      stroke="#38f9d7"
                      name="Savings Balance"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Savings Goal Progress
                </Typography>
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                    <CircularProgress
                      variant="determinate"
                      value={reportData.savingsReport?.goalProgress || 0}
                      size={150}
                      thickness={5}
                    />
                    <Box
                      sx={{
                        top: 0,
                        left: 0,
                        bottom: 0,
                        right: 0,
                        position: 'absolute',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Typography variant="h4" component="div" color="primary">
                        {(reportData.savingsReport?.goalProgress || 0).toFixed(0)}%
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ mt: 3 }}>
                      <Typography variant="body2" color="text.secondary">
                        Current Balance
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {formatCurrency(reportData.savingsReport?.totalSavingsBalance)}
                      </Typography>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        Goal Target
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(reportData.savingsReport?.savingsGoal)}
                      </Typography>
                    </Box>
                    {reportData.savingsReport?.monthsUntilGoal && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Months Until Goal
                        </Typography>
                        <Chip
                          label={`${reportData.savingsReport.monthsUntilGoal} months`}
                          color="primary"
                        />
                      </Box>
                    )}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Savings Analysis
                </Typography>
                <Grid container spacing={3} sx={{ mt: 1 }}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Savings
                      </Typography>
                      <Typography variant="h5" color="success.main">
                        {formatCurrency(reportData.savingsReport?.monthlySavingsAmount)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Savings Rate
                      </Typography>
                      <Typography variant="h5">
                        {(reportData.savingsReport?.savingsRate || 0).toFixed(1)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={6}>
                    {reportData.savingsReport?.projectedGoalDate && (
                      <Alert severity="info" icon={<TrendingUp />}>
                        <AlertTitle>Goal Projection</AlertTitle>
                        You'll reach your savings goal by{' '}
                        {new Date(reportData.savingsReport.projectedGoalDate).toLocaleDateString()} at
                        current rate.
                      </Alert>
                    )}
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* Tab 5: Net Worth */}
        {activeTab === 5 && (
          <Grid container spacing={3}>
            <Grid item xs={12} lg={8}>
              <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                  Net Worth Trend (12 Months)
            </Typography>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart data={reportData.netWorthReport?.netWorthTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                <YAxis />
                    <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="value"
                      fill="#667eea"
                      stroke="#764ba2"
                      name="Net Worth"
                    />
              </AreaChart>
            </ResponsiveContainer>
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Net Worth Trend Data
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Period</strong></TableCell>
                      <TableCell align="right"><strong>Net Worth</strong></TableCell>
                      <TableCell align="right"><strong>Change</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reportData.netWorthReport?.netWorthTrend && reportData.netWorthReport.netWorthTrend.length > 0 ? (
                      reportData.netWorthReport.netWorthTrend.map((item: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{item.label || new Date(item.date).toLocaleDateString()}</TableCell>
                          <TableCell align="right">
                            {formatCurrencyWithSymbol(item.value || 0)}
                          </TableCell>
                          <TableCell align="right">
                            {item.comparisonValue !== null && item.comparisonValue !== undefined ? (
                              <Typography
                                variant="body2"
                                color={item.value - item.comparisonValue >= 0 ? 'success.main' : 'error.main'}
                              >
                                {item.value - item.comparisonValue >= 0 ? '+' : ''}
                                {formatCurrencyWithSymbol(item.value - item.comparisonValue)}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                N/A
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          <Typography variant="body2" color="text.secondary">
                            No net worth trend data available
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Paper>
        </Grid>

            <Grid item xs={12} lg={4}>
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Net Worth Summary
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Current Net Worth
                    </Typography>
                    <Typography variant="h3" color="primary">
                      {formatCurrency(reportData.netWorthReport?.currentNetWorth)}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                      {(reportData.netWorthReport?.netWorthChange || 0) >= 0 ? (
                        <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                      ) : (
                        <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                      )}
                      <Chip
                        label={formatPercentage(reportData.netWorthReport?.netWorthChangePercentage)}
                        color={
                          (reportData.netWorthReport?.netWorthChangePercentage || 0) >= 0 ? 'success' : 'error'
                        }
                        size="small"
                      />
                    </Box>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">Total Assets:</Typography>
                    <Typography variant="h6" color="success.main">
                      {formatCurrency(reportData.netWorthReport?.totalAssets)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="body1">Total Liabilities:</Typography>
                    <Typography variant="h6" color="error">
                      {formatCurrency(reportData.netWorthReport?.totalLiabilities)}
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Alert severity="info" icon={<Info />}>
                    {reportData.netWorthReport?.trendDescription || 'No data available'}
                  </Alert>
                </Box>
              </Paper>
            </Grid>

            {/* Asset Breakdown */}
        <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                  Asset Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.netWorthReport?.assetBreakdown
                        ? Object.entries(reportData.netWorthReport.assetBreakdown).map(([name, value]) => ({
                            name,
                            value,
                          }))
                        : []
                      }
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData.netWorthReport?.assetBreakdown
                        ? Object.keys(reportData.netWorthReport.assetBreakdown).map((_, index) => (
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

            {/* Liability Breakdown */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
                  Liability Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={reportData.netWorthReport?.liabilityBreakdown
                        ? Object.entries(reportData.netWorthReport.liabilityBreakdown).map(
                            ([name, value]) => ({ name, value })
                          )
                        : []
                      }
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {reportData.netWorthReport?.liabilityBreakdown
                        ? Object.keys(reportData.netWorthReport.liabilityBreakdown).map((_, index) => (
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
        )}
      </Box>

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
