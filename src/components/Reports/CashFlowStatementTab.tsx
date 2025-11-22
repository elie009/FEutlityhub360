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
} from '@mui/material';
import {
  AccountBalance,
  CheckCircle,
  Error as ErrorIcon,
  Refresh,
  TrendingUp,
  TrendingDown,
} from '@mui/icons-material';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiService } from '../../services/api';
import { CashFlowStatementDto, CashFlowItemDto } from '../../types/financialReport';

interface CashFlowStatementTabProps {
  startDate?: Date;
  endDate?: Date;
  period?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  onRefresh?: () => void;
}

const CashFlowStatementTab: React.FC<CashFlowStatementTabProps> = ({ 
  startDate, 
  endDate, 
  period = 'MONTHLY',
  onRefresh 
}) => {
  const { formatCurrency } = useCurrency();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [cashFlowStatement, setCashFlowStatement] = useState<CashFlowStatementDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCashFlowStatement();
  }, [startDate, endDate, period]);

  const fetchCashFlowStatement = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getCashFlowStatement(
        startDate?.toISOString(),
        endDate?.toISOString(),
        period
      );
      setCashFlowStatement(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load cash flow statement');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchCashFlowStatement();
    if (onRefresh) onRefresh();
  };

  const renderCashFlowItem = (item: CashFlowItemDto, index: number) => (
    <TableRow key={index} hover>
      <TableCell>{item.description}</TableCell>
      <TableCell>
        <Chip label={item.category} size="small" variant="outlined" />
      </TableCell>
      <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
      <TableCell>{new Date(item.transactionDate).toLocaleDateString()}</TableCell>
    </TableRow>
  );

  const renderSection = (
    title: string,
    inflows: number,
    outflowItems: CashFlowItemDto[],
    outflowTotal: number,
    netCash: number,
    icon: React.ReactNode
  ) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          {icon}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {title}
          </Typography>
        </Box>
        <Divider sx={{ mb: 2 }} />
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Cash Inflows
            </Typography>
            <Typography variant="h6" color="success.main">
              {formatCurrency(inflows)}
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Cash Outflows
            </Typography>
            <Typography variant="h6" color="error.main">
              {formatCurrency(outflowTotal)}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">
            Net Cash Flow
          </Typography>
          <Box display="flex" alignItems="center">
            {netCash >= 0 ? (
              <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
            ) : (
              <TrendingDown sx={{ color: 'error.main', mr: 1 }} />
            )}
            <Typography
              variant="h6"
              color={netCash >= 0 ? 'success.main' : 'error.main'}
              fontWeight="bold"
            >
              {formatCurrency(netCash)}
            </Typography>
          </Box>
        </Box>

        {outflowItems.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Transaction Details
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Description</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {outflowItems.map((item, index) => renderCashFlowItem(item, index))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={
        <IconButton color="inherit" size="small" onClick={handleRefresh}>
          <Refresh />
        </IconButton>
      }>
        {error}
      </Alert>
    );
  }

  if (!cashFlowStatement) {
    return (
      <Alert severity="info">No cash flow statement data available</Alert>
    );
  }

  const { operatingActivities, investingActivities, financingActivities } = cashFlowStatement;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Cash Flow Statement
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Period: {new Date(cashFlowStatement.periodStart).toLocaleDateString()} -{' '}
            {new Date(cashFlowStatement.periodEnd).toLocaleDateString()}
          </Typography>
        </Box>
        <Tooltip title="Refresh">
          <IconButton onClick={handleRefresh}>
            <Refresh />
          </IconButton>
        </Tooltip>
      </Box>

      {cashFlowStatement.isBalanced ? (
        <Alert severity="success" sx={{ mb: 2 }} icon={<CheckCircle />}>
          Cash flow statement is balanced: Beginning Cash + Net Cash Flow = Ending Cash
        </Alert>
      ) : (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<ErrorIcon />}>
          Cash flow statement is not balanced. Difference: {formatCurrency(
            Math.abs(cashFlowStatement.endingCash - 
              (cashFlowStatement.beginningCash + cashFlowStatement.netCashFlow))
          )}
        </Alert>
      )}

      {/* Operating Activities */}
      {renderSection(
        'Operating Activities',
        operatingActivities.totalOperatingInflows,
        operatingActivities.outflowItems,
        operatingActivities.totalOperatingOutflows,
        operatingActivities.netCashFromOperations,
        <AccountBalance color="primary" />
      )}

      {/* Investing Activities */}
      {renderSection(
        'Investing Activities',
        investingActivities.totalInvestingInflows,
        investingActivities.outflowItems,
        investingActivities.totalInvestingOutflows,
        investingActivities.netCashFromInvesting,
        <TrendingUp color="secondary" />
      )}

      {/* Financing Activities */}
      {renderSection(
        'Financing Activities',
        financingActivities.totalFinancingInflows,
        financingActivities.outflowItems,
        financingActivities.totalFinancingOutflows,
        financingActivities.netCashFromFinancing,
        <TrendingDown color="warning" />
      )}

      {/* Summary */}
      <Paper elevation={2} sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>
          Summary
        </Typography>
        <Divider sx={{ mb: 2 }} />
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Beginning Cash
            </Typography>
            <Typography variant="h6">{formatCurrency(cashFlowStatement.beginningCash)}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="body2" color="text.secondary">
              Net Cash Flow
            </Typography>
            <Typography
              variant="h6"
              color={cashFlowStatement.netCashFlow >= 0 ? 'success.main' : 'error.main'}
            >
              {formatCurrency(cashFlowStatement.netCashFlow)}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={12}>
            <Typography variant="body2" color="text.secondary">
              Ending Cash
            </Typography>
            <Typography variant="h5" fontWeight="bold">
              {formatCurrency(cashFlowStatement.endingCash)}
            </Typography>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default CashFlowStatementTab;

