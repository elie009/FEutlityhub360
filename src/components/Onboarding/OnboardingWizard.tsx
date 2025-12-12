import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  IconButton,
  Card,
  CardContent,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  ArrowForward as ArrowForwardIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';

// Import step components
import WelcomeStep from './steps/WelcomeStep';
import BasicInfoStep from './steps/BasicInfoStep';
import EmploymentStep from './steps/EmploymentStep';
import IncomeStep from './steps/IncomeStep';
import GoalsStep from './steps/GoalsStep';
import CompletionStep from './steps/CompletionStep';

export interface OnboardingData {
  // Basic Info
  firstName: string;
  lastName: string;
  phone: string;
  
  // Employment
  isUnemployed: boolean;
  jobTitle: string;
  company: string;
  employmentType: string;
  industry: string;
  location: string;
  country: string;
  
  // Income Sources
  incomeSources: Array<{
    name: string;
    amount: number;
    frequency: string;
    category: string;
    description: string;
    company: string;
  }>;
  
  // Financial Goals
  monthlySavingsGoal: number;
  monthlyInvestmentGoal: number;
  monthlyEmergencyFundGoal: number;
  taxRate: number;
  monthlyTaxDeductions: number;
  notes: string;
}

const steps = [
  { id: 'welcome', label: 'Welcome', description: 'Get started with UtilityHub360' },
  { id: 'basic', label: 'Basic Info', description: 'Tell us about yourself' },
  { id: 'employment', label: 'Employment', description: 'Work and career details' },
  { id: 'income', label: 'Income', description: 'Income sources and amounts' },
  { id: 'goals', label: 'Financial Goals', description: 'Set your financial targets' },
  { id: 'completion', label: 'Complete', description: 'You\'re all set!' },
];

