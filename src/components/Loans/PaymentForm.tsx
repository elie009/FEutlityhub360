import React, { useState } from 'react';
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

interface PaymentFormProps {
  loanId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ loanId, onSuccess, onCancel }) => {
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<string>('Bank transfer');
  const [reference, setReference] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

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

    setIsLoading(true);

    try {
      await apiService.makeLoanPayment(loanId, {
        amount,
        method,
        reference,
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
            <InputLabel>Method</InputLabel>
            <Select
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              label="Method"
            >
              <MenuItem value="Bank transfer">Bank transfer</MenuItem>
              <MenuItem value="Debit or Credit Card">Debit or Credit Card</MenuItem>
              <MenuItem value="Digital wallet payment">Digital wallet payment</MenuItem>
              <MenuItem value="Cash">Cash</MenuItem>
            </Select>
          </FormControl>
        </Grid>

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
              disabled={isLoading || amount <= 0}
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