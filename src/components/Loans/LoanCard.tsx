import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import {
  AccountBalance,
  Schedule,
  TrendingUp,
  Payment,
} from '@mui/icons-material';
import { Loan, LoanStatus } from '../../types/loan';

interface LoanCardProps {
  loan: Loan;
  onViewDetails: (loanId: string) => void;
  onMakePayment?: (loanId: string) => void;
}

const getStatusColor = (status: LoanStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case LoanStatus.ACTIVE:
      return 'success';
    case LoanStatus.PENDING:
      return 'warning';
    case LoanStatus.APPROVED:
      return 'info';
    case LoanStatus.OVERDUE:
      return 'error';
    case LoanStatus.CLOSED:
      return 'default';
    case LoanStatus.REJECTED:
      return 'error';
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
  return new Date(dateString).toLocaleDateString();
};

const LoanCard: React.FC<LoanCardProps> = ({ loan, onViewDetails, onMakePayment }) => {
  const monthlyPayment = loan.totalAmount / loan.term;
  const remainingPayments = Math.ceil(loan.outstandingBalance / monthlyPayment);

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div">
            Loan #{loan.id.slice(-8)}
          </Typography>
          <Chip
            label={loan.status}
            color={getStatusColor(loan.status)}
            size="small"
          />
        </Box>

        <Typography variant="body2" color="text.secondary" gutterBottom>
          {loan.purpose}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AccountBalance sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Principal
              </Typography>
            </Box>
            <Typography variant="h6">
              {formatCurrency(loan.principal)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <TrendingUp sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Interest Rate
              </Typography>
            </Box>
            <Typography variant="h6">
              {loan.interestRate}%
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Schedule sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Term
              </Typography>
            </Box>
            <Typography variant="h6">
              {loan.term} months
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Payment sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Outstanding
              </Typography>
            </Box>
            <Typography variant="h6" color={loan.outstandingBalance > 0 ? 'error.main' : 'success.main'}>
              {formatCurrency(loan.outstandingBalance)}
            </Typography>
          </Grid>
        </Grid>

        {loan.status === LoanStatus.ACTIVE && remainingPayments > 0 && (
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Monthly Payment: {formatCurrency(monthlyPayment)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Remaining Payments: {remainingPayments}
            </Typography>
          </Box>
        )}

        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onViewDetails(loan.id)}
            fullWidth
          >
            View Details
          </Button>
          {loan.status === LoanStatus.ACTIVE && loan.outstandingBalance > 0 && onMakePayment && (
            <Button
              variant="contained"
              size="small"
              onClick={() => onMakePayment(loan.id)}
              fullWidth
            >
              Make Payment
            </Button>
          )}
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Created: {formatDate(loan.createdAt)}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default LoanCard;
