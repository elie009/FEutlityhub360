import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
} from '@mui/material';
import { Close as CloseIcon, CheckCircle, ArrowBack } from '@mui/icons-material';
import { apiService } from '../../services/api';
import { SubscriptionPlan, UserSubscription } from '../../types/subscription';
import PaymentForm from './PaymentForm';

interface SubscriptionModalProps {
  open: boolean;
  onClose: () => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ open, onClose }) => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);

  useEffect(() => {
    if (open) {
      fetchPlans();
    }
  }, [open]);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch plans and subscription in parallel
      const [subscriptionPlans, subscription] = await Promise.all([
        apiService.getSubscriptionPlans(true),
        apiService.getMySubscription().catch(() => null) // Don't fail if no subscription
      ]);
      
      // Filter to show only STARTER, PROFESSIONAL, and ENTERPRISE
      const filteredPlans = subscriptionPlans.filter(
        plan => plan.name === 'STARTER' || plan.name === 'PROFESSIONAL' || plan.name === 'ENTERPRISE'
      );
      // Sort by display order
      filteredPlans.sort((a, b) => a.displayOrder - b.displayOrder);
      setPlans(filteredPlans);
      setUserSubscription(subscription);
      
      // Sync billing cycle toggle with user's subscription
      if (subscription && subscription.billingCycle) {
        setSelectedBillingCycle(subscription.billingCycle);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const getPlanColor = (planName: string) => {
    switch (planName) {
      case 'STARTER':
        return '#4caf50'; // Green
      case 'PROFESSIONAL':
        return '#004E9B'; // Dark Blue
      case 'ENTERPRISE':
        return '#ffc107'; // Gold/Yellow
      default:
        return '#666666';
    }
  };

  const getPlanDisplayName = (plan: SubscriptionPlan) => {
    if (plan.name === 'STARTER') return 'Free';
    if (plan.name === 'PROFESSIONAL') return 'Premium';
    if (plan.name === 'ENTERPRISE') return 'Premium Plus';
    return plan.displayName;
  };

  const getPlanPrice = (plan: SubscriptionPlan) => {
    if (plan.name === 'STARTER') return 0;
    return selectedBillingCycle === 'YEARLY' && plan.yearlyPrice
      ? plan.yearlyPrice
      : plan.monthlyPrice;
  };

  const getPlanFeatures = (plan: SubscriptionPlan) => {
    const features: string[] = [];
    
    if (plan.name === 'STARTER') {
      features.push('Dashboard');
      features.push('Up to 3 bank accounts');
      features.push('Unlimited transactions');
      features.push('Up to 5 bills per month');
      features.push('Up to 5 loans');
      features.push('Up to 5 savings goals');
      features.push('Basic reports');
      features.push('AI Assistant (10 queries/month)');
      features.push('Email support (48h response)');
    } else if (plan.name === 'PROFESSIONAL') {
      features.push('Everything in Free');
      features.push('Unlimited bank accounts');
      features.push('Unlimited bills');
      features.push('Unlimited loans');
      features.push('Unlimited savings goals');
      features.push('Advanced reports');
      features.push('AI Assistant (unlimited)');
      features.push('Bank feed integration');
      features.push('Receipt OCR');
      features.push('Financial Health Score');
      features.push('Bill Forecasting');
      features.push('Debt Optimizer');
      features.push('Priority support (24h response)');
    } else if (plan.name === 'ENTERPRISE') {
      features.push('Everything in Premium');
      features.push('Unlimited Receipt OCR');
      features.push('Investment Tracking');
      features.push('Tax Optimization');
      features.push('Multi-User Support (5 users)');
      features.push('API Access (1,000 calls/month)');
      features.push('White-Label Options');
      features.push('Custom integrations');
      features.push('Dedicated support (4h response)');
      features.push('Account manager');
      features.push('Custom reporting');
      features.push('Advanced security');
      features.push('Compliance reports');
    }
    
    return features;
  };

  const isCurrentPlan = (plan: SubscriptionPlan) => {
    if (!userSubscription) return false;
    return userSubscription.subscriptionPlanId === plan.id && 
           userSubscription.status === 'ACTIVE';
  };

  const handleChoosePlan = (plan: SubscriptionPlan) => {
    // Don't allow selecting the current plan
    if (isCurrentPlan(plan)) {
      return;
    }
    
    if (plan.name === 'STARTER') {
      // Free plan - no payment needed
      alert('You are already on the Free plan!');
      return;
    }
    
    // Show payment form for paid plans
    setSelectedPlan(plan);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
    // Refresh subscription data
    fetchPlans();
    alert('Subscription activated successfully! Welcome to Premium!');
    onClose();
  };

  const handlePaymentCancel = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  const handleBackToPlans = () => {
    setShowPaymentForm(false);
    setSelectedPlan(null);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          boxShadow: '0 32px 64px -12px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(25, 118, 210, 0.08)',
          border: '1px solid rgba(25, 118, 210, 0.12)',
          maxHeight: '95vh',
          background: 'linear-gradient(145deg, #ffffff 0%, #fafafa 100%)',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: 'linear-gradient(90deg, #1976d2 0%, #42a5f5 50%, #1976d2 100%)',
            borderRadius: '4px 4px 0 0',
          },
        },
      }}
    >
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
          borderBottom: '1px solid #e5e5e5',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {showPaymentForm && (
            <IconButton
              onClick={handleBackToPlans}
              sx={{
                color: '#666666',
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              <ArrowBack />
            </IconButton>
          )}
          <Typography
            variant="h4"
            component="h2"
            sx={{
              fontWeight: 800,
              background: showPaymentForm
                ? 'linear-gradient(135deg, #2e7d32 0%, #4caf50 100%)'
                : 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em',
              fontFamily: 'Inter, system-ui, sans-serif',
            }}
          >
            {showPaymentForm ? '💳 Complete Payment' : '🚀 Choose Your Plan'}
          </Typography>
        </Box>
        <IconButton
          onClick={onClose}
          sx={{
            color: '#666666',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.05)',
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 4 }}>
        {showPaymentForm && selectedPlan ? (
          <PaymentForm
            plan={selectedPlan}
            billingCycle={selectedBillingCycle}
            onSuccess={handlePaymentSuccess}
            onCancel={handlePaymentCancel}
          />
        ) : loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>
        ) : (
          <>
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  color: '#1976d2',
                  mb: 2,
                  fontSize: '1.8rem',
                  fontWeight: 700,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 50%, #1976d2 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 2px 4px rgba(25, 118, 210, 0.1)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.3,
                  animation: 'fadeInUp 0.8s ease-out',
                  '@keyframes fadeInUp': {
                    '0%': {
                      opacity: 0,
                      transform: 'translateY(20px)',
                    },
                    '100%': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                  },
                }}
              >
                ✨ Select the perfect plan for your financial management needs
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#666666',
                  fontSize: '1.1rem',
                  fontWeight: 400,
                  fontFamily: 'Inter, system-ui, sans-serif',
                  maxWidth: '800px',
                  mx: 'auto',
                  lineHeight: 1.6,
                  marginBottom: '10px',
                  opacity: 0.9,
                }}
              >
                Choose the plan that fits your lifestyle and take control of your financial future
              </Typography>
              
              {/* Billing Cycle Toggle */}
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                <Button
                  variant={selectedBillingCycle === 'MONTHLY' ? 'contained' : 'outlined'}
                  onClick={() => setSelectedBillingCycle('MONTHLY')}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    backgroundColor: selectedBillingCycle === 'MONTHLY' ? '#4caf50' : 'transparent',
                    color: selectedBillingCycle === 'MONTHLY' ? 'white' : '#666666',
                    borderColor: '#4caf50',
                    '&:hover': {
                      backgroundColor: selectedBillingCycle === 'MONTHLY' ? '#45a049' : 'rgba(76, 175, 80, 0.1)',
                    },
                  }}
                >
                  Monthly
                </Button>
                <Button
                  variant={selectedBillingCycle === 'YEARLY' ? 'contained' : 'outlined'}
                  onClick={() => setSelectedBillingCycle('YEARLY')}
                  sx={{
                    borderRadius: 2,
                    px: 3,
                    py: 1,
                    fontWeight: 600,
                    backgroundColor: selectedBillingCycle === 'YEARLY' ? '#4caf50' : 'transparent',
                    color: selectedBillingCycle === 'YEARLY' ? 'white' : '#666666',
                    borderColor: '#4caf50',
                    '&:hover': {
                      backgroundColor: selectedBillingCycle === 'YEARLY' ? '#45a049' : 'rgba(76, 175, 80, 0.1)',
                    },
                  }}
                >
                  Yearly
                  {selectedBillingCycle === 'YEARLY' && (
                    <Chip
                      label="Save 17%"
                      size="small"
                      sx={{
                        ml: 1,
                        height: 20,
                        fontSize: '0.7rem',
                        backgroundColor: '#fff',
                        color: '#4caf50',
                        fontWeight: 700,
                      }}
                    />
                  )}
                </Button>
              </Box>
            </Box>

            <Grid container spacing={3} justifyContent="center">
              {plans.map((plan) => {
                const planColor = getPlanColor(plan.name);
                const displayName = getPlanDisplayName(plan);
                const price = getPlanPrice(plan);
                const features = getPlanFeatures(plan);

                return (
                  <Grid item xs={12} sm={6} md={4} key={plan.id}>
                    <Card
                      sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        borderRadius: 3,
                        border: `2px solid ${planColor}`,
                        boxShadow: isCurrentPlan(plan) 
                          ? '0 8px 24px rgba(76, 175, 80, 0.3)' 
                          : '0 4px 12px rgba(0, 0, 0, 0.1)',
                        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                        position: 'relative',
                        '&:hover': {
                          transform: isCurrentPlan(plan) ? 'none' : 'translateY(-8px)',
                          boxShadow: isCurrentPlan(plan) 
                            ? '0 8px 24px rgba(76, 175, 80, 0.3)' 
                            : '0 8px 24px rgba(0, 0, 0, 0.15)',
                        },
                      }}
                    >
                      {/* Current Plan Badge */}
                      {isCurrentPlan(plan) && (
                        <Chip
                          label="Current Plan"
                          color="success"
                          size="small"
                          sx={{
                            position: 'absolute',
                            top: 8,
                            right: 8,
                            fontWeight: 600,
                            zIndex: 1,
                          }}
                        />
                      )}
                      
                      {/* Header */}
                      <Box
                        sx={{
                          backgroundColor: planColor,
                          color: 'white',
                          py: 2,
                          px: 3,
                          borderTopLeftRadius: 8,
                          borderTopRightRadius: 8,
                        }}
                      >
                        <Typography
                          variant="h5"
                          component="h2"
                          sx={{
                            fontWeight: 700,
                            textAlign: 'center',
                            color: 'white',
                          }}
                        >
                          {displayName}
                        </Typography>
                      </Box>

                      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', p: 3 }}>
                        {/* Price */}
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                          <Typography
                            variant="h3"
                            component="div"
                            sx={{
                              fontWeight: 700,
                              color: '#1a1a1a',
                              mb: 1,
                            }}
                          >
                            {plan.name === 'STARTER' ? (
                              'Free'
                            ) : (
                              <>
                                ${price.toFixed(2)}
                                <Typography
                                  component="span"
                                  variant="body1"
                                  sx={{ color: '#666666', ml: 0.5, fontWeight: 400 }}
                                >
                                  {selectedBillingCycle === 'YEARLY' ? '/year' : '/month'}
                                </Typography>
                              </>
                            )}
                          </Typography>
                        </Box>

                        {/* Description */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: '#666666',
                            mb: 3,
                            minHeight: 60,
                            textAlign: 'center',
                            lineHeight: 1.6,
                          }}
                        >
                          {plan.description || `Perfect for ${displayName.toLowerCase()} users`}
                        </Typography>

                        {/* Features List */}
                        <List sx={{ flexGrow: 1, mb: 3, px: 0, maxHeight: 300, overflowY: 'auto' }}>
                          {features.map((feature, index) => (
                            <ListItem key={index} sx={{ px: 0, py: 0.5 }}>
                              <CheckCircle
                                sx={{
                                  color: planColor,
                                  fontSize: 20,
                                  mr: 1.5,
                                  flexShrink: 0,
                                }}
                              />
                              <ListItemText
                                primary={feature}
                                primaryTypographyProps={{
                                  variant: 'body2',
                                  sx: {
                                    color: '#666666',
                                    fontSize: '0.875rem',
                                  },
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>

                        {/* Choose Button */}
                        <Button
                          variant={isCurrentPlan(plan) ? "outlined" : "contained"}
                          fullWidth
                          onClick={() => handleChoosePlan(plan)}
                          disabled={isCurrentPlan(plan)}
                          sx={{
                            backgroundColor: isCurrentPlan(plan) ? 'transparent' : planColor,
                            color: isCurrentPlan(plan) ? planColor : 'white',
                            borderColor: planColor,
                            borderWidth: isCurrentPlan(plan) ? 2 : 0,
                            fontWeight: 700,
                            fontSize: '1rem',
                            py: 1.5,
                            borderRadius: 2,
                            textTransform: 'none',
                            mt: 'auto',
                            '&:hover': {
                              backgroundColor: isCurrentPlan(plan) 
                                ? 'rgba(0, 0, 0, 0.05)' 
                                : planColor,
                              opacity: isCurrentPlan(plan) ? 1 : 0.9,
                              transform: isCurrentPlan(plan) ? 'none' : 'scale(1.02)',
                            },
                            '&:disabled': {
                              backgroundColor: 'transparent',
                              color: planColor,
                              borderColor: planColor,
                              opacity: 0.7,
                            },
                            transition: 'all 0.2s ease',
                          }}
                        >
                          {isCurrentPlan(plan) ? 'Current Plan' : 'Choose'}
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default SubscriptionModal;

