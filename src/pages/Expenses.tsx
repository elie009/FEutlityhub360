import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Fab,
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Skeleton,
  Tabs,
  Tab,
} from '@mui/material';
import {
  Add as AddIcon,
  Receipt,
  TrendingUp,
  Warning,
  CheckCircle,
  FilterList,
  Refresh,
  Edit,
  Delete,
  AttachFile,
  Approval,
  Category,
  AccountBalance,
  CloudUpload,
  CheckCircle as CheckCircleIcon,
  Cancel,
  Visibility,
  BarChart,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { apiService } from '../services/api';
import {
  Expense,
  ExpenseCategory,
  ExpenseBudget,
  ExpenseFilters,
  ApprovalStatus,
  CreateExpenseRequest,
  UpdateExpenseRequest,
} from '../types/expense';

const Expenses: React.FC = () => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [budgets, setBudgets] = useState<ExpenseBudget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [filters, setFilters] = useState<ExpenseFilters>({
    page: 1,
    pageSize: 50,
  });
  
  // Category management states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '',
    monthlyBudget: undefined as number | undefined,
    yearlyBudget: undefined as number | undefined,
    isTaxDeductible: false,
    taxCategory: '',
    displayOrder: 0,
  });

  // Budget management states
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<ExpenseBudget | null>(null);
  const [budgetFormData, setBudgetFormData] = useState({
    categoryId: '',
    budgetAmount: 0,
    periodType: 'MONTHLY' as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    notes: '',
    alertThreshold: undefined as number | undefined,
  });

  // Receipt upload states
  const [showReceiptUpload, setShowReceiptUpload] = useState(false);
  const [expenseForReceipt, setExpenseForReceipt] = useState<Expense | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [uploadingReceipt, setUploadingReceipt] = useState(false);

  // Approval workflow states
  const [showApprovalDialog, setShowApprovalDialog] = useState(false);
  const [expenseForApproval, setExpenseForApproval] = useState<Expense | null>(null);
  const [approvalAction, setApprovalAction] = useState<'submit' | 'approve' | 'reject'>('submit');
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  // Reporting states
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportStartDate, setReportStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [reportEndDate, setReportEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Form state
  const [formData, setFormData] = useState<CreateExpenseRequest>({
    description: '',
    amount: 0,
    categoryId: '',
    expenseDate: new Date().toISOString().split('T')[0],
    currency: 'USD',
    isTaxDeductible: false,
    isReimbursable: false,
    approvalStatus: ApprovalStatus.PENDING_APPROVAL,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError('');

      const [expensesData, categoriesData, budgetsData] = await Promise.all([
        apiService.getExpenses(filters),
        apiService.getExpenseCategories(),
        apiService.getExpenseBudgets(),
      ]);

      setExpenses(expensesData.data || expensesData || []);
      setCategories(categoriesData || []);
      setBudgets(budgetsData || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateExpense = async () => {
    try {
      setError('');
      await apiService.createExpense(formData);
      setSuccessMessage('Expense created successfully');
      setShowExpenseForm(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create expense');
    }
  };

  const handleUpdateExpense = async () => {
    if (!selectedExpense) return;
    try {
      setError('');
      await apiService.updateExpense(selectedExpense.id, formData as UpdateExpenseRequest);
      setSuccessMessage('Expense updated successfully');
      setShowExpenseForm(false);
      resetForm();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update expense');
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!window.confirm('Are you sure you want to delete this expense?')) return;
    try {
      setError('');
      await apiService.deleteExpense(expenseId);
      setSuccessMessage('Expense deleted successfully');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete expense');
    }
  };

  const resetForm = () => {
    setFormData({
      description: '',
      amount: 0,
      categoryId: '',
      expenseDate: new Date().toISOString().split('T')[0],
      currency: 'USD',
      isTaxDeductible: false,
      isReimbursable: false,
      approvalStatus: ApprovalStatus.PENDING_APPROVAL,
    });
    setSelectedExpense(null);
  };

  const openEditForm = (expense: Expense) => {
    setSelectedExpense(expense);
    setFormData({
      description: expense.description,
      amount: expense.amount,
      categoryId: expense.categoryId,
      expenseDate: expense.expenseDate.split('T')[0],
      currency: expense.currency,
      notes: expense.notes,
      merchant: expense.merchant,
      paymentMethod: expense.paymentMethod,
      bankAccountId: expense.bankAccountId,
      location: expense.location,
      isTaxDeductible: expense.isTaxDeductible,
      isReimbursable: expense.isReimbursable,
      mileage: expense.mileage,
      mileageRate: expense.mileageRate,
      perDiemAmount: expense.perDiemAmount,
      numberOfDays: expense.numberOfDays,
      tags: expense.tags,
      budgetId: expense.budgetId,
    });
    setShowExpenseForm(true);
  };

  const getTotalExpenses = () => {
    return expenses.reduce((sum, exp) => sum + exp.amount, 0);
  };

  const getExpensesByStatus = (status: ApprovalStatus) => {
    return expenses.filter(exp => exp.approvalStatus === status);
  };

  // Category management handlers
  const handleCreateCategory = async () => {
    try {
      setError('');
      await apiService.createExpenseCategory(categoryFormData);
      setSuccessMessage('Category created successfully');
      setShowCategoryForm(false);
      resetCategoryForm();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create category');
    }
  };

  const handleUpdateCategory = async () => {
    if (!selectedCategory) return;
    try {
      setError('');
      await apiService.updateExpenseCategory(selectedCategory.id, categoryFormData);
      setSuccessMessage('Category updated successfully');
      setShowCategoryForm(false);
      resetCategoryForm();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update category');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      setError('');
      await apiService.deleteExpenseCategory(categoryId);
      setSuccessMessage('Category deleted successfully');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete category');
    }
  };

  const resetCategoryForm = () => {
    setCategoryFormData({
      name: '',
      description: '',
      icon: '',
      color: '',
      monthlyBudget: undefined,
      yearlyBudget: undefined,
      isTaxDeductible: false,
      taxCategory: '',
      displayOrder: 0,
    });
    setSelectedCategory(null);
  };

  const openCategoryEditForm = (category: ExpenseCategory) => {
    setSelectedCategory(category);
    setCategoryFormData({
      name: category.name,
      description: category.description || '',
      icon: category.icon || '',
      color: category.color || '',
      monthlyBudget: category.monthlyBudget,
      yearlyBudget: category.yearlyBudget,
      isTaxDeductible: category.isTaxDeductible,
      taxCategory: category.taxCategory || '',
      displayOrder: category.displayOrder,
    });
    setShowCategoryForm(true);
  };

  // Budget management handlers
  const handleCreateBudget = async () => {
    try {
      setError('');
      await apiService.createExpenseBudget(budgetFormData);
      setSuccessMessage('Budget created successfully');
      setShowBudgetForm(false);
      resetBudgetForm();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to create budget');
    }
  };

  const handleUpdateBudget = async () => {
    if (!selectedBudget) return;
    try {
      setError('');
      await apiService.updateExpenseBudget(selectedBudget.id, budgetFormData);
      setSuccessMessage('Budget updated successfully');
      setShowBudgetForm(false);
      resetBudgetForm();
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to update budget');
    }
  };

  const handleDeleteBudget = async (budgetId: string) => {
    if (!window.confirm('Are you sure you want to delete this budget?')) return;
    try {
      setError('');
      await apiService.deleteExpenseBudget(budgetId);
      setSuccessMessage('Budget deleted successfully');
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to delete budget');
    }
  };

  const resetBudgetForm = () => {
    setBudgetFormData({
      categoryId: '',
      budgetAmount: 0,
      periodType: 'MONTHLY',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
      notes: '',
      alertThreshold: undefined,
    });
    setSelectedBudget(null);
  };

  const openBudgetEditForm = (budget: ExpenseBudget) => {
    setSelectedBudget(budget);
    setBudgetFormData({
      categoryId: budget.categoryId,
      budgetAmount: budget.budgetAmount,
      periodType: budget.periodType as 'MONTHLY' | 'QUARTERLY' | 'YEARLY',
      startDate: budget.startDate.split('T')[0],
      endDate: budget.endDate.split('T')[0],
      notes: budget.notes || '',
      alertThreshold: budget.alertThreshold,
    });
    setShowBudgetForm(true);
  };

  // Receipt upload handler
  const handleReceiptUpload = async () => {
    if (!expenseForReceipt || !receiptFile) return;
    try {
      setUploadingReceipt(true);
      setError('');
      await apiService.uploadExpenseReceipt(expenseForReceipt.id, receiptFile);
      setSuccessMessage('Receipt uploaded successfully');
      setShowReceiptUpload(false);
      setReceiptFile(null);
      setExpenseForReceipt(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to upload receipt');
    } finally {
      setUploadingReceipt(false);
    }
  };

  // Approval workflow handlers
  const handleSubmitForApproval = async () => {
    if (!expenseForApproval) return;
    try {
      setError('');
      await apiService.submitExpenseForApproval({
        expenseId: expenseForApproval.id,
        notes: approvalNotes,
      });
      setSuccessMessage('Expense submitted for approval');
      setShowApprovalDialog(false);
      setApprovalNotes('');
      setExpenseForApproval(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to submit for approval');
    }
  };

  const handleApproveExpense = async () => {
    if (!expenseForApproval) return;
    try {
      setError('');
      const pendingApprovals = await apiService.getPendingExpenseApprovals();
      const approval = pendingApprovals.find((a: any) => a.expenseId === expenseForApproval.id);
      if (!approval) {
        setError('No pending approval found for this expense');
        return;
      }
      await apiService.approveExpense({
        approvalId: approval.id,
        notes: approvalNotes,
      });
      setSuccessMessage('Expense approved successfully');
      setShowApprovalDialog(false);
      setApprovalNotes('');
      setExpenseForApproval(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to approve expense');
    }
  };

  const handleRejectExpense = async () => {
    if (!expenseForApproval || !rejectionReason.trim()) {
      setError('Rejection reason is required');
      return;
    }
    try {
      setError('');
      const pendingApprovals = await apiService.getPendingExpenseApprovals();
      const approval = pendingApprovals.find((a: any) => a.expenseId === expenseForApproval.id);
      if (!approval) {
        setError('No pending approval found for this expense');
        return;
      }
      await apiService.rejectExpense({
        approvalId: approval.id,
        rejectionReason: rejectionReason,
        notes: approvalNotes,
      });
      setSuccessMessage('Expense rejected');
      setShowApprovalDialog(false);
      setRejectionReason('');
      setApprovalNotes('');
      setExpenseForApproval(null);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Failed to reject expense');
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Expense Management
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<BarChart />}
            onClick={() => setShowReportDialog(true)}
            sx={{ mr: 1 }}
          >
            Reports
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterList />}
            onClick={() => setFilters({ ...filters })}
            sx={{ mr: 1 }}
          >
            Filters
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => {
              resetForm();
              setShowExpenseForm(true);
            }}
          >
            Add Expense
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage('')}>
          {successMessage}
        </Alert>
      )}

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Expenses
              </Typography>
              <Typography variant="h5">
                {formatCurrency(getTotalExpenses())}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending Approval
              </Typography>
              <Typography variant="h5">
                {getExpensesByStatus(ApprovalStatus.PENDING_APPROVAL).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Approved
              </Typography>
              <Typography variant="h5">
                {getExpensesByStatus(ApprovalStatus.APPROVED).length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Categories
              </Typography>
              <Typography variant="h5">
                {categories.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Expenses" icon={<Receipt />} iconPosition="start" />
          <Tab label="Categories" icon={<Category />} iconPosition="start" />
          <Tab label="Budgets" icon={<AccountBalance />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Expenses Tab */}
      {activeTab === 0 && (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Merchant</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Receipt</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                    <TableCell><Skeleton /></TableCell>
                  </TableRow>
                ))
              ) : expenses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <Typography color="textSecondary">No expenses found</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                expenses.map((expense) => (
                  <TableRow key={expense.id}>
                    <TableCell>{new Date(expense.expenseDate).toLocaleDateString()}</TableCell>
                    <TableCell>{expense.description}</TableCell>
                    <TableCell>{expense.categoryName}</TableCell>
                    <TableCell>{formatCurrency(expense.amount)}</TableCell>
                    <TableCell>{expense.merchant || '-'}</TableCell>
                    <TableCell>
                      <Chip
                        label={expense.approvalStatus}
                        size="small"
                        color={
                          expense.approvalStatus === ApprovalStatus.APPROVED
                            ? 'success'
                            : expense.approvalStatus === ApprovalStatus.REJECTED
                            ? 'error'
                            : 'warning'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {expense.hasReceipt ? (
                        <CheckCircle color="success" />
                      ) : (
                        <AttachFile color="disabled" />
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Upload Receipt">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setExpenseForReceipt(expense);
                            setShowReceiptUpload(true);
                          }}
                        >
                          <CloudUpload />
                        </IconButton>
                      </Tooltip>
                      {expense.approvalStatus === ApprovalStatus.PENDING_APPROVAL && (
                        <>
                          <Tooltip title="Approve">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => {
                                setExpenseForApproval(expense);
                                setApprovalAction('approve');
                                setShowApprovalDialog(true);
                              }}
                            >
                              <CheckCircleIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setExpenseForApproval(expense);
                                setApprovalAction('reject');
                                setShowApprovalDialog(true);
                              }}
                            >
                              <Cancel />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                      {expense.approvalStatus === ApprovalStatus.NOT_REQUIRED && (
                        <Tooltip title="Submit for Approval">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setExpenseForApproval(expense);
                              setApprovalAction('submit');
                              setShowApprovalDialog(true);
                            }}
                          >
                            <Approval />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => openEditForm(expense)}>
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDeleteExpense(expense.id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Categories Tab */}
      {activeTab === 1 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetCategoryForm();
                setShowCategoryForm(true);
              }}
            >
              Add Category
            </Button>
          </Box>
          <Grid container spacing={2}>
            {categories.length === 0 ? (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" align="center">
                      No categories found. Create your first category to get started.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              categories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="h6">{category.name}</Typography>
                        <Box>
                          <IconButton size="small" onClick={() => openCategoryEditForm(category)}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteCategory(category.id)}>
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography color="textSecondary" variant="body2">
                        {category.description || 'No description'}
                      </Typography>
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Total: {formatCurrency(category.totalExpenses)}
                      </Typography>
                      <Typography variant="body2">
                        Expenses: {category.expenseCount}
                      </Typography>
                      {category.monthlyBudget && (
                        <Typography variant="body2" color="primary">
                          Monthly Budget: {formatCurrency(category.monthlyBudget)}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}

      {/* Budgets Tab */}
      {activeTab === 2 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetBudgetForm();
                setShowBudgetForm(true);
              }}
            >
              Add Budget
            </Button>
          </Box>
          <Grid container spacing={2}>
            {budgets.length === 0 ? (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" align="center">
                      No budgets found. Create a budget to track your spending.
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ) : (
              budgets.map((budget) => (
                <Grid item xs={12} sm={6} md={4} key={budget.id}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                        <Typography variant="h6">{budget.categoryName}</Typography>
                        <Box>
                          <IconButton size="small" onClick={() => openBudgetEditForm(budget)}>
                            <Edit />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleDeleteBudget(budget.id)}>
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                      <Typography color="textSecondary" variant="body2">
                        {budget.periodType}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        Budget: {formatCurrency(budget.budgetAmount)}
                      </Typography>
                      <Typography variant="body2">
                        Spent: {formatCurrency(budget.spentAmount)}
                      </Typography>
                      <Typography variant="body2">
                        Remaining: {formatCurrency(budget.remainingAmount)}
                      </Typography>
                      <Typography variant="body2" color={budget.isOverBudget ? 'error' : budget.isNearLimit ? 'warning.main' : 'textSecondary'}>
                        {budget.percentageUsed.toFixed(1)}% used
                      </Typography>
                      {budget.isOverBudget && (
                        <Chip label="Over Budget" color="error" size="small" sx={{ mt: 1 }} />
                      )}
                      {budget.isNearLimit && !budget.isOverBudget && (
                        <Chip label="Near Limit" color="warning" size="small" sx={{ mt: 1 }} />
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))
            )}
          </Grid>
        </Box>
      )}

      {/* Expense Form Dialog */}
      <Dialog open={showExpenseForm} onClose={() => setShowExpenseForm(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedExpense ? 'Edit Expense' : 'Create Expense'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.categoryId}
                  onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  required
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Expense Date"
                type="date"
                value={formData.expenseDate}
                onChange={(e) => setFormData({ ...formData, expenseDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Merchant"
                value={formData.merchant || ''}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowExpenseForm(false)}>Cancel</Button>
          <Button
            onClick={selectedExpense ? handleUpdateExpense : handleCreateExpense}
            variant="contained"
          >
            {selectedExpense ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Category Form Dialog */}
      <Dialog open={showCategoryForm} onClose={() => setShowCategoryForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedCategory ? 'Edit Category' : 'Create Category'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Category Name"
                value={categoryFormData.name}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={2}
                value={categoryFormData.description}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Icon"
                value={categoryFormData.icon}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, icon: e.target.value })}
                placeholder="e.g., 🍔, 🚗"
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Color"
                type="color"
                value={categoryFormData.color || '#1976d2'}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, color: e.target.value })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Monthly Budget"
                type="number"
                value={categoryFormData.monthlyBudget || ''}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, monthlyBudget: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Yearly Budget"
                type="number"
                value={categoryFormData.yearlyBudget || ''}
                onChange={(e) => setCategoryFormData({ ...categoryFormData, yearlyBudget: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCategoryForm(false)}>Cancel</Button>
          <Button
            onClick={selectedCategory ? handleUpdateCategory : handleCreateCategory}
            variant="contained"
          >
            {selectedCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Budget Form Dialog */}
      <Dialog open={showBudgetForm} onClose={() => setShowBudgetForm(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedBudget ? 'Edit Budget' : 'Create Budget'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={budgetFormData.categoryId}
                  onChange={(e) => setBudgetFormData({ ...budgetFormData, categoryId: e.target.value })}
                  required
                  disabled={!!selectedBudget}
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Budget Amount"
                type="number"
                value={budgetFormData.budgetAmount}
                onChange={(e) => setBudgetFormData({ ...budgetFormData, budgetAmount: parseFloat(e.target.value) || 0 })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Period Type</InputLabel>
                <Select
                  value={budgetFormData.periodType}
                  onChange={(e) => setBudgetFormData({ ...budgetFormData, periodType: e.target.value as 'MONTHLY' | 'QUARTERLY' | 'YEARLY' })}
                >
                  <MenuItem value="MONTHLY">Monthly</MenuItem>
                  <MenuItem value="QUARTERLY">Quarterly</MenuItem>
                  <MenuItem value="YEARLY">Yearly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={budgetFormData.startDate}
                onChange={(e) => setBudgetFormData({ ...budgetFormData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={budgetFormData.endDate}
                onChange={(e) => setBudgetFormData({ ...budgetFormData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Alert Threshold (%)"
                type="number"
                value={budgetFormData.alertThreshold || ''}
                onChange={(e) => setBudgetFormData({ ...budgetFormData, alertThreshold: e.target.value ? parseFloat(e.target.value) : undefined })}
                helperText="Alert when budget usage reaches this percentage (0-100)"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={budgetFormData.notes}
                onChange={(e) => setBudgetFormData({ ...budgetFormData, notes: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBudgetForm(false)}>Cancel</Button>
          <Button
            onClick={selectedBudget ? handleUpdateBudget : handleCreateBudget}
            variant="contained"
          >
            {selectedBudget ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Receipt Upload Dialog */}
      <Dialog open={showReceiptUpload} onClose={() => setShowReceiptUpload(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Upload Receipt</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Expense: {expenseForReceipt?.description}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Amount: {expenseForReceipt && formatCurrency(expenseForReceipt.amount)}
            </Typography>
            <Box sx={{ mt: 3 }}>
              <input
                accept="image/*,.pdf"
                style={{ display: 'none' }}
                id="receipt-upload"
                type="file"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setReceiptFile(file);
                  }
                }}
              />
              <label htmlFor="receipt-upload">
                <Button variant="outlined" component="span" startIcon={<CloudUpload />} fullWidth>
                  {receiptFile ? receiptFile.name : 'Choose File'}
                </Button>
              </label>
              {receiptFile && (
                <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                  File: {receiptFile.name} ({(receiptFile.size / 1024 / 1024).toFixed(2)} MB)
                </Typography>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReceiptUpload(false)}>Cancel</Button>
          <Button
            onClick={handleReceiptUpload}
            variant="contained"
            disabled={!receiptFile || uploadingReceipt}
          >
            {uploadingReceipt ? 'Uploading...' : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onClose={() => setShowApprovalDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {approvalAction === 'submit' && 'Submit for Approval'}
          {approvalAction === 'approve' && 'Approve Expense'}
          {approvalAction === 'reject' && 'Reject Expense'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 1 }}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Expense: {expenseForApproval?.description}
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Amount: {expenseForApproval && formatCurrency(expenseForApproval.amount)}
            </Typography>
            {approvalAction === 'reject' && (
              <TextField
                fullWidth
                label="Rejection Reason"
                required
                multiline
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                sx={{ mt: 2 }}
              />
            )}
            <TextField
              fullWidth
              label="Notes"
              multiline
              rows={3}
              value={approvalNotes}
              onChange={(e) => setApprovalNotes(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowApprovalDialog(false)}>Cancel</Button>
          <Button
            onClick={
              approvalAction === 'submit'
                ? handleSubmitForApproval
                : approvalAction === 'approve'
                ? handleApproveExpense
                : handleRejectExpense
            }
            variant="contained"
            color={approvalAction === 'reject' ? 'error' : 'primary'}
          >
            {approvalAction === 'submit' && 'Submit'}
            {approvalAction === 'approve' && 'Approve'}
            {approvalAction === 'reject' && 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Report Dialog */}
      <Dialog open={showReportDialog} onClose={() => setShowReportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Expense Report</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={reportStartDate}
                onChange={(e) => setReportStartDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={reportEndDate}
                onChange={(e) => setReportEndDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                startIcon={<BarChart />}
                onClick={async () => {
                  try {
                    setError('');
                    const report = await apiService.getExpenseReport(reportStartDate, reportEndDate);
                    // TODO: Display report data in a nice format
                    setSuccessMessage(`Report generated: ${report.totalCount} expenses, Total: ${formatCurrency(report.totalExpenses)}`);
                    setShowReportDialog(false);
                  } catch (err: any) {
                    setError(err.message || 'Failed to generate report');
                  }
                }}
                fullWidth
              >
                Generate Report
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReportDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Expenses;

