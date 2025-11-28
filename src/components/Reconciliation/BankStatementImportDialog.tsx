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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Close,
  Upload,
  Delete,
  Add,
  CloudUpload,
  PictureAsPdf,
} from '@mui/icons-material';
import { apiService } from '../../services/api';
import { BankStatementItemImport, ExtractBankStatementResponse } from '../../types/reconciliation';
import { getErrorMessage } from '../../utils/validation';
import { useCurrency } from '../../contexts/CurrencyContext';
import { BankAccount } from '../../types/bankAccount';

interface BankStatementImportDialogProps {
  open: boolean;
  onClose: () => void;
  bankAccountId?: string; // Made optional - user can select from dropdown
  onSuccess: () => void;
}

const BankStatementImportDialog: React.FC<BankStatementImportDialogProps> = ({
  open,
  onClose,
  bankAccountId: initialBankAccountId,
  onSuccess,
}) => {
  const { formatCurrency, getCurrencySymbol } = useCurrency();
  const [formData, setFormData] = useState({
    statementName: '',
    statementStartDate: '',
    statementEndDate: '',
    openingBalance: '',
    closingBalance: '',
    importFormat: 'CSV',
    importSource: '',
  });
  const [statementItems, setStatementItems] = useState<BankStatementItemImport[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const [showReview, setShowReview] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [selectedBankAccountId, setSelectedBankAccountId] = useState<string>(initialBankAccountId || '');
  const [isLoadingAccounts, setIsLoadingAccounts] = useState(false);

  // Fetch bank accounts when dialog opens
  useEffect(() => {
    if (open) {
      const fetchBankAccounts = async () => {
        setIsLoadingAccounts(true);
        try {
          const accounts = await apiService.getUserBankAccounts({ isActive: true });
          setBankAccounts(accounts);
          // Set selected account: use initial prop if provided, otherwise first account
          if (initialBankAccountId) {
            setSelectedBankAccountId(initialBankAccountId);
          } else if (accounts.length > 0) {
            setSelectedBankAccountId(accounts[0].id);
          }
        } catch (err) {
          setError(getErrorMessage(err, 'Failed to load bank accounts'));
        } finally {
          setIsLoadingAccounts(false);
        }
      };
      fetchBankAccounts();
      
      // Reset form when dialog opens
      setFormData({
        statementName: '',
        statementStartDate: '',
        statementEndDate: '',
        openingBalance: '',
        closingBalance: '',
        importFormat: 'CSV',
        importSource: '',
      });
      setStatementItems([]);
      setError('');
      setCsvFile(null);
      setPdfFile(null);
      setShowReview(false);
      setExtractedData(null);
    }
  }, [open, initialBankAccountId]);

  const handleAddItem = () => {
    setStatementItems([
      ...statementItems,
      {
        transactionDate: new Date().toISOString().split('T')[0],
        amount: 0,
        transactionType: 'DEBIT',
        description: '',
        referenceNumber: '',
        merchant: '',
        category: '',
        balanceAfterTransaction: 0,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setStatementItems(statementItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof BankStatementItemImport, value: any) => {
    const updated = [...statementItems];
    updated[index] = { ...updated[index], [field]: value };
    setStatementItems(updated);
  };

  // Helper function to parse CSV line handling quoted fields
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i++;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    // Add last field
    result.push(current.trim());
    return result;
  };

  // Parse CSV file and extract transactions
  const parseCSVFile = (file: File): Promise<BankStatementItemImport[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const lines = text.split(/\r?\n/).filter(line => line.trim());
          
          if (lines.length < 2) {
            reject(new Error('CSV file must have at least a header row and one data row'));
            return;
          }
          
          // Parse header row
          const headers = parseCSVLine(lines[0]).map(h => h.trim().toLowerCase().replace(/"/g, ''));
          
          // Find column indices (flexible matching)
          const dateIndex = headers.findIndex(h => 
            h.includes('date') || h.includes('transaction date') || h.includes('posting date')
          );
          const amountIndex = headers.findIndex(h => 
            h.includes('amount') || h.includes('transaction amount') || h.includes('value')
          );
          const typeIndex = headers.findIndex(h => 
            h.includes('type') || h.includes('transaction type') || 
            h.includes('debit/credit') || h.includes('dr/cr') || h.includes('dc')
          );
          const descriptionIndex = headers.findIndex(h => 
            h.includes('description') || h.includes('details') || 
            h.includes('memo') || h.includes('narration') || h.includes('particulars')
          );
          const referenceIndex = headers.findIndex(h => 
            h.includes('reference') || h.includes('ref') || 
            h.includes('check number') || h.includes('check no') || h.includes('transaction id')
          );
          const balanceIndex = headers.findIndex(h => 
            h.includes('balance') || h.includes('running balance') || h.includes('closing balance')
          );
          
          if (dateIndex === -1 || amountIndex === -1) {
            reject(new Error('CSV must contain "Date" and "Amount" columns. Found columns: ' + headers.join(', ')));
            return;
          }
          
          // Parse data rows
          const items: BankStatementItemImport[] = [];
          
          for (let i = 1; i < lines.length; i++) {
            const values = parseCSVLine(lines[i]);
            
            if (values.length < Math.max(dateIndex, amountIndex) + 1) {
              continue; // Skip invalid rows
            }
            
            // Parse date
            const dateStr = values[dateIndex].replace(/"/g, '').trim();
            if (!dateStr) continue;
            
            let transactionDate: Date;
            try {
              // Try direct parsing first
              transactionDate = new Date(dateStr);
              
              if (isNaN(transactionDate.getTime())) {
                // Try common date formats
                const dateFormats = [
                  /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY or M/D/YYYY
                  /(\d{4})-(\d{1,2})-(\d{1,2})/,  // YYYY-MM-DD
                  /(\d{1,2})-(\d{1,2})-(\d{4})/,  // MM-DD-YYYY or M-D-YYYY
                  /(\d{1,2})\/(\d{1,2})\/(\d{2})/, // MM/DD/YY
                ];
                
                let matched = false;
                for (const format of dateFormats) {
                  const match = dateStr.match(format);
                  if (match) {
                    if (format === dateFormats[0] || format === dateFormats[2]) {
                      // MM/DD/YYYY or MM-DD-YYYY
                      const month = match[1].padStart(2, '0');
                      const day = match[2].padStart(2, '0');
                      const year = format === dateFormats[3] ? `20${match[3]}` : match[3];
                      transactionDate = new Date(`${year}-${month}-${day}`);
                    } else if (format === dateFormats[1]) {
                      // YYYY-MM-DD
                      transactionDate = new Date(`${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`);
                    } else {
                      continue;
                    }
                    matched = true;
                    break;
                  }
                }
                
                if (!matched || isNaN(transactionDate.getTime())) {
                  continue; // Skip row if date is invalid
                }
              }
            } catch {
              continue; // Skip row if date parsing fails
            }
            
            // Parse amount
            const amountStr = values[amountIndex].replace(/"/g, '').replace(/[^0-9.-]/g, '');
            const amount = parseFloat(amountStr) || 0;
            
            if (amount === 0) {
              continue; // Skip rows with zero amount
            }
            
            // Determine transaction type
            let transactionType = 'DEBIT';
            if (typeIndex !== -1) {
              const typeStr = values[typeIndex].replace(/"/g, '').toUpperCase();
              if (typeStr.includes('CREDIT') || typeStr.includes('DEPOSIT') || 
                  typeStr.includes('INCOME') || typeStr === 'CR' || typeStr === 'C') {
                transactionType = 'CREDIT';
              } else if (typeStr.includes('DEBIT') || typeStr.includes('WITHDRAWAL') || 
                         typeStr.includes('PAYMENT') || typeStr === 'DR' || typeStr === 'D') {
                transactionType = 'DEBIT';
              }
            } else {
              // Infer from amount sign (negative = debit, positive = credit)
              // Or if amount is positive, check if it's typically a credit
              transactionType = amount < 0 ? 'DEBIT' : 'CREDIT';
            }
            
            // Get description
            const description = descriptionIndex !== -1 
              ? values[descriptionIndex].replace(/"/g, '').trim() 
              : '';
            
            // Get reference number
            const referenceNumber = referenceIndex !== -1 
              ? values[referenceIndex].replace(/"/g, '').trim() 
              : '';
            
            // Get balance after transaction
            const balanceAfterTransaction = balanceIndex !== -1 
              ? parseFloat(values[balanceIndex].replace(/"/g, '').replace(/[^0-9.-]/g, '')) || 0 
              : 0;
            
            items.push({
              transactionDate: transactionDate.toISOString().split('T')[0],
              amount: Math.abs(amount),
              transactionType,
              description: description || '',
              referenceNumber: referenceNumber || '',
              merchant: '',
              category: '',
              balanceAfterTransaction,
            });
          }
          
          if (items.length === 0) {
            reject(new Error('No valid transactions found in CSV file. Please check the format.'));
            return;
          }
          
          resolve(items);
        } catch (error) {
          reject(error instanceof Error ? error : new Error('Failed to parse CSV file'));
        }
      };
      
      reader.onerror = () => reject(new Error('Failed to read CSV file'));
      reader.readAsText(file);
    });
  };

  // Handle file upload with AI extraction
  const handleFileUploadWithAI = async (file: File, isCSV: boolean) => {
    setIsExtracting(true);
    setError('');
    
    try {
      let extracted: ExtractBankStatementResponse;
      
      // Validate bank account is selected
      if (!selectedBankAccountId) {
        setError('Please select a target bank account before uploading the file');
        setIsExtracting(false);
        return;
      }

      // Use analyze-pdf endpoint for PDF files, extract endpoint for CSV files
      if (!isCSV && file.name.toLowerCase().endsWith('.pdf')) {
        // Use AI-powered PDF analysis endpoint
        extracted = await apiService.analyzePDFWithAI(file, selectedBankAccountId);
      } else {
        // Use general extraction endpoint for CSV files
        extracted = await apiService.extractBankStatement(file, selectedBankAccountId);
      }
      
      // Populate form with extracted data
      if (extracted.statementName) {
        setFormData(prev => ({
          ...prev,
          statementName: extracted.statementName,
          statementStartDate: extracted.statementStartDate || prev.statementStartDate,
          statementEndDate: extracted.statementEndDate || prev.statementEndDate,
          openingBalance: extracted.openingBalance?.toString() || prev.openingBalance,
          closingBalance: extracted.closingBalance?.toString() || prev.closingBalance,
          importFormat: extracted.importFormat || (isCSV ? 'CSV' : 'PDF'),
          importSource: extracted.importSource || file.name,
        }));
      }
      
      // Set extracted items
      if (extracted.statementItems && extracted.statementItems.length > 0) {
        setStatementItems(extracted.statementItems);
        setExtractedData(extracted);
        setShowReview(true);
      } else {
        setError('No transactions found in the file. Please check the file format.');
      }
      
      if (isCSV) {
        setCsvFile(file);
        setPdfFile(null);
      } else {
        setPdfFile(file);
        setCsvFile(null);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to extract transactions from file. Please try manual entry.'));
      // Fallback to manual entry
      setShowReview(false);
    } finally {
      setIsExtracting(false);
    }
  };

  // Handle CSV file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setError('Please upload a CSV file (.csv extension required)');
      return;
    }
    
    // Use AI extraction instead of local parsing
    await handleFileUploadWithAI(file, true);
  };

  // Extract text from PDF file
  const extractTextFromPDF = async (file: File): Promise<string> => {
    try {
      // Dynamically import pdfjs-dist
      const pdfjsLib = await import('pdfjs-dist');
      
      // Set worker source - use local worker file from public folder
      // The worker file should be copied to public/pdf.worker.min.mjs
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        const publicUrl = process.env.PUBLIC_URL || '';
        // Use absolute path from root
        pdfjsLib.GlobalWorkerOptions.workerSrc = `${publicUrl}/pdf.worker.min.mjs`;
      }
      
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ 
        data: arrayBuffer,
        useSystemFonts: true,
        verbosity: 0 // Suppress warnings
      }).promise;
      
      let fullText = '';
      
      // Extract text from all pages
      for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        const pageText = textContent.items
          .map((item: any) => item.str)
          .join(' ');
        fullText += pageText + '\n';
      }
      
      return fullText;
    } catch (error) {
      throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Parse PDF text to extract transactions
  const parsePDFText = (text: string): BankStatementItemImport[] => {
    const items: BankStatementItemImport[] = [];
    const lines = text.split('\n').filter(line => line.trim());
    
    // Common date patterns
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/, // MM/DD/YYYY
      /(\d{4})-(\d{1,2})-(\d{1,2})/,  // YYYY-MM-DD
      /(\d{1,2})-(\d{1,2})-(\d{4})/,  // MM-DD-YYYY
      /(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/i, // DD MMM YYYY
    ];
    
    // Amount patterns (with currency symbols, commas, etc.)
    const amountPattern = /([+-]?[\d,]+\.?\d*)/g;
    
    // Month names mapping
    const monthMap: { [key: string]: string } = {
      'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
      'may': '05', 'jun': '06', 'jul': '07', 'aug': '08',
      'sep': '09', 'oct': '10', 'nov': '11', 'dec': '12'
    };
    
    // Try to find transaction rows
    // Common patterns: Date, Description, Amount or Date Amount Description
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.length < 10) continue;
      
      // Look for date in the line
      let transactionDate: Date | null = null;
      let dateMatch: RegExpMatchArray | null = null;
      
      for (const pattern of datePatterns) {
        dateMatch = line.match(pattern);
        if (dateMatch) {
          try {
            if (pattern === datePatterns[3]) {
              // DD MMM YYYY format
              const day = dateMatch[1].padStart(2, '0');
              const month = monthMap[dateMatch[2].toLowerCase()];
              const year = dateMatch[3];
              transactionDate = new Date(`${year}-${month}-${day}`);
            } else if (pattern === datePatterns[0] || pattern === datePatterns[2]) {
              // MM/DD/YYYY or MM-DD-YYYY
              const month = dateMatch[1].padStart(2, '0');
              const day = dateMatch[2].padStart(2, '0');
              const year = dateMatch[3];
              transactionDate = new Date(`${year}-${month}-${day}`);
            } else {
              // YYYY-MM-DD
              transactionDate = new Date(dateMatch[0]);
            }
            
            if (transactionDate && !isNaN(transactionDate.getTime())) {
              break;
            }
          } catch {
            continue;
          }
        }
      }
      
      if (!transactionDate || isNaN(transactionDate.getTime())) {
        continue;
      }
      
      // Extract amounts from the line
      const amounts = line.match(amountPattern);
      if (!amounts || amounts.length === 0) continue;
      
      // Try to find the main transaction amount (usually the largest or last)
      let amount = 0;
      let amountStr = '';
      
      for (const amt of amounts) {
        const cleanAmount = parseFloat(amt.replace(/,/g, ''));
        if (cleanAmount > 0 && cleanAmount < 1000000) { // Reasonable transaction amount
          if (Math.abs(cleanAmount) > Math.abs(amount)) {
            amount = cleanAmount;
            amountStr = amt;
          }
        }
      }
      
      if (amount === 0) continue;
      
      // Determine transaction type
      let transactionType: 'DEBIT' | 'CREDIT' = amount < 0 ? 'DEBIT' : 'CREDIT';
      
      // Check for keywords
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('credit') || lowerLine.includes('deposit') || 
          lowerLine.includes('income') || lowerLine.includes('payment received')) {
        transactionType = 'CREDIT';
      } else if (lowerLine.includes('debit') || lowerLine.includes('withdrawal') || 
                 lowerLine.includes('payment') || lowerLine.includes('purchase')) {
        transactionType = 'DEBIT';
      }
      
      // Extract description (everything between date and amount, or after amount)
      let description = line;
      if (dateMatch) {
        // Remove date from description
        description = description.replace(dateMatch[0], '').trim();
      }
      if (amountStr) {
        // Remove amount from description
        description = description.replace(amountStr, '').trim();
      }
      // Remove common words
      description = description
        .replace(/\b(cr|dr|debit|credit|balance|opening|closing)\b/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Extract reference number if present (usually numbers/letters at end or beginning)
      const refMatch = line.match(/\b([A-Z0-9]{6,})\b/);
      const referenceNumber = refMatch ? refMatch[1] : '';
      
      // Skip if description is too short (likely not a transaction)
      if (description.length < 3) {
        description = 'Transaction';
      }
      
      items.push({
        transactionDate: transactionDate.toISOString().split('T')[0],
        amount: Math.abs(amount),
        transactionType,
        description: description.substring(0, 500), // Limit description length
        referenceNumber: referenceNumber.substring(0, 255),
        merchant: '',
        category: '',
        balanceAfterTransaction: 0,
      });
    }
    
    // Remove duplicates (same date and amount)
    const uniqueItems = items.filter((item, index, self) =>
      index === self.findIndex((t) =>
        t.transactionDate === item.transactionDate &&
        Math.abs(t.amount - item.amount) < 0.01
      )
    );
    
    return uniqueItems;
  };

  // Handle PDF file upload
  const handlePDFUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file (.pdf extension required)');
      return;
    }
    
    // Use AI extraction instead of local parsing
    await handleFileUploadWithAI(file, false);
    
    // Reset input
    event.target.value = '';
  };

  const handleSubmit = async () => {
    setError('');
    
    // Validation
    if (!selectedBankAccountId) {
      setError('Please select a target bank account');
      return;
    }
    if (!formData.statementName.trim()) {
      setError('Statement name is required');
      return;
    }
    if (!formData.statementStartDate || !formData.statementEndDate) {
      setError('Start date and end date are required');
      return;
    }
    if (statementItems.length === 0) {
      setError('At least one statement item is required');
      return;
    }

    setIsLoading(true);
    try {
      await apiService.importBankStatement({
        bankAccountId: selectedBankAccountId,
        statementName: formData.statementName,
        statementStartDate: formData.statementStartDate,
        statementEndDate: formData.statementEndDate,
        openingBalance: parseFloat(formData.openingBalance) || 0,
        closingBalance: parseFloat(formData.closingBalance) || 0,
        importFormat: formData.importFormat,
        importSource: formData.importSource || 'manual-import',
        statementItems: statementItems.map(item => ({
          ...item,
          transactionDate: new Date(item.transactionDate).toISOString(),
          amount: parseFloat(item.amount.toString()) || 0,
          balanceAfterTransaction: parseFloat(item.balanceAfterTransaction.toString()) || 0,
        })),
      });
      onSuccess();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to import bank statement'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Import Bank Statement</Typography>
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

        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12}>
            <FormControl fullWidth required>
              <InputLabel>Target Bank Account</InputLabel>
              <Select
                value={selectedBankAccountId}
                onChange={(e) => setSelectedBankAccountId(e.target.value)}
                label="Target Bank Account"
                disabled={isLoadingAccounts}
              >
                {isLoadingAccounts ? (
                  <MenuItem disabled>
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                    Loading accounts...
                  </MenuItem>
                ) : bankAccounts.length === 0 ? (
                  <MenuItem disabled>No bank accounts available</MenuItem>
                ) : (
                  bankAccounts.map((account) => (
                    <MenuItem key={account.id} value={account.id}>
                      {account.accountName} ({account.accountType}) - {getCurrencySymbol(account.currency)}{formatCurrency(account.currentBalance)}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Statement Name"
              value={formData.statementName}
              onChange={(e) => setFormData({ ...formData, statementName: e.target.value })}
              placeholder="e.g., January 2024 Statement"
              required
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={formData.statementStartDate}
              onChange={(e) => setFormData({ ...formData, statementStartDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={formData.statementEndDate}
              onChange={(e) => setFormData({ ...formData, statementEndDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Opening Balance"
              type="number"
              value={formData.openingBalance}
              onChange={(e) => setFormData({ ...formData, openingBalance: e.target.value })}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Closing Balance"
              type="number"
              value={formData.closingBalance}
              onChange={(e) => setFormData({ ...formData, closingBalance: e.target.value })}
              required
            />
          </Grid>
        </Grid>

        {/* CSV File Upload Section */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
            Import from CSV File
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 1 }}>
            <input
              accept=".csv"
              style={{ display: 'none' }}
              id="csv-upload-input"
              type="file"
              onChange={handleFileUpload}
              disabled={isParsing}
            />
            <label htmlFor="csv-upload-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={isExtracting ? <CircularProgress size={16} /> : <CloudUpload />}
                disabled={isExtracting || isParsing}
                sx={{ textTransform: 'none' }}
              >
                {isExtracting ? 'AI Extracting...' : isParsing ? 'Parsing CSV...' : 'Upload CSV File (AI)'}
              </Button>
            </label>
            {csvFile && (
              <Chip
                label={`${csvFile.name} (${statementItems.length} transaction${statementItems.length !== 1 ? 's' : ''})`}
                onDelete={() => {
                  setCsvFile(null);
                  setPdfFile(null);
                  setStatementItems([]);
                  setFormData(prev => ({
                    ...prev,
                    importSource: '',
                  }));
                }}
                color="success"
                variant="outlined"
              />
            )}
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption" component="div">
              <strong>CSV Format Requirements:</strong>
              <ul style={{ margin: '4px 0', paddingLeft: 20, fontSize: '0.75rem' }}>
                <li>Must include <strong>Date</strong> and <strong>Amount</strong> columns</li>
                <li>Optional: Type (Debit/Credit), Description, Reference, Balance</li>
                <li>Date formats: MM/DD/YYYY, YYYY-MM-DD, or MM-DD-YYYY</li>
                <li>Amount can be positive or negative (negative = Debit, positive = Credit)</li>
              </ul>
            </Typography>
          </Alert>
        </Box>

        {/* PDF File Upload Section */}
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1, border: '1px dashed', borderColor: 'divider' }}>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
            Import from PDF File
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap', mt: 1 }}>
            <input
              accept=".pdf"
              style={{ display: 'none' }}
              id="pdf-upload-input"
              type="file"
              onChange={handlePDFUpload}
              disabled={isParsing}
            />
            <label htmlFor="pdf-upload-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={isExtracting ? <CircularProgress size={16} /> : <PictureAsPdf />}
                disabled={isExtracting || isParsing}
                sx={{ textTransform: 'none' }}
                color="error"
              >
                {isExtracting ? 'AI Extracting...' : isParsing ? 'Parsing PDF...' : 'Upload PDF File (AI)'}
              </Button>
            </label>
            {pdfFile && (
              <Chip
                label={`${pdfFile.name} (${statementItems.length} transaction${statementItems.length !== 1 ? 's' : ''})`}
                onDelete={() => {
                  setPdfFile(null);
                  setStatementItems([]);
                  setFormData(prev => ({
                    ...prev,
                    importSource: '',
                  }));
                }}
                color="error"
                variant="outlined"
              />
            )}
          </Box>
          <Alert severity="info" sx={{ mt: 2 }}>
            <Typography variant="caption" component="div">
              <strong>AI-Powered Extraction:</strong>
              <ul style={{ margin: '4px 0', paddingLeft: 20, fontSize: '0.75rem' }}>
                <li>AI automatically extracts all transactions from your statement</li>
                <li>Works with both text-based and scanned PDFs</li>
                <li>Review and edit extracted data before importing</li>
                <li>Supports all common bank statement formats</li>
                <li>Accurately identifies dates, amounts, descriptions, and transaction types</li>
              </ul>
            </Typography>
          </Alert>
        </Box>

        {showReview && extractedData && (
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="body2">
              <strong>AI Extraction Complete!</strong> Found {statementItems.length} transaction(s). 
              Please review and edit the extracted data below before importing.
            </Typography>
          </Alert>
        )}

        <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Statement Items {showReview && <Chip label="AI Extracted" color="success" size="small" sx={{ ml: 1 }} />}
          </Typography>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Add />}
            onClick={handleAddItem}
          >
            Add Item Manually
          </Button>
        </Box>

        {statementItems.length === 0 ? (
          <Alert severity="info">
            Click "Add Item" to add transaction items from your bank statement.
          </Alert>
        ) : (
          <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Date</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Amount</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Reference</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {statementItems.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <TextField
                        type="date"
                        value={item.transactionDate.split('T')[0]}
                        onChange={(e) => handleItemChange(index, 'transactionDate', e.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                        sx={{ width: 150 }}
                      />
                    </TableCell>
                    <TableCell>
                      <select
                        value={item.transactionType}
                        onChange={(e) => handleItemChange(index, 'transactionType', e.target.value)}
                        style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                      >
                        <option value="DEBIT">DEBIT</option>
                        <option value="CREDIT">CREDIT</option>
                      </select>
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={item.amount}
                        onChange={(e) => handleItemChange(index, 'amount', parseFloat(e.target.value) || 0)}
                        size="small"
                        sx={{ width: 120 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        size="small"
                        sx={{ width: 200 }}
                        placeholder="Description"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        value={item.referenceNumber || ''}
                        onChange={(e) => handleItemChange(index, 'referenceNumber', e.target.value)}
                        size="small"
                        sx={{ width: 120 }}
                        placeholder="Reference"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemoveItem(index)}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isLoading || statementItems.length === 0}
          startIcon={isLoading ? <CircularProgress size={20} /> : <Upload />}
        >
          {isLoading ? 'Importing...' : 'Import Statement'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BankStatementImportDialog;

