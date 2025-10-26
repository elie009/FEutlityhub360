import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Paper,
  useTheme,
  alpha,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Avatar,
  Stack,
  Divider,
  Fade,
  Slide,
  Zoom,
} from '@mui/material';
import {
  AccountBalance,
  TrendingUp,
  Receipt,
  Analytics,
  Security,
  Speed,
  Star,
  CheckCircle,
  ArrowForward,
  Dashboard,
  Savings,
  Assessment,
  Menu,
  Close,
  Phone,
  Email,
  LocationOn,
  Facebook,
  Twitter,
  LinkedIn,
  Instagram,
  PlayArrow,
  Business,
  People,
  AttachMoney,
  Timeline,
  Shield,
  Support,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const services = [
    {
      icon: <AccountBalance sx={{ fontSize: 50, color: 'primary.main' }} />,
      title: 'Bank Account Management',
      description: 'Connect and manage multiple bank accounts with real-time balance tracking and transaction history.',
      features: ['Multi-account support', 'Real-time updates', 'Transaction categorization']
    },
    {
      icon: <Receipt sx={{ fontSize: 50, color: 'success.main' }} />,
      title: 'Smart Bill Management',
      description: 'Automate your bill payments with intelligent scheduling and reminder systems.',
      features: ['Auto-pay setup', 'Due date reminders', 'Payment tracking']
    },
    {
      icon: <TrendingUp sx={{ fontSize: 50, color: 'info.main' }} />,
      title: 'Financial Analytics',
      description: 'Get comprehensive insights into your spending patterns and financial health.',
      features: ['Spending analysis', 'Budget tracking', 'Financial reports']
    },
    {
      icon: <Savings sx={{ fontSize: 50, color: 'warning.main' }} />,
      title: 'Savings & Investment',
      description: 'Set and achieve your financial goals with automated savings and investment tracking.',
      features: ['Goal setting', 'Progress tracking', 'Investment monitoring']
    },
    {
      icon: <Assessment sx={{ fontSize: 50, color: 'secondary.main' }} />,
      title: 'Loan Management',
      description: 'Manage all your loans with payment optimization and debt reduction strategies.',
      features: ['Payment scheduling', 'Interest tracking', 'Debt optimization']
    },
    {
      icon: <Security sx={{ fontSize: 50, color: 'error.main' }} />,
      title: 'Bank-Level Security',
      description: 'Your financial data is protected with enterprise-grade security and encryption.',
      features: ['End-to-end encryption', 'Secure authentication', 'Data privacy']
    },
  ];

  const stats = [
    { number: '10K+', label: 'Active Users' },
    { number: formatCurrency(50000000, { showSymbol: true, decimals: 0 }).replace(/[0-9,]/g, '') + '50M+', label: 'Assets Managed' },
    { number: '99.9%', label: 'Uptime' },
    { number: '4.9/5', label: 'User Rating' },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Financial Advisor',
      content: 'UtilityHub360 has revolutionized how I manage my finances. The analytics are incredibly insightful.',
      avatar: 'SJ'
    },
    {
      name: 'Michael Chen',
      role: 'Business Owner',
      content: 'The bill management feature saved me hours every month. Highly recommended!',
      avatar: 'MC'
    },
    {
      name: 'Emily Davis',
      role: 'Investment Manager',
      content: 'The investment tracking and goal setting features are exactly what I needed.',
      avatar: 'ED'
    },
  ];

  return (
    <Box>
      {/* Navigation Bar */}
      <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: 1 }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
            UtilityHub360
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
            <Button color="inherit">Home</Button>
            <Button color="inherit">Services</Button>
            <Button color="inherit">About</Button>
            <Button color="inherit">Contact</Button>
            <Button variant="contained" onClick={handleGetStarted}>
              Get Started
            </Button>
          </Box>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { md: 'none' } }}
          >
            <Menu />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
      >
        <Box sx={{ width: 250, p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight="bold" color="primary.main">
              UtilityHub360
            </Typography>
            <IconButton onClick={handleDrawerToggle}>
              <Close />
            </IconButton>
          </Box>
          <List>
            <ListItem button>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Services" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="About" />
            </ListItem>
            <ListItem button>
              <ListItemText primary="Contact" />
            </ListItem>
            <ListItem>
              <Button variant="contained" fullWidth onClick={handleGetStarted}>
                Get Started
              </Button>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Hero Section */}
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
          color: 'white',
          pt: 12,
          pb: 8,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          },
        }}
      >
        <Container maxWidth="lg">
          <Fade in={isVisible} timeout={1000}>
            <Grid container spacing={6} alignItems="center">
              <Grid item xs={12} md={6}>
                <Typography variant="h1" component="h1" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' } }}>
                  Your Financial
                  <br />
                  <Box component="span" sx={{ color: 'warning.main' }}>
                    Future Starts Here
                  </Box>
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, fontWeight: 300 }}>
                  Comprehensive financial management platform that helps you take control of your money, 
                  automate your finances, and achieve your financial goals.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    endIcon={<ArrowForward />}
                    sx={{
                      bgcolor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.common.white, 0.9),
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    Get Started Free
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayArrow />}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: alpha(theme.palette.common.white, 0.1),
                      },
                    }}
                  >
                    Watch Demo
                  </Button>
                </Stack>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Shield sx={{ color: 'white' }} />
                    <Typography variant="body2" sx={{ color: 'rgba(0, 0, 0, 0.8)' }}>Bank-Level Security</Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Zoom in={isVisible} timeout={1500}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      height: 500,
                      position: 'relative',
                    }}
                  >
                    <Box
                      sx={{
                        width: 400,
                        height: 400,
                        borderRadius: '50%',
                        background: `linear-gradient(45deg, ${alpha(theme.palette.common.white, 0.1)} 0%, ${alpha(theme.palette.common.white, 0.05)} 100%)`,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: -20,
                          left: -20,
                          right: -20,
                          bottom: -20,
                          borderRadius: '50%',
                          border: `2px solid ${alpha(theme.palette.common.white, 0.2)}`,
                        },
                      }}
                    >
                      <Dashboard sx={{ fontSize: 120, opacity: 0.8 }} />
                    </Box>
                  </Box>
                </Zoom>
              </Grid>
            </Grid>
          </Fade>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 6 }}>
        <Container maxWidth="lg">
          <Slide in={isVisible} timeout={1000} direction="up">
            <Grid container spacing={4}>
              {stats.map((stat, index) => (
                <Grid item xs={6} md={3} key={index}>
                  <Box textAlign="center">
                    <Typography variant="h3" component="div" fontWeight="bold" color="primary.main">
                      {stat.number}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Slide>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box textAlign="center" mb={8}>
          <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
            Comprehensive Financial Services
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Everything you need to manage your finances effectively, all in one secure platform
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {services.map((service, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <Fade in={isVisible} timeout={1000 + index * 200}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease-in-out',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: theme.shadows[12],
                    },
                  }}
                >
                  <CardContent sx={{ flexGrow: 1, p: 4 }}>
                    <Box sx={{ mb: 3, textAlign: 'center' }}>
                      {service.icon}
                    </Box>
                    <Typography variant="h5" component="h3" gutterBottom fontWeight="bold" textAlign="center">
                      {service.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
                      {service.description}
                    </Typography>
                    <Box>
                      {service.features.map((feature, featureIndex) => (
                        <Box key={featureIndex} sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 16 }} />
                          <Typography variant="body2">{feature}</Typography>
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Fade>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Testimonials Section */}
      <Box sx={{ bgcolor: 'grey.50', py: 10 }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={8}>
            <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
              What Our Users Say
            </Typography>
            <Typography variant="h6" color="text.secondary">
              Join thousands of satisfied customers who trust UtilityHub360
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in={isVisible} timeout={1000 + index * 300}>
                  <Card sx={{ height: '100%', p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role}
                        </Typography>
                      </Box>
                    </Box>
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                      "{testimonial.content}"
                    </Typography>
                    <Box sx={{ display: 'flex', mt: 2 }}>
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} sx={{ color: 'warning.main', fontSize: 20 }} />
                      ))}
                    </Box>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: 10, textAlign: 'center', bgcolor: 'primary.main', color: 'white' }}>
        <Container maxWidth="md">
          <Fade in={isVisible} timeout={1000}>
            <Box>
              <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
                Ready to Transform Your Financial Life?
              </Typography>
              <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
                Join thousands of users who have already taken control of their finances
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  endIcon={<ArrowForward />}
                  sx={{
                    bgcolor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      bgcolor: alpha(theme.palette.common.white, 0.9),
                      transform: 'translateY(-2px)',
                    },
                  }}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                    },
                  }}
                >
                  Contact Sales
                </Button>
              </Stack>
            </Box>
          </Fade>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'grey.900', color: 'white', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h5" gutterBottom fontWeight="bold" color="primary.main">
                UtilityHub360
              </Typography>
              <Typography variant="body2" sx={{ mb: 3, opacity: 0.8 }}>
                Your trusted partner in financial management. Secure, reliable, and designed 
                to help you achieve your financial goals.
              </Typography>
              <Stack direction="row" spacing={2}>
                <IconButton sx={{ color: 'white' }}>
                  <Facebook />
                </IconButton>
                <IconButton sx={{ color: 'white' }}>
                  <Twitter />
                </IconButton>
                <IconButton sx={{ color: 'white' }}>
                  <LinkedIn />
                </IconButton>
                <IconButton sx={{ color: 'white' }}>
                  <Instagram />
                </IconButton>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                Services
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Banking</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Bill Management</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Analytics</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Savings</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                Company
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>About Us</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Careers</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Press</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Blog</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                Support
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Help Center</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Contact</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Privacy</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>Terms</Typography>
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="h6" gutterBottom sx={{ color: 'white' }}>
                Contact
              </Typography>
              <Stack spacing={1}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Phone sx={{ fontSize: 16 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>+1 (555) 123-4567</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Email sx={{ fontSize: 16 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>support@utilityhub360.com</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationOn sx={{ fontSize: 16 }} />
                  <Typography variant="body2" sx={{ opacity: 0.8 }}>New York, NY</Typography>
                </Box>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, bgcolor: 'grey.700' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ opacity: 0.8 }}>
              © 2024 UtilityHub360. All rights reserved.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Privacy Policy</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Terms of Service</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>Cookie Policy</Typography>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
