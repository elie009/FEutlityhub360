import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
import { ReceivablePaymentMethod, CreateReceivablePaymentRequest } from '../../types/receivable';

interface ReceivablePaymentFormProps {
  open: boolean;
  onClose: () => void;
  receivableId: string;
  onSuccess: () => void;
}

const ReceivablePaymentForm: React.FC<ReceivablePaymentFormProps> = ({ 
  open, 
  onClose, 
  receivableId, 
  onSuccess 
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<ReceivablePaymentMethod>(ReceivablePaymentMethod.BANK_TRANSFER);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);

  // Load bank accounts on component mount
  useEffect(() => {
    if (open) {
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
    }
  }, [open]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setAmount(0);
      setMethod(ReceivablePaymentMethod.BANK_TRANSFER);
      setSelectedBankAccountId('');
      setReference('');
      setPaymentDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setError('');
    }
  }, [open]);

  // Check if selected payment method requires bank account
  const requiresBankAccount = (paymentMethod: ReceivablePaymentMethod): boolean => {
    return [
      ReceivablePaymentMethod.BANK_TRANSFER,
      ReceivablePaymentMethod.CARD,
      ReceivablePaymentMethod.WALLET,
    ].includes(paymentMethod);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (amount <= 0) {
      setError('Amount must be greater than 0');
      return;
    }

    if (!paymentDate) {
      setError('Payment date is required');
      return;
    }

    // Bank account is optional even for bank-related payment methods
    // It's only used to credit the account if provided

    setIsLoading(true);

    try {
      const paymentData: CreateReceivablePaymentRequest = {
        amount,
        method,
        reference: reference || undefined,
        paymentDate: new Date(paymentDate).toISOString(),
        bankAccountId: requiresBankAccount(method) ? selectedBankAccountId : null,
        notes: notes || undefined,
      };
      
      await apiService.createReceivablePayment(receivableId, paymentData);
      onSuccess();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to record payment'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>Record Payment</DialogTitle>
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
                label="Payment Amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
                inputProps={{ min: 0.01, step: 0.01 }}
                helperText="Enter the payment amount received"
              />
            </Grid>

            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  value={method}
                  onChange={(e) => {
                    setMethod(e.target.value as ReceivablePaymentMethod);
                    // Reset bank account selection when payment method changes
                    if (!requiresBankAccount(e.target.value as ReceivablePaymentMethod)) {
                      setSelectedBankAccountId('');
                    }
                  }}
                  label="Payment Method"
                >
                  <MenuItem value={ReceivablePaymentMethod.BANK_TRANSFER}>Bank Transfer</MenuItem>
                  <MenuItem value={ReceivablePaymentMethod.CARD}>Card</MenuItem>
                  <MenuItem value={ReceivablePaymentMethod.WALLET}>Wallet</MenuItem>
                  <MenuItem value={ReceivablePaymentMethod.CASH}>Cash</MenuItem>
                  <MenuItem value={ReceivablePaymentMethod.CHECK}>Check</MenuItem>
                  <MenuItem value={ReceivablePaymentMethod.OTHER}>Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {requiresBankAccount(method) && (
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Bank Account (Optional - credits your account)</InputLabel>
                  <Select
                    value={selectedBankAccountId}
                    onChange={(e) => setSelectedBankAccountId(e.target.value)}
                    label="Bank Account (Optional - credits your account)"
                    disabled={loadingBankAccounts}
                  >
                    <MenuItem value="">None</MenuItem>
                    {bankAccounts.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.accountName} - {account.accountType}
                      </MenuItem>
                    ))}
                  </Select>
                  {loadingBankAccounts && (
                    <Alert severity="info" sx={{ mt: 1 }}>
                      Loading bank accounts...
                    </Alert>
                  )}
                </FormControl>
              </Grid>
            )}

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                required
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Reference (Optional)"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="e.g., PAYMENT-001"
                helperText="Enter a reference number for this payment"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={3}
                placeholder="Additional notes about this payment"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isLoading || amount <= 0}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Recording...' : 'Record Payment'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ReceivablePaymentForm;

