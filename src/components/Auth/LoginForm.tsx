import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
      }}
    >
      <Container sx={{ maxWidth: '1200px' }} >
        <Grid container spacing={6} alignItems="center" >
          {/* Left Side - Branding & Features */}
          <Grid item xs={12} lg={4} >
            <Box sx={{ color: 'white', textAlign: { xs: 'center', lg: 'left' }, pr: { lg: 4 } }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4, justifyContent: { xs: 'center', lg: 'flex-start' } }}>
                <AccountBalance sx={{ fontSize: 56, mr: 2 }} />
                <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold' }}>
                  UtilityHub360
                </Typography>
              </Box>
              
              <Typography variant="h4" sx={{ mb: 4, fontWeight: 300 }}>
                Your Complete Financial Management Solution
              </Typography>
              
              <Typography variant="h6" sx={{ mb: 5, opacity: 0.9, lineHeight: 1.6, fontWeight: 300 }}>
                Take control of your finances with our comprehensive platform. Manage loans, track expenses, 
                monitor savings, and achieve your financial goals with ease.
              </Typography>

              {/* Feature Icons */}
              <Grid container spacing={4} sx={{ mb: 5 }}>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Dashboard sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                      Dashboard
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Analytics sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                      Analytics
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={4}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Savings sx={{ fontSize: 40, mb: 2, opacity: 0.9 }} />
                    <Typography variant="body1" sx={{ opacity: 0.9, fontWeight: 500 }}>
                      Savings
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ display: 'flex', alignItems: 'center', opacity: 0.8 }}>
                <Security sx={{ mr: 1 }} />
                <Typography variant="body2">
                  Bank-level security & encryption
                </Typography>
              </Box>
            </Box>
          </Grid>

          {/* Right Side - Login Form */}
          <Grid item xs={12} lg={8}>
            <Card
              elevation={24}
              sx={{
                borderRadius: 3,
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                maxWidth: 'none',
                width: '100%',
              }}
            >
              <CardContent sx={{ p: 5 }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Welcome Back
                  </Typography>
                  <Typography variant="body1" sx={{ color: 'primary.main' }}>
                    Sign in to access your financial dashboard
                  </Typography>
                </Box>

                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3,
                    borderRadius: 2,
                    '& .MuiAlert-icon': {
                      color: 'primary.main'
                    }
                  }}
                >
                  <Typography variant="body2">
                    <strong>Demo Account:</strong> demo@utilityhub360.com / Demo123!
                  </Typography>
                </Alert>

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
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    value={credentials.email}
                    onChange={handleChange('email')}
                    disabled={isLoading}
                    sx={{ mb: 2 }}
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
                    name="password"
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    autoComplete="current-password"
                    value={credentials.password}
                    onChange={handleChange('password')}
                    disabled={isLoading}
                    sx={{ mb: 3 }}
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
                        Sign In to Dashboard
                      </>
                    )}
                  </Button>

                  <Divider sx={{ my: 2 }}>
                    <Typography variant="body2" color="text.secondary">
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
                      py: 1.5,
                      borderRadius: 2,
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      '&:hover': {
                        borderColor: 'primary.dark',
                        backgroundColor: 'primary.50',
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
