import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Bolt,
  TrendingUp,
  Warning,
  CheckCircle,
  FilterList,
  Refresh,
  Edit,
  Delete,
  CompareArrows,
  BarChart,
  ShowChart,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { apiService } from '../services/api';
import {
  Utility,
  UtilityType,
  UtilityStatus,
  UtilityFilters,
  UtilityAnalytics,
  UtilityConsumptionHistory,
  UtilityComparison,
  CreateUtilityRequest,
  UpdateUtilityRequest,
} from '../types/utility';
import { getErrorMessage } from '../utils/validation';
import { LineChart, Line, BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';

const Utilities: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [utilities, setUtilities] = useState<Utility[]>([]);
  const [analytics, setAnalytics] = useState<UtilityAnalytics | null>(null);
  const [consumptionHistory, setConsumptionHistory] = useState<UtilityConsumptionHistory[]>([]);
  const [comparisons, setComparisons] = useState<UtilityComparison[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showUtilityForm, setShowUtilityForm] = useState(false);
  const [selectedUtility, setSelectedUtility] = useState<Utility | null>(null);
  const [filters, setFilters] = useState<UtilityFilters>({
    page: 1,
    limit: 1000,
  });
  const [activeTab, setActiveTab] = useState(0);
  const [showComparisonDialog, setShowComparisonDialog] = useState(false);
  const [selectedUtilityType, setSelectedUtilityType] = useState<string>('');

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user, filters]);

  const loadAllData = async () => {
    await Promise.all([
      loadUtilities(),
      loadAnalytics(),
      loadConsumptionHistory(),
    ]);
  };

  const loadUtilities = async () => {
    try {
      setIsLoading(true);
      const response = await apiService.getUserUtilities(filters);
      setUtilities(response.data || []);
    } catch (err: unknown) {
      console.error('Error loading utilities:', err);
      setError(getErrorMessage(err, 'Failed to load utilities'));
      setUtilities([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const analyticsData = await apiService.getUtilityAnalytics();
      setAnalytics(analyticsData || null);
    } catch (err: unknown) {
      console.error('Failed to load analytics:', err);
      setAnalytics(null);
    }
  };

  const loadConsumptionHistory = async () => {
    try {
      const history = await apiService.getAllConsumptionHistory();
      setConsumptionHistory(history || []);
    } catch (err: unknown) {
      console.error('Failed to load consumption history:', err);
      setConsumptionHistory([]);
    }
  };

  const loadComparisons = async (utilityType?: string) => {
    try {
      if (utilityType) {
        const comparison = await apiService.compareProviders(utilityType);
        setComparisons([comparison]);
      } else {
        const allComparisons = await apiService.compareAllUtilityTypes();
        setComparisons(allComparisons || []);
      }
    } catch (err: unknown) {
      console.error('Failed to load comparisons:', err);
      setComparisons([]);
    }
  };

  const handleCreateUtility = async (utilityData: CreateUtilityRequest) => {
    try {
      await apiService.createUtility(utilityData);
      setSuccessMessage('Utility created successfully');
      setShowUtilityForm(false);
      await loadAllData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to create utility'));
    }
  };

  const handleUpdateUtility = async (utilityId: string, updateData: UpdateUtilityRequest) => {
    try {
      await apiService.updateUtility(utilityId, updateData);
      setSuccessMessage('Utility updated successfully');
      setShowUtilityForm(false);
      setSelectedUtility(null);
      await loadAllData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to update utility'));
    }
  };

  const handleDeleteUtility = async (utilityId: string) => {
    if (!window.confirm('Are you sure you want to delete this utility?')) return;
    
    try {
      await apiService.deleteUtility(utilityId);
      setSuccessMessage('Utility deleted successfully');
      await loadAllData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete utility'));
    }
  };

  const handleMarkAsPaid = async (utilityId: string) => {
    try {
      await apiService.markUtilityAsPaid(utilityId, {});
      setSuccessMessage('Utility marked as paid');
      await loadAllData();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to mark utility as paid'));
    }
  };

  const handleShowComparison = async (utilityType?: string) => {
    setSelectedUtilityType(utilityType || '');
    await loadComparisons(utilityType);
    setShowComparisonDialog(true);
  };

  const pendingUtilities = utilities.filter(u => u.status === UtilityStatus.PENDING);
  const overdueUtilities = utilities.filter(u => 
    u.status === UtilityStatus.PENDING && new Date(u.dueDate) < new Date()
  );

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Utilities Manager
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<CompareArrows />}
            onClick={() => handleShowComparison()}
            sx={{ mr: 2 }}
          >
            Compare Providers
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              setSelectedUtility(null);
              setShowUtilityForm(true);
            }}
          >
            Add Utility
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage('')} sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {/* Analytics Summary Cards */}
      {analytics && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Pending
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(analytics.totalPendingAmount)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {analytics.pendingCount} utilities
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Paid
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(analytics.totalPaidAmount)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {analytics.paidCount} utilities
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Overdue
                </Typography>
                <Typography variant="h5" color="error">
                  {formatCurrency(analytics.totalOverdueAmount)}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {analytics.overdueCount} utilities
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Utilities
                </Typography>
                <Typography variant="h5">
                  {analytics.totalUtilities}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
          <Tab label="All Utilities" />
          <Tab label="Consumption History" />
          <Tab label="Overdue" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          {isLoading ? (
            <Grid item xs={12}>
              <LinearProgress />
            </Grid>
          ) : utilities.length === 0 ? (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography align="center" color="textSecondary">
                    No utilities found. Add your first utility to get started.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ) : (
            utilities.map((utility) => (
              <Grid item xs={12} md={6} lg={4} key={utility.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6">{utility.utilityName}</Typography>
                      <Chip
                        label={utility.status}
                        color={
                          utility.status === UtilityStatus.PAID
                            ? 'success'
                            : utility.status === UtilityStatus.OVERDUE
                            ? 'error'
                            : 'warning'
                        }
                        size="small"
                      />
                    </Box>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {utility.provider} • {utility.utilityType}
                    </Typography>
                    {utility.consumption && (
                      <Typography variant="body2" color="textSecondary">
                        Consumption: {utility.consumption} {utility.unit || ''}
                      </Typography>
                    )}
                    {utility.costPerUnit && (
                      <Typography variant="body2" color="textSecondary">
                        Cost per unit: {formatCurrency(utility.costPerUnit)}/{utility.unit || ''}
                      </Typography>
                    )}
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      {formatCurrency(utility.amount)}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Due: {new Date(utility.dueDate).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                      {utility.status === UtilityStatus.PENDING && (
                        <Button
                          size="small"
                          variant="contained"
                          color="primary"
                          onClick={() => handleMarkAsPaid(utility.id)}
                        >
                          Mark Paid
                        </Button>
                      )}
                      <Button
                        size="small"
                        startIcon={<Edit />}
                        onClick={() => {
                          setSelectedUtility(utility);
                          setShowUtilityForm(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="small"
                        color="error"
                        startIcon={<Delete />}
                        onClick={() => handleDeleteUtility(utility.id)}
                      >
                        Delete
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
          )}
        </Grid>
      )}

      {activeTab === 1 && (
        <Box>
          {consumptionHistory.length === 0 ? (
            <Card>
              <CardContent>
                <Typography align="center" color="textSecondary">
                  No consumption history available.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            consumptionHistory.map((history) => (
              <Card key={history.utilityId} sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {history.utilityName}
                  </Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="textSecondary">
                        Average Consumption
                      </Typography>
                      <Typography variant="h6">
                        {history.averageConsumption?.toFixed(2) || 'N/A'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="textSecondary">
                        Average Cost
                      </Typography>
                      <Typography variant="h6">
                        {formatCurrency(history.averageCost)}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Typography variant="body2" color="textSecondary">
                        Trend
                      </Typography>
                      <Typography
                        variant="h6"
                        color={history.trendPercentage && history.trendPercentage > 0 ? 'error' : 'success'}
                      >
                        {history.trendPercentage
                          ? `${history.trendPercentage > 0 ? '+' : ''}${history.trendPercentage.toFixed(1)}%`
                          : 'N/A'}
                      </Typography>
                    </Grid>
                  </Grid>
                  {history.history.length > 0 && (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={history.history}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="billingDate"
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                        />
                        <YAxis />
                        <RechartsTooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="consumption"
                          stroke="#8884d8"
                          name="Consumption"
                        />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#82ca9d"
                          name="Amount"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </Box>
      )}

      {activeTab === 2 && (
        <Box>
          {overdueUtilities.length === 0 ? (
            <Card>
              <CardContent>
                <Typography align="center" color="textSecondary">
                  No overdue utilities.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Utility Name</TableCell>
                    <TableCell>Provider</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {overdueUtilities.map((utility) => (
                    <TableRow key={utility.id}>
                      <TableCell>{utility.utilityName}</TableCell>
                      <TableCell>{utility.provider}</TableCell>
                      <TableCell>{formatCurrency(utility.amount)}</TableCell>
                      <TableCell>{new Date(utility.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="contained"
                          onClick={() => handleMarkAsPaid(utility.id)}
                        >
                          Mark Paid
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Box>
      )}

      {/* Utility Form Dialog */}
      <Dialog
        open={showUtilityForm}
        onClose={() => {
          setShowUtilityForm(false);
          setSelectedUtility(null);
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedUtility ? 'Edit Utility' : 'Add New Utility'}
        </DialogTitle>
        <DialogContent>
          <UtilityForm
            utility={selectedUtility}
            onSubmit={selectedUtility
              ? (data) => handleUpdateUtility(selectedUtility.id, data)
              : (data) => handleCreateUtility(data as CreateUtilityRequest)}
            onCancel={() => {
              setShowUtilityForm(false);
              setSelectedUtility(null);
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Comparison Dialog */}
      <Dialog
        open={showComparisonDialog}
        onClose={() => setShowComparisonDialog(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>Provider Comparison</DialogTitle>
        <DialogContent>
          {comparisons.length === 0 ? (
            <Typography>No comparison data available.</Typography>
          ) : (
            comparisons.map((comparison) => (
              <Box key={comparison.utilityType} sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  {comparison.utilityType}
                </Typography>
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Provider</TableCell>
                        <TableCell>Avg Amount</TableCell>
                        <TableCell>Avg Consumption</TableCell>
                        <TableCell>Avg Cost/Unit</TableCell>
                        <TableCell>Bill Count</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparison.providers.map((provider) => (
                        <TableRow key={provider.provider}>
                          <TableCell>{provider.provider}</TableCell>
                          <TableCell>{formatCurrency(provider.averageAmount)}</TableCell>
                          <TableCell>
                            {provider.averageConsumption?.toFixed(2) || 'N/A'}
                          </TableCell>
                          <TableCell>
                            {provider.averageCostPerUnit
                              ? formatCurrency(provider.averageCostPerUnit)
                              : 'N/A'}
                          </TableCell>
                          <TableCell>{provider.billCount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
                {comparison.recommendedProvider && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Recommended: {comparison.recommendedProvider}
                    {comparison.potentialSavings && (
                      <span> (Potential savings: {formatCurrency(comparison.potentialSavings)})</span>
                    )}
                  </Alert>
                )}
              </Box>
            ))
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowComparisonDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => {
          setSelectedUtility(null);
          setShowUtilityForm(true);
        }}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

// Utility Form Component
interface UtilityFormProps {
  utility?: Utility | null;
  onSubmit: (data: CreateUtilityRequest | UpdateUtilityRequest) => void;
  onCancel: () => void;
}

const UtilityForm: React.FC<UtilityFormProps> = ({ utility, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<CreateUtilityRequest>({
    utilityName: utility?.utilityName || '',
    utilityType: utility?.utilityType || UtilityType.ELECTRICITY,
    provider: utility?.provider || '',
    accountNumber: utility?.accountNumber || '',
    unit: utility?.unit || '',
    consumption: utility?.consumption,
    costPerUnit: utility?.costPerUnit,
    amount: utility?.amount || 0,
    billingDate: utility?.billingDate || new Date().toISOString().split('T')[0],
    dueDate: utility?.dueDate || new Date().toISOString().split('T')[0],
    notes: utility?.notes || '',
    referenceNumber: utility?.referenceNumber || '',
    previousReading: utility?.previousReading,
    currentReading: utility?.currentReading,
    readingDate: utility?.readingDate || new Date().toISOString().split('T')[0],
    propertyAddress: utility?.propertyAddress || '',
    meterNumber: utility?.meterNumber || '',
    autoGenerateNext: utility?.autoGenerateNext || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Utility Name"
            value={formData.utilityName}
            onChange={(e) => setFormData({ ...formData, utilityName: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Utility Type</InputLabel>
            <Select
              value={formData.utilityType}
              onChange={(e) => setFormData({ ...formData, utilityType: e.target.value })}
              label="Utility Type"
            >
              {Object.values(UtilityType).map((type) => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Provider"
            value={formData.provider}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Account Number"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Unit (kWh, gallons, etc.)"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Previous Reading"
            type="number"
            value={formData.previousReading || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                previousReading: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Current Reading"
            type="number"
            value={formData.currentReading || ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                currentReading: e.target.value ? parseFloat(e.target.value) : undefined,
              })
            }
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Billing Date"
            type="date"
            value={formData.billingDate}
            onChange={(e) => setFormData({ ...formData, billingDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes"
            multiline
            rows={3}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
          />
        </Grid>
      </Grid>
      <DialogActions sx={{ mt: 2 }}>
        <Button onClick={onCancel}>Cancel</Button>
        <Button type="submit" variant="contained">
          {utility ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </form>
  );
};

export default Utilities;

