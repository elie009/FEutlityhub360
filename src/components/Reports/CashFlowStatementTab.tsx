import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
  Paper,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  AccountBalance,
  Refresh,
  PictureAsPdf,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { getApiBaseUrl } from '../../config/envLoader';
import { CashFlowStatementDto } from '../../types/financialReport';

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
  const [loading, setLoading] = useState(true);
  const [cashFlowStatement, setCashFlowStatement] = useState<CashFlowStatementDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const defaultStart = (() => {
    if (startDate) return startDate.toISOString().split('T')[0];
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
  })();
  const defaultEnd = (() => {
    if (endDate) return endDate.toISOString().split('T')[0];
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
  })();
  const [localStartDate, setLocalStartDate] = useState<string>(defaultStart);
  const [localEndDate, setLocalEndDate] = useState<string>(defaultEnd);
  const [localPeriod, setLocalPeriod] = useState<'MONTHLY' | 'QUARTERLY' | 'YEARLY'>(period);
  const [reportUrl, setReportUrl] = useState<string>('');
  const [showReport, setShowReport] = useState<boolean>(false);

  // Only fetch on initial mount
  useEffect(() => {
    fetchCashFlowStatement();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCashFlowStatement = async (): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      const start = localStartDate ? new Date(localStartDate) : undefined;
      const end = localEndDate ? new Date(localEndDate) : undefined;
      const data = await apiService.getCashFlowStatement(
        start?.toISOString(),
        end?.toISOString(),
        localPeriod
      );
      setCashFlowStatement(data);
      return true;
    } catch (err: any) {
      setError(err.message || 'Failed to load cash flow statement');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchCashFlowStatement();
    if (onRefresh) onRefresh();
  };

  const handleApplyAndViewReport = async () => {
    const ok = await fetchCashFlowStatement();
    if (ok) await viewRdlcReportWithDates(localStartDate, localEndDate);
    if (onRefresh) onRefresh();
  };

  const viewRdlcReportWithDates = async (startDateStr: string, endDateStr: string) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        return;
      }
      if (!startDateStr || !endDateStr) {
        setError('Please set Start Date and End Date before viewing the RDLC report.');
        return;
      }
      const baseUrl = getApiBaseUrl();
      const params = new URLSearchParams({
        startDate: startDateStr,
        endDate: endDateStr,
        format: 'PDF',
      });
      const url = `${baseUrl}/Reports/cash-flow/rdlc?${params.toString()}`;
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/pdf',
        },
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
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to generate PDF report');
    }
  };

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

  return (
    <Box>
      {/* Date Filter Section */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box display="flex" alignItems="center" gap={2}>
            <AccountBalance color="primary" />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Cash Flow Statement
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Period: {new Date(localStartDate).toLocaleDateString()} – {new Date(localEndDate).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1} alignItems="center" flexWrap="wrap">
            <TextField
              label="Start Date"
              type="date"
              value={localStartDate}
              onChange={(e) => setLocalStartDate(e.target.value)}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ minWidth: 150 }}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              to
            </Typography>
            <TextField
              label="End Date"
              type="date"
              value={localEndDate}
              onChange={(e) => setLocalEndDate(e.target.value)}
              size="small"
              InputLabelProps={{
                shrink: true,
              }}
              sx={{ minWidth: 150 }}
            />
            <FormControl sx={{ minWidth: 150 }} size="small">
              <InputLabel>Period</InputLabel>
              <Select
                value={localPeriod}
                label="Period"
                onChange={(e) => setLocalPeriod(e.target.value as any)}
              >
                <MenuItem value="MONTHLY">Monthly</MenuItem>
                <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                <MenuItem value="YEARLY">Yearly</MenuItem>
              </Select>
            </FormControl>
            <Tooltip title="Apply date range and view PDF report">
              <Button
                variant="contained"
                color="primary"
                startIcon={<PictureAsPdf />}
                onClick={handleApplyAndViewReport}
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
        <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Cash Flow Statement Report (PDF)</Typography>
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
          <Box sx={{ width: '100%', height: '800px', border: '1px solid', borderColor: 'divider' }}>
            <iframe
              src={reportUrl}
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              title="Cash Flow Statement Report"
            />
          </Box>
        </Paper>
      )}

    </Box>
  );
};

export default CashFlowStatementTab;

