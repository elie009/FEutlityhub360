import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent, Alert,
  CircularProgress, Button, FormControl, InputLabel, Select, MenuItem,
  TextField, Chip, SelectChangeEvent, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, Tooltip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  ToggleButton, ToggleButtonGroup, TableSortLabel, Pagination,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Receipt, AttachMoney,
  Refresh, Clear, Category, AccountBalance, Link, Sync,
  HelpOutline, Visibility, ViewList, ViewModule,
  FilterList, FilterListOff, CloudUpload, Delete,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { apiService } from '../services/api';
import { BankAccountTransaction, TransactionFilters, TransactionAnalytics } from '../types/transaction';
import { BankAccountAnalytics } from '../types/bankAccount';
import { getErrorMessage } from '../utils/validation';
import TransactionCard from '../components/Transactions/TransactionCard';

const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [transactions, setTransactions] = useState<BankAccountTransaction[]>([]);
  const [analytics, setAnalytics] = useState<TransactionAnalytics | null>(null);
  const [bankAccountAnalytics, setBankAccountAnalytics] = useState<BankAccountAnalytics | null>(null);
  const [bankAccountSummary, setBankAccountSummary] = useState<{
    totalBalance: number;
    totalAccounts: number;
    activeAccounts: number;
    connectedAccounts: number;
    totalIncoming: number;
    totalOutgoing: number;
    accounts: any[];
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTransaction, setSelectedTransaction] = useState<BankAccountTransaction | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({
    limit: 10,
    page: 1,
  });
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [columnFilters, setColumnFilters] = useState({
    dateFrom: '',
    dateTo: '',
    description: '',
    category: '',
    transactionType: '',
    amountMin: '',
    amountMax: '',
  });
  const [sortField, setSortField] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

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
      const [transactionsResponse, analyticsData, bankAccountAnalyticsData, bankAccountSummaryData] = await Promise.all([
        apiService.getTransactions(filters),
        apiService.getTransactionAnalytics(),
        apiService.getBankAccountAnalyticsSummary(),
        apiService.getBankAccountSummary(),
      ]);

      setTransactions(transactionsResponse.data);
      setAnalytics(analyticsData);
      setBankAccountAnalytics(bankAccountAnalyticsData);
      setBankAccountSummary(bankAccountSummaryData);
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
    setColumnFilters({
      dateFrom: '',
      dateTo: '',
      description: '',
      category: '',
      transactionType: '',
      amountMin: '',
      amountMax: '',
    });
    setSortField('');
    setSortDirection('asc');
  };

  const handleColumnFilterChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    setColumnFilters(prev => ({
      ...prev,
      [field]: value,
    }));
    setFilters(prev => ({
      ...prev,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setFilters(prev => ({
      ...prev,
      page: page,
    }));
  };

  const handlePageSizeChange = (event: SelectChangeEvent<number>) => {
    setFilters(prev => ({
      ...prev,
      limit: event.target.value as number,
      page: 1, // Reset to first page when page size changes
    }));
  };

  const toggleFilters = () => {
    setShowFilters(prev => !prev);
  };

  const handleViewDetails = (transaction: BankAccountTransaction) => {
    setSelectedTransaction(transaction);
    setShowDetailsDialog(true);
  };

  const handleCloseDetails = () => {
    setSelectedTransaction(null);
    setShowDetailsDialog(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB in bytes
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    const validFiles: File[] = [];
    const errors: string[] = [];

    Array.from(files).forEach((file) => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        errors.push(`${file.name}: Only JPG and PNG files are allowed.`);
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File size exceeds 5 MB limit.`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setUploadError(errors.join(' '));
    }

    if (validFiles.length > 0) {
      setUploadedFiles((prev) => [...prev, ...validFiles]);
    }

    // Reset input
    event.target.value = '';
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    if (window.confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
      try {
        await apiService.deleteTransaction(transactionId);
        // Close the details dialog
        handleCloseDetails();
        // Reload transactions and analytics
        loadTransactionsAndAnalytics();
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to delete transaction'));
      }
    }
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
      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Recent Transactions
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, newMode) => newMode && setViewMode(newMode)}
            size="small"
            aria-label="view mode"
          >
            <ToggleButton value="cards" aria-label="card view">
              <ViewModule />
            </ToggleButton>
            <ToggleButton value="table" aria-label="table view">
              <ViewList />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {uploadError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setUploadError(null)}>
          {uploadError}
        </Alert>
      )}

      {/* Bank Account Transaction Analytics */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <AccountBalance sx={{ mr: 2, color: 'primary.main' }} />
          Bank Account Transaction
        </Typography>

        {/* 1st Row: Combined Account Overview & Money Flow - Uniform Width */}
        {(bankAccountSummary || bankAccountAnalytics) && (
          <Grid container spacing={1} sx={{ mb: 1.5 }}>
            <Grid item xs={4} sm={2.4} md={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <AttachMoney sx={{ fontSize: 18, color: 'success.main', mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.1, mb: 0.25 }}>
                      {bankAccountSummary ? formatCurrency(bankAccountSummary.totalBalance) : 
                       bankAccountAnalytics?.totalBalance !== undefined ? formatCurrency(bankAccountAnalytics.totalBalance) : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Total Balance
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4} sm={2.4} md={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <AccountBalance sx={{ fontSize: 18, color: 'info.main', mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.1, mb: 0.25 }}>
                      {bankAccountSummary ? bankAccountSummary.totalAccounts : 
                       bankAccountAnalytics?.totalAccounts || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Total Accounts
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4} sm={2.4} md={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Link sx={{ fontSize: 18, color: 'success.main', mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.1, mb: 0.25 }}>
                      {bankAccountSummary ? bankAccountSummary.activeAccounts : 
                       bankAccountAnalytics?.activeAccounts || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Active Accounts
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4} sm={2.4} md={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Sync sx={{ fontSize: 18, color: 'warning.main', mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.1, mb: 0.25 }}>
                      {bankAccountSummary ? bankAccountSummary.connectedAccounts : 
                       bankAccountAnalytics?.connectedAccounts || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Connected
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4} sm={2.4} md={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <AccountBalance sx={{ fontSize: 18, color: 'primary.main', mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.1, mb: 0.25 }}>
                      {bankAccountAnalytics?.accounts?.length || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Analytics
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4} sm={2.4} md={1.7}>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      What is "Total Incoming"?
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      • Total money flowing INTO all your bank accounts
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      • Includes: deposits, transfers in, income, refunds
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      • Shows your total money received across all accounts
                    </Typography>
                    <Typography variant="body2">
                      • Helps you understand your overall cash inflow
                    </Typography>
                  </Box>
                }
                arrow
                placement="top"
              >
                <Card sx={{ height: '100%', cursor: 'help', '&:hover': { boxShadow: 2 } }}>
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <TrendingUp sx={{ fontSize: 18, color: 'success.main', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.1, mb: 0.25 }}>
                        {bankAccountSummary ? formatCurrency(bankAccountSummary.totalIncoming) :
                         bankAccountAnalytics?.totalIncoming !== undefined ? formatCurrency(bankAccountAnalytics.totalIncoming) : 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        Total Incoming
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
            <Grid item xs={4} sm={2.4} md={1.7}>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      What is "Total Outgoing"?
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      • Total money flowing OUT of all your bank accounts
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      • Includes: all debits, payments, transfers, withdrawals
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      • Shows your total spending across all accounts
                    </Typography>
                    <Typography variant="body2">
                      • Helps you understand your overall cash outflow
                    </Typography>
                  </Box>
                }
                arrow
                placement="top"
              >
                <Card sx={{ height: '100%', cursor: 'help', '&:hover': { boxShadow: 2 } }}>
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <TrendingDown sx={{ fontSize: 18, color: 'error.main', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.1, mb: 0.25 }}>
                        {bankAccountSummary ? formatCurrency(bankAccountSummary.totalOutgoing) :
                         bankAccountAnalytics?.totalOutgoing !== undefined ? formatCurrency(bankAccountAnalytics.totalOutgoing) : 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        Total Outgoing
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
          </Grid>
        )}

        {/* 2nd Row: Transaction Analytics - Uniform Width */}
        {analytics && (
          <Grid container spacing={1}>
            <Grid item xs={4} sm={2.4} md={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Receipt sx={{ fontSize: 18, color: 'primary.main', mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.1, mb: 0.25 }}>
                      {analytics.totalTransactions || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Total Transactions
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4} sm={2.4} md={1.7}>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      What is "Transaction Incoming"?
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      • Money flowing INTO your accounts
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      • Includes: deposits, transfers in, income, refunds
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      • Shows total amount received/earned
                    </Typography>
                    <Typography variant="body2">
                      • Helps track your income and money received
                    </Typography>
                  </Box>
                }
                arrow
                placement="top"
              >
                <Card sx={{ height: '100%', cursor: 'help', '&:hover': { boxShadow: 2 } }}>
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <TrendingUp sx={{ fontSize: 18, color: 'success.main', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.1, mb: 0.25 }}>
                        {formatCurrency(analytics.totalIncoming || 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        Transaction Incoming
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
            <Grid item xs={4} sm={2.4} md={1.7}>
              <Tooltip
                title={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      What is "Transaction Outgoing"?
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      • Money flowing OUT of your accounts
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      • Includes: purchases, payments, transfers out, withdrawals
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5 }}>
                      • Shows total amount spent/paid out
                    </Typography>
                    <Typography variant="body2">
                      • Helps track your spending patterns
                    </Typography>
                  </Box>
                }
                arrow
                placement="top"
              >
                <Card sx={{ height: '100%', cursor: 'help', '&:hover': { boxShadow: 2 } }}>
                  <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <TrendingDown sx={{ fontSize: 18, color: 'error.main', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.1, mb: 0.25 }}>
                        {formatCurrency(analytics.totalOutgoing || 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                        Transaction Outgoing
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
            <Grid item xs={4} sm={2.4} md={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <AttachMoney sx={{ fontSize: 18, color: 'info.main', mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.1, mb: 0.25 }}>
                      {isNaN(analytics.averageTransactionAmount) || analytics.averageTransactionAmount === null || analytics.averageTransactionAmount === undefined
                        ? formatCurrency(0)
                        : formatCurrency(analytics.averageTransactionAmount)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Average Amount
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4} sm={2.4} md={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Category sx={{ fontSize: 18, color: 'warning.main', mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontSize: '0.9rem', fontWeight: 600, lineHeight: 1.1, mb: 0.25, textTransform: 'capitalize' }}>
                      {analytics.mostActiveCategory || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem' }}>
                      Top Category
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={4} sm={2.4} md={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 }, position: 'relative' }}>
                <Tooltip
                  title={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Upload receipts and let AI do the work! 📸✨
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1.5 }}>
                        Simply snap a photo or upload your receipt, and our advanced AI will automatically read, extract, and add all transaction details to your records. No more manual entry!
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        ✓ How it works:
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • Upload or capture receipt photo
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • AI extracts amount, date, merchant & category
                      </Typography>
                      <Typography variant="body2">
                        • Auto-adds to your transaction records
                      </Typography>
                    </Box>
                  }
                  arrow
                  placement="top"
                >
                  <IconButton
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      p: 0.5,
                      cursor: 'help',
                    }}
                  >
                    <HelpOutline sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </IconButton>
                </Tooltip>
                <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <CloudUpload sx={{ fontSize: 18, color: 'primary.main', mb: 0.5 }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.65rem', mb: 0.5 }}>
                      Upload Receipt
                    </Typography>
                    <input
                      accept="image/jpeg,image/jpg,image/png"
                      style={{ display: 'none' }}
                      id="image-upload-input"
                      multiple
                      type="file"
                      onChange={handleFileUpload}
                    />
                    <label htmlFor="image-upload-input">
                      <Button
                        component="span"
                        size="small"
                        variant="outlined"
                        sx={{ 
                          mt: 0.5,
                          fontSize: '0.7rem',
                          py: 0.25,
                          px: 1,
                          textTransform: 'none',
                        }}
                      >
                        Choose Files
                      </Button>
                    </label>
                    {uploadedFiles.length > 0 && (
                      <Box sx={{ mt: 1, width: '100%' }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.6rem', display: 'block', mb: 0.5 }}>
                          {uploadedFiles.length} file(s) uploaded
                        </Typography>
                        <Box sx={{ maxHeight: 60, overflowY: 'auto', width: '100%' }}>
                          {uploadedFiles.map((file, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                p: 0.25,
                                mb: 0.25,
                                bgcolor: 'action.hover',
                                borderRadius: 0.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: '0.6rem',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  flex: 1,
                                  textAlign: 'left',
                                }}
                                title={file.name}
                              >
                                {file.name}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveFile(index)}
                                sx={{ p: 0.25, ml: 0.5 }}
                              >
                                <Delete sx={{ fontSize: 12 }} />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}
      </Box>

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

        <Button
          variant="outlined"
          startIcon={showFilters ? <FilterListOff /> : <FilterList />}
          onClick={toggleFilters}
          size="small"
          color={showFilters ? "secondary" : "primary"}
        >
          {showFilters ? 'Hide Column Filters' : 'Show Column Filters'}
        </Button>
      </Box>

      {/* Transactions Display */}
      {transactions.length === 0 ? (
        <Card sx={{ height: '100%' }}>
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
      ) : viewMode === 'cards' ? (
        <Grid container spacing={2} sx={{ mt: 2 }}>
          {transactions.map((transaction) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={transaction.id}>
              <TransactionCard 
                transaction={transaction} 
                onViewDetails={handleViewDetails}
              />
            </Grid>
          ))}
        </Grid>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'transactionDate'}
                    direction={sortField === 'transactionDate' ? sortDirection : 'asc'}
                    onClick={() => handleSort('transactionDate')}
                  >
                    Date
                  </TableSortLabel>
                  {showFilters && (
                    <Box sx={{ mt: 1 }}>
                      <TextField
                        size="small"
                        placeholder="From"
                        value={columnFilters.dateFrom}
                        onChange={handleColumnFilterChange('dateFrom')}
                        type="date"
                        sx={{ width: '100%', mb: 0.5 }}
                        InputLabelProps={{ shrink: true }}
                      />
                      <TextField
                        size="small"
                        placeholder="To"
                        value={columnFilters.dateTo}
                        onChange={handleColumnFilterChange('dateTo')}
                        type="date"
                        sx={{ width: '100%' }}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'description'}
                    direction={sortField === 'description' ? sortDirection : 'asc'}
                    onClick={() => handleSort('description')}
                  >
                    Description
                  </TableSortLabel>
                  {showFilters && (
                    <Box sx={{ mt: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Search description"
                        value={columnFilters.description}
                        onChange={handleColumnFilterChange('description')}
                        sx={{ width: '100%' }}
                      />
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'category'}
                    direction={sortField === 'category' ? sortDirection : 'asc'}
                    onClick={() => handleSort('category')}
                  >
                    Category
                  </TableSortLabel>
                  {showFilters && (
                    <Box sx={{ mt: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Filter category"
                        value={columnFilters.category}
                        onChange={handleColumnFilterChange('category')}
                        sx={{ width: '100%' }}
                      />
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <TableSortLabel
                    active={sortField === 'transactionType'}
                    direction={sortField === 'transactionType' ? sortDirection : 'asc'}
                    onClick={() => handleSort('transactionType')}
                  >
                    Type
                  </TableSortLabel>
                  {showFilters && (
                    <Box sx={{ mt: 1 }}>
                      <FormControl size="small" sx={{ width: '100%' }}>
                        <Select
                          value={columnFilters.transactionType}
                          onChange={(e) => setColumnFilters(prev => ({ ...prev, transactionType: e.target.value }))}
                          displayEmpty
                        >
                          <MenuItem value="">All Types</MenuItem>
                          <MenuItem value="credit">Credit</MenuItem>
                          <MenuItem value="debit">Debit</MenuItem>
                          <MenuItem value="transfer">Transfer</MenuItem>
                        </Select>
                      </FormControl>
                    </Box>
                  )}
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'amount'}
                    direction={sortField === 'amount' ? sortDirection : 'asc'}
                    onClick={() => handleSort('amount')}
                  >
                    Amount
                  </TableSortLabel>
                  {showFilters && (
                    <Box sx={{ mt: 1 }}>
                      <TextField
                        size="small"
                        placeholder="Min"
                        value={columnFilters.amountMin}
                        onChange={handleColumnFilterChange('amountMin')}
                        type="number"
                        sx={{ width: '100%', mb: 0.5 }}
                      />
                      <TextField
                        size="small"
                        placeholder="Max"
                        value={columnFilters.amountMax}
                        onChange={handleColumnFilterChange('amountMax')}
                        type="number"
                        sx={{ width: '100%' }}
                      />
                    </Box>
                  )}
                </TableCell>
                <TableCell align="right">
                  <TableSortLabel
                    active={sortField === 'balanceAfterTransaction'}
                    direction={sortField === 'balanceAfterTransaction' ? sortDirection : 'asc'}
                    onClick={() => handleSort('balanceAfterTransaction')}
                  >
                    Balance After
                  </TableSortLabel>
                </TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} hover>
                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(transaction.transactionDate)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                        {transaction.description}
                      </Typography>
                      {transaction.merchant && (
                        <Typography variant="caption" color="text.secondary">
                          {transaction.merchant}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.category || 'Uncategorized'} 
                      color="primary"
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={transaction.transactionType} 
                      color={(transaction.transactionType === 'credit' || transaction.transactionType === 'CREDIT') ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: 'bold',
                        color: (transaction.transactionType === 'credit' || transaction.transactionType === 'CREDIT') ? 'success.main' : 'error.main'
                      }}
                    >
                      {(transaction.transactionType === 'credit' || transaction.transactionType === 'CREDIT') ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2">
                      {formatCurrency(transaction.balanceAfterTransaction)}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(transaction)}
                      sx={{ color: 'primary.main' }}
                    >
                      <Visibility />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination Controls */}
      {transactions.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 3, mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Rows per page:
            </Typography>
            <FormControl size="small" sx={{ minWidth: 80 }}>
              <Select
                value={filters.limit}
                onChange={handlePageSizeChange}
                displayEmpty
              >
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
                <MenuItem value={100}>100</MenuItem>
              </Select>
            </FormControl>
            <Typography variant="body2" color="text.secondary">
              Showing {((filters.page || 1) - 1) * (filters.limit || 10) + 1} to {Math.min((filters.page || 1) * (filters.limit || 10), transactions.length)} of {transactions.length} transactions
            </Typography>
          </Box>
          <Pagination
            count={Math.ceil(transactions.length / (filters.limit || 10))}
            page={filters.page || 1}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
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
                    {formatCurrency(Math.abs(selectedTransaction.amount))}
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
                    label={selectedTransaction.category || 'Uncategorized'} 
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
                    {formatCurrency(selectedTransaction.balanceAfterTransaction)}
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
          <Button 
            onClick={() => selectedTransaction && handleDeleteTransaction(selectedTransaction.id)}
            color="error"
            variant="outlined"
          >
            Delete Transaction
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TransactionsPage;
