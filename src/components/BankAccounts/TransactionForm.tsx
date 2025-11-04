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
  FormControlLabel,
  Switch,
  SelectChangeEvent,
  Autocomplete,
  Chip,
  Typography,
  Divider,
  Skeleton,
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
  isTransferCategory,
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
// Bank transfer appears first for easy access
const ALL_CATEGORIES = [
  ...categorySuggestions.transfer,
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
    toBankAccountId: '', // For bank transfers
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // State for reference data
  const [bills, setBills] = useState<Bill[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  
  // Separate loading states for each data source
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
  const [loadingBills, setLoadingBills] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [loadingSavingsAccounts, setLoadingSavingsAccounts] = useState(false);
  
  // State for dynamic form fields
  const [showBillSelector, setShowBillSelector] = useState(false);
  const [showSavingsSelector, setShowSavingsSelector] = useState(false);
  const [showLoanSelector, setShowLoanSelector] = useState(false);
  const [showTransferSelector, setShowTransferSelector] = useState(false);

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
        toBankAccountId: '',
      });
      setError('');
      // Reset dynamic selectors
      setShowBillSelector(false);
      setShowSavingsSelector(false);
      setShowLoanSelector(false);
      setShowTransferSelector(false);
    }
  }, [open, bankAccounts]);

  // Load each data source asynchronously with individual loading states
  // Added minimum delays to make skeleton screens visible
  const loadBills = useCallback(async () => {
    setLoadingBills(true);
    try {
      const startTime = Date.now();
      const billsResponse = await apiService.getUserBills({ status: BillStatus.PENDING });
      const elapsed = Date.now() - startTime;
      const minDelay = 800; // Minimum 800ms to see skeleton
      
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }
      
      setBills(billsResponse.data || []);
    } catch (error) {
      console.error('Failed to load bills:', error);
      setBills([]);
      // Still show skeleton for minimum time even on error
      await new Promise(resolve => setTimeout(resolve, 800));
    } finally {
      setLoadingBills(false);
    }
  }, []);

  const loadLoans = useCallback(async () => {
    setLoadingLoans(true);
    try {
      const startTime = Date.now();
      const loansResponse = await apiService.getUserLoans('demo-user-123');
      const elapsed = Date.now() - startTime;
      const minDelay = 1000; // Minimum 1000ms to see skeleton
      
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }
      
      setLoans(Array.isArray(loansResponse) ? loansResponse : []);
    } catch (error) {
      console.error('Failed to load loans:', error);
      setLoans([]);
      // Still show skeleton for minimum time even on error
      await new Promise(resolve => setTimeout(resolve, 1000));
    } finally {
      setLoadingLoans(false);
    }
  }, []);

  const loadSavingsAccounts = useCallback(async () => {
    setLoadingSavingsAccounts(true);
    try {
      // For now, we'll use bank accounts as savings accounts
      // In a real implementation, you'd have a separate savings accounts API
      // Add delay to show skeleton screen
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const accounts = bankAccounts.map(acc => ({
        id: acc.id,
        name: acc.accountName,
        balance: acc.currentBalance
      }));
      setSavingsAccounts(accounts);
    } catch (error) {
      console.error('Failed to load savings accounts:', error);
      setSavingsAccounts([]);
    } finally {
      setLoadingSavingsAccounts(false);
    }
  }, [bankAccounts]);

  const loadBankAccounts = useCallback(async () => {
    setLoadingBankAccounts(true);
    // Bank accounts are passed as props, but we simulate loading to show skeleton
    // Different delay to show asynchronous loading
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoadingBankAccounts(false);
  }, []);

  // Load all reference data asynchronously when dialog opens
  useEffect(() => {
    if (open) {
      // Load all data sources in parallel but track each separately
      loadBankAccounts();
      loadBills();
      loadLoans();
      loadSavingsAccounts();
    }
  }, [open, loadBankAccounts, loadBills, loadLoans, loadSavingsAccounts]);

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
        toBankAccountId: '',
      }));
      setShowBillSelector(false);
      setShowSavingsSelector(false);
      setShowLoanSelector(false);
      setShowTransferSelector(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
    
    // Show/hide reference selectors based on category
    setShowBillSelector(isBillCategory(category));
    setShowSavingsSelector(isSavingsCategory(category));
    setShowLoanSelector(isLoanCategory(category));
    setShowTransferSelector(isTransferCategory(category));
    
    // Clear other references when category changes
    if (!isBillCategory(category)) setFormData(prev => ({ ...prev, billId: '' }));
    if (!isSavingsCategory(category)) setFormData(prev => ({ ...prev, savingsAccountId: '' }));
    if (!isLoanCategory(category)) setFormData(prev => ({ ...prev, loanId: '' }));
    if (!isTransferCategory(category)) setFormData(prev => ({ ...prev, toBankAccountId: '' }));
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
      toBankAccountId: formData.toBankAccountId,
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

      // For bank transfers, use TRANSFER category and include toBankAccountId
      const isTransfer = isTransferCategory(formData.category);
      const finalCategory = isTransfer ? 'TRANSFER' : (formData.transactionType === 'CREDIT' ? 'CREDIT' : formData.category);
      
      await apiService.createBankTransaction({
        bankAccountId: formData.bankAccountId,
        amount: parseFloat(formData.amount),
        transactionType: formData.transactionType,
        description: isTransfer ? (formData.description.trim() || 'Transfer to Bank Account') : enhancedDescription,
        category: finalCategory,
        merchant: isTransfer ? undefined : (formData.merchant.trim() || undefined),
        location: isTransfer ? undefined : (formData.location.trim() || undefined),
        transactionDate: isTransfer ? new Date().toISOString() : new Date(formData.transactionDate).toISOString(),
        notes: isTransfer ? undefined : (formData.notes.trim() || undefined),
        isRecurring: isTransfer ? false : formData.isRecurring,
        recurringFrequency: isTransfer ? undefined : (formData.isRecurring ? formData.recurringFrequency : undefined),
        referenceNumber: isTransfer ? undefined : (formData.referenceNumber.trim() || undefined),
        currency: formData.currency,
        // NEW: Reference Fields for Smart Linking
        billId: formData.billId || undefined,
        savingsAccountId: formData.savingsAccountId || undefined,
        loanId: formData.loanId || undefined,
        toBankAccountId: formData.toBankAccountId || undefined,
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
              {loadingBankAccounts ? (
                <Box>
                  <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
                  <Skeleton variant="rectangular" width="100%" height={56} />
                </Box>
              ) : (
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
              )}
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

            {/* Reference Number Field - Hide if Bank transfer is selected */}
            {!showTransferSelector && (
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Reference Number"
                  value={formData.referenceNumber}
                  onChange={handleInputChange('referenceNumber')}
                  placeholder="Optional reference number"
                />
              </Grid>
            )}

            {/* Dynamic Reference Selectors */}
            {showBillSelector && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="subtitle2" color="primary">
                    Bill Payment
                  </Typography>
                </Divider>
                {loadingBills ? (
                  <Box>
                    <Skeleton variant="text" width="25%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" width="100%" height={56} />
                  </Box>
                ) : (
                  <FormControl fullWidth required>
                    <InputLabel>Select Bill</InputLabel>
                    <Select
                      value={formData.billId}
                      onChange={handleSelectChange('billId')}
                      label="Select Bill"
                    >
                      {bills.length > 0 ? (
                        bills.map((bill) => (
                          <MenuItem key={bill.id} value={bill.id}>
                            {bill.billName} - ${bill.amount.toFixed(2)} ({bill.status})
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No bills available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                )}
              </Grid>
            )}

            {showSavingsSelector && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="subtitle2" color="primary">
                    Savings Deposit
                  </Typography>
                </Divider>
                {loadingSavingsAccounts ? (
                  <Box>
                    <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" width="100%" height={56} />
                  </Box>
                ) : (
                  <FormControl fullWidth required>
                    <InputLabel>Select Savings Account</InputLabel>
                    <Select
                      value={formData.savingsAccountId}
                      onChange={handleSelectChange('savingsAccountId')}
                      label="Select Savings Account"
                    >
                      {savingsAccounts.length > 0 ? (
                        savingsAccounts.map((account) => (
                          <MenuItem key={account.id} value={account.id}>
                            {account.name} - ${account.balance.toFixed(2)}
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No savings accounts available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                )}
              </Grid>
            )}

            {showLoanSelector && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="subtitle2" color="primary">
                    Loan Payment
                  </Typography>
                </Divider>
                {loadingLoans ? (
                  <Box>
                    <Skeleton variant="text" width="25%" height={24} sx={{ mb: 1 }} />
                    <Skeleton variant="rectangular" width="100%" height={56} />
                  </Box>
                ) : (
                  <FormControl fullWidth required>
                    <InputLabel>Select Loan</InputLabel>
                    <Select
                      value={formData.loanId}
                      onChange={handleSelectChange('loanId')}
                      label="Select Loan"
                    >
                      {loans.length > 0 ? (
                        loans.map((loan) => (
                          <MenuItem key={loan.id} value={loan.id}>
                            {loan.purpose} - ${loan.principal.toFixed(2)} ({loan.status})
                          </MenuItem>
                        ))
                      ) : (
                        <MenuItem disabled>No loans available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                )}
              </Grid>
            )}

            {showTransferSelector && (
              <Grid item xs={12}>
                <Divider sx={{ my: 1 }}>
                  <Typography variant="subtitle2" color="primary">
                    Bank Transfer
                  </Typography>
                </Divider>
                <FormControl fullWidth required>
                  <InputLabel>To Bank Account</InputLabel>
                  <Select
                    value={formData.toBankAccountId}
                    onChange={handleSelectChange('toBankAccountId')}
                    label="To Bank Account"
                  >
                    {bankAccounts
                      .filter(account => account.id !== formData.bankAccountId)
                      .map((account) => (
                        <MenuItem key={account.id} value={account.id}>
                          {account.accountName} - {formatCurrency(account.currentBalance)}
                        </MenuItem>
                      ))}
                    {bankAccounts.length === 1 && (
                      <MenuItem disabled>No other bank accounts available</MenuItem>
                    )}
                  </Select>
                </FormControl>
              </Grid>
            )}

            {/* Hide these fields if Bank transfer is selected */}
            {!showTransferSelector && (
              <>
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
              </>
            )}
          </Grid>
        </Box>
      </DialogContent>
      <DialogActions>
        {isLoading ? (
          <>
            <Skeleton variant="rectangular" width={80} height={36} sx={{ borderRadius: 1 }} />
            <Skeleton variant="rectangular" width={140} height={36} sx={{ borderRadius: 1 }} />
          </>
        ) : (
          <>
            <Button onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
            >
              Create Transaction
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default TransactionForm;
