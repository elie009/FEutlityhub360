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
}

const LoanUpdateForm: React.FC<LoanUpdateFormProps> = ({
  open,
  onClose,
  loan,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    purpose: '',
    additionalInfo: '',
    status: '',
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
        interestRate: loan.interestRate || 0,
        monthlyPayment: loan.monthlyPayment || 0,
        remainingBalance: loan.remainingBalance || 0,
      });
    }
  }, [loan]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'number' ? parseFloat(event.target.value) || 0 : event.target.value;
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

    try {
      setIsLoading(true);
      setError('');

      const updatedLoan = await apiService.updateLoan(loan.id, formData);
      onSuccess(updatedLoan);
      onClose();
    } catch (err: unknown) {
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
        Update Loan #{loan.id.slice(-8)}
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
              label="Interest Rate (%)"
              type="number"
              value={formData.interestRate}
              onChange={handleChange('interestRate')}
              fullWidth
              inputProps={{ min: 0, max: 100, step: 0.01 }}
            />

            <TextField
              label="Monthly Payment"
              type="number"
              value={formData.monthlyPayment}
              onChange={handleChange('monthlyPayment')}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              label="Remaining Balance"
              type="number"
              value={formData.remainingBalance}
              onChange={handleChange('remainingBalance')}
              fullWidth
              inputProps={{ min: 0, step: 0.01 }}
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
