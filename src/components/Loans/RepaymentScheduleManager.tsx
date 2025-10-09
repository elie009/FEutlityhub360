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
} from '@mui/material';
import {
  Edit as EditIcon,
  CheckCircle,
  Schedule,
  EventAvailable,
  Warning,
} from '@mui/icons-material';
import { RepaymentSchedule, PaymentStatus } from '../../types/loan';
import { apiService } from '../../services/api';
import { getErrorMessage } from '../../utils/validation';
import { formatDate, formatDateLong, isOverdue, isDueToday, getDaysUntilDue } from '../../utils/dateUtils';

interface RepaymentScheduleManagerProps {
  loanId: string;
  loanPurpose?: string;
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

const RepaymentScheduleManager: React.FC<RepaymentScheduleManagerProps> = ({ loanId, loanPurpose }) => {
  const [schedule, setSchedule] = useState<RepaymentSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<RepaymentSchedule | null>(null);
  const [newDueDate, setNewDueDate] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string>('');

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
      <Typography variant="h6" gutterBottom>
        Repayment Schedule
        {loanPurpose && (
          <Typography variant="body2" color="text.secondary" component="span" sx={{ ml: 1 }}>
            - {loanPurpose}
          </Typography>
        )}
      </Typography>

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
            {schedule.map((item) => {
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
    </Box>
  );
};

export default RepaymentScheduleManager;

