import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Box,
  Alert,
  CircularProgress,
  FormControlLabel,
  Switch,
  SelectChangeEvent,
} from '@mui/material';
import { apiService } from '../../services/api';
import { BankAccount } from '../../types/bankAccount';
import { getErrorMessage } from '../../utils/validation';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bankAccounts: BankAccount[];
}

const TRANSACTION_CATEGORIES = [
  'Food',
  'Transportation',
  'Entertainment',
  'Shopping',
  'Healthcare',
  'Education',
  'Utilities',
  'Insurance',
  'Income',
  'Transfer',
  'Other',
];

const RECURRING_FREQUENCIES = [
  'Daily',
  'Weekly',
  'Monthly',
  'Quarterly',
  'Yearly',
];

const TransactionForm: React.FC<TransactionFormProps> = ({
  open,
  onClose,
  onSuccess,
  bankAccounts,
}) => {
  const [formData, setFormData] = useState({
    bankAccountId: '',
    amount: '',
    transactionType: 'DEBIT' as 'DEBIT' | 'CREDIT',
    description: '',
    category: '',
    merchant: '',
    location: '',
    transactionDate: new Date().toISOString().slice(0, 16), // Format for datetime-local input
    notes: '',
    isRecurring: false,
    recurringFrequency: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setFormData({
        bankAccountId: bankAccounts.length > 0 ? bankAccounts[0].id : '',
        amount: '',
        transactionType: 'DEBIT',
        description: '',
        category: '',
        merchant: '',
        location: '',
        transactionDate: new Date().toISOString().slice(0, 16),
        notes: '',
        isRecurring: false,
        recurringFrequency: '',
      });
      setError('');
    }
  }, [open, bankAccounts]);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSelectChange = (field: string) => (event: SelectChangeEvent<string>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSwitchChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.bankAccountId) {
      setError('Please select a bank account');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description');
      return;
    }
    if (!formData.category) {
      setError('Please select a category');
      return;
    }

    setIsLoading(true);

    try {
      await apiService.createBankTransaction({
        bankAccountId: formData.bankAccountId,
        amount: parseFloat(formData.amount),
        transactionType: formData.transactionType,
        description: formData.description.trim(),
        category: formData.category,
        merchant: formData.merchant.trim() || undefined,
        location: formData.location.trim() || undefined,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        notes: formData.notes.trim() || undefined,
        isRecurring: formData.isRecurring,
        recurringFrequency: formData.isRecurring ? formData.recurringFrequency : undefined,
      });

      onSuccess();
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to create transaction'));
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Transaction</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Bank Account</InputLabel>
                <Select
                  value={formData.bankAccountId}
                  onChange={handleSelectChange('bankAccountId')}
                  label="Bank Account"
                >
                  {bankAccounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.accountName} - {formatCurrency(account.currentBalance)}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Transaction Type</InputLabel>
                <Select
                  value={formData.transactionType}
                  onChange={handleSelectChange('transactionType')}
                  label="Transaction Type"
                >
                  <MenuItem value="DEBIT">Debit (Money Out)</MenuItem>
                  <MenuItem value="CREDIT">Credit (Money In)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                required
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={handleInputChange('amount')}
                inputProps={{ min: 0.01, step: 0.01 }}
                InputProps={{
                  startAdornment: <span style={{ marginRight: 8 }}>$</span>,
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category}
                  onChange={handleSelectChange('category')}
                  label="Category"
                >
                  {TRANSACTION_CATEGORIES.map((category) => (
                    <MenuItem key={category} value={category}>
                      {category}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Description"
                value={formData.description}
                onChange={handleInputChange('description')}
                placeholder="e.g., Lunch at restaurant, Gas station, Salary deposit"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Merchant"
                value={formData.merchant}
                onChange={handleInputChange('merchant')}
                placeholder="e.g., McDonald's, Shell, Amazon"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Location"
                value={formData.location}
                onChange={handleInputChange('location')}
                placeholder="e.g., Downtown Mall, 123 Main St"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Transaction Date"
                type="datetime-local"
                value={formData.transactionDate}
                onChange={handleInputChange('transactionDate')}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isRecurring}
                    onChange={handleSwitchChange('isRecurring')}
                  />
                }
                label="Recurring Transaction"
              />
            </Grid>

            {formData.isRecurring && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Recurring Frequency</InputLabel>
                  <Select
                    value={formData.recurringFrequency}
                    onChange={handleSelectChange('recurringFrequency')}
                    label="Recurring Frequency"
                  >
                    {RECURRING_FREQUENCIES.map((frequency) => (
                      <MenuItem key={frequency} value={frequency.toLowerCase()}>
                        {frequency}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes}
                onChange={handleInputChange('notes')}
                placeholder="Additional notes about this transaction..."
              />
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : null}
        >
          {isLoading ? 'Creating...' : 'Create Transaction'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionForm;
