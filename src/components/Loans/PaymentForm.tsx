import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import { apiService } from '../../services/api';
import { getErrorMessage } from '../../utils/validation';
import { BankAccount } from '../../types/bankAccount';

interface PaymentFormProps {
  loanId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ loanId, onSuccess, onCancel }) => {
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<string>('Bank transaction');
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);

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
    loadBankAccounts();
  }, []);

  // Check if selected payment method requires bank account
  const requiresBankAccount = (paymentMethod: string): boolean => {
    return ['Bank transaction', 'Debit or Credit Card', 'Digital wallet payment'].includes(paymentMethod);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!reference.trim()) {
      setError('Reference is required');
      return;
    }

    // Validate bank account selection for bank-related payment methods
    if (requiresBankAccount(method) && !selectedBankAccountId) {
      setError('Please select a bank account for this payment method');
      return;
    }

    setIsLoading(true);

    try {
      await apiService.makeLoanPayment(loanId, {
        amount,
        method,
        reference,
        bankAccountId: requiresBankAccount(method) ? selectedBankAccountId : undefined,
      });
      onSuccess();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Payment failed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
            inputProps={{ min: 0.01, step: 0.01 }}
            helperText="Enter the payment amount"
          />
        </Grid>

        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Payment Method</InputLabel>
            <Select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                // Reset bank account selection when payment method changes
                if (!requiresBankAccount(e.target.value)) {
                  setSelectedBankAccountId('');
                }
              }}
              label="Payment Method"
            >
              <MenuItem value="Bank transaction">Bank transaction</MenuItem>
              <MenuItem value="Debit or Credit Card">Debit or Credit Card</MenuItem>
              <MenuItem value="Digital wallet payment">Digital wallet payment</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        {requiresBankAccount(method) && (
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Bank Account</InputLabel>
              <Select
                value={selectedBankAccountId}
                onChange={(e) => setSelectedBankAccountId(e.target.value)}
                label="Bank Account"
                disabled={loadingBankAccounts}
              >
                {bankAccounts.map((account) => (
                  <MenuItem key={account.id} value={account.id}>
                    {account.accountName} - {account.accountType} (${account.currentBalance.toLocaleString()})
                  </MenuItem>
                ))}
              </Select>
              {loadingBankAccounts && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <CircularProgress size={16} />
                  <span style={{ marginLeft: 8 }}>Loading bank accounts...</span>
                </Box>
              )}
            </FormControl>
          </Grid>
        )}

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Reference"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            required
            helperText="Enter a reference number for this payment"
          />
        </Grid>

        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading || amount <= 0 || (requiresBankAccount(method) && !selectedBankAccountId)}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Processing...' : 'Submit Payment'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PaymentForm;