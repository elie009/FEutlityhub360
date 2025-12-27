import React, { useState, useEffect, useMemo } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Alert,
  Chip,
} from '@mui/material';
import { Add, Delete, Close } from '@mui/icons-material';
import { StagingTransaction, TransactionSplit } from '../../types/reconciliation';
import { Bill, BillStatus } from '../../types/bill';
import { useCurrency } from '../../contexts/CurrencyContext';
import { getLatestBillsByName } from '../../utils/billUtils';

interface SplitTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  transaction: StagingTransaction | null;
  bills: Bill[];
  categories: Array<{ id: string; name: string; type?: string }>;
  onSave: (transaction: StagingTransaction, splits: TransactionSplit[]) => void;
}

const SplitTransactionDialog: React.FC<SplitTransactionDialogProps> = ({
  open,
  onClose,
  transaction,
  bills,
  categories,
  onSave,
}) => {
  const { formatCurrency } = useCurrency();
  const [splits, setSplits] = useState<TransactionSplit[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Filter bills to show only the latest due date for each bill name
  const filteredBills = useMemo(() => getLatestBillsByName(bills), [bills]);

  useEffect(() => {
    if (transaction) {
      // Initialize with existing splits or create one empty split
      if (transaction.splits && transaction.splits.length > 0) {
        setSplits([...transaction.splits]);
      } else {
        setSplits([
          {
            id: `split-${Date.now()}`,
            amount: 0,
            description: '',
          },
        ]);
      }
    }
  }, [transaction]);

  const handleAddSplit = () => {
    setSplits([
      ...splits,
      {
        id: `split-${Date.now()}-${Math.random()}`,
        amount: 0,
        description: '',
      },
    ]);
  };

  const handleRemoveSplit = (id: string) => {
    setSplits(splits.filter((s) => s.id !== id));
    setErrors({});
  };

  const handleSplitChange = (id: string, field: keyof TransactionSplit, value: any) => {
    setSplits(
      splits.map((split) => (split.id === id ? { ...split, [field]: value } : split))
    );
    // Clear error for this split
    if (errors[id]) {
      const newErrors = { ...errors };
      delete newErrors[id];
      setErrors(newErrors);
    }
  };

  const calculateTotal = () => {
    return splits.reduce((sum, split) => sum + (split.amount || 0), 0);
  };

  const getRemainingAmount = () => {
    if (!transaction) return 0;
    return transaction.amount - calculateTotal();
  };

  const validateSplits = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    let isValid = true;

    splits.forEach((split) => {
      if (!split.billId && !split.category) {
        newErrors[split.id] = 'Please select a bill or category';
        isValid = false;
      }
      if (!split.amount || split.amount <= 0) {
        newErrors[split.id] = 'Amount must be greater than 0';
        isValid = false;
      }
    });

    const total = calculateTotal();
    if (transaction && Math.abs(total - transaction.amount) > 0.01) {
      newErrors['total'] = `Total must equal ${formatCurrency(transaction.amount)}`;
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSave = () => {
    if (!transaction) return;

    // Filter out empty splits
    const validSplits = splits.filter(
      (split) => split.amount > 0 && (split.billId || split.category)
    );

    // Allow saving even if no splits remain (converts back to regular transaction)
    if (validSplits.length === 0) {
      // If no splits, just save empty array - backend will handle converting to regular transaction
      onSave(transaction, []);
      onClose();
      return;
    }

    if (!validateSplits()) {
      return;
    }

    onSave(transaction, validSplits);
    onClose();
  };

  const handleClose = () => {
    setSplits([]);
    setErrors({});
    onClose();
  };

  if (!transaction) return null;

  const remainingAmount = getRemainingAmount();
  const isBalanced = Math.abs(remainingAmount) < 0.01;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Split Transaction</Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Original Amount: <strong>{formatCurrency(transaction.amount)}</strong>
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        {errors.total && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errors.total}
          </Alert>
        )}

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2">
            Total Allocated: <strong>{formatCurrency(calculateTotal())}</strong>
          </Typography>
          <Chip
            label={
              isBalanced
                ? 'Balanced'
                : `Remaining: ${formatCurrency(remainingAmount)}`
            }
            color={isBalanced ? 'success' : 'warning'}
            size="small"
          />
        </Box>

        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Bill / Category</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right" sx={{ minWidth: 150 }}>
                  Amount
                </TableCell>
                <TableCell align="center" sx={{ width: 50 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {splits.map((split) => (
                <TableRow key={split.id}>
                  <TableCell>
                    <FormControl fullWidth size="small" error={!!errors[split.id]}>
                      <InputLabel shrink={!!(split.billId || split.category)}>Select Bill or Category</InputLabel>
                      <Select
                        value={
                          split.billId 
                            ? `bill:${split.billId}` 
                            : split.category 
                            ? `cat:${split.category}` 
                            : ''
                        }
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value.startsWith('bill:')) {
                            const billId = value.replace('bill:', '');
                            const selectedBill = filteredBills.find(b => b.id === billId);
                            setSplits(
                              splits.map((s) => 
                                s.id === split.id 
                                  ? { 
                                      ...s, 
                                      billId, 
                                      category: undefined,
                                      amount: selectedBill ? selectedBill.amount : s.amount
                                    }
                                  : s
                              )
                            );
                          } else if (value.startsWith('cat:')) {
                            const category = value.replace('cat:', '');
                            setSplits(
                              splits.map((s) => 
                                s.id === split.id 
                                  ? { ...s, category, billId: undefined }
                                  : s
                              )
                            );
                          } else {
                            setSplits(
                              splits.map((s) => 
                                s.id === split.id 
                                  ? { ...s, billId: undefined, category: undefined }
                                  : s
                              )
                            );
                          }
                          // Clear error for this split
                          if (errors[split.id]) {
                            const newErrors = { ...errors };
                            delete newErrors[split.id];
                            setErrors(newErrors);
                          }
                        }}
                        label="Select Bill or Category"
                        displayEmpty
                        renderValue={(selected: any) => {
                          const selectedValue = selected || '';
                          if (selectedValue === '' || selectedValue === null || selectedValue === undefined) {
                            return <span style={{ color: '#999' }}>None</span>;
                          }
                          const selectedStr = String(selectedValue);
                          if (selectedStr.startsWith('bill:')) {
                            const billId = selectedStr.replace('bill:', '');
                            const bill = filteredBills.find(b => b.id === billId);
                            if (bill) {
                              return <span>{bill.billName} - {formatCurrency(bill.amount)}</span>;
                            }
                            return <span>Bill (${billId})</span>;
                          }
                          if (selectedStr.startsWith('cat:')) {
                            const categoryName = selectedStr.replace('cat:', '');
                            return <span>{categoryName}</span>;
                          }
                          return <span>{selectedStr}</span>;
                        }}
                      >
                        <MenuItem value="">
                          <em>None</em>
                        </MenuItem>
                        <MenuItem disabled>
                          <strong>Bills</strong>
                        </MenuItem>
                        {filteredBills.map((bill) => (
                          <MenuItem key={`bill:${bill.id}`} value={`bill:${bill.id}`}>
                            {bill.billName} - {formatCurrency(bill.amount)}
                          </MenuItem>
                        ))}
                        <MenuItem disabled>
                          <strong>Categories</strong>
                        </MenuItem>
                        {categories.map((cat) => (
                          <MenuItem key={`cat:${cat.name}`} value={`cat:${cat.name}`}>
                            {cat.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      fullWidth
                      value={split.description || ''}
                      onChange={(e) =>
                        handleSplitChange(split.id, 'description', e.target.value)
                      }
                      placeholder="Optional description"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <TextField
                      type="number"
                      size="small"
                      fullWidth
                      value={split.amount || ''}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        handleSplitChange(split.id, 'amount', value);
                      }}
                      inputProps={{ step: 0.01, min: 0 }}
                      error={!!errors[split.id]}
                      helperText={errors[split.id]}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveSplit(split.id)}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={handleAddSplit}
          >
            Add Split
          </Button>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={
            splits.length > 0 && 
            splits.some(s => (!s.billId && !s.category) || !s.amount || s.amount <= 0)
          }
        >
          {splits.length === 0 ? 'Convert to Regular Transaction' : 'Save Split'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SplitTransactionDialog;

