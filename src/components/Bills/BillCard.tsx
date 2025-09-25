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
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Receipt,
  Schedule,
  AttachMoney,
  MoreVert,
  Edit,
  Delete,
  CheckCircle,
  Warning,
  Pending,
} from '@mui/icons-material';
import { Bill, BillStatus, BillType, BillFrequency } from '../../types/bill';

interface BillCardProps {
  bill: Bill;
  onEdit: (bill: Bill) => void;
  onDelete: (billId: string) => void;
  onMarkAsPaid: (billId: string) => void;
}

const getStatusColor = (status: BillStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case BillStatus.PAID:
      return 'success';
    case BillStatus.PENDING:
      return 'warning';
    case BillStatus.OVERDUE:
      return 'error';
    default:
      return 'default';
  }
};

const getStatusIcon = (status: BillStatus) => {
  switch (status) {
    case BillStatus.PAID:
      return <CheckCircle sx={{ fontSize: 16 }} />;
    case BillStatus.PENDING:
      return <Pending sx={{ fontSize: 16 }} />;
    case BillStatus.OVERDUE:
      return <Warning sx={{ fontSize: 16 }} />;
    default:
      return <Pending sx={{ fontSize: 16 }} />;
  }
};

const getBillTypeColor = (billType: BillType): string => {
  switch (billType) {
    case BillType.UTILITY:
      return '#1976d2';
    case BillType.SUBSCRIPTION:
      return '#388e3c';
    case BillType.LOAN:
      return '#f57c00';
    case BillType.OTHERS:
      return '#7b1fa2';
    default:
      return '#757575';
  }
};

const getFrequencyText = (frequency: BillFrequency): string => {
  switch (frequency) {
    case BillFrequency.MONTHLY:
      return 'Monthly';
    case BillFrequency.QUARTERLY:
      return 'Quarterly';
    case BillFrequency.YEARLY:
      return 'Yearly';
    default:
      return frequency;
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

const isOverdue = (dueDate: string): boolean => {
  return new Date(dueDate) < new Date();
};

const BillCard: React.FC<BillCardProps> = ({ bill, onEdit, onDelete, onMarkAsPaid }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(bill);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(bill.id);
    handleMenuClose();
  };

  const handleMarkAsPaid = () => {
    onMarkAsPaid(bill.id);
    handleMenuClose();
  };

  const isBillOverdue = isOverdue(bill.dueDate) && bill.status === BillStatus.PENDING;

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="div" sx={{ mb: 1 }}>
              {bill.billName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
              <Chip
                label={bill.status}
                color={getStatusColor(bill.status)}
                size="small"
                icon={getStatusIcon(bill.status)}
              />
              <Chip
                label={bill.billType}
                size="small"
                sx={{ 
                  backgroundColor: getBillTypeColor(bill.billType),
                  color: 'white',
                  '& .MuiChip-label': { color: 'white' }
                }}
              />
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={handleMenuClick}
            sx={{ ml: 1 }}
          >
            <MoreVert />
          </IconButton>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoney sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Amount
              </Typography>
            </Box>
            <Typography variant="h6" color={isBillOverdue ? 'error.main' : 'primary.main'}>
              {formatCurrency(bill.amount)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Schedule sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Due Date
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              color={isBillOverdue ? 'error.main' : 'text.primary'}
            >
              {formatDate(bill.dueDate)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Receipt sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Frequency
              </Typography>
            </Box>
            <Typography variant="body1">
              {getFrequencyText(bill.frequency)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Receipt sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary">
                Provider
              </Typography>
            </Box>
            <Typography variant="body1">
              {bill.provider || 'N/A'}
            </Typography>
          </Grid>
        </Grid>

        {bill.notes && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Notes:
            </Typography>
            <Typography variant="body2">
              {bill.notes}
            </Typography>
          </Box>
        )}

        {bill.referenceNumber && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Reference:
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
              {bill.referenceNumber}
            </Typography>
          </Box>
        )}

        {bill.paidAt && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
            <Typography variant="caption" color="success.main">
              Paid on: {formatDate(bill.paidAt)}
            </Typography>
          </Box>
        )}

        {isBillOverdue && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'error.50', borderRadius: 1 }}>
            <Typography variant="caption" color="error.main">
              ⚠️ This bill is overdue
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
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1, fontSize: 16 }} />
          Edit Bill
        </MenuItem>
        {bill.status === BillStatus.PENDING && (
          <MenuItem onClick={handleMarkAsPaid}>
            <CheckCircle sx={{ mr: 1, fontSize: 16 }} />
            Mark as Paid
          </MenuItem>
        )}
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1, fontSize: 16 }} />
          Delete Bill
        </MenuItem>
      </Menu>
    </Card>
  );
};

export default BillCard;
