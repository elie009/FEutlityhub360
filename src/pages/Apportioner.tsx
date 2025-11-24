import React, { useState, useEffect } from 'react';
import {
  Container, Typography, Box, Grid, Card, CardContent, Alert,
  TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Slider, Chip, Divider, Paper, LinearProgress, Stack,
  IconButton, Tooltip, Tabs, Tab, List, ListItem, ListItemText,
  ListItemIcon, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import {
  TrendingUp, TrendingDown, AccountBalance, AttachMoney,
  CalendarToday, Flag, Savings, Calculate, DragIndicator,
  Lightbulb, PieChart, Timeline, Assessment, CheckCircle,
  Warning, Info, Close,
} from '@mui/icons-material';
import {
  PieChart as RechartsPieChart, Pie, Cell, BarChart, Bar,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  Legend, ResponsiveContainer, ComposedChart,
} from 'recharts';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
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
  const { formatCurrency } = useCurrency();
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

  // Graph maximum value from total monthly income API
  const [graphMaxValue, setGraphMaxValue] = useState(1000);

  // Allocation Planner State
  const [allocationTemplates, setAllocationTemplates] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<any | null>(null);
  const [allocationHistory, setAllocationHistory] = useState<any[]>([]);
  const [allocationTrends, setAllocationTrends] = useState<any[]>([]);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>(null);
  const [selectedTab, setSelectedTab] = useState(0);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  useEffect(() => {
    if (user?.id) {
      loadFinancialData();
      loadAllocationData();
    }
  }, [user?.id]);

  const loadAllocationData = async () => {
    if (!user?.id) return;

    try {
      // Load templates, active plan, history, trends, and recommendations
      const [templates, plan, history, trends, recs] = await Promise.all([
        apiService.getAllocationTemplates().catch(() => []),
        apiService.getActiveAllocationPlan().catch(() => null),
        apiService.getAllocationHistory({ months: 12 }).catch(() => []),
        apiService.getAllocationTrends(undefined, 12).catch(() => []),
        apiService.getAllocationRecommendations().catch(() => []),
      ]);

      // Load chart data after we have the plan
      const chart = plan 
        ? await apiService.getAllocationChartData(plan.id).catch(() => null)
        : null;

      setAllocationTemplates(templates);
      setActivePlan(plan);
      setAllocationHistory(history);
      setAllocationTrends(trends);
      setRecommendations(recs);
      setChartData(chart);
    } catch (err) {
      console.error('Failed to load allocation data:', err);
    }
  };

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

      // Set graph maximum to total monthly income from API
      setGraphMaxValue(Math.max(totalMonthlyIncome || 1000, 1000));

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
    const currentMonthlySavings = adjustableValues.monthlySavings; // Use current savings from Interactive Financial Overview
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
      
      // Auto-adjust expenses and savings to always add up to income
      if (key === 'monthlyIncome') {
        // When income changes, keep the same ratio of expenses to savings
        const totalCurrent = prev.monthlyExpenses + Math.abs(prev.monthlySavings);
        if (totalCurrent > 0) {
          const expenseRatio = prev.monthlyExpenses / totalCurrent;
          const savingsRatio = Math.abs(prev.monthlySavings) / totalCurrent;
          
          newValues.monthlyExpenses = newValues.monthlyIncome * expenseRatio;
          // Maintain the sign of savings (positive/negative)
          const savingsAmount = newValues.monthlyIncome * savingsRatio;
          newValues.monthlySavings = prev.monthlySavings >= 0 ? savingsAmount : -savingsAmount;
        } else {
          // If no previous allocation, split 50/50
          newValues.monthlyExpenses = newValues.monthlyIncome * 0.5;
          newValues.monthlySavings = newValues.monthlyIncome * 0.5;
        }
      } else if (key === 'monthlyExpenses') {
        // When expenses change, adjust savings to maintain total = income
        const remainingAmount = newValues.monthlyIncome - newValues.monthlyExpenses;
        // Maintain the sign of savings (positive/negative)
        newValues.monthlySavings = prev.monthlySavings >= 0 ? remainingAmount : -remainingAmount;
      } else if (key === 'monthlySavings') {
        // When savings change, adjust expenses to maintain total = income
        newValues.monthlyExpenses = newValues.monthlyIncome - Math.abs(newValues.monthlySavings);
      }
      
      return newValues;
    });
  };

  const handleCardClick = (page: string) => {
    navigate(page);
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Based on your current Interactive Financial Overview settings
              </Typography>
              <Divider sx={{ mb: 3 }} />
              
              {goalPlan ? (
                <Box>
                  {/* Current Financial Overview Values */}
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Current Financial Overview:
                    </Typography>
                    <Grid container spacing={1}>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Income
                        </Typography>
                        <Typography variant="body2" color="success.main" fontWeight="bold">
                          {formatCurrency(adjustableValues.monthlyIncome)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Expenses
                        </Typography>
                        <Typography variant="body2" color="error.main" fontWeight="bold">
                          {formatCurrency(adjustableValues.monthlyExpenses)}
                        </Typography>
                      </Grid>
                      <Grid item xs={4}>
                        <Typography variant="body2" color="text.secondary">
                          Current Savings
                        </Typography>
                        <Typography variant="body2" color={adjustableValues.monthlySavings >= 0 ? 'primary.main' : 'error.main'} fontWeight="bold">
                          {formatCurrency(adjustableValues.monthlySavings)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>

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

                  {/* Savings Comparison */}
                  <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Savings Analysis:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Current Monthly Savings
                        </Typography>
                        <Typography variant="h6" color={adjustableValues.monthlySavings >= 0 ? 'primary.main' : 'error.main'}>
                          {formatCurrency(adjustableValues.monthlySavings)}
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
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        Difference: 
                        <Typography component="span" variant="body2" color={goalPlan.requiredMonthlySavings <= adjustableValues.monthlySavings ? 'success.main' : 'error.main'} fontWeight="bold">
                          {goalPlan.requiredMonthlySavings <= adjustableValues.monthlySavings ? ' +' : ' '}
                          {formatCurrency(Math.abs(goalPlan.requiredMonthlySavings - adjustableValues.monthlySavings))}
                          {goalPlan.requiredMonthlySavings <= adjustableValues.monthlySavings ? ' surplus' : ' shortfall'}
                        </Typography>
                      </Typography>
                    </Box>
                  </Box>

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
              {(() => {
                const step = graphMaxValue / 5;
                return [0, step, step * 2, step * 3, step * 4, graphMaxValue].map((value) => (
                  <Typography key={value} variant="caption" color="text.secondary">
                    {formatCurrency(Math.round(value))}
                  </Typography>
                ));
              })()}
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
                        width: `${Math.min((adjustableValues.monthlyIncome / graphMaxValue) * 100, 100)}%`,
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
                      max={graphMaxValue}
                      step={Math.max(graphMaxValue / 100, 10)}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        '& .MuiSlider-thumb': {
                          width: 20,
                          height: 20,
                          display: 'none',
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
                        width: `${Math.min((adjustableValues.monthlyExpenses / graphMaxValue) * 100, 100)}%`,
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
                      max={graphMaxValue}
                      step={Math.max(graphMaxValue / 100, 10)}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        '& .MuiSlider-thumb': {
                          width: 20,
                          height: 20,
                          display: 'none',
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
                        width: `${Math.min((Math.abs(adjustableValues.monthlySavings) / graphMaxValue) * 100, 100)}%`,
                        bgcolor: adjustableValues.monthlySavings >= 0 ? 'primary.main' : 'error.main',
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
                      value={Math.abs(adjustableValues.monthlySavings)}
                      onChange={(_, value) => {
                        const newValue = adjustableValues.monthlySavings >= 0 ? value as number : -(value as number);
                        handleAdjustableValueChange('monthlySavings', newValue);
                      }}
                      min={0}
                      max={graphMaxValue}
                      step={Math.max(graphMaxValue / 100, 10)}
                      sx={{
                        position: 'absolute',
                        left: 0,
                        right: 0,
                        '& .MuiSlider-thumb': {
                          width: 20,
                          height: 20,
                          bgcolor: adjustableValues.monthlySavings >= 0 ? 'primary.main' : 'error.main',
                          border: '2px solid blue',
                          display: 'none',
                          '&:hover': {
                            boxShadow: adjustableValues.monthlySavings >= 0 
                              ? '0 0 0 8px rgba(25, 118, 210, 0.16)' 
                              : '0 0 0 8px rgba(244, 67, 54, 0.16)',
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

      {/* Allocation Planner Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Allocation Planner
            </Typography>
            <Button
              variant="outlined"
              startIcon={<PieChart />}
              onClick={() => setTemplateDialogOpen(true)}
            >
              Use Template
            </Button>
          </Box>
          <Divider sx={{ mb: 3 }} />

          <Tabs value={selectedTab} onChange={(_, v) => setSelectedTab(v)} sx={{ mb: 3 }}>
            <Tab label="Current Plan" icon={<Assessment />} iconPosition="start" />
            <Tab label="Charts" icon={<PieChart />} iconPosition="start" />
            <Tab label="Trends" icon={<Timeline />} iconPosition="start" />
            <Tab label="Recommendations" icon={<Lightbulb />} iconPosition="start" />
          </Tabs>

          {selectedTab === 0 && (
            <Box>
              {activePlan ? (
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      {activePlan.planName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Monthly Income: {formatCurrency(activePlan.monthlyIncome)}
                    </Typography>
                  </Grid>
                  {activePlan.categories?.map((category: any) => (
                    <Grid item xs={12} sm={6} md={4} key={category.id}>
                      <Card variant="outlined">
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2">{category.categoryName}</Typography>
                            <Chip
                              label={category.status === 'on_track' ? 'On Track' : category.status === 'over_budget' ? 'Over' : 'Under'}
                              color={category.status === 'on_track' ? 'success' : category.status === 'over_budget' ? 'error' : 'warning'}
                              size="small"
                            />
                          </Box>
                          <Typography variant="h6">{formatCurrency(category.allocatedAmount)}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {category.percentage}% of income
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Actual: {formatCurrency(category.actualAmount || 0)}
                          </Typography>
                          {category.variance !== 0 && (
                            <Typography
                              variant="body2"
                              color={category.variance < 0 ? 'error.main' : 'success.main'}
                            >
                              Variance: {formatCurrency(category.variance)}
                            </Typography>
                          )}
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Alert severity="info">
                  No active allocation plan. Create one using a template or manually.
                </Alert>
              )}
            </Box>
          )}

          {selectedTab === 1 && chartData && (
            <Box>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Allocation Pie Chart</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={chartData.dataPoints}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="allocatedAmount"
                      >
                        {chartData.dataPoints.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color || `#${Math.floor(Math.random()*16777215).toString(16)}`} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>Allocated vs Actual</Typography>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData.dataPoints}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="categoryName" />
                      <YAxis />
                      <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="allocatedAmount" fill="#8884d8" name="Allocated" />
                      <Bar dataKey="actualAmount" fill="#82ca9d" name="Actual" />
                    </BarChart>
                  </ResponsiveContainer>
                </Grid>
              </Grid>
            </Box>
          )}

          {selectedTab === 2 && allocationTrends.length > 0 && (
            <Box>
              <Typography variant="subtitle1" gutterBottom>Allocation Trends (Last 12 Months)</Typography>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={allocationTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="periodDate" />
                  <YAxis />
                  <RechartsTooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="totalAllocated" fill="#8884d8" name="Allocated" />
                  <Bar dataKey="totalActual" fill="#82ca9d" name="Actual" />
                  <Line type="monotone" dataKey="totalAllocated" stroke="#8884d8" />
                  <Line type="monotone" dataKey="totalActual" stroke="#82ca9d" />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          )}

          {selectedTab === 3 && (
            <Box>
              {recommendations.length > 0 ? (
                <List>
                  {recommendations.map((rec: any) => (
                    <ListItem key={rec.id}>
                      <ListItemIcon>
                        {rec.priority === 'urgent' ? <Warning color="error" /> :
                         rec.priority === 'high' ? <Warning color="warning" /> :
                         <Info color="info" />}
                      </ListItemIcon>
                      <ListItemText
                        primary={rec.title}
                        secondary={rec.message}
                      />
                      <Button
                        size="small"
                        onClick={async () => {
                          try {
                            await apiService.applyRecommendation(rec.id);
                            await loadAllocationData();
                          } catch (err) {
                            console.error('Failed to apply recommendation:', err);
                          }
                        }}
                      >
                        Apply
                      </Button>
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Alert severity="info">No recommendations available. Generate recommendations to get personalized advice.</Alert>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Template Selection Dialog */}
      <Dialog open={templateDialogOpen} onClose={() => setTemplateDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Select Allocation Template
          <IconButton
            onClick={() => setTemplateDialogOpen(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Template</InputLabel>
            <Select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            >
              {allocationTemplates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name} - {template.description}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {selectedTemplate && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>Template Breakdown:</Typography>
              {allocationTemplates.find(t => t.id === selectedTemplate)?.categories.map((cat: any) => (
                <Typography key={cat.id} variant="body2">
                  {cat.categoryName}: {cat.percentage}%
                </Typography>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={async () => {
              if (selectedTemplate && adjustableValues.monthlyIncome > 0) {
                try {
                  await apiService.applyAllocationTemplate(selectedTemplate, adjustableValues.monthlyIncome);
                  await loadAllocationData();
                  setTemplateDialogOpen(false);
                } catch (err) {
                  console.error('Failed to apply template:', err);
                }
              }
            }}
            disabled={!selectedTemplate || adjustableValues.monthlyIncome <= 0}
          >
            Apply Template
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Apportioner;
