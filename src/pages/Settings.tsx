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
  Checkbox,
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
  Tooltip,
  SelectChangeEvent,
  InputAdornment,
  Radio,
  RadioGroup,
  FormLabel,
} from '@mui/material';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Work as WorkIcon,
  AttachMoney as MoneyIcon,
  Visibility as ViewIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  Logout as LogoutIcon,
  Lock as LockIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency, CURRENCY_OPTIONS } from '../contexts/CurrencyContext';
import { apiService } from '../services/api';
import { UserSubscription } from '../types/subscription';
import SubscriptionModal from '../components/Subscription/SubscriptionModal';

interface IncomeSource {
  name: string;
  amount: number;
  currency: string;
  frequency: string;
  category: string;
  company: string;
  description: string;
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
  preferredCurrency: string;
  incomeSources: IncomeSource[];
}

const Settings: React.FC = () => {
  const { user, hasProfile, userProfile: contextUserProfile, updateUserProfile, logout } = useAuth();
  const { currency, setCurrency, formatCurrency } = useCurrency();
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    sms: true,
  });

  const [profile, setProfile] = useState({
    name: '',
    phone: '',
    preferredCurrency: 'USD',
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
    preferredCurrency: currency,
    incomeSources: [
      {
        name: '',
        amount: 0,
        frequency: 'monthly',
        category: 'Primary',
        currency: currency,
        description: '',
        company: '',
      },
    ],
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  
  // User update state
  const [userUpdateLoading, setUserUpdateLoading] = useState(false);
  const [userUpdateError, setUserUpdateError] = useState<string | null>(null);
  const [userUpdateSuccess, setUserUpdateSuccess] = useState<string | null>(null);
  
  // Currency update state
  const [currencyUpdateLoading, setCurrencyUpdateLoading] = useState(false);
  const [currencyUpdateError, setCurrencyUpdateError] = useState<string | null>(null);
  
  // Clear data state
  const [showClearDataDialog, setShowClearDataDialog] = useState(false);
  const [clearDataLoading, setClearDataLoading] = useState(false);
  const [clearDataSuccess, setClearDataSuccess] = useState<string | null>(null);
  const [clearDataError, setClearDataError] = useState<string | null>(null);
  const [clearDataPassword, setClearDataPassword] = useState('');
  const [clearDataAgreement, setClearDataAgreement] = useState(false);
  const [clearDataShowPassword, setClearDataShowPassword] = useState(false);
  const [clearDataResult, setClearDataResult] = useState<{
    message: string;
    deletedRecords: { [key: string]: number | undefined };
    totalRecordsDeleted: number;
  } | null>(null);
  const [clearDataCategory, setClearDataCategory] = useState<string>('All');
  
  // Feature not available modal state
  const [showFeatureNotAvailableDialog, setShowFeatureNotAvailableDialog] = useState(false);
  
  // Change password state
  const [showChangePasswordDialog, setShowChangePasswordDialog] = useState(false);
  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

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
    preferredCurrency: currency,
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

  // Delete Income Source state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [incomeSourceToDelete, setIncomeSourceToDelete] = useState<any>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState<string | null>(null);

  // Edit Income Source state
  const [showEditIncomeDialog, setShowEditIncomeDialog] = useState(false);
  const [editIncomeFormData, setEditIncomeFormData] = useState({
    name: '',
    amount: 0,
    frequency: 'MONTHLY',
    category: 'PRIMARY',
    currency: 'USD',
    description: '',
    company: '',
    isActive: true,
  });
  const [editIncomeLoading, setEditIncomeLoading] = useState(false);
  const [editIncomeError, setEditIncomeError] = useState<string | null>(null);
  const [editIncomeSuccess, setEditIncomeSuccess] = useState<string | null>(null);
  const [incomeSourceToEdit, setIncomeSourceToEdit] = useState<any>(null);

  // View Income Source state
  const [showViewIncomeDialog, setShowViewIncomeDialog] = useState(false);
  const [viewIncomeData, setViewIncomeData] = useState<any>(null);
  const [viewIncomeLoading, setViewIncomeLoading] = useState(false);
  const [viewIncomeError, setViewIncomeError] = useState<string | null>(null);

  // Subscription state
  const [userSubscription, setUserSubscription] = useState<UserSubscription | null>(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);


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

  const handleSaveUserInfo = async () => {
    if (!user?.id) {
      setUserUpdateError('User ID is missing. Please log in again.');
      return;
    }

    try {
      setUserUpdateLoading(true);
      setUserUpdateError(null);
      setUserUpdateSuccess(null);
      
      // Prepare the request body according to the API specification
      const requestBody = {
        name: profile.name.trim(),
        phone: profile.phone.trim(),
      };

      console.log('Saving user info with request body:', requestBody);

      // Call the API service to update the user
      const response = await apiService.updateUser(user.id, requestBody);
      
      if (response && response.success) {
        setUserUpdateSuccess('User information updated successfully!');
        console.log('User info saved successfully:', response);
        
        // Optionally refresh user data from context
        // The user data will be updated on next page refresh or login
      } else {
        setUserUpdateError(response?.message || 'Failed to update user information');
      }
    } catch (error: any) {
      console.error('Error saving user info:', error);
      
      // Handle specific error status codes
      let errorMessage = 'Failed to update user information';
      const status = error.status;
      
      if (status === 400) {
        // Validation error - show the error message and errors array from API
        if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
          errorMessage = `${error.message || 'Validation failed'}: ${error.errors.join(', ')}`;
        } else {
          errorMessage = error.message || 'Validation failed. Please check your input.';
        }
      } else if (status === 404) {
        errorMessage = error.message || 'User not found. Please log in again.';
      } else if (status === 403) {
        errorMessage = error.message || 'You do not have permission to update this user profile.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setUserUpdateError(errorMessage);
    } finally {
      setUserUpdateLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      setProfileSuccess(null);

      // Prepare the request body according to the API specification
      const requestBody = {
        jobTitle: profileFormData.jobTitle,
        company: profileFormData.company,
        employmentType: profileFormData.employmentType,
        monthlySavingsGoal: profileFormData.monthlySavingsGoal,
        monthlyInvestmentGoal: profileFormData.monthlyInvestmentGoal,
        monthlyEmergencyFundGoal: profileFormData.monthlyEmergencyFundGoal,
        taxRate: profileFormData.taxRate,
        monthlyTaxDeductions: profileFormData.monthlyTaxDeductions,
        industry: profileFormData.industry,
        location: profileFormData.location,
        notes: profileFormData.notes,
        preferredCurrency: currency,
      };

      console.log('Current currency from context:', currency);
      console.log('Profile preferredCurrency:', profile.preferredCurrency);
      console.log('Saving profile with request body:', requestBody);

      // Call the API service to update the profile
      const response = await apiService.updateUserProfile(requestBody);
      
      if (response) {
        setProfileSuccess('Profile updated successfully!');
        console.log('Profile saved successfully:', response);
        
        // Update the currency context with the new preferred currency
        if (requestBody.preferredCurrency) {
          setCurrency(requestBody.preferredCurrency);
        }
      } else {
        setProfileError('Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error saving profile:', error);
      setProfileError(error.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handleSaveNotifications = () => {
    console.log('Saving notifications:', notifications);
  };

  // Change password handlers
  const handleOpenChangePasswordDialog = () => {
    setShowChangePasswordDialog(true);
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError(null);
    setPasswordSuccess(null);
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  const handleCloseChangePasswordDialog = () => {
    setShowChangePasswordDialog(false);
    setPasswordFormData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    });
    setPasswordError(null);
    setPasswordSuccess(null);
    setShowPasswords({
      current: false,
      new: false,
      confirm: false,
    });
  };

  const handlePasswordInputChange = (field: keyof typeof passwordFormData, value: string) => {
    setPasswordFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    if (passwordError) setPasswordError(null);
    if (passwordSuccess) setPasswordSuccess(null);
  };

  const validatePasswordForm = (): string | null => {
    if (!passwordFormData.currentPassword.trim()) {
      return 'Current password is required';
    }
    if (!passwordFormData.newPassword.trim()) {
      return 'New password is required';
    }
    if (passwordFormData.newPassword.length < 6) {
      return 'New password must be at least 6 characters long';
    }
    if (passwordFormData.newPassword === passwordFormData.currentPassword) {
      return 'New password must be different from current password';
    }
    if (passwordFormData.newPassword !== passwordFormData.confirmPassword) {
      return 'New password and confirm password do not match';
    }
    return null;
  };

  const handleChangePassword = async () => {
    const validationError = validatePasswordForm();
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    try {
      setPasswordLoading(true);
      setPasswordError(null);
      setPasswordSuccess(null);

      const response = await apiService.changePassword(passwordFormData);

      if (response && response.success) {
        setPasswordSuccess(response.message || 'Password changed successfully!');
        console.log('Password changed successfully:', response);
        
        // Clear form and close dialog after a delay
        setTimeout(() => {
          handleCloseChangePasswordDialog();
        }, 1500);
      } else {
        // Handle error response (non-success)
        const errorMessage = response?.message || 'Failed to change password';
        const errorDetails = response?.errors && Array.isArray(response.errors) && response.errors.length > 0
          ? `: ${response.errors.join(', ')}`
          : '';
        setPasswordError(`${errorMessage}${errorDetails}`);
      }
    } catch (error: any) {
      console.error('Error changing password:', error);
      
      let errorMessage = 'Failed to change password';
      const status = error.status;
      
      if (status === 400) {
        // For 400 errors, show the message from the API response
        if (error.message) {
          errorMessage = error.message;
          // If there are specific error details, append them
          if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
            errorMessage = `${error.message}: ${error.errors.join(', ')}`;
          }
        } else {
          errorMessage = 'Validation failed. Please check your input.';
        }
      } else if (status === 404) {
        errorMessage = error.message || 'User not found.';
      } else if (status === 403) {
        errorMessage = error.message || 'Current password is incorrect.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setPasswordError(errorMessage);
    } finally {
      setPasswordLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  // Clear data handlers
  const handleOpenClearDataDialog = () => {
    setShowClearDataDialog(true);
    setClearDataError(null);
    setClearDataSuccess(null);
    setClearDataPassword('');
    setClearDataAgreement(false);
    setClearDataShowPassword(false);
    setClearDataResult(null);
    setClearDataCategory('All');
  };

  const handleCloseClearDataDialog = () => {
    if (!clearDataLoading) {
      setShowClearDataDialog(false);
      setClearDataError(null);
      setClearDataSuccess(null);
      setClearDataPassword('');
      setClearDataAgreement(false);
      setClearDataShowPassword(false);
      setClearDataResult(null);
      setClearDataCategory('All');
    }
  };

  const getClearButtonText = () => {
    if (clearDataLoading) return 'Clearing...';
    if (clearDataSuccess) return 'Cleared';
    
    const categoryNames: { [key: string]: string } = {
      'All': 'All Data',
      'PaymentsAndTransactions': 'Payments and Transactions',
      'BillsAndUtility': 'Bills and Utility',
      'Loan': 'Loan Data',
      'Savings': 'Savings Data',
      'BankAccount': 'Bank Account Data',
    };
    
    const categoryName = categoryNames[clearDataCategory] || 'Data';
    return `Clear ${categoryName}`;
  };

  const handleClearData = async () => {
    // Validation
    if (!clearDataPassword.trim()) {
      setClearDataError('Password is required to confirm this action');
      return;
    }

    if (!clearDataAgreement) {
      setClearDataError('You must agree to delete all your data');
      return;
    }

    try {
      setClearDataLoading(true);
      setClearDataError(null);
      setClearDataSuccess(null);
      setClearDataResult(null);

      const response = await apiService.clearAllUserData({
        password: clearDataPassword,
        agreementConfirmed: clearDataAgreement,
        category: clearDataCategory,
      });

      if (response && response.success && response.data) {
        setClearDataSuccess(response.message || 'All user data has been cleared successfully');
        setClearDataResult(response.data);
        
        // Clear local storage after successful API call
        sessionStorage.removeItem('userProfile');
        localStorage.removeItem('preferredCurrency');
        
        // Clear browser cache if available
        if ('caches' in window) {
          try {
            const cacheNames = await caches.keys();
            await Promise.all(
              cacheNames.map(cacheName => caches.delete(cacheName))
            );
          } catch (cacheError) {
            console.warn('Failed to clear browser cache:', cacheError);
          }
        }

        // Reload the page after a delay to refresh data
        setTimeout(() => {
          setShowClearDataDialog(false);
          window.location.reload();
        }, 5000);
      } else {
        setClearDataError(response?.message || 'Failed to clear data');
      }
    } catch (error: any) {
      console.error('Error clearing data:', error);
      
      let errorMessage = 'Failed to clear data';
      const status = error.status;
      
      if (status === 400) {
        if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
          errorMessage = `${error.message || 'Validation failed'}: ${error.errors.join(', ')}`;
        } else {
          errorMessage = error.message || 'Validation failed. Please check your input.';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setClearDataError(errorMessage);
    } finally {
      setClearDataLoading(false);
    }
  };

  // Feature not available handler
  const handleFeatureNotAvailable = () => {
    setShowFeatureNotAvailableDialog(true);
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
          currency: currency,
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
        preferredCurrency: userProfile.preferredCurrency || 'USD',
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
        currency: currency,
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
        currency: currency,
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

  // Delete Income Source handlers
  const handleDeleteClick = (incomeSource: any) => {
    setIncomeSourceToDelete(incomeSource);
    setShowDeleteDialog(true);
    setDeleteError(null);
    setDeleteSuccess(null);
  };

  const handleDeleteConfirm = async () => {
    if (!incomeSourceToDelete) return;

    setDeleteLoading(true);
    setDeleteError(null);

    try {
      await apiService.deleteIncomeSource(incomeSourceToDelete.id);
      setDeleteSuccess('Income source deleted successfully!');
      
      setTimeout(() => {
        setShowDeleteDialog(false);
        setIncomeSourceToDelete(null);
        setDeleteSuccess(null);
        loadIncomeData(); // Reload income data
      }, 1500);
    } catch (err: any) {
      setDeleteError(err.message || 'Failed to delete income source. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteDialog(false);
    setIncomeSourceToDelete(null);
    setDeleteError(null);
    setDeleteSuccess(null);
  };

  // Edit Income Source handlers
  const handleEditClick = (incomeSource: any) => {
    setIncomeSourceToEdit(incomeSource);
    setEditIncomeFormData({
      name: incomeSource.name || '',
      amount: incomeSource.amount || 0,
      frequency: incomeSource.frequency || 'MONTHLY',
      category: incomeSource.category || 'PRIMARY',
      currency: incomeSource.currency || 'USD',
      description: incomeSource.description || '',
      company: incomeSource.company || '',
      isActive: incomeSource.isActive !== undefined ? incomeSource.isActive : true,
    });
    setShowEditIncomeDialog(true);
    setEditIncomeError(null);
    setEditIncomeSuccess(null);
  };

  const handleEditIncomeInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditIncomeFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (editIncomeError) setEditIncomeError(null);
  };

  const handleEditIncomeSelectChange = (e: any) => {
    const { name, value } = e.target;
    setEditIncomeFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (editIncomeError) setEditIncomeError(null);
  };

  const handleEditIncomeSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setEditIncomeFormData(prev => ({
      ...prev,
      [name]: checked,
    }));
    if (editIncomeError) setEditIncomeError(null);
  };

  const validateEditIncomeForm = (): string | null => {
    if (!editIncomeFormData.name.trim()) {
      return 'Income source name is required';
    }
    if (editIncomeFormData.amount <= 0) {
      return 'Amount must be greater than 0';
    }
    if (!editIncomeFormData.frequency) {
      return 'Frequency is required';
    }
    if (!editIncomeFormData.category) {
      return 'Category is required';
    }
    return null;
  };

  const handleUpdateIncomeSource = async () => {
    if (!incomeSourceToEdit) return;

    const validationError = validateEditIncomeForm();
    if (validationError) {
      setEditIncomeError(validationError);
      return;
    }

    setEditIncomeLoading(true);
    setEditIncomeError(null);

    try {
      await apiService.updateIncomeSource(incomeSourceToEdit.id, editIncomeFormData);
      setEditIncomeSuccess('Income source updated successfully!');
      
      setTimeout(() => {
        setShowEditIncomeDialog(false);
        setIncomeSourceToEdit(null);
        setEditIncomeSuccess(null);
        loadIncomeData(); // Reload income data
      }, 1500);
    } catch (err: any) {
      setEditIncomeError(err.message || 'Failed to update income source. Please try again.');
    } finally {
      setEditIncomeLoading(false);
    }
  };

  const handleEditIncomeCancel = () => {
    setShowEditIncomeDialog(false);
    setIncomeSourceToEdit(null);
    setEditIncomeError(null);
    setEditIncomeSuccess(null);
  };

  const resetEditIncomeForm = () => {
    setEditIncomeFormData({
      name: '',
      amount: 0,
      frequency: 'MONTHLY',
      category: 'PRIMARY',
      currency: 'USD',
      description: '',
      company: '',
      isActive: true,
    });
    setEditIncomeError(null);
    setEditIncomeSuccess(null);
  };

  // View Income Source handlers
  const handleViewClick = async (incomeSource: any) => {
    setShowViewIncomeDialog(true);
    setViewIncomeLoading(true);
    setViewIncomeError(null);

    try {
      const response = await apiService.getIncomeSourceById(incomeSource.id);
      setViewIncomeData(response.data);
    } catch (err: any) {
      setViewIncomeError(err.message || 'Failed to load income source details');
    } finally {
      setViewIncomeLoading(false);
    }
  };

  const handleViewClose = () => {
    setShowViewIncomeDialog(false);
    setViewIncomeData(null);
    setViewIncomeError(null);
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

  // Fetch user subscription
  const fetchUserSubscription = useCallback(async () => {
    try {
      setSubscriptionLoading(true);
      setSubscriptionError(null);
      const subscription = await apiService.getMySubscription();
      setUserSubscription(subscription);
    } catch (err: any) {
      console.error('Failed to fetch subscription:', err);
      // Don't show error if subscription doesn't exist (user might not have one)
      if (err.status !== 404) {
        setSubscriptionError(err.message || 'Failed to load subscription information');
      }
    } finally {
      setSubscriptionLoading(false);
    }
  }, []);

  // Load subscription when component mounts
  useEffect(() => {
    if (user?.id) {
      fetchUserSubscription();
    }
  }, [user?.id, fetchUserSubscription]);

  // Sync profile state with user profile data
  useEffect(() => {
    if (userProfile?.preferredCurrency || currency) {
      setProfile(prev => ({
        ...prev,
        preferredCurrency: userProfile?.preferredCurrency || currency,
      }));
    }
  }, [userProfile, currency]);

  // Initialize profile state with user data
  useEffect(() => {
    if (user) {
      setProfile(prev => ({
        ...prev,
        name: user.name || prev.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  // Load profile form data from user profile
  useEffect(() => {
    if (userProfile) {
      setProfileFormData(prev => ({
        ...prev,
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
        preferredCurrency: userProfile.preferredCurrency || currency,
      }));
    }
  }, [userProfile, currency]);

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
            
            {userUpdateSuccess && (
              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setUserUpdateSuccess(null)}>
                {userUpdateSuccess}
              </Alert>
            )}

            {userUpdateError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setUserUpdateError(null)}>
                {userUpdateError}
              </Alert>
            )}

            {currencyUpdateError && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setCurrencyUpdateError(null)}>
                {currencyUpdateError}
              </Alert>
            )}

            <Grid container spacing={2} sx={{ mt: 2 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Name"
                  value={profile.name}
                  onChange={(e) => handleProfileChange('name', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Mobile Number"
                  value={profile.phone}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="Preferred Currency"
                  value={currency}
                  onChange={async (e) => {
                    const newCurrency = e.target.value;
                    const oldCurrency = currency; // Capture old value before updating
                    console.log('Currency selector changed to:', newCurrency);
                    
                    // Update local state immediately for better UX
                    setCurrency(newCurrency);
                    handleProfileChange('preferredCurrency', newCurrency);
                    
                    // Call API to update currency
                    try {
                      setCurrencyUpdateLoading(true);
                      setCurrencyUpdateError(null);
                      
                      const response = await apiService.updateUserProfileCurrency(newCurrency);
                      
                      if (response && response.success) {
                        console.log('Currency updated successfully:', response);
                        // Currency is already updated in local state
                      } else {
                        // Revert on error
                        setCurrency(oldCurrency);
                        setCurrencyUpdateError(response?.message || 'Failed to update currency');
                      }
                    } catch (error: any) {
                      console.error('Error updating currency:', error);
                      // Revert on error
                      setCurrency(oldCurrency);
                      
                      let errorMessage = 'Failed to update currency';
                      const status = error.status;
                      
                      if (status === 400) {
                        if (error.errors && Array.isArray(error.errors) && error.errors.length > 0) {
                          errorMessage = `${error.message || 'Validation failed'}: ${error.errors.join(', ')}`;
                        } else {
                          errorMessage = error.message || 'Validation failed. Please check your input.';
                        }
                      } else if (status === 404) {
                        errorMessage = error.message || 'User profile not found.';
                      } else if (status === 403) {
                        errorMessage = error.message || 'You do not have permission to update currency.';
                      } else if (error.message) {
                        errorMessage = error.message;
                      }
                      
                      setCurrencyUpdateError(errorMessage);
                    } finally {
                      setCurrencyUpdateLoading(false);
                    }
                  }}
                  helperText="Select your preferred currency"
                  disabled={currencyUpdateLoading}
                >
                  {CURRENCY_OPTIONS.map((currencyOption) => (
                    <MenuItem key={currencyOption.code} value={currencyOption.code}>
                      {currencyOption.code} {currencyOption.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  startIcon={userUpdateLoading ? <CircularProgress size={20} /> : <SaveIcon />}
                  onClick={handleSaveUserInfo}
                  fullWidth
                  disabled={userUpdateLoading}
                >
                  {userUpdateLoading ? 'Saving...' : 'Save Profile'}
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

        {/* Subscription Information */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ mb: 0 }}>
                Subscription Plan
              </Typography>
              <Button
                variant="outlined"
                size="small"
                onClick={() => setShowSubscriptionModal(true)}
                sx={{ minWidth: 120 }}
              >
                Manage Plan
              </Button>
            </Box>

            {subscriptionLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : subscriptionError ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {subscriptionError}
              </Alert>
            ) : userSubscription ? (
              <Grid container spacing={3} sx={{ mt: 1 }}>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {userSubscription.planDisplayName}
                      </Typography>
                      <Chip
                        label={userSubscription.status}
                        color={
                          userSubscription.status === 'ACTIVE'
                            ? 'success'
                            : userSubscription.status === 'CANCELLED'
                            ? 'error'
                            : userSubscription.status === 'TRIAL'
                            ? 'warning'
                            : 'default'
                        }
                        size="small"
                      />
                    </Box>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Billing Cycle:</strong> {userSubscription.billingCycle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        <strong>Current Price:</strong> {formatCurrency(userSubscription.currentPrice)} / {userSubscription.billingCycle === 'MONTHLY' ? 'month' : 'year'}
                      </Typography>
                      {userSubscription.startDate && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Start Date:</strong> {new Date(userSubscription.startDate).toLocaleDateString()}
                        </Typography>
                      )}
                      {userSubscription.nextBillingDate && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Next Billing Date:</strong> {new Date(userSubscription.nextBillingDate).toLocaleDateString()}
                        </Typography>
                      )}
                      {userSubscription.endDate && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>End Date:</strong> {new Date(userSubscription.endDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </Card>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Card variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
                      Usage This Month
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                      {userSubscription.transactionsThisMonth !== undefined && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Transactions:</strong> {userSubscription.transactionsThisMonth}
                        </Typography>
                      )}
                      {userSubscription.billsThisMonth !== undefined && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Bills:</strong> {userSubscription.billsThisMonth}
                        </Typography>
                      )}
                      {userSubscription.receiptOcrThisMonth !== undefined && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>Receipt OCR:</strong> {userSubscription.receiptOcrThisMonth}
                        </Typography>
                      )}
                      {userSubscription.aiQueriesThisMonth !== undefined && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          <strong>AI Queries:</strong> {userSubscription.aiQueriesThisMonth}
                        </Typography>
                      )}
                      {userSubscription.apiCallsThisMonth !== undefined && (
                        <Typography variant="body2" color="text.secondary">
                          <strong>API Calls:</strong> {userSubscription.apiCallsThisMonth}
                        </Typography>
                      )}
                    </Box>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                You don't have an active subscription. Click "Manage Plan" to choose a subscription plan.
              </Alert>
            )}
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
                      onClick={handleFeatureNotAvailable}
                    >
                      Export Data
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<AddIcon />}
                      fullWidth
                      sx={{ mb: 1 }}
                      onClick={handleFeatureNotAvailable}
                    >
                      Import Data
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      fullWidth
                      onClick={handleOpenClearDataDialog}
                    >
                      Clear data
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
                      onClick={handleOpenChangePasswordDialog}
                      startIcon={<LockIcon />}
                    >
                      Change Password
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      sx={{ mb: 1 }}
                      onClick={handleFeatureNotAvailable}
                    >
                      Two-Factor Auth
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleFeatureNotAvailable}
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
              Bank API Keys
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ mt: 2 }}
              onClick={handleFeatureNotAvailable}
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
                      <FormControl fullWidth>
                        <InputLabel>Currency</InputLabel>
                        <Select
                          value={source.currency}
                          onChange={(e) => handleIncomeSourceChange(index, 'currency', e.target.value)}
                          label="Currency"
                        >
                          {CURRENCY_OPTIONS.map((currency) => (
                            <MenuItem key={currency.code} value={currency.code}>
                              {currency.code} - {currency.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
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
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  id="income-currency"
                  name="currency"
                  value={incomeSourceFormData.currency}
                  onChange={handleIncomeSourceSelectChange}
                  label="Currency"
                >
                  {CURRENCY_OPTIONS.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={source.currency}
                      onChange={(e) => handleBulkIncomeSourceChange(index, 'currency', e.target.value)}
                      label="Currency"
                    >
                      {CURRENCY_OPTIONS.map((currency) => (
                        <MenuItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
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

      {/* View Income Source Dialog */}
      <Dialog 
        open={showViewIncomeDialog} 
        onClose={handleViewClose}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div">
            Income Source Details
          </Typography>
          <Typography variant="body2" color="text.secondary">
            View detailed information about this income source
          </Typography>
        </DialogTitle>
        <DialogContent>
          {viewIncomeError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {viewIncomeError}
            </Alert>
          )}

          {viewIncomeLoading ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : viewIncomeData ? (
            <Grid container spacing={3}>
              {/* Basic Information */}
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon />
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {viewIncomeData.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Amount
                      </Typography>
                      <Typography variant="body1" fontWeight="medium" color="success.main">
                        {formatCurrency(viewIncomeData.amount, { currencyCode: viewIncomeData.currency })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Frequency
                      </Typography>
                      <Chip 
                        label={viewIncomeData.frequency} 
                        size="small" 
                        color="primary"
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Category
                      </Typography>
                      <Chip 
                        label={viewIncomeData.category} 
                        size="small" 
                        color={
                          viewIncomeData.category?.toLowerCase() === 'primary' ? 'success' :
                          viewIncomeData.category?.toLowerCase() === 'passive' ? 'info' :
                          viewIncomeData.category?.toLowerCase() === 'business' ? 'warning' :
                          'default'
                        }
                        variant="outlined"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Company
                      </Typography>
                      <Typography variant="body1">
                        {viewIncomeData.company || '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Status
                      </Typography>
                      <Chip 
                        label={viewIncomeData.isActive ? 'Active' : 'Inactive'} 
                        size="small" 
                        color={viewIncomeData.isActive ? 'success' : 'default'}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Financial Details */}
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
                  <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MoneyIcon />
                    Financial Details
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Monthly Amount
                      </Typography>
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(viewIncomeData.monthlyAmount, { currencyCode: viewIncomeData.currency })}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Currency
                      </Typography>
                      <Typography variant="body1" fontWeight="medium">
                        {viewIncomeData.currency}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* Additional Information */}
              {viewIncomeData.description && (
                <Grid item xs={12}>
                  <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      Description
                    </Typography>
                    <Typography variant="body1">
                      {viewIncomeData.description}
                    </Typography>
                  </Box>
                </Grid>
              )}

              {/* Timestamps */}
              <Grid item xs={12}>
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Timestamps
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Created At
                      </Typography>
                      <Typography variant="body1">
                        {viewIncomeData.createdAt ? new Date(viewIncomeData.createdAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Updated At
                      </Typography>
                      <Typography variant="body1">
                        {viewIncomeData.updatedAt ? new Date(viewIncomeData.updatedAt).toLocaleString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : '-'}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>
            </Grid>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <MoneyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No Data Available
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Unable to load income source details
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleViewClose}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Income Source Dialog */}
      <Dialog 
        open={showEditIncomeDialog} 
        onClose={handleEditIncomeCancel} 
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div">
            Edit Income Source
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update your income source information
          </Typography>
        </DialogTitle>
        <DialogContent>
          {editIncomeSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {editIncomeSuccess}
            </Alert>
          )}

          {editIncomeError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {editIncomeError}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="edit-income-name"
                label="Income Source Name"
                name="name"
                value={editIncomeFormData.name}
                onChange={handleEditIncomeInputChange}
                placeholder="e.g., Company Salary, Freelance Work"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                fullWidth
                id="edit-income-amount"
                label="Amount"
                name="amount"
                type="number"
                value={editIncomeFormData.amount}
                onChange={handleEditIncomeInputChange}
                inputProps={{ min: 0, step: 0.01 }}
                placeholder="0.00"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel>Frequency</InputLabel>
                <Select
                  name="frequency"
                  value={editIncomeFormData.frequency}
                  label="Frequency"
                  onChange={handleEditIncomeSelectChange}
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
                  name="category"
                  value={editIncomeFormData.category}
                  label="Category"
                  onChange={handleEditIncomeSelectChange}
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
                id="edit-income-company"
                label="Company"
                name="company"
                value={editIncomeFormData.company}
                onChange={handleEditIncomeInputChange}
                placeholder="Company or organization name"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Currency</InputLabel>
                <Select
                  id="edit-income-currency"
                  name="currency"
                  value={editIncomeFormData.currency}
                  onChange={handleEditIncomeSelectChange}
                  label="Currency"
                >
                  {CURRENCY_OPTIONS.map((currency) => (
                    <MenuItem key={currency.code} value={currency.code}>
                      {currency.code} - {currency.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    name="isActive"
                    checked={editIncomeFormData.isActive}
                    onChange={handleEditIncomeSwitchChange}
                    color="primary"
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="edit-income-description"
                label="Description"
                name="description"
                multiline
                rows={3}
                value={editIncomeFormData.description}
                onChange={handleEditIncomeInputChange}
                placeholder="Additional details about this income source..."
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleEditIncomeCancel}
            disabled={editIncomeLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateIncomeSource}
            variant="contained"
            disabled={editIncomeLoading}
            startIcon={editIncomeLoading ? <CircularProgress size={20} /> : <EditIcon />}
          >
            {editIncomeLoading ? 'Updating...' : 'Update Income Source'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Income Source Confirmation Dialog */}
      <Dialog 
        open={showDeleteDialog} 
        onClose={handleDeleteCancel}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div" color="error">
            Delete Income Source
          </Typography>
        </DialogTitle>
        <DialogContent>
          {deleteSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {deleteSuccess}
            </Alert>
          )}

          {deleteError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {deleteError}
            </Alert>
          )}

          {!deleteSuccess && (
            <>
              <Typography variant="body1" sx={{ mb: 2 }}>
                Are you sure you want to delete this income source?
              </Typography>
              
              {incomeSourceToDelete && (
                <Box sx={{ p: 2, bgcolor: 'background.default', borderRadius: 1, mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Income Source Details:
                  </Typography>
                  <Typography variant="body2">
                    <strong>Name:</strong> {incomeSourceToDelete.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Amount:</strong> {formatCurrency(incomeSourceToDelete.amount, { currencyCode: incomeSourceToDelete.currency })}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Frequency:</strong> {incomeSourceToDelete.frequency}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Category:</strong> {incomeSourceToDelete.category}
                  </Typography>
                  {incomeSourceToDelete.company && (
                    <Typography variant="body2">
                      <strong>Company:</strong> {incomeSourceToDelete.company}
                    </Typography>
                  )}
                </Box>
              )}

              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Warning:</strong> This action cannot be undone. The income source will be permanently deleted from your account.
                </Typography>
              </Alert>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleDeleteCancel}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            variant="contained"
            color="error"
            disabled={deleteLoading || !!deleteSuccess}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleteLoading ? 'Deleting...' : deleteSuccess ? 'Deleted' : 'Delete Income Source'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog 
        open={showChangePasswordDialog} 
        onClose={handleCloseChangePasswordDialog}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <LockIcon />
            Change Password
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Update your account password
          </Typography>
        </DialogTitle>
        <DialogContent>
          {passwordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {passwordSuccess}
            </Alert>
          )}

          {passwordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {passwordError}
            </Alert>
          )}

          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Current Password"
                type={showPasswords.current ? 'text' : 'password'}
                value={passwordFormData.currentPassword}
                onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('current')}
                        edge="end"
                      >
                        {showPasswords.current ? <VisibilityOffIcon /> : <ViewIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password"
                type={showPasswords.new ? 'text' : 'password'}
                value={passwordFormData.newPassword}
                onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                required
                helperText="Password must be at least 6 characters long"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('new')}
                        edge="end"
                      >
                        {showPasswords.new ? <VisibilityOffIcon /> : <ViewIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Confirm New Password"
                type={showPasswords.confirm ? 'text' : 'password'}
                value={passwordFormData.confirmPassword}
                onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                required
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => togglePasswordVisibility('confirm')}
                        edge="end"
                      >
                        {showPasswords.confirm ? <VisibilityOffIcon /> : <ViewIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseChangePasswordDialog}
            disabled={passwordLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleChangePassword}
            variant="contained"
            disabled={passwordLoading}
            startIcon={passwordLoading ? <CircularProgress size={20} /> : <LockIcon />}
          >
            {passwordLoading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Clear Data Confirmation Dialog */}
      <Dialog 
        open={showClearDataDialog} 
        onClose={handleCloseClearDataDialog}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" component="div" color="error" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <DeleteIcon />
            Clear data
          </Typography>
        </DialogTitle>
        <DialogContent>
          {clearDataSuccess && (
            <>
              <Alert severity="success" sx={{ mb: 2 }}>
                {clearDataSuccess}
              </Alert>
              {clearDataResult && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {clearDataResult.message}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
                    Deleted Records Summary:
                  </Typography>
                  <Box component="ul" sx={{ pl: 2, mb: 1 }}>
                    {Object.entries(clearDataResult.deletedRecords).map(([key, value]) => (
                      value !== undefined && value > 0 && (
                        <Typography key={key} component="li" variant="body2" sx={{ mb: 0.5 }}>
                          {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}: {value} record{value !== 1 ? 's' : ''}
                        </Typography>
                      )
                    ))}
                  </Box>
                  <Typography variant="body2" sx={{ mt: 1, fontWeight: 'bold' }}>
                    Total Records Deleted: {clearDataResult.totalRecordsDeleted}
                  </Typography>
                  <Alert severity="info" sx={{ mt: 2 }}>
                    <Typography variant="body2">
                      The page will reload automatically in a few seconds...
                    </Typography>
                  </Alert>
                </Box>
              )}
            </>
          )}

          {clearDataError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {clearDataError}
            </Alert>
          )}

          {!clearDataSuccess && (
            <>
              <Alert severity="error" sx={{ mb: 2 }}>
                <Typography variant="body2" fontWeight="bold">
                  ⚠️ WARNING: This is a destructive operation!
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {clearDataCategory === 'All' 
                    ? 'This will permanently delete ALL your data including:'
                    : `This will permanently delete your selected category data:`
                  }
                </Typography>
              </Alert>

              {/* Category Selection */}
              <FormControl component="fieldset" sx={{ mb: 3, width: '100%', mt: 2 }} disabled={clearDataLoading}>
                <FormLabel component="legend" sx={{ mb: 2, fontWeight: 'bold', fontSize: '1rem' }}>
                  Select Data Category to Delete:
                </FormLabel>
                <RadioGroup
                  value={clearDataCategory}
                  onChange={(e) => {
                    setClearDataCategory(e.target.value);
                    if (clearDataError) setClearDataError(null);
                  }}
                  sx={{ gap: 1 }}
                >
                  <FormControlLabel 
                    value="All" 
                    control={<Radio />} 
                    disabled={clearDataLoading}
                    label={
                      <Typography variant="body2">
                        <strong>All</strong> - Delete everything (Payments, Loans, Bills, Bank Accounts, Savings, etc.)
                      </Typography>
                    } 
                  />
                  <FormControlLabel 
                    value="PaymentsAndTransactions" 
                    control={<Radio />} 
                    disabled={clearDataLoading}
                    label={
                      <Typography variant="body2">
                        <strong>Payment and Transaction</strong> - Payments and Bank Transactions
                      </Typography>
                    } 
                  />
                  <FormControlLabel 
                    value="BillsAndUtility" 
                    control={<Radio />} 
                    disabled={clearDataLoading}
                    label={
                      <Typography variant="body2">
                        <strong>Bills and Utility</strong> - Bills, Income Sources, and Variable Expenses
                      </Typography>
                    } 
                  />
                  <FormControlLabel 
                    value="Loan" 
                    control={<Radio />} 
                    disabled={clearDataLoading}
                    label={
                      <Typography variant="body2">
                        <strong>Loan</strong> - Loans, Loan Applications, and Repayment Schedules
                      </Typography>
                    } 
                  />
                  <FormControlLabel 
                    value="Savings" 
                    control={<Radio />} 
                    disabled={clearDataLoading}
                    label={
                      <Typography variant="body2">
                        <strong>Savings</strong> - Savings Accounts and Savings Transactions
                      </Typography>
                    } 
                  />
                  <FormControlLabel 
                    value="BankAccount" 
                    control={<Radio />} 
                    disabled={clearDataLoading}
                    label={
                      <Typography variant="body2">
                        <strong>Bank Account</strong> - Bank Accounts and Bank Transactions
                      </Typography>
                    } 
                  />
                </RadioGroup>
              </FormControl>

              {/* Show full list only when "All" is selected */}
              {clearDataCategory === 'All' && (
                <>
                  <Box component="ul" sx={{ pl: 3, mb: 2 }}>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Payments, Loans, and Loan Applications
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Bank Accounts and Transactions
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Bills, Income Sources, and Expenses
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Notifications, Profile Data, and Settings
                    </Typography>
                    <Typography component="li" variant="body2" sx={{ mb: 1 }}>
                      Journal Entries, Budgets, and Analytics
                    </Typography>
                    <Typography component="li" variant="body2">
                      Chat Conversations and Messages
                    </Typography>
                  </Box>
                </>
              )}

              <Alert severity="warning" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Note:</strong> Your account will remain active, but {clearDataCategory === 'All' ? 'all data' : 'the selected data'} will be permanently deleted and cannot be recovered.
                </Typography>
              </Alert>

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Enter Password to Confirm"
                    type={clearDataShowPassword ? 'text' : 'password'}
                    value={clearDataPassword}
                    onChange={(e) => {
                      setClearDataPassword(e.target.value);
                      if (clearDataError) setClearDataError(null);
                    }}
                    required
                    disabled={clearDataLoading}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            onClick={() => setClearDataShowPassword(!clearDataShowPassword)}
                            edge="end"
                          >
                            {clearDataShowPassword ? <VisibilityOffIcon /> : <ViewIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                    helperText="Enter your password to confirm this action"
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={clearDataAgreement}
                        onChange={(e) => {
                          setClearDataAgreement(e.target.checked);
                          if (clearDataError) setClearDataError(null);
                        }}
                        disabled={clearDataLoading}
                        color="error"
                      />
                    }
                    label={
                      <Typography variant="body2" color="error">
                        I understand that this action will permanently delete all my data and cannot be undone
                      </Typography>
                    }
                  />
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleCloseClearDataDialog}
            disabled={clearDataLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleClearData}
            variant="contained"
            color="error"
            disabled={clearDataLoading || !!clearDataSuccess || !clearDataPassword.trim() || !clearDataAgreement}
            startIcon={clearDataLoading ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {getClearButtonText()}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feature Not Available Dialog */}
      <Dialog 
        open={showFeatureNotAvailableDialog} 
        onClose={() => setShowFeatureNotAvailableDialog(false)}
        maxWidth="sm" 
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <InfoIcon color="warning" />
              Feature Not Available
            </Typography>
            <IconButton
              onClick={() => setShowFeatureNotAvailableDialog(false)}
              size="small"
              edge="end"
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body1">
              This feature is not available for your account type. Please contact support.
            </Typography>
          </Alert>
          <Typography variant="body2" color="text.secondary">
            If you need access to this feature, please reach out to our support team for assistance with upgrading your account.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowFeatureNotAvailableDialog(false)}
            variant="contained"
            fullWidth
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subscription Modal */}
      <SubscriptionModal
        open={showSubscriptionModal}
        onClose={() => {
          setShowSubscriptionModal(false);
          // Refresh subscription data after modal closes
          fetchUserSubscription();
        }}
      />
    </Box>
  );
};

export default Settings;
