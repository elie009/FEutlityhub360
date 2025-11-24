import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  IconButton,
  TextField,
  Typography,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Category as CategoryIcon
} from '@mui/icons-material';
import apiService from '../../services/api';

interface TransactionCategory {
  id: string;
  name: string;
  description?: string;
  type: string;
  icon?: string;
  color?: string;
  isSystemCategory: boolean;
  isActive: boolean;
  displayOrder: number;
  transactionCount: number;
  createdAt: string;
  updatedAt: string;
}

const CategoryManagement: React.FC = () => {
  const [categories, setCategories] = useState<TransactionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'EXPENSE',
    icon: '',
    color: '#4ECDC4',
    displayOrder: 0,
    isActive: true
  });
  const [filterType, setFilterType] = useState<string>('');

  const categoryTypes = [
    { value: 'EXPENSE', label: 'Expense' },
    { value: 'INCOME', label: 'Income' },
    { value: 'TRANSFER', label: 'Transfer' },
    { value: 'BILL', label: 'Bill' },
    { value: 'SAVINGS', label: 'Savings' },
    { value: 'LOAN', label: 'Loan' }
  ];

  const predefinedColors = [
    '#FF6B6B', '#4ECDC4', '#95E1D3', '#F38181', '#AA96DA',
    '#FCBAD3', '#A8E6CF', '#FFD93D', '#6BCB77', '#95E1D3'
  ];

  const predefinedIcons = [
    'restaurant', 'shopping_cart', 'directions_car', 'local_gas_station',
    'movie', 'shopping_bag', 'local_hospital', 'school', 'flight',
    'home', 'security', 'savings', 'trending_up', 'account_balance',
    'swap_horiz', 'work', 'laptop', 'attach_money'
  ];

  useEffect(() => {
    loadCategories();
  }, [filterType]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await apiService.getAllCategories(filterType || undefined);
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (category?: TransactionCategory) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description || '',
        type: category.type,
        icon: category.icon || '',
        color: category.color || '#4ECDC4',
        displayOrder: category.displayOrder,
        isActive: category.isActive
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: '',
        description: '',
        type: 'EXPENSE',
        icon: '',
        color: '#4ECDC4',
        displayOrder: 0,
        isActive: true
      });
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedCategory(null);
    setFormData({
      name: '',
      description: '',
      type: 'EXPENSE',
      icon: '',
      color: '#4ECDC4',
      displayOrder: 0,
      isActive: true
    });
  };

  const handleSave = async () => {
    try {
      setError('');
      setSuccess('');

      if (!formData.name.trim()) {
        setError('Category name is required');
        return;
      }

      if (selectedCategory) {
        await apiService.updateCategory(selectedCategory.id, formData);
        setSuccess('Category updated successfully');
      } else {
        await apiService.createCategory(formData);
        setSuccess('Category created successfully');
      }

      handleCloseDialog();
      loadCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to save category');
    }
  };

  const handleDelete = async () => {
    if (!selectedCategory) return;

    try {
      setError('');
      await apiService.deleteCategory(selectedCategory.id);
      setSuccess('Category deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedCategory(null);
      loadCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const handleSeedSystemCategories = async () => {
    try {
      setLoading(true);
      setError('');
      await apiService.seedSystemCategories();
      setSuccess('System categories seeded successfully');
      loadCategories();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to seed system categories');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = filterType
    ? categories.filter(c => c.type === filterType)
    : categories;

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Transaction Categories
        </Typography>
        <Box>
          <Button
            variant="outlined"
            onClick={handleSeedSystemCategories}
            disabled={loading}
            sx={{ mr: 2 }}
          >
            Seed System Categories
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Category
          </Button>
        </Box>
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

      <Card>
        <CardContent>
          <Box sx={{ mb: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Type</InputLabel>
              <Select
                value={filterType}
                label="Filter by Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="">All Types</MenuItem>
                {categoryTypes.map(type => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Icon</TableCell>
                    <TableCell>Color</TableCell>
                    <TableCell>Active</TableCell>
                    <TableCell>Transactions</TableCell>
                    <TableCell>System</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredCategories.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        <Typography variant="body2" color="text.secondary">
                          No categories found. Click "Seed System Categories" to add default categories.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            {category.icon && (
                              <CategoryIcon sx={{ color: category.color }} />
                            )}
                            <Typography variant="body2" fontWeight="medium">
                              {category.name}
                            </Typography>
                          </Box>
                          {category.description && (
                            <Typography variant="caption" color="text.secondary">
                              {category.description}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={category.type}
                            size="small"
                            color={category.type === 'INCOME' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>{category.icon || '-'}</TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: '50%',
                              backgroundColor: category.color || '#4ECDC4',
                              border: '1px solid #ddd'
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {category.isActive ? (
                            <CheckCircleIcon color="success" />
                          ) : (
                            <CancelIcon color="disabled" />
                          )}
                        </TableCell>
                        <TableCell>{category.transactionCount}</TableCell>
                        <TableCell>
                          {category.isSystemCategory ? (
                            <Chip label="System" size="small" color="primary" />
                          ) : (
                            <Chip label="Custom" size="small" />
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenDialog(category)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          {!category.isSystemCategory && (
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => {
                                  setSelectedCategory(category);
                                  setDeleteDialogOpen(true);
                                }}
                              >
                                <DeleteIcon />
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
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedCategory ? 'Edit Category' : 'Create Category'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value.toUpperCase() })}
                required
                disabled={selectedCategory?.isSystemCategory}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  disabled={selectedCategory?.isSystemCategory}
                >
                  {categoryTypes.map(type => (
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
                label="Display Order"
                type="number"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Icon</InputLabel>
                <Select
                  value={formData.icon}
                  label="Icon"
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                >
                  <MenuItem value="">None</MenuItem>
                  {predefinedIcons.map(icon => (
                    <MenuItem key={icon} value={icon}>
                      {icon}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Color</InputLabel>
                <Select
                  value={formData.color}
                  label="Color"
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                >
                  {predefinedColors.map(color => (
                    <MenuItem key={color} value={color}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box
                          sx={{
                            width: 20,
                            height: 20,
                            borderRadius: '50%',
                            backgroundColor: color,
                            border: '1px solid #ddd'
                          }}
                        />
                        {color}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            {selectedCategory && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Active"
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            {selectedCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the category "{selectedCategory?.name}"?
            {selectedCategory && selectedCategory.transactionCount > 0 && (
              <Alert severity="warning" sx={{ mt: 2 }}>
                This category is used by {selectedCategory.transactionCount} transaction(s).
                The category will be deactivated instead of deleted.
              </Alert>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CategoryManagement;

