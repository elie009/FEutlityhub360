import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Divider,
} from '@mui/material';
import {
  Refresh,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Analytics,
  Info,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { apiService } from '../services/api';
import { VarianceDashboard, BillVariance } from '../types/bill';
import { getErrorMessage } from '../utils/validation';

const VarianceDashboardPage: React.FC = () => {
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<VarianceDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getVarianceDashboard();
      setDashboard(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load variance dashboard'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'over_budget':
        return 'error';
      case 'slightly_over':
        return 'warning';
      case 'on_target':
        return 'success';
      case 'under_budget':
        return 'success';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'over_budget':
      case 'slightly_over':
        return <TrendingUp fontSize="small" />;
      case 'under_budget':
        return <TrendingDown fontSize="small" />;
      case 'on_target':
        return <CheckCircle fontSize="small" />;
      default:
        return <Info fontSize="small" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'over_budget':
        return 'Over Budget';
      case 'slightly_over':
        return 'Slightly Over';
      case 'on_target':
        return 'On Target';
      case 'under_budget':
        return 'Under Budget';
      case 'no_data':
        return 'No Data';
      default:
        return status;
    }
  };

  const handleBillClick = (billId: string) => {
    navigate(`/bills/${billId}`);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error" action={
          <IconButton color="inherit" size="small" onClick={loadDashboard}>
            <Refresh />
          </IconButton>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  if (!dashboard || dashboard.variances.length === 0) {
    return (
      <Box p={3}>
        <Alert severity="info">
          No variance data available. Add bills with provider and type to see variance analysis.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Analytics color="primary" sx={{ fontSize: 32 }} />
          <Typography variant="h4" fontWeight="bold">
            Variance Analysis Dashboard
          </Typography>
        </Box>
        <IconButton onClick={loadDashboard} color="primary">
          <Refresh />
        </IconButton>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Total Actual
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="primary">
                {formatCurrency(dashboard.totalActualAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Total Estimated
              </Typography>
              <Typography variant="h5" fontWeight="bold" color="info.main">
                {formatCurrency(dashboard.totalEstimatedAmount)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Total Variance
              </Typography>
              <Typography 
                variant="h5" 
                fontWeight="bold"
                color={dashboard.totalVariance >= 0 ? 'error.main' : 'success.main'}
              >
                {dashboard.totalVariance >= 0 ? '+' : ''}
                {formatCurrency(dashboard.totalVariance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                Bills Analyzed
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {dashboard.totalBillsAnalyzed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Status Breakdown */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Status Breakdown
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'error.main',
                  }}
                />
                <Typography variant="body2">Over Budget</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ ml: 'auto' }}>
                  {dashboard.overBudgetCount}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'warning.main',
                  }}
                />
                <Typography variant="body2">Slightly Over</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ ml: 'auto' }}>
                  {dashboard.slightlyOverCount}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'success.main',
                  }}
                />
                <Typography variant="body2">On Target</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ ml: 'auto' }}>
                  {dashboard.onTargetCount}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    bgcolor: 'success.dark',
                  }}
                />
                <Typography variant="body2">Under Budget</Typography>
                <Typography variant="body2" fontWeight="bold" sx={{ ml: 'auto' }}>
                  {dashboard.underBudgetCount}
                </Typography>
              </Box>
            </Grid>
            {dashboard.noDataCount > 0 && (
              <Grid item xs={6} sm={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      bgcolor: 'grey.500',
                    }}
                  />
                  <Typography variant="body2">No Data</Typography>
                  <Typography variant="body2" fontWeight="bold" sx={{ ml: 'auto' }}>
                    {dashboard.noDataCount}
                  </Typography>
                </Box>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Variance Details Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bill Variance Details
          </Typography>
          <Divider sx={{ my: 2 }} />
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Bill</TableCell>
                  <TableCell align="right">Actual</TableCell>
                  <TableCell align="right">Estimated</TableCell>
                  <TableCell align="right">Variance</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {dashboard.variances.map((variance) => (
                  <TableRow
                    key={variance.billId}
                    hover
                    sx={{ cursor: 'pointer' }}
                    onClick={() => handleBillClick(variance.billId)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        Bill {variance.billId.substring(0, 8)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {formatCurrency(variance.actualAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {variance.status === 'no_data' 
                          ? 'N/A' 
                          : formatCurrency(variance.estimatedAmount)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      {variance.status !== 'no_data' && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          {variance.variance >= 0 ? (
                            <TrendingUp fontSize="small" color="error" />
                          ) : (
                            <TrendingDown fontSize="small" color="success" />
                          )}
                          <Typography
                            variant="body2"
                            fontWeight="bold"
                            color={variance.variance >= 0 ? 'error.main' : 'success.main'}
                          >
                            {variance.variance >= 0 ? '+' : ''}
                            {formatCurrency(variance.variance)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ({variance.variancePercentage >= 0 ? '+' : ''}
                            {variance.variancePercentage.toFixed(2)}%)
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={getStatusLabel(variance.status)}
                        color={getStatusColor(variance.status) as any}
                        size="small"
                        icon={getStatusIcon(variance.status)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Generated At */}
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Generated at: {new Date(dashboard.generatedAt).toLocaleString()}
        </Typography>
      </Box>
    </Box>
  );
};

export default VarianceDashboardPage;

