import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Checkbox,
  FormControlLabel,
  Paper,
  Alert,
  CircularProgress,
  Divider,
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import {
  Settings,
  Save,
  Delete,
  Refresh,
  Download,
  Add,
  FileDownload,
} from '@mui/icons-material';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiService } from '../../services/api';

const CustomReportTab: React.FC = () => {
  const { formatCurrency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [saveTemplateDialog, setSaveTemplateDialog] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  // Report configuration
  const [reportConfig, setReportConfig] = useState({
    reportName: 'Custom Report',
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    includeIncome: true,
    includeExpenses: true,
    includeBills: true,
    includeLoans: true,
    includeSavings: true,
    includeNetWorth: true,
    includeBalanceSheet: false,
    includeIncomeStatement: false,
    includeCashFlowStatement: false,
    includeBudgetVsActual: false,
    includeTaxReport: false,
    includeComparison: false,
    comparisonStartDate: '',
    comparisonEndDate: '',
    groupBy: 'NONE',
    currencyFormat: 'USD',
    dateFormat: 'MM/DD/YYYY',
  });

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await apiService.getCustomReportTemplates();
      setTemplates(data);
    } catch (err: any) {
      console.error('Failed to load templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setGenerating(true);
      setError(null);

      const request = {
        reportName: reportConfig.reportName,
        startDate: reportConfig.startDate,
        endDate: reportConfig.endDate,
        includeIncome: reportConfig.includeIncome,
        includeExpenses: reportConfig.includeExpenses,
        includeBills: reportConfig.includeBills,
        includeLoans: reportConfig.includeLoans,
        includeSavings: reportConfig.includeSavings,
        includeNetWorth: reportConfig.includeNetWorth,
        includeBalanceSheet: reportConfig.includeBalanceSheet,
        includeIncomeStatement: reportConfig.includeIncomeStatement,
        includeCashFlowStatement: reportConfig.includeCashFlowStatement,
        includeBudgetVsActual: reportConfig.includeBudgetVsActual,
        includeTaxReport: reportConfig.includeTaxReport,
        includeComparison: reportConfig.includeComparison,
        comparisonStartDate: reportConfig.comparisonStartDate || undefined,
        comparisonEndDate: reportConfig.comparisonEndDate || undefined,
        groupBy: reportConfig.groupBy,
        currencyFormat: reportConfig.currencyFormat,
        dateFormat: reportConfig.dateFormat,
      };

      const data = await apiService.generateCustomReport(request);
      setReportData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      await apiService.saveCustomReportTemplate({
        templateName,
        description: templateDescription,
        reportConfig,
      });
      setSaveTemplateDialog(false);
      setTemplateName('');
      setTemplateDescription('');
      await loadTemplates();
    } catch (err: any) {
      setError(err.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadTemplate = async (template: any) => {
    try {
      setLoading(true);
      const templateData = await apiService.getCustomReportTemplate(template.templateId);
      setReportConfig({
        ...reportConfig,
        ...templateData.reportConfig,
      });
    } catch (err: any) {
      setError(err.message || 'Failed to load template');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) return;

    try {
      setLoading(true);
      await apiService.deleteCustomReportTemplate(templateId);
      await loadTemplates();
    } catch (err: any) {
      setError(err.message || 'Failed to delete template');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'PDF' | 'CSV' | 'EXCEL') => {
    try {
      const blob = await apiService.exportReport(
        format,
        'CUSTOM',
        reportConfig.startDate,
        reportConfig.endDate
      );

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Custom_Report_${new Date().toISOString().split('T')[0]}.${format.toLowerCase()}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message || `Failed to export ${format}`);
    }
  };

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Configuration Panel */}
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6">Report Configuration</Typography>
                <Tooltip title="Save as Template">
                  <IconButton size="small" onClick={() => setSaveTemplateDialog(true)}>
                    <Save />
                  </IconButton>
                </Tooltip>
              </Box>
              <Divider sx={{ mb: 2 }} />

              <TextField
                fullWidth
                label="Report Name"
                value={reportConfig.reportName}
                onChange={(e) => setReportConfig({ ...reportConfig, reportName: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={reportConfig.startDate}
                onChange={(e) => setReportConfig({ ...reportConfig, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={reportConfig.endDate}
                onChange={(e) => setReportConfig({ ...reportConfig, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                sx={{ mb: 2 }}
              />

              <Divider sx={{ my: 2 }} />
              <Typography variant="subtitle2" gutterBottom>
                Include Sections
              </Typography>

              {[
                { key: 'includeIncome', label: 'Income' },
                { key: 'includeExpenses', label: 'Expenses' },
                { key: 'includeBills', label: 'Bills' },
                { key: 'includeLoans', label: 'Loans' },
                { key: 'includeSavings', label: 'Savings' },
                { key: 'includeNetWorth', label: 'Net Worth' },
                { key: 'includeBalanceSheet', label: 'Balance Sheet' },
                { key: 'includeIncomeStatement', label: 'Income Statement' },
                { key: 'includeCashFlowStatement', label: 'Cash Flow Statement' },
                { key: 'includeBudgetVsActual', label: 'Budget vs Actual' },
                { key: 'includeTaxReport', label: 'Tax Report' },
              ].map((section) => (
                <FormControlLabel
                  key={section.key}
                  control={
                    <Checkbox
                      checked={reportConfig[section.key as keyof typeof reportConfig] as boolean}
                      onChange={(e) =>
                        setReportConfig({
                          ...reportConfig,
                          [section.key]: e.target.checked,
                        })
                      }
                    />
                  }
                  label={section.label}
                  sx={{ display: 'block', mb: 0.5 }}
                />
              ))}

              <Divider sx={{ my: 2 }} />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={reportConfig.includeComparison}
                    onChange={(e) =>
                      setReportConfig({ ...reportConfig, includeComparison: e.target.checked })
                    }
                  />
                }
                label="Include Comparison"
              />

              {reportConfig.includeComparison && (
                <>
                  <TextField
                    fullWidth
                    label="Comparison Start Date"
                    type="date"
                    value={reportConfig.comparisonStartDate}
                    onChange={(e) =>
                      setReportConfig({ ...reportConfig, comparisonStartDate: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                    sx={{ mt: 2, mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Comparison End Date"
                    type="date"
                    value={reportConfig.comparisonEndDate}
                    onChange={(e) =>
                      setReportConfig({ ...reportConfig, comparisonEndDate: e.target.value })
                    }
                    InputLabelProps={{ shrink: true }}
                    sx={{ mb: 2 }}
                  />
                </>
              )}

              <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
                <InputLabel>Group By</InputLabel>
                <Select
                  value={reportConfig.groupBy}
                  label="Group By"
                  onChange={(e) => setReportConfig({ ...reportConfig, groupBy: e.target.value })}
                >
                  <MenuItem value="NONE">None</MenuItem>
                  <MenuItem value="CATEGORY">Category</MenuItem>
                  <MenuItem value="ACCOUNT">Account</MenuItem>
                  <MenuItem value="MONTH">Month</MenuItem>
                  <MenuItem value="QUARTER">Quarter</MenuItem>
                  <MenuItem value="YEAR">Year</MenuItem>
                </Select>
              </FormControl>

              <Button
                fullWidth
                variant="contained"
                onClick={handleGenerateReport}
                disabled={generating}
                startIcon={generating ? <CircularProgress size={20} /> : <Refresh />}
                sx={{ mt: 2 }}
              >
                {generating ? 'Generating...' : 'Generate Report'}
              </Button>
            </CardContent>
          </Card>

          {/* Templates Section */}
          <Card elevation={2} sx={{ mt: 2 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Saved Templates
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {templates.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No templates saved
                </Typography>
              ) : (
                <List>
                  {templates.map((template) => (
                    <ListItem key={template.templateId}>
                      <ListItemText
                        primary={template.templateName}
                        secondary={template.description}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => handleLoadTemplate(template)}
                          size="small"
                        >
                          <Refresh />
                        </IconButton>
                        <IconButton
                          edge="end"
                          onClick={() => handleDeleteTemplate(template.templateId)}
                          size="small"
                        >
                          <Delete />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Report Results */}
        <Grid item xs={12} md={8}>
          {reportData ? (
            <Card elevation={3}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Box>
                    <Typography variant="h5">{reportData.reportName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Generated: {new Date(reportData.generatedAt).toLocaleString()}
                    </Typography>
                  </Box>
                  <Box>
                    <Tooltip title="Export PDF">
                      <IconButton onClick={() => handleExport('PDF')} color="primary">
                        <FileDownload />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export CSV">
                      <IconButton onClick={() => handleExport('CSV')} color="primary">
                        <FileDownload />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Export Excel">
                      <IconButton onClick={() => handleExport('EXCEL')} color="primary">
                        <FileDownload />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </Box>
                <Divider sx={{ mb: 2 }} />

                {/* Summary */}
                {reportData.summary && (
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Summary
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Total Income
                        </Typography>
                        <Typography variant="h6" color="success.main">
                          {formatCurrency(reportData.summary.totalIncome)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Total Expenses
                        </Typography>
                        <Typography variant="h6" color="error.main">
                          {formatCurrency(reportData.summary.totalExpenses)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Net Income
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(reportData.summary.netIncome)}
                        </Typography>
                      </Grid>
                      <Grid item xs={6} md={3}>
                        <Typography variant="body2" color="text.secondary">
                          Net Worth
                        </Typography>
                        <Typography variant="h6">
                          {formatCurrency(reportData.summary.netWorth)}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                )}

                {/* Report Sections */}
                <Typography variant="body2" color="text.secondary">
                  Report data is available. Use the export buttons to download the full report.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card elevation={2}>
              <CardContent>
                <Box textAlign="center" py={4}>
                  <Settings sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    No Report Generated
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Configure your report settings and click "Generate Report" to create a custom
                    report.
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Save Template Dialog */}
      <Dialog open={saveTemplateDialog} onClose={() => setSaveTemplateDialog(false)}>
        <DialogTitle>Save Report Template</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Description"
            value={templateDescription}
            onChange={(e) => setTemplateDescription(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveTemplateDialog(false)}>Cancel</Button>
          <Button onClick={handleSaveTemplate} variant="contained" disabled={!templateName}>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomReportTab;
