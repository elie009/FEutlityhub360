import React, { useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material';
import {
  AccountBalance,
  Edit,
  Add,
} from '@mui/icons-material';
import { BudgetStatus, BillType, CreateBudgetRequest } from '../../types/bill';
import { apiService } from '../../services/api';
import { getErrorMessage } from '../../utils/validation';
import { useCurrency } from '../../contexts/CurrencyContext';

interface BudgetTrackerProps {
  budgetStatus?: BudgetStatus;
  provider: string;
  billType: BillType;
  onBudgetUpdate?: () => void;
}

const BudgetTracker: React.FC<BudgetTrackerProps> = ({
  budgetStatus,
  provider,
  billType,
  onBudgetUpdate,
}) => {
  const { formatCurrency } = useCurrency();
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState<CreateBudgetRequest>({
    provider,
    billType,
    monthlyBudget: budgetStatus?.monthlyBudget || 0,
    enableAlerts: true,
    alertThreshold: 90,
  });


  const getStatusColor = (): 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    if (!budgetStatus) return 'primary';
    switch (budgetStatus.status) {
      case 'under_budget':
        return 'success';
      case 'on_track':
        return 'info';
      case 'near_limit':
        return 'warning';
      case 'over_budget':
        return 'error';
      default:
        return 'primary';
    }
  };

  const getAlertSeverity = (): 'error' | 'info' | 'success' | 'warning' => {
    if (!budgetStatus) return 'info';
    switch (budgetStatus.status) {
      case 'under_budget':
        return 'success';
      case 'on_track':
        return 'info';
      case 'near_limit':
        return 'warning';
      case 'over_budget':
        return 'error';
      default:
        return 'info';
    }
  };

  const handleOpenDialog = () => {
    if (budgetStatus) {
      setFormData({
        provider,
        billType,
        monthlyBudget: budgetStatus.monthlyBudget,
        enableAlerts: true,
        alertThreshold: 90,
      });
    }
    setShowDialog(true);
  };

  const handleSaveBudget = async () => {
    try {
      setLoading(true);
      setError('');

      if (formData.monthlyBudget <= 0) {
        setError('Budget must be greater than 0');
        return;
      }

      if (budgetStatus?.budgetId) {
        await apiService.updateBillBudget(budgetStatus.budgetId, formData);
      } else {
        await apiService.setBillBudget(formData);
      }

      setShowDialog(false);
      onBudgetUpdate?.();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to save budget'));
    } finally {
      setLoading(false);
    }
  };

  if (!budgetStatus) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <AccountBalance sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No Budget Set
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Set a monthly budget to track your spending
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={handleOpenDialog}
            >
              Set Budget
            </Button>
          </Box>

          <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Set Monthly Budget</DialogTitle>
            <DialogContent>
              {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
              
              <TextField
                fullWidth
                label="Monthly Budget"
                type="number"
                value={formData.monthlyBudget}
                onChange={(e) =>
                  setFormData({ ...formData, monthlyBudget: parseFloat(e.target.value) || 0 })
                }
                sx={{ mt: 2, mb: 2 }}
                InputProps={{
                  startAdornment: '$',
                }}
              />

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.enableAlerts}
                    onChange={(e) =>
                      setFormData({ ...formData, enableAlerts: e.target.checked })
                    }
                  />
                }
                label="Enable Budget Alerts"
              />

              {formData.enableAlerts && (
                <TextField
                  fullWidth
                  label="Alert Threshold (%)"
                  type="number"
                  value={formData.alertThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, alertThreshold: parseInt(e.target.value) || 90 })
                  }
                  sx={{ mt: 2 }}
                  helperText="Get notified when spending reaches this percentage"
                />
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDialog(false)}>Cancel</Button>
              <Button onClick={handleSaveBudget} variant="contained" disabled={loading}>
                {loading ? 'Saving...' : 'Save Budget'}
              </Button>
            </DialogActions>
          </Dialog>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6">Monthly Budget</Typography>
          <Button
            size="small"
            startIcon={<Edit />}
            onClick={handleOpenDialog}
          >
            Edit
          </Button>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Budget:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {formatCurrency(budgetStatus.monthlyBudget)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Current Bill:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              {formatCurrency(budgetStatus.currentBill)}
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Remaining:
            </Typography>
            <Typography
              variant="body2"
              fontWeight="bold"
              color={budgetStatus.remaining >= 0 ? 'success.main' : 'error.main'}
            >
              {formatCurrency(budgetStatus.remaining)}
            </Typography>
          </Box>

          <Box sx={{ mb: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                Usage
              </Typography>
              <Typography
                variant="caption"
                fontWeight="bold"
                color={`${getStatusColor()}.main`}
              >
                {budgetStatus.percentageUsed.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={Math.min(budgetStatus.percentageUsed, 100)}
              color={getStatusColor()}
              sx={{ height: 8, borderRadius: 1 }}
            />
          </Box>
        </Box>

        {budgetStatus.alert && budgetStatus.message && (
          <Alert severity={getAlertSeverity()}>
            {budgetStatus.message}
          </Alert>
        )}

        {/* Budget Dialog */}
        <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Edit Monthly Budget</DialogTitle>
          <DialogContent>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            {/* Explanatory Note */}
            <Alert severity="info" sx={{ mt: 2, mb: 3 }} icon={<AccountBalance />}>
              <Typography variant="body2" fontWeight="medium" gutterBottom>
                💡 How to Set Your Budget
              </Typography>
              <Typography variant="caption" display="block" gutterBottom>
                Your monthly budget helps you track spending and get alerts when costs are higher than expected.
              </Typography>
              <Box sx={{ mt: 1, pl: 2, borderLeft: 2, borderColor: 'info.main' }}>
                <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                  <strong>Example:</strong> If your average {provider} bill is {formatCurrency(2865)}:
                </Typography>
                <Typography variant="caption" display="block">
                  • Conservative: {formatCurrency(3000)} (105% of average)
                </Typography>
                <Typography variant="caption" display="block">
                  • Comfortable: {formatCurrency(3200)} (112% of average)
                </Typography>
                <Typography variant="caption" display="block">
                  • Generous: {formatCurrency(3500)} (122% of average)
                </Typography>
              </Box>
            </Alert>
            
            <TextField
              fullWidth
              label="Monthly Budget"
              type="number"
              value={formData.monthlyBudget}
              onChange={(e) =>
                setFormData({ ...formData, monthlyBudget: parseFloat(e.target.value) || 0 })
              }
              sx={{ mb: 2 }}
              InputProps={{
                startAdornment: '$',
              }}
              helperText={`Recommended: Set 10-20% above your average bill ($${((budgetStatus?.currentBill || 0) * 1.1).toFixed(0)} - $${((budgetStatus?.currentBill || 0) * 1.2).toFixed(0)})`}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.enableAlerts}
                  onChange={(e) =>
                    setFormData({ ...formData, enableAlerts: e.target.checked })
                  }
                />
              }
              label={
                <Box>
                  <Typography variant="body2">Enable Budget Alerts</Typography>
                  <Typography variant="caption" color="text.secondary">
                    Get notified when your bill approaches or exceeds your budget
                  </Typography>
                </Box>
              }
            />

            {formData.enableAlerts && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'action.hover', borderRadius: 1 }}>
                <TextField
                  fullWidth
                  label="Alert Threshold (%)"
                  type="number"
                  value={formData.alertThreshold}
                  onChange={(e) =>
                    setFormData({ ...formData, alertThreshold: parseInt(e.target.value) || 90 })
                  }
                  sx={{ mb: 1 }}
                  helperText="You'll be notified when spending reaches this percentage"
                  inputProps={{ min: 50, max: 100 }}
                />
                
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                  <strong>Examples:</strong>
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • 85% - Early warning (alert at ${((formData.monthlyBudget || 0) * 0.85).toFixed(0)})
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • 90% - Balanced (alert at ${((formData.monthlyBudget || 0) * 0.90).toFixed(0)})
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  • 95% - Late warning (alert at ${((formData.monthlyBudget || 0) * 0.95).toFixed(0)})
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveBudget} variant="contained" disabled={loading}>
              {loading ? 'Saving...' : 'Save Budget'}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default BudgetTracker;

