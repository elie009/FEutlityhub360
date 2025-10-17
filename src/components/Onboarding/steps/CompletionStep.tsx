import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Person as PersonIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Flag as FlagIcon,
  ArrowForward as ArrowForwardIcon,
  Dashboard as DashboardIcon,
  Receipt as ReceiptIcon,
  AccountBalance as AccountBalanceIcon,
  TrendingUp as TrendingUpIcon,
} from '@mui/icons-material';
import { OnboardingData } from '../OnboardingWizard';

interface CompletionStepProps {
  onComplete: () => void;
  onBack: () => void;
  data: OnboardingData;
  isLoading: boolean;
}

const CompletionStep: React.FC<CompletionStepProps> = ({
  onComplete,
  onBack,
  data,
  isLoading,
}) => {
  const calculateTotalMonthlyIncome = () => {
    return data.incomeSources.reduce((total, source) => {
      let monthlyAmount = source.amount;
      switch (source.frequency) {
        case 'weekly':
          monthlyAmount = source.amount * 4.33;
          break;
        case 'bi-weekly':
          monthlyAmount = source.amount * 2.17;
          break;
        case 'monthly':
          monthlyAmount = source.amount;
          break;
        case 'quarterly':
          monthlyAmount = source.amount / 3;
          break;
        case 'yearly':
          monthlyAmount = source.amount / 12;
          break;
        default:
          monthlyAmount = source.amount;
      }
      return total + monthlyAmount;
    }, 0);
  };

  const totalMonthlyIncome = calculateTotalMonthlyIncome();
  const totalGoals = data.monthlySavingsGoal + data.monthlyInvestmentGoal + data.monthlyEmergencyFundGoal;

  const nextSteps = [
    {
      icon: <ReceiptIcon />,
      title: 'Add Your Bills',
      description: 'Connect your utility bills and subscriptions for automated tracking',
      action: 'Start adding bills',
    },
    {
      icon: <AccountBalanceIcon />,
      title: 'Connect Bank Accounts',
      description: 'Link your bank accounts for real-time transaction monitoring',
      action: 'Connect accounts',
    },
    {
      icon: <TrendingUpIcon />,
      title: 'Set Up Budgets',
      description: 'Create budgets based on your income and goals',
      action: 'Create budget',
    },
    {
      icon: <DashboardIcon />,
      title: 'Explore Dashboard',
      description: 'Check out your personalized financial dashboard',
      action: 'View dashboard',
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            bgcolor: 'success.main',
          }}
        >
          {isLoading ? (
            <CircularProgress color="inherit" size={40} />
          ) : (
            <CheckCircleIcon sx={{ fontSize: 40 }} />
          )}
        </Avatar>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          {isLoading ? 'Setting Up Your Profile...' : 'Setup Complete!'}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3 }}>
          {isLoading 
            ? 'Please wait while we configure your account' 
            : 'Welcome to UtilityHub360! Your financial journey starts now.'
          }
        </Typography>
      </Box>

      {!isLoading && (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <PersonIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {data.firstName} {data.lastName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Profile Created
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <MoneyIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ${totalMonthlyIncome.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly Income
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <FlagIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  ${totalGoals.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Monthly Goals
                </Typography>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ textAlign: 'center', p: 2 }}>
                <WorkIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {data.incomeSources.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Income Sources
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Profile Summary */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                Your Profile Summary
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Personal Information
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Name" 
                        secondary={`${data.firstName} ${data.lastName}`}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Phone" 
                        secondary={data.phone || 'Not provided'}
                      />
                    </ListItem>
                    {!data.isUnemployed && (
                      <ListItem sx={{ px: 0 }}>
                        <ListItemText 
                          primary="Employment" 
                          secondary={`${data.jobTitle} at ${data.company}`}
                        />
                      </ListItem>
                    )}
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                    Financial Goals
                  </Typography>
                  <List dense>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Monthly Savings" 
                        secondary={`$${data.monthlySavingsGoal.toLocaleString()}`}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Monthly Investment" 
                        secondary={`$${data.monthlyInvestmentGoal.toLocaleString()}`}
                      />
                    </ListItem>
                    <ListItem sx={{ px: 0 }}>
                      <ListItemText 
                        primary="Emergency Fund" 
                        secondary={`$${data.monthlyEmergencyFundGoal.toLocaleString()}`}
                      />
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Next Steps */}
          <Card sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                What's Next?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Here are some recommended next steps to get the most out of UtilityHub360:
              </Typography>

              <Grid container spacing={2}>
                {nextSteps.map((step, index) => (
                  <Grid item xs={12} sm={6} key={index}>
                    <Card variant="outlined" sx={{ p: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.light', width: 40, height: 40 }}>
                          {step.icon}
                        </Avatar>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                            {step.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {step.description}
                          </Typography>
                          <Chip 
                            label={step.action}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </CardContent>
          </Card>

          {/* Success Message */}
          <Alert severity="success" sx={{ mb: 4 }}>
            <Typography variant="body2">
              <strong>Congratulations!</strong> Your UtilityHub360 account is now set up and ready to use. 
              You can access all features from the main dashboard.
            </Typography>
          </Alert>
        </>
      )}

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
        {!isLoading && (
          <Button
            onClick={onBack}
            variant="outlined"
          >
            Back
          </Button>
        )}
        
        <Box sx={{ flex: 1 }} />
        
        <Button
          onClick={onComplete}
          variant="contained"
          disabled={isLoading}
          endIcon={isLoading ? <CircularProgress size={20} /> : <ArrowForwardIcon />}
          sx={{
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
            },
          }}
        >
          {isLoading ? 'Setting Up...' : 'Complete Setup'}
        </Button>
      </Box>
    </Box>
  );
};

export default CompletionStep;
