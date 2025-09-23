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
  Link,
  Container,
} from '@mui/material';
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
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Card sx={{ width: '100%', maxWidth: 400 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography component="h1" variant="h4" align="center" gutterBottom>
              Sign In
            </Typography>
            <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 3 }}>
              Access your loan management dashboard
            </Typography>
            
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="body2">
                <strong>Demo Credentials:</strong><br />
                Email: demo@utilityhub360.com<br />
                Password: Demo123!
              </Typography>
            </Alert>

            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  '& .MuiAlert-message': {
                    width: '100%'
                  }
                }}
              >
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {error}
                </Typography>
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={credentials.email}
                onChange={handleChange('email')}
                disabled={isLoading}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                value={credentials.password}
                onChange={handleChange('password')}
                disabled={isLoading}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={isLoading}
              >
                {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
              </Button>
              <Box textAlign="center">
                <Typography variant="body2">
                  Don't have an account?{' '}
                  <Link
                    component="button"
                    variant="body2"
                    onClick={onSwitchToRegister}
                    disabled={isLoading}
                  >
                    Sign up here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Container>
  );
};

export default LoginForm;
