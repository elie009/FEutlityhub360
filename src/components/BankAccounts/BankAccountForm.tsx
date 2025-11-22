import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem, Grid,
  FormControlLabel, Switch, Typography, Box,
  SelectChangeEvent,
} from '@mui/material';
import { BankAccount, CreateBankAccountRequest, UpdateBankAccountRequest } from '../../types/bankAccount';
import { apiService } from '../../services/api';
import { getErrorMessage } from '../../utils/validation';

interface BankAccountFormProps {
  open: boolean;
  onClose: () => void;
  account?: BankAccount; // Optional, for editing existing accounts
  onSuccess: (account: BankAccount) => void;
}

const BankAccountForm: React.FC<BankAccountFormProps> = ({ open, onClose, account, onSuccess }) => {
  const initialFormData: CreateBankAccountRequest & { isActive?: boolean; isConnected?: boolean } = {
    accountName: '',
    accountType: 'checking',
    initialBalance: 0,
    currency: 'USD',
    description: '',
    financialInstitution: '',
    accountNumber: '',
    routingNumber: '',
    syncFrequency: 'DAILY',
    iban: '',
    swiftCode: '',
    isActive: true,
    isConnected: false,
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Extract last 4 digits if account number is padded with zeros (0000000000001234 -> 1234)
  const extractAccountNumberForDisplay = (accountNumber: string): string => {
    if (!accountNumber) return '';
    // Remove spaces
    const cleaned = accountNumber.replace(/\s/g, '');
    // If it's 16 digits and starts with 12 zeros, extract last 4 digits
    if (cleaned.length === 16 && cleaned.startsWith('000000000000')) {
      return cleaned.slice(-4);
    }
    return cleaned;
  };

  // Extract last 4 characters if IBAN is padded with zeros (0000000000001234 -> 1234)
  const extractIbanForDisplay = (iban: string): string => {
    if (!iban) return '';
    // Remove all dashes and spaces
    const cleaned = iban.replace(/[\s-]/g, '');
    // If it's 16 characters and starts with 12 zeros, extract last 4 characters
    if (cleaned.length === 16 && cleaned.startsWith('000000000000')) {
      return cleaned.slice(-4);
    }
    return cleaned;
  };

  useEffect(() => {
    if (account) {
      setFormData({
        accountName: account.accountName,
        accountType: account.accountType,
        initialBalance: account.initialBalance,
        currency: account.currency,
        description: account.description || '',
        financialInstitution: account.financialInstitution || '',
        accountNumber: extractAccountNumberForDisplay(account.accountNumber || ''),
        routingNumber: account.routingNumber || '',
        syncFrequency: account.syncFrequency,
        iban: extractIbanForDisplay(account.iban || ''),
        swiftCode: account.swiftCode || '',
        isActive: account.isActive,
        isConnected: account.isConnected,
      });
    } else {
      setFormData(initialFormData);
    }
    setError('');
  }, [account, open]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | { name?: string; value: unknown }>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: parseFloat(value) || 0,
    }));
  };

  const handleSwitchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: checked,
    }));
  };

  // Format IBAN with dashes every 4 characters
  const formatIban = (value: string | undefined): string => {
    if (!value) return '';
    // Remove all spaces and dashes first
    const cleaned = value.replace(/[\s-]/g, '');
    // Add dash every 4 characters
    return cleaned.replace(/(.{4})/g, '$1-').replace(/-$/, '');
  };

  const handleIbanChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    // Remove dashes, spaces and non-alphanumeric characters (keep only letters and numbers)
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '');
    // Store unformatted value (formatting is applied in the display value)
    setFormData(prev => ({
      ...prev,
      iban: cleaned,
    }));
  };

  // Format IBAN for backend: if only 4 characters, pad with zeros to make 16 characters
  const formatIbanForBackend = (iban: string | undefined): string => {
    if (!iban) return '';
    // Remove all dashes and spaces
    const cleaned = iban.replace(/[\s-]/g, '');
    // If only 4 characters, pad with zeros to make 16 characters
    if (cleaned.length === 4) {
      return `000000000000${cleaned}`;
    }
    // Otherwise return as is (without dashes/spaces)
    return cleaned;
  };

  // Format account number with spaces every 4 digits
  const formatAccountNumber = (value: string | undefined): string => {
    if (!value) return '';
    // Remove all spaces first
    const cleaned = value.replace(/\s/g, '');
    // Add space every 4 characters
    return cleaned.replace(/(.{4})/g, '$1 ').trim();
  };

  const handleAccountNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    // Remove spaces and keep only digits
    const cleaned = value.replace(/\D/g, '');
    // Store unformatted value (formatting is applied in the display value)
    setFormData(prev => ({
      ...prev,
      accountNumber: cleaned,
    }));
  };

  // Format account number for backend: if only 4 digits, pad with zeros to 16 digits
  const formatAccountNumberForBackend = (accountNumber: string | undefined): string => {
    if (!accountNumber) return '';
    // Remove all spaces
    const cleaned = accountNumber.replace(/\s/g, '');
    // If only 4 digits, pad with zeros to make 16 digits
    if (cleaned.length === 4) {
      return `000000000000${cleaned}`;
    }
    // Otherwise return as is (without spaces)
    return cleaned;
  };

  const validateForm = (): boolean => {
    if (!formData.accountName.trim()) {
      setError('Account name is required');
      return false;
    }
    if (formData.initialBalance < 0) {
      setError('Initial balance cannot be negative');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    try {
      let resultAccount: BankAccount;
      if (account) {
        // Update existing account
        const updateRequest: UpdateBankAccountRequest = {
          accountName: formData.accountName,
          accountType: formData.accountType,
          currentBalance: formData.initialBalance, // For updates, we use currentBalance
          currency: formData.currency,
          description: formData.description,
          financialInstitution: formData.financialInstitution,
          accountNumber: formatAccountNumberForBackend(formData.accountNumber),
          routingNumber: formData.routingNumber,
          syncFrequency: formData.syncFrequency,
          iban: formatIbanForBackend(formData.iban),
          swiftCode: formData.swiftCode,
          isActive: formData.isActive,
          isConnected: formData.isConnected,
        };
        resultAccount = await apiService.updateBankAccount(account.id, updateRequest);
      } else {
        // Create new account
        const createRequest: CreateBankAccountRequest = {
          accountName: formData.accountName,
          accountType: formData.accountType,
          initialBalance: formData.initialBalance,
          currency: formData.currency,
          description: formData.description,
          financialInstitution: formData.financialInstitution,
          accountNumber: formatAccountNumberForBackend(formData.accountNumber),
          routingNumber: formData.routingNumber,
          syncFrequency: formData.syncFrequency,
          iban: formatIbanForBackend(formData.iban),
          swiftCode: formData.swiftCode,
        };
        resultAccount = await apiService.createBankAccount(createRequest);
      }
      onSuccess(resultAccount);
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, account ? 'Failed to update bank account' : 'Failed to create bank account'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  const getAccountTypeLabel = (type: string): string => {
    switch (type) {
      case 'checking': return 'Checking';
      case 'savings': return 'Savings';
      case 'credit_card': return 'Credit Card';
      case 'investment': return 'Investment';
      case 'bank': return 'Bank';
      default: return type;
    }
  };

  const getSyncFrequencyLabel = (frequency: string): string => {
    switch (frequency) {
      case 'DAILY': return 'Daily';
      case 'WEEKLY': return 'Weekly';
      case 'MONTHLY': return 'Monthly';
      case 'MANUAL': return 'Manual';
      default: return frequency;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {account ? 'Edit Bank Account' : 'Add New Bank Account'}
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent dividers>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          
          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="accountName"
                label="Account Name"
                value={formData.accountName}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ maxLength: 255 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Account Type</InputLabel>
                <Select
                  name="accountType"
                  value={formData.accountType}
                  label="Account Type"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="checking">Checking</MenuItem>
                  <MenuItem value="savings">Savings</MenuItem>
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                  <MenuItem value="investment">Investment</MenuItem>
                  <MenuItem value="bank">Bank</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="initialBalance"
                label={account ? "Current Balance" : "Initial Balance"}
                type="number"
                value={formData.initialBalance}
                onChange={handleNumberChange}
                fullWidth
                required
                inputProps={{ step: "0.01", min: "0" }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                inputProps={{ maxLength: 500 }}
              />
            </Grid>

            {!account && (
              <>
                {/* Bank Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Bank Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="financialInstitution"
                    label="Financial Institution"
                    value={formData.financialInstitution}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ maxLength: 100 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="accountNumber"
                    label="Account Number"
                    value={formatAccountNumber(formData.accountNumber)}
                    onChange={handleAccountNumberChange}
                    fullWidth
                    inputProps={{ maxLength: 19 }} // 16 digits + 3 spaces
                    placeholder="1234 or full account number"
                    helperText="Enter last 4 digits or full account number"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    name="routingNumber"
                    label="Routing Number"
                    value={formData.routingNumber}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ maxLength: 20 }}
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Sync Frequency</InputLabel>
                    <Select
                      name="syncFrequency"
                      value={formData.syncFrequency}
                      label="Sync Frequency"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="DAILY">Daily</MenuItem>
                      <MenuItem value="WEEKLY">Weekly</MenuItem>
                      <MenuItem value="MONTHLY">Monthly</MenuItem>
                      <MenuItem value="MANUAL">Manual</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {/* International Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                International Information (Optional)
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="iban"
                label="Card Number"
                value={formatIban(formData.iban)}
                onChange={handleIbanChange}
                fullWidth
                inputProps={{ maxLength: 19 }} // 16 characters + 3 dashes
                placeholder="1234 or full Card Number"
                helperText="Enter last 4 characters or full Card Number. Note: If you want to enable or use Transaction Analyzer"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                name="swiftCode"
                label="SWIFT Code"
                value={formData.swiftCode}
                onChange={handleChange}
                fullWidth
                inputProps={{ maxLength: 11 }}
                placeholder="CHASUS33"
              />
            </Grid>

            {/* Status Controls (only for editing) */}
            {account && (
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Account Status
                </Typography>
              </Grid>
            )}
            
            {account && (
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isActive"
                      checked={formData.isActive}
                      onChange={handleSwitchChange}
                    />
                  }
                  label="Active Account"
                />
              </Grid>
            )}
            
            {account && (
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      name="isConnected"
                      checked={formData.isConnected}
                      onChange={handleSwitchChange}
                    />
                  }
                  label="Connected to Bank"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} color="secondary">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {isLoading ? 'Saving...' : (account ? 'Update Account' : 'Create Account')}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default BankAccountForm;
