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
  Chip,
  Paper,
  TextField,
  Button,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Assessment,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  Refresh,
  Download,
  PictureAsPdf,
} from '@mui/icons-material';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiService } from '../../services/api';
import { IncomeStatementDto, IncomeStatementItemDto } from '../../types/financialReport';
import { getApiBaseUrl } from '../../config/environment';

interface IncomeStatementTabProps {
  startDate?: Date;
  endDate?: Date;
  period?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
  onRefresh?: () => void;
}

const IncomeStatementTab: React.FC<IncomeStatementTabProps> = ({ 
  startDate, 
  endDate, 
  period = 'YEARLY',
  onRefresh 
}) => {
  const { formatCurrency } = useCurrency();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [incomeStatement, setIncomeStatement] = useState<IncomeStatementDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [includeComparison, setIncludeComparison] = useState(false);
  const [localStartDate, setLocalStartDate] = useState<string>(startDate ? startDate.toISOString().split('T')[0] : '');
  const [localEndDate, setLocalEndDate] = useState<string>(endDate ? endDate.toISOString().split('T')[0] : '');
  const [localPeriod, setLocalPeriod] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM'>(period);
  const [reportUrl, setReportUrl] = useState<string | null>(null);
  const [showReport, setShowReport] = useState(false);

  // Only fetch on initial mount
  useEffect(() => {
    fetchIncomeStatement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchIncomeStatement = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('[IncomeStatementTab] Making API call with:', {
        startDate: localStartDate,
        endDate: localEndDate,
        period: localPeriod,
        includeComparison
      });

      const data = await apiService.getIncomeStatement(
        localStartDate || undefined,
        localEndDate || undefined,
        localPeriod,
        includeComparison
      );
      setIncomeStatement(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load income statement');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchIncomeStatement();
  };

  const applyAndViewReport = async () => {
    try {
      if (!localStartDate || !localEndDate) {
        setError('Please select a date range first');
        return;
      }

      setLoading(true);
      setError(null);

      // First, fetch the income statement data
      console.log('[IncomeStatementTab] Making API call with:', {
        startDate: localStartDate,
        endDate: localEndDate,
        period: localPeriod,
        includeComparison
      });

      const data = await apiService.getIncomeStatement(
        localStartDate || undefined,
        localEndDate || undefined,
        localPeriod,
        includeComparison
      );
      setIncomeStatement(data);

      // Get auth token
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      // Build URL with query parameters
      const baseUrl = getApiBaseUrl();
      const url = `${baseUrl}/Reports/income-statement/rdlc?startDate=${localStartDate}&endDate=${localEndDate}&format=PDF`;

      // Fetch the report
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate report' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      // Get the blob from response
      const blob = await response.blob();
      
      // Clean up old URL if exists
      if (reportUrl) {
        window.URL.revokeObjectURL(reportUrl);
      }
      
      // Create blob URL for viewing
      const pdfUrl = window.URL.createObjectURL(blob);
      setReportUrl(pdfUrl);
      setShowReport(true);
      setError(null);
    } catch (error: any) {
      console.error('Error applying and viewing report:', error);
      setError(error.message || 'Failed to apply and view report');
    } finally {
      setLoading(false);
    }
  };

  const downloadCurrentReport = () => {
    if (!reportUrl) return;
    
    const a = document.createElement('a');
    a.href = reportUrl;
    a.download = `IncomeStatement_${localStartDate}_${localEndDate}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const closeReport = () => {
    if (reportUrl) {
      window.URL.revokeObjectURL(reportUrl);
    }
    setReportUrl(null);
    setShowReport(false);
  };

  const renderItem = (item: IncomeStatementItemDto, index: number) => (
    <TableRow key={index} hover>
      <TableCell>{item.accountName}</TableCell>
      <TableCell>
        <Chip label={item.category} size="small" variant="outlined" />
      </TableCell>
      <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
      {item.description && (
        <TableCell>{item.description}</TableCell>
      )}
    </TableRow>
  );

  const renderSection = (
    title: string,
    items: IncomeStatementItemDto[],
    total: number,
    color: string
  ) => (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" sx={{ mb: 2, color }}>
          {title}
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {items.length > 0 ? (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Account</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  {items.some(i => i.description) && <TableCell>Description</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item, index) => renderItem(item, index))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
            No items in this section
          </Typography>
        )}
        
        <Divider sx={{ my: 2 }} />
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight="bold">
            Total {title}
          </Typography>
          <Typography variant="h6" fontWeight="bold" color={color}>
            {formatCurrency(total)}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  // Display period: use startDate/endDate directly if CUSTOM period, otherwise use incomeStatement dates
  const getPeriodDisplay = () => {
    if (incomeStatement) {
      if (period === 'CUSTOM' && startDate && endDate) {
        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
      } else {
        return `${new Date(incomeStatement.periodStart).toLocaleDateString()} - ${new Date(incomeStatement.periodEnd).toLocaleDateString()}`;
      }
    }
    return localStartDate && localEndDate 
      ? `${new Date(localStartDate).toLocaleDateString()} - ${new Date(localEndDate).toLocaleDateString()}`
      : 'Select dates';
  };

  return (
    <Box>
      {/* Date Filter Section */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <Assessment color="primary" />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Income Statement
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Period: {getPeriodDisplay()}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
            {/* Date Range Pickers */}
            <TextField
              label="Start Date"
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <TextField
              label="End Date"
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 150 }}
            />
            <Tooltip title="Apply dates and view PDF report">
              <Button
                variant="contained"
                color="primary"
                startIcon={<PictureAsPdf />}
                onClick={applyAndViewReport}
                size="small"
                disabled={!localStartDate || !localEndDate}
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

      {/* RDLC Report Viewer */}
      {showReport && reportUrl && (
        <Paper elevation={3} sx={{ mb: 3 }}>
          <Box sx={{ p: 2, bgcolor: '#f5f5f5', borderBottom: '1px solid #ddd' }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <PictureAsPdf color="error" />
                <Typography variant="h6" fontWeight="bold">
                  Income Statement Report
                </Typography>
              </Box>
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<Download />}
                  onClick={downloadCurrentReport}
                >
                  Download
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={closeReport}
                >
                  Close
                </Button>
              </Box>
            </Box>
          </Box>
          <Box sx={{ width: '100%', height: '800px', bgcolor: 'white' }}>
            <iframe
              src={reportUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Income Statement Report"
            />
          </Box>
        </Paper>
      )}

      {/* Loading State */}
      {loading && (
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
          <CircularProgress />
        </Box>
      )}

      {/* Error State */}
      {!loading && error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* No Data State */}
      {!loading && !error && !incomeStatement && (
        <Alert severity="info">No income statement data available. Please select a date range and click Apply.</Alert>
      )}

   
    </Box>
  );
};

export default IncomeStatementTab;
