import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Grid,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { getErrorMessage } from '../../utils/validation';
import { Loan } from '../../types/loan';

interface LoanTransaction {
  id: string;
  loanId: string;
  type: 'PAYMENT' | 'DISBURSEMENT';
  amount: number;
  description: string;
  reference: string;
  createdAt: string;
}

interface LoanTransactionHistoryProps {
  open: boolean;
  onClose: () => void;
  loanId: string;
  loanPurpose?: string;
  loanData?: Loan; // Add loan data for fallback calculation
}

const LoanTransactionHistory: React.FC<LoanTransactionHistoryProps> = ({
  open,
  onClose,
  loanId,
  loanPurpose,
  loanData,
}) => {
  const [transactions, setTransactions] = useState<LoanTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open && loanId) {
      loadTransactions();
    }
  }, [open, loanId]);

  const loadTransactions = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const data = await apiService.getLoanTransactions(loanId);
      console.log('🔍 Loan Transaction History - Raw API Response:', data);
      setTransactions(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load transaction history'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    if (window.confirm('Are you sure you want to delete this payment? This action cannot be undone.')) {
      try {
        await apiService.deletePayment(paymentId);
        // Reload transactions after successful deletion
        loadTransactions();
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to delete payment'));
      }
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return <TrendingDownIcon color="success" />;
      case 'DISBURSEMENT':
        return <TrendingUpIcon color="primary" />;
      default:
        return <PaymentIcon />;
    }
  };

  const getTransactionTypeColor = (type: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (type) {
      case 'PAYMENT':
        return 'success';
      case 'DISBURSEMENT':
        return 'primary';
      default:
        return 'default';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTotalPayments = (): number => {
    const payments = transactions.filter(t => t.type === 'PAYMENT');
    const total = payments.reduce((sum, t) => sum + t.amount, 0);
    console.log('💰 Total Payments Calculation:', { payments, total });
    return total;
  };

  const getTotalDisbursements = (): number => {
    // First, try to calculate from transaction data
    const disbursements = transactions.filter(t => t.type === 'DISBURSEMENT');
    const totalFromTransactions = disbursements.reduce((sum, t) => sum + t.amount, 0);
    
    console.log('💸 Total Disbursements Calculation:', { 
      disbursements, 
      totalFromTransactions,
      loanData: loanData ? { principal: loanData.principal, totalAmount: loanData.totalAmount } : 'No loan data'
    });
    
    // If no disbursement transactions found, use loan principal as fallback
    if (totalFromTransactions === 0 && loanData) {
      console.log('⚠️ No disbursement transactions found, using loan principal as fallback:', loanData.principal);
      return loanData.principal;
    }
    
    return totalFromTransactions;
  };

  const getTransactionBreakdown = () => {
    const payments = transactions.filter(t => t.type === 'PAYMENT');
    const disbursements = transactions.filter(t => t.type === 'DISBURSEMENT');
    
    return {
      payments: payments.length,
      disbursements: disbursements.length,
      totalTransactions: transactions.length,
    };
  };

  const breakdown = getTransactionBreakdown();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PaymentIcon />
          <Typography variant="h6">
            Transaction History
          </Typography>
        </Box>
        {loanPurpose && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Loan: {loanPurpose}
          </Typography>
        )}
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>

            {/* Summary Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Tooltip
                  title={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        What is "Total Disbursed"?
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • It's the loan amount - The actual amount you received
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • It's a one-time event - Money is disbursed only once when loan is approved
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • It doesn't change - No matter how many payments you make, the disbursed amount stays the same
                      </Typography>
                      <Typography variant="body2">
                        • It's separate from interest - Interest is calculated on top of the disbursed amount
                      </Typography>
                    </Box>
                  }
                  arrow
                  placement="top"
                >
                  <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1, textAlign: 'center', cursor: 'help' }}>
                    <Typography variant="h6" color="primary.contrastText">
                      {formatCurrency(getTotalDisbursements())}
                    </Typography>
                    <Typography variant="body2" color="primary.contrastText">
                      Total Disbursed
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
              <Grid item xs={6}>
                <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="h6" color="success.contrastText">
                    {formatCurrency(getTotalPayments())}
                  </Typography>
                  <Typography variant="body2" color="success.contrastText">
                    Total Paid
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Divider sx={{ mb: 2 }} />

            {/* Transaction List */}
            {transactions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                  No transactions found for this loan.
                </Typography>
                {loanData && (
                  <Alert severity="info">
                    <Typography variant="body2">
                      This loan has a loan amount of {formatCurrency(loanData.principal)}.
                      The "Total Disbursed" above shows this amount as a fallback.
                    </Typography>
                  </Alert>
                )}
              </Box>
            ) : (
              <List>
                {transactions.map((transaction, index) => (
                  <React.Fragment key={transaction.id}>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemIcon>
                        {getTransactionIcon(transaction.type)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography variant="subtitle1">
                              {transaction.description}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography 
                                variant="h6" 
                                color={transaction.type === 'PAYMENT' ? 'success.main' : 'primary.main'}
                              >
                                {transaction.type === 'PAYMENT' ? '-' : '+'}{formatCurrency(transaction.amount)}
                              </Typography>
                              {transaction.type === 'PAYMENT' && (
                                <Tooltip title="Delete Payment">
                                  <IconButton
                                    size="small"
                                    onClick={() => handleDeletePayment(transaction.id)}
                                    sx={{ color: 'error.main' }}
                                  >
                                    <DeleteIcon fontSize="small" />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Box>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                            <Box>
                              <Chip
                                label={transaction.type}
                                size="small"
                                color={getTransactionTypeColor(transaction.type)}
                                sx={{ mr: 1 }}
                              />
                              <Typography variant="body2" color="text.secondary" component="span">
                                Ref: {transaction.reference}
                              </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary">
                              {formatDate(transaction.createdAt)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < transactions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoanTransactionHistory;
