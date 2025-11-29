import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Avatar,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Chip,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Receipt,
  Analytics,
  Security,
  Speed,
  CheckCircle,
} from '@mui/icons-material';
import { OnboardingData } from '../OnboardingWizard';

interface WelcomeStepProps {
  onNext: () => void;
  onDataUpdate: (data: Partial<OnboardingData>) => void;
  data: OnboardingData;
}

const WelcomeStep: React.FC<WelcomeStepProps> = ({ onNext, onDataUpdate, data }) => {
  const features = [
    {
      icon: <AccountBalance color="primary" />,
      title: 'Financial Dashboard',
      description: 'Get a complete view of your financial health in one place',
    },
    {
      icon: <Receipt color="success" />,
      title: 'Bill Management',
      description: 'Track and manage all your bills and utility payments',
    },
    {
      icon: <TrendingUp color="warning" />,
      title: 'Loan Tracking',
      description: 'Monitor your loans and payment schedules',
    },
    {
      icon: <Analytics color="info" />,
      title: 'Smart Analytics',
      description: 'Get insights and recommendations for better financial decisions',
    },
    {
      icon: <Security color="primary" />,
      title: 'Bank-Level Security',
      description: 'Your financial data is protected with enterprise-grade security',
    },
    {
      icon: <Speed color="success" />,
      title: 'Real-Time Updates',
      description: 'Stay updated with live financial information and notifications',
    },
  ];

  const benefits = [
    'Save time with automated bill tracking',
    'Never miss a payment with smart reminders',
    'Make informed decisions with detailed analytics',
    'Achieve your financial goals faster',
  ];

  return (
    <Box>
      {/* Welcome Header */}
      <Box sx={{ textAlign: 'center', mb: 4 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
          }}
        >
          <AccountBalance sx={{ fontSize: 40 }} />
        </Avatar>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Welcome to UtilityHub360
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}>
          Your comprehensive financial management platform. Let's set up your account to get you started with powerful financial tools.
        </Typography>
        
        {/* Benefits List */}
        <Box sx={{ mb: 4 }}>
          <List sx={{ maxWidth: 400, mx: 'auto' }}>
            {benefits.map((benefit, index) => (
              <ListItem key={index} sx={{ py: 0.5 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <CheckCircle color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={benefit}
                  primaryTypographyProps={{ variant: 'body2' }}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Setup Time Indicator */}
        <Chip
          label="Setup takes less than 5 minutes"
          color="success"
          variant="outlined"
          sx={{ mb: 3 }}
        />
      </Box>

      {/* Features Grid */}
      <Typography variant="h5" component="h2" gutterBottom sx={{ textAlign: 'center', mb: 3 }}>
        What You'll Get
      </Typography>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card 
              sx={{ 
                height: '100%',
                transition: 'transform 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3,
                },
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Privacy Notice */}
      <Card sx={{ bgcolor: 'grey.50', mb: 4 }}>
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
            <Security sx={{ fontSize: 16, mr: 1, verticalAlign: 'middle' }} />
            Your information is secure and will never be shared with third parties. 
            We use bank-level encryption to protect your financial data.
          </Typography>
        </CardContent>
      </Card>

      {/* Action Button */}
      <Box sx={{ textAlign: 'center' }}>
        <Button
          variant="contained"
          size="large"
          onClick={onNext}
          sx={{
            px: 4,
            py: 1.5,
            fontSize: '1.1rem',
            background: 'linear-gradient(45deg, #667eea 30%, #764ba2 90%)',
            '&:hover': {
              background: 'linear-gradient(45deg, #5a6fd8 30%, #6a4190 90%)',
            },
          }}
        >
          Let's Get Started
        </Button>
      </Box>
    </Box>
  );
};

export default WelcomeStep;
