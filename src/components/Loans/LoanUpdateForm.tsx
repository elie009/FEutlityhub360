import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Divider,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { 
  Calculate as CalculateIcon, 
  AttachMoney as MoneyIcon,
  Info as InfoIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import { Loan, LoanStatus } from '../../types/loan';
import { apiService } from '../../services/api';
import { getErrorMessage } from '../../utils/validation';
import RepaymentScheduleManager from './RepaymentScheduleManager';

interface LoanUpdateFormProps {
  open: boolean;
  onClose: () => void;
  loan: Loan | null;
  onSuccess: (updatedLoan: Loan) => void;
  onRefresh?: () => Promise<void>; // Add optional refresh callback
}

const LoanUpdateForm: React.FC<LoanUpdateFormProps> = ({
  open,
  onClose,
  loan,
  onSuccess,
  onRefresh,
}) => {
  const [formData, setFormData] = useState({
    purpose: '',
    additionalInfo: '',
    status: '',
    principal: 0,
    interestRate: 0,
    monthlyPayment: 0,
    remainingBalance: 0,
  });
  const [autoCalculate, setAutoCalculate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (loan) {
      setFormData({
        purpose: loan.purpose || '',
        additionalInfo: loan.additionalInfo || '',
        status: loan.status || '',
        principal: loan.principal || 0,
        interestRate: loan.interestRate || 0,
        monthlyPayment: loan.monthlyPayment || 0,
        remainingBalance: loan.remainingBalance || 0,
      });
      // Reset auto-calculate to true when opening the form
      setAutoCalculate(true);
      // Reset to first tab when opening
      setActiveTab(0);
    }
  }, [loan]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'number' ? parseFloat(event.target.value) : event.target.value;
    console.log(`🔄 Field changed: ${field}`, { oldValue: formData[field as keyof typeof formData], newValue: value });
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (field: string) => (event: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!loan) return;

    // Build update data - ONLY send fields that changed
    const updateData: any = {};
    
    if (formData.purpose !== loan.purpose) {
      updateData.purpose = formData.purpose;
    }
    
    if (formData.additionalInfo !== loan.additionalInfo) {
      updateData.additionalInfo = formData.additionalInfo;
    }
    
    if (formData.status !== loan.status) {
      updateData.status = formData.status;
    }
    
    // Principal Update Logic
    if (formData.principal !== loan.principal) {
      updateData.principal = formData.principal;
    }
    
    if (formData.interestRate !== loan.interestRate) {
      updateData.interestRate = formData.interestRate;
    }
    
    // 💰 Auto-Calculate Feature Logic
    // Only include monthlyPayment if NOT auto-calculating OR if value changed and auto-calc is off
    if (!autoCalculate && formData.monthlyPayment !== loan.monthlyPayment) {
      updateData.monthlyPayment = formData.monthlyPayment;
    }
    
    // Only include remainingBalance if NOT auto-calculating OR if value changed and auto-calc is off
    if (!autoCalculate && formData.remainingBalance !== loan.remainingBalance) {
      updateData.remainingBalance = formData.remainingBalance;
    }

    console.log('📤 Submitting loan update:');
    console.log('🔹 Auto-Calculate Mode:', autoCalculate ? '✅ ENABLED' : '❌ DISABLED');
    console.log('🔹 Original Loan:', {
      principal: loan.principal,
      interestRate: loan.interestRate,
      monthlyPayment: loan.monthlyPayment,
      remainingBalance: loan.remainingBalance,
      totalAmount: loan.totalAmount,
    });
    console.log('🔹 Fields Changed:', updateData);
    console.log('🔹 Backend Will Auto-Calculate:', {
      monthlyPayment: autoCalculate && 
                     (updateData.hasOwnProperty('principal') || updateData.hasOwnProperty('interestRate')) 
                     ? '✅ YES' : '❌ NO (using manual value)',
      totalAmount: '✅ ALWAYS (if any financial field changed)',
      remainingBalance: autoCalculate && 
                       (updateData.hasOwnProperty('principal') || 
                        updateData.hasOwnProperty('interestRate') || 
                        updateData.hasOwnProperty('monthlyPayment'))
                       ? '✅ YES' : '❌ NO (using manual value)',
    });

    try {
      setIsLoading(true);
      setError('');

      const updatedLoan = await apiService.updateLoan(loan.id, updateData);
      
      console.log('✅ Loan updated successfully!');
      console.log('📊 Backend Response:', {
        id: updatedLoan.id,
        principal: updatedLoan.principal,
        interestRate: updatedLoan.interestRate,
        monthlyPayment: updatedLoan.monthlyPayment,
        totalAmount: updatedLoan.totalAmount,
        remainingBalance: updatedLoan.remainingBalance,
        status: updatedLoan.status,
      });
      console.log('🔄 Changes Applied:', {
        principal: loan.principal !== updatedLoan.principal 
          ? `${loan.principal} → ${updatedLoan.principal}` 
          : 'unchanged',
        interestRate: loan.interestRate !== updatedLoan.interestRate
          ? `${loan.interestRate}% → ${updatedLoan.interestRate}%`
          : 'unchanged',
        monthlyPayment: loan.monthlyPayment !== updatedLoan.monthlyPayment
          ? `${loan.monthlyPayment} → ${updatedLoan.monthlyPayment} ${autoCalculate ? '(auto-calculated)' : '(manual)'}`
          : 'unchanged',
        remainingBalance: loan.remainingBalance !== updatedLoan.remainingBalance
          ? `${loan.remainingBalance} → ${updatedLoan.remainingBalance} ${autoCalculate ? '(auto-calculated)' : '(manual)'}`
          : 'unchanged',
        totalAmount: loan.totalAmount !== updatedLoan.totalAmount
          ? `${loan.totalAmount} → ${updatedLoan.totalAmount} (calculated)`
          : 'unchanged',
      });

      onSuccess(updatedLoan);
      
      // Refresh the loan list to ensure all calculated fields are updated
      if (onRefresh) {
        console.log('🔄 Refreshing loan list...');
        await onRefresh();
      }
      
      onClose();
    } catch (err: unknown) {
      console.error('❌ Error updating loan:', err);
      setError(getErrorMessage(err, 'Failed to update loan'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  if (!loan) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MoneyIcon color="primary" />
          <Typography variant="h6">
            Update Loan #{loan.id.slice(-8).toUpperCase()}
          </Typography>
        </Box>
        
        {/* Tabs for switching between Update and Schedule */}
        <Tabs 
          value={activeTab} 
          onChange={(e, newValue) => setActiveTab(newValue)}
          sx={{ mt: 2 }}
        >
          <Tab 
            label="Update Loan" 
            icon={<MoneyIcon />} 
            iconPosition="start"
          />
          <Tab 
            label="Payment Schedule" 
            icon={<ScheduleIcon />} 
            iconPosition="start"
          />
        </Tabs>
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {/* Tab Panel 0: Update Loan */}
          {activeTab === 0 && (
            <>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* Basic Information Section */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" color="primary" sx={{ mb: 2, fontWeight: 600 }}>
                    Basic Information
                  </Typography>
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Purpose"
                      value={formData.purpose}
                      onChange={handleChange('purpose')}
                      fullWidth
                      required
                    />

                    <TextField
                      label="Additional Information"
                      value={formData.additionalInfo}
                      onChange={handleChange('additionalInfo')}
                      fullWidth
                      multiline
                      rows={3}
                    />

                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        value={formData.status}
                        onChange={handleSelectChange('status')}
                        label="Status"
                      >
                        <MenuItem value={LoanStatus.PENDING}>Pending</MenuItem>
                        <MenuItem value={LoanStatus.APPROVED}>Approved</MenuItem>
                        <MenuItem value={LoanStatus.ACTIVE}>Active</MenuItem>
                        <MenuItem value={LoanStatus.OVERDUE}>Overdue</MenuItem>
                        <MenuItem value={LoanStatus.CLOSED}>Closed</MenuItem>
                        <MenuItem value={LoanStatus.COMPLETED}>Completed ✓</MenuItem>
                        <MenuItem value={LoanStatus.CANCELLED}>Cancelled ✗</MenuItem>
                        <MenuItem value={LoanStatus.REJECTED}>Rejected</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                  
                  {/* Informative Note about Status Options */}
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                      💡 Managing Loan Status - Your Options
                    </Typography>
                    <Typography variant="body2" component="div" sx={{ fontSize: '0.875rem' }}>
                      <strong>Option 1: Mark as Completed/Cancelled (Recommended)</strong>
                      <br />
                      Instead of deleting, change the loan status to <strong>COMPLETED</strong> or <strong>CANCELLED</strong>. 
                      This preserves the payment history while effectively closing the loan.
                      <br /><br />
                      
                      <strong>Option 2: Delete All Payments First (Not Recommended)</strong>
                      <br />
                      You could manually delete all payment records associated with this loan first, then delete the loan. 
                      However, this defeats the purpose of maintaining financial history.
                      <br /><br />
                      
                      <strong>Option 3: Contact Administrator (Use with Caution)</strong>
                      <br />
                      If you truly need to delete a loan with existing payments, contact your system administrator 
                      to modify the database constraints. This should only be done in exceptional circumstances.
                    </Typography>
                  </Alert>
                </Paper>

                <Divider />

                {/* Financial Details Section */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.default' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                    <Typography variant="subtitle2" color="primary" sx={{ fontWeight: 600 }}>
                      Financial Details
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={autoCalculate}
                          onChange={(e) => setAutoCalculate(e.target.checked)}
                          icon={<CalculateIcon />}
                          checkedIcon={<CalculateIcon />}
                          color="primary"
                        />
                      }
                      label={
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          Auto-calculate
                        </Typography>
                      }
                    />
                  </Box>

                  {autoCalculate && (
                    <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Auto-Calculate Mode:</strong> Monthly payment and remaining balance will be 
                        automatically calculated based on principal, interest rate, and term.
                      </Typography>
                    </Alert>
                  )}
                  
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                      label="Principal Amount"
                      type="number"
                      value={formData.principal ?? ''}
                      onChange={handleChange('principal')}
                      fullWidth
                      required
                      inputProps={{ min: 0.01, step: "any" }}
                      helperText="⭐ Original loan amount - Changing this triggers auto-calculation"
                    />

                    <TextField
                      label="Interest Rate (%)"
                      type="number"
                      value={formData.interestRate ?? ''}
                      onChange={handleChange('interestRate')}
                      fullWidth
                      inputProps={{ min: 0, max: 100, step: "any" }}
                      helperText="Changing this triggers auto-calculation of monthly payment"
                    />

                    <TextField
                      label="Monthly Payment"
                      type="number"
                      value={formData.monthlyPayment ?? ''}
                      onChange={handleChange('monthlyPayment')}
                      fullWidth
                      disabled={autoCalculate}
                      inputProps={{ min: 0, step: "any" }}
                      helperText={
                        autoCalculate 
                          ? "🔒 Auto-calculated based on principal, interest rate, and term" 
                          : "💡 Manually set your custom monthly payment"
                      }
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: 'text.primary',
                          opacity: 0.7,
                        },
                      }}
                    />

                    <TextField
                      label="Remaining Balance"
                      type="number"
                      value={formData.remainingBalance ?? ''}
                      onChange={handleChange('remainingBalance')}
                      fullWidth
                      disabled={autoCalculate}
                      inputProps={{ min: 0, step: "any" }}
                      helperText={
                        autoCalculate 
                          ? "🔒 Auto-calculated (preserves payment history)" 
                          : "💡 Manually set remaining balance"
                      }
                      sx={{
                        '& .MuiInputBase-input.Mui-disabled': {
                          WebkitTextFillColor: 'text.primary',
                          opacity: 0.7,
                        },
                      }}
                    />
                  </Box>
                </Paper>

                {/* Info Box */}
                <Paper elevation={0} sx={{ p: 2, bgcolor: 'info.lighter' }}>
                  <Typography variant="caption" color="text.secondary">
                    <strong>💡 How it works:</strong><br />
                    • <strong>Auto-Calculate ON:</strong> Backend calculates monthly payment & remaining balance when you update principal or interest rate<br />
                    • <strong>Auto-Calculate OFF:</strong> You have full control over all values<br />
                    • Payment history is always preserved in calculations
                  </Typography>
                </Paper>
              </Box>
            </>
          )}

          {/* Tab Panel 1: Payment Schedule */}
          {activeTab === 1 && (
            <Box sx={{ mt: 2 }}>
              <RepaymentScheduleManager 
                loanId={loan.id}
                loanPurpose={loan.purpose}
              />
            </Box>
          )}
        </DialogContent>

        {activeTab === 0 && (
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : <CalculateIcon />}
            >
              {isLoading ? 'Updating...' : 'Update Loan'}
            </Button>
          </DialogActions>
        )}

        {activeTab === 1 && (
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleClose}>
              Close
            </Button>
          </DialogActions>
        )}
      </form>
    </Dialog>
  );
};

export default LoanUpdateForm;
