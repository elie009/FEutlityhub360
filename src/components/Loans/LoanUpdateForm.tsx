import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Loan, LoanStatus } from '../../types/loan';
import { apiService } from '../../services/api';
import { getErrorMessage } from '../../utils/validation';

interface LoanUpdateFormProps {
  open: boolean;
  onClose: () => void;
  loan: Loan | null;
  onSuccess: (updatedLoan: Loan) => void;
  onRefresh?: () => Promise<void>; // Add optional refresh callback
}

const LoanUpdateForm: React.FC<LoanUpdateFormProps> = ({
  open,
  onClose,
  loan,
  onSuccess,
  onRefresh,
}) => {
  const [formData, setFormData] = useState({
    purpose: '',
    additionalInfo: '',
    status: '',
    principal: 0,
    interestRate: 0,
    monthlyPayment: 0,
    remainingBalance: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (loan) {
      setFormData({
        purpose: loan.purpose || '',
        additionalInfo: loan.additionalInfo || '',
        status: loan.status || '',
        principal: loan.principal || 0,
        interestRate: loan.interestRate || 0,
        monthlyPayment: loan.monthlyPayment || 0,
        remainingBalance: loan.remainingBalance || 0,
      });
    }
  }, [loan]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'number' ? parseFloat(event.target.value) : event.target.value;
    console.log(`🔄 Field changed: ${field}`, { oldValue: formData[field as keyof typeof formData], newValue: value });
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!loan) return;

    // Build update data - ONLY send fields that changed
    const updateData: any = {};
    
    if (formData.purpose !== loan.purpose) {
      updateData.purpose = formData.purpose;
    }
    
    if (formData.additionalInfo !== loan.additionalInfo) {
      updateData.additionalInfo = formData.additionalInfo;
    }
    
    if (formData.status !== loan.status) {
      updateData.status = formData.status;
    }
    
    if (formData.principal !== loan.principal) {
      updateData.principal = formData.principal;
    }
    
    if (formData.interestRate !== loan.interestRate) {
      updateData.interestRate = formData.interestRate;
    }
    
    if (formData.monthlyPayment !== loan.monthlyPayment) {
      updateData.monthlyPayment = formData.monthlyPayment;
    }
    
    if (formData.remainingBalance !== loan.remainingBalance) {
      updateData.remainingBalance = formData.remainingBalance;
    }

    console.log('📤 Submitting loan update:');
    console.log('🔹 Original Loan:', {
      principal: loan.principal,
      interestRate: loan.interestRate,
      monthlyPayment: loan.monthlyPayment,
      remainingBalance: loan.remainingBalance,
      totalAmount: loan.totalAmount,
    });
    console.log('🔹 Fields Changed:', updateData);
    console.log('🔹 Backend Will Auto-Calculate:', {
      monthlyPayment: !updateData.hasOwnProperty('monthlyPayment') && 
                     (updateData.hasOwnProperty('principal') || updateData.hasOwnProperty('interestRate')) 
                     ? '✅ YES' : '❌ NO (using manual value)',
      totalAmount: '✅ ALWAYS (if any financial field changed)',
      remainingBalance: !updateData.hasOwnProperty('remainingBalance') && 
                       (updateData.hasOwnProperty('principal') || 
                        updateData.hasOwnProperty('interestRate') || 
                        updateData.hasOwnProperty('monthlyPayment'))
                       ? '✅ YES' : '❌ NO (using manual value)',
    });

    try {
      setIsLoading(true);
      setError('');

      const updatedLoan = await apiService.updateLoan(loan.id, updateData);
      
      console.log('✅ Loan updated successfully!');
      console.log('📊 Backend Response:', {
        id: updatedLoan.id,
        principal: updatedLoan.principal,
        interestRate: updatedLoan.interestRate,
        monthlyPayment: updatedLoan.monthlyPayment,
        totalAmount: updatedLoan.totalAmount,
        remainingBalance: updatedLoan.remainingBalance,
        status: updatedLoan.status,
      });
      console.log('🔄 Changes Applied:', {
        principal: loan.principal !== updatedLoan.principal 
          ? `${loan.principal} → ${updatedLoan.principal}` 
          : 'unchanged',
        interestRate: loan.interestRate !== updatedLoan.interestRate
          ? `${loan.interestRate}% → ${updatedLoan.interestRate}%`
          : 'unchanged',
        monthlyPayment: loan.monthlyPayment !== updatedLoan.monthlyPayment
          ? `${loan.monthlyPayment} → ${updatedLoan.monthlyPayment}`
          : 'unchanged',
        remainingBalance: loan.remainingBalance !== updatedLoan.remainingBalance
          ? `${loan.remainingBalance} → ${updatedLoan.remainingBalance}`
          : 'unchanged',
        totalAmount: loan.totalAmount !== updatedLoan.totalAmount
          ? `${loan.totalAmount} → ${updatedLoan.totalAmount} (calculated)`
          : 'unchanged',
      });

      onSuccess(updatedLoan);
      
      // Refresh the loan list to ensure all calculated fields are updated
      if (onRefresh) {
        console.log('🔄 Refreshing loan list...');
        await onRefresh();
      }
      
      onClose();
    } catch (err: unknown) {
      console.error('❌ Error updating loan:', err);
      setError(getErrorMessage(err, 'Failed to update loan'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!loan) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Update Loan #{loan.id.slice(-8).toUpperCase()}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Purpose"
              value={formData.purpose}
              onChange={handleChange('purpose')}
              fullWidth
              required
            />

            <TextField
              label="Additional Information"
              value={formData.additionalInfo}
              onChange={handleChange('additionalInfo')}
              fullWidth
              multiline
              rows={3}
            />

            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                onChange={handleSelectChange('status')}
                label="Status"
              >
                <MenuItem value={LoanStatus.PENDING}>Pending</MenuItem>
                <MenuItem value={LoanStatus.APPROVED}>Approved</MenuItem>
                <MenuItem value={LoanStatus.ACTIVE}>Active</MenuItem>
                <MenuItem value={LoanStatus.OVERDUE}>Overdue</MenuItem>
                <MenuItem value={LoanStatus.CLOSED}>Closed</MenuItem>
                <MenuItem value={LoanStatus.REJECTED}>Rejected</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Principal Amount"
              type="number"
              value={formData.principal ?? ''}
              onChange={handleChange('principal')}
              fullWidth
              inputProps={{ min: 0.01, step: 0.01 }}
              helperText="⭐ Original loan amount - Changing this auto-calculates all other financial values"
            />

            <TextField
              label="Interest Rate (%)"
              type="number"
              value={formData.interestRate ?? ''}
              onChange={handleChange('interestRate')}
              fullWidth
              inputProps={{ min: 0, max: 100, step: 0.01 }}
              helperText="Changing this auto-calculates monthly payment and remaining balance"
            />

            <TextField
              label="Monthly Payment"
              type="number"
              value={formData.monthlyPayment ?? ''}
              onChange={handleChange('monthlyPayment')}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
              helperText="Leave unchanged to auto-calculate based on principal/interest rate"
            />

            <TextField
              label="Remaining Balance"
              type="number"
              value={formData.remainingBalance ?? ''}
              onChange={handleChange('remainingBalance')}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
              helperText="Leave unchanged to auto-calculate when financial values change"
            />
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Updating...' : 'Update Loan'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LoanUpdateForm;
