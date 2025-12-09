import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Skeleton,
  Alert,
  Grid,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  CalendarMonth,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Warning,
  CheckCircle,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useCurrency } from '../../contexts/CurrencyContext';
import { apiService } from '../../services/api';
import { Loan, RepaymentSchedule, PaymentStatus } from '../../types/loan';
import { useNavigate } from 'react-router-dom';

interface LoanPaymentDay {
  date: number;
  payments: Array<{
    loanId: string;
    loanPurpose: string;
    amount: number;
    status: PaymentStatus;
    installmentNumber: number;
  }>;
}

const LoanScheduleCalendar: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const navigate = useNavigate();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [schedules, setSchedules] = useState<Map<string, RepaymentSchedule[]>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [currentDate, setCurrentDate] = useState(new Date());

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  useEffect(() => {
    if (user) {
      loadLoanSchedules();
    }
  }, [user, currentMonth, currentYear]);

  const loadLoanSchedules = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError('');

      // Get all user loans
      const userLoans = await apiService.getUserLoans(user.id);
      
      // Filter only ACTIVE loans
      const activeLoans = userLoans.filter(
        (loan) => loan.status === 'ACTIVE' || loan.status === 'APPROVED'
      );
      
      setLoans(activeLoans);

      // Load schedules for all active loans
      const scheduleMap = new Map<string, RepaymentSchedule[]>();
      const schedulePromises = activeLoans.map(async (loan) => {
        try {
          const schedule = await apiService.getLoanSchedule(loan.id);
          scheduleMap.set(loan.id, schedule);
        } catch (err) {
          console.error(`Failed to load schedule for loan ${loan.id}:`, err);
        }
      });

      await Promise.all(schedulePromises);
      setSchedules(scheduleMap);
    } catch (err: any) {
      console.error('Error loading loan schedules:', err);
      setError(err?.message || 'Failed to load loan schedules');
    } finally {
      setLoading(false);
    }
  };

  // Get payments for the current month
  const getMonthlyPayments = (): LoanPaymentDay[] => {
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const paymentsByDay: Map<number, LoanPaymentDay['payments']> = new Map();

    // Initialize all days
    for (let day = 1; day <= daysInMonth; day++) {
      paymentsByDay.set(day, []);
    }

    // Process each loan's schedule
    loans.forEach((loan) => {
      const loanSchedule = schedules.get(loan.id) || [];
      
      loanSchedule.forEach((scheduleItem) => {
        const dueDate = new Date(scheduleItem.dueDate);
        
        // Check if payment is in the current month
        if (
          dueDate.getMonth() === currentMonth &&
          dueDate.getFullYear() === currentYear
        ) {
          const day = dueDate.getDate();
          const existingPayments = paymentsByDay.get(day) || [];
          
          existingPayments.push({
            loanId: loan.id,
            loanPurpose: loan.purpose || 'Loan Payment',
            amount: scheduleItem.totalAmount,
            status: scheduleItem.status,
            installmentNumber: scheduleItem.installmentNumber,
          });
          
          paymentsByDay.set(day, existingPayments);
        }
      });
    });

    // Convert to array format
    const result: LoanPaymentDay[] = [];
    for (let day = 1; day <= daysInMonth; day++) {
      result.push({
        date: day,
        payments: paymentsByDay.get(day) || [],
      });
    }

    return result;
  };

  const monthlyPayments = getMonthlyPayments();
  const totalPayments = monthlyPayments.reduce(
    (sum, day) => sum + day.payments.reduce((daySum, p) => daySum + p.amount, 0),
    0
  );

  // Get first day of month (0 = Sunday, 1 = Monday, etc.)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  
  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const getStatusColor = (status: PaymentStatus): 'default' | 'success' | 'warning' | 'error' => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'success';
      case PaymentStatus.OVERDUE:
        return 'error';
      case PaymentStatus.PENDING:
        return 'warning';
      case PaymentStatus.PARTIAL:
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return <CheckCircle sx={{ fontSize: 12 }} />;
      case PaymentStatus.OVERDUE:
        return <Warning sx={{ fontSize: 12 }} />;
      default:
        return <CreditCard sx={{ fontSize: 12 }} />;
    }
  };

  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  return (
    <Card sx={{ border: '1px solid #e5e5e5' }}>
      <CardContent sx={{ p: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: '#1a1a1a', display: 'flex', alignItems: 'center', gap: 1 }}>
            <CalendarMonth sx={{ fontSize: 20 }} />
            Loan Schedules
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => navigateMonth('prev')}
              sx={{ p: 0.5 }}
            >
              <ChevronLeft />
            </IconButton>
            <Typography variant="body2" sx={{ minWidth: 140, textAlign: 'center', fontWeight: 500 }}>
              {monthNames[currentMonth]} {currentYear}
            </Typography>
            <IconButton
              size="small"
              onClick={() => navigateMonth('next')}
              sx={{ p: 0.5 }}
            >
              <ChevronRight />
            </IconButton>
          </Box>
        </Box>
        
        {!loading && loans.length > 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<CreditCard />}
              onClick={() => navigate('/loans')}
            >
              View All Loans
            </Button>
          </Box>
        )}

        {loading ? (
          <Box>
            <Skeleton variant="rectangular" width="100%" height={200} sx={{ borderRadius: 1, mb: 2 }} />
            <Skeleton variant="text" width="60%" />
          </Box>
        ) : error ? (
          <>
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
            {/* Still show calendar even on error */}
          </>
        ) : null}

        {/* Calendar Grid - Always show, even when no loans */}
        {!loading && (
          <>
            <Grid container spacing={0.5} sx={{ mb: 2 }}>
              {/* Day headers */}
              {dayNames.map((day) => (
                <Grid item xs={12 / 7} key={day}>
                  <Box
                    sx={{
                      textAlign: 'center',
                      py: 1,
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      color: '#666',
                      borderBottom: '1px solid #e5e5e5',
                    }}
                  >
                    {day}
                  </Box>
                </Grid>
              ))}

              {/* Empty cells for days before month starts */}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <Grid item xs={12 / 7} key={`empty-${index}`}>
                  <Box sx={{ minHeight: 60 }} />
                </Grid>
              ))}

              {/* Calendar days */}
              {monthlyPayments.map((dayData) => {
                const isToday = isCurrentMonth && dayData.date === today.getDate();
                const hasPayments = dayData.payments.length > 0;

                return (
                  <Grid item xs={12 / 7} key={dayData.date}>
                    <Box
                      sx={{
                        minHeight: 60,
                        p: 0.5,
                        border: isToday ? '2px solid #1976d2' : '1px solid #e5e5e5',
                        borderRadius: 1,
                        backgroundColor: isToday ? 'rgba(25, 118, 210, 0.05)' : 'transparent',
                        position: 'relative',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          fontWeight: isToday ? 700 : 500,
                          color: isToday ? '#1976d2' : '#666',
                          display: 'block',
                          mb: 0.5,
                        }}
                      >
                        {dayData.date}
                      </Typography>
                      
                      {hasPayments && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.25 }}>
                          {dayData.payments.slice(0, 2).map((payment, idx) => (
                            <Tooltip
                              key={idx}
                              title={`${payment.loanPurpose}: ${formatCurrency(payment.amount)}`}
                              arrow
                            >
                              <Chip
                                icon={getStatusIcon(payment.status)}
                                label={formatCurrency(payment.amount)}
                                size="small"
                                color={getStatusColor(payment.status)}
                                sx={{
                                  height: 16,
                                  fontSize: '0.65rem',
                                  '& .MuiChip-icon': {
                                    marginLeft: 0.5,
                                    fontSize: 10,
                                  },
                                  '& .MuiChip-label': {
                                    paddingLeft: 0.5,
                                    paddingRight: 0.5,
                                  },
                                }}
                              />
                            </Tooltip>
                          ))}
                          {dayData.payments.length > 2 && (
                            <Typography variant="caption" sx={{ fontSize: '0.6rem', color: '#666' }}>
                              +{dayData.payments.length - 2} more
                            </Typography>
                          )}
                        </Box>
                      )}
                    </Box>
                  </Grid>
                );
              })}
            </Grid>

            {/* Summary - Only show if there are loans */}
            {loans.length > 0 && (
              <>
                <Box
                  sx={{
                    mt: 2,
                    pt: 2,
                    borderTop: '1px solid #e5e5e5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 1,
                  }}
                >
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                    Total Due This Month:
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {formatCurrency(totalPayments)}
                  </Typography>
                </Box>

                {/* Legend - Only show if there are loans */}
                <Box sx={{ mt: 1.5, display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip
                    icon={<CheckCircle sx={{ fontSize: 12 }} />}
                    label="Paid"
                    size="small"
                    color="success"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                  <Chip
                    icon={<Warning sx={{ fontSize: 12 }} />}
                    label="Pending"
                    size="small"
                    color="warning"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                  <Chip
                    icon={<Warning sx={{ fontSize: 12 }} />}
                    label="Overdue"
                    size="small"
                    color="error"
                    sx={{ fontSize: '0.7rem', height: 20 }}
                  />
                </Box>
              </>
            )}

            {/* Show message if no loans */}
            {!error && loans.length === 0 && (
              <Box
                sx={{
                  mt: 2,
                  pt: 2,
                  borderTop: '1px solid #e5e5e5',
                  textAlign: 'center',
                }}
              >
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1 }}>
                  No active loans. Apply for a loan to see payment schedules here.
                </Typography>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<CreditCard />}
                  onClick={() => navigate('/loans')}
                >
                  Apply for Loan
                </Button>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default LoanScheduleCalendar;

