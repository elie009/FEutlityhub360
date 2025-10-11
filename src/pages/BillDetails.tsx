import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Print,
  Share,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import {
  BillHistoryAnalytics,
  BudgetStatus,
  BillType,
} from '../types/bill';
import { getErrorMessage } from '../utils/validation';
import ForecastWidget from '../components/Bills/ForecastWidget';
import BudgetTracker from '../components/Bills/BudgetTracker';
import TrendChart from '../components/Bills/TrendChart';
import BillHistoryTable from '../components/Bills/BillHistoryTable';
import { SimpleFinanceLoader } from '../components/Common';

const BillDetails: React.FC = () => {
  const { provider, billType } = useParams<{ provider: string; billType: string }>();
  const navigate = useNavigate();
  
  const [historyData, setHistoryData] = useState<BillHistoryAnalytics | null>(null);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (provider && billType) {
      loadBillDetails();
    }
  }, [provider, billType]);

  const loadBillDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const [history, budget] = await Promise.all([
        apiService.getBillHistory({
          provider: decodeURIComponent(provider!),
          billType: billType as BillType,
          months: 12,
        }),
        apiService.getBudgetStatus({
          provider: decodeURIComponent(provider!),
          billType: billType as BillType,
        }).catch(() => null), // Budget might not exist
      ]);

      setHistoryData(history);
      setBudgetStatus(budget);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load bill details'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/bills');
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log('Export data');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share data');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <SimpleFinanceLoader size="large" text="Loading bill details..." />
      </Box>
    );
  }

  if (error || !historyData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Failed to load bill details'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mt: 2 }}>
          Back to Bills
        </Button>
      </Container>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleBack}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4">
              {decodeURIComponent(provider!)}
            </Typography>
              <Typography variant="body2" color="text.secondary">
                {billType} Bills • {historyData.analytics.billCount || historyData.analytics.monthCount || historyData.totalCount || 0} months
              </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleExport} title="Export Data">
            <Download />
          </IconButton>
          <IconButton onClick={handlePrint} title="Print">
            <Print />
          </IconButton>
          <IconButton onClick={handleShare} title="Share">
            <Share />
          </IconButton>
        </Box>
      </Box>

      {/* Analytics Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Analytics Summary
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Total Spent
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(historyData.analytics.totalSpent)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last {historyData.analytics.billCount || historyData.analytics.monthCount || historyData.totalCount || 0} months
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Monthly Average
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(historyData.analytics.averageWeighted)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Weighted average
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Highest Bill
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {formatCurrency(historyData.analytics.highestBill)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Peak amount
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Lowest Bill
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {formatCurrency(historyData.analytics.lowestBill)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Minimum amount
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Trend Chart */}
          <Box sx={{ mb: 3 }}>
            <TrendChart
              data={historyData.bills.map(bill => ({
                month: new Date(bill.dueDate).toLocaleString('en-US', { month: 'short' }),
                year: new Date(bill.dueDate).getFullYear(),
                amount: bill.amount,
                status: bill.status,
                dueDate: bill.dueDate,
                paidDate: bill.paidAt,
                billId: bill.id,
              }))}
              provider={decodeURIComponent(provider!)}
              averageAmount={historyData.analytics.averageWeighted}
            />
          </Box>

          {/* Bill History Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📜 Bill History
              </Typography>
              <Divider sx={{ my: 2 }} />
              <BillHistoryTable
                bills={historyData.bills}
                showVariance={true}
                estimatedAmounts={new Map()}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Forecast Widget */}
          <Box sx={{ mb: 3 }}>
            <ForecastWidget
              forecast={historyData.forecast}
              provider={decodeURIComponent(provider!)}
            />
          </Box>

          {/* Budget Tracker */}
          <Box sx={{ mb: 3 }}>
            <BudgetTracker
              budgetStatus={budgetStatus || undefined}
              provider={decodeURIComponent(provider!)}
              billType={billType as BillType}
              onBudgetUpdate={loadBillDetails}
            />
          </Box>

          {/* Statistics Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Trend Analysis
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Trend Status
                </Typography>
                <Typography
                  variant="h6"
                  color={
                    historyData.analytics.trend === 'increasing'
                      ? 'error.main'
                      : historyData.analytics.trend === 'decreasing'
                      ? 'success.main'
                      : 'text.primary'
                  }
                >
                  {historyData.analytics.trend === 'increasing' && '↗️ Increasing'}
                  {historyData.analytics.trend === 'decreasing' && '↘️ Decreasing'}
                  {historyData.analytics.trend === 'stable' && '➡️ Stable'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Simple Average (3mo)
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatCurrency(historyData.analytics.averageSimple)}
                </Typography>
              </Box>

              {historyData.analytics.averageSeasonal && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Seasonal Average
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatCurrency(historyData.analytics.averageSeasonal)}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BillDetails;

