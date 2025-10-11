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
  Badge,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Alert as MuiAlert,
  TextField,
  CircularProgress,
  Collapse,
  ListItemButton,
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
  History,
  Notifications,
  NotificationsActive,
  Close,
  Info,
  Error,
  AutoAwesome,
  ExpandMore,
  ExpandLess,
  CalendarMonth,
  Assessment,
} from '@mui/icons-material';
import { Bill, BillStatus, BillType, BillFrequency, BillAlert } from '../../types/bill';
import { apiService } from '../../services/api';
import { getErrorMessage } from '../../utils/validation';

interface BillCardProps {
  bill: Bill;
  alerts?: BillAlert[];
  historicalCount?: number;
  allBills?: Bill[];  // All bills in this group
  onEdit: (bill: Bill, isSpecificMonth?: boolean) => void;
  onDelete: (billId: string) => void;
  onMarkAsPaid: (billId: string) => void;
  onViewHistory?: (provider: string, billType: BillType) => void;
  onBillConfirmed?: () => void;
}

const getStatusColor = (status: BillStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case BillStatus.PAID:
      return 'success';
    case BillStatus.PENDING:
      return 'warning';
    case BillStatus.OVERDUE:
      return 'error';
    case BillStatus.AUTO_GENERATED:
      return 'info';
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
    case BillStatus.AUTO_GENERATED:
      return <Receipt sx={{ fontSize: 16 }} />;
    default:
      return <Pending sx={{ fontSize: 16 }} />;
  }
};

