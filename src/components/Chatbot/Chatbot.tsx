import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Fab,
  IconButton,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  Chip,
  Card,
  CardContent,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tooltip,
  Badge,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Grid,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Chat as ChatIcon,
  Close as CloseIcon,
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  TrendingUp,
  AccountBalance,
  Receipt,
  Savings,
  Assessment,
  Settings,
  Help,
  CheckCircle,
  Info,
  AttachMoney,
  Warning,
  TrendingDown,
  History as HistoryIcon,
  Delete as DeleteIcon,
  AutoAwesome as AutoAwesomeIcon,
  PictureAsPdf,
  AttachFile as AttachmentIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { chatbotService, Conversation } from './ChatbotService';
import { apiService } from '../../services/api';
import { BillType, BillFrequency } from '../../types/bill';
import { SavingsType } from '../../types/savings';
import { Notification, NotificationType } from '../../types/loan';

/** Trigger browser download of a PDF built from base64 (chat export). */
function downloadPdfFromBase64(base64: string, fileName: string) {
  try {
    const binary = atob(base64);
    const len = binary.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Download PDF failed', e);
  }
}

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  quickActions?: QuickAction[];
  reportData?: any;
  formType?: 'bill' | 'loan' | 'bankAccount' | 'savings' | 'list';
  listData?: any[];
  listType?: 'bills' | 'loans' | 'bankAccounts' | 'savings';
  /** Server-generated PDF (financial report) */
  pdfAttachment?: { fileName: string; base64: string };
}

interface QuickAction {
  id: string;
  label: string;
  action: string;
  icon: React.ReactNode;
  description?: string;
}

interface ReportData {
  type: 'summary' | 'chart' | 'analytics';
  title: string;
  data: any;
}

