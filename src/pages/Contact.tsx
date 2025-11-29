import React, { useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  Alert,
  Snackbar,
  IconButton,
  Link,
  Divider,
  AppBar,
  Toolbar,
  Container,
} from '@mui/material';
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
  Instagram as InstagramIcon,
  Send as SendIcon,
  AccessTime as AccessTimeIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const Contact: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }

    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    } else if (formData.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      console.log('Contact form submitted:', formData);
      setShowSuccess(true);
      setFormData({
        name: '',
        email: '',
        subject: '',
        message: '',
      });
      setIsSubmitting(false);
    }, 1500);
  };

  const handleCloseSuccess = () => {
    setShowSuccess(false);
  };

  const contactInfo = [
    {
      icon: <EmailIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Email Us',
      content: 'support@utilityhub360.com',
      subtitle: 'We respond within 24 hours',
      link: 'mailto:support@utilityhub360.com',
    },
    {
      icon: <PhoneIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'Call Us',
      content: '+1 (555) 123-4567',
      subtitle: 'Mon-Fri from 8am to 6pm',
      link: 'tel:+15551234567',
    },
    {
      icon: <LocationIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      title: 'Visit Us',
      content: '123 Finance Street, Suite 100',
      subtitle: 'New York, NY 10001',
      link: 'https://maps.google.com',
    },
  ];

  const socialMedia = [
    {
      icon: <FacebookIcon />,
      label: 'Facebook',
      link: 'https://facebook.com',
      color: '#1877f2',
    },
    {
      icon: <TwitterIcon />,
      label: 'Twitter',
      link: 'https://twitter.com',
      color: '#1da1f2',
    },
    {
      icon: <LinkedInIcon />,
      label: 'LinkedIn',
      link: 'https://linkedin.com',
      color: '#0a66c2',
    },
    {
      icon: <InstagramIcon />,
      label: 'Instagram',
      link: 'https://instagram.com',
      color: '#e4405f',
    },
  ];

  const officeHours = [
    { day: 'Monday - Friday', hours: '8:00 AM - 6:00 PM' },
    { day: 'Saturday', hours: '9:00 AM - 2:00 PM' },
    { day: 'Sunday', hours: 'Closed' },
  ];

  const pageContent = (
    <Box>
      <Typography variant="h4" gutterBottom>
        Contact Us
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Have a question or need assistance? We're here to help!
      </Typography>

      <Grid container spacing={3}>
        {/* Contact Information Cards */}
        {contactInfo.map((info, index) => (
          <Grid item xs={12} md={4} key={index}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Box sx={{ mb: 2 }}>{info.icon}</Box>
                  <Typography variant="h6" gutterBottom>
                    {info.title}
                  </Typography>
                  <Link
                    href={info.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      fontWeight: 600,
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {info.content}
                  </Link>
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {info.subtitle}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {/* Contact Form */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Send us a Message
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Fill out the form below and we'll get back to you as soon as possible.
            </Typography>

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Your Name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    error={!!errors.name}
                    helperText={errors.name}
                    disabled={isSubmitting}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email Address"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    disabled={isSubmitting}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    error={!!errors.subject}
                    helperText={errors.subject}
                    disabled={isSubmitting}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Message"
                    name="message"
                    multiline
                    rows={6}
                    value={formData.message}
                    onChange={handleChange}
                    error={!!errors.message}
                    helperText={errors.message}
                    disabled={isSubmitting}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    fullWidth
                    disabled={isSubmitting}
                    startIcon={<SendIcon />}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Grid>

        {/* Office Hours & Social Media */}
        <Grid item xs={12} md={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AccessTimeIcon sx={{ fontSize: 30, color: 'warning.main', mr: 1 }} />
                <Typography variant="h6">Office Hours</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              {officeHours.map((schedule, index) => (
                <Box key={index} sx={{ mb: 1.5 }}>
                  <Typography variant="body2" fontWeight={600} color="text.primary">
                    {schedule.day}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {schedule.hours}
                  </Typography>
                </Box>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Connect With Us
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Follow us on social media for updates and news
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {socialMedia.map((social, index) => (
                  <IconButton
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{
                      color: social.color,
                      border: `2px solid ${social.color}`,
                      '&:hover': {
                        backgroundColor: social.color,
                        color: 'white',
                      },
                    }}
                    aria-label={social.label}
                  >
                    {social.icon}
                  </IconButton>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* FAQ Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Frequently Asked Questions
            </Typography>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                    What are your response times?
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    We typically respond to all inquiries within 24 hours during business days. 
                    For urgent matters, please call our support line.
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                    Do you offer technical support?
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Yes! Our technical support team is available to help with any issues you may 
                    encounter while using UtilityHub360.
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} md={6}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                    Can I schedule a demo?
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Absolutely! Contact us through the form above or call us directly to schedule 
                    a personalized demo of our platform.
                  </Typography>
                </Box>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" fontWeight={600} color="primary" gutterBottom>
                    Where can I find documentation?
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Visit our Help Center or Support page for comprehensive documentation, guides, 
                    and tutorials.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Success Message Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={handleCloseSuccess}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          Thank you for contacting us! We'll get back to you soon.
        </Alert>
      </Snackbar>
    </Box>
  );

  // If user is not authenticated, wrap content with navigation
  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
        <AppBar position="static" sx={{ bgcolor: 'white', color: 'text.primary', boxShadow: 1 }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold', color: 'primary.main' }}>
              UtilityHub360
            </Typography>
            <Button color="inherit" onClick={() => navigate('/')}>
              Home
            </Button>
            <Button variant="contained" onClick={() => navigate('/auth')} sx={{ ml: 2 }}>
              Sign In
            </Button>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          {pageContent}
        </Container>
      </Box>
    );
  }

  // If authenticated, return content without navigation (Layout will handle it)
  return pageContent;
};

export default Contact;

