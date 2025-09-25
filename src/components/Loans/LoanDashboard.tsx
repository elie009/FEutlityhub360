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
} from '@mui/material';
import {
  Add as AddIcon,
  AccountBalance,
  TrendingUp,
  Schedule,
  Payment,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { apiService } from '../../services/api';
import { Loan } from '../../types/loan';
import { getErrorMessage } from '../../utils/validation';
import LoanCard from './LoanCard';
import LoanApplicationForm from './LoanApplicationForm';
import PaymentForm from './PaymentForm';
import LoanUpdateForm from './LoanUpdateForm';

const LoanDashboard: React.FC = () => {
  const { user } = useAuth();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedLoanId, setSelectedLoanId] = useState<string>('');
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  useEffect(() => {
    if (user) {
      loadLoans();
    }
  }, [user]);

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
    } catch (err: unknown) {
      console.error('Error loading loans:', err);
      setError(getErrorMessage(err, 'Failed to load loans'));
      setLoans([]); // Ensure we always have an array
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplicationSuccess = (loanId: string) => {
    setShowApplicationForm(false);
    loadLoans(); // Refresh the loans list
  };

  const handleMakePayment = (loanId: string) => {
    setSelectedLoanId(loanId);
    setShowPaymentForm(true);
  };

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedLoanId('');
    loadLoans(); // Refresh the loans list
  };

  const handleUpdateLoan = (loan: Loan) => {
    setSelectedLoan(loan);
    setShowUpdateForm(true);
  };

  const handleUpdateSuccess = (updatedLoan: Loan) => {
    // Update the loan in the loans array
    setLoans(prevLoans => 
      prevLoans.map(loan => 
        loan.id === updatedLoan.id ? updatedLoan : loan
      )
    );
    setShowUpdateForm(false);
    setSelectedLoan(null);
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
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <AccountBalance sx={{ mr: 2, color: 'primary.main' }} />
                <Box>
                  <Typography variant="h6">
                    ${getTotalOutstanding().toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Total Outstanding
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

        <Grid item xs={12} sm={6} md={3}>
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

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Payment sx={{ mr: 2, color: 'error.main' }} />
                <Box>
                  <Typography variant="h6">
                    {getOverdueLoansCount()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Overdue Loans
                  </Typography>
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
        <DialogTitle>Make Payment</DialogTitle>
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
      />
    </Box>
  );
};

export default LoanDashboard;
