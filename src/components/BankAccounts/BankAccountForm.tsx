import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, CircularProgress, Alert,
  FormControl, InputLabel, Select, MenuItem, Grid,
  FormControlLabel, Switch, Typography, Box,
  SelectChangeEvent, Tooltip, IconButton, Link, Accordion,
  AccordionSummary, AccordionDetails, Chip,
} from '@mui/material';
import {
  Info as InfoIcon,
  HelpOutline as HelpIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
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

  const validateForm = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!formData.accountName.trim()) {
      errors.push('Account name is required. Please enter a name to identify this account (e.g., "My Checking Account", "Chase Savings").');
    } else if (formData.accountName.trim().length < 2) {
      errors.push('Account name must be at least 2 characters long.');
    }
    
    if (formData.initialBalance < 0) {
      errors.push('Initial balance cannot be negative. Enter 0 if you\'re starting with no balance.');
    }
    
    if (formData.accountNumber && formData.accountNumber.length > 0 && formData.accountNumber.length < 4) {
      errors.push('Account number must be at least 4 digits. You can enter just the last 4 digits for privacy.');
    }
    
    if (formData.routingNumber && formData.routingNumber.length > 0 && formData.routingNumber.length !== 9) {
      errors.push('Routing number must be 9 digits. You can find this on your checks or bank statement.');
    }
    
    if (formData.swiftCode && formData.swiftCode.length > 0 && (formData.swiftCode.length < 8 || formData.swiftCode.length > 11)) {
      errors.push('SWIFT code must be 8-11 characters. This is only needed for international transfers.');
    }
    
    return { isValid: errors.length === 0, errors };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateForm();
    if (!validation.isValid) {
      setError(validation.errors.join(' '));
      return;
    }

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
      const errorMessage = getErrorMessage(err, account ? 'Failed to update bank account' : 'Failed to create bank account');
      
      // Enhanced error messages with actionable guidance
      let enhancedError = errorMessage;
      if (errorMessage.includes('duplicate') || errorMessage.includes('already exists')) {
        enhancedError = `${errorMessage} Try using a different account name or check if you already have an account with this name.`;
      } else if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
        enhancedError = `${errorMessage} Please check all required fields are filled correctly and try again.`;
      } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        enhancedError = `${errorMessage} Please check your internet connection and try again.`;
      }
      
      setError(enhancedError);
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
              {error}
            </Alert>
          )}
          
          {/* Help Section */}
          {!account && (
            <Accordion sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HelpIcon color="primary" />
                  <Typography variant="subtitle2">Need Help? Learn More About Adding Bank Accounts</Typography>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" paragraph>
                  <strong>Quick Start Guide:</strong>
                </Typography>
                <Typography variant="body2" component="div" sx={{ mb: 2 }}>
                  <ol style={{ margin: 0, paddingLeft: 20 }}>
                    <li><strong>Account Name:</strong> Give your account a memorable name (e.g., "My Checking Account")</li>
                    <li><strong>Account Type:</strong> Select the type that matches your account</li>
                    <li><strong>Initial Balance:</strong> Enter your current account balance</li>
                    <li><strong>Optional Fields:</strong> Add bank details for better tracking (account number, routing number)</li>
                  </ol>
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Privacy Tip:</strong> You can enter just the last 4 digits of your account number for privacy. The system will work the same way.
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Common Examples:</strong>
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Chip label="Checking Account: 'My Primary Checking' - $5,000 balance" size="small" variant="outlined" />
                  <Chip label="Savings Account: 'Emergency Fund' - $10,000 balance" size="small" variant="outlined" />
                  <Chip label="Credit Card: 'Chase Sapphire' - $0 balance (pay off monthly)" size="small" variant="outlined" />
                </Box>
              </AccordionDetails>
            </Accordion>
          )}
          
          <Grid container spacing={2}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Basic Information
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <InputLabel required>Account Name</InputLabel>
                <Tooltip title="A friendly name to identify this account (e.g., 'My Checking Account', 'Chase Savings'). This helps you distinguish between multiple accounts." arrow>
                  <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
              <TextField
                name="accountName"
                label="Account Name"
                value={formData.accountName}
                onChange={handleChange}
                fullWidth
                required
                inputProps={{ maxLength: 255 }}
                helperText="Example: 'My Checking Account' or 'Chase Savings'"
                placeholder="Enter a descriptive name"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <InputLabel required>Account Type</InputLabel>
                <Tooltip title="Select the type of account. Checking accounts are for daily transactions, Savings for storing money, Credit Cards track debt, and Investment accounts track investments." arrow>
                  <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
              <FormControl fullWidth required>
                <InputLabel>Account Type</InputLabel>
                <Select
                  name="accountType"
                  value={formData.accountType}
                  label="Account Type"
                  onChange={handleSelectChange}
                >
                  <MenuItem value="checking">
                    <Box>
                      <Typography variant="body2">Checking</Typography>
                      <Typography variant="caption" color="text.secondary">For daily transactions and bill payments</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="savings">
                    <Box>
                      <Typography variant="body2">Savings</Typography>
                      <Typography variant="caption" color="text.secondary">For storing money and earning interest</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="credit_card">
                    <Box>
                      <Typography variant="body2">Credit Card</Typography>
                      <Typography variant="caption" color="text.secondary">Tracks credit card debt and payments</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="investment">
                    <Box>
                      <Typography variant="body2">Investment</Typography>
                      <Typography variant="caption" color="text.secondary">For stocks, bonds, and other investments</Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="bank">
                    <Box>
                      <Typography variant="body2">Bank</Typography>
                      <Typography variant="caption" color="text.secondary">General bank account</Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <InputLabel required>{account ? "Current Balance" : "Initial Balance"}</InputLabel>
                <Tooltip title={account ? "Update the current balance of this account. This will be the starting point for future transactions." : "Enter the starting balance when you create this account. This is the amount currently in the account."} arrow>
                  <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
              <TextField
                name="initialBalance"
                label={account ? "Current Balance" : "Initial Balance"}
                type="number"
                value={formData.initialBalance}
                onChange={handleNumberChange}
                fullWidth
                required
                inputProps={{ step: "0.01", min: "0" }}
                helperText={account ? "Update to match your bank statement" : "Enter 0 if starting with no balance"}
              />
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <InputLabel>Description</InputLabel>
                <Tooltip title="Optional notes about this account. Useful for reminders or additional context." arrow>
                  <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
              <TextField
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                fullWidth
                multiline
                rows={2}
                inputProps={{ maxLength: 500 }}
                helperText="Optional: Add notes or reminders about this account"
                placeholder="e.g., 'Primary account for bills', 'Emergency fund'"
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
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <InputLabel>Financial Institution</InputLabel>
                    <Tooltip title="The name of your bank or financial institution (e.g., 'Chase Bank', 'Bank of America'). This helps identify where the account is held." arrow>
                      <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                  <TextField
                    name="financialInstitution"
                    label="Financial Institution"
                    value={formData.financialInstitution}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ maxLength: 100 }}
                    helperText="Example: 'Chase Bank', 'Wells Fargo'"
                    placeholder="Enter bank name"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <InputLabel>Account Number</InputLabel>
                    <Tooltip title="Your bank account number. For privacy, you can enter just the last 4 digits. The system will securely store this information." arrow>
                      <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                  <TextField
                    name="accountNumber"
                    label="Account Number"
                    value={formatAccountNumber(formData.accountNumber)}
                    onChange={handleAccountNumberChange}
                    fullWidth
                    inputProps={{ maxLength: 19 }} // 16 digits + 3 spaces
                    placeholder="1234 or full account number"
                    helperText="Enter last 4 digits for privacy, or full account number. Found on your checks or bank statement."
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <InputLabel>Routing Number</InputLabel>
                    <Tooltip title="A 9-digit number that identifies your bank. You can find this on the bottom left of your checks or on your bank statement. Used for ACH transfers and direct deposits." arrow>
                      <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                  <TextField
                    name="routingNumber"
                    label="Routing Number"
                    value={formData.routingNumber}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ maxLength: 9, pattern: '[0-9]*' }}
                    helperText="9-digit number found on checks (bottom left) or bank statement"
                    placeholder="123456789"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <InputLabel>Sync Frequency</InputLabel>
                    <Tooltip title="How often the system should automatically sync transactions with your bank. Daily sync keeps your data most up-to-date, while Manual requires you to sync when needed. Note: Automatic syncing requires bank connection." arrow>
                      <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                  <FormControl fullWidth>
                    <InputLabel>Sync Frequency</InputLabel>
                    <Select
                      name="syncFrequency"
                      value={formData.syncFrequency}
                      label="Sync Frequency"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="DAILY">
                        <Box>
                          <Typography variant="body2">Daily</Typography>
                          <Typography variant="caption" color="text.secondary">Sync every day (most up-to-date)</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="WEEKLY">
                        <Box>
                          <Typography variant="body2">Weekly</Typography>
                          <Typography variant="caption" color="text.secondary">Sync once per week</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="MONTHLY">
                        <Box>
                          <Typography variant="body2">Monthly</Typography>
                          <Typography variant="caption" color="text.secondary">Sync once per month</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="MANUAL">
                        <Box>
                          <Typography variant="body2">Manual</Typography>
                          <Typography variant="caption" color="text.secondary">You control when to sync</Typography>
                        </Box>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </>
            )}

            {/* Bank Information section for editing existing accounts */}
            {account && (
              <>
                {/* Bank Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                    Bank Information
                  </Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <InputLabel>Financial Institution</InputLabel>
                    <Tooltip title="The name of your bank or financial institution (e.g., 'Chase Bank', 'Bank of America'). This helps identify where the account is held." arrow>
                      <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                  <TextField
                    name="financialInstitution"
                    label="Financial Institution"
                    value={formData.financialInstitution}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ maxLength: 100 }}
                    helperText="Example: 'Chase Bank', 'Wells Fargo'"
                    placeholder="Enter bank name"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <InputLabel>Account Number</InputLabel>
                    <Tooltip title="Your bank account number. For privacy, you can enter just the last 4 digits. The system will securely store this information." arrow>
                      <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                  <TextField
                    name="accountNumber"
                    label="Account Number"
                    value={formatAccountNumber(formData.accountNumber)}
                    onChange={handleAccountNumberChange}
                    fullWidth
                    inputProps={{ maxLength: 19 }} // 16 digits + 3 spaces
                    placeholder="1234 or full account number"
                    helperText="Enter last 4 digits for privacy, or full account number. Found on your checks or bank statement."
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <InputLabel>Routing Number</InputLabel>
                    <Tooltip title="A 9-digit number that identifies your bank. You can find this on the bottom left of your checks or on your bank statement. Used for ACH transfers and direct deposits." arrow>
                      <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                  <TextField
                    name="routingNumber"
                    label="Routing Number"
                    value={formData.routingNumber}
                    onChange={handleChange}
                    fullWidth
                    inputProps={{ maxLength: 9, pattern: '[0-9]*' }}
                    helperText="9-digit number found on checks (bottom left) or bank statement"
                    placeholder="123456789"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                    <InputLabel>Sync Frequency</InputLabel>
                    <Tooltip title="How often the system should automatically sync transactions with your bank. Daily sync keeps your data most up-to-date, while Manual requires you to sync when needed. Note: Automatic syncing requires bank connection." arrow>
                      <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                    </Tooltip>
                  </Box>
                  <FormControl fullWidth>
                    <InputLabel>Sync Frequency</InputLabel>
                    <Select
                      name="syncFrequency"
                      value={formData.syncFrequency}
                      label="Sync Frequency"
                      onChange={handleSelectChange}
                    >
                      <MenuItem value="DAILY">
                        <Box>
                          <Typography variant="body2">Daily</Typography>
                          <Typography variant="caption" color="text.secondary">Sync every day (most up-to-date)</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="WEEKLY">
                        <Box>
                          <Typography variant="body2">Weekly</Typography>
                          <Typography variant="caption" color="text.secondary">Sync once per week</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="MONTHLY">
                        <Box>
                          <Typography variant="body2">Monthly</Typography>
                          <Typography variant="caption" color="text.secondary">Sync once per month</Typography>
                        </Box>
                      </MenuItem>
                      <MenuItem value="MANUAL">
                        <Box>
                          <Typography variant="body2">Manual</Typography>
                          <Typography variant="caption" color="text.secondary">You control when to sync</Typography>
                        </Box>
                      </MenuItem>
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <InputLabel>Card Number</InputLabel>
                <Tooltip title="Your debit or credit card number. Enter the last 4 digits for privacy, or the full card number if you want to enable Transaction Analyzer features. This helps identify transactions automatically." arrow>
                  <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
              <TextField
                name="iban"
                label="Card Number"
                value={formatIban(formData.iban)}
                onChange={handleIbanChange}
                fullWidth
                inputProps={{ maxLength: 19 }} // 16 characters + 3 dashes
                placeholder="1234 or full Card Number"
                helperText="Last 4 digits for privacy, or full number for Transaction Analyzer"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                <InputLabel>SWIFT Code</InputLabel>
                <Tooltip title="SWIFT (Society for Worldwide Interbank Financial Telecommunication) code is an 8-11 character code that identifies your bank for international transfers. Only needed if you make or receive international wire transfers. Example: CHASUS33 for Chase Bank USA." arrow>
                  <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                </Tooltip>
              </Box>
              <TextField
                name="swiftCode"
                label="SWIFT Code"
                value={formData.swiftCode}
                onChange={handleChange}
                fullWidth
                inputProps={{ maxLength: 11 }}
                placeholder="CHASUS33"
                helperText="8-11 characters. Only needed for international transfers"
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                  <Tooltip title="When active, this account appears in your dashboard and can be used for transactions. Deactivate accounts you no longer use to keep your view clean." arrow>
                    <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
              </Grid>
            )}
            
            {account && (
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                  <Tooltip title="Indicates if this account is connected to your bank for automatic transaction syncing. When connected, transactions can be automatically imported. Requires bank API integration." arrow>
                    <InfoIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  </Tooltip>
                </Box>
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
