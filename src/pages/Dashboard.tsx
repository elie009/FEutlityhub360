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
  FormControlLabel,
  Checkbox,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
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
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';


const Dashboard: React.FC = () => {
  const { hasProfile, userProfile, isAuthenticated, user, logout, updateUserProfile } = useAuth();
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Disposable amount modal states
  const [showDisposableModal, setShowDisposableModal] = useState(false);
  const [disposableData, setDisposableData] = useState<any>(null);
  const [disposableLoading, setDisposableLoading] = useState(false);
  const [disposableError, setDisposableError] = useState<string>('');
  
  // Dashboard disposable amount data
  const [dashboardDisposableData, setDashboardDisposableData] = useState<any>(null);
  
  // Current balance states
  const [currentBalance, setCurrentBalance] = useState<number>(0);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [bankAccountsResponse, setBankAccountsResponse] = useState<any>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [balanceError, setBalanceError] = useState<string>('');
  
  // Profile form states
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    isUnemployed: false,
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

  // Fetch disposable amount data on page load
  useEffect(() => {
    const loadDisposableAmount = async () => {
      if (!isAuthenticated) return;
      
      try {
        // Get current year and month
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth() + 1;
        
        const response = await apiService.getDisposableAmount(year, month);
        
        if (response && response.data) {
          setDashboardDisposableData(response.data);
        }
      } catch (error) {
        console.error('Failed to load disposable amount for dashboard:', error);
        // Don't show error to user, just use fallback data from user profile
      }
    };
    
    loadDisposableAmount();
  }, [isAuthenticated]);

  // Fetch total balance on page load
  useEffect(() => {
    const loadTotalBalance = async () => {
      if (!isAuthenticated) return;
      
      try {
        const balance = await apiService.getTotalBalance();
        setCurrentBalance(balance);
      } catch (error) {
        console.error('Failed to load total balance for dashboard:', error);
        setCurrentBalance(0);
      }
    };
    
    loadTotalBalance();
  }, [isAuthenticated]);

  // Profile form handlers
  const handleProfileFormInputChange = (field: string, value: any) => {
    setProfileFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUnemployedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isUnemployed = e.target.checked;
    setProfileFormData(prev => ({
      ...prev,
      isUnemployed,
      // Clear employment fields when unemployed is checked
      ...(isUnemployed ? {
        jobTitle: '',
        company: '',
        employmentType: '',
        industry: '',
        location: '',
      } : {}),
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

      // Validate form - skip employment validation if unemployed
      if (!profileFormData.isUnemployed) {
        if (!profileFormData.jobTitle || !profileFormData.company) {
          setProfileError('Please fill in all required fields');
          return;
        }
      }

      // Create profile
      const response = await apiService.createUserProfile(profileFormData);
      
      // Check if response is successful
      if (response && response.id) {
        setProfileSuccess('Profile created successfully!');
        
        // Fetch the profile immediately and update context
        const newProfile = await apiService.getUserProfile();
        if (newProfile && newProfile.id) {
          updateUserProfile(newProfile);  // This will update hasProfile to true
          setShowProfileForm(false);  // Close the modal immediately
        } else {
          setProfileError('Profile creation succeeded but failed to fetch. Please refresh the page.');
        }
      } else {
        setProfileError('Profile creation failed. Please try again.');
      }
      
    } catch (error: any) {
      setProfileError(error.message || 'Failed to create profile');
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle disposable card click
  const handleDisposableCardClick = async () => {
    setShowDisposableModal(true);
    setDisposableLoading(true);
    setDisposableError('');
    setDisposableData(null);
    
    try {
      // Get current year and month
      const now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      
      const response = await apiService.getDisposableAmount(year, month);
      
      if (response && response.data) {
        setDisposableData(response.data);
        setDisposableError('');
      } else {
        setDisposableError('No data available for the current period.');
      }
    } catch (error: any) {
      console.error('Failed to fetch disposable amount details:', error);
      
      // Check for 404 error
      if (error.message && error.message.includes('404')) {
        setDisposableError('No disposable amount data found for the current period. Please ensure you have income sources, bills, or transactions recorded.');
      } else if (error.message && error.message.includes('not found')) {
        setDisposableError('No disposable amount data found for the current period. Please ensure you have income sources, bills, or transactions recorded.');
      } else {
        setDisposableError(error.message || 'Failed to load disposable amount details. Please try again later.');
      }
      setDisposableData(null);
    } finally {
      setDisposableLoading(false);
    }
  };

  const handleCloseDisposableModal = () => {
    setShowDisposableModal(false);
    setDisposableData(null);
    setDisposableError('');
  };

  // Handle balance card click
  const handleBalanceCardClick = async () => {
    setShowBalanceModal(true);
    setBalanceLoading(true);
    setBalanceError('');
    
    try {
      const response = await apiService.getUserBankAccounts();
      // Check if response has the format { success, data, currentBalance }
      if (response && typeof response === 'object' && 'data' in response) {
        setBankAccountsResponse(response);
        setBankAccounts(Array.isArray(response.data) ? response.data : response);
      } else {
        // If response is just an array
        setBankAccounts(Array.isArray(response) ? response : []);
        setBankAccountsResponse(null);
      }
      setBalanceError('');
    } catch (error: any) {
      console.error('Failed to fetch bank accounts:', error);
      
      // Check for 404 error
      if (error.message && (error.message.includes('404') || error.message.includes('not found'))) {
        setBalanceError('No bank accounts found. Please add a bank account to get started.');
      } else {
        setBalanceError(error.message || 'Failed to load bank accounts. Please try again later.');
      }
      setBankAccounts([]);
      setBankAccountsResponse(null);
    } finally {
      setBalanceLoading(false);
    }
  };

  const handleCloseBalanceModal = () => {
    setShowBalanceModal(false);
    setBankAccounts([]);
    setBankAccountsResponse(null);
    setBalanceError('');
  };
  
  // Calculate real stats from disposable amount API or fallback to user profile data
  const totalMonthlyIncome = dashboardDisposableData ? (dashboardDisposableData.totalIncome || 0) : 0;
  const monthlyExpense = dashboardDisposableData ? (dashboardDisposableData.totalFixedExpenses || 0) : 0;
  const totalMonthlyGoals = userProfile?.totalMonthlyGoals || 0;
  const disposableIncome = dashboardDisposableData ? (dashboardDisposableData.disposableAmount || 0) : 0;
  const incomeSourcesCount = dashboardDisposableData?.incomeBreakdown?.length || userProfile?.incomeSources?.length || 0;
  
  // Real financial data for charts
  const chartData = financialData ? [
    { name: 'Total Balance', amount: financialData.totalBalance || 0 },
    { name: 'Total Incoming', amount: financialData.totalIncoming || 0 },
    { name: 'Total Outgoing', amount: financialData.totalOutgoing || 0 },
    { name: 'Active Accounts', amount: financialData.activeAccounts || 0 },
  ] : [];
  
  const stats = [
    {
      title: 'Current Balance',
      value: `$${(currentBalance || 0).toLocaleString()}`,
      change: 'Total across all accounts',
      icon: <AccountBalance sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: 'secondary.main',
    },
    {
      title: 'Total Monthly Income',
      value: `$${(totalMonthlyIncome || 0).toLocaleString()}`,
      change: `${incomeSourcesCount} source${incomeSourcesCount !== 1 ? 's' : ''}`,
      icon: <TrendingUp sx={{ fontSize: 40, color: 'primary.main' }} />,
      color: 'primary.main',
    },
    {
      title: 'Monthly Expense',
      value: `$${(monthlyExpense || 0).toLocaleString()}`,
      change: 'Fixed expenses',
      icon: <Receipt sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
    },
    {
      title: 'Monthly Goals',
      value: `$${(totalMonthlyGoals || 0).toLocaleString()}`,
      change: 'Savings & Investment',
      icon: <MoneyIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      color: 'warning.main',
    },
    {
      title: 'Disposable Income',
      value: `$${(disposableIncome || 0).toLocaleString()}`,
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
          <Grid item xs={12} sm={6} md={2.4} key={index}>
            <Card 
              sx={{ 
                cursor: (stat.title === 'Disposable Income' || stat.title === 'Current Balance') ? 'pointer' : 'default',
                '&:hover': (stat.title === 'Disposable Income' || stat.title === 'Current Balance') ? {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                } : {}
              }}
              onClick={
                stat.title === 'Disposable Income' ? handleDisposableCardClick : 
                stat.title === 'Current Balance' ? handleBalanceCardClick : 
                undefined
              }
            >
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
                      {stat.change}
                    </Typography>
                  </Box>
                  <Box>
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
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

      {/* Bank Accounts Modal */}
      <Dialog
        open={showBalanceModal}
        onClose={handleCloseBalanceModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Bank Accounts</Typography>
            <Button onClick={handleCloseBalanceModal} color="inherit">
              <CloseIcon />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {balanceLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
              <CircularProgress />
            </Box>
          ) : balanceError ? (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight={200} p={3}>
              <Alert severity="error" sx={{ mb: 2, width: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Error Loading Accounts
                </Typography>
                <Typography variant="body1">
                  {balanceError}
                </Typography>
              </Alert>
              <Button 
                variant="contained" 
                onClick={handleBalanceCardClick}
                sx={{ mt: 2 }}
              >
                Try Again
              </Button>
            </Box>
          ) : bankAccounts.length > 0 ? (
            <Box>
              <Box mb={2}>
                <Paper sx={{ p: 2, bgcolor: 'primary.light' }}>
                  <Typography variant="body2" color="text.secondary">Total Balance</Typography>
                  <Typography variant="h4">
                    ${(bankAccountsResponse?.currentBalance || currentBalance || 0).toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Across {bankAccounts.length} account{bankAccounts.length !== 1 ? 's' : ''}
                  </Typography>
                </Paper>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>Account Details</Typography>
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Account Name</TableCell>
                      <TableCell>Account Number</TableCell>
                      <TableCell>Type</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Balance</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bankAccounts.map((account: any) => (
                      <TableRow key={account.id}>
                        <TableCell>
                          <Typography variant="body1" fontWeight="bold">
                            {account.accountName || 'N/A'}
                          </Typography>
                        </TableCell>
                        <TableCell>{account.accountNumber || 'N/A'}</TableCell>
                        <TableCell>
                          <Chip 
                            label={account.accountType || 'N/A'} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={account.isActive ? 'Active' : 'Inactive'} 
                            size="small" 
                            color={account.isActive ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body1" fontWeight="bold" color="primary.main">
                            ${(account.currentBalance || account.balance || 0).toLocaleString()}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight={200} p={3}>
              <Alert severity="info" sx={{ mb: 2, width: '100%' }}>
                <Typography variant="body1">
                  No bank accounts found. Add a bank account to get started.
                </Typography>
              </Alert>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBalanceModal} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Disposable Amount Details Modal */}
      <Dialog
        open={showDisposableModal}
        onClose={handleCloseDisposableModal}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h5">Disposable Amount Breakdown</Typography>
            <Button onClick={handleCloseDisposableModal} color="inherit">
              <CloseIcon />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {disposableLoading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={300}>
              <CircularProgress />
            </Box>
          ) : disposableError ? (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight={300} p={3}>
              <Alert severity="error" sx={{ mb: 2, width: '100%', maxWidth: 600 }}>
                <Typography variant="h6" gutterBottom>
                  Error Loading Data
                </Typography>
                <Typography variant="body1">
                  {disposableError}
                </Typography>
              </Alert>
              <Button 
                variant="contained" 
                onClick={handleDisposableCardClick}
                sx={{ mt: 2 }}
              >
                Try Again
              </Button>
            </Box>
          ) : disposableData ? (
            <Box>
              {/* Period Information */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Period Information</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Period</Typography>
                    <Typography variant="body1">{disposableData.period}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">Start Date</Typography>
                    <Typography variant="body1">{new Date(disposableData.startDate).toLocaleDateString()}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Typography variant="body2" color="text.secondary">End Date</Typography>
                    <Typography variant="body1">{new Date(disposableData.endDate).toLocaleDateString()}</Typography>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Main Summary */}
              <Box mb={3}>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: 'success.light' }}>
                      <Typography variant="body2" color="text.secondary">Total Income</Typography>
                      <Typography variant="h5">${(disposableData.totalIncome || 0).toLocaleString()}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
                      <Typography variant="body2" color="text.secondary">Fixed Expenses</Typography>
                      <Typography variant="h5">${(disposableData.totalFixedExpenses || 0).toLocaleString()}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: 'warning.light' }}>
                      <Typography variant="body2" color="text.secondary">Variable Expenses</Typography>
                      <Typography variant="h5">${(disposableData.totalVariableExpenses || 0).toLocaleString()}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
                      <Typography variant="body2" color="text.secondary">Disposable Amount</Typography>
                      <Typography variant="h5">${(disposableData.disposableAmount || 0).toLocaleString()}</Typography>
                      <Typography variant="body2" color="text.secondary">{(disposableData.disposablePercentage || 0).toFixed(2)}% of income</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Income Breakdown */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>Income Breakdown</Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Source Name</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Frequency</TableCell>
                        <TableCell align="right">Amount</TableCell>
                        <TableCell align="right">Monthly Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(disposableData.incomeBreakdown || []).map((income: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>{income.sourceName || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip label={income.category || 'N/A'} size="small" color="primary" />
                          </TableCell>
                          <TableCell>{income.frequency || 'N/A'}</TableCell>
                          <TableCell align="right">${(income.amount || 0).toLocaleString()}</TableCell>
                          <TableCell align="right">${(income.monthlyAmount || 0).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Bills Breakdown */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Bills Breakdown (Total: ${(disposableData.totalBills || 0).toLocaleString()})
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Bill Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Due Date</TableCell>
                        <TableCell align="right">Amount</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(disposableData.billsBreakdown || []).map((bill: any) => (
                        <TableRow key={bill.id}>
                          <TableCell>{bill.name || 'N/A'}</TableCell>
                          <TableCell>{bill.type || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip 
                              label={bill.status || 'N/A'} 
                              size="small" 
                              color={bill.status === 'PAID' ? 'success' : 'warning'} 
                            />
                          </TableCell>
                          <TableCell>{bill.dueDate ? new Date(bill.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                          <TableCell align="right">${(bill.amount || 0).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Loans Breakdown */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Loans Breakdown (Total: ${(disposableData.totalLoans || 0).toLocaleString()})
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Loan Name</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell align="right">Monthly Payment</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(disposableData.loansBreakdown || []).map((loan: any) => (
                        <TableRow key={loan.id}>
                          <TableCell>{loan.name || 'N/A'}</TableCell>
                          <TableCell>{loan.type || 'N/A'}</TableCell>
                          <TableCell>
                            <Chip label={loan.status || 'N/A'} size="small" color="info" />
                          </TableCell>
                          <TableCell align="right">${(loan.amount || 0).toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Variable Expenses Breakdown */}
              <Box mb={3}>
                <Typography variant="h6" gutterBottom>
                  Variable Expenses Breakdown (Total: ${(disposableData.totalVariableExpenses || 0).toLocaleString()})
                </Typography>
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Category</TableCell>
                        <TableCell align="right">Count</TableCell>
                        <TableCell align="right">Total Amount</TableCell>
                        <TableCell align="right">Percentage</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {(disposableData.variableExpensesBreakdown || []).map((expense: any, index: number) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Chip label={expense.category || 'N/A'} size="small" />
                          </TableCell>
                          <TableCell align="right">{expense.count || 0}</TableCell>
                          <TableCell align="right">${(expense.totalAmount || 0).toLocaleString()}</TableCell>
                          <TableCell align="right">{(expense.percentage || 0).toFixed(2)}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>

              <Divider sx={{ my: 3 }} />

              {/* Comparison */}
              {disposableData.comparison && (
                <Box mb={3}>
                  <Typography variant="h6" gutterBottom>Comparison with Previous Period</Typography>
                  <Paper sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Previous Period</Typography>
                        <Typography variant="h6">${(disposableData.comparison.previousPeriodDisposableAmount || 0).toLocaleString()}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Change Amount</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6" color={(disposableData.comparison.changeAmount || 0) >= 0 ? 'success.main' : 'error.main'}>
                            ${Math.abs(disposableData.comparison.changeAmount || 0).toLocaleString()}
                          </Typography>
                          {disposableData.comparison.trend === 'UP' ? (
                            <TrendingUpIcon color="success" />
                          ) : (
                            <TrendingDownIcon color="error" />
                          )}
                        </Box>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Change Percentage</Typography>
                        <Typography 
                          variant="h6" 
                          color={(disposableData.comparison.changePercentage || 0) >= 0 ? 'success.main' : 'error.main'}
                        >
                          {(disposableData.comparison.changePercentage || 0) >= 0 ? '+' : ''}{(disposableData.comparison.changePercentage || 0).toFixed(2)}%
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Box>
              )}

              <Divider sx={{ my: 3 }} />

              {/* Insights */}
              <Box>
                <Typography variant="h6" gutterBottom>Smart Insights</Typography>
                <List>
                  {(disposableData.insights || []).map((insight: string, index: number) => (
                    <ListItem key={index}>
                      <ListItemText 
                        primary={insight}
                        sx={{ 
                          '& .MuiListItemText-primary': {
                            fontSize: '0.95rem',
                            lineHeight: 1.6
                          }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          ) : (
            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" minHeight={300} p={3}>
              <Alert severity="info" sx={{ mb: 2, width: '100%', maxWidth: 600 }}>
                <Typography variant="body1">
                  No data available. Click the button below to load disposable amount details.
                </Typography>
              </Alert>
              <Button 
                variant="contained" 
                onClick={handleDisposableCardClick}
                sx={{ mt: 2 }}
              >
                Load Data
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDisposableModal} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>

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
              
              {/* Unemployed Checkbox */}
              <Box sx={{ mb: 2 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={profileFormData.isUnemployed}
                      onChange={handleUnemployedChange}
                      color="primary"
                    />
                  }
                  label="I am currently unemployed"
                />
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Job Title"
                    value={profileFormData.jobTitle}
                    onChange={(e) => handleProfileFormInputChange('jobTitle', e.target.value)}
                    required={!profileFormData.isUnemployed}
                    disabled={profileFormData.isUnemployed}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    value={profileFormData.company}
                    onChange={(e) => handleProfileFormInputChange('company', e.target.value)}
                    required={!profileFormData.isUnemployed}
                    disabled={profileFormData.isUnemployed}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required={!profileFormData.isUnemployed} disabled={profileFormData.isUnemployed}>
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
                    disabled={profileFormData.isUnemployed}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={profileFormData.location}
                    onChange={(e) => handleProfileFormInputChange('location', e.target.value)}
                    disabled={profileFormData.isUnemployed}
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