interface OnboardingWizardProps {
  open: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  open,
  onComplete,
  onSkip,
}) => {
  const { user, updateUserProfile } = useAuth();
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    firstName: '',
    lastName: '',
    phone: user?.phone || '',
    isUnemployed: false,
    jobTitle: '',
    company: '',
    employmentType: '',
    industry: '',
    location: '',
    country: '',
    incomeSources: [{
      name: '',
      amount: 0,
      frequency: 'monthly',
      category: 'Primary',
      description: '',
      company: '',
    }],
    monthlySavingsGoal: 0,
    monthlyInvestmentGoal: 0,
    monthlyEmergencyFundGoal: 0,
    taxRate: 0,
    monthlyTaxDeductions: 0,
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Initialize with user data if available
  useEffect(() => {
    if (user && open) {
      setOnboardingData(prev => ({
        ...prev,
        firstName: user.name?.split(' ')[0] || '',
        lastName: user.name?.split(' ').slice(1).join(' ') || '',
        phone: user.phone || '',
      }));
    }
  }, [user, open]);

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(prev => prev - 1);
    }
  };

  const handleStepComplete = (stepIndex: number) => {
    setCompletedSteps(prev => new Set([...Array.from(prev), stepIndex]));
  };

  const handleDataUpdate = (stepData: Partial<OnboardingData>) => {
    setOnboardingData(prev => ({ ...prev, ...stepData }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Create user profile with all onboarding data
      const profileData = {
        isUnemployed: onboardingData.isUnemployed,
        jobTitle: onboardingData.jobTitle,
        company: onboardingData.company,
        employmentType: onboardingData.employmentType,
        industry: onboardingData.industry,
        location: onboardingData.location,
        country: onboardingData.country,
        monthlySavingsGoal: onboardingData.monthlySavingsGoal,
        monthlyInvestmentGoal: onboardingData.monthlyInvestmentGoal,
        monthlyEmergencyFundGoal: onboardingData.monthlyEmergencyFundGoal,
        taxRate: onboardingData.taxRate,
        monthlyTaxDeductions: onboardingData.monthlyTaxDeductions,
        notes: onboardingData.notes,
        incomeSources: onboardingData.incomeSources,
      };

      const response = await apiService.createUserProfile(profileData);
      
      if (response && response.id) {
        // Update user profile in context
        const newProfile = await apiService.getUserProfile();
        if (newProfile && newProfile.id) {
          updateUserProfile(newProfile);
        }
        onComplete();
      } else {
        setError('Failed to create profile. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to complete setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = () => {
    onSkip();
  };

  const isStepCompleted = (stepIndex: number) => {
    return completedSteps.has(stepIndex);
  };

  const canProceed = (stepIndex: number) => {
    switch (stepIndex) {
      case 0: // Welcome
        return true;
      case 1: // Basic Info
        return onboardingData.firstName && onboardingData.lastName;
      case 2: // Employment
        return onboardingData.isUnemployed || (onboardingData.jobTitle && onboardingData.company);
      case 3: // Income
        return onboardingData.incomeSources.some(source => source.name && source.amount > 0);
      case 4: // Goals
        return true; // Goals are optional
      case 5: // Completion
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    const currentStep = steps[activeStep];
    
    switch (currentStep.id) {
      case 'welcome':
        return (
          <WelcomeStep
            onNext={handleNext}
            onDataUpdate={handleDataUpdate}
            data={onboardingData}
          />
        );
      case 'basic':
        return (
          <BasicInfoStep
            onNext={handleNext}
            onBack={handleBack}
            onDataUpdate={handleDataUpdate}
            data={onboardingData}
            onComplete={() => handleStepComplete(activeStep)}
            userEmail={user?.email}
          />
        );
      case 'employment':
        return (
          <EmploymentStep
            onNext={handleNext}
            onBack={handleBack}
            onDataUpdate={handleDataUpdate}
            data={onboardingData}
            onComplete={() => handleStepComplete(activeStep)}
          />
        );
      case 'income':
        return (
          <IncomeStep
            onNext={handleNext}
            onBack={handleBack}
            onDataUpdate={handleDataUpdate}
            data={onboardingData}
            onComplete={() => handleStepComplete(activeStep)}
          />
        );
      case 'goals':
        return (
          <GoalsStep
            onNext={handleNext}
            onBack={handleBack}
            onDataUpdate={handleDataUpdate}
            data={onboardingData}
            onComplete={() => handleStepComplete(activeStep)}
          />
        );
      case 'completion':
        return (
          <CompletionStep
            onComplete={handleComplete}
            onBack={handleBack}
            data={onboardingData}
            isLoading={isLoading}
          />
        );
      default:
        return null;
    }
  };

  const progress = ((activeStep + 1) / steps.length) * 100;

  return (
    <Dialog
      open={open}
      onClose={handleSkip}
      maxWidth="md"
      fullWidth
      fullScreen
      disableEscapeKeyDown={activeStep > 0} // Only allow escape on first step
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" component="div">
              Welcome to UtilityHub360
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Step {activeStep + 1} of {steps.length}
            </Typography>
          </Box>
          <IconButton
            onClick={handleSkip}
            size="small"
            sx={{ 
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' }
            }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
        
        {/* Progress Bar */}
        <Box sx={{ mt: 2 }}>
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 4,
              backgroundColor: 'grey.200',
              '& .MuiLinearProgress-bar': {
                borderRadius: 4,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
              }
            }} 
          />
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            {Math.round(progress)}% Complete
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        {/* Stepper */}
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'divider' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((step, index) => (
              <Step key={step.id}>
                <StepLabel
                  StepIconComponent={({ active, completed }) => (
                    <Box
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: completed 
                          ? 'success.main' 
                          : active 
                            ? 'primary.main' 
                            : 'grey.300',
                        color: completed || active ? 'white' : 'grey.600',
                        border: completed ? 'none' : '2px solid',
                        borderColor: active ? 'primary.main' : 'grey.300',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {completed ? (
                        <CheckCircleIcon fontSize="small" />
                      ) : (
                        <Typography variant="body2" fontWeight="bold">
                          {index + 1}
                        </Typography>
                      )}
                    </Box>
                  )}
                  sx={{
                    '& .MuiStepLabel-label': {
                      fontSize: '0.875rem',
                      fontWeight: activeStep === index ? 600 : 400,
                    },
                    '& .MuiStepLabel-labelContainer': {
                      mt: 1,
                    },
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={activeStep === index ? 600 : 400}>
                      {step.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {step.description}
                    </Typography>
                  </Box>
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Error Display */}
        {error && (
          <Box sx={{ p: 3 }}>
            <Alert severity="error" onClose={() => setError('')}>
              {error}
            </Alert>
          </Box>
        )}

        {/* Step Content */}
        <Box sx={{ minHeight: 400, p: 3 }}>
          {renderStepContent()}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3, borderTop: '1px solid', borderColor: 'divider' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Box>
            {activeStep > 0 && (
              <Button
                onClick={handleBack}
                startIcon={<ArrowBackIcon />}
                disabled={isLoading}
                sx={{ mr: 1 }}
              >
                Back
              </Button>
            )}
            <Button
              onClick={handleSkip}
              variant="text"
              color="inherit"
              disabled={isLoading}
            >
              Skip Setup
            </Button>
          </Box>
          
          <Box>
            {activeStep < steps.length - 1 && (
              <Button
                onClick={handleNext}
                endIcon={<ArrowForwardIcon />}
                variant="contained"
                disabled={!canProceed(activeStep) || isLoading}
                sx={{
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                  },
                }}
              >
                {activeStep === steps.length - 2 ? 'Complete Setup' : 'Next'}
              </Button>
            )}
          </Box>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default OnboardingWizard;
