import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Alert,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Payment as PaymentIcon,
  History as HistoryIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { apiService } from '../services/api';
import { Receivable, ReceivableFilters, ReceivableStatus, ReceivablePayment } from '../types/receivable';
import { getErrorMessage } from '../utils/validation';
import ReceivableCard from '../components/Receivables/ReceivableCard';
import ReceivableForm from '../components/Receivables/ReceivableForm';
import ReceivablePaymentForm from '../components/Receivables/ReceivablePaymentForm';

const Receivables: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();

  // Receivables Management State
  const [receivables, setReceivables] = useState<Receivable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showReceivableForm, setShowReceivableForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [selectedReceivable, setSelectedReceivable] = useState<Receivable | undefined>(undefined);
  const [receivableForPayment, setReceivableForPayment] = useState<Receivable | null>(null);
  const [receivableForHistory, setReceivableForHistory] = useState<Receivable | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<ReceivablePayment[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [filters, setFilters] = useState<ReceivableFilters>({});

  // Load receivables
  const loadReceivables = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const receivablesData = await apiService.getUserReceivables(filters);
      setReceivables(receivablesData);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load receivables'));
    } finally {
      setIsLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    loadReceivables();
  }, [loadReceivables]);

  const handleCreateReceivable = () => {
    setSelectedReceivable(undefined);
    setShowReceivableForm(true);
  };

  const handleRecordPayment = (receivableId: string) => {
    const receivable = receivables.find(r => r.id === receivableId);
    if (receivable) {
      setReceivableForPayment(receivable);
      setShowPaymentForm(true);
    }
  };

  const handleEditReceivable = (receivable: Receivable) => {
    setSelectedReceivable(receivable);
    setShowReceivableForm(true);
  };

  const handleDeleteReceivable = async (receivableId: string) => {
    if (!window.confirm('Are you sure you want to delete this receivable? This action cannot be undone.')) return;
    setIsLoading(true);
    setError('');
    try {
      await apiService.deleteReceivable(receivableId);
      loadReceivables();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete receivable'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewHistory = async (receivableId: string) => {
    const receivable = receivables.find(r => r.id === receivableId);
    if (receivable) {
      setReceivableForHistory(receivable);
      setShowPaymentHistory(true);
      setLoadingHistory(true);
      try {
        const payments = await apiService.getReceivablePayments(receivableId);
        setPaymentHistory(payments);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load payment history'));
      } finally {
        setLoadingHistory(false);
      }
    }
  };

  const handleReceivableFormSuccess = () => {
    setShowReceivableForm(false);
    setSelectedReceivable(undefined);
    loadReceivables();
  };

  const handlePaymentFormSuccess = () => {
    setShowPaymentForm(false);
    setReceivableForPayment(null);
    loadReceivables(); // Reload to update balances
  };

  const handleClosePaymentHistory = () => {
    setShowPaymentHistory(false);
    setReceivableForHistory(null);
    setPaymentHistory([]);
  };

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name as string]: value === 'all' ? undefined : value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  // Calculate summary statistics
  const totalOutstanding = receivables
    .filter(r => r.status === ReceivableStatus.ACTIVE)
    .reduce((sum, r) => sum + r.remainingBalance, 0);
  
  const totalPaid = receivables.reduce((sum, r) => sum + r.totalPaid, 0);
  
  const activeCount = receivables.filter(r => r.status === ReceivableStatus.ACTIVE).length;
  
  const completedCount = receivables.filter(r => r.status === ReceivableStatus.COMPLETED).length;

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Receivables Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateReceivable}
        >
          Add Receivable
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Outstanding
              </Typography>
              <Typography variant="h5" color="warning.main" fontWeight="bold">
                {formatCurrency(totalOutstanding)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Paid
              </Typography>
              <Typography variant="h5" color="success.main" fontWeight="bold">
                {formatCurrency(totalPaid)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active Receivables
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {activeCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Completed
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {completedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            name="status"
            value={filters.status || 'all'}
            label="Status"
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value={ReceivableStatus.ACTIVE}>Active</MenuItem>
            <MenuItem value={ReceivableStatus.COMPLETED}>Completed</MenuItem>
            <MenuItem value={ReceivableStatus.OVERDUE}>Overdue</MenuItem>
            <MenuItem value={ReceivableStatus.CANCELLED}>Cancelled</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          size="small"
          onClick={handleClearFilters}
          startIcon={<DeleteIcon />}
        >
          Clear Filters
        </Button>
      </Box>

      {/* Receivables Grid */}
      {isLoading ? (
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Skeleton variant="text" width={200} height={28} />
                    <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
                  </Box>
                  <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="80%" height={32} sx={{ mb: 2 }} />
                  <Box display="flex" justifyContent="space-between" mt={2}>
                    <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : !Array.isArray(receivables) || receivables.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <PaymentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Receivables Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add your first receivable to start tracking money you've lent to others.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateReceivable}
          >
            Add Receivable
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {Array.isArray(receivables) && receivables.map((receivable) => (
            <Grid item xs={12} sm={6} md={4} key={receivable.id}>
              <ReceivableCard
                receivable={receivable}
                onEdit={handleEditReceivable}
                onRecordPayment={handleRecordPayment}
                onDelete={handleDeleteReceivable}
                onViewHistory={handleViewHistory}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Receivable Form Dialog */}
      <ReceivableForm
        open={showReceivableForm}
        onClose={() => {
          setShowReceivableForm(false);
          setSelectedReceivable(undefined);
        }}
        receivable={selectedReceivable}
        onSuccess={handleReceivableFormSuccess}
      />

      {/* Payment Form Dialog */}
      {receivableForPayment && (
        <ReceivablePaymentForm
          open={showPaymentForm}
          onClose={() => {
            setShowPaymentForm(false);
            setReceivableForPayment(null);
          }}
          receivableId={receivableForPayment.id}
          onSuccess={handlePaymentFormSuccess}
        />
      )}

      {/* Payment History Dialog */}
      <Dialog
        open={showPaymentHistory}
        onClose={handleClosePaymentHistory}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">
              Payment History - {receivableForHistory?.borrowerName}
            </Typography>
            <IconButton onClick={handleClosePaymentHistory} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {loadingHistory ? (
            <Box sx={{ p: 3, textAlign: 'center' }}>
              <Skeleton variant="rectangular" width="100%" height={200} />
            </Box>
          ) : paymentHistory.length === 0 ? (
            <Alert severity="info">No payments recorded yet.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Reference</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paymentHistory.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.paymentDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {formatCurrency(payment.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>{payment.method}</TableCell>
                      <TableCell>{payment.reference || '-'}</TableCell>
                      <TableCell>{payment.notes || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentHistory}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Receivables;

