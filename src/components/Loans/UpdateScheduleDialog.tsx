import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Chip,
} from '@mui/material';
import {
  Edit,
  Payment,
  DateRange,
} from '@mui/icons-material';
import {
  UpdateScheduleRequest,
  MarkAsPaidRequest,
  UpdateDueDateRequest,
  RepaymentSchedule,
  PaymentStatus,
  Loan,
} from '../../types/loan';
import { apiService } from '../../services/api';
import { getErrorMessage } from '../../utils/validation';
import { BankAccount } from '../../types/bankAccount';

interface UpdateScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  loan: Loan;
  installment: RepaymentSchedule | null;
  type: 'update' | 'markPaid' | 'updateDate';
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

const UpdateScheduleDialog: React.FC<UpdateScheduleDialogProps> = ({
  open,
  onClose,
  loan,
  installment,
  type,
  onSuccess,
  onError,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('');

  // Load bank accounts on component mount
  useEffect(() => {
    const loadBankAccounts = async () => {
      setLoadingBankAccounts(true);
      try {
        const accounts = await apiService.getUserBankAccounts();
        setBankAccounts(accounts);
      } catch (err) {
        console.error('Failed to load bank accounts:', err);
      } finally {
        setLoadingBankAccounts(false);
      }
    };
    if (open && type === 'markPaid') {
      loadBankAccounts();
    }
  }, [open, type]);

  // Check if selected payment method requires bank account
  const requiresBankAccount = (paymentMethod: string): boolean => {
    return ['BANK_TRANSFER', 'CARD', 'WALLET'].includes(paymentMethod);
  };

  // Update Schedule State
  const [updateData, setUpdateData] = useState<UpdateScheduleRequest>({
    amount: 0,
    status: PaymentStatus.PENDING,
    dueDate: '',
    paidDate: '',
    paymentMethod: '',
    paymentReference: '',
    notes: '',
  });

  // Mark as Paid State
  const [markPaidData, setMarkPaidData] = useState<MarkAsPaidRequest & { bankAccountId?: string }>({
    amount: 0,
    method: 'CASH',
    reference: '',
    paymentDate: new Date().toISOString(),
    notes: '',
    bankAccountId: '',
  });

  // Update Due Date State
  const [updateDateData, setUpdateDateData] = useState<UpdateDueDateRequest>({
    newDueDate: '',
  });

  useEffect(() => {
    if (installment) {
      // Initialize form data with current installment values
      setUpdateData({
        amount: installment.totalAmount || installment.amountDue || 0,
        status: installment.status,
        dueDate: installment.dueDate,
        paidDate: installment.paidDate || '',
        paymentMethod: installment.paymentMethod || '',
        paymentReference: installment.paymentReference || '',
        notes: installment.notes || '',
      });

      setMarkPaidData({
        amount: installment.totalAmount || installment.amountDue || 0,
        method: installment.paymentMethod || 'CASH',
        reference: installment.paymentReference || '',
        paymentDate: new Date().toISOString(),
        notes: installment.notes || '',
        bankAccountId: '',
      });
      setSelectedBankAccountId('');

      setUpdateDateData({
        newDueDate: installment.dueDate,
      });
    }
  }, [installment]);

  const handleClose = () => {
    onClose();
  };

  const handleUpdate = async () => {
    if (!installment) return;

    try {
      setIsLoading(true);
      const response = await apiService.updatePaymentSchedule(
        loan.id,
        installment.installmentNumber,
        updateData
      );
      
      if (response.success) {
        onSuccess(response.message || 'Payment schedule updated successfully');
        handleClose();
      } else {
        onError(response.message || 'Failed to update payment schedule');
      }
    } catch (err: unknown) {
      onError(getErrorMessage(err, 'Failed to update payment schedule'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsPaid = async () => {
    if (!installment) return;

    try {
      setIsLoading(true);
      // Prepare the request with bank account ID if required
      const requestData: MarkAsPaidRequest & { bankAccountId?: string } = {
        amount: markPaidData.amount,
        method: markPaidData.method,
        reference: markPaidData.reference,
        paymentDate: markPaidData.paymentDate,
        notes: markPaidData.notes,
      };
      
      if (requiresBankAccount(markPaidData.method) && selectedBankAccountId) {
        (requestData as any).bankAccountId = selectedBankAccountId;
      }
      
      const response = await apiService.markInstallmentAsPaid(
        loan.id,
        installment.installmentNumber,
        requestData
      );
      
      if (response.success) {
        onSuccess(response.message || 'Installment marked as paid successfully');
        handleClose();
      } else {
        onError(response.message || 'Failed to mark installment as paid');
      }
    } catch (err: unknown) {
      onError(getErrorMessage(err, 'Failed to mark installment as paid'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDueDate = async () => {
    if (!installment) return;

    try {
      setIsLoading(true);
      const response = await apiService.updateInstallmentDueDate(
        loan.id,
        installment.installmentNumber,
        updateDateData
      );
      
      if (response.success) {
        onSuccess(response.message || 'Due date updated successfully');
        handleClose();
      } else {
        onError(response.message || 'Failed to update due date');
      }
    } catch (err: unknown) {
      onError(getErrorMessage(err, 'Failed to update due date'));
    } finally {
      setIsLoading(false);
    }
  };

  const isUpdateValid = (): boolean => {
    return updateData.amount !== undefined && updateData.amount > 0;
  };

  const isMarkPaidValid = (): boolean => {
    const baseValid = (
      markPaidData.amount > 0 &&
      markPaidData.method !== '' &&
      markPaidData.reference !== '' &&
      markPaidData.paymentDate !== ''
    );
    
    // If payment method requires bank account, validate it's selected
    if (requiresBankAccount(markPaidData.method)) {
      return baseValid && !!selectedBankAccountId;
    }
    
    return baseValid;
  };

  const isUpdateDateValid = (): boolean => {
    return updateDateData.newDueDate !== '';
  };

  const getCurrentActionValid = (): boolean => {
    switch (type) {
      case 'update':
        return isUpdateValid();
      case 'markPaid':
        return isMarkPaidValid();
      case 'updateDate':
        return isUpdateDateValid();
      default:
        return false;
    }
  };

  const handleCurrentAction = () => {
    switch (type) {
      case 'update':
        handleUpdate();
        break;
      case 'markPaid':
        handleMarkAsPaid();
        break;
      case 'updateDate':
        handleUpdateDueDate();
        break;
    }
  };

  const getDialogTitle = (): string => {
    switch (type) {
      case 'update':
        return 'Update Payment Schedule';
      case 'markPaid':
        return 'Mark Installment as Paid';
      case 'updateDate':
        return 'Update Due Date';
      default:
        return 'Update Schedule';
    }
  };

  const getActionButtonText = (): string => {
    switch (type) {
      case 'update':
        return 'Update Schedule';
      case 'markPaid':
        return 'Mark as Paid';
      case 'updateDate':
        return 'Update Date';
      default:
        return 'Update';
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

  if (!installment) {
    return null;
  }

  return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">{getDialogTitle()}</Typography>
          <Typography variant="body2" color="text.secondary">
            Installment #{installment.installmentNumber} - Loan #{loan.id.slice(-8).toUpperCase()}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          {/* Current Installment Info */}
          <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Current Installment Information:
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Due Date:
                </Typography>
                <Typography variant="body2">
                  {formatDate(installment.dueDate)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Amount:
                </Typography>
                <Typography variant="body2">
                  {formatCurrency(installment.totalAmount || installment.amountDue || 0)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Status:
                </Typography>
                <Chip
                  label={installment.status}
                  color={installment.status === 'PAID' ? 'success' : 'default'}
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Payment Method:
                </Typography>
                <Typography variant="body2">
                  {installment.paymentMethod || 'Not specified'}
                </Typography>
              </Grid>
            </Grid>
          </Box>

          {/* Update Schedule Form */}
          {type === 'update' && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Update any field combination for this installment.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="number"
                    value={updateData.amount}
                    onChange={(e) => setUpdateData({
                      ...updateData,
                      amount: parseFloat(e.target.value) || 0
                    })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={updateData.status}
                      label="Status"
                      onChange={(e) => setUpdateData({
                        ...updateData,
                        status: e.target.value as PaymentStatus
                      })}
                    >
                      <MenuItem value="PENDING">Pending</MenuItem>
                      <MenuItem value="PAID">Paid</MenuItem>
                      <MenuItem value="OVERDUE">Overdue</MenuItem>
                      <MenuItem value="PARTIAL">Partial</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Due Date"
                    type="date"
                    value={(updateData.dueDate || installment.dueDate).split('T')[0]}
                    onChange={(e) => setUpdateData({
                      ...updateData,
                      dueDate: new Date(e.target.value).toISOString()
                    })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Paid Date (Optional)"
                    type="date"
                    value={updateData.paidDate ? updateData.paidDate.split('T')[0] : ''}
                    onChange={(e) => setUpdateData({
                      ...updateData,
                      paidDate: e.target.value ? new Date(e.target.value).toISOString() : ''
                    })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={updateData.paymentMethod}
                      label="Payment Method"
                      onChange={(e) => setUpdateData({
                        ...updateData,
                        paymentMethod: e.target.value
                      })}
                    >
                      <MenuItem value="">None</MenuItem>
                      <MenuItem value="CASH">Cash</MenuItem>
                      <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                      <MenuItem value="CARD">Card</MenuItem>
                      <MenuItem value="WALLET">Digital Wallet</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Payment Reference"
                    value={updateData.paymentReference}
                    onChange={(e) => setUpdateData({
                      ...updateData,
                      paymentReference: e.target.value
                    })}
                    placeholder="e.g., PAY-001"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={2}
                    value={updateData.notes}
                    onChange={(e) => setUpdateData({
                      ...updateData,
                      notes: e.target.value
                    })}
                    placeholder="Optional notes about this update"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Mark as Paid Form */}
          {type === 'markPaid' && (
            <Box>
              <Alert severity="success" sx={{ mb: 3 }}>
                Record payment details for this installment.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Payment Amount"
                    type="number"
                    value={markPaidData.amount}
                    onChange={(e) => setMarkPaidData({
                      ...markPaidData,
                      amount: parseFloat(e.target.value) || 0
                    })}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Payment Method</InputLabel>
                    <Select
                      value={markPaidData.method}
                      label="Payment Method"
                      onChange={(e) => {
                        setMarkPaidData({
                          ...markPaidData,
                          method: e.target.value
                        });
                        // Reset bank account selection when payment method changes
                        if (!requiresBankAccount(e.target.value)) {
                          setSelectedBankAccountId('');
                        }
                      }}
                    >
                      <MenuItem value="CASH">Cash</MenuItem>
                      <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                      <MenuItem value="CARD">Card</MenuItem>
                      <MenuItem value="WALLET">Digital Wallet</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                {/* Bank Account Selection - shown when Bank Transfer or Card is selected */}
                {requiresBankAccount(markPaidData.method) && (
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Bank Account</InputLabel>
                      <Select
                        value={selectedBankAccountId}
                        onChange={(e) => setSelectedBankAccountId(e.target.value)}
                        label="Bank Account"
                        disabled={loadingBankAccounts}
                      >
                        {bankAccounts.length === 0 && !loadingBankAccounts && (
                          <MenuItem value="" disabled>
                            No bank accounts available
                          </MenuItem>
                        )}
                        {bankAccounts.map((account) => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.accountName} - {account.accountType} ({new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: account.currency || 'USD',
                            }).format(account.currentBalance)})
                          </MenuItem>
                        ))}
                      </Select>
                      {loadingBankAccounts && (
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <CircularProgress size={16} />
                          <Typography variant="body2" sx={{ ml: 1 }}>
                            Loading bank accounts...
                          </Typography>
                        </Box>
                      )}
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Payment Reference"
                    value={markPaidData.reference}
                    onChange={(e) => setMarkPaidData({
                      ...markPaidData,
                      reference: e.target.value
                    })}
                    placeholder="e.g., PAY-2024-001"
                    required
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Payment Date"
                    type="date"
                    value={markPaidData.paymentDate.split('T')[0]}
                    onChange={(e) => setMarkPaidData({
                      ...markPaidData,
                      paymentDate: new Date(e.target.value).toISOString()
                    })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Notes"
                    multiline
                    rows={2}
                    value={markPaidData.notes}
                    onChange={(e) => setMarkPaidData({
                      ...markPaidData,
                      notes: e.target.value
                    })}
                    placeholder="Payment received in cash"
                  />
                </Grid>
              </Grid>
            </Box>
          )}

          {/* Update Due Date Form */}
          {type === 'updateDate' && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                Change the due date for this specific installment.
              </Alert>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="New Due Date"
                    type="date"
                    value={updateDateData.newDueDate.split('T')[0]}
                    onChange={(e) => setUpdateDateData({
                      newDueDate: new Date(e.target.value).toISOString()
                    })}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1, height: 'fit-content' }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Current Due Date:
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(installment.dueDate)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCurrentAction}
            disabled={isLoading || !getCurrentActionValid()}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {getActionButtonText()}
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default UpdateScheduleDialog;
