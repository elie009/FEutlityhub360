import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Checkbox,
  IconButton,
  Menu,
  MenuItem,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Payment as PaymentIcon,
  Visibility as VisibilityIcon,
} from '@mui/icons-material';
import { Bill, BillStatus } from '../../types/bill';
import { useCurrency } from '../../contexts/CurrencyContext';
import { format } from 'date-fns';

interface UnpaidBillsCardProps {
  bills: Bill[];
  onViewBill?: (billId: string) => void;
  onMarkPaid?: (billId: string) => void;
  onCheckChange?: (billId: string, checked: boolean) => void;
  checkedBills?: Set<string>;
}

const UnpaidBillsCard: React.FC<UnpaidBillsCardProps> = ({
  bills,
  onViewBill,
  onMarkPaid,
  onCheckChange,
  checkedBills = new Set(),
}) => {
  const { formatCurrency } = useCurrency();
  const [anchorEl, setAnchorEl] = useState<{ [key: string]: HTMLElement | null }>({});

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, billId: string) => {
    setAnchorEl({ ...anchorEl, [billId]: event.currentTarget });
  };

  const handleMenuClose = (billId: string) => {
    setAnchorEl({ ...anchorEl, [billId]: null });
  };

  const handleViewBill = (billId: string) => {
    handleMenuClose(billId);
    if (onViewBill) {
      onViewBill(billId);
    }
  };

  const handleMarkPaid = (billId: string) => {
    handleMenuClose(billId);
    if (onMarkPaid) {
      onMarkPaid(billId);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMMM d, yyyy');
    } catch {
      return new Date(dateString).toLocaleDateString();
    }
  };

  const getBillDescription = (bill: Bill) => {
    if (bill.billName) {
      return bill.billName;
    }
    if (bill.provider && bill.billType) {
      return `${bill.provider} - ${bill.billType}`;
    }
    return 'Bill';
  };

  // Colors matching the image: light green and light yellow
  const getBackgroundColor = (index: number) => {
    return index % 2 === 0 ? '#f0f9f4' : '#fffef0'; // Light green and light yellow
  };

  if (bills.length === 0) {
    return (
      <Paper sx={{ p: 3 }}>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ py: 4 }}>
          No unpaid bills
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 0, overflow: 'hidden' }}>
      <Box>
        {bills.map((bill, index) => {
          const isChecked = checkedBills.has(bill.id);
          const isOverdue = bill.status === BillStatus.OVERDUE || 
            (bill.status === BillStatus.PENDING && new Date(bill.dueDate) < new Date());

          return (
            <React.Fragment key={bill.id}>
              <ListItem
                sx={{
                  backgroundColor: getBackgroundColor(index),
                  py: 2,
                  px: 2,
                  '&:hover': {
                    backgroundColor: index % 2 === 0 ? '#e8f5ee' : '#fff9e6',
                  },
                  cursor: 'pointer',
                }}
                onClick={() => {
                  if (onViewBill) {
                    onViewBill(bill.id);
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Checkbox
                    edge="start"
                    checked={isChecked}
                    onChange={(e) => {
                      e.stopPropagation();
                      if (onCheckChange) {
                        onCheckChange(bill.id, e.target.checked);
                      }
                    }}
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      color: 'text.secondary',
                      '&.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.875rem',
                        color: 'text.secondary',
                        mb: 0.5,
                      }}
                    >
                      {formatDate(bill.dueDate)}
                    </Typography>
                  }
                  secondary={
                    <Typography
                      variant="body1"
                      sx={{
                        fontSize: '1rem',
                        color: 'text.primary',
                        fontWeight: 400,
                      }}
                    >
                      {getBillDescription(bill)}
                      {isOverdue && (
                        <Typography
                          component="span"
                          sx={{
                            ml: 1,
                            color: 'error.main',
                            fontSize: '0.875rem',
                          }}
                        >
                          • Overdue
                        </Typography>
                      )}
                    </Typography>
                  }
                  sx={{ my: 0 }}
                />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: isOverdue ? 'error.main' : 'text.primary',
                    }}
                  >
                    {formatCurrency(bill.amount)}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMenuOpen(e, bill.id);
                    }}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Menu
                  anchorEl={anchorEl[bill.id]}
                  open={Boolean(anchorEl[bill.id])}
                  onClose={() => handleMenuClose(bill.id)}
                  onClick={(e) => e.stopPropagation()}
                >
                  <MenuItem onClick={() => handleViewBill(bill.id)}>
                    <ListItemIcon>
                      <VisibilityIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>View Details</ListItemText>
                  </MenuItem>
                  <MenuItem onClick={() => handleMarkPaid(bill.id)}>
                    <ListItemIcon>
                      <PaymentIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText>Mark as Paid</ListItemText>
                  </MenuItem>
                </Menu>
              </ListItem>
              {index < bills.length - 1 && <Divider />}
            </React.Fragment>
          );
        })}
      </Box>
    </Paper>
  );
};

export default UnpaidBillsCard;
