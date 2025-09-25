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
} from '@mui/material';
import {
  Payment as PaymentIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { getErrorMessage } from '../../utils/validation';

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
}

const LoanTransactionHistory: React.FC<LoanTransactionHistoryProps> = ({
  open,
  onClose,
  loanId,
  loanPurpose,
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
      setTransactions(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load transaction history'));
    } finally {
      setIsLoading(false);
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
      style: 'currency',
      currency: 'USD',
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
    return transactions
      .filter(t => t.type === 'PAYMENT')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalDisbursements = (): number => {
    return transactions
      .filter(t => t.type === 'DISBURSEMENT')
      .reduce((sum, t) => sum + t.amount, 0);
  };

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
                <Box sx={{ p: 2, bgcolor: 'primary.light', borderRadius: 1, textAlign: 'center' }}>
                  <Typography variant="h6" color="primary.contrastText">
                    {formatCurrency(getTotalDisbursements())}
                  </Typography>
                  <Typography variant="body2" color="primary.contrastText">
                    Total Disbursed
                  </Typography>
                </Box>
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
              <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                No transactions found for this loan.
              </Typography>
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
                            <Typography 
                              variant="h6" 
                              color={transaction.type === 'PAYMENT' ? 'success.main' : 'primary.main'}
                            >
                              {transaction.type === 'PAYMENT' ? '-' : '+'}{formatCurrency(transaction.amount)}
                            </Typography>
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
