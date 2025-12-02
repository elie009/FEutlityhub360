import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent, Alert,
  Button, FormControl, InputLabel, Select, MenuItem,
  TextField, Chip, SelectChangeEvent, Dialog, DialogTitle,
  DialogContent, DialogActions, Divider, Tooltip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Paper, IconButton,
  ToggleButton, ToggleButtonGroup, TableSortLabel, Pagination,
  Skeleton, CircularProgress, useTheme, useMediaQuery,
  Radio, RadioGroup, FormControlLabel, FormLabel, Menu,
  Checkbox,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, Receipt, AttachMoney,
  Refresh, Clear, Category, AccountBalance, Link, Sync,
  HelpOutline, Visibility, ViewList, ViewModule,
  FilterList, FilterListOff, CloudUpload, Delete,
  ContentPaste, AutoAwesome, Search, Close,
  Save, Bookmark, Edit, CheckBox, CheckBoxOutlineBlank,
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
import TransactionForm from '../components/BankAccounts/TransactionForm';
import QuickAddTransactionForm from '../components/Transactions/QuickAddTransactionForm';

// Helper function to get current date (first day of current month)
const getCurrentDate = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

// Helper function to format date to YYYY-MM
const formatDateToYearMonth = (date: Date | null): string => {
  if (!date) {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Helper function to get year and month from date
const getYearFromDate = (date: Date | null): number => {
  return date ? date.getFullYear() : new Date().getFullYear();
};

const getMonthFromDate = (date: Date | null): number => {
  return date ? date.getMonth() + 1 : new Date().getMonth() + 1;
};

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
  // Initialize dateFrom and dateTo to current month (first and last day of month)
  const getCurrentMonthRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      from: firstDay.toISOString().split('T')[0], // YYYY-MM-DD format
      to: lastDay.toISOString().split('T')[0]
    };
  };
  const [dateFrom, setDateFrom] = useState<string>(getCurrentMonthRange().from);
  const [dateTo, setDateTo] = useState<string>(getCurrentMonthRange().to);
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
  const [closedMonthsMap, setClosedMonthsMap] = useState<Map<string, Set<string>>>(new Map()); // Map<bankAccountId, Set<"YYYY-MM">>
  const [transactionLinkType, setTransactionLinkType] = useState<'none' | 'bill' | 'loan' | 'savings'>('none');
  const [showTransactionForm, setShowTransactionForm] = useState(false);
  const [showQuickAddForm, setShowQuickAddForm] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<BankAccountTransaction | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Saved Filter Presets
  interface FilterPreset {
    id: string;
    name: string;
    filters: TransactionFilters;
    columnFilters: typeof columnFilters;
    selectedMonth?: string; // Legacy support
    dateFrom?: string;
    dateTo?: string;
    searchQuery: string;
  }
  const [savedPresets, setSavedPresets] = useState<FilterPreset[]>([]);
  const [showSavePresetDialog, setShowSavePresetDialog] = useState(false);
  const [presetName, setPresetName] = useState('');
  const [showPresetMenu, setShowPresetMenu] = useState(false);
  const [presetMenuAnchor, setPresetMenuAnchor] = useState<null | HTMLElement>(null);
  
  // Inline Editing
  const [editingTransactionId, setEditingTransactionId] = useState<string | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  
  // Batch Actions
  const [selectedTransactions, setSelectedTransactions] = useState<Set<string>>(new Set());
  const [isBatchMode, setIsBatchMode] = useState(false);
  
  // Transaction Grouping
  const [groupBy, setGroupBy] = useState<'none' | 'date' | 'account'>('none');

  // Smart Defaults: Get last used account and category from localStorage
  const getLastUsedAccount = (): string => {
    const lastAccount = localStorage.getItem('lastUsedBankAccountId');
    if (lastAccount && bankAccounts.find(a => a.id === lastAccount)) {
      return lastAccount;
    }
    return bankAccounts.length > 0 ? bankAccounts[0].id : '';
  };

  const getLastUsedCategory = (): string => {
    return localStorage.getItem('lastUsedCategory') || '';
  };

  const saveLastUsedAccount = (accountId: string) => {
    localStorage.setItem('lastUsedBankAccountId', accountId);
  };

  const saveLastUsedCategory = (category: string) => {
    if (category) {
      localStorage.setItem('lastUsedCategory', category);
    }
  };

  // Load saved filter presets from localStorage
  useEffect(() => {
    if (user?.id) {
      const saved = localStorage.getItem(`transactionFilterPresets_${user.id}`);
      if (saved) {
        try {
          setSavedPresets(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to load saved presets:', e);
        }
      }
    }
  }, [user?.id]);

  // Load on initial mount only
  useEffect(() => {
    if (user?.id) {
      loadTransactionsAndAnalytics();
      loadBankAccounts(); // Load bank accounts on page load to check if button should be enabled
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]); // Only load on initial mount and when user changes

  // Handle search button click
  const handleSearch = () => {
    if (user?.id) {
      loadTransactionsAndAnalytics();
    }
  };

  useEffect(() => {
    if (showAnalyzerDialog || showTransactionForm) {
      loadBankAccounts(); // Reload in case accounts were added/updated
      if (showAnalyzerDialog) {
        loadLinkedData();
      }
    }
  }, [showAnalyzerDialog, showTransactionForm, user?.id]);

  const loadTransactionsAndAnalytics = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Use dateFrom and dateTo for filtering
      const monthFilters = { ...filters };
      if (dateFrom) {
        monthFilters.startDate = dateFrom;
      }
      if (dateTo) {
        monthFilters.endDate = dateTo;
      }
      
      // Calculate period from dateFrom for analytics (format: YYYY-MM)
      // Use the month from dateFrom for analytics period
      const period = dateFrom ? dateFrom.substring(0, 7) : formatDateToYearMonth(null);
      
      const [transactionsResponse, analyticsData, bankAccountAnalyticsData, bankAccountSummaryData] = await Promise.all([
        apiService.getTransactions(monthFilters),
        apiService.getTransactionAnalytics(period),
        apiService.getBankAccountAnalyticsSummary(),
        apiService.getBankAccountSummary(),
      ]);

      setTransactions(transactionsResponse.data);
      setAnalytics(analyticsData);
      setBankAccountAnalytics(bankAccountAnalyticsData);
      setBankAccountSummary(bankAccountSummaryData);
      
      // Reload closed months to keep them up to date
      if (bankAccounts.length > 0) {
        await loadClosedMonthsForAccounts(bankAccounts);
      }
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
      
      // Load closed months for all bank accounts
      await loadClosedMonthsForAccounts(accounts);
    } catch (err) {
      console.error('Failed to load bank accounts:', err);
    } finally {
      setIsLoadingBankAccounts(false);
    }
  };

  const loadClosedMonthsForAccounts = async (accounts: BankAccount[]) => {
    const closedMonths = new Map<string, Set<string>>();
    
    for (const account of accounts) {
      try {
        const closed = await apiService.getClosedMonths(account.id);
        // Create a Set of "YYYY-MM" strings for quick lookup
        const monthSet = new Set<string>();
        closed.forEach((cm: any) => {
          const monthKey = `${cm.year}-${String(cm.month).padStart(2, '0')}`;
          monthSet.add(monthKey);
        });
        closedMonths.set(account.id, monthSet);
      } catch (err) {
        console.error(`Failed to load closed months for account ${account.id}:`, err);
      }
    }
    
    setClosedMonthsMap(closedMonths);
  };

  const isTransactionMonthClosed = (transaction: BankAccountTransaction): boolean => {
    if (!transaction.bankAccountId || !transaction.transactionDate) {
      return false;
    }
    
    const closedMonths = closedMonthsMap.get(transaction.bankAccountId);
    if (!closedMonths) {
      return false;
    }
    
    const transactionDate = new Date(transaction.transactionDate);
    const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
    
    return closedMonths.has(monthKey);
  };

  const getClosedMonthMessage = (transaction: BankAccountTransaction): string | null => {
    if (!isTransactionMonthClosed(transaction)) {
      return null;
    }
    
    const transactionDate = new Date(transaction.transactionDate);
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];
    const monthName = monthNames[transactionDate.getMonth()];
    const year = transactionDate.getFullYear();
    
    return `This transaction cannot be edited or deleted because ${monthName} ${year} is closed for this account.`;
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

  const handleRefresh = async () => {
    // Only reload transactions, not analytics or other data
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Only reload transactions with current filters
      const transactionsResponse = await apiService.getTransactions(filters);
      setTransactions(transactionsResponse.data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTransaction = () => {
    setShowTransactionForm(true);
  };

  const handleQuickAdd = () => {
    setShowQuickAddForm(true);
  };

  const handleTransactionFormSuccess = (accountId?: string, category?: string) => {
    setShowTransactionForm(false);
    setShowQuickAddForm(false);
    if (accountId) saveLastUsedAccount(accountId);
    if (category) saveLastUsedCategory(category);
    loadTransactionsAndAnalytics(); // Reload transactions after adding
  };

  const handleSelectChange = (field: keyof TransactionFilters) => (
    event: SelectChangeEvent<string>
  ) => {
    const value = event.target.value;
    setFilters(prev => ({
      ...prev,
      [field]: value === '' ? '' : value, // Keep empty string instead of undefined for proper Select display
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
      transactionType: '', // Reset to empty string for "All Types"
      category: '',
      bankAccountId: undefined,
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
    // Reset to current month range
    const monthRange = getCurrentMonthRange();
    setDateFrom(monthRange.from);
    setDateTo(monthRange.to);
    setSortField('');
    setSortDirection('asc');
    setSearchQuery('');
    setSelectedTransactions(new Set());
    setIsBatchMode(false);
  };

  // Saved Filter Presets Functions
  const handleSavePreset = () => {
    if (!presetName.trim() || !user?.id) return;
    
    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      filters: { ...filters },
      columnFilters: { ...columnFilters },
      dateFrom: dateFrom, // Store date range
      dateTo: dateTo,
      searchQuery,
    };
    
    const updated = [...savedPresets, newPreset];
    setSavedPresets(updated);
    localStorage.setItem(`transactionFilterPresets_${user.id}`, JSON.stringify(updated));
    setShowSavePresetDialog(false);
    setPresetName('');
  };

  const handleLoadPreset = (preset: FilterPreset) => {
    setFilters(preset.filters);
    setColumnFilters(preset.columnFilters);
    // Restore date range from preset
    if (preset.dateFrom && preset.dateTo) {
      setDateFrom(preset.dateFrom);
      setDateTo(preset.dateTo);
    } else if (preset.selectedMonth) {
      // Legacy support: convert YYYY-MM to date range
      const [year, month] = preset.selectedMonth.split('-');
      const firstDay = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
      const lastDay = new Date(parseInt(year, 10), parseInt(month, 10), 0);
      setDateFrom(firstDay.toISOString().split('T')[0]);
      setDateTo(lastDay.toISOString().split('T')[0]);
    } else {
      // Default to current month range
      const monthRange = getCurrentMonthRange();
      setDateFrom(monthRange.from);
      setDateTo(monthRange.to);
    }
    setSearchQuery(preset.searchQuery);
    setPresetMenuAnchor(null);
    setShowPresetMenu(false);
  };

  const handleDeletePreset = (presetId: string) => {
    if (!user?.id) return;
    const updated = savedPresets.filter(p => p.id !== presetId);
    setSavedPresets(updated);
    localStorage.setItem(`transactionFilterPresets_${user.id}`, JSON.stringify(updated));
  };

  // Batch Actions
  const handleBatchDelete = async () => {
    if (selectedTransactions.size === 0) return;
    if (!window.confirm(`Delete ${selectedTransactions.size} transaction(s)?`)) return;
    
    try {
      const deletePromises = Array.from(selectedTransactions).map(id => 
        apiService.deleteTransaction(id)
      );
      await Promise.all(deletePromises);
      setSelectedTransactions(new Set());
      setIsBatchMode(false);
      loadTransactionsAndAnalytics();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  const handleBatchEdit = () => {
    if (selectedTransactions.size === 0) return;
    // For now, open edit dialog for first selected transaction
    // In future, could implement bulk edit dialog
    const firstId = Array.from(selectedTransactions)[0];
    const transaction = transactions.find(t => t.id === firstId);
    if (transaction) {
      setTransactionToEdit(transaction);
      setShowTransactionForm(true);
      setSelectedTransactions(new Set());
      setIsBatchMode(false);
    }
  };

  // Transaction Grouping
  const groupTransactions = (transactions: BankAccountTransaction[]) => {
    if (groupBy === 'none') return { 'All': transactions };
    
    const grouped: Record<string, BankAccountTransaction[]> = {};
    
    transactions.forEach(transaction => {
      let key = 'All';
      if (groupBy === 'date') {
        const date = new Date(transaction.transactionDate);
        key = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
      } else if (groupBy === 'account') {
        key = transaction.accountName || 'Unknown Account';
      }
      
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(transaction);
    });
    
    return grouped;
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value;
    setSearchQuery(value);
    // Update description filter when search changes
    setColumnFilters(prev => ({
      ...prev,
      description: value,
    }));
  };

  const handleQuickFilter = (preset: 'today' | 'thisWeek' | 'thisMonth' | 'last7Days' | 'last30Days') => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    let dateFrom: Date;
    let dateTo: Date = today;

    switch (preset) {
      case 'today':
        dateFrom = new Date();
        dateFrom.setHours(0, 0, 0, 0);
        break;
      case 'thisWeek':
        dateFrom = new Date(today);
        dateFrom.setDate(today.getDate() - today.getDay()); // Start of week (Sunday)
        dateFrom.setHours(0, 0, 0, 0);
        break;
      case 'thisMonth':
        dateFrom = new Date(today.getFullYear(), today.getMonth(), 1);
        dateFrom.setHours(0, 0, 0, 0);
        break;
      case 'last7Days':
        dateFrom = new Date(today);
        dateFrom.setDate(today.getDate() - 7);
        dateFrom.setHours(0, 0, 0, 0);
        break;
      case 'last30Days':
        dateFrom = new Date(today);
        dateFrom.setDate(today.getDate() - 30);
        dateFrom.setHours(0, 0, 0, 0);
        break;
      default:
        return;
    }

    // Format dates as YYYY-MM-DD strings
    const dateFromStr = dateFrom.toISOString().split('T')[0];
    const dateToStr = dateTo.toISOString().split('T')[0];

    // Clear all filters first
    setFilters({
      limit: 10,
      page: 1,
      transactionType: '', // Reset to empty string for "All Types"
      category: '',
      bankAccountId: undefined,
    });
    setColumnFilters({
      dateFrom: dateFromStr,
      dateTo: dateToStr,
      description: '',
      category: '',
      transactionType: '',
      amountMin: '',
      amountMax: '',
    });
    setDateFrom(dateFromStr);
    setDateTo(dateToStr);
    setSearchQuery('');
    setSortField('');
    setSortDirection('asc');
    setSelectedTransactions(new Set());
    setIsBatchMode(false);

    // Trigger backend request after state updates
    // Use setTimeout to ensure React has processed all state updates
    setTimeout(() => {
      loadTransactionsAndAnalytics();
    }, 0);
  };

  const removeFilter = (filterType: 'bankAccountId' | 'transactionType' | 'category' | 'dateRange' | 'search' | 'month') => {
    switch (filterType) {
      case 'bankAccountId':
        setFilters(prev => ({ ...prev, bankAccountId: undefined, page: 1 }));
        break;
      case 'transactionType':
        setFilters(prev => ({ ...prev, transactionType: undefined, page: 1 }));
        break;
      case 'category':
        setFilters(prev => ({ ...prev, category: undefined, page: 1 }));
        break;
      case 'month':
      case 'dateRange':
        // Reset to current month range
        const monthRange = getCurrentMonthRange();
        setDateFrom(monthRange.from);
        setDateTo(monthRange.to);
        setColumnFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }));
        setFilters(prev => ({ ...prev, page: 1 }));
        break;
      case 'dateRange':
        // Reset to current month range
        const monthRangeForDateRange = getCurrentMonthRange();
        setDateFrom(monthRangeForDateRange.from);
        setDateTo(monthRangeForDateRange.to);
        setColumnFilters(prev => ({ ...prev, dateFrom: '', dateTo: '' }));
        setFilters(prev => ({ ...prev, page: 1 }));
        break;
      case 'search':
        setSearchQuery('');
        setColumnFilters(prev => ({ ...prev, description: '' }));
        break;
    }
  };

  // Get active filters for chips
  const getActiveFilters = () => {
    const active: Array<{ label: string; type: 'bankAccountId' | 'transactionType' | 'category' | 'dateRange' | 'search' | 'month' }> = [];
    
    if (filters.bankAccountId) {
      const account = bankAccounts.find(a => a.id === filters.bankAccountId);
      active.push({ label: account ? account.accountName : 'Account', type: 'bankAccountId' });
    }
    if (filters.transactionType) {
      active.push({ label: filters.transactionType.charAt(0).toUpperCase() + filters.transactionType.slice(1), type: 'transactionType' });
    }
    if (filters.category) {
      active.push({ label: filters.category.charAt(0).toUpperCase() + filters.category.slice(1), type: 'category' });
    }
    if (dateFrom || dateTo) {
      const from = dateFrom ? new Date(dateFrom).toLocaleDateString() : '';
      const to = dateTo ? new Date(dateTo).toLocaleDateString() : '';
      active.push({ label: from && to ? `${from} - ${to}` : from || to, type: 'dateRange' });
    }
    if (searchQuery) {
      active.push({ label: `Search: "${searchQuery}"`, type: 'search' });
    }
    
    return active;
  };

  const handleColumnFilterChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;
    // Update dateFrom/dateTo when column filters change
    if (field === 'dateFrom') {
      setDateFrom(value);
    } else if (field === 'dateTo') {
      setDateTo(value);
    }
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
    const transaction = transactions.find(t => t.id === transactionId);
    
    // Check if month is closed before attempting delete
    if (transaction && isTransactionMonthClosed(transaction)) {
      const message = getClosedMonthMessage(transaction);
      setError(message || 'Cannot delete transaction: Month is closed');
      return;
    }

    if (window.confirm('Are you sure you want to delete this transaction? Transactions older than 24 hours will be hidden (soft deleted) and can be restored.')) {
      try {
        await apiService.deleteTransaction(transactionId);
        // Close the details dialog
        handleCloseDetails();
        // Reload transactions and analytics
        loadTransactionsAndAnalytics();
      } catch (err: unknown) {
        const errorMessage = getErrorMessage(err, 'Failed to delete transaction');
        // Check if error is about closed month (backend validation)
        setError(errorMessage);
      }
    }
  };

  const handleHideTransaction = async (transactionId: string) => {
    const reason = window.prompt('Enter reason for hiding this transaction (optional):');
    if (reason !== null) { // User didn't cancel
      try {
        await apiService.hideTransaction(transactionId, reason || undefined);
        handleCloseDetails();
        loadTransactionsAndAnalytics();
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to hide transaction'));
      }
    }
  };

  const handleRestoreTransaction = async (transactionId: string) => {
    if (window.confirm('Are you sure you want to restore this transaction?')) {
      try {
        await apiService.restoreTransaction(transactionId);
        handleCloseDetails();
        loadTransactionsAndAnalytics();
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to restore transaction'));
      }
    }
  };


  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateWithTime = (dateString: string): string => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    return `${dateStr} at ${timeStr}`;
  };

  if (isLoading) {
    return (
      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: { xs: 1, sm: 2, md: 3 }, width: '100%' }}>
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
            startIcon={<Receipt />}
            onClick={handleQuickAdd}
            disabled={bankAccounts.length === 0}
            size={isMobile ? 'small' : 'medium'}
            sx={{ 
              mr: { xs: 0.5, sm: 1 },
              flex: { xs: '1 1 auto', sm: '0 0 auto' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              py: { xs: 0.75, sm: 1 },
              px: { xs: 1.5, sm: 2 }
            }}
          >
            {isMobile ? 'Quick Add' : 'Quick Add'}
          </Button>
          <input
            accept="image/jpeg,image/jpg,image/png"
            style={{ display: 'none' }}
            id="image-upload-input-top"
            multiple
            type="file"
            onChange={handleFileUpload}
          />
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
            placement="bottom"
          >
            <label htmlFor="image-upload-input-top">
              <Button
                component="span"
                variant="contained"
                color="primary"
                startIcon={<CloudUpload />}
                size={isMobile ? 'small' : 'medium'}
                sx={{ 
                  mr: { xs: 0.5, sm: 1 },
                  flex: { xs: '1 1 auto', sm: '0 0 auto' },
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  py: { xs: 0.75, sm: 1 },
                  px: { xs: 1.5, sm: 2 },
                  cursor: 'pointer'
                }}
              >
                {isMobile ? 'Upload Receipt' : 'Upload Receipt'}
              </Button>
            </label>
          </Tooltip>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<Receipt />}
            onClick={handleCreateTransaction}
            disabled={bankAccounts.length === 0}
            size={isMobile ? 'small' : 'medium'}
            sx={{ 
              mr: { xs: 0, sm: 1 },
              flex: { xs: '1 1 auto', sm: '0 0 auto' },
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              py: { xs: 0.75, sm: 1 },
              px: { xs: 1.5, sm: 2 }
            }}
          >
            {isMobile ? 'Full Form' : 'Full Form'}
          </Button>
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
            <>
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
              <FormControl size="small" sx={{ minWidth: 120, ml: 1 }}>
                <InputLabel>Group By</InputLabel>
                <Select
                  value={groupBy}
                  label="Group By"
                  onChange={(e) => setGroupBy(e.target.value as 'none' | 'date' | 'account')}
                  aria-label="Group transactions by"
                >
                  <MenuItem value="none">None</MenuItem>
                  <MenuItem value="date">Date</MenuItem>
                  <MenuItem value="account">Account</MenuItem>
                </Select>
              </FormControl>
            </>
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
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 1.5, sm: 3 }, flexWrap: 'wrap', gap: 2 }}>
          <Typography 
            variant="h5" 
            gutterBottom={false}
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              fontSize: { xs: '1.1rem', sm: '1.5rem' },
              fontWeight: { xs: 600, sm: 400 }
            }}
          >
            <AccountBalance sx={{ mr: { xs: 0.75, sm: 2 }, color: 'primary.main', fontSize: { xs: '1.1rem', sm: '1.5rem' } }} />
            {isMobile ? 'Bank Transactions' : 'Bank Account Transaction'}
          </Typography>
          
          {/* Date From, Date To, Bank Account, Transaction Type, Category, Limit, and Search Button */}
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              type="date"
              label="Date From"
              value={dateFrom}
              onChange={(e) => {
                const newDateFrom = e.target.value;
                setDateFrom(newDateFrom);
                // Update column filters for transaction table filtering
                setColumnFilters(prev => ({
                  ...prev,
                  dateFrom: newDateFrom,
                }));
              }}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                minWidth: { xs: 140, sm: 160 },
                '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } },
              }}
            />
            <TextField
              type="date"
              label="Date To"
              value={dateTo}
              onChange={(e) => {
                const newDateTo = e.target.value;
                setDateTo(newDateTo);
                // Update column filters for transaction table filtering
                setColumnFilters(prev => ({
                  ...prev,
                  dateTo: newDateTo,
                }));
              }}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              sx={{
                minWidth: { xs: 140, sm: 160 },
                '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } },
              }}
            />
            <FormControl 
              size="small" 
              sx={{ 
                minWidth: { xs: 140, sm: 180 },
                ...(filters.bankAccountId && {
                  '& .MuiOutlinedInput-root': {
                    borderColor: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                    }
                  }
                })
              }}
            >
              <InputLabel 
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                shrink={true}
              >
                Bank Account
              </InputLabel>
              <Select
                value={filters.bankAccountId ?? ''}
                label="Bank Account"
                onChange={handleSelectChange('bankAccountId')}
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                disabled={isLoadingBankAccounts}
                aria-label="Filter by bank account"
                displayEmpty
              >
                <MenuItem value="" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>All Accounts</MenuItem>
                {bankAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id} sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    {account.accountName} {account.accountNumber ? `(${account.accountNumber})` : ''}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { xs: 140, sm: 150 } }}>
              <InputLabel 
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                shrink={true}
              >
                Transaction Type
              </InputLabel>
              <Select
                value={filters.transactionType ?? ''}
                label="Transaction Type"
                onChange={handleSelectChange('transactionType')}
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                aria-label="Filter by transaction type"
                displayEmpty
              >
                <MenuItem value="" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>All Types</MenuItem>
                <MenuItem value="credit" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Credit</MenuItem>
                <MenuItem value="debit" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Debit</MenuItem>
                <MenuItem value="transfer" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Transfer</MenuItem>
              </Select>
            </FormControl>
            <FormControl size="small" sx={{ minWidth: { xs: 140, sm: 150 } }}>
              <InputLabel 
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                shrink={true}
              >
                Category
              </InputLabel>
              <Select
                value={filters.category ?? ''}
                label="Category"
                onChange={handleSelectChange('category')}
                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                aria-label="Filter by category"
                displayEmpty
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
                width: { xs: 100, sm: 100 },
                '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } },
                '& .MuiInputLabel-root': { fontSize: { xs: '0.875rem', sm: '1rem' } }
              }}
              inputProps={{ min: 1, max: 100 }}
            />
            <Button
              variant="contained"
              color="primary"
              startIcon={<Search />}
              onClick={handleSearch}
              size="small"
              sx={{
                minWidth: { xs: 100, sm: 120 },
                fontSize: { xs: '0.875rem', sm: '1rem' },
                px: 2,
                height: '40px', // Match TextField height
              }}
              aria-label="Search transactions"
            >
              Search
            </Button>
          </Box>
        </Box>

        {/* Analytics Cards - Single Row with 8 Cards */}
        <Grid container spacing={{ xs: 1, sm: 1.5 }}>
          {/* 1. Total Balance */}
          <Grid item xs={6} sm={3} md={1.5}>
            <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
              <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <AttachMoney sx={{ fontSize: { xs: 20, sm: 18 }, color: 'success.main', mb: { xs: 0.5, sm: 0.5 } }} />
                  <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 600, lineHeight: 1.2, mb: 0.25 }}>
                    {bankAccountSummary ? formatCurrency(bankAccountSummary.totalBalance) : 
                     bankAccountAnalytics?.totalBalance !== undefined ? formatCurrency(bankAccountAnalytics.totalBalance) : 'N/A'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' }, textAlign: 'center' }}>
                    Total Balance
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 2. Total Accounts */}
          <Grid item xs={6} sm={3} md={1.5}>
            <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
              <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <AccountBalance sx={{ fontSize: { xs: 20, sm: 18 }, color: 'info.main', mb: { xs: 0.5, sm: 0.5 } }} />
                  <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 600, lineHeight: 1.2, mb: 0.25 }}>
                    {bankAccountSummary ? bankAccountSummary.totalAccounts : 
                     bankAccountAnalytics?.totalAccounts || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' }, textAlign: 'center' }}>
                    Total Accounts
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 3. Active Accounts */}
          <Grid item xs={6} sm={3} md={1.5}>
            <Card sx={{ height: '100%', '&:hover': { boxShadow: 2 } }}>
              <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <AccountBalance sx={{ fontSize: { xs: 20, sm: 18 }, color: 'info.main', mb: { xs: 0.5, sm: 0.5 } }} />
                  <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 600, lineHeight: 1.2, mb: 0.25 }}>
                    {bankAccountSummary ? bankAccountSummary.activeAccounts : 
                     bankAccountAnalytics?.activeAccounts || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' }, textAlign: 'center' }}>
                    Active Accounts
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* 4. Total Transactions */}
          <Grid item xs={6} sm={3} md={1.5}>
            <Tooltip
              title={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    What is "Total Transactions"?
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    • Total count of all bank transactions across all your accounts
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    • Includes both credit and debit transactions
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    • Shows the complete transaction history, not filtered by date
                  </Typography>
                  <Typography variant="body2">
                    • Note: Summary totals (income/expenses) are calculated for the current calendar month by default
                  </Typography>
                </Box>
              }
              arrow
              placement="top"
            >
              <Card sx={{ height: '100%', cursor: 'help', '&:hover': { boxShadow: 2 } }}>
                <CardContent sx={{ p: { xs: 1, sm: 1.5 }, '&:last-child': { pb: { xs: 1, sm: 1.5 } } }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                    <Receipt sx={{ fontSize: { xs: 20, sm: 18 }, color: 'primary.main', mb: { xs: 0.5, sm: 0.5 } }} />
                    <Typography variant="h6" sx={{ fontSize: { xs: '0.85rem', sm: '0.9rem' }, fontWeight: 600, lineHeight: 1.2, mb: 0.25 }}>
                      {analytics?.totalTransactions || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' }, textAlign: 'center' }}>
                      Total Transactions
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>

          {/* 5. Total Income */}
          <Grid item xs={6} sm={3} md={1.5}>
            <Tooltip
              title={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    What is "Total Income"?
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    • Total money received from all income sources
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    • Includes: deposits, transfers in, income, refunds
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    • Shows your total money received across all accounts
                  </Typography>
                  <Typography variant="body2">
                    • Helps you understand your overall income
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
                       bankAccountAnalytics?.totalIncoming !== undefined ? formatCurrency(bankAccountAnalytics.totalIncoming) : 
                       analytics?.totalIncoming ? formatCurrency(analytics.totalIncoming) : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' }, textAlign: 'center' }}>
                      Total Income
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>

          {/* 6. Total Expense */}
          <Grid item xs={6} sm={3} md={1.5}>
            <Tooltip
              title={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    What is "Total Expense"?
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    • Total money spent on all expenses
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    • Includes: all debits, payments, transfers, withdrawals
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    • Shows your total spending across all accounts
                  </Typography>
                  <Typography variant="body2">
                    • Helps you understand your overall expenses
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
                       bankAccountAnalytics?.totalOutgoing !== undefined ? formatCurrency(bankAccountAnalytics.totalOutgoing) : 
                       analytics?.totalOutgoing ? formatCurrency(analytics.totalOutgoing) : 'N/A'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' }, textAlign: 'center' }}>
                      Total Expense
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>

          {/* 7. Transaction Income */}
          <Grid item xs={6} sm={3} md={1.5}>
            <Tooltip
              title={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    What is "Transaction Income"?
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    • Money received from all income sources
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
                      {analytics?.totalIncoming !== undefined && analytics?.totalIncoming !== null 
                        ? formatCurrency(analytics.totalIncoming) 
                        : formatCurrency(0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' }, textAlign: 'center' }}>
                      Transaction Income
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>

          {/* 8. Transaction Expense */}
          <Grid item xs={6} sm={3} md={1.5}>
            <Tooltip
              title={
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    What is "Transaction Expense"?
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 0.5 }}>
                    • Money spent on all expenses
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
                      {analytics?.totalOutgoing !== undefined && analytics?.totalOutgoing !== null 
                        ? formatCurrency(analytics.totalOutgoing) 
                        : formatCurrency(0)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.75rem' }, textAlign: 'center' }}>
                      Transaction Expense
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Tooltip>
          </Grid>
        </Grid>
      </Box>

      {/* Search Bar and Quick Filters */}
      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center', mb: 1 }}>
          <TextField
            size="small"
            placeholder="Search transaction by description . . ."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search transactions"
            InputProps={{
              startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
              endAdornment: searchQuery && (
                <IconButton
                  size="small"
                  onClick={() => removeFilter('search')}
                  sx={{ mr: -1 }}
                >
                  <Close fontSize="small" />
                </IconButton>
              ),
            }}
            sx={{
              flex: { xs: '1 1 100%', sm: '1 1 auto', md: '1 1 300px' },
              minWidth: { xs: '100%', sm: '200px', md: '300px' },
              '& .MuiInputBase-input': { fontSize: { xs: '0.875rem', sm: '1rem' } },
            }}
          />
          
          {/* Show Column Filters Button */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
            {!isMobile && (
              <Button
                variant="outlined"
                startIcon={showFilters ? <FilterListOff /> : <FilterList />}
                onClick={toggleFilters}
                size="small"
                color={showFilters ? "secondary" : "primary"}
                sx={{ fontSize: '0.875rem', minWidth: 'auto', px: 2 }}
              >
                {showFilters ? 'Hide Column Filters' : 'Show Column Filters'}
              </Button>
            )}
          </Box>

          {/* Save Filter and Clear All Buttons */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Save />}
              onClick={() => setShowSavePresetDialog(true)}
              sx={{ fontSize: '0.875rem', minWidth: 'auto', px: 2 }}
              aria-label="Save current filter preset"
            >
              Save Filter
            </Button>
            <Button
              size="small"
              variant="outlined"
              startIcon={<Clear />}
              onClick={handleClearFilters}
              sx={{ fontSize: '0.875rem', minWidth: 'auto', px: 2 }}
              aria-label="Clear all filters"
            >
              Clear All
            </Button>
          </Box>
          
          {/* Quick Filter Presets */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', flex: { xs: '1 1 100%', sm: '0 0 auto' } }}>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleQuickFilter('today')}
              sx={{ fontSize: '0.875rem', minWidth: 'auto', px: 2 }}
            >
              Today
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleQuickFilter('thisWeek')}
              sx={{ fontSize: '0.875rem', minWidth: 'auto', px: 2 }}
            >
              This Week
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleQuickFilter('thisMonth')}
              sx={{ fontSize: '0.875rem', minWidth: 'auto', px: 2 }}
            >
              This Month
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleQuickFilter('last7Days')}
              sx={{ fontSize: '0.875rem', minWidth: 'auto', px: 2 }}
            >
              Last 7 Days
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={() => handleQuickFilter('last30Days')}
              sx={{ fontSize: '0.875rem', minWidth: 'auto', px: 2 }}
            >
              Last 30 Days
            </Button>
          </Box>
        </Box>

        {/* Active Filter Chips */}
        {getActiveFilters().length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontSize: '0.875rem', fontWeight: 'medium', mr: 1 }}>
              Active Filters:
            </Typography>
            {getActiveFilters().map((filter, index) => (
              <Chip
                key={index}
                label={filter.label}
                onDelete={() => removeFilter(filter.type)}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontSize: '0.75rem' }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Batch Actions Bar */}
      {isBatchMode && selectedTransactions.size > 0 && (
        <Box sx={{ 
          display: 'flex', 
          gap: 1, 
          mb: 2, 
          p: 1.5, 
          bgcolor: 'primary.light', 
          borderRadius: 1,
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <Typography variant="body2" sx={{ fontWeight: 'bold', mr: 1 }}>
            {selectedTransactions.size} selected
          </Typography>
          <Button
            size="small"
            variant="contained"
            startIcon={<Edit />}
            onClick={handleBatchEdit}
            aria-label="Edit selected transactions"
          >
            Edit
          </Button>
          <Button
            size="small"
            variant="contained"
            color="error"
            startIcon={<Delete />}
            onClick={handleBatchDelete}
            aria-label="Delete selected transactions"
          >
            Delete
          </Button>
          <Button
            size="small"
            variant="outlined"
            onClick={() => {
              setSelectedTransactions(new Set());
              setIsBatchMode(false);
            }}
            aria-label="Clear selection"
          >
            Clear
          </Button>
        </Box>
      )}

      {/* Saved Filter Presets - Load Filter Only */}
      {savedPresets.length > 0 && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, alignItems: 'center' }}>
          <Button
            size="small"
            variant="outlined"
            startIcon={<Bookmark />}
            onClick={(e) => {
              setPresetMenuAnchor(e.currentTarget);
              setShowPresetMenu(true);
            }}
            sx={{ fontSize: '0.75rem' }}
            aria-label="Load saved filter preset"
            aria-haspopup="true"
            aria-expanded={showPresetMenu}
          >
            Load Filter ({savedPresets.length})
          </Button>
          <Menu
            anchorEl={presetMenuAnchor}
            open={showPresetMenu}
            onClose={() => {
              setPresetMenuAnchor(null);
              setShowPresetMenu(false);
            }}
            aria-label="Saved filter presets menu"
          >
            {savedPresets.map((preset) => (
              <MenuItem
                key={preset.id}
                onClick={() => handleLoadPreset(preset)}
                sx={{ display: 'flex', justifyContent: 'space-between', gap: 2 }}
                aria-label={`Load filter preset: ${preset.name}`}
              >
                <span>{preset.name}</span>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeletePreset(preset.id);
                  }}
                  aria-label={`Delete filter preset: ${preset.name}`}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </MenuItem>
            ))}
          </Menu>
        </Box>
      )}


      {/* Transactions Display */}
      {(() => {
        // Client-side filtering for search query
        let filteredTransactions = transactions;
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredTransactions = transactions.filter(t => 
            t.description?.toLowerCase().includes(query) ||
            t.merchant?.toLowerCase().includes(query) ||
            t.referenceNumber?.toLowerCase().includes(query) ||
            t.category?.toLowerCase().includes(query)
          );
        }
        
        // Apply column filters
        if (columnFilters.dateFrom) {
          filteredTransactions = filteredTransactions.filter(t => {
            const tDate = new Date(t.transactionDate);
            const filterDate = new Date(columnFilters.dateFrom);
            filterDate.setHours(0, 0, 0, 0);
            return tDate >= filterDate;
          });
        }
        if (columnFilters.dateTo) {
          filteredTransactions = filteredTransactions.filter(t => {
            const tDate = new Date(t.transactionDate);
            const filterDate = new Date(columnFilters.dateTo);
            filterDate.setHours(23, 59, 59, 999);
            return tDate <= filterDate;
          });
        }
        if (columnFilters.category) {
          filteredTransactions = filteredTransactions.filter(t => 
            t.category?.toLowerCase().includes(columnFilters.category.toLowerCase())
          );
        }
        if (columnFilters.transactionType) {
          filteredTransactions = filteredTransactions.filter(t => 
            t.transactionType?.toLowerCase() === columnFilters.transactionType.toLowerCase()
          );
        }
        if (columnFilters.amountMin) {
          filteredTransactions = filteredTransactions.filter(t => 
            t.amount >= parseFloat(columnFilters.amountMin)
          );
        }
        if (columnFilters.amountMax) {
          filteredTransactions = filteredTransactions.filter(t => 
            t.amount <= parseFloat(columnFilters.amountMax)
          );
        }
        
        return filteredTransactions.length === 0 ? (
        <Card sx={{ height: '100%' }}>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <Receipt sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No transactions found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery || filters.transactionType || filters.category || filters.bankAccountId || columnFilters.dateFrom || columnFilters.dateTo
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
              {filteredTransactions.map((transaction) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={transaction.id}>
                  <TransactionCard 
                    transaction={transaction} 
                    onViewDetails={handleViewDetails}
                    onEdit={(t: BankAccountTransaction) => {
                      setTransactionToEdit(t);
                      setShowTransactionForm(true);
                    }}
                    onDelete={handleDeleteTransaction}
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
          
          {/* Table view - hidden on mobile, shown on desktop when table mode is selected */}
          <Box sx={{ 
            display: { xs: 'none', sm: viewMode === 'table' ? 'block' : 'none' }, 
            width: { xs: 'calc(100% + 16px)', sm: 'calc(100% + 32px)', md: 'calc(100% + 48px)' },
            maxWidth: { xs: 'calc(100% + 16px)', sm: 'calc(100% + 32px)', md: 'calc(100% + 48px)' },
            marginLeft: { xs: '-8px', sm: '-16px', md: '-24px' },
            marginRight: { xs: '-8px', sm: '-16px', md: '-24px' },
            paddingLeft: { xs: '8px', sm: '16px', md: '24px' },
            paddingRight: { xs: '8px', sm: '16px', md: '24px' }
          }}>
        <TableContainer 
          component={Paper} 
          sx={{ 
            mt: 2,
            width: '100%',
            maxWidth: '100%',
            overflowX: 'auto',
            // On mobile, force cards view instead of table
            display: { xs: 'none', sm: 'block' }
          }}
        >
          <Table sx={{ 
            tableLayout: 'fixed', 
            width: '100%',
            minWidth: isBatchMode ? '1200px' : '1100px',
            '& .MuiTableCell-root': {
              padding: '16px 12px',
              boxSizing: 'border-box',
              verticalAlign: 'top',
              whiteSpace: 'nowrap'
            },
            '& .MuiTableCell-head': {
              backgroundColor: 'background.paper',
              position: 'sticky',
              top: 0,
              zIndex: 10,
              borderBottom: '2px solid',
              borderColor: 'divider'
            }
          }}>
            <TableHead>
              <TableRow>
                {isBatchMode && (
                  <TableCell sx={{ width: '60px', minWidth: '60px', maxWidth: '60px' }}>
                    <Checkbox
                      indeterminate={selectedTransactions.size > 0 && selectedTransactions.size < filteredTransactions.length}
                      checked={filteredTransactions.length > 0 && selectedTransactions.size === filteredTransactions.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTransactions(new Set(filteredTransactions.map(t => t.id)));
                        } else {
                          setSelectedTransactions(new Set());
                        }
                      }}
                      aria-label="Select all transactions"
                    />
                  </TableCell>
                )}
                <TableCell sx={{ 
                  width: isBatchMode ? '350px' : '380px', 
                  minWidth: isBatchMode ? '350px' : '380px',
                  maxWidth: isBatchMode ? '350px' : '380px'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <TableSortLabel
                      active={sortField === 'transactionDate'}
                      direction={sortField === 'transactionDate' ? sortDirection : 'asc'}
                      onClick={() => handleSort('transactionDate')}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                        Date
                      </Typography>
                    </TableSortLabel>
                    <TableSortLabel
                      active={sortField === 'description'}
                      direction={sortField === 'description' ? sortDirection : 'asc'}
                      onClick={() => handleSort('description')}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                        Description
                      </Typography>
                    </TableSortLabel>
                  </Box>
                  {showFilters && (
                    <Box sx={{ mt: 1 }}>
                      <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                        <TextField
                          size="small"
                          placeholder="From"
                          value={columnFilters.dateFrom}
                          onChange={handleColumnFilterChange('dateFrom')}
                          type="date"
                          sx={{ flex: 1 }}
                          InputLabelProps={{ shrink: true }}
                        />
                        <TextField
                          size="small"
                          placeholder="To"
                          value={columnFilters.dateTo}
                          onChange={handleColumnFilterChange('dateTo')}
                          type="date"
                          sx={{ flex: 1 }}
                          InputLabelProps={{ shrink: true }}
                        />
                      </Box>
                      <TextField
                        size="small"
                        placeholder="Search description"
                        value={searchQuery || columnFilters.description}
                        onChange={(e) => {
                          handleSearchChange(e);
                        }}
                        sx={{ width: '100%' }}
                      />
                    </Box>
                  )}
                </TableCell>
                <TableCell align="right" sx={{ width: '130px', minWidth: '130px', maxWidth: '130px' }}>
                  <TableSortLabel
                    active={sortField === 'amount'}
                    direction={sortField === 'amount' ? sortDirection : 'asc'}
                    onClick={() => handleSort('amount')}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                      Amount
                    </Typography>
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
                <TableCell sx={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}>
                  <TableSortLabel
                    active={sortField === 'category'}
                    direction={sortField === 'category' ? sortDirection : 'asc'}
                    onClick={() => handleSort('category')}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                      Category
                    </Typography>
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
                <TableCell sx={{ width: '130px', minWidth: '130px', maxWidth: '130px' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                    Account
                  </Typography>
                </TableCell>
                <TableCell sx={{ width: '90px', minWidth: '90px', maxWidth: '90px' }}>
                  <TableSortLabel
                    active={sortField === 'transactionType'}
                    direction={sortField === 'transactionType' ? sortDirection : 'asc'}
                    onClick={() => handleSort('transactionType')}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.875rem' }}>
                      Type
                    </Typography>
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
                <TableCell align="center" sx={{ width: '90px', minWidth: '90px', maxWidth: '90px' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => setIsBatchMode(!isBatchMode)}
                      aria-label={isBatchMode ? 'Exit batch mode' : 'Enter batch mode'}
                      title={isBatchMode ? 'Exit batch mode' : 'Enter batch mode'}
                    >
                      {isBatchMode ? <CheckBox /> : <CheckBoxOutlineBlank />}
                    </IconButton>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '0.875rem', display: { xs: 'none', md: 'block' } }}>
                      Actions
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(() => {
                const grouped = groupBy !== 'none' 
                  ? groupTransactions(filteredTransactions)
                  : { 'All': filteredTransactions };
                
                return Object.entries(grouped).map(([groupKey, groupTransactions]) => (
                  <React.Fragment key={groupKey}>
                    {groupBy !== 'none' && (
                      <TableRow>
                        <TableCell 
                          colSpan={isBatchMode ? 8 : 7}
                          sx={{ 
                            bgcolor: 'action.hover', 
                            fontWeight: 'bold',
                            py: 1
                          }}
                          aria-label={`Group: ${groupKey}`}
                        >
                          <Typography variant="subtitle2">
                            {groupKey} ({groupTransactions.length} {groupTransactions.length === 1 ? 'transaction' : 'transactions'})
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                    {groupTransactions.map((transaction) => {
                const isCredit = transaction.transactionType === 'credit' || transaction.transactionType === 'CREDIT';
                return (
                <TableRow 
                  key={transaction.id} 
                  hover
                  sx={{
                    backgroundColor: isCredit ? 'rgba(76, 175, 80, 0.05)' : 'rgba(244, 67, 54, 0.05)',
                    '&:hover': {
                      backgroundColor: isCredit ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)',
                    }
                  }}
                  aria-label={`Transaction: ${transaction.description}, ${formatCurrency(transaction.amount)}`}
                >
                  {isBatchMode && (
                    <TableCell sx={{ width: '60px', minWidth: '60px', maxWidth: '60px' }}>
                      <Checkbox
                        checked={selectedTransactions.has(transaction.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedTransactions);
                          if (e.target.checked) {
                            newSelected.add(transaction.id);
                          } else {
                            newSelected.delete(transaction.id);
                          }
                          setSelectedTransactions(newSelected);
                        }}
                        aria-label={`Select transaction: ${transaction.description}`}
                      />
                    </TableCell>
                  )}
                  <TableCell
                    onDoubleClick={() => {
                      if (!isTransactionMonthClosed(transaction)) {
                        setEditingTransactionId(transaction.id);
                        setEditingField('description');
                        setEditingValue(transaction.description);
                      }
                    }}
                    sx={{ 
                      cursor: isTransactionMonthClosed(transaction) ? 'default' : 'pointer',
                      width: isBatchMode ? '350px' : '380px',
                      minWidth: isBatchMode ? '350px' : '380px',
                      maxWidth: isBatchMode ? '350px' : '380px'
                    }}
                    title={isTransactionMonthClosed(transaction) ? 'Month is closed' : 'Double-click to edit'}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'nowrap', overflow: 'hidden', width: '100%' }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: 'medium', 
                          fontSize: '0.875rem',
                          color: 'text.secondary',
                          minWidth: '160px',
                          flexShrink: 0
                        }}
                      >
                        {formatDateWithTime(transaction.transactionDate)}
                      </Typography>
                      {editingTransactionId === transaction.id && editingField === 'description' ? (
                        <TextField
                          size="small"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          onBlur={async () => {
                            if (editingValue !== transaction.description) {
                              try {
                                await apiService.updateBankTransaction(transaction.id, {
                                  bankAccountId: transaction.bankAccountId,
                                  amount: transaction.amount,
                                  transactionType: transaction.transactionType as 'CREDIT' | 'DEBIT',
                                  description: editingValue,
                                  category: transaction.category,
                                  merchant: transaction.merchant,
                                  location: transaction.location,
                                  notes: transaction.notes,
                                  referenceNumber: transaction.referenceNumber,
                                  transactionDate: transaction.transactionDate,
                                });
                                loadTransactionsAndAnalytics();
                              } catch (err) {
                                setError(getErrorMessage(err));
                              }
                            }
                            setEditingTransactionId(null);
                            setEditingField(null);
                            setEditingValue('');
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              (e.target as HTMLInputElement).blur();
                            }
                          }}
                          autoFocus
                          sx={{ flex: 1, minWidth: '150px' }}
                          aria-label="Edit description"
                        />
                      ) : (
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontWeight: 'medium', 
                            fontSize: '0.875rem',
                            flex: 1,
                            minWidth: '100px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                          aria-label={`Description: ${transaction.description}`}
                        >
                          {transaction.description}
                        </Typography>
                      )}
                      {transaction.merchant && (
                        <Typography 
                          variant="caption" 
                          color="text.secondary" 
                          sx={{ fontSize: '0.75rem', fontStyle: 'italic', flexShrink: 0 }}
                        >
                          ({transaction.merchant})
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ width: '130px', minWidth: '130px', maxWidth: '130px' }}>
                    <Typography 
                      variant="body1" 
                      sx={{ 
                        fontWeight: 'bold',
                        fontSize: '0.875rem',
                        color: isCredit ? 'success.main' : 'error.main'
                      }}
                    >
                      {isCredit ? '+' : '-'}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </Typography>
                  </TableCell>
                  <TableCell 
                    sx={{ width: '150px', minWidth: '150px', maxWidth: '150px' }}
                    onDoubleClick={() => {
                      if (!isTransactionMonthClosed(transaction)) {
                        setEditingTransactionId(transaction.id);
                        setEditingField('category');
                        setEditingValue(transaction.category || '');
                      }
                    }}
                    title={isTransactionMonthClosed(transaction) ? 'Month is closed' : 'Double-click to edit category'}
                  >
                    {editingTransactionId === transaction.id && editingField === 'category' ? (
                      <TextField
                        size="small"
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        onBlur={async () => {
                          if (editingValue !== transaction.category) {
                            try {
                                await apiService.updateBankTransaction(transaction.id, {
                                  bankAccountId: transaction.bankAccountId,
                                  amount: transaction.amount,
                                  transactionType: transaction.transactionType as 'CREDIT' | 'DEBIT',
                                  description: transaction.description,
                                  category: editingValue || undefined,
                                  merchant: transaction.merchant,
                                  location: transaction.location,
                                  notes: transaction.notes,
                                  referenceNumber: transaction.referenceNumber,
                                  transactionDate: transaction.transactionDate,
                                });
                              loadTransactionsAndAnalytics();
                            } catch (err) {
                              setError(getErrorMessage(err));
                            }
                          }
                          setEditingTransactionId(null);
                          setEditingField(null);
                          setEditingValue('');
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        autoFocus
                        sx={{ width: '100%' }}
                        aria-label="Edit category"
                      />
                    ) : (
                      <Chip 
                        label={transaction.category || 'Uncategorized'} 
                        color="primary"
                        size="small"
                        variant="outlined"
                        sx={{ fontSize: '0.75rem' }}
                        aria-label={`Category: ${transaction.category || 'Uncategorized'}`}
                      />
                    )}
                  </TableCell>
                  <TableCell sx={{ width: '130px', minWidth: '130px', maxWidth: '130px' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'medium', fontSize: '0.875rem' }}>
                      {transaction.accountName || 'N/A'}
                    </Typography>
                  </TableCell>
                  <TableCell sx={{ width: '90px', minWidth: '90px', maxWidth: '90px' }}>
                    <Chip 
                      label={transaction.transactionType} 
                      color={isCredit ? 'success' : 'error'}
                      size="small"
                      sx={{ fontSize: '0.75rem' }}
                    />
                  </TableCell>
                  <TableCell align="center" sx={{ width: '90px', minWidth: '90px', maxWidth: '90px' }}>
                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(transaction)}
                        sx={{ color: 'primary.main' }}
                        aria-label={`View details for transaction: ${transaction.description}`}
                        title="View details"
                      >
                        <Visibility fontSize="small" />
                      </IconButton>
                      {!isTransactionMonthClosed(transaction) && (
                        <IconButton
                          size="small"
                          onClick={() => {
                            setTransactionToEdit(transaction);
                            setShowTransactionForm(true);
                          }}
                          sx={{ color: 'info.main', padding: '4px' }}
                          aria-label={`Edit transaction: ${transaction.description}`}
                          title="Edit transaction"
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                      )}
                    </Box>
                  </TableCell>
                </TableRow>
                );
                    })}
                  </React.Fragment>
                ));
              })()}
            </TableBody>
          </Table>
        </TableContainer>
          </Box>
        </>
      );
      })()}

      {/* Pagination Controls */}
      {(() => {
        // Client-side filtering for search query
        let filteredTransactions = transactions;
        
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredTransactions = transactions.filter(t => 
            t.description?.toLowerCase().includes(query) ||
            t.merchant?.toLowerCase().includes(query) ||
            t.referenceNumber?.toLowerCase().includes(query) ||
            t.category?.toLowerCase().includes(query)
          );
        }
        
        // Apply column filters
        if (columnFilters.dateFrom) {
          filteredTransactions = filteredTransactions.filter(t => {
            const tDate = new Date(t.transactionDate);
            const filterDate = new Date(columnFilters.dateFrom);
            filterDate.setHours(0, 0, 0, 0);
            return tDate >= filterDate;
          });
        }
        if (columnFilters.dateTo) {
          filteredTransactions = filteredTransactions.filter(t => {
            const tDate = new Date(t.transactionDate);
            const filterDate = new Date(columnFilters.dateTo);
            filterDate.setHours(23, 59, 59, 999);
            return tDate <= filterDate;
          });
        }
        if (columnFilters.category) {
          filteredTransactions = filteredTransactions.filter(t => 
            t.category?.toLowerCase().includes(columnFilters.category.toLowerCase())
          );
        }
        if (columnFilters.transactionType) {
          filteredTransactions = filteredTransactions.filter(t => 
            t.transactionType?.toLowerCase() === columnFilters.transactionType.toLowerCase()
          );
        }
        if (columnFilters.amountMin) {
          filteredTransactions = filteredTransactions.filter(t => 
            t.amount >= parseFloat(columnFilters.amountMin)
          );
        }
        if (columnFilters.amountMax) {
          filteredTransactions = filteredTransactions.filter(t => 
            t.amount <= parseFloat(columnFilters.amountMax)
          );
        }
        
        return filteredTransactions.length > 0 && (
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
                  Showing {((filters.page || 1) - 1) * (filters.limit || 10) + 1} to {Math.min((filters.page || 1) * (filters.limit || 10), filteredTransactions.length)} of {filteredTransactions.length} transactions
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
                  {((filters.page || 1) - 1) * (filters.limit || 10) + 1}-{Math.min((filters.page || 1) * (filters.limit || 10), filteredTransactions.length)} of {filteredTransactions.length}
                </Typography>
              </Box>
            )}
          </Box>
          <Pagination
            count={Math.ceil(filteredTransactions.length / (filters.limit || 10))}
            page={filters.page || 1}
            onChange={handlePageChange}
            color="primary"
            showFirstButton={!isMobile}
            showLastButton={!isMobile}
            size={isMobile ? 'small' : 'medium'}
          />
        </Box>
        );
      })()}

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

              {/* Month Closed Warning */}
              {selectedTransaction && isTransactionMonthClosed(selectedTransaction) && (
                <Alert severity="warning" sx={{ mt: 2, mb: 2 }}>
                  <Typography variant="body2" fontWeight="bold" gutterBottom>
                    Month Closed
                  </Typography>
                  <Typography variant="body2">
                    {getClosedMonthMessage(selectedTransaction)}
                  </Typography>
                </Alert>
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
          
          {/* Show restore button if transaction is soft-deleted */}
          {selectedTransaction?.isDeleted ? (
            <Button 
              onClick={() => selectedTransaction && handleRestoreTransaction(selectedTransaction.id)}
              color="success"
              variant="outlined"
            >
              Restore Transaction
            </Button>
          ) : (
            <>
              {/* Check if transaction month is closed */}
              {selectedTransaction && isTransactionMonthClosed(selectedTransaction) ? (
                <>
                  <Tooltip title={getClosedMonthMessage(selectedTransaction) || 'Month is closed'} arrow>
                    <span>
                      <Button 
                        disabled
                        color="primary"
                        variant="outlined"
                        sx={{ mr: 1 }}
                      >
                        Edit Transaction
                      </Button>
                    </span>
                  </Tooltip>
                  <Tooltip title={getClosedMonthMessage(selectedTransaction) || 'Month is closed'} arrow>
                    <span>
                      <Button 
                        disabled
                        color="error"
                        variant="outlined"
                      >
                        Delete Transaction
                      </Button>
                    </span>
                  </Tooltip>
                </>
              ) : (
                <>
                  {/* Edit button */}
                  <Button 
                    onClick={() => {
                      if (selectedTransaction) {
                        setTransactionToEdit(selectedTransaction);
                        handleCloseDetails();
                        setShowTransactionForm(true);
                      }
                    }}
                    color="primary"
                    variant="outlined"
                    sx={{ mr: 1 }}
                  >
                    Edit Transaction
                  </Button>
                  {/* Regular delete (auto soft-deletes if > 24 hours) */}
                  <Button 
                    onClick={() => selectedTransaction && handleDeleteTransaction(selectedTransaction.id)}
                    color="error"
                    variant="outlined"
                  >
                    Delete Transaction
                  </Button>
                </>
              )}
            </>
          )}
        </DialogActions>
      </Dialog>

      {/* Quick Add Form Dialog */}
      <QuickAddTransactionForm
        open={showQuickAddForm}
        onClose={() => setShowQuickAddForm(false)}
        onSuccess={handleTransactionFormSuccess}
        bankAccounts={bankAccounts}
        defaultAccountId={getLastUsedAccount()}
        defaultCategory={getLastUsedCategory()}
      />

      {/* Transaction Form Dialog */}
      <TransactionForm
        open={showTransactionForm}
        onClose={() => {
          setShowTransactionForm(false);
          setTransactionToEdit(null);
        }}
        onSuccess={handleTransactionFormSuccess}
        bankAccounts={bankAccounts}
        transaction={transactionToEdit}
        defaultAccountId={getLastUsedAccount()}
        defaultCategory={getLastUsedCategory()}
      />

      {/* Save Filter Preset Dialog */}
      <Dialog
        open={showSavePresetDialog}
        onClose={() => {
          setShowSavePresetDialog(false);
          setPresetName('');
        }}
        aria-labelledby="save-preset-dialog-title"
        aria-describedby="save-preset-dialog-description"
      >
        <DialogTitle id="save-preset-dialog-title">Save Filter Preset</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Preset Name"
            fullWidth
            variant="outlined"
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            placeholder="e.g., Monthly Expenses, Work Account"
            aria-label="Enter name for filter preset"
            onKeyPress={(e) => {
              if (e.key === 'Enter' && presetName.trim()) {
                handleSavePreset();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowSavePresetDialog(false);
              setPresetName('');
            }}
            aria-label="Cancel saving filter preset"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSavePreset}
            variant="contained"
            disabled={!presetName.trim()}
            aria-label="Save filter preset"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default TransactionsPage;
