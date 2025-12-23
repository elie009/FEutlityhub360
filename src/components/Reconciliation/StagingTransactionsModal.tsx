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
import { Close, Delete, CheckCircle, Edit, Save, Cancel, Add, DragHandle } from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { apiService } from '../../services/api';
import { StagingTransaction, BankStatementUpload } from '../../types/reconciliation';
import { useCurrency } from '../../contexts/CurrencyContext';
import { getErrorMessage } from '../../utils/validation';

// Sortable Row Component
interface SortableRowProps {
  transaction: StagingTransaction;
  editingId: string | null;
  editingTransaction: StagingTransaction | null;
  formatCurrency: (amount: number) => string;
  onEdit: (transaction: StagingTransaction) => void;
  onRemove: (id: string) => void;
  onEditFieldChange: (field: keyof StagingTransaction, value: any) => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
  categories: Array<{ id: string; name: string; type?: string }>;
  loadingCategories: boolean;
}

const SortableRow: React.FC<SortableRowProps> = ({
  transaction,
  editingId,
  editingTransaction,
  formatCurrency,
  onEdit,
  onRemove,
  onEditFieldChange,
  onSaveEdit,
  onCancelEdit,
  categories,
  loadingCategories,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: transaction.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const isEditing = editingId === transaction.id;

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      sx={{
        cursor: isEditing ? 'default' : 'move',
        '&:hover': {
          backgroundColor: isEditing ? 'transparent' : 'action.hover',
        },
      }}
    >
      {isEditing ? (
        <>
          <TableCell sx={{ minWidth: 50, maxWidth: 50, p: 1 }}>
            <IconButton
              size="small"
              {...attributes}
              {...listeners}
              disabled
              sx={{ cursor: 'not-allowed', opacity: 0.3 }}
            >
              <DragHandle fontSize="small" />
            </IconButton>
          </TableCell>
          <TableCell sx={{ minWidth: 120, maxWidth: 120 }}>
            <TextField
              type="date"
              value={editingTransaction?.transactionDate?.split('T')[0] || ''}
              onChange={(e) => onEditFieldChange('transactionDate', e.target.value)}
              size="small"
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </TableCell>
          <TableCell sx={{ minWidth: 200 }}>
            <TextField
              value={editingTransaction?.description || ''}
              onChange={(e) => onEditFieldChange('description', e.target.value)}
              size="small"
              fullWidth
            />
          </TableCell>
          <TableCell sx={{ minWidth: 100, maxWidth: 100 }}>
            <FormControl size="small" fullWidth>
              <Select
                value={editingTransaction?.transactionType || 'DEBIT'}
                onChange={(e) => onEditFieldChange('transactionType', e.target.value)}
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
              onChange={(e) => onEditFieldChange('amount', parseFloat(e.target.value) || 0)}
              size="small"
              fullWidth
              inputProps={{ step: 0.01, min: 0 }}
            />
          </TableCell>
          <TableCell sx={{ minWidth: 150, maxWidth: 150 }}>
            <TextField
              value={editingTransaction?.referenceNumber || ''}
              onChange={(e) => onEditFieldChange('referenceNumber', e.target.value)}
              size="small"
              fullWidth
            />
          </TableCell>
          <TableCell sx={{ minWidth: 150, maxWidth: 150 }}>
            <TextField
              value={editingTransaction?.merchant || ''}
              onChange={(e) => onEditFieldChange('merchant', e.target.value)}
              size="small"
              fullWidth
            />
          </TableCell>
          <TableCell sx={{ minWidth: 150, maxWidth: 150 }}>
            <FormControl size="small" fullWidth>
              <Select
                value={editingTransaction?.category || ''}
                onChange={(e) => onEditFieldChange('category', e.target.value)}
                displayEmpty
                disabled={loadingCategories}
              >
                <MenuItem value="">
                  <em>Select Category</em>
                </MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </TableCell>
          <TableCell align="center">
            <IconButton 
              size="small" 
              color="primary" 
              onClick={onSaveEdit}
              title="Save"
            >
              <Save fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="default" 
              onClick={onCancelEdit}
              title="Cancel"
            >
              <Cancel fontSize="small" />
            </IconButton>
          </TableCell>
        </>
      ) : (
        <>
          <TableCell sx={{ minWidth: 50, maxWidth: 50, p: 1 }}>
            <IconButton
              size="small"
              {...attributes}
              {...listeners}
              sx={{ cursor: 'grab', '&:active': { cursor: 'grabbing' } }}
              title="Drag to reorder"
            >
              <DragHandle fontSize="small" />
            </IconButton>
          </TableCell>
          <TableCell>
            {transaction.transactionDate 
              ? new Date(transaction.transactionDate).toLocaleDateString() 
              : '-'}
          </TableCell>
          <TableCell>{transaction.description || '-'}</TableCell>
          <TableCell>
            <Chip 
              label={transaction.transactionType} 
              size="small" 
              color={transaction.transactionType === 'CREDIT' ? 'success' : 'default'}
              variant="outlined"
            />
          </TableCell>
          <TableCell align="right">{formatCurrency(transaction.amount)}</TableCell>
          <TableCell>{transaction.referenceNumber || '-'}</TableCell>
          <TableCell>{transaction.merchant || '-'}</TableCell>
          <TableCell>{transaction.category || '-'}</TableCell>
          <TableCell align="center">
            <IconButton 
              size="small" 
              color="primary" 
              onClick={() => onEdit(transaction)}
              title="Edit"
            >
              <Edit fontSize="small" />
            </IconButton>
            <IconButton 
              size="small" 
              color="error" 
              onClick={() => onRemove(transaction.id)}
              title="Delete"
            >
              <Delete fontSize="small" />
            </IconButton>
          </TableCell>
        </>
      )}
    </TableRow>
  );
};

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
  const [categories, setCategories] = useState<Array<{ id: string; name: string; type?: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const [formData, setFormData] = useState({
    statementName: '',
    statementStartDate: '',
    statementEndDate: '',
    openingBalance: 0,
    closingBalance: 0,
  });

  const loadStagingTransactions = React.useCallback(async () => {
    if (!upload) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await apiService.getStagingTransactions(upload.id);
      setTransactions(data || []);
      
      // Auto-populate dates if transactions exist
      if (data && data.length > 0) {
        const sorted = [...data]
          .filter(t => t && t.transactionDate)
          .sort((a, b) => {
            try {
              return new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime();
            } catch {
              return 0;
            }
          });
        if (sorted.length > 0) {
          setFormData(prev => ({
            ...prev,
            statementStartDate: sorted[0].transactionDate?.split('T')[0] || '',
            statementEndDate: sorted[sorted.length - 1].transactionDate?.split('T')[0] || '',
          }));
        }
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load extracted transactions.'));
      setTransactions([]);
    } finally {
      setIsLoading(false);
    }
  }, [upload]);

  const loadCategories = React.useCallback(async () => {
    setLoadingCategories(true);
    try {
      const data = await apiService.getAllCategories();
      setCategories(data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    if (open && upload) {
      loadStagingTransactions();
      loadCategories();
      setFormData({
        statementName: upload.originalFileName?.replace(/\.[^/.]+$/, "") || '',
        statementStartDate: '',
        statementEndDate: '',
        openingBalance: 0,
        closingBalance: 0,
      });
    } else if (!open) {
      // Reset state when modal closes
      setTransactions([]);
      setError('');
      setEditingId(null);
      setEditingTransaction(null);
      setNewTransactionIds(new Set());
      setCategories([]);
    }
  }, [open, upload, loadStagingTransactions, loadCategories]);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setTransactions((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);
        
        // Safety check: ensure both indices are valid
        if (oldIndex === -1 || newIndex === -1) {
          return items;
        }
        
        return arrayMove(items, oldIndex, newIndex);
      });
    }
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
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <TableContainer component={Paper} sx={{ maxHeight: 400, overflowX: 'auto' }}>
              <Table stickyHeader size="small" sx={{ minWidth: 1000 }}>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ minWidth: 50, maxWidth: 50 }}></TableCell>
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
                  {transactions.length > 0 ? (
                    <SortableContext
                      items={transactions.map(t => t.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {transactions.map((t) => (
                      <SortableRow
                        key={t.id}
                        transaction={t}
                        editingId={editingId}
                        editingTransaction={editingTransaction}
                        formatCurrency={formatCurrency}
                        onEdit={handleEditTransaction}
                        onRemove={handleRemoveTransaction}
                        onEditFieldChange={handleEditFieldChange}
                        onSaveEdit={handleSaveEdit}
                        onCancelEdit={handleCancelEdit}
                        categories={categories}
                        loadingCategories={loadingCategories}
                      />
                      ))}
                    </SortableContext>
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center">No transactions found.</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DndContext>
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


