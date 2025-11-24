import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Alert,
  CircularProgress,
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
  Chip,
} from '@mui/material';
import {
  Close,
  Upload,
  Delete,
  Add,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { BankStatementItemImport } from '../../types/reconciliation';
import { getErrorMessage } from '../../utils/validation';
import { useCurrency } from '../../contexts/CurrencyContext';

interface BankStatementImportDialogProps {
  open: boolean;
  onClose: () => void;
  bankAccountId: string;
  onSuccess: () => void;
}

const BankStatementImportDialog: React.FC<BankStatementImportDialogProps> = ({
  open,
  onClose,
  bankAccountId,
  onSuccess,
}) => {
  const { formatCurrency } = useCurrency();
  const [formData, setFormData] = useState({
    statementName: '',
    statementStartDate: '',
    statementEndDate: '',
    openingBalance: '',
    closingBalance: '',
    importFormat: 'CSV',
    importSource: '',
  });
  const [statementItems, setStatementItems] = useState<BankStatementItemImport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open) {
      // Reset form when dialog opens
      setFormData({
        statementName: '',
        statementStartDate: '',
        statementEndDate: '',
        openingBalance: '',
        closingBalance: '',
        importFormat: 'CSV',
        importSource: '',
      });
      setStatementItems([]);
      setError('');
    }
  }, [open]);

  const handleAddItem = () => {
    setStatementItems([
      ...statementItems,
      {
        transactionDate: new Date().toISOString().split('T')[0],
        amount: 0,
        transactionType: 'DEBIT',
        description: '',
        referenceNumber: '',
        merchant: '',
        category: '',
        balanceAfterTransaction: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setStatementItems(statementItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof BankStatementItemImport, value: any) => {
    const updated = [...statementItems];
    updated[index] = { ...updated[index], [field]: value };
    setStatementItems(updated);
  };

  const handleSubmit = async () => {
    setError('');
    
    // Validation
    if (!formData.statementName.trim()) {
      setError('Statement name is required');
      return;
    }
    if (!formData.statementStartDate || !formData.statementEndDate) {
      setError('Start date and end date are required');
      return;
    }
    if (statementItems.length === 0) {
      setError('At least one statement item is required');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.importBankStatement({
        bankAccountId,
        statementName: formData.statementName,
        statementStartDate: formData.statementStartDate,
        statementEndDate: formData.statementEndDate,
        openingBalance: parseFloat(formData.openingBalance) || 0,
        closingBalance: parseFloat(formData.closingBalance) || 0,
        importFormat: formData.importFormat,
        importSource: formData.importSource || 'manual-import',
        statementItems: statementItems.map(item => ({
          ...item,
          transactionDate: new Date(item.transactionDate).toISOString(),
          amount: parseFloat(item.amount.toString()) || 0,
          balanceAfterTransaction: parseFloat(item.balanceAfterTransaction.toString()) || 0,
        })),
      });
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to import bank statement'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Import Bank Statement</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Statement Name"
              value={formData.statementName}
              onChange={(e) => setFormData({ ...formData, statementName: e.target.value })}
              placeholder="e.g., January 2024 Statement"
              required
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.statementStartDate}
              onChange={(e) => setFormData({ ...formData, statementStartDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.statementEndDate}
              onChange={(e) => setFormData({ ...formData, statementEndDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Opening Balance"
              type="number"
              value={formData.openingBalance}
              onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Closing Balance"
              type="number"
              value={formData.closingBalance}
              onChange={(e) => setFormData({ ...formData, closingBalance: e.target.value })}
              required
            />
          </Grid>
        </Grid>

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Statement Items</Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={handleAddItem}
          >
            Add Item
          </Button>
        </Box>

        {statementItems.length === 0 ? (
          <Alert severity="info">
            Click "Add Item" to add transaction items from your bank statement.
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statementItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        type="date"
                        value={item.transactionDate.split('T')[0]}
                        onChange={(e) => handleItemChange(index, 'transactionDate', e.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 150 }}
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        value={item.transactionType}
                        onChange={(e) => handleItemChange(index, 'transactionType', e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        <option value="DEBIT">DEBIT</option>
                        <option value="CREDIT">CREDIT</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        size="small"
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        size="small"
                        sx={{ width: 200 }}
                        placeholder="Description"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.referenceNumber || ''}
                        onChange={(e) => handleItemChange(index, 'referenceNumber', e.target.value)}
                        size="small"
                        sx={{ width: 120 }}
                        placeholder="Reference"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || statementItems.length === 0}
          startIcon={isLoading ? <CircularProgress size={20} /> : <Upload />}
        >
          {isLoading ? 'Importing...' : 'Import Statement'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BankStatementImportDialog;

