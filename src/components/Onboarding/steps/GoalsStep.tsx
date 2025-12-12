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
  InputAdornment,
  Slider,
  Chip,
  Divider,
} from '@mui/material';
import {
  Flag as FlagIcon,
  Savings as SavingsIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Calculate as CalculateIcon,
} from '@mui/icons-material';
import { OnboardingData } from '../OnboardingWizard';

interface GoalsStepProps {
  onNext: () => void;
  onBack: () => void;
  onDataUpdate: (data: Partial<OnboardingData>) => void;
  data: OnboardingData;
  onComplete: () => void;
}

const GoalsStep: React.FC<GoalsStepProps> = ({
  onNext,
  onBack,
  onDataUpdate,
  data,
  onComplete,
}) => {
  // Format number with commas (e.g., 30000 -> "30,000")
  const formatNumberWithCommas = (value: number): string => {
    if (value === 0) return '';
    return value.toLocaleString('en-US');
  };

  // Handle amount input change with comma formatting
  const handleAmountInputChange = (field: keyof OnboardingData, inputValue: string) => {
    // Remove all non-digit characters except decimal point
    const cleanedValue = inputValue.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleanedValue.split('.');
    const sanitizedValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('') 
      : cleanedValue;
    const numericValue = parseFloat(sanitizedValue) || 0;
    handleFieldChange(field, numericValue);
  };

  const [sliderValues, setSliderValues] = React.useState({
    savings: data.monthlySavingsGoal,
    investment: data.monthlyInvestmentGoal,
    emergency: data.monthlyEmergencyFundGoal,
  });

  const handleSliderChange = (goal: string, value: number) => {
    setSliderValues(prev => ({ ...prev, [goal]: value }));
    onDataUpdate({ [`monthly${goal.charAt(0).toUpperCase() + goal.slice(1)}Goal`]: value });
  };

  const handleFieldChange = (field: keyof OnboardingData, value: number | string) => {
    onDataUpdate({ [field]: value });
    if (typeof value === 'number') {
      if (field.includes('Savings')) setSliderValues(prev => ({ ...prev, savings: value }));
      if (field.includes('Investment')) setSliderValues(prev => ({ ...prev, investment: value }));
      if (field.includes('Emergency')) setSliderValues(prev => ({ ...prev, emergency: value }));
    }
  };

  const handleNext = () => {
    onComplete();
    onNext();
  };

  const calculateRecommendedSavings = () => {
    // Simple recommendation: 20% of monthly income
    const totalIncome = data.incomeSources.reduce((total, source) => {
      let monthlyAmount = source.amount;
      switch (source.frequency) {
        case 'weekly':
          monthlyAmount = source.amount * 4.33;
          break;
        case 'bi-weekly':
          monthlyAmount = source.amount * 2.17;
          break;
        case 'monthly':
          monthlyAmount = source.amount;
          break;
        case 'quarterly':
          monthlyAmount = source.amount / 3;
          break;
        case 'yearly':
          monthlyAmount = source.amount / 12;
          break;
        default:
          monthlyAmount = source.amount;
      }
      return total + monthlyAmount;
    }, 0);
    
    return Math.round(totalIncome * 0.2);
  };

  const recommendedSavings = calculateRecommendedSavings();
  const totalGoals = data.monthlySavingsGoal + data.monthlyInvestmentGoal + data.monthlyEmergencyFundGoal;

  const getGoalStatus = (goal: number) => {
    if (goal === 0) return { status: 'Not Set', color: 'default' as const };
    if (goal < recommendedSavings * 0.5) return { status: 'Getting Started', color: 'warning' as const };
    if (goal < recommendedSavings) return { status: 'Good Progress', color: 'info' as const };
    return { status: 'Excellent!', color: 'success' as const };
  };

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
            bgcolor: 'info.main',
          }}
        >
          <FlagIcon sx={{ fontSize: 30 }} />
        </Avatar>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Financial Goals
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Set your monthly financial targets. These goals help us create personalized recommendations.
        </Typography>
      </Box>

      {/* Goals Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Savings Goal */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', border: '2px solid', borderColor: 'success.200' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SavingsIcon sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Monthly Savings
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Regular savings for future goals
              </Typography>
              
              <TextField
                fullWidth
                type="text"
                value={formatNumberWithCommas(data.monthlySavingsGoal)}
                onChange={(e) => handleAmountInputChange('monthlySavingsGoal', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                placeholder="e.g., 1,000"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ mb: 2 }}>
                <Slider
                  value={sliderValues.savings}
                  onChange={(_, value) => handleSliderChange('savings', value as number)}
                  min={0}
                  max={recommendedSavings * 2}
                  step={50}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `$${value}`}
                  sx={{ color: 'success.main' }}
                />
              </Box>
              
              <Chip 
                label={getGoalStatus(data.monthlySavingsGoal).status}
                color={getGoalStatus(data.monthlySavingsGoal).color}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Investment Goal */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', border: '2px solid', borderColor: 'primary.200' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Monthly Investment
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Building wealth for the future
              </Typography>
              
              <TextField
                fullWidth
                type="text"
                value={formatNumberWithCommas(data.monthlyInvestmentGoal)}
                onChange={(e) => handleAmountInputChange('monthlyInvestmentGoal', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                placeholder="e.g., 500"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ mb: 2 }}>
                <Slider
                  value={sliderValues.investment}
                  onChange={(_, value) => handleSliderChange('investment', value as number)}
                  min={0}
                  max={recommendedSavings * 2}
                  step={50}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `$${value}`}
                  sx={{ color: 'primary.main' }}
                />
              </Box>
              
              <Chip 
                label={getGoalStatus(data.monthlyInvestmentGoal).status}
                color={getGoalStatus(data.monthlyInvestmentGoal).color}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Emergency Fund Goal */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%', border: '2px solid', borderColor: 'warning.200' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <SecurityIcon sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Emergency Fund
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Safety net for unexpected expenses
              </Typography>
              
              <TextField
                fullWidth
                type="text"
                value={formatNumberWithCommas(data.monthlyEmergencyFundGoal)}
                onChange={(e) => handleAmountInputChange('monthlyEmergencyFundGoal', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                placeholder="e.g., 500"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ mb: 2 }}>
                <Slider
                  value={sliderValues.emergency}
                  onChange={(_, value) => handleSliderChange('emergency', value as number)}
                  min={0}
                  max={recommendedSavings * 2}
                  step={50}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `$${value}`}
                  sx={{ color: 'warning.main' }}
                />
              </Box>
              
              <Chip 
                label={getGoalStatus(data.monthlyEmergencyFundGoal).status}
                color={getGoalStatus(data.monthlyEmergencyFundGoal).color}
                size="small"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Goals Summary */}
      <Card sx={{ bgcolor: 'grey.50', mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <CalculateIcon color="primary" />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Goals Summary
            </Typography>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {totalGoals.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Monthly Goals
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                  {recommendedSavings.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Recommended Amount
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" color={totalGoals >= recommendedSavings ? 'success.main' : 'warning.main'} sx={{ fontWeight: 'bold' }}>
                  {Math.round((totalGoals / recommendedSavings) * 100)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  of Recommendation
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Additional Settings */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            Additional Settings (Optional)
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tax Rate (%)"
                type="number"
                value={data.taxRate}
                onChange={(e) => handleFieldChange('taxRate', parseFloat(e.target.value) || 0)}
                helperText="Your estimated tax rate for calculations"
                inputProps={{ min: 0, max: 50, step: 0.1 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Tax Deductions"
                type="text"
                value={formatNumberWithCommas(data.monthlyTaxDeductions)}
                onChange={(e) => handleAmountInputChange('monthlyTaxDeductions', e.target.value)}
                InputProps={{
                  startAdornment: <InputAdornment position="start"></InputAdornment>,
                }}
                placeholder="e.g., 200"
                helperText="Pre-tax deductions from your paycheck"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Additional Notes"
                multiline
                rows={3}
                value={data.notes}
                onChange={(e) => handleFieldChange('notes', e.target.value)}
                placeholder="Any additional information about your financial goals or situation..."
              />
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Help Text */}
      <Alert severity="info">
        <Typography variant="body2">
          <strong>Financial Planning Tip:</strong> Aim to save at least 20% of your monthly income. 
          These goals are flexible and can be adjusted anytime in your settings.
        </Typography>
      </Alert>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        <Button
          onClick={onBack}
          variant="outlined"
        >
          Back
        </Button>
        
        <Button
          onClick={handleNext}
          variant="contained"
          sx={{
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
            },
          }}
        >
          Continue to Review
        </Button>
      </Box>
    </Box>
  );
};

export default GoalsStep;
