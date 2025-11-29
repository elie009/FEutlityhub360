import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Snackbar,
  Stack,
} from '@mui/material';
import {
  Edit as EditIcon,
  CheckCircle,
  Schedule,
  EventAvailable,
  Warning,
  Add,
  Payment as PaymentIcon,
  Delete,
} from '@mui/icons-material';
import { RepaymentSchedule, PaymentStatus, Loan } from '../../types/loan';
import { apiService } from '../../services/api';
import { getErrorMessage } from '../../utils/validation';
import { formatDate, formatDateLong, isOverdue, isDueToday, getDaysUntilDue } from '../../utils/dateUtils';
import AddScheduleDialog from './AddScheduleDialog';
import UpdateScheduleDialog from './UpdateScheduleDialog';

interface RepaymentScheduleManagerProps {
  loanId: string;
  loanPurpose?: string;
  loan?: Loan; // Add loan as optional prop
}

const getStatusColor = (status: PaymentStatus): 'default' | 'success' | 'warning' | 'error' => {
  switch (status) {
    case PaymentStatus.PAID:
      return 'success';
    case PaymentStatus.PENDING:
      return 'warning';
    case PaymentStatus.OVERDUE:
      return 'error';
    case PaymentStatus.PARTIAL:
      return 'warning';
    default:
      return 'default';
  }
};

