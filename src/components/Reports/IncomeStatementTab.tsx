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
  TextField,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Refresh,
  Download,
  PictureAsPdf,
} from '@mui/icons-material';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiService } from '../../services/api';
import { IncomeStatementDto, IncomeStatementItemDto } from '../../types/financialReport';
import { getApiBaseUrl } from '../../config/environment';

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
  const [localStartDate, setLocalStartDate] = useState<string>(startDate ? startDate.toISOString().split('T')[0] : '');
  const [localEndDate, setLocalEndDate] = useState<string>(endDate ? endDate.toISOString().split('T')[0] : '');
  const [localPeriod, setLocalPeriod] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'>(period);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    // For CUSTOM period, only fetch if we have valid dates
    if (localPeriod === 'CUSTOM') {
      if (localStartDate && localEndDate) {
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
  }, [localStartDate, localEndDate, localPeriod, includeComparison]);

  const fetchIncomeStatement = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[IncomeStatementTab] Making API call with:', {
        startDate: localStartDate,
        endDate: localEndDate,
        period: localPeriod,
        includeComparison
      });

      const data = await apiService.getIncomeStatement(
        localStartDate || undefined,
        localEndDate || undefined,
        localPeriod,
        includeComparison
      );
      setIncomeStatement(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load income statement');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchIncomeStatement();
  };

  const viewRdlcReport = async () => {
    try {
      if (!localStartDate || !localEndDate) {
        setError('Please select a date range first');
        return;
      }

      setLoading(true);
      
      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        return;
      }

      // Build URL with query parameters
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/Reports/income-statement/rdlc?startDate=${localStartDate}&endDate=${localEndDate}&format=PDF`;

      // Fetch the report
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate report' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Clean up old URL if exists
      if (reportUrl) {
        window.URL.revokeObjectURL(reportUrl);
      }
      
      // Create blob URL for viewing
      const pdfUrl = window.URL.createObjectURL(blob);
      setReportUrl(pdfUrl);
      setShowReport(true);
      setError(null);
    } catch (error: any) {
      console.error('Error viewing RDLC report:', error);
      setError(error.message || 'Failed to view report');
    } finally {
      setLoading(false);
    }
  };

  const downloadCurrentReport = () => {
    if (!reportUrl) return;
    
    const a = document.createElement('a');
    a.href = reportUrl;
    a.download = `IncomeStatement_${localStartDate}_${localEndDate}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const closeReport = () => {
    if (reportUrl) {
      window.URL.revokeObjectURL(reportUrl);
    }
    setReportUrl(null);
    setShowReport(false);
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

  // Display period: use startDate/endDate directly if CUSTOM period, otherwise use incomeStatement dates
  const getPeriodDisplay = () => {
    if (incomeStatement) {
      if (period === 'CUSTOM' && startDate && endDate) {
        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      } else {
        return `${new Date(incomeStatement.periodStart).toLocaleDateString()} - ${new Date(incomeStatement.periodEnd).toLocaleDateString()}`;
      }
    }
    return localStartDate && localEndDate 
      ? `${new Date(localStartDate).toLocaleDateString()} - ${new Date(localEndDate).toLocaleDateString()}`
      : 'Select dates';
  };

  return (
    <Box>
      {/* Date Filter Section */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Assessment color="primary" />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Income Statement
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Period: {getPeriodDisplay()}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
            {/* Date Range Pickers */}
            <TextField
              label="Start Date"
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              label="End Date"
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={fetchIncomeStatement}
              size="small"
              disabled={!localStartDate || !localEndDate}
            >
              Apply
            </Button>
            <Tooltip title="View PDF Report">
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PictureAsPdf />}
                onClick={viewRdlcReport}
                size="small"
                disabled={!localStartDate || !localEndDate}
              >
                View Report
              </Button>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* RDLC Report Viewer */}
      {showReport && reportUrl && (
        <Paper elevation={3} sx={{ mb: 3 }}>
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <PictureAsPdf color="error" />
                <Typography variant="h6" fontWeight="bold">
                  Income Statement Report
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Download />}
                  onClick={downloadCurrentReport}
                >
                  Download
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={closeReport}
                >
                  Close
                </Button>
              </Box>
            </Box>
          </Box>
          <Box sx={{ width: '100%', height: '800px', bgcolor: 'white' }}>
            <iframe
              src={reportUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Income Statement Report"
            />
          </Box>
        </Paper>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* No Data State */}
      {!loading && !error && !incomeStatement && (
        <Alert severity="info">No income statement data available. Please select a date range and click Apply.</Alert>
      )}

      {/* Summary Cards */}
      {!loading && !error && incomeStatement && (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Revenue
                  </Typography>
                  <Typography variant="h4" color="success.main" fontWeight="bold">
                    {formatCurrency(incomeStatement.revenue.totalRevenue)}
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
                    {formatCurrency(incomeStatement.expenses.totalExpenses)}
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
                    {incomeStatement.netIncome >= 0 ? (
                      <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                    ) : (
                      <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
                    )}
                    <Typography
                      variant="h4"
                      color={incomeStatement.netIncome >= 0 ? 'success.main' : 'error.main'}
                      fontWeight="bold"
                    >
                      {formatCurrency(incomeStatement.netIncome)}
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
                  <Typography variant="body2">Salary Income: {formatCurrency(incomeStatement.revenue.salaryIncome)}</Typography>
                  <Typography variant="body2">Business Income: {formatCurrency(incomeStatement.revenue.businessIncome)}</Typography>
                  <Typography variant="body2">Freelance Income: {formatCurrency(incomeStatement.revenue.freelanceIncome)}</Typography>
                  <Typography variant="body2">Other Operating: {formatCurrency(incomeStatement.revenue.otherOperatingRevenue)}</Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                  Total Operating Revenue: {formatCurrency(incomeStatement.revenue.totalOperatingRevenue)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Other Revenue
                </Typography>
                <Box sx={{ pl: 2, mt: 1 }}>
                  <Typography variant="body2">Investment Income: {formatCurrency(incomeStatement.revenue.investmentIncome)}</Typography>
                  <Typography variant="body2">Interest Income: {formatCurrency(incomeStatement.revenue.interestIncome)}</Typography>
                  <Typography variant="body2">Rental Income: {formatCurrency(incomeStatement.revenue.rentalIncome)}</Typography>
                  <Typography variant="body2">Dividend Income: {formatCurrency(incomeStatement.revenue.dividendIncome)}</Typography>
                  <Typography variant="body2">Other Income: {formatCurrency(incomeStatement.revenue.otherIncome)}</Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                  Total Other Revenue: {formatCurrency(incomeStatement.revenue.totalOtherRevenue)}
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
                  <Typography variant="body2">Utilities: {formatCurrency(incomeStatement.expenses.utilitiesExpense)}</Typography>
                  <Typography variant="body2">Rent: {formatCurrency(incomeStatement.expenses.rentExpense)}</Typography>
                  <Typography variant="body2">Insurance: {formatCurrency(incomeStatement.expenses.insuranceExpense)}</Typography>
                  <Typography variant="body2">Subscriptions: {formatCurrency(incomeStatement.expenses.subscriptionExpense)}</Typography>
                  <Typography variant="body2">Food: {formatCurrency(incomeStatement.expenses.foodExpense)}</Typography>
                  <Typography variant="body2">Transportation: {formatCurrency(incomeStatement.expenses.transportationExpense)}</Typography>
                  <Typography variant="body2">Healthcare: {formatCurrency(incomeStatement.expenses.healthcareExpense)}</Typography>
                  <Typography variant="body2">Education: {formatCurrency(incomeStatement.expenses.educationExpense)}</Typography>
                  <Typography variant="body2">Entertainment: {formatCurrency(incomeStatement.expenses.entertainmentExpense)}</Typography>
                  <Typography variant="body2">Other Operating: {formatCurrency(incomeStatement.expenses.otherOperatingExpenses)}</Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                  Total Operating Expenses: {formatCurrency(incomeStatement.expenses.totalOperatingExpenses)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">
                  Financial Expenses
                </Typography>
                <Box sx={{ pl: 2, mt: 1 }}>
                  <Typography variant="body2">Interest Expense: {formatCurrency(incomeStatement.expenses.interestExpense)}</Typography>
                  <Typography variant="body2">Loan Fees: {formatCurrency(incomeStatement.expenses.loanFeesExpense)}</Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight="bold" sx={{ mt: 1 }}>
                  Total Financial Expenses: {formatCurrency(incomeStatement.expenses.totalFinancialExpenses)}
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
          <Paper elevation={3} sx={{ p: 3, bgcolor: incomeStatement.netIncome >= 0 ? 'success.light' : 'error.light' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" fontWeight="bold" sx={{ color: 'text.secondary' }}>
                Net Income
              </Typography>
              <Box display="flex" alignItems="center">
                {incomeStatement.netIncome >= 0 ? (
                  <CheckCircle sx={{ color: 'text.secondary', mr: 1 }} />
                ) : (
                  <TrendingDown sx={{ color: 'text.secondary', mr: 1 }} />
                )}
                <Typography variant="h4" fontWeight="bold" sx={{ color: 'text.secondary' }}>
                  {formatCurrency(incomeStatement.netIncome)}
                </Typography>
              </Box>
            </Box>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              {incomeStatement.netIncome >= 0 
                ? 'You have a positive net income this period.' 
                : 'You have a negative net income this period. Consider reducing expenses or increasing revenue.'}
            </Typography>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default IncomeStatementTab;
