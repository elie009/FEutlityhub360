import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import {
  Save as SaveIcon,
  Upload as UploadIcon,
  Delete as DeleteIcon,
  Palette as PaletteIcon,
  Business as BusinessIcon,
  Image as ImageIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';
import { WhiteLabelSettings, UpdateWhiteLabelSettingsRequest } from '../types/whiteLabel';
import { config } from '../config/environment';
import { useWhiteLabel } from '../contexts/WhiteLabelContext';

const WhiteLabel: React.FC = () => {
  const { refreshSettings } = useWhiteLabel();
  const [settings, setSettings] = useState<WhiteLabelSettings>({
    companyName: '',
    logoUrl: null,
    primaryColor: '#1976d2',
    secondaryColor: '#424242',
    customDomain: null,
    isActive: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.getWhiteLabelSettings();
      setSettings(data);
      if (data.logoUrl) {
        setLogoPreview(`${config.apiBaseUrl}${data.logoUrl}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load white-label settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: keyof WhiteLabelSettings) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor') => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setSettings((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only PNG, JPG, JPEG, and SVG files are allowed.');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size exceeds maximum limit of 5MB.');
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const logoUrl = await apiService.uploadLogo(file);
      setSettings((prev) => ({
        ...prev,
        logoUrl: logoUrl,
      }));
      setLogoPreview(`${config.apiBaseUrl}${logoUrl}`);
      // Refresh the white-label context to apply logo changes
      await refreshSettings();
      setSuccess('Logo uploaded successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to upload logo');
    } finally {
      setUploading(false);
      // Reset file input
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleRemoveLogo = () => {
    setSettings((prev) => ({
      ...prev,
      logoUrl: null,
    }));
    setLogoPreview(null);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(null);

      const updateRequest: UpdateWhiteLabelSettingsRequest = {
        companyName: settings.companyName,
        logoUrl: settings.logoUrl,
        primaryColor: settings.primaryColor,
        secondaryColor: settings.secondaryColor,
        customDomain: settings.customDomain || null,
        isActive: settings.isActive,
      };

      const updated = await apiService.updateWhiteLabelSettings(updateRequest);
      setSettings(updated);
      // Refresh the white-label context to apply theme changes
      await refreshSettings();
      setSuccess('White-label settings saved successfully');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save white-label settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        White-Label Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Customize your application branding with your company logo, colors, and domain.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Company Information */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <BusinessIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Company Information</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <TextField
                fullWidth
                label="Company Name"
                value={settings.companyName}
                onChange={handleInputChange('companyName')}
                margin="normal"
                required
              />
              <TextField
                fullWidth
                label="Custom Domain (optional)"
                value={settings.customDomain || ''}
                onChange={handleInputChange('customDomain')}
                margin="normal"
                placeholder="example.com"
                helperText="Enter your custom domain if you have one configured"
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Logo Upload */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <ImageIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Logo</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                {logoPreview ? (
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <Avatar
                      src={logoPreview}
                      alt="Company Logo"
                      sx={{ width: 150, height: 150 }}
                      variant="rounded"
                    />
                    <IconButton
                      color="error"
                      onClick={handleRemoveLogo}
                      sx={{ position: 'absolute', top: 0, right: 0 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Avatar sx={{ width: 150, height: 150, mb: 2, bgcolor: 'grey.300' }}>
                    <ImageIcon sx={{ fontSize: 60 }} />
                  </Avatar>
                )}
                <input
                  accept="image/png,image/jpeg,image/jpg,image/svg+xml"
                  style={{ display: 'none' }}
                  id="logo-upload"
                  type="file"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
                <label htmlFor="logo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<UploadIcon />}
                    disabled={uploading}
                  >
                    {uploading ? 'Uploading...' : logoPreview ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                </label>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                  PNG, JPG, JPEG, or SVG (max 5MB)
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Color Customization */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PaletteIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6">Color Customization</Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Primary Color"
                    type="color"
                    value={settings.primaryColor}
                    onChange={handleColorChange('primaryColor')}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    helperText="Main brand color"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Secondary Color"
                    type="color"
                    value={settings.secondaryColor}
                    onChange={handleColorChange('secondaryColor')}
                    margin="normal"
                    InputLabelProps={{ shrink: true }}
                    helperText="Secondary brand color"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 60,
                      backgroundColor: settings.primaryColor,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      mt: 2,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Primary Color Preview
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box
                    sx={{
                      width: '100%',
                      height: 60,
                      backgroundColor: settings.secondaryColor,
                      borderRadius: 1,
                      border: '1px solid',
                      borderColor: 'divider',
                      mt: 2,
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Secondary Color Preview
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Activation */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <FormControlLabel
                control={
                  <Switch
                    checked={settings.isActive}
                    onChange={handleInputChange('isActive')}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1">Enable White-Label Branding</Typography>
                    <Typography variant="caption" color="text.secondary">
                      When enabled, your custom branding will be applied throughout the application
                    </Typography>
                  </Box>
                }
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Save Button */}
        <Grid item xs={12}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button variant="outlined" onClick={loadSettings} disabled={saving}>
              Reset
            </Button>
            <Button
              variant="contained"
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              onClick={handleSave}
              disabled={saving || !settings.companyName}
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default WhiteLabel;

