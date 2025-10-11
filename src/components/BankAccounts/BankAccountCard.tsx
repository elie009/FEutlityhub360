import React from 'react';
import {
  Card, CardContent, Typography, Box, Chip, Button, Grid, Divider,
  IconButton, Menu, MenuItem, Tooltip,
} from '@mui/material';
import {
  MoreVert, Edit, Delete, AccountBalance, Sync, Link, LinkOff,
  AttachMoney, TrendingUp, TrendingDown, CheckCircle, Warning,
  AccountBalanceWallet, CreditCard, Savings, Assessment,
} from '@mui/icons-material';
import { BankAccount } from '../../types/bankAccount';

interface BankAccountCardProps {
  account: BankAccount;
  onEdit: (account: BankAccount) => void;
  onDelete: (accountId: string) => void;
  onConnect?: (accountId: string) => void;
  onDisconnect?: (accountId: string) => void;
  onSync?: (accountId: string) => void;
}

const getAccountTypeColor = (type: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (type) {
    case 'checking': return 'primary';
    case 'savings': return 'success';
    case 'credit_card': return 'error';
    case 'investment': return 'info';
    case 'bank': return 'secondary';
    default: return 'default';
  }
};

const getAccountTypeIcon = (type: string) => {
  switch (type) {
    case 'checking': return <AccountBalance sx={{ fontSize: 16 }} />;
    case 'savings': return <Savings sx={{ fontSize: 16 }} />;
    case 'credit_card': return <CreditCard sx={{ fontSize: 16 }} />;
    case 'investment': return <Assessment sx={{ fontSize: 16 }} />;
    case 'bank': return <AccountBalanceWallet sx={{ fontSize: 16 }} />;
    default: return <AccountBalance sx={{ fontSize: 16 }} />;
  }
};

const getAccountTypeLabel = (type: string): string => {
  switch (type) {
    case 'checking': return 'Checking';
    case 'savings': return 'Savings';
    case 'credit_card': return 'Credit Card';
    case 'investment': return 'Investment';
    case 'bank': return 'Bank';
    default: return type;
  }
};

const getSyncFrequencyLabel = (frequency: string): string => {
  switch (frequency) {
    case 'DAILY': return 'Daily';
    case 'WEEKLY': return 'Weekly';
    case 'MONTHLY': return 'Monthly';
    case 'MANUAL': return 'Manual';
    default: return frequency;
  }
};

