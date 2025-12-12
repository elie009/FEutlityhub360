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
  Avatar,
  Button,
  Alert,
  IconButton,
  Divider,
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Work as WorkIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { OnboardingData } from '../OnboardingWizard';

interface IncomeStepProps {
  onNext: () => void;
  onBack: () => void;
  onDataUpdate: (data: Partial<OnboardingData>) => void;
  data: OnboardingData;
  onComplete: () => void;
}

const IncomeStep: React.FC<IncomeStepProps> = ({
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

  // Parse string with commas back to number (e.g., "30,000" -> 30000)
  const parseFormattedNumber = (value: string): number => {
    const cleanedValue = value.replace(/,/g, '');
    const parsed = parseFloat(cleanedValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Handle amount input change with comma formatting
  const handleAmountChange = (index: number, inputValue: string) => {
    // Remove all non-digit characters except decimal point
    const cleanedValue = inputValue.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = cleanedValue.split('.');
    const sanitizedValue = parts.length > 2 
      ? parts[0] + '.' + parts.slice(1).join('') 
      : cleanedValue;
    const numericValue = parseFloat(sanitizedValue) || 0;
    updateIncomeSource(index, 'amount', numericValue);
  };

  const frequencies = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'bi-weekly', label: 'Bi-weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'others', label: 'Others' },
  ];

  const categories = [
    'Primary',
    'Secondary',
    'Passive',
    'Business',
    'Investment',
    'Freelance',
    'Side Hustle',
    'Other',
  ];

  const addIncomeSource = () => {
    const newIncomeSources = [...data.incomeSources, {
      name: '',
      amount: 0,
      frequency: 'monthly',
      category: 'Other',
      description: '',
      company: '',
    }];
    onDataUpdate({ incomeSources: newIncomeSources });
  };

  const removeIncomeSource = (index: number) => {
    if (data.incomeSources.length > 1) {
      const newIncomeSources = data.incomeSources.filter((_, i) => i !== index);
      onDataUpdate({ incomeSources: newIncomeSources });
    }
  };

  const updateIncomeSource = (index: number, field: string, value: any) => {
    const newIncomeSources = [...data.incomeSources];
    newIncomeSources[index] = {
      ...newIncomeSources[index],
      [field]: value,
    };
    onDataUpdate({ incomeSources: newIncomeSources });
  };

  const calculateMonthlyIncome = () => {
    return data.incomeSources.reduce((total, source) => {
      let monthlyAmount = source.amount;
      switch (source.frequency) {
        case 'weekly':
          monthlyAmount = source.amount * 4.33; // Average weeks per month
          break;
        case 'bi-weekly':
          monthlyAmount = source.amount * 2.17; // Average bi-weeks per month
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
  };

  const handleNext = () => {
    const hasValidIncome = data.incomeSources.some(source => 
      source.name.trim() && source.amount > 0
    );

    if (hasValidIncome) {
      onComplete();
      onNext();
    }
  };

  const canProceed = data.incomeSources.some(source => source.name.trim() && source.amount > 0);
  const totalMonthlyIncome = calculateMonthlyIncome();

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
            bgcolor: 'success.main',
          }}
        >
          <MoneyIcon sx={{ fontSize: 30 }} />
        </Avatar>
        <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
          Income Sources
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Add your income sources to get accurate financial insights and budgeting recommendations.
        </Typography>
      </Box>

      {/* Income Sources */}
      <Box sx={{ maxWidth: 800, mx: 'auto' }}>
        {data.incomeSources.map((source, index) => (
          <Card key={index} sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon color="primary" />
                  Income Source #{index + 1}
                </Typography>
                {data.incomeSources.length > 1 && (
                  <IconButton
                    onClick={() => removeIncomeSource(index)}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Income Name"
                    value={source.name}
                    onChange={(e) => updateIncomeSource(index, 'name', e.target.value)}
                    placeholder="e.g., Salary, Freelance, Investment"
                    helperText="What do you call this income source?"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Amount"
                    type="text"
                    value={formatNumberWithCommas(source.amount)}
                    onChange={(e) => handleAmountChange(index, e.target.value)}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    helperText="How much do you earn?"
                    placeholder="e.g., 30,000"
                  />
                </Grid>
                
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      value={source.frequency}
                      onChange={(e) => updateIncomeSource(index, 'frequency', e.target.value)}
                      label="Frequency"
                    >
                      {frequencies.map((freq) => (
                        <MenuItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={source.category}
                      onChange={(e) => updateIncomeSource(index, 'category', e.target.value)}
                      label="Category"
                    >
                      {categories.map((category) => (
                        <MenuItem key={category} value={category}>
                          {category}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company/Organization"
                    value={source.company}
                    onChange={(e) => updateIncomeSource(index, 'company', e.target.value)}
                    placeholder="e.g., Tech Corp, Self-employed"
                  />
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Description (Optional)"
                    value={source.description}
                    onChange={(e) => updateIncomeSource(index, 'description', e.target.value)}
                    placeholder="Additional details about this income"
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ))}

        {/* Add Income Source Button */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addIncomeSource}
            sx={{ borderStyle: 'dashed' }}
          >
            Add Another Income Source
          </Button>
        </Box>

        {/* Income Summary */}
        {totalMonthlyIncome > 0 && (
          <Card sx={{ bgcolor: 'success.50', border: '1px solid', borderColor: 'success.200' }}>
            <CardContent sx={{ textAlign: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
                <TrendingUpIcon color="success" />
                <Typography variant="h6" color="success.main" sx={{ fontWeight: 'bold' }}>
                  Total Monthly Income
                </Typography>
              </Box>
              <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                {totalMonthlyIncome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Based on {data.incomeSources.length} income source{data.incomeSources.length !== 1 ? 's' : ''}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Box>

      {/* Help Text */}
      <Alert severity="info" sx={{ mt: 4, maxWidth: 800, mx: 'auto' }}>
        <Typography variant="body2">
          <strong>Tip:</strong> Include all regular income sources like salary, freelance work, 
          investments, or side businesses. This helps us create accurate budgets and financial projections.
        </Typography>
      </Alert>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4, maxWidth: 800, mx: 'auto' }}>
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

export default IncomeStep;
