import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  Paper,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp,
  TrendingDown,
  AccountBalance,
  ArrowUpward,
  ArrowDownward,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { useCurrency } from '../../contexts/CurrencyContext';
import { CashFlowProjectionDto } from '../../types/financialReport';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CashFlowTab: React.FC = () => {
  const { formatCurrency } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projection, setProjection] = useState<CashFlowProjectionDto | null>(null);
  const [monthsAhead, setMonthsAhead] = useState(6);

  useEffect(() => {
    loadCashFlowProjection();
  }, [monthsAhead]);

  const loadCashFlowProjection = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCashFlowProjection(monthsAhead);
      setProjection(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load cash flow projection');
      console.error('Error loading cash flow projection:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (!projection) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Cash Flow Projection
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No projection data available.
        </Typography>
      </Paper>
    );
  }

  const chartData = projection.monthlyBreakdown.map((month) => ({
    month: new Date(month.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
    income: month.income,
    expenses: month.expenses + month.bills + month.loanPayments,
    netFlow: month.netFlow,
    endingBalance: month.endingBalance,
  }));

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Cash Flow Projection
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Projection Period</InputLabel>
          <Select
            value={monthsAhead}
            label="Projection Period"
            onChange={(e) => setMonthsAhead(Number(e.target.value))}
          >
            <MenuItem value={3}>3 Months</MenuItem>
            <MenuItem value={6}>6 Months</MenuItem>
            <MenuItem value={12}>12 Months</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Starting Balance
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(projection.startingBalance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ArrowUpward sx={{ mr: 1, color: 'success.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Projected Income
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" color="success.main">
                {formatCurrency(projection.projectedIncome)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ArrowDownward sx={{ mr: 1, color: 'error.main' }} />
                <Typography variant="body2" color="text.secondary">
                  Projected Expenses
                </Typography>
              </Box>
              <Typography variant="h5" fontWeight="bold" color="error.main">
                {formatCurrency(projection.projectedExpenses + projection.projectedBills + projection.projectedLoanPayments)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                {projection.netCashFlow >= 0 ? (
                  <TrendingUp sx={{ mr: 1, color: 'success.main' }} />
                ) : (
                  <TrendingDown sx={{ mr: 1, color: 'error.main' }} />
                )}
                <Typography variant="body2" color="text.secondary">
                  Net Cash Flow
                </Typography>
              </Box>
              <Typography
                variant="h5"
                fontWeight="bold"
                color={projection.netCashFlow >= 0 ? 'success.main' : 'error.main'}
              >
                {formatCurrency(projection.netCashFlow)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                Ending: {formatCurrency(projection.projectedEndingBalance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Monthly Cash Flow Trend
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Bar dataKey="income" fill="#10b981" name="Income" />
                <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
                <Line
                  type="monotone"
                  dataKey="netFlow"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Net Flow"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Ending Balance Trend
            </Typography>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="endingBalance"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  name="Ending Balance"
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Monthly Breakdown Table */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Monthly Breakdown
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Month</TableCell>
                <TableCell align="right">Starting Balance</TableCell>
                <TableCell align="right">Income</TableCell>
                <TableCell align="right">Expenses</TableCell>
                <TableCell align="right">Bills</TableCell>
                <TableCell align="right">Loan Payments</TableCell>
                <TableCell align="right">Savings</TableCell>
                <TableCell align="right">Net Flow</TableCell>
                <TableCell align="right">Ending Balance</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {projection.monthlyBreakdown.map((month, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(month.month).toLocaleDateString('en-US', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell align="right">{formatCurrency(month.startingBalance)}</TableCell>
                  <TableCell align="right" sx={{ color: 'success.main' }}>
                    {formatCurrency(month.income)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>
                    {formatCurrency(month.expenses)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>
                    {formatCurrency(month.bills)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'error.main' }}>
                    {formatCurrency(month.loanPayments)}
                  </TableCell>
                  <TableCell align="right" sx={{ color: 'info.main' }}>
                    {formatCurrency(month.savings)}
                  </TableCell>
                  <TableCell align="right">
                    <Chip
                      label={formatCurrency(month.netFlow)}
                      color={month.netFlow >= 0 ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                    {formatCurrency(month.endingBalance)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default CashFlowTab;
