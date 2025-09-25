import React from 'react';
import {
  Card, CardContent, Typography, Box, Chip, Grid, Divider,
  IconButton, Menu, MenuItem,
} from '@mui/material';
import {
  MoreVert, TrendingUp, TrendingDown, Receipt, LocationOn,
  Schedule, AccountBalance, AttachMoney, Category, Store,
} from '@mui/icons-material';
import { BankAccountTransaction } from '../../types/transaction';

interface TransactionCardProps {
  transaction: BankAccountTransaction;
  onViewDetails?: (transaction: BankAccountTransaction) => void;
}

const getTransactionTypeColor = (type: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (type) {
    case 'credit': return 'success';
    case 'debit': return 'error';
    case 'transfer': return 'info';
    default: return 'default';
  }
};

const getTransactionTypeIcon = (type: string) => {
  switch (type) {
    case 'credit': return <TrendingUp sx={{ fontSize: 16 }} />;
    case 'debit': return <TrendingDown sx={{ fontSize: 16 }} />;
    case 'transfer': return <AccountBalance sx={{ fontSize: 16 }} />;
    default: return <Receipt sx={{ fontSize: 16 }} />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'food': return <Store sx={{ fontSize: 16 }} />;
    case 'utilities': return <AttachMoney sx={{ fontSize: 16 }} />;
    case 'transportation': return <LocationOn sx={{ fontSize: 16 }} />;
    case 'income': return <TrendingUp sx={{ fontSize: 16 }} />;
    case 'interest': return <AttachMoney sx={{ fontSize: 16 }} />;
    case 'dividend': return <TrendingUp sx={{ fontSize: 16 }} />;
    case 'payment': return <Receipt sx={{ fontSize: 16 }} />;
    case 'cash': return <AttachMoney sx={{ fontSize: 16 }} />;
    default: return <Category sx={{ fontSize: 16 }} />;
  }
};

const getCategoryColor = (category: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (category) {
    case 'food': return 'warning';
    case 'utilities': return 'info';
    case 'transportation': return 'secondary';
    case 'income': return 'success';
    case 'interest': return 'success';
    case 'dividend': return 'success';
    case 'payment': return 'error';
    case 'cash': return 'default';
    default: return 'default';
  }
};

const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};


const formatDateShort = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onViewDetails }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleViewDetails = () => {
    onViewDetails?.(transaction);
    handleMenuClose();
  };

  const isCredit = transaction.transactionType === 'credit';
  const amountColor = isCredit ? 'success.main' : 'error.main';
  const amountPrefix = isCredit ? '+' : '-';

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {transaction.description}
          </Typography>
          <IconButton
            aria-label="settings"
            onClick={handleMenuClick}
            size="small"
            sx={{ p: 0 }}
          >
            <MoreVert />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip
            label={transaction.transactionType}
            icon={getTransactionTypeIcon(transaction.transactionType)}
            color={getTransactionTypeColor(transaction.transactionType)}
            size="small"
          />
          <Chip
            label={transaction.category}
            icon={getCategoryIcon(transaction.category)}
            color={getCategoryColor(transaction.category)}
            size="small"
          />
          {transaction.isRecurring && (
            <Chip
              label="Recurring"
              icon={<Schedule sx={{ fontSize: 16 }} />}
              color="info"
              size="small"
            />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Main Transaction Information */}
        <Box sx={{ mb: 2 }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              color: amountColor,
              fontWeight: 'bold',
              textAlign: 'right'
            }}
          >
            {amountPrefix}{formatCurrency(Math.abs(transaction.amount), transaction.currency)}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ textAlign: 'right' }}
          >
            Balance: {formatCurrency(transaction.balanceAfterTransaction, transaction.currency)}
          </Typography>
        </Box>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Date:</Typography>
            <Typography variant="body2" fontWeight="medium">
              {formatDateShort(transaction.transactionDate)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Time:</Typography>
            <Typography variant="body2" fontWeight="medium">
              {new Date(transaction.transactionDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Typography>
          </Grid>
          {transaction.merchant && (
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Merchant:</Typography>
              <Typography variant="body2" fontWeight="medium">
                {transaction.merchant}
              </Typography>
            </Grid>
          )}
          {transaction.location && (
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Location:</Typography>
              <Typography variant="body2" fontWeight="medium">
                {transaction.location}
              </Typography>
            </Grid>
          )}
        </Grid>

        {transaction.notes && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Notes:
            </Typography>
            <Typography variant="body2">
              {transaction.notes}
            </Typography>
          </Box>
        )}

        {transaction.referenceNumber && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Reference:
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {transaction.referenceNumber}
            </Typography>
          </Box>
        )}

        {transaction.isRecurring && transaction.recurringFrequency && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'info.50', borderRadius: 1 }}>
            <Typography variant="caption" color="info.main">
              🔄 Recurring {transaction.recurringFrequency}
            </Typography>
          </Box>
        )}
      </CardContent>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleViewDetails}>
          <Receipt sx={{ mr: 1, fontSize: 16 }} />
          View Details
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default TransactionCard;
