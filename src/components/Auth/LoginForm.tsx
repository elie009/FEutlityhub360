import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
  Divider,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Security,
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Dashboard,
  Analytics,
  Savings,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types/loan';
import { validateEmail, validateRequired, getErrorMessage } from '../../utils/validation';
import { config } from '../../config/environment';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: 'demo@utilityhub360.com',
    password: 'Demo123!',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email
    if (!validateEmail(credentials.email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate password
    const passwordValidation = validateRequired(credentials.password, 'Password');
    if (!passwordValidation.isValid) {
      setError(passwordValidation.error || 'Password is required');
      return;
    }

    setIsLoading(true);

    try {
      console.log('Attempting login with credentials:', { email: credentials.email });
      console.log('API Base URL:', config.apiBaseUrl);
      console.log('Complete Login URL:', `${config.apiBaseUrl}/Auth/login`);
      await login(credentials);
      console.log('Login successful');
      
      // Redirect to home page after successful login
      console.log('LoginForm: Redirecting to home page...');
      navigate('/', { replace: true });
    } catch (err: unknown) {
      console.error('Login error:', err);
      // Handle specific error messages from the backend
      const errorMessage = getErrorMessage(err, 'Login failed');
      console.log('Error message:', errorMessage);
      
      // Check for specific error patterns and provide user-friendly messages
      if (errorMessage.toLowerCase().includes('invalid') || 
          errorMessage.toLowerCase().includes('incorrect') ||
          errorMessage.toLowerCase().includes('wrong')) {
        setError('Invalid email or password. Please check your credentials and try again.');
      } else if (errorMessage.toLowerCase().includes('not found') ||
                 errorMessage.toLowerCase().includes('user not found')) {
        setError('No account found with this email address. Please check your email or create a new account.');
      } else if (errorMessage.toLowerCase().includes('password')) {
        setError('Incorrect password. Please try again.');
      } else if (errorMessage.toLowerCase().includes('email')) {
        setError('Invalid email address. Please check your email and try again.');
      } else if (errorMessage.toLowerCase().includes('network') ||
                 errorMessage.toLowerCase().includes('connection') ||
                 errorMessage.toLowerCase().includes('timeout')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
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
          {/* Left Side - Branding & Features */}
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
                Your Complete Financial Management Solution
              </Typography>
              
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 5, 
                  opacity: 0.95, 
                  lineHeight: 1.8, 
                  fontWeight: 400,
                  fontSize: { xs: '0.95rem', md: '1.1rem' },
                  maxWidth: { lg: '90%' },
                  color: 'white',
                }}
              >
                Take control of your finances with our comprehensive platform. Manage loans, track expenses, 
                monitor savings, and achieve your financial goals with ease.
              </Typography>

              {/* Feature Icons */}
              <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid item xs={4}>
                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'rgba(52, 211, 153, 0.15)',
                        mb: 2,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Dashboard sx={{ fontSize: { xs: 32, md: 40 }, color: '#34D399' }} />
                    </Box>
                    <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 600, fontSize: '0.875rem', color: 'white' }}>
                      Dashboard
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'rgba(52, 211, 153, 0.15)',
                        mb: 2,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Analytics sx={{ fontSize: { xs: 32, md: 40 }, color: '#34D399' }} />
                    </Box>
                    <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 600, fontSize: '0.875rem', color: 'white' }}>
                      Analytics
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box 
                    sx={{ 
                      textAlign: 'center',
                      transition: 'transform 0.3s ease',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                      },
                    }}
                  >
                    <Box
                      sx={{
                        display: 'inline-flex',
                        p: 2,
                        borderRadius: 3,
                        bgcolor: 'rgba(52, 211, 153, 0.15)',
                        mb: 2,
                        backdropFilter: 'blur(10px)',
                      }}
                    >
                      <Savings sx={{ fontSize: { xs: 32, md: 40 }, color: '#34D399' }} />
                    </Box>
                    <Typography variant="body2" sx={{ opacity: 0.95, fontWeight: 600, fontSize: '0.875rem', color: 'white' }}>
                      Savings
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

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
                  Bank-level security & encryption
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
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
                    Welcome Back
                  </Typography>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      color: '#64748b',
                      fontSize: '1rem',
                      fontWeight: 400,
                    }}
                  >
                    Sign in to access your financial dashboard
                  </Typography>
                </Box>

                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    bgcolor: 'rgba(95, 155, 140, 0.1)',
                    border: '1px solid rgba(95, 155, 140, 0.2)',
                    '& .MuiAlert-icon': {
                      color: '#5F9B8C'
                    },
                    '& .MuiAlert-message': {
                      color: '#1e293b',
                    },
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    <strong>Demo Account:</strong> demo@utilityhub360.com / Demo123!
                  </Typography>
                </Alert>

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
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={credentials.email}
                    onChange={handleChange('email')}
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
                          <Email sx={{ color: '#94a3b8' }} />
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
                    autoComplete="current-password"
                    value={credentials.password}
                    onChange={handleChange('password')}
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

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={isLoading}
                    sx={{
                      mb: 2.5,
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
                        Sign In to Dashboard
                      </>
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Button
                      component={Link}
                      to="/forgot-password"
                      variant="text"
                      sx={{
                        color: '#64748b',
                        textDecoration: 'none',
                        textTransform: 'none',
                        fontWeight: 500,
                        fontSize: '0.875rem',
                        '&:hover': {
                          color: '#5F9B8C',
                          backgroundColor: 'rgba(95, 155, 140, 0.08)',
                          textDecoration: 'none',
                        },
                      }}
                    >
                      Forgot Password?
                    </Button>
                  </Box>

                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" sx={{ color: '#94a3b8', px: 2, fontSize: '0.875rem' }}>
                      New to UtilityHub360?
                    </Typography>
                  </Divider>

                  <Button
                    fullWidth
                    variant="outlined"
                    size="large"
                    onClick={onSwitchToRegister}
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
                    Create Your Account
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

export default LoginForm;