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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
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
  Chip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon,
  Refresh as RefreshIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';

interface IncomeSource {
  name: string;
  amount: number;
  frequency: string;
  category: string;
  currency: string;
  description: string;
  company: string;
}

interface ProfileFormData {
  jobTitle: string;
  company: string;
  employmentType: string;
  monthlySavingsGoal: number;
  monthlyInvestmentGoal: number;
  monthlyEmergencyFundGoal: number;
  taxRate: number;
  monthlyTaxDeductions: number;
  industry: string;
  location: string;
  notes: string;
  incomeSources: IncomeSource[];
}

const Settings: React.FC = () => {
  const { user, hasProfile, userProfile: contextUserProfile, updateUserProfile, logout } = useAuth();
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

  // Profile form state
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileFormData, setProfileFormData] = useState<ProfileFormData>({
    jobTitle: '',
    company: '',
    employmentType: '',
    monthlySavingsGoal: 0,
    monthlyInvestmentGoal: 0,
    monthlyEmergencyFundGoal: 0,
    taxRate: 0,
    monthlyTaxDeductions: 0,
    industry: '',
    location: '',
    notes: '',
    incomeSources: [
      {
        name: '',
        amount: 0,
        frequency: 'monthly',
        category: 'Primary',
        currency: 'USD',
        description: '',
        company: '',
      },
    ],
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  // Use userProfile from context instead of local state
  const userProfile = contextUserProfile;
  const [profileDataLoading, setProfileDataLoading] = useState(false);
  const [profileDataError, setProfileDataError] = useState<string | null>(null);

  // Edit profile state
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    jobTitle: '',
    company: '',
    employmentType: '',
    monthlySavingsGoal: 0,
    monthlyInvestmentGoal: 0,
    monthlyEmergencyFundGoal: 0,
    taxRate: 0,
    monthlyTaxDeductions: 0,
    industry: '',
    location: '',
    notes: '',
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSuccess, setEditSuccess] = useState<string | null>(null);

  // Add Income Source Dialog state
  const [showAddIncomeDialog, setShowAddIncomeDialog] = useState(false);
  const [incomeSourceFormData, setIncomeSourceFormData] = useState({
    name: '',
    amount: 0,
    frequency: 'monthly',
    category: 'Primary',
    currency: 'USD',
    description: '',
    company: '',
  });
  const [incomeSourceLoading, setIncomeSourceLoading] = useState(false);
  const [incomeSourceError, setIncomeSourceError] = useState<string | null>(null);
  const [incomeSourceSuccess, setIncomeSourceSuccess] = useState<string | null>(null);

  // Income Sources with Summary state
  const [incomeData, setIncomeData] = useState<any>({
    incomeSources: [],
    totalActiveSources: 0,
    totalPrimarySources: 0,
    totalSources: 0,
    totalMonthlyIncome: 0
  });
  const [incomeDataLoading, setIncomeDataLoading] = useState(false);
  const [incomeDataError, setIncomeDataError] = useState<string | null>(null);

  // Bulk Income Sources state
  const [showBulkIncomeDialog, setShowBulkIncomeDialog] = useState(false);
  const [bulkIncomeSources, setBulkIncomeSources] = useState([
    {
      name: '',
      amount: 0,
      frequency: 'MONTHLY',
      category: 'PRIMARY',
      currency: 'USD',
      description: '',
      company: '',
    }
  ]);
  const [bulkIncomeLoading, setBulkIncomeLoading] = useState(false);
  const [bulkIncomeError, setBulkIncomeError] = useState<string | null>(null);
  const [bulkIncomeSuccess, setBulkIncomeSuccess] = useState<string | null>(null);


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

  // Profile form constants
  const frequencyOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'others', label: 'Others' },
  ];

  const categoryOptions = [
    { value: 'Primary', label: 'Primary' },
    { value: 'Passive', label: 'Passive' },
    { value: 'Business', label: 'Business' },
    { value: 'Side hustle', label: 'Side hustle' },
    { value: 'Investment', label: 'Investment' },
    { value: 'Dividend', label: 'Dividend' },
    { value: 'Interest', label: 'Interest' },
    { value: 'other', label: 'Other' },
  ];

  const employmentTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'self-employed', label: 'Self-employed' },
  ];

  // Profile form handlers
  const handleProfileFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (profileError) setProfileError(null);
  };

  const handleProfileFormSelectChange = (e: any) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (profileError) setProfileError(null);
  };

  const handleIncomeSourceChange = (index: number, field: keyof IncomeSource, value: any) => {
    setProfileFormData(prev => ({
      ...prev,
      incomeSources: prev.incomeSources.map((source, i) =>
        i === index ? { ...source, [field]: value } : source
      ),
    }));
  };

  const addIncomeSource = () => {
    setProfileFormData(prev => ({
      ...prev,
      incomeSources: [
        ...prev.incomeSources,
        {
          name: '',
          amount: 0,
          frequency: 'monthly',
          category: 'Primary',
          currency: 'USD',
          description: '',
          company: '',
        },
      ],
    }));
  };

  const removeIncomeSource = (index: number) => {
    if (profileFormData.incomeSources.length > 1) {
      setProfileFormData(prev => ({
        ...prev,
        incomeSources: prev.incomeSources.filter((_, i) => i !== index),
      }));
    }
  };

  const validateProfileForm = (): string | null => {
    if (!profileFormData.jobTitle.trim()) {
      return 'Job title is required';
    }
    if (!profileFormData.company.trim()) {
      return 'Company is required';
    }
    if (!profileFormData.employmentType) {
      return 'Employment type is required';
    }
    if (profileFormData.incomeSources.some(source => !source.name.trim())) {
      return 'All income sources must have a name';
    }
    if (profileFormData.incomeSources.some(source => source.amount <= 0)) {
      return 'All income sources must have a positive amount';
    }
    return null;
  };

  const handleCreateProfile = async () => {
    const validationError = validateProfileForm();
    if (validationError) {
      setProfileError(validationError);
      return;
    }

    setProfileLoading(true);
    setProfileError(null);

    try {
      const newProfile = await apiService.createUserProfile(profileFormData);
      setProfileSuccess('Profile created successfully!');
      setShowProfileForm(false);
      // Update context with new profile
      updateUserProfile(newProfile);
    } catch (err: any) {
      setProfileError(err.message || 'Failed to create profile. Please try again.');
    } finally {
      setProfileLoading(false);
    }
  };

  // No need for loadUserProfile since we're using context

  // Edit profile handlers
  const handleEditProfile = () => {
    if (userProfile) {
      setEditFormData({
        jobTitle: userProfile.jobTitle || '',
        company: userProfile.company || '',
        employmentType: userProfile.employmentType || '',
        monthlySavingsGoal: userProfile.monthlySavingsGoal || 0,
        monthlyInvestmentGoal: userProfile.monthlyInvestmentGoal || 0,
        monthlyEmergencyFundGoal: userProfile.monthlyEmergencyFundGoal || 0,
        taxRate: userProfile.taxRate || 0,
        monthlyTaxDeductions: userProfile.monthlyTaxDeductions || 0,
        industry: userProfile.industry || '',
        location: userProfile.location || '',
        notes: userProfile.notes || '',
      });
      setShowEditDialog(true);
      setEditError(null);
      setEditSuccess(null);
    }
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (editError) setEditError(null);
  };

  const handleEditSelectChange = (e: any) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (editError) setEditError(null);
  };

  const validateEditForm = (): string | null => {
    if (!editFormData.jobTitle.trim()) {
      return 'Job title is required';
    }
    if (!editFormData.company.trim()) {
      return 'Company is required';
    }
    if (!editFormData.employmentType) {
      return 'Employment type is required';
    }
    return null;
  };

  const handleUpdateProfile = async () => {
    const validationError = validateEditForm();
    if (validationError) {
      setEditError(validationError);
      return;
    }

    setEditLoading(true);
    setEditError(null);

    try {
      const updatedProfile = await apiService.updateUserProfile(editFormData);
      updateUserProfile(updatedProfile);
      setEditSuccess('Profile updated successfully!');
      setShowEditDialog(false);
    } catch (err: any) {
      setEditError(err.message || 'Failed to update profile. Please try again.');
    } finally {
      setEditLoading(false);
    }
  };

  // Income Source Dialog handlers
  const handleIncomeSourceInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setIncomeSourceFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (incomeSourceError) setIncomeSourceError(null);
  };

  const handleIncomeSourceSelectChange = (e: any) => {
    const { name, value } = e.target;
    setIncomeSourceFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (incomeSourceError) setIncomeSourceError(null);
  };

  const validateIncomeSourceForm = (): string | null => {
    if (!incomeSourceFormData.name.trim()) {
      return 'Income source name is required';
    }
    if (incomeSourceFormData.amount <= 0) {
      return 'Amount must be greater than 0';
    }
    if (!incomeSourceFormData.frequency) {
      return 'Frequency is required';
    }
    if (!incomeSourceFormData.category) {
      return 'Category is required';
    }
    return null;
  };

  const handleCreateIncomeSource = async () => {
    const validationError = validateIncomeSourceForm();
    if (validationError) {
      setIncomeSourceError(validationError);
      return;
    }

    setIncomeSourceLoading(true);
    setIncomeSourceError(null);

    try {
      const response = await apiService.createIncomeSource(incomeSourceFormData);
      setIncomeSourceSuccess('Income source created successfully!');
      
      // Reset form
      setIncomeSourceFormData({
        name: '',
        amount: 0,
        frequency: 'monthly',
        category: 'Primary',
        currency: 'USD',
        description: '',
        company: '',
      });
      
      // Close dialog after a short delay
      setTimeout(() => {
        setShowAddIncomeDialog(false);
        setIncomeSourceSuccess(null);
        // Reload income data to show updated data
        loadIncomeData();
      }, 1500);
    } catch (err: any) {
      setIncomeSourceError(err.message || 'Failed to create income source. Please try again.');
    } finally {
      setIncomeSourceLoading(false);
    }
  };

  const resetIncomeSourceForm = () => {
    setIncomeSourceFormData({
      name: '',
      amount: 0,
      frequency: 'monthly',
      category: 'Primary',
      currency: 'USD',
      description: '',
      company: '',
    });
    setIncomeSourceError(null);
    setIncomeSourceSuccess(null);
  };

  // Bulk Income Source handlers
  const handleBulkIncomeSourceChange = (index: number, field: string, value: any) => {
    setBulkIncomeSources(prev => prev.map((source, i) => 
      i === index ? { ...source, [field]: value } : source
    ));
    if (bulkIncomeError) setBulkIncomeError(null);
  };

  const addBulkIncomeSource = () => {
    setBulkIncomeSources(prev => [...prev, {
      name: '',
      amount: 0,
      frequency: 'MONTHLY',
      category: 'PRIMARY',
      currency: 'USD',
      description: '',
      company: '',
    }]);
  };

  const removeBulkIncomeSource = (index: number) => {
    if (bulkIncomeSources.length > 1) {
      setBulkIncomeSources(prev => prev.filter((_, i) => i !== index));
    }
  };

  const validateBulkIncomeSources = (): string | null => {
    for (let i = 0; i < bulkIncomeSources.length; i++) {
      const source = bulkIncomeSources[i];
      if (!source.name.trim()) {
        return `Income source ${i + 1}: Name is required`;
      }
      if (source.amount <= 0) {
        return `Income source ${i + 1}: Amount must be greater than 0`;
      }
      if (!source.frequency) {
        return `Income source ${i + 1}: Frequency is required`;
      }
      if (!source.category) {
        return `Income source ${i + 1}: Category is required`;
      }
    }
    return null;
  };

  const handleCreateBulkIncomeSources = async () => {
    const validationError = validateBulkIncomeSources();
    if (validationError) {
      setBulkIncomeError(validationError);
      return;
    }

    setBulkIncomeLoading(true);
    setBulkIncomeError(null);

    try {
      const response = await apiService.createBulkIncomeSources(bulkIncomeSources);
      setBulkIncomeSuccess(`Successfully created ${response.data.length} income sources!`);
      
      // Reset form
      setBulkIncomeSources([{
        name: '',
        amount: 0,
        frequency: 'MONTHLY',
        category: 'PRIMARY',
        currency: 'USD',
        description: '',
        company: '',
      }]);
      
      setTimeout(() => {
        setShowBulkIncomeDialog(false);
        setBulkIncomeSuccess(null);
        loadIncomeData(); // Reload income data
      }, 2000);
    } catch (err: any) {
      setBulkIncomeError(err.message || 'Failed to create bulk income sources. Please try again.');
    } finally {
      setBulkIncomeLoading(false);
    }
  };

  const resetBulkIncomeForm = () => {
    setBulkIncomeSources([{
      name: '',
      amount: 0,
      frequency: 'MONTHLY',
      category: 'PRIMARY',
      currency: 'USD',
      description: '',
      company: '',
    }]);
    setBulkIncomeError(null);
    setBulkIncomeSuccess(null);
  };

  // Load income sources with summary
  const loadIncomeData = useCallback(async () => {
    setIncomeDataLoading(true);
    setIncomeDataError(null);

    try {
      const response = await apiService.getIncomeSourcesWithSummary(true);
      setIncomeData(response.data || {
        incomeSources: [],
        totalActiveSources: 0,
        totalPrimarySources: 0,
        totalSources: 0,
        totalMonthlyIncome: 0
      });
    } catch (err: any) {
      setIncomeDataError(err.message || 'Failed to load income data');
    } finally {
      setIncomeDataLoading(false);
    }
  }, []);

  // Load income data when component mounts
  useEffect(() => {
    if (user?.id) {
      loadIncomeData();
    }
  }, [user?.id, loadIncomeData]);

  // Check if user needs to complete profile
  useEffect(() => {
    console.log('=== Settings: Profile check useEffect ===');
    console.log('Settings: user:', !!user, 'userProfile:', !!userProfile, 'hasProfile:', hasProfile);
    console.log('Settings: showProfileForm current state:', showProfileForm);
    console.log('Settings: userProfile type:', typeof userProfile);
    console.log('Settings: userProfile value:', userProfile);
    if (userProfile && userProfile.id) {
      console.log('Settings: userProfile details:', {
        id: userProfile.id,
        isActive: userProfile.isActive,
        incomeSources: userProfile.incomeSources?.length || 0,
        hasIncomeSources: userProfile.incomeSources && userProfile.incomeSources.length > 0,
        incomeSourcesArray: userProfile.incomeSources
      });
      
      // FORCE HIDE modal if userProfile exists
      console.log('Settings: ✅ FORCE HIDING profile form - userProfile exists');
      setShowProfileForm(false);
    } else if (user && !userProfile) {
      // User is logged in but no profile data - show form
      console.log('Settings: ❌ Showing profile form - no userProfile');
      console.log('Settings: userProfile exists:', !!userProfile);
      setShowProfileForm(true);
    } else {
      console.log('Settings: ⚠️ No action taken - user:', !!user, 'userProfile:', !!userProfile);
    }
    console.log('=== Settings: Profile check useEffect completed ===');
  }, [user, userProfile, hasProfile]);


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

      {/* Profile Completion Status */}
      {userProfile && userProfile.incomeSources && userProfile.incomeSources.length > 0 && (
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                ✅ Profile Complete
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your financial profile has been successfully set up with {userProfile.incomeSources.length} income source{userProfile.incomeSources.length > 1 ? 's' : ''}.
              </Typography>
            </Box>
          </Paper>
        </Grid>
      )}


        {/* Income Sources Table */}
        <Grid item xs={12} sx={{ mt: 3 }}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon />
                Income Sources
              </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={loadIncomeData}
                disabled={incomeDataLoading}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setShowBulkIncomeDialog(true)}
                color="secondary"
              >
                Bulk Add
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowAddIncomeDialog(true)}
              >
                Add Income Source
              </Button>
            </Box>
            </Box>
            
            {incomeDataError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {incomeDataError}
              </Alert>
            )}

            {incomeDataLoading ? (
              <Box display="flex" justifyContent="center" p={3}>
                <CircularProgress />
              </Box>
            ) : incomeData.incomeSources.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <MoneyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Income Sources Found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Add your first income source to get started with financial planning
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setShowAddIncomeDialog(true)}
                >
                  Add Income Source
                </Button>
              </Box>
            ) : (
              <>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Frequency</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>Company</TableCell>
                        <TableCell>Updated At</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {incomeData.incomeSources.map((source: any) => (
                        <TableRow key={source.id}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {source.name}
                              </Typography>
                              {source.description && (
                                <Typography variant="caption" color="text.secondary">
                                  {source.description}
                                </Typography>
                              )}
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {source.currency} {source.amount.toLocaleString()}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={source.frequency} 
                              size="small" 
                              variant="outlined"
                              color="primary"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={source.category} 
                              size="small" 
                              color={
                                source.category?.toLowerCase() === 'primary' ? 'success' :
                                source.category?.toLowerCase() === 'passive' ? 'info' :
                                source.category?.toLowerCase() === 'business' ? 'warning' :
                                'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2">
                              {source.company || '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" color="text.secondary">
                              {source.updatedAt ? new Date(source.updatedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : '-'}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip 
                              label={source.isActive ? 'Active' : 'Inactive'} 
                              size="small" 
                              color={source.isActive ? 'success' : 'default'}
                            />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton size="small" color="primary" title="View Details">
                                <ViewIcon />
                              </IconButton>
                              <IconButton size="small" color="primary" title="Edit">
                                <EditIcon />
                              </IconButton>
                              <IconButton size="small" color="error" title="Delete">
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mt: 3 }}>
                  <Grid item xs={12} sm={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="primary">
                          USD {incomeData.totalMonthlyIncome.toLocaleString()}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Monthly Income
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="success.main">
                          {incomeData.totalActiveSources}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Active Sources
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="warning.main">
                          {incomeData.totalPrimarySources}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Primary Sources
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Card variant="outlined">
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h6" color="info.main">
                          {incomeData.totalSources}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Total Sources
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </>
            )}
          </Paper>
        </Grid>

      {/* Profile Setup Dialog - Only show if user doesn't have active profile data */}
      <Dialog 
        open={(() => {
          const shouldShow = showProfileForm && !userProfile;
          console.log('Settings: Dialog open condition:', {
            showProfileForm,
            userProfile: !!userProfile,
            shouldShow
          });
          return shouldShow;
        })()} 
        onClose={() => {}} 
        maxWidth="md" 
        fullWidth
        disableEscapeKeyDown
      >
        <DialogTitle>
          <Typography variant="h5" component="div">
            Complete Your Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please complete your financial profile to access all features
          </Typography>
        </DialogTitle>
        <DialogContent>
          {profileSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {profileSuccess}
            </Alert>
          )}

          {profileError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {profileError}
            </Alert>
          )}

          {/* Employment Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon />
                Employment Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="jobTitle"
                    label="Job Title"
                    name="jobTitle"
                    value={profileFormData.jobTitle}
                    onChange={handleProfileFormInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="company"
                    label="Company"
                    name="company"
                    value={profileFormData.company}
                    onChange={handleProfileFormInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Employment Type</InputLabel>
                    <Select
                      name="employmentType"
                      value={profileFormData.employmentType}
                      label="Employment Type"
                      onChange={handleProfileFormSelectChange}
                    >
                      {employmentTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="industry"
                    label="Industry"
                    name="industry"
                    value={profileFormData.industry}
                    onChange={handleProfileFormInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="location"
                    label="Location"
                    name="location"
                    value={profileFormData.location}
                    onChange={handleProfileFormInputChange}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Financial Goals */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon />
                Financial Goals (Monthly)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    id="monthlySavingsGoal"
                    label="Savings Goal"
                    name="monthlySavingsGoal"
                    type="number"
                    value={profileFormData.monthlySavingsGoal}
                    onChange={handleProfileFormInputChange}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    id="monthlyInvestmentGoal"
                    label="Investment Goal"
                    name="monthlyInvestmentGoal"
                    type="number"
                    value={profileFormData.monthlyInvestmentGoal}
                    onChange={handleProfileFormInputChange}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    id="monthlyEmergencyFundGoal"
                    label="Emergency Fund Goal"
                    name="monthlyEmergencyFundGoal"
                    type="number"
                    value={profileFormData.monthlyEmergencyFundGoal}
                    onChange={handleProfileFormInputChange}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="taxRate"
                    label="Tax Rate (%)"
                    name="taxRate"
                    type="number"
                    value={profileFormData.taxRate}
                    onChange={handleProfileFormInputChange}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="monthlyTaxDeductions"
                    label="Monthly Tax Deductions"
                    name="monthlyTaxDeductions"
                    type="number"
                    value={profileFormData.monthlyTaxDeductions}
                    onChange={handleProfileFormInputChange}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Income Sources */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon />
                  Income Sources
                </Typography>
                <Button
                  startIcon={<AddIcon />}
                  onClick={addIncomeSource}
                  variant="outlined"
                  size="small"
                >
                  Add Income Source
                </Button>
              </Box>
              
              {profileFormData.incomeSources.map((source, index) => (
                <Box key={index}>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Income Name"
                        placeholder="Company salary"
                        value={source.name}
                        onChange={(e) => handleIncomeSourceChange(index, 'name', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        label="Amount"
                        type="number"
                        value={source.amount}
                        onChange={(e) => handleIncomeSourceChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        inputProps={{ min: 0, step: 0.01 }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Frequency</InputLabel>
                        <Select
                          value={source.frequency}
                          label="Frequency"
                          onChange={(e) => handleIncomeSourceChange(index, 'frequency', e.target.value)}
                        >
                          {frequencyOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl fullWidth required>
                        <InputLabel>Category</InputLabel>
                        <Select
                          value={source.category}
                          label="Category"
                          onChange={(e) => handleIncomeSourceChange(index, 'category', e.target.value)}
                        >
                          {categoryOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                              {option.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Company"
                        value={source.company}
                        onChange={(e) => handleIncomeSourceChange(index, 'company', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Currency"
                        value={source.currency}
                        onChange={(e) => handleIncomeSourceChange(index, 'currency', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Description"
                        multiline
                        rows={2}
                        value={source.description}
                        onChange={(e) => handleIncomeSourceChange(index, 'description', e.target.value)}
                      />
                    </Grid>
                    {profileFormData.incomeSources.length > 1 && (
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                          <IconButton
                            color="error"
                            onClick={() => removeIncomeSource(index)}
                            size="small"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                  {index < profileFormData.incomeSources.length - 1 && <Divider sx={{ my: 2 }} />}
                </Box>
              ))}
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Additional Notes
              </Typography>
              <TextField
                fullWidth
                id="notes"
                label="Notes"
                name="notes"
                multiline
                rows={4}
                value={profileFormData.notes}
                onChange={handleProfileFormInputChange}
                placeholder="Any additional information about your financial situation..."
              />
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={logout}
            color="error"
            disabled={profileLoading}
            startIcon={<LogoutIcon />}
          >
            Logout
          </Button>
          <Button
            onClick={handleCreateProfile}
            variant="contained"
            disabled={profileLoading}
            startIcon={profileLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {profileLoading ? 'Creating Profile...' : 'Complete Profile Setup'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog 
        open={showEditDialog} 
        onClose={() => setShowEditDialog(false)} 
        maxWidth="md" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div">
            Edit Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update your employment and financial information
          </Typography>
        </DialogTitle>
        <DialogContent>
          {editSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {editSuccess}
            </Alert>
          )}

          {editError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editError}
            </Alert>
          )}

          {/* Employment Information */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WorkIcon />
                Employment Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="edit-jobTitle"
                    label="Job Title"
                    name="jobTitle"
                    value={editFormData.jobTitle}
                    onChange={handleEditInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="edit-company"
                    label="Company"
                    name="company"
                    value={editFormData.company}
                    onChange={handleEditInputChange}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Employment Type</InputLabel>
                    <Select
                      name="employmentType"
                      value={editFormData.employmentType}
                      label="Employment Type"
                      onChange={handleEditSelectChange}
                    >
                      {employmentTypes.map((type) => (
                        <MenuItem key={type.value} value={type.value}>
                          {type.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="edit-industry"
                    label="Industry"
                    name="industry"
                    value={editFormData.industry}
                    onChange={handleEditInputChange}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    id="edit-location"
                    label="Location"
                    name="location"
                    value={editFormData.location}
                    onChange={handleEditInputChange}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Financial Goals */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon />
                Financial Goals (Monthly)
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    id="edit-monthlySavingsGoal"
                    label="Savings Goal"
                    name="monthlySavingsGoal"
                    type="number"
                    value={editFormData.monthlySavingsGoal}
                    onChange={handleEditInputChange}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    id="edit-monthlyInvestmentGoal"
                    label="Investment Goal"
                    name="monthlyInvestmentGoal"
                    type="number"
                    value={editFormData.monthlyInvestmentGoal}
                    onChange={handleEditInputChange}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    id="edit-monthlyEmergencyFundGoal"
                    label="Emergency Fund Goal"
                    name="monthlyEmergencyFundGoal"
                    type="number"
                    value={editFormData.monthlyEmergencyFundGoal}
                    onChange={handleEditInputChange}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="edit-taxRate"
                    label="Tax Rate (%)"
                    name="taxRate"
                    type="number"
                    value={editFormData.taxRate}
                    onChange={handleEditInputChange}
                    inputProps={{ min: 0, max: 100, step: 0.01 }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    id="edit-monthlyTaxDeductions"
                    label="Monthly Tax Deductions"
                    name="monthlyTaxDeductions"
                    type="number"
                    value={editFormData.monthlyTaxDeductions}
                    onChange={handleEditInputChange}
                    inputProps={{ min: 0, step: 0.01 }}
                  />
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Additional Notes
              </Typography>
              <TextField
                fullWidth
                id="edit-notes"
                label="Notes"
                name="notes"
                multiline
                rows={4}
                value={editFormData.notes}
                onChange={handleEditInputChange}
                placeholder="Any additional information about your financial situation..."
              />
            </CardContent>
          </Card>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowEditDialog(false)}
            disabled={editLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateProfile}
            variant="contained"
            disabled={editLoading}
            startIcon={editLoading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            {editLoading ? 'Updating Profile...' : 'Update Profile'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Income Source Dialog */}
      <Dialog 
        open={showAddIncomeDialog} 
        onClose={() => {
          setShowAddIncomeDialog(false);
          resetIncomeSourceForm();
        }} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div">
            Add Income Source
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add a new income source to your financial profile
          </Typography>
        </DialogTitle>
        <DialogContent>
          {incomeSourceSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {incomeSourceSuccess}
            </Alert>
          )}

          {incomeSourceError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {incomeSourceError}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="income-name"
                label="Income Source Name"
                name="name"
                value={incomeSourceFormData.name}
                onChange={handleIncomeSourceInputChange}
                placeholder="e.g., Company Salary, Freelance Work"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="income-amount"
                label="Amount"
                name="amount"
                type="number"
                value={incomeSourceFormData.amount}
                onChange={handleIncomeSourceInputChange}
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="0.00"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Frequency</InputLabel>
                <Select
                  name="frequency"
                  value={incomeSourceFormData.frequency}
                  label="Frequency"
                  onChange={handleIncomeSourceSelectChange}
                >
                  {frequencyOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={incomeSourceFormData.category}
                  label="Category"
                  onChange={handleIncomeSourceSelectChange}
                >
                  {categoryOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="income-company"
                label="Company"
                name="company"
                value={incomeSourceFormData.company}
                onChange={handleIncomeSourceInputChange}
                placeholder="Company or organization name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="income-currency"
                label="Currency"
                name="currency"
                value={incomeSourceFormData.currency}
                onChange={handleIncomeSourceInputChange}
                placeholder="USD"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="income-description"
                label="Description"
                name="description"
                multiline
                rows={3}
                value={incomeSourceFormData.description}
                onChange={handleIncomeSourceInputChange}
                placeholder="Additional details about this income source..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowAddIncomeDialog(false);
              resetIncomeSourceForm();
            }}
            disabled={incomeSourceLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateIncomeSource}
            variant="contained"
            disabled={incomeSourceLoading}
            startIcon={incomeSourceLoading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {incomeSourceLoading ? 'Creating...' : 'Add Income Source'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bulk Add Income Sources Dialog */}
      <Dialog 
        open={showBulkIncomeDialog} 
        onClose={() => {
          setShowBulkIncomeDialog(false);
          resetBulkIncomeForm();
        }} 
        maxWidth="lg" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div">
            Bulk Add Income Sources
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add multiple income sources at once for faster setup
          </Typography>
        </DialogTitle>
        <DialogContent>
          {bulkIncomeSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {bulkIncomeSuccess}
            </Alert>
          )}

          {bulkIncomeError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {bulkIncomeError}
            </Alert>
          )}

          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Income Sources ({bulkIncomeSources.length})
            </Typography>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={addBulkIncomeSource}
              size="small"
            >
              Add Another
            </Button>
          </Box>

          {bulkIncomeSources.map((source, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2, border: '1px solid', borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  Income Source {index + 1}
                </Typography>
                {bulkIncomeSources.length > 1 && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => removeBulkIncomeSource(index)}
                  >
                    Remove
                  </Button>
                )}
              </Box>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Income Source Name"
                    value={source.name}
                    onChange={(e) => handleBulkIncomeSourceChange(index, 'name', e.target.value)}
                    placeholder="e.g., Company Salary, Freelance Work"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    label="Amount"
                    type="number"
                    value={source.amount}
                    onChange={(e) => handleBulkIncomeSourceChange(index, 'amount', parseFloat(e.target.value) || 0)}
                    inputProps={{ min: 0, step: 0.01 }}
                    placeholder="0.00"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Frequency</InputLabel>
                    <Select
                      value={source.frequency}
                      label="Frequency"
                      onChange={(e) => handleBulkIncomeSourceChange(index, 'frequency', e.target.value)}
                    >
                      <MenuItem value="MONTHLY">Monthly</MenuItem>
                      <MenuItem value="WEEKLY">Weekly</MenuItem>
                      <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                      <MenuItem value="YEARLY">Yearly</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category</InputLabel>
                    <Select
                      value={source.category}
                      label="Category"
                      onChange={(e) => handleBulkIncomeSourceChange(index, 'category', e.target.value)}
                    >
                      <MenuItem value="PRIMARY">Primary</MenuItem>
                      <MenuItem value="SIDE_HUSTLE">Side Hustle</MenuItem>
                      <MenuItem value="PASSIVE">Passive</MenuItem>
                      <MenuItem value="INVESTMENT">Investment</MenuItem>
                      <MenuItem value="BUSINESS">Business</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Company"
                    value={source.company}
                    onChange={(e) => handleBulkIncomeSourceChange(index, 'company', e.target.value)}
                    placeholder="Company or organization name"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Currency"
                    value={source.currency}
                    onChange={(e) => handleBulkIncomeSourceChange(index, 'currency', e.target.value)}
                    placeholder="USD"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Description"
                    multiline
                    rows={2}
                    value={source.description}
                    onChange={(e) => handleBulkIncomeSourceChange(index, 'description', e.target.value)}
                    placeholder="Additional details about this income source..."
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowBulkIncomeDialog(false);
              resetBulkIncomeForm();
            }}
            disabled={bulkIncomeLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateBulkIncomeSources}
            variant="contained"
            disabled={bulkIncomeLoading}
            startIcon={bulkIncomeLoading ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {bulkIncomeLoading ? 'Creating...' : `Create ${bulkIncomeSources.length} Income Sources`}
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
};

export default Settings;
