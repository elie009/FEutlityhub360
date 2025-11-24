import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Tooltip,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Close,
  AutoFixHigh,
  Link as LinkIcon,
  LinkOff,
  CheckCircle,
  Warning,
  Info,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { Reconciliation, BankStatement, TransactionMatchSuggestion } from '../../types/reconciliation';
import { getErrorMessage } from '../../utils/validation';
import { useCurrency } from '../../contexts/CurrencyContext';

interface TransactionMatchingDialogProps {
  open: boolean;
  onClose: () => void;
  reconciliation: Reconciliation | null;
  bankStatement: BankStatement | null;
  onUpdate: () => void;
}

const TransactionMatchingDialog: React.FC<TransactionMatchingDialogProps> = ({
  open,
  onClose,
  reconciliation,
  bankStatement,
  onUpdate,
}) => {
  const { formatCurrency } = useCurrency();
  const [activeTab, setActiveTab] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [suggestions, setSuggestions] = useState<TransactionMatchSuggestion[]>([]);
  const [fullReconciliation, setFullReconciliation] = useState<Reconciliation | null>(null);

  useEffect(() => {
    if (open && reconciliation) {
      loadReconciliationDetails();
      loadSuggestions();
    }
  }, [open, reconciliation]);

  const loadReconciliationDetails = async () => {
    if (!reconciliation) return;
    try {
      const details = await apiService.getReconciliation(reconciliation.id);
      setFullReconciliation(details);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load reconciliation details'));
    }
  };

  const loadSuggestions = async () => {
    if (!reconciliation) return;
    try {
      const suggs = await apiService.getMatchSuggestions(reconciliation.id);
      setSuggestions(suggs);
    } catch (err) {
      // Silently fail - suggestions are optional
    }
  };

  const handleAutoMatch = async () => {
    if (!reconciliation) return;
    setIsLoading(true);
    setError('');
    try {
      await apiService.autoMatchTransactions(reconciliation.id);
      setSuccess('Transactions auto-matched successfully!');
      loadReconciliationDetails();
      loadSuggestions();
      onUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to auto-match transactions'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMatch = async (systemTransactionId: string, statementItemId?: string) => {
    if (!reconciliation) return;
    setIsLoading(true);
    setError('');
    try {
      await apiService.matchTransaction({
        reconciliationId: reconciliation.id,
        systemTransactionId,
        systemTransactionType: 'Payment',
        statementItemId,
        matchType: 'MANUAL',
      });
      setSuccess('Transaction matched successfully!');
      loadReconciliationDetails();
      loadSuggestions();
      onUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to match transaction'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnmatch = async (matchId: string) => {
    setIsLoading(true);
    setError('');
    try {
      await apiService.unmatchTransaction({ matchId });
      setSuccess('Transaction unmatched successfully!');
      loadReconciliationDetails();
      loadSuggestions();
      onUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to unmatch transaction'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!reconciliation) return;
    setIsLoading(true);
    setError('');
    try {
      await apiService.completeReconciliation({
        reconciliationId: reconciliation.id,
        notes: 'Reconciliation completed via UI',
      });
      setSuccess('Reconciliation completed successfully!');
      loadReconciliationDetails();
      onUpdate();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to complete reconciliation'));
    } finally {
      setIsLoading(false);
    }
  };

  const data = fullReconciliation || reconciliation;
  if (!data) return null;

  const matchedTransactions = data.matches?.filter(m => m.matchStatus === 'MATCHED') || [];
  const unmatchedTransactions = data.matches?.filter(m => m.matchStatus === 'UNMATCHED') || [];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">{data.reconciliationName}</Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(data.reconciliationDate).toLocaleDateString()}
            </Typography>
          </Box>
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

        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        {/* Summary Cards */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Book Balance
                </Typography>
                <Typography variant="h6">{formatCurrency(data.bookBalance)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Statement Balance
                </Typography>
                <Typography variant="h6">{formatCurrency(data.statementBalance)}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Difference
                </Typography>
                <Typography
                  variant="h6"
                  color={Math.abs(data.difference) < 0.01 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(data.difference)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={data.status}
                  color={data.status === 'COMPLETED' ? 'success' : data.status === 'IN_PROGRESS' ? 'info' : 'warning'}
                  size="small"
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Button
            variant="contained"
            startIcon={<AutoFixHigh />}
            onClick={handleAutoMatch}
            disabled={isLoading || data.status === 'COMPLETED'}
          >
            Auto-Match Transactions
          </Button>
          {data.status !== 'COMPLETED' && (
            <Button
              variant="outlined"
              color="success"
              startIcon={<CheckCircle />}
              onClick={handleComplete}
              disabled={isLoading}
            >
              Complete Reconciliation
            </Button>
          )}
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label={`Matched (${matchedTransactions.length})`} />
            <Tab label={`Unmatched (${unmatchedTransactions.length})`} />
            {suggestions.length > 0 && (
              <Tab label={`Suggestions (${suggestions.length})`} />
            )}
          </Tabs>
        </Box>

        {/* Matched Transactions Tab */}
        {activeTab === 0 && (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Match Type</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {matchedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">
                      <Typography variant="body2" color="text.secondary">
                        No matched transactions yet. Use Auto-Match or manually match transactions.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  matchedTransactions.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>
                        {new Date(match.transactionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{match.description || 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(match.amount)}</TableCell>
                      <TableCell>
                        <Chip
                          label={match.matchType}
                          size="small"
                          color={match.matchType === 'AUTO' ? 'primary' : 'default'}
                        />
                      </TableCell>
                      <TableCell>
                        {data.status !== 'COMPLETED' && (
                          <Tooltip title="Unmatch">
                            <IconButton
                              size="small"
                              onClick={() => handleUnmatch(match.id)}
                              disabled={isLoading}
                            >
                              <LinkOff />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Unmatched Transactions Tab */}
        {activeTab === 1 && (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {unmatchedTransactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} align="center">
                      <Typography variant="body2" color="text.secondary">
                        All transactions are matched!
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  unmatchedTransactions.map((match) => (
                    <TableRow key={match.id}>
                      <TableCell>
                        {new Date(match.transactionDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell>{match.description || 'N/A'}</TableCell>
                      <TableCell>{formatCurrency(match.amount)}</TableCell>
                      <TableCell>
                        {data.status !== 'COMPLETED' && (
                          <Tooltip title="Match Transaction">
                            <IconButton
                              size="small"
                              onClick={() => handleMatch(match.systemTransactionId, match.statementItemId || undefined)}
                              disabled={isLoading}
                            >
                              <LinkIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {/* Suggestions Tab */}
        {activeTab === 2 && suggestions.length > 0 && (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Score</TableCell>
                  <TableCell>System Transaction</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {suggestions.map((suggestion, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Chip
                        label={`${suggestion.matchScore.toFixed(0)}%`}
                        color={suggestion.matchScore > 80 ? 'success' : suggestion.matchScore > 50 ? 'warning' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {suggestion.description || 'N/A'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(suggestion.transactionDate).toLocaleDateString()}
                      </Typography>
                    </TableCell>
                    <TableCell>{formatCurrency(suggestion.amount)}</TableCell>
                    <TableCell>
                      <Typography variant="caption">{suggestion.matchReason}</Typography>
                    </TableCell>
                    <TableCell>
                      {data.status !== 'COMPLETED' && (
                        <Tooltip title="Accept Suggestion">
                          <IconButton
                            size="small"
                            onClick={() => handleMatch(suggestion.systemTransactionId, suggestion.statementItemId)}
                            disabled={isLoading}
                          >
                            <CheckCircle />
                          </IconButton>
                        </Tooltip>
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
        <Button onClick={onClose} disabled={isLoading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransactionMatchingDialog;

