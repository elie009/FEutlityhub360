import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Alert,
} from '@mui/material';
import { Cancel, Home, ArrowBack } from '@mui/icons-material';

const SubscriptionCancel: React.FC = () => {
  const navigate = useNavigate();

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
          <Cancel sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
          <Typography variant="h4" sx={{ mb: 2, fontWeight: 600 }}>
            Payment Cancelled
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Your payment was cancelled. No charges were made to your account.
          </Typography>
          <Alert severity="info" sx={{ mb: 3 }}>
            You can try again anytime. Your subscription will not be activated until payment is completed.
          </Alert>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={() => navigate(-1)}
              startIcon={<ArrowBack />}
            >
              Go Back
            </Button>
            <Button
              variant="contained"
              onClick={() => navigate('/dashboard')}
              startIcon={<Home />}
            >
              Go to Dashboard
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SubscriptionCancel;

