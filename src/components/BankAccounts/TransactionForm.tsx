import React, { useState, useEffect, useCallback } from 'react';
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
  Autocomplete,
  Chip,
  Typography,
  Divider,
} from '@mui/material';
import { apiService } from '../../services/api';
import { BankAccount } from '../../types/bankAccount';
import { getErrorMessage } from '../../utils/validation';
import { 
  categorySuggestions, 
  getCategoryType,
  isBillCategory,
  isSavingsCategory,
  isLoanCategory,
  validateTransactionForm,
  generateEnhancedDescription
} from '../../utils/categoryLogic';
import { BillStatus } from '../../types/bill';

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bankAccounts: BankAccount[];
}

interface Bill {
  id: string;
  billName: string;
  amount: number;
  status: string;
}

interface Loan {
  id: string;
  purpose: string;
  principal: number;
  status: string;
}

interface SavingsAccount {
  id: string;
  name: string;
  balance: number;
}

// Get all category suggestions for autocomplete
const ALL_CATEGORIES = [
  ...categorySuggestions.bill,
  ...categorySuggestions.savings,
  ...categorySuggestions.loan,
  ...categorySuggestions.other
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
    referenceNumber: '',
    currency: 'USD',
    // NEW: Reference Fields for Smart Linking
    billId: '',
    savingsAccountId: '',
    loanId: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // State for reference data
  const [bills, setBills] = useState<Bill[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [loadingReferences, setLoadingReferences] = useState(false);
  
  // State for dynamic form fields
  const [showBillSelector, setShowBillSelector] = useState(false);
  const [showSavingsSelector, setShowSavingsSelector] = useState(false);
  const [showLoanSelector, setShowLoanSelector] = useState(false);

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
        referenceNumber: '',
        currency: 'USD',
        billId: '',
        savingsAccountId: '',
        loanId: '',
      });
      setError('');
      // Reset dynamic selectors
      setShowBillSelector(false);
      setShowSavingsSelector(false);
      setShowLoanSelector(false);
    }
  }, [open, bankAccounts]);

  const loadReferenceData = useCallback(async () => {
    setLoadingReferences(true);
    try {
      // Load bills, loans, and savings accounts in parallel
      const [billsResponse, loansResponse] = await Promise.all([
        apiService.getUserBills({ status: BillStatus.PENDING }).catch(() => ({ data: [] })),
        apiService.getUserLoans('demo-user-123').catch(() => [])
      ]);

      setBills(billsResponse.data || []);
      setLoans(Array.isArray(loansResponse) ? loansResponse : []);
      // For now, we'll use bank accounts as savings accounts
      // In a real implementation, you'd have a separate savings accounts API
      setSavingsAccounts(bankAccounts.map(acc => ({
        id: acc.id,
        name: acc.accountName,
        balance: acc.currentBalance
      })));
    } catch (error) {
      console.error('Failed to load reference data:', error);
    } finally {
      setLoadingReferences(false);
    }
  }, [bankAccounts]);

  // Load reference data when dialog opens
  useEffect(() => {
    if (open) {
      loadReferenceData();
    }
  }, [open, loadReferenceData]);

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSelectChange = (field: string) => (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // If transaction type changes to CREDIT, clear category and hide selectors
    if (field === 'transactionType' && value === 'CREDIT') {
      setFormData(prev => ({
        ...prev,
        category: '',
        billId: '',
        savingsAccountId: '',
        loanId: '',
      }));
      setShowBillSelector(false);
      setShowSavingsSelector(false);
      setShowLoanSelector(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
    
    // Show/hide reference selectors based on category
    setShowBillSelector(isBillCategory(category));
    setShowSavingsSelector(isSavingsCategory(category));
    setShowLoanSelector(isLoanCategory(category));
    
    // Clear other references when category changes
    if (!isBillCategory(category)) setFormData(prev => ({ ...prev, billId: '' }));
    if (!isSavingsCategory(category)) setFormData(prev => ({ ...prev, savingsAccountId: '' }));
    if (!isLoanCategory(category)) setFormData(prev => ({ ...prev, loanId: '' }));
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

    // Enhanced validation using category logic
    const validationErrors = validateTransactionForm({
      bankAccountId: formData.bankAccountId,
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      category: formData.category,
      billId: formData.billId,
      savingsAccountId: formData.savingsAccountId,
      loanId: formData.loanId,
      transactionType: formData.transactionType,
    });

    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setIsLoading(true);

    try {
      // Generate enhanced description based on category and reference
      const categoryType = formData.category ? getCategoryType(formData.category) : 'other';
      const enhancedDescription = generateEnhancedDescription(
        formData.description.trim(),
        formData.category || '',
        categoryType === 'other' ? undefined : categoryType,
        undefined // We could pass reference names here if needed
      );

      await apiService.createBankTransaction({
        bankAccountId: formData.bankAccountId,
        amount: parseFloat(formData.amount),
        transactionType: formData.transactionType,
        description: enhancedDescription,
        category: formData.transactionType === 'CREDIT' ? 'CREDIT' : formData.category,
        merchant: formData.merchant.trim() || undefined,
        location: formData.location.trim() || undefined,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        notes: formData.notes.trim() || undefined,
        isRecurring: formData.isRecurring,
        recurringFrequency: formData.isRecurring ? formData.recurringFrequency : undefined,
        referenceNumber: formData.referenceNumber.trim() || undefined,
        currency: formData.currency,
        // NEW: Reference Fields for Smart Linking
        billId: formData.billId || undefined,
        savingsAccountId: formData.savingsAccountId || undefined,
        loanId: formData.loanId || undefined,
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
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

            {formData.transactionType !== 'CREDIT' && (
              <Grid item xs={12} sm={6}>
                <Autocomplete
                  freeSolo
                  options={ALL_CATEGORIES}
                  value={formData.category}
                  onInputChange={(event, newValue) => {
                    if (newValue) {
                      handleCategoryChange(newValue);
                    }
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Category"
                      required
                      placeholder="Type or select a category"
                      helperText="Categories like 'utility', 'savings', 'loan payment' will show additional options"
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        variant="outlined"
                        label={option}
                        {...getTagProps({ index })}
                        key={option}
                      />
                    ))
                  }
                />
              </Grid>
            )}

            {/* Reference Number Field */}
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Reference Number"
                value={formData.referenceNumber}
                onChange={handleInputChange('referenceNumber')}
                placeholder="Optional reference number"
              />
            </Grid>

            {/* Dynamic Reference Selectors */}
            {showBillSelector && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="subtitle2" color="primary">
                    Bill Payment
                  </Typography>
                </Divider>
                <FormControl fullWidth required>
                  <InputLabel>Select Bill</InputLabel>
                  <Select
                    value={formData.billId}
                    onChange={handleSelectChange('billId')}
                    label="Select Bill"
                    disabled={loadingReferences}
                  >
                    {bills.map((bill) => (
                      <MenuItem key={bill.id} value={bill.id}>
                        {bill.billName} - ${bill.amount.toFixed(2)} ({bill.status})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {showSavingsSelector && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="subtitle2" color="primary">
                    Savings Deposit
                  </Typography>
                </Divider>
                <FormControl fullWidth required>
                  <InputLabel>Select Savings Account</InputLabel>
                  <Select
                    value={formData.savingsAccountId}
                    onChange={handleSelectChange('savingsAccountId')}
                    label="Select Savings Account"
                    disabled={loadingReferences}
                  >
                    {savingsAccounts.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.name} - ${account.balance.toFixed(2)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {showLoanSelector && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="subtitle2" color="primary">
                    Loan Payment
                  </Typography>
                </Divider>
                <FormControl fullWidth required>
                  <InputLabel>Select Loan</InputLabel>
                  <Select
                    value={formData.loanId}
                    onChange={handleSelectChange('loanId')}
                    label="Select Loan"
                    disabled={loadingReferences}
                  >
                    {loans.map((loan) => (
                      <MenuItem key={loan.id} value={loan.id}>
                        {loan.purpose} - ${loan.principal.toFixed(2)} ({loan.status})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}

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
