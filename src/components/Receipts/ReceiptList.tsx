import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Pagination,
  CircularProgress,
  Alert,
  Menu,
  MenuItem,
  Tooltip,
} from '@mui/material';
import {
  Delete,
  Link as LinkIcon,
  Search,
  FilterList,
  Image as ImageIcon,
  PictureAsPdf,
  Visibility,
  AutoAwesome,
  Refresh,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { Receipt, ReceiptSearchParams, ExpenseMatch } from '../../types/receipt';
import { useCurrency } from '../../contexts/CurrencyContext';

interface ReceiptListProps {
  onLinkToExpense?: (receipt: Receipt) => void;
  onDelete?: (receiptId: string) => void;
}

const ReceiptList: React.FC<ReceiptListProps> = ({ onLinkToExpense, onDelete }) => {
  const { formatCurrency } = useCurrency();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showMatchDialog, setShowMatchDialog] = useState(false);
  const [matchingExpenses, setMatchingExpenses] = useState<ExpenseMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [searchParams, setSearchParams] = useState<ReceiptSearchParams>({
    page: 1,
    limit: 12,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadReceipts();
  }, [searchParams]);

  const loadReceipts = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (searchParams.startDate) params.append('startDate', searchParams.startDate);
      if (searchParams.endDate) params.append('endDate', searchParams.endDate);
      if (searchParams.merchant) params.append('merchant', searchParams.merchant);
      if (searchParams.minAmount) params.append('minAmount', searchParams.minAmount.toString());
      if (searchParams.maxAmount) params.append('maxAmount', searchParams.maxAmount.toString());
      if (searchParams.isOcrProcessed !== undefined)
        params.append('isOcrProcessed', searchParams.isOcrProcessed.toString());
      if (searchParams.searchText) params.append('searchText', searchParams.searchText);
      params.append('page', (searchParams.page || 1).toString());
      params.append('limit', (searchParams.limit || 12).toString());

      const response = await apiService.get<{ success: boolean; data: Receipt[] }>(
        `/Receipts?${params.toString()}`
      );

      if (response.data.success && response.data.data) {
        setReceipts(response.data.data);
        // Calculate total pages (you might need to adjust based on your API response)
        setTotalPages(Math.ceil((response.data.data.length || 0) / (searchParams.limit || 12)));
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load receipts');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (receiptId: string) => {
    if (!window.confirm('Are you sure you want to delete this receipt?')) {
      return;
    }

    try {
      await apiService.delete(`/Receipts/${receiptId}`);
      setReceipts(receipts.filter((r) => r.id !== receiptId));
      if (onDelete) {
        onDelete(receiptId);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to delete receipt');
    }
  };

  const handleFindMatches = async (receipt: Receipt) => {
    try {
      setLoadingMatches(true);
      const response = await apiService.get<{ success: boolean; data: ExpenseMatch[] }>(
        `/Receipts/${receipt.id}/match-expenses`
      );

      if (response.data.success && response.data.data) {
        setMatchingExpenses(response.data.data);
        setSelectedReceipt(receipt);
        setShowMatchDialog(true);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to find matching expenses');
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleLinkToExpense = async (receipt: Receipt, expenseId: string) => {
    try {
      await apiService.post(`/Receipts/${receipt.id}/link-expense/${expenseId}`);
      setShowMatchDialog(false);
      if (onLinkToExpense) {
        onLinkToExpense(receipt);
      }
      loadReceipts();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to link receipt to expense');
    }
  };

  const handleSearch = () => {
    setSearchParams({ ...searchParams, searchText: searchText || undefined, page: 1 });
  };

  const handleFilterChange = (key: keyof ReceiptSearchParams, value: any) => {
    setSearchParams({ ...searchParams, [key]: value, page: 1 });
    setFilterMenuOpen(false);
  };

  const getFileIcon = (receipt: Receipt) => {
    if (receipt.fileType.includes('pdf')) {
      return <PictureAsPdf sx={{ fontSize: 40 }} />;
    }
    return <ImageIcon sx={{ fontSize: 40 }} />;
  };

  if (loading && receipts.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search receipts..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          size="small"
          sx={{ flex: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
        />
        <Button
          variant="outlined"
          startIcon={<FilterList />}
          onClick={(e) => {
            setAnchorEl(e.currentTarget);
            setFilterMenuOpen(true);
          }}
        >
          Filters
        </Button>
        <IconButton onClick={loadReceipts}>
          <Refresh />
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={filterMenuOpen}
        onClose={() => setFilterMenuOpen(false)}
      >
        <MenuItem onClick={() => handleFilterChange('isOcrProcessed', true)}>
          Processed Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('isOcrProcessed', false)}>
          Unprocessed Only
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('isOcrProcessed', undefined)}>
          All Receipts
        </MenuItem>
      </Menu>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {receipts.length === 0 ? (
        <Alert severity="info">No receipts found. Upload your first receipt to get started!</Alert>
      ) : (
        <>
          <Grid container spacing={2}>
            {receipts.map((receipt) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={receipt.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                      {receipt.thumbnailUrl ? (
                        <CardMedia
                          component="img"
                          image={receipt.thumbnailUrl}
                          alt={receipt.originalFileName || 'Receipt'}
                          sx={{ maxHeight: 150, objectFit: 'contain' }}
                        />
                      ) : (
                        <Box sx={{ color: 'text.secondary' }}>{getFileIcon(receipt)}</Box>
                      )}
                    </Box>

                    <Typography variant="subtitle2" noWrap>
                      {receipt.extractedMerchant || receipt.originalFileName || 'Receipt'}
                    </Typography>

                    {receipt.extractedAmount && (
                      <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                        {formatCurrency(receipt.extractedAmount)}
                      </Typography>
                    )}

                    {receipt.extractedDate && (
                      <Typography variant="caption" color="text.secondary">
                        {new Date(receipt.extractedDate).toLocaleDateString()}
                      </Typography>
                    )}

                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={receipt.isOcrProcessed ? 'Processed' : 'Processing'}
                        color={receipt.isOcrProcessed ? 'success' : 'warning'}
                        size="small"
                      />
                      {receipt.expenseId && (
                        <Chip label="Linked" color="info" size="small" icon={<LinkIcon />} />
                      )}
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={() => {
                            setSelectedReceipt(receipt);
                            setShowDetailsDialog(true);
                          }}
                        >
                          <Visibility />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Find Matching Expenses">
                        <IconButton
                          size="small"
                          onClick={() => handleFindMatches(receipt)}
                          disabled={!receipt.isOcrProcessed || loadingMatches}
                        >
                          <AutoAwesome />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" onClick={() => handleDelete(receipt.id)}>
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={searchParams.page || 1}
                onChange={(_, page) => setSearchParams({ ...searchParams, page })}
              />
            </Box>
          )}
        </>
      )}

      {/* Receipt Details Dialog */}
      <Dialog open={showDetailsDialog} onClose={() => setShowDetailsDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Receipt Details</DialogTitle>
        <DialogContent>
          {selectedReceipt && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Merchant: {selectedReceipt.extractedMerchant || 'N/A'}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Amount: {selectedReceipt.extractedAmount ? formatCurrency(selectedReceipt.extractedAmount) : 'N/A'}
              </Typography>
              <Typography variant="subtitle2" gutterBottom>
                Date: {selectedReceipt.extractedDate ? new Date(selectedReceipt.extractedDate).toLocaleDateString() : 'N/A'}
              </Typography>
              {selectedReceipt.extractedItems && selectedReceipt.extractedItems.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Items:
                  </Typography>
                  {selectedReceipt.extractedItems.map((item, index) => (
                    <Typography key={index} variant="body2">
                      {item.description} - {item.price ? formatCurrency(item.price) : 'N/A'}
                    </Typography>
                  ))}
                </Box>
              )}
              {selectedReceipt.ocrText && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    OCR Text:
                  </Typography>
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', maxHeight: 200, overflow: 'auto' }}>
                    {selectedReceipt.ocrText}
                  </Typography>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Matching Expenses Dialog */}
      <Dialog open={showMatchDialog} onClose={() => setShowMatchDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Matching Expenses</DialogTitle>
        <DialogContent>
          {loadingMatches ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : matchingExpenses.length === 0 ? (
            <Alert severity="info">No matching expenses found.</Alert>
          ) : (
            <Box>
              {matchingExpenses.map((match) => (
                <Card key={match.expenseId} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="subtitle1">{match.description}</Typography>
                    <Typography variant="h6" color="primary">
                      {formatCurrency(match.amount)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(match.expenseDate).toLocaleDateString()} • {match.category}
                    </Typography>
                    <Chip
                      label={`${Math.round(match.matchScore)}% Match`}
                      color="success"
                      size="small"
                      sx={{ mt: 1 }}
                    />
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                      {match.matchReason}
                    </Typography>
                    {selectedReceipt && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<LinkIcon />}
                        onClick={() => handleLinkToExpense(selectedReceipt, match.expenseId)}
                        sx={{ mt: 1 }}
                      >
                        Link Receipt
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMatchDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ReceiptList;

