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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Close,
  Save,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { BankStatement } from '../../types/reconciliation';
import { getErrorMessage } from '../../utils/validation';

interface ReconciliationDialogProps {
  open: boolean;
  onClose: () => void;
  bankAccountId: string;
  bankStatements: BankStatement[];
  onSuccess: () => void;
}

const ReconciliationDialog: React.FC<ReconciliationDialogProps> = ({
  open,
  onClose,
  bankAccountId,
  bankStatements,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    reconciliationName: '',
    reconciliationDate: new Date().toISOString().split('T')[0],
    bankStatementId: '',
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (open) {
      // Generate default name
      const date = new Date();
      const monthName = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      setFormData({
        reconciliationName: `${monthName} ${year} Bank Statement Match`,
        reconciliationDate: date.toISOString().split('T')[0],
        bankStatementId: bankStatements.length > 0 ? bankStatements[0].id : '',
        notes: '',
      });
      setError('');
    }
  }, [open, bankStatements]);

  const handleSubmit = async () => {
    setError('');
    
      if (!formData.reconciliationName.trim()) {
      setError('Match session name is required');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.createReconciliation({
        bankAccountId,
        reconciliationName: formData.reconciliationName,
        reconciliationDate: new Date(formData.reconciliationDate).toISOString(),
        bankStatementId: formData.bankStatementId || undefined,
        notes: formData.notes || undefined,
      });
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create reconciliation'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Create Match Session</Typography>
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

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Match Session Name"
              value={formData.reconciliationName}
              onChange={(e) => setFormData({ ...formData, reconciliationName: e.target.value })}
              required
              placeholder="e.g., January 2024 Bank Statement Match"
              helperText="Give this matching session a name you'll remember"
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Match Date"
              helperText="The date you're matching transactions for"
              type="date"
              value={formData.reconciliationDate}
              onChange={(e) => setFormData({ ...formData, reconciliationDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Bank Statement (Optional)</InputLabel>
              <Select
                value={formData.bankStatementId}
                onChange={(e) => setFormData({ ...formData, bankStatementId: e.target.value })}
                label="Bank Statement (Optional)"
              >
                <MenuItem value="">None - Manual Matching</MenuItem>
                {bankStatements.map((statement) => (
                  <MenuItem key={statement.id} value={statement.id}>
                    {statement.statementName} ({new Date(statement.statementEndDate).toLocaleDateString()})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Notes (Optional)"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              multiline
              rows={3}
              placeholder="Add any notes about this matching session..."
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading}
          startIcon={isLoading ? <CircularProgress size={20} /> : <Save />}
        >
          {isLoading ? 'Creating...' : 'Create Match Session'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ReconciliationDialog;

