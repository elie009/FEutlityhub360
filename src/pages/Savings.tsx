import React, { useState, useEffect, useCallback } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  LinearProgress,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Divider,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Skeleton,
} from '@mui/material';
import {
  Add as AddIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  AttachMoney as AttachMoneyIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Savings as SavingsIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { useCurrency } from '../contexts/CurrencyContext';
import { SavingsAccount, SavingsType, SavingsSummary, SavingsAccountType, InterestCompoundingFrequency } from '../types/savings';
import { BankAccount } from '../types/bankAccount';

const Savings: React.FC = () => {
  const { formatCurrency } = useCurrency();
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [savingsSummary, setSavingsSummary] = useState<SavingsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showTransferDialog, setShowTransferDialog] = useState(false);
  const [showTransactionHistoryDialog, setShowTransactionHistoryDialog] = useState(false);
  const [showMarkPaidDialog, setShowMarkPaidDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<SavingsAccount | null>(null);
  const [accountWithTransactions, setAccountWithTransactions] = useState<any>(null);
  const [savingsToMarkPaid, setSavingsToMarkPaid] = useState<SavingsAccount | null>(null);
  const [paymentNotes, setPaymentNotes] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAccount, setMenuAccount] = useState<SavingsAccount | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    accountName: '',
    savingsType: SavingsType.EMERGENCY,
    accountType: SavingsAccountType.REGULAR,
    interestRate: '',
    interestCompoundingFrequency: InterestCompoundingFrequency.MONTHLY,
    targetAmount: '',
    description: '',
    goal: '',
    targetDate: '',
    startDate: '',
  });

  const [transferData, setTransferData] = useState({
    bankAccountId: '',
    amount: '',
    description: '',
    transferType: 'deposit' as 'deposit' | 'withdrawal',
    method: 'bank transaction' as 'bank transaction' | 'cash',
  });

  const [formLoading, setFormLoading] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      console.log('🔄 Loading savings data...');
      const [accountsResponse, bankAccountsResponse, summaryResponse] = await Promise.all([
        apiService.getSavingsAccounts(),
        apiService.getUserBankAccounts(),
        apiService.getSavingsSummary(),
      ]);

      console.log('📊 Accounts response:', accountsResponse);
      console.log('🏦 Bank accounts response:', bankAccountsResponse);
      console.log('📈 Summary response:', summaryResponse);

      // Handle the API response structure: { success: true, data: [...], errors: [] }
      // The API service already extracts the data array, so accountsResponse is the array directly
      const accountsData = Array.isArray(accountsResponse) ? accountsResponse : (accountsResponse?.data || []);
      console.log('💾 Accounts data to set:', accountsData);
      console.log('💾 Accounts data length:', accountsData.length);
      setSavingsAccounts(accountsData);
      setBankAccounts(Array.isArray(bankAccountsResponse) ? bankAccountsResponse : ((bankAccountsResponse as any)?.data || []));
      setSavingsSummary(summaryResponse);
    } catch (err: any) {
      console.error('❌ Error loading savings data:', err);
      setError(err.message || 'Failed to load savings data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Debug: Log savingsAccounts state changes
  useEffect(() => {
    console.log('📊 Savings accounts state updated:', savingsAccounts);
    console.log('📊 Savings accounts length:', savingsAccounts.length);
  }, [savingsAccounts]);

  // Handle create account
  const handleCreateAccount = async () => {
    try {
      setFormLoading(true);
      setError('');

      await apiService.createSavingsAccount({
        accountName: formData.accountName,
        savingsType: formData.savingsType,
        accountType: formData.accountType,
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) / 100 : undefined,
        interestCompoundingFrequency: formData.interestRate ? formData.interestCompoundingFrequency : undefined,
        targetAmount: parseFloat(formData.targetAmount),
        description: formData.description,
        goal: formData.goal,
        targetDate: formData.targetDate,
        startDate: formData.startDate || undefined,
        currency: 'USD',
      });

      setSuccess('Savings account created successfully!');
      setShowCreateDialog(false);
      resetForm();
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create savings account');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit account
  const handleEditAccount = async () => {
    if (!selectedAccount) return;

    try {
      setFormLoading(true);
      setError('');

      await apiService.updateSavingsAccount(selectedAccount.id, {
        accountName: formData.accountName,
        savingsType: formData.savingsType,
        accountType: formData.accountType,
        interestRate: formData.interestRate ? parseFloat(formData.interestRate) / 100 : undefined,
        interestCompoundingFrequency: formData.interestRate ? formData.interestCompoundingFrequency : undefined,
        targetAmount: parseFloat(formData.targetAmount),
        description: formData.description,
        goal: formData.goal,
        targetDate: formData.targetDate,
        startDate: formData.startDate || undefined,
        currency: 'USD',
      });

      setSuccess('Savings account updated successfully!');
      setShowEditDialog(false);
      setSelectedAccount(null);
      resetForm();
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update savings account');
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete account
  const handleDeleteAccount = async (accountId: string) => {
    if (!window.confirm('Are you sure you want to delete this savings account?')) {
      return;
    }

    try {
      setError('');
      await apiService.deleteSavingsAccount(accountId);
      setSuccess('Savings account deleted successfully!');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete savings account');
    }
  };

  // Handle mark as paid
  const handleMarkAsPaid = async (account: SavingsAccount) => {
    setSavingsToMarkPaid(account);
    setPaymentNotes('');
    // Calculate remaining amount needed to reach target
    const remainingAmount = account.targetAmount - account.currentBalance;
    setPaymentAmount(remainingAmount > 0 ? remainingAmount.toFixed(2) : '0.00');
    setShowMarkPaidDialog(true);
    handleMenuClose();
  };

  const handleConfirmMarkAsPaid = async () => {
    if (!savingsToMarkPaid) return;

    // Validate amount
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid amount greater than 0');
      return;
    }

    try {
      setFormLoading(true);
      setError('');

      // Call API to mark savings as paid (without bank account)
      await apiService.markSavingsAsPaid(savingsToMarkPaid.id, {
        amount: amount,
        notes: paymentNotes,
      });

      setSuccess('Savings goal marked as paid successfully!');
      setShowMarkPaidDialog(false);
      setSavingsToMarkPaid(null);
      setPaymentNotes('');
      setPaymentAmount('');
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to mark savings as paid');
    } finally {
      setFormLoading(false);
    }
  };

  const handleCloseMarkPaidDialog = () => {
    setShowMarkPaidDialog(false);
    setSavingsToMarkPaid(null);
    setPaymentNotes('');
    setPaymentAmount('');
  };

  // Handle transfer using the new unified savings transaction API
  const handleTransfer = async () => {
    if (!selectedAccount) return;

    try {
      setFormLoading(true);
      setError('');

      // Use the new unified savings transaction API
      const transactionData: any = {
        savingsAccountId: selectedAccount.id,
        amount: parseFloat(transferData.amount),
        transactionType: transferData.transferType === 'deposit' ? 'DEPOSIT' : 'WITHDRAWAL',
        description: transferData.description,
        category: 'TRANSFER',
        currency: 'USD',
        method: transferData.method,
        notes: `${transferData.transferType === 'deposit' ? 'Deposit to' : 'Withdrawal from'} savings account via ${transferData.method}`
      };

      // Only include sourceBankAccountId for bank transactions
      if (transferData.method === 'bank transaction') {
        transactionData.sourceBankAccountId = transferData.bankAccountId;
      }

      await apiService.createSavingsTransaction(transactionData);

      setSuccess(`Transfer ${transferData.transferType} completed successfully!`);
      setShowTransferDialog(false);
      setSelectedAccount(null);
      resetTransferForm();
      await loadData();
    } catch (err: any) {
      // Handle specific error messages
      if (err.message.includes('Insufficient balance')) {
        setError('Not enough funds available for this transaction');
      } else if (err.message.includes('not found')) {
        setError('Account not found. Please refresh and try again.');
      } else {
        setError(err.message || 'Failed to process transfer');
      }
    } finally {
      setFormLoading(false);
    }
  };

  // Reset forms
  const resetForm = () => {
    setFormData({
      accountName: '',
      savingsType: SavingsType.EMERGENCY,
      accountType: SavingsAccountType.REGULAR,
      interestRate: '',
      interestCompoundingFrequency: InterestCompoundingFrequency.MONTHLY,
      targetAmount: '',
      description: '',
      goal: '',
      targetDate: '',
      startDate: '',
    });
  };

  const resetTransferForm = () => {
    setTransferData({
      bankAccountId: '',
      amount: '',
      description: '',
      transferType: 'deposit',
      method: 'bank transaction',
    });
  };

  // Handle menu actions
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, account: SavingsAccount) => {
    setAnchorEl(event.currentTarget);
    setMenuAccount(account);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuAccount(null);
  };

  // Handle view transaction history
  const handleViewTransactions = async (account: SavingsAccount) => {
    try {
      setLoading(true);
      setError('');
      
      // Get account details and transactions separately
      const [accountData, transactionsData] = await Promise.all([
        apiService.getSavingsAccount(account.id),
        apiService.getSavingsTransactions(account.id)
      ]);
      
      // Combine account data with transactions
      const accountWithTransactions = {
        ...accountData,
        transactions: transactionsData
      };
      
      setAccountWithTransactions(accountWithTransactions);
      setShowTransactionHistoryDialog(true);
      handleMenuClose();
    } catch (err: any) {
      setError(err.message || 'Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (account: SavingsAccount) => {
    setSelectedAccount(account);
    setFormData({
      accountName: account.accountName,
      savingsType: account.savingsType,
      accountType: account.accountType || SavingsAccountType.REGULAR,
      interestRate: account.interestRate ? (account.interestRate * 100).toString() : '',
      interestCompoundingFrequency: account.interestCompoundingFrequency || InterestCompoundingFrequency.MONTHLY,
      targetAmount: account.targetAmount.toString(),
      description: account.description || '',
      goal: account.goal || '',
      targetDate: account.targetDate.split('T')[0],
      startDate: (account as any).startDate ? (account as any).startDate.split('T')[0] : '',
    });
    setShowEditDialog(true);
    handleMenuClose();
  };

  const handleTransferClick = (account: SavingsAccount) => {
    setSelectedAccount(account);
    setTransferData({
      bankAccountId: bankAccounts.length > 0 ? bankAccounts[0].id : '',
      amount: '',
      description: '',
      transferType: 'deposit',
      method: 'bank transaction',
    });
    setShowTransferDialog(true);
    handleMenuClose();
  };

  // Get savings type color - Green family theme
  const getSavingsTypeColor = (type: SavingsType): string => {
    const colors: Record<SavingsType, string> = {
      [SavingsType.EMERGENCY]: '#059669',      // Dark emerald
      [SavingsType.VACATION]: '#10b981',       // Emerald
      [SavingsType.INVESTMENT]: '#14b8a6',     // Teal
      [SavingsType.RETIREMENT]: '#06b6d4',     // Cyan
      [SavingsType.EDUCATION]: '#22c55e',      // Green
      [SavingsType.HOME_DOWN_PAYMENT]: '#16a34a', // Dark green
      [SavingsType.CAR_PURCHASE]: '#15803d',   // Forest green
      [SavingsType.WEDDING]: '#84cc16',        // Lime
      [SavingsType.TRAVEL]: '#34d399',         // Light emerald
      [SavingsType.BUSINESS]: '#0d9488',       // Dark teal
      [SavingsType.HEALTH]: '#4ade80',         // Light green
      [SavingsType.TAX_SAVINGS]: '#a3e635',    // Light lime
      [SavingsType.GENERAL]: '#6ee7b7',        // Very light emerald
      [SavingsType.OTHERS]: '#86efac',         // Lightest emerald
    };
    return colors[type] || '#10b981';
  };

  // Get progress color
  const getProgressColor = (percentage: number): string => {
    if (percentage >= 100) return '#4caf50';
    if (percentage >= 75) return '#8bc34a';
    if (percentage >= 50) return '#ff9800';
    if (percentage >= 25) return '#ff5722';
    return '#f44336';
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4, mb: 4, px: 2 }}>
        {/* Header Skeleton */}
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Skeleton variant="text" width={200} height={40} sx={{ mb: 1 }} />
            <Skeleton variant="text" width={350} height={24} />
          </Box>
          <Skeleton variant="rectangular" width={180} height={40} sx={{ borderRadius: 1 }} />
        </Box>

        {/* Summary Cards Skeleton */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Skeleton variant="circular" width={32} height={32} sx={{ mr: 1 }} />
                    <Skeleton variant="text" width={120} height={24} />
                  </Box>
                  <Skeleton variant="text" width="80%" height={40} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="60%" height={20} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Savings Accounts Skeleton */}
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((i) => (
            <Grid item xs={12} md={6} key={i}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Skeleton variant="text" width={200} height={28} />
                    <Box display="flex" gap={1}>
                      <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1 }} />
                    </Box>
                  </Box>
                  <Skeleton variant="text" width="60%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="text" width="80%" height={32} sx={{ mb: 2 }} />
                  <Skeleton variant="rectangular" width="100%" height={8} sx={{ borderRadius: 1, mb: 1 }} />
                  <Box display="flex" justifyContent="space-between">
                    <Skeleton variant="text" width={100} height={20} />
                    <Skeleton variant="text" width={100} height={20} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, mb: 4, px: 2 }}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            <SavingsIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Savings
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Manage your savings goals and track your progress
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateDialog(true)}
          sx={{ minWidth: 160 }}
        >
          Create Savings Account
        </Button>
      </Box>

      {/* Alerts */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Summary Cards */}
      {savingsSummary && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <AccountBalanceIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Total Savings</Typography>
                </Box>
                <Typography variant="h4" color="primary">
                  {formatCurrency(savingsSummary.totalSavingsBalance)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Across {savingsSummary.totalSavingsAccounts} accounts
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="h6">Overall Progress</Typography>
                </Box>
                <Typography variant="h4" color="success">
                  {savingsSummary.overallProgressPercentage.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  of {formatCurrency(savingsSummary.totalTargetAmount)} target
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <CheckCircleIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Active Goals</Typography>
                </Box>
                <Typography variant="h4" color="info">
                  {savingsSummary.activeGoals}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {savingsSummary.completedGoals} completed
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" mb={1}>
                  <AttachMoneyIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">This Month</Typography>
                </Box>
                <Typography variant="h4" color="warning">
                  {formatCurrency(savingsSummary.thisMonthSaved)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Target: {formatCurrency(savingsSummary.monthlySavingsTarget)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Savings Accounts Table */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" gutterBottom>
          Savings Accounts
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Account Type</TableCell>
                <TableCell>Interest Rate</TableCell>
                <TableCell>Current Balance</TableCell>
                <TableCell>Target Amount</TableCell>
                <TableCell>Progress</TableCell>
                <TableCell>Goal</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Target Date</TableCell>
                <TableCell>Month Left</TableCell>
                <TableCell>Monthly Target</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {savingsAccounts.map((account) => (
                <TableRow key={account.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight="bold">
                      {account.accountName}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={account.savingsType.replace('_', ' ')}
                      size="small"
                      sx={{
                        backgroundColor: getSavingsTypeColor(account.savingsType),
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    {account.accountType ? (
                      <Chip
                        label={account.accountType.replace('_', ' ')}
                        size="small"
                        color={account.accountType === SavingsAccountType.HIGH_YIELD ? 'success' : 'default'}
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">Regular</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {account.interestRate ? (
                      <Box>
                        <Typography variant="body2" fontWeight="bold" color="success.main">
                          {(account.interestRate * 100).toFixed(2)}%
                        </Typography>
                        {account.interestCompoundingFrequency && (
                          <Typography variant="caption" color="text.secondary">
                            {account.interestCompoundingFrequency.toLowerCase()}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">-</Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="subtitle2" color="primary" fontWeight="bold">
                      {formatCurrency(account.currentBalance)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatCurrency(account.targetAmount)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ minWidth: 100 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                        <Typography variant="caption" color="text.secondary">
                          {account.progressPercentage.toFixed(1)}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(account.progressPercentage, 100)}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: '#e0e0e0',
                          '& .MuiLinearProgress-bar': {
                            backgroundColor: getProgressColor(account.progressPercentage),
                          },
                        }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {account.goal || '-'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date((account as any).startDate || account.createdAt).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {new Date(account.targetDate).toLocaleDateString()}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color={account.daysRemaining < 30 ? 'warning.main' : 'text.secondary'}>
                      {Math.ceil(account.daysRemaining / 30)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatCurrency(account.monthlyTarget)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {account.progressPercentage >= 100 ? (
                      <Chip
                        icon={<CheckCircleIcon />}
                        label="Completed"
                        color="success"
                        size="small"
                      />
                    ) : account.daysRemaining < 30 ? (
                      <Chip
                        icon={<ScheduleIcon />}
                        label="Urgent"
                        color="warning"
                        size="small"
                      />
                    ) : (
                      <Chip
                        label="In Progress"
                        color="info"
                        size="small"
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, account)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Empty State */}
      {savingsAccounts.length === 0 && (
        <Paper sx={{ p: 4, textAlign: 'center', mt: 4 }}>
          <SavingsIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Savings Accounts Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Start building your financial future by creating your first savings account.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowCreateDialog(true)}
            size="large"
          >
            Create Your First Savings Account
          </Button>
        </Paper>
      )}

      {/* Create Account Dialog */}
      <Dialog open={showCreateDialog} onClose={() => setShowCreateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Savings Account</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Account Name"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Savings Type</InputLabel>
                <Select
                  value={formData.savingsType}
                  onChange={(e) => setFormData({ ...formData, savingsType: e.target.value as SavingsType })}
                  label="Savings Type"
                >
                  {Object.values(SavingsType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value as SavingsAccountType })}
                  label="Account Type"
                >
                  <MenuItem value={SavingsAccountType.REGULAR}>Regular</MenuItem>
                  <MenuItem value={SavingsAccountType.HIGH_YIELD}>High-Yield</MenuItem>
                  <MenuItem value={SavingsAccountType.CD}>Certificate of Deposit (CD)</MenuItem>
                  <MenuItem value={SavingsAccountType.MONEY_MARKET}>Money Market</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Interest Rate (%)"
                type="number"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                helperText="Optional: Annual interest rate (e.g., 4.5 for 4.5%)"
              />
            </Grid>
            {formData.interestRate && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Compounding Frequency</InputLabel>
                  <Select
                    value={formData.interestCompoundingFrequency}
                    onChange={(e) => setFormData({ ...formData, interestCompoundingFrequency: e.target.value as InterestCompoundingFrequency })}
                    label="Compounding Frequency"
                  >
                    <MenuItem value={InterestCompoundingFrequency.DAILY}>Daily</MenuItem>
                    <MenuItem value={InterestCompoundingFrequency.MONTHLY}>Monthly</MenuItem>
                    <MenuItem value={InterestCompoundingFrequency.QUARTERLY}>Quarterly</MenuItem>
                    <MenuItem value={InterestCompoundingFrequency.ANNUALLY}>Annually</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Amount"
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Optional: When the savings goal started"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Date"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Goal"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="What are you saving for?"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateDialog(false)}>Cancel</Button>
          <Button
            onClick={handleCreateAccount}
            variant="contained"
            disabled={formLoading || !formData.accountName || !formData.targetAmount || !formData.targetDate}
          >
            {formLoading ? 'Creating...' : 'Create Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Account Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Savings Account</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Account Name"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Savings Type</InputLabel>
                <Select
                  value={formData.savingsType}
                  onChange={(e) => setFormData({ ...formData, savingsType: e.target.value as SavingsType })}
                  label="Savings Type"
                >
                  {Object.values(SavingsType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace('_', ' ')}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value as SavingsAccountType })}
                  label="Account Type"
                >
                  <MenuItem value={SavingsAccountType.REGULAR}>Regular</MenuItem>
                  <MenuItem value={SavingsAccountType.HIGH_YIELD}>High-Yield</MenuItem>
                  <MenuItem value={SavingsAccountType.CD}>Certificate of Deposit (CD)</MenuItem>
                  <MenuItem value={SavingsAccountType.MONEY_MARKET}>Money Market</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Interest Rate (%)"
                type="number"
                value={formData.interestRate}
                onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                helperText="Optional: Annual interest rate (e.g., 4.5 for 4.5%)"
              />
            </Grid>
            {formData.interestRate && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Compounding Frequency</InputLabel>
                  <Select
                    value={formData.interestCompoundingFrequency}
                    onChange={(e) => setFormData({ ...formData, interestCompoundingFrequency: e.target.value as InterestCompoundingFrequency })}
                    label="Compounding Frequency"
                  >
                    <MenuItem value={InterestCompoundingFrequency.DAILY}>Daily</MenuItem>
                    <MenuItem value={InterestCompoundingFrequency.MONTHLY}>Monthly</MenuItem>
                    <MenuItem value={InterestCompoundingFrequency.QUARTERLY}>Quarterly</MenuItem>
                    <MenuItem value={InterestCompoundingFrequency.ANNUALLY}>Annually</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Amount"
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                helperText="Optional: When the savings goal started"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Target Date"
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Goal"
                value={formData.goal}
                onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                placeholder="What are you saving for?"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleEditAccount}
            variant="contained"
            disabled={formLoading || !formData.accountName || !formData.targetAmount || !formData.targetDate}
          >
            {formLoading ? 'Updating...' : 'Update Account'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transfer Dialog */}
      <Dialog open={showTransferDialog} onClose={() => setShowTransferDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {transferData.transferType === 'deposit' ? 'Deposit to Savings' : 'Withdraw from Savings'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={transferData.method}
                  onChange={(e) => setTransferData({ ...transferData, method: e.target.value as 'bank transaction' | 'cash' })}
                  label="Payment Method"
                >
                  <MenuItem value="bank transaction">Bank Transaction</MenuItem>
                  <MenuItem value="cash">Cash</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {transferData.method === 'bank transaction' && (
              <Grid item xs={12}>
                <FormControl fullWidth required>
                  <InputLabel>Bank Account</InputLabel>
                  <Select
                    value={transferData.bankAccountId}
                    onChange={(e) => setTransferData({ ...transferData, bankAccountId: e.target.value })}
                    label="Bank Account"
                  >
                    {bankAccounts.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.accountName} - {formatCurrency(account.currentBalance)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={transferData.amount}
                onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={transferData.description}
                onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTransferDialog(false)}>Cancel</Button>
          <Button
            onClick={handleTransfer}
            variant="contained"
            disabled={formLoading || !transferData.bankAccountId || !transferData.amount || !transferData.description}
          >
            {formLoading ? 'Processing...' : 'Transfer'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Account Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => menuAccount && handleEditClick(menuAccount)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit Account
        </MenuItem>
        <MenuItem onClick={() => menuAccount && handleViewTransactions(menuAccount)}>
          <HistoryIcon sx={{ mr: 1 }} />
          View Transactions
        </MenuItem>
        <MenuItem onClick={() => menuAccount && handleTransferClick(menuAccount)}>
          <AttachMoneyIcon sx={{ mr: 1 }} />
          Transfer Money
        </MenuItem>
        {menuAccount && menuAccount.progressPercentage < 100 && (
          <MenuItem onClick={() => menuAccount && handleMarkAsPaid(menuAccount)}>
            <CheckCircleIcon sx={{ mr: 1 }} />
            Mark as Paid
          </MenuItem>
        )}
        <Divider />
        <MenuItem 
          onClick={() => menuAccount && handleDeleteAccount(menuAccount.id)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Account
        </MenuItem>
      </Menu>

      {/* Transaction History Dialog */}
      <Dialog 
        open={showTransactionHistoryDialog} 
        onClose={() => setShowTransactionHistoryDialog(false)} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" alignItems="center">
            <HistoryIcon sx={{ mr: 1 }} />
            Transaction History - {accountWithTransactions?.accountName}
          </Box>
        </DialogTitle>
        <DialogContent>
          {accountWithTransactions && (
            <Box>
              {/* Account Summary */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" gutterBottom>
                        Account Details
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Type:</strong> {accountWithTransactions.savingsType?.replace('_', ' ')}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Current Balance:</strong> {formatCurrency(accountWithTransactions.currentBalance || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Target Amount:</strong> {formatCurrency(accountWithTransactions.targetAmount || 0)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="h6" gutterBottom>
                        Progress
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Progress:</strong> {accountWithTransactions.progressPercentage?.toFixed(1)}%
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Remaining:</strong> {formatCurrency(accountWithTransactions.remainingAmount || 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Month Left:</strong> {Math.ceil(accountWithTransactions.daysRemaining / 30)}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Transactions Table */}
              <Typography variant="h6" gutterBottom>
                Transaction History
              </Typography>
              {accountWithTransactions.transactions && Array.isArray(accountWithTransactions.transactions) && accountWithTransactions.transactions.length > 0 ? (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Currency</TableCell>
                        <TableCell>Notes</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {accountWithTransactions.transactions.map((transaction: any) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.transactionDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.transactionType}
                              size="small"
                              color={transaction.transactionType === 'DEPOSIT' ? 'success' : 'error'}
                            />
                          </TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.category?.replace('_', ' ')}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Typography
                              variant="body2"
                              color={transaction.transactionType === 'DEPOSIT' ? 'success.main' : 'error.main'}
                              fontWeight="bold"
                            >
                              {transaction.transactionType === 'DEPOSIT' ? '+' : '-'}${transaction.amount?.toFixed(2)}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={transaction.currency}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>{transaction.notes || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : (
                <Box textAlign="center" py={4}>
                  <Typography variant="body1" color="text.secondary">
                    No transactions found for this account.
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowTransactionHistoryDialog(false)}>
            Close
          </Button>
          </DialogActions>
        </Dialog>

      {/* Mark as Paid Dialog */}
      <Dialog
        open={showMarkPaidDialog}
        onClose={handleCloseMarkPaidDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Mark Savings Goal as Paid
        </DialogTitle>
        <DialogContent>
          {savingsToMarkPaid && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Account:</strong> {savingsToMarkPaid.accountName}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Current Balance:</strong> {formatCurrency(savingsToMarkPaid.currentBalance)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                <strong>Target Amount:</strong> {formatCurrency(savingsToMarkPaid.targetAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                <strong>Progress:</strong> {savingsToMarkPaid.progressPercentage.toFixed(1)}%
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                <strong>Remaining Amount:</strong> {formatCurrency(savingsToMarkPaid.targetAmount - savingsToMarkPaid.currentBalance)}
              </Typography>
              
              <TextField
                fullWidth
                label="Amount to Save"
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
                inputProps={{ min: 0, step: 0.01 }}
                helperText={`Enter the amount you want to save (max: ${formatCurrency(savingsToMarkPaid.targetAmount - savingsToMarkPaid.currentBalance)})`}
                sx={{ mt: 2 }}
              />
              
              <TextField
                fullWidth
                label="Payment Notes (Optional)"
                value={paymentNotes}
                onChange={(e) => setPaymentNotes(e.target.value)}
                multiline
                rows={3}
                placeholder="Add any notes about this payment..."
                sx={{ mt: 2 }}
              />
              
              <Alert severity="info" sx={{ mt: 2 }}>
                This will mark the savings goal as paid without requiring a bank transfer. 
                The payment will be recorded for tracking purposes.
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseMarkPaidDialog}>Cancel</Button>
          <Button
            onClick={handleConfirmMarkAsPaid}
            variant="contained"
            color="success"
            disabled={formLoading || !paymentAmount || parseFloat(paymentAmount) <= 0}
          >
            {formLoading ? 'Processing...' : 'Mark as Paid'}
          </Button>
        </DialogActions>
      </Dialog>
      </Box>
    );
  };
  
  export default Savings;
