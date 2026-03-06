import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Paper,
  SelectChangeEvent,
  Tooltip,
  IconButton,
  Divider,
} from '@mui/material';
import { LoanApplication, LoanType } from '../../types/loan';
import { apiService } from '../../services/api';
import { validateLoanAmount, validateRequired, validateEmploymentStatus, validateInterestRate, getErrorMessage, getApiErrorMessage } from '../../utils/validation';
import { HelpOutline, Lightbulb, Edit } from '@mui/icons-material';

interface LoanApplicationFormProps {
  onSuccess: (loanId: string) => void;
  onCancel: () => void;
}

const steps = ['Basic Information', 'Payment Details', 'Interest Rate', 'Review & Confirm'];

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ onSuccess, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<LoanApplication>({
    principal: 0,
    interestRate: 0,
    purpose: '',
    term: 12,
    monthlyIncome: 0,
    employmentStatus: '',
    additionalInfo: '',
    loanType: LoanType.PERSONAL,
    refinancedFromLoanId: null,
  });
  const [paymentDueDay, setPaymentDueDay] = useState<number>(1);
  const [loanStartDate, setLoanStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [error, setError] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [otherPurpose, setOtherPurpose] = useState<string>(''); // For custom purpose input
  
  // Real-time validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Update validation errors in real-time
  React.useEffect(() => {
    const errors: Record<string, string> = {};
    
    // Validate Step 0 fields (Basic Information)
    const principalValidation = validateLoanAmount(formData.principal);
    if (!principalValidation.isValid && formData.principal !== 0) {
      errors.principal = principalValidation.error || '';
    }
    
    const purposeValidation = validateRequired(formData.purpose === 'other' ? otherPurpose : formData.purpose, 'Purpose');
    if (!purposeValidation.isValid && formData.purpose !== '') {
      errors.purpose = purposeValidation.error || '';
    }
    
    // Validate Step 2 fields (Interest Rate)
    const interestRateValidation = validateInterestRate(formData.interestRate);
    if (!interestRateValidation.isValid && formData.interestRate !== 0) {
      errors.interestRate = interestRateValidation.error || '';
    }
    
    setValidationErrors(errors);
  }, [formData, otherPurpose]);

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleInputChange = (field: keyof LoanApplication) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSelectChange = (field: keyof LoanApplication) => (
    e: SelectChangeEvent<string | number>
  ) => {
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      // If "other" is selected, use the custom purpose
      const finalFormData = {
        ...formData,
        purpose: formData.purpose === 'other' ? otherPurpose : formData.purpose,
        // Use monthlyIncome as monthlyPayment estimate if not set
        monthlyPayment: formData.monthlyIncome > 0 ? formData.monthlyIncome : undefined,
      };
      
      const loan = await apiService.applyForLoan(finalFormData);
      // Show success confirmation
      onSuccess(loan.id);
    } catch (err: unknown) {
      const { message, fieldErrors: apiFieldErrors } = getApiErrorMessage(err, 'Failed to submit loan application');
      setError(message);
      setFieldErrors(apiFieldErrors);
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0: // Basic Information
        const principalValidation = validateLoanAmount(formData.principal);
        const purposeValidation = validateRequired(formData.purpose, 'Purpose');
        const otherPurposeValid = formData.purpose === 'other' ? otherPurpose.trim() !== '' : true;
        return principalValidation.isValid && purposeValidation.isValid && otherPurposeValid && loanStartDate !== '';
      case 1: // Payment Details
        const termValidation = formData.term > 0 && formData.term <= 360;
        return termValidation && paymentDueDay >= 1 && paymentDueDay <= 31;
      case 2: // Interest Rate
        const interestRateValidation = validateInterestRate(formData.interestRate);
        return interestRateValidation.isValid;
      case 3: // Review & Confirm
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0: // Step 1: Basic Information
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Step 1 of 4: Basic Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="What is this loan for?"
                    placeholder="Select or type: Car, House, Education, etc."
                    value={formData.purpose === 'other' ? otherPurpose : formData.purpose}
                    onChange={(e) => {
                      if (formData.purpose !== 'other') {
                        setFormData(prev => ({ ...prev, purpose: e.target.value }));
                      } else {
                        setOtherPurpose(e.target.value);
                      }
                    }}
                    helperText="Select from the dropdown or type your own purpose"
                    error={!!validationErrors.purpose || !!fieldErrors.purpose}
                    required
                  />
                  <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel>Or Select</InputLabel>
                    <Select
                      value={formData.purpose}
                      onChange={handleSelectChange('purpose')}
                      label="Or Select"
                    >
                      <MenuItem value="car loan">Car Loan</MenuItem>
                      <MenuItem value="housing loan">House Loan</MenuItem>
                      <MenuItem value="education">Education</MenuItem>
                      <MenuItem value="medical">Medical</MenuItem>
                      <MenuItem value="vacation">Vacation</MenuItem>
                      <MenuItem value="personal">Personal</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                {(validationErrors.purpose || fieldErrors.purpose) && (
                  <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>
                    {validationErrors.purpose || fieldErrors.purpose}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="How much did you borrow?"
                  type="number"
                  value={formData.principal === 0 ? '' : formData.principal}
                  onChange={handleInputChange('principal')}
                  helperText={validationErrors.principal || fieldErrors.principal || "Enter the total amount you borrowed (the loan amount)"}
                  error={!!validationErrors.principal || !!fieldErrors.principal}
                  required
                  inputProps={{ min: 0.01, step: 0.01 }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="When did you get this loan?"
                  type="date"
                  value={loanStartDate}
                  onChange={(e) => setLoanStartDate(e.target.value)}
                  helperText="Select the date when you received the loan money"
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 1: // Step 2: Payment Details
        // Calculate estimated monthly payment if we have principal, interest rate, and term
        const calculateMonthlyPayment = () => {
          if (formData.principal > 0 && formData.interestRate > 0 && formData.term > 0) {
            const monthlyRate = formData.interestRate / 100 / 12;
            const numerator = monthlyRate * Math.pow(1 + monthlyRate, formData.term);
            const denominator = Math.pow(1 + monthlyRate, formData.term) - 1;
            return formData.principal * (numerator / denominator);
          }
          return 0;
        };
        const estimatedMonthlyPayment = calculateMonthlyPayment();

        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Step 2 of 4: Payment Details
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="How much do you pay each month?"
                  type="number"
                  value={formData.monthlyIncome > 0 ? formData.monthlyIncome : (estimatedMonthlyPayment > 0 ? estimatedMonthlyPayment.toFixed(2) : '')}
                  onChange={(e) => {
                    const value = parseFloat(e.target.value) || 0;
                    setFormData(prev => ({ ...prev, monthlyIncome: value }));
                  }}
                  helperText={estimatedMonthlyPayment > 0 
                    ? `💡 Estimated: $${estimatedMonthlyPayment.toFixed(2)} based on your loan details. You can adjust this if your actual payment is different.`
                    : "Enter your monthly payment amount. This will be calculated automatically after you enter the interest rate."}
                  required
                  inputProps={{ min: 0.01, step: 0.01 }}
                  InputProps={{
                    startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="What day of the month is payment due?"
                  type="number"
                  value={paymentDueDay}
                  onChange={(e) => setPaymentDueDay(parseInt(e.target.value) || 1)}
                  helperText="Enter a number between 1 and 31 (e.g., 15 means payment is due on the 15th of each month)"
                  required
                  inputProps={{ min: 1, max: 31, step: 1 }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="How long will you pay this loan? (in months)"
                  type="number"
                  value={formData.term}
                  onChange={handleInputChange('term')}
                  helperText="Enter the total number of months (e.g., 12 months = 1 year, 60 months = 5 years)"
                  required
                  inputProps={{ min: 1, max: 360, step: 1 }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2: // Step 3: Interest Rate
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Step 3 of 4: Interest Rate
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="What is your interest rate?"
                  type="number"
                  value={formData.interestRate ?? ''}
                  onChange={handleInputChange('interestRate')}
                  helperText={
                    <Box>
                      <Typography variant="body2" component="span">
                        {validationErrors.interestRate || fieldErrors.interestRate || "Enter your annual interest rate as a percentage (e.g., 6 for 6%)"}
                      </Typography>
                      <Box sx={{ mt: 1, p: 1.5, bgcolor: 'info.light', borderRadius: 1, display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                        <Lightbulb sx={{ color: 'info.main', mt: 0.5 }} />
                        <Typography variant="body2" color="info.dark">
                          <strong>💡 Tip:</strong> You can find this on your loan statement or contract. It's usually shown as an annual percentage (e.g., 6% per year).
                        </Typography>
                      </Box>
                    </Box>
                  }
                  error={!!validationErrors.interestRate || !!fieldErrors.interestRate}
                  required
                  inputProps={{ min: 0, max: 50, step: 0.1 }}
                  InputProps={{
                    endAdornment: <Typography sx={{ ml: 1 }}>% per year</Typography>
                  }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 3: // Step 4: Review & Confirm
        return (
          <Box>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Step 4 of 4: Review & Confirm
            </Typography>
            <Paper sx={{ p: 3, bgcolor: 'background.default' }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                Review Your Loan Information:
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Loan Purpose:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formData.purpose === 'other' ? otherPurpose : formData.purpose}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Loan Amount:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    ${formData.principal.toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Payment:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    ${formData.monthlyIncome > 0 ? formData.monthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : 'Not set'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Payment Due Date:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {paymentDueDay}th of each month
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Loan Term:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formData.term} months ({Math.round(formData.term / 12 * 10) / 10} years)
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Interest Rate:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formData.interestRate}% per year
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">
                    Loan Start Date:
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {new Date(loanStartDate).toLocaleDateString()}
                  </Typography>
                </Grid>
              </Grid>
              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  onClick={() => setActiveStep(0)}
                  startIcon={<Edit />}
                >
                  Edit Information
                </Button>
              </Box>
            </Paper>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {renderStepContent(activeStep)}

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
            <Button
              disabled={activeStep === 0}
              onClick={handleBack}
            >
              Back
            </Button>
            <Box>
              <Button onClick={onCancel} sx={{ mr: 1 }}>
                Cancel
              </Button>
              {activeStep === steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  size="large"
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Save Loan'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isStepValid(activeStep)}
                >
                  Next: {steps[activeStep + 1]} →
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default LoanApplicationForm;

