import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TableHead,
  Divider,
  useTheme,
  IconButton,
  Tooltip,
  Chip,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Assessment,
  Refresh,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Warning,
  Info,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiService } from '../../services/api';
import { FinancialRatiosDto, RatioInsightDto } from '../../types/financialReport';

interface FinancialRatiosTabProps {
  asOfDate?: Date;
  onRefresh?: () => void;
}

const FinancialRatiosTab: React.FC<FinancialRatiosTabProps> = ({ 
  asOfDate, 
  onRefresh 
}) => {
  const { formatCurrency } = useCurrency();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [ratios, setRatios] = useState<FinancialRatiosDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date | undefined>(asOfDate);

  useEffect(() => {
    fetchFinancialRatios();
  }, [currentDate]);

  const fetchFinancialRatios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getFinancialRatios(
        currentDate?.toISOString()
      );
      setRatios(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load financial ratios');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchFinancialRatios();
    if (onRefresh) onRefresh();
  };

  const getInterpretationColor = (interpretation: string) => {
    const lower = interpretation.toLowerCase();
    if (lower.includes('excellent')) return theme.palette.success.main;
    if (lower.includes('good')) return theme.palette.info.main;
    if (lower.includes('fair')) return theme.palette.warning.main;
    return theme.palette.error.main;
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'CRITICAL':
        return <ErrorIcon sx={{ color: theme.palette.error.main }} />;
      case 'WARNING':
        return <Warning sx={{ color: theme.palette.warning.main }} />;
      case 'SUCCESS':
        return <CheckCircle sx={{ color: theme.palette.success.main }} />;
      default:
        return <Info sx={{ color: theme.palette.info.main }} />;
    }
  };

  const renderRatioCard = (
    title: string,
    value: number,
    interpretation: string,
    unit: string = '',
    description?: string
  ) => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <Typography variant="h4" fontWeight="bold">
            {value.toFixed(2)}{unit}
          </Typography>
          <Chip
            label={interpretation}
            size="small"
            sx={{
              bgcolor: getInterpretationColor(interpretation),
              color: 'white',
            }}
          />
        </Box>
        {description && (
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );

  const renderInsight = (insight: RatioInsightDto, index: number) => (
    <Alert
      key={index}
      severity={insight.severity.toLowerCase() as any}
      icon={getSeverityIcon(insight.severity)}
      sx={{ mb: 2 }}
    >
      <Typography variant="subtitle2" fontWeight="bold">
        {insight.ratioName} ({insight.category})
      </Typography>
      <Typography variant="body2">
        <strong>Value:</strong> {insight.ratioValue.toFixed(2)} |{' '}
        <strong>Status:</strong> {insight.interpretation}
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        {insight.recommendation}
      </Typography>
    </Alert>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton onClick={handleRefresh} size="small">
          <Refresh />
        </IconButton>
      }>
        {error}
      </Alert>
    );
  }

  if (!ratios) {
    return <Alert severity="info">No financial ratios data available</Alert>;
  }

  return (
    <Box>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Assessment color="primary" />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Financial Ratios
              </Typography>
              <Typography variant="body2" color="text.secondary">
                As of {new Date(ratios.asOfDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>As Of Date</InputLabel>
              <Select
                value={currentDate?.toISOString().split('T')[0] || ''}
                label="As Of Date"
                onChange={(e) => setCurrentDate(e.target.value ? new Date(e.target.value) : undefined)}
              >
                <MenuItem value={new Date().toISOString().split('T')[0]}>Today</MenuItem>
                <MenuItem value={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}>30 Days Ago</MenuItem>
                <MenuItem value={new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}>90 Days Ago</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh}>
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Insights */}
      {ratios.insights && ratios.insights.length > 0 && (
        <Box mb={3}>
          <Typography variant="h6" gutterBottom>
            Key Insights
          </Typography>
          {ratios.insights.map(renderInsight)}
        </Box>
      )}

      {/* Liquidity Ratios */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Liquidity Ratios
      </Typography>
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          {renderRatioCard(
            'Current Ratio',
            ratios.liquidity.currentRatio,
            ratios.liquidity.currentRatioInterpretation,
            '',
            'Current Assets / Current Liabilities'
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderRatioCard(
            'Quick Ratio',
            ratios.liquidity.quickRatio,
            ratios.liquidity.quickRatioInterpretation,
            '',
            '(Current Assets - Savings) / Current Liabilities'
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderRatioCard(
            'Cash Ratio',
            ratios.liquidity.cashRatio,
            ratios.liquidity.cashRatioInterpretation,
            '',
            'Cash / Current Liabilities'
          )}
        </Grid>
      </Grid>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Supporting Data</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Current Assets</Typography>
            <Typography variant="h6">{formatCurrency(ratios.liquidity.currentAssets)}</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Current Liabilities</Typography>
            <Typography variant="h6">{formatCurrency(ratios.liquidity.currentLiabilities)}</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Cash & Equivalents</Typography>
            <Typography variant="h6">{formatCurrency(ratios.liquidity.cashAndEquivalents)}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Debt Ratios */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Debt Ratios
      </Typography>
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          {renderRatioCard(
            'Debt-to-Equity',
            ratios.debt.debtToEquityRatio,
            ratios.debt.debtToEquityInterpretation,
            '',
            'Total Liabilities / Total Equity'
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderRatioCard(
            'Debt-to-Assets',
            ratios.debt.debtToAssetsRatio,
            ratios.debt.debtToAssetsInterpretation,
            '',
            'Total Liabilities / Total Assets'
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderRatioCard(
            'Debt Service Coverage',
            ratios.debt.debtServiceCoverageRatio,
            ratios.debt.debtServiceCoverageInterpretation,
            '',
            'Net Income / Total Debt Payments'
          )}
        </Grid>
      </Grid>
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom>Supporting Data</Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Total Liabilities</Typography>
            <Typography variant="h6">{formatCurrency(ratios.debt.totalLiabilities)}</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Total Assets</Typography>
            <Typography variant="h6">{formatCurrency(ratios.debt.totalAssets)}</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Total Equity</Typography>
            <Typography variant="h6">{formatCurrency(ratios.debt.totalEquity)}</Typography>
          </Grid>
          <Grid item xs={6} md={3}>
            <Typography variant="body2" color="text.secondary">Net Income</Typography>
            <Typography variant="h6">{formatCurrency(ratios.debt.netIncome)}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Profitability Ratios */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Profitability Ratios
      </Typography>
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          {renderRatioCard(
            'Net Profit Margin',
            ratios.profitability.netProfitMargin,
            ratios.profitability.netProfitMarginInterpretation,
            '%',
            '(Net Income / Total Revenue) × 100'
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderRatioCard(
            'Return on Assets (ROA)',
            ratios.profitability.returnOnAssets,
            ratios.profitability.returnOnAssetsInterpretation,
            '%',
            '(Net Income / Total Assets) × 100'
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderRatioCard(
            'Return on Equity (ROE)',
            ratios.profitability.returnOnEquity,
            ratios.profitability.returnOnEquityInterpretation,
            '%',
            '(Net Income / Total Equity) × 100'
          )}
        </Grid>
      </Grid>

      {/* Efficiency Ratios */}
      <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
        Efficiency Ratios
      </Typography>
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          {renderRatioCard(
            'Asset Turnover',
            ratios.efficiency.assetTurnover,
            ratios.efficiency.assetTurnoverInterpretation,
            '',
            'Total Revenue / Total Assets'
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderRatioCard(
            'Expense Ratio',
            ratios.efficiency.expenseRatio,
            ratios.efficiency.expenseRatioInterpretation,
            '%',
            '(Total Expenses / Total Revenue) × 100'
          )}
        </Grid>
        <Grid item xs={12} md={4}>
          {renderRatioCard(
            'Savings Rate',
            ratios.efficiency.savingsRate,
            ratios.efficiency.savingsRateInterpretation,
            '%',
            '(Savings / Total Income) × 100'
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialRatiosTab;

