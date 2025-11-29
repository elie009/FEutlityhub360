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
  Alert,
} from '@mui/material';
import {
  Person,
  AttachMoney,
  Schedule,
  TrendingUp,
  Payment,
  CalendarToday,
  CheckCircle,
  Warning,
  Delete,
  History,
  Edit,
  EventAvailable,
  NotificationImportant,
} from '@mui/icons-material';
import { Receivable, ReceivableStatus } from '../../types/receivable';
import { formatDueDate, getDueDateColor, isOverdue, isDueToday, isDueSoon } from '../../utils/dateUtils';
import { useCurrency } from '../../contexts/CurrencyContext';

interface ReceivableCardProps {
  receivable: Receivable;
  onEdit: (receivable: Receivable) => void;
  onRecordPayment?: (receivableId: string) => void;
  onDelete?: (receivableId: string) => void;
  onViewHistory?: (receivableId: string) => void;
}

const getStatusColor = (status: ReceivableStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case ReceivableStatus.ACTIVE:
      return 'success';
    case ReceivableStatus.COMPLETED:
      return 'info';
    case ReceivableStatus.OVERDUE:
      return 'error';
    case ReceivableStatus.CANCELLED:
      return 'secondary';
    default:
      return 'default';
  }
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const ReceivableCard: React.FC<ReceivableCardProps> = ({ 
  receivable, 
  onEdit, 
  onRecordPayment, 
  onDelete, 
  onViewHistory 
}) => {
  const { formatCurrency } = useCurrency();
  const remainingPayments = Math.ceil(receivable.remainingBalance / receivable.monthlyPayment);

  // Due date tracking
  const hasNextDueDate = receivable.nextPaymentDueDate && receivable.status === ReceivableStatus.ACTIVE;
  const dueDateColor = getDueDateColor(receivable.nextPaymentDueDate);
  const showDueDateAlert = hasNextDueDate && (isOverdue(receivable.nextPaymentDueDate) || isDueToday(receivable.nextPaymentDueDate) || isDueSoon(receivable.nextPaymentDueDate, 3));

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Typography variant="h6" component="div">
            {receivable.borrowerName}
          </Typography>
          <Chip
            label={receivable.status}
            color={getStatusColor(receivable.status)}
            size="small"
          />
        </Box>

        {receivable.borrowerContact && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {receivable.borrowerContact}
          </Typography>
        )}

        {receivable.purpose && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            {receivable.purpose}
          </Typography>
        )}

        {/* Next Due Date Alert */}
        {showDueDateAlert && (
          <Alert 
            severity={dueDateColor === 'error' ? 'error' : dueDateColor === 'warning' ? 'warning' : 'info'}
            icon={
              isOverdue(receivable.nextPaymentDueDate) ? <NotificationImportant /> :
              isDueToday(receivable.nextPaymentDueDate) ? <Warning /> :
              <EventAvailable />
            }
            sx={{ my: 1 }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {formatDueDate(receivable.nextPaymentDueDate)}
            </Typography>
          </Alert>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Main Financial Information */}
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoney sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Principal
              </Typography>
            </Box>
            <Typography variant="h6">
              {formatCurrency(receivable.principal)}
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
              {receivable.interestRate}%
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
              {receivable.term} months
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Person sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Payments Made
              </Typography>
            </Box>
            <Typography variant="h6">
              {receivable.paymentCount}
            </Typography>
          </Grid>
        </Grid>

        {/* Payment Information */}
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f0fdf4', borderRadius: 1, border: '1px solid #bbf7d0' }}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Payment sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Monthly Payment
                </Typography>
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'info.main',
                  bgcolor: 'info.lighter',
                  p: 0.75,
                  borderRadius: 1,
                  textAlign: 'center'
                }}
              >
                {formatCurrency(receivable.monthlyPayment)}
              </Typography>
            </Grid>

            <Grid item xs={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney sx={{ mr: 1, fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Remaining Balance
                </Typography>
              </Box>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 700, 
                  color: 'warning.main',
                  bgcolor: 'warning.lighter',
                  p: 0.75,
                  borderRadius: 1,
                  textAlign: 'center'
                }}
              >
                {formatCurrency(receivable.remainingBalance)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Total Paid */}
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'success.lighter', borderRadius: 1, border: '1px solid', borderColor: 'success.light' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <CheckCircle sx={{ mr: 1, fontSize: 18, color: 'success.main' }} />
              <Typography variant="body2" color="text.secondary">
                Total Paid
              </Typography>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main' }}>
              {formatCurrency(receivable.totalPaid)}
            </Typography>
          </Box>
          {remainingPayments > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {remainingPayments} payment{remainingPayments !== 1 ? 's' : ''} remaining
            </Typography>
          )}
        </Box>

        {/* Action Buttons */}
        <Box sx={{ mt: 3, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {receivable.status === ReceivableStatus.ACTIVE && onRecordPayment && (
            <Button
              variant="contained"
              size="small"
              onClick={() => onRecordPayment(receivable.id)}
              startIcon={<Payment />}
              color="success"
              sx={{ flex: 1, minWidth: '120px' }}
            >
              Record Payment
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={() => onEdit(receivable)}
            startIcon={<Edit />}
            sx={{ flex: 1, minWidth: '100px' }}
          >
            Edit
          </Button>
          {onViewHistory && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onViewHistory(receivable.id)}
              startIcon={<History />}
              sx={{ flex: 1, minWidth: '100px' }}
            >
              History
            </Button>
          )}
          {onDelete && (
            <Button
              variant="outlined"
              size="small"
              onClick={() => onDelete(receivable.id)}
              startIcon={<Delete />}
              color="error"
              sx={{ flex: 1, minWidth: '100px' }}
            >
              Delete
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default ReceivableCard;