const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const BankAccountCard: React.FC<BankAccountCardProps> = ({ 
  account, 
  onEdit, 
  onDelete, 
  onConnect, 
  onDisconnect, 
  onSync 
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(account);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(account.id);
    handleMenuClose();
  };

  const handleConnect = () => {
    onConnect?.(account.id);
    handleMenuClose();
  };

  const handleDisconnect = () => {
    onDisconnect?.(account.id);
    handleMenuClose();
  };

  const handleSync = () => {
    onSync?.(account.id);
    handleMenuClose();
  };

  const isPositiveBalance = account.currentBalance >= 0;
  const balanceChange = account.currentBalance - account.initialBalance;
  const hasBalanceChange = Math.abs(balanceChange) > 0.01;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div">
            {account.accountName}
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
            label={getAccountTypeLabel(account.accountType)}
            icon={getAccountTypeIcon(account.accountType)}
            color={getAccountTypeColor(account.accountType)}
            size="small"
          />
          <Chip
            label={account.isActive ? 'Active' : 'Inactive'}
            icon={account.isActive ? <CheckCircle sx={{ fontSize: 16 }} /> : <Warning sx={{ fontSize: 16 }} />}
            color={account.isActive ? 'success' : 'warning'}
            size="small"
          />
          {account.isConnected && (
            <Chip
              label="Connected"
              icon={<Link sx={{ fontSize: 16 }} />}
              color="info"
              size="small"
            />
          )}
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* Balance Information */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="h5" component="div" sx={{ 
            color: isPositiveBalance ? 'success.main' : 'error.main',
            fontWeight: 'bold'
          }}>
            {formatCurrency(account.currentBalance, account.currency)}
          </Typography>
          {hasBalanceChange && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              {balanceChange > 0 ? (
                <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
              ) : (
                <TrendingDown sx={{ fontSize: 16, color: 'error.main', mr: 0.5 }} />
              )}
              <Typography 
                variant="body2" 
                color={balanceChange > 0 ? 'success.main' : 'error.main'}
              >
                {balanceChange > 0 ? '+' : ''}{formatCurrency(balanceChange, account.currency)} from initial
              </Typography>
            </Box>
          )}
        </Box>

        <Grid container spacing={1}>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Institution:</Typography>
            <Typography variant="body2" fontWeight="medium">
              {account.financialInstitution || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Account:</Typography>
            <Typography variant="body2" fontWeight="medium" sx={{ fontFamily: 'monospace' }}>
              {account.accountNumber || 'N/A'}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Sync:</Typography>
            <Typography variant="body2" fontWeight="medium">
              {getSyncFrequencyLabel(account.syncFrequency)}
            </Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Updated:</Typography>
            <Typography variant="body2" fontWeight="medium">
              {formatDate(account.updatedAt)}
            </Typography>
          </Grid>
          {account.lastSyncedAt && (
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">Last Synced:</Typography>
              <Typography variant="body2" fontWeight="medium">
                {formatDate(account.lastSyncedAt)}
              </Typography>
            </Grid>
          )}
          <Grid item xs={6}>
            <Typography variant="body2" color="text.secondary">Transactions:</Typography>
            <Typography variant="body2" fontWeight="medium">
              {account.transactionCount}
            </Typography>
          </Grid>
        </Grid>

        {/* Transaction Summary */}
        <Box sx={{ mt: 2, p: 1.5, bgcolor: 'action.hover', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          <Typography variant="body2" color="text.primary" fontWeight="medium" gutterBottom>
            Transaction Summary:
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="caption" color="success.main" fontWeight="medium">
                Incoming: {formatCurrency(account.totalIncoming, account.currency)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="error.main" fontWeight="medium">
                Outgoing: {formatCurrency(account.totalOutgoing, account.currency)}
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {account.description && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Description:
            </Typography>
            <Typography variant="body2">
              {account.description}
            </Typography>
          </Box>
        )}

        {/* International Information */}
        {(account.iban || account.swiftCode) && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'darkslategray', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              International:
            </Typography>
            {account.iban && (
              <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace' }}>
                IBAN: {account.iban}
              </Typography>
            )}
            {account.swiftCode && (
              <Typography variant="caption" sx={{ display: 'block', fontFamily: 'monospace' }}>
                SWIFT: {account.swiftCode}
              </Typography>
            )}
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleEdit}
            startIcon={<Edit />}
            fullWidth
          >
            Edit
          </Button>
          {account.isConnected ? (
            <Tooltip title="Disconnect from bank">
              <Button
                variant="contained"
                size="small"
                onClick={handleDisconnect}
                startIcon={<LinkOff />}
                color="warning"
                fullWidth
              >
                Disconnect
              </Button>
            </Tooltip>
          ) : (
            <Tooltip title="Connect to bank">
              <Button
                variant="contained"
                size="small"
                onClick={handleConnect}
                startIcon={<Link />}
                color="success"
                fullWidth
              >
                Connect
              </Button>
            </Tooltip>
          )}
        </Box>

        {account.isConnected && onSync && (
          <Box sx={{ mt: 1 }}>
            <Button
              variant="outlined"
              size="small"
              onClick={handleSync}
              startIcon={<Sync />}
              fullWidth
            >
              Sync Now
            </Button>
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
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1, fontSize: 16 }} />
          Edit Account
        </MenuItem>
        {account.isConnected ? (
          <MenuItem onClick={handleDisconnect}>
            <LinkOff sx={{ mr: 1, fontSize: 16 }} />
            Disconnect
          </MenuItem>
        ) : (
          <MenuItem onClick={handleConnect}>
            <Link sx={{ mr: 1, fontSize: 16 }} />
            Connect
          </MenuItem>
        )}
        {account.isConnected && onSync && (
          <MenuItem onClick={handleSync}>
            <Sync sx={{ mr: 1, fontSize: 16 }} />
            Sync Now
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1, fontSize: 16 }} />
          Delete Account
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default BankAccountCard;
