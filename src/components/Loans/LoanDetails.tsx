import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  AccountBalance,
  Schedule,
  Payment,
  TrendingUp,
  Download,
} from '@mui/icons-material';
import { Loan, RepaymentSchedule, Transaction, LoanStatus } from '../../types/loan';
import { apiService } from '../../services/api';
import { getErrorMessage } from '../../utils/validation';

interface LoanDetailsProps {
  loanId: string;
  onBack: () => void;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`loan-tabpanel-${index}`}
      aria-labelledby={`loan-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString();
};

const getStatusColor = (status: LoanStatus): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
  switch (status) {
    case LoanStatus.ACTIVE:
      return 'success';
    case LoanStatus.PENDING:
      return 'warning';
    case LoanStatus.APPROVED:
      return 'info';
    case LoanStatus.OVERDUE:
      return 'error';
    case LoanStatus.CLOSED:
      return 'default';
    case LoanStatus.REJECTED:
      return 'error';
    default:
      return 'default';
  }
};

const LoanDetails: React.FC<LoanDetailsProps> = ({ loanId, onBack }) => {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [schedule, setSchedule] = useState<RepaymentSchedule[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    loadLoanData();
  }, [loanId]);

  const loadLoanData = async () => {
    try {
      setIsLoading(true);
      const [loanData, scheduleData, transactionsData] = await Promise.all([
        apiService.getLoan(loanId),
        apiService.getLoanSchedule(loanId),
        apiService.getLoanTransactions(loanId),
      ]);
      
      setLoan(loanData);
      setSchedule(scheduleData);
      setTransactions(transactionsData);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load loan details'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const downloadStatement = () => {
    // This would generate and download a PDF statement
    console.log('Download statement for loan:', loanId);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error || !loan) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error || 'Loan not found'}
        </Alert>
        <Button onClick={onBack}>Back to Loans</Button>
      </Box>
    );
  }

  const paidInstallments = schedule.filter(item => item.status === 'PAID').length;
  const totalInstallments = schedule.length;
  const nextPayment = schedule.find(item => item.status === 'PENDING');

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          Loan Details #{loan.id.slice(-8).toUpperCase()}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={downloadStatement}
          >
            Download Statement
          </Button>
          <Button onClick={onBack}>
            Back to Loans
          </Button>
        </Box>
      </Box>

      {/* Loan Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalance sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">
                    {formatCurrency(loan.principal)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Principal Amount
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography variant="h6">
                    {loan.interestRate}%
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Interest Rate
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 2, color: 'info.main' }} />
                <Box>
                  <Typography variant="h6">
                    {paidInstallments}/{totalInstallments}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Payments Made
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Payment sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h6" color={loan.outstandingBalance > 0 ? 'error.main' : 'success.main'}>
                    {formatCurrency(loan.outstandingBalance)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Outstanding Balance
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loan Status and Basic Info */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Loan Information</Typography>
            <Chip
              label={loan.status}
              color={getStatusColor(loan.status)}
            />
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Purpose
              </Typography>
              <Typography variant="body1">
                {loan.purpose}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Term
              </Typography>
              <Typography variant="body1">
                {loan.term} months
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Created Date
              </Typography>
              <Typography variant="body1">
                {formatDate(loan.createdAt)}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary">
                Next Payment Due
              </Typography>
              <Typography variant="body1">
                {nextPayment ? formatDate(nextPayment.dueDate) : 'N/A'}
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for Schedule and Transactions */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange}>
            <Tab label="Repayment Schedule" />
            <Tab label="Transaction History" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Due Date</TableCell>
                  <TableCell align="right">Amount Due</TableCell>
                  <TableCell align="right">Principal</TableCell>
                  <TableCell align="right">Interest</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.dueDate)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.amountDue)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.principalAmount)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.interestAmount)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={item.status}
                        color={item.status === 'PAID' ? 'success' : item.status === 'OVERDUE' ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Reference</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{formatDate(transaction.date)}</TableCell>
                    <TableCell>{transaction.type}</TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell align="right">{formatCurrency(transaction.amount)}</TableCell>
                    <TableCell>{transaction.reference}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </TabPanel>
      </Card>
    </Box>
  );
};

export default LoanDetails;
