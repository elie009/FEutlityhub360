import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Tabs,
  Tab,
  Paper,
  Alert,
  CircularProgress,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  useTheme,
  IconButton,
  Tooltip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Receipt,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Warning,
  CheckCircle,
  Info,
  ExpandMore,
  Refresh,
  Download,
  AttachMoney,
  Business,
  Home,
  School,
  LocalHospital,
  Favorite,
  AccountBalance,
  Schedule,
} from '@mui/icons-material';
import { useCurrency } from '../contexts/CurrencyContext';
import { apiService } from '../services/api';
import { TaxReportDto } from '../types/financialReport';
import TaxReportTab from '../components/Reports/TaxReportTab';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface TaxOptimizationSuggestion {
  id: string;
  type: 'deduction' | 'credit' | 'strategy' | 'timing';
  title: string;
  description: string;
  potentialSavings: number;
  priority: 'high' | 'medium' | 'low';
  actionable: boolean;
  category?: string;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tax-optimization-tabpanel-${index}`}
      aria-labelledby={`tax-optimization-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

const TaxOptimization: React.FC = () => {
  const { formatCurrency } = useCurrency();
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [taxYear, setTaxYear] = useState(new Date().getFullYear());
  const [taxReport, setTaxReport] = useState<TaxReportDto | null>(null);
  const [suggestions, setSuggestions] = useState<TaxOptimizationSuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTaxData();
  }, [taxYear]);

  const fetchTaxData = async () => {
    try {
      setLoading(true);
      setError(null);
      const report = await apiService.getTaxReport(taxYear);
      setTaxReport(report);
      generateSuggestions(report);
    } catch (err: any) {
      setError(err.message || 'Failed to load tax data');
    } finally {
      setLoading(false);
    }
  };

  const generateSuggestions = (report: TaxReportDto): void => {
    const newSuggestions: TaxOptimizationSuggestion[] = [];

    // Analyze deductions
    const totalDeductions = report.deductions.totalDeductions;
    const totalIncome = report.incomeSummary.totalIncome;
    const deductionRatio = totalIncome > 0 ? (totalDeductions / totalIncome) * 100 : 0;

    // Suggestion 1: Increase business deductions
    if (report.deductions.businessExpenses < totalIncome * 0.1) {
      const potentialAdditional = totalIncome * 0.1 - report.deductions.businessExpenses;
      newSuggestions.push({
        id: '1',
        type: 'deduction',
        title: 'Consider Additional Business Deductions',
        description: `Your business expenses are ${deductionRatio.toFixed(1)}% of income. Consider tracking home office expenses, business meals, and professional development costs.`,
        potentialSavings: potentialAdditional * (report.taxCalculation.effectiveTaxRate / 100),
        priority: 'high',
        actionable: true,
        category: 'Business Expenses',
      });
    }

    // Suggestion 2: Maximize personal deductions
    const deductiblePersonal = report.deductions.personalDeductionItems.filter(d => d.isDeductible).length;
    if (deductiblePersonal < 3) {
      newSuggestions.push({
        id: '2',
        type: 'deduction',
        title: 'Track More Personal Deductions',
        description: 'Consider tracking charitable contributions, medical expenses, and education expenses that may be tax-deductible.',
        potentialSavings: 500, // Estimated
        priority: 'medium',
        actionable: true,
        category: 'Personal Deductions',
      });
    }

    // Suggestion 3: Tax bracket optimization
    if (report.taxCalculation.marginalTaxRate > 30) {
      newSuggestions.push({
        id: '3',
        type: 'strategy',
        title: 'Consider Income Deferral Strategy',
        description: `You're in the ${report.taxCalculation.marginalTaxRate.toFixed(0)}% tax bracket. Consider deferring some income to next year if possible to reduce your tax burden.`,
        potentialSavings: report.taxCalculation.taxableIncome * 0.05 * (report.taxCalculation.marginalTaxRate / 100),
        priority: 'medium',
        actionable: false,
      });
    }

    // Suggestion 4: Quarterly tax payments
    if (report.taxCalculation.estimatedTaxLiability > 1000) {
      newSuggestions.push({
        id: '4',
        type: 'timing',
        title: 'Make Quarterly Estimated Tax Payments',
        description: 'Consider making quarterly estimated tax payments to avoid penalties and better manage cash flow.',
        potentialSavings: report.taxCalculation.estimatedTaxLiability * 0.02, // Penalty savings
        priority: 'high',
        actionable: true,
      });
    }

    // Suggestion 5: Retirement contributions
    if (report.incomeSummary.salaryIncome > 0 && report.incomeSummary.salaryIncome < 200000) {
      newSuggestions.push({
        id: '5',
        type: 'deduction',
        title: 'Maximize Retirement Contributions',
        description: 'Consider maximizing contributions to retirement accounts (401k, IRA) which are tax-deductible and reduce taxable income.',
        potentialSavings: 2000 * (report.taxCalculation.effectiveTaxRate / 100),
        priority: 'high',
        actionable: true,
        category: 'Retirement',
      });
    }

    // Suggestion 6: Review expense categorization
    const uncategorizedDeductions = report.deductions.personalDeductionItems.filter(
      d => !d.isDeductible && (d.category.toLowerCase().includes('medical') || d.category.toLowerCase().includes('education'))
    );
    if (uncategorizedDeductions.length > 0) {
      const potentialAmount = uncategorizedDeductions.reduce((sum, d) => sum + d.amount, 0);
      newSuggestions.push({
        id: '6',
        type: 'deduction',
        title: 'Review Expense Categorization',
        description: `You have ${uncategorizedDeductions.length} expenses that might be tax-deductible but aren't currently marked as such. Review and update their categorization.`,
        potentialSavings: potentialAmount * (report.taxCalculation.effectiveTaxRate / 100),
        priority: 'high',
        actionable: true,
        category: 'Categorization',
      });
    }

    setSuggestions(newSuggestions.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    }));
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleExportPDF = () => {
    if (!taxReport) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Title
    doc.setFontSize(20);
    doc.text('Tax Optimization Report', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text(`Tax Year: ${taxReport.taxYear}`, pageWidth / 2, 30, { align: 'center' });
    doc.text(`Generated: ${new Date(taxReport.reportDate).toLocaleDateString()}`, pageWidth / 2, 37, { align: 'center' });

    let yPos = 50;

    // Summary
    doc.setFontSize(16);
    doc.text('Summary', 14, yPos);
    yPos += 10;

    doc.setFontSize(11);
    const summaryData = [
      ['Total Income', formatCurrency(taxReport.incomeSummary.totalIncome)],
      ['Total Deductions', formatCurrency(taxReport.deductions.totalDeductions)],
      ['Taxable Income', formatCurrency(taxReport.taxCalculation.taxableIncome)],
      ['Estimated Tax Liability', formatCurrency(taxReport.taxCalculation.estimatedTaxLiability)],
      ['Effective Tax Rate', `${taxReport.taxCalculation.effectiveTaxRate.toFixed(2)}%`],
    ];

    autoTable(doc, {
      startY: yPos,
      head: [['Item', 'Amount']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [66, 139, 202] },
    });

    yPos = (doc as any).lastAutoTable.finalY + 20;

    // Suggestions
    if (suggestions.length > 0) {
      if (yPos > pageHeight - 40) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(16);
      doc.text('Tax Optimization Suggestions', 14, yPos);
      yPos += 10;

      const suggestionData = suggestions.map(s => [
        s.title,
        s.priority.toUpperCase(),
        formatCurrency(s.potentialSavings),
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Suggestion', 'Priority', 'Potential Savings']],
        body: suggestionData,
        theme: 'striped',
        headStyles: { fillColor: [66, 139, 202] },
      });
    }

    doc.save(`tax-optimization-report-${taxYear}.pdf`);
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'deduction':
        return <Receipt />;
      case 'credit':
        return <AttachMoney />;
      case 'strategy':
        return <Lightbulb />;
      case 'timing':
        return <Schedule />;
      default:
        return <Info />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return theme.palette.error.main;
      case 'medium':
        return theme.palette.warning.main;
      case 'low':
        return theme.palette.info.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const getCategoryIcon = (category?: string) => {
    if (!category) return <Info />;
    const cat = category.toLowerCase();
    if (cat.includes('business')) return <Business />;
    if (cat.includes('medical')) return <LocalHospital />;
    if (cat.includes('education')) return <School />;
    if (cat.includes('charitable') || cat.includes('donation')) return <Favorite />;
    if (cat.includes('retirement')) return <AccountBalance />;
    return <Home />;
  };

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
        <Button onClick={fetchTaxData} size="small">
          Retry
        </Button>
      }>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Tax Optimization
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Maximize your tax savings with intelligent insights and recommendations
            </Typography>
          </Box>
          <Box display="flex" gap={1}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Tax Year</InputLabel>
              <Select
                value={taxYear}
                label="Tax Year"
                onChange={(e) => setTaxYear(Number(e.target.value))}
              >
                {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Tooltip title="Refresh">
              <IconButton onClick={fetchTaxData}>
                <Refresh />
              </IconButton>
            </Tooltip>
            <Tooltip title="Export PDF">
              <IconButton onClick={handleExportPDF} disabled={!taxReport}>
                <Download />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {/* Quick Stats */}
      {taxReport && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Estimated Tax Liability
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(taxReport.taxCalculation.estimatedTaxLiability)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {taxReport.taxCalculation.effectiveTaxRate.toFixed(1)}% effective rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: theme.palette.success.main, color: 'white' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Total Deductions
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(taxReport.deductions.totalDeductions)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {taxReport.deductions.businessExpenses > 0 && (
                    <>Business: {formatCurrency(taxReport.deductions.businessExpenses)}</>
                  )}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: theme.palette.info.main, color: 'white' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Potential Savings
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(suggestions.reduce((sum, s) => sum + s.potentialSavings, 0))}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  {suggestions.length} suggestions available
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ bgcolor: theme.palette.warning.main, color: 'white' }}>
              <CardContent>
                <Typography variant="subtitle2" gutterBottom>
                  Taxable Income
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {formatCurrency(taxReport.taxCalculation.taxableIncome)}
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.8 }}>
                  After deductions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="Optimization Suggestions" icon={<Lightbulb />} iconPosition="start" />
          <Tab label="Tax Report" icon={<Receipt />} iconPosition="start" />
          <Tab label="Deductible Expenses" icon={<AttachMoney />} iconPosition="start" />
        </Tabs>
      </Paper>

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Tax Optimization Suggestions
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Based on your financial data, here are personalized recommendations to optimize your tax situation.
          </Typography>

          {suggestions.length === 0 ? (
            <Alert severity="info">
              No specific suggestions at this time. Your tax situation appears to be well-optimized!
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {suggestions.map((suggestion) => (
                <Grid item xs={12} md={6} key={suggestion.id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getSuggestionIcon(suggestion.type)}
                          <Typography variant="h6">{suggestion.title}</Typography>
                        </Box>
                        <Chip
                          label={suggestion.priority}
                          size="small"
                          sx={{
                            bgcolor: getPriorityColor(suggestion.priority),
                            color: 'white',
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {suggestion.description}
                      </Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Box display="flex" alignItems="center" gap={1}>
                          {suggestion.category && (
                            <>
                              {getCategoryIcon(suggestion.category)}
                              <Typography variant="caption" color="text.secondary">
                                {suggestion.category}
                              </Typography>
                            </>
                          )}
                        </Box>
                        <Chip
                          icon={<TrendingUp />}
                          label={`Potential Savings: ${formatCurrency(suggestion.potentialSavings)}`}
                          color="success"
                          size="small"
                        />
                      </Box>
                      {suggestion.actionable && (
                        <Button
                          size="small"
                          variant="outlined"
                          sx={{ mt: 2 }}
                          onClick={() => {
                            // Navigate to relevant section or show action dialog
                            if (suggestion.category) {
                              setTabValue(2); // Switch to deductible expenses tab
                            }
                          }}
                        >
                          Take Action
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {taxReport ? (
          <TaxReportTab taxYear={taxYear} onRefresh={fetchTaxData} />
        ) : (
          <Alert severity="info">No tax report data available</Alert>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box>
          <Typography variant="h5" gutterBottom>
            Tax-Deductible Expenses
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Review and manage your tax-deductible expenses for the tax year.
          </Typography>

          {taxReport ? (
            <>
              {/* Business Expenses */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    <Business />
                    <Typography variant="h6">Business Expenses</Typography>
                    <Chip
                      label={formatCurrency(taxReport.deductions.businessExpenses)}
                      color="primary"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {taxReport.deductions.businessExpenseItems.length > 0 ? (
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
                          {taxReport.deductions.businessExpenseItems.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.description}</TableCell>
                              <TableCell>
                                <Chip label={item.category} size="small" />
                              </TableCell>
                              <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                              <TableCell>{new Date(item.expenseDate).toLocaleDateString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Alert severity="info">No business expenses recorded</Alert>
                  )}
                </AccordionDetails>
              </Accordion>

              {/* Personal Deductions */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Box display="flex" alignItems="center" gap={2} width="100%">
                    <Home />
                    <Typography variant="h6">Personal Deductions</Typography>
                    <Chip
                      label={formatCurrency(taxReport.deductions.personalDeductions)}
                      color="secondary"
                      sx={{ ml: 'auto' }}
                    />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {taxReport.deductions.personalDeductionItems.length > 0 ? (
                    <>
                      <Box mb={2}>
                        <Typography variant="subtitle2" gutterBottom>
                          Deductible Items
                        </Typography>
                        <TableContainer>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Description</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell align="right">Amount</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Status</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {taxReport.deductions.personalDeductionItems
                                .filter(item => item.isDeductible)
                                .map((item, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{item.description}</TableCell>
                                    <TableCell>
                                      <Chip label={item.category} size="small" />
                                    </TableCell>
                                    <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                                    <TableCell>{new Date(item.expenseDate).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                      <Chip
                                        icon={<CheckCircle />}
                                        label="Deductible"
                                        color="success"
                                        size="small"
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                      {taxReport.deductions.personalDeductionItems.some(item => !item.isDeductible) && (
                        <Box mt={2}>
                          <Typography variant="subtitle2" gutterBottom>
                            Potentially Deductible Items
                          </Typography>
                          <Alert severity="warning" sx={{ mb: 2 }}>
                            The following items might be tax-deductible but aren't currently marked as such. Review and update their categorization.
                          </Alert>
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
                                {taxReport.deductions.personalDeductionItems
                                  .filter(item => !item.isDeductible)
                                  .map((item, index) => (
                                    <TableRow key={index}>
                                      <TableCell>{item.description}</TableCell>
                                      <TableCell>
                                        <Chip label={item.category} size="small" />
                                      </TableCell>
                                      <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                                      <TableCell>{new Date(item.expenseDate).toLocaleDateString()}</TableCell>
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Alert severity="info">No personal deductions recorded</Alert>
                  )}
                </AccordionDetails>
              </Accordion>

              {/* Deductions by Category */}
              {Object.keys(taxReport.deductions.deductionsByCategory).length > 0 && (
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography variant="h6">Deductions by Category</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      {Object.entries(taxReport.deductions.deductionsByCategory).map(([category, amount]) => (
                        <Grid item xs={12} sm={6} md={4} key={category}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle2" color="text.secondary">
                                {category}
                              </Typography>
                              <Typography variant="h6">
                                {formatCurrency(amount)}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              )}
            </>
          ) : (
            <Alert severity="info">No tax report data available</Alert>
          )}
        </Box>
      </TabPanel>
    </Box>
  );
};

export default TaxOptimization;

