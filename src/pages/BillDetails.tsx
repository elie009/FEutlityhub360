import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Alert,
  IconButton,
  Divider,
} from '@mui/material';
import {
  ArrowBack,
  Download,
  Print,
  Share,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../services/api';
import {
  BillHistoryAnalytics,
  BudgetStatus,
  BillType,
} from '../types/bill';
import { getErrorMessage } from '../utils/validation';
import ForecastWidget from '../components/Bills/ForecastWidget';
import BudgetTracker from '../components/Bills/BudgetTracker';
import TrendChart from '../components/Bills/TrendChart';
import BillHistoryTable from '../components/Bills/BillHistoryTable';
import { SimpleFinanceLoader } from '../components/Common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const BillDetails: React.FC = () => {
  const { provider, billType } = useParams<{ provider: string; billType: string }>();
  const navigate = useNavigate();
  
  const [historyData, setHistoryData] = useState<BillHistoryAnalytics | null>(null);
  const [budgetStatus, setBudgetStatus] = useState<BudgetStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (provider && billType) {
      loadBillDetails();
    }
  }, [provider, billType]);

  const loadBillDetails = async () => {
    try {
      setLoading(true);
      setError('');

      const [history, budget] = await Promise.all([
        apiService.getBillHistory({
          provider: decodeURIComponent(provider!),
          billType: billType as BillType,
          months: 12,
        }),
        apiService.getBudgetStatus({
          provider: decodeURIComponent(provider!),
          billType: billType as BillType,
        }).catch(() => null), // Budget might not exist
      ]);

      setHistoryData(history);
      setBudgetStatus(budget);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load bill details'));
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/bills');
  };

  const generatePDF = () => {
    if (!historyData) return null;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Helper function to add a new page if needed
    const checkPageBreak = (requiredSpace: number) => {
      if (yPosition + requiredSpace > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }
    };

    // Header
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Provider Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`Provider: ${decodeURIComponent(provider!)}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    doc.text(`Bill Type: ${billType}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Analytics Summary
    checkPageBreak(50);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Analytics Summary', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const analyticsData = [
      ['Total Spent', `$${formatCurrency(historyData.analytics.totalSpent)}`],
      ['Monthly Average (Weighted)', `$${formatCurrency(historyData.analytics.averageWeighted)}`],
      ['Monthly Average (Simple)', `$${formatCurrency(historyData.analytics.averageSimple)}`],
      ['Highest Bill', `$${formatCurrency(historyData.analytics.highestBill)}`],
      ['Lowest Bill', `$${formatCurrency(historyData.analytics.lowestBill)}`],
      ['Bill Count', `${historyData.analytics.billCount || historyData.analytics.monthCount || historyData.totalCount || 0} months`],
    ];

    if (historyData.analytics.averageSeasonal) {
      analyticsData.push(['Seasonal Average', `$${formatCurrency(historyData.analytics.averageSeasonal)}`]);
    }

    autoTable(doc, {
      startY: yPosition,
      head: [['Metric', 'Value']],
      body: analyticsData,
      theme: 'striped',
      headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10 },
      margin: { left: 14, right: 14 },
    });
    yPosition = (doc as any).lastAutoTable.finalY + 15;

    // Trend Analysis
    checkPageBreak(30);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Trend Analysis', 14, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const trendText = 
      historyData.analytics.trend === 'increasing' ? '↗️ Increasing' :
      historyData.analytics.trend === 'decreasing' ? '↘️ Decreasing' :
      '➡️ Stable';
    
    doc.text(`Trend Status: ${trendText}`, 14, yPosition);
    yPosition += 10;

    // Forecast Information
    if (historyData.forecast) {
      checkPageBreak(30);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Forecast', 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Estimated Amount: $${formatCurrency(historyData.forecast.estimatedAmount)}`, 14, yPosition);
      yPosition += 6;
      doc.text(`Calculation Method: ${historyData.forecast.calculationMethod}`, 14, yPosition);
      yPosition += 6;
      doc.text(`Confidence: ${historyData.forecast.confidence}`, 14, yPosition);
      if (historyData.forecast.estimatedForMonth) {
        yPosition += 6;
        doc.text(`Estimated For: ${historyData.forecast.estimatedForMonth}`, 14, yPosition);
      }
      if (historyData.forecast.recommendation) {
        yPosition += 6;
        doc.text(`Recommendation: ${historyData.forecast.recommendation}`, 14, yPosition);
      }
      yPosition += 10;
    }

    // Budget Status
    if (budgetStatus) {
      checkPageBreak(30);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Budget Status', 14, yPosition);
      yPosition += 8;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Monthly Budget: $${formatCurrency(budgetStatus.monthlyBudget)}`, 14, yPosition);
      yPosition += 6;
      doc.text(`Current Bill: $${formatCurrency(budgetStatus.currentBill)}`, 14, yPosition);
      yPosition += 6;
      doc.text(`Remaining: $${formatCurrency(budgetStatus.remaining)}`, 14, yPosition);
      yPosition += 6;
      doc.text(`Percentage Used: ${budgetStatus.percentageUsed.toFixed(1)}%`, 14, yPosition);
      yPosition += 6;
      doc.text(`Status: ${budgetStatus.status}`, 14, yPosition);
      if (budgetStatus.message) {
        yPosition += 6;
        doc.text(`Message: ${budgetStatus.message}`, 14, yPosition);
      }
      yPosition += 10;
    }

    // Bill History Table
    checkPageBreak(50);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Bill History', 14, yPosition);
    yPosition += 8;

    const tableData = historyData.bills.map(bill => {
      const dueDate = new Date(bill.dueDate).toLocaleDateString();
      const paidDate = bill.paidAt ? new Date(bill.paidAt).toLocaleDateString() : 'Not Paid';
      return [
        dueDate,
        `$${formatCurrency(bill.amount)}`,
        bill.status,
        paidDate,
      ];
    });

    autoTable(doc, {
      startY: yPosition,
      head: [['Due Date', 'Amount', 'Status', 'Paid Date']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [25, 118, 210], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9 },
      margin: { left: 14, right: 14 },
      columnStyles: {
        0: { cellWidth: 40 },
        1: { cellWidth: 40, halign: 'right' },
        2: { cellWidth: 30 },
        3: { cellWidth: 40 },
      },
    });

    return doc;
  };

  const handleExport = () => {
    const doc = generatePDF();
    if (doc) {
      const fileName = `Provider_Analytics_${decodeURIComponent(provider!)}_${billType}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(fileName);
    }
  };

  const handlePrint = () => {
    const doc = generatePDF();
    if (doc) {
      // Open print preview
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    }
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log('Share data');
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <SimpleFinanceLoader size="large" text="Loading bill details..." />
      </Box>
    );
  }

  if (error || !historyData) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error || 'Failed to load bill details'}</Alert>
        <Button startIcon={<ArrowBack />} onClick={handleBack} sx={{ mt: 2 }}>
          Back to Bills
        </Button>
      </Container>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={handleBack}>
            <ArrowBack />
          </IconButton>
          <Box>
            <Typography variant="h4">
              {decodeURIComponent(provider!)}
            </Typography>
              <Typography variant="body2" color="text.secondary">
                {billType} Bills • {historyData.analytics.billCount || historyData.analytics.monthCount || historyData.totalCount || 0} months
              </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton onClick={handleExport} title="Export Data">
            <Download />
          </IconButton>
          <IconButton onClick={handlePrint} title="Print">
            <Print />
          </IconButton>
          <IconButton onClick={handleShare} title="Share">
            <Share />
          </IconButton>
        </Box>
      </Box>

      {/* Analytics Summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            📊 Analytics Summary
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Total Spent
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(historyData.analytics.totalSpent)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Last {historyData.analytics.billCount || historyData.analytics.monthCount || historyData.totalCount || 0} months
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Monthly Average
                </Typography>
                <Typography variant="h5" fontWeight="bold">
                  {formatCurrency(historyData.analytics.averageWeighted)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Weighted average
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Highest Bill
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="error.main">
                  {formatCurrency(historyData.analytics.highestBill)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Peak amount
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Lowest Bill
                </Typography>
                <Typography variant="h5" fontWeight="bold" color="success.main">
                  {formatCurrency(historyData.analytics.lowestBill)}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Minimum amount
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          {/* Trend Chart */}
          <Box sx={{ mb: 3 }}>
            <TrendChart
              data={historyData.bills.map(bill => ({
                month: new Date(bill.dueDate).toLocaleString('en-US', { month: 'short' }),
                year: new Date(bill.dueDate).getFullYear(),
                amount: bill.amount,
                status: bill.status,
                dueDate: bill.dueDate,
                paidDate: bill.paidAt,
                billId: bill.id,
              }))}
              provider={decodeURIComponent(provider!)}
              averageAmount={historyData.analytics.averageWeighted}
            />
          </Box>

          {/* Bill History Table */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📜 Bill History
              </Typography>
              <Divider sx={{ my: 2 }} />
              <BillHistoryTable
                bills={historyData.bills}
                showVariance={true}
                estimatedAmounts={new Map()}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Right Column */}
        <Grid item xs={12} md={4}>
          {/* Forecast Widget */}
          <Box sx={{ mb: 3 }}>
            <ForecastWidget
              forecast={historyData.forecast}
              provider={decodeURIComponent(provider!)}
            />
          </Box>

          {/* Budget Tracker */}
          <Box sx={{ mb: 3 }}>
            <BudgetTracker
              budgetStatus={budgetStatus || undefined}
              provider={decodeURIComponent(provider!)}
              billType={billType as BillType}
              onBudgetUpdate={loadBillDetails}
            />
          </Box>

          {/* Statistics Card */}
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                📈 Trend Analysis
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Trend Status
                </Typography>
                <Typography
                  variant="h6"
                  color={
                    historyData.analytics.trend === 'increasing'
                      ? 'error.main'
                      : historyData.analytics.trend === 'decreasing'
                      ? 'success.main'
                      : 'text.primary'
                  }
                >
                  {historyData.analytics.trend === 'increasing' && '↗️ Increasing'}
                  {historyData.analytics.trend === 'decreasing' && '↘️ Decreasing'}
                  {historyData.analytics.trend === 'stable' && '➡️ Stable'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Simple Average (3mo)
                </Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatCurrency(historyData.analytics.averageSimple)}
                </Typography>
              </Box>

              {historyData.analytics.averageSeasonal && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Seasonal Average
                  </Typography>
                  <Typography variant="body1" fontWeight="medium">
                    {formatCurrency(historyData.analytics.averageSeasonal)}
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BillDetails;

