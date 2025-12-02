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
  Tooltip,
  IconButton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  LinearProgress,
  CircularProgress,
} from '@mui/material';
import {
  Info as InfoIcon,
  HelpOutline as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { BankAccount } from '../../types/bankAccount';
import { getErrorMessage } from '../../utils/validation';
import { 
  categorySuggestions, 
  getCategoryType,
  validateTransactionWithDoubleEntry,
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
  onSuccess: (accountId?: string, category?: string) => void;
  bankAccounts: BankAccount[];
  transaction?: BankAccountTransaction | null; // Optional transaction for edit mode
  defaultAccountId?: string;
  defaultCategory?: string;
}

interface BankAccountTransaction {
  id: string;
  bankAccountId: string;
  amount: number;
  transactionType: string;
  description: string;
  category?: string;
  merchant?: string;
  location?: string;
  transactionDate: string;
  notes?: string;
  isRecurring?: boolean;
  recurringFrequency?: string;
  referenceNumber?: string;
  externalTransactionId?: string;
  billId?: string;
  savingsAccountId?: string;
  loanId?: string;
  transactionPurpose?: string;
}

interface Bill {
  id: string;
  billName: string;
  amount: number;
  status: string;
  billType?: string;
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
  isActive?: boolean;
  accountName?: string;
  currentBalance?: number;
}

// Get all category suggestions for autocomplete (fallback)
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
  transaction: initialTransaction = null,
  defaultAccountId = '',
  defaultCategory = '',
}) => {
  const isEditMode = !!initialTransaction;
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
    transactionPurpose: '', // BILL, UTILITY, SAVINGS, LOAN, OTHER
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  
  // State for reference data
  const [bills, setBills] = useState<Bill[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [categories, setCategories] = useState<Array<{ id: string; name: string; type: string; icon?: string; color?: string }>>([]);
  const [finalCategories, setFinalCategories] = useState<Array<{ id: string; name: string; type: string; icon?: string; color?: string }>>([]);
  
  // Separate loading states for each data source
  const [loadingBankAccounts, setLoadingBankAccounts] = useState(false);
  const [loadingBills, setLoadingBills] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [loadingSavingsAccounts, setLoadingSavingsAccounts] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  
  // State for dynamic form fields
  const [showBillSelector, setShowBillSelector] = useState(false);
  const [showSavingsSelector, setShowSavingsSelector] = useState(false);
  const [showLoanSelector, setShowLoanSelector] = useState(false);
  const [showTransferSelector, setShowTransferSelector] = useState(false);
  const [showHelpSection, setShowHelpSection] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialTransaction && isEditMode) {
        // Populate form with transaction data for edit mode
        const transactionDate = new Date(initialTransaction.transactionDate);
        const formattedDate = transactionDate.toISOString().slice(0, 16);
        
        setFormData({
          bankAccountId: initialTransaction.bankAccountId,
          amount: Math.abs(initialTransaction.amount).toString(),
          transactionType: (initialTransaction.transactionType.toUpperCase() === 'CREDIT' ? 'CREDIT' : 'DEBIT') as 'DEBIT' | 'CREDIT',
          description: initialTransaction.description || '',
          category: initialTransaction.category || '',
          merchant: initialTransaction.merchant || '',
          location: initialTransaction.location || '',
          transactionDate: formattedDate,
          notes: initialTransaction.notes || '',
          isRecurring: initialTransaction.isRecurring || false,
          recurringFrequency: initialTransaction.recurringFrequency || '',
          referenceNumber: initialTransaction.referenceNumber || '',
          currency: (initialTransaction as any).currency || 'USD',
          billId: initialTransaction.billId || '',
          savingsAccountId: initialTransaction.savingsAccountId || '',
          loanId: initialTransaction.loanId || '',
          toBankAccountId: '',
          transactionPurpose: (initialTransaction as any).transactionPurpose || '',
        });
        
        // Show selectors based on transactionPurpose or linked entities
        const transactionPurpose = (initialTransaction as any).transactionPurpose || '';
        if (transactionPurpose) {
          setShowBillSelector(transactionPurpose === 'BILL' || transactionPurpose === 'UTILITY');
          setShowSavingsSelector(transactionPurpose === 'SAVINGS');
          setShowLoanSelector(transactionPurpose === 'LOAN');
        } else {
          // Fallback to showing selectors if linked to bill/savings/loan
          setShowBillSelector(!!initialTransaction.billId);
          setShowSavingsSelector(!!initialTransaction.savingsAccountId);
          setShowLoanSelector(!!initialTransaction.loanId);
        }
        setShowTransferSelector(false); // Don't show transfer selector in edit mode
      } else {
        // Reset form when dialog opens for new transaction - use smart defaults
        const accountId = defaultAccountId || (bankAccounts.length > 0 ? bankAccounts[0].id : '');
        setFormData({
          bankAccountId: accountId,
          amount: '',
          transactionType: 'DEBIT',
          description: '',
          category: defaultCategory || 'Expenses', // Use smart default or fallback
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
          transactionPurpose: '',
        });
        // Reset dynamic selectors
        setShowBillSelector(false);
        setShowSavingsSelector(false);
        setShowLoanSelector(false);
        setShowTransferSelector(false);
      }
      setError('');
    }
  }, [open, bankAccounts, initialTransaction, isEditMode]);

  // Load each data source asynchronously with individual loading states
  // Added minimum delays to make skeleton screens visible
  const loadBills = useCallback(async () => {
    setLoadingBills(true);
    try {
      const startTime = Date.now();
      // Load all bills, not just PENDING ones
      const billsResponse = await apiService.getUserBills();
      const elapsed = Date.now() - startTime;
      const minDelay = 800; // Minimum 800ms to see skeleton
      
      if (elapsed < minDelay) {
        await new Promise(resolve => setTimeout(resolve, minDelay - elapsed));
      }
      
      // Filter to show active bills (PENDING, OVERDUE) for the dropdown
      const activeBills = (billsResponse.data || []).filter(
        (bill: Bill) => bill.status === BillStatus.PENDING || bill.status === BillStatus.OVERDUE
      );
      setBills(activeBills);
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
      
      // Filter to show only active/approved loans
      const activeLoans = (Array.isArray(loansResponse) ? loansResponse : [])
        .filter((loan: Loan) => loan.status === 'ACTIVE' || loan.status === 'APPROVED');
      setLoans(activeLoans);
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
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Try to load from savings API first
      try {
        const savingsResponse = await apiService.getSavingsAccounts({ isActive: true });
        const savingsData = Array.isArray(savingsResponse) 
          ? savingsResponse 
          : (savingsResponse?.data || []);
        
        const activeSavings = savingsData.filter(
          (account: SavingsAccount) => account.isActive !== false
        );
        
        if (activeSavings.length > 0) {
          setSavingsAccounts(activeSavings.map((acc: SavingsAccount) => ({
            id: acc.id,
            name: acc.accountName || acc.name,
            balance: acc.currentBalance || 0,
            isActive: acc.isActive
          })));
          return;
        }
      } catch (error) {
        console.log('Savings API not available, using bank accounts as fallback');
      }
      
      // Fallback to bank accounts
      const accounts = bankAccounts.map(acc => ({
        id: acc.id,
        name: acc.accountName,
        balance: acc.currentBalance,
        isActive: true
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

  const loadCategories = useCallback(async () => {
    setLoadingCategories(true);
    try {
      // Get ALL categories (active and inactive)
      const categoriesData = await apiService.getAllCategories();
      
      let finalCategories: Array<{ id: string; name: string; type: string; icon?: string; color?: string }> = [];
      
      // If no categories exist, provide default "Expense" category
      if (categoriesData.length === 0) {
        finalCategories = [{
          id: 'default-expense',
          name: 'Expense',
          type: 'EXPENSE',
          icon: undefined,
          color: undefined
        }];
      } else {
        // Ensure "Expense" category is available as default if it doesn't exist
        const expenseCategory = categoriesData.find((cat: any) => 
          cat.name === 'Expense' || cat.name === 'Expenses'
        );
        if (!expenseCategory) {
          // Add "Expense" as a default category if it doesn't exist
          finalCategories = [{
            id: 'default-expense',
            name: 'Expense',
            type: 'EXPENSE',
            icon: undefined,
            color: undefined
          }, ...categoriesData];
        } else {
          finalCategories = categoriesData;
        }
      }
      
      setCategories(finalCategories);
      setFinalCategories(finalCategories);
      
      // Set default "Expense" category if no category is selected and transaction type is DEBIT
      setFormData(prev => {
        if (!prev.category && prev.transactionType === 'DEBIT') {
          const expenseCat = finalCategories.find(cat => 
            cat.name === 'Expense' || cat.name === 'Expenses'
          );
          if (expenseCat) {
            return { ...prev, category: expenseCat.name };
          }
        }
        return prev;
      });
    } catch (error) {
      console.error('Failed to load categories:', error);
      // Even on error, provide "Expense" as a fallback
      const fallbackCategories = [{
        id: 'default-expense',
        name: 'Expense',
        type: 'EXPENSE',
        icon: undefined,
        color: undefined
      }];
      setCategories(fallbackCategories);
      
      // Set default "Expense" category if no category is selected
      setFormData(prev => {
        if (!prev.category && prev.transactionType === 'DEBIT') {
          return { ...prev, category: 'Expense' };
        }
        return prev;
      });
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Load all reference data asynchronously when dialog opens
  useEffect(() => {
    if (open) {
      // Load all data sources in parallel but track each separately
      loadBankAccounts();
      loadBills();
      loadLoans();
      loadSavingsAccounts();
      loadCategories();
    }
  }, [open, loadBankAccounts, loadBills, loadLoans, loadSavingsAccounts, loadCategories]);

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

    // Handle Transaction Purpose change
    if (field === 'transactionPurpose') {
      const purpose = value;
      
      // Clear category and linked IDs when purpose changes
      setFormData(prev => ({
        ...prev,
        category: '',
        billId: '',
        savingsAccountId: '',
        loanId: '',
      }));
      
      // Don't show separate selectors anymore - they're in Category dropdown
      setShowBillSelector(false);
      setShowSavingsSelector(false);
      setShowLoanSelector(false);
      setShowTransferSelector(false);
    }

    // If transaction type changes to CREDIT, clear category and hide selectors
    if (field === 'transactionType' && value === 'CREDIT') {
      setFormData(prev => ({
        ...prev,
        category: '',
        billId: '',
        savingsAccountId: '',
        loanId: '',
        toBankAccountId: '',
        transactionPurpose: '',
      }));
      setShowBillSelector(false);
      setShowSavingsSelector(false);
      setShowLoanSelector(false);
      setShowTransferSelector(false);
    }
    // If transaction type changes to DEBIT and category is empty, set default to "Expense"
    if (field === 'transactionType' && value === 'DEBIT') {
      setFormData(prev => ({
        ...prev,
        category: prev.category || 'Expense',
      }));
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

    // Enhanced validation using category logic with double-entry accounting validation
    const validationErrors = validateTransactionWithDoubleEntry({
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
      setError(validationErrors.join('. '));
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
      
      const transactionData = {
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
        transactionPurpose: formData.transactionPurpose || undefined,
      };

      if (isEditMode && initialTransaction) {
        // Update existing transaction
        await apiService.updateBankTransaction(initialTransaction.id, transactionData);
      } else {
        // Create new transaction
        await apiService.createBankTransaction(transactionData);
      }

      onSuccess(formData.bankAccountId, formData.category);
      onClose();
      } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, isEditMode ? 'Failed to update transaction' : 'Failed to create transaction');
      
      // Make error messages more actionable
      let actionableError = errorMsg;
      if (errorMsg.includes('balance') || errorMsg.includes('insufficient')) {
        actionableError = `Insufficient Balance: Your account doesn't have enough funds for this transaction. Please select a different account or reduce the amount.`;
      } else if (errorMsg.includes('account') && errorMsg.includes('not found')) {
        actionableError = `Account Error: The selected account may have been deleted or is inactive. Please select a different account.`;
      } else if (errorMsg.includes('validation') || errorMsg.includes('required')) {
        actionableError = `Validation Error: Please check that all required fields are filled correctly. Amount must be greater than 0.`;
      } else if (errorMsg.includes('category')) {
        actionableError = `Category Error: Please select a valid category from the list or enter a new one.`;
      } else if (!isEditMode && errorMsg.includes('Failed to create')) {
        actionableError = `Unable to create transaction: ${errorMsg}. Please verify your account balance and try again.`;
      }
      
      setError(actionableError);
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
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{isEditMode ? 'Edit Transaction' : 'Add New Transaction'}</Typography>
          <Tooltip title="Get help with adding transactions">
            <IconButton size="small" onClick={() => setShowHelpSection(!showHelpSection)}>
              <HelpIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 2 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setError('')}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            <Typography variant="body2" fontWeight="medium" gutterBottom>
              {error}
            </Typography>
            {error.includes('Category') && (
              <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                <strong>Solution:</strong> Go to Categories page to create the category first, or select an existing category from the dropdown.
              </Typography>
            )}
            {error.includes('balance') && (
              <Typography variant="caption" component="div" sx={{ mt: 1 }}>
                <strong>Solution:</strong> Check your account balance. For transfers, ensure the source account has sufficient funds.
              </Typography>
            )}
          </Alert>
        )}
        
        {isLoading && (
          <Box sx={{ mb: 2 }}>
            <LinearProgress />
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              Processing transaction...
            </Typography>
          </Box>
        )}
        
        {/* Help Section */}
        {showHelpSection && (
          <Accordion sx={{ mb: 2 }} defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <HelpIcon color="primary" />
                <Typography variant="subtitle2">Transaction Help Guide</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <Typography variant="body2" component="div">
                <strong>Transaction Types:</strong>
                <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                  <li><strong>DEBIT:</strong> Money going out (expenses, payments, transfers out)</li>
                  <li><strong>CREDIT:</strong> Money coming in (income, deposits, transfers in)</li>
                </ul>
                <strong>Category Selection:</strong>
                <ul style={{ margin: '8px 0', paddingLeft: 20 }}>
                  <li>Select a category that matches your transaction type</li>
                  <li>Some categories (bills, savings, loans) will show additional options</li>
                  <li>Create new categories in the Categories page if needed</li>
                </ul>
                <Divider sx={{ my: 2 }} />
                <strong>Double-Entry Accounting:</strong>
                <Typography variant="caption" component="div" sx={{ display: 'block', mt: 1, mb: 1 }}>
                  Every transaction automatically creates balanced entries:
                </Typography>
                <Box sx={{ fontFamily: 'monospace', bgcolor: 'background.default', p: 1.5, borderRadius: 1, mb: 1 }}>
                  <Typography variant="caption" component="div">
                    <strong>Example: Paying a $150 utility bill</strong>
                  </Typography>
                  <Typography variant="caption" component="div" sx={{ mt: 0.5, display: 'block' }}>
                    Debit: Utility Expense → $150 (expense increases)
                  </Typography>
                  <Typography variant="caption" component="div">
                    Credit: Bank Account → $150 (asset decreases)
                  </Typography>
                  <Typography variant="caption" component="div" sx={{ mt: 0.5, color: 'success.main', fontWeight: 'bold' }}>
                    ✓ Total Debits = Total Credits
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
                  The system validates this automatically - you don't need to worry about it!
                </Typography>
                <Divider sx={{ my: 2 }} />
                <strong>Common Examples:</strong>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                  <Chip label="DEBIT: Grocery shopping → Category: GROCERIES" size="small" variant="outlined" />
                  <Chip label="DEBIT: Paying electric bill → Category: UTILITIES (select bill)" size="small" variant="outlined" />
                  <Chip label="CREDIT: Salary deposit → Category: Automatically set to CREDIT" size="small" variant="outlined" />
                </Box>
              </Typography>
            </AccordionDetails>
          </Accordion>
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

            {formData.transactionType === 'DEBIT' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Transaction Purpose</InputLabel>
                  <Select
                    value={formData.transactionPurpose}
                    onChange={handleSelectChange('transactionPurpose')}
                    label="Transaction Purpose"
                  >
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="BILL">Bill Payment</MenuItem>
                    <MenuItem value="UTILITY">Utility Payment</MenuItem>
                    <MenuItem value="SAVINGS">Savings Deposit</MenuItem>
                    <MenuItem value="LOAN">Loan Payment</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            )}

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
                {loadingCategories && !formData.transactionPurpose ? (
                  <Skeleton variant="rectangular" height={56} />
                ) : (
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                      <InputLabel required>
                        {formData.transactionPurpose === 'BILL' || formData.transactionPurpose === 'UTILITY' 
                          ? 'Select Bill' 
                          : formData.transactionPurpose === 'LOAN' 
                          ? 'Select Loan' 
                          : formData.transactionPurpose === 'SAVINGS' 
                          ? 'Select Savings Account' 
                          : 'Category'}
                      </InputLabel>
                      <Tooltip title={
                        formData.transactionPurpose === 'BILL' || formData.transactionPurpose === 'UTILITY'
                          ? "Select a bill to link this transaction to"
                          : formData.transactionPurpose === 'LOAN'
                          ? "Select a loan to link this transaction to"
                          : formData.transactionPurpose === 'SAVINGS'
                          ? "Select a savings account to link this transaction to"
                          : "Select a category to organize your transaction"
                      }>
                        <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      </Tooltip>
                    </Box>
                    {formData.transactionPurpose === 'BILL' || formData.transactionPurpose === 'UTILITY' || 
                     formData.transactionPurpose === 'LOAN' || formData.transactionPurpose === 'SAVINGS' ? (
                      <FormControl fullWidth required>
                        <InputLabel>
                          {formData.transactionPurpose === 'BILL' || formData.transactionPurpose === 'UTILITY' 
                            ? 'Select Bill' 
                            : formData.transactionPurpose === 'LOAN' 
                            ? 'Select Loan' 
                            : 'Select Savings Account'}
                        </InputLabel>
                        <Select
                          value={
                            formData.transactionPurpose === 'BILL' || formData.transactionPurpose === 'UTILITY'
                              ? formData.billId
                              : formData.transactionPurpose === 'LOAN'
                              ? formData.loanId
                              : formData.savingsAccountId
                          }
                          label={
                            formData.transactionPurpose === 'BILL' || formData.transactionPurpose === 'UTILITY' 
                              ? 'Select Bill' 
                              : formData.transactionPurpose === 'LOAN' 
                              ? 'Select Loan' 
                              : 'Select Savings Account'
                          }
                          onChange={(e) => {
                            const value = e.target.value;
                            if (formData.transactionPurpose === 'BILL' || formData.transactionPurpose === 'UTILITY') {
                              const selectedBill = bills.find(b => b.id === value);
                              setFormData(prev => ({
                                ...prev,
                                billId: value,
                                category: selectedBill ? `Bill: ${selectedBill.billName}` : prev.category,
                              }));
                            } else if (formData.transactionPurpose === 'LOAN') {
                              const selectedLoan = loans.find(l => l.id === value);
                              setFormData(prev => ({
                                ...prev,
                                loanId: value,
                                category: selectedLoan ? `Loan: ${selectedLoan.purpose}` : prev.category,
                              }));
                            } else if (formData.transactionPurpose === 'SAVINGS') {
                              const selectedSavings = savingsAccounts.find(s => s.id === value);
                              setFormData(prev => ({
                                ...prev,
                                savingsAccountId: value,
                                category: selectedSavings ? `Savings: ${selectedSavings.name}` : prev.category,
                              }));
                            }
                          }}
                        >
                        {/* Show bills when Bill Payment or Utility Payment is selected (only for DEBIT) */}
                        {formData.transactionType === 'DEBIT' && (formData.transactionPurpose === 'BILL' || formData.transactionPurpose === 'UTILITY') ? (
                          loadingBills ? (
                            <MenuItem disabled>Loading bills...</MenuItem>
                          ) : bills.length > 0 ? (
                            bills
                              .filter(bill => {
                                // For UTILITY, only show utility bills
                                if (formData.transactionPurpose === 'UTILITY') {
                                  return bill.billType?.toUpperCase() === 'UTILITY' || 
                                         bill.billType?.toUpperCase() === 'UTILITIES';
                                }
                                // For BILL, show all bills
                                return true;
                              })
                              .map((bill) => (
                                <MenuItem key={bill.id} value={bill.id}>
                                  {bill.billName} - {formatCurrency(bill.amount)} ({bill.status})
                                </MenuItem>
                              ))
                          ) : (
                            <MenuItem disabled>No active bills available</MenuItem>
                          )
                        ) : formData.transactionType === 'DEBIT' && formData.transactionPurpose === 'LOAN' ? (
                          // Show loans when Loan Payment is selected (only for DEBIT)
                          loadingLoans ? (
                            <MenuItem disabled>Loading loans...</MenuItem>
                          ) : loans.length > 0 ? (
                            loans.map((loan) => (
                              <MenuItem key={loan.id} value={loan.id}>
                                {loan.purpose} - {formatCurrency(loan.principal)} ({loan.status})
                              </MenuItem>
                            ))
                          ) : (
                            <MenuItem disabled>No active loans available</MenuItem>
                          )
                        ) : formData.transactionType === 'DEBIT' && formData.transactionPurpose === 'SAVINGS' ? (
                          // Show savings accounts when Savings Deposit is selected (only for DEBIT)
                          loadingSavingsAccounts ? (
                            <MenuItem disabled>Loading savings accounts...</MenuItem>
                          ) : savingsAccounts.length > 0 ? (
                            savingsAccounts
                              .filter(account => account.isActive !== false)
                              .map((account) => (
                                <MenuItem key={account.id} value={account.id}>
                                  {account.name} - {formatCurrency(account.balance || 0)}
                                </MenuItem>
                              ))
                          ) : (
                            <MenuItem disabled>No savings accounts available</MenuItem>
                          )
                        ) : null}
                      </Select>
                    </FormControl>
                    ) : (
                      // Use Autocomplete for category when no specific purpose is selected
                      <Autocomplete
                        size="small"
                        options={finalCategories
                          .filter((cat) => {
                            if (formData.transactionType === 'DEBIT') {
                              return cat.type !== 'INCOME';
                            }
                            return true;
                          })
                          .sort((a, b) => a.name.localeCompare(b.name))
                          .map(cat => cat.name)}
                        value={formData.category}
                        onChange={(event, newValue) => {
                          handleCategoryChange(newValue || '');
                        }}
                        freeSolo
                        loading={loadingCategories}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Category"
                            required
                            placeholder="Search or type category..."
                            InputProps={{
                              ...params.InputProps,
                              endAdornment: (
                                <>
                                  {loadingCategories ? <CircularProgress color="inherit" size={20} /> : null}
                                  {params.InputProps.endAdornment}
                                </>
                              ),
                            }}
                          />
                        )}
                        renderOption={(props, option) => {
                          const category = finalCategories.find(cat => cat.name === option);
                          return (
                            <Box component="li" {...props}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                {category?.color && (
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: '50%',
                                      backgroundColor: category.color,
                                      border: '1px solid #ddd'
                                    }}
                                  />
                                )}
                                <Typography variant="body2">{option}</Typography>
                                {category?.type && (
                                  <Chip 
                                    label={category.type} 
                                    size="small" 
                                    sx={{ ml: 'auto', height: 18, fontSize: '0.75rem' }}
                                  />
                                )}
                              </Box>
                            </Box>
                          );
                        }}
                      />
                    )}
                  </Box>
                )}
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

            {/* Dynamic Reference Selectors - Only show when NOT using Transaction Purpose */}
            {showBillSelector && !formData.transactionPurpose && (
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

            {showSavingsSelector && !formData.transactionPurpose && (
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

            {showLoanSelector && !formData.transactionPurpose && (
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
