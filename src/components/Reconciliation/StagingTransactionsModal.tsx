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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { Close, Delete, CheckCircle, Edit, Save, Cancel, Add } from '@mui/icons-material';
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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<StagingTransaction | null>(null);
  const [newTransactionIds, setNewTransactionIds] = useState<Set<string>>(new Set());
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

  const handleEditTransaction = (transaction: StagingTransaction) => {
    setEditingId(transaction.id);
    setEditingTransaction({ ...transaction });
  };

  const handleCancelEdit = () => {
    // If canceling a newly added transaction, remove it from the list
    if (editingId && newTransactionIds.has(editingId)) {
      setTransactions(transactions.filter(t => t.id !== editingId));
      setNewTransactionIds(prev => {
        const updated = new Set(prev);
        updated.delete(editingId);
        return updated;
      });
    }
    setEditingId(null);
    setEditingTransaction(null);
  };

  const handleSaveEdit = () => {
    if (!editingTransaction) return;
    
    setTransactions(transactions.map(t => 
      t.id === editingTransaction.id ? editingTransaction : t
    ));
    
    // If this was a newly added transaction, mark it as saved
    if (newTransactionIds.has(editingTransaction.id)) {
      setNewTransactionIds(prev => {
        const updated = new Set(prev);
        updated.delete(editingTransaction.id);
        return updated;
      });
    }
    
    setEditingId(null);
    setEditingTransaction(null);
  };

  const handleEditFieldChange = (field: keyof StagingTransaction, value: any) => {
    if (!editingTransaction) return;
    setEditingTransaction({ ...editingTransaction, [field]: value });
  };

  const handleAddTransaction = () => {
    if (!upload) return;
    
    // If currently editing a transaction, save it first
    if (editingId && editingTransaction) {
      setTransactions(transactions.map(t => 
        t.id === editingTransaction.id ? editingTransaction : t
      ));
    }
    
    const newTransaction: StagingTransaction = {
      id: `temp-${Date.now()}`, // Temporary ID for new transactions
      uploadId: upload.id,
      transactionDate: formData.statementStartDate || new Date().toISOString().split('T')[0],
      amount: 0,
      transactionType: 'DEBIT',
      description: '',
      referenceNumber: '',
      merchant: '',
      category: '',
      balanceAfterTransaction: 0,
    };
    
    // Add the new transaction and immediately set it to edit mode
    const updatedTransactions = editingId && editingTransaction
      ? transactions.map(t => t.id === editingTransaction.id ? editingTransaction : t)
      : transactions;
    
    setTransactions([...updatedTransactions, newTransaction]);
    setNewTransactionIds(prev => new Set(prev).add(newTransaction.id));
    setEditingId(newTransaction.id);
    setEditingTransaction({ ...newTransaction });
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
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
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

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Typography variant="subtitle2">
            Extracted Transactions ({transactions.length})
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={handleAddTransaction}
            disabled={isLoading}
          >
            Add Transaction
          </Button>
        </Box>
        
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 400, overflowX: 'auto' }}>
            <Table stickyHeader size="small" sx={{ minWidth: 1000 }}>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ minWidth: 120, maxWidth: 120 }}>Date</TableCell>
                  <TableCell sx={{ minWidth: 200 }}>Description</TableCell>
                  <TableCell sx={{ minWidth: 100, maxWidth: 100 }}>Type</TableCell>
                  <TableCell align="right" sx={{ minWidth: 120, maxWidth: 120 }}>Amount</TableCell>
                  <TableCell sx={{ minWidth: 150, maxWidth: 150 }}>Reference</TableCell>
                  <TableCell sx={{ minWidth: 150, maxWidth: 150 }}>Merchant</TableCell>
                  <TableCell sx={{ minWidth: 150, maxWidth: 150 }}>Category</TableCell>
                  <TableCell align="center" sx={{ minWidth: 100, maxWidth: 100 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((t) => (
                  <TableRow key={t.id}>
                    {editingId === t.id ? (
                      <>
                        <TableCell sx={{ minWidth: 120, maxWidth: 120 }}>
                          <TextField
                            type="date"
                            value={editingTransaction?.transactionDate.split('T')[0] || ''}
                            onChange={(e) => handleEditFieldChange('transactionDate', e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 200 }}>
                          <TextField
                            value={editingTransaction?.description || ''}
                            onChange={(e) => handleEditFieldChange('description', e.target.value)}
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 100, maxWidth: 100 }}>
                          <FormControl size="small" fullWidth>
                            <Select
                              value={editingTransaction?.transactionType || 'DEBIT'}
                              onChange={(e) => handleEditFieldChange('transactionType', e.target.value)}
                            >
                              <MenuItem value="DEBIT">DEBIT</MenuItem>
                              <MenuItem value="CREDIT">CREDIT</MenuItem>
                            </Select>
                          </FormControl>
                        </TableCell>
                        <TableCell align="right" sx={{ minWidth: 120, maxWidth: 120 }}>
                          <TextField
                            type="number"
                            value={editingTransaction?.amount || 0}
                            onChange={(e) => handleEditFieldChange('amount', parseFloat(e.target.value) || 0)}
                            size="small"
                            fullWidth
                            inputProps={{ step: 0.01, min: 0 }}
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 150, maxWidth: 150 }}>
                          <TextField
                            value={editingTransaction?.referenceNumber || ''}
                            onChange={(e) => handleEditFieldChange('referenceNumber', e.target.value)}
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 150, maxWidth: 150 }}>
                          <TextField
                            value={editingTransaction?.merchant || ''}
                            onChange={(e) => handleEditFieldChange('merchant', e.target.value)}
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell sx={{ minWidth: 150, maxWidth: 150 }}>
                          <TextField
                            value={editingTransaction?.category || ''}
                            onChange={(e) => handleEditFieldChange('category', e.target.value)}
                            size="small"
                            fullWidth
                          />
                        </TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={handleSaveEdit}
                            title="Save"
                          >
                            <Save fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="default" 
                            onClick={handleCancelEdit}
                            title="Cancel"
                          >
                            <Cancel fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell>{new Date(t.transactionDate).toLocaleDateString()}</TableCell>
                        <TableCell>{t.description || '-'}</TableCell>
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
                        <TableCell>{t.merchant || '-'}</TableCell>
                        <TableCell>{t.category || '-'}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            size="small" 
                            color="primary" 
                            onClick={() => handleEditTransaction(t)}
                            title="Edit"
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small" 
                            color="error" 
                            onClick={() => handleRemoveTransaction(t.id)}
                            title="Delete"
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} align="center">No transactions found.</TableCell>
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


