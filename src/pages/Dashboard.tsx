import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Button,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp,
  People,
  AccountBalance,
  Receipt,
  CheckCircle,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';


const Dashboard: React.FC = () => {
  const { hasProfile, userProfile, isAuthenticated, user, logout } = useAuth();
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Profile form states
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    jobTitle: '',
    company: '',
    employmentType: '',
    monthlySavingsGoal: 0,
    monthlyInvestmentGoal: 0,
    monthlyEmergencyFundGoal: 0,
    taxRate: 0,
    monthlyTaxDeductions: 0,
    industry: '',
    location: '',
    notes: '',
    incomeSources: [{
      name: '',
      amount: 0,
      frequency: 'monthly',
      category: 'Primary',
      currency: 'USD',
      description: '',
      company: ''
    }]
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  
  // Check if user needs to complete profile
  useEffect(() => {
    if (user && !hasProfile) {
      setShowProfileForm(true);
    } else if (user && hasProfile) {
      setShowProfileForm(false);
    }
  }, [user, hasProfile]);

  // Fetch real financial data
  useEffect(() => {
    const loadFinancialData = async () => {
      if (!isAuthenticated) return;
      
      try {
        setLoading(true);
        // Fetch bank account summary for real financial data
        const summary = await apiService.getBankAccountSummary();
        setFinancialData(summary);
      } catch (error) {
        console.error('Failed to load financial data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadFinancialData();
  }, [isAuthenticated]);

  // Profile form handlers
  const handleProfileFormInputChange = (field: string, value: any) => {
    setProfileFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleIncomeSourceChange = (index: number, field: string, value: any) => {
    const newIncomeSources = [...profileFormData.incomeSources];
    newIncomeSources[index] = {
      ...newIncomeSources[index],
      [field]: value
    };
    setProfileFormData(prev => ({
      ...prev,
      incomeSources: newIncomeSources
    }));
  };

  const addIncomeSource = () => {
    setProfileFormData(prev => ({
      ...prev,
      incomeSources: [...prev.incomeSources, {
        name: '',
        amount: 0,
        frequency: 'monthly',
        category: 'Primary',
        currency: 'USD',
        description: '',
        company: ''
      }]
    }));
  };

  const removeIncomeSource = (index: number) => {
    if (profileFormData.incomeSources.length > 1) {
      const newIncomeSources = profileFormData.incomeSources.filter((_, i) => i !== index);
      setProfileFormData(prev => ({
        ...prev,
        incomeSources: newIncomeSources
      }));
    }
  };

  const handleCreateProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError('');
      setProfileSuccess('');

      // Validate form
      if (!profileFormData.jobTitle || !profileFormData.company) {
        setProfileError('Please fill in all required fields');
        return;
      }

      // Create profile
      const response = await apiService.createUserProfile(profileFormData);
      
      setProfileSuccess('Profile created successfully!');
      setShowProfileForm(false);
      
      // Refresh the page to update the profile status
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error: any) {
      setProfileError(error.message || 'Failed to create profile');
    } finally {
      setProfileLoading(false);
    }
  };
  
  // Calculate real stats from user profile data
  const totalMonthlyIncome = userProfile?.totalMonthlyIncome || 0;
  const netMonthlyIncome = userProfile?.netMonthlyIncome || 0;
  const totalMonthlyGoals = userProfile?.totalMonthlyGoals || 0;
  const disposableIncome = userProfile?.disposableIncome || 0;
  const incomeSourcesCount = userProfile?.incomeSources?.length || 0;
  
  // Real financial data for charts
  const chartData = financialData ? [
    { name: 'Total Balance', amount: financialData.totalBalance || 0 },
    { name: 'Total Incoming', amount: financialData.totalIncoming || 0 },
    { name: 'Total Outgoing', amount: financialData.totalOutgoing || 0 },
    { name: 'Active Accounts', amount: financialData.activeAccounts || 0 },
  ] : [];
  
  const stats = [
    {
      title: 'Total Monthly Income',
      value: `$${totalMonthlyIncome.toLocaleString()}`,
      change: `${incomeSourcesCount} source${incomeSourcesCount !== 1 ? 's' : ''}`,
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main',
    },
    {
      title: 'Net Monthly Income',
      value: `$${netMonthlyIncome.toLocaleString()}`,
      change: 'After taxes',
      icon: <AccountBalance sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
    },
    {
      title: 'Monthly Goals',
      value: `$${totalMonthlyGoals.toLocaleString()}`,
      change: 'Savings & Investment',
      icon: <Receipt sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.main',
    },
    {
      title: 'Disposable Income',
      value: `$${disposableIncome.toLocaleString()}`,
      change: 'Available to spend',
      icon: <People sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.main',
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      
      {/* Profile Status Section */}
      {isAuthenticated && (
        <Box mb={3}>
          {hasProfile ? (
            <Alert 
              severity="success" 
              icon={<CheckCircle />}
              sx={{ mb: 2 }}
            >
              <Box display="flex" alignItems="center" gap={2}>
                <Typography variant="h6">
                  Profile Complete
                </Typography>
                <Chip 
                  label="Active" 
                  color="success" 
                  size="small"
                />
                {userProfile && (
                  <Typography variant="body2" color="text.secondary">
                    {userProfile.incomeSources?.length || 0} income source(s) configured
                  </Typography>
                )}
              </Box>
            </Alert>
          ) : (
            <Alert severity="warning">
              <Typography variant="h6">
                Profile Setup Required
              </Typography>
              <Typography variant="body2">
                Please complete your profile setup to access all features.
              </Typography>
            </Alert>
          )}
        </Box>
      )}
      
      <Grid container spacing={3}>
        {/* Stats Cards */}
        {stats.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography color="textSecondary" gutterBottom variant="h6">
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" component="h2">
                      {stat.value}
                    </Typography>
                    <Typography color="textSecondary">
                      {stat.change} from last month
                    </Typography>
                  </Box>
                  <Box>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
              <CardActions>
                <Button size="small">View Details</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}

        {/* Charts */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Financial Overview
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <Typography>Loading financial data...</Typography>
              </Box>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount']} />
                  <Bar dataKey="amount" fill="#1976d2" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Account Summary
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" alignItems="center" height={300}>
                <Typography>Loading account data...</Typography>
              </Box>
            ) : financialData ? (
              <Box>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Total Balance</Typography>
                  <Typography variant="h5">${financialData.totalBalance?.toLocaleString() || 0}</Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Active Accounts</Typography>
                  <Typography variant="h5">{financialData.activeAccounts || 0}</Typography>
                </Box>
                <Box mb={2}>
                  <Typography variant="body2" color="text.secondary">Total Incoming</Typography>
                  <Typography variant="h5" color="success.main">${financialData.totalIncoming?.toLocaleString() || 0}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">Total Outgoing</Typography>
                  <Typography variant="h5" color="error.main">${financialData.totalOutgoing?.toLocaleString() || 0}</Typography>
                </Box>
              </Box>
            ) : (
              <Typography>No financial data available</Typography>
            )}
          </Paper>
        </Grid>

        {/* Recent Activity */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activity
            </Typography>
            <Box>
              {hasProfile ? (
                <>
                  <Typography variant="body2" color="textSecondary">
                    • Profile completed with {incomeSourcesCount} income source{incomeSourcesCount !== 1 ? 's' : ''}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • Monthly income: ${totalMonthlyIncome.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • Monthly goals: ${totalMonthlyGoals.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • Disposable income: ${disposableIncome.toLocaleString()}
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="body2" color="textSecondary">
                    • Profile setup required
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • Complete your profile to see financial data
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • Add income sources to get started
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    • Set up financial goals
                  </Typography>
                </>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Complete Your Profile Modal */}
      <Dialog 
        open={showProfileForm && !!user && !hasProfile}
        onClose={() => {}} 
        maxWidth="md" 
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>
          <Typography variant="h5" component="div">
            Complete Your Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please complete your financial profile to access all features
          </Typography>
        </DialogTitle>
        <DialogContent>
          {profileSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {profileSuccess}
            </Alert>
          )}

          {profileError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {profileError}
            </Alert>
          )}

          {/* Employment Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon />
                Employment Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    value={profileFormData.jobTitle}
                    onChange={(e) => handleProfileFormInputChange('jobTitle', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    value={profileFormData.company}
                    onChange={(e) => handleProfileFormInputChange('company', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Employment Type</InputLabel>
                    <Select
                      value={profileFormData.employmentType}
                      onChange={(e) => handleProfileFormInputChange('employmentType', e.target.value)}
                    >
                      <MenuItem value="Full-time">Full-time</MenuItem>
                      <MenuItem value="Part-time">Part-time</MenuItem>
                      <MenuItem value="Contract">Contract</MenuItem>
                      <MenuItem value="Freelance">Freelance</MenuItem>
                      <MenuItem value="Self-employed">Self-employed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Industry"
                    value={profileFormData.industry}
                    onChange={(e) => handleProfileFormInputChange('industry', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={profileFormData.location}
                    onChange={(e) => handleProfileFormInputChange('location', e.target.value)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Financial Goals */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon />
                Financial Goals
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Monthly Savings Goal"
                    type="number"
                    value={profileFormData.monthlySavingsGoal}
                    onChange={(e) => handleProfileFormInputChange('monthlySavingsGoal', parseFloat(e.target.value) || 0)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Monthly Investment Goal"
                    type="number"
                    value={profileFormData.monthlyInvestmentGoal}
                    onChange={(e) => handleProfileFormInputChange('monthlyInvestmentGoal', parseFloat(e.target.value) || 0)}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Emergency Fund Goal"
                    type="number"
                    value={profileFormData.monthlyEmergencyFundGoal}
                    onChange={(e) => handleProfileFormInputChange('monthlyEmergencyFundGoal', parseFloat(e.target.value) || 0)}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Income Sources */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon />
                  Income Sources
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addIncomeSource}
                  variant="outlined"
                  size="small"
                >
                  Add Income Source
                </Button>
              </Box>
              
              {profileFormData.incomeSources.map((source, index) => (
                <Card key={index} sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Income Name"
                        placeholder="Company salary"
                        value={source.name}
                        onChange={(e) => handleIncomeSourceChange(index, 'name', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Amount"
                        type="number"
                        value={source.amount}
                        onChange={(e) => handleIncomeSourceChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Frequency</InputLabel>
                        <Select
                          value={source.frequency}
                          onChange={(e) => handleIncomeSourceChange(index, 'frequency', e.target.value)}
                        >
                          <MenuItem value="daily">Daily</MenuItem>
                          <MenuItem value="weekly">Weekly</MenuItem>
                          <MenuItem value="monthly">Monthly</MenuItem>
                          <MenuItem value="quarterly">Quarterly</MenuItem>
                          <MenuItem value="yearly">Yearly</MenuItem>
                          <MenuItem value="others">Others</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={source.category}
                          onChange={(e) => handleIncomeSourceChange(index, 'category', e.target.value)}
                        >
                          <MenuItem value="Primary">Primary</MenuItem>
                          <MenuItem value="Passive">Passive</MenuItem>
                          <MenuItem value="Business">Business</MenuItem>
                          <MenuItem value="Side hustle">Side hustle</MenuItem>
                          <MenuItem value="Investment">Investment</MenuItem>
                          <MenuItem value="Dividend">Dividend</MenuItem>
                          <MenuItem value="Interest">Interest</MenuItem>
                          <MenuItem value="other">Other</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Company"
                        value={source.company}
                        onChange={(e) => handleIncomeSourceChange(index, 'company', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Description"
                        value={source.description}
                        onChange={(e) => handleIncomeSourceChange(index, 'description', e.target.value)}
                      />
                    </Grid>
                    {profileFormData.incomeSources.length > 1 && (
                      <Grid item xs={12}>
                        <Button
                          startIcon={<DeleteIcon />}
                          onClick={() => removeIncomeSource(index)}
                          color="error"
                          size="small"
                        >
                          Remove Income Source
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                </Card>
              ))}
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={logout}
            startIcon={<LogoutIcon />}
            color="error"
          >
            Logout
          </Button>
          <Button
            onClick={handleCreateProfile}
            variant="contained"
            disabled={profileLoading}
          >
            {profileLoading ? 'Creating...' : 'Complete Profile'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;
