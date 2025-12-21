import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  IconButton,
  Box,
  CircularProgress,
  Alert,
  TextField,
  Chip,
} from '@mui/material';
import { Close, Delete, CheckCircle } from '@mui/icons-material';
import { apiService } from '../../services/api';
import { StagingTransaction, BankStatementUpload } from '../../types/reconciliation';
import { useCurrency } from '../../contexts/CurrencyContext';
import { getErrorMessage } from '../../utils/validation';

interface StagingTransactionsModalProps {
  open: boolean;
  onClose: () => void;
  upload: BankStatementUpload | null;
  onSuccess: () => void;
}

const StagingTransactionsModal: React.FC<StagingTransactionsModalProps> = ({
  open,
  onClose,
  upload,
  onSuccess,
}) => {
  const { formatCurrency } = useCurrency();
  const [transactions, setTransactions] = useState<StagingTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState({
    statementName: '',
    statementStartDate: '',
    statementEndDate: '',
    openingBalance: 0,
    closingBalance: 0,
  });

  useEffect(() => {
    if (open && upload) {
      loadStagingTransactions();
      setFormData({
        statementName: upload.originalFileName.replace(/\.[^/.]+$/, ""),
        statementStartDate: '',
        statementEndDate: '',
        openingBalance: 0,
        closingBalance: 0,
      });
    }
  }, [open, upload]);

  const loadStagingTransactions = async () => {
    if (!upload) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await apiService.getStagingTransactions(upload.id);
      setTransactions(data);
      
      // Auto-populate dates if transactions exist
      if (data.length > 0) {
        const sorted = [...data].sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime());
        setFormData(prev => ({
          ...prev,
          statementStartDate: sorted[0].transactionDate.split('T')[0],
          statementEndDate: sorted[sorted.length - 1].transactionDate.split('T')[0],
        }));
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load extracted transactions.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const handleConfirm = async () => {
    if (!upload) return;
    if (!formData.statementName.trim()) {
      setError('Statement name is required');
      return;
    }
    if (!formData.statementStartDate || !formData.statementEndDate) {
      setError('Statement period is required');
      return;
    }

    setIsConfirming(true);
    setError('');
    try {
      await apiService.confirmUpload(upload.id, {
        ...formData,
        transactions: transactions
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to confirm transactions.'));
    } finally {
      setIsConfirming(false);
    }
  };

  if (!upload) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Review Extracted Transactions</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
        <Typography variant="caption" color="textSecondary">
          File: {upload.originalFileName} | Status: {upload.status}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>Statement Details</Typography>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <TextField
              label="Statement Name"
              value={formData.statementName}
              onChange={(e) => setFormData({ ...formData, statementName: e.target.value })}
              size="small"
              sx={{ flexGrow: 1 }}
            />
            <TextField
              label="Start Date"
              type="date"
              value={formData.statementStartDate}
              onChange={(e) => setFormData({ ...formData, statementStartDate: e.target.value })}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={formData.statementEndDate}
              onChange={(e) => setFormData({ ...formData, statementEndDate: e.target.value })}
              size="small"
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Opening Balance"
              type="number"
              value={formData.openingBalance}
              onChange={(e) => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
              size="small"
              sx={{ width: 150 }}
            />
            <TextField
              label="Closing Balance"
              type="number"
              value={formData.closingBalance}
              onChange={(e) => setFormData({ ...formData, closingBalance: parseFloat(e.target.value) || 0 })}
              size="small"
              sx={{ width: 150 }}
            />
          </Box>
        </Box>

        <Typography variant="subtitle2" gutterBottom>
          Extracted Transactions ({transactions.length})
        </Typography>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>{new Date(t.transactionDate).toLocaleDateString()}</TableCell>
                    <TableCell>{t.description}</TableCell>
                    <TableCell>
                      <Chip 
                        label={t.transactionType} 
                        size="small" 
                        color={t.transactionType === 'CREDIT' ? 'success' : 'default'}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">{formatCurrency(t.amount)}</TableCell>
                    <TableCell>{t.referenceNumber || '-'}</TableCell>
                    <TableCell align="center">
                      <IconButton size="small" color="error" onClick={() => handleRemoveTransaction(t.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No transactions found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isConfirming}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleConfirm} 
          disabled={isConfirming || transactions.length === 0 || isLoading}
          startIcon={isConfirming ? <CircularProgress size={20} /> : <CheckCircle />}
        >
          {isConfirming ? 'Confirming...' : 'Confirm & Finalize'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default StagingTransactionsModal;


