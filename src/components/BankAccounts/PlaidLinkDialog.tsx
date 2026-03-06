import React, { useEffect, useState, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Typography,
  Box,
  Alert
} from '@mui/material';
import { usePlaidLink } from 'react-plaid-link';
import apiService from '../../services/api';
import { BankAccount } from '../../types/bankAccount';

interface PlaidLinkDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  bankAccount: BankAccount | null;
}

const PlaidLinkDialog: React.FC<PlaidLinkDialogProps> = ({
  open,
  onClose,
  onSuccess,
  bankAccount
}) => {
  const [linkToken, setLinkToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Fetch link token when dialog opens
  useEffect(() => {
    if (open && !linkToken) {
      fetchLinkToken();
    }
  }, [open]);

  const fetchLinkToken = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await apiService.createPlaidLinkToken();
      setLinkToken(response.linkToken);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize Plaid Link');
      console.error('Error fetching link token:', err);
    } finally {
      setLoading(false);
    }
  };

  const onSuccessCallback = useCallback(
    async (publicToken: string, metadata: any) => {
      if (!bankAccount) {
        setError('Bank account not selected');
        return;
      }

      setLoading(true);
      setError('');

      try {
        await apiService.exchangePlaidPublicToken(publicToken, bankAccount.id);
        onSuccess();
        onClose();
      } catch (err: any) {
        setError(err.message || 'Failed to connect account');
        console.error('Error exchanging public token:', err);
      } finally {
        setLoading(false);
      }
    },
    [bankAccount, onSuccess, onClose]
  );

  const onExitCallback = useCallback((err: any, metadata: any) => {
    if (err) {
      setError(err.error_message || 'Connection cancelled');
    }
    // Don't close dialog on exit, let user try again or manually close
  }, []);

  const { open: openPlaidLink, ready } = usePlaidLink({
    token: linkToken,
    onSuccess: onSuccessCallback,
    onExit: onExitCallback
  });

  const handleOpenPlaid = () => {
    if (ready && linkToken) {
      openPlaidLink();
    }
  };

  const handleClose = () => {
    setLinkToken(null);
    setError('');
    onClose();
  };

  if (!bankAccount) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Connect Bank Account via Plaid</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading && !linkToken && (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Initializing secure connection...
            </Typography>
          </Box>
        )}

        {linkToken && !loading && (
          <Box>
            <Typography variant="body1" gutterBottom>
              Connect <strong>{bankAccount.accountName}</strong> to your bank using Plaid's secure connection.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              Plaid uses bank-level encryption to securely connect your account. Your credentials are never stored by UtilityHub360.
            </Typography>
          </Box>
        )}

        {!linkToken && !loading && error && (
          <Typography variant="body2" color="error">
            {error}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleOpenPlaid}
          variant="contained"
          disabled={!ready || !linkToken || loading}
          startIcon={loading ? <CircularProgress size={20} /> : null}
        >
          {loading ? 'Connecting...' : 'Open Plaid Link'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PlaidLinkDialog;

