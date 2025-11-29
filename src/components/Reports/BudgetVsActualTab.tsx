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
  IconButton,
  Tooltip,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import {
  AccountBalance,
  CheckCircle,
  Error as ErrorIcon,
  Refresh,
  TrendingUp,
  TrendingDown,
  Warning,
  Download,
} from '@mui/icons-material';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiService } from '../../services/api';

interface BudgetVsActualTabProps {
  startDate?: Date;
  endDate?: Date;
  period?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  onRefresh?: () => void;
}

const BudgetVsActualTab: React.FC<BudgetVsActualTabProps> = ({
  startDate,
  endDate,
  period = 'MONTHLY',
  onRefresh,
}) => {
  const { formatCurrency } = useCurrency();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState(period);

  useEffect(() => {
    fetchReport();
  }, [startDate, endDate, currentPeriod]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getBudgetVsActualReport(
        startDate?.toISOString(),
        endDate?.toISOString(),
        currentPeriod
      );
      setReport(data);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to load budget vs actual report');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchReport();
  };

  const handleExport = async (format: 'PDF' | 'CSV' | 'EXCEL') => {
    try {
      const blob = await apiService.exportReport(
        format,
        'BUDGET_VS_ACTUAL',
        startDate?.toISOString(),
        endDate?.toISOString()
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Budget_Vs_Actual_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || `Failed to export ${format}`);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert
        severity="error"
        action={
          <IconButton color="inherit" size="small" onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        }
      >
        {error}
      </Alert>
    );
  }

  if (!report) {
    return <Alert severity="info">No budget vs actual data available</Alert>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_TRACK':
        return 'success';
      case 'OVER_BUDGET':
        return 'error';
      case 'UNDER_BUDGET':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string): React.ReactElement | undefined => {
    switch (status) {
      case 'ON_TRACK':
        return <CheckCircle color="success" />;
      case 'OVER_BUDGET':
        return <ErrorIcon color="error" />;
      case 'UNDER_BUDGET':
        return <TrendingDown color="info" />;
      default:
        return undefined;
    }
  };

  return (
    <Box>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" fontWeight="bold">
              Budget vs Actual Report
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Period: {new Date(report.periodStart).toLocaleDateString()} -{' '}
              {new Date(report.periodEnd).toLocaleDateString()}
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={currentPeriod}
                label="Period"
                onChange={(e) =>
                  setCurrentPeriod(e.target.value as 'MONTHLY' | 'QUARTERLY' | 'YEARLY')
                }
              >
                <MenuItem value="MONTHLY">Monthly</MenuItem>
                <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                <MenuItem value="YEARLY">Yearly</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Export PDF">
              <IconButton onClick={() => handleExport('PDF')} color="primary">
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export CSV">
              <IconButton onClick={() => handleExport('CSV')} color="primary">
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export Excel">
              <IconButton onClick={() => handleExport('EXCEL')} color="primary">
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Overall Status Alert */}
      <Alert
        severity={report.overallStatus === 'OVER_BUDGET' ? 'error' : report.overallStatus === 'UNDER_BUDGET' ? 'info' : 'success'}
        icon={getStatusIcon(report.overallStatus)}
        sx={{ mb: 3 }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          Overall Status: {report.overallStatus.replace('_', ' ')}
        </Typography>
        <Typography variant="body2">
          Total Budget: {formatCurrency(report.totalBudget)} | Total Actual:{' '}
          {formatCurrency(report.totalActual)} | Variance:{' '}
          {formatCurrency(report.totalVariance)} ({report.totalVariancePercentage.toFixed(2)}%)
        </Typography>
      </Alert>

      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Total Budget
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(report.totalBudget)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: theme.palette.info.main, color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Total Actual
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(report.totalActual)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              bgcolor:
                report.totalVariance > 0
                  ? theme.palette.error.main
                  : theme.palette.success.main,
              color: 'white',
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Variance
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(report.totalVariance)} (
                {report.totalVariancePercentage.toFixed(2)}%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Alerts */}
      {report.alerts && report.alerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          {report.alerts.map((alert: string, index: number) => (
            <Alert key={index} severity="warning" sx={{ mb: 1 }}>
              {alert}
            </Alert>
          ))}
        </Box>
      )}

      {/* Categories Breakdown */}
      {report.categories && report.categories.length > 0 && (
        <Card elevation={3} sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Budget vs Actual by Category
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Category</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Budget</TableCell>
                    <TableCell align="right">Actual</TableCell>
                    <TableCell align="right">Variance</TableCell>
                    <TableCell align="right">Variance %</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.categories.map((category: any, index: number) => (
                    <TableRow key={index} hover>
                      <TableCell>{category.categoryName}</TableCell>
                      <TableCell>
                        <Chip label={category.categoryType} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(category.budgetAmount)}</TableCell>
                      <TableCell align="right">{formatCurrency(category.actualAmount)}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            category.variance > 0
                              ? theme.palette.error.main
                              : theme.palette.success.main,
                          fontWeight: 'bold',
                        }}
                      >
                        {formatCurrency(category.variance)}
                      </TableCell>
                      <TableCell align="right">
                        {category.variancePercentage.toFixed(2)}%
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={category.status.replace('_', ' ')}
                          color={getStatusColor(category.status) as any}
                          size="small"
                          icon={getStatusIcon(category.status)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}

      {/* Bills Breakdown */}
      {report.bills && report.bills.length > 0 && (
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Budget vs Actual by Bill Provider
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Provider</TableCell>
                    <TableCell>Bill Type</TableCell>
                    <TableCell align="right">Budget</TableCell>
                    <TableCell align="right">Actual</TableCell>
                    <TableCell align="right">Variance</TableCell>
                    <TableCell align="right">Variance %</TableCell>
                    <TableCell align="right">Bill Count</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {report.bills.map((bill: any, index: number) => (
                    <TableRow key={index} hover>
                      <TableCell>{bill.provider}</TableCell>
                      <TableCell>
                        <Chip label={bill.billType} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(bill.budgetAmount)}</TableCell>
                      <TableCell align="right">{formatCurrency(bill.actualAmount)}</TableCell>
                      <TableCell
                        align="right"
                        sx={{
                          color:
                            bill.variance > 0 ? theme.palette.error.main : theme.palette.success.main,
                          fontWeight: 'bold',
                        }}
                      >
                        {formatCurrency(bill.variance)}
                      </TableCell>
                      <TableCell align="right">{bill.variancePercentage.toFixed(2)}%</TableCell>
                      <TableCell align="right">{bill.billCount}</TableCell>
                      <TableCell>
                        <Chip
                          label={bill.status.replace('_', ' ')}
                          color={getStatusColor(bill.status) as any}
                          size="small"
                          icon={getStatusIcon(bill.status)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default BudgetVsActualTab;

