import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  MenuItem,
  Alert,
  CircularProgress,
  Chip,
  Divider,
} from '@mui/material';
import {
  Lock,
  CalendarMonth,
  Warning,
} from '@mui/icons-material';
import { BankAccount } from '../../types/bankAccount';
import { apiService } from '../../services/api';

interface CloseMonthDialogProps {
  open: boolean;
  onClose: () => void;
  account: BankAccount | null;
  onMonthClosed?: () => void;
}

interface ClosedMonth {
  id: string;
  bankAccountId: string;
  year: number;
  month: number;
  monthName: string;
  closedBy: string;
  closedAt: string;
  notes?: string;
}

const CloseMonthDialog: React.FC<CloseMonthDialogProps> = ({
  open,
  onClose,
  account,
  onMonthClosed,
}) => {
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [closedMonths, setClosedMonths] = useState<ClosedMonth[]>([]);
  const [loadingClosedMonths, setLoadingClosedMonths] = useState(false);

  const monthNames = [
    '', 'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Generate years (current year and previous 5 years)
  const availableYears = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

  useEffect(() => {
    if (open && account) {
      loadClosedMonths();
      // Set to current month by default
      const now = new Date();
      setSelectedYear(now.getFullYear());
      setSelectedMonth(now.getMonth() + 1);
      setNotes('');
      setError('');
    }
  }, [open, account]);

  const loadClosedMonths = async () => {
    if (!account) return;

    try {
      setLoadingClosedMonths(true);
      const closed = await apiService.getClosedMonths(account.id);
      setClosedMonths(closed);
    } catch (err: any) {
      console.error('Failed to load closed months:', err);
    } finally {
      setLoadingClosedMonths(false);
    }
  };

  const isMonthClosed = (year: number, month: number): boolean => {
    return closedMonths.some(cm => cm.year === year && cm.month === month);
  };

  const handleCloseMonth = async () => {
    if (!account) return;

    // Validation
    if (selectedMonth < 1 || selectedMonth > 12) {
      setError('Please select a valid month');
      return;
    }

    // Check if month is already closed
    if (isMonthClosed(selectedYear, selectedMonth)) {
      setError(`${monthNames[selectedMonth]} ${selectedYear} is already closed`);
      return;
    }

    // Check if trying to close a future month
    const selectedDate = new Date(selectedYear, selectedMonth - 1, 1);
    const currentDate = new Date();
    if (selectedDate > currentDate) {
      setError('Cannot close a future month');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await apiService.closeMonth(account.id, selectedYear, selectedMonth, notes || undefined);
      
      // Reload closed months
      await loadClosedMonths();
      
      // Reset form
      setNotes('');
      
      if (onMonthClosed) {
        onMonthClosed();
      }
      
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to close month');
    } finally {
      setLoading(false);
    }
  };

  const selectedMonthIsClosed = isMonthClosed(selectedYear, selectedMonth);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={1}>
          <Lock />
          <Typography variant="h6">Close Month</Typography>
        </Box>
        {account && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Account: {account.accountName}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {selectedMonthIsClosed && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {monthNames[selectedMonth]} {selectedYear} is already closed.
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            select
            label="Year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            margin="normal"
            disabled={loading}
          >
            {availableYears.map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            select
            label="Month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            margin="normal"
            disabled={loading}
          >
            {monthNames.slice(1).map((month, index) => (
              <MenuItem key={index + 1} value={index + 1}>
                {month}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            margin="normal"
            placeholder="Add any notes about closing this month..."
            disabled={loading}
          />
        </Box>

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" gutterBottom>
          Closed Months ({closedMonths.length})
        </Typography>
        
        {loadingClosedMonths ? (
          <Box display="flex" justifyContent="center" p={2}>
            <CircularProgress size={24} />
          </Box>
        ) : closedMonths.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No months closed yet
          </Typography>
        ) : (
          <Box sx={{ maxHeight: 200, overflowY: 'auto', mt: 1 }}>
            {closedMonths.map((cm) => (
              <Chip
                key={cm.id}
                icon={<Lock />}
                label={`${cm.monthName} ${cm.year}`}
                color="primary"
                size="small"
                sx={{ m: 0.5 }}
              />
            ))}
          </Box>
        )}

        <Alert severity="warning" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Warning:</strong> Once a month is closed, transactions in that month cannot be edited or deleted. 
            This helps maintain data integrity and audit trail.
          </Typography>
        </Alert>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleCloseMonth}
          variant="contained"
          color="primary"
          disabled={loading || selectedMonthIsClosed}
          startIcon={loading ? <CircularProgress size={16} /> : <Lock />}
        >
          Close Month
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CloseMonthDialog;

