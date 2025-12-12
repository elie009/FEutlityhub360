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
  Alert,
  SelectChangeEvent,
  Autocomplete,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { BankAccount } from '../../types/bankAccount';
import { categorySuggestions } from '../../utils/categoryLogic';

interface QuickAddTransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (accountId?: string, category?: string) => void;
  bankAccounts: BankAccount[];
  defaultAccountId?: string;
  defaultCategory?: string;
}

// Fallback categories for new users who don't have transaction history yet
const FALLBACK_CATEGORIES = [
  'food', 'groceries', 'gas', 'transportation', 'entertainment',
  'shopping', 'restaurant', 'coffee', 'utilities', 'rent',
  'phone bill', 'internet', 'insurance', 'subscription', 'savings'
];

const QuickAddTransactionForm: React.FC<QuickAddTransactionFormProps> = ({
  open,
  onClose,
  onSuccess,
  bankAccounts,
  defaultAccountId = '',
  defaultCategory = '',
}) => {
  const [formData, setFormData] = useState({
    bankAccountId: defaultAccountId || (bankAccounts.length > 0 ? bankAccounts[0].id : ''),
    amount: '',
    transactionType: 'DEBIT' as 'DEBIT' | 'CREDIT',
    description: '',
    category: defaultCategory || '',
    transactionDate: new Date().toISOString().slice(0, 16),
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [userCategories, setUserCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Fetch user's transaction categories
  const fetchUserCategories = async () => {
    setCategoriesLoading(true);
    try {
      // Get recent transactions to extract categories
      const recentTransactions = await apiService.getRecentTransactions(100); // Get up to 100 recent transactions

      // Extract unique categories from transactions
      const categories = Array.from(new Set(recentTransactions
        .map(transaction => transaction.category)
        .filter(category => category && category.trim() !== '')
        .map(category => category.toLowerCase().trim())
      ));

      // Sort categories alphabetically
      categories.sort();

      // If no categories found, use fallback categories
      if (categories.length === 0) {
        setUserCategories(FALLBACK_CATEGORIES);
      } else {
        setUserCategories(categories);
      }
    } catch (error) {
      console.error('Failed to fetch user categories:', error);
      // Use fallback categories if API fails
      setUserCategories(FALLBACK_CATEGORIES);
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setFormData({
        bankAccountId: defaultAccountId || (bankAccounts.length > 0 ? bankAccounts[0].id : ''),
        amount: '',
        transactionType: 'DEBIT',
        description: '',
        category: defaultCategory || '',
        transactionDate: new Date().toISOString().slice(0, 16),
      });
      setError('');
      // Fetch user categories when modal opens
      fetchUserCategories();
    }
  }, [open, defaultAccountId, defaultCategory, bankAccounts]);

  const handleInputChange = (field: string) => (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent<string>
  ) => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    setError('');
  };

  const handleCategoryChange = (event: any, newValue: string | null) => {
    setFormData(prev => ({
      ...prev,
      category: newValue || '',
    }));
    setError('');
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.bankAccountId) {
      setError('Please select a bank account.');
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setError('Please enter a valid amount greater than 0.');
      return;
    }
    if (!formData.description.trim()) {
      setError('Please enter a description for this transaction.');
      return;
    }
    if (!formData.category) {
      setError('Please select a category for this transaction.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const transactionData = {
        bankAccountId: formData.bankAccountId,
        amount: parseFloat(formData.amount),
        transactionType: formData.transactionType,
        description: formData.description.trim(),
        category: formData.category,
        transactionDate: new Date(formData.transactionDate).toISOString(),
        currency: 'USD',
      };

      await apiService.createBankTransaction(transactionData);
      onSuccess(formData.bankAccountId, formData.category);
      onClose();
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Failed to create transaction';
      
      // Make error messages more actionable
      if (errorMessage.includes('balance') || errorMessage.includes('insufficient')) {
        setError(`Insufficient Balance: Your account doesn't have enough funds. Please select a different account or reduce the amount.`);
      } else if (errorMessage.includes('account')) {
        setError(`Account Error: Please verify the selected account is active and try again.`);
      } else if (errorMessage.includes('validation') || errorMessage.includes('required')) {
        setError(`Validation Error: Please check all required fields are filled correctly.`);
      } else {
        setError(`Unable to create transaction: ${errorMessage}. Please try again or use the Full Form for advanced options.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
        }
      }}
    >
      <DialogTitle sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        pb: 1
      }}>
        <Box sx={{ fontSize: '1.25rem', fontWeight: 600 }}>Quick Add Transaction</Box>
        <IconButton
          edge="end"
          color="inherit"
          onClick={onClose}
          aria-label="close"
          size="small"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Bank Account</InputLabel>
            <Select
              value={formData.bankAccountId}
              label="Bank Account"
              onChange={handleInputChange('bankAccountId')}
            >
              {bankAccounts.map((account) => (
                <MenuItem key={account.id} value={account.id}>
                  {account.accountName} {account.accountNumber ? `(${account.accountNumber})` : ''}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.transactionType}
                label="Type"
                onChange={handleInputChange('transactionType')}
              >
                <MenuItem value="DEBIT">Money Out (Expenses or Debit)</MenuItem>
                <MenuItem value="CREDIT">Money In (Income or Credit)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              fullWidth
              size="small"
              label="Amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange('amount')}
              inputProps={{ min: 0, step: 0.01 }}
              required
            />
          </Box>

          <TextField
            fullWidth
            size="small"
            label="Description"
            value={formData.description}
            onChange={handleInputChange('description')}
            required
            placeholder="e.g., Grocery shopping, Salary deposit"
          />

          <Autocomplete
            size="small"
            options={userCategories}
            value={formData.category}
            onChange={handleCategoryChange}
            freeSolo
            loading={categoriesLoading}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Category"
                required
                placeholder={categoriesLoading ? "Loading categories..." : "Search or type category..."}
              />
            )}
            renderOption={(props, option) => (
              <Box component="li" {...props}>
                {option}
              </Box>
            )}
          />

          <TextField
            fullWidth
            size="small"
            label="Date"
            type="datetime-local"
            value={formData.transactionDate}
            onChange={handleInputChange('transactionDate')}
            InputLabelProps={{ shrink: true }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          sx={{ minWidth: 100 }}
        >
          {isLoading ? 'Saving...' : 'Save Transaction'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default QuickAddTransactionForm;

