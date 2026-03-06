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
  CircularProgress,
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
  CloudUpload,
  AutoAwesome,
  FlashOn,
  KeyboardArrowRight,
  PieChart,
  Lightbulb,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useCurrency } from '../contexts/CurrencyContext';
import { useAuth } from '../contexts/AuthContext';

const LandingPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { formatCurrency } = useCurrency();
  const { isAuthenticated, isLoading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [scrolled, setScrolled] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);

  // Quick check: if authenticated or token exists, redirect immediately
  // (Wrapper should handle this, but this is a safety check)
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
        return;
      }
      
      // If there's a token, the wrapper should have handled it, but just in case
      const token = localStorage.getItem('authToken');
      if (token) {
        // Quick redirect - wrapper already validated
        navigate('/dashboard', { replace: true });
        return;
      }
      
      // No token and not authenticated - show landing page
      setCheckingSession(false);
      setIsVisible(true);
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (!checkingSession && !isLoading) {
      setIsVisible(true);
    }
  }, [checkingSession, isLoading]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const accentGreen = '#B3EE9A';
  const accentGreenHover = '#8FD968';
  const aboutCardSx = {
    bgcolor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(8px)',
    borderRadius: 2,
    p: 3,
    border: '1px solid rgba(255,255,255,0.2)',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
  };

  const services = [
    {
      icon: AccountBalance,
      title: 'Real Account Management',
      description: 'Smart portfolio management with personalized strategies for your financial goals.',
      features: ['Portfolio insights', 'Risk tracking', 'Performance reports', 'Real-time monitoring'],
    },
    {
      icon: PieChart,
      title: 'Smart Risk Management',
      description: 'AI-powered analytics to protect your investments and minimize risks.',
      features: ['Live alerts', 'Risk scores', 'Market trends', 'Smart recommendations'],
    },
    {
      icon: TrendingUp,
      title: 'Financial Analytics',
      description: 'Clear insights and data-driven recommendations for better decisions.',
      features: ['Market insights', 'Growth tracking', 'Custom reports', 'Trend predictions'],
    },
    {
      icon: AttachMoney,
      title: 'Savings & Investment',
      description: 'Build wealth with automated saving and smart investment tools.',
      features: ['Auto-save', 'Goal tracking', 'Tax tips', 'Future planning'],
    },
    {
      icon: Shield,
      title: 'Loan Management',
      description: 'Simple loan solutions with transparent terms and flexible options.',
      features: ['Quick approval', 'Fair rates', 'Flexible terms', 'Easy payments'],
    },
    {
      icon: Lightbulb,
      title: 'Bank-Level Security',
      description: 'Your money is protected with top-tier security and encryption.',
      features: ['256-bit encryption', '2FA protection', 'Fraud detection', 'Secure backup'],
    },
  ];

  const stats = [
    { value: '10K+', label: 'Active Users', icon: People },
    { value: '15K+', label: 'Goals Achieved', icon: TrendingUp },
    { value: '99.9%', label: 'Uptime', icon: Shield },
    { value: '24/7', label: 'Support', icon: FlashOn },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Small Business Owner',
      content: 'UtilityHub360 made managing my finances so simple! The insights helped me save 30% more in just 6 months.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1551989745-347c28b620e5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
    {
      name: 'Michael Chen',
      role: 'Freelance Developer',
      content: 'Finally, a financial app that actually makes sense! The auto-invest feature is a game-changer for me.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
    {
      name: 'Emma Davis',
      role: 'Content Creator',
      content: 'Love how easy it is to track everything! Clean interface and awesome customer support.',
      rating: 5,
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080',
    },
  ];

  const coreValues = [
    { icon: Shield, title: 'Security First', description: 'Bank-grade protection for your peace of mind' },
    { icon: AutoAwesome, title: 'Simple & Clean', description: 'Beautiful design that just makes sense' },
    { icon: FlashOn, title: 'Lightning Fast', description: 'Get insights and answers in seconds' },
    { icon: TrendingUp, title: 'Growth Focused', description: 'Tools designed to help your wealth grow' },
  ];

  // Show loading spinner while checking session
  if (checkingSession || isLoading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          fontFamily: '"Segoe UI", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif'
        }}
      >
        <CircularProgress size={40} />
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'white', fontFamily: '"Segoe UI", "Segoe UI Emoji", "Segoe UI Symbol", sans-serif' }}>
      {/* Navigation */}
      <Box
        component="nav"
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1100,
          transition: 'all 0.3s',
          ...(scrolled ? { bgcolor: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', boxShadow: 1 } : { bgcolor: 'transparent' }),
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: { xs: 56, lg: 72 } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box component="img" src="/logo.png" alt="UtilityHub360 Logo" sx={{ height: 36, width: 'auto' }} />
              <Typography variant="h6" sx={{ fontWeight: 700, color: 'grey.900', fontSize: '1.25rem' }}>
                UtilityHub360
              </Typography>
            </Box>
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 4 }}>
              <Button onClick={handleServicesClick} sx={{ color: 'grey.700', fontWeight: 500, '&:hover': { color: accentGreenHover } }}>Services</Button>
              <Button onClick={handleAboutClick} sx={{ color: 'grey.700', fontWeight: 500, '&:hover': { color: accentGreenHover } }}>About</Button>
              <Button onClick={handleContactClick} sx={{ color: 'grey.700', fontWeight: 500, '&:hover': { color: accentGreenHover } }}>Contact</Button>
              <Button onClick={handleGetStarted} sx={{ bgcolor: accentGreen, color: 'grey.900', px: 3, fontWeight: 600, borderRadius: 9999, boxShadow: 2, '&:hover': { bgcolor: accentGreenHover, boxShadow: 3 } }}>
                Login/Signup
              </Button>
            </Box>
            <IconButton sx={{ display: { md: 'none' }, color: 'grey.900' }} onClick={handleDrawerToggle} aria-label="menu">
              {mobileOpen ? <Close /> : <Menu />}
            </IconButton>
          </Box>
        </Container>
        {mobileOpen && (
          <Fade in={mobileOpen}>
            <Box sx={{ display: { md: 'none' }, bgcolor: 'white', borderTop: 1, borderColor: 'divider', boxShadow: 3, px: 2, py: 2 }}>
              <Stack spacing={1}>
                <Button fullWidth onClick={handleServicesClick} sx={{ justifyContent: 'flex-start', color: 'grey.700' }}>Services</Button>
                <Button fullWidth onClick={handleAboutClick} sx={{ justifyContent: 'flex-start', color: 'grey.700' }}>About</Button>
                <Button fullWidth onClick={handleContactClick} sx={{ justifyContent: 'flex-start', color: 'grey.700' }}>Contact</Button>
                <Button fullWidth onClick={handleGetStarted} sx={{ bgcolor: accentGreen, color: 'grey.900', fontWeight: 600, borderRadius: 9999 }}>Login/Signup</Button>
              </Stack>
            </Box>
          </Fade>
        )}
      </Box>

      {/* Hero Section */}
      <Box id="home" sx={{ position: 'relative', pt: 14, pb: { xs: 6, lg: 8 }, overflow: 'hidden' }}>
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom right, #f0fdf4, #f7fee7, #ecfdf5)', opacity: 1 }} />
        <Box sx={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
          <Box sx={{ position: 'absolute', top: 80, left: 80, width: 384, height: 384, borderRadius: '50%', bgcolor: accentGreen, mixBlendMode: 'multiply', filter: 'blur(80px)', animation: 'blob 7s infinite' }} />
          <Box sx={{ position: 'absolute', top: 160, right: 80, width: 384, height: 384, borderRadius: '50%', bgcolor: '#bef264', mixBlendMode: 'multiply', filter: 'blur(80px)', animation: 'blob 7s infinite', animationDelay: '2s' }} />
          <Box sx={{ position: 'absolute', bottom: -32, left: 160, width: 384, height: 384, borderRadius: '50%', bgcolor: '#a7f3d0', mixBlendMode: 'multiply', filter: 'blur(80px)', animation: 'blob 7s infinite', animationDelay: '4s' }} />
        </Box>
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} lg={6}>
              <Fade in={isVisible} timeout={600}>
                <Stack spacing={4} sx={{ textAlign: { xs: 'center', lg: 'left' } }}>
                  <Chip icon={<AutoAwesome sx={{ fontSize: 18 }} />} label="Smart Finance Made Simple" sx={{ bgcolor: `${accentGreen}66`, color: 'grey.900', fontWeight: 600, alignSelf: { xs: 'center', lg: 'flex-start' } }} />
                  <Box>
                    <Typography component="h1" variant="h3" sx={{ fontWeight: 700, color: 'grey.900', fontSize: { xs: '2.25rem', sm: '3rem', lg: '3.75rem' }, lineHeight: 1.2 }}>
                      Manage Money
                      <Box component="span" sx={{ display: 'block', color: accentGreenHover }}>Like a Pro ✨</Box>
                    </Typography>
                  </Box>
                  <Typography sx={{ fontSize: '1.125rem', color: 'grey.600', maxWidth: 480, mx: { xs: 'auto', lg: 0 } }}>
                    Join thousands building wealth with our simple, secure platform. Track spending, invest smart, and reach your goals faster.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: { xs: 'center', lg: 'flex-start' } }}>
                    <Button size="large" onClick={handleGetStarted} endIcon={<ArrowForward />} sx={{ bgcolor: accentGreen, color: 'grey.900', px: 4, fontWeight: 600, borderRadius: 9999, boxShadow: 2, '&:hover': { bgcolor: accentGreenHover, boxShadow: 4 } }}>
                      Start Free Today
                    </Button>
                  </Box>
                  <Stack direction="row" alignItems="center" spacing={3} sx={{ pt: 1, justifyContent: { xs: 'center', lg: 'flex-start' } }}>
                    <Stack direction="row" sx={{ '& > *': { ml: -1.5, width: 44, height: 44, borderRadius: '50%', border: '3px solid white', boxShadow: 2, bgcolor: 'grey.200' } }}>
                      {[1, 2, 3, 4].map((i) => <Box key={i} />)}
                    </Stack>
                    <Box>
                      <Stack direction="row" spacing={0.25}>
                        {[1, 2, 3, 4, 5].map((i) => <Star key={i} sx={{ fontSize: 18, color: 'warning.main' }} />)}
                      </Stack>
                      <Typography variant="body2" sx={{ color: 'grey.600', fontWeight: 500, mt: 0.5 }}>Loved by 5,000+ users</Typography>
                    </Box>
                  </Stack>
                </Stack>
              </Fade>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Zoom in={isVisible} timeout={600} style={{ transitionDelay: '200ms' }}>
                <Box sx={{ position: 'relative' }}>
                  <Box sx={{ borderRadius: 3, overflow: 'hidden', boxShadow: 6, position: 'relative' }}>
                    <Box component="img" src="/financialCards.png" alt="Financial management" sx={{ width: '100%', height: 450, objectFit: 'cover', display: 'block' }} onError={(e: React.SyntheticEvent<HTMLImageElement>) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.3), transparent)' }} />
                  </Box>
                  <Fade in={isVisible} timeout={800} style={{ transitionDelay: '800ms' }}>
                    <Paper elevation={6} sx={{ position: 'absolute', bottom: -16, left: -16, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'grey.100', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: accentGreen, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><TrendingUp sx={{ fontSize: 28, color: 'grey.900' }} /></Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'grey.900' }}>+32%</Typography>
                        <Typography variant="body2" color="text.secondary">Avg. Growth</Typography>
                      </Box>
                    </Paper>
                  </Fade>
                  <Fade in={isVisible} timeout={1000} style={{ transitionDelay: '1s' }}>
                    <Paper elevation={6} sx={{ position: 'absolute', top: -16, right: -16, p: 2, borderRadius: 2, border: '1px solid', borderColor: 'grey.100', display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: accentGreen, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Shield sx={{ fontSize: 28, color: 'grey.900' }} /></Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: 'grey.900' }}>100%</Typography>
                        <Typography variant="body2" color="text.secondary">Secure</Typography>
                      </Box>
                    </Paper>
                  </Fade>
                </Box>
              </Zoom>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, bgcolor: 'white' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={6} justifyContent="center">
            {stats.map((stat, index) => {
              const StatIcon = stat.icon;
              return (
              <Grid item xs={6} lg={3} key={index}>
                <Fade in={isVisible} timeout={600} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Box sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 2, background: `linear-gradient(to bottom right, ${accentGreen}, ${accentGreenHover})`, mb: 1.5, boxShadow: 2 }}>
                      {React.createElement(StatIcon, { sx: { fontSize: 28, color: 'grey.900' } })}
                    </Box>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'grey.900' }}>{stat.value}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{stat.label}</Typography>
                  </Box>
                </Fade>
              </Grid>
            );
            })}
          </Grid>
        </Container>
      </Box>

      {/* Dashboard screenshot - See what's inside */}
      <Box id="dashboard-preview" sx={{ py: { xs: 8, lg: 12 }, bgcolor: '#f8faf8' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Fade in={isVisible}>
            <Box sx={{ textAlign: 'center', mb: 5 }}>
              <Chip icon={<Dashboard sx={{ fontSize: 18 }} />} label="See what's inside" sx={{ bgcolor: `${accentGreen}4D`, color: 'grey.900', fontWeight: 600, mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 2, mb: 1.5, fontSize: { xs: '1.5rem', lg: '2rem' } }}>
                Your financial dashboard
              </Typography>
              <Typography sx={{ color: 'grey.600', fontSize: '1rem', maxWidth: 520, mx: 'auto' }}>
                Manage payments, transactions, goals, and bills in one place.
              </Typography>
            </Box>
          </Fade>
          <Fade in={isVisible} timeout={400}>
            <Paper elevation={4} sx={{ borderRadius: 2, overflow: 'hidden', border: '1px solid', borderColor: 'grey.200', maxWidth: 1000, mx: 'auto' }}>
              <Box
                component="img"
                src="/dashboard_screenshot.png"
                alt="UtilityHub360 dashboard - manage your finances in one place"
                sx={{ width: '100%', height: 'auto', display: 'block', verticalAlign: 'middle' }}
              />
            </Paper>
          </Fade>
          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button onClick={handleGetStarted} variant="contained" size="large" endIcon={<ArrowForward />} sx={{ bgcolor: accentGreen, color: 'grey.900', px: 4, fontWeight: 600, borderRadius: 2, '&:hover': { bgcolor: accentGreenHover } }}>
              Get started to see your dashboard
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Services Section */}
      <Box id="services" ref={servicesRef} sx={{ py: { xs: 10, lg: 14 }, bgcolor: 'grey.50' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Fade in={isVisible}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip icon={<AutoAwesome sx={{ fontSize: 18 }} />} label="What We Offer" sx={{ bgcolor: `${accentGreen}4D`, color: 'grey.900', fontWeight: 600, mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 2, mb: 2, fontSize: { xs: '1.875rem', lg: '3rem' } }}>
                Everything You Need to Succeed
              </Typography>
              <Typography sx={{ color: 'grey.600', fontSize: '1.125rem', maxWidth: 672, mx: 'auto' }}>
                Simple, powerful tools to help you take control of your finances and build real wealth.
              </Typography>
            </Box>
          </Fade>
          <Grid container spacing={3}>
            {services.map((service, index) => {
              const ServiceIcon = service.icon;
              return (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <Fade in={isVisible} timeout={400} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card sx={{ height: '100%', border: '2px solid', borderColor: accentGreen, borderRadius: 2, boxShadow: 2, overflow: 'hidden', '&:hover': { boxShadow: 6, '& .service-icon': { transform: 'scale(1.1)' }, '& .service-title': { color: accentGreenHover } } }}>
                    <CardContent sx={{ p: 3, position: 'relative' }}>
                      <Box className="service-icon" sx={{ width: 56, height: 56, borderRadius: 2, bgcolor: accentGreen, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2, boxShadow: 2, transition: 'transform 0.3s' }}>
                        {React.createElement(ServiceIcon, { sx: { fontSize: 28, color: 'grey.900' } })}
                      </Box>
                      <Typography className="service-title" variant="h6" sx={{ fontWeight: 700, mb: 1, transition: 'color 0.3s' }}>{service.title}</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, lineHeight: 1.6 }}>{service.description}</Typography>
                      <Stack component="ul" spacing={1} sx={{ listStyle: 'none', pl: 0, m: 0 }}>
                        {service.features.map((f, i) => (
                          <Box key={i} component="li" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircle sx={{ fontSize: 16, color: accentGreenHover, flexShrink: 0 }} />
                            <Typography variant="body2" color="text.secondary">{f}</Typography>
                          </Box>
                        ))}
                      </Stack>
                      <Button size="small" endIcon={<KeyboardArrowRight />} sx={{ mt: 2, color: accentGreenHover, fontWeight: 600, p: 0, minWidth: 0 }}>Explore</Button>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            );
            })}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      {/* <Box sx={{ py: { xs: 10, lg: 14 }, bgcolor: 'white' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Fade in={isVisible}>
            <Box sx={{ textAlign: 'center', mb: 8 }}>
              <Chip icon={<Star sx={{ fontSize: 18 }} />} label="User Love" sx={{ bgcolor: `${accentGreen}4D`, color: 'grey.900', fontWeight: 600, mb: 2 }} />
              <Typography variant="h4" sx={{ fontWeight: 700, mt: 2, mb: 2, fontSize: { xs: '1.875rem', lg: '3rem' } }}>
                Real People, Real Results
              </Typography>
              <Typography sx={{ color: 'grey.600', fontSize: '1.125rem', maxWidth: 672, mx: 'auto' }}>
                See how UtilityHub360 is helping people achieve their financial dreams.
              </Typography>
            </Box>
          </Fade>
          <Grid container spacing={3}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Fade in={isVisible} timeout={400} style={{ transitionDelay: `${index * 100}ms` }}>
                  <Card sx={{ height: '100%', boxShadow: 2, borderRadius: 2, background: 'linear-gradient(to bottom right, #fff, #fafafa)' }}>
                    <CardContent sx={{ p: 3 }}>
                      <Stack direction="row" spacing={0.5} sx={{ mb: 2 }}>
                        {[...Array(testimonial.rating)].map((_, i) => <Star key={i} sx={{ fontSize: 20, color: 'warning.main' }} />)}
                      </Stack>
                      <Typography sx={{ color: 'grey.700', mb: 3, lineHeight: 1.6 }}>&quot;{testimonial.content}&quot;</Typography>
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Avatar src={testimonial.image} alt={testimonial.name} sx={{ width: 48, height: 48 }} />
                        <Box>
                          <Typography fontWeight={600} color="grey.900">{testimonial.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{testimonial.role}</Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                  </Card>
                </Fade>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box> */}

      {/* About Section */}
      <Box ref={aboutRef} id="about" sx={{ py: { xs: 10, lg: 14 }, background: 'linear-gradient(to bottom right, #111827, #1f2937, #111827)', color: 'white' }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} lg={6}>
              <Fade in={isVisible}>
                <Stack spacing={3}>
                  <Chip icon={<AutoAwesome sx={{ fontSize: 18 }} />} label="Our Story" sx={{ bgcolor: `${accentGreen}33`, color: accentGreen, fontWeight: 600, alignSelf: 'flex-start' }} />
                  <Typography variant="h4" sx={{ fontWeight: 700, fontSize: { xs: '1.875rem', lg: '3rem' }, color: 'white' }}>
                    Building the Future of Personal Finance
                  </Typography>
                  <Typography sx={{ color: 'grey.300', fontSize: '1.125rem', lineHeight: 1.7 }}>
                    We started UtilityHub360 because managing money shouldn&apos;t be complicated. Our mission is simple: give everyone access to powerful financial tools that were once only available to the wealthy.
                  </Typography>
                  <Typography sx={{ color: 'grey.300', fontSize: '1.125rem', lineHeight: 1.7 }}>
                    Today, we&apos;re a small but mighty team helping thousands of people take control of their finances. We&apos;re growing fast, but we&apos;ll never lose sight of what matters most: making your financial life easier.
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ pt: 2 }}>
                    <Button onClick={handleGetStarted} sx={{ bgcolor: accentGreen, color: 'grey.900', fontWeight: 600, borderRadius: 9999, '&:hover': { bgcolor: accentGreenHover } }}>Join Us</Button>
                    <Button variant="outlined" sx={{ border: '2px solid', borderColor: accentGreen, color: accentGreen, borderRadius: 9999, '&:hover': { borderColor: accentGreen, bgcolor: `${accentGreen}1A` } }}>Learn More</Button>
                  </Stack>
                </Stack>
              </Fade>
            </Grid>
            <Grid item xs={12} lg={6}>
              <Fade in={isVisible}>
                <Grid container spacing={2}>
                  {coreValues.map((value, index) => {
                    const IconComponent = value.icon;
                    return (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box sx={aboutCardSx}>
                          {React.createElement(IconComponent, { sx: { fontSize: 40, color: accentGreen, mb: 1.5 } })}
                          <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 1 }}>{value.title}</Typography>
                          <Typography variant="body2" sx={{ color: 'grey.300' }}>{value.description}</Typography>
                        </Box>
                      </Grid>
                    );
                  })}
                </Grid>
              </Fade>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box sx={{ py: { xs: 10, lg: 14 }, background: 'linear-gradient(to bottom right, #f9fafb, #fff, #f0fdf4)', textAlign: 'center' }}>
        <Container maxWidth="md" sx={{ px: { xs: 2, sm: 3 } }}>
          <Fade in={isVisible}>
            <Stack spacing={4}>
              <Chip icon={<FlashOn sx={{ fontSize: 18 }} />} label="Ready When You Are" sx={{ bgcolor: `${accentGreen}4D`, color: 'grey.900', fontWeight: 600, alignSelf: 'center' }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, color: 'grey.900', fontSize: { xs: '1.875rem', lg: '3rem' } }}>
                  Start Your Financial
                  <Box component="span" sx={{ display: 'block', color: accentGreenHover }}>Journey Today 🚀</Box>
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: '1.125rem', color: 'grey.600', maxWidth: 672, textAlign: 'center' }}>
                  Join 5,000+ people already building wealth with UtilityHub360. No credit card needed. Get started in under 60 seconds.
                </Typography>
              </Box>
              <Box>
                <Button size="large" onClick={handleGetStarted} endIcon={<ArrowForward />} sx={{ bgcolor: accentGreen, color: 'grey.900', px: 4, fontWeight: 600, borderRadius: 9999, boxShadow: 2, '&:hover': { bgcolor: accentGreenHover, boxShadow: 4 } }}>
                  Get Started
                </Button>
              </Box>
            </Stack>
          </Fade>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          bgcolor: 'grey.900',
          color: 'grey.300',
          py: 6,
        }}
      >
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
          <Grid
            container
            spacing={6}
            sx={{
              mb: 4,
              justifyContent: { md: 'space-between', xs: 'center' },
              textAlign: { xs: 'center', md: 'left' },
            }}
          >
            <Grid
              item
              xs={12}
              md={4}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', md: 'flex-start' },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ mb: 2, justifyContent: { xs: 'center', md: 'flex-start' }, width: '100%' }}
              >
                <Box
                  component="img"
                  src="/logo.png"
                  alt="UtilityHub360 Logo"
                  sx={{ height: 36, width: 'auto', mr: 1 }}
                />
                <Typography
                  variant="h6"
                  sx={{ fontWeight: 700, color: 'white', textAlign: { xs: 'center', md: 'left' } }}
                >
                  UtilityHub360
                </Typography>
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  color: 'grey.400',
                  lineHeight: 1.6,
                  textAlign: { xs: 'center', md: 'left' },
                }}
              >
                Making financial management simple, smart, and secure for everyone.
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              md={2}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', md: 'flex-start' },
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'white', mb: 2 }}>
                Product
              </Typography>
              <Stack spacing={1} sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}>
                {/* <Button
                  size="small"
                  onClick={handleServicesClick}
                  sx={{
                    justifyContent: 'flex-start',
                    color: 'grey.400',
                    textTransform: 'none',
                    '&:hover': { color: accentGreen },
                    width: { xs: 'auto', md: '100%' },
                  }}
                >
                  Features
                </Button>  */}
                <Typography
                  component="a"
                  href="#services"
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    '&:hover': { color: accentGreen },
                  }}
                >
                  Features
                </Typography>
                <Typography
                  component="a"
                  href="#about"
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    '&:hover': { color: accentGreen },
                  }}
                >
                  Security
                </Typography>
                <Typography
                  component="a"
                  href="#about"
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    '&:hover': { color: accentGreen },
                  }}
                >
                  Updates
                </Typography>
              </Stack>
            </Grid>
            <Grid
              item
              xs={12}
              md={2}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', md: 'flex-start' },
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'white', mb: 2 }}>
                Company
              </Typography>
              <Stack spacing={1} sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}>
              <Typography
                  component="a"
                  href="#about"
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    '&:hover': { color: accentGreen },
                  }}
                >
                  About
                </Typography>
          

                <Typography
                  component="a"
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    cursor: 'pointer',
                    '&:hover': { color: accentGreen },
                  }}
                  onClick={handleContactClick}
                >
                  Contact
                </Typography>
              
              </Stack>
            </Grid>
            <Grid
              item
              xs={12}
              md={2}
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: { xs: 'center', md: 'flex-start' },
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ color: 'white', mb: 2 }}>
                Legal
              </Typography>
              <Stack spacing={1} sx={{ alignItems: { xs: 'center', md: 'flex-start' } }}>
                <Typography
                  component="a"
                  href="#"
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    '&:hover': { color: accentGreen },
                  }}
                >
                  Privacy
                </Typography>
                <Typography
                  component="a"
                  href="#"
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    '&:hover': { color: accentGreen },
                  }}
                >
                  Terms
                </Typography>
                <Typography
                  component="a"
                  href="#"
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    '&:hover': { color: accentGreen },
                  }}
                >
                  Cookies
                </Typography>
                <Typography
                  component="a"
                  href="#"
                  sx={{
                    color: 'grey.400',
                    textDecoration: 'none',
                    '&:hover': { color: accentGreen },
                  }}
                >
                  Licenses
                </Typography>
              </Stack>
            </Grid>
          </Grid>
          <Divider sx={{ borderColor: 'grey.800', my: 4 }} />
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems="center"
            spacing={2}
            sx={{
              textAlign: { xs: 'center', md: 'left' },
              flexWrap: 'wrap',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: 'grey.400',
                mb: { xs: 2, md: 0 },
                width: { xs: '100%', md: 'auto' },
                textAlign: { xs: 'center', md: 'left' },
              }}
            >
              © 2026 UtilityHub360. Built with ❤️ for better finance.
            </Typography>
            <Stack direction="row" spacing={1.5}>
              <IconButton
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'grey.800',
                  color: 'white',
                  '&:hover': { bgcolor: accentGreen, color: 'grey.900' },
                }}
                aria-label="Twitter"
              >
                <Twitter />
              </IconButton>
              <IconButton
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'grey.800',
                  color: 'white',
                  '&:hover': { bgcolor: accentGreen, color: 'grey.900' },
                }}
                aria-label="LinkedIn"
              >
                <LinkedIn />
              </IconButton>
              <IconButton
                component="a"
                href="https://www.facebook.com/profile.php?id=61586127790436"
                target="_blank"
                rel="noopener noreferrer"
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: 'grey.800',
                  color: 'white',
                  '&:hover': { bgcolor: accentGreen, color: 'grey.900' },
                }}
                aria-label="Facebook"
              >
                <Facebook sx={{ fontSize: 20 }} />
              </IconButton>
            </Stack>
          </Stack>
        </Container>
      </Box>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0, 0) scale(1); }
        }
      `}</style>
    </Box>
  );
};

export default LandingPage;
