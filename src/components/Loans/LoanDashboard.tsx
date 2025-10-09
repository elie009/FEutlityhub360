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
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalance,
  TrendingUp,
  Schedule,
  Payment,
  CalendarMonth,
  EventAvailable,
  NotificationImportant,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Loan, UpcomingPayment, OverduePayment } from '../../types/loan';
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
  const [overduePayments, setOverduePayments] = useState<OverduePayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [showUpcomingDialog, setShowUpcomingDialog] = useState(false);
  const [showOverdueDialog, setShowOverdueDialog] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
  const [loanToDelete, setLoanToDelete] = useState<Loan | null>(null);
  const [loanForHistory, setLoanForHistory] = useState<Loan | null>(null);

  useEffect(() => {
    if (user) {
      loadLoans();
    }
  }, [user]);

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
      
      // Load overdue payments
      const overdue = await apiService.getOverduePayments();
      setOverduePayments(overdue);
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

  const getOverdueLoansCount = (): number => {
    if (!Array.isArray(loans)) {
      console.error('Loans is not an array:', loans);
      return 0;
    }
    return loans.filter(loan => loan.status === 'OVERDUE').length;
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
        <Grid item xs={12} sm={6} md={2}>
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

        <Grid item xs={12} sm={6} md={2}>
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

        <Grid item xs={12} sm={6} md={2}>
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

        {/* Upcoming Payments Card */}
        <Grid item xs={12} sm={6} md={3}>
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
                <Box>
                  <Typography variant="h6">
                    {upcomingPayments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Upcoming Payments
                  </Typography>
                  {upcomingPayments.length > 0 && (
                    <Typography variant="caption" color="info.main" sx={{ fontWeight: 600 }}>
                      Click to view
                    </Typography>
                  )}
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Overdue Payments Card */}
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              cursor: overduePayments.length > 0 ? 'pointer' : 'default',
              '&:hover': overduePayments.length > 0 ? { boxShadow: 3 } : {},
              bgcolor: overduePayments.length > 0 ? 'error.lighter' : 'background.paper'
            }}
            onClick={() => overduePayments.length > 0 && setShowOverdueDialog(true)}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <NotificationImportant sx={{ mr: 2, color: 'error.main' }} />
                <Box>
                  <Typography variant="h6" color={overduePayments.length > 0 ? 'error.main' : 'text.primary'}>
                    {overduePayments.length}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Payments
                  </Typography>
                  {overduePayments.length > 0 && (
                    <Typography variant="caption" color="error.main" sx={{ fontWeight: 600 }}>
                      Click to view
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

      {/* Overdue Payments Dialog */}
      <Dialog open={showOverdueDialog} onClose={() => setShowOverdueDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationImportant color="error" />
            <Typography variant="h6">
              Overdue Payments
            </Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {overduePayments.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
              No overdue payments
            </Typography>
          ) : (
            <>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  You have {overduePayments.length} overdue payment{overduePayments.length !== 1 ? 's' : ''}. 
                  Please make payment(s) as soon as possible to avoid penalties.
                </Typography>
              </Alert>
              <List>
                {overduePayments.map((payment, index) => (
                  <ListItem 
                    key={index}
                    sx={{ 
                      border: '1px solid',
                      borderColor: 'error.main',
                      borderRadius: 1,
                      mb: 1,
                      bgcolor: 'error.lighter'
                    }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="subtitle2" color="error.main">
                            {payment.loanPurpose}
                          </Typography>
                          <Chip 
                            label={`Overdue by ${payment.daysOverdue} day${payment.daysOverdue !== 1 ? 's' : ''}`} 
                            size="small" 
                            color="error"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            Amount: ${payment.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Installment #{payment.installmentNumber} • Was due {formatDate(payment.dueDate)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOverdueDialog(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LoanDashboard;
