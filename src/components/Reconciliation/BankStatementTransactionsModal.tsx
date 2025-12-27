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
  Chip,
} from '@mui/material';
import { Close, CheckCircle, Cancel } from '@mui/icons-material';
import { apiService } from '../../services/api';
import { BankStatement, BankStatementItem } from '../../types/reconciliation';
import { useCurrency } from '../../contexts/CurrencyContext';
import { getErrorMessage } from '../../utils/validation';

interface BankStatementTransactionsModalProps {
  open: boolean;
  onClose: () => void;
  statement: BankStatement | null;
}

const BankStatementTransactionsModal: React.FC<BankStatementTransactionsModalProps> = ({
  open,
  onClose,
  statement,
}) => {
  const { formatCurrency } = useCurrency();
  const [fullStatement, setFullStatement] = useState<BankStatement | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open && statement) {
      loadStatementWithItems();
    } else if (!open) {
      // Reset state when modal closes
      setFullStatement(null);
      setError('');
    }
  }, [open, statement]);

  const loadStatementWithItems = async () => {
    if (!statement) return;
    
    setIsLoading(true);
    setError('');
    try {
      const data = await apiService.getBankStatement(statement.id);
      setFullStatement(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load bank statement transactions.'));
      setFullStatement(null);
    } finally {
      setIsLoading(false);
    }
  };

  const displayStatement = fullStatement || statement;
  const transactions = displayStatement?.statementItems || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Bank Statement Transactions</Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
        {displayStatement && (
          <Typography variant="caption" color="textSecondary">
            {displayStatement.statementName} | {new Date(displayStatement.statementStartDate).toLocaleDateString()} - {new Date(displayStatement.statementEndDate).toLocaleDateString()}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent dividers>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {displayStatement && (
          <Box sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
              <Chip
                label={`Opening Balance: ${formatCurrency(displayStatement.openingBalance)}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`Closing Balance: ${formatCurrency(displayStatement.closingBalance)}`}
                color="primary"
                variant="outlined"
              />
              <Chip
                label={`Total Transactions: ${displayStatement.totalTransactions}`}
                variant="outlined"
              />
              <Chip
                label={`Matched: ${displayStatement.matchedTransactions}`}
                color="success"
                variant="outlined"
              />
              <Chip
                label={`Unmatched: ${displayStatement.unmatchedTransactions}`}
                color="warning"
                variant="outlined"
              />
            </Box>
          </Box>
        )}

        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : transactions.length === 0 ? (
          <Alert severity="info">
            No transactions found for this bank statement.
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 500, overflowX: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell align="right">Amount</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Merchant</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Balance After</TableCell>
                  <TableCell align="center">Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {transactions.map((transaction: BankStatementItem) => (
                  <TableRow key={transaction.id}>
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
                    <TableCell align="right">
                      {formatCurrency(transaction.amount)}
                    </TableCell>
                    <TableCell>{transaction.referenceNumber || '-'}</TableCell>
                    <TableCell>{transaction.merchant || '-'}</TableCell>
                    <TableCell>{transaction.category || '-'}</TableCell>
                    <TableCell align="right">
                      {formatCurrency(transaction.balanceAfterTransaction)}
                    </TableCell>
                    <TableCell align="center">
                      {transaction.isMatched ? (
                        <Chip
                          icon={<CheckCircle />}
                          label="Matched"
                          color="success"
                          size="small"
                        />
                      ) : (
                        <Chip
                          icon={<Cancel />}
                          label="Unmatched"
                          color="warning"
                          size="small"
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default BankStatementTransactionsModal;

