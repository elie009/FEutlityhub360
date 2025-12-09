import React, { useState, useEffect, useMemo } from 'react';
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
  Skeleton,
  IconButton,
  Tooltip,
  LinearProgress,
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
  CreditCard as CreditCardIcon,
  Warning as WarningIcon,
  Schedule as ScheduleIcon,
  Savings as SavingsIcon,
  MoreVert as MoreVertIcon,
  AccountCircle,
  TrackChanges,
  Info as InfoIcon,
  HelpOutline as HelpOutlineIcon,
} from '@mui/icons-material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { apiService } from '../services/api';
import OnboardingWizard from '../components/Onboarding/OnboardingWizard';
import TransactionCard from '../components/Transactions/TransactionCard';
import UnpaidBillsCard from '../components/Bills/UnpaidBillsCard';
import { BankAccountTransaction } from '../types/transaction';
import { Bill, BillStatus } from '../types/bill';
import { SavingsAccount } from '../types/savings';
import { useNavigate } from 'react-router-dom';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend,
  ChartDataLabels
);

const Dashboard: React.FC = () => {
  const { hasProfile, userProfile, isAuthenticated, user, logout, updateUserProfile } = useAuth();
  const { formatCurrency, currency } = useCurrency();
  const navigate = useNavigate();
  const [financialData, setFinancialData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Financial Overview period states
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<number | undefined>(undefined);
  
  // Monthly cash flow data
  const [monthlyCashFlowData, setMonthlyCashFlowData] = useState<any>(null);
  const [cashFlowLoading, setCashFlowLoading] = useState(false);
  
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
    country: '',
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
  
  // Onboarding state
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  // Recent transactions state
  const [recentTransactions, setRecentTransactions] = useState<BankAccountTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  
  // Income sources with summary state
  const [incomeSourcesSummary, setIncomeSourcesSummary] = useState<any>(null);
  const [incomeSourcesLoading, setIncomeSourcesLoading] = useState(false);
  
  // Unpaid bills state
  const [unpaidBills, setUnpaidBills] = useState<Bill[]>([]);
  const [unpaidBillsLoading, setUnpaidBillsLoading] = useState(false);

  // Filter unpaid bills to show only overdue or bills with 10 days or less until due date
  const filteredUnpaidBills = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return unpaidBills.filter((bill) => {
      const dueDate = new Date(bill.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      
      // Calculate days until due date (negative if overdue)
      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      // Show if overdue (diffDays < 0) or has 10 days or less (diffDays <= 10)
      return diffDays <= 10;
    });
  }, [unpaidBills]);
  
  // Savings summary state
  const [savingsAccounts, setSavingsAccounts] = useState<SavingsAccount[]>([]);
  const [savingsLoading, setSavingsLoading] = useState(false);
  
  // Recent Activity state
  const [recentActivity, setRecentActivity] = useState<{
    incomeSourcesCount: number;
    totalMonthlyIncome: number;
    totalMonthlyGoals: number;
    disposableAmount: number;
    hasProfile: boolean;
    profileStatus: string;
  } | null>(null);
  const [recentActivityLoading, setRecentActivityLoading] = useState(false);
  
  // Check if user needs to complete profile
  useEffect(() => {
    if (user && !hasProfile) {
      // Show onboarding wizard instead of the old profile form
      setShowOnboarding(true);
      setShowProfileForm(false);
    } else if (user && hasProfile) {
      setShowProfileForm(false);
      setShowOnboarding(false);
    }
  }, [user, hasProfile]);

  // Fetch real financial data
  const loadFinancialData = async (year?: number, month?: number) => {
    if (!isAuthenticated) return;
    
    try {
      setLoading(true);
      // Fetch bank account summary for real financial data
      const summary = await apiService.getBankAccountSummary(year, month);
      setFinancialData(summary);
    } catch (error) {
      console.error('Failed to load financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

  // Fetch recent transactions on page load
  useEffect(() => {
    const loadRecentTransactions = async () => {
      if (!isAuthenticated) return;
      
      try {
        setTransactionsLoading(true);
        const response = await apiService.getTransactions({ limit: 6, page: 1 });
        setRecentTransactions(response.data || []);
      } catch (error) {
        console.error('Failed to load recent transactions for dashboard:', error);
        setRecentTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };
    
    loadRecentTransactions();
  }, [isAuthenticated]);

  // Fetch monthly cash flow data on page load
  useEffect(() => {
    const loadMonthlyCashFlow = async () => {
      if (!isAuthenticated) return;
      
      try {
        setCashFlowLoading(true);
        const currentYear = new Date().getFullYear();
        const response = await apiService.getMonthlyCashFlow(currentYear);
        console.log('Monthly Cash Flow API Response:', response);
        console.log('Monthly Data:', response?.monthlyData);
        if (response?.monthlyData) {
          response.monthlyData.forEach((month: any) => {
            console.log(`Month ${month.month}: incoming=${month.incoming}, outgoing=${month.outgoing}, net=${month.net}`);
          });
        }
        setMonthlyCashFlowData(response);
      } catch (error) {
        console.error('Failed to load monthly cash flow:', error);
        setMonthlyCashFlowData(null);
      } finally {
        setCashFlowLoading(false);
      }
    };
    
    loadMonthlyCashFlow();
  }, [isAuthenticated]);

  // Fetch income sources with summary on page load
  useEffect(() => {
    const loadIncomeSourcesSummary = async () => {
      if (!isAuthenticated) return;
      
      try {
        setIncomeSourcesLoading(true);
        const response = await apiService.getIncomeSourcesWithSummary(true);
        setIncomeSourcesSummary(response);
      } catch (error) {
        console.error('Failed to load income sources summary:', error);
        setIncomeSourcesSummary(null);
      } finally {
        setIncomeSourcesLoading(false);
      }
    };
    
    loadIncomeSourcesSummary();
  }, [isAuthenticated]);

  // Fetch savings summary on page load
  useEffect(() => {
    const loadSavingsSummary = async () => {
      if (!isAuthenticated) return;
      
      try {
        setSavingsLoading(true);
        // Fetch all savings accounts to show in the summary
        const accounts = await apiService.getSavingsAccounts();
        // Handle both array response and object with data property
        if (Array.isArray(accounts)) {
          setSavingsAccounts(accounts);
        } else if (accounts && accounts.data && Array.isArray(accounts.data)) {
          setSavingsAccounts(accounts.data);
        } else {
          setSavingsAccounts([]);
        }
      } catch (error) {
        console.error('Failed to load savings summary:', error);
        setSavingsAccounts([]);
      } finally {
        setSavingsLoading(false);
      }
    };
    
    loadSavingsSummary();
  }, [isAuthenticated]);

  // Fetch unpaid bills on page load
  useEffect(() => {
    const loadUnpaidBills = async () => {
      if (!isAuthenticated) return;
      
      try {
        setUnpaidBillsLoading(true);
        const bills = await apiService.getUnpaidBills();
        setUnpaidBills(bills);
      } catch (error) {
        console.error('Failed to load unpaid bills for dashboard:', error);
        setUnpaidBills([]);
      } finally {
        setUnpaidBillsLoading(false);
      }
    };
    
    loadUnpaidBills();
  }, [isAuthenticated]);

  // Fetch recent activity on page load
  useEffect(() => {
    const loadRecentActivity = async () => {
      if (!isAuthenticated) return;
      
      try {
        setRecentActivityLoading(true);
        const activity = await apiService.getRecentActivity();
        setRecentActivity(activity);
      } catch (error) {
        console.error('Failed to load recent activity:', error);
        setRecentActivity(null);
      } finally {
        setRecentActivityLoading(false);
      }
    };
    
    loadRecentActivity();
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
        country: '',
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

      // Prepare profile data (remove isUnemployed as it's not part of the API)
      const profileData = {
        jobTitle: profileFormData.jobTitle,
        company: profileFormData.company,
        employmentType: profileFormData.employmentType,
        monthlySavingsGoal: profileFormData.monthlySavingsGoal,
        monthlyInvestmentGoal: profileFormData.monthlyInvestmentGoal,
        monthlyEmergencyFundGoal: profileFormData.monthlyEmergencyFundGoal,
        taxRate: profileFormData.taxRate,
        monthlyTaxDeductions: profileFormData.monthlyTaxDeductions,
        industry: profileFormData.industry,
        location: '', // Location field removed from UI but still required by API
        country: profileFormData.country,
        notes: profileFormData.notes,
        preferredCurrency: currency,
      };

      let response;
      
      // First, check if profile already exists by trying to get it
      let existingProfile = null;
      try {
        existingProfile = await apiService.getUserProfile();
      } catch (error) {
        // Profile doesn't exist, that's fine
        existingProfile = null;
      }
      
      // If profile exists, use update; otherwise create
      if (existingProfile && existingProfile.id) {
        // Update existing profile
        response = await apiService.updateUserProfile(profileData);
        setProfileSuccess('Profile updated successfully!');
      } else {
        // Create new profile
        response = await apiService.createUserProfile({
          ...profileData,
          incomeSources: profileFormData.incomeSources,
        });
        setProfileSuccess('Profile created successfully!');
      }
      
      // Check if response is successful
      if (response && response.id) {
        // Fetch the profile immediately and update context
        const newProfile = await apiService.getUserProfile();
        if (newProfile && newProfile.id) {
          updateUserProfile(newProfile);  // This will update hasProfile to true
          setShowProfileForm(false);  // Close the modal immediately
        } else {
          setProfileError('Profile operation succeeded but failed to fetch. Please refresh the page.');
        }
      } else {
        setProfileError('Profile operation failed. Please try again.');
      }
      
    } catch (error: any) {
      // Handle the "profile already exists" error by trying to update instead
      if (error.message && error.message.includes('already exists')) {
        try {
          const profileData = {
            jobTitle: profileFormData.jobTitle,
            company: profileFormData.company,
            employmentType: profileFormData.employmentType,
            monthlySavingsGoal: profileFormData.monthlySavingsGoal,
            monthlyInvestmentGoal: profileFormData.monthlyInvestmentGoal,
            monthlyEmergencyFundGoal: profileFormData.monthlyEmergencyFundGoal,
            taxRate: profileFormData.taxRate,
            monthlyTaxDeductions: profileFormData.monthlyTaxDeductions,
            industry: profileFormData.industry,
            location: '', // Location field removed from UI but still required by API
            country: profileFormData.country,
            notes: profileFormData.notes,
            preferredCurrency: currency,
          };
          const response = await apiService.updateUserProfile(profileData);
          if (response && response.id) {
            const newProfile = await apiService.getUserProfile();
            if (newProfile && newProfile.id) {
              updateUserProfile(newProfile);
              setShowProfileForm(false);
              setProfileSuccess('Profile updated successfully!');
            }
          }
        } catch (updateError: any) {
          setProfileError(updateError.message || 'Failed to update profile');
        }
      } else {
        setProfileError(error.message || 'Failed to create profile');
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Onboarding handlers
  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    // Refresh the page to show updated dashboard
    window.location.reload();
  };

  const handleOnboardingSkip = () => {
    setShowOnboarding(false);
    // Show a message that they can complete setup later
    setProfileError('You can complete your profile setup anytime from the Settings page.');
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
  
  // Calculate total monthly income from income sources summary
  const totalMonthlyIncomeFromSources = incomeSourcesSummary?.incomeSources
    ? incomeSourcesSummary.incomeSources.reduce((sum: number, source: any) => sum + (source?.amount || 0), 0)
    : 0;
  
  // Calculate real stats from disposable amount API or fallback to user profile data
  const totalMonthlyIncome = totalMonthlyIncomeFromSources || (dashboardDisposableData ? (dashboardDisposableData.totalIncome || 0) : 0);
  const monthlyExpense = dashboardDisposableData ? (dashboardDisposableData.totalFixedExpenses || 0) : 0;
  const totalMonthlyGoals = userProfile?.totalMonthlyGoals || 0;
  const disposableIncome = dashboardDisposableData ? (dashboardDisposableData.disposableAmount || 0) : 0;
  const incomeSourcesCount = dashboardDisposableData?.incomeBreakdown?.length || userProfile?.incomeSources?.length || 0;
  
  const totalInitialBalanceSum = Array.isArray(financialData?.accounts)
    ? (financialData.accounts as any[])
        .filter((acc: any) => acc?.accountType?.toLowerCase() !== 'credit_card')
        .reduce((sum: number, acc: any) => sum + (acc?.initialBalance || 0), 0)
    : 0;

  // Extract Total Loan Payment from spendingByCategory
  const totalLoanPayment = financialData?.spendingByCategory?.LOAN_PAYMENT || 0;

  // Calculate total monthly payment for savings
  const totalMonthlySavingsPayment = savingsAccounts.reduce(
    (sum: number, account: SavingsAccount) => sum + (account.monthlyTarget || 0),
    0
  );

  // Transform monthly cash flow data for chart
  const prepareCashFlowChartData = () => {
    if (!monthlyCashFlowData || !monthlyCashFlowData.monthlyData) {
      console.log('No monthly cash flow data available');
      return [];
    }

    // Create a map of month number to data for quick lookup
    const monthDataMap = new Map();
    monthlyCashFlowData.monthlyData.forEach((month: any) => {
      monthDataMap.set(month.month, month);
    });

    // Create chart data for all 12 months (January to December)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const chartData = [];

    for (let i = 1; i <= 12; i++) {
      const monthData = monthDataMap.get(i) || {
        month: i,
        monthName: new Date(2024, i - 1, 1).toLocaleString('default', { month: 'long' }),
        monthAbbreviation: monthNames[i - 1],
        incoming: 0,
        outgoing: 0,
        net: 0,
      };

      chartData.push({
        month: monthData.monthAbbreviation || monthNames[i - 1],
        incoming: monthData.incoming || 0,
        outgoing: monthData.outgoing || 0,
        net: monthData.net || 0,
      });
    }

    console.log('Prepared chart data:', chartData);
    return chartData;
  };

  const cashFlowChartData = prepareCashFlowChartData();

  // Prepare Donut Chart data for account transaction counts
  const donutChartData = useMemo(() => {
    if (!financialData || !financialData.accounts || financialData.accounts.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderColor: [],
        }],
      };
    }

    // Show all accounts, even with 0 transactions, and sort by transactionCount descending
    const allAccounts = financialData.accounts
      .filter((acc: any) => acc.accountName) // Only filter out accounts without names
      .sort((a: any, b: any) => (b.transactionCount || 0) - (a.transactionCount || 0));

    if (allAccounts.length === 0) {
      return {
        labels: [],
        datasets: [{
          data: [],
          backgroundColor: [],
          borderColor: [],
        }],
      };
    }

    // Color palette for donut chart - matching the booking platform style
    const colors = [
      '#7DD3C0', // Light teal/mint green (like Direct Booking)
      '#4ECDC4', // Medium teal (like Booking.com)
      '#95E1A3', // Lime green (like Agoda)
      '#B8E6B8', // Light yellow-green (like Airbnb)
      '#FFF9C4', // Pale yellow (like Hotels.com)
      '#FFFACD', // Very light yellow (like Others)
      '#B3EE9A', // Color blind friendly light green
      '#FFD700', // Yellow/Gold
      '#87CEEB', // Sky blue
      '#FFB6C1', // Light pink
    ];

    const labels = allAccounts.map((acc: any) => acc.accountName || 'Unknown Account');
    const data = allAccounts.map((acc: any) => acc.transactionCount || 0);
    const backgroundColors = allAccounts.map((_: any, index: number) => 
      colors[index % colors.length]
    );

    return {
      labels,
      datasets: [{
        data,
        backgroundColor: backgroundColors,
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverBorderWidth: 3,
      }],
    };
  }, [financialData]);

  // Donut Chart options
  const donutChartOptions: ChartOptions<'doughnut'> = useMemo(() => {
    // Calculate total for percentage calculations
    const total = donutChartData.datasets[0]?.data.reduce((a: number, b: number) => a + b, 0) || 0;

    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right' as const,
          align: 'center' as const,
          labels: {
            usePointStyle: true,
            padding: 12,
            font: {
              size: 13,
            },
            generateLabels: function(chart: any) {
              const data = chart.data;
              if (data.labels.length && data.datasets.length) {
                const dataset = data.datasets[0];
                return data.labels.map((label: string, i: number) => {
                  const value = dataset.data[i];
                  const percentage = total > 0 ? ((value / total) * 100).toFixed(0) : 0;
                  return {
                    text: `${percentage}% ${label}`,
                    fillStyle: dataset.backgroundColor[i],
                    strokeStyle: dataset.borderColor || '#ffffff',
                    lineWidth: dataset.borderWidth || 2,
                    hidden: false,
                    index: i,
                    fontColor: '#333333',
                  };
                });
              }
              return [];
            },
          },
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              const label = context.label || '';
              const value = context.parsed || 0;
              const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ${value} transactions (${percentage}%)`;
            },
          },
          backgroundColor: 'rgba(255, 255, 255, 0.98)',
          titleColor: '#333',
          bodyColor: '#666',
          borderColor: '#666',
          borderWidth: 2,
          padding: 8,
        },
        title: {
          display: false,
        },
      },
      cutout: '60%', // Makes it a donut (0% would be a pie)
    };
  }, [donutChartData]);

  // Prepare Chart.js data format - memoized to prevent unnecessary recreations
  const chartData = useMemo(() => {
    if (!cashFlowChartData || cashFlowChartData.length === 0) {
      return {
        labels: [],
        datasets: [],
      };
    }
    
    return {
      labels: cashFlowChartData.map((item: any) => item.month),
      datasets: [
        {
          label: 'Expense',
          data: cashFlowChartData.map((item: any) => {
            const outgoing = Math.abs(item.outgoing);
            const net = item.net;
            // Ensure outgoing always starts at zero
            // If net is negative and makes total < 0, we need to offset outgoing
            // But we want outgoing to always represent the actual value
            // So we'll keep outgoing as is, and let net be negative
            // The key is that outgoing should visually start at zero
            // If outgoing + net < 0, we need to adjust
            // Actually, we'll use a base value to ensure outgoing starts at 0
            const total = outgoing + net;
            // If total is negative, we need outgoing to start higher
            // But we want outgoing to show the actual value
            // Solution: use the absolute value of the minimum of (total, 0) as offset
            const minOffset = total < 0 ? Math.abs(total) : 0;
            return outgoing + minOffset; // Add offset to ensure outgoing starts at 0
          }),
          backgroundColor: '#287cbb', // Red (updated color)
          borderColor: '#287cbb',
          borderWidth: 2,
          stack: 'stack1', // Group with Net
        },
        {
          label: 'Net',
          data: cashFlowChartData.map((item: any) => {
            const outgoing = Math.abs(item.outgoing);
            const net = item.net;
            // Calculate offset to ensure outgoing starts at zero
            const total = outgoing + net;
            const minOffset = total < 0 ? Math.abs(total) : 0;
            // Adjust net by adding the same offset (so total stays the same)
            return net + minOffset;
          }),
          backgroundColor: '#43acff', // Green (updated color)
          borderColor: '#43acff',
          borderWidth: 2,
          stack: 'stack1', // Group with Expense
        },
        {
          label: 'Income',
          data: cashFlowChartData.map((item: any) => {
            const incoming = item.incoming || 0;
            console.log(`Chart data - Month: ${item.month}, Incoming: ${incoming}`);
            return Math.abs(incoming); // Ensure positive value for display
          }),
          backgroundColor: '#88d2eb', // Blue (updated color)
          borderColor: '#88d2eb',
          borderWidth: 2,
          stack: 'stack2', // Separate stack - appears side by side with stack1
        },
      ],
    };
  }, [cashFlowChartData]);

  // Chart.js options - memoized to prevent unnecessary recreations
  const chartOptions: ChartOptions<'bar'> = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.dataset.label}: ${formatCurrency(context.parsed.y)}`;
          },
        },
        mode: 'index' as const,
        backgroundColor: 'rgba(255, 255, 255, 0.98)',
        titleColor: '#333',
        bodyColor: '#666',
        borderColor: '#666',
        borderWidth: 2,
        padding: 8,
      },
      title: {
        display: false,
      },
      datalabels: {
        display: false, // Hide data labels for cleaner stacked chart
      },
    },
    scales: {
      x: {
        stacked: true, // Enable stacking for outgoing and net
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: '#666',
        },
        border: {
          color: '#666',
          width: 2,
        },
      },
      y: {
        stacked: true, // Enable stacking for each stack group (stack1 stacks together, stack2 stacks together)
        beginAtZero: true, // Ensure chart starts at zero
        grid: {
          color: '#e0e0e0',
          lineWidth: 1,
          drawTicks: false,
        },
        ticks: {
          font: {
            size: 12,
          },
          color: '#666',
          callback: function(value: any) {
            return formatCurrency(Math.abs(value)); // Show absolute value for cleaner display
          },
        },
        border: {
          color: '#666',
          width: 2,
        },
      },
    },
  }), [formatCurrency]);

  // Real financial data for charts (legacy - kept for backward compatibility)
  const legacyChartData = financialData ? [
    { name: 'Total Balance', amount: financialData.totalBalance || 0 },
    { name: 'Total Income', amount: financialData.totalIncoming || 0 },
    { name: 'Total Expense', amount: financialData.totalOutgoing || 0 },
  ] : [];

  // Helper function to get status color
  const getBillStatusColor = (status: BillStatus) => {
    switch (status) {
      case BillStatus.OVERDUE:
        return 'error';
      case BillStatus.PENDING:
        return 'warning';
      default:
        return 'default';
    }
  };

  // Helper function to format due date
  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(date);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const stats = [
    {
      title: 'Current Balance',
      value: formatCurrency(currentBalance || 0),
      change: 'Total across all accounts',
      icon: <AccountBalance sx={{ fontSize: 40, color: 'secondary.main' }} />,
      color: 'secondary.main',
    },
    {
      title: 'Monthly Expense',
      value: formatCurrency(monthlyExpense || 0),
      change: 'Fixed expenses',
      icon: <Receipt sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
    },
    {
      title: 'Net Cash Flow',
      value: formatCurrency(disposableIncome || 0),
      change: 'Available to spend',
      icon: <People sx={{ fontSize: 40, color: 'info.main' }} />,
      color: 'info.main',
    },
    {
      title: 'Monthly Savings',
      value: formatCurrency(totalMonthlySavingsPayment || 0),
      change: 'Monthly savings target',
      icon: <SavingsIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      color: 'success.main',
    },
  ];

  return (
    <Box sx={{ pl: { md: 1.5 } }}>
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25, flexGrow: 1 }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0 }}
          >
            Dashboard
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
          >
            Manage your payments and transactions in one click
          </Typography>
        </Box>

        {/* Profile Status Section */}
        {isAuthenticated && (
          (hasProfile || (userProfile && userProfile.id)) ? (
            <Alert
              severity="success"
              icon={<CheckCircle />}
              sx={{ m: 0, width: { xs: '100%', md: 'auto' }, flexShrink: 0 }}
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
            <Alert severity="warning" sx={{ m: 0, width: { xs: '100%', md: 'auto' }, flexShrink: 0 }}>
              <Typography variant="h6">
                Profile Setup Required
              </Typography>
              <Typography variant="body2">
                Please complete your profile setup to access all features.
              </Typography>
            </Alert>
          )
        )}
      </Box>
      
      <Grid container spacing={3}>
        

        {/* Main Content Area and Sidebar */}
        <Grid container item xs={12} spacing={3}>
          {/* Main Content Area */}
          <Grid item xs={12} md={9}>
            <Grid container spacing={3} sx={{ mb: 3 }}>
              {/* Stats Cards */}
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={6} md={4} lg={3} xl={3} key={index}>
            <Card 
              sx={{ 
                cursor: (stat.title === 'Net Cash Flow' || stat.title === 'Current Balance') ? 'pointer' : 'default',
                height: '100%',
                border: '1px solid #e5e5e5',
                '&:hover': (stat.title === 'Net Cash Flow' || stat.title === 'Current Balance') ? {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                  transform: 'translateY(-2px)',
                  transition: 'all 0.3s ease'
                } : {}
              }}
              onClick={
                stat.title === 'Net Cash Flow' ? handleDisposableCardClick : 
                stat.title === 'Current Balance' ? handleBalanceCardClick : 
                undefined
              }
            >
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                  <Box sx={{ flex: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 1 }}>
                      <Typography 
                        color="textSecondary" 
                        gutterBottom 
                        variant="body2"
                        sx={{ 
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: '#666666',
                        }}
                      >
                        {stat.title}
                      </Typography>
                      {stat.title === 'Net Cash Flow' && (
                        <Tooltip
                          title={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                What is "Disposable Income"?
                              </Typography>
                              <Typography variant="body2">
                                This is the money you have left after paying all your bills and loans. You can use this for savings or other expenses.
                              </Typography>
                            </Box>
                          }
                          arrow
                        >
                          <HelpOutlineIcon sx={{ fontSize: 16, color: '#666666', cursor: 'help' }} />
                        </Tooltip>
                      )}
                    </Box>
                    <Typography 
                      variant="h4" 
                      component="h2"
                      sx={{ 
                        fontWeight: 700,
                        color: '#1a1a1a',
                        mb: 1
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      color="textSecondary"
                      variant="body2"
                      sx={{ 
                        fontSize: '0.75rem',
                        color: '#666666'
                      }}
                    >
                      {stat.change}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: 'rgba(179, 238, 154, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
              </CardContent>
            </Card>
                </Grid>
              ))}
            </Grid>
  



            <Grid container spacing={3}>
              {/* Financial Overview */}
              <Grid item xs={12} md={8}>
                <Paper sx={{ p: 3, border: '1px solid #e5e5e5' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a', mb: 2 }}>
                    Financial Overview - Monthly Cash Flow
                  </Typography>
                  {cashFlowLoading || loading ? (
                    <Box>
                      <Skeleton variant="rectangular" width="100%" height={338} sx={{ borderRadius: 1 }} />
                    </Box>
                  ) : cashFlowChartData.length > 0 ? (
                    <Box sx={{ height: '338px', width: '100%' }}>
                      <Bar 
                        key="monthly-cashflow-chart"
                        data={chartData} 
                        options={chartOptions}
                      />
                    </Box>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 338 }}>
                      <Typography variant="body2" color="text.secondary">
                        No cash flow data available
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Transactions by Account */}
              <Grid item xs={12} md={4}>
                <Paper sx={{ p: 2, border: '1px solid #e5e5e5' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
                    Transactions by Account
                  </Typography>
                  {loading ? (
                    <Box>
                      <Skeleton variant="rectangular" width="100%" height={280} sx={{ borderRadius: 1 }} />
                    </Box>
                  ) : financialData && financialData.accounts && financialData.accounts.length > 0 ? (
                    <>
                      <Box sx={{ height: '280px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Doughnut 
                          data={donutChartData} 
                          options={donutChartOptions}
                        />
                      </Box>
                      <Box sx={{ mt: 1.5, display: 'flex', justifyContent: 'center' }}>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => navigate('/transactions?addTransaction=true')}
                          sx={{ minWidth: 160 }}
                        >
                          Add Transaction
                        </Button>
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 280 }}>
                      <Typography variant="body2" color="text.secondary">
                        No accounts available
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Recent Transactions */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, border: '1px solid #e5e5e5' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                      Recent Transactions
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Receipt />}
                      href="/transactions"
                    >
                      View All
                    </Button>
                  </Box>
                  {transactionsLoading ? (
                    <Grid container spacing={2}>
                      {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Grid item xs={12} sm={6} md={4} key={i}>
                          <Card>
                            <CardContent>
                              <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
                              <Skeleton variant="text" width="50%" height={20} sx={{ mb: 2 }} />
                              <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
                              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  ) : recentTransactions.length > 0 ? (
                    <Grid container spacing={2}>
                      {recentTransactions.map((transaction) => (
                        <Grid item xs={12} sm={6} md={4} key={transaction.id}>
                          <TransactionCard 
                            transaction={transaction} 
                            onViewDetails={() => {
                              // You could add a dialog here or navigate to transactions page
                              console.log('View transaction details:', transaction);
                            }}
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <Receipt sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        No recent transactions found
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Your recent transactions will appear here
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Account Summary */}
              <Grid item xs={12} md={9}>
                <Paper sx={{ p: 2, border: '1px solid #e5e5e5' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
                    Account Summary
                  </Typography>
            {/* Clear description explaining where amounts come from */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontStyle: 'italic' }}>
              This summary shows your total account balances from all bank accounts, savings accounts, and investment accounts. The amounts below represent your current financial position.
            </Typography>
            {/* Debug: Show current currency */}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Debug: Current currency is {currency}
            </Typography>
            {loading ? (
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <Skeleton variant="text" width="60%" height={24} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="50%" height={24} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Skeleton variant="text" width="60%" height={24} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="50%" height={24} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Skeleton variant="text" width="60%" height={24} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="50%" height={24} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Skeleton variant="text" width="60%" height={24} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="50%" height={24} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Skeleton variant="text" width="60%" height={24} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="40%" height={20} sx={{ mb: 0.5 }} />
                  <Skeleton variant="text" width="50%" height={24} />
                </Grid>
              </Grid>
            ) : financialData ? (
              <Grid container spacing={1.5}>
                <Grid item xs={12} sm={6}>
                  <Box mb={1}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>Total Balance</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontSize: '0.7rem' }}>
                      Sum of all your account balances
                    </Typography>
                    <Typography variant="h6">{formatCurrency(financialData.totalBalance || 0)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box mb={1}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>Total Credit Limit</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontSize: '0.7rem' }}>
                      Combined credit limit from all credit card accounts (the maximum amount you can borrow)
                    </Typography>
                    <Typography variant="h6">
                      {formatCurrency((Array.isArray(financialData.accounts) ? financialData.accounts
                        .filter((acc: any) => acc?.accountType?.toLowerCase() === 'credit_card')
                        .reduce((sum: number, acc: any) => sum + (acc?.currentBalance || 0), 0) : 0))}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box mb={1}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>Active Accounts</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontSize: '0.7rem' }}>
                      Number of accounts you have set up
                    </Typography>
                    <Typography variant="h6">{financialData.activeAccounts || 0}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box mb={1}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>Total Income</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontSize: '0.7rem' }}>
                      Total money received from all income sources
                    </Typography>
                    <Typography variant="h6" color="success.main">{formatCurrency(financialData.totalIncoming || 0)}</Typography>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 0.25 }}>Total Expense</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.25, fontSize: '0.7rem' }}>
                      Total money spent on all expenses
                    </Typography>
                    <Typography variant="h6" color="error.main">{formatCurrency(financialData.totalOutgoing || 0)}</Typography>
                  </Box>
                </Grid>
              </Grid>
            ) : (
              <Typography>No financial data available</Typography>
            )}
              </Paper>
              </Grid>
            </Grid>
          </Grid>

          {/* Right Sidebar */}
          <Grid item xs={12} md={3}>
            <Grid container spacing={3} direction="column">
              {/* Savings Card */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, border: '1px solid #e5e5e5', borderRadius: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                      Savings Goals
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SavingsIcon />}
                      href="/savings"
                    >
                      View All Savings
                    </Button>
                  </Box>
                  <Divider sx={{ mb: 2, borderColor: '#e5e5e5' }} />
                  {savingsLoading ? (
                    <Box>
                      <Skeleton variant="rectangular" width="100%" height={12} sx={{ mb: 3, borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
                    </Box>
                  ) : savingsAccounts.length > 0 ? (
                    <Box>
                      {(() => {
                        // Color palette for savings goals
                        const getAccountColor = (idx: number) => {
                          const colors = [
                            '#ef4444', // Red
                            '#f87171', // Light red/pink
                            '#fef08a', // Light yellow
                            '#fbbf24', // Yellow
                            '#f59e0b', // Orange/golden yellow
                            '#fb923c', // Orange
                            '#f97316', // Dark orange
                            '#ea580c', // Deep orange
                          ];
                          return colors[idx % colors.length];
                        };
                        
                        return (
                          <>
                            {/* Savings List */}
                            {savingsAccounts.map((account, index) => {
                        const accountColor = getAccountColor(index);
                        const progressPercentage = account.targetAmount > 0 
                          ? Math.min((account.currentBalance / account.targetAmount) * 100, 100) 
                          : 0;
                        
                        return (
                          <Box 
                            key={account.id}
                            sx={{ 
                              mb: 2.5,
                              pb: 2.5,
                              borderBottom: index !== savingsAccounts.length - 1 ? '1px solid #e5e5e5' : 'none'
                            }}
                          >
                            {/* Icon | Goal Name | Percentage */}
                            <Box 
                              sx={{ 
                                display: 'flex',
                                alignItems: 'center',
                                mb: 1
                              }}
                            >
                              <SavingsIcon 
                                sx={{ 
                                  fontSize: 24, 
                                  color: accountColor,
                                  mr: 1.5
                                }} 
                              />
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 500,
                                  color: '#1a1a1a',
                                  flex: 1
                                }}
                              >
                                {account.accountName}
                              </Typography>
                              <Typography 
                                variant="body1" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: '#1a1a1a'
                                }}
                              >
                                {progressPercentage.toFixed(0)}%
                              </Typography>
                            </Box>
                            
                            {/* Current Balance of Target Amount */}
                            <Typography 
                              variant="body2" 
                              sx={{ 
                                color: '#666666',
                                mb: 1,
                                ml: 4.5
                              }}
                            >
                              {formatCurrency(account.currentBalance || 0)} of {formatCurrency(account.targetAmount || 0)}
                            </Typography>
                            
                            {/* Progress Bar */}
                            <Box sx={{ ml: 4.5, mr: 1 }}>
                              <LinearProgress 
                                variant="determinate" 
                                value={progressPercentage} 
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: '#e5e5e5',
                                  '& .MuiLinearProgress-bar': {
                                    borderRadius: 4,
                                    backgroundColor: accountColor,
                                  }
                                }}
                              />
                            </Box>
                          </Box>
                        );
                      })}
                          </>
                        );
                      })()}
                    </Box>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                      <SavingsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                      <Typography variant="body2" color="text.secondary">
                        No savings accounts yet
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                        Create a savings account to start tracking your goals
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Unpaid Bills & Utilities */}
              <Grid item xs={12}>
                <Paper sx={{ p: 3, border: '1px solid #e5e5e5' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                      Unpaid Bills & Utilities
                    </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Receipt />}
                      href="/bills"
                    >
                      View All Bills
                    </Button>
                  </Box>
                  {unpaidBillsLoading ? (
                    <Box>
                      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width="100%" height={60} sx={{ mb: 2, borderRadius: 1 }} />
                      <Skeleton variant="rectangular" width="100%" height={60} sx={{ borderRadius: 1 }} />
                    </Box>
                  ) : (
                    <UnpaidBillsCard
                      bills={filteredUnpaidBills}
                      onViewBill={(billId) => navigate(`/bills/${billId}`)}
                      onMarkPaid={(billId) => navigate(`/bills?markPaid=${billId}`)}
                    />
                  )}
                </Paper>
              </Grid>

              {/* Recent Activity */}
              <Grid item xs={12}>
                <Card sx={{ border: '1px solid #e5e5e5', height: '100%' }}>
                  <CardContent sx={{ p: 3 }}>
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                        Recent Activity
                      </Typography>
                      {recentActivity?.hasProfile && (
                        <Chip
                          icon={<CheckCircle />}
                          label="Active Profile"
                          color="success"
                          size="small"
                        />
                      )}
                    </Box>
                    
                    {recentActivityLoading ? (
                      <Grid container spacing={2}>
                        {[1, 2, 3, 4].map((i) => (
                          <Grid item xs={12} key={i}>
                            <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 1 }} />
                          </Grid>
                        ))}
                      </Grid>
                    ) : recentActivity ? (
                      <Grid container spacing={2}>
                        {/* Profile Status */}
                        <Grid item xs={12}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              background: recentActivity.hasProfile 
                                ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)'
                                : 'linear-gradient(135deg, rgba(255, 152, 0, 0.1) 0%, rgba(255, 152, 0, 0.05) 100%)',
                              borderColor: recentActivity.hasProfile ? 'success.light' : 'warning.light'
                            }}
                          >
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Box display="flex" alignItems="center" mb={0.5}>
                                <AccountCircle 
                                  sx={{ 
                                    fontSize: 24, 
                                    color: recentActivity.hasProfile ? 'success.main' : 'warning.main',
                                    mr: 1 
                                  }} 
                                />
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                                  Profile Status
                                </Typography>
                              </Box>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  fontWeight: 600,
                                  color: '#1a1a1a',
                                  mb: 0.5
                                }}
                              >
                                {recentActivity.profileStatus}
                              </Typography>
                              <Chip
                                label={`${recentActivity.incomeSourcesCount} income source${recentActivity.incomeSourcesCount !== 1 ? 's' : ''}`}
                                size="small"
                                color={recentActivity.hasProfile ? 'success' : 'warning'}
                                variant="outlined"
                                sx={{ 
                                  color: '#1a1a1a',
                                  '& .MuiChip-label': { color: '#1a1a1a' }
                                }}
                              />
                            </CardContent>
                          </Card>
                        </Grid>

                        {/* Monthly Income */}
                        <Grid item xs={12}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
                              borderColor: 'primary.light'
                            }}
                          >
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Box display="flex" alignItems="center" mb={0.5}>
                                <TrendingUpIcon 
                                  sx={{ fontSize: 24, color: 'primary.main', mr: 1 }} 
                                />
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                                  Monthly Income
                                </Typography>
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
                                {formatCurrency(recentActivity.totalMonthlyIncome)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#1a1a1a' }}>
                                From {recentActivity.incomeSourcesCount} source{recentActivity.incomeSourcesCount !== 1 ? 's' : ''}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>

                        {/* Monthly Goals */}
                        <Grid item xs={12}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.05) 100%)',
                              borderColor: 'secondary.light'
                            }}
                          >
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Box display="flex" alignItems="center" mb={0.5}>
                                <TrackChanges 
                                  sx={{ fontSize: 24, color: 'secondary.main', mr: 1 }} 
                                />
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                                  Monthly Goals
                                </Typography>
                              </Box>
                              <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
                                {formatCurrency(recentActivity.totalMonthlyGoals)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#1a1a1a' }}>
                                Savings, Investment & Emergency
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>

                        {/* Disposable Amount */}
                        <Grid item xs={12}>
                          <Card 
                            variant="outlined" 
                            sx={{ 
                              background: recentActivity.disposableAmount >= 0
                                ? 'linear-gradient(135deg, rgba(76, 175, 80, 0.1) 0%, rgba(76, 175, 80, 0.05) 100%)'
                                : 'linear-gradient(135deg, rgba(244, 67, 54, 0.1) 0%, rgba(244, 67, 54, 0.05) 100%)',
                              borderColor: recentActivity.disposableAmount >= 0 ? 'success.light' : 'error.light'
                            }}
                          >
                            <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                              <Box display="flex" alignItems="center" mb={0.5}>
                                <MoneyIcon 
                                  sx={{ 
                                    fontSize: 24, 
                                    color: recentActivity.disposableAmount >= 0 ? 'success.main' : 'error.main',
                                    mr: 1 
                                  }} 
                                />
                                <Typography variant="body2" sx={{ fontWeight: 500, color: '#1a1a1a' }}>
                                  Disposable Amount
                                </Typography>
                              </Box>
                              <Typography 
                                variant="h6" 
                                sx={{ 
                                  fontWeight: 700, 
                                  color: '#1a1a1a',
                                  mb: 0.5
                                }}
                              >
                                {formatCurrency(recentActivity.disposableAmount)}
                              </Typography>
                              <Typography variant="caption" sx={{ color: '#1a1a1a' }}>
                                Available this month
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    ) : (
                      <Alert 
                        severity="info" 
                        icon={<InfoIcon />}
                        sx={{ 
                          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.1) 0%, rgba(33, 150, 243, 0.05) 100%)',
                          border: '1px solid',
                          borderColor: 'info.light'
                        }}
                      >
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          Profile Setup Required
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="div">
                          <Box component="ul" sx={{ m: 0, pl: 2 }}>
                            <li>Complete your profile to see financial data</li>
                            <li>Add income sources to get started</li>
                            <li>Set up financial goals</li>
                          </Box>
                        </Typography>
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
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
            <Box>
              <Skeleton variant="rectangular" width="100%" height={100} sx={{ mb: 2, borderRadius: 1 }} />
              <Divider sx={{ my: 2 }} />
              <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      <TableCell><Skeleton variant="text" width={100} /></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[1, 2, 3].map((i) => (
                      <TableRow key={i}>
                        <TableCell><Skeleton variant="text" width={120} /></TableCell>
                        <TableCell><Skeleton variant="text" width={100} /></TableCell>
                        <TableCell><Skeleton variant="text" width={100} /></TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
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
                    {formatCurrency(bankAccountsResponse?.currentBalance || currentBalance || 0)}
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
                            {formatCurrency(account.currentBalance || account.balance || 0)}
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
            <Typography variant="h5">Net Cash Flow Amount Breakdown</Typography>
            <Button onClick={handleCloseDisposableModal} color="inherit">
              <CloseIcon />
            </Button>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {disposableLoading ? (
            <Box>
              <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2, borderRadius: 1 }} />
              <Skeleton variant="text" width="60%" height={28} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="80%" height={24} sx={{ mb: 2 }} />
              <Skeleton variant="text" width="70%" height={28} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="75%" height={24} />
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
                      <Typography variant="body2" sx={{ color: 'black' }}>Total Income</Typography>
                      <Typography variant="h5">{formatCurrency(disposableData.totalIncome || 0, { showSymbol: false })}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: 'error.light' }}>
                      <Typography variant="body2" sx={{ color: 'black' }}>Fixed Expenses</Typography>
                      <Typography variant="h5">{formatCurrency(disposableData.totalFixedExpenses || 0, { showSymbol: false })}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: 'warning.light' }}>
                      <Typography variant="body2" sx={{ color: 'black' }}>Variable Expenses</Typography>
                      <Typography variant="h5">{formatCurrency(disposableData.totalVariableExpenses || 0, { showSymbol: false })}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Paper sx={{ p: 2, bgcolor: 'info.light' }}>
                      <Typography variant="body2" sx={{ color: 'black' }}>Disposable Amount</Typography>
                      <Typography variant="h5">{formatCurrency(disposableData.disposableAmount || 0, { showSymbol: false })}</Typography>
                      <Typography variant="body2" sx={{ color: 'black' }}>{(disposableData.disposablePercentage || 0).toFixed(2)}% of income</Typography>
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
                          <TableCell align="right">{formatCurrency(income.amount || 0, { showSymbol: false })}</TableCell>
                          <TableCell align="right">{formatCurrency(income.monthlyAmount || 0, { showSymbol: false })}</TableCell>
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
                  Bills Breakdown (Total: {formatCurrency(disposableData.totalBills || 0, { showSymbol: false })})
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
                          <TableCell align="right">{formatCurrency(bill.amount || 0, { showSymbol: false })}</TableCell>
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
                  Loans Breakdown (Total: {formatCurrency(disposableData.totalLoans || 0, { showSymbol: false })})
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
                          <TableCell align="right">{formatCurrency(loan.amount || 0, { showSymbol: false })}</TableCell>
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
                  Variable Expenses Breakdown (Total: {formatCurrency(disposableData.totalVariableExpenses || 0, { showSymbol: false })})
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
                          <TableCell align="right">{formatCurrency(expense.totalAmount || 0, { showSymbol: false })}</TableCell>
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
                        <Typography variant="h6">{formatCurrency(disposableData.comparison.previousPeriodDisposableAmount || 0, { showSymbol: false })}</Typography>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Typography variant="body2" color="text.secondary">Change Amount</Typography>
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="h6" color={(disposableData.comparison.changeAmount || 0) >= 0 ? 'success.main' : 'error.main'}>
                            {formatCurrency(Math.abs(disposableData.comparison.changeAmount || 0), { showSymbol: false })}
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
                        primary={insight.replace(/\$/g, '')}
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

      {/* Onboarding Wizard */}
      <OnboardingWizard
        open={showOnboarding}
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />

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
                  <FormControl fullWidth disabled={profileFormData.isUnemployed}>
                    <InputLabel>Industry</InputLabel>
                    <Select
                      value={profileFormData.industry}
                      onChange={(e) => handleProfileFormInputChange('industry', e.target.value)}
                      label="Industry"
                    >
                      <MenuItem value="Technology">Technology</MenuItem>
                      <MenuItem value="Healthcare">Healthcare</MenuItem>
                      <MenuItem value="Finance">Finance</MenuItem>
                      <MenuItem value="Education">Education</MenuItem>
                      <MenuItem value="Manufacturing">Manufacturing</MenuItem>
                      <MenuItem value="Retail">Retail</MenuItem>
                      <MenuItem value="Government">Government</MenuItem>
                      <MenuItem value="Non-profit">Non-profit</MenuItem>
                      <MenuItem value="Real Estate">Real Estate</MenuItem>
                      <MenuItem value="Consulting">Consulting</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={profileFormData.isUnemployed}>
                    <InputLabel>Country</InputLabel>
                    <Select
                      value={profileFormData.country}
                      onChange={(e) => handleProfileFormInputChange('country', e.target.value)}
                      label="Country"
                    >
                      <MenuItem value="United States">United States</MenuItem>
                      <MenuItem value="United Kingdom">United Kingdom</MenuItem>
                      <MenuItem value="Canada">Canada</MenuItem>
                      <MenuItem value="Australia">Australia</MenuItem>
                      <MenuItem value="Germany">Germany</MenuItem>
                      <MenuItem value="France">France</MenuItem>
                      <MenuItem value="Italy">Italy</MenuItem>
                      <MenuItem value="Spain">Spain</MenuItem>
                      <MenuItem value="Netherlands">Netherlands</MenuItem>
                      <MenuItem value="Belgium">Belgium</MenuItem>
                      <MenuItem value="Switzerland">Switzerland</MenuItem>
                      <MenuItem value="Sweden">Sweden</MenuItem>
                      <MenuItem value="Norway">Norway</MenuItem>
                      <MenuItem value="Denmark">Denmark</MenuItem>
                      <MenuItem value="Finland">Finland</MenuItem>
                      <MenuItem value="Poland">Poland</MenuItem>
                      <MenuItem value="Portugal">Portugal</MenuItem>
                      <MenuItem value="Ireland">Ireland</MenuItem>
                      <MenuItem value="Austria">Austria</MenuItem>
                      <MenuItem value="Greece">Greece</MenuItem>
                      <MenuItem value="Japan">Japan</MenuItem>
                      <MenuItem value="South Korea">South Korea</MenuItem>
                      <MenuItem value="China">China</MenuItem>
                      <MenuItem value="India">India</MenuItem>
                      <MenuItem value="Singapore">Singapore</MenuItem>
                      <MenuItem value="Malaysia">Malaysia</MenuItem>
                      <MenuItem value="Thailand">Thailand</MenuItem>
                      <MenuItem value="Philippines">Philippines</MenuItem>
                      <MenuItem value="Indonesia">Indonesia</MenuItem>
                      <MenuItem value="Vietnam">Vietnam</MenuItem>
                      <MenuItem value="Brazil">Brazil</MenuItem>
                      <MenuItem value="Mexico">Mexico</MenuItem>
                      <MenuItem value="Argentina">Argentina</MenuItem>
                      <MenuItem value="Chile">Chile</MenuItem>
                      <MenuItem value="Colombia">Colombia</MenuItem>
                      <MenuItem value="South Africa">South Africa</MenuItem>
                      <MenuItem value="Egypt">Egypt</MenuItem>
                      <MenuItem value="Nigeria">Nigeria</MenuItem>
                      <MenuItem value="Kenya">Kenya</MenuItem>
                      <MenuItem value="United Arab Emirates">United Arab Emirates</MenuItem>
                      <MenuItem value="Saudi Arabia">Saudi Arabia</MenuItem>
                      <MenuItem value="Israel">Israel</MenuItem>
                      <MenuItem value="Turkey">Turkey</MenuItem>
                      <MenuItem value="Russia">Russia</MenuItem>
                      <MenuItem value="New Zealand">New Zealand</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
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
