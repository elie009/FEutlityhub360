import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { apiService } from '../services/api';
import { useCurrency } from '../contexts/CurrencyContext';

interface IncomeSourceForm {
  id?: string;
  name: string;
  amount: number;
  frequency: string;
  category: string;
  currency: string;
  description: string;
  company: string;
  isActive?: boolean;
}

const frequencyOptions = [
  { value: 'MONTHLY', label: 'Monthly' },
  { value: 'WEEKLY', label: 'Weekly' },
  { value: 'QUARTERLY', label: 'Quarterly' },
  { value: 'YEARLY', label: 'Yearly' },
];

const categoryOptions = [
  { value: 'PRIMARY', label: 'Primary' },
  { value: 'PASSIVE', label: 'Passive' },
  { value: 'BUSINESS', label: 'Business' },
  { value: 'SIDE_HUSTLE', label: 'Side hustle' },
  { value: 'INVESTMENT', label: 'Investment' },
  { value: 'DIVIDEND', label: 'Dividend' },
  { value: 'INTEREST', label: 'Interest' },
  { value: 'OTHER', label: 'Other' },
];

const IncomeSources: React.FC = () => {
  const { currency } = useCurrency();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [summary, setSummary] = useState<{ totalMonthlyIncome?: number; totalSources?: number } | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [form, setForm] = useState<IncomeSourceForm>({
    name: '',
    amount: 0,
    frequency: 'MONTHLY',
    category: 'PRIMARY',
    currency: currency || 'USD',
    description: '',
    company: '',
  });

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await apiService.getIncomeSourcesWithSummary(true);
      if (resp && resp.success && resp.data) {
        setSources(resp.data.incomeSources || []);
        setSummary({
          totalMonthlyIncome: resp.data.totalMonthlyIncome,
          totalSources: resp.data.totalSources,
        });
      } else {
        const list = await apiService.getIncomeSources();
        setSources(list?.data || []);
      }
    } catch (e: any) {
      setError(e.message || 'Failed to load income sources');
      setSources([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setForm({
      name: '',
      amount: 0,
      frequency: 'MONTHLY',
      category: 'PRIMARY',
      currency: currency || 'USD',
      description: '',
      company: '',
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const openEdit = (src: any) => {
    setForm({
      id: src.id,
      name: src.name || '',
      amount: src.amount || src.monthlyAmount || 0,
      frequency: src.frequency || 'MONTHLY',
      category: src.category || 'PRIMARY',
      currency: src.currency || currency || 'USD',
      description: src.description || '',
      company: src.company || '',
      isActive: src.isActive !== false,
    });
    setFormError(null);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError('Name is required');
      return;
    }
    if (form.amount <= 0) {
      setFormError('Amount must be greater than 0');
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (form.id) {
        await apiService.updateIncomeSource(form.id, {
          name: form.name,
          amount: form.amount,
          frequency: form.frequency,
          category: form.category,
          currency: form.currency,
          description: form.description,
          company: form.company,
          isActive: form.isActive !== false,
        });
      } else {
        await apiService.createIncomeSource({
          name: form.name,
          amount: form.amount,
          frequency: form.frequency,
          category: form.category,
          currency: form.currency,
          description: form.description,
          company: form.company,
        });
      }
      setDialogOpen(false);
      await loadData();
    } catch (e: any) {
      setFormError(e.message || 'Failed to save income source');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiService.deleteIncomeSource(id);
      await loadData();
    } catch (e) {
      // ignore
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Income Sources
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your income sources used across analytics and budgeting.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          Add Income Source
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Grid container spacing={2}>
          {summary && (
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Total Monthly Income
                </Typography>
                <Typography variant="h5" color="primary">
                  {new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(summary.totalMonthlyIncome || 0)}
                </Typography>
                <Chip label={`Sources: ${summary.totalSources || sources.length}`} size="small" sx={{ mt: 1 }} />
              </Paper>
            </Grid>
          )}

          <Grid item xs={12} md={summary ? 8 : 12}>
            <Paper sx={{ p: 2 }}>
              {sources.length === 0 ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
                  No income sources yet. Click "Add Income Source" to create one.
                </Typography>
              ) : (
                <Grid container spacing={2}>
                  {sources.map((s) => (
                    <Grid item xs={12} md={6} key={s.id}>
                      <Paper sx={{ p: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="h6">{s.name}</Typography>
                          <Box>
                            <Tooltip title="Edit">
                              <IconButton size="small" onClick={() => openEdit(s)}>
                                <Edit fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" onClick={() => handleDelete(s.id)}>
                                <Delete fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            {s.company || '—'}
                          </Typography>
                          <Typography variant="h5" sx={{ mt: 1 }}>
                            {new Intl.NumberFormat(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(s.monthlyAmount ?? s.amount ?? 0)}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                            <Chip label={s.frequency} size="small" />
                            <Chip label={s.category} size="small" />
                            <Chip label={s.currency} size="small" />
                            <Chip label={s.isActive ? 'Active' : 'Inactive'} size="small" color={s.isActive ? 'success' : 'default'} />
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{form.id ? 'Edit Income Source' : 'Add Income Source'}</DialogTitle>
        <DialogContent dividers>
          {formError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {formError}
            </Alert>
          )}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Amount"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: parseFloat(e.target.value) || 0 })}
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Frequency</InputLabel>
                <Select
                  value={form.frequency}
                  label="Frequency"
                  onChange={(e) => setForm({ ...form, frequency: e.target.value })}
                >
                  {frequencyOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={form.category}
                  label="Category"
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                >
                  {categoryOptions.map((opt) => (
                    <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Currency"
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IncomeSources;



