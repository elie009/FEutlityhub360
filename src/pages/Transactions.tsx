import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent, Alert,
  CircularProgress, Button, FormControl, InputLabel, Select, MenuItem,
  TextField, Chip, SelectChangeEvent, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Receipt, AttachMoney,
  Refresh, Clear, Category, AccountBalance, Link, Sync,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { BankAccountTransaction, TransactionFilters, TransactionAnalytics } from '../types/transaction';
import { BankAccountAnalytics } from '../types/bankAccount';
import TransactionCard from '../components/Transactions/TransactionCard';
import { getErrorMessage } from '../utils/validation';

const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<BankAccountTransaction[]>([]);
  const [analytics, setAnalytics] = useState<TransactionAnalytics | null>(null);
  const [bankAccountAnalytics, setBankAccountAnalytics] = useState<BankAccountAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<BankAccountTransaction | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    limit: 10,
    page: 1,
  });

  useEffect(() => {
    if (user?.id) {
      loadTransactionsAndAnalytics();
    }
  }, [user?.id, filters]);

  const loadTransactionsAndAnalytics = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const [transactionsData, analyticsData, bankAccountAnalyticsData] = await Promise.all([
        apiService.getRecentTransactions(filters.limit || 10),
        apiService.getTransactionAnalytics(),
        apiService.getBankAccountAnalyticsSummary(),
      ]);

      setTransactions(transactionsData);
      setAnalytics(analyticsData);
      setBankAccountAnalytics(bankAccountAnalyticsData);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    loadTransactionsAndAnalytics();
  };

  const handleSelectChange = (field: keyof TransactionFilters) => (
    event: SelectChangeEvent<string>
  ) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleInputChange = (field: keyof TransactionFilters) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      limit: 10,
      page: 1,
    });
  };

  const handleViewDetails = (transaction: BankAccountTransaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setSelectedTransaction(null);
    setShowDetailsDialog(false);
  };

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Recent Transactions
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={handleRefresh}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Bank Account Analytics Summary Cards */}
      {bankAccountAnalytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountBalance sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6">
                      {bankAccountAnalytics.totalAccounts || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Accounts
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ mr: 2, color: 'success.main' }} />
                  <Box>
                    <Typography variant="h6">
                      {bankAccountAnalytics.totalBalance !== undefined ? formatCurrency(bankAccountAnalytics.totalBalance) : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Balance
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Link sx={{ mr: 2, color: 'info.main' }} />
                  <Box>
                    <Typography variant="h6">
                      {bankAccountAnalytics.connectedAccounts || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Connected Accounts
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Sync sx={{ mr: 2, color: 'warning.main' }} />
                  <Box>
                    <Typography variant="h6">
                      {bankAccountAnalytics.activeAccounts || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Accounts
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoney sx={{ mr: 2, color: 'success.main' }} />
                  <Box>
                    <Typography variant="h6">
                      {bankAccountAnalytics.totalIncoming !== undefined ? formatCurrency(bankAccountAnalytics.totalIncoming) : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Incoming
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Additional Bank Account Analytics Row */}
      {bankAccountAnalytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingDown sx={{ mr: 2, color: 'error.main' }} />
                  <Box>
                    <Typography variant="h6">
                      {bankAccountAnalytics.totalOutgoing !== undefined ? formatCurrency(bankAccountAnalytics.totalOutgoing) : 'N/A'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Outgoing
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AccountBalance sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6">
                      {bankAccountAnalytics.accounts?.length || 0}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Accounts in Analytics
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Transaction Analytics Summary Cards */}
      {analytics && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Receipt sx={{ mr: 2, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="h6">
                      {analytics.totalTransactions}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Transactions
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingUp sx={{ mr: 2, color: 'success.main' }} />
                  <Box>
                    <Typography variant="h6">
                      {formatCurrency(analytics.totalIncoming)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Transaction Incoming
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TrendingDown sx={{ mr: 2, color: 'error.main' }} />
                  <Box>
                    <Typography variant="h6">
                      {formatCurrency(analytics.totalOutgoing)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Transaction Outgoing
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AttachMoney sx={{ mr: 2, color: 'info.main' }} />
                  <Box>
                    <Typography variant="h6">
                      {formatCurrency(analytics.averageTransactionAmount)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Average Amount
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Category sx={{ mr: 2, color: 'warning.main' }} />
                  <Box>
                    <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
                      {analytics.mostActiveCategory}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Top Category
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Transaction Type</InputLabel>
          <Select
            value={filters.transactionType || ''}
            label="Transaction Type"
            onChange={handleSelectChange('transactionType')}
          >
            <MenuItem value="">All Types</MenuItem>
            <MenuItem value="credit">Credit</MenuItem>
            <MenuItem value="debit">Debit</MenuItem>
            <MenuItem value="transfer">Transfer</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Category</InputLabel>
          <Select
            value={filters.category || ''}
            label="Category"
            onChange={handleSelectChange('category')}
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="food">Food</MenuItem>
            <MenuItem value="utilities">Utilities</MenuItem>
            <MenuItem value="transportation">Transportation</MenuItem>
            <MenuItem value="income">Income</MenuItem>
            <MenuItem value="interest">Interest</MenuItem>
            <MenuItem value="dividend">Dividend</MenuItem>
            <MenuItem value="payment">Payment</MenuItem>
            <MenuItem value="cash">Cash</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Limit"
          type="number"
          value={filters.limit || 10}
          onChange={handleInputChange('limit')}
          sx={{ width: 100 }}
          inputProps={{ min: 1, max: 100 }}
        />

        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={handleClearFilters}
          size="small"
        >
          Clear Filters
        </Button>
      </Box>

      {/* Transactions Grid */}
      {transactions.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No transactions found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {filters.transactionType || filters.category 
                ? 'Try adjusting your filters to see more transactions.'
                : 'Your recent transactions will appear here once you start making transactions.'
              }
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {transactions.map((transaction) => (
            <Grid item xs={12} sm={6} md={4} key={transaction.id}>
              <TransactionCard
                transaction={transaction}
                onViewDetails={handleViewDetails}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Transaction Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Transaction Details
        </DialogTitle>
        <DialogContent>
          {selectedTransaction && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Description:</Typography>
                  <Typography variant="h6">{selectedTransaction.description}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Amount:</Typography>
                  <Typography 
                    variant="h6" 
                    color={selectedTransaction.transactionType === 'credit' ? 'success.main' : 'error.main'}
                  >
                    {selectedTransaction.transactionType === 'credit' ? '+' : '-'}
                    {formatCurrency(Math.abs(selectedTransaction.amount), selectedTransaction.currency)}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Type:</Typography>
                  <Chip 
                    label={selectedTransaction.transactionType} 
                    color={selectedTransaction.transactionType === 'credit' ? 'success' : 'error'}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Category:</Typography>
                  <Chip 
                    label={selectedTransaction.category} 
                    color="primary"
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Date:</Typography>
                  <Typography variant="body2">{formatDate(selectedTransaction.transactionDate)}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Balance After:</Typography>
                  <Typography variant="body2">
                    {formatCurrency(selectedTransaction.balanceAfterTransaction, selectedTransaction.currency)}
                  </Typography>
                </Grid>
                {selectedTransaction.merchant && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Merchant:</Typography>
                    <Typography variant="body2">{selectedTransaction.merchant}</Typography>
                  </Grid>
                )}
                {selectedTransaction.location && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Location:</Typography>
                    <Typography variant="body2">{selectedTransaction.location}</Typography>
                  </Grid>
                )}
                {selectedTransaction.referenceNumber && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Reference:</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {selectedTransaction.referenceNumber}
                    </Typography>
                  </Grid>
                )}
                {selectedTransaction.externalTransactionId && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">External ID:</Typography>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {selectedTransaction.externalTransactionId}
                    </Typography>
                  </Grid>
                )}
              </Grid>

              {selectedTransaction.notes && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Notes:
                  </Typography>
                  <Typography variant="body2">{selectedTransaction.notes}</Typography>
                </Box>
              )}

              {selectedTransaction.isRecurring && (
                <Box sx={{ p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
                  <Typography variant="body2" color="info.main">
                    🔄 This is a recurring transaction
                    {selectedTransaction.recurringFrequency && ` (${selectedTransaction.recurringFrequency})`}
                  </Typography>
                </Box>
              )}

              <Divider sx={{ my: 2 }} />

              <Typography variant="body2" color="text.secondary">
                Created: {formatDate(selectedTransaction.createdAt)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Updated: {formatDate(selectedTransaction.updatedAt)}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TransactionsPage;
