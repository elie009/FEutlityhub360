import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Tooltip,
} from '@mui/material';
import {
  AccountBalance,
  Upload,
  Refresh,
  CheckCircle,
  Warning,
  Info,
  Close,
  AutoFixHigh,
  Link as LinkIcon,
  LinkOff,
  Download,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { apiService } from '../services/api';
import { useLocation } from 'react-router-dom';
import { BankAccount } from '../types/bankAccount';
import {
  BankStatement,
  Reconciliation,
  ReconciliationSummary,
  TransactionMatchSuggestion,
} from '../types/reconciliation';
import { getErrorMessage } from '../utils/validation';
import BankStatementImportDialog from '../components/Reconciliation/BankStatementImportDialog';
import ReconciliationDialog from '../components/Reconciliation/ReconciliationDialog';
import TransactionMatchingDialog from '../components/Reconciliation/TransactionMatchingDialog';

const ReconciliationPage: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const location = useLocation();
  
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [bankStatements, setBankStatements] = useState<BankStatement[]>([]);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  
  // Dialog states
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showReconciliationDialog, setShowReconciliationDialog] = useState(false);
  const [showMatchingDialog, setShowMatchingDialog] = useState(false);
  const [selectedReconciliation, setSelectedReconciliation] = useState<Reconciliation | null>(null);
  const [selectedStatement, setSelectedStatement] = useState<BankStatement | null>(null);

  // Load bank accounts
  useEffect(() => {
    const loadBankAccounts = async () => {
      try {
        const accounts = await apiService.getUserBankAccounts();
        setBankAccounts(accounts);
        
        // Check if accountId was passed via navigation state
        const stateAccountId = (location.state as any)?.accountId;
        if (stateAccountId && accounts.find(acc => acc.id === stateAccountId)) {
          setSelectedAccountId(stateAccountId);
        } else if (accounts.length > 0 && !selectedAccountId) {
          setSelectedAccountId(accounts[0].id);
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load bank accounts'));
      }
    };
    loadBankAccounts();
  }, [location.state]);

  // Load data when account changes
  useEffect(() => {
    if (selectedAccountId) {
      loadReconciliationData();
    }
  }, [selectedAccountId]);

  const loadReconciliationData = useCallback(async () => {
    if (!selectedAccountId) return;
    
    setIsLoading(true);
    setError('');
    try {
      const [reconciliationsData, statementsData, summaryData] = await Promise.all([
        apiService.getReconciliations(selectedAccountId),
        apiService.getBankStatements(selectedAccountId),
        apiService.getReconciliationSummary(selectedAccountId),
      ]);
      
      setReconciliations(reconciliationsData);
      setBankStatements(statementsData);
      setSummary(summaryData);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load reconciliation data'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccountId]);

  const handleAccountChange = (event: SelectChangeEvent<string>) => {
    setSelectedAccountId(event.target.value);
  };

  const handleImportSuccess = () => {
    setSuccess('Bank statement imported successfully!');
    loadReconciliationData();
    setShowImportDialog(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleReconciliationSuccess = () => {
    setSuccess('Reconciliation created successfully!');
    loadReconciliationData();
    setShowReconciliationDialog(false);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleAutoMatch = async (reconciliationId: string) => {
    try {
      setIsLoading(true);
      await apiService.autoMatchTransactions(reconciliationId);
      setSuccess('Transactions auto-matched successfully!');
      loadReconciliationData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to auto-match transactions'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewReconciliation = async (reconciliation: Reconciliation) => {
    try {
      const fullReconciliation = await apiService.getReconciliation(reconciliation.id);
      setSelectedReconciliation(fullReconciliation);
      setShowMatchingDialog(true);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load reconciliation details'));
    }
  };

  const getStatusColor = (status: string): 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'COMPLETED': return 'success';
      case 'IN_PROGRESS': return 'info';
      case 'DISCREPANCY': return 'error';
      default: return 'warning';
    }
  };

  const selectedAccount = bankAccounts.find(acc => acc.id === selectedAccountId);

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Account Reconciliation
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Import bank statements and reconcile transactions with your accounts
        </Typography>
      </Box>

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

      {/* Account Selection */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <FormControl fullWidth>
                <InputLabel>Select Bank Account</InputLabel>
                <Select
                  value={selectedAccountId}
                  onChange={handleAccountChange}
                  label="Select Bank Account"
                >
                  {bankAccounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.accountName} ({account.accountType})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={8}>
              {selectedAccount && (
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Chip
                    icon={<AccountBalance />}
                    label={`Balance: ${formatCurrency(selectedAccount.currentBalance)}`}
                    color="primary"
                    variant="outlined"
                  />
                  <Chip
                    label={`${selectedAccount.transactionCount} transactions`}
                    variant="outlined"
                  />
                </Box>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Summary Card */}
      {summary && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Book Balance
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(summary.bookBalance)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Statement Balance
                </Typography>
                <Typography variant="h5">
                  {formatCurrency(summary.statementBalance)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Difference
                </Typography>
                <Typography
                  variant="h5"
                  color={Math.abs(summary.difference) < 0.01 ? 'success.main' : 'error.main'}
                >
                  {formatCurrency(summary.difference)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Status
                </Typography>
                <Chip
                  label={summary.status}
                  color={summary.isBalanced ? 'success' : 'warning'}
                  icon={summary.isBalanced ? <CheckCircle /> : <Warning />}
                />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          startIcon={<Upload />}
          onClick={() => setShowImportDialog(true)}
          disabled={!selectedAccountId}
        >
          Import Bank Statement
        </Button>
        <Button
          variant="outlined"
          startIcon={<AccountBalance />}
          onClick={() => setShowReconciliationDialog(true)}
          disabled={!selectedAccountId}
        >
          Create Reconciliation
        </Button>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={loadReconciliationData}
          disabled={isLoading}
        >
          Refresh
        </Button>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)}>
            <Tab label="Reconciliations" />
            <Tab label="Bank Statements" />
          </Tabs>
        </Box>

        {/* Reconciliations Tab */}
        {activeTab === 0 && (
          <CardContent>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : reconciliations.length === 0 ? (
              <Alert severity="info">
                No reconciliations found. Create a new reconciliation to get started.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Book Balance</TableCell>
                      <TableCell>Statement Balance</TableCell>
                      <TableCell>Difference</TableCell>
                      <TableCell>Matched</TableCell>
                      <TableCell>Unmatched</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reconciliations.map((reconciliation) => (
                      <TableRow key={reconciliation.id}>
                        <TableCell>{reconciliation.reconciliationName}</TableCell>
                        <TableCell>
                          {new Date(reconciliation.reconciliationDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{formatCurrency(reconciliation.bookBalance)}</TableCell>
                        <TableCell>{formatCurrency(reconciliation.statementBalance)}</TableCell>
                        <TableCell>
                          <Typography
                            color={Math.abs(reconciliation.difference) < 0.01 ? 'success.main' : 'error.main'}
                          >
                            {formatCurrency(reconciliation.difference)}
                          </Typography>
                        </TableCell>
                        <TableCell>{reconciliation.matchedTransactions}</TableCell>
                        <TableCell>{reconciliation.unmatchedTransactions}</TableCell>
                        <TableCell>
                          <Chip
                            label={reconciliation.status}
                            color={getStatusColor(reconciliation.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => handleViewReconciliation(reconciliation)}
                              >
                                <Info />
                              </IconButton>
                            </Tooltip>
                            {reconciliation.status !== 'COMPLETED' && (
                              <Tooltip title="Auto-Match">
                                <IconButton
                                  size="small"
                                  onClick={() => handleAutoMatch(reconciliation.id)}
                                  disabled={isLoading}
                                >
                                  <AutoFixHigh />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        )}

        {/* Bank Statements Tab */}
        {activeTab === 1 && (
          <CardContent>
            {isLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : bankStatements.length === 0 ? (
              <Alert severity="info">
                No bank statements found. Import a bank statement to get started.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Statement Name</TableCell>
                      <TableCell>Period</TableCell>
                      <TableCell>Opening Balance</TableCell>
                      <TableCell>Closing Balance</TableCell>
                      <TableCell>Transactions</TableCell>
                      <TableCell>Matched</TableCell>
                      <TableCell>Unmatched</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bankStatements.map((statement) => (
                      <TableRow key={statement.id}>
                        <TableCell>{statement.statementName}</TableCell>
                        <TableCell>
                          {new Date(statement.statementStartDate).toLocaleDateString()} -{' '}
                          {new Date(statement.statementEndDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{formatCurrency(statement.openingBalance)}</TableCell>
                        <TableCell>{formatCurrency(statement.closingBalance)}</TableCell>
                        <TableCell>{statement.totalTransactions}</TableCell>
                        <TableCell>{statement.matchedTransactions}</TableCell>
                        <TableCell>{statement.unmatchedTransactions}</TableCell>
                        <TableCell>
                          <Chip
                            label={statement.isReconciled ? 'Reconciled' : 'Pending'}
                            color={statement.isReconciled ? 'success' : 'warning'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedStatement(statement);
                              setShowMatchingDialog(true);
                            }}
                          >
                            <Info />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        )}
      </Card>

      {/* Dialogs */}
      {selectedAccountId && (
        <>
          <BankStatementImportDialog
            open={showImportDialog}
            onClose={() => setShowImportDialog(false)}
            bankAccountId={selectedAccountId}
            onSuccess={handleImportSuccess}
          />

          <ReconciliationDialog
            open={showReconciliationDialog}
            onClose={() => setShowReconciliationDialog(false)}
            bankAccountId={selectedAccountId}
            bankStatements={bankStatements}
            onSuccess={handleReconciliationSuccess}
          />

          <TransactionMatchingDialog
            open={showMatchingDialog}
            onClose={() => {
              setShowMatchingDialog(false);
              setSelectedReconciliation(null);
              setSelectedStatement(null);
            }}
            reconciliation={selectedReconciliation}
            bankStatement={selectedStatement}
            onUpdate={loadReconciliationData}
          />
        </>
      )}
    </Container>
  );
};

export default ReconciliationPage;

