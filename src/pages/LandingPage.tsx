import React, { useState, useEffect, useRef } from 'react';
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
  CameraAlt,
  Smartphone,
  SmartToy,
  Sms,
  CloudUpload,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleContactClick = () => {
    navigate('/contact');
  };

  const handleServicesClick = () => {
    servicesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false); // Close mobile drawer if open
  };

  const handleAboutClick = () => {
    aboutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileOpen(false); // Close mobile drawer if open
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
    { number: '50M+', label: 'Assets Managed' },
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
    <Box sx={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Navigation Bar */}
      <AppBar position="fixed" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: 1, fontFamily: 'Poppins, sans-serif' }}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
            UtilityHub360
          </Typography>
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 3 }}>
            <Button color="inherit" onClick={handleServicesClick}>Services</Button>
            <Button color="inherit" onClick={handleAboutClick}>About</Button>
            <Button color="inherit" onClick={handleContactClick}>Contact</Button>
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
            <ListItem button onClick={handleServicesClick}>
              <ListItemText primary="Services" />
            </ListItem>
            <ListItem button onClick={handleAboutClick}>
              <ListItemText primary="About" />
            </ListItem>
            <ListItem button onClick={handleContactClick}>
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
          pb: 0,
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
                <Typography variant="h1" component="h1" gutterBottom fontWeight="bold" sx={{ fontSize: { xs: '2.5rem', md: '3.5rem' }, fontFamily: 'Poppins, sans-serif' }}>
                  Your Financial
                  <br />
                  <Box component="span" sx={{ color: 'warning.main', fontFamily: 'Poppins, sans-serif' }}>
                    Future Starts Here
                  </Box>
                </Typography>
                <Typography variant="h5" sx={{ mb: 4, opacity: 0.9, fontWeight: 300 }}>
                  Comprehensive financial management platform powered by AI. Upload receipts and let AI track your 
                  expenses automatically. Get instant SMS notifications for all transactions via mobile app integration.
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }}>
                  <Button
                    variant="outlined"
                    size="large"
                    onClick={handleGetStarted}
                    endIcon={<ArrowForward />}
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      bgcolor: 'transparent',
                      px: 4,
                      py: 1.5,
                      '&:hover': {
                        borderColor: 'white',
                        bgcolor: alpha(theme.palette.common.white, 0.1),
                      },
                    }}
                  >
                    Get Started Free
                  </Button>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6} sx={{ display: 'flex', alignItems: 'stretch' }}>
                <Zoom in={isVisible} timeout={1500} style={{ width: '100%', height: '100%' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                      position: 'relative',
                      py: { xs: 4, md: 0 },
                    }}
                  >
                    <Box
                      component="img"
                      src="/financialCards.png.png"
                      alt="Financial Management - Credit Cards with AI Technology"
                      sx={{
                        width: '130%',
                        height: 'auto',
                        maxHeight: '130%',
                        objectFit: 'contain',
                        filter: 'drop-shadow(0px 10px 30px rgba(0, 0, 0, 0.3))',
                      }}
                    />
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

      {/* AI-Powered Features Section - HIGHLIGHTED */}
      <Box sx={{ 
        background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)`,
        py: 10,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <Container maxWidth="lg">
          <Box textAlign="center" mb={6}>
            <Chip 
              label="🚀 AI-POWERED INNOVATION" 
              color="primary" 
              sx={{ 
                mb: 2, 
                fontWeight: 'bold',
                fontSize: '0.9rem',
                py: 3,
                px: 2,
              }} 
            />
            <Typography variant="h2" component="h2" gutterBottom fontWeight="bold" color="primary.main">
              Next-Generation Smart Features
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Powered by cutting-edge AI technology and mobile integration
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {/* AI Receipt Scanner */}
            <Grid item xs={12} md={6}>
              <Zoom in={isVisible} timeout={1200}>
                <Card
                  sx={{
                    height: '100%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.1)} 100%)`,
                    border: `3px solid ${theme.palette.success.main}`,
                    transition: 'all 0.4s ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: `0 20px 60px ${alpha(theme.palette.success.main, 0.3)}`,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -50,
                      right: -50,
                      width: 200,
                      height: 200,
                      background: `radial-gradient(circle, ${alpha(theme.palette.success.main, 0.2)} 0%, transparent 70%)`,
                      borderRadius: '50%',
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          bgcolor: 'success.main',
                          color: 'white',
                          borderRadius: '50%',
                          width: 70,
                          height: 70,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          boxShadow: 3,
                        }}
                      >
                        <CameraAlt sx={{ fontSize: 35 }} />
                      </Box>
                      <Box>
                        <Chip 
                          icon={<SmartToy />} 
                          label="AI-POWERED" 
                          color="success" 
                          size="small" 
                          sx={{ mb: 1, fontWeight: 'bold' }}
                        />
                        <Typography variant="h4" component="h3" fontWeight="bold" color="success.dark">
                          Smart Receipt Scanner
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                      Upload receipts and let AI do the work! 📸✨
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                      Simply snap a photo or upload your receipt, and our advanced AI will automatically 
                      read, extract, and add all transaction details to your records. No more manual entry!
                    </Typography>

                    <Box sx={{ bgcolor: alpha(theme.palette.success.main, 0.1), p: 2, borderRadius: 2, mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="success.dark" gutterBottom>
                        ✓ How it works:
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CloudUpload sx={{ color: 'success.main', mr: 1, fontSize: 18 }} />
                          <Typography variant="body2">Upload or capture receipt photo</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SmartToy sx={{ color: 'success.main', mr: 1, fontSize: 18 }} />
                          <Typography variant="body2">AI extracts amount, date, merchant & category</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CheckCircle sx={{ color: 'success.main', mr: 1, fontSize: 18 }} />
                          <Typography variant="body2">Auto-adds to your transaction records</Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Chip 
                      label="Save Time • Reduce Errors • Stay Organized" 
                      variant="outlined" 
                      color="success"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>

            {/* SMS Integration */}
            <Grid item xs={12} md={6}>
              <Zoom in={isVisible} timeout={1400}>
                <Card
                  sx={{
                    height: '100%',
                    background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.1)} 100%)`,
                    border: `3px solid ${theme.palette.info.main}`,
                    transition: 'all 0.4s ease-in-out',
                    position: 'relative',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      boxShadow: `0 20px 60px ${alpha(theme.palette.info.main, 0.3)}`,
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      top: -50,
                      right: -50,
                      width: 200,
                      height: 200,
                      background: `radial-gradient(circle, ${alpha(theme.palette.info.main, 0.2)} 0%, transparent 70%)`,
                      borderRadius: '50%',
                    }
                  }}
                >
                  <CardContent sx={{ p: 4, position: 'relative', zIndex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box
                        sx={{
                          bgcolor: 'info.main',
                          color: 'white',
                          borderRadius: '50%',
                          width: 70,
                          height: 70,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 2,
                          boxShadow: 3,
                        }}
                      >
                        <Smartphone sx={{ fontSize: 35 }} />
                      </Box>
                      <Box>
                        <Chip 
                          icon={<Sms />} 
                          label="MOBILE INTEGRATED" 
                          color="info" 
                          size="small" 
                          sx={{ mb: 1, fontWeight: 'bold' }}
                        />
                        <Typography variant="h4" component="h3" fontWeight="bold" color="info.dark">
                          SMS Transaction Alerts
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h6" sx={{ mb: 3, fontWeight: 500 }}>
                      Stay updated on-the-go with real-time SMS notifications! 📱💬
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
                      Our mobile app integration sends instant SMS notifications for every transaction, 
                      keeping you informed wherever you are. Never miss a payment or suspicious activity!
                    </Typography>

                    <Box sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), p: 2, borderRadius: 2, mb: 2 }}>
                      <Typography variant="subtitle2" fontWeight="bold" color="info.dark" gutterBottom>
                        ✓ Key Benefits:
                      </Typography>
                      <Stack spacing={1}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Sms sx={{ color: 'info.main', mr: 1, fontSize: 18 }} />
                          <Typography variant="body2">Instant SMS alerts for all transactions</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Smartphone sx={{ color: 'info.main', mr: 1, fontSize: 18 }} />
                          <Typography variant="body2">Seamless mobile app integration</Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Security sx={{ color: 'info.main', mr: 1, fontSize: 18 }} />
                          <Typography variant="body2">Enhanced security with real-time monitoring</Typography>
                        </Box>
                      </Stack>
                    </Box>

                    <Chip 
                      label="Real-Time • Secure • Always Connected" 
                      variant="outlined" 
                      color="info"
                      sx={{ fontWeight: 'bold' }}
                    />
                  </CardContent>
                </Card>
              </Zoom>
            </Grid>
          </Grid>

          {/* Additional Feature Highlight Banner */}
          <Box sx={{ mt: 6, textAlign: 'center' }}>
            <Paper
              elevation={0}
              sx={{
                background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                color: 'white',
                p: 3,
                borderRadius: 3,
              }}
            >
              <Typography variant="h5" fontWeight="bold" gutterBottom>
                🎯 Experience the Future of Financial Management
              </Typography>
              <Typography variant="body1" sx={{ color: 'white', opacity: 1 }}>
                These AI-powered features are designed to save you time, reduce errors, and keep you connected to your finances 24/7
              </Typography>
            </Paper>
          </Box>
        </Container>
      </Box>

      {/* Services Section */}
      <Container maxWidth="lg" sx={{ py: 10 }} ref={servicesRef}>
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

    {/* About Us Section */}
    <Container maxWidth="lg" sx={{ py: 10 }} ref={aboutRef}>
      <Box textAlign="center" mb={8}>
        <Typography variant="h3" component="h2" gutterBottom fontWeight="bold">
          About Us
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 800, mx: 'auto' }}>
          Empowering individuals and businesses to take control of their financial future
        </Typography>
      </Box>

      <Grid container spacing={6} alignItems="center">
        {/* About Content */}
        <Grid item xs={12} md={6}>
          <Fade in={isVisible} timeout={1000}>
            <Box>
              <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main">
                Our Mission
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 3 }}>
                At UtilityHub360, we believe that everyone deserves access to powerful financial management 
                tools. Our mission is to simplify complex financial processes and make them accessible to all, 
                helping you make informed decisions about your money.
              </Typography>
              
              <Typography variant="h4" gutterBottom fontWeight="bold" color="primary.main" sx={{ mt: 4 }}>
                Why Choose Us?
              </Typography>
              <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', lineHeight: 1.8, mb: 3 }}>
                We combine cutting-edge AI technology with intuitive design to deliver a financial management 
                platform that works for you. From automated expense tracking to smart bill payments and 
                comprehensive analytics, we've got you covered.
              </Typography>
            </Box>
          </Fade>
        </Grid>

        {/* About Stats/Features */}
        <Grid item xs={12} md={6}>
          <Fade in={isVisible} timeout={1200}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card sx={{ p: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Shield sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Security First
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Bank-level encryption and security protocols protect your sensitive financial data 24/7.
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ p: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <SmartToy sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
                    <Typography variant="h6" fontWeight="bold">
                      AI-Powered Intelligence
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Advanced AI automatically categorizes expenses, detects patterns, and provides actionable insights.
                  </Typography>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ p: 3, background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.secondary.main, 0.05)} 100%)` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <People sx={{ fontSize: 40, color: 'info.main', mr: 2 }} />
                    <Typography variant="h6" fontWeight="bold">
                      Community Driven
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Built with feedback from thousands of users to ensure we meet your real-world needs.
                  </Typography>
                </Card>
              </Grid>
            </Grid>
          </Fade>
        </Grid>

        {/* Company Values */}
        <Grid item xs={12}>
          <Box sx={{ mt: 4 }}>
            <Typography variant="h4" gutterBottom fontWeight="bold" textAlign="center" sx={{ mb: 4 }}>
              Our Core Values
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <CheckCircle sx={{ fontSize: 40, color: 'primary.main' }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Transparency
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    No hidden fees, clear pricing, honest communication
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Speed sx={{ fontSize: 40, color: 'success.main' }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Innovation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Constantly evolving with latest technology
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.info.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Support sx={{ fontSize: 40, color: 'info.main' }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Support
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dedicated team ready to help you succeed
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Box textAlign="center">
                  <Box
                    sx={{
                      width: 80,
                      height: 80,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.warning.main, 0.1),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    <Star sx={{ fontSize: 40, color: 'warning.main' }} />
                  </Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Excellence
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Committed to delivering the best experience
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </Container>

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
                  variant="outlined"
                  size="large"
                  onClick={handleGetStarted}
                  endIcon={<ArrowForward />}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    bgcolor: 'transparent',
                    px: 4,
                    py: 1.5,
                    '&:hover': {
                      borderColor: 'white',
                      bgcolor: alpha(theme.palette.common.white, 0.1),
                    },
                  }}
                >
                  Start Free Trial
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleContactClick}
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
                <Typography 
                  variant="body2" 
                  sx={{ 
                    opacity: 0.8, 
                    cursor: 'pointer',
                    '&:hover': { opacity: 1 }
                  }}
                  onClick={handleContactClick}
                >
                  Contact
                </Typography>
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
