import React, { useState, useEffect } from 'react';
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
  Fade,
  Paper,
  Slide,
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
  People,
  AttachMoney,
  Star,
  Lightbulb,
  KeyboardArrowRight,
  KeyboardArrowLeft,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { LoginCredentials } from '../../types/loan';
import { validateEmail, validateRequired, getErrorMessage } from '../../utils/validation';
import { config } from '../../config/environment';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

const FINANCIAL_TIPS = [
  {
    title: 'The 50/30/20 Rule',
    subtitle: 'Budgeting Strategy',
    description: 'Allocate 50% of your income to needs, 30% to wants, and 20% to savings and debt repayment. This simple framework helps maintain financial balance while building wealth.',
  },
  {
    title: 'Emergency Fund First',
    subtitle: 'Savings Priority',
    description: 'Build 3–6 months of expenses in a high-yield savings account before aggressive investing. It provides peace of mind and protects you from unexpected setbacks.',
  },
  {
    title: 'Pay Yourself First',
    subtitle: 'Automation Tip',
    description: 'Set up automatic transfers to savings as soon as you get paid. Treat savings like a non-negotiable bill so you never miss a contribution.',
  },
  {
    title: 'Track Small Purchases',
    subtitle: 'Spending Awareness',
    description: 'Small daily expenses add up quickly. Track everything for a month to spot patterns—you may find easy ways to cut costs without feeling deprived.',
  },
  {
    title: 'Avoid Lifestyle Creep',
    subtitle: 'Income Growth',
    description: 'When your income rises, resist the urge to upgrade everything. Redirect raises and bonuses to savings and investments instead of increasing spending.',
  },
];

