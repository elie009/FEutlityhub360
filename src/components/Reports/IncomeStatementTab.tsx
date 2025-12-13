import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Divider,
  useTheme,
  Chip,
  Paper,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  CheckCircle,
} from '@mui/icons-material';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiService } from '../../services/api';
import { IncomeStatementDto, IncomeStatementItemDto } from '../../types/financialReport';

interface IncomeStatementTabProps {
  startDate?: Date;
  endDate?: Date;
  period?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
  onRefresh?: () => void;
}

const IncomeStatementTab: React.FC<IncomeStatementTabProps> = ({ 
  startDate, 
  endDate, 
  period = 'YEARLY',
  onRefresh 
}) => {
  const { formatCurrency } = useCurrency();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatementDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [includeComparison, setIncludeComparison] = useState(false);

  useEffect(() => {
    // For CUSTOM period, only fetch if we have valid dates
    if (period === 'CUSTOM') {
      if (startDate && endDate && !isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
        fetchIncomeStatement();
      } else {
        // Clear the data if dates are not valid for CUSTOM period
        setIncomeStatement(null);
        setLoading(false);
      }
    } else {
      // For predefined periods, always fetch
      fetchIncomeStatement();
    }
  }, [startDate, endDate, period, includeComparison]);

  const fetchIncomeStatement = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[IncomeStatementTab] Making API call with:', {
        startDate: startDate?.toISOString(),
        endDate: endDate?.toISOString(),
        period,
        includeComparison
      });

      const data = await apiService.getIncomeStatement(
        startDate?.toISOString(),
        endDate?.toISOString(),
        period,
        includeComparison
      );
      setIncomeStatement(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load income statement');
    } finally {
      setLoading(false);
    }
  };


  const renderItem = (item: IncomeStatementItemDto, index: number) => (
    <TableRow key={index} hover>
      <TableCell>{item.accountName}</TableCell>
      <TableCell>
        <Chip label={item.category} size="small" variant="outlined" />
      </TableCell>
      <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
      {item.description && (
        <TableCell>{item.description}</TableCell>
      )}
    </TableRow>
  );

  const renderSection = (
    title: string,
    items: IncomeStatementItemDto[],
    total: number,
    color: string
  ) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, color }}>
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {items.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Account</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  {items.some(i => i.description) && <TableCell>Description</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => renderItem(item, index))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No items in this section
          </Typography>
        )}
        
        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">
            Total {title}
          </Typography>
          <Typography variant="h6" fontWeight="bold" color={color}>
            {formatCurrency(total)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (!incomeStatement) {
    return (
      <Alert severity="info">No income statement data available</Alert>
    );
  }

  const { revenue, expenses } = incomeStatement;
  const netIncome = incomeStatement.netIncome;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Income Statement
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Period: {new Date(incomeStatement.periodStart).toLocaleDateString()} -{' '}
            {new Date(incomeStatement.periodEnd).toLocaleDateString()}
          </Typography>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Revenue
              </Typography>
              <Typography variant="h4" color="success.main" fontWeight="bold">
                {formatCurrency(revenue.totalRevenue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h4" color="error.main" fontWeight="bold">
                {formatCurrency(expenses.totalExpenses)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary"  gutterBottom>
                Net Income
              </Typography>
              <Box display="flex" alignItems="center">
                {netIncome >= 0 ? (
                  <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                ) : (
                  <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                )}
                <Typography
                  variant="h4"
                  color={netIncome >= 0 ? 'success.main' : 'error.main'}
                  fontWeight="bold"
                >
                  {formatCurrency(netIncome)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="success.main">
          Revenue
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Operating Revenue
            </Typography>
            <Box sx={{ pl: 2, mt: 1 }}>
              <Typography variant="body2">Salary Income: {formatCurrency(revenue.salaryIncome)}</Typography>
              <Typography variant="body2">Business Income: {formatCurrency(revenue.businessIncome)}</Typography>
              <Typography variant="body2">Freelance Income: {formatCurrency(revenue.freelanceIncome)}</Typography>
              <Typography variant="body2">Other Operating: {formatCurrency(revenue.otherOperatingRevenue)}</Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
              Total Operating Revenue: {formatCurrency(revenue.totalOperatingRevenue)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Other Revenue
            </Typography>
            <Box sx={{ pl: 2, mt: 1 }}>
              <Typography variant="body2">Investment Income: {formatCurrency(revenue.investmentIncome)}</Typography>
              <Typography variant="body2">Interest Income: {formatCurrency(revenue.interestIncome)}</Typography>
              <Typography variant="body2">Rental Income: {formatCurrency(revenue.rentalIncome)}</Typography>
              <Typography variant="body2">Dividend Income: {formatCurrency(revenue.dividendIncome)}</Typography>
              <Typography variant="body2">Other Income: {formatCurrency(revenue.otherIncome)}</Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
              Total Other Revenue: {formatCurrency(revenue.totalOtherRevenue)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Expenses Section */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom color="error.main">
          Expenses
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Operating Expenses
            </Typography>
            <Box sx={{ pl: 2, mt: 1 }}>
              <Typography variant="body2">Utilities: {formatCurrency(expenses.utilitiesExpense)}</Typography>
              <Typography variant="body2">Rent: {formatCurrency(expenses.rentExpense)}</Typography>
              <Typography variant="body2">Insurance: {formatCurrency(expenses.insuranceExpense)}</Typography>
              <Typography variant="body2">Subscriptions: {formatCurrency(expenses.subscriptionExpense)}</Typography>
              <Typography variant="body2">Food: {formatCurrency(expenses.foodExpense)}</Typography>
              <Typography variant="body2">Transportation: {formatCurrency(expenses.transportationExpense)}</Typography>
              <Typography variant="body2">Healthcare: {formatCurrency(expenses.healthcareExpense)}</Typography>
              <Typography variant="body2">Education: {formatCurrency(expenses.educationExpense)}</Typography>
              <Typography variant="body2">Entertainment: {formatCurrency(expenses.entertainmentExpense)}</Typography>
              <Typography variant="body2">Other Operating: {formatCurrency(expenses.otherOperatingExpenses)}</Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
              Total Operating Expenses: {formatCurrency(expenses.totalOperatingExpenses)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Financial Expenses
            </Typography>
            <Box sx={{ pl: 2, mt: 1 }}>
              <Typography variant="body2">Interest Expense: {formatCurrency(expenses.interestExpense)}</Typography>
              <Typography variant="body2">Loan Fees: {formatCurrency(expenses.loanFeesExpense)}</Typography>
            </Box>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
              Total Financial Expenses: {formatCurrency(expenses.totalFinancialExpenses)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Comparison Section */}
      {incomeStatement.comparison && (
        <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Comparison with Previous Period
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Revenue Change</Typography>
              <Typography
                variant="h6"
                color={incomeStatement.comparison.revenueChange >= 0 ? 'success.main' : 'error.main'}
              >
                {incomeStatement.comparison.revenueChange >= 0 ? '+' : ''}
                {formatCurrency(incomeStatement.comparison.revenueChange)} (
                {incomeStatement.comparison.revenueChangePercentage.toFixed(1)}%)
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Expenses Change</Typography>
              <Typography
                variant="h6"
                color={incomeStatement.comparison.expensesChange >= 0 ? 'error.main' : 'success.main'}
              >
                {incomeStatement.comparison.expensesChange >= 0 ? '+' : ''}
                {formatCurrency(incomeStatement.comparison.expensesChange)} (
                {incomeStatement.comparison.expensesChangePercentage.toFixed(1)}%)
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="text.secondary">Net Income Change</Typography>
              <Typography
                variant="h6"
                color={incomeStatement.comparison.netIncomeChange >= 0 ? 'success.main' : 'error.main'}
              >
                {incomeStatement.comparison.netIncomeChange >= 0 ? '+' : ''}
                {formatCurrency(incomeStatement.comparison.netIncomeChange)} (
                {incomeStatement.comparison.netIncomeChangePercentage.toFixed(1)}%)
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Net Income Summary */}
      <Paper elevation={3} sx={{ p: 3, bgcolor: netIncome >= 0 ? 'success.light' : 'error.light' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.secondary' }}>
            Net Income
          </Typography>
          <Box display="flex" alignItems="center">
            {netIncome >= 0 ? (
              <CheckCircle sx={{ color: 'text.secondary', mr: 1 }} />
            ) : (
              <TrendingDown sx={{ color: 'text.secondary', mr: 1 }} />
            )}
            <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.secondary' }}>
              {formatCurrency(netIncome)}
            </Typography>
          </Box>
        </Box>
        <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
          {netIncome >= 0 
            ? 'You have a positive net income this period.' 
            : 'You have a negative net income this period. Consider reducing expenses or increasing revenue.'}
        </Typography>
      </Paper>
    </Box>
  );
};

export default IncomeStatementTab;