// Bill Form Component
const BillForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    billName: '',
    billType: BillType.UTILITY,
    amount: '',
    dueDate: '',
    frequency: BillFrequency.MONTHLY,
    provider: '',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount),
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Bill Name"
            value={formData.billName}
            onChange={(e) => setFormData({ ...formData, billName: e.target.value })}
            required
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Bill Type</InputLabel>
            <Select
              value={formData.billType}
              label="Bill Type"
              onChange={(e) => setFormData({ ...formData, billType: e.target.value as BillType })}
            >
              <MenuItem value={BillType.UTILITY}>Utility</MenuItem>
              <MenuItem value={BillType.INSURANCE}>Insurance</MenuItem>
              <MenuItem value={BillType.SUBSCRIPTION}>Subscription</MenuItem>
              <MenuItem value={BillType.SCHOOL_TUITION}>School Tuition</MenuItem>
              <MenuItem value={BillType.CREDIT_CARD}>Credit Card</MenuItem>
              <MenuItem value={BillType.MEDICAL}>Medical</MenuItem>
              <MenuItem value={BillType.OTHER}>Other</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            required
            size="small"
            inputProps={{ step: '0.01', min: '0' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Frequency</InputLabel>
            <Select
              value={formData.frequency}
              label="Frequency"
              onChange={(e) => setFormData({ ...formData, frequency: e.target.value as BillFrequency })}
            >
              <MenuItem value={BillFrequency.MONTHLY}>Monthly</MenuItem>
              <MenuItem value={BillFrequency.QUARTERLY}>Quarterly</MenuItem>
              <MenuItem value={BillFrequency.YEARLY}>Yearly</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Provider (Optional)"
            value={formData.provider}
            onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes (Optional)"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            multiline
            rows={2}
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" fullWidth>
            Add Bill
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

// Loan Form Component
const LoanForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    purpose: '',
    principal: '',
    interestRate: '',
    interestRatePeriod: 'ANNUAL' as 'ANNUAL' | 'MONTHLY',
    term: '',
    monthlyIncome: '',
    employmentStatus: '',
    additionalInfo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const inputInterestRate = parseFloat(formData.interestRate);
    const annualInterestRate =
      formData.interestRatePeriod === 'MONTHLY' ? inputInterestRate * 12 : inputInterestRate;
    onSubmit({
      purpose: formData.purpose,
      principal: parseFloat(formData.principal),
      interestRate: annualInterestRate,
      term: parseInt(formData.term),
      monthlyIncome: parseFloat(formData.monthlyIncome),
      employmentStatus: formData.employmentStatus,
      additionalInfo: formData.additionalInfo,
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Loan Purpose"
            value={formData.purpose}
            onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
            required
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Principal Amount"
            type="number"
            value={formData.principal}
            onChange={(e) => setFormData({ ...formData, principal: e.target.value })}
            required
            size="small"
            inputProps={{ step: '0.01', min: '0' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Interest Rate Type</InputLabel>
            <Select
              value={formData.interestRatePeriod}
              label="Interest Rate Type"
              onChange={(e) =>
                setFormData({ ...formData, interestRatePeriod: e.target.value as 'ANNUAL' | 'MONTHLY' })
              }
            >
              <MenuItem value="ANNUAL">Annual</MenuItem>
              <MenuItem value="MONTHLY">Monthly</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label={`Interest Rate (%) per ${formData.interestRatePeriod === 'MONTHLY' ? 'month' : 'year'}`}
            type="number"
            value={formData.interestRate}
            onChange={(e) => setFormData({ ...formData, interestRate: e.target.value })}
            required
            size="small"
            inputProps={{ step: '0.01', min: '0' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Term (months)"
            type="number"
            value={formData.term}
            onChange={(e) => setFormData({ ...formData, term: e.target.value })}
            required
            size="small"
            inputProps={{ min: '1' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Monthly Income"
            type="number"
            value={formData.monthlyIncome}
            onChange={(e) => setFormData({ ...formData, monthlyIncome: e.target.value })}
            required
            size="small"
            inputProps={{ step: '0.01', min: '0' }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Employment Status"
            value={formData.employmentStatus}
            onChange={(e) => setFormData({ ...formData, employmentStatus: e.target.value })}
            required
            size="small"
            placeholder="e.g., Employed, Self-Employed, Student"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Additional Info (Optional)"
            value={formData.additionalInfo}
            onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
            multiline
            rows={2}
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" fullWidth>
            Submit Loan Application
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

// Bank Account Form Component
const BankAccountForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    accountName: '',
    accountType: 'checking',
    initialBalance: '',
    currency: 'USD',
    financialInstitution: '',
    accountNumber: '',
    syncFrequency: 'MANUAL',
    description: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      initialBalance: parseFloat(formData.initialBalance),
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Account Name"
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
            required
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Account Type</InputLabel>
            <Select
              value={formData.accountType}
              label="Account Type"
              onChange={(e) => setFormData({ ...formData, accountType: e.target.value })}
            >
              <MenuItem value="checking">Checking</MenuItem>
              <MenuItem value="savings">Savings</MenuItem>
              <MenuItem value="credit_card">Credit Card</MenuItem>
              <MenuItem value="investment">Investment</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Initial Balance"
            type="number"
            value={formData.initialBalance}
            onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
            required
            size="small"
            inputProps={{ step: '0.01' }}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Currency"
            value={formData.currency}
            onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
            required
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Financial Institution"
            value={formData.financialInstitution}
            onChange={(e) => setFormData({ ...formData, financialInstitution: e.target.value })}
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Account Number (Optional)"
            value={formData.accountNumber}
            onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Description (Optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={2}
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" fullWidth>
            Add Bank Account
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

// Savings Form Component
const SavingsForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    accountName: '',
    savingsType: SavingsType.GENERAL,
    targetAmount: '',
    targetDate: '',
    description: '',
    goal: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      targetAmount: parseFloat(formData.targetAmount),
    });
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Savings Goal Name"
            value={formData.accountName}
            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
            required
            size="small"
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Savings Type</InputLabel>
            <Select
              value={formData.savingsType}
              label="Savings Type"
              onChange={(e) => setFormData({ ...formData, savingsType: e.target.value as SavingsType })}
            >
              <MenuItem value={SavingsType.EMERGENCY}>Emergency Fund</MenuItem>
              <MenuItem value={SavingsType.VACATION}>Vacation</MenuItem>
              <MenuItem value={SavingsType.RETIREMENT}>Retirement</MenuItem>
              <MenuItem value={SavingsType.EDUCATION}>Education</MenuItem>
              <MenuItem value={SavingsType.HOME_DOWN_PAYMENT}>Home Down Payment</MenuItem>
              <MenuItem value={SavingsType.CAR_PURCHASE}>Car Purchase</MenuItem>
              <MenuItem value={SavingsType.WEDDING}>Wedding</MenuItem>
              <MenuItem value={SavingsType.GENERAL}>General</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Target Amount"
            type="number"
            value={formData.targetAmount}
            onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
            required
            size="small"
            inputProps={{ step: '0.01', min: '0' }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Target Date"
            type="date"
            value={formData.targetDate}
            onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
            required
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Goal Description"
            value={formData.goal}
            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
            size="small"
            placeholder="e.g., Save for dream vacation to Europe"
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Additional Notes (Optional)"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
            rows={2}
            size="small"
          />
        </Grid>
        <Grid item xs={12}>
          <Button type="submit" variant="contained" fullWidth>
            Create Savings Goal
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showConversations, setShowConversations] = useState(false);
  const [tokensUsed, setTokensUsed] = useState<number>(0);
  const [pendingNotificationContext, setPendingNotificationContext] = useState<Notification | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastUserMessageRef = useRef<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [bankAccountsForUpload, setBankAccountsForUpload] = useState<any[]>([]);
  const [uploadBankAccountId, setUploadBankAccountId] = useState<string>('');
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  // Listen for notification click: open chat and show assist message with "Guide me" / "Do it for me"
  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<{ notification: Notification }>;
      const notification = customEvent.detail?.notification;
      if (!notification) return;
      setPendingNotificationContext(notification);
      setIsOpen(true);
      const notifType = (notification.type as string) || '';
      let assistContent = notification.message || notification.title || 'You have a notification that may need your attention.';
      let guidePrompt = '';
      if (notifType === NotificationType.DATA_IMBALANCE) {
        assistContent = `${notification.message}\n\nI can guide you step-by-step to reconcile this on the Bank Accounts page, or I can try to help fix it for you.`;
        guidePrompt = 'How do I reconcile my account balance with my transactions?';
      } else if (notifType === NotificationType.MISLEADING_DATA) {
        assistContent = `${notification.message}\n\nI can explain how to categorize your transactions, or I can suggest categories and help you apply them.`;
        guidePrompt = 'How do I categorize my uncategorized transactions?';
      } else if (notifType === NotificationType.LOW_BALANCE) {
        assistContent = `${notification.message}\n\nI can guide you to review the account and suggest next steps, or help you understand your options.`;
        guidePrompt = 'What should I do about a negative account balance?';
      }
      const assistMessage: Message = {
        id: `notif-assist-${notification.id}-${Date.now()}`,
        type: 'bot',
        content: assistContent,
        timestamp: new Date(),
        quickActions: [
          {
            id: 'notification_guide',
            label: 'Guide me',
            action: 'notification_guide',
            icon: <Help />,
            description: 'Step-by-step instructions'
          },
          {
            id: 'notification_ai_fix',
            label: 'Do it for me',
            action: 'notification_ai_fix',
            icon: <AutoAwesomeIcon />,
            description: 'Let AI assist or perform the action'
          }
        ]
      };
      setMessages(prev => [...prev, assistMessage]);
    };
    window.addEventListener('openChatWithNotification', handler);
    return () => window.removeEventListener('openChatWithNotification', handler);
  }, []);

  // Scroll to bottom when new messages are added
  useEffect(() => {
    if (messages && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load financial summary and conversations when chatbot opens
  useEffect(() => {
    if (isOpen && isAuthenticated) {
      if (!financialSummary) {
        loadFinancialSummary();
      }
      loadConversations();
      if (!bankAccountsForUpload || bankAccountsForUpload.length === 0) {
        loadBankAccountsForUpload();
      }
    }
  }, [isOpen, isAuthenticated, financialSummary, bankAccountsForUpload]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'bot',
        content: `Hello${user ? ` ${user.name}` : ''}! 👋 I'm your **AI-powered UtilityHub360 assistant**. I use your financial context (when you chat) to give personalized, accurate answers about bills, budgets, loans, savings, bank accounts, and how to use the app.\n\nWhat would you like to do today?`,
        timestamp: new Date(),
        quickActions: [
          {
            id: 'manage_bills',
            label: 'Manage Bills',
            action: 'bills_guide',
            icon: <Receipt />,
            description: 'Add and view your bills'
          },
          {
            id: 'manage_loans',
            label: 'Manage Loans',
            action: 'loans_guide',
            icon: <AccountBalance />,
            description: 'Apply for and view loans'
          },
          {
            id: 'manage_bank',
            label: 'Bank Accounts',
            action: 'bank_guide',
            icon: <AccountBalance />,
            description: 'Add and view bank accounts'
          },
          {
            id: 'manage_savings',
            label: 'Savings Goals',
            action: 'savings_guide',
            icon: <Savings />,
            description: 'Create and track savings'
          },
          {
            id: 'reports',
            label: 'View Reports',
            action: 'show_reports',
            icon: <Assessment />,
            description: 'See your financial insights'
          },
          {
            id: 'download_pdf_report',
            label: 'Download PDF report',
            action: 'chat_download_pdf',
            icon: <PictureAsPdf />,
            description: 'Export financial summary as PDF'
          }
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user, messages]);

  const loadFinancialSummary = async () => {
    try {
      const summary = await chatbotService.getFinancialSummary();
      setFinancialSummary(summary);
    } catch (error) {
      console.error('Error loading financial summary:', error);
    }
  };

  const loadConversations = async () => {
    try {
      const convos = await chatbotService.getConversations();
      setConversations(convos || []); // Ensure conversations is always an array
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]); // Ensure conversations is always an array
    }
  };

  const loadBankAccountsForUpload = async () => {
    try {
      const accounts = await apiService.getUserBankAccounts();
      const safeAccounts = accounts || [];
      setBankAccountsForUpload(safeAccounts);
      if (!uploadBankAccountId && safeAccounts.length > 0) {
        setUploadBankAccountId(safeAccounts[0].id);
      }
    } catch (error) {
      console.error('Error loading bank accounts for upload:', error);
      setBankAccountsForUpload([]);
      setUploadBankAccountId('');
    }
  };

  const loadConversationMessages = async (conversationId: string) => {
    try {
      const messages = await chatbotService.getConversationMessages(conversationId);
      const formattedMessages: Message[] = messages ? messages.map(msg => ({
        id: msg.id,
        type: msg.type === 'assistant' ? 'bot' : 'user',
        content: msg.content,
        timestamp: new Date(msg.timestamp)
      })) : [];
      setMessages(formattedMessages);
      chatbotService.setCurrentConversation(conversationId);
    } catch (error) {
      console.error('Error loading conversation messages:', error);
      setMessages([]); // Ensure messages is always an array
    }
  };

  const deleteConversation = async (conversationId: string) => {
    try {
      const success = await chatbotService.deleteConversation(conversationId);
      if (success) {
        setConversations(prev => (prev || []).filter(conv => conv.id !== conversationId));
        if (chatbotService.getCurrentConversationId() === conversationId) {
          setMessages([]);
          chatbotService.setCurrentConversation(null);
        }
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  };


  const handleSendMessage = async (content: string) => {
    if (!content.trim()) return;

    lastUserMessageRef.current = content.trim();

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const aiResponse = await chatbotService.sendAIMessage(
        content.trim(),
        true,
        user?.id || 'current-user'
      );

      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: aiResponse.message,
        timestamp: new Date(),
        pdfAttachment: aiResponse.pdfAttachment,
        quickActions: aiResponse.quickActions?.map(action => ({
          ...action,
          icon: getIconComponent(action.icon)
        }))
      };

      if (aiResponse.tokensUsed) {
        setTokensUsed(prev => prev + aiResponse.tokensUsed!);
      }

      setMessages(prev => [...prev, botResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
        quickActions: [
          {
            id: 'retry',
            label: 'Try Again',
            action: 'retry',
            icon: <Help />,
            description: 'Retry your request'
          }
        ]
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const handleChatFilePicked = async (file: File | null) => {
    if (!file) return;

    // Only allow bank statement uploads for reconciliation (current chat upload scope)
    const lowerName = file.name.toLowerCase();
    const isPdf = lowerName.endsWith('.pdf') || file.type === 'application/pdf';
    const isCsv =
      lowerName.endsWith('.csv') || file.type === 'text/csv' || file.type === 'application/vnd.ms-excel';

    if (!isPdf && !isCsv) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'bot',
          content: 'Please upload a bank statement in PDF or CSV format.',
          timestamp: new Date(),
          quickActions: [
            {
              id: 'retry_upload',
              label: 'Upload another file',
              action: 'retry_upload',
              icon: <AttachmentIcon />,
              description: 'Choose another PDF/CSV'
            }
          ]
        }
      ]);
      return;
    }

    if (!uploadBankAccountId) {
      await showBankAccountsList();
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: 'I couldn’t find a bank account to attach this statement to. Please open Bank Accounts and select an account for reconciliation, or add a bank account first.',
          timestamp: new Date()
        }
      ]);
      return;
    }

    setIsTyping(true);
    setIsUploadingFile(true);
    try {
      const upload = await apiService.uploadBankStatementAsync(file, uploadBankAccountId);

      // Poll until extraction is done
      let status: string | undefined = upload?.status;
      const uploadId = upload?.id;

      if (!uploadId) throw new Error('Upload id missing');

      const timeoutMs = 2 * 60 * 1000; // 2 minutes
      const startedAt = Date.now();

      while (Date.now() - startedAt < timeoutMs) {
        const current = await apiService.getUploadStatus(uploadId);
        status = current?.status;

        if (status === 'DONE' || status === 'COMPLETED') break;
        if (status === 'FAILED') break;
        await sleep(2000);
      }

      const doneOrFailed = status === 'DONE' || status === 'COMPLETED';
      const failed = status === 'FAILED';

      if (doneOrFailed) {
        const fileLabel = file.name;
        const doneMessage: Message = {
          id: (Date.now() + 2).toString(),
          type: 'bot',
          content: `I uploaded and extracted your bank statement (${fileLabel}). Please review and confirm the extracted transactions in Reconciliation.`,
          timestamp: new Date(),
          quickActions: [
            {
              id: 'open_reconciliation',
              label: 'Open Reconciliation',
              action: 'open_reconciliation',
              icon: <AccountBalance />,
              description: 'Review and finalize'
            }
          ]
        };
        setMessages(prev => [...prev, doneMessage]);
      } else if (failed) {
        const errorMessage: Message = {
          id: (Date.now() + 3).toString(),
          type: 'bot',
          content: 'Upload/extraction failed. Please try again with a different file format (PDF/CSV) or re-export the statement.',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
      } else {
        const pendingMessage: Message = {
          id: (Date.now() + 4).toString(),
          type: 'bot',
          content: 'This is taking longer than expected. You can try again in a moment, or open Reconciliation to check uploads.',
          timestamp: new Date(),
          quickActions: [
            {
              id: 'open_reconciliation',
              label: 'Open Reconciliation',
              action: 'open_reconciliation',
              icon: <AccountBalance />,
              description: 'Check uploads'
            }
          ]
        };
        setMessages(prev => [...prev, pendingMessage]);
      }
    } catch (error) {
      console.error('Chat file upload error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 5).toString(),
          type: 'bot',
          content: 'Sorry, I couldn’t upload that file. Please try again.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsUploadingFile(false);
      setIsTyping(false);

      // Reset input so the same file can be picked again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: React.ReactNode } = {
      'Settings': <Settings />,
      'Person': <PersonIcon />,
      'Receipt': <Receipt />,
      'Assessment': <Assessment />,
      'TrendingUp': <TrendingUp />,
      'Help': <Help />,
      'Info': <Info />,
      'CheckCircle': <CheckCircle />,
      'AccountBalance': <AccountBalance />,
      'Savings': <Savings />,
      'AttachMoney': <AttachMoney />,
      'Warning': <Warning />,
      'TrendingDown': <TrendingDown />
    };
    return iconMap[iconName] || <Help />;
  };

  const handleQuickAction = async (action: QuickAction) => {
    switch (action.action) {
      case 'retry':
        if (lastUserMessageRef.current) {
          handleSendMessage(lastUserMessageRef.current);
        }
        break;
      case 'chat_download_pdf':
        handleSendMessage('Download my financial report as a PDF');
        break;
      case 'open_reconciliation':
        navigate('/reconciliation', { state: { accountId: uploadBankAccountId } });
        setIsOpen(false);
        break;
      case 'navigate':
        navigate(`/${action.id}`);
        setIsOpen(false);
        break;
      case 'setup_guide':
        handleSendMessage('I need help setting up my account');
        break;
      case 'bills_guide':
        handleSendMessage('I need help managing my bills');
        break;
      case 'loans_guide':
        handleSendMessage('I need help managing my loans');
        break;
      case 'bank_guide':
        handleSendMessage('I need help managing my bank accounts');
        break;
      case 'savings_guide':
        handleSendMessage('I need help managing my savings');
        break;
      case 'show_reports':
        handleSendMessage('Show me my reports and analytics');
        break;
      case 'help_guide':
        handleSendMessage('I need help using the app');
        break;
      case 'show_bill_reports':
        handleSendMessage('Show me bill analytics and reports');
        break;
      case 'show_monthly_report':
        handleSendMessage('Generate my monthly financial report');
        break;
      case 'getting_started_guide':
        handleSendMessage('Help me get started with the app');
        break;
      case 'features_guide':
        handleSendMessage('Tell me about all the app features');
        break;
      case 'tips_guide':
        handleSendMessage('Give me tips and tricks for using the app');
        break;
      
      // Form actions
      case 'show_add_bill_form':
        showAddBillForm();
        break;
      case 'show_bills_list':
        await showBillsList();
        break;
      case 'show_add_loan_form':
        showAddLoanForm();
        break;
      case 'show_loans_list':
        await showLoansList();
        break;
      case 'show_add_bank_account_form':
        showAddBankAccountForm();
        break;
      case 'show_bank_accounts_list':
        await showBankAccountsList();
        break;
      case 'show_add_savings_form':
        showAddSavingsForm();
        break;
      case 'show_savings_list':
        await showSavingsList();
        break;

      // Notification assist: Guide me / Do it for me (from APP_UTILS notification click)
      case 'notification_guide':
        if (pendingNotificationContext) {
          const notifType = pendingNotificationContext.type as string;
          let guideContent = '';
          if (notifType === NotificationType.DATA_IMBALANCE) {
            guideContent = '**Reconciling your account balance:**\n\n1. Go to Bank Accounts and open the account with the mismatch.\n2. Compare "Current balance" with the sum of your transactions (Credits − Debits).\n3. Use Reconciliation (if available) to match statements, or add an adjustment transaction if you’ve confirmed the correct balance.\n4. Save and re-run the analysis to clear the alert.';
          } else if (notifType === NotificationType.MISLEADING_DATA) {
            guideContent = '**Categorizing transactions:**\n\n1. Open the Transactions page (you’re already there).\n2. Filter or look for uncategorized items (no category set).\n3. Click a transaction and choose a category, or use bulk actions to assign categories to multiple transactions.\n4. Categorizing improves your reports and AI suggestions.';
          } else if (notifType === NotificationType.LOW_BALANCE) {
            guideContent = '**Handling a negative balance:**\n\n1. Open Bank Accounts and check the account with the negative balance.\n2. Review recent transactions for errors or missing credits.\n3. Add a correction transaction if needed, or transfer funds from another account.\n4. Once the balance is updated, the alert will clear on the next analysis.';
          } else {
            guideContent = pendingNotificationContext.message || 'Check the notification details and the related page for steps.';
          }
          const guideMsg: Message = {
            id: `guide-${Date.now()}`,
            type: 'bot',
            content: guideContent,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, guideMsg]);
          setPendingNotificationContext(null);
        }
        break;
      case 'notification_ai_fix':
        if (pendingNotificationContext) {
          const notifType = pendingNotificationContext.type as string;
          let aiPrompt = '';
          if (notifType === NotificationType.MISLEADING_DATA) {
            aiPrompt = 'I have uncategorized transactions. Please help me categorize them: suggest categories for my uncategorized transactions or guide me to use bulk categorize.';
          } else if (notifType === NotificationType.DATA_IMBALANCE) {
            aiPrompt = 'I have a balance mismatch between my stored account balance and the sum of transactions. Please guide me to reconcile this or suggest how to fix it.';
          } else if (notifType === NotificationType.LOW_BALANCE) {
            aiPrompt = 'One of my accounts has a negative balance. Please help me understand what to do and suggest next steps or corrections.';
          } else {
            aiPrompt = pendingNotificationContext.message || 'Help me address this notification.';
          }
          setPendingNotificationContext(null);
          handleSendMessage(aiPrompt);
        }
        break;
      
      default:
        handleSendMessage(action.label);
    }
  };

  // Form display functions
  const showAddBillForm = () => {
    const formMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: 'Please fill out the form below to add a new bill:',
      timestamp: new Date(),
      formType: 'bill'
    };
    setMessages(prev => [...prev, formMessage]);
  };

  const showBillsList = async () => {
    setIsTyping(true);
    try {
      const response = await apiService.getUserBills();
      const listMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `You have ${response.data?.length || 0} bill(s):`,
        timestamp: new Date(),
        formType: 'list',
        listType: 'bills',
        listData: response.data || []
      };
      setMessages(prev => [...prev, listMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Sorry, I couldn\'t load your bills. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const showAddLoanForm = () => {
    const formMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: 'Please fill out the form below to apply for a loan:',
      timestamp: new Date(),
      formType: 'loan'
    };
    setMessages(prev => [...prev, formMessage]);
  };

  const showLoansList = async () => {
    setIsTyping(true);
    try {
      const loans = await apiService.getUserLoans(user?.id || '');
      const listMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `You have ${loans?.length || 0} loan(s):`,
        timestamp: new Date(),
        formType: 'list',
        listType: 'loans',
        listData: loans || []
      };
      setMessages(prev => [...prev, listMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Sorry, I couldn\'t load your loans. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const showAddBankAccountForm = () => {
    const formMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: 'Please fill out the form below to add a new bank account:',
      timestamp: new Date(),
      formType: 'bankAccount'
    };
    setMessages(prev => [...prev, formMessage]);
  };

  const showBankAccountsList = async () => {
    setIsTyping(true);
    try {
      const accounts = await apiService.getUserBankAccounts();
      const listMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `You have ${accounts?.length || 0} bank account(s):`,
        timestamp: new Date(),
        formType: 'list',
        listType: 'bankAccounts',
        listData: accounts || []
      };
      setMessages(prev => [...prev, listMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Sorry, I couldn\'t load your bank accounts. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const showAddSavingsForm = () => {
    const formMessage: Message = {
      id: Date.now().toString(),
      type: 'bot',
      content: 'Please fill out the form below to create a new savings goal:',
      timestamp: new Date(),
      formType: 'savings'
    };
    setMessages(prev => [...prev, formMessage]);
  };

  const showSavingsList = async () => {
    setIsTyping(true);
    try {
      const savingsAccounts = await apiService.getSavingsAccounts();
      const listMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `You have ${savingsAccounts?.length || 0} savings goal(s):`,
        timestamp: new Date(),
        formType: 'list',
        listType: 'savings',
        listData: savingsAccounts || []
      };
      setMessages(prev => [...prev, listMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: 'Sorry, I couldn\'t load your savings goals. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const formatMessageContent = (content: string) => {
    // Split content by double newlines to get paragraphs
    const paragraphs = content.split(/\n\n+/);
    
    return paragraphs.map((paragraph, pIndex) => {
      // Check if it's a numbered list
      const numberedListMatch = paragraph.match(/^\d+\.\s/);
      if (numberedListMatch || paragraph.includes('\n1. ') || paragraph.includes('\n2. ')) {
        const items = paragraph.split(/\n(?=\d+\.\s)/).filter(item => item.trim());
        return (
          <Box key={pIndex} component="ol" sx={{ pl: 3, my: 1 }}>
            {items.map((item, iIndex) => {
              const cleanedItem = item.replace(/^\d+\.\s*/, '');
              return (
                <li key={iIndex} style={{ marginBottom: '8px' }}>
                  <Typography variant="body1" component="span">
                    {formatInlineText(cleanedItem)}
                  </Typography>
                </li>
              );
            })}
          </Box>
        );
      }
      
      // Check if it's a bullet list
      const bulletListMatch = paragraph.match(/^[-*•]\s/);
      if (bulletListMatch || paragraph.includes('\n- ') || paragraph.includes('\n* ') || paragraph.includes('\n• ')) {
        const items = paragraph.split(/\n(?=[-*•]\s)/).filter(item => item.trim());
        return (
          <Box key={pIndex} component="ul" sx={{ pl: 3, my: 1 }}>
            {items.map((item, iIndex) => {
              const cleanedItem = item.replace(/^[-*•]\s*/, '');
              return (
                <li key={iIndex} style={{ marginBottom: '8px' }}>
                  <Typography variant="body1" component="span">
                    {formatInlineText(cleanedItem)}
                  </Typography>
                </li>
              );
            })}
          </Box>
        );
      }
      
      // Regular paragraph
      return (
        <Typography key={pIndex} variant="body1" sx={{ mb: 1.5 }}>
          {formatInlineText(paragraph)}
        </Typography>
      );
    });
  };

  const formatInlineText = (text: string) => {
    // Handle bold text with **text** or __text__
    const boldRegex = /(\*\*|__)(.*?)\1/g;
    // Handle italic text with *text* or _text_
    const italicRegex = /(\*|_)(.*?)\1/g;
    // Handle inline code with `code`
    const codeRegex = /`([^`]+)`/g;
    
    // Process bold text
    const processedText = text.replace(boldRegex, (match, delim, content) => {
      return `<BOLD>${content}</BOLD>`;
    });
    
    // Process italic text (but not if it's part of bold)
    const processedText2 = processedText.replace(/(?<!<BOLD>)(\*|_)([^*_]+)\1(?!<\/BOLD>)/g, (match, delim, content) => {
      return `<ITALIC>${content}</ITALIC>`;
    });
    
    // Process code
    const processedText3 = processedText2.replace(codeRegex, (match, content) => {
      return `<CODE>${content}</CODE>`;
    });
    
    // Split by custom tags and render
    const segments = processedText3.split(/(<BOLD>|<\/BOLD>|<ITALIC>|<\/ITALIC>|<CODE>|<\/CODE>)/);
    let isBold = false;
    let isItalic = false;
    let isCode = false;
    
    return segments.map((segment, index) => {
      if (segment === '<BOLD>') {
        isBold = true;
        return null;
      }
      if (segment === '</BOLD>') {
        isBold = false;
        return null;
      }
      if (segment === '<ITALIC>') {
        isItalic = true;
        return null;
      }
      if (segment === '</ITALIC>') {
        isItalic = false;
        return null;
      }
      if (segment === '<CODE>') {
        isCode = true;
        return null;
      }
      if (segment === '</CODE>') {
        isCode = false;
        return null;
      }
      
      if (segment) {
        if (isCode) {
          return (
            <Box
              key={index}
              component="code"
              sx={{
                bgcolor: 'grey.200',
                px: 0.5,
                py: 0.25,
                borderRadius: 0.5,
                fontFamily: 'monospace',
                fontSize: '0.9em',
              }}
            >
              {segment}
            </Box>
          );
        }
        if (isBold) {
          return <strong key={index}>{segment}</strong>;
        }
        if (isItalic) {
          return <em key={index}>{segment}</em>;
        }
        return segment;
      }
      return null;
    });
  };

  const renderReportData = (reportData: ReportData) => {
    // Add null check for reportData.data
    if (!reportData.data) {
      return (
        <Card sx={{ mt: 2, mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 {reportData.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No data available at the moment. Please try again later.
            </Typography>
          </CardContent>
        </Card>
      );
    }

    if (reportData.type === 'summary') {
      return (
        <Card sx={{ mt: 2, mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📊 {reportData.title}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Bills</Typography>
                <Typography variant="h6">{reportData.data.totalBills || 0}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Amount</Typography>
                <Typography variant="h6">${(reportData.data.totalAmount || 0).toFixed(2)}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Paid This Month</Typography>
                <Typography variant="h6">{reportData.data.paidThisMonth || 0}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Savings Rate</Typography>
                <Typography variant="h6">{(reportData.data.savingsRate || 0).toFixed(1)}%</Typography>
              </Box>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={reportData.data.savingsRate || 0} 
              sx={{ mt: 2 }}
            />
          </CardContent>
        </Card>
      );
    }

    if (reportData.type === 'analytics') {
      const data = reportData.data;
      return (
        <Card sx={{ mt: 2, mb: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📈 {reportData.title}
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mb: 2 }}>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Bills</Typography>
                <Typography variant="h6">{data.totalBills || 0}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Pending</Typography>
                <Typography variant="h6" color="warning.main">${(data.totalPending || 0).toFixed(2)}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Total Paid</Typography>
                <Typography variant="h6" color="success.main">${(data.totalPaid || 0).toFixed(2)}</Typography>
              </Box>
              <Box>
                <Typography variant="body2" color="text.secondary">Overdue</Typography>
                <Typography variant="h6" color="error.main">${(data.overdue || 0).toFixed(2)}</Typography>
              </Box>
            </Box>
            
            {data.categories && Object.keys(data.categories).length > 0 && (
              <Box>
                <Typography variant="subtitle2" gutterBottom>Bill Categories:</Typography>
                {Object.entries(data.categories).map(([category, info]: [string, any]) => (
                  <Box key={category} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{category}</Typography>
                    <Typography variant="body2">
                      {info.count} bills - ${info.total.toFixed(2)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>
      );
    }

    return null;
  };

  // Form submission handlers
  const handleBillFormSubmit = async (formData: any) => {
    setIsTyping(true);
    try {
      await apiService.createBill(formData);
      const successMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `✅ Bill "${formData.billName}" has been added successfully!`,
        timestamp: new Date(),
        quickActions: [
          {
            id: 'view_bills',
            label: 'View All Bills',
            action: 'show_bills_list',
            icon: <Assessment />,
            description: 'See all your bills'
          },
          {
            id: 'add_another',
            label: 'Add Another Bill',
            action: 'show_add_bill_form',
            icon: <Receipt />,
            description: 'Add another bill'
          }
        ]
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `❌ Failed to add bill: ${error.message || 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLoanFormSubmit = async (formData: any) => {
    setIsTyping(true);
    try {
      await apiService.applyForLoan(formData);
      const successMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `✅ Loan application for "${formData.purpose}" has been submitted successfully!`,
        timestamp: new Date(),
        quickActions: [
          {
            id: 'view_loans',
            label: 'View All Loans',
            action: 'show_loans_list',
            icon: <AccountBalance />,
            description: 'See all your loans'
          }
        ]
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `❌ Failed to submit loan application: ${error.message || 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleBankAccountFormSubmit = async (formData: any) => {
    setIsTyping(true);
    try {
      await apiService.createBankAccount(formData);
      const successMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `✅ Bank account "${formData.accountName}" has been added successfully!`,
        timestamp: new Date(),
        quickActions: [
          {
            id: 'view_accounts',
            label: 'View All Accounts',
            action: 'show_bank_accounts_list',
            icon: <AccountBalance />,
            description: 'See all your bank accounts'
          },
          {
            id: 'add_another_account',
            label: 'Add Another Account',
            action: 'show_add_bank_account_form',
            icon: <AccountBalance />,
            description: 'Add another bank account'
          }
        ]
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `❌ Failed to add bank account: ${error.message || 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSavingsFormSubmit = async (formData: any) => {
    setIsTyping(true);
    try {
      await apiService.createSavingsAccount(formData);
      const successMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `✅ Savings goal "${formData.accountName}" has been created successfully!`,
        timestamp: new Date(),
        quickActions: [
          {
            id: 'view_savings',
            label: 'View All Savings',
            action: 'show_savings_list',
            icon: <Savings />,
            description: 'See all your savings goals'
          },
          {
            id: 'add_another_savings',
            label: 'Add Another Goal',
            action: 'show_add_savings_form',
            icon: <Savings />,
            description: 'Create another savings goal'
          }
        ]
      };
      setMessages(prev => [...prev, successMessage]);
    } catch (error: any) {
      const errorMessage: Message = {
        id: Date.now().toString(),
        type: 'bot',
        content: `❌ Failed to create savings goal: ${error.message || 'Unknown error'}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  // Render forms based on formType
  const renderForm = (message: Message) => {
    if (message.formType === 'bill') {
      return <BillForm onSubmit={handleBillFormSubmit} />;
    } else if (message.formType === 'loan') {
      return <LoanForm onSubmit={handleLoanFormSubmit} />;
    } else if (message.formType === 'bankAccount') {
      return <BankAccountForm onSubmit={handleBankAccountFormSubmit} />;
    } else if (message.formType === 'savings') {
      return <SavingsForm onSubmit={handleSavingsFormSubmit} />;
    } else if (message.formType === 'list') {
      return renderList(message);
    }
    return null;
  };

  // Render lists based on listType
  const renderList = (message: Message) => {
    if (!message.listData || message.listData.length === 0) {
      return (
        <Alert severity="info" sx={{ mt: 2 }}>
          No items found. Would you like to add one?
        </Alert>
      );
    }

    // Store listData in a local variable to satisfy TypeScript
    const listData = message.listData;

    if (message.listType === 'bills') {
      return (
        <List sx={{ mt: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          {listData.slice(0, 5).map((bill: any, index: number) => (
            <React.Fragment key={bill.id}>
              <ListItem>
                <ListItemText
                  primary={bill.billName}
                  secondary={`${bill.billType} • $${bill.amount} • Due: ${new Date(bill.dueDate).toLocaleDateString()}`}
                />
                <Chip 
                  label={bill.status} 
                  size="small"
                  color={bill.status === 'PAID' ? 'success' : bill.status === 'OVERDUE' ? 'error' : 'warning'}
                />
              </ListItem>
              {index < Math.min(4, listData.length - 1) && <Divider />}
            </React.Fragment>
          ))}
          {listData.length > 5 && (
            <ListItem>
              <ListItemText secondary={`... and ${listData.length - 5} more`} />
            </ListItem>
          )}
        </List>
      );
    } else if (message.listType === 'loans') {
      return (
        <List sx={{ mt: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          {listData.slice(0, 5).map((loan: any, index: number) => (
            <React.Fragment key={loan.id}>
              <ListItem>
                <ListItemText
                  primary={loan.purpose}
                  secondary={`Principal: $${loan.principal} • Monthly: $${loan.monthlyPayment} • Status: ${loan.status}`}
                />
              </ListItem>
              {index < Math.min(4, listData.length - 1) && <Divider />}
            </React.Fragment>
          ))}
          {listData.length > 5 && (
            <ListItem>
              <ListItemText secondary={`... and ${listData.length - 5} more`} />
            </ListItem>
          )}
        </List>
      );
    } else if (message.listType === 'bankAccounts') {
      return (
        <List sx={{ mt: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          {listData.slice(0, 5).map((account: any, index: number) => (
            <React.Fragment key={account.id}>
              <ListItem>
                <ListItemText
                  primary={account.accountName}
                  secondary={`${account.accountType} • Balance: $${account.currentBalance} ${account.currency}`}
                />
              </ListItem>
              {index < Math.min(4, listData.length - 1) && <Divider />}
            </React.Fragment>
          ))}
          {listData.length > 5 && (
            <ListItem>
              <ListItemText secondary={`... and ${listData.length - 5} more`} />
            </ListItem>
          )}
        </List>
      );
    } else if (message.listType === 'savings') {
      return (
        <List sx={{ mt: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
          {listData.slice(0, 5).map((savings: any, index: number) => (
            <React.Fragment key={savings.id}>
              <ListItem>
                <ListItemText
                  primary={savings.accountName}
                  secondary={`${savings.savingsType} • Current: $${savings.currentBalance} / Target: $${savings.targetAmount}`}
                />
                <Chip 
                  label={`${savings.progressPercentage?.toFixed(0) || 0}%`}
                  size="small"
                  color="primary"
                />
              </ListItem>
              {index < Math.min(4, listData.length - 1) && <Divider />}
            </React.Fragment>
          ))}
          {listData.length > 5 && (
            <ListItem>
              <ListItemText secondary={`... and ${listData.length - 5} more`} />
            </ListItem>
          )}
        </List>
      );
    }
    return null;
  };

  const renderMessage = (message: Message) => (
    <Box
      key={message.id}
      sx={{
        display: 'flex',
        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
        mb: 1.5,
        px: 0.5,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          maxWidth: '85%',
          flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
          gap: 0.5,
        }}
      >
        {message.type === 'bot' && (
          <Avatar
            sx={{
              bgcolor: '#075E54',
              width: 28,
              height: 28,
              mb: 0.5,
            }}
          >
            <BotIcon sx={{ fontSize: 16 }} />
          </Avatar>
        )}
        <Paper
          elevation={0}
          sx={{
            p: 1.5,
            px: 2,
            bgcolor: message.type === 'user' ? '#DCF8C6' : 'white',
            color: message.type === 'user' ? '#000' : 'text.primary',
            borderRadius: '12px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
          }}
        >
          {message.type === 'user' ? (
            <Typography variant="body1">{message.content}</Typography>
          ) : (
            <Box>{formatMessageContent(message.content)}</Box>
          )}
          {message.reportData && renderReportData(message.reportData)}
          {message.formType && renderForm(message)}
          {message.pdfAttachment && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                size="small"
                startIcon={<PictureAsPdf />}
                onClick={() =>
                  downloadPdfFromBase64(
                    message.pdfAttachment!.base64,
                    message.pdfAttachment!.fileName
                  )
                }
                sx={{ borderRadius: 2, textTransform: 'none', bgcolor: '#075E54', '&:hover': { bgcolor: '#064E47' } }}
              >
                Download PDF
              </Button>
            </Box>
          )}
          {message.quickActions && message.quickActions.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 'bold' }}>
                Quick Actions:
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {message.quickActions.map((action) => (
                  <Chip
                    key={action.id}
                    label={action.label}
                    icon={action.icon as React.ReactElement}
                    onClick={() => handleQuickAction(action)}
                    sx={{ cursor: 'pointer' }}
                    size="small"
                  />
                ))}
              </Box>
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );

  // Don't render chatbot if user is not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Floating Action Button - Show when chat is closed */}
      {!isOpen && (
        <Fab
          color="secondary"
          aria-label="chat"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            backgroundColor: '#075E54',
            '&:hover': {
              backgroundColor: '#064E47',
            },
            boxShadow: '0 4px 20px rgba(7, 94, 84, 0.4)',
            width: 60,
            height: 60,
            color: 'white',
            '& svg': {
              color: 'white',
            },
          }}
          onClick={() => setIsOpen(true)}
        >
          <ChatIcon sx={{ color: 'white' }} />
        </Fab>
      )}

      {/* Floating Chat Window - WhatsApp style */}
      <Box
        sx={{
          position: 'fixed',
          bottom: isOpen ? 24 : -700,
          right: 24,
          width: '380px',
          height: '600px',
          backgroundColor: 'white',
          boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
          borderRadius: '12px 12px 0 0',
          zIndex: 10000,
          transition: 'bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid rgba(0, 0, 0, 0.08)',
        }}
      >
        {/* Header - WhatsApp style */}
        <Box
          sx={{
            p: 1.5,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#075E54',
            color: 'white',
            borderRadius: '12px 12px 0 0',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Avatar
              sx={{
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                width: 40,
                height: 40,
                mr: 1.5,
              }}
            >
              <BotIcon />
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, fontSize: '0.95rem' }}>
                UtilityHub360 Assistant
              </Typography>
              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.9 }}>
                <AutoAwesomeIcon sx={{ fontSize: 12 }} />
                AI assistant · answers use your data when context is on
              </Typography>
            </Box>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Conversation History">
              <IconButton 
                onClick={() => setShowConversations(true)}
                sx={{ color: 'white' }}
              >
                <Badge badgeContent={conversations?.length || 0} color="secondary">
                  <HistoryIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            <IconButton 
              onClick={() => setIsOpen(false)}
              sx={{ color: 'white' }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Messages - WhatsApp style background */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            backgroundColor: '#ECE5DD',
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'100\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cdefs%3E%3Cpattern id=\'grid\' width=\'100\' height=\'100\' patternUnits=\'userSpaceOnUse\'%3E%3Cpath d=\'M 100 0 L 0 0 0 100\' fill=\'none\' stroke=\'%23D4C5B9\' stroke-width=\'0.5\' opacity=\'0.3\'/%3E%3C/pattern%3E%3C/defs%3E%3Crect width=\'100\' height=\'100\' fill=\'url(%23grid)\'/%3E%3C/svg%3E")',
            backgroundSize: '100px 100px',
          }}
        >
          {messages && messages.map(renderMessage)}
          {isTyping && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5, px: 0.5, gap: 0.5 }}>
              <Avatar
                sx={{
                  bgcolor: '#075E54',
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                }}
              >
                <BotIcon sx={{ fontSize: 16 }} />
              </Avatar>
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  px: 2,
                  bgcolor: 'white',
                  borderRadius: '0 7.5px 7.5px 7.5px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  overflow: 'visible',
                  // Left-pointing tail, vertically centered (avoids bottom-corner misalignment)
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: -6,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    borderWidth: '6px 6px 6px 0',
                    borderColor: 'transparent #fff transparent transparent',
                  },
                }}
              >
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#999',
                      animation: 'typing 1.4s infinite',
                      '@keyframes typing': {
                        '0%, 60%, 100%': { opacity: 0.3 },
                        '30%': { opacity: 1 },
                      },
                    }}
                  />
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#999',
                      animation: 'typing 1.4s infinite 0.2s',
                    }}
                  />
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      bgcolor: '#999',
                      animation: 'typing 1.4s infinite 0.4s',
                    }}
                  />
                </Box>
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input: text + attachment upload (+ drag & drop) */}
        <Box
          sx={{
            p: 1.5,
            borderTop: 1,
            borderColor: 'divider',
            backgroundColor: '#F0F0F0',
            border: isDragOver ? '2px dashed #25D366' : 'none',
            borderRadius: isDragOver ? 2 : 0,
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            // Required so the browser allows dropping
            e.dataTransfer.dropEffect = 'copy';
            setIsDragOver(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragOver(false);
            const file = e.dataTransfer.files?.[0] || null;
            void handleChatFilePicked(file);
          }}
        >
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <input
              ref={fileInputRef}
              type="file"
              style={{ display: 'none' }}
              accept=".pdf,.csv,text/csv,application/pdf"
              onChange={(e) => {
                const picked = e.target.files?.[0] || null;
                void handleChatFilePicked(picked);
              }}
            />
            <TextField
              fullWidth
              multiline
              maxRows={4}
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                // Send message on Enter (without Shift), new line on Shift+Enter
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (inputValue.trim()) {
                    handleSendMessage(inputValue);
                  }
                }
              }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  '& fieldset': {
                    border: 'none',
                  },
                  '&:hover fieldset': {
                    border: 'none',
                  },
                  '&.Mui-focused fieldset': {
                    border: 'none',
                  },
                },
                '& .MuiInputBase-input': {
                  maxHeight: '100px',
                  overflowY: 'auto',
                  padding: '8px 12px',
                },
              }}
            />
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              disabled={!isAuthenticated || isUploadingFile}
              sx={{
                backgroundColor: 'white',
                color: '#075E54',
                width: 40,
                height: 40,
                borderRadius: '12px',
                '&:hover': { backgroundColor: 'rgba(7, 94, 84, 0.08)' },
                '&.Mui-disabled': { backgroundColor: '#eee', color: '#999' }
              }}
            >
              <AttachmentIcon sx={{ fontSize: 20 }} />
            </IconButton>
            <IconButton
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim()}
              sx={{
                backgroundColor: '#25D366',
                color: 'white',
                width: 40,
                height: 40,
                '&:hover': {
                  backgroundColor: '#20BA5A',
                },
                '&.Mui-disabled': {
                  backgroundColor: '#ccc',
                  color: '#999',
                },
              }}
            >
              <SendIcon sx={{ fontSize: 20 }} />
            </IconButton>
          </Box>
        </Box>
      </Box>


      {/* Conversation History Dialog */}
      <Dialog
        open={showConversations}
        onClose={() => setShowConversations(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <HistoryIcon />
            <Typography variant="h6">Conversation History</Typography>
          </Box>
        </DialogTitle>
        <DialogContent>
          {!conversations || conversations.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
              <Typography variant="body1" color="text.secondary">
                No conversations yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Start a conversation to see your chat history here
              </Typography>
            </Box>
          ) : (
            <List>
              {conversations && conversations.map((conversation, index) => (
                <React.Fragment key={conversation.id}>
                  <ListItem
                    button
                    onClick={() => {
                      loadConversationMessages(conversation.id);
                      setShowConversations(false);
                    }}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      '&:hover': {
                        backgroundColor: 'action.hover',
                      },
                    }}
                  >
                    <ListItemText
                      primary={conversation.title}
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary" noWrap>
                            {conversation.lastMessage}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {conversation.messageCount} messages • {new Date(conversation.updatedAt).toLocaleDateString()}
                          </Typography>
                        </Box>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(conversation.id);
                        }}
                        size="small"
                        sx={{ color: 'error.main' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                  {conversations && index < conversations.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConversations(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              setMessages([]);
              chatbotService.setCurrentConversation(null);
              setShowConversations(false);
            }}
            variant="outlined"
          >
            Start New Chat
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Chatbot;
