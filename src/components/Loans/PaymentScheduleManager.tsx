import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  Alert,
  CircularProgress,
  Tooltip,
  Stack,
} from '@mui/material';
import {
  MoreVert,
  Add,
  Edit,
  Delete,
  Payment,
  DateRange,
  Extension,
  Refresh,
  Schedule,
} from '@mui/icons-material';
import { 
  RepaymentSchedule, 
  Loan, 
  PaymentStatus,
  AddCustomScheduleRequest,
  ExtendLoanTermRequest,
  RegenerateScheduleRequest,
  UpdateScheduleRequest,
  MarkAsPaidRequest,
  UpdateDueDateRequest
} from '../../types/loan';
import { apiService } from '../../services/api';
import { getErrorMessage } from '../../utils/validation';

interface PaymentScheduleManagerProps {
  loan: Loan;
  schedule: RepaymentSchedule[];
  onScheduleUpdate: (newSchedule: RepaymentSchedule[]) => void;
  onError: (error: string) => void;
  onOpenAddDialog?: () => void;
  onOpenUpdateDialog?: (type: 'update' | 'markPaid' | 'updateDate', installment: RepaymentSchedule) => void;
}

interface ActionMenuState {
  anchorEl: HTMLElement | null;
  installment: RepaymentSchedule | null;
}

const PaymentScheduleManager: React.FC<PaymentScheduleManagerProps> = ({
  loan,
  schedule,
  onScheduleUpdate,
  onError,
  onOpenAddDialog,
  onOpenUpdateDialog,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [actionMenu, setActionMenu] = useState<ActionMenuState>({
    anchorEl: null,
    installment: null,
  });

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: PaymentStatus): 'default' | 'success' | 'error' | 'warning' => {
    switch (status) {
      case 'PAID':
        return 'success';
      case 'OVERDUE':
        return 'error';
      case 'PARTIAL':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, installment: RepaymentSchedule) => {
    setActionMenu({
      anchorEl: event.currentTarget,
      installment,
    });
  };

  const handleActionMenuClose = () => {
    setActionMenu({
      anchorEl: null,
      installment: null,
    });
  };

  const handleMenuAction = (action: string) => {
    const { installment } = actionMenu;
    handleActionMenuClose();

    if (!installment) return;

    switch (action) {
      case 'update':
        onOpenUpdateDialog?.('update', installment);
        break;
      case 'markPaid':
        onOpenUpdateDialog?.('markPaid', installment);
        break;
      case 'updateDate':
        onOpenUpdateDialog?.('updateDate', installment);
        break;
      case 'delete':
        handleDeleteInstallment(installment);
        break;
    }
  };

  const handleDeleteInstallment = async (installment: RepaymentSchedule) => {
    if (installment.status === 'PAID') {
      onError('Cannot delete paid installments');
      return;
    }

    if (!window.confirm(`Are you sure you want to delete installment #${installment.installmentNumber}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.deletePaymentInstallment(loan.id, installment.installmentNumber);
      
      if (response.success) {
        // Remove the deleted installment from the schedule
        const updatedSchedule = schedule.filter(s => s.id !== installment.id);
        onScheduleUpdate(updatedSchedule);
      } else {
        onError(response.message || 'Failed to delete installment');
      }
    } catch (err: unknown) {
      onError(getErrorMessage(err, 'Failed to delete installment'));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSchedule = async () => {
    try {
      setIsLoading(true);
      const newSchedule = await apiService.getLoanSchedule(loan.id);
      onScheduleUpdate(newSchedule);
    } catch (err: unknown) {
      onError(getErrorMessage(err, 'Failed to refresh schedule'));
    } finally {
      setIsLoading(false);
    }
  };

  const canDeleteInstallment = (installment: RepaymentSchedule): boolean => {
    return installment.status !== 'PAID';
  };

  const canMarkAsPaid = (installment: RepaymentSchedule): boolean => {
    return installment.status === 'PENDING' || installment.status === 'OVERDUE';
  };

  return (
    <Box>
      {/* Schedule Management Actions */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Schedule color="primary" />
              Payment Schedule Management
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={refreshSchedule}
              disabled={isLoading}
            >
              Refresh
            </Button>
          </Box>

          <Stack direction="row" spacing={2} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => onOpenAddDialog?.()}
              disabled={isLoading}
            >
              Add Schedule
            </Button>
            <Button
              variant="outlined"
              startIcon={<Extension />}
              onClick={() => onOpenAddDialog?.()}
              disabled={isLoading}
            >
              Extend Term
            </Button>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={() => onOpenAddDialog?.()}
              disabled={isLoading}
            >
              Regenerate Schedule
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {/* Schedule Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Payment Schedule ({schedule.length} installments)
          </Typography>

          {isLoading && (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          )}

          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>#</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell align="right">Principal</TableCell>
                  <TableCell align="right">Interest</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell>Payment Method</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map((installment) => (
                  <TableRow 
                    key={installment.id}
                    sx={{ 
                      backgroundColor: installment.status === 'PAID' ? 'action.hover' : 'inherit',
                    }}
                  >
                    <TableCell>{installment.installmentNumber}</TableCell>
                    <TableCell>{formatDate(installment.dueDate)}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(installment.totalAmount || installment.amountDue || 0)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(installment.principalAmount)}
                    </TableCell>
                    <TableCell align="right">
                      {formatCurrency(installment.interestAmount)}
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={installment.status}
                        color={getStatusColor(installment.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {installment.paymentMethod || '-'}
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleActionMenuOpen(e, installment)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {schedule.length === 0 && (
            <Box textAlign="center" py={4}>
              <Typography variant="body2" color="text.secondary">
                No payment schedule available
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Action Menu */}
      <Menu
        anchorEl={actionMenu.anchorEl}
        open={Boolean(actionMenu.anchorEl)}
        onClose={handleActionMenuClose}
      >
        <MenuItem onClick={() => handleMenuAction('update')}>
          <Edit sx={{ mr: 1 }} fontSize="small" />
          Update Schedule
        </MenuItem>
        {actionMenu.installment && canMarkAsPaid(actionMenu.installment) && (
          <MenuItem onClick={() => handleMenuAction('markPaid')}>
            <Payment sx={{ mr: 1 }} fontSize="small" />
            Mark as Paid
          </MenuItem>
        )}
        <MenuItem onClick={() => handleMenuAction('updateDate')}>
          <DateRange sx={{ mr: 1 }} fontSize="small" />
          Update Due Date
        </MenuItem>
        {actionMenu.installment && canDeleteInstallment(actionMenu.installment) && (
          <MenuItem 
            onClick={() => handleMenuAction('delete')}
            sx={{ color: 'error.main' }}
          >
            <Delete sx={{ mr: 1 }} fontSize="small" />
            Delete Installment
          </MenuItem>
        )}
      </Menu>

    </Box>
  );
};

export default PaymentScheduleManager;
