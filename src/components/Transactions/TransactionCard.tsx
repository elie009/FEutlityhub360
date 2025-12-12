import React, { useState, useRef } from 'react';
import {
  Card, CardContent, Typography, Box, Chip, Grid, Divider,
  IconButton, Menu, MenuItem,
} from '@mui/material';
import {
  MoreVert, TrendingUp, TrendingDown, Receipt, LocationOn,
  Schedule, AccountBalance, AttachMoney, Category, Store,
  Edit, Delete,
} from '@mui/icons-material';
import { BankAccountTransaction } from '../../types/transaction';
import { useCurrency } from '../../contexts/CurrencyContext';

interface TransactionCardProps {
  transaction: BankAccountTransaction;
  onViewDetails?: (transaction: BankAccountTransaction) => void;
  onEdit?: (transaction: BankAccountTransaction) => void;
  onDelete?: (transactionId: string) => void;
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

const TransactionCard: React.FC<TransactionCardProps> = ({ transaction, onViewDetails, onEdit, onDelete }) => {
  const { formatCurrency } = useCurrency();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const open = Boolean(anchorEl);
  const SWIPE_THRESHOLD = 50; // Minimum distance to trigger swipe
  const MAX_SWIPE = 80; // Maximum swipe distance

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

  // Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    setIsSwiping(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = Math.abs(e.touches[0].clientY - (touchStartY.current || 0));
    
    // Only allow horizontal swipe (not vertical scrolling)
    if (deltaY < Math.abs(deltaX)) {
      e.preventDefault();
      // Limit swipe distance
      const limitedDelta = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, deltaX));
      setSwipeOffset(limitedDelta);
    }
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    
    const absOffset = Math.abs(swipeOffset);
    
    if (absOffset > SWIPE_THRESHOLD) {
      if (swipeOffset > 0 && onEdit) {
        // Swipe right - Edit
        onEdit(transaction);
      } else if (swipeOffset < 0 && onDelete) {
        // Swipe left - Delete
        onDelete(transaction.id);
      }
    }
    
    // Reset
    setSwipeOffset(0);
    setIsSwiping(false);
    touchStartX.current = null;
    touchStartY.current = null;
  };

  const isCredit = transaction.transactionType === 'credit' || transaction.transactionType === 'CREDIT';
  const amountColor = isCredit ? 'success.main' : 'error.main';
  const amountPrefix = isCredit ? '+' : '-';

  const showEditAction = swipeOffset > SWIPE_THRESHOLD && onEdit;
  const showDeleteAction = swipeOffset < -SWIPE_THRESHOLD && onDelete;

  return (
    <Box
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Swipe Action Backgrounds */}
      {showEditAction && (
        <Box
          sx={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: '80px',
            backgroundColor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <Edit sx={{ color: 'white', fontSize: 24 }} />
        </Box>
      )}
      {showDeleteAction && (
        <Box
          sx={{
            position: 'absolute',
            right: 0,
            top: 0,
            bottom: 0,
            width: '80px',
            backgroundColor: 'error.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1,
          }}
        >
          <Delete sx={{ color: 'white', fontSize: 24 }} />
        </Box>
      )}

      <Card sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        transform: `translateX(${swipeOffset}px)`,
        transition: isSwiping ? 'none' : 'transform 0.3s ease',
        position: 'relative',
        zIndex: 2,
        '&:hover': {
          boxShadow: 2,
          transform: `translateX(${swipeOffset}px) translateY(-1px)`,
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
              label={transaction.transactionType === 'credit' || transaction.transactionType === 'CREDIT' ? 'Money In' : transaction.transactionType === 'debit' || transaction.transactionType === 'DEBIT' ? 'Money Out' : transaction.transactionType}
              icon={getTransactionTypeIcon(transaction.transactionType)}
              color={getTransactionTypeColor(transaction.transactionType)}
              size="small"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
            <Chip
              label={transaction.category || 'Uncategorized'}
              color={getCategoryColor(transaction.category || 'default')}
              size="small"
              sx={{ fontSize: '0.7rem', height: 20 }}
            />
            {transaction.isRecurring && (
              <Chip
                label="Recurring"
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
        {onEdit && (
          <MenuItem onClick={() => {
            onEdit(transaction);
            handleMenuClose();
          }}>
            <Edit sx={{ mr: 1, fontSize: 16 }} />
            Edit Transaction
          </MenuItem>
        )}
      </Menu>
      </Card>
    </Box>
  );
};

export default TransactionCard;
