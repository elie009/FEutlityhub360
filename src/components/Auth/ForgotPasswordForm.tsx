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
  InputAdornment,
} from '@mui/material';
import {
  Email,
  ArrowBack,
  Send,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { validateEmail } from '../../utils/validation';

const ForgotPasswordForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate email
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      await forgotPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send password reset email';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/auth');
  };

  if (success) {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: 2,
        }}
      >
        <Card sx={{ maxWidth: 400, width: '100%' }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  backgroundColor: 'success.light',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <Send sx={{ fontSize: 40, color: 'white' }} />
              </Box>
              <Typography variant="h4" component="h1" gutterBottom>
                Check Your Email
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                We've sent a password reset link to <strong>{email}</strong>
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                If you don't see the email, check your spam folder or try again.
              </Alert>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                fullWidth
                onClick={handleBackToLogin}
                startIcon={<ArrowBack />}
                sx={{
                  py: 1.5,
                  background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                  },
                }}
              >
                Back to Login
              </Button>
              
              <Button
                variant="outlined"
                fullWidth
                onClick={() => {
                  setSuccess(false);
                  setEmail('');
                }}
                sx={{ py: 1.5 }}
              >
                Try Different Email
              </Button>
            </Box>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: 2,
      }}
    >
      <Card sx={{ maxWidth: 400, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                backgroundColor: 'primary.light',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <Email sx={{ fontSize: 40, color: 'white' }} />
            </Box>
            <Typography variant="h4" component="h1" gutterBottom>
              Forgot Password?
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Enter your email address and we'll send you a link to reset your password.
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ mb: 3 }}>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              sx={{
                py: 1.5,
                background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
                },
                '&:disabled': {
                  background: 'rgba(0, 0, 0, 0.12)',
                },
              }}
            >
              {isLoading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                'Send Reset Link'
              )}
            </Button>
          </Box>

          <Box sx={{ textAlign: 'center' }}>
            <Button
              component={Link}
              to="/auth"
              startIcon={<ArrowBack />}
              sx={{ color: 'text.secondary' }}
            >
              Back to Login
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default ForgotPasswordForm;
