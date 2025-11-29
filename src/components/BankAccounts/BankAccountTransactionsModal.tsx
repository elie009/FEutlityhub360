import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore,
  TrendingUp,
  TrendingDown,
  Close as CloseIcon,
  CalendarMonth,
  Lock as LockIcon,
} from '@mui/icons-material';
import { BankAccount } from '../../types/bankAccount';
import { BankAccountTransaction } from '../../types/transaction';
import { apiService } from '../../services/api';
import { useCurrency } from '../../contexts/CurrencyContext';

interface BankAccountTransactionsModalProps {
  open: boolean;
  onClose: () => void;
  account: BankAccount | null;
}

interface MonthlyTransactions {
  month: string;
  monthLabel: string;
  transactions: BankAccountTransaction[];
  totalCredits: number;
  totalDebits: number;
  netAmount: number;
}

const BankAccountTransactionsModal: React.FC<BankAccountTransactionsModalProps> = ({
  open,
  onClose,
  account,
}) => {
  const { formatCurrency } = useCurrency();
  const [transactions, setTransactions] = useState<BankAccountTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [closedMonths, setClosedMonths] = useState<Set<string>>(new Set()); // Set of "YYYY-MM" strings

  // Fetch transactions and closed months when modal opens
  useEffect(() => {
    if (open && account) {
      fetchTransactions();
      loadClosedMonths();
    } else {
      // Reset when modal closes
      setTransactions([]);
      setSelectedMonth('all');
      setError('');
      setClosedMonths(new Set());
    }
  }, [open, account]);

  const loadClosedMonths = async () => {
    if (!account) return;

    try {
      const closed = await apiService.getClosedMonths(account.id);
      // Create a Set of "YYYY-MM" strings for quick lookup
      const monthSet = new Set<string>();
      closed.forEach((cm: any) => {
        const monthKey = `${cm.year}-${String(cm.month).padStart(2, '0')}`;
        monthSet.add(monthKey);
      });
      setClosedMonths(monthSet);
    } catch (err) {
      console.error('Failed to load closed months:', err);
    }
  };

  const isTransactionMonthClosed = (transaction: BankAccountTransaction): boolean => {
    if (!transaction.transactionDate) {
      return false;
    }
    
    const transactionDate = new Date(transaction.transactionDate);
    const monthKey = `${transactionDate.getFullYear()}-${String(transactionDate.getMonth() + 1).padStart(2, '0')}`;
    
    return closedMonths.has(monthKey);
  };

  const fetchTransactions = async () => {
    if (!account) return;

    try {
      setLoading(true);
      setError('');

      // Get current date and calculate date range (last 12 months)
      const now = new Date();
      const dateTo = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of current month
      const dateFrom = new Date(now.getFullYear() - 1, now.getMonth(), 1); // First day 12 months ago

      // Format dates as YYYY-MM-DD
      const dateFromStr = dateFrom.toISOString().split('T')[0];
      const dateToStr = dateTo.toISOString().split('T')[0];

      // Use the API with dateFrom and dateTo parameters
      const response = await apiService.getBankAccountTransactions({
        bankAccountId: account.id,
        page: 1,
        limit: 1000,
        dateFrom: dateFromStr,
        dateTo: dateToStr,
      });

      if (response && response.success && Array.isArray(response.data)) {
        setTransactions(response.data);
        // Extract unique months from transactions
        const months = extractUniqueMonths(response.data);
        setAvailableMonths(months);
      } else {
        setError(response?.message || 'No transactions found');
        setTransactions([]);
      }
    } catch (err: any) {
      console.error('Failed to fetch transactions:', err);
      setError(err.message || 'Failed to load transactions');
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const extractUniqueMonths = (txns: BankAccountTransaction[]): string[] => {
    const monthSet = new Set<string>();
    txns.forEach(txn => {
      const date = new Date(txn.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthSet.add(monthKey);
    });
    return Array.from(monthSet).sort().reverse(); // Most recent first
  };

  // Group transactions by month
  const monthlyTransactions = useMemo((): MonthlyTransactions[] => {
    const grouped = new Map<string, BankAccountTransaction[]>();

    transactions.forEach(txn => {
      const date = new Date(txn.transactionDate);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)!.push(txn);
    });

    const monthly: MonthlyTransactions[] = [];

    grouped.forEach((txns, monthKey) => {
      // Sort transactions by date (newest first)
      txns.sort((a, b) => new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime());

      const totalCredits = txns
        .filter(t => t.transactionType === 'CREDIT')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalDebits = txns
        .filter(t => t.transactionType === 'DEBIT')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      const netAmount = totalCredits - totalDebits;

      const date = new Date(txns[0].transactionDate);
      const monthLabel = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });

      monthly.push({
        month: monthKey,
        monthLabel,
        transactions: txns,
        totalCredits,
        totalDebits,
        netAmount,
      });
    });

    // Sort by month (newest first)
    return monthly.sort((a, b) => b.month.localeCompare(a.month));
  }, [transactions]);

  // Filter by selected month
  const filteredMonthlyTransactions = useMemo(() => {
    if (selectedMonth === 'all') {
      return monthlyTransactions;
    }
    return monthlyTransactions.filter(m => m.month === selectedMonth);
  }, [monthlyTransactions, selectedMonth]);

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTransactionTypeColor = (type: string): 'success' | 'error' => {
    return type === 'CREDIT' ? 'success' : 'error';
  };

  const getTransactionTypeIcon = (type: string) => {
    return type === 'CREDIT' ? <TrendingUp fontSize="small" /> : <TrendingDown fontSize="small" />;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h5">Transactions</Typography>
            {account && (
              <Typography variant="body2" color="text.secondary">
                {account.accountName} - {account.financialInstitution || 'N/A'}
              </Typography>
            )}
          </Box>
          <Button onClick={onClose} color="inherit" size="small">
            <CloseIcon />
          </Button>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {account && (
          <Box>
            {/* Month Filter */}
            <Box sx={{ mb: 3 }}>
              <FormControl fullWidth size="small">
                <InputLabel>Filter by Month</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  label="Filter by Month"
                >
                  <MenuItem value="all">All Months</MenuItem>
                  {availableMonths.map(monthKey => {
                    const [year, month] = monthKey.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1, 1);
                    const label = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
                    return (
                      <MenuItem key={monthKey} value={monthKey}>
                        {label}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>

            {/* Loading State */}
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            )}

            {/* Error State */}
            {error && !loading && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {/* Transactions by Month */}
            {!loading && !error && filteredMonthlyTransactions.length > 0 ? (
              <Box>
                {filteredMonthlyTransactions.map((monthData) => (
                  <Accordion key={monthData.month} defaultExpanded={selectedMonth === 'all' ? filteredMonthlyTransactions.length === 1 : true}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', pr: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarMonth sx={{ color: 'text.secondary' }} />
                          <Typography variant="h6">{monthData.monthLabel}</Typography>
                          <Chip
                            label={`${monthData.transactions.length} transaction${monthData.transactions.length !== 1 ? 's' : ''}`}
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 2 }}>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">Credits</Typography>
                            <Typography variant="body2" color="success.main" fontWeight="bold">
                              {formatCurrency(monthData.totalCredits)}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">Debits</Typography>
                            <Typography variant="body2" color="error.main" fontWeight="bold">
                              {formatCurrency(monthData.totalDebits)}
                            </Typography>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="caption" color="text.secondary">Net</Typography>
                            <Typography 
                              variant="body2" 
                              color={monthData.netAmount >= 0 ? 'success.main' : 'error.main'} 
                              fontWeight="bold"
                            >
                              {formatCurrency(monthData.netAmount)}
                            </Typography>
                          </Box>
                        </Box>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <TableContainer component={Paper} variant="outlined">
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Date</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Description</TableCell>
                              <TableCell>Category</TableCell>
                              <TableCell align="right">Amount</TableCell>
                              <TableCell align="right">Balance</TableCell>
                              <TableCell>Reference</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {monthData.transactions.map((txn) => {
                              const isClosed = isTransactionMonthClosed(txn);
                              return (
                                <TableRow 
                                  key={txn.id} 
                                  hover
                                  sx={{
                                    opacity: isClosed ? 0.7 : 1,
                                    backgroundColor: isClosed ? 'rgba(255, 152, 0, 0.05)' : 'inherit',
                                  }}
                                >
                                  <TableCell>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                      {formatDate(txn.transactionDate)}
                                      {isClosed && (
                                        <Tooltip title="Month is closed - transaction cannot be edited or deleted">
                                          <Chip
                                            icon={<LockIcon />}
                                            label="Closed"
                                            size="small"
                                            color="warning"
                                            variant="outlined"
                                            sx={{ height: 20, fontSize: '0.65rem' }}
                                          />
                                        </Tooltip>
                                      )}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Chip
                                      icon={getTransactionTypeIcon(txn.transactionType)}
                                      label={txn.transactionType}
                                      color={txn.transactionType === 'DEBIT' ? undefined : getTransactionTypeColor(txn.transactionType)}
                                      size="small"
                                      sx={{
                                        backgroundColor: txn.transactionType === 'DEBIT' ? 'rgba(244, 67, 54, 0.2)' : undefined,
                                        color: txn.transactionType === 'DEBIT' ? 'rgb(244, 67, 54)' : undefined,
                                        border: txn.transactionType === 'DEBIT' ? '1px solid rgb(244, 67, 54)' : undefined,
                                      }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">{txn.description}</Typography>
                                    {txn.merchant && (
                                      <Typography variant="caption" color="text.secondary">
                                        {txn.merchant}
                                      </Typography>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Chip label={txn.category || 'N/A'} size="small" variant="outlined" />
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography
                                      variant="body2"
                                      fontWeight="bold"
                                      color={txn.transactionType === 'CREDIT' ? 'success.main' : 'error.main'}
                                    >
                                      {txn.transactionType === 'CREDIT' ? '+' : '-'}
                                      {formatCurrency(Math.abs(txn.amount))}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2">
                                      {formatCurrency(txn.balanceAfterTransaction)}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                      {txn.referenceNumber || 'N/A'}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            ) : !loading && !error && transactions.length === 0 ? (
              <Alert severity="info">
                No transactions found for this account.
              </Alert>
            ) : null}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BankAccountTransactionsModal;

