import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelCircleIcon,
} from '@mui/icons-material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import apiService from '../services/api';
import {
  SubscriptionPlan,
  CreateSubscriptionPlanRequest,
  UpdateSubscriptionPlanRequest,
  UserSubscription,
  CreateUserSubscriptionRequest,
  UpdateUserSubscriptionRequest,
  UserWithSubscription,
} from '../types/subscription';
import { Ticket, TicketStatus, TicketPriority, TicketCategory } from '../types/ticket';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const SuperAdmin: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Pricing Plans State
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [planFormData, setPlanFormData] = useState<CreateSubscriptionPlanRequest>({
    name: '',
    displayName: '',
    description: '',
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxBankAccounts: 3,
    maxTransactionsPerMonth: 1000,
    maxBillsPerMonth: 5,
    maxLoans: 5,
    maxSavingsGoals: 5,
    maxReceiptOcrPerMonth: 0,
    maxAiQueriesPerMonth: 10,
    maxApiCallsPerMonth: 0,
    maxUsers: 1,
    transactionHistoryMonths: 12,
    hasAiAssistant: false,
    hasBankFeedIntegration: false,
    hasReceiptOcr: false,
    hasAdvancedReports: false,
    hasPrioritySupport: false,
    hasApiAccess: false,
    hasInvestmentTracking: false,
    hasTaxOptimization: false,
    hasMultiUserSupport: false,
    hasWhiteLabelOptions: false,
    hasCustomIntegrations: false,
    hasDedicatedSupport: false,
    hasAccountManager: false,
    hasCustomReporting: false,
    hasAdvancedSecurity: false,
    hasComplianceReports: false,
    displayOrder: 0,
  });

  // User Subscriptions State
  const [userSubscriptions, setUserSubscriptions] = useState<UserSubscription[]>([]);
  const [usersWithSubscriptions, setUsersWithSubscriptions] = useState<UserWithSubscription[]>([]);
  const [subscriptionDialogOpen, setSubscriptionDialogOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionFormData, setSubscriptionFormData] = useState<CreateUserSubscriptionRequest>({
    userId: '',
    subscriptionPlanId: '',
    billingCycle: 'MONTHLY',
  });
  const [filterStatus, setFilterStatus] = useState<string>('');
  const [filterPlanId, setFilterPlanId] = useState<string>('');

  // Support Tickets State
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [ticketFilterStatus, setTicketFilterStatus] = useState<string>('');
  const [ticketFilterPriority, setTicketFilterPriority] = useState<string>('');
  const [ticketFilterCategory, setTicketFilterCategory] = useState<string>('');
  const [userSubscriptionMap, setUserSubscriptionMap] = useState<Record<string, string>>({});

  useEffect(() => {
    loadData();
  }, [tabValue, filterStatus, filterPlanId, ticketFilterStatus, ticketFilterPriority, ticketFilterCategory]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tabValue === 0) {
        // Load pricing plans
        const plansData = await apiService.getSubscriptionPlans(false);
        setPlans(plansData);
      } else if (tabValue === 1) {
        // Load user subscriptions
        const subscriptions = await apiService.getAllUserSubscriptions(1, 100, filterStatus || undefined, filterPlanId || undefined);
        setUserSubscriptions(subscriptions);
      } else if (tabValue === 2) {
        // Load all users with their subscription information
        const [usersResponse, subscriptions] = await Promise.all([
          apiService.getAllUsers(1, 10000), // Get all users
          apiService.getAllUserSubscriptions(1, 10000) // Get all subscriptions
        ]);

        // Create a map of active subscriptions by userId
        const subscriptionMap = new Map<string, UserSubscription>();
        subscriptions.forEach((sub: UserSubscription) => {
          // Only consider ACTIVE subscriptions, or if no active subscription exists, use the most recent one
          if (sub.status === 'ACTIVE') {
            subscriptionMap.set(sub.userId, sub);
          } else if (!subscriptionMap.has(sub.userId)) {
            // If no active subscription, store the most recent one (will be overwritten if we find a more recent one)
            subscriptionMap.set(sub.userId, sub);
          }
        });

        // Map all users to UserWithSubscription format
        const usersWithSubs: UserWithSubscription[] = usersResponse.data.map((user: any) => {
          // Handle both camelCase and PascalCase field names
          const userId = user.id || user.Id;
          const subscription = subscriptionMap.get(userId);
          let planName = 'Free';
          
          if (subscription) {
            const planDisplayName = subscription.planDisplayName || subscription.planName || '';
            // Check if plan is None, Free, or empty - display as "Free"
            if (planDisplayName.toLowerCase() === 'none' || 
                planDisplayName.toLowerCase() === 'free' || 
                planDisplayName === '') {
              planName = 'Free';
            } else {
              planName = planDisplayName;
            }
          }

          return {
            id: userId,
            name: user.name || user.Name || '',
            email: user.email || user.Email || '',
            phone: user.phone || user.Phone || '',
            role: user.role || user.Role || 'USER',
            isActive: user.isActive !== undefined ? user.isActive : (user.IsActive !== undefined ? user.IsActive : true),
            subscriptionPlanId: subscription?.subscriptionPlanId,
            subscriptionPlanName: planName,
            subscriptionStatus: subscription?.status,
            subscriptionBillingCycle: subscription?.billingCycle,
            subscriptionStartDate: subscription?.startDate,
            subscriptionEndDate: subscription?.endDate,
            createdAt: user.createdAt || user.CreatedAt || new Date().toISOString(),
            updatedAt: user.updatedAt || user.UpdatedAt || new Date().toISOString(),
          };
        });

        setUsersWithSubscriptions(usersWithSubs);
      } else if (tabValue === 3) {
        // Load all support tickets (admin can see all)
        const filters: any = {};
        if (ticketFilterStatus) filters.status = ticketFilterStatus;
        if (ticketFilterPriority) filters.priority = ticketFilterPriority;
        if (ticketFilterCategory) filters.category = ticketFilterCategory;
        
        // Load tickets and user subscriptions in parallel
        const [ticketsResponse, subscriptionsResponse] = await Promise.all([
          apiService.getTickets(filters, 1, 1000),
          apiService.getAllUserSubscriptions(1, 10000) // Get all subscriptions
        ]);
        
        // Backend returns Data (not items) in PaginatedResponse
        const ticketsData = ticketsResponse.data || ticketsResponse.items || [];
        
        // Create a map of userId to subscription plan name
        const subscriptionMap: Record<string, string> = {};
        subscriptionsResponse.forEach((sub: UserSubscription) => {
          if (sub.status === 'ACTIVE' && sub.userId && !subscriptionMap[sub.userId]) {
            subscriptionMap[sub.userId] = sub.planDisplayName || sub.planName || 'No Plan';
          }
        });
        setUserSubscriptionMap(subscriptionMap);
        
        // Enrich tickets with subscription information
        const enrichedTickets = ticketsData.map((ticket: Ticket) => ({
          ...ticket,
          subscriptionPlan: subscriptionMap[ticket.userId] || 'No Plan'
        }));
        setTickets(enrichedTickets);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Pricing Plans Handlers
  const handleOpenPlanDialog = (plan?: SubscriptionPlan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanFormData({
        name: plan.name,
        displayName: plan.displayName,
        description: plan.description || '',
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice || 0,
        maxBankAccounts: plan.maxBankAccounts || undefined,
        maxTransactionsPerMonth: plan.maxTransactionsPerMonth || undefined,
        maxBillsPerMonth: plan.maxBillsPerMonth || undefined,
        maxLoans: plan.maxLoans || undefined,
        maxSavingsGoals: plan.maxSavingsGoals || undefined,
        maxReceiptOcrPerMonth: plan.maxReceiptOcrPerMonth || undefined,
        maxAiQueriesPerMonth: plan.maxAiQueriesPerMonth || undefined,
        maxApiCallsPerMonth: plan.maxApiCallsPerMonth || undefined,
        maxUsers: plan.maxUsers || undefined,
        transactionHistoryMonths: plan.transactionHistoryMonths || undefined,
        hasAiAssistant: plan.hasAiAssistant,
        hasBankFeedIntegration: plan.hasBankFeedIntegration,
        hasReceiptOcr: plan.hasReceiptOcr,
        hasAdvancedReports: plan.hasAdvancedReports,
        hasPrioritySupport: plan.hasPrioritySupport,
        hasApiAccess: plan.hasApiAccess,
        hasInvestmentTracking: plan.hasInvestmentTracking,
        hasTaxOptimization: plan.hasTaxOptimization,
        hasMultiUserSupport: plan.hasMultiUserSupport,
        hasWhiteLabelOptions: plan.hasWhiteLabelOptions,
        hasCustomIntegrations: plan.hasCustomIntegrations,
        hasDedicatedSupport: plan.hasDedicatedSupport,
        hasAccountManager: plan.hasAccountManager,
        hasCustomReporting: plan.hasCustomReporting,
        hasAdvancedSecurity: plan.hasAdvancedSecurity,
        hasComplianceReports: plan.hasComplianceReports,
        displayOrder: plan.displayOrder,
      });
    } else {
      setEditingPlan(null);
      setPlanFormData({
        name: '',
        displayName: '',
        description: '',
        monthlyPrice: 0,
        yearlyPrice: 0,
        maxBankAccounts: 3,
        maxTransactionsPerMonth: 1000,
        maxBillsPerMonth: 5,
        maxLoans: 5,
        maxSavingsGoals: 5,
        maxReceiptOcrPerMonth: 0,
        maxAiQueriesPerMonth: 10,
        maxApiCallsPerMonth: 0,
        maxUsers: 1,
        transactionHistoryMonths: 12,
        hasAiAssistant: false,
        hasBankFeedIntegration: false,
        hasReceiptOcr: false,
        hasAdvancedReports: false,
        hasPrioritySupport: false,
        hasApiAccess: false,
        hasInvestmentTracking: false,
        hasTaxOptimization: false,
        hasMultiUserSupport: false,
        hasWhiteLabelOptions: false,
        hasCustomIntegrations: false,
        hasDedicatedSupport: false,
        hasAccountManager: false,
        hasCustomReporting: false,
        hasAdvancedSecurity: false,
        hasComplianceReports: false,
        displayOrder: 0,
      });
    }
    setPlanDialogOpen(true);
  };

  const handleClosePlanDialog = () => {
    setPlanDialogOpen(false);
    setEditingPlan(null);
  };

  const handleSavePlan = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingPlan) {
        const updateData: UpdateSubscriptionPlanRequest = { ...planFormData };
        await apiService.updateSubscriptionPlan(editingPlan.id, updateData);
        setSuccess('Subscription plan updated successfully');
      } else {
        await apiService.createSubscriptionPlan(planFormData);
        setSuccess('Subscription plan created successfully');
      }
      handleClosePlanDialog();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save subscription plan');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!window.confirm('Are you sure you want to delete this subscription plan?')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiService.deleteSubscriptionPlan(planId);
      setSuccess('Subscription plan deleted successfully');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete subscription plan');
    } finally {
      setLoading(false);
    }
  };

  // User Subscriptions Handlers
  const handleOpenSubscriptionDialog = (subscription?: UserSubscription) => {
    if (subscription) {
      setEditingSubscription(subscription);
      setSubscriptionFormData({
        userId: subscription.userId,
        subscriptionPlanId: subscription.subscriptionPlanId,
        billingCycle: subscription.billingCycle,
      });
    } else {
      setEditingSubscription(null);
      setSubscriptionFormData({
        userId: '',
        subscriptionPlanId: '',
        billingCycle: 'MONTHLY',
      });
    }
    setSubscriptionDialogOpen(true);
  };

  const handleCloseSubscriptionDialog = () => {
    setSubscriptionDialogOpen(false);
    setEditingSubscription(null);
  };

  const handleSaveSubscription = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingSubscription) {
        const updateData: UpdateUserSubscriptionRequest = {
          subscriptionPlanId: subscriptionFormData.subscriptionPlanId,
          status: 'ACTIVE',
          billingCycle: subscriptionFormData.billingCycle,
        };
        await apiService.updateUserSubscription(editingSubscription.id, updateData);
        setSuccess('User subscription updated successfully');
      } else {
        await apiService.createUserSubscription(subscriptionFormData);
        setSuccess('User subscription created successfully');
      }
      handleCloseSubscriptionDialog();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to save user subscription');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    if (!window.confirm('Are you sure you want to cancel this subscription?')) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await apiService.cancelUserSubscription(subscriptionId);
      setSuccess('Subscription cancelled successfully');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel subscription');
    } finally {
      setLoading(false);
    }
  };

  // Plan columns for DataGrid
  const planColumns: GridColDef[] = [
    { field: 'displayName', headerName: 'Plan Name', width: 200, flex: 1 },
    { field: 'name', headerName: 'Code', width: 150 },
    {
      field: 'monthlyPrice',
      headerName: 'Monthly Price',
      width: 150,
      renderCell: (params) => `$${params.value.toFixed(2)}`,
    },
    {
      field: 'yearlyPrice',
      headerName: 'Yearly Price',
      width: 150,
      renderCell: (params) => params.value ? `$${params.value.toFixed(2)}` : 'N/A',
    },
    {
      field: 'isActive',
      headerName: 'Status',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'displayOrder',
      headerName: 'Order',
      width: 100,
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 150,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleOpenPlanDialog(params.row)}
        />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeletePlan(params.row.id)}
          showInMenu
        />,
      ],
    },
  ];

  // Subscription columns for DataGrid
  const subscriptionColumns: GridColDef[] = [
    { field: 'userName', headerName: 'User Name', flex: 1, minWidth: 150 },
    { field: 'userEmail', headerName: 'Email', flex: 1.5, minWidth: 200 },
    { field: 'planDisplayName', headerName: 'Plan', flex: 1.2, minWidth: 150 },
    {
      field: 'status',
      headerName: 'Status',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={
            params.value === 'ACTIVE' ? 'success' :
            params.value === 'CANCELLED' ? 'error' :
            params.value === 'EXPIRED' ? 'warning' : 'default'
          }
          size="small"
        />
      ),
    },
    {
      field: 'billingCycle',
      headerName: 'Billing',
      flex: 0.7,
      minWidth: 100,
    },
    {
      field: 'currentPrice',
      headerName: 'Price',
      flex: 0.7,
      minWidth: 100,
      renderCell: (params) => `$${params.value.toFixed(2)}`,
    },
    {
      field: 'startDate',
      headerName: 'Start Date',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'nextBillingDate',
      headerName: 'Next Billing',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => params.value ? new Date(params.value).toLocaleDateString() : 'N/A',
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      flex: 0.8,
      minWidth: 120,
      getActions: (params) => [
        <GridActionsCellItem
          icon={<EditIcon />}
          label="Edit"
          onClick={() => handleOpenSubscriptionDialog(params.row)}
        />,
        params.row.status === 'ACTIVE' && (
          <GridActionsCellItem
            icon={<CancelIcon />}
            label="Cancel"
            onClick={() => handleCancelSubscription(params.row.id)}
            showInMenu
          />
        ),
      ].filter(Boolean) as any,
    },
  ];

  // User columns for DataGrid
  const userColumns: GridColDef[] = [
    { field: 'name', headerName: 'Name', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1.5, minWidth: 200 },
    { field: 'role', headerName: 'Role', flex: 0.8, minWidth: 100 },
    {
      field: 'isActive',
      headerName: 'Status',
      flex: 0.8, 
      minWidth: 100,
      renderCell: (params) => (
        <Chip
          label={params.value ? 'Active' : 'Inactive'}
          color={params.value ? 'success' : 'default'}
          size="small"
        />
      ),
    },
    {
      field: 'subscriptionPlanName',
      headerName: 'Subscription Plan',
      flex: 1.2,
      minWidth: 150,
      renderCell: (params) => {
        const planName = params.value || 'Free';
        // Ensure None, empty, or Free values are displayed as "Free"
        if (!planName || planName.toLowerCase() === 'none' || planName.toLowerCase() === 'free') {
          return 'Free';
        }
        return planName;
      },
    },
    {
      field: 'subscriptionStatus',
      headerName: 'Subscription Status',
      flex: 1,
      minWidth: 150,
      renderCell: (params) => {
        if (!params.value) return 'N/A';
        return (
          <Chip
            label={params.value}
            color={
              params.value === 'ACTIVE' ? 'success' :
              params.value === 'CANCELLED' ? 'error' :
              params.value === 'EXPIRED' ? 'warning' : 'default'
            }
            size="small"
          />
        );
      },
    },
    {
      field: 'subscriptionBillingCycle',
      headerName: 'Billing Cycle',
      flex: 0.8,
      minWidth: 120,
      renderCell: (params) => params.value || 'N/A',
    },
  ];

  // Ticket columns for DataGrid
  const ticketColumns: GridColDef[] = [
    { field: 'title', headerName: 'Title', width: 300, flex: 1 },
    { field: 'userName', headerName: 'User', width: 200 },
    { field: 'userEmail', headerName: 'Email', width: 250 },
    {
      field: 'subscriptionPlan',
      headerName: 'Subscription',
      width: 180,
      renderCell: (params) => {
        const subscriptionPlan = params.value || 'No Plan';
        return (
          <Chip
            label={subscriptionPlan}
            size="small"
            color={subscriptionPlan === 'No Plan' ? 'default' : 'primary'}
            variant="outlined"
          />
        );
      },
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const statusColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
          'OPEN': 'default',
          'IN_PROGRESS': 'warning',
          'RESOLVED': 'success',
          'CLOSED': 'default',
        };
        return (
          <Chip
            label={params.value}
            color={statusColors[params.value] || 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'priority',
      headerName: 'Priority',
      width: 120,
      renderCell: (params) => {
        const priorityColors: Record<string, 'success' | 'warning' | 'error' | 'default'> = {
          'LOW': 'default',
          'NORMAL': 'default',
          'HIGH': 'warning',
          'URGENT': 'error',
        };
        return (
          <Chip
            label={params.value}
            color={priorityColors[params.value] || 'default'}
            size="small"
          />
        );
      },
    },
    {
      field: 'category',
      headerName: 'Category',
      width: 150,
      renderCell: (params) => {
        const categoryLabels: Record<string, string> = {
          'BUG': 'Bug Report',
          'FEATURE_REQUEST': 'Feature Request',
          'SUPPORT': 'Support',
          'TECHNICAL': 'Technical',
          'BILLING': 'Billing',
          'GENERAL': 'General',
        };
        return categoryLabels[params.value] || params.value;
      },
    },
    {
      field: 'assignedToName',
      headerName: 'Assigned To',
      width: 150,
      renderCell: (params) => params.value || 'Unassigned',
    },
    {
      field: 'createdAt',
      headerName: 'Created',
      width: 150,
      renderCell: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'commentCount',
      headerName: 'Comments',
      width: 100,
      renderCell: (params) => params.value || 0,
    },
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Super Admin - Subscription Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Paper sx={{ mt: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Pricing Plans" />
          <Tab label="User Subscriptions" />
          <Tab label="Users with Subscriptions" />
          <Tab label="Support Center" />
        </Tabs>

        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6">Subscription Plans</Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenPlanDialog()}
            >
              Add Plan
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ width: '100%', height: 600 }}>
              <DataGrid
                rows={plans}
                columns={planColumns}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 },
                  },
                }}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
                sx={{ width: '100%' }}
              />
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Typography variant="h6">User Subscriptions</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Filter by Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Filter by Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  <MenuItem value="EXPIRED">Expired</MenuItem>
                  <MenuItem value="SUSPENDED">Suspended</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 200 }}>
                <InputLabel>Filter by Plan</InputLabel>
                <Select
                  value={filterPlanId}
                  label="Filter by Plan"
                  onChange={(e) => setFilterPlanId(e.target.value)}
                >
                  <MenuItem value="">All Plans</MenuItem>
                  {plans.map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenSubscriptionDialog()}
              >
                Add Subscription
              </Button>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ width: '100%', height: 600 }}>
              <DataGrid
                rows={userSubscriptions}
                columns={subscriptionColumns}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 },
                  },
                }}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
                sx={{ width: '100%' }}
              />
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="h6">Users with Subscription Information</Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box sx={{ width: '100%', height: 600 }}>
              <DataGrid
                rows={usersWithSubscriptions}
                columns={userColumns}
                initialState={{
                  pagination: {
                    paginationModel: { page: 0, pageSize: 10 },
                  },
                }}
                pageSizeOptions={[10, 25, 50]}
                disableRowSelectionOnClick
                sx={{ width: '100%' }}
              />
            </Box>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, alignItems: 'center' }}>
            <Typography variant="h6">Support Tickets</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  value={ticketFilterStatus}
                  label="Status"
                  onChange={(e) => setTicketFilterStatus(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="OPEN">Open</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="RESOLVED">Resolved</MenuItem>
                  <MenuItem value="CLOSED">Closed</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={ticketFilterPriority}
                  label="Priority"
                  onChange={(e) => setTicketFilterPriority(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="NORMAL">Normal</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="URGENT">Urgent</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 180 }}>
                <InputLabel>Category</InputLabel>
                <Select
                  value={ticketFilterCategory}
                  label="Category"
                  onChange={(e) => setTicketFilterCategory(e.target.value)}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="BUG">Bug Report</MenuItem>
                  <MenuItem value="FEATURE_REQUEST">Feature Request</MenuItem>
                  <MenuItem value="SUPPORT">Support</MenuItem>
                  <MenuItem value="TECHNICAL">Technical Issue</MenuItem>
                  <MenuItem value="BILLING">Billing</MenuItem>
                  <MenuItem value="GENERAL">General</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <DataGrid
              rows={tickets}
              columns={ticketColumns}
              initialState={{
                pagination: {
                  paginationModel: { page: 0, pageSize: 25 },
                },
              }}
              pageSizeOptions={[10, 25, 50, 100]}
              disableRowSelectionOnClick
              autoHeight
            />
          )}
        </TabPanel>
      </Paper>

      {/* Plan Dialog */}
      <Dialog open={planDialogOpen} onClose={handleClosePlanDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingPlan ? 'Edit Subscription Plan' : 'Create Subscription Plan'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Plan Code"
                value={planFormData.name}
                onChange={(e) => setPlanFormData({ ...planFormData, name: e.target.value })}
                required
                disabled={!!editingPlan}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Display Name"
                value={planFormData.displayName}
                onChange={(e) => setPlanFormData({ ...planFormData, displayName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={planFormData.description}
                onChange={(e) => setPlanFormData({ ...planFormData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Price"
                type="number"
                value={planFormData.monthlyPrice}
                onChange={(e) => setPlanFormData({ ...planFormData, monthlyPrice: parseFloat(e.target.value) || 0 })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Yearly Price"
                type="number"
                value={planFormData.yearlyPrice}
                onChange={(e) => setPlanFormData({ ...planFormData, yearlyPrice: parseFloat(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Bank Accounts"
                type="number"
                value={planFormData.maxBankAccounts || ''}
                onChange={(e) => setPlanFormData({ ...planFormData, maxBankAccounts: e.target.value ? parseInt(e.target.value) : undefined })}
                helperText="Leave empty for unlimited"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Transactions/Month"
                type="number"
                value={planFormData.maxTransactionsPerMonth || ''}
                onChange={(e) => setPlanFormData({ ...planFormData, maxTransactionsPerMonth: e.target.value ? parseInt(e.target.value) : undefined })}
                helperText="Leave empty for unlimited"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Bills/Month"
                type="number"
                value={planFormData.maxBillsPerMonth || ''}
                onChange={(e) => setPlanFormData({ ...planFormData, maxBillsPerMonth: e.target.value ? parseInt(e.target.value) : undefined })}
                helperText="Leave empty for unlimited"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max Loans"
                type="number"
                value={planFormData.maxLoans || ''}
                onChange={(e) => setPlanFormData({ ...planFormData, maxLoans: e.target.value ? parseInt(e.target.value) : undefined })}
                helperText="Leave empty for unlimited"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Max AI Queries/Month"
                type="number"
                value={planFormData.maxAiQueriesPerMonth || ''}
                onChange={(e) => setPlanFormData({ ...planFormData, maxAiQueriesPerMonth: e.target.value ? parseInt(e.target.value) : undefined })}
                helperText="Leave empty for unlimited"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Display Order"
                type="number"
                value={planFormData.displayOrder}
                onChange={(e) => setPlanFormData({ ...planFormData, displayOrder: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Features
              </Typography>
            </Grid>
            {[
              { key: 'hasAiAssistant', label: 'AI Assistant' },
              { key: 'hasBankFeedIntegration', label: 'Bank Feed Integration' },
              { key: 'hasReceiptOcr', label: 'Receipt OCR' },
              { key: 'hasAdvancedReports', label: 'Advanced Reports' },
              { key: 'hasPrioritySupport', label: 'Priority Support' },
              { key: 'hasApiAccess', label: 'API Access' },
              { key: 'hasInvestmentTracking', label: 'Investment Tracking' },
              { key: 'hasTaxOptimization', label: 'Tax Optimization' },
              { key: 'hasMultiUserSupport', label: 'Multi-User Support' },
              { key: 'hasWhiteLabelOptions', label: 'White Label Options' },
              { key: 'hasCustomIntegrations', label: 'Custom Integrations' },
              { key: 'hasDedicatedSupport', label: 'Dedicated Support' },
              { key: 'hasAccountManager', label: 'Account Manager' },
              { key: 'hasCustomReporting', label: 'Custom Reporting' },
              { key: 'hasAdvancedSecurity', label: 'Advanced Security' },
              { key: 'hasComplianceReports', label: 'Compliance Reports' },
            ].map((feature) => (
              <Grid item xs={12} sm={6} md={4} key={feature.key}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={planFormData[feature.key as keyof CreateSubscriptionPlanRequest] as boolean}
                      onChange={(e) =>
                        setPlanFormData({
                          ...planFormData,
                          [feature.key]: e.target.checked,
                        })
                      }
                    />
                  }
                  label={feature.label}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePlanDialog}>Cancel</Button>
          <Button onClick={handleSavePlan} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subscription Dialog */}
      <Dialog open={subscriptionDialogOpen} onClose={handleCloseSubscriptionDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSubscription ? 'Edit User Subscription' : 'Create User Subscription'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="User ID"
                value={subscriptionFormData.userId}
                onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, userId: e.target.value })}
                required
                disabled={!!editingSubscription}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Subscription Plan</InputLabel>
                <Select
                  value={subscriptionFormData.subscriptionPlanId}
                  label="Subscription Plan"
                  onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, subscriptionPlanId: e.target.value })}
                >
                  {plans.filter(p => p.isActive).map((plan) => (
                    <MenuItem key={plan.id} value={plan.id}>
                      {plan.displayName}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Billing Cycle</InputLabel>
                <Select
                  value={subscriptionFormData.billingCycle}
                  label="Billing Cycle"
                  onChange={(e) => setSubscriptionFormData({ ...subscriptionFormData, billingCycle: e.target.value as 'MONTHLY' | 'YEARLY' })}
                >
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                  <MenuItem value="YEARLY">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSubscriptionDialog}>Cancel</Button>
          <Button onClick={handleSaveSubscription} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SuperAdmin;

