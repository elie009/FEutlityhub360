import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent, Alert,
  Button, FormControl, InputLabel, Select, MenuItem,
  SelectChangeEvent, Dialog, DialogTitle, DialogContent, DialogActions,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Receipt as ReceiptIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { BankAccount, BankAccountFilters } from '../types/bankAccount';
import { getErrorMessage } from '../utils/validation';
import BankAccountCard from '../components/BankAccounts/BankAccountCard';
import BankAccountForm from '../components/BankAccounts/BankAccountForm';
import TransactionForm from '../components/BankAccounts/TransactionForm';
import BankAccountTransactionsModal from '../components/BankAccounts/BankAccountTransactionsModal';

const BankAccounts: React.FC = () => {
  const { user } = useAuth();
  
  // Bank Account Management State
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showBankAccountForm, setShowBankAccountForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | undefined>(undefined);
  const [accountForTransactions, setAccountForTransactions] = useState<BankAccount | null>(null);
  const [filters, setFilters] = useState<BankAccountFilters>({});

  // Bank Account Management Functions
  const loadBankAccounts = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const accountsData = await apiService.getUserBankAccounts(filters);
      setBankAccounts(accountsData);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load bank accounts'));
    } finally {
      setIsLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    loadBankAccounts();
  }, [loadBankAccounts]);

  const handleCreateBankAccount = () => {
    setSelectedAccount(undefined);
    setShowBankAccountForm(true);
  };

  const handleCreateTransaction = () => {
    setShowTransactionForm(true);
  };

  const handleEditBankAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setShowBankAccountForm(true);
  };

  const handleDeleteBankAccount = async (accountId: string) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) return;
    setIsLoading(true);
    setError('');
    try {
      await apiService.deleteBankAccount(accountId);
      loadBankAccounts();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete bank account'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectBankAccount = async (accountId: string) => {
    setIsLoading(true);
    setError('');
    try {
      await apiService.connectBankAccount(accountId);
      loadBankAccounts();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to connect bank account'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectBankAccount = async (accountId: string) => {
    setIsLoading(true);
    setError('');
    try {
      await apiService.disconnectBankAccount(accountId);
      loadBankAccounts();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to disconnect bank account'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncBankAccount = async (accountId: string) => {
    setIsLoading(true);
    setError('');
    try {
      await apiService.syncBankAccount(accountId);
      loadBankAccounts();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to sync bank account'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBankAccountFormSuccess = () => {
    setShowBankAccountForm(false);
    loadBankAccounts();
  };

  const handleTransactionFormSuccess = () => {
    setShowTransactionForm(false);
    loadBankAccounts(); // Reload to update balances
  };

  const handleViewTransactions = (account: BankAccount) => {
    setAccountForTransactions(account);
    setShowTransactionsModal(true);
  };

  const handleCloseTransactionsModal = () => {
    setShowTransactionsModal(false);
    setAccountForTransactions(null);
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

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Bank Account Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ReceiptIcon />}
            onClick={handleCreateTransaction}
            disabled={bankAccounts.length === 0}
          >
            Add Transaction
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateBankAccount}
          >
            Add Bank Account
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Account Type</InputLabel>
          <Select
            name="accountType"
            value={filters.accountType || 'all'}
            label="Account Type"
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All Types</MenuItem>
            <MenuItem value="checking">Checking</MenuItem>
            <MenuItem value="savings">Savings</MenuItem>
            <MenuItem value="credit_card">Credit Card</MenuItem>
            <MenuItem value="investment">Investment</MenuItem>
            <MenuItem value="bank">Bank</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Status</InputLabel>
          <Select
            name="isActive"
            value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
            label="Status"
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Connection</InputLabel>
          <Select
            name="isConnected"
            value={filters.isConnected === undefined ? 'all' : filters.isConnected.toString()}
            label="Connection"
            onChange={handleFilterChange}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="true">Connected</MenuItem>
            <MenuItem value="false">Disconnected</MenuItem>
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

      {/* Bank Accounts Grid */}
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
      ) : !Array.isArray(bankAccounts) || bankAccounts.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <AddIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Bank Accounts Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Add your first bank account to start managing your finances.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateBankAccount}
          >
            Add Bank Account
          </Button>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {Array.isArray(bankAccounts) && bankAccounts.map((account) => (
            <Grid item xs={12} sm={6} md={4} key={account.id}>
              <BankAccountCard
                account={account}
                onEdit={handleEditBankAccount}
                onDelete={handleDeleteBankAccount}
                onConnect={handleConnectBankAccount}
                onDisconnect={handleDisconnectBankAccount}
                onSync={handleSyncBankAccount}
                onViewTransactions={handleViewTransactions}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Bank Account Form Dialog */}
      <BankAccountForm
        open={showBankAccountForm}
        onClose={() => {
          setShowBankAccountForm(false);
          setSelectedAccount(undefined);
        }}
        account={selectedAccount}
        onSuccess={handleBankAccountFormSuccess}
      />

      {/* Transaction Form Dialog */}
      <TransactionForm
        open={showTransactionForm}
        onClose={() => setShowTransactionForm(false)}
        onSuccess={handleTransactionFormSuccess}
        bankAccounts={bankAccounts}
      />

      {/* Bank Account Transactions Modal */}
      <BankAccountTransactionsModal
        open={showTransactionsModal}
        onClose={handleCloseTransactionsModal}
        account={accountForTransactions}
      />
    </Container>
  );
};

export default BankAccounts;