const ANIMATED_STATS = [
  { value: '15,000+', label: 'Active Users', icon: People },
  { value: '$2.5M+', label: 'Money Saved', icon: AttachMoney },
  { value: '4.9/5', label: 'User Rating', icon: Star },
];

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: 'demo@utilityhub360.com',
    password: 'Demo123!',
  });
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tipIndex, setTipIndex] = useState(0);
  const [statIndex, setStatIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const { login } = useAuth();
  const navigate = useNavigate();

  // Financial tips carousel - rotate every 5 seconds (slide forward)
  useEffect(() => {
    const interval = setInterval(() => {
      setSlideDirection('right');
      setTipIndex((prev) => (prev + 1) % FINANCIAL_TIPS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Animated stats - rotate every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setStatIndex((prev) => (prev + 1) % ANIMATED_STATS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

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
      <Container sx={{ maxWidth: '1400px', width: '100%', px: { xs: 2, sm: 3 } }}>
        <Grid container spacing={{ xs: 3, sm: 4, lg: 6 }} alignItems="center">
          {/* Left Side - Branding & Features */}
          <Grid item xs={12} lg={5}>
            <Box 
              sx={{ 
                color: 'white', 
                textAlign: { xs: 'center', lg: 'left' }, 
                pr: { lg: 4 },
                width: '100%',
                maxWidth: '100%',
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
                  mb: '10px',
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
                  mb: '10px', 
                  opacity: 0.95, 
                  lineHeight: 1.8, 
                  fontWeight: 400,
                  maxWidth: { lg: '100%' },
                  color: 'white',
                }}
              >
                Take control of your finances with our comprehensive platform. Manage loans, track expenses, 
                monitor savings, and achieve your financial goals with ease.
              </Typography>

              {/* Feature Icons */}
              <Grid container spacing={3} sx={{ mb: '10px' }}>
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

              {/* Financial Tips Carousel */}
              <Box sx={{ mb: 4, width: '100%', maxWidth: '100%' }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    mb: 2,
                    justifyContent: { xs: 'center', lg: 'flex-start' },
                  }}
                >
                  <Lightbulb sx={{ fontSize: 22, color: '#34D399' }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: 'white', fontSize: '1rem' }}>
                    Financial Tips
                  </Typography>
                </Box>
                <Paper
                  elevation={0}
                  sx={{
                    bgcolor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    borderRadius: 2,
                    p: { xs: 2, sm: 2.5 },
                    minHeight: { xs: 140, sm: 160 },
                    position: 'relative',
                    overflow: 'hidden',
                    width: '100%',
                    maxWidth: '100%',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Prev arrow */}
                    <IconButton
                      onClick={() => {
                        setSlideDirection('left');
                        setTipIndex((prev) => (prev - 1 + FINANCIAL_TIPS.length) % FINANCIAL_TIPS.length);
                      }}
                      sx={{
                        color: 'white',
                        opacity: 0.9,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                        flexShrink: 0,
                      }}
                      aria-label="Previous tip"
                    >
                      <KeyboardArrowLeft sx={{ fontSize: 28 }} />
                    </IconButton>
                    {/* Content */}
                    <Box sx={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <Slide in={true} direction={slideDirection} key={tipIndex} timeout={350}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#34D399', mb: 0.5, fontSize: '0.95rem' }}>
                            {FINANCIAL_TIPS[tipIndex].title}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)', display: 'block', mb: 1, fontSize: '0.75rem' }}>
                            {FINANCIAL_TIPS[tipIndex].subtitle}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'white', lineHeight: 1.6, opacity: 0.95, fontSize: { xs: '0.85rem', sm: '0.9rem' }, wordBreak: 'break-word', overflowWrap: 'break-word' }}>
                            {FINANCIAL_TIPS[tipIndex].description}
                          </Typography>
                        </Box>
                      </Slide>
                    </Box>
                    {/* Next arrow */}
                    <IconButton
                      onClick={() => {
                        setSlideDirection('right');
                        setTipIndex((prev) => (prev + 1) % FINANCIAL_TIPS.length);
                      }}
                      sx={{
                        color: 'white',
                        opacity: 0.9,
                        '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                        flexShrink: 0,
                      }}
                      aria-label="Next tip"
                    >
                      <KeyboardArrowRight sx={{ fontSize: 28 }} />
                    </IconButton>
                  </Box>
                  {/* Carousel dots - clickable */}
                  <Box sx={{ display: 'flex', gap: 0.75, mt: 2, justifyContent: 'center' }}>
                    {FINANCIAL_TIPS.map((_, i) => (
                      <IconButton
                        key={i}
                        onClick={() => {
                          setSlideDirection(i > tipIndex ? 'right' : 'left');
                          setTipIndex(i);
                        }}
                        sx={{
                          p: 0.5,
                          minWidth: 0,
                          '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
                        }}
                        aria-label={`Go to tip ${i + 1}`}
                      >
                        <Box
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: tipIndex === i ? '#34D399' : 'rgba(255,255,255,0.4)',
                            transition: 'all 0.3s',
                            ...(tipIndex === i && { transform: 'scale(1.2)' }),
                          }}
                        />
                      </IconButton>
                    ))}
                  </Box>
                </Paper>
              </Box>

              {/* Animated Stats Card */}
              <Paper
                elevation={0}
                sx={{
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: 2,
                  p: { xs: 2, sm: 2.5 },
                  mb: 4,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  minHeight: 56,
                  width: '100%',
                  maxWidth: '100%',
                }}
              >
                <Fade in key={statIndex} timeout={300}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      justifyContent: 'center',
                    }}
                  >
                    {React.createElement(ANIMATED_STATS[statIndex].icon, {
                      sx: { fontSize: 24, color: '#34D399' },
                    })}
                    <Typography variant="body1" sx={{ fontWeight: 600, color: 'white', fontSize: { xs: '0.875rem', sm: '1rem' }, textAlign: 'center', maxWidth: '100%' }}>
                      {ANIMATED_STATS[statIndex].value} {ANIMATED_STATS[statIndex].label}
                    </Typography>
                  </Box>
                </Fade>
              </Paper>

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
                background: '#ffffff',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.5)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset',
                width: '100%',
                maxWidth: '100%',
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
              <CardContent sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
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