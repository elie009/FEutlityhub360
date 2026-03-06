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
import { Close, Delete, CheckCircle, Edit, Save, Cancel, Add, DragHandle, Download, Upload, CallSplit } from '@mui/icons-material';
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
import { StagingTransaction, BankStatementUpload, TransactionSplit } from '../../types/reconciliation';
import { useCurrency } from '../../contexts/CurrencyContext';
import { getErrorMessage } from '../../utils/validation';
import SplitTransactionDialog from './SplitTransactionDialog';
import { Bill, BillStatus } from '../../types/bill';

// Sortable Row Component
interface SortableRowProps {
  transaction: StagingTransaction;
  editingId: string | null;
  editingTransaction: StagingTransaction | null;
  formatCurrency: (amount: number) => string;
  onEdit: (transaction: StagingTransaction) => void;
  onRemove: (id: string) => void;
  onSplit: (transaction: StagingTransaction) => void;
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
  onSplit,
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
        cursor: isEditing ? 'default' : 'default',
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
              sx={{ 
                cursor: 'grab', 
                '&:active': { cursor: 'grabbing' },
                touchAction: 'none', // Prevent touch scrolling on mobile
                '&:focus': {
                  outline: 'none',
                },
              }}
              title="Drag to reorder"
              tabIndex={0}
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
          <TableCell>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {transaction.category || '-'}
              {transaction.isSplit && transaction.splits && transaction.splits.length > 0 && (
                <Chip
                  label={`${transaction.splits.length} split${transaction.splits.length > 1 ? 's' : ''}`}
                  size="small"
                  color="info"
                  variant="outlined"
                />
              )}
            </Box>
          </TableCell>
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
              color="secondary" 
              onClick={() => onSplit(transaction)}
              title="Split Transaction"
            >
              <CallSplit fontSize="small" />
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
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string>('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<StagingTransaction | null>(null);
  const [newTransactionIds, setNewTransactionIds] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<Array<{ id: string; name: string; type?: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [showSplitDialog, setShowSplitDialog] = useState(false);
  const [transactionToSplit, setTransactionToSplit] = useState<StagingTransaction | null>(null);
  const [previousClosingBalance, setPreviousClosingBalance] = useState<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Drag and drop sensors with activation constraints
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require 5px of movement before activating drag
      },
    }),
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

  const loadBills = React.useCallback(async () => {
    setLoadingBills(true);
    try {
      const response = await apiService.getUserBills({ status: BillStatus.PENDING });
      setBills(response.data || []);
    } catch (err) {
      console.error('Failed to load bills:', err);
      setBills([]);
    } finally {
      setLoadingBills(false);
    }
  }, []);

  const loadPreviousBankStatement = React.useCallback(async () => {
    if (!upload?.bankAccountId) return;
    
    try {
      // Fetch all bank statements for this account
      const statements = await apiService.getBankStatements(upload.bankAccountId);
      
      if (statements && statements.length > 0) {
        // Sort by statement end date descending to get the most recent
        const sortedStatements = statements
          .filter(s => s.statementEndDate) // Only consider statements with end dates
          .sort((a, b) => {
            const dateA = new Date(a.statementEndDate);
            const dateB = new Date(b.statementEndDate);
            return dateB.getTime() - dateA.getTime();
          });
        
        if (sortedStatements.length > 0) {
          const previousStatement = sortedStatements[0];
          const prevClosingBalance = previousStatement.closingBalance || 0;
          
          // Store the previous closing balance for comparison
          setPreviousClosingBalance(prevClosingBalance);
          
          // Set opening balance from previous statement's closing balance
          setFormData(prev => ({
            ...prev,
            openingBalance: prevClosingBalance
          }));
        } else {
          // No previous statements
          setPreviousClosingBalance(null);
        }
      }
    } catch (err) {
      console.error('Failed to load previous bank statement:', err);
      // Don't show error to user, just use default opening balance of 0
    }
  }, [upload]);

  useEffect(() => {
    if (open && upload) {
      loadStagingTransactions();
      loadCategories();
      loadBills();
      loadPreviousBankStatement(); // Load opening balance from previous statement
      setFormData({
        statementName: upload.originalFileName?.replace(/\.[^/.]+$/, "") || '',
        statementStartDate: '',
        statementEndDate: '',
        openingBalance: 0, // Will be updated by loadPreviousBankStatement
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
      setBills([]);
      setShowSplitDialog(false);
      setTransactionToSplit(null);
      setPreviousClosingBalance(null);
    }
  }, [open, upload, loadStagingTransactions, loadCategories, loadBills, loadPreviousBankStatement]);

  // Auto-calculate closing balance when opening balance or transactions change
  useEffect(() => {
    const totalDebit = transactions
      .filter(t => t.transactionType === 'DEBIT')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalCredit = transactions
      .filter(t => t.transactionType === 'CREDIT')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const calculated = formData.openingBalance + totalCredit - totalDebit;
    
    // Round to 3 decimal places to avoid floating point precision issues
    const roundedClosingBalance = Math.round(calculated * 1000) / 1000;
    
    // Update closing balance automatically
    setFormData(prev => ({
      ...prev,
      closingBalance: roundedClosingBalance
    }));
  }, [formData.openingBalance, transactions]);

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

  const handleSplitTransaction = (transaction: StagingTransaction) => {
    setTransactionToSplit(transaction);
    setShowSplitDialog(true);
  };

  const handleSaveSplit = (transaction: StagingTransaction, splits: TransactionSplit[]) => {
    const updatedTransaction: StagingTransaction = {
      ...transaction,
      splits: splits,
      isSplit: true,
    };

    setTransactions(
      transactions.map((t) => (t.id === transaction.id ? updatedTransaction : t))
    );
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

  const handleDownloadCSV = () => {
    if (transactions.length === 0) {
      setError('No transactions to download');
      return;
    }

    // Define CSV headers
    const headers = ['Date', 'Description', 'Type', 'Amount', 'Reference', 'Merchant', 'Category'];
    
    // Convert transactions to CSV rows
    const csvRows = [
      headers.join(','),
      ...transactions.map(transaction => {
        const date = transaction.transactionDate 
          ? new Date(transaction.transactionDate).toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: '2-digit', 
              day: '2-digit' 
            })
          : '';
        const description = `"${(transaction.description || '').replace(/"/g, '""')}"`;
        // Ensure transactionType is DEBIT or CREDIT, default to DEBIT if empty
        const type = (transaction.transactionType === 'DEBIT' || transaction.transactionType === 'CREDIT') 
          ? transaction.transactionType 
          : (transaction.transactionType || 'DEBIT');
        const amount = transaction.amount?.toFixed(2) || '0.00';
        const reference = `"${(transaction.referenceNumber || '').replace(/"/g, '""')}"`;
        const merchant = `"${(transaction.merchant || '').replace(/"/g, '""')}"`;
        const category = `"${(transaction.category || '').replace(/"/g, '""')}"`;
        
        return [date, description, type, amount, reference, merchant, category].join(',');
      })
    ];

    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const fileName = `Extracted_Transactions_${upload?.originalFileName?.replace(/\.[^/.]+$/, '') || 'export'}_${new Date().toISOString().split('T')[0]}.csv`;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleImportCSV = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if file is CSV
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please select a CSV file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length < 2) {
          setError('CSV file must contain at least a header row and one data row');
          return;
        }

        // Parse header row
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        
        // Expected headers: Date, Description, Type, Amount, Reference, Merchant, Category
        const dateIndex = headers.findIndex(h => h.toLowerCase() === 'date');
        const descriptionIndex = headers.findIndex(h => h.toLowerCase() === 'description');
        const typeIndex = headers.findIndex(h => h.toLowerCase() === 'type');
        const amountIndex = headers.findIndex(h => h.toLowerCase() === 'amount');
        const referenceIndex = headers.findIndex(h => h.toLowerCase() === 'reference');
        const merchantIndex = headers.findIndex(h => h.toLowerCase() === 'merchant');
        const categoryIndex = headers.findIndex(h => h.toLowerCase() === 'category');

        if (dateIndex === -1 || descriptionIndex === -1 || typeIndex === -1 || amountIndex === -1) {
          setError('CSV file must contain Date, Description, Type, and Amount columns');
          return;
        }

        // Parse CSV rows (skip header)
        const importedTransactions: StagingTransaction[] = [];
        
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;

          // Parse CSV line (handle quoted values)
          const values: string[] = [];
          let currentValue = '';
          let inQuotes = false;

          for (let j = 0; j < line.length; j++) {
            const char = line[j];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
              values.push(currentValue.trim());
              currentValue = '';
            } else {
              currentValue += char;
            }
          }
          values.push(currentValue.trim()); // Add last value

          // Extract values
          const dateStr = values[dateIndex]?.replace(/^"|"$/g, '') || '';
          const description = values[descriptionIndex]?.replace(/^"|"$/g, '') || '';
          const type = values[typeIndex]?.replace(/^"|"$/g, '').toUpperCase() || 'DEBIT';
          const amountStr = values[amountIndex]?.replace(/^"|"$/g, '') || '0';
          const reference = values[referenceIndex]?.replace(/^"|"$/g, '') || '';
          const merchant = values[merchantIndex]?.replace(/^"|"$/g, '') || '';
          const category = values[categoryIndex]?.replace(/^"|"$/g, '') || '';

          // Validate and convert date
          let transactionDate = dateStr;
          if (dateStr) {
            // Handle MM/DD/YYYY format (e.g., "01/05/2025")
            if (dateStr.includes('/')) {
              const parts = dateStr.split('/');
              if (parts.length === 3) {
                const month = parts[0].padStart(2, '0');
                const day = parts[1].padStart(2, '0');
                const year = parts[2];
                // Create date in YYYY-MM-DD format
                transactionDate = `${year}-${month}-${day}`;
              }
            } else {
              // Try to parse date in other formats
              const date = new Date(dateStr);
              if (!isNaN(date.getTime())) {
                transactionDate = date.toISOString().split('T')[0];
              }
            }
          }

          // Validate type
          const transactionType = (type === 'DEBIT' || type === 'CREDIT') ? type : 'DEBIT';

          // Parse amount
          const amount = parseFloat(amountStr.replace(/[^0-9.-]/g, '')) || 0;

          if (!upload) continue;

          const transaction: StagingTransaction = {
            id: `imported-${Date.now()}-${i}`,
            uploadId: upload.id,
            transactionDate: transactionDate || new Date().toISOString().split('T')[0],
            amount: amount,
            transactionType: transactionType,
            description: description,
            referenceNumber: reference,
            merchant: merchant,
            category: category,
            balanceAfterTransaction: 0,
          };

          importedTransactions.push(transaction);
        }

        if (importedTransactions.length === 0) {
          setError('No valid transactions found in CSV file');
          return;
        }

        // Replace existing transactions with imported ones
        setTransactions(importedTransactions);
        setError('');
        
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to parse CSV file. Please check the format.'));
      }
    };

    reader.onerror = () => {
      setError('Failed to read CSV file');
    };

    reader.readAsText(file);
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
      // Helper function to convert date string to ISO DateTime
      const convertToISODateTime = (dateStr: string): string => {
        if (!dateStr) return new Date().toISOString();
        
        // If it's already a full ISO string, return as is
        if (dateStr.includes('T') || dateStr.includes('Z')) {
          try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              return date.toISOString();
            }
          } catch {
            // Fall through to date-only parsing
          }
        }
        
        // Handle MM/DD/YYYY format (e.g., "01/05/2025")
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            const year = parts[2];
            // Create date in YYYY-MM-DD format, then convert to ISO
            const isoDate = `${year}-${month}-${day}`;
            return `${isoDate}T00:00:00.000Z`;
          }
        }
        
        // If it's just a date (YYYY-MM-DD), convert to full DateTime
        if (dateStr.length === 10 && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return `${dateStr}T00:00:00.000Z`;
        }
        
        // Try to parse and convert to ISO
        try {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch {
          // If parsing fails, use current date
        }
        
        return new Date().toISOString();
      };

      // Transform transactions to ensure dates are in ISO DateTime format
      const transformedTransactions = transactions.map(transaction => ({
        ...transaction,
        transactionDate: convertToISODateTime(transaction.transactionDate)
      }));

      // Transform statement dates to ISO DateTime format
      const confirmData = {
        statementName: formData.statementName,
        statementStartDate: convertToISODateTime(formData.statementStartDate),
        statementEndDate: convertToISODateTime(formData.statementEndDate),
        openingBalance: formData.openingBalance,
        closingBalance: formData.closingBalance,
        transactions: transformedTransactions
      };

      await apiService.confirmUpload(upload.id, confirmData);

      // Mark bills as paid for any transaction splits that have a billId
      const billIdsMap: Record<string, boolean> = {};
      transformedTransactions.forEach((t) => {
        (t.splits || []).forEach((s) => {
          if (s.billId) billIdsMap[s.billId] = true;
        });
      });
      const billIdsFromSplits = Object.keys(billIdsMap);
      if (billIdsFromSplits.length > 0) {
        await Promise.allSettled(
          billIdsFromSplits.map((billId) => apiService.markBillAsPaid(billId, {}))
        );
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to confirm transactions.'));
    } finally {
      setIsConfirming(false);
    }
  };

  const handleSaveStaging = async () => {
    if (!upload) return;

    setIsSaving(true);
    setError('');
    try {
      // Helper function to convert date string to ISO DateTime (same as in handleConfirm)
      const convertToISODateTime = (dateStr: string): string => {
        if (!dateStr) return new Date().toISOString();
        
        if (dateStr.includes('T') || dateStr.includes('Z')) {
          try {
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
              return date.toISOString();
            }
          } catch {
            // Fall through
          }
        }
        
        if (dateStr.includes('/')) {
          const parts = dateStr.split('/');
          if (parts.length === 3) {
            const month = parts[0].padStart(2, '0');
            const day = parts[1].padStart(2, '0');
            const year = parts[2];
            const isoDate = `${year}-${month}-${day}`;
            return `${isoDate}T00:00:00.000Z`;
          }
        }
        
        if (dateStr.length === 10 && dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return `${dateStr}T00:00:00.000Z`;
        }
        
        try {
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            return date.toISOString();
          }
        } catch {
          // If parsing fails, use current date
        }
        
        return new Date().toISOString();
      };

      // Transform transactions to ensure dates are in ISO DateTime format
      const transformedTransactions = transactions.map(transaction => ({
        ...transaction,
        transactionDate: convertToISODateTime(transaction.transactionDate)
      }));

      // Transform statement dates to ISO DateTime format
      const saveData = {
        statementName: formData.statementName || '',
        statementStartDate: formData.statementStartDate ? convertToISODateTime(formData.statementStartDate) : '',
        statementEndDate: formData.statementEndDate ? convertToISODateTime(formData.statementEndDate) : '',
        openingBalance: formData.openingBalance || 0,
        closingBalance: formData.closingBalance || 0,
        transactions: transformedTransactions
      };

      // Call save endpoint (backend endpoint needs to be created)
      await apiService.saveStagingTransactions(upload.id, saveData);
      
      // Reload staging transactions to ensure sync with backend
      await loadStagingTransactions();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save staging transactions.'));
    } finally {
      setIsSaving(false);
    }
  };

  if (!upload) return null;

  // Calculate totals
  const totalDebit = transactions
    .filter(t => t.transactionType === 'DEBIT')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalCredit = transactions
    .filter(t => t.transactionType === 'CREDIT')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  // Calculate closing balance automatically: Opening Balance + Credits - Debits
  const calculatedClosingBalance = formData.openingBalance + totalCredit - totalDebit;

  return (
    <Dialog 
      open={open} 
      onClose={(event, reason) => {
        // Only allow closing via the close button, not by clicking backdrop or pressing ESC
        if (reason === 'backdropClick' || reason === 'escapeKeyDown') {
          return;
        }
        onClose();
      }}
      maxWidth="xl" 
      fullWidth
    >
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

        {/* Opening Balance Mismatch Warning */}
        {previousClosingBalance !== null && 
         Math.abs(formData.openingBalance - previousClosingBalance) > 0.01 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
              Opening Balance Mismatch
            </Typography>
            <Typography variant="body2" gutterBottom>
              The opening balance ({formatCurrency(formData.openingBalance)}) doesn't match the previous statement's closing balance ({formatCurrency(previousClosingBalance)}).
            </Typography>
            <Typography variant="body2" gutterBottom>
              <strong>Difference: {formatCurrency(Math.abs(formData.openingBalance - previousClosingBalance))}</strong>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              ⚠️ <strong>Warning:</strong> Your opening balance should match the closing balance from your previous statement to maintain accurate records. Please verify your opening balance before proceeding.
            </Typography>
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
              onChange={(e) => {
                const value = parseFloat(e.target.value) || 0;
                const rounded = Math.round(value * 1000) / 1000; // Round to 3 decimal places
                setFormData({ ...formData, closingBalance: rounded });
              }}
              size="small"
              sx={{ width: 150 }}
              inputProps={{ step: 0.001 }}
            />
          </Box>
          
          {/* Closing Balance Calculation Summary */}
          {transactions.length > 0 && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Closing Balance Calculation:
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
                <Typography variant="body2">
                  Opening Balance: <strong>{formatCurrency(formData.openingBalance)}</strong>
                </Typography>
                <Typography variant="body2" color="success.main">
                  + Credits: <strong>{formatCurrency(totalCredit)}</strong>
                </Typography>
                <Typography variant="body2" color="error.main">
                  - Debits: <strong>{formatCurrency(totalDebit)}</strong>
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: '1.1em' }}>
                  = Calculated: <strong>{formatCurrency(calculatedClosingBalance)}</strong>
                </Typography>
                {Math.abs(calculatedClosingBalance - formData.closingBalance) > 0.01 && (
                  <Typography variant="body2" color="warning.main" sx={{ fontWeight: 'bold' }}>
                    ⚠ Difference: <strong>{formatCurrency(Math.abs(calculatedClosingBalance - formData.closingBalance))}</strong>
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
          <Box>
            <Typography variant="subtitle2">
              Extracted Transactions ({transactions.length})
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'medium' }}>
                Total Debit: {formatCurrency(totalDebit)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'medium' }}>
                Total Credit: {formatCurrency(totalCredit)}
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <Button
              variant="outlined"
              size="small"
              startIcon={<Upload />}
              onClick={handleImportCSV}
              disabled={isLoading || !upload}
            >
              Import CSV
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Download />}
              onClick={handleDownloadCSV}
              disabled={isLoading || transactions.length === 0}
            >
              Download CSV
            </Button>
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
                        onSplit={handleSplitTransaction}
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
                  {/* Totals Row */}
                  {transactions.length > 0 && (
                    <TableRow sx={{ backgroundColor: 'action.hover', fontWeight: 'bold' }}>
                      <TableCell colSpan={3} align="right" sx={{ fontWeight: 'bold' }}>
                        <strong>Totals:</strong>
                      </TableCell>
                      <TableCell></TableCell>
                      <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                          <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 'bold' }}>
                            Debit: {formatCurrency(totalDebit)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: 'success.main', fontWeight: 'bold' }}>
                            Credit: {formatCurrency(totalCredit)}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell colSpan={4}></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </DndContext>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isConfirming || isSaving}>Cancel</Button>
        <Button 
          variant="outlined" 
          onClick={handleSaveStaging} 
          disabled={isSaving || isConfirming || transactions.length === 0 || isLoading}
          startIcon={isSaving ? <CircularProgress size={20} /> : <Save />}
        >
          {isSaving ? 'Saving...' : 'Save Staging Transactions'}
        </Button>
        <Button 
          variant="contained" 
          onClick={handleConfirm} 
          disabled={isConfirming || isSaving || transactions.length === 0 || isLoading}
          startIcon={isConfirming ? <CircularProgress size={20} /> : <CheckCircle />}
        >
          {isConfirming ? 'Confirming...' : 'Confirm & Finalize'}
        </Button>
      </DialogActions>

      <SplitTransactionDialog
        open={showSplitDialog}
        onClose={() => {
          setShowSplitDialog(false);
          setTransactionToSplit(null);
        }}
        transaction={transactionToSplit}
        bills={bills}
        categories={categories}
        onSave={handleSaveSplit}
      />
    </Dialog>
  );
};

export default StagingTransactionsModal;





