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
  Delete,
  Visibility,
  Cancel,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { apiService } from '../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import { BankAccount } from '../types/bankAccount';
import {
  BankStatement,
  Reconciliation,
  ReconciliationSummary,
  TransactionMatchSuggestion,
  BankStatementUploadLimit,
  BankStatementUpload,
} from '../types/reconciliation';
import { getErrorMessage } from '../utils/validation';
import BankStatementImportDialog from '../components/Reconciliation/BankStatementImportDialog';
import ReconciliationDialog from '../components/Reconciliation/ReconciliationDialog';
import TransactionMatchingDialog from '../components/Reconciliation/TransactionMatchingDialog';
import StagingTransactionsModal from '../components/Reconciliation/StagingTransactionsModal';
import BankStatementTransactionsModal from '../components/Reconciliation/BankStatementTransactionsModal';

const ReconciliationPage: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>([]);
  const [bankStatements, setBankStatements] = useState<BankStatement[]>([]);
  const [bankUploads, setBankUploads] = useState<BankStatementUpload[]>([]);
  const [summary, setSummary] = useState<ReconciliationSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [activeTab, setActiveTab] = useState(0);
  
  // Dialog states
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [showReconciliationDialog, setShowReconciliationDialog] = useState(false);
  const [showMatchingDialog, setShowMatchingDialog] = useState(false);
  const [showStagingModal, setShowStagingModal] = useState(false);
  const [showTransactionsModal, setShowTransactionsModal] = useState(false);
  const [selectedReconciliation, setSelectedReconciliation] = useState<Reconciliation | null>(null);
  const [selectedStatement, setSelectedStatement] = useState<BankStatement | null>(null);
  const [selectedUpload, setSelectedUpload] = useState<BankStatementUpload | null>(null);
  
  // Delete confirmation state
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [statementToDelete, setStatementToDelete] = useState<BankStatement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Upload limit state
  const [uploadLimit, setUploadLimit] = useState<BankStatementUploadLimit | null>(null);

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
        } else if (accounts.length > 0) {
          // Always set the first account if no account is currently selected
          setSelectedAccountId(prev => {
            // Only set if no account is currently selected
            if (!prev && accounts.length > 0) {
              return accounts[0].id;
            }
            return prev;
          });
        }
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load bank accounts'));
      }
    };
    loadBankAccounts();
  }, [location.state]);

  // Load upload limit
  useEffect(() => {
    const loadUploadLimit = async () => {
      try {
        const limitInfo = await apiService.getBankStatementUploadLimit();
        setUploadLimit(limitInfo);
      } catch (err) {
        console.error('Failed to load upload limit:', err);
      }
    };
    loadUploadLimit();
  }, []);

  const loadReconciliationData = useCallback(async () => {
    if (!selectedAccountId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setError('');
    try {
      const [reconciliationsData, statementsData, uploadsData, summaryData] = await Promise.all([
        apiService.getReconciliations(selectedAccountId),
        apiService.getBankStatements(selectedAccountId),
        apiService.getUserUploads(selectedAccountId),
        apiService.getReconciliationSummary(selectedAccountId),
      ]);
      
      setReconciliations(reconciliationsData);
      setBankStatements(statementsData);
      setBankUploads(uploadsData);
      setSummary(summaryData);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load reconciliation data'));
    } finally {
      setIsLoading(false);
    }
  }, [selectedAccountId]);

  // Load data when account changes
  useEffect(() => {
    if (selectedAccountId) {
      loadReconciliationData();
    } else {
      // Reset data when no account is selected
      setReconciliations([]);
      setBankStatements([]);
      setBankUploads([]);
      setSummary(null);
      setIsLoading(false);
    }
  }, [selectedAccountId, loadReconciliationData]);

  // Poll for upload status updates
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    
    const hasPendingUploads = bankUploads.some(u => 
      u.status === 'PENDING' || u.status === 'PROCESSING'
    );

    if (hasPendingUploads && selectedAccountId) {
      pollInterval = setInterval(async () => {
        try {
          const uploadsData = await apiService.getUserUploads(selectedAccountId);
          setBankUploads(uploadsData);
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 5000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [bankUploads, selectedAccountId]);

  const handleAccountChange = (event: SelectChangeEvent<string>) => {
    setSelectedAccountId(event.target.value);
  };

  const handleImportSuccess = async () => {
    setSuccess('Bank statement uploaded successfully! It is now being processed.');
    loadReconciliationData();
    setShowImportDialog(false);
    setActiveTab(1); // Automatically switch to Bank Statements tab to show progress
    setTimeout(() => setSuccess(''), 3000);
    
    // Reload upload limit after successful import
    try {
      const limitInfo = await apiService.getBankStatementUploadLimit();
      setUploadLimit(limitInfo);
    } catch (err) {
      console.error('Failed to reload upload limit:', err);
    }
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

  const handleCancelUpload = async (uploadId: string) => {
    if (!window.confirm('Are you sure you want to cancel this upload?')) return;
    
    try {
      await apiService.cancelUpload(uploadId);
      setSuccess('Upload cancelled.');
      loadReconciliationData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to cancel upload.'));
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

  const handleDeleteClick = (statement: BankStatement) => {
    setStatementToDelete(statement);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!statementToDelete) return;

    setIsDeleting(true);
    try {
      await apiService.deleteBankStatement(statementToDelete.id);
      setSuccess('Bank statement deleted successfully!');
      loadReconciliationData();
      setDeleteConfirmOpen(false);
      setStatementToDelete(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to delete bank statement'));
    } finally {
      setIsDeleting(false);
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
          Match with Bank Statement
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Import bank statements and match transactions with your accounts to keep everything accurate
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
                  value={selectedAccountId || ''}
                  onChange={handleAccountChange}
                  label="Select Bank Account"
                  disabled={bankAccounts.length === 0}
                >
                  {bankAccounts.length === 0 ? (
                    <MenuItem disabled value="">
                      No bank accounts available
                    </MenuItem>
                  ) : (
                    bankAccounts.map((account) => (
                      <MenuItem key={account.id} value={account.id}>
                        {account.accountName} ({account.accountType})
                      </MenuItem>
                    ))
                  )}
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
          <Grid item xs={12} sm={6} md={uploadLimit && uploadLimit.uploadLimit !== null ? 2.4 : 3}>
            <Card sx={{ height: '100%' }}>
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
          <Grid item xs={12} sm={6} md={uploadLimit && uploadLimit.uploadLimit !== null ? 2.4 : 3}>
            <Card sx={{ height: '100%' }}>
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
          <Grid item xs={12} sm={6} md={uploadLimit && uploadLimit.uploadLimit !== null ? 2.4 : 3}>
            <Card sx={{ height: '100%' }}>
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
          <Grid item xs={12} sm={6} md={uploadLimit && uploadLimit.uploadLimit !== null ? 2.4 : 3}>
            <Card sx={{ height: '100%' }}>
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
          {/* Upload Limit Card */}
          {uploadLimit && uploadLimit.uploadLimit !== null && (
            <Grid item xs={12} sm={6} md={2.4}>
              <Card sx={{ bgcolor: uploadLimit.canUpload ? 'info.light' : 'error.light', height: '100%' }}>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Monthly Upload Limit
                  </Typography>
                  <Typography variant="h6" sx={{ mb: 0.5 }}>
                    {uploadLimit.currentUploads} / {uploadLimit.uploadLimit} upalod remaining
                  </Typography>
                 
                  {!uploadLimit.canUpload && (
                    <>
                      <Typography variant="body2" color="error" sx={{ mt: 1, fontWeight: 'bold' }}>
                        Limit reached
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary"
                        size="small"
                        fullWidth
                        sx={{ mt: 1 }}
                        onClick={() => navigate('/settings#subscription')}
                      >
                        Upgrade
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Action Buttons */}
      <Box sx={{ mb: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
        <Tooltip title={!selectedAccountId ? "Please select a bank account first" : ""}>
          <span>
            <Button
              variant="contained"
              startIcon={<Upload />}
              onClick={() => setShowImportDialog(true)}
              disabled={!selectedAccountId || bankAccounts.length === 0}
            >
              Import Bank Statement
            </Button>
          </span>
        </Tooltip>
        <Button
          variant="outlined"
          startIcon={<AccountBalance />}
          onClick={() => setShowReconciliationDialog(true)}
          disabled={!selectedAccountId}
        >
          Create Match Session
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
                      <TableCell>Book Balance</TableCell>
                      <TableCell>Statement Balance</TableCell>
                      <TableCell>Difference</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Monthly Upload Limit</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reconciliations.map((reconciliation) => (
                      <TableRow key={reconciliation.id}>
                        <TableCell>{formatCurrency(reconciliation.bookBalance)}</TableCell>
                        <TableCell>{formatCurrency(reconciliation.statementBalance)}</TableCell>
                        <TableCell>
                          <Typography
                            color={Math.abs(reconciliation.difference) < 0.01 ? 'success.main' : 'error.main'}
                          >
                            {formatCurrency(reconciliation.difference)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={reconciliation.status}
                            color={getStatusColor(reconciliation.status)}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {uploadLimit ? (
                            uploadLimit.uploadLimit !== null ? (
                              <Typography variant="body2">
                                {uploadLimit.currentUploads} / {uploadLimit.uploadLimit}
                              </Typography>
                            ) : (
                              <Typography variant="body2" color="success.main">
                                Unlimited
                              </Typography>
                            )
                          ) : (
                            <Typography variant="body2">-</Typography>
                          )}
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
            ) : (bankStatements.length === 0 && bankUploads.length === 0) ? (
              <Alert severity="info">
                No bank statements found. Import a bank statement to get started.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name / File</TableCell>
                      <TableCell>Period / Date</TableCell>
                      <TableCell>Balance / Type</TableCell>
                      <TableCell>Transactions</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {/* First, show active uploads */}
                    {bankUploads
                      .filter(u => u.status !== 'COMPLETED')
                      .map((upload) => (
                      <TableRow key={upload.id} sx={{ bgcolor: 'action.hover' }}>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {upload.originalFileName}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Upload in progress
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {new Date(upload.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Chip label={upload.fileType} size="small" variant="outlined" />
                        </TableCell>
                        <TableCell>-</TableCell>
                        <TableCell>
                          <Chip
                            label={upload.status}
                            color={
                              upload.status === 'DONE' ? 'info' : 
                              upload.status === 'FAILED' ? 'error' : 
                              'warning'
                            }
                            size="small"
                            variant={upload.status === 'PROCESSING' ? 'outlined' : 'filled'}
                            icon={upload.status === 'PROCESSING' ? <CircularProgress size={16} /> : undefined}
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            {upload.status === 'DONE' && (
                              <Tooltip title="View & Confirm Extracted Transactions">
                                <IconButton
                                  size="small"
                                  color="primary"
                                  onClick={() => {
                                    setSelectedUpload(upload);
                                    setShowStagingModal(true);
                                  }}
                                >
                                  <Visibility />
                                </IconButton>
                              </Tooltip>
                            )}
                            {upload.status === 'FAILED' && (
                              <Tooltip title={upload.errorMessage || 'Processing failed'}>
                                <IconButton size="small" color="error">
                                  <Info />
                                </IconButton>
                              </Tooltip>
                            )}
                            {(upload.status === 'PENDING' || upload.status === 'PROCESSING') && (
                              <Tooltip title="Cancel Upload">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleCancelUpload(upload.id)}
                                >
                                  <Cancel fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}

                    {/* Then, show finalized statements */}
                    {bankStatements.map((statement) => (
                      <TableRow key={statement.id}>
                        <TableCell>{statement.statementName}</TableCell>
                        <TableCell>
                          {new Date(statement.statementStartDate).toLocaleDateString()} -{' '}
                          {new Date(statement.statementEndDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">Open: {formatCurrency(statement.openingBalance)}</Typography>
                          <Typography variant="body2">Close: {formatCurrency(statement.closingBalance)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">{statement.totalTransactions} total</Typography>
                          <Typography variant="caption" color="success.main">{statement.matchedTransactions} matched</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={statement.isReconciled ? 'Reconciled' : 'Ready'}
                            color={statement.isReconciled ? 'success' : 'info'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="View Details">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedStatement(statement);
                                  setShowTransactionsModal(true);
                                }}
                              >
                                <Visibility />
                              </IconButton>
                            </Tooltip>
                            {!statement.isReconciled && (
                              <Tooltip title="Delete Statement">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => handleDeleteClick(statement)}
                                  disabled={isDeleting}
                                >
                                  <Delete />
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

          <StagingTransactionsModal
            open={showStagingModal}
            onClose={() => {
              setShowStagingModal(false);
              setSelectedUpload(null);
            }}
            upload={selectedUpload}
            onSuccess={() => {
              setSuccess('Transactions confirmed and imported!');
              loadReconciliationData();
              setActiveTab(1); // Switch to Bank Statements tab
              setTimeout(() => setSuccess(''), 3000);
            }}
          />

          <BankStatementTransactionsModal
            open={showTransactionsModal}
            onClose={() => {
              setShowTransactionsModal(false);
              setSelectedStatement(null);
            }}
            statement={selectedStatement}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onClose={() => {
          if (!isDeleting) {
            setDeleteConfirmOpen(false);
            setStatementToDelete(null);
          }
        }}
      >
        <DialogTitle>Delete Bank Statement</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the bank statement "{statementToDelete?.statementName}"?
            This will also delete all transactions imported from this statement. This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleteConfirmOpen(false);
              setStatementToDelete(null);
            }}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ReconciliationPage;

