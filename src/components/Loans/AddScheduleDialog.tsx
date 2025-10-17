import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
} from '@mui/material';
import {
  Add,
  Extension,
  Refresh,
} from '@mui/icons-material';
import {
  AddCustomScheduleRequest,
  ExtendLoanTermRequest,
  RegenerateScheduleRequest,
  Loan,
} from '../../types/loan';
import { apiService } from '../../services/api';
import { getErrorMessage } from '../../utils/validation';

interface AddScheduleDialogProps {
  open: boolean;
  onClose: () => void;
  loan: Loan;
  onSuccess: (message: string) => void;
  onError: (error: string) => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`schedule-tabpanel-${index}`}
      aria-labelledby={`schedule-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
};

const AddScheduleDialog: React.FC<AddScheduleDialogProps> = ({
  open,
  onClose,
  loan,
  onSuccess,
  onError,
}) => {
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Add Custom Schedule State
  const [customSchedule, setCustomSchedule] = useState<AddCustomScheduleRequest>({
    startingInstallmentNumber: 1,
    numberOfMonths: 1,
    firstDueDate: new Date().toISOString(),
    monthlyPayment: 0,
    reason: '',
  });

  // Extend Term State
  const [extendTerm, setExtendTerm] = useState<ExtendLoanTermRequest>({
    additionalMonths: 1,
    reason: '',
  });

  // Regenerate Schedule State
  const [regenerateSchedule, setRegenerateSchedule] = useState<RegenerateScheduleRequest>({
    newMonthlyPayment: loan.monthlyPayment,
    newTerm: loan.term,
    startDate: new Date().toISOString(),
    reason: '',
  });

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleClose = () => {
    // Reset all form states
    setCustomSchedule({
      startingInstallmentNumber: 1,
      numberOfMonths: 1,
      firstDueDate: new Date().toISOString(),
      monthlyPayment: 0,
      reason: '',
    });
    setExtendTerm({
      additionalMonths: 1,
      reason: '',
    });
    setRegenerateSchedule({
      newMonthlyPayment: loan.monthlyPayment,
      newTerm: loan.term,
      startDate: new Date().toISOString(),
      reason: '',
    });
    setActiveTab(0);
    onClose();
  };

  const handleAddCustomSchedule = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.addCustomPaymentSchedule(loan.id, customSchedule);
      
      if (response.success) {
        onSuccess(response.message || 'Custom schedule added successfully');
        handleClose();
      } else {
        onError(response.message || 'Failed to add custom schedule');
      }
    } catch (err: unknown) {
      onError(getErrorMessage(err, 'Failed to add custom schedule'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtendTerm = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.extendLoanTerm(loan.id, extendTerm);
      
      if (response.success) {
        onSuccess(response.message || 'Loan term extended successfully');
        handleClose();
      } else {
        onError(response.message || 'Failed to extend loan term');
      }
    } catch (err: unknown) {
      onError(getErrorMessage(err, 'Failed to extend loan term'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegenerateSchedule = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.regeneratePaymentSchedule(loan.id, regenerateSchedule);
      
      if (response.success) {
        onSuccess(response.message || 'Payment schedule regenerated successfully');
        handleClose();
      } else {
        onError(response.message || 'Failed to regenerate schedule');
      }
    } catch (err: unknown) {
      onError(getErrorMessage(err, 'Failed to regenerate schedule'));
    } finally {
      setIsLoading(false);
    }
  };

  const isCustomScheduleValid = (): boolean => {
    return (
      customSchedule.monthlyPayment > 0 &&
      customSchedule.firstDueDate !== ''
    );
  };

  const isExtendTermValid = (): boolean => {
    return extendTerm.additionalMonths > 0;
  };

  const isRegenerateScheduleValid = (): boolean => {
    return (
      regenerateSchedule.newMonthlyPayment > 0 &&
      regenerateSchedule.newTerm > 0 &&
      regenerateSchedule.startDate !== ''
    );
  };

  const getCurrentActionValid = (): boolean => {
    switch (activeTab) {
      case 0:
        return isCustomScheduleValid();
      case 1:
        return isExtendTermValid();
      case 2:
        return isRegenerateScheduleValid();
      default:
        return false;
    }
  };

  const handleCurrentAction = () => {
    switch (activeTab) {
      case 0:
        handleAddCustomSchedule();
        break;
      case 1:
        handleExtendTerm();
        break;
      case 2:
        handleRegenerateSchedule();
        break;
    }
  };

  const getActionButtonText = (): string => {
    switch (activeTab) {
      case 0:
        return 'Add Custom Schedule';
      case 1:
        return 'Extend Loan Term';
      case 2:
        return 'Regenerate Schedule';
      default:
        return 'Execute';
    }
  };

  return (
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Add Payment Schedule</Typography>
          <Typography variant="body2" color="text.secondary">
            Loan #{loan.id.slice(-8).toUpperCase()} - {loan.purpose}
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
            <Tabs value={activeTab} onChange={handleTabChange}>
              <Tab 
                icon={<Add />} 
                label="Add Custom Installments" 
                iconPosition="start"
              />
              <Tab 
                icon={<Extension />} 
                label="Extend Term" 
                iconPosition="start"
              />
              <Tab 
                icon={<Refresh />} 
                label="Regenerate Schedule" 
                iconPosition="start"
              />
            </Tabs>
          </Box>

          {/* Add Custom Schedule Tab */}
          <TabPanel value={activeTab} index={0}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Add a payment installment to your existing schedule with a specific due date and amount.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="First Due Date"
                  type="date"
                  value={customSchedule.firstDueDate.split('T')[0]}
                  onChange={(e) => setCustomSchedule({
                    ...customSchedule,
                    firstDueDate: new Date(e.target.value).toISOString()
                  })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Monthly Payment"
                  type="number"
                  value={customSchedule.monthlyPayment}
                  onChange={(e) => setCustomSchedule({
                    ...customSchedule,
                    monthlyPayment: parseFloat(e.target.value) || 0
                  })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason (Optional)"
                  multiline
                  rows={2}
                  value={customSchedule.reason}
                  onChange={(e) => setCustomSchedule({
                    ...customSchedule,
                    reason: e.target.value
                  })}
                  placeholder="e.g., Adding catch-up payments"
                />
              </Grid>
            </Grid>
          </TabPanel>

          {/* Extend Term Tab */}
          <TabPanel value={activeTab} index={1}>
            <Alert severity="info" sx={{ mb: 3 }}>
              Add additional months to the end of your loan term.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Additional Months"
                  type="number"
                  value={extendTerm.additionalMonths}
                  onChange={(e) => setExtendTerm({
                    ...extendTerm,
                    additionalMonths: parseInt(e.target.value) || 1
                  })}
                  inputProps={{ min: 1, max: 60 }}
                  helperText="Number of months to extend the loan"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason (Optional)"
                  multiline
                  rows={2}
                  value={extendTerm.reason}
                  onChange={(e) => setExtendTerm({
                    ...extendTerm,
                    reason: e.target.value
                  })}
                  placeholder="e.g., Financial hardship extension"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Current Loan Information:
              </Typography>
              <Typography variant="body2">
                Current Term: {loan.term} months
              </Typography>
              <Typography variant="body2">
                New Term: {loan.term + extendTerm.additionalMonths} months
              </Typography>
              <Typography variant="body2">
                Current Monthly Payment: ${loan.monthlyPayment.toFixed(2)}
              </Typography>
            </Box>
          </TabPanel>

          {/* Regenerate Schedule Tab */}
          <TabPanel value={activeTab} index={2}>
            <Alert severity="warning" sx={{ mb: 3 }}>
              This will replace your entire payment schedule with new terms. This action cannot be undone.
            </Alert>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="New Monthly Payment"
                  type="number"
                  value={regenerateSchedule.newMonthlyPayment}
                  onChange={(e) => setRegenerateSchedule({
                    ...regenerateSchedule,
                    newMonthlyPayment: parseFloat(e.target.value) || 0
                  })}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">$</InputAdornment>,
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="New Term (Months)"
                  type="number"
                  value={regenerateSchedule.newTerm}
                  onChange={(e) => setRegenerateSchedule({
                    ...regenerateSchedule,
                    newTerm: parseInt(e.target.value) || 1
                  })}
                  inputProps={{ min: 1, max: 60 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Start Date"
                  type="date"
                  value={regenerateSchedule.startDate.split('T')[0]}
                  onChange={(e) => setRegenerateSchedule({
                    ...regenerateSchedule,
                    startDate: new Date(e.target.value).toISOString()
                  })}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason (Optional)"
                  multiline
                  rows={2}
                  value={regenerateSchedule.reason}
                  onChange={(e) => setRegenerateSchedule({
                    ...regenerateSchedule,
                    reason: e.target.value
                  })}
                  placeholder="e.g., Loan restructuring"
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Schedule Comparison:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Current Monthly Payment:
                  </Typography>
                  <Typography variant="body2">
                    ${loan.monthlyPayment.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    New Monthly Payment:
                  </Typography>
                  <Typography variant="body2">
                    ${regenerateSchedule.newMonthlyPayment.toFixed(2)}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    Current Term:
                  </Typography>
                  <Typography variant="body2">
                    {loan.term} months
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="text.secondary">
                    New Term:
                  </Typography>
                  <Typography variant="body2">
                    {regenerateSchedule.newTerm} months
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleCurrentAction}
            disabled={isLoading || !getCurrentActionValid()}
            startIcon={isLoading ? <CircularProgress size={20} /> : null}
          >
            {getActionButtonText()}
          </Button>
        </DialogActions>
      </Dialog>
  );
};

export default AddScheduleDialog;
