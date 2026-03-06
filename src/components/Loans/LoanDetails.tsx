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
  Snackbar,
  IconButton,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  AccountBalance,
  Schedule,
  Payment,
  TrendingUp,
  Download,
  Settings,
  MoreVert,
  Edit,
  DateRange,
  Delete,
  HelpOutline,
} from '@mui/icons-material';
import { Loan, RepaymentSchedule, Transaction, LoanStatus } from '../../types/loan';
import { apiService } from '../../services/api';
import { getErrorMessage } from '../../utils/validation';
import PaymentScheduleManager from './PaymentScheduleManager';
import AddScheduleDialog from './AddScheduleDialog';
import UpdateScheduleDialog from './UpdateScheduleDialog';
import { useCurrency } from '../../contexts/CurrencyContext';

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
    case LoanStatus.COMPLETED:
      return 'success';
    case LoanStatus.CANCELLED:
      return 'secondary';
    case LoanStatus.REJECTED:
      return 'error';
    default:
      return 'default';
  }
};

const LoanDetails: React.FC<LoanDetailsProps> = ({ loanId, onBack }) => {
  const { formatCurrency } = useCurrency();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [schedule, setSchedule] = useState<RepaymentSchedule[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  
  // Schedule management state
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState<{
    open: boolean;
    type: 'update' | 'markPaid' | 'updateDate';
    installment: RepaymentSchedule | null;
  }>({ open: false, type: 'update', installment: null });
  
  // Snackbar state for success/error messages
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Action menu state for basic schedule table
  const [scheduleActionMenu, setScheduleActionMenu] = useState<{
    anchorEl: HTMLElement | null;
    installment: RepaymentSchedule | null;
  }>({ anchorEl: null, installment: null });

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

  // Schedule management handlers
  const handleScheduleUpdate = (newSchedule: RepaymentSchedule[]) => {
    setSchedule(newSchedule);
  };

  const handleScheduleError = (errorMessage: string) => {
    setSnackbar({
      open: true,
      message: errorMessage,
      severity: 'error',
    });
  };

  const handleScheduleSuccess = (successMessage: string) => {
    setSnackbar({
      open: true,
      message: successMessage,
      severity: 'success',
    });
    // Refresh the schedule data
    loadLoanData();
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Schedule action menu handlers
  const handleScheduleActionMenuOpen = (event: React.MouseEvent<HTMLElement>, installment: RepaymentSchedule) => {
    setScheduleActionMenu({
      anchorEl: event.currentTarget,
      installment,
    });
  };

  const handleScheduleActionMenuClose = () => {
    setScheduleActionMenu({
      anchorEl: null,
      installment: null,
    });
  };

  const handleScheduleMenuAction = (action: string) => {
    const { installment } = scheduleActionMenu;
    handleScheduleActionMenuClose();

    if (!installment) return;

    switch (action) {
      case 'update':
        setUpdateDialogOpen({ open: true, type: 'update', installment });
        break;
      case 'markPaid':
        setUpdateDialogOpen({ open: true, type: 'markPaid', installment });
        break;
      case 'updateDate':
        setUpdateDialogOpen({ open: true, type: 'updateDate', installment });
        break;
      case 'delete':
        handleDeleteScheduleInstallment(installment);
        break;
    }
  };

  const handleDeleteScheduleInstallment = async (installment: RepaymentSchedule) => {
    if (!loan) {
      setSnackbar({
        open: true,
        message: 'Loan data not available',
        severity: 'error',
      });
      return;
    }

    if (installment.status === 'PAID') {
      setSnackbar({
        open: true,
        message: 'Cannot delete paid installments',
        severity: 'error',
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete installment #${installment.installmentNumber}?`)) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.deletePaymentInstallment(loan.id, installment.installmentNumber);
      
      if (response.success) {
        // Remove the deleted installment from the schedule
        const updatedSchedule = schedule.filter(s => s.id !== installment.id);
        setSchedule(updatedSchedule);
        setSnackbar({
          open: true,
          message: 'Installment deleted successfully',
          severity: 'success',
        });
      } else {
        setSnackbar({
          open: true,
          message: response.message || 'Failed to delete installment',
          severity: 'error',
        });
      }
    } catch (err: unknown) {
      setSnackbar({
        open: true,
        message: getErrorMessage(err, 'Failed to delete installment'),
        severity: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper functions for business rules
  const canMarkAsPaid = (installment: RepaymentSchedule): boolean => {
    return installment.status === 'PENDING' || installment.status === 'OVERDUE';
  };

  const canDeleteInstallment = (installment: RepaymentSchedule): boolean => {
    return installment.status !== 'PAID';
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
                    Loan Amount
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
            <Tab 
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  Payment Schedule
                  <Tooltip
                    title={
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          What is a "Payment Schedule"?
                        </Typography>
                        <Typography variant="body2">
                          This shows how each payment is split between paying off the loan amount and paying interest. Over time, more of your payment goes toward the loan amount.
                        </Typography>
                      </Box>
                    }
                    arrow
                  >
                    <IconButton size="small" sx={{ p: 0.25 }}>
                      <HelpOutline sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              }
            />
            <Tab label="Schedule Management" icon={<Settings />} iconPosition="start" />
            <Tab label="Transaction History" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {/* Add Schedule Button for Basic Table */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<Schedule />}
              onClick={() => setAddDialogOpen(true)}
            >
              Add Schedule
            </Button>
          </Box>
          
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Due Date</TableCell>
                  <TableCell align="right">Amount Due</TableCell>
                  <TableCell align="right">Loan Amount</TableCell>
                  <TableCell align="right">Interest</TableCell>
                  <TableCell align="center">Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule
                  .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                  .map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{formatDate(item.dueDate)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.totalAmount || item.amountDue || 0)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.principalAmount)}</TableCell>
                    <TableCell align="right">{formatCurrency(item.interestAmount)}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={item.status}
                        color={item.status === 'PAID' ? 'success' : item.status === 'OVERDUE' ? 'error' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Actions">
                        <IconButton
                          size="small"
                          onClick={(e) => handleScheduleActionMenuOpen(e, item)}
                        >
                          <MoreVert />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Action Menu for Basic Schedule Table */}
          <Menu
            anchorEl={scheduleActionMenu.anchorEl}
            open={Boolean(scheduleActionMenu.anchorEl)}
            onClose={handleScheduleActionMenuClose}
          >
            <MenuItem onClick={() => handleScheduleMenuAction('update')}>
              <Edit sx={{ mr: 1 }} fontSize="small" />
              Update Schedule
            </MenuItem>
            {scheduleActionMenu.installment && canMarkAsPaid(scheduleActionMenu.installment) && (
              <MenuItem onClick={() => handleScheduleMenuAction('markPaid')}>
                <Payment sx={{ mr: 1 }} fontSize="small" />
                Mark as Paid
              </MenuItem>
            )}
            <MenuItem onClick={() => handleScheduleMenuAction('updateDate')}>
              <DateRange sx={{ mr: 1 }} fontSize="small" />
              Update Due Date
            </MenuItem>
            {scheduleActionMenu.installment && canDeleteInstallment(scheduleActionMenu.installment) && (
              <MenuItem 
                onClick={() => handleScheduleMenuAction('delete')}
                sx={{ color: 'error.main' }}
              >
                <Delete sx={{ mr: 1 }} fontSize="small" />
                Delete Installment
              </MenuItem>
            )}
          </Menu>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <PaymentScheduleManager
            loan={loan}
            schedule={schedule}
            onScheduleUpdate={handleScheduleUpdate}
            onError={handleScheduleError}
            onOpenAddDialog={() => setAddDialogOpen(true)}
            onOpenUpdateDialog={(type, installment) => setUpdateDialogOpen({ open: true, type, installment })}
          />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
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

      {/* Dialogs */}
      <AddScheduleDialog
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        loan={loan!}
        onSuccess={handleScheduleSuccess}
        onError={handleScheduleError}
      />

      <UpdateScheduleDialog
        open={updateDialogOpen.open}
        onClose={() => setUpdateDialogOpen({ open: false, type: 'update', installment: null })}
        loan={loan!}
        installment={updateDialogOpen.installment}
        type={updateDialogOpen.type}
        onSuccess={handleScheduleSuccess}
        onError={handleScheduleError}
      />

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LoanDetails;
