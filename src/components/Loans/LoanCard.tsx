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
  AttachMoney,
  CalendarToday,
  CheckCircle,
  Pending,
  Delete,
  History,
} from '@mui/icons-material';
import { Loan, LoanStatus } from '../../types/loan';

interface LoanCardProps {
  loan: Loan;
  onUpdate: (loan: Loan) => void;
  onMakePayment?: (loanId: string) => void;
  onDelete?: (loanId: string) => void;
  onViewHistory?: (loanId: string) => void;
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

const LoanCard: React.FC<LoanCardProps> = ({ loan, onUpdate, onMakePayment, onDelete, onViewHistory }) => {
  // Use the actual monthlyPayment from the loan data, or calculate it if not available
  const monthlyPayment = loan.monthlyPayment || (loan.totalAmount / loan.term);
  const remainingBalance = loan.remainingBalance || loan.outstandingBalance;
  const remainingPayments = Math.ceil(remainingBalance / monthlyPayment);

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

        {/* Main Financial Information */}
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
              <AttachMoney sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Total Amount
              </Typography>
            </Box>
            <Typography variant="h6">
              {formatCurrency(loan.totalAmount)}
            </Typography>
          </Grid>
        </Grid>

        {/* Payment Information */}
        <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Payment sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Monthly Payment
                </Typography>
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {formatCurrency(monthlyPayment)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalance sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Remaining Balance
                </Typography>
              </Box>
              <Typography 
                variant="body1" 
                fontWeight="medium"
                color={remainingBalance > 0 ? 'error.main' : 'success.main'}
              >
                {formatCurrency(remainingBalance)}
              </Typography>
            </Grid>
          </Grid>

          {loan.status === LoanStatus.ACTIVE && remainingPayments > 0 && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Remaining Payments: {remainingPayments}
            </Typography>
          )}
        </Box>

        {/* Timeline Information */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            <CalendarToday sx={{ mr: 1, fontSize: 16, verticalAlign: 'middle' }} />
            Timeline
          </Typography>
          
          <Box sx={{ ml: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Pending sx={{ mr: 1, fontSize: 14, color: 'warning.main' }} />
              <Typography variant="caption" color="text.secondary">
                Applied: {formatDate(loan.appliedAt || loan.createdAt)}
              </Typography>
            </Box>
            
            {loan.approvedAt && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <CheckCircle sx={{ mr: 1, fontSize: 14, color: 'success.main' }} />
                <Typography variant="caption" color="text.secondary">
                  Approved: {formatDate(loan.approvedAt)}
                </Typography>
              </Box>
            )}
            
            {loan.disbursedAt && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <CheckCircle sx={{ mr: 1, fontSize: 14, color: 'info.main' }} />
                <Typography variant="caption" color="text.secondary">
                  Disbursed: {formatDate(loan.disbursedAt)}
                </Typography>
              </Box>
            )}
            
            {loan.completedAt && (
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                <CheckCircle sx={{ mr: 1, fontSize: 14, color: 'success.main' }} />
                <Typography variant="caption" color="text.secondary">
                  Completed: {formatDate(loan.completedAt)}
                </Typography>
              </Box>
            )}
          </Box>
        </Box>

        <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onUpdate(loan)}
            sx={{ flex: 1, minWidth: '80px' }}
          >
            Update
          </Button>
          {onViewHistory && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onViewHistory(loan.id)}
              startIcon={<History />}
              sx={{ flex: 1, minWidth: '80px' }}
            >
              History
            </Button>
          )}
          {loan.status === LoanStatus.ACTIVE && remainingBalance > 0 && onMakePayment && (
            <Button
              variant="contained"
              size="small"
              onClick={() => onMakePayment(loan.id)}
              sx={{ flex: 1, minWidth: '80px' }}
            >
              Payment
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outlined"
              size="small"
              color="error"
              onClick={() => onDelete(loan.id)}
              startIcon={<Delete />}
              sx={{ minWidth: 'auto', px: 1 }}
            >
              Delete
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default LoanCard;