const getBillTypeColor = (billType: BillType): string => {
  switch (billType) {
    case BillType.UTILITY:
      return '#1976d2'; // Blue
    case BillType.INSURANCE:
      return '#388e3c'; // Green
    case BillType.SUBSCRIPTION:
      return '#f57c00'; // Orange
    case BillType.SCHOOL_TUITION:
      return '#7b1fa2'; // Purple
    case BillType.CREDIT_CARD:
      return '#d32f2f'; // Red
    case BillType.MEDICAL:
      return '#0288d1'; // Light Blue
    case BillType.OTHER:
      return '#757575'; // Gray
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

const BillCard: React.FC<BillCardProps> = ({ bill, alerts = [], historicalCount = 0, allBills = [], onEdit, onDelete, onMarkAsPaid, onViewHistory, onBillConfirmed }) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [notificationDialogOpen, setNotificationDialogOpen] = React.useState(false);
  const [confirmingBill, setConfirmingBill] = React.useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = React.useState(false);
  const [updateAmount, setUpdateAmount] = React.useState(bill.amount);
  const [updateNotes, setUpdateNotes] = React.useState('');
  const [updating, setUpdating] = React.useState(false);
  const [error, setError] = React.useState('');
  const [showMonthList, setShowMonthList] = React.useState(false);
  const [selectedBill, setSelectedBill] = React.useState<Bill>(bill);
  const open = Boolean(anchorEl);

  // Sort bills by due date (oldest first - ascending order)
  const sortedBills = React.useMemo(() => {
    return [...allBills].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [allBills]);

  // Find the earliest unpaid bill to use as default (oldest pending bill)
  const earliestUnpaidBill = React.useMemo(() => {
    // Get all pending bills sorted by date (oldest first)
    const pendingBills = [...allBills]
      .filter(b => b.status === BillStatus.PENDING)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
    
    // Return the oldest pending bill (earliest due date), or the main bill if no pending bills
    return pendingBills.length > 0 ? pendingBills[0] : bill;
  }, [allBills, bill]);

  // Update selected bill when main bill changes - use earliest unpaid bill as default
  React.useEffect(() => {
    setSelectedBill(earliestUnpaidBill);
  }, [earliestUnpaidBill]);

  // Filter alerts specific to this bill
  const billAlerts = alerts.filter(
    alert => 
      alert.billId === bill.id || 
      alert.provider === bill.provider
  );

  // Check if bill is auto-generated and needs confirmation
  const isAutoGenerated = 
    bill.status === BillStatus.AUTO_GENERATED || 
    bill.isAutoGenerated === true || 
    bill.needsConfirmation === true;
  const totalNotifications = billAlerts.length + (isAutoGenerated ? 1 : 0);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = () => {
    setNotificationDialogOpen(true);
  };

  const handleQuickConfirm = async () => {
    try {
      setConfirmingBill(true);
      setError('');
      await apiService.confirmBillAmount(bill.id, bill.amount);
      setNotificationDialogOpen(false);
      onBillConfirmed?.();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to confirm bill'));
    } finally {
      setConfirmingBill(false);
    }
  };

  const handleOpenUpdateDialog = () => {
    setUpdateAmount(bill.amount);
    setUpdateNotes('');
    setUpdateDialogOpen(true);
  };

  const handleUpdateAmount = async () => {
    try {
      setUpdating(true);
      setError('');
      
      if (updateAmount <= 0) {
        setError('Amount must be greater than 0');
        return;
      }

      await apiService.confirmBillAmount(bill.id, updateAmount, updateNotes);
      setUpdateDialogOpen(false);
      setNotificationDialogOpen(false);
      onBillConfirmed?.();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update bill amount'));
    } finally {
      setUpdating(false);
    }
  };

  const getAlertIcon = (severity: string) => {
    switch (severity) {
      case 'error':
        return <Error sx={{ fontSize: 20 }} />;
      case 'warning':
        return <Warning sx={{ fontSize: 20 }} />;
      case 'info':
        return <Info sx={{ fontSize: 20 }} />;
      case 'success':
        return <CheckCircle sx={{ fontSize: 20 }} />;
      default:
        return <Info sx={{ fontSize: 20 }} />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleEdit = () => {
    // If editing a selected month (not the main bill), pass true to lock fields
    const isEditingSpecificMonth = sortedBills.length > 1 && selectedBill.id !== bill.id;
    onEdit(selectedBill, isEditingSpecificMonth);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(selectedBill.id);
    handleMenuClose();
  };

  const handleMarkAsPaid = () => {
    onMarkAsPaid(selectedBill.id);
    handleMenuClose();
  };

  const isBillOverdue = isOverdue(selectedBill.dueDate) && selectedBill.status === BillStatus.PENDING;
  const isSelectedBillPending = selectedBill.status === BillStatus.PENDING;

  return (
    <Card sx={{ 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      boxShadow: { xs: 1, sm: 2 }
    }}>
      <CardContent sx={{ flexGrow: 1, p: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flexGrow: 1, pr: 1 }}>
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                mb: 1,
                fontSize: { xs: '1rem', sm: '1.25rem' },
                wordBreak: 'break-word'
              }}
            >
              {bill.billName}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
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
                  '& .MuiChip-label': { color: 'white', fontSize: { xs: '0.7rem', sm: '0.8125rem' } }
                }}
              />
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0, ml: 1 }}>
            {/* Notification Bell - Hidden for now */}
            {/* {totalNotifications > 0 && (
              <Tooltip title={`${totalNotifications} notification${totalNotifications > 1 ? 's' : ''}`}>
                <IconButton
                  size="small"
                  onClick={handleNotificationClick}
                  color="warning"
                >
                  <Badge badgeContent={totalNotifications} color="error">
                    <NotificationsActive fontSize="small" />
                  </Badge>
                </IconButton>
              </Tooltip>
            )} */}
            <IconButton
              size="small"
              onClick={handleMenuClick}
            >
              <MoreVert />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AttachMoney sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Amount
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              color={isBillOverdue ? 'error.main' : 'primary.main'}
              sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
            >
              {formatCurrency(selectedBill.amount)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Schedule sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Due Date
              </Typography>
            </Box>
            <Typography 
              variant="h6" 
              color={isBillOverdue ? 'error.main' : 'text.primary'}
              sx={{ fontSize: { xs: '0.875rem', sm: '1.25rem' } }}
            >
              {formatDate(selectedBill.dueDate)}
            </Typography>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Receipt sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Frequency
            </Typography>
          </Box>
          <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
            {getFrequencyText(selectedBill.frequency)}
          </Typography>
          </Grid>

          <Grid item xs={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Receipt sx={{ mr: 1, fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                Provider
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' }, wordBreak: 'break-word' }}>
              {selectedBill.provider || 'N/A'}
            </Typography>
          </Grid>
        </Grid>

        {bill.notes && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Notes:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' }, wordBreak: 'break-word' }}>
              {bill.notes}
            </Typography>
          </Box>
        )}

        {bill.referenceNumber && (
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
              Reference:
            </Typography>
            <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: { xs: '0.7rem', sm: '0.875rem' }, wordBreak: 'break-all' }}>
              {bill.referenceNumber}
            </Typography>
          </Box>
        )}

        {selectedBill.paidAt && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'success.50', borderRadius: 1 }}>
            <Typography variant="caption" color="success.main" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              Paid on: {formatDate(selectedBill.paidAt)}
            </Typography>
          </Box>
        )}

        {isBillOverdue && (
          <Box sx={{ mt: 2, p: 1, bgcolor: 'error.50', borderRadius: 1 }}>
            <Typography variant="caption" color="error.main" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
              ⚠️ This bill is overdue
            </Typography>
          </Box>
        )}

        {/* Expandable Month List */}
        {sortedBills.length > 1 && (
          <Box sx={{ mt: 2 }}>
            <Collapse in={showMonthList}>
              <Box sx={{ border: 1, borderColor: 'divider', borderRadius: 1, overflow: 'hidden' }}>
                <Box sx={{ bgcolor: 'action.hover', p: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <CalendarMonth sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="caption" fontWeight="bold">
                    Select Month/Period
                  </Typography>
                </Box>
                <List disablePadding>
                  {sortedBills.map((monthBill, index) => (
                    <ListItemButton
                      key={monthBill.id}
                      selected={selectedBill.id === monthBill.id}
                      onClick={() => setSelectedBill(monthBill)}
                      sx={{
                        py: 1,
                        px: 2,
                        '&.Mui-selected': {
                          bgcolor: 'primary.light',
                          '&:hover': {
                            bgcolor: 'primary.light',
                          },
                        },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Typography variant="body2">
                              {new Date(monthBill.dueDate).toLocaleDateString('en-US', { 
                                month: 'short', 
                                year: 'numeric' 
                              })}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="caption" fontWeight="bold">
                                {formatCurrency(monthBill.amount)}
                              </Typography>
                              <Chip
                                label={monthBill.status}
                                size="small"
                                color={getStatusColor(monthBill.status)}
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                            </Box>
                          </Box>
                        }
                      />
                    </ListItemButton>
                  ))}
                </List>
              </Box>
            </Collapse>
          </Box>
        )}

        {/* Action Buttons */}
        <Box sx={{ 
          mt: 2, 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 1 
        }}>
          {/* View History button - Hidden for now */}
          {/* {onViewHistory && bill.provider && (
            <Button
              variant="contained"
              size="small"
              onClick={() => onViewHistory(bill.provider!, bill.billType)}
              fullWidth
              color="primary"
            >
              View History
            </Button>
          )} */}
          <Button
            variant="outlined"
            size="small"
            onClick={handleEdit}
            fullWidth
          >
            Update
          </Button>
          {isSelectedBillPending && (
            <Button
              variant="contained"
              size="small"
              onClick={handleMarkAsPaid}
              color="success"
              fullWidth
            >
              Mark Paid
            </Button>
          )}
          <Button
            variant="outlined"
            size="small"
            onClick={handleDelete}
            color="error"
            fullWidth
          >
            Delete
          </Button>
        </Box>
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
        {sortedBills.length > 1 && (
          <MenuItem 
            onClick={() => {
              setShowMonthList(!showMonthList);
              handleMenuClose();
            }}
          >
            <CalendarMonth sx={{ mr: 1, fontSize: 16 }} />
            {showMonthList ? 'Hide' : 'Show'} All Months ({sortedBills.length})
          </MenuItem>
        )}
        {onViewHistory && bill.provider && (
          <MenuItem onClick={() => {
            onViewHistory(bill.provider!, bill.billType);
            handleMenuClose();
          }}>
            <Assessment sx={{ mr: 1, fontSize: 16 }} />
            View Provider Analytics
          </MenuItem>
        )}
        {isSelectedBillPending && (
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

      {/* Notifications Dialog */}
      <Dialog 
        open={notificationDialogOpen} 
        onClose={() => setNotificationDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsActive color="warning" />
            <Typography variant="h6">
              Notifications for {bill.billName}
            </Typography>
          </Box>
          <IconButton
            size="small"
            onClick={() => setNotificationDialogOpen(false)}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {error && (
            <MuiAlert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </MuiAlert>
          )}

          {!isAutoGenerated && billAlerts.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <Notifications sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                No notifications for this bill
              </Typography>
            </Box>
          ) : (
            <List disablePadding>
              {/* Auto-Generated Bill Notification (shown first) */}
              {isAutoGenerated && (
                <ListItem
                  sx={{
                    border: 1,
                    borderColor: 'primary.light',
                    borderRadius: 1,
                    mb: 2,
                    p: 2,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    bgcolor: 'action.hover',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, width: '100%', mb: 2 }}>
                    <AutoAwesome sx={{ fontSize: 24, color: 'primary.main', mt: 0.5 }} />
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Auto-Generated Bill Needs Confirmation
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        This bill was automatically generated based on your previous billing patterns. Please confirm or update the amount.
                      </Typography>
                      <Typography variant="body2" color="primary" fontWeight="bold">
                        Estimated Amount: {formatCurrency(bill.amount)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Due: {new Date(bill.dueDate).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                    <Button
                      size="small"
                      variant="contained"
                      color="success"
                      onClick={handleQuickConfirm}
                      disabled={confirmingBill}
                      fullWidth
                      startIcon={confirmingBill ? <CircularProgress size={16} color="inherit" /> : <CheckCircle />}
                    >
                      {confirmingBill ? 'Confirming...' : 'Confirm Amount'}
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      onClick={handleOpenUpdateDialog}
                      disabled={confirmingBill}
                      fullWidth
                      startIcon={<Edit />}
                    >
                      Update Amount
                    </Button>
                  </Box>
                </ListItem>
              )}

              {/* Regular Alerts */}
              {billAlerts.map((alert) => (
                <ListItem
                  key={alert.id}
                  sx={{
                    border: 1,
                    borderColor: `${alert.severity}.light`,
                    borderRadius: 1,
                    mb: 1,
                    p: 2,
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    bgcolor: alert.read ? 'action.hover' : 'background.paper',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, width: '100%', mb: 1 }}>
                    <Box sx={{ color: `${alert.severity}.main`, mt: 0.5 }}>
                      {getAlertIcon(alert.severity)}
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        {alert.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        {alert.message}
                      </Typography>
                      {alert.amount && (
                        <Typography variant="body2" color="primary" fontWeight="bold">
                          ${alert.amount.toLocaleString()}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        {formatDate(alert.createdAt)}
                      </Typography>
                    </Box>
                    {!alert.read && (
                      <Chip
                        label="New"
                        size="small"
                        color="error"
                        sx={{ fontSize: '0.65rem' }}
                      />
                    )}
                  </Box>
                  {alert.severity === 'error' && (
                    <MuiAlert severity="error" sx={{ width: '100%', mt: 1 }}>
                      <Typography variant="caption">
                        This requires immediate attention!
                      </Typography>
                    </MuiAlert>
                  )}
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>

      {/* Update Amount Dialog */}
      <Dialog 
        open={updateDialogOpen} 
        onClose={() => setUpdateDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>Update Bill Amount</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {bill.billName}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
              Estimated: {formatCurrency(bill.amount)}
            </Typography>

            <TextField
              fullWidth
              label="Actual Amount"
              type="number"
              value={updateAmount}
              onChange={(e) => setUpdateAmount(parseFloat(e.target.value) || 0)}
              InputProps={{
                startAdornment: '$',
              }}
              inputProps={{ min: 0, step: 0.01 }}
              size="small"
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Notes (Optional)"
              value={updateNotes}
              onChange={(e) => setUpdateNotes(e.target.value)}
              multiline
              rows={3}
              size="small"
              placeholder="Why is this amount different from the estimate?"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setUpdateDialogOpen(false)} size="small">
            Cancel
          </Button>
          <Button
            onClick={handleUpdateAmount}
            variant="contained"
            disabled={updating}
            size="small"
            startIcon={updating ? <CircularProgress size={16} /> : <CheckCircle />}
          >
            {updating ? 'Updating...' : 'Confirm Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default BillCard;
