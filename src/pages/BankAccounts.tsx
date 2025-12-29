import React, { useState, useEffect, useCallback } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent, Alert,
  Button, FormControl, InputLabel, Select, MenuItem,
  SelectChangeEvent, Dialog, DialogTitle, DialogContent, DialogActions,
  Skeleton, IconButton, Accordion, AccordionSummary, AccordionDetails,
  Chip, Tooltip, LinearProgress, Stepper, Step, StepLabel, StepContent,
  Paper, Divider, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import {
  Add as AddIcon, Delete as DeleteIcon, Receipt as ReceiptIcon,
  Info as InfoIcon, Close as CloseIcon, HelpOutline as HelpIcon,
  ExpandMore as ExpandMoreIcon, CheckCircle as CheckCircleIcon,
  School as SchoolIcon, Lightbulb as LightbulbIcon,
  TrendingUp as TrendingUpIcon, AccountBalance as AccountBalanceIcon,
  ViewModule as ViewModuleIcon, TableChart as TableChartIcon,
  Edit as EditIcon, Sync as SyncIcon, Link as LinkIcon,
  LinkOff as LinkOffIcon, CompareArrows as ReconcileIcon,
  Lock as LockIcon, Warning as WarningIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { apiService } from '../services/api';
import { BankAccount, BankAccountFilters } from '../types/bankAccount';
import { getErrorMessage } from '../utils/validation';
import { useNavigate } from 'react-router-dom';
import BankAccountCard from '../components/BankAccounts/BankAccountCard';
import BankAccountForm from '../components/BankAccounts/BankAccountForm';
import TransactionForm from '../components/BankAccounts/TransactionForm';
import BankAccountTransactionsModal from '../components/BankAccounts/BankAccountTransactionsModal';
import ReconciliationGuide from '../components/BankAccounts/ReconciliationGuide';
import CloseMonthDialog from '../components/BankAccounts/CloseMonthDialog';
import PlaidLinkDialog from '../components/BankAccounts/PlaidLinkDialog';

const BankAccounts: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  
  // Bank Account Management State
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showBankAccountForm, setShowBankAccountForm] = useState(false);
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [showPlaidLinkDialog, setShowPlaidLinkDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | undefined>(undefined);
  const [accountForTransactions, setAccountForTransactions] = useState<BankAccount | null>(null);
  const [filters, setFilters] = useState<BankAccountFilters>({});
  const [showHelpSection, setShowHelpSection] = useState(false);
  const [showReconciliationGuide, setShowReconciliationGuide] = useState(false);
  const [accountForReconciliation, setAccountForReconciliation] = useState<BankAccount | null>(null);
  const [showCloseMonthDialog, setShowCloseMonthDialog] = useState(false);
  const [accountForCloseMonth, setAccountForCloseMonth] = useState<BankAccount | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

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

  const handleConnectBankAccount = async (account: BankAccount) => {
    setSelectedAccount(account);
    setShowPlaidLinkDialog(true);
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

  const handleReconcile = (account: BankAccount) => {
    setAccountForReconciliation(account);
    setShowReconciliationGuide(true);
  };

  const handleCloseMonth = (account: BankAccount) => {
    setAccountForCloseMonth(account);
    setShowCloseMonthDialog(true);
  };

  const handleMonthClosed = () => {
    // Reload accounts if needed
    loadBankAccounts();
  };

  const handleStartReconciliation = () => {
    if (accountForReconciliation) {
      navigate('/reconciliation', { state: { accountId: accountForReconciliation.id } });
    }
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

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    newViewMode: 'cards' | 'table' | null,
  ) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getAccountTypeLabel = (type: string): string => {
    switch (type) {
      case 'checking': return 'Checking';
      case 'savings': return 'Savings';
      case 'credit_card': return 'Credit Card';
      case 'investment': return 'Investment';
      case 'bank': return 'Bank';
      default: return type;
    }
  };

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom>
            Bank Account Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage all your bank accounts, credit cards, and investments in one place
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Tooltip title="Get help and learn how to use bank account features">
            <Button
              variant="outlined"
              startIcon={<HelpIcon />}
              onClick={() => setShowHelpSection(!showHelpSection)}
            >
              Help
            </Button>
          </Tooltip>
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
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => setError('')}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          <Typography variant="body2" fontWeight="medium" gutterBottom>
            {error}
          </Typography>
          {error.includes('Failed to') && (
            <Typography variant="caption" component="div" sx={{ mt: 1 }}>
              <strong>What to try:</strong>
              <ul style={{ margin: '4px 0', paddingLeft: 20 }}>
                <li>Check your internet connection</li>
                <li>Refresh the page and try again</li>
                <li>If the problem persists, contact support</li>
              </ul>
            </Typography>
          )}
        </Alert>
      )}

      {/* Help Section */}
      {showHelpSection && (
        <Card sx={{ mb: 3, bgcolor: 'background.paper' }}>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <SchoolIcon color="primary" />
              <Typography variant="h6">Help & Learning Center</Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" fontWeight="medium">
                      <LightbulbIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                      Quick Start Guide
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" component="div">
                      <strong>Getting Started:</strong>
                      <ol style={{ margin: '8px 0', paddingLeft: 20 }}>
                        <li>Click "Add Bank Account" to create your first account</li>
                        <li>Enter a friendly name and your current balance</li>
                        <li>Optionally add bank details for better tracking</li>
                        <li>Start adding transactions to track your money</li>
                      </ol>
                      <strong>Pro Tip:</strong> You can enter just the last 4 digits of account numbers for privacy.
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" fontWeight="medium">
                      <AccountBalanceIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                      Common Scenarios
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography variant="body2" component="div" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Chip 
                        label="Adding a Checking Account" 
                        size="small" 
                        icon={<CheckCircleIcon />}
                        sx={{ justifyContent: 'flex-start', width: 'fit-content' }}
                      />
                      <Typography variant="caption" sx={{ ml: 4 }}>
                        Name: "My Primary Checking", Type: Checking, Balance: Your current balance
                      </Typography>
                      
                      <Chip 
                        label="Tracking a Credit Card" 
                        size="small" 
                        icon={<CheckCircleIcon />}
                        sx={{ justifyContent: 'flex-start', width: 'fit-content' }}
                      />
                      <Typography variant="caption" sx={{ ml: 4 }}>
                        Name: "Chase Sapphire", Type: Credit Card, Balance: Current balance (negative = debt)
                      </Typography>
                      
                      <Chip 
                        label="Setting Up Savings" 
                        size="small" 
                        icon={<CheckCircleIcon />}
                        sx={{ justifyContent: 'flex-start', width: 'fit-content' }}
                      />
                      <Typography variant="caption" sx={{ ml: 4 }}>
                        Name: "Emergency Fund", Type: Savings, Balance: Your savings amount
                      </Typography>
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </Grid>
              
              <Grid item xs={12}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="subtitle2" fontWeight="medium">
                      <TrendingUpIcon sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
                      Understanding Account Features
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                          Account Types:
                        </Typography>
                        <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                          • <strong>Checking:</strong> Daily transactions and bill payments<br/>
                          • <strong>Savings:</strong> Money storage and interest earning<br/>
                          • <strong>Credit Card:</strong> Tracks debt and payments<br/>
                          • <strong>Investment:</strong> Stocks, bonds, and investments
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" fontWeight="medium" gutterBottom>
                          Key Features:
                        </Typography>
                        <Typography variant="body2" component="div" sx={{ pl: 2 }}>
                          • <strong>Match with Bank Statement:</strong> Match transactions with bank statements to keep everything accurate<br/>
                          • <strong>Sync:</strong> Automatically import transactions (when connected)<br/>
                          • <strong>Categories:</strong> Organize transactions by type<br/>
                          • <strong>Reports:</strong> View spending and income analytics
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Loading Progress Indicator */}
      {isLoading && (
        <Box sx={{ mb: 2 }}>
          <LinearProgress />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
            Loading bank accounts...
          </Typography>
        </Box>
      )}

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
        <Tooltip title="Filter accounts by type (Checking, Savings, Credit Card, etc.)">
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
        </Tooltip>
        <Tooltip title="Show only active accounts (currently in use) or inactive accounts (archived)">
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
        </Tooltip>
        <Tooltip title="Filter by bank connection status. Connected accounts can sync transactions automatically">
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
        </Tooltip>
        <Tooltip title="Reset all filters to show all accounts">
          <Button
            variant="outlined"
            size="small"
            onClick={handleClearFilters}
            startIcon={<DeleteIcon />}
          >
            Clear Filters
          </Button>
        </Tooltip>
        <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="body2" color="text.secondary">
            View:
          </Typography>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            size="small"
            aria-label="view mode"
          >
            <ToggleButton value="cards" aria-label="cards view">
              <Tooltip title="Card view">
                <ViewModuleIcon />
              </Tooltip>
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <Tooltip title="Table view">
                <TableChartIcon />
              </Tooltip>
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
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
          <AccountBalanceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Bank Accounts Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Add your first bank account to start managing your finances.
          </Typography>
          
          {/* Guided Steps */}
          <Paper sx={{ p: 3, mt: 3, mb: 3, bgcolor: 'background.default', textAlign: 'left', maxWidth: 600, mx: 'auto' }}>
            <Typography variant="subtitle2" fontWeight="medium" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LightbulbIcon color="primary" />
              Quick Start Guide
            </Typography>
            <Stepper orientation="vertical" sx={{ mt: 2 }}>
              <Step active={true}>
                <StepLabel>
                  <Typography variant="body2" fontWeight="medium">Add Your First Account</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Click "Add Bank Account" below. You'll need:
                    <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                      <li>Account name (e.g., "My Checking Account")</li>
                      <li>Account type (Checking, Savings, etc.)</li>
                      <li>Current balance</li>
                    </ul>
                  </Typography>
                </StepContent>
              </Step>
              <Step active={true}>
                <StepLabel>
                  <Typography variant="body2" fontWeight="medium">Add Transactions</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Once you have an account, you can start adding transactions to track your income and expenses.
                  </Typography>
                </StepContent>
              </Step>
              <Step active={true}>
                <StepLabel>
                  <Typography variant="body2" fontWeight="medium">Reconcile & Review</Typography>
                </StepLabel>
                <StepContent>
                  <Typography variant="body2" color="text.secondary">
                    Use the "Match with Bank Statement" feature to match your transactions with bank statements and keep everything accurate.
                  </Typography>
                </StepContent>
              </Step>
            </Stepper>
          </Paper>
          
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={handleCreateBankAccount}
            >
              Add Bank Account
            </Button>
            <Button
              variant="outlined"
              startIcon={<HelpIcon />}
              onClick={() => setShowHelpSection(true)}
            >
              Learn More
            </Button>
          </Box>
        </Card>
      ) : viewMode === 'cards' ? (
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
                onReconcile={handleReconcile}
                onCloseMonth={handleCloseMonth}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Account Name</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Connection</TableCell>
                <TableCell align="right">Balance</TableCell>
                <TableCell>Transactions</TableCell>
                <TableCell>Updated</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(bankAccounts) && bankAccounts.map((account) => (
                <TableRow key={account.id} hover>
                  <TableCell>
                    <Typography variant="body2" fontWeight="medium">
                      {account.accountName}
                    </Typography>
                    {account.description && (
                      <Typography variant="caption" color="text.secondary">
                        {account.description}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={getAccountTypeLabel(account.accountType)}
                      size="small"
                      color={
                        account.accountType === 'checking' ? 'primary' :
                        account.accountType === 'savings' ? 'success' :
                        account.accountType === 'credit_card' ? 'error' :
                        account.accountType === 'investment' ? 'info' : 'default'
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={account.isActive ? 'Active' : 'Inactive'}
                      size="small"
                      color={account.isActive ? 'success' : 'warning'}
                      icon={account.isActive ? <CheckCircleIcon sx={{ fontSize: 16 }} /> : <WarningIcon sx={{ fontSize: 16 }} />}
                    />
                  </TableCell>
                  <TableCell>
                    {account.isConnected ? (
                      <Chip
                        label="Connected"
                        size="small"
                        color="info"
                        icon={<LinkIcon sx={{ fontSize: 16 }} />}
                      />
                    ) : (
                      <Chip
                        label="Manual"
                        size="small"
                        variant="outlined"
                        icon={<LinkOffIcon sx={{ fontSize: 16 }} />}
                      />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight="bold"
                      color={account.currentBalance >= 0 ? 'success.main' : 'error.main'}
                    >
                      {formatCurrency(account.currentBalance, { currencyCode: account.currency })}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {account.transactionCount}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(account.updatedAt)}
                    </Typography>
                    {account.lastSyncedAt && (
                      <Typography variant="caption" color="text.secondary" display="block">
                        Synced: {formatDate(account.lastSyncedAt)}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                      <Tooltip title="Edit account">
                        <IconButton
                          size="small"
                          onClick={() => handleEditBankAccount(account)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View transactions">
                        <IconButton
                          size="small"
                          onClick={() => handleViewTransactions(account)}
                        >
                          <ReceiptIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {account.isConnected ? (
                        <>
                          <Tooltip title="Sync now">
                            <IconButton
                              size="small"
                              onClick={() => handleSyncBankAccount(account.id)}
                            >
                              <SyncIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Disconnect">
                            <IconButton
                              size="small"
                              color="warning"
                              onClick={() => handleDisconnectBankAccount(account.id)}
                            >
                              <LinkOffIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </>
                      ) : (
                        <Tooltip title="Connect">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handleConnectBankAccount(account)}
                          >
                            <LinkIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Reconcile">
                        <IconButton
                          size="small"
                          color="secondary"
                          onClick={() => handleReconcile(account)}
                        >
                          <ReconcileIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Close month">
                        <IconButton
                          size="small"
                          color="warning"
                          onClick={() => handleCloseMonth(account)}
                        >
                          <LockIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete account">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDeleteBankAccount(account.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
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
        onBalanceRecalculated={loadBankAccounts}
      />

      {/* Reconciliation Guide Dialog */}
      <ReconciliationGuide
        open={showReconciliationGuide}
        onClose={() => {
          setShowReconciliationGuide(false);
          setAccountForReconciliation(null);
        }}
        onStartReconciliation={handleStartReconciliation}
      />

      {/* Plaid Link Dialog */}
      <PlaidLinkDialog
        open={showPlaidLinkDialog}
        onClose={() => {
          setShowPlaidLinkDialog(false);
          setSelectedAccount(undefined);
        }}
        onSuccess={() => {
          loadBankAccounts();
        }}
        bankAccount={selectedAccount || null}
      />

      {/* Close Month Dialog */}
      <CloseMonthDialog
        open={showCloseMonthDialog}
        onClose={() => {
          setShowCloseMonthDialog(false);
          setAccountForCloseMonth(null);
        }}
        account={accountForCloseMonth}
        onMonthClosed={handleMonthClosed}
      />
    </Container>
  );
};

export default BankAccounts;