const RepaymentScheduleManager: React.FC<RepaymentScheduleManagerProps> = ({ 
  loanId, 
  loanPurpose,
  loan: loanProp // Receive loan from parent
}) => {
  const [schedule, setSchedule] = useState<RepaymentSchedule[]>([]);
  const [loanState, setLoanState] = useState<Loan | null>(loanProp || null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<RepaymentSchedule | null>(null);
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string>('');
  
  // New state for Add/Update dialogs
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateDialogState, setUpdateDialogState] = useState<{
    open: boolean;
    type: 'update' | 'markPaid' | 'updateDate';
    installment: RepaymentSchedule | null;
  }>({ open: false, type: 'update', installment: null });
  
  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Update loan state when prop changes
  useEffect(() => {
    if (loanProp) {
      setLoanState(loanProp);
    } else {
      loadLoanData();
    }
  }, [loanProp, loanId]);

  useEffect(() => {
    loadSchedule();
  }, [loanId]);

  const loadSchedule = async () => {
    try {
      setIsLoading(true);
      setError('');
      const data = await apiService.getLoanSchedule(loanId);
      setSchedule(data);
    } catch (err: unknown) {
      console.error('Error loading repayment schedule:', err);
      setError(getErrorMessage(err, 'Failed to load repayment schedule'));
    } finally {
      setIsLoading(false);
    }
  };

  const loadLoanData = async () => {
    try {
      const loanData = await apiService.getLoan(loanId);
      setLoanState(loanData);
    } catch (err: unknown) {
      console.error('Error loading loan data:', err);
    }
  };

  const handleEditClick = (item: RepaymentSchedule) => {
    if (item.status === PaymentStatus.PAID) {
      return; // Don't allow editing paid installments
    }
    
    setSelectedSchedule(item);
    // Convert the due date to YYYY-MM-DD format for the date input
    const date = new Date(item.dueDate);
    const formattedDate = date.toISOString().split('T')[0];
    setNewDueDate(formattedDate);
    setUpdateError('');
    setEditDialogOpen(true);
  };

  const handleUpdateDueDate = async () => {
    if (!selectedSchedule) return;

    try {
      setIsUpdating(true);
      setUpdateError('');

      // Convert the date to ISO string
      const dateObj = new Date(newDueDate);
      const isoDateString = dateObj.toISOString();

      await apiService.updateScheduleDueDate(
        loanId, 
        selectedSchedule.installmentNumber, 
        isoDateString
      );

      // Refresh the schedule
      await loadSchedule();

      // Close dialog
      setEditDialogOpen(false);
      setSelectedSchedule(null);
    } catch (err: unknown) {
      console.error('Error updating due date:', err);
      setUpdateError(getErrorMessage(err, 'Failed to update due date'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setSelectedSchedule(null);
    setUpdateError('');
  };

  // New handlers for Add/Update/Delete operations
  const handleMarkAsPaidClick = (item: RepaymentSchedule) => {
    setUpdateDialogState({
      open: true,
      type: 'markPaid',
      installment: item,
    });
  };

  const handleDeleteClick = async (item: RepaymentSchedule) => {
    if (item.status === PaymentStatus.PAID) {
      setSnackbar({
        open: true,
        message: 'Cannot delete paid installments',
        severity: 'error',
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete installment #${item.installmentNumber}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.deletePaymentInstallment(loanId, item.installmentNumber);
      
      if (response.success) {
        setSnackbar({
          open: true,
          message: 'Installment deleted successfully',
          severity: 'success',
        });
        await loadSchedule();
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to delete installment',
          severity: 'error',
        });
      }
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        message: getErrorMessage(err, 'Failed to delete installment'),
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleScheduleSuccess = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'success',
    });
    loadSchedule();
  };

  const handleScheduleError = (message: string) => {
    setSnackbar({
      open: true,
      message,
      severity: 'error',
    });
  };

  const handleScheduleUpdate = (newSchedule: RepaymentSchedule[]) => {
    setSchedule(newSchedule);
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const getDueDateStatus = (dueDate: string, status: PaymentStatus) => {
    if (status === PaymentStatus.PAID) {
      return null;
    }

    if (isOverdue(dueDate)) {
      return { color: 'error' as const, icon: <Warning />, label: 'Overdue' };
    }

    if (isDueToday(dueDate)) {
      return { color: 'warning' as const, icon: <Schedule />, label: 'Due Today' };
    }

    const days = getDaysUntilDue(dueDate);
    if (days !== null && days <= 7) {
      return { color: 'info' as const, icon: <EventAvailable />, label: `Due in ${days} days` };
    }

    return null;
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  if (schedule.length === 0) {
    return (
      <Alert severity="info">
        No repayment schedule found for this loan.
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Repayment Schedule
          {loanPurpose && (
            <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
              - {loanPurpose}
            </Typography>
          )}
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddDialogOpen(true)}
          disabled={!loanState}
        >
          Add Schedule
        </Button>
      </Box>

      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Due Date</TableCell>
              <TableCell align="right">Principal</TableCell>
              <TableCell align="right">Interest</TableCell>
              <TableCell align="right">Total</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell align="center">Paid At</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedule
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .map((item) => {
              const dueDateStatus = getDueDateStatus(item.dueDate, item.status);
              
              return (
                <TableRow 
                  key={item.id}
                  sx={{
                    bgcolor: item.status === PaymentStatus.PAID 
                      ? 'success.lighter' 
                      : (isOverdue(item.dueDate) && item.status === PaymentStatus.OVERDUE)
                        ? 'error.lighter' 
                        : 'background.paper'
                  }}
                >
                  <TableCell>{item.installmentNumber}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {formatDate(item.dueDate)}
                      {dueDateStatus && (
                        <Tooltip title={dueDateStatus.label}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {React.cloneElement(dueDateStatus.icon, { 
                              fontSize: 'small', 
                              color: dueDateStatus.color 
                            })}
                          </Box>
                        </Tooltip>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    ${item.principalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right">
                    ${item.interestAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="body2" fontWeight="medium">
                      ${item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Chip
                      label={item.status}
                      color={getStatusColor(item.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="center">
                    {item.paidAt ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                        <CheckCircle fontSize="small" color="success" />
                        <Typography variant="caption">
                          {formatDate(item.paidAt)}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        -
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={0.5} justifyContent="center">
                      {/* Edit Due Date Button */}
                      {item.status !== PaymentStatus.PAID && (
                        <Tooltip title="Edit due date">
                          <IconButton 
                            size="small" 
                            onClick={() => handleEditClick(item)}
                            color="primary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {/* Mark as Paid Button */}
                      {(item.status === PaymentStatus.PENDING || item.status === PaymentStatus.OVERDUE) && (
                        <Tooltip title="Mark as paid">
                          <IconButton 
                            size="small" 
                            onClick={() => handleMarkAsPaidClick(item)}
                            color="success"
                          >
                            <PaymentIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      
                      {/* Delete Button */}
                      {item.status !== PaymentStatus.PAID && (
                        <Tooltip title="Delete installment">
                          <IconButton 
                            size="small" 
                            onClick={() => handleDeleteClick(item)}
                            color="error"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Edit Due Date Dialog */}
      <Dialog open={editDialogOpen} onClose={handleCloseEditDialog} maxWidth="xs" fullWidth>
        <DialogTitle>
          Edit Due Date - Installment #{selectedSchedule?.installmentNumber}
        </DialogTitle>
        <DialogContent>
          {updateError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {updateError}
            </Alert>
          )}

          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Current Due Date: {selectedSchedule && formatDateLong(selectedSchedule.dueDate)}
            </Typography>

            <TextField
              label="New Due Date"
              type="date"
              fullWidth
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ mt: 2 }}
              disabled={isUpdating}
            />

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="caption">
                ℹ️ Only PENDING payments can be updated. This change will be reflected immediately.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEditDialog} disabled={isUpdating}>
            Cancel
          </Button>
          <Button 
            onClick={handleUpdateDueDate} 
            variant="contained"
            disabled={isUpdating || !newDueDate}
            startIcon={isUpdating ? <CircularProgress size={20} /> : null}
          >
            {isUpdating ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Schedule Dialog */}
      {loanState && (
        <AddScheduleDialog
          open={addDialogOpen}
          onClose={() => setAddDialogOpen(false)}
          loan={loanState}
          onSuccess={handleScheduleSuccess}
          onError={handleScheduleError}
        />
      )}

      {/* Update Schedule Dialog (for Mark as Paid, etc.) */}
      {loanState && (
        <UpdateScheduleDialog
          open={updateDialogState.open}
          onClose={() => setUpdateDialogState({ open: false, type: 'update', installment: null })}
          loan={loanState}
          installment={updateDialogState.installment}
          type={updateDialogState.type}
          onSuccess={handleScheduleSuccess}
          onError={handleScheduleError}
        />
      )}

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default RepaymentScheduleManager;

