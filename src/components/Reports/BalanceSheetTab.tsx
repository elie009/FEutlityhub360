import React, { useState, useEffect, useCallback } from 'react';
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
  TextField,
  Button,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  AccountBalance,
  CheckCircle,
  Error as ErrorIcon,
  Refresh,
  PictureAsPdf,
} from '@mui/icons-material';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiService } from '../../services/api';
import { BalanceSheetDto, BalanceSheetItemDto } from '../../types/financialReport';
import { getApiBaseUrl } from '../../config/envLoader';

interface BalanceSheetTabProps {
  asOfDate?: Date;
  onRefresh?: () => void;
}

type PeriodType = 'ALL_DATES' | 'CUSTOM' | 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_QUARTER' | 'THIS_YEAR';

const BalanceSheetTab: React.FC<BalanceSheetTabProps> = ({ asOfDate, onRefresh }) => {
  const { formatCurrency } = useCurrency();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState<Date>(asOfDate || new Date());
  const [period, setPeriod] = useState<PeriodType>('THIS_MONTH');
  const [localStartDate, setLocalStartDate] = useState<string>('');
  const [localEndDate, setLocalEndDate] = useState<string>(
    asOfDate ? asOfDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [reportUrl, setReportUrl] = useState<string>('');
  const [showReport, setShowReport] = useState<boolean>(false);

  // Calculate date range based on period
  const calculateDateRange = useCallback((periodType: PeriodType) => {
    const today = new Date();
    let start: Date;
    let end: Date = today;

    switch (periodType) {
      case 'ALL_DATES':
        start = new Date(2000, 0, 1); // Far past date
        end = today;
        break;
      case 'TODAY':
        start = today;
        end = today;
        break;
      case 'THIS_WEEK':
        start = new Date(today);
        start.setDate(today.getDate() - today.getDay()); // Sunday
        end = new Date(start);
        end.setDate(start.getDate() + 6); // Saturday
        break;
      case 'THIS_MONTH':
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        // Cap end date to today if it's in the future
        if (end > today) end = today;
        break;
      case 'THIS_QUARTER':
        const quarter = Math.floor(today.getMonth() / 3);
        start = new Date(today.getFullYear(), quarter * 3, 1);
        end = new Date(today.getFullYear(), quarter * 3 + 3, 0);
        // Cap end date to today if it's in the future
        if (end > today) end = today;
        break;
      case 'THIS_YEAR':
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
        // Cap end date to today if it's in the future
        if (end > today) end = today;
        break;
      case 'CUSTOM':
      default:
        return null; // Don't auto-set dates for custom
    }

    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0]
    };
  }, []);

  // Handle period change
  const handlePeriodChange = (newPeriod: PeriodType) => {
    setPeriod(newPeriod);
    if (newPeriod !== 'CUSTOM') {
      const dates = calculateDateRange(newPeriod);
      if (dates) {
        setLocalStartDate(dates.startDate);
        setLocalEndDate(dates.endDate);
      }
    }
  };

  // Initialize dates based on default period and fetch once on mount
  useEffect(() => {
    const dates = calculateDateRange(period);
    if (dates) {
      setLocalStartDate(dates.startDate);
      setLocalEndDate(dates.endDate);
      // Fetch data once on mount with initial dates
      fetchBalanceSheetWithDates(dates.startDate, dates.endDate);
      // Auto-load RDLC report on mount
      setTimeout(() => {
        viewRdlcReportWithDates(dates.startDate, dates.endDate);
      }, 500); // Small delay to ensure dates are set
    }
  }, []); // Run once on mount

  const fetchBalanceSheetWithDates = async (startDate: string, endDate: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const start = startDate ? new Date(startDate) : undefined;
      const end = endDate ? new Date(endDate) : new Date();
      const data = await apiService.getBalanceSheet(
        end.toISOString(),
        start?.toISOString(),
        end.toISOString()
      );
      setBalanceSheet(data);
      setCurrentDate(end);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to load balance sheet');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchBalanceSheetWithDates(localStartDate, localEndDate);
    if (onRefresh) onRefresh();
  };

  const handleApplyAndViewReport = async () => {
    const ok = await fetchBalanceSheetWithDates(localStartDate, localEndDate);
    if (ok) await viewRdlcReportWithDates(localStartDate, localEndDate);
    if (onRefresh) onRefresh();
  };

  // Get today's date in YYYY-MM-DD format for max date attribute
  const getTodayDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  const viewRdlcReportWithDates = async (startDate: string, endDate: string) => {
    try {
      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      // Use endDate but cap it to today if it's in the future
      const today = new Date().toISOString().split('T')[0];
      const endDateToUse = endDate || today;
      const asOfDateStr = endDateToUse > today ? today : endDateToUse;
      const baseUrl = getApiBaseUrl();
      
      // Build query parameters
      const params = new URLSearchParams({
        asOfDate: asOfDateStr,
        format: 'PDF'
      });
      
      if (startDate) {
        params.append('startDate', startDate);
      }
      if (endDate) {
        params.append('endDate', endDate);
      }

      const url = `${baseUrl}/Reports/balance-sheet/rdlc?${params.toString()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/pdf'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Session expired. Please log in again.');
          return;
        }
        const errorData = await response.json().catch(() => ({ message: 'Failed to load report' }));
        throw new Error(errorData.message || 'Failed to load report');
      }

      const blob = await response.blob();
      const pdfUrl = window.URL.createObjectURL(blob);
      setReportUrl(pdfUrl);
      setShowReport(true);
    } catch (err: any) {
      setError(err.message || 'Failed to generate PDF report');
    }
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

  return (
    <Box>
      {/* Date Filter Section */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <AccountBalance color="primary" />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Balance Sheet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {localStartDate && localEndDate && period !== 'TODAY'
                  ? `${new Date(localStartDate).toLocaleDateString()} - ${new Date(localEndDate).toLocaleDateString()}`
                  : `As of ${currentDate.toLocaleDateString()}`
                }
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Period</InputLabel>
              <Select
                value={period}
                label="Period"
                onChange={(e) => handlePeriodChange(e.target.value as PeriodType)}
              >
                <MenuItem value="ALL_DATES">All Dates</MenuItem>
                <MenuItem value="CUSTOM">Custom</MenuItem>
                <MenuItem value="TODAY">Today</MenuItem>
                <MenuItem value="THIS_WEEK">This Week</MenuItem>
                <MenuItem value="THIS_MONTH">This Month</MenuItem>
                <MenuItem value="THIS_QUARTER">This Quarter</MenuItem>
                <MenuItem value="THIS_YEAR">This Year</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Start Date"
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                max: getTodayDate(),
              }}
              sx={{ minWidth: 150 }}
              disabled={period !== 'CUSTOM'}
            />
            <TextField
              label="End Date"
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              inputProps={{
                max: getTodayDate(),
              }}
              sx={{ minWidth: 150 }}
              disabled={period !== 'CUSTOM'}
            />
            <Tooltip title="Apply date range and view PDF report">
              <Button
                variant="contained"
                color="primary"
                startIcon={<PictureAsPdf />}
                onClick={handleApplyAndViewReport}
                size="small"
                disabled={!localEndDate}
              >
                View Report
              </Button>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={handleRefresh} size="small">
                <Refresh />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {!loading && error && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <IconButton color="inherit" size="small" onClick={handleRefresh}>
              <Refresh />
            </IconButton>
          }
        >
          {error}
        </Alert>
      )}

      {/* No Data State */}
      {!loading && !error && !balanceSheet && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No balance sheet data available
        </Alert>
      )}

      {/* RDLC Report Viewer */}
      {!loading && showReport && reportUrl && (
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Balance Sheet Report (PDF)</Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                setShowReport(false);
                window.URL.revokeObjectURL(reportUrl);
                setReportUrl('');
              }}
            >
              Close Report
            </Button>
          </Box>
          <Box sx={{ width: '100%', height: '800px', border: '1px solid #ddd' }}>
            <iframe
              src={reportUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Balance Sheet Report"
            />
          </Box>
        </Paper>
      )}

      {/* Balance Validation Alert */}
      {!loading && !error && balanceSheet && (
        <>
          {balanceSheet.isBalanced ? (
            <Alert 
              severity="success" 
              icon={<CheckCircle />}
              sx={{ mb: 3 }}
            >
              Balance sheet is balanced: Assets = Liabilities + Net Worth
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
        </>
      )}

      
    </Box>
  );
};

export default BalanceSheetTab;

