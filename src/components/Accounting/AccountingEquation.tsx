import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  LinearProgress,
  Chip,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  TrendingDown as TrendingDownIcon,
  AttachMoney as AttachMoneyIcon,
  HelpOutline as HelpIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { useCurrency } from '../../contexts/CurrencyContext';

interface AccountingEquationData {
  totalAssets: number;
  totalLiabilities: number;
  totalEquity: number;
  isBalanced: boolean;
  difference?: number;
}

const AccountingEquation: React.FC = () => {
  const { formatCurrency } = useCurrency();
  const [data, setData] = useState<AccountingEquationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAccountingData();
  }, []);

  const loadAccountingData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch bank accounts (Assets)
      const bankAccounts = await apiService.getUserBankAccounts();
      const totalBankBalance =
        bankAccounts.reduce((sum: number, acc: any) => sum + (acc.currentBalance || 0), 0) || 0;

      // Fetch savings accounts (Assets)
      const savingsAccounts = await apiService.getSavingsAccounts({ isActive: true });
      const savingsData = Array.isArray(savingsAccounts) ? savingsAccounts : savingsAccounts?.data || [];
      const totalSavings = savingsData.reduce((sum: number, acc: any) => sum + (acc.balance || 0), 0) || 0;

      // Fetch loans (Liabilities)
      const loans = await apiService.getUserLoans('demo-user-123');
      const loansData = Array.isArray(loans) ? loans : [];
      const totalLoanBalance =
        loansData
          .filter((loan: any) => loan.status === 'ACTIVE')
          .reduce((sum: number, loan: any) => sum + (loan.remainingBalance || 0), 0) || 0;

      // Calculate equity (Assets - Liabilities)
      const totalAssets = totalBankBalance + totalSavings;
      const totalLiabilities = totalLoanBalance;
      const totalEquity = totalAssets - totalLiabilities;

      // Check if equation balances
      const calculatedEquity = totalAssets - totalLiabilities;
      const isBalanced = Math.abs(calculatedEquity - totalEquity) < 0.01;
      const difference = Math.abs(calculatedEquity - totalEquity);

      setData({
        totalAssets,
        totalLiabilities,
        totalEquity,
        isBalanced,
        difference: difference > 0.01 ? difference : undefined,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load accounting data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography variant="body2" color="text.secondary">
            Loading accounting equation...
          </Typography>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
            <WarningIcon />
            <Typography variant="body2">{error}</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardContent>
        <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" fontWeight="bold">
            Accounting Equation
          </Typography>
          <Tooltip title="This equation must always balance. Assets = Liabilities + Equity">
            <IconButton size="small">
              <HelpIcon />
            </IconButton>
          </Tooltip>
        </Box>

        <Box
          sx={{
            fontFamily: 'monospace',
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            mb: 3,
            p: 2,
            borderRadius: 1,
            bgcolor: 'background.default',
            border: '2px solid',
            borderColor: data.isBalanced ? 'success.main' : 'warning.main',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccountBalanceIcon sx={{ color: '#4CAF50' }} />
              <Typography component="span" color="#4CAF50">
                Assets
              </Typography>
            </Box>
            <Typography component="span">=</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TrendingDownIcon sx={{ color: '#F44336' }} />
              <Typography component="span" color="#F44336">
                Liabilities
              </Typography>
            </Box>
            <Typography component="span">+</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AttachMoneyIcon sx={{ color: '#2196F3' }} />
              <Typography component="span" color="#2196F3">
                Equity
              </Typography>
            </Box>
          </Box>
        </Box>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#4CAF5020', border: '2px solid #4CAF50' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AccountBalanceIcon sx={{ color: '#4CAF50' }} />
                  <Typography variant="subtitle2" fontWeight="bold" color="#4CAF50">
                    Assets
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold" color="#4CAF50">
                  {formatCurrency(data.totalAssets)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Resources you own
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#F4433620', border: '2px solid #F44336' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <TrendingDownIcon sx={{ color: '#F44336' }} />
                  <Typography variant="subtitle2" fontWeight="bold" color="#F44336">
                    Liabilities
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold" color="#F44336">
                  {formatCurrency(data.totalLiabilities)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Debts you owe
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card sx={{ bgcolor: '#2196F320', border: '2px solid #2196F3' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                  <AttachMoneyIcon sx={{ color: '#2196F3' }} />
                  <Typography variant="subtitle2" fontWeight="bold" color="#2196F3">
                    Equity
                  </Typography>
                </Box>
                <Typography variant="h5" fontWeight="bold" color="#2196F3">
                  {formatCurrency(data.totalEquity)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Your net worth
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box
          sx={{
            p: 2,
            borderRadius: 1,
            bgcolor: data.isBalanced ? 'success.light' : 'warning.light',
            color: data.isBalanced ? 'success.contrastText' : 'warning.contrastText',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            {data.isBalanced ? <CheckCircleIcon /> : <WarningIcon />}
            <Typography variant="body2" fontWeight="bold">
              {data.isBalanced ? 'Equation Balanced' : 'Equation Check'}
            </Typography>
          </Box>
          <Typography variant="body2">
            {formatCurrency(data.totalAssets)} = {formatCurrency(data.totalLiabilities)} +{' '}
            {formatCurrency(data.totalEquity)}
          </Typography>
          {data.isBalanced ? (
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              ✓ Your accounting equation is balanced correctly
            </Typography>
          ) : (
            <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
              ⚠ Small difference detected: {data.difference ? formatCurrency(data.difference) : 'N/A'} (may be due to
              rounding)
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
};

export default AccountingEquation;

