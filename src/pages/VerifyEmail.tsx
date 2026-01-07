import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  TextField,
} from '@mui/material';
import {
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Get email from location state or URL params
    const emailFromState = location.state?.email;
    const emailFromUrl = searchParams.get('email');
    const tokenFromUrl = searchParams.get('token');

    if (emailFromState) {
      setEmail(emailFromState);
    } else if (emailFromUrl) {
      setEmail(emailFromUrl);
    }

    if (location.state?.message) {
      setMessage(location.state.message);
    }

    // If token is in URL, auto-verify
    if (tokenFromUrl && emailFromUrl) {
      setToken(tokenFromUrl);
      handleVerify(tokenFromUrl, emailFromUrl);
    }
  }, [location, searchParams]);

  const handleVerify = async (verifyToken?: string, verifyEmail?: string) => {
    const emailToVerify = verifyEmail || email;
    const tokenToVerify = verifyToken || token;

    if (!emailToVerify || !tokenToVerify) {
      setError('Email and token are required');
      return;
    }

    setIsVerifying(true);
    setError('');
    setSuccess('');

    try {
      await apiService.verifyEmail(emailToVerify, tokenToVerify);
      setSuccess('Email verified successfully! You can now log in.');
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            message: 'Email verified successfully! Please log in.' 
          } 
        });
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check your link or request a new one.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setIsResending(true);
    setError('');
    setSuccess('');

    try {
      await apiService.resendVerificationEmail(email);
      setSuccess('Verification email sent! Please check your inbox.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend verification email');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <EmailIcon sx={{ fontSize: 64, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" gutterBottom>
            Verify Your Email
          </Typography>
          {message && (
            <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
              {message}
            </Alert>
          )}
        </Box>

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {!success && (
          <>
            <TextField
              fullWidth
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              margin="normal"
              disabled={isVerifying}
            />

            <TextField
              fullWidth
              label="Verification Token"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              margin="normal"
              disabled={isVerifying}
              placeholder="Paste the token from your email"
            />

            <Box sx={{ mt: 3, display: 'flex', gap: 2, flexDirection: 'column' }}>
              <Button
                variant="contained"
                fullWidth
                onClick={() => handleVerify()}
                disabled={isVerifying || !email || !token}
                startIcon={isVerifying ? <CircularProgress size={20} /> : <CheckCircleIcon />}
              >
                {isVerifying ? 'Verifying...' : 'Verify Email'}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={handleResendVerification}
                disabled={isResending || !email}
                startIcon={isResending ? <CircularProgress size={20} /> : <RefreshIcon />}
              >
                {isResending ? 'Sending...' : 'Resend Verification Email'}
              </Button>

              <Button
                variant="text"
                onClick={() => navigate('/login')}
              >
                Back to Login
              </Button>
            </Box>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default VerifyEmail;


