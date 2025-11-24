import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Divider,
  useTheme,
  InputAdornment,
} from '@mui/material';
import {
  Search,
  FilterList,
  Refresh,
  Download,
  Visibility,
  Security,
  Event,
  Assessment,
  Clear,
} from '@mui/icons-material';
import { useCurrency } from '../contexts/CurrencyContext';
import { apiService } from '../services/api';
import { AuditLog, AuditLogQuery, AuditLogSummary } from '../types/auditLog';

const AuditLogs: React.FC = () => {
  const { formatCurrency } = useCurrency();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [summary, setSummary] = useState<AuditLogSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Pagination
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(50);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filters, setFilters] = useState<AuditLogQuery>({
    page: 1,
    pageSize: 50,
    sortBy: 'CreatedAt',
    sortOrder: 'DESC',
  });

  useEffect(() => {
    fetchAuditLogs();
    fetchSummary();
  }, [page, pageSize, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      setError(null);
      const query = {
        ...filters,
        page: page + 1,
        pageSize,
      };
      const data = await apiService.getAuditLogs(query);
      setLogs(data.logs || []);
      setTotalCount(data.totalCount || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const data = await apiService.getAuditLogSummary(filters.startDate, filters.endDate);
      setSummary(data);
    } catch (err: any) {
      console.error('Failed to load summary:', err);
    }
  };

  const handleFilterChange = (key: keyof AuditLogQuery, value: any) => {
    setFilters({ ...filters, [key]: value });
    setPage(0); // Reset to first page when filter changes
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      pageSize: 50,
      sortBy: 'CreatedAt',
      sortOrder: 'DESC',
    });
    setPage(0);
  };

  const handleExport = async (format: 'CSV' | 'PDF') => {
    try {
      const blob = format === 'CSV'
        ? await apiService.exportAuditLogsToCsv(filters)
        : await apiService.exportAuditLogsToPdf(filters);

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Audit_Logs_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || `Failed to export ${format}`);
    }
  };

  const getLogTypeIcon = (logType: string) => {
    switch (logType) {
      case 'USER_ACTIVITY':
        return <Event color="primary" />;
      case 'SYSTEM_EVENT':
        return <Assessment color="info" />;
      case 'SECURITY_EVENT':
        return <Security color="warning" />;
      case 'COMPLIANCE_EVENT':
        return <Security color="error" />;
      default:
        return <Event />;
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'error';
      case 'ERROR':
        return 'error';
      case 'WARNING':
        return 'warning';
      case 'INFO':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading && logs.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Audit Logs
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Comprehensive audit trail of all user activities, system events, and compliance events
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Total Logs
                </Typography>
                <Typography variant="h4">{summary.totalLogs}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  User Activities
                </Typography>
                <Typography variant="h4" color="primary">
                  {summary.userActivityLogs}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Security Events
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {summary.securityEventLogs}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Compliance Events
                </Typography>
                <Typography variant="h4" color="error.main">
                  {summary.complianceEventLogs}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Typography variant="h6">Filters</Typography>
          <Box>
            <Tooltip title="Export CSV">
              <IconButton onClick={() => handleExport('CSV')} color="primary">
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export PDF">
              <IconButton onClick={() => handleExport('PDF')} color="primary">
                <Download />
              </IconButton>
            </Tooltip>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchAuditLogs}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Clear Filters">
              <IconButton onClick={handleClearFilters}>
                <Clear />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Search"
              value={filters.searchTerm || ''}
              onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Action</InputLabel>
              <Select
                value={filters.action || ''}
                label="Action"
                onChange={(e) => handleFilterChange('action', e.target.value || undefined)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="CREATE">Create</MenuItem>
                <MenuItem value="UPDATE">Update</MenuItem>
                <MenuItem value="DELETE">Delete</MenuItem>
                <MenuItem value="VIEW">View</MenuItem>
                <MenuItem value="LOGIN">Login</MenuItem>
                <MenuItem value="LOGOUT">Logout</MenuItem>
                <MenuItem value="EXPORT">Export</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Entity Type</InputLabel>
              <Select
                value={filters.entityType || ''}
                label="Entity Type"
                onChange={(e) => handleFilterChange('entityType', e.target.value || undefined)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="LOAN">Loan</MenuItem>
                <MenuItem value="BILL">Bill</MenuItem>
                <MenuItem value="TRANSACTION">Transaction</MenuItem>
                <MenuItem value="USER">User</MenuItem>
                <MenuItem value="BANK_ACCOUNT">Bank Account</MenuItem>
                <MenuItem value="EXPENSE">Expense</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Log Type</InputLabel>
              <Select
                value={filters.logType || ''}
                label="Log Type"
                onChange={(e) => handleFilterChange('logType', e.target.value || undefined)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="USER_ACTIVITY">User Activity</MenuItem>
                <MenuItem value="SYSTEM_EVENT">System Event</MenuItem>
                <MenuItem value="SECURITY_EVENT">Security Event</MenuItem>
                <MenuItem value="COMPLIANCE_EVENT">Compliance Event</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Severity</InputLabel>
              <Select
                value={filters.severity || ''}
                label="Severity"
                onChange={(e) => handleFilterChange('severity', e.target.value || undefined)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="INFO">Info</MenuItem>
                <MenuItem value="WARNING">Warning</MenuItem>
                <MenuItem value="ERROR">Error</MenuItem>
                <MenuItem value="CRITICAL">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <FormControl fullWidth>
              <InputLabel>Compliance</InputLabel>
              <Select
                value={filters.complianceType || ''}
                label="Compliance"
                onChange={(e) => handleFilterChange('complianceType', e.target.value || undefined)}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="SOX">SOX</MenuItem>
                <MenuItem value="GDPR">GDPR</MenuItem>
                <MenuItem value="HIPAA">HIPAA</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Logs Table */}
      <Paper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date/Time</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Entity</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Severity</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} hover>
                  <TableCell>
                    {new Date(log.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {log.userEmail || log.userId}
                  </TableCell>
                  <TableCell>
                    <Chip label={log.action} size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Box>
                      <Typography variant="body2">{log.entityType}</Typography>
                      {log.entityName && (
                        <Typography variant="caption" color="text.secondary">
                          {log.entityName}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center" gap={1}>
                      {getLogTypeIcon(log.logType)}
                      <Typography variant="body2">{log.logType.replace('_', ' ')}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {log.severity && (
                      <Chip
                        label={log.severity}
                        size="small"
                        color={getSeverityColor(log.severity) as any}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" noWrap sx={{ maxWidth: 300 }}>
                      {log.description}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedLog(log);
                          setDetailDialogOpen(true);
                        }}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalCount}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[25, 50, 100]}
        />
      </Paper>

      {/* Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Audit Log Details</DialogTitle>
        <DialogContent>
          {selectedLog && (
            <Box>
              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Date/Time
                  </Typography>
                  <Typography variant="body1">
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    User
                  </Typography>
                  <Typography variant="body1">
                    {selectedLog.userEmail || selectedLog.userId}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Action
                  </Typography>
                  <Chip label={selectedLog.action} size="small" />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Entity Type
                  </Typography>
                  <Typography variant="body1">{selectedLog.entityType}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Entity ID
                  </Typography>
                  <Typography variant="body1">{selectedLog.entityId || 'N/A'}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Log Type
                  </Typography>
                  <Typography variant="body1">{selectedLog.logType}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Severity
                  </Typography>
                  {selectedLog.severity && (
                    <Chip
                      label={selectedLog.severity}
                      size="small"
                      color={getSeverityColor(selectedLog.severity) as any}
                    />
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Description
                  </Typography>
                  <Typography variant="body1">{selectedLog.description}</Typography>
                </Grid>
                {selectedLog.ipAddress && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      IP Address
                    </Typography>
                    <Typography variant="body1">{selectedLog.ipAddress}</Typography>
                  </Grid>
                )}
                {selectedLog.requestPath && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Request Path
                    </Typography>
                    <Typography variant="body1">{selectedLog.requestPath}</Typography>
                  </Grid>
                )}
                {selectedLog.complianceType && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Compliance Type
                    </Typography>
                    <Chip label={selectedLog.complianceType} size="small" color="error" />
                  </Grid>
                )}
                {selectedLog.oldValues && Object.keys(selectedLog.oldValues).length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Old Values
                    </Typography>
                    <Paper sx={{ p: 1, bgcolor: 'grey.100' }}>
                      <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                        {JSON.stringify(selectedLog.oldValues, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                )}
                {selectedLog.newValues && Object.keys(selectedLog.newValues).length > 0 && (
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      New Values
                    </Typography>
                    <Paper sx={{ p: 1, bgcolor: 'grey.100' }}>
                      <pre style={{ margin: 0, fontSize: '0.875rem' }}>
                        {JSON.stringify(selectedLog.newValues, null, 2)}
                      </pre>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AuditLogs;

