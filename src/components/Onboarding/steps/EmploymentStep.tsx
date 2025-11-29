import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Avatar,
  Button,
  Alert,
} from '@mui/material';
import {
  Work as WorkIcon,
  Business as BusinessIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { OnboardingData } from '../OnboardingWizard';

interface EmploymentStepProps {
  onNext: () => void;
  onBack: () => void;
  onDataUpdate: (data: Partial<OnboardingData>) => void;
  data: OnboardingData;
  onComplete: () => void;
}

const EmploymentStep: React.FC<EmploymentStepProps> = ({
  onNext,
  onBack,
  onDataUpdate,
  data,
  onComplete,
}) => {
  const [errors, setErrors] = React.useState<{[key: string]: string}>({});

  const employmentTypes = [
    'Full-time',
    'Part-time',
    'Contract',
    'Freelance',
    'Self-employed',
    'Intern',
    'Temporary',
  ];

  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Retail',
    'Government',
    'Non-profit',
    'Real Estate',
    'Consulting',
    'Other',
  ];

  const handleUnemployedChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isUnemployed = event.target.checked;
    onDataUpdate({
      isUnemployed,
      // Clear employment fields when unemployed
      ...(isUnemployed ? {
        jobTitle: '',
        company: '',
        employmentType: '',
        industry: '',
        location: '',
      } : {}),
    });
  };

  const handleFieldChange = (field: keyof OnboardingData, value: string | boolean) => {
    onDataUpdate({ [field]: value });
    
    // Clear error when user starts typing
    if (typeof value === 'string' && errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleNext = () => {
    const newErrors: {[key: string]: string} = {};

    // Validate employment fields only if not unemployed
    if (!data.isUnemployed) {
      if (!data.jobTitle.trim()) {
        newErrors.jobTitle = 'Job title is required';
      }
      if (!data.company.trim()) {
        newErrors.company = 'Company name is required';
      }
      if (!data.employmentType) {
        newErrors.employmentType = 'Employment type is required';
      }
    }

    setErrors(newErrors);

    // If no errors, proceed to next step
    if (Object.keys(newErrors).length === 0) {
      onComplete();
      onNext();
    }
  };

  const hasErrors = Object.values(errors).some(error => error !== '');
  const canProceed = data.isUnemployed || (data.jobTitle.trim() && data.company.trim() && data.employmentType);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar
          sx={{
            width: 60,
            height: 60,
            mx: 'auto',
            mb: 2,
            bgcolor: 'secondary.main',
          }}
        >
          <WorkIcon sx={{ fontSize: 30 }} />
        </Avatar>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Employment Information
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Tell us about your work situation. This helps us provide better financial insights.
        </Typography>
      </Box>

      {/* Form */}
      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          {/* Unemployed Checkbox */}
          <Box sx={{ mb: 3 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={data.isUnemployed}
                  onChange={handleUnemployedChange}
                  color="primary"
                />
              }
              label={
                <Box>
                  <Typography variant="body1" sx={{ fontWeight: 500 }}>
                    I am currently unemployed
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Skip employment details and focus on other income sources
                  </Typography>
                </Box>
              }
            />
          </Box>

          {!data.isUnemployed && (
            <>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    value={data.jobTitle}
                    onChange={(e) => handleFieldChange('jobTitle', e.target.value)}
                    error={!!errors.jobTitle}
                    helperText={errors.jobTitle || 'Your current job title'}
                    InputProps={{
                      startAdornment: <WorkIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                    placeholder="e.g., Software Engineer"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    value={data.company}
                    onChange={(e) => handleFieldChange('company', e.target.value)}
                    error={!!errors.company}
                    helperText={errors.company || 'Your current company'}
                    InputProps={{
                      startAdornment: <BusinessIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                    placeholder="e.g., Tech Corp Inc."
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth error={!!errors.employmentType}>
                    <InputLabel>Employment Type</InputLabel>
                    <Select
                      value={data.employmentType}
                      onChange={(e) => handleFieldChange('employmentType', e.target.value)}
                      label="Employment Type"
                    >
                      {employmentTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.employmentType && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {errors.employmentType}
                      </Typography>
                    )}
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Industry</InputLabel>
                    <Select
                      value={data.industry}
                      onChange={(e) => handleFieldChange('industry', e.target.value)}
                      label="Industry"
                    >
                      {industries.map((industry) => (
                        <MenuItem key={industry} value={industry}>
                          {industry}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={data.location}
                    onChange={(e) => handleFieldChange('location', e.target.value)}
                    helperText="City, State (optional)"
                    InputProps={{
                      startAdornment: <LocationIcon sx={{ mr: 1, color: 'action.active' }} />,
                    }}
                    placeholder="e.g., San Francisco, CA"
                  />
                </Grid>
              </Grid>
            </>
          )}

          {/* Validation Summary */}
          {hasErrors && (
            <Alert severity="error" sx={{ mt: 3 }}>
              Please fill in all required employment fields.
            </Alert>
          )}

          {/* Help Text */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Optional Information:</strong> Employment details help us provide more accurate 
              financial recommendations and tax calculations. You can always update this information later.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, maxWidth: 600, mx: 'auto' }}>
        <Button
          onClick={onBack}
          variant="outlined"
        >
          Back
        </Button>
        
        <Button
          onClick={handleNext}
          variant="contained"
          disabled={!canProceed}
          sx={{
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
            },
          }}
        >
          Continue
        </Button>
      </Box>
    </Box>
  );
};

export default EmploymentStep;
