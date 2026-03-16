import React, { useState } from 'react';
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Alert,
  Link,
  CircularProgress,
  InputAdornment,
  IconButton,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Person,
  Email,
  Lock,
  Public,
  Description,
} from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { apiService } from '../services/api';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Italy', 'Spain',
  'Netherlands', 'Belgium', 'Switzerland', 'Austria', 'Sweden', 'Norway', 'Denmark', 'Finland',
  'Poland', 'Portugal', 'Greece', 'Ireland', 'Czech Republic', 'Hungary', 'Romania', 'Bulgaria',
  'Croatia', 'Slovakia', 'Slovenia', 'Lithuania', 'Latvia', 'Estonia', 'Luxembourg', 'Malta',
  'Cyprus', 'Japan', 'South Korea', 'China', 'India', 'Singapore', 'Malaysia', 'Thailand',
  'Indonesia', 'Philippines', 'Vietnam', 'Taiwan', 'Hong Kong', 'New Zealand', 'South Africa',
  'Brazil', 'Argentina', 'Mexico', 'Chile', 'Colombia', 'Peru', 'Venezuela', 'Ecuador',
  'Uruguay', 'Paraguay', 'Bolivia', 'Panama', 'Costa Rica', 'Guatemala', 'Honduras',
  'El Salvador', 'Nicaragua', 'Dominican Republic', 'Jamaica', 'Trinidad and Tobago', 'Bahamas',
  'Barbados', 'Belize', 'Guyana', 'Suriname', 'Egypt', 'Nigeria', 'Kenya', 'Ghana',
  'Tanzania', 'Uganda', 'Ethiopia', 'Morocco', 'Algeria', 'Tunisia', 'Libya', 'Sudan',
  'Saudi Arabia', 'United Arab Emirates', 'Israel', 'Turkey', 'Lebanon', 'Jordan', 'Kuwait',
  'Qatar', 'Oman', 'Bahrain', 'Iraq', 'Iran', 'Pakistan', 'Bangladesh', 'Sri Lanka',
  'Nepal', 'Myanmar', 'Cambodia', 'Laos', 'Mongolia', 'Kazakhstan', 'Uzbekistan', 'Ukraine',
  'Russia', 'Belarus', 'Moldova', 'Georgia', 'Armenia', 'Azerbaijan', 'Kyrgyzstan',
  'Tajikistan', 'Turkmenistan', 'Afghanistan', 'Iceland', 'Liechtenstein', 'Monaco',
  'San Marino', 'Vatican City', 'Andorra', 'Albania', 'Bosnia and Herzegovina',
  'North Macedonia', 'Serbia', 'Montenegro', 'Kosovo', 'Other'
];

interface RegisterFormData {
  name: string;
  email: string;
  country: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterFormData>({
    name: '',
    email: '',
    country: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) {
      return 'Name is required';
    }
    if (!formData.email.trim()) {
      return 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      return 'Please enter a valid email address';
    }
    if (!formData.country.trim()) {
      return 'Country is required';
    }
    if (!formData.password) {
      return 'Password is required';
    }
    if (formData.password.length < 6) {
      return 'Password must be at least 6 characters long';
    }
    if (formData.password !== formData.confirmPassword) {
      return 'Passwords do not match';
    }
    if (!acceptedTerms) {
      return 'You must accept the Terms and Conditions to proceed';
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
      const response = await apiService.register(formData);
      
      // Check if registration was successful
      if (!response.success) {
        // Handle validation errors from the new API format
        if (response.errors && response.errors.length > 0) {
          const errorMessages = response.errors.map(err => `${err.field}: ${err.message}`).join(', ');
          setError(errorMessages);
          return;
        }
        setError(response.message || 'Registration failed');
        return;
      }
      
      // Registration successful - redirect to home page
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
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
            alignItems: 'center',
            width: '100%',
          }}
        >
          <Typography component="h1" variant="h4" gutterBottom>
            Create Account
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Join UtilityHub360 to manage your finances effectively
          </Typography>

