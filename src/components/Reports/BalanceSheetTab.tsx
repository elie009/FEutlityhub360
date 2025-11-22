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
  Divider,
  useTheme,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccountBalance,
  CheckCircle,
  Error as ErrorIcon,
  Refresh,
} from '@mui/icons-material';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiService } from '../../services/api';
import { BalanceSheetDto, BalanceSheetItemDto } from '../../types/financialReport';

interface BalanceSheetTabProps {
  asOfDate?: Date;
  onRefresh?: () => void;
}

const BalanceSheetTab: React.FC<BalanceSheetTabProps> = ({ asOfDate, onRefresh }) => {
  const { formatCurrency } = useCurrency();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(asOfDate || new Date());

  useEffect(() => {
    fetchBalanceSheet();
  }, [currentDate]);

  const fetchBalanceSheet = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getBalanceSheet(currentDate.toISOString());
      setBalanceSheet(data);
      if (onRefresh) onRefresh();
    } catch (err: any) {
      setError(err.message || 'Failed to load balance sheet');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchBalanceSheet();
  };

  const renderBalanceSheetItem = (item: BalanceSheetItemDto, index: number) => (
    <TableRow key={index} hover>
      <TableCell>
        <Typography variant="body2">{item.accountName}</Typography>
        {item.description && (
          <Typography variant="caption" color="text.secondary">
            {item.description}
          </Typography>
        )}
      </TableCell>
      <TableCell align="right">
        <Typography variant="body2" fontWeight="medium">
          {formatCurrency(item.amount)}
        </Typography>
      </TableCell>
    </TableRow>
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
      <Box p={3}>
        <Alert 
          severity="error" 
          action={
            <IconButton color="inherit" size="small" onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          }
        >
          {error}
        </Alert>
      </Box>
    );
  }

  if (!balanceSheet) {
    return (
      <Box p={3}>
        <Alert severity="info">No balance sheet data available</Alert>
      </Box>
    );
  }

  return (
    <Box>
      {/* Balance Validation Alert */}
      {balanceSheet.isBalanced ? (
        <Alert 
          severity="success" 
          icon={<CheckCircle />}
          sx={{ mb: 3 }}
        >
          Balance sheet is balanced: Assets = Liabilities + Equity
        </Alert>
      ) : (
        <Alert 
          severity="warning" 
          icon={<ErrorIcon />}
          sx={{ mb: 3 }}
        >
          Balance sheet is not balanced. Difference: {formatCurrency(
            Math.abs(balanceSheet.totalAssets - balanceSheet.totalLiabilitiesAndEquity)
          )}
        </Alert>
      )}

      {/* Balance Sheet Content */}
      <Grid container spacing={3}>
        {/* ASSETS SECTION */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalance color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  ASSETS
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {/* Current Assets */}
              {balanceSheet.assets.currentAssets.length > 0 && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1} mt={2}>
                    Current Assets
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {balanceSheet.assets.currentAssets.map((item, index) =>
                          renderBalanceSheetItem(item, index)
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box display="flex" justifyContent="space-between" mt={1} mb={2} px={1}>
                    <Typography variant="body2" fontWeight="bold">
                      Total Current Assets:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(balanceSheet.assets.totalCurrentAssets)}
                    </Typography>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Fixed Assets */}
              {balanceSheet.assets.fixedAssets.length > 0 && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1} mt={2}>
                    Fixed Assets
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {balanceSheet.assets.fixedAssets.map((item, index) =>
                          renderBalanceSheetItem(item, index)
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box display="flex" justifyContent="space-between" mt={1} mb={2} px={1}>
                    <Typography variant="body2" fontWeight="bold">
                      Total Fixed Assets:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(balanceSheet.assets.totalFixedAssets)}
                    </Typography>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Other Assets */}
              {balanceSheet.assets.otherAssets.length > 0 && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1} mt={2}>
                    Other Assets
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {balanceSheet.assets.otherAssets.map((item, index) =>
                          renderBalanceSheetItem(item, index)
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box display="flex" justifyContent="space-between" mt={1} mb={2} px={1}>
                    <Typography variant="body2" fontWeight="bold">
                      Total Other Assets:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(balanceSheet.assets.totalOtherAssets)}
                    </Typography>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Total Assets */}
              <Box
                display="flex"
                justifyContent="space-between"
                mt={3}
                p={2}
                sx={{
                  backgroundColor: theme.palette.primary.light,
                  borderRadius: 1,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  TOTAL ASSETS
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(balanceSheet.totalAssets)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* LIABILITIES & EQUITY SECTION */}
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <AccountBalance color="error" sx={{ mr: 1 }} />
                <Typography variant="h5" fontWeight="bold">
                  LIABILITIES & EQUITY
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {/* Current Liabilities */}
              {balanceSheet.liabilities.currentLiabilities.length > 0 && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1} mt={2}>
                    Current Liabilities
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {balanceSheet.liabilities.currentLiabilities.map((item, index) =>
                          renderBalanceSheetItem(item, index)
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box display="flex" justifyContent="space-between" mt={1} mb={2} px={1}>
                    <Typography variant="body2" fontWeight="bold">
                      Total Current Liabilities:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(balanceSheet.liabilities.totalCurrentLiabilities)}
                    </Typography>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Long-term Liabilities */}
              {balanceSheet.liabilities.longTermLiabilities.length > 0 && (
                <>
                  <Typography variant="subtitle1" fontWeight="bold" mb={1} mt={2}>
                    Long-term Liabilities
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableBody>
                        {balanceSheet.liabilities.longTermLiabilities.map((item, index) =>
                          renderBalanceSheetItem(item, index)
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                  <Box display="flex" justifyContent="space-between" mt={1} mb={2} px={1}>
                    <Typography variant="body2" fontWeight="bold">
                      Total Long-term Liabilities:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(balanceSheet.liabilities.totalLongTermLiabilities)}
                    </Typography>
                  </Box>
                  <Divider />
                </>
              )}

              {/* Total Liabilities */}
              <Box display="flex" justifyContent="space-between" mt={2} mb={2} px={1}>
                <Typography variant="subtitle1" fontWeight="bold">
                  TOTAL LIABILITIES:
                </Typography>
                <Typography variant="subtitle1" fontWeight="bold">
                  {formatCurrency(balanceSheet.liabilities.totalLiabilities)}
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />

              {/* Equity Section */}
              <Typography variant="subtitle1" fontWeight="bold" mb={1} mt={2}>
                Equity
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableBody>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2">Owner's Capital</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(balanceSheet.equity.ownersCapital)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>
                        <Typography variant="body2">Retained Earnings</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(balanceSheet.equity.retainedEarnings)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
              <Box display="flex" justifyContent="space-between" mt={1} mb={2} px={1}>
                <Typography variant="body2" fontWeight="bold">
                  Total Equity:
                </Typography>
                <Typography variant="body2" fontWeight="bold">
                  {formatCurrency(balanceSheet.equity.totalEquity)}
                </Typography>
              </Box>
              <Divider />

              {/* Total Liabilities & Equity */}
              <Box
                display="flex"
                justifyContent="space-between"
                mt={3}
                p={2}
                sx={{
                  backgroundColor: theme.palette.secondary.light,
                  borderRadius: 1,
                }}
              >
                <Typography variant="h6" fontWeight="bold">
                  TOTAL LIABILITIES & EQUITY
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(balanceSheet.totalLiabilitiesAndEquity)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Summary Footer */}
      <Box mt={3}>
        <Card elevation={1}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Assets
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {formatCurrency(balanceSheet.totalAssets)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Liabilities
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="error">
                  {formatCurrency(balanceSheet.liabilities.totalLiabilities)}
                </Typography>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography variant="body2" color="text.secondary">
                  Total Equity
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="success.main">
                  {formatCurrency(balanceSheet.equity.totalEquity)}
                </Typography>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default BalanceSheetTab;

