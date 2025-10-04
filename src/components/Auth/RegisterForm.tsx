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
  Container,
  Grid,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Security,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  Phone,
  CheckCircle,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterData } from '../../types/loan';
import { validateEmail, validatePassword, validateRequired, getErrorMessage } from '../../utils/validation';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate name
    const nameValidation = validateRequired(formData.name, 'Name');
    if (!nameValidation.isValid) {
      setError(nameValidation.error || 'Name is required');
      return;
    }

    // Validate phone number - just check if it contains enough digits
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 7) {
      setError('Phone number must contain at least 7 digits');
      return;
    }

    // Validate password
    const passwordValidation = validatePassword(formData.password);
    if (!passwordValidation.isValid) {
      setError(passwordValidation.errors[0]);
      return;
    }

    // Validate password confirmation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      await register(formData);
      // Registration successful - redirect to home page
      navigate('/');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Registration failed'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof RegisterData) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value,
    }));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={6} alignItems="center">
          {/* Left Side - Branding & Benefits */}
          <Grid item xs={12} lg={6}>
            <Box sx={{ color: 'white', textAlign: { xs: 'center', lg: 'left' }, pr: { lg: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: { xs: 'center', lg: 'flex-start' } }}>
                <AccountBalance sx={{ fontSize: 56, mr: 2 }} />
                <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold' }}>
                  UtilityHub360
                </Typography>
              </Box>
              
              <Typography variant="h4" sx={{ mb: 4, fontWeight: 300 }}>
                Start Your Financial Journey Today
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 5, opacity: 0.9, lineHeight: 1.6, fontWeight: 300 }}>
                Join thousands of users who have taken control of their finances. Create your account 
                and unlock powerful tools for managing loans, tracking expenses, and building wealth.
              </Typography>

              {/* Benefits List */}
              <Box sx={{ mb: 5 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CheckCircle sx={{ mr: 2, color: '#4caf50', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 400 }}>Comprehensive loan management</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CheckCircle sx={{ mr: 2, color: '#4caf50', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 400 }}>Real-time expense tracking</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CheckCircle sx={{ mr: 2, color: '#4caf50', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 400 }}>Smart savings goals</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <CheckCircle sx={{ mr: 2, color: '#4caf50', fontSize: 28 }} />
                  <Typography variant="h6" sx={{ fontWeight: 400 }}>Advanced analytics & insights</Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>
                <Security sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Your data is protected with enterprise-grade security
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Registration Form */}
          <Grid item xs={12} lg={6}>
            <Card
              elevation={24}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                maxWidth: 550,
                mx: 'auto',
              }}
            >
              <CardContent sx={{ p: 5 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 1, color: '#233C4B' }}>
                    Create Account
                  </Typography>
                  <Typography variant="body1" sx={{ color: '#233C4B' }}>
                    Join UtilityHub360 and take control of your finances
                  </Typography>
                </Box>

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {error}
                    </Typography>
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit}>
                  <TextField
                    fullWidth
                    required
                    id="name"
                    label="Full Name"
                    name="name"
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange('name')}
                    disabled={isLoading}
                    sx={{ 
                      mb: 2,
                      '& input:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                        caretColor: 'inherit',
                      },
                      '& input:-webkit-autofill:hover': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                      },
                      '& input:-webkit-autofill:focus': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    required
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange('email')}
                    disabled={isLoading}
                    sx={{ 
                      mb: 2,
                      '& input:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                        caretColor: 'inherit',
                      },
                      '& input:-webkit-autofill:hover': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                      },
                      '& input:-webkit-autofill:focus': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    required
                    id="phone"
                    label="Phone Number"
                    name="phone"
                    autoComplete="tel"
                    value={formData.phone}
                    onChange={handleChange('phone')}
                    disabled={isLoading}
                    sx={{ 
                      mb: 2,
                      '& input:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                        caretColor: 'inherit',
                      },
                      '& input:-webkit-autofill:hover': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                      },
                      '& input:-webkit-autofill:focus': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Phone color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <TextField
                    fullWidth
                    required
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange('password')}
                    disabled={isLoading}
                    sx={{ 
                      mb: 2,
                      '& input:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                        caretColor: 'inherit',
                      },
                      '& input:-webkit-autofill:hover': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                      },
                      '& input:-webkit-autofill:focus': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
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
                    fullWidth
                    required
                    name="confirmPassword"
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange('confirmPassword')}
                    disabled={isLoading}
                    sx={{ 
                      mb: 3,
                      '& input:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                        caretColor: 'inherit',
                      },
                      '& input:-webkit-autofill:hover': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                      },
                      '& input:-webkit-autofill:focus': {
                        WebkitBoxShadow: '0 0 0 1000px white inset',
                        WebkitTextFillColor: 'inherit',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock color="action" />
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

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      mb: 3,
                      py: 1.5,
                      borderRadius: 2,
                      background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                      },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <>
                        <TrendingUp sx={{ mr: 1 }} />
                        Create Account & Start Managing
                      </>
                    )}
                  </Button>

                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" sx={{ color: '#233C4B' }}>
                      Already have an account?
                    </Typography>
                  </Divider>

                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={onSwitchToLogin}
                    disabled={isLoading}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      borderColor: '#233C4B',
                      color: '#233C4B',
                      '&:hover': {
                        borderColor: '#1a2d3a',
                        backgroundColor: 'rgba(35, 60, 75, 0.1)',
                      },
                    }}
                  >
                    Sign In to Your Account
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default RegisterForm;