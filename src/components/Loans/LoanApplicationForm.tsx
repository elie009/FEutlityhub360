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
} from '@mui/material';
import { LoanApplication } from '../../types/loan';
import { apiService } from '../../services/api';
import { validateLoanAmount, validateRequired, validateLoanTerm, validateEmploymentStatus, getErrorMessage } from '../../utils/validation';

interface LoanApplicationFormProps {
  onSuccess: (loanId: string) => void;
  onCancel: () => void;
}

const steps = ['Basic Information', 'Financial Details', 'Review & Submit'];

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ onSuccess, onCancel }) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState<LoanApplication>({
    principal: 0,
    purpose: '',
    term: 12,
    monthlyIncome: 0,
    employmentStatus: '',
    additionalInfo: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleNext = () => {
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleChange = (field: keyof LoanApplication) => (
    e: React.ChangeEvent<HTMLInputElement> | any
  ) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setError('');
    setIsLoading(true);

    try {
      const loan = await apiService.applyForLoan(formData);
      onSuccess(loan.id);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to submit loan application'));
    } finally {
      setIsLoading(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 0:
        const principalValidation = validateLoanAmount(formData.principal);
        const purposeValidation = validateRequired(formData.purpose, 'Purpose');
        return principalValidation.isValid && purposeValidation.isValid;
      case 1:
        const incomeValidation = validateRequired(formData.monthlyIncome, 'Monthly Income');
        const employmentValidation = validateEmploymentStatus(formData.employmentStatus);
        return incomeValidation.isValid && employmentValidation.isValid;
      case 2:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Loan Amount"
                type="number"
                value={formData.principal}
                onChange={handleChange('principal')}
                helperText="Enter the amount you wish to borrow"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Purpose of Loan"
                value={formData.purpose}
                onChange={handleChange('purpose')}
                helperText="Describe what you plan to use the loan for"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Loan Term</InputLabel>
                <Select
                  value={formData.term}
                  onChange={handleChange('term')}
                  label="Loan Term"
                >
                  <MenuItem value={6}>6 months</MenuItem>
                  <MenuItem value={12}>12 months</MenuItem>
                  <MenuItem value={24}>24 months</MenuItem>
                  <MenuItem value={36}>36 months</MenuItem>
                  <MenuItem value={48}>48 months</MenuItem>
                  <MenuItem value={60}>60 months</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Monthly Income"
                type="number"
                value={formData.monthlyIncome}
                onChange={handleChange('monthlyIncome')}
                helperText="Your gross monthly income"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Employment Status</InputLabel>
                <Select
                  value={formData.employmentStatus}
                  onChange={handleChange('employmentStatus')}
                  label="Employment Status"
                  required
                >
                  <MenuItem value="employed">Employed</MenuItem>
                  <MenuItem value="self-employed">Self-Employed</MenuItem>
                  <MenuItem value="unemployed">Unemployed</MenuItem>
                  <MenuItem value="retired">Retired</MenuItem>
                  <MenuItem value="student">Student</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Information"
                multiline
                rows={4}
                value={formData.additionalInfo}
                onChange={handleChange('additionalInfo')}
                helperText="Any additional information that might help with your application"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Your Application
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Loan Amount:
                </Typography>
                <Typography variant="h6">
                  ${formData.principal.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Term:
                </Typography>
                <Typography variant="h6">
                  {formData.term} months
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Purpose:
                </Typography>
                <Typography variant="body1">
                  {formData.purpose}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Monthly Income:
                </Typography>
                <Typography variant="body1">
                  ${formData.monthlyIncome.toLocaleString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">
                  Employment:
                </Typography>
                <Typography variant="body1">
                  {formData.employmentStatus}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        );

      default:
        return null;
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Apply for a Loan
      </Typography>
      
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
                >
                  {isLoading ? <CircularProgress size={24} /> : 'Submit Application'}
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!isStepValid(activeStep)}
                >
                  Next
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
