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
} from '@mui/material';
import {
  TrendingUp,
  People,
  AccountBalance,
  Receipt,
  CheckCircle,
} from '@mui/icons-material';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';


const Dashboard: React.FC = () => {
  const { hasProfile, userProfile, isAuthenticated } = useAuth();
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
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
    </Box>
  );
};

export default Dashboard;
