import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  SelectChangeEvent,
} from '@mui/material';
import { Receivable, CreateReceivableRequest, UpdateReceivableRequest, PaymentFrequency } from '../../types/receivable';
import { apiService } from '../../services/api';
import { getErrorMessage } from '../../utils/validation';

interface ReceivableFormProps {
  open: boolean;
  onClose: () => void;
  receivable?: Receivable; // Optional, for editing existing receivables
  onSuccess: (receivable: Receivable) => void;
}

const ReceivableForm: React.FC<ReceivableFormProps> = ({ open, onClose, receivable, onSuccess }) => {
  const initialFormData: CreateReceivableRequest = {
    borrowerName: '',
    borrowerContact: '',
    principal: 0,
    interestRate: 0,
    term: 0,
    monthlyPayment: 0,
    purpose: '',
    paymentFrequency: PaymentFrequency.MONTHLY,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (receivable) {
      setFormData({
        borrowerName: receivable.borrowerName,
        borrowerContact: receivable.borrowerContact || '',
        principal: receivable.principal,
        interestRate: receivable.interestRate,
        term: receivable.term,
        monthlyPayment: receivable.monthlyPayment,
        purpose: receivable.purpose || '',
        paymentFrequency: receivable.paymentFrequency,
      });
    } else {
      setFormData(initialFormData);
    }
    setError('');
  }, [receivable, open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const calculateMonthlyPaymentForData = (principal: number, interestRate: number, term: number): number => {
    if (principal > 0 && term > 0) {
      const monthlyRate = interestRate / 100 / 12;
      if (monthlyRate === 0) {
        // Simple calculation for 0% interest
        return principal / term;
      } else {
        // Amortized calculation
        const payment = (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) /
          (Math.pow(1 + monthlyRate, term) - 1);
        return payment;
      }
    }
    return 0;
  };

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    const numValue = parseFloat(value) || 0;
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: numValue,
      };
      // Auto-calculate monthly payment if principal, interest rate, and term are set
      if ((name === 'principal' || name === 'interestRate' || name === 'term') && 
          updated.principal > 0 && updated.term > 0) {
        updated.monthlyPayment = calculateMonthlyPaymentForData(updated.principal, updated.interestRate, updated.term);
      }
      return updated;
    });
  };


  const validateForm = (): boolean => {
    if (!formData.borrowerName.trim()) {
      setError('Borrower name is required');
      return false;
    }
    if (formData.principal <= 0) {
      setError('Principal amount must be greater than 0');
      return false;
    }
    if (formData.interestRate < 0) {
      setError('Interest rate cannot be negative');
      return false;
    }
    if (formData.term <= 0) {
      setError('Term must be greater than 0');
      return false;
    }
    if (formData.monthlyPayment <= 0) {
      setError('Monthly payment must be greater than 0');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      let result: Receivable;
      if (receivable) {
        const updateData: UpdateReceivableRequest = {
          borrowerName: formData.borrowerName,
          borrowerContact: formData.borrowerContact || undefined,
          principal: formData.principal,
          interestRate: formData.interestRate,
          term: formData.term,
          monthlyPayment: formData.monthlyPayment,
          purpose: formData.purpose || undefined,
          paymentFrequency: formData.paymentFrequency,
        };
        result = await apiService.updateReceivable(receivable.id, updateData);
      } else {
        result = await apiService.createReceivable(formData);
      }
      onSuccess(result);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save receivable'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          {receivable ? 'Edit Receivable' : 'Create New Receivable'}
        </DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Borrower Name"
                name="borrowerName"
                value={formData.borrowerName}
                onChange={handleChange}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Borrower Contact (Email/Phone)"
                name="borrowerContact"
                value={formData.borrowerContact}
                onChange={handleChange}
                placeholder="friend@email.com or +1234567890"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Principal Amount"
                name="principal"
                type="number"
                value={formData.principal}
                onChange={handleNumberChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Interest Rate (%)"
                name="interestRate"
                type="number"
                value={formData.interestRate}
                onChange={handleNumberChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Term (months)"
                name="term"
                type="number"
                value={formData.term}
                onChange={handleNumberChange}
                required
                inputProps={{ min: 1, step: 1 }}
                helperText="Number of months for repayment"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Payment Frequency</InputLabel>
                <Select
                  name="paymentFrequency"
                  value={formData.paymentFrequency}
                  label="Payment Frequency"
                  onChange={handleSelectChange}
                >
                  <MenuItem value={PaymentFrequency.MONTHLY}>Monthly</MenuItem>
                  <MenuItem value={PaymentFrequency.WEEKLY}>Weekly</MenuItem>
                  <MenuItem value={PaymentFrequency.BIWEEKLY}>Bi-weekly</MenuItem>
                  <MenuItem value={PaymentFrequency.QUARTERLY}>Quarterly</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Monthly Payment Amount"
                name="monthlyPayment"
                type="number"
                value={formData.monthlyPayment.toFixed(2)}
                onChange={handleNumberChange}
                required
                inputProps={{ min: 0, step: 0.01 }}
                helperText="Auto-calculated based on principal, interest rate, and term"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purpose (Optional)"
                name="purpose"
                value={formData.purpose}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="e.g., Personal loan to friend"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isLoading}>
            {isLoading ? <CircularProgress size={24} /> : receivable ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ReceivableForm;

