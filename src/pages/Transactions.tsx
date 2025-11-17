import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent, Alert,
  Button, FormControl, InputLabel, Select, MenuItem,
  TextField, Chip, SelectChangeEvent, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, Tooltip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  ToggleButton, ToggleButtonGroup, TableSortLabel, Pagination,
  Skeleton, CircularProgress, useTheme, useMediaQuery,
  Radio, RadioGroup, FormControlLabel, FormLabel,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Receipt, AttachMoney,
  Refresh, Clear, Category, AccountBalance, Link, Sync,
  HelpOutline, Visibility, ViewList, ViewModule,
  FilterList, FilterListOff, CloudUpload, Delete,
  ContentPaste, AutoAwesome,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { apiService } from '../services/api';
import { BankAccountTransaction, TransactionFilters, TransactionAnalytics } from '../types/transaction';
import { BankAccountAnalytics, BankAccount } from '../types/bankAccount';
import { Bill, BillStatus } from '../types/bill';
import { Loan, LoanStatus } from '../types/loan';
import { SavingsAccount } from '../types/savings';
import { getErrorMessage } from '../utils/validation';
import TransactionCard from '../components/Transactions/TransactionCard';

const TransactionsPage: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
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
  // Default to cards view on mobile for better UX
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(isMobile ? 'cards' : 'table');
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
  const [showAnalyzerDialog, setShowAnalyzerDialog] = useState(false);
  const [transactionText, setTransactionText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);
  const [analyzerSuccess, setAnalyzerSuccess] = useState<string | null>(null);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('');
  const [isLoadingBankAccounts, setIsLoadingBankAccounts] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [selectedBillId, setSelectedBillId] = useState<string>('');
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [selectedSavingsAccountId, setSelectedSavingsAccountId] = useState<string>('');
  const [isLoadingLinkedData, setIsLoadingLinkedData] = useState(false);
  const [transactionLinkType, setTransactionLinkType] = useState<'none' | 'bill' | 'loan' | 'savings'>('none');

  useEffect(() => {
    if (user?.id) {
      loadTransactionsAndAnalytics();
    }
  }, [user?.id, filters]);

  useEffect(() => {
    if (showAnalyzerDialog) {
      loadBankAccounts();
      loadLinkedData();
    }
  }, [showAnalyzerDialog, user?.id]);

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

  const loadBankAccounts = async () => {
    setIsLoadingBankAccounts(true);
    try {
      const accounts = await apiService.getUserBankAccounts();
      setBankAccounts(accounts);
    } catch (err) {
      console.error('Failed to load bank accounts:', err);
    } finally {
      setIsLoadingBankAccounts(false);
    }
  };

  const loadLinkedData = async () => {
    setIsLoadingLinkedData(true);
    try {
      const [billsResponse, loansData, savingsResponse] = await Promise.all([
        apiService.getUserBills(),
        user?.id ? apiService.getUserLoans(user.id) : Promise.resolve([]),
        apiService.getSavingsAccounts({ isActive: true }),
      ]);

      // Filter active bills (PENDING or OVERDUE)
      const activeBills = billsResponse.data.filter(
        (bill: Bill) => bill.status === BillStatus.PENDING || bill.status === BillStatus.OVERDUE
      );
      setBills(activeBills);

      // Filter active loans
      const activeLoans = loansData.filter((loan: Loan) => loan.status === LoanStatus.ACTIVE);
      setLoans(activeLoans);

      // Handle savings accounts response structure (can be array or object with data property)
      const savingsData = Array.isArray(savingsResponse) 
        ? savingsResponse 
        : (savingsResponse?.data || []);
      
      // Filter active savings accounts (already filtered by API, but double-check)
      const activeSavings = savingsData.filter(
        (account: SavingsAccount) => account.isActive
      );
      setSavingsAccounts(activeSavings);
    } catch (err) {
      console.error('Failed to load linked data:', err);
    } finally {
      setIsLoadingLinkedData(false);
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
        {/* Header Skeleton */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Skeleton variant="text" width={250} height={40} />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width={120} height={40} sx={{ borderRadius: 1 }} />
          </Box>
        </Box>

        {/* Analytics Cards Skeleton */}
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={32} sx={{ mb: 3 }} />
          <Grid container spacing={1} sx={{ mb: 1.5 }}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Grid item xs={4} sm={2.4} md={1.7} key={i}>
                <Card>
                  <CardContent sx={{ p: 1 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Skeleton variant="circular" width={18} height={18} sx={{ mb: 0.5 }} />
                      <Skeleton variant="text" width="80%" height={24} sx={{ mb: 0.25 }} />
                      <Skeleton variant="text" width="60%" height={16} />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Top Category Section Skeleton */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Skeleton variant="text" width="60%" height={28} sx={{ mb: 2 }} />
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} variant="rectangular" width={100} height={32} sx={{ borderRadius: 2 }} />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Transactions Table Skeleton */}
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Skeleton variant="text" width={200} height={28} />
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Skeleton variant="rectangular" width={40} height={40} sx={{ borderRadius: 1 }} />
                <Skeleton variant="rectangular" width={100} height={40} sx={{ borderRadius: 1 }} />
              </Box>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    <TableCell><Skeleton variant="text" width={80} /></TableCell>
                    <TableCell><Skeleton variant="text" width={60} /></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="text" width={150} /></TableCell>
                      <TableCell><Skeleton variant="text" width={80} /></TableCell>
                      <TableCell><Skeleton variant="text" width={60} /></TableCell>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="text" width={80} /></TableCell>
                      <TableCell><Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ mt: { xs: 1, sm: 4 }, mb: { xs: 2, sm: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'center' }, 
        mb: { xs: 2, sm: 4 },
        gap: { xs: 1.5, sm: 0 }
      }}>
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.25rem', sm: '2rem' }, 
            mb: { xs: 0, sm: 0 },
            fontWeight: { xs: 600, sm: 400 }
          }}
        >
          Recent Transactions
        </Typography>
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 0.75, sm: 2 }, 
          alignItems: 'center',
          flexWrap: 'wrap',
          width: { xs: '100%', sm: 'auto' }
        }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AutoAwesome />}
            onClick={() => setShowAnalyzerDialog(true)}
            size={isMobile ? 'small' : 'medium'}
            sx={{ 
              mr: { xs: 0, sm: 1 },
              flex: { xs: '1 1 auto', sm: '0 0 auto' },
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              py: { xs: 0.75, sm: 1 },
              px: { xs: 1.5, sm: 2 }
            }}
          >
            {isMobile ? 'Analyzer' : 'Transaction Analyzer'}
          </Button>
          {!isMobile && (
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
          )}
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
            size={isMobile ? 'small' : 'medium'}
            sx={{ 
              fontSize: { xs: '0.7rem', sm: '0.875rem' },
              minWidth: { xs: 'auto', sm: 100 },
              px: { xs: 1, sm: 2 }
            }}
          >
            {isMobile ? '' : 'Refresh'}
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

      {analyzerError && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setAnalyzerError(null)}>
          {analyzerError}
        </Alert>
      )}

      {analyzerSuccess && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setAnalyzerSuccess(null)}>
          {analyzerSuccess}
        </Alert>
      )}

      {/* Bank Account Transaction Analytics */}
      <Box sx={{ mb: { xs: 2, sm: 4 } }}>
        <Typography 
          variant="h5" 
          gutterBottom 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            mb: { xs: 1.5, sm: 3 },
            fontSize: { xs: '1.1rem', sm: '1.5rem' },
            fontWeight: { xs: 600, sm: 400 }
          }}
        >
          <AccountBalance sx={{ mr: { xs: 0.75, sm: 2 }, color: 'primary.main', fontSize: { xs: '1.1rem', sm: '1.5rem' } }} />
          {isMobile ? 'Bank Transactions' : 'Bank Account Transaction'}
        </Typography>

        {/* 1st Row: Combined Account Overview & Money Flow - Uniform Width */}
        {(bankAccountSummary || bankAccountAnalytics) && (
          <Grid container spacing={{ xs: 1, sm: 1.5 }} sx={{ mb: 1.5 }}>
            <Grid item xs={6} sm={3} md={2.4} lg={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <AttachMoney sx={{ fontSize: { xs: 20, sm: 18 }, color: 'success.main', mb: { xs: 0.5, sm: 0.5 } }} />
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 600, lineHeight: 1.2, mb: 0.25 }}>
                      {bankAccountSummary ? formatCurrency(bankAccountSummary.totalBalance) : 
                       bankAccountAnalytics?.totalBalance !== undefined ? formatCurrency(bankAccountAnalytics.totalBalance) : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.65rem' }, textAlign: 'center' }}>
                      Total Balance
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3} md={2.4} lg={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <AccountBalance sx={{ fontSize: { xs: 20, sm: 18 }, color: 'info.main', mb: { xs: 0.5, sm: 0.5 } }} />
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 600, lineHeight: 1.2, mb: 0.25 }}>
                      {bankAccountSummary ? bankAccountSummary.totalAccounts : 
                       bankAccountAnalytics?.totalAccounts || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.65rem' }, textAlign: 'center' }}>
                      Total Accounts
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3} md={2.4} lg={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <AccountBalance sx={{ fontSize: { xs: 20, sm: 18 }, color: 'info.main', mb: { xs: 0.5, sm: 0.5 } }} />
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 600, lineHeight: 1.2, mb: 0.25 }}>
                      {bankAccountSummary ? bankAccountSummary.activeAccounts : 
                       bankAccountAnalytics?.activeAccounts || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>
                      Active Accounts
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3} md={2.4} lg={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Sync sx={{ fontSize: { xs: 16, sm: 18 }, color: 'warning.main', mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.75rem', sm: '0.9rem' }, fontWeight: 600, lineHeight: 1.1, mb: 0.25 }}>
                      {bankAccountSummary ? bankAccountSummary.connectedAccounts : 
                       bankAccountAnalytics?.connectedAccounts || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>
                      Connected
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3} md={2.4} lg={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: 1, '&:last-child': { pb: 1 } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <AccountBalance sx={{ fontSize: 18, color: 'primary.main', mb: 0.5 }} />
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.75rem', sm: '0.9rem' }, fontWeight: 600, lineHeight: 1.1, mb: 0.25 }}>
                      {bankAccountAnalytics?.accounts?.length || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.6rem', sm: '0.65rem' } }}>
                      Analytics
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3} md={2.4} lg={1.7}>
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
                  <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <TrendingUp sx={{ fontSize: { xs: 20, sm: 18 }, color: 'success.main', mb: { xs: 0.5, sm: 0.5 } }} />
                      <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 600, lineHeight: 1.2, mb: 0.25 }}>
                        {bankAccountSummary ? formatCurrency(bankAccountSummary.totalIncoming) :
                         bankAccountAnalytics?.totalIncoming !== undefined ? formatCurrency(bankAccountAnalytics.totalIncoming) : 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.65rem' }, textAlign: 'center' }}>
                        Total Incoming
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
            <Grid item xs={6} sm={3} md={2.4} lg={1.7}>
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
                  <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <TrendingDown sx={{ fontSize: { xs: 20, sm: 18 }, color: 'error.main', mb: { xs: 0.5, sm: 0.5 } }} />
                      <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 600, lineHeight: 1.2, mb: 0.25 }}>
                        {bankAccountSummary ? formatCurrency(bankAccountSummary.totalOutgoing) :
                         bankAccountAnalytics?.totalOutgoing !== undefined ? formatCurrency(bankAccountAnalytics.totalOutgoing) : 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.65rem' }, textAlign: 'center' }}>
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
          <Grid container spacing={{ xs: 1, sm: 1.5 }}>
            <Grid item xs={6} sm={3} md={2.4} lg={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Receipt sx={{ fontSize: { xs: 20, sm: 18 }, color: 'primary.main', mb: { xs: 0.5, sm: 0.5 } }} />
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 600, lineHeight: 1.2, mb: 0.25 }}>
                      {analytics.totalTransactions || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.65rem' }, textAlign: 'center' }}>
                      Total Transactions
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3} md={2.4} lg={1.7}>
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
                  <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <TrendingUp sx={{ fontSize: { xs: 20, sm: 18 }, color: 'success.main', mb: { xs: 0.5, sm: 0.5 } }} />
                      <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 600, lineHeight: 1.2, mb: 0.25 }}>
                        {formatCurrency(analytics.totalIncoming || 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.65rem' }, textAlign: 'center' }}>
                        Transaction Incoming
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
            <Grid item xs={6} sm={3} md={2.4} lg={1.7}>
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
                  <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                      <TrendingDown sx={{ fontSize: { xs: 20, sm: 18 }, color: 'error.main', mb: { xs: 0.5, sm: 0.5 } }} />
                      <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 600, lineHeight: 1.2, mb: 0.25 }}>
                        {formatCurrency(analytics.totalOutgoing || 0)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.65rem' }, textAlign: 'center' }}>
                        Transaction Outgoing
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Tooltip>
            </Grid>
            <Grid item xs={6} sm={3} md={2.4} lg={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <AttachMoney sx={{ fontSize: { xs: 20, sm: 18 }, color: 'info.main', mb: { xs: 0.5, sm: 0.5 } }} />
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 600, lineHeight: 1.2, mb: 0.25 }}>
                      {isNaN(analytics.averageTransactionAmount) || analytics.averageTransactionAmount === null || analytics.averageTransactionAmount === undefined
                        ? formatCurrency(0)
                        : formatCurrency(analytics.averageTransactionAmount)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.65rem' }, textAlign: 'center' }}>
                      Average Amount
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3} md={2.4} lg={1.7}>
              <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Category sx={{ fontSize: { xs: 20, sm: 18 }, color: 'warning.main', mb: { xs: 0.5, sm: 0.5 } }} />
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 600, lineHeight: 1.2, mb: 0.25, textTransform: 'capitalize' }}>
                      {analytics.mostActiveCategory || 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.65rem', sm: '0.65rem' }, textAlign: 'center' }}>
                      Top Category
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={6} sm={3} md={2.4} lg={1.7}>
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
                    <CloudUpload sx={{ fontSize: { xs: 16, sm: 18 }, color: 'primary.main', mb: 0.5 }} />
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
      <Box sx={{ 
        display: 'flex', 
        gap: { xs: 1, sm: 2 }, 
        mb: { xs: 2, sm: 3 }, 
        flexWrap: 'wrap', 
        alignItems: 'center',
        '& > *': {
          flex: { xs: '1 1 calc(50% - 8px)', sm: '0 0 auto' },
          minWidth: { xs: 'calc(50% - 8px)', sm: 'auto' }
        }
      }}>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
          <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Transaction Type</InputLabel>
          <Select
            value={filters.transactionType || ''}
            label="Transaction Type"
            onChange={handleSelectChange('transactionType')}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            <MenuItem value="" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>All Types</MenuItem>
            <MenuItem value="credit" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Credit</MenuItem>
            <MenuItem value="debit" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Debit</MenuItem>
            <MenuItem value="transfer" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Transfer</MenuItem>
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 150 } }}>
          <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Category</InputLabel>
          <Select
            value={filters.category || ''}
            label="Category"
            onChange={handleSelectChange('category')}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            <MenuItem value="" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>All Categories</MenuItem>
            <MenuItem value="food" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Food</MenuItem>
            <MenuItem value="utilities" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Utilities</MenuItem>
            <MenuItem value="transportation" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Transportation</MenuItem>
            <MenuItem value="income" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Income</MenuItem>
            <MenuItem value="interest" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Interest</MenuItem>
            <MenuItem value="dividend" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Dividend</MenuItem>
            <MenuItem value="payment" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Payment</MenuItem>
            <MenuItem value="cash" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Cash</MenuItem>
          </Select>
        </FormControl>

        <TextField
          size="small"
          label="Limit"
          type="number"
          value={filters.limit || 10}
          onChange={handleInputChange('limit')}
          sx={{ 
            width: { xs: '100%', sm: 100 },
            '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } },
            '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } }
          }}
          inputProps={{ min: 1, max: 100 }}
        />

        <Button
          variant="outlined"
          startIcon={<Clear />}
          onClick={handleClearFilters}
          size="small"
          sx={{ 
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            py: { xs: 0.75, sm: 1 }
          }}
        >
          {isMobile ? 'Clear' : 'Clear Filters'}
        </Button>

        {!isMobile && (
          <Button
            variant="outlined"
            startIcon={showFilters ? <FilterListOff /> : <FilterList />}
            onClick={toggleFilters}
            size="small"
            color={showFilters ? "secondary" : "primary"}
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            {showFilters ? 'Hide Column Filters' : 'Show Column Filters'}
          </Button>
        )}
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
      ) : (
        <>
          {/* Cards view - shown on mobile and when cards mode is selected */}
          <Box sx={{ display: { xs: 'block', sm: viewMode === 'cards' ? 'block' : 'none' } }}>
            <Grid container spacing={{ xs: 1.5, sm: 2 }} sx={{ mt: { xs: 1, sm: 2 } }}>
              {transactions.map((transaction) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={transaction.id}>
                  <TransactionCard 
                    transaction={transaction} 
                    onViewDetails={handleViewDetails}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          
          {/* Table view - hidden on mobile, shown on desktop when table mode is selected */}
          <Box sx={{ display: { xs: 'none', sm: viewMode === 'table' ? 'block' : 'none' } }}>
        <TableContainer 
          component={Paper} 
          sx={{ 
            mt: 2,
            maxWidth: '100%',
            overflowX: 'auto',
            // On mobile, force cards view instead of table
            display: { xs: 'none', sm: 'block' },
            '& .MuiTable-root': {
              minWidth: 'auto',
            }
          }}
        >
          <Table stickyHeader>
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
                <TableCell sx={{ width: '120px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    Account
                  </Typography>
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
                  <TableCell sx={{ width: '120px' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                      {transaction.accountName || 'N/A'}
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
          </Box>
        </>
      )}

      {/* Pagination Controls */}
      {transactions.length > 0 && (
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'flex-start', sm: 'center' }, 
          mt: { xs: 2, sm: 3 }, 
          mb: 2,
          gap: { xs: 2, sm: 0 }
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            gap: { xs: 1, sm: 2 },
            width: { xs: '100%', sm: 'auto' }
          }}>
            {!isMobile && (
              <>
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
              </>
            )}
            {isMobile && (
              <Box sx={{ width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.75rem' }}>
                    Rows:
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 70 }}>
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
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                  {((filters.page || 1) - 1) * (filters.limit || 10) + 1}-{Math.min((filters.page || 1) * (filters.limit || 10), transactions.length)} of {transactions.length}
                </Typography>
              </Box>
            )}
          </Box>
          <Pagination
            count={Math.ceil(transactions.length / (filters.limit || 10))}
            page={filters.page || 1}
            onChange={handlePageChange}
            color="primary"
            showFirstButton={!isMobile}
            showLastButton={!isMobile}
            size={isMobile ? 'small' : 'medium'}
          />
        </Box>
      )}

      {/* Transaction Analyzer Dialog */}
      <Dialog
        open={showAnalyzerDialog}
        onClose={() => {
          setShowAnalyzerDialog(false);
          setTransactionText('');
          setSelectedBankAccountId('');
          setSelectedBillId('');
          setSelectedLoanId('');
          setSelectedSavingsAccountId('');
          setTransactionLinkType('none');
          setAnalyzerError(null);
          setAnalyzerSuccess(null);
        }}
        maxWidth={isMobile ? false : 'md'}
        fullWidth={!isMobile}
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 'auto' },
            maxWidth: { xs: '100%', sm: '600px' },
            margin: { xs: 0, sm: 'auto' },
            height: { xs: '100%', sm: 'auto' },
            maxHeight: { xs: '100%', sm: '90vh' }
          }
        }}
      >
        <DialogTitle sx={{ 
          pb: { xs: 1, sm: 2 },
          fontSize: { xs: '1.1rem', sm: '1.25rem' }
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AutoAwesome sx={{ color: 'primary.main', fontSize: { xs: '1.2rem', sm: '1.5rem' } }} />
            Transaction Analyzer
          </Box>
        </DialogTitle>
        <DialogContent sx={{ 
          px: { xs: 2, sm: 3 },
          py: { xs: 2, sm: 3 }
        }}>
          <Box sx={{ mt: { xs: 0, sm: 2 } }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Paste your transaction text (e.g., SMS notification, receipt text) and let AI analyze and create the transaction automatically.
            </Typography>
            
            {/* Bank Account Selection Dropdown */}
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Bank Account (Optional)</InputLabel>
              <Select
                value={selectedBankAccountId}
                onChange={(e) => setSelectedBankAccountId(e.target.value)}
                label="Bank Account (Optional)"
                disabled={isAnalyzing || isLoadingBankAccounts}
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
              >
                <MenuItem value="">
                  <em>None - Match by card number</em>
                </MenuItem>
                {bankAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountName} {account.accountNumber ? `(${account.accountNumber})` : ''}
                  </MenuItem>
                ))}
              </Select>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Select a bank account to assign the transaction to. If not selected, the system will match by card number.
              </Typography>
            </FormControl>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Link Transaction To (Optional)
              </Typography>
            </Divider>

            {/* Radio Buttons for Transaction Link Type - Only Savings option shown */}
            <FormControl component="fieldset" fullWidth sx={{ mt: 2 }}>
              <FormLabel component="legend" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Transaction Type</FormLabel>
              <RadioGroup
                row
                value={transactionLinkType}
                onChange={(e) => {
                  const newType = e.target.value as 'none' | 'bill' | 'loan' | 'savings';
                  setTransactionLinkType(newType);
                  // Clear all selections when changing type
                  setSelectedBillId('');
                  setSelectedLoanId('');
                  setSelectedSavingsAccountId('');
                }}
                sx={{ gap: { xs: 1, sm: 2 } }}
              >
                <FormControlLabel 
                  value="none" 
                  control={<Radio size={isMobile ? 'small' : 'medium'} />} 
                  label="None" 
                  disabled={isAnalyzing}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                />
                <FormControlLabel 
                  value="savings" 
                  control={<Radio size={isMobile ? 'small' : 'medium'} />} 
                  label="Savings" 
                  disabled={isAnalyzing || isLoadingLinkedData}
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                />
              </RadioGroup>
            </FormControl>

            {/* Bill Selection Dropdown - Only shown when bill is selected */}
            {transactionLinkType === 'bill' && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Bill</InputLabel>
                <Select
                  value={selectedBillId}
                  onChange={(e) => setSelectedBillId(e.target.value)}
                  label="Select Bill"
                  disabled={isAnalyzing || isLoadingLinkedData}
                >
                  <MenuItem value="">
                    <em>Select a bill</em>
                  </MenuItem>
                  {bills.map((bill) => (
                    <MenuItem key={bill.id} value={bill.id}>
                      {bill.billName} - {formatCurrency(bill.amount)} ({bill.status})
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Link this transaction to a bill payment. Only active bills (Pending/Overdue) are shown.
                </Typography>
              </FormControl>
            )}

            {/* Loan Selection Dropdown - Only shown when loan is selected */}
            {transactionLinkType === 'loan' && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Loan</InputLabel>
                <Select
                  value={selectedLoanId}
                  onChange={(e) => setSelectedLoanId(e.target.value)}
                  label="Select Loan"
                  disabled={isAnalyzing || isLoadingLinkedData}
                >
                  <MenuItem value="">
                    <em>Select a loan</em>
                  </MenuItem>
                  {loans.map((loan) => (
                    <MenuItem key={loan.id} value={loan.id}>
                      {loan.purpose} - {formatCurrency(loan.monthlyPayment)}/month
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Link this transaction to a loan payment. Only active loans are shown.
                </Typography>
              </FormControl>
            )}

            {/* Savings Account Selection Dropdown - Only shown when savings is selected */}
            {transactionLinkType === 'savings' && (
              <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Select Savings Account</InputLabel>
                <Select
                  value={selectedSavingsAccountId}
                  onChange={(e) => setSelectedSavingsAccountId(e.target.value)}
                  label="Select Savings Account"
                  disabled={isAnalyzing || isLoadingLinkedData}
                >
                  <MenuItem value="">
                    <em>Select a savings account</em>
                  </MenuItem>
                  {savingsAccounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.accountName} - {formatCurrency(account.currentBalance)} / {formatCurrency(account.targetAmount)}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                  Link this transaction to a savings account. Only active savings accounts are shown.
                </Typography>
              </FormControl>
            )}

            <TextField
              fullWidth
              multiline
              rows={isMobile ? 6 : 8}
              value={transactionText}
              onChange={(e) => setTransactionText(e.target.value)}
              placeholder="Example:&#10;POS Purchase&#10;Amount 9.50 SAR&#10;At AZDEHAR A&#10;Mada-Apple pay *5969&#10;on 12/11/25 at 09:49"
              sx={{ 
                mt: 2,
                '& .MuiInputBase-input': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                },
                '& .MuiInputLabel-root': {
                  fontSize: { xs: '0.875rem', sm: '1rem' }
                }
              }}
              disabled={isAnalyzing}
              label="Transaction Text"
            />
            {analyzerError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {analyzerError}
              </Alert>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          px: { xs: 2, sm: 3 },
          py: { xs: 1.5, sm: 2 },
          gap: { xs: 1, sm: 2 }
        }}>
          <Button
            onClick={() => {
              setShowAnalyzerDialog(false);
              setTransactionText('');
              setSelectedBankAccountId('');
              setSelectedBillId('');
              setSelectedLoanId('');
              setSelectedSavingsAccountId('');
              setTransactionLinkType('none');
              setAnalyzerError(null);
              setAnalyzerSuccess(null);
            }}
            disabled={isAnalyzing}
            size={isMobile ? 'small' : 'medium'}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={isAnalyzing ? <CircularProgress size={20} /> : <ContentPaste />}
            onClick={async () => {
              if (!transactionText.trim()) {
                setAnalyzerError('Please enter transaction text');
                return;
              }

              // Validate that if a transaction type is selected, the corresponding item is also selected
              if (transactionLinkType === 'bill' && !selectedBillId) {
                setAnalyzerError('Please select a bill from the dropdown.');
                return;
              }
              if (transactionLinkType === 'loan' && !selectedLoanId) {
                setAnalyzerError('Please select a loan from the dropdown.');
                return;
              }
              if (transactionLinkType === 'savings' && !selectedSavingsAccountId) {
                setAnalyzerError('Please select a savings account from the dropdown.');
                return;
              }

              setIsAnalyzing(true);
              setAnalyzerError(null);

              try {
                const bankAccountId = selectedBankAccountId || undefined;
                const billId = selectedBillId || undefined;
                const loanId = selectedLoanId || undefined;
                const savingsAccountId = selectedSavingsAccountId || undefined;

                const response = await apiService.analyzeTransactionText(
                  transactionText.trim(),
                  bankAccountId,
                  billId,
                  loanId,
                  savingsAccountId
                );
                
                if (response.success && response.data) {
                  // Success - close dialog and refresh transactions
                  setShowAnalyzerDialog(false);
                  setTransactionText('');
                  setSelectedBankAccountId('');
                  setSelectedBillId('');
                  setSelectedLoanId('');
                  setSelectedSavingsAccountId('');
                  setTransactionLinkType('none');
                  setAnalyzerError(null);
                  // Show success message
                  setAnalyzerSuccess(response.message || 'Transaction created successfully!');
                  setError(null);
                  // Refresh transactions
                  await loadTransactionsAndAnalytics();
                  // Clear success message after 5 seconds
                  setTimeout(() => setAnalyzerSuccess(null), 5000);
                } else {
                  // Error response from API
                  setAnalyzerError(response.message || 'Failed to analyze transaction');
                }
              } catch (err: any) {
                // Handle errors thrown by the API service
                const errorMessage = err?.message || getErrorMessage(err, 'Failed to analyze transaction');
                setAnalyzerError(errorMessage);
              } finally {
                setIsAnalyzing(false);
              }
            }}
            disabled={isAnalyzing || !transactionText.trim()}
            size={isMobile ? 'small' : 'medium'}
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze & Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Transaction Details Dialog */}
      <Dialog
        open={showDetailsDialog}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
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
