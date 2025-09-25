import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  Grid,
  Divider,
} from '@mui/material';
import { PaymentMethod } from '../../types/loan';
import { apiService } from '../../services/api';
import { validatePaymentAmount, validateRequired, generateReferenceNumber, getErrorMessage } from '../../utils/validation';

interface PaymentFormProps {
  loanId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ loanId, onSuccess, onCancel }) => {
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<PaymentMethod>(PaymentMethod.BANK_TRANSFER);
  const [reference, setReference] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [loanDetails, setLoanDetails] = useState<any>(null);

  useEffect(() => {
    loadLoanDetails();
  }, [loanId]);

  const loadLoanDetails = async () => {
    try {
      const loan = await apiService.getLoan(loanId);
      setLoanDetails(loan);
      // Default to full outstanding balance (use remainingBalance if available, fallback to outstandingBalance)
      const balance = loan.remainingBalance || loan.outstandingBalance;
      setAmount(balance);
    } catch (err) {
      setError('Failed to load loan details');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const balance = loanDetails?.remainingBalance || loanDetails?.outstandingBalance || 0;
    const amountValidation = validatePaymentAmount(amount, balance);
    if (!amountValidation.isValid) {
      setError(amountValidation.error || 'Invalid payment amount');
      return;
    }

    const referenceValidation = validateRequired(reference, 'Payment reference');
    if (!referenceValidation.isValid) {
      setError(referenceValidation.error || 'Payment reference is required');
      return;
    }

    setIsLoading(true);

    try {
      await apiService.makeLoanPayment(loanId, {
        amount,
        method: method.toString(),
        reference,
      });
      onSuccess();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Payment failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (value: number) => {
    setAmount(value);
    // Generate a reference number when amount changes
    if (!reference) {
      setReference(generateReferenceNumber('PAY'));
    }
  };

  const quickAmounts = [
    { label: 'Minimum Payment', value: loanDetails?.outstandingBalance ? Math.ceil(loanDetails.outstandingBalance / 12) : 0 },
    { label: 'Half Balance', value: loanDetails?.outstandingBalance ? Math.ceil(loanDetails.outstandingBalance / 2) : 0 },
    { label: 'Full Balance', value: loanDetails?.outstandingBalance || 0 },
  ];

  if (!loanDetails) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Loan Information
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Loan ID
              </Typography>
              <Typography variant="body1">
                #{loanDetails.id.slice(-8)}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Outstanding Balance
              </Typography>
              <Typography variant="h6" color="error.main">
                ${(loanDetails.remainingBalance || loanDetails.outstandingBalance).toLocaleString()}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Interest Rate
              </Typography>
              <Typography variant="body1">
                {loanDetails.interestRate}%
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Term
              </Typography>
              <Typography variant="body1">
                {loanDetails.term} months
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <Typography variant="h6" gutterBottom>
          Payment Details
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Quick Amount Selection
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
              {quickAmounts.map((quick) => (
                <Button
                  key={quick.label}
                  variant="outlined"
                  size="small"
                  onClick={() => handleAmountChange(quick.value)}
                  disabled={quick.value === 0}
                >
                  {quick.label}: ${quick.value.toLocaleString()}
                </Button>
              ))}
            </Box>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Payment Amount"
              type="number"
              value={amount}
              onChange={(e) => handleAmountChange(Number(e.target.value))}
              helperText={`Maximum: $${loanDetails.outstandingBalance.toLocaleString()}`}
              required
              disabled={isLoading}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={method}
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                label="Payment Method"
                disabled={isLoading}
              >
                <MenuItem value={PaymentMethod.BANK_TRANSFER}>Bank Transfer</MenuItem>
                <MenuItem value={PaymentMethod.CARD}>Credit/Debit Card</MenuItem>
                <MenuItem value={PaymentMethod.WALLET}>Digital Wallet</MenuItem>
                <MenuItem value={PaymentMethod.CASH}>Cash</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Payment Reference"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              helperText="Enter a reference number for this payment"
              required
              disabled={isLoading}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Payment will be processed immediately after confirmation
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
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
            >
              {isLoading ? <CircularProgress size={24} /> : 'Process Payment'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default PaymentForm;
