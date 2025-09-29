import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent, Alert,
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Slider, Chip, Divider, Paper, LinearProgress, Stack,
  IconButton, Tooltip,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, AccountBalance, AttachMoney,
  CalendarToday, Flag, Savings, Calculate, DragIndicator,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { getErrorMessage } from '../utils/validation';
import { Bill, BillStatus } from '../types/bill';
import { Loan, LoanStatus } from '../types/loan';
import { useNavigate } from 'react-router-dom';

interface FinancialData {
  currentBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyBills: number;
  monthlyLoans: number;
  otherExpenses: number;
}

interface GoalPlan {
  targetAmount: number;
  targetDate: string;
  monthsToGoal: number;
  requiredMonthlySavings: number;
  adjustedExpenses: number;
  feasibility: 'achievable' | 'challenging' | 'difficult';
  recommendations: string[];
}

const Apportioner: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [financialData, setFinancialData] = useState<FinancialData>({
    currentBalance: 0,
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlyBills: 0,
    monthlyLoans: 0,
    otherExpenses: 0,
  });
  const [targetAmount, setTargetAmount] = useState<number>(0);
  const [targetDate, setTargetDate] = useState<string>('');
  const [goalPlan, setGoalPlan] = useState<GoalPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Adjustable values for the interactive bar chart
  const [adjustableValues, setAdjustableValues] = useState({
    monthlyIncome: 0,
    monthlyExpenses: 0,
    monthlySavings: 0,
  });

  useEffect(() => {
    if (user?.id) {
      loadFinancialData();
    }
  }, [user?.id]);

  useEffect(() => {
    if (targetAmount && targetDate) {
      calculateGoalPlan();
    }
  }, [adjustableValues, targetAmount, targetDate]);

  const loadFinancialData = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    setError(null);

    try {
      // Load bank account analytics for current balance and income/expense data
      const [bankAnalytics, bills, loans, totalMonthlyIncome] = await Promise.all([
        apiService.getBankAccountAnalyticsSummary(),
        apiService.getUserBills(),
        apiService.getUserLoans(user.id),
        apiService.getTotalMonthlyIncome(),
      ]);

      // Calculate monthly expenses from bills and loans
      const monthlyBills = bills.data
        .filter((bill: Bill) => bill.status === BillStatus.PENDING || bill.status === BillStatus.PAID)
        .reduce((total: number, bill: Bill) => total + bill.amount, 0);

      const monthlyLoans = (loans as Loan[])
        .filter((loan: Loan) => loan.status === LoanStatus.ACTIVE)
        .reduce((total: number, loan: Loan) => total + (loan.monthlyPayment || 0), 0);

      const monthlyIncome = totalMonthlyIncome || bankAnalytics?.totalIncoming || 0;
      const currentBalance = bankAnalytics?.totalBalance || 0;
      const otherExpenses = Math.max(0, monthlyIncome - monthlyBills - monthlyLoans - 500); // Estimate other expenses

      const totalMonthlyExpenses = monthlyBills + monthlyLoans + otherExpenses;
      const monthlySavings = monthlyIncome - totalMonthlyExpenses;

      setFinancialData({
        currentBalance,
        monthlyIncome,
        monthlyExpenses: totalMonthlyExpenses,
        monthlyBills,
        monthlyLoans,
        otherExpenses,
      });

      // Initialize adjustable values with loaded data
      setAdjustableValues({
        monthlyIncome,
        monthlyExpenses: totalMonthlyExpenses,
        monthlySavings: Math.max(0, monthlySavings),
      });
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load financial data'));
    } finally {
      setIsLoading(false);
    }
  };

  const calculateGoalPlan = () => {
    if (!targetAmount || !targetDate) return;

    const targetDateObj = new Date(targetDate);
    const currentDate = new Date();
    const monthsToGoal = Math.max(1, Math.ceil((targetDateObj.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24 * 30)));

    const requiredMonthlySavings = (targetAmount - financialData.currentBalance) / monthsToGoal;
    const currentMonthlySavings = adjustableValues.monthlyIncome - adjustableValues.monthlyExpenses;
    const adjustedExpenses = adjustableValues.monthlyExpenses + (requiredMonthlySavings - currentMonthlySavings);

    let feasibility: 'achievable' | 'challenging' | 'difficult' = 'achievable';
    const recommendations: string[] = [];

    if (requiredMonthlySavings > currentMonthlySavings) {
      const shortfall = requiredMonthlySavings - currentMonthlySavings;
      
      if (shortfall <= adjustableValues.monthlyIncome * 0.1) {
        feasibility = 'challenging';
        recommendations.push('Consider reducing discretionary spending by 10%');
        recommendations.push('Look for ways to increase income slightly');
      } else {
        feasibility = 'difficult';
        recommendations.push('Significant lifestyle changes needed');
        recommendations.push('Consider extending the target date');
        recommendations.push('Look for additional income sources');
      }

      recommendations.push(`Need to save $${shortfall.toFixed(2)} more per month`);
    } else {
      recommendations.push('Goal is achievable with current financial situation');
      recommendations.push('Consider increasing the target amount or shortening the timeline');
    }

    setGoalPlan({
      targetAmount,
      targetDate,
      monthsToGoal,
      requiredMonthlySavings,
      adjustedExpenses,
      feasibility,
      recommendations,
    });
  };

  const handleCalculate = () => {
    calculateGoalPlan();
  };

  const handleAdjustableValueChange = (key: keyof typeof adjustableValues, value: number) => {
    setAdjustableValues(prev => {
      const newValues = { ...prev, [key]: value };
      
      // Auto-calculate savings when income or expenses change
      if (key === 'monthlyIncome' || key === 'monthlyExpenses') {
        newValues.monthlySavings = Math.max(0, newValues.monthlyIncome - newValues.monthlyExpenses);
      }
      
      return newValues;
    });
  };

  const handleCardClick = (page: string) => {
    navigate(page);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getFeasibilityColor = (feasibility: string) => {
    switch (feasibility) {
      case 'achievable': return 'success';
      case 'challenging': return 'warning';
      case 'difficult': return 'error';
      default: return 'default';
    }
  };

  if (isLoading) {
    return (
      <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
          <LinearProgress sx={{ width: '100%' }} />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth={false} sx={{ mt: 4, mb: 4, px: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Financial Apportioner
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Plan your financial goals with precision
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Current Financial Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalance sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">
                    {formatCurrency(financialData.currentBalance)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Current Balance
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography variant="h6">
                    {formatCurrency(adjustableValues.monthlyIncome)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Income
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingDown sx={{ mr: 2, color: 'error.main' }} />
                <Box>
                  <Typography variant="h6">
                    {formatCurrency(adjustableValues.monthlyExpenses)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Expenses
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Savings sx={{ mr: 2, color: 'info.main' }} />
                <Box>
                  <Typography variant="h6" color={adjustableValues.monthlySavings >= 0 ? 'primary.main' : 'error.main'}>
                    {formatCurrency(adjustableValues.monthlySavings)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Savings
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Goal Planning Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <Flag sx={{ mr: 1 }} />
                Set Your Financial Goal
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Target Amount"
                    type="number"
                    value={targetAmount}
                    onChange={(e) => setTargetAmount(Number(e.target.value))}
                    InputProps={{
                      startAdornment: <AttachMoney sx={{ mr: 1, color: 'text.secondary' }} />,
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Target Date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      min: new Date().toISOString().split('T')[0],
                    }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button
                    fullWidth
                    variant="contained"
                    startIcon={<Calculate />}
                    onClick={handleCalculate}
                    disabled={!targetAmount || !targetDate}
                    sx={{ mt: 2 }}
                  >
                    Calculate Plan
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarToday sx={{ mr: 1 }} />
                Goal Analysis
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {goalPlan ? (
                <Box>
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Months to Goal
                      </Typography>
                      <Typography variant="h6">
                        {goalPlan.monthsToGoal}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Required Monthly Savings
                      </Typography>
                      <Typography variant="h6" color="primary.main">
                        {formatCurrency(goalPlan.requiredMonthlySavings)}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Goal Feasibility
                    </Typography>
                    <Chip
                      label={goalPlan.feasibility.toUpperCase()}
                      color={getFeasibilityColor(goalPlan.feasibility)}
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Recommendations
                    </Typography>
                    {goalPlan.recommendations.map((rec, index) => (
                      <Typography key={index} variant="body2" sx={{ mb: 0.5 }}>
                        • {rec}
                      </Typography>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Flag sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="body1" color="text.secondary">
                    Set your target amount and date to see your personalized plan
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Interactive Financial Bar Chart */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Interactive Financial Overview
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              Adjust the bars to see how changes affect your financial situation
            </Typography>
            
            {/* X-axis labels */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, px: 1 }}>
              {[0, 2000, 4000, 6000, 8000, 10000].map((value) => (
                <Typography key={value} variant="caption" color="text.secondary">
                  {formatCurrency(value)}
                </Typography>
              ))}
            </Box>
            
            {/* Interactive Bar Chart */}
            <Box sx={{ position: 'relative', border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2, bgcolor: 'background.paper' }}>
              {/* Monthly Income Bar */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 'bold' }}>
                    Monthly Income
                  </Typography>
                  <Box sx={{ flex: 1, position: 'relative', height: 40, display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        height: 20,
                        width: `${Math.min((adjustableValues.monthlyIncome / 10000) * 100, 100)}%`,
                        bgcolor: 'success.main',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        pr: 1,
                        transition: 'width 0.3s ease',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}>
                        {formatCurrency(adjustableValues.monthlyIncome)}
                      </Typography>
                    </Box>
                    <Slider
                      value={adjustableValues.monthlyIncome}
                      onChange={(_, value) => handleAdjustableValueChange('monthlyIncome', value as number)}
                      min={0}
                      max={10000}
                      step={100}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        '& .MuiSlider-thumb': {
                          width: 20,
                          height: 20,
                          bgcolor: 'success.main',
                          border: '2px solid white',
                          '&:hover': {
                            boxShadow: '0 0 0 8px rgba(76, 175, 80, 0.16)',
                          },
                        },
                        '& .MuiSlider-track': {
                          display: 'none',
                        },
                        '& .MuiSlider-rail': {
                          display: 'none',
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Monthly Expenses Bar */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 'bold' }}>
                    Monthly Expenses
                  </Typography>
                  <Box sx={{ flex: 1, position: 'relative', height: 40, display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        height: 20,
                        width: `${Math.min((adjustableValues.monthlyExpenses / 10000) * 100, 100)}%`,
                        bgcolor: 'error.main',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        pr: 1,
                        transition: 'width 0.3s ease',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}>
                        {formatCurrency(adjustableValues.monthlyExpenses)}
                      </Typography>
                    </Box>
                    <Slider
                      value={adjustableValues.monthlyExpenses}
                      onChange={(_, value) => handleAdjustableValueChange('monthlyExpenses', value as number)}
                      min={0}
                      max={10000}
                      step={100}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        '& .MuiSlider-thumb': {
                          width: 20,
                          height: 20,
                          bgcolor: 'error.main',
                          border: '2px solid white',
                          '&:hover': {
                            boxShadow: '0 0 0 8px rgba(244, 67, 54, 0.16)',
                          },
                        },
                        '& .MuiSlider-track': {
                          display: 'none',
                        },
                        '& .MuiSlider-rail': {
                          display: 'none',
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>

              {/* Monthly Savings Bar */}
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Typography variant="body2" sx={{ minWidth: 120, fontWeight: 'bold' }}>
                    Monthly Savings
                  </Typography>
                  <Box sx={{ flex: 1, position: 'relative', height: 40, display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        position: 'absolute',
                        left: 0,
                        height: 20,
                        width: `${Math.min((adjustableValues.monthlySavings / 10000) * 100, 100)}%`,
                        bgcolor: 'primary.main',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        pr: 1,
                        transition: 'width 0.3s ease',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold', fontSize: '0.7rem' }}>
                        {formatCurrency(adjustableValues.monthlySavings)}
                      </Typography>
                    </Box>
                    <Slider
                      value={adjustableValues.monthlySavings}
                      onChange={(_, value) => handleAdjustableValueChange('monthlySavings', value as number)}
                      min={0}
                      max={10000}
                      step={100}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        '& .MuiSlider-thumb': {
                          width: 20,
                          height: 20,
                          bgcolor: 'primary.main',
                          border: '2px solid white',
                          '&:hover': {
                            boxShadow: '0 0 0 8px rgba(177, 229, 153, 0.16)',
                          },
                        },
                        '& .MuiSlider-track': {
                          display: 'none',
                        },
                        '& .MuiSlider-rail': {
                          display: 'none',
                        },
                      }}
                    />
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Summary Section */}
          <Box sx={{ mt: 3, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" gutterBottom>
              Financial Summary
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="success.main">
                    {formatCurrency(adjustableValues.monthlyIncome)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Income
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color="error.main">
                    {formatCurrency(adjustableValues.monthlyExpenses)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Expenses
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" color={adjustableValues.monthlySavings >= 0 ? 'primary.main' : 'error.main'}>
                    {formatCurrency(adjustableValues.monthlySavings)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monthly Savings
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            {adjustableValues.monthlySavings < 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  ⚠️ Your expenses exceed your income by {formatCurrency(Math.abs(adjustableValues.monthlySavings))} per month. 
                  Consider reducing expenses or increasing income.
                </Typography>
              </Alert>
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Expense Breakdown */}
      {financialData.monthlyExpenses > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Monthly Expense Breakdown
            </Typography>
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Tooltip
                  title={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        What are "Bills & Utilities"?
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • Essential monthly bills you must pay
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • Includes: electricity, water, gas, internet, phone
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • Insurance: health, car, home, life insurance
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • Subscriptions: Netflix, Spotify, Adobe, gym memberships
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • School tuition and credit card bills
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • These are recurring, predictable expenses
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Click to manage your bills →
                      </Typography>
                    </Box>
                  }
                  arrow
                  placement="top"
                >
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      bgcolor: 'error.light', 
                      borderRadius: 1, 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'error.main',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(244, 67, 54, 0.3)',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                      }
                    }}
                    onClick={() => handleCardClick('/bills')}
                  >
                    <Typography variant="h6" color="error.contrastText">
                      {formatCurrency(financialData.monthlyBills)}
                    </Typography>
                    <Typography variant="body2" color="error.contrastText">
                      Bills & Utilities
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Tooltip
                  title={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        What are "Loan Payments"?
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • Monthly payments for borrowed money
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • Includes: personal loans, car loans, student loans
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • Home loans: mortgage payments and refinancing
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • Credit card minimum payments
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • Business loans and equipment financing
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • Fixed monthly amounts with interest included
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Click to manage your loans →
                      </Typography>
                    </Box>
                  }
                  arrow
                  placement="top"
                >
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      bgcolor: 'warning.light', 
                      borderRadius: 1, 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'warning.main',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(255, 152, 0, 0.3)',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                      }
                    }}
                    onClick={() => handleCardClick('/loans')}
                  >
                    <Typography variant="h6" color="warning.contrastText">
                      {formatCurrency(financialData.monthlyLoans)}
                    </Typography>
                    <Typography variant="body2" color="warning.contrastText">
                      Loan Payments
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Tooltip
                  title={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        What are "Other Expenses"?
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • Variable and discretionary spending
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • Food & dining: groceries, restaurants, takeout
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • Transportation: gas, public transit, rideshare
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • Entertainment: movies, hobbies, sports
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 0.5 }}>
                        • Shopping: clothes, electronics, personal items
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 1 }}>
                        • These expenses can often be reduced or optimized
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                        Click to view transactions →
                      </Typography>
                    </Box>
                  }
                  arrow
                  placement="top"
                >
                  <Box 
                    sx={{ 
                      textAlign: 'center', 
                      p: 2, 
                      bgcolor: 'info.light', 
                      borderRadius: 1, 
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'info.main',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 8px rgba(33, 150, 243, 0.3)',
                      },
                      '&:active': {
                        transform: 'translateY(0px)',
                      }
                    }}
                    onClick={() => handleCardClick('/transactions')}
                  >
                    <Typography variant="h6" color="info.contrastText">
                      {formatCurrency(financialData.otherExpenses)}
                    </Typography>
                    <Typography variant="body2" color="info.contrastText">
                      Other Expenses
                    </Typography>
                  </Box>
                </Tooltip>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Container>
  );
};

export default Apportioner;
