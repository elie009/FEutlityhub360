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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  Receipt,
  Refresh,
  ExpandMore,
  AttachMoney,
  TrendingUp,
} from '@mui/icons-material';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiService } from '../../services/api';
import { TaxReportDto } from '../../types/financialReport';

interface TaxReportTabProps {
  taxYear?: number;
  onRefresh?: () => void;
}

const TaxReportTab: React.FC<TaxReportTabProps> = ({ 
  taxYear: initialTaxYear, 
  onRefresh 
}) => {
  const { formatCurrency } = useCurrency();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [taxReport, setTaxReport] = useState<TaxReportDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [currentTaxYear, setCurrentTaxYear] = useState(initialTaxYear || new Date().getFullYear());

  useEffect(() => {
    fetchTaxReport();
  }, [currentTaxYear]);

  const fetchTaxReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getTaxReport(currentTaxYear);
      setTaxReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tax report');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchTaxReport();
    if (onRefresh) onRefresh();
  };

  const generateTaxYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= currentYear - 5; i--) {
      years.push(i);
    }
    return years;
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
        <IconButton onClick={handleRefresh} size="small">
          <Refresh />
        </IconButton>
      }>
        {error}
      </Alert>
    );
  }

  if (!taxReport) {
    return <Alert severity="info">No tax report data available</Alert>;
  }

  return (
    <Box>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box display="flex" alignItems="center" gap={2}>
            <Receipt color="primary" />
            <Box>
              <Typography variant="h5" fontWeight="bold">
                Tax Report
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Tax Year {taxReport.taxYear} | {new Date(taxReport.periodStart).toLocaleDateString()} - {new Date(taxReport.periodEnd).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
          <Box display="flex" gap={1}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Tax Year</InputLabel>
              <Select
                value={currentTaxYear}
                label="Tax Year"
                onChange={(e) => setCurrentTaxYear(Number(e.target.value))}
              >
                {generateTaxYears().map(year => (
                  <MenuItem key={year} value={year}>{year}</MenuItem>
                ))}
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

      {/* Tax Summary Cards */}
      <Grid container spacing={2} mb={3}>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: theme.palette.primary.main, color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Total Income
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(taxReport.incomeSummary.totalIncome)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: theme.palette.info.main, color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Total Deductions
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(taxReport.deductions.totalDeductions)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ bgcolor: theme.palette.warning.main, color: 'white' }}>
            <CardContent>
              <Typography variant="subtitle2" gutterBottom>
                Estimated Tax Liability
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {formatCurrency(taxReport.taxCalculation.estimatedTaxLiability)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Income Summary */}
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Income Summary</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Salary Income</Typography>
              <Typography variant="h6">{formatCurrency(taxReport.incomeSummary.salaryIncome)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Business Income</Typography>
              <Typography variant="h6">{formatCurrency(taxReport.incomeSummary.businessIncome)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Freelance Income</Typography>
              <Typography variant="h6">{formatCurrency(taxReport.incomeSummary.freelanceIncome)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Investment Income</Typography>
              <Typography variant="h6">{formatCurrency(taxReport.incomeSummary.investmentIncome)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Interest Income</Typography>
              <Typography variant="h6">{formatCurrency(taxReport.incomeSummary.interestIncome)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Rental Income</Typography>
              <Typography variant="h6">{formatCurrency(taxReport.incomeSummary.rentalIncome)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Other Income</Typography>
              <Typography variant="h6">{formatCurrency(taxReport.incomeSummary.otherIncome)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Taxable Income</Typography>
              <Typography variant="h6" fontWeight="bold">{formatCurrency(taxReport.incomeSummary.taxableIncome)}</Typography>
            </Grid>
          </Grid>
          {taxReport.incomeSummary.incomeItems.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Source</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {taxReport.incomeSummary.incomeItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.sourceName}</TableCell>
                      <TableCell>
                        <Chip label={item.incomeType} size="small" />
                      </TableCell>
                      <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                      <TableCell>{new Date(item.incomeDate).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Deductions */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Deductions</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6} md={4}>
              <Typography variant="body2" color="text.secondary">Business Expenses</Typography>
              <Typography variant="h6">{formatCurrency(taxReport.deductions.businessExpenses)}</Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography variant="body2" color="text.secondary">Personal Deductions</Typography>
              <Typography variant="h6">{formatCurrency(taxReport.deductions.personalDeductions)}</Typography>
            </Grid>
            <Grid item xs={6} md={4}>
              <Typography variant="body2" color="text.secondary">Standard Deduction</Typography>
              <Typography variant="h6">{formatCurrency(taxReport.deductions.standardDeduction)}</Typography>
            </Grid>
          </Grid>
          {Object.keys(taxReport.deductions.deductionsByCategory).length > 0 && (
            <Box mb={2}>
              <Typography variant="subtitle2" gutterBottom>Deductions by Category</Typography>
              <Grid container spacing={1}>
                {Object.entries(taxReport.deductions.deductionsByCategory).map(([category, amount]) => (
                  <Grid item xs={6} md={3} key={category}>
                    <Chip
                      label={`${category}: ${formatCurrency(amount)}`}
                      variant="outlined"
                      sx={{ width: '100%' }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Tax Calculation */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography variant="h6">Tax Calculation</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Adjusted Gross Income</Typography>
              <Typography variant="h6">{formatCurrency(taxReport.taxCalculation.adjustedGrossIncome)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Taxable Income</Typography>
              <Typography variant="h6" fontWeight="bold">{formatCurrency(taxReport.taxCalculation.taxableIncome)}</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Effective Tax Rate</Typography>
              <Typography variant="h6">{taxReport.taxCalculation.effectiveTaxRate.toFixed(2)}%</Typography>
            </Grid>
            <Grid item xs={6} md={3}>
              <Typography variant="body2" color="text.secondary">Marginal Tax Rate</Typography>
              <Typography variant="h6">{taxReport.taxCalculation.marginalTaxRate.toFixed(2)}%</Typography>
            </Grid>
          </Grid>
          {taxReport.taxCalculation.notes && (
            <Alert severity="info" sx={{ mt: 2 }}>
              {taxReport.taxCalculation.notes}
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Tax Categories */}
      {taxReport.taxCategories.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Tax Categories Breakdown</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {taxReport.taxCategories.map((category, index) => (
              <Box key={index} mb={2}>
                <Typography variant="subtitle1" gutterBottom>
                  {category.categoryName} ({category.categoryType})
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {category.description}
                </Typography>
                <Box display="flex" gap={2} mb={1}>
                  <Typography variant="body2">
                    <strong>Amount:</strong> {formatCurrency(category.amount)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Percentage:</strong> {category.percentage.toFixed(2)}%
                  </Typography>
                </Box>
                {category.items.length > 0 && (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Item</TableCell>
                          <TableCell align="right">Amount</TableCell>
                          <TableCell>Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {category.items.map((item, itemIndex) => (
                          <TableRow key={itemIndex}>
                            <TableCell>{item.itemName}</TableCell>
                            <TableCell align="right">{formatCurrency(item.amount)}</TableCell>
                            <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
                {index < taxReport.taxCategories.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Quarterly Breakdown */}
      {taxReport.quarterlyBreakdown.length > 0 && (
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Typography variant="h6">Quarterly Breakdown</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Quarter</TableCell>
                    <TableCell>Period</TableCell>
                    <TableCell align="right">Total Income</TableCell>
                    <TableCell align="right">Total Deductions</TableCell>
                    <TableCell align="right">Taxable Income</TableCell>
                    <TableCell align="right">Estimated Tax</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {taxReport.quarterlyBreakdown.map((quarter, index) => (
                    <TableRow key={index}>
                      <TableCell>Q{quarter.quarter}</TableCell>
                      <TableCell>
                        {new Date(quarter.quarterStart).toLocaleDateString()} - {new Date(quarter.quarterEnd).toLocaleDateString()}
                      </TableCell>
                      <TableCell align="right">{formatCurrency(quarter.totalIncome)}</TableCell>
                      <TableCell align="right">{formatCurrency(quarter.totalDeductions)}</TableCell>
                      <TableCell align="right">{formatCurrency(quarter.taxableIncome)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>{formatCurrency(quarter.estimatedTaxLiability)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      )}
    </Box>
  );
};

export default TaxReportTab;

