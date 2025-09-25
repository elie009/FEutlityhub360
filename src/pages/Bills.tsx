import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt,
  TrendingUp,
  Warning,
  CheckCircle,
  FilterList,
  Refresh,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { Bill, BillStatus, BillType, BillFilters, BillAnalytics } from '../types/bill';
import { getErrorMessage } from '../utils/validation';
import BillCard from '../components/Bills/BillCard';
import BillForm from '../components/Bills/BillForm';

const Bills: React.FC = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState<Bill[]>([]);
  const [analytics, setAnalytics] = useState<BillAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showBillForm, setShowBillForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [filters, setFilters] = useState<BillFilters>({
    page: 1,
    limit: 12,
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      loadBills();
      loadAnalytics();
    }
  }, [user, filters]);

  const loadBills = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getUserBills(filters);
      setBills(response.data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load bills'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await apiService.getBillAnalyticsSummary();
      setAnalytics(analyticsData);
    } catch (err: unknown) {
      console.error('Failed to load analytics:', err);
    }
  };

  const handleCreateBill = () => {
    setSelectedBill(null);
    setShowBillForm(true);
  };

  const handleEditBill = (bill: Bill) => {
    setSelectedBill(bill);
    setShowBillForm(true);
  };

  const handleBillSuccess = (bill: Bill) => {
    setShowBillForm(false);
    setSelectedBill(null);
    loadBills();
    loadAnalytics();
  };

  const handleDeleteBill = async (billId: string) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await apiService.deleteBill(billId);
        loadBills();
        loadAnalytics();
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to delete bill'));
      }
    }
  };

  const handleMarkAsPaid = async (billId: string) => {
    try {
      await apiService.markBillAsPaid(billId, 'Marked as paid from dashboard');
      loadBills();
      loadAnalytics();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to mark bill as paid'));
    }
  };

  const handleFilterChange = (field: keyof BillFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const clearFilters = () => {
    setFilters({
      page: 1,
      limit: 12,
    });
  };

  const refreshData = () => {
    loadBills();
    loadAnalytics();
  };

  if (isLoading && bills.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Bills Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={refreshData} disabled={isLoading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateBill}
          >
            Add Bill
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Analytics Cards */}
      {analytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Receipt sx={{ mr: 2, color: 'warning.main' }} />
                  <Box>
                    <Typography variant="h6">
                      ${analytics.totalPendingAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending Bills ({analytics.totalPendingBills})
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
                  <CheckCircle sx={{ mr: 2, color: 'success.main' }} />
                  <Box>
                    <Typography variant="h6">
                      ${analytics.totalPaidAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Paid Bills ({analytics.totalPaidBills})
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
                  <Warning sx={{ mr: 2, color: 'error.main' }} />
                  <Box>
                    <Typography variant="h6">
                      ${analytics.totalOverdueAmount.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Overdue Bills ({analytics.totalOverdueBills})
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
                  <TrendingUp sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6">
                      {bills.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Bills
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      {showFilters && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Filters
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                    label="Status"
                  >
                    <MenuItem value="">All Statuses</MenuItem>
                    <MenuItem value={BillStatus.PENDING}>Pending</MenuItem>
                    <MenuItem value={BillStatus.PAID}>Paid</MenuItem>
                    <MenuItem value={BillStatus.OVERDUE}>Overdue</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Bill Type</InputLabel>
                  <Select
                    value={filters.billType || ''}
                    onChange={(e) => handleFilterChange('billType', e.target.value || undefined)}
                    label="Bill Type"
                  >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value={BillType.UTILITY}>Utility</MenuItem>
                    <MenuItem value={BillType.SUBSCRIPTION}>Subscription</MenuItem>
                    <MenuItem value={BillType.LOAN}>Loan</MenuItem>
                    <MenuItem value={BillType.OTHERS}>Others</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button variant="outlined" onClick={clearFilters}>
                    Clear
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {/* Active Filters */}
            {(filters.status || filters.billType) && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Active Filters:
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {filters.status && (
                    <Chip
                      label={`Status: ${filters.status}`}
                      onDelete={() => handleFilterChange('status', undefined)}
                      size="small"
                    />
                  )}
                  {filters.billType && (
                    <Chip
                      label={`Type: ${filters.billType}`}
                      onDelete={() => handleFilterChange('billType', undefined)}
                      size="small"
                    />
                  )}
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>
      )}

      {/* Bills Grid */}
      {bills.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No bills found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              {filters.status || filters.billType 
                ? 'No bills match your current filters. Try adjusting your filters or create a new bill.'
                : 'You haven\'t created any bills yet. Start by adding your first bill.'
              }
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateBill}
            >
              Add Bill
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {bills.map((bill) => (
            <Grid item xs={12} sm={6} md={4} key={bill.id}>
              <BillCard
                bill={bill}
                onEdit={handleEditBill}
                onDelete={handleDeleteBill}
                onMarkAsPaid={handleMarkAsPaid}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add bill"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
        }}
        onClick={handleCreateBill}
      >
        <AddIcon />
      </Fab>

      {/* Bill Form Dialog */}
      <BillForm
        open={showBillForm}
        onClose={() => {
          setShowBillForm(false);
          setSelectedBill(null);
        }}
        bill={selectedBill}
        onSuccess={handleBillSuccess}
      />
    </Box>
  );
};

export default Bills;