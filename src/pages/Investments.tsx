import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  ShowChart as ShowChartIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { Investment, CreateInvestmentRequest, UpdateInvestmentRequest } from '../types/investment';
import { useCurrency } from '../contexts/CurrencyContext';

const Investments: React.FC = () => {
  const { formatCurrency } = useCurrency();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [formData, setFormData] = useState<CreateInvestmentRequest>({
    accountName: '',
    investmentType: 'STOCK',
    accountType: '',
    brokerName: '',
    accountNumber: '',
    initialInvestment: 0,
    currentValue: 0,
    currency: 'USD',
    description: '',
  });

  const investmentTypes = [
    { value: 'STOCK', label: 'Stock' },
    { value: 'BOND', label: 'Bond' },
    { value: 'MUTUAL_FUND', label: 'Mutual Fund' },
    { value: 'ETF', label: 'ETF' },
    { value: 'CRYPTO', label: 'Cryptocurrency' },
    { value: 'REAL_ESTATE', label: 'Real Estate' },
    { value: 'OTHER', label: 'Other' },
  ];

  const accountTypes = [
    { value: 'BROKERAGE', label: 'Brokerage' },
    { value: 'RETIREMENT_401K', label: '401(k)' },
    { value: 'RETIREMENT_IRA', label: 'IRA' },
    { value: 'RETIREMENT_ROTH_IRA', label: 'Roth IRA' },
    { value: 'TAXABLE', label: 'Taxable' },
    { value: 'OTHER', label: 'Other' },
  ];

  useEffect(() => {
    loadInvestments();
  }, []);

  const loadInvestments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getInvestments();
      setInvestments(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load investments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (investment?: Investment) => {
    if (investment) {
      setSelectedInvestment(investment);
      setFormData({
        accountName: investment.accountName,
        investmentType: investment.investmentType,
        accountType: investment.accountType || '',
        brokerName: investment.brokerName || '',
        accountNumber: investment.accountNumber || '',
        initialInvestment: investment.initialInvestment,
        currentValue: investment.currentValue,
        currency: investment.currency,
        description: investment.description || '',
      });
    } else {
      setSelectedInvestment(null);
      setFormData({
        accountName: '',
        investmentType: 'STOCK',
        accountType: '',
        brokerName: '',
        accountNumber: '',
        initialInvestment: 0,
        currentValue: 0,
        currency: 'USD',
        description: '',
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedInvestment(null);
    setFormData({
      accountName: '',
      investmentType: 'STOCK',
      accountType: '',
      brokerName: '',
      accountNumber: '',
      initialInvestment: 0,
      currentValue: 0,
      currency: 'USD',
      description: '',
    });
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      if (selectedInvestment) {
        const updateRequest: UpdateInvestmentRequest = {
          accountName: formData.accountName,
          investmentType: formData.investmentType,
          accountType: formData.accountType || undefined,
          brokerName: formData.brokerName || undefined,
          currentValue: formData.currentValue,
          description: formData.description || undefined,
        };
        await apiService.updateInvestment(selectedInvestment.id, updateRequest);
        setSuccess('Investment updated successfully');
      } else {
        await apiService.createInvestment(formData);
        setSuccess('Investment created successfully');
      }

      handleCloseDialog();
      setTimeout(() => setSuccess(null), 3000);
      await loadInvestments();
    } catch (err: any) {
      setError(err.message || 'Failed to save investment');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (investment: Investment) => {
    setSelectedInvestment(investment);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedInvestment) return;
    try {
      setError(null);
      await apiService.deleteInvestment(selectedInvestment.id);
      setSuccess('Investment deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedInvestment(null);
      setTimeout(() => setSuccess(null), 3000);
      await loadInvestments();
    } catch (err: any) {
      setError(err.message || 'Failed to delete investment');
      setDeleteDialogOpen(false);
    }
  };

  const getGainLossColor = (value?: number) => {
    if (!value) return 'default';
    return value >= 0 ? 'success' : 'error';
  };

  const calculateTotalValue = () => {
    return investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  };

  const calculateTotalGainLoss = () => {
    return investments.reduce((sum, inv) => sum + (inv.unrealizedGainLoss || 0), 0);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Investment Tracking
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track and manage your investment portfolios
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Investment
        </Button>
      </Box>

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

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AccountBalanceIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Total Value</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {formatCurrency(calculateTotalValue())}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Total Gain/Loss</Typography>
              </Box>
              <Typography
                variant="h4"
                color={getGainLossColor(calculateTotalGainLoss())}
              >
                {formatCurrency(calculateTotalGainLoss())}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ShowChartIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Accounts</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {investments.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Investments Table */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Investment Accounts
          </Typography>
          <Divider sx={{ mb: 2 }} />
          {investments.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <AccountBalanceIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No investments yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Start tracking your investments by adding your first investment account
              </Typography>
              <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
                Add Investment
              </Button>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Account Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Broker</TableCell>
                    <TableCell align="right">Initial Investment</TableCell>
                    <TableCell align="right">Current Value</TableCell>
                    <TableCell align="right">Gain/Loss</TableCell>
                    <TableCell align="right">Return %</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {investments.map((investment) => (
                    <TableRow key={investment.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {investment.accountName}
                        </Typography>
                        {investment.accountType && (
                          <Typography variant="caption" color="text.secondary">
                            {accountTypes.find(t => t.value === investment.accountType)?.label || investment.accountType}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={investmentTypes.find(t => t.value === investment.investmentType)?.label || investment.investmentType}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>{investment.brokerName || '-'}</TableCell>
                      <TableCell align="right">{formatCurrency(investment.initialInvestment)}</TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(investment.currentValue)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        {investment.unrealizedGainLoss !== undefined && (
                          <Chip
                            label={formatCurrency(investment.unrealizedGainLoss)}
                            size="small"
                            color={getGainLossColor(investment.unrealizedGainLoss)}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        {investment.totalReturnPercentage !== undefined && investment.totalReturnPercentage !== null && (
                          <Chip
                            label={`${investment.totalReturnPercentage.toFixed(2)}%`}
                            size="small"
                            color={getGainLossColor(investment.totalReturnPercentage)}
                          />
                        )}
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => handleOpenDialog(investment)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteClick(investment)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedInvestment ? 'Edit Investment' : 'Add Investment Account'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Account Name"
                value={formData.accountName}
                onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Investment Type</InputLabel>
                <Select
                  value={formData.investmentType}
                  onChange={(e) => setFormData({ ...formData, investmentType: e.target.value })}
                  label="Investment Type"
                >
                  {investmentTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Account Type</InputLabel>
                <Select
                  value={formData.accountType}
                  onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
                  label="Account Type"
                >
                  <MenuItem value="">None</MenuItem>
                  {accountTypes.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Broker Name"
                value={formData.brokerName}
                onChange={(e) => setFormData({ ...formData, brokerName: e.target.value })}
                placeholder="e.g., Fidelity, Vanguard"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Account Number (Optional)"
                value={formData.accountNumber}
                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                placeholder="Last 4 digits"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Initial Investment"
                type="number"
                value={formData.initialInvestment}
                onChange={(e) => setFormData({ ...formData, initialInvestment: parseFloat(e.target.value) || 0 })}
                required
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
                disabled={!!selectedInvestment}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Current Value"
                type="number"
                value={formData.currentValue}
                onChange={(e) => setFormData({ ...formData, currentValue: parseFloat(e.target.value) || 0 })}
                InputProps={{
                  startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description (Optional)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={saving || !formData.accountName || formData.initialInvestment <= 0}
          >
            {saving ? <CircularProgress size={20} /> : selectedInvestment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Investment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedInvestment?.accountName}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Investments;

