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
import { useCurrency } from '../../contexts/CurrencyContext';

interface TransactionCardProps {
  transaction: BankAccountTransaction;
  onViewDetails?: (transaction: BankAccountTransaction) => void;
}

const getTransactionTypeColor = (type: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (type.toLowerCase()) {
    case 'credit': return 'success';
    case 'debit': return 'error';
    case 'transfer': return 'info';
    default: return 'default';
  }
};

const getTransactionTypeIcon = (type: string) => {
  switch (type.toLowerCase()) {
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



const formatDateShort = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onViewDetails }) => {
  const { formatCurrency } = useCurrency();
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

  const isCredit = transaction.transactionType === 'credit' || transaction.transactionType === 'CREDIT';
  const amountColor = isCredit ? 'success.main' : 'error.main';
  const amountPrefix = isCredit ? '+' : '-';

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      '&:hover': {
        boxShadow: 2,
        transform: 'translateY(-1px)',
        transition: 'all 0.2s ease'
      }
    }}>
      <CardContent sx={{ flexGrow: 1, p: 2, '&:last-child': { pb: 2 } }}>
        {/* Header Row - Description and Menu */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography 
            variant="body1" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600,
              fontSize: '0.95rem',
              lineHeight: 1.3,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical'
            }}
          >
            {transaction.description}
          </Typography>
          <IconButton
            aria-label="settings"
            onClick={handleMenuClick}
            size="small"
            sx={{ p: 0.5, ml: 1 }}
          >
            <MoreVert sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>

        {/* Compact Info Row */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            <Chip
              label={transaction.transactionType}
              icon={getTransactionTypeIcon(transaction.transactionType)}
              color={getTransactionTypeColor(transaction.transactionType)}
              size="small"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
            <Chip
              label={transaction.category}
              icon={getCategoryIcon(transaction.category)}
              color={getCategoryColor(transaction.category)}
              size="small"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
            {transaction.isRecurring && (
              <Chip
                label="Recurring"
                icon={<Schedule sx={{ fontSize: 12 }} />}
                color="info"
                size="small"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}
          </Box>
          
          {/* Amount and Date in one line */}
          <Box sx={{ textAlign: 'right', minWidth: 'fit-content' }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                color: amountColor,
                fontWeight: 'bold',
                fontSize: '1.1rem',
                lineHeight: 1.2
              }}
            >
              {amountPrefix}{formatCurrency(Math.abs(transaction.amount))}
            </Typography>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ fontSize: '0.7rem' }}
            >
              {formatDateShort(transaction.transactionDate)}
            </Typography>
          </Box>
        </Box>

        {/* Compact Details Grid */}
        <Grid container spacing={1} sx={{ mb: 1 }}>
          {transaction.merchant && (
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Merchant:
              </Typography>
              <Typography variant="caption" fontWeight="medium" sx={{ fontSize: '0.75rem', display: 'block' }}>
                {transaction.merchant}
              </Typography>
            </Grid>
          )}
          {transaction.location && (
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                Location:
              </Typography>
              <Typography variant="caption" fontWeight="medium" sx={{ fontSize: '0.75rem', display: 'block' }}>
                {transaction.location}
              </Typography>
            </Grid>
          )}
        </Grid>

        {/* Balance and Reference in compact format */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontSize: '0.7rem' }}
          >
            Balance: {formatCurrency(transaction.balanceAfterTransaction)}
          </Typography>
          {transaction.referenceNumber && (
            <Typography 
              variant="caption" 
              sx={{ 
                fontFamily: 'monospace',
                fontSize: '0.65rem',
                color: 'text.secondary',
                maxWidth: '100px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              Ref: {transaction.referenceNumber}
            </Typography>
          )}
        </Box>

        {/* Notes in compact format */}
        {transaction.notes && (
          <Box sx={{ mt: 1, p: 0.5, bgcolor: 'grey.50', borderRadius: 0.5 }}>
            <Typography 
              variant="caption" 
              color="text.secondary"
              sx={{ 
                fontSize: '0.7rem',
                display: 'block',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {transaction.notes}
            </Typography>
          </Box>
        )}

        {/* Recurring info in compact format */}
        {transaction.isRecurring && transaction.recurringFrequency && (
          <Box sx={{ mt: 0.5, p: 0.5, bgcolor: 'info.50', borderRadius: 0.5 }}>
            <Typography variant="caption" color="info.main" sx={{ fontSize: '0.7rem' }}>
              🔄 {transaction.recurringFrequency}
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
