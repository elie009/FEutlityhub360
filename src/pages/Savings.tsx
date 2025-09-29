import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
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
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { SavingsAccount, SavingsType, SavingsSummary } from '../types/savings';
import { BankAccount } from '../types/bankAccount';

const Savings: React.FC = () => {
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
  const [selectedAccount, setSelectedAccount] = useState<SavingsAccount | null>(null);

  // Menu states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuAccount, setMenuAccount] = useState<SavingsAccount | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    accountName: '',
    savingsType: SavingsType.EMERGENCY,
    targetAmount: '',
    description: '',
    goal: '',
    targetDate: '',
  });

  const [transferData, setTransferData] = useState({
    bankAccountId: '',
    amount: '',
    description: '',
    transferType: 'deposit' as 'deposit' | 'withdrawal',
  });

  const [formLoading, setFormLoading] = useState(false);

  // Load data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [accountsResponse, bankAccountsResponse, summaryResponse] = await Promise.all([
        apiService.getSavingsAccounts(),
        apiService.getUserBankAccounts(),
        apiService.getSavingsSummary(),
      ]);

      setSavingsAccounts(accountsResponse.data || []);
      setBankAccounts(Array.isArray(bankAccountsResponse) ? bankAccountsResponse : ((bankAccountsResponse as any)?.data || []));
      setSavingsSummary(summaryResponse);
    } catch (err: any) {
      setError(err.message || 'Failed to load savings data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle create account
  const handleCreateAccount = async () => {
    try {
      setFormLoading(true);
      setError('');

      await apiService.createSavingsAccount({
        accountName: formData.accountName,
        savingsType: formData.savingsType,
        targetAmount: parseFloat(formData.targetAmount),
        description: formData.description,
        goal: formData.goal,
        targetDate: formData.targetDate,
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
        targetAmount: parseFloat(formData.targetAmount),
        description: formData.description,
        goal: formData.goal,
        targetDate: formData.targetDate,
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

  // Handle transfer
  const handleTransfer = async () => {
    if (!selectedAccount) return;

    try {
      setFormLoading(true);
      setError('');

      if (transferData.transferType === 'deposit') {
        await apiService.transferBankToSavings({
          bankAccountId: transferData.bankAccountId,
          savingsAccountId: selectedAccount.id,
          amount: parseFloat(transferData.amount),
          description: transferData.description,
        });
      } else {
        await apiService.transferSavingsToBank({
          savingsAccountId: selectedAccount.id,
          bankAccountId: transferData.bankAccountId,
          amount: parseFloat(transferData.amount),
          description: transferData.description,
        });
      }

      setSuccess(`Transfer ${transferData.transferType} completed successfully!`);
      setShowTransferDialog(false);
      setSelectedAccount(null);
      resetTransferForm();
      await loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to process transfer');
    } finally {
      setFormLoading(false);
    }
  };

  // Reset forms
  const resetForm = () => {
    setFormData({
      accountName: '',
      savingsType: SavingsType.EMERGENCY,
      targetAmount: '',
      description: '',
      goal: '',
      targetDate: '',
    });
  };

  const resetTransferForm = () => {
    setTransferData({
      bankAccountId: '',
      amount: '',
      description: '',
      transferType: 'deposit',
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

  const handleEditClick = (account: SavingsAccount) => {
    setSelectedAccount(account);
    setFormData({
      accountName: account.accountName,
      savingsType: account.savingsType,
      targetAmount: account.targetAmount.toString(),
      description: account.description || '',
      goal: account.goal || '',
      targetDate: account.targetDate.split('T')[0],
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
    });
    setShowTransferDialog(true);
    handleMenuClose();
  };

  // Get savings type color
  const getSavingsTypeColor = (type: SavingsType): string => {
    const colors: Record<SavingsType, string> = {
      [SavingsType.EMERGENCY]: '#f44336',
      [SavingsType.VACATION]: '#2196f3',
      [SavingsType.INVESTMENT]: '#4caf50',
      [SavingsType.RETIREMENT]: '#ff9800',
      [SavingsType.EDUCATION]: '#9c27b0',
      [SavingsType.HOME_DOWN_PAYMENT]: '#795548',
      [SavingsType.CAR_PURCHASE]: '#607d8b',
      [SavingsType.WEDDING]: '#e91e63',
      [SavingsType.TRAVEL]: '#00bcd4',
      [SavingsType.BUSINESS]: '#3f51b5',
      [SavingsType.HEALTH]: '#8bc34a',
      [SavingsType.TAX_SAVINGS]: '#ffc107',
      [SavingsType.GENERAL]: '#9e9e9e',
    };
    return colors[type] || '#9e9e9e';
  };

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
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

      {/* Savings Accounts Grid */}
      <Grid container spacing={3}>
        {savingsAccounts.map((account) => (
          <Grid item xs={12} sm={6} md={4} key={account.id}>
            <Card sx={{ height: '100%', position: 'relative' }}>
              <CardContent>
                {/* Account Header */}
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box>
                    <Typography variant="h6" component="h3" gutterBottom>
                      {account.accountName}
                    </Typography>
                    <Chip
                      label={account.savingsType.replace('_', ' ')}
                      size="small"
                      sx={{
                        backgroundColor: getSavingsTypeColor(account.savingsType),
                        color: 'white',
                        fontWeight: 'bold',
                      }}
                    />
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, account)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </Box>

                {/* Progress Section */}
                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Progress
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {account.progressPercentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(account.progressPercentage, 100)}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: '#e0e0e0',
                      '& .MuiLinearProgress-bar': {
                        backgroundColor: getProgressColor(account.progressPercentage),
                      },
                    }}
                  />
                </Box>

                {/* Balance and Target */}
                <Box mb={2}>
                  <Typography variant="h5" color="primary" fontWeight="bold">
                    {formatCurrency(account.currentBalance)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    of {formatCurrency(account.targetAmount)} target
                  </Typography>
                </Box>

                {/* Goal Info */}
                {account.goal && (
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {account.goal}
                  </Typography>
                )}

                {/* Time and Monthly Target */}
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box display="flex" alignItems="center">
                    <ScheduleIcon sx={{ mr: 0.5, fontSize: 16, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {account.daysRemaining} days left
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {formatCurrency(account.monthlyTarget)}/month
                  </Typography>
                </Box>

                {/* Completion Badge */}
                {account.progressPercentage >= 100 && (
                  <Box
                    position="absolute"
                    top={16}
                    right={16}
                    sx={{
                      backgroundColor: '#4caf50',
                      color: 'white',
                      borderRadius: '50%',
                      width: 32,
                      height: 32,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CheckCircleIcon sx={{ fontSize: 20 }} />
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

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
        <MenuItem onClick={() => menuAccount && handleTransferClick(menuAccount)}>
          <AttachMoneyIcon sx={{ mr: 1 }} />
          Transfer Money
        </MenuItem>
        <Divider />
        <MenuItem 
          onClick={() => menuAccount && handleDeleteAccount(menuAccount.id)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} />
          Delete Account
        </MenuItem>
      </Menu>
    </Container>
  );
};

export default Savings;
