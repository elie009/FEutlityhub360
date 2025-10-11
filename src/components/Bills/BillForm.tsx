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
  FormControlLabel,
  Switch,
  Tooltip,
} from '@mui/material';
// Removed MUI X Date Pickers - using native HTML date input instead
import { Bill, BillType, BillStatus, BillFrequency, CreateBillRequest, UpdateBillRequest } from '../../types/bill';
import { getErrorMessage } from '../../utils/validation';
import { Box, Typography } from '@mui/material';

interface BillFormProps {
  open: boolean;
  onClose: () => void;
  bill?: Bill | null;
  onSuccess: (bill: Bill) => void;
  lockedFields?: boolean; // Lock billName, billType, frequency, provider for monthly edits
}

const BillForm: React.FC<BillFormProps> = ({
  open,
  onClose,
  bill,
  onSuccess,
  lockedFields = false,
}) => {
  const [formData, setFormData] = useState({
    billName: '',
    billType: BillType.UTILITY,
    amount: 0,
    dueDate: new Date(),
    frequency: BillFrequency.MONTHLY,
    status: BillStatus.PENDING,
    notes: '',
    provider: '',
    referenceNumber: '',
    autoGenerateNext: false,  // Auto-generation toggle
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [dateWarning, setDateWarning] = useState<string>('');
  
  // Get the month and year from the original bill's due date (for validation)
  const originalMonth = bill ? new Date(bill.dueDate).getMonth() : null;
  const originalYear = bill ? new Date(bill.dueDate).getFullYear() : null;

  useEffect(() => {
    if (bill) {
      setFormData({
        billName: bill.billName || '',
        billType: bill.billType || BillType.UTILITY,
        amount: bill.amount || 0,
        dueDate: new Date(bill.dueDate) || new Date(),
        frequency: bill.frequency || BillFrequency.MONTHLY,
        status: bill.status || BillStatus.PENDING,
        notes: bill.notes || '',
        provider: bill.provider || '',
        referenceNumber: bill.referenceNumber || '',
        autoGenerateNext: bill.autoGenerateNext || false,
      });
    } else {
      // Reset form for new bill
      setFormData({
        billName: '',
        billType: BillType.UTILITY,
        amount: 0,
        dueDate: new Date(),
        frequency: BillFrequency.MONTHLY,
        status: BillStatus.PENDING,
        notes: '',
        provider: '',
        referenceNumber: '',
        autoGenerateNext: false,
      });
    }
  }, [bill, open]);

  const handleChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.type === 'number' ? parseFloat(event.target.value) || 0 : event.target.value;
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

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value;
    if (dateValue) {
      const selectedDate = new Date(dateValue);
      const selectedMonth = selectedDate.getMonth();
      const selectedYear = selectedDate.getFullYear();
      
      // If locked fields (editing a specific month), validate the date is in the same month
      if (lockedFields && originalMonth !== null && originalYear !== null) {
        if (selectedMonth !== originalMonth || selectedYear !== originalYear) {
          const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                             'July', 'August', 'September', 'October', 'November', 'December'];
          const expectedMonthName = monthNames[originalMonth];
          const selectedMonthName = monthNames[selectedMonth];
          
          setDateWarning(
            `Warning: You selected ${selectedMonthName} ${selectedYear}, but you're editing ${expectedMonthName} ${originalYear}. ` +
            `Please select a date within ${expectedMonthName} ${originalYear}.`
          );
          return; // Don't update the date
        } else {
          setDateWarning(''); // Clear warning if date is valid
        }
      }
      
      setFormData(prev => ({
        ...prev,
        dueDate: selectedDate,
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.billName.trim()) {
      setError('Bill name is required');
      return false;
    }
    if (formData.amount <= 0) {
      setError('Amount must be greater than 0');
      return false;
    }
    if (!formData.dueDate) {
      setError('Due date is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const billData = {
        ...formData,
        dueDate: formData.dueDate.toISOString(),
      };

      if (bill) {
        // Update existing bill
        const { apiService } = await import('../../services/api');
        const updatedBill = await apiService.updateBill(bill.id, billData as UpdateBillRequest);
        onSuccess(updatedBill);
      } else {
        // Create new bill
        const { apiService } = await import('../../services/api');
        const newBill = await apiService.createBill(billData as CreateBillRequest);
        onSuccess(newBill);
      }
      
      onClose();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save bill'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {bill ? 'Edit Bill' : 'Create New Bill'}
        </DialogTitle>
        
        <form onSubmit={handleSubmit}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {dateWarning && (
              <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setDateWarning('')}>
                {dateWarning}
              </Alert>
            )}

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Bill Name"
                  value={formData.billName}
                  onChange={handleChange('billName')}
                  fullWidth
                  required
                  disabled={lockedFields}
                  helperText={lockedFields ? "Cannot change bill name when editing a specific month" : "Enter a descriptive name for the bill"}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required disabled={!!bill}>
                  <InputLabel>Bill Type</InputLabel>
                  <Select
                    value={formData.billType}
                    onChange={handleSelectChange('billType')}
                    label="Bill Type"
                  >
                    <MenuItem value={BillType.UTILITY}>Utility (Water, Electricity, Gas)</MenuItem>
                    <MenuItem value={BillType.INSURANCE}>Insurance (Health, Car, Life)</MenuItem>
                    <MenuItem value={BillType.SUBSCRIPTION}>Subscriptions (Netflix, Spotify, Adobe)</MenuItem>
                    <MenuItem value={BillType.SCHOOL_TUITION}>School Tuition</MenuItem>
                    <MenuItem value={BillType.CREDIT_CARD}>Credit Card Bill</MenuItem>
                    <MenuItem value={BillType.MEDICAL}>Medical Bill</MenuItem>
                    <MenuItem value={BillType.OTHER}>Other</MenuItem>
                  </Select>
                  {bill && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      Cannot change bill type when editing
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange('amount')}
                  fullWidth
                  required
                  inputProps={{ min: 0, step: 0.01 }}
                  helperText="Enter the bill amount"
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required disabled={!!bill}>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    value={formData.frequency}
                    onChange={handleSelectChange('frequency')}
                    label="Frequency"
                  >
                    <MenuItem value={BillFrequency.MONTHLY}>Monthly</MenuItem>
                    <MenuItem value={BillFrequency.QUARTERLY}>Quarterly</MenuItem>
                    <MenuItem value={BillFrequency.YEARLY}>Yearly</MenuItem>
                  </Select>
                  {bill && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                      Cannot change frequency when editing
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Due Date"
                  type="date"
                  value={formData.dueDate.toISOString().split('T')[0]}
                  onChange={handleDateChange}
                  fullWidth
                  required
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>

              {bill && (
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Status</InputLabel>
                    <Select
                      value={formData.status}
                      onChange={handleSelectChange('status')}
                      label="Status"
                    >
                      <MenuItem value={BillStatus.PENDING}>Pending</MenuItem>
                      <MenuItem value={BillStatus.PAID}>Paid</MenuItem>
                      <MenuItem value={BillStatus.OVERDUE}>Overdue</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              )}

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Provider"
                  value={formData.provider}
                  onChange={handleChange('provider')}
                  fullWidth
                  disabled={!!bill}
                  helperText={bill ? "Cannot change provider when editing" : "Company or service provider"}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Reference Number"
                  value={formData.referenceNumber}
                  onChange={handleChange('referenceNumber')}
                  fullWidth
                  helperText="Account or reference number"
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Notes"
                  value={formData.notes}
                  onChange={handleChange('notes')}
                  fullWidth
                  multiline
                  rows={3}
                  helperText="Additional notes or comments"
                />
              </Grid>

              {/* Auto-Generation Toggle - Only for new bills with monthly frequency */}
              {!bill && formData.frequency === BillFrequency.MONTHLY && (
                <Grid item xs={12}>
                  <Tooltip title="Automatically create future bills using forecast predictions. You'll just need to confirm or update the amount each month.">
                    <FormControlLabel
                      control={
                        <Switch
                          checked={formData.autoGenerateNext}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            autoGenerateNext: e.target.checked,
                          }))}
                          color="primary"
                        />
                      }
                      label={
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            ⭐ Auto-generate future bills (Recommended)
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Save time! System will create next month's bills automatically using forecasts.
                          </Typography>
                        </Box>
                      }
                    />
                  </Tooltip>
                </Grid>
              )}
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isLoading}
              startIcon={isLoading ? <CircularProgress size={20} /> : null}
            >
              {isLoading ? 'Saving...' : (bill ? 'Update Bill' : 'Create Bill')}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
  );
};

export default BillForm;
