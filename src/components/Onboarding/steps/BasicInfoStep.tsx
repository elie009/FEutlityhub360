import React from 'react';
import {
  Box,
  Typography,
  TextField,
  Grid,
  Card,
  CardContent,
  Avatar,
  Button,
  Alert,
} from '@mui/material';
import {
  Person as PersonIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { OnboardingData } from '../OnboardingWizard';

interface BasicInfoStepProps {
  onNext: () => void;
  onBack: () => void;
  onDataUpdate: (data: Partial<OnboardingData>) => void;
  data: OnboardingData;
  onComplete: () => void;
  userEmail?: string;
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  onNext,
  onBack,
  onDataUpdate,
  data,
  onComplete,
  userEmail,
}) => {
  const [errors, setErrors] = React.useState<{[key: string]: string}>({});

  const validateField = (field: string, value: string) => {
    switch (field) {
      case 'firstName':
        return value.trim().length >= 2 ? '' : 'First name must be at least 2 characters';
      case 'lastName':
        return value.trim().length >= 2 ? '' : 'Last name must be at least 2 characters';
      case 'phone':
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return value.trim().length >= 10 && phoneRegex.test(value.replace(/[\s\-\(\)]/g, '')) 
          ? '' : 'Please enter a valid phone number';
      default:
        return '';
    }
  };

  const handleFieldChange = (field: keyof OnboardingData, value: string) => {
    const error = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: error }));
    
    onDataUpdate({ [field]: value });
  };

  const handleNext = () => {
    const newErrors: {[key: string]: string} = {};
    
    // Validate all required fields
    const firstNameError = validateField('firstName', data.firstName);
    const lastNameError = validateField('lastName', data.lastName);
    const phoneError = validateField('phone', data.phone);

    if (firstNameError) newErrors.firstName = firstNameError;
    if (lastNameError) newErrors.lastName = lastNameError;
    if (phoneError) newErrors.phone = phoneError;

    setErrors(newErrors);

    // If no errors, proceed to next step
    if (Object.keys(newErrors).length === 0) {
      onComplete();
      onNext();
    }
  };

  const hasErrors = Object.values(errors).some(error => error !== '');
  const canProceed = data.firstName.trim() && data.lastName.trim() && data.phone.trim() && !hasErrors;

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
            bgcolor: 'primary.main',
          }}
        >
          <PersonIcon sx={{ fontSize: 30 }} />
        </Avatar>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Basic Information
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Let's start with your basic details. This helps us personalize your experience.
        </Typography>
      </Box>

      {/* Form */}
      <Card sx={{ maxWidth: 600, mx: 'auto' }}>
        <CardContent sx={{ p: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="First Name"
                value={data.firstName}
                onChange={(e) => handleFieldChange('firstName', e.target.value)}
                error={!!errors.firstName}
                helperText={errors.firstName || 'Your first name'}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Last Name"
                value={data.lastName}
                onChange={(e) => handleFieldChange('lastName', e.target.value)}
                error={!!errors.lastName}
                helperText={errors.lastName || 'Your last name'}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={data.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                error={!!errors.phone}
                helperText={errors.phone || 'Your phone number for notifications'}
                placeholder="+1 (555) 123-4567"
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ mr: 1, color: 'action.active' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email Address"
                value={userEmail || ''}
                disabled
                helperText="This is your registered email address"
                InputProps={{
                  startAdornment: <EmailIcon sx={{ mr: 1, color: 'action.disabled' }} />,
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'grey.100',
                  },
                }}
              />
            </Grid>
          </Grid>

          {/* Validation Summary */}
          {hasErrors && (
            <Alert severity="error" sx={{ mt: 3 }}>
              Please fix the errors above before continuing.
            </Alert>
          )}

          {/* Privacy Notice */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Privacy:</strong> Your personal information is encrypted and stored securely. 
              We only use this data to provide you with personalized financial insights.
            </Typography>
          </Alert>
        </CardContent>
      </Card>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, maxWidth: 600, mx: 'auto' }}>
        <Button
          onClick={onBack}
          variant="outlined"
          disabled={!onBack}
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

export default BasicInfoStep;
