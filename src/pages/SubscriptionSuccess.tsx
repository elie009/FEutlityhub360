import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Alert,
} from '@mui/material';
import { CheckCircle, Home } from '@mui/icons-material';
import { apiService } from '../services/api';

const SubscriptionSuccess: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionId = searchParams.get('session_id');

  // Fix double slash in URL if present
  useEffect(() => {
    if (location.pathname.includes('//')) {
      const normalizedPath = location.pathname.replace(/\/+/g, '/');
      if (normalizedPath !== location.pathname) {
        window.history.replaceState({}, '', normalizedPath + location.search);
      }
    }
  }, [location]);

  useEffect(() => {
    const verifySession = async () => {
      if (!sessionId) {
        console.warn('SubscriptionSuccess: No session ID found');
        setError('No session ID found. Please contact support if you completed payment.');
        setLoading(false);
        return;
      }

      try {
        console.log('SubscriptionSuccess: Verifying session', { sessionId, pathname: location.pathname });
        setLoading(true);
        
        // Verify the session with backend - this will activate the subscription
        await apiService.verifyCheckoutSession({ sessionId });
        
        // Session verified and subscription activated successfully
        console.log('SubscriptionSuccess: Session verified successfully');
        setLoading(false);
      } catch (err: any) {
        console.error('SubscriptionSuccess: Session verification failed', err);
        setError(err.message || 'Failed to verify payment. Please contact support if payment was completed.');
        setLoading(false);
      }
    };

    verifySession();
  }, [sessionId, location.pathname]);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 500, width: '100%' }}>
        <CardContent sx={{ textAlign: 'center', p: 4 }}>
          {loading ? (
            <>
              <CircularProgress sx={{ mb: 2 }} />
              <Typography variant="h6">Processing your subscription...</Typography>
            </>
          ) : error ? (
            <>
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
              <Button
                variant="contained"
                onClick={() => navigate('/dashboard')}
                startIcon={<Home />}
              >
                Go to Dashboard
              </Button>
            </>
          ) : (
            <>
              <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
                Payment Successful!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                Your subscription has been activated successfully. You now have access to all premium features.
              </Typography>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate('/dashboard')}
                startIcon={<Home />}
                sx={{ minWidth: 200 }}
              >
                Go to Dashboard
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SubscriptionSuccess;

