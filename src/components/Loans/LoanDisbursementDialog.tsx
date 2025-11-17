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
  Box,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  AccountBalance,
  Info as InfoIcon,
  CheckCircle,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { Loan } from '../../types/loan';
import { BankAccount } from '../../types/bankAccount';
import { apiService } from '../../services/api';
import { useCurrency } from '../../contexts/CurrencyContext';
import { useAuth } from '../../contexts/AuthContext';

interface LoanDisbursementDialogProps {
  open: boolean;
  onClose: () => void;
  loan: Loan | null;
  onSuccess: () => void;
}

const LoanDisbursementDialog: React.FC<LoanDisbursementDialogProps> = ({
  open,
  onClose,
  loan,
  onSuccess,
}) => {
  const { formatCurrency } = useCurrency();
  const { user } = useAuth();
  const [disbursementMethod, setDisbursementMethod] = useState<'BANK_TRANSFER' | 'CASH' | 'CHECK' | 'CASH_PICKUP'>('BANK_TRANSFER');
  const [bankAccountId, setBankAccountId] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | null>(null);

  // Fetch user's bank accounts when dialog opens
  useEffect(() => {
    if (open && loan) {
      fetchBankAccounts();
    } else {
      // Reset form when dialog closes
      setDisbursementMethod('BANK_TRANSFER');
      setBankAccountId('');
      setReference('');
      setSelectedAccount(null);
      setError('');
    }
  }, [open, loan]);

  // Update selected account when bankAccountId changes
  useEffect(() => {
    if (bankAccountId && bankAccounts.length > 0) {
      const account = bankAccounts.find(acc => acc.id === bankAccountId);
      setSelectedAccount(account || null);
    } else {
      setSelectedAccount(null);
    }
  }, [bankAccountId, bankAccounts]);

  const fetchBankAccounts = async () => {
    if (!loan) return;
    
    try {
      setLoadingAccounts(true);
      const accounts = await apiService.getUserBankAccounts({ isActive: true });
      setBankAccounts(accounts.filter(acc => acc.isActive));
    } catch (err: any) {
      console.error('Failed to fetch bank accounts:', err);
      // Don't show error for bank accounts, just use empty list
      setBankAccounts([]);
    } finally {
      setLoadingAccounts(false);
    }
  };

  const handleDisburse = async () => {
    if (!loan || !user) return;

    setLoading(true);
    setError('');

    try {
      const disbursementData: any = {
        disbursementMethod,
        disbursedBy: user.id,
      };

      if (reference.trim()) {
        disbursementData.reference = reference.trim();
      }

      // Only include bankAccountId if method is CASH or BANK_TRANSFER
      if ((disbursementMethod === 'CASH' || disbursementMethod === 'BANK_TRANSFER') && bankAccountId) {
        disbursementData.bankAccountId = bankAccountId;
      }

      const result = await apiService.disburseLoan(loan.id, disbursementData);

      if (result.success) {
        // Show success message
        if (result.data.bankAccountCredited) {
          // Success with bank account credit
          onSuccess();
          onClose();
          // You can show a toast/snackbar here if needed
        } else {
          // Success without bank account credit
          onSuccess();
          onClose();
        }
      } else {
        setError(result.message || 'Failed to disburse loan');
      }
    } catch (err: any) {
      console.error('Disbursement error:', err);
      setError(err.message || 'An error occurred while disbursing loan');
    } finally {
      setLoading(false);
    }
  };

  const shouldShowBankAccountField = disbursementMethod === 'CASH' || disbursementMethod === 'BANK_TRANSFER';
  const projectedBalance = selectedAccount && loan 
    ? selectedAccount.currentBalance + loan.principal 
    : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Disburse Loan
      </DialogTitle>
      <DialogContent>
        {loan && (
          <Box>
            {/* Loan Info */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
              <Typography variant="subtitle2" gutterBottom>
                Loan Amount
              </Typography>
              <Typography variant="h5">
                {formatCurrency(loan.principal)}
              </Typography>
              <Typography variant="body2" sx={{ mt: 1 }}>
                Purpose: {loan.purpose}
              </Typography>
            </Paper>

            {/* Disbursement Method */}
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Disbursement Method *</InputLabel>
              <Select
                value={disbursementMethod}
                onChange={(e) => {
                  setDisbursementMethod(e.target.value as any);
                  // Clear bank account when method changes to non-credit method
                  if (e.target.value !== 'CASH' && e.target.value !== 'BANK_TRANSFER') {
                    setBankAccountId('');
                  }
                }}
                label="Disbursement Method *"
              >
                <MenuItem value="BANK_TRANSFER">Bank Transfer</MenuItem>
                <MenuItem value="CASH">Cash</MenuItem>
                <MenuItem value="CHECK">Check</MenuItem>
                <MenuItem value="CASH_PICKUP">Cash Pickup</MenuItem>
              </Select>
            </FormControl>

            {/* Bank Account Selection - Only show for CASH or BANK_TRANSFER */}
            {shouldShowBankAccountField && (
              <Box sx={{ mb: 3 }}>
                <FormControl fullWidth>
                  <InputLabel>
                    Credit to Bank Account
                  </InputLabel>
                  <Select
                    value={bankAccountId}
                    onChange={(e) => setBankAccountId(e.target.value)}
                    label="Credit to Bank Account"
                    disabled={loadingAccounts}
                  >
                    <MenuItem value="">
                      <em>-- Select Bank Account (Optional) --</em>
                    </MenuItem>
                    {bankAccounts.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.accountName} - {account.financialInstitution || 'N/A'}
                        {' '}(Balance: {formatCurrency(account.currentBalance)})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  💡 If selected, the loan amount will be automatically credited to this account
                </Typography>

                {/* Balance Preview */}
                {selectedAccount && projectedBalance !== null && loan && (
                  <Paper sx={{ p: 2, mt: 2, bgcolor: 'info.light' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Balance Preview
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="Current Balance"
                          secondary={formatCurrency(selectedAccount.currentBalance)}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="Loan Amount"
                          secondary={formatCurrency(loan.principal)}
                        />
                      </ListItem>
                      <Divider />
                      <ListItem>
                        <ListItemText 
                          primary="New Balance"
                          secondary={
                            <Typography variant="h6" color="primary">
                              {formatCurrency(projectedBalance)}
                            </Typography>
                          }
                        />
                      </ListItem>
                    </List>
                  </Paper>
                )}
              </Box>
            )}

            {/* Info Box for CASH method */}
            {disbursementMethod === 'CASH' && (
              <Alert icon={<InfoIcon />} severity="info" sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  💡 Cash Disbursement:
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <CheckCircle fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="If you select a bank account, the loan amount will be credited to that account"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <WarningIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="If no bank account is selected, the loan will be disbursed as cash (no automatic crediting)"
                    />
                  </ListItem>
                </List>
              </Alert>
            )}

            {/* Reference Number */}
            <TextField
              fullWidth
              label="Reference Number (Optional)"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
              placeholder="e.g., DISB-20241201-001"
              sx={{ mb: 3 }}
            />

            {/* Warning if bank account selected */}
            {bankAccountId && shouldShowBankAccountField && (
              <Alert severity="warning" sx={{ mb: 2 }}>
                <strong>⚠️ Note:</strong> The loan amount will be automatically credited to the selected bank account. 
                The account balance will increase immediately upon disbursement.
              </Alert>
            )}

            {/* Error Message */}
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleDisburse}
          variant="contained"
          disabled={loading || !loan}
          startIcon={loading ? <CircularProgress size={20} /> : <AccountBalance />}
        >
          {loading ? 'Disbursing...' : 'Disburse Loan'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoanDisbursementDialog;