          {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Full Name"
              name="name"
              autoComplete="name"
              autoFocus
              value={formData.name}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email />
                  </InputAdornment>
                ),
              }}
            />
            <FormControl margin="normal" required fullWidth>
              <InputLabel id="country-label">Country</InputLabel>
              <Select
                labelId="country-label"
                id="country"
                name="country"
                value={formData.country}
                label="Country"
                onChange={handleSelectChange}
                startAdornment={
                  <InputAdornment position="start" sx={{ ml: 1 }}>
                    <Public />
                  </InputAdornment>
                }
              >
                {COUNTRIES.map((country) => (
                  <MenuItem key={country} value={country}>
                    {country}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Box sx={{ mt: 2, mb: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    disabled={isLoading}
                  />
                }
                label={
                  <Typography variant="body2">
                    I agree to the{' '}
                    <Link
                      component="button"
                      type="button"
                      onClick={() => setShowTermsDialog(true)}
                      sx={{
                        textDecoration: 'none',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      Terms and Conditions
                    </Link>
                    {' '}regarding international policy for financial systems
                  </Typography>
                }
              />
            </Box>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isLoading || !acceptedTerms}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Create Account'
              )}
            </Button>
            <Box textAlign="center">
              <Typography variant="body2">
                Already have an account?{' '}
                <Link component={RouterLink} to="/login" variant="body2">
                  Sign in here
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      {/* Terms and Conditions Dialog */}
      <Dialog
        open={showTermsDialog}
        onClose={() => setShowTermsDialog(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            pb: 2,
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <Description sx={{ color: 'primary.main' }} />
          <Typography variant="h5" component="div" sx={{ fontWeight: 700 }}>
            Terms and Conditions - International Financial Policy
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ maxHeight: '60vh', overflowY: 'auto', pr: 1 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              1. International Financial Services Policy
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
              By using UtilityHub360, you acknowledge and agree that our financial services platform operates 
              in compliance with international financial regulations and policies. This includes adherence to 
              anti-money laundering (AML) regulations, know your customer (KYC) requirements, and cross-border 
              financial transaction standards as established by international financial regulatory bodies.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              2. Cross-Border Transactions
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
              Users engaging in cross-border financial transactions through UtilityHub360 must comply with all 
              applicable international trade and financial regulations, including but not limited to sanctions 
              compliance, export control laws, and currency exchange regulations. You are responsible for ensuring 
              that your use of our services complies with the laws of your jurisdiction and any jurisdictions 
              involved in your transactions.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              3. Data Protection and Privacy
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
              Your financial data may be processed and stored in accordance with international data protection 
              standards, including GDPR (General Data Protection Regulation) for European users and other 
              applicable regional data protection laws. We implement appropriate technical and organizational 
              measures to protect your personal and financial information in compliance with international 
              standards.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              4. Regulatory Compliance
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
              UtilityHub360 operates in compliance with international financial regulatory frameworks, including 
              those established by the Financial Action Task Force (FATF), Basel Committee on Banking Supervision, 
              and other relevant international financial regulatory bodies. Users must ensure their activities 
              comply with all applicable regulations in their country of residence and operation.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              5. Currency and Exchange Rates
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
              When using multi-currency features, exchange rates are provided for informational purposes and may 
              not reflect real-time market rates. Currency conversions are subject to international exchange 
              rate fluctuations and applicable fees. Users are responsible for understanding the implications 
              of currency exchange on their financial transactions.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              6. Prohibited Activities
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
              Users are prohibited from using UtilityHub360 for any illegal activities, including but not limited 
              to money laundering, terrorist financing, tax evasion, or any activities that violate international 
              financial regulations or sanctions. Violation of these terms may result in immediate account 
              termination and reporting to relevant authorities.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              7. Jurisdiction and Dispute Resolution
            </Typography>
            <Typography variant="body2" sx={{ mb: 3, lineHeight: 1.8 }}>
              These terms are governed by applicable international law and the laws of the jurisdiction in which 
              UtilityHub360 operates. Any disputes arising from the use of our services will be resolved in 
              accordance with international dispute resolution mechanisms and applicable legal frameworks.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              8. Changes to Terms
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, lineHeight: 1.8 }}>
              We reserve the right to update these terms and conditions to reflect changes in international 
              financial regulations or our service offerings. Users will be notified of significant changes, 
              and continued use of the service constitutes acceptance of the updated terms.
            </Typography>

            <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                By accepting these terms, you confirm that you have read, understood, and agree to comply with 
                all international financial policies and regulations applicable to your use of UtilityHub360.
              </Typography>
            </Alert>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #e2e8f0' }}>
          <Button
            onClick={() => {
              setShowTermsDialog(false);
              setAcceptedTerms(true);
            }}
            variant="contained"
          >
            Accept and Close
          </Button>
          <Button
            onClick={() => setShowTermsDialog(false)}
            variant="outlined"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Register;
