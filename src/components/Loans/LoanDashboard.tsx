import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalance,
  TrendingUp,
  Schedule,
  CalendarMonth,
  EventAvailable,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Loan, UpcomingPayment } from '../../types/loan';
import { getErrorMessage } from '../../utils/validation';
import { formatDueDate, formatDate } from '../../utils/dateUtils';
import LoanCard from './LoanCard';
import LoanApplicationForm from './LoanApplicationForm';
import PaymentForm from './PaymentForm';
import LoanUpdateForm from './LoanUpdateForm';
import LoanTransactionHistory from './LoanTransactionHistory';

const LoanDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [outstandingAmount, setOutstandingAmount] = useState<number>(0);
  const [upcomingPayments, setUpcomingPayments] = useState<UpcomingPayment[]>([]);
  const [monthlyPaymentData, setMonthlyPaymentData] = useState<{
    totalMonthlyPayment: number;
    totalRemainingBalance: number;
    activeLoanCount: number;
    totalPayment: number;
    totalPaymentRemaining: number;
    totalMonthsRemaining: number;
    loans: Array<{
      id: string;
      purpose: string;
      monthlyPayment: number;
      remainingBalance: number;
      interestRate: number;
      totalInstallments: number;
      installmentsRemaining: number;
      monthsRemaining: number;
    }>;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showUpcomingDialog, setShowUpcomingDialog] = useState(false);
  const [showMonthlyPaymentDialog, setShowMonthlyPaymentDialog] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loanToDelete, setLoanToDelete] = useState<Loan | null>(null);
  const [loanForHistory, setLoanForHistory] = useState<Loan | null>(null);

  useEffect(() => {
    if (user) {
      loadLoans();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadOutstandingAmount = async () => {
    try {
      const amount = await apiService.getOutstandingAmount();
      setOutstandingAmount(amount);
    } catch (err: unknown) {
      console.error('Error loading outstanding amount:', err);
      // Fallback to calculating from loans if API fails
      setOutstandingAmount(getTotalOutstanding());
    }
  };

  const loadMonthlyPaymentTotal = async () => {
    try {
      const data = await apiService.getMonthlyPaymentTotal();
      setMonthlyPaymentData(data);
    } catch (err: unknown) {
      console.error('Error loading monthly payment total:', err);
      // Fallback to calculating from loans if API fails
      const fallbackTotal = getTotalMonthlyPayment();
      setMonthlyPaymentData({
        totalMonthlyPayment: fallbackTotal,
        totalRemainingBalance: getTotalOutstanding(),
        activeLoanCount: getActiveLoansCount(),
        totalPayment: 0,
        totalPaymentRemaining: 0,
        totalMonthsRemaining: 0,
        loans: []
      });
    }
  };

  const loadLoans = async () => {
    if (!user) return;
    try {
      setIsLoading(true);
      const userLoans = await apiService.getUserLoans(user.id);
      
      // Ensure we always set an array
      if (Array.isArray(userLoans)) {
        setLoans(userLoans);
      } else {
        console.error('API returned non-array response:', userLoans);
        setLoans([]);
        setError('Invalid response format from server');
      }
      
      // Load outstanding amount after loading loans
      await loadOutstandingAmount();
      
      // Load monthly payment total
      await loadMonthlyPaymentTotal();
      
      // Load due date tracking data
      await loadDueDateTracking();
    } catch (err: unknown) {
      console.error('Error loading loans:', err);
      setError(getErrorMessage(err, 'Failed to load loans'));
      setLoans([]); // Ensure we always have an array
    } finally {
      setIsLoading(false);
    }
  };

  const loadDueDateTracking = async () => {
    try {
      // Load upcoming payments (next 30 days)
      const upcoming = await apiService.getUpcomingPayments(30);
      setUpcomingPayments(upcoming);
    } catch (err: unknown) {
      console.error('Error loading due date tracking:', err);
      // Don't set error state since this is supplementary data
    }
  };

  const handleApplicationSuccess = async (loanId: string) => {
    setShowApplicationForm(false);
    // Refresh the loans list and outstanding amount
    await loadLoans();
    await loadOutstandingAmount();
    await loadMonthlyPaymentTotal();
  };

  const handleMakePayment = (loanId: string) => {
    setSelectedLoanId(loanId);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = async () => {
    setShowPaymentForm(false);
    setSelectedLoanId('');
    // Refresh the loans list to get updated balances
    await loadLoans();
    // Also explicitly refresh the outstanding amount from the API
    await loadOutstandingAmount();
    await loadMonthlyPaymentTotal();
  };

  const handleUpdateLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowUpdateForm(true);
  };

  const handleUpdateSuccess = async (updatedLoan: Loan) => {
    console.log('🎉 Update success handler called with:', updatedLoan);
    
    // Update the loan in the loans array immediately with the response data
    setLoans(prevLoans => 
      prevLoans.map(loan => 
        loan.id === updatedLoan.id ? updatedLoan : loan
      )
    );
    
    setShowUpdateForm(false);
    setSelectedLoan(null);
    
    // Reload all loans from backend to ensure all calculated fields are synced
    console.log('🔄 Reloading all loans to sync calculated fields...');
    await loadLoans();
    
    // Refresh the outstanding amount after updating loan
    await loadOutstandingAmount();
    await loadMonthlyPaymentTotal();
  };

  const handleDeleteLoan = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (loan) {
      setLoanToDelete(loan);
      setShowDeleteDialog(true);
    }
  };

  const confirmDeleteLoan = async () => {
    if (!loanToDelete) return;

    try {
      setIsLoading(true);
      await apiService.deleteLoan(loanToDelete.id);
      
      // Remove the loan from the local state
      setLoans(prevLoans => prevLoans.filter(loan => loan.id !== loanToDelete.id));
      
      setShowDeleteDialog(false);
      setLoanToDelete(null);
      
      // Refresh the outstanding amount after deleting loan
      await loadOutstandingAmount();
      await loadMonthlyPaymentTotal();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete loan'));
    } finally {
      setIsLoading(false);
    }
  };

  const cancelDeleteLoan = () => {
    setShowDeleteDialog(false);
    setLoanToDelete(null);
  };

  const handleViewHistory = (loanId: string) => {
    const loan = loans.find(l => l.id === loanId);
    if (loan) {
      setLoanForHistory(loan);
      setShowHistoryDialog(true);
    }
  };

  const closeHistoryDialog = () => {
    setShowHistoryDialog(false);
    setLoanForHistory(null);
  };

  const getTotalOutstanding = (): number => {
    if (!Array.isArray(loans)) {
      console.error('Loans is not an array:', loans);
      return 0;
    }
    return loans.reduce((total, loan) => {
      // Use remainingBalance if available, fallback to outstandingBalance for backward compatibility
      const balance = loan.remainingBalance !== undefined ? loan.remainingBalance : loan.outstandingBalance;
      return total + balance;
    }, 0);
  };

  const getActiveLoansCount = (): number => {
    if (!Array.isArray(loans)) {
      console.error('Loans is not an array:', loans);
      return 0;
    }
    return loans.filter(loan => loan.status === 'ACTIVE').length;
  };

  const getTotalMonthlyPayment = (): number => {
    if (!Array.isArray(loans)) {
      console.error('Loans is not an array:', loans);
      return 0;
    }
    return loans
      .filter(loan => loan.status === 'ACTIVE')
      .reduce((total, loan) => total + (loan.monthlyPayment || 0), 0);
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">
          My Loans
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowApplicationForm(true)}
        >
          Apply for Loan
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalance sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">
                    ${outstandingAmount.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Outstanding
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TrendingUp sx={{ mr: 2, color: 'success.main' }} />
                <Box>
                  <Typography variant="h6">
                    {getActiveLoansCount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Active Loans
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule sx={{ mr: 2, color: 'warning.main' }} />
                <Box>
                  <Typography variant="h6">
                    {loans.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Loans
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card 
            sx={{ 
              cursor: 'pointer',
              '&:hover': { boxShadow: 3 }
            }}
            onClick={() => setShowMonthlyPaymentDialog(true)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarMonth sx={{ mr: 2, color: 'info.main' }} />
                <Box sx={{ width: '100%' }}>
                  <Typography variant="h6">
                    ${(monthlyPaymentData?.totalMonthlyPayment || 0).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Due This Month
                  </Typography>
                  <Typography variant="caption" color="info.main" sx={{ fontWeight: 600 }}>
                    {monthlyPaymentData?.activeLoanCount || 0} active loan{(monthlyPaymentData?.activeLoanCount || 0) !== 1 ? 's' : ''} • Click for details
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card 
            sx={{ 
              cursor: upcomingPayments.length > 0 ? 'pointer' : 'default',
              '&:hover': upcomingPayments.length > 0 ? { boxShadow: 3 } : {}
            }}
            onClick={() => upcomingPayments.length > 0 && setShowUpcomingDialog(true)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <EventAvailable sx={{ mr: 2, color: 'info.main' }} />
                <Box sx={{ width: '100%' }}>
                  <Typography variant="h6">
                    {upcomingPayments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming Payments
                  </Typography>
                  {upcomingPayments.length > 0 && (
                    <Typography variant="caption" color="info.main" sx={{ fontWeight: 600 }}>
                      Next 30 days
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Loans Grid */}
      {!Array.isArray(loans) || loans.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 6 }}>
            <AccountBalance sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              No loans found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You haven't applied for any loans yet. Start by applying for your first loan.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowApplicationForm(true)}
            >
              Apply for Loan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {Array.isArray(loans) && loans.map((loan) => (
            <Grid item xs={12} sm={6} md={4} key={loan.id}>
              <LoanCard
                loan={loan}
                onUpdate={handleUpdateLoan}
                onMakePayment={handleMakePayment}
                onDelete={handleDeleteLoan}
                onViewHistory={handleViewHistory}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="apply for loan"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
        }}
        onClick={() => setShowApplicationForm(true)}
      >
        <AddIcon />
      </Fab>

      {/* Application Form Dialog */}
      <Dialog
        open={showApplicationForm}
        onClose={() => setShowApplicationForm(false)}
        maxWidth="md"
        fullWidth
        fullScreen
      >
        <DialogTitle>Apply for a Loan</DialogTitle>
        <DialogContent>
          <LoanApplicationForm
            onSuccess={handleApplicationSuccess}
            onCancel={() => setShowApplicationForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Payment Form Dialog */}
      <Dialog
        open={showPaymentForm}
        onClose={() => setShowPaymentForm(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Payment</DialogTitle>
        <DialogContent>
          <PaymentForm
            loanId={selectedLoanId}
            onSuccess={handlePaymentSuccess}
            onCancel={() => setShowPaymentForm(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Update Form Dialog */}
      <LoanUpdateForm
        open={showUpdateForm}
        onClose={() => {
          setShowUpdateForm(false);
          setSelectedLoan(null);
        }}
        loan={selectedLoan}
        onSuccess={handleUpdateSuccess}
        onRefresh={loadLoans}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={cancelDeleteLoan}>
        <DialogTitle>Delete Loan</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the loan "{loanToDelete?.purpose}"? 
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteLoan} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDeleteLoan} 
            color="error" 
            variant="contained"
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={20} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

        {/* Transaction History Dialog */}
        <LoanTransactionHistory
          open={showHistoryDialog}
          onClose={closeHistoryDialog}
          loanId={loanForHistory?.id || ''}
          loanPurpose={loanForHistory?.purpose}
          loanData={loanForHistory || undefined} // Add this line to pass loan data
        />

      {/* Upcoming Payments Dialog */}
      <Dialog open={showUpcomingDialog} onClose={() => setShowUpcomingDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <EventAvailable color="info" />
            <Typography variant="h6">
              Upcoming Payments (Next 30 Days)
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {upcomingPayments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No upcoming payments in the next 30 days
            </Typography>
          ) : (
            <List>
              {upcomingPayments.map((payment, index) => (
                <ListItem 
                  key={index}
                  sx={{ 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    mb: 1,
                    bgcolor: 'background.default'
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle2">
                          {payment.loanPurpose}
                        </Typography>
                        <Chip 
                          label={formatDueDate(payment.dueDate)} 
                          size="small" 
                          color={payment.daysUntilDue <= 3 ? 'warning' : 'info'}
                        />
                      </Box>
                    }
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          Amount: ${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Installment #{payment.installmentNumber} • Due {formatDate(payment.dueDate)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpcomingDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Monthly Payment Breakdown Dialog */}
      <Dialog open={showMonthlyPaymentDialog} onClose={() => setShowMonthlyPaymentDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonth color="info" />
            <Typography variant="h6">
              Monthly Payment Breakdown
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {monthlyPaymentData ? (
            <>
              {/* Summary Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'info.lighter', textAlign: 'center' }}>
                    <Typography variant="h5" color="info.main" sx={{ fontWeight: 600 }}>
                      ${monthlyPaymentData.totalMonthlyPayment.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Monthly Payment
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'warning.lighter', textAlign: 'center' }}>
                    <Typography variant="h5" color="warning.main" sx={{ fontWeight: 600 }}>
                      ${monthlyPaymentData.totalRemainingBalance.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Remaining Balance
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Paper elevation={0} sx={{ p: 2, bgcolor: 'success.lighter', textAlign: 'center' }}>
                    <Typography variant="h5" color="success.main" sx={{ fontWeight: 600 }}>
                      {monthlyPaymentData.activeLoanCount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Active Loan{monthlyPaymentData.activeLoanCount !== 1 ? 's' : ''}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Loan List */}
              <Box sx={{ mt: 3 }}>
                <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                  Active Loans
                </Typography>
                {monthlyPaymentData.loans.length === 0 ? (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                    No active loans
                  </Typography>
                ) : (
                  <List>
                    {monthlyPaymentData.loans.map((loan, index) => (
                      <ListItem 
                        key={loan.id}
                        sx={{ 
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: 1,
                          mb: 1,
                          bgcolor: 'background.default',
                          flexDirection: 'column',
                          alignItems: 'stretch'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 1 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip 
                              label={`#${index + 1}`} 
                              size="small" 
                              color="primary"
                              sx={{ fontWeight: 600 }}
                            />
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {loan.purpose}
                            </Typography>
                          </Box>
                          {loan.interestRate > 0 && (
                            <Chip 
                              label={`${loan.interestRate}% APR`} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Monthly Payment
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, color: 'info.main' }}>
                              ${loan.monthlyPayment.toLocaleString(undefined, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {loan.totalInstallments && loan.installmentsRemaining !== undefined
                                ? `${loan.totalInstallments - loan.installmentsRemaining} months out of ${loan.totalInstallments} months`
                                : 'N/A'}
                            </Typography>
                          </Grid>
                          <Grid item xs={6}>
                            <Typography variant="caption" color="text.secondary">
                              Remaining Balance
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600 }}>
                              ${loan.remainingBalance.toLocaleString(undefined, { 
                                minimumFractionDigits: 2, 
                                maximumFractionDigits: 2 
                              })}
                            </Typography>
                          </Grid>
                        </Grid>

                        {/* Progress bar showing payment completion percentage */}
                        <Box sx={{ mt: 2, width: '100%' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                              Payment Progress
                            </Typography>
                            <Typography variant="caption" color="success.main" sx={{ fontWeight: 600 }}>
                              {loan.totalInstallments && loan.installmentsRemaining !== undefined
                                ? `${((loan.totalInstallments - loan.installmentsRemaining) / loan.totalInstallments * 100).toFixed(1)}%`
                                : '0%'}
                            </Typography>
                          </Box>
                          
                          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                            {loan.totalInstallments && loan.installmentsRemaining !== undefined
                              ? `${loan.totalInstallments - loan.installmentsRemaining} months out of ${loan.totalInstallments} months`
                              : 'N/A'}
                          </Typography>
                          
                          <Box
                            sx={{
                              width: '100%',
                              height: 10,
                              bgcolor: 'grey.200',
                              borderRadius: 1,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'grey.300'
                            }}
                          >
                            <Box
                              sx={{
                                width: `${loan.totalInstallments && loan.installmentsRemaining !== undefined 
                                  ? ((loan.totalInstallments - loan.installmentsRemaining) / loan.totalInstallments) * 100 
                                  : 0}%`,
                                height: '100%',
                                bgcolor: 'success.main',
                                borderRadius: 1,
                                transition: 'width 0.3s ease'
                              }}
                            />
                          </Box>
                          
                          <Typography variant="caption" color="warning.main" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
                            {loan.installmentsRemaining !== undefined
                              ? `${loan.installmentsRemaining} months remaining`
                              : 'N/A'}
                          </Typography>
                        </Box>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            </>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              Loading payment data...
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMonthlyPaymentDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoanDashboard;
