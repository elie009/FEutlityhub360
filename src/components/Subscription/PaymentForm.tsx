import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Card,
  CardContent,
} from '@mui/material';
import { apiService } from '../../services/api';
import { SubscriptionPlan } from '../../types/subscription';

interface PaymentFormProps {
  plan: SubscriptionPlan;
  billingCycle: 'MONTHLY' | 'YEARLY';
  onSuccess: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ plan, billingCycle, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPlanPrice = () => {
    if (plan.name === 'STARTER') return 0;
    return billingCycle === 'YEARLY' && plan.yearlyPrice
      ? plan.yearlyPrice
      : plan.monthlyPrice;
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      // Create checkout session
      const session = await apiService.createCheckoutSession({
        planId: plan.id,
        billingCycle,
      });

      // Redirect to Stripe Checkout
      if (session.url) {
        window.location.href = session.url;
      } else {
        throw new Error('Checkout session URL not received');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Payment Information
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Plan: <strong>{plan.displayName}</strong>
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Billing: <strong>{billingCycle}</strong>
          </Typography>
          <Typography variant="h6" sx={{ mt: 1, fontWeight: 700 }}>
            Total: ${getPlanPrice().toFixed(2)} {billingCycle === 'YEARLY' ? '/year' : '/month'}
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            You will be redirected to Stripe's secure payment page to complete your subscription.
          </Alert>
          <Typography variant="body2" color="text.secondary">
            After payment, you'll be redirected back to complete your subscription setup.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            onClick={onCancel}
            disabled={loading}
            sx={{ minWidth: 100 }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubscribe}
            disabled={loading}
            sx={{ minWidth: 150 }}
          >
            {loading ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1 }} />
                Loading...
              </>
            ) : (
              `Pay $${getPlanPrice().toFixed(2)}`
            )}
          </Button>
        </Box>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
          Your payment is secure and encrypted. We use Stripe to process payments.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default PaymentForm;
