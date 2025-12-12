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
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
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
  CheckCircle,
  Public,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { RegisterData } from '../../types/loan';
import { validateEmail, validatePassword, validateRequired, getErrorMessage } from '../../utils/validation';

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

interface RegisterFormProps {
  onSwitchToLogin: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    name: '',
    email: '',
    country: '',
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

    // Validate country
    if (!formData.country || !formData.country.trim()) {
      setError('Country is required');
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
      // Registration successful - user is now logged in, redirect to dashboard
      navigate('/dashboard');
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

  const handleSelectChange = (field: keyof RegisterData) => (
    e: SelectChangeEvent<string>
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
        minHeight: '100vh',
        p: { xs: 2, sm: 3, md: 4 },
      }}
    >
      <Container sx={{ maxWidth: '1400px' }}>
        <Grid container spacing={{ xs: 4, lg: 8 }} alignItems="center">
          {/* Left Side - Branding & Benefits */}
          <Grid item xs={12} lg={5}>
            <Box 
              sx={{ 
                color: 'white', 
                textAlign: { xs: 'center', lg: 'left' }, 
                pr: { lg: 6 },
                animation: 'fadeInLeft 0.8s ease-out',
                '@keyframes fadeInLeft': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateX(-30px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateX(0)',
                  },
                },
              }}
            >
              <Box
                component={Link}
                to="/"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  mb: 5,
                  justifyContent: { xs: 'center', lg: 'flex-start' },
                  textDecoration: 'none',
                  color: 'inherit',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    opacity: 0.9,
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box
                  component="img"
                  src="/logo.png"
                  alt="UtilityHub360 Logo"
                  sx={{
                    height: { xs: 48, md: 64 },
                    width: 'auto',
                    mr: 2,
                    filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
                  }}
                />
                <Typography 
                  variant="h2" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 700,
                    fontSize: { xs: '2rem', md: '3rem' },
                    textShadow: '0 2px 8px rgba(0,0,0,0.2)',
                    letterSpacing: '-0.02em',
                    color: 'primary.main',
                  }}
                >
                  UtilityHub360
                </Typography>
              </Box>
              
              <Typography 
                variant="h4" 
                sx={{ 
                  mb: 3, 
                  fontWeight: 600,
                  fontSize: { xs: '1.5rem', md: '2rem' },
                  lineHeight: 1.3,
                  textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  color: 'white',
                }}
              >
                Start Your Financial Journey Today
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4, 
                  opacity: 0.95, 
                  lineHeight: 1.8, 
                  fontWeight: 400,
                  fontSize: { xs: '0.95rem', md: '1.1rem' },
                  maxWidth: { lg: '90%' },
                  color: 'white',
                }}
              >
                Join thousands of users who have taken control of their finances. Create your account 
                and unlock powerful tools for managing loans, tracking expenses, and building wealth.
              </Typography>

              {/* Benefits List */}
              <Box sx={{ mb: 5 }}>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    mb: 3,
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <CheckCircle sx={{ mr: 2, color: '#34D399', fontSize: 28, mt: 0.5, flexShrink: 0 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1rem', lineHeight: 1.6, color: 'white' }}>
                    Comprehensive loan management
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    mb: 3,
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <CheckCircle sx={{ mr: 2, color: '#34D399', fontSize: 28, mt: 0.5, flexShrink: 0 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1rem', lineHeight: 1.6, color: 'white' }}>
                    Real-time expense tracking
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    mb: 3,
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <CheckCircle sx={{ mr: 2, color: '#34D399', fontSize: 28, mt: 0.5, flexShrink: 0 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1rem', lineHeight: 1.6, color: 'white' }}>
                    Smart savings goals
                  </Typography>
                </Box>
                <Box 
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'flex-start', 
                    mb: 3,
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                      transform: 'translateX(4px)',
                    },
                  }}
                >
                  <CheckCircle sx={{ mr: 2, color: '#34D399', fontSize: 28, mt: 0.5, flexShrink: 0 }} />
                  <Typography variant="body1" sx={{ fontWeight: 500, fontSize: '1rem', lineHeight: 1.6, color: 'white' }}>
                    Advanced analytics & insights
                  </Typography>
                </Box>
              </Box>

              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: { xs: 'center', lg: 'flex-start' },
                  opacity: 0.9,
                  mt: 4,
                }}
              >
                <Security sx={{ mr: 1.5, fontSize: 20, color: 'white' }} />
                <Typography variant="body2" sx={{ fontWeight: 500, fontSize: '0.875rem', color: 'white' }}>
                  Your data is protected with enterprise-grade security
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Registration Form */}
          <Grid item xs={12} lg={7}>
            <Card
              elevation={0}
              sx={{
                borderRadius: 4,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.98)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                maxWidth: 'none',
                animation: 'fadeInRight 0.8s ease-out',
                '@keyframes fadeInRight': {
                  '0%': {
                    opacity: 0,
                    transform: 'translateX(30px)',
                  },
                  '100%': {
                    opacity: 1,
                    transform: 'translateX(0)',
                  },
                },
              }}
            >
              <CardContent sx={{ p: { xs: 4, sm: 5, md: 6 } }}>
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                  <Typography 
                    variant="h4" 
                    component="h2" 
                    sx={{ 
                      fontWeight: 700, 
                      mb: 1.5, 
                      color: '#1a2d3a',
                      fontSize: { xs: '1.75rem', md: '2rem' },
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Create Account
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#64748b',
                      fontSize: '1rem',
                      fontWeight: 400,
                    }}
                  >
                    Join UtilityHub360 and take control of your finances
                  </Typography>
                </Box>

                {error && (
                  <Alert 
                    severity="error" 
                    sx={{ 
                      mb: 3,
                      borderRadius: 2,
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                    }}
                  >
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {error}
                    </Typography>
                  </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
                      mb: 2.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#f8fafc',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#f1f5f9',
                        },
                        '&.Mui-focused': {
                          bgcolor: '#ffffff',
                          boxShadow: '0 0 0 3px rgba(95, 155, 140, 0.1)',
                        },
                        '& fieldset': {
                          borderColor: '#e2e8f0',
                          borderWidth: '1.5px',
                        },
                        '&:hover fieldset': {
                          borderColor: '#cbd5e1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#5F9B8C',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#5F9B8C',
                      },
                      '& input:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px #f8fafc inset',
                        WebkitTextFillColor: '#1e293b',
                        caretColor: '#1e293b',
                        borderRadius: '8px',
                      },
                      '& input:-webkit-autofill:hover': {
                        WebkitBoxShadow: '0 0 0 1000px #f1f5f9 inset',
                      },
                      '& input:-webkit-autofill:focus': {
                        WebkitBoxShadow: '0 0 0 1000px #ffffff inset',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: '#94a3b8' }} />
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
                      mb: 2.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#f8fafc',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#f1f5f9',
                        },
                        '&.Mui-focused': {
                          bgcolor: '#ffffff',
                          boxShadow: '0 0 0 3px rgba(95, 155, 140, 0.1)',
                        },
                        '& fieldset': {
                          borderColor: '#e2e8f0',
                          borderWidth: '1.5px',
                        },
                        '&:hover fieldset': {
                          borderColor: '#cbd5e1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#5F9B8C',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#5F9B8C',
                      },
                      '& input:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px #f8fafc inset',
                        WebkitTextFillColor: '#1e293b',
                        caretColor: '#1e293b',
                        borderRadius: '8px',
                      },
                      '& input:-webkit-autofill:hover': {
                        WebkitBoxShadow: '0 0 0 1000px #f1f5f9 inset',
                      },
                      '& input:-webkit-autofill:focus': {
                        WebkitBoxShadow: '0 0 0 1000px #ffffff inset',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Email sx={{ color: '#94a3b8' }} />
                        </InputAdornment>
                      ),
                    }}
                  />

                  <FormControl 
                    fullWidth 
                    required 
                    disabled={isLoading}
                    sx={{ 
                      mb: 2.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#f8fafc',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#f1f5f9',
                        },
                        '&.Mui-focused': {
                          bgcolor: '#ffffff',
                          boxShadow: '0 0 0 3px rgba(95, 155, 140, 0.1)',
                        },
                        '& fieldset': {
                          borderColor: '#e2e8f0',
                          borderWidth: '1.5px',
                        },
                        '&:hover fieldset': {
                          borderColor: '#cbd5e1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#5F9B8C',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#5F9B8C',
                      },
                    }}
                  >
                    <InputLabel id="country-label">Country</InputLabel>
                    <Select
                      labelId="country-label"
                      id="country"
                      name="country"
                      value={formData.country}
                      label="Country"
                      onChange={handleSelectChange('country')}
                      startAdornment={
                        <InputAdornment position="start" sx={{ ml: 1 }}>
                          <Public sx={{ color: '#94a3b8' }} />
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
                      mb: 2.5,
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#f8fafc',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#f1f5f9',
                        },
                        '&.Mui-focused': {
                          bgcolor: '#ffffff',
                          boxShadow: '0 0 0 3px rgba(95, 155, 140, 0.1)',
                        },
                        '& fieldset': {
                          borderColor: '#e2e8f0',
                          borderWidth: '1.5px',
                        },
                        '&:hover fieldset': {
                          borderColor: '#cbd5e1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#5F9B8C',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#5F9B8C',
                      },
                      '& input:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px #f8fafc inset',
                        WebkitTextFillColor: '#1e293b',
                        caretColor: '#1e293b',
                        borderRadius: '8px',
                      },
                      '& input:-webkit-autofill:hover': {
                        WebkitBoxShadow: '0 0 0 1000px #f1f5f9 inset',
                      },
                      '& input:-webkit-autofill:focus': {
                        WebkitBoxShadow: '0 0 0 1000px #ffffff inset',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#94a3b8' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword(!showPassword)}
                            edge="end"
                            sx={{
                              color: '#94a3b8',
                              '&:hover': {
                                bgcolor: 'rgba(148, 163, 184, 0.1)',
                              },
                            }}
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
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        bgcolor: '#f8fafc',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: '#f1f5f9',
                        },
                        '&.Mui-focused': {
                          bgcolor: '#ffffff',
                          boxShadow: '0 0 0 3px rgba(95, 155, 140, 0.1)',
                        },
                        '& fieldset': {
                          borderColor: '#e2e8f0',
                          borderWidth: '1.5px',
                        },
                        '&:hover fieldset': {
                          borderColor: '#cbd5e1',
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: '#5F9B8C',
                          borderWidth: '2px',
                        },
                      },
                      '& .MuiInputLabel-root.Mui-focused': {
                        color: '#5F9B8C',
                      },
                      '& input:-webkit-autofill': {
                        WebkitBoxShadow: '0 0 0 1000px #f8fafc inset',
                        WebkitTextFillColor: '#1e293b',
                        caretColor: '#1e293b',
                        borderRadius: '8px',
                      },
                      '& input:-webkit-autofill:hover': {
                        WebkitBoxShadow: '0 0 0 1000px #f1f5f9 inset',
                      },
                      '& input:-webkit-autofill:focus': {
                        WebkitBoxShadow: '0 0 0 1000px #ffffff inset',
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Lock sx={{ color: '#94a3b8' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle confirm password visibility"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            edge="end"
                            sx={{
                              color: '#94a3b8',
                              '&:hover': {
                                bgcolor: 'rgba(148, 163, 184, 0.1)',
                              },
                            }}
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
                      py: 1.75,
                      borderRadius: 2,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      background: 'primary.main',
                      boxShadow: '0 4px 14px rgba(95, 155, 140, 0.4)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        background: 'secondary.main',
                        boxShadow: '0 6px 20px rgba(95, 155, 140, 0.5)',
                        transform: 'translateY(-2px)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
                      },
                      '&:disabled': {
                        background: '#cbd5e1',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <>
                        <TrendingUp sx={{ mr: 1.5, fontSize: 20 }} />
                        Create Account & Start Managing
                      </>
                    )}
                  </Button>

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8', px: 2, fontSize: '0.875rem' }}>
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
                      py: 1.75,
                      borderRadius: 2,
                      fontSize: '1rem',
                      fontWeight: 600,
                      textTransform: 'none',
                      borderColor: '#e2e8f0',
                      borderWidth: '1.5px',
                      color: '#1e293b',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        borderColor: '#5F9B8C',
                        backgroundColor: 'rgba(95, 155, 140, 0.08)',
                        color: '#5F9B8C',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 12px rgba(95, 155, 140, 0.2)',
                      },
                      '&:active': {
                        transform: 'translateY(0)',
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