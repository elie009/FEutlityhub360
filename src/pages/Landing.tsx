import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  useTheme,
  alpha,
} from '@mui/material';
import {
  TrendingUp,
  AccountBalance,
  Security,
  Speed,
  CloudDone,
  Analytics as AnalyticsIcon,
} from '@mui/icons-material';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();

  const features = [
    {
      icon: <TrendingUp sx={{ fontSize: 48 }} />,
      title: 'Smart Analytics',
      description: 'Track your spending patterns and get insights to make better financial decisions.',
    },
    {
      icon: <AccountBalance sx={{ fontSize: 48 }} />,
      title: 'Bill Management',
      description: 'Never miss a payment. Manage all your bills in one place with automatic reminders.',
    },
    {
      icon: <Security sx={{ fontSize: 48 }} />,
      title: 'Bank-Level Security',
      description: 'Your data is protected with 256-bit encryption and multi-factor authentication.',
    },
    {
      icon: <Speed sx={{ fontSize: 48 }} />,
      title: 'Real-Time Updates',
      description: 'Get instant notifications about transactions, bills, and account activities.',
    },
    {
      icon: <CloudDone sx={{ fontSize: 48 }} />,
      title: 'Cloud Sync',
      description: 'Access your financial data from anywhere, synced across all your devices.',
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 48 }} />,
      title: 'Detailed Reports',
      description: 'Generate comprehensive reports to understand your financial health better.',
    },
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Navigation Bar */}
      <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, color: 'primary.main', fontWeight: 700 }}>
            💰 FinanceApp
          </Typography>
          <Button color="primary" onClick={() => navigate('/app')} sx={{ mr: 2 }}>
            Login
          </Button>
          <Button variant="contained" color="primary" onClick={() => navigate('/app/dashboard')}>
            Get Started
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          pt: 15,
          pb: 10,
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.1)} 100%)`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography
                variant="h2"
                component="h1"
                gutterBottom
                sx={{
                  fontWeight: 800,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Take Control of Your Finances
              </Typography>
              <Typography variant="h5" color="text.secondary" paragraph sx={{ mb: 4 }}>
                Manage bills, track expenses, and achieve your financial goals with our powerful platform.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  color="primary"
                  onClick={() => navigate('/app/dashboard')}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                    boxShadow: 3,
                  }}
                >
                  Get Started Free
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    const featuresSection = document.getElementById('features');
                    if (featuresSection) {
                      featuresSection.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  sx={{
                    px: 4,
                    py: 1.5,
                    fontSize: '1.1rem',
                    textTransform: 'none',
                  }}
                >
                  Learn More
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  position: 'relative',
                  height: 400,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    borderRadius: 4,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.2)} 0%, ${alpha(theme.palette.secondary.main, 0.2)} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: 3,
                  }}
                >
                  <Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
                    📊 Dashboard Preview
                  </Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }} id="features">
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography variant="h3" component="h2" gutterBottom sx={{ fontWeight: 700 }}>
            Everything You Need
          </Typography>
          <Typography variant="h6" color="text.secondary">
            Powerful features to help you manage your money better
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card
                sx={{
                  height: '100%',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent sx={{ p: 4, textAlign: 'center' }}>
                  <Box
                    sx={{
                      color: 'primary.main',
                      mb: 2,
                      display: 'flex',
                      justifyContent: 'center',
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 600 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          py: 10,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
        }}
      >
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h3" component="h2" gutterBottom sx={{ color: 'white', fontWeight: 700 }}>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" paragraph sx={{ color: 'rgba(255, 255, 255, 0.9)', mb: 4 }}>
              Join thousands of users who are already taking control of their finances.
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/app/dashboard')}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                textTransform: 'none',
                bgcolor: 'white',
                color: 'primary.main',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.9)',
                },
                boxShadow: 3,
              }}
            >
              Start Managing Your Finances
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary" align="center">
            © 2025 FinanceApp. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
