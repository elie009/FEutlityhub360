import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Alert,
  CircularProgress,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import { BankAccount, BankAccountFilters } from '../types/bankAccount';
import { getErrorMessage } from '../utils/validation';
import BankAccountCard from '../components/BankAccounts/BankAccountCard';
import BankAccountForm from '../components/BankAccounts/BankAccountForm';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
  });

  const [profile, setProfile] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 234 567 8900',
  });

  // Bank Account Management State
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showBankAccountForm, setShowBankAccountForm] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<BankAccount | undefined>(undefined);
  const [filters, setFilters] = useState<BankAccountFilters>({});

  const handleNotificationChange = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type],
    }));
  };

  const handleProfileChange = (field: keyof typeof profile, value: string) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSaveProfile = () => {
    console.log('Saving profile:', profile);
  };

  const handleSaveNotifications = () => {
    console.log('Saving notifications:', notifications);
  };

  // Bank Account Management Functions
  const loadBankAccounts = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    setError('');
    try {
      const accountsData = await apiService.getUserBankAccounts(filters);
      setBankAccounts(accountsData);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load bank accounts'));
    } finally {
      setIsLoading(false);
    }
  }, [user, filters]);

  useEffect(() => {
    loadBankAccounts();
  }, [loadBankAccounts]);

  const handleCreateBankAccount = () => {
    setSelectedAccount(undefined);
    setShowBankAccountForm(true);
  };

  const handleEditBankAccount = (account: BankAccount) => {
    setSelectedAccount(account);
    setShowBankAccountForm(true);
  };

  const handleDeleteBankAccount = async (accountId: string) => {
    if (!window.confirm('Are you sure you want to delete this bank account?')) return;
    setIsLoading(true);
    setError('');
    try {
      await apiService.deleteBankAccount(accountId);
      loadBankAccounts();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to delete bank account'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleConnectBankAccount = async (accountId: string) => {
    setIsLoading(true);
    setError('');
    try {
      await apiService.connectBankAccount(accountId);
      loadBankAccounts();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to connect bank account'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnectBankAccount = async (accountId: string) => {
    setIsLoading(true);
    setError('');
    try {
      await apiService.disconnectBankAccount(accountId);
      loadBankAccounts();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to disconnect bank account'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncBankAccount = async (accountId: string) => {
    setIsLoading(true);
    setError('');
    try {
      await apiService.syncBankAccount(accountId);
      loadBankAccounts();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to sync bank account'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBankAccountFormSuccess = () => {
    setShowBankAccountForm(false);
    loadBankAccounts();
  };

  const handleFilterChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name as string]: value === 'all' ? undefined : value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Grid container spacing={3}>
        {/* Profile Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Profile Information
            </Typography>
            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  value={profile.firstName}
                  onChange={(e) => handleProfileChange('firstName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  value={profile.lastName}
                  onChange={(e) => handleProfileChange('lastName', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={<SaveIcon />}
                  onClick={handleSaveProfile}
                  fullWidth
                >
                  Save Profile
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Notification Settings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Notification Preferences
            </Typography>
            <Box sx={{ mt: 2 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.email}
                    onChange={() => handleNotificationChange('email')}
                  />
                }
                label="Email Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.push}
                    onChange={() => handleNotificationChange('push')}
                  />
                }
                label="Push Notifications"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={notifications.sms}
                    onChange={() => handleNotificationChange('sms')}
                  />
                }
                label="SMS Notifications"
              />
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveNotifications}
                sx={{ mt: 2 }}
                fullWidth
              >
                Save Notifications
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* System Settings */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              System Settings
            </Typography>
            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Theme Settings
                    </Typography>
                    <FormControlLabel
                      control={<Switch defaultChecked />}
                      label="Dark Mode"
                    />
                    <FormControlLabel
                      control={<Switch />}
                      label="Auto Theme"
                    />
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Data Management
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={<EditIcon />}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Export Data
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Import Data
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      fullWidth
                    >
                      Clear Cache
                    </Button>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Security
                    </Typography>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Change Password
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 1 }}
                    >
                      Two-Factor Auth
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                    >
                      Login History
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Bank Account Management */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Bank Account Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleCreateBankAccount}
              >
                Add Bank Account
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}


            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
              <FormControl size="small" sx={{ minWidth: 150 }}>
                <InputLabel>Account Type</InputLabel>
                <Select
                  name="accountType"
                  value={filters.accountType || 'all'}
                  label="Account Type"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="checking">Checking</MenuItem>
                  <MenuItem value="savings">Savings</MenuItem>
                  <MenuItem value="credit_card">Credit Card</MenuItem>
                  <MenuItem value="investment">Investment</MenuItem>
                  <MenuItem value="bank">Bank</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Status</InputLabel>
                <Select
                  name="isActive"
                  value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
                  label="Status"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Connection</InputLabel>
                <Select
                  name="isConnected"
                  value={filters.isConnected === undefined ? 'all' : filters.isConnected.toString()}
                  label="Connection"
                  onChange={handleFilterChange}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="true">Connected</MenuItem>
                  <MenuItem value="false">Disconnected</MenuItem>
                </Select>
              </FormControl>
              <Button
                variant="outlined"
                size="small"
                onClick={handleClearFilters}
                startIcon={<DeleteIcon />}
              >
                Clear Filters
              </Button>
            </Box>

            {/* Bank Accounts Grid */}
            {isLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress />
              </Box>
            ) : !Array.isArray(bankAccounts) || bankAccounts.length === 0 ? (
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <AddIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Bank Accounts Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add your first bank account to start managing your finances.
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleCreateBankAccount}
                >
                  Add Bank Account
                </Button>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {Array.isArray(bankAccounts) && bankAccounts.map((account) => (
                  <Grid item xs={12} sm={6} md={4} key={account.id}>
                    <BankAccountCard
                      account={account}
                      onEdit={handleEditBankAccount}
                      onDelete={handleDeleteBankAccount}
                      onConnect={handleConnectBankAccount}
                      onDisconnect={handleDisconnectBankAccount}
                      onSync={handleSyncBankAccount}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>
        </Grid>

        {/* API Keys */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              API Keys
            </Typography>
            <List>
              <ListItem>
                <ListItemText
                  primary="Payment Gateway API"
                  secondary="Active - Last used 2 hours ago"
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Utility Provider API"
                  secondary="Active - Last used 1 day ago"
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              <Divider />
              <ListItem>
                <ListItemText
                  primary="Notification Service API"
                  secondary="Inactive - Last used 1 week ago"
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="edit">
                    <EditIcon />
                  </IconButton>
                  <IconButton edge="end" aria-label="delete">
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            </List>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
            >
              Add New API Key
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Bank Account Form Dialog */}
      <BankAccountForm
        open={showBankAccountForm}
        onClose={() => {
          setShowBankAccountForm(false);
          setSelectedAccount(undefined);
        }}
        account={selectedAccount}
        onSuccess={handleBankAccountFormSuccess}
      />
    </Box>
  );
};

export default Settings;
