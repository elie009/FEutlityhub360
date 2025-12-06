import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  IconButton,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/api';

interface IncomeSource {
  name: string;
  amount: number;
  frequency: string;
  category: string;
  currency: string;
  description: string;
  company: string;
}

interface ProfileFormData {
  jobTitle: string;
  company: string;
  employmentType: string;
  monthlySavingsGoal: number;
  monthlyInvestmentGoal: number;
  monthlyEmergencyFundGoal: number;
  taxRate: number;
  monthlyTaxDeductions: number;
  industry: string;
  location: string;
  country: string;
  notes: string;
  incomeSources: IncomeSource[];
}

const ProfileSetup: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<ProfileFormData>({
    jobTitle: '',
    company: '',
    employmentType: '',
    monthlySavingsGoal: 0,
    monthlyInvestmentGoal: 0,
    monthlyEmergencyFundGoal: 0,
    taxRate: 0,
    monthlyTaxDeductions: 0,
    industry: '',
    location: '',
    country: '',
    notes: '',
    incomeSources: [
      {
        name: '',
        amount: 0,
        frequency: 'monthly',
        category: 'Primary',
        currency: 'USD',
        description: '',
        company: '',
      },
    ],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'others', label: 'Others' },
  ];

  const categoryOptions = [
    { value: 'Primary', label: 'Primary' },
    { value: 'Passive', label: 'Passive' },
    { value: 'Business', label: 'Business' },
    { value: 'Side hustle', label: 'Side hustle' },
    { value: 'Investment', label: 'Investment' },
    { value: 'Dividend', label: 'Dividend' },
    { value: 'Interest', label: 'Interest' },
    { value: 'other', label: 'Other' },
  ];

  const employmentTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'self-employed', label: 'Self-employed' },
  ];

  useEffect(() => {
    // Check if user came from registration
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [location.state]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleSelectChange = (e: any) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (error) setError(null);
  };

  const handleIncomeSourceChange = (index: number, field: keyof IncomeSource, value: any) => {
    setFormData(prev => ({
      ...prev,
      incomeSources: prev.incomeSources.map((source, i) =>
        i === index ? { ...source, [field]: value } : source
      ),
    }));
  };

  const addIncomeSource = () => {
    setFormData(prev => ({
      ...prev,
      incomeSources: [
        ...prev.incomeSources,
        {
          name: '',
          amount: 0,
          frequency: 'monthly',
          category: 'Primary',
          currency: 'USD',
          description: '',
          company: '',
        },
      ],
    }));
  };

  const removeIncomeSource = (index: number) => {
    if (formData.incomeSources.length > 1) {
      setFormData(prev => ({
        ...prev,
        incomeSources: prev.incomeSources.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = (): string | null => {
    if (!formData.jobTitle.trim()) {
      return 'Job title is required';
    }
    if (!formData.company.trim()) {
      return 'Company is required';
    }
    if (!formData.employmentType) {
      return 'Employment type is required';
    }
    if (formData.incomeSources.some(source => !source.name.trim())) {
      return 'All income sources must have a name';
    }
    if (formData.incomeSources.some(source => source.amount <= 0)) {
      return 'All income sources must have a positive amount';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await apiService.createUserProfile(formData);
      setSuccessMessage('Profile created successfully! Redirecting to dashboard...');
      
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom align="center">
            Complete Your Profile
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Set up your financial profile to get personalized insights and recommendations
          </Typography>

          {successMessage && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            {/* Employment Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <WorkIcon />
                  Employment Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="jobTitle"
                      label="Job Title"
                      name="jobTitle"
                      value={formData.jobTitle}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="company"
                      label="Company"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required>
                      <InputLabel>Employment Type</InputLabel>
                      <Select
                        name="employmentType"
                        value={formData.employmentType}
                        label="Employment Type"
                        onChange={handleSelectChange}
                      >
                        {employmentTypes.map((type) => (
                          <MenuItem key={type.value} value={type.value}>
                            {type.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="industry-label">Industry</InputLabel>
                      <Select
                        labelId="industry-label"
                        id="industry"
                        name="industry"
                        value={formData.industry}
                        onChange={handleSelectChange}
                        label="Industry"
                      >
                        <MenuItem value="Technology">Technology</MenuItem>
                        <MenuItem value="Healthcare">Healthcare</MenuItem>
                        <MenuItem value="Finance">Finance</MenuItem>
                        <MenuItem value="Education">Education</MenuItem>
                        <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                        <MenuItem value="Retail">Retail</MenuItem>
                        <MenuItem value="Government">Government</MenuItem>
                        <MenuItem value="Non-profit">Non-profit</MenuItem>
                        <MenuItem value="Real Estate">Real Estate</MenuItem>
                        <MenuItem value="Consulting">Consulting</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel id="country-label">Country</InputLabel>
                      <Select
                        labelId="country-label"
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleSelectChange}
                        label="Country"
                      >
                        <MenuItem value="United States">United States</MenuItem>
                        <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                        <MenuItem value="Canada">Canada</MenuItem>
                        <MenuItem value="Australia">Australia</MenuItem>
                        <MenuItem value="Germany">Germany</MenuItem>
                        <MenuItem value="France">France</MenuItem>
                        <MenuItem value="Italy">Italy</MenuItem>
                        <MenuItem value="Spain">Spain</MenuItem>
                        <MenuItem value="Netherlands">Netherlands</MenuItem>
                        <MenuItem value="Belgium">Belgium</MenuItem>
                        <MenuItem value="Switzerland">Switzerland</MenuItem>
                        <MenuItem value="Sweden">Sweden</MenuItem>
                        <MenuItem value="Norway">Norway</MenuItem>
                        <MenuItem value="Denmark">Denmark</MenuItem>
                        <MenuItem value="Finland">Finland</MenuItem>
                        <MenuItem value="Poland">Poland</MenuItem>
                        <MenuItem value="Portugal">Portugal</MenuItem>
                        <MenuItem value="Ireland">Ireland</MenuItem>
                        <MenuItem value="Austria">Austria</MenuItem>
                        <MenuItem value="Greece">Greece</MenuItem>
                        <MenuItem value="Japan">Japan</MenuItem>
                        <MenuItem value="South Korea">South Korea</MenuItem>
                        <MenuItem value="China">China</MenuItem>
                        <MenuItem value="India">India</MenuItem>
                        <MenuItem value="Singapore">Singapore</MenuItem>
                        <MenuItem value="Malaysia">Malaysia</MenuItem>
                        <MenuItem value="Thailand">Thailand</MenuItem>
                        <MenuItem value="Philippines">Philippines</MenuItem>
                        <MenuItem value="Indonesia">Indonesia</MenuItem>
                        <MenuItem value="Vietnam">Vietnam</MenuItem>
                        <MenuItem value="Brazil">Brazil</MenuItem>
                        <MenuItem value="Mexico">Mexico</MenuItem>
                        <MenuItem value="Argentina">Argentina</MenuItem>
                        <MenuItem value="Chile">Chile</MenuItem>
                        <MenuItem value="Colombia">Colombia</MenuItem>
                        <MenuItem value="South Africa">South Africa</MenuItem>
                        <MenuItem value="Egypt">Egypt</MenuItem>
                        <MenuItem value="Nigeria">Nigeria</MenuItem>
                        <MenuItem value="Kenya">Kenya</MenuItem>
                        <MenuItem value="United Arab Emirates">United Arab Emirates</MenuItem>
                        <MenuItem value="Saudi Arabia">Saudi Arabia</MenuItem>
                        <MenuItem value="Israel">Israel</MenuItem>
                        <MenuItem value="Turkey">Turkey</MenuItem>
                        <MenuItem value="Russia">Russia</MenuItem>
                        <MenuItem value="New Zealand">New Zealand</MenuItem>
                        <MenuItem value="Other">Other</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Financial Goals */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon />
                  Financial Goals (Monthly)
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      id="monthlySavingsGoal"
                      label="Savings Goal"
                      name="monthlySavingsGoal"
                      type="number"
                      value={formData.monthlySavingsGoal}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      id="monthlyInvestmentGoal"
                      label="Investment Goal"
                      name="monthlyInvestmentGoal"
                      type="number"
                      value={formData.monthlyInvestmentGoal}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      id="monthlyEmergencyFundGoal"
                      label="Emergency Fund Goal"
                      name="monthlyEmergencyFundGoal"
                      type="number"
                      value={formData.monthlyEmergencyFundGoal}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="taxRate"
                      label="Tax Rate (%)"
                      name="taxRate"
                      type="number"
                      value={formData.taxRate}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, max: 100, step: 0.01 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="monthlyTaxDeductions"
                      label="Monthly Tax Deductions"
                      name="monthlyTaxDeductions"
                      type="number"
                      value={formData.monthlyTaxDeductions}
                      onChange={handleInputChange}
                      inputProps={{ min: 0, step: 0.01 }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Income Sources */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon />
                    Income Sources
                  </Typography>
                  <Button
                    startIcon={<AddIcon />}
                    onClick={addIncomeSource}
                    variant="outlined"
                    size="small"
                  >
                    Add Income Source
                  </Button>
                </Box>
                
                {formData.incomeSources.map((source, index) => (
                  <Box key={index}>
                    <Grid container spacing={2} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Income Name"
                          placeholder="Company salary"
                          value={source.name}
                          onChange={(e) => handleIncomeSourceChange(index, 'name', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          label="Amount"
                          type="number"
                          value={source.amount}
                          onChange={(e) => handleIncomeSourceChange(index, 'amount', parseFloat(e.target.value) || 0)}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                          <InputLabel>Frequency</InputLabel>
                          <Select
                            value={source.frequency}
                            label="Frequency"
                            onChange={(e) => handleIncomeSourceChange(index, 'frequency', e.target.value)}
                          >
                            {frequencyOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required>
                          <InputLabel>Category</InputLabel>
                          <Select
                            value={source.category}
                            label="Category"
                            onChange={(e) => handleIncomeSourceChange(index, 'category', e.target.value)}
                          >
                            {categoryOptions.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Company"
                          value={source.company}
                          onChange={(e) => handleIncomeSourceChange(index, 'company', e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Description"
                          multiline
                          rows={2}
                          value={source.description}
                          onChange={(e) => handleIncomeSourceChange(index, 'description', e.target.value)}
                        />
                      </Grid>
                      {formData.incomeSources.length > 1 && (
                        <Grid item xs={12}>
                          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <IconButton
                              color="error"
                              onClick={() => removeIncomeSource(index)}
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                    {index < formData.incomeSources.length - 1 && <Divider sx={{ my: 2 }} />}
                  </Box>
                ))}
              </CardContent>
            </Card>

            {/* Additional Notes */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Additional Notes
                </Typography>
                <TextField
                  fullWidth
                  id="notes"
                  label="Notes"
                  name="notes"
                  multiline
                  rows={4}
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional information about your financial situation..."
                />
              </CardContent>
            </Card>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isLoading}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Complete Profile Setup'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default ProfileSetup;
