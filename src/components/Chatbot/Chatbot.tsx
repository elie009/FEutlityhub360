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
  Switch,
  FormControlLabel,
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
  Psychology as PsychologyIcon,
  AutoAwesome as AutoAwesomeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { chatbotService, Conversation } from './ChatbotService';
import { apiService } from '../../services/api';
import { BillType, BillFrequency } from '../../types/bill';
import { SavingsType } from '../../types/savings';

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
    term: '',
    monthlyIncome: '',
    employmentStatus: '',
    additionalInfo: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      purpose: formData.purpose,
      principal: parseFloat(formData.principal),
      interestRate: parseFloat(formData.interestRate),
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
          <TextField
            fullWidth
            label="Interest Rate (%)"
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
  const [useAI, setUseAI] = useState(false);
  const [aiEnabled] = useState(true);
  const [tokensUsed, setTokensUsed] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, isAuthenticated, hasProfile } = useAuth();
  

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
    }
  }, [isOpen, isAuthenticated, financialSummary]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages && messages.length === 0) {
      const welcomeMessage: Message = {
        id: '1',
        type: 'bot',
        content: `Hello${user ? ` ${user.name}` : ''}! 👋 I'm your UtilityHub360 assistant. ${useAI ? 'I have AI capabilities to help you better!' : 'I can help you manage your finances!'}\n\nWhat would you like to do today?`,
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
          }
        ]
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, user, messages, useAI]);

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
      let botResponse: Message;
      
      if (useAI && aiEnabled) {
        // Use AI chat
        const aiResponse = await chatbotService.sendAIMessage(
          content.trim(),
          true,
          user?.id || 'current-user'
        );
        
        botResponse = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: aiResponse.message,
          timestamp: new Date(),
          quickActions: aiResponse.quickActions?.map(action => ({
            ...action,
            icon: getIconComponent(action.icon)
          }))
        };

        // Update tokens used
        if (aiResponse.tokensUsed) {
          setTokensUsed(prev => prev + aiResponse.tokensUsed!);
        }
      } else {
        // Use legacy response generation
        botResponse = await generateBotResponse(content.trim());
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

  const generateBotResponse = async (userInput: string): Promise<Message> => {
    const messageId = (Date.now() + 1).toString();
    
    try {
      const context = {
        hasProfile,
        financialSummary,
        user
      };
      
      const response = chatbotService.generateResponse(userInput, context);
      
      // Handle special actions that need API calls
      if (userInput.toLowerCase().includes('bill analytics') || userInput.toLowerCase().includes('bill reports')) {
        const billAnalytics = await chatbotService.getBillAnalytics();
        return {
          id: messageId,
          type: 'bot',
          content: response.message,
          timestamp: new Date(),
          reportData: {
            type: 'analytics',
            title: 'Bill Analytics',
            data: billAnalytics || null // Ensure data is null if API call fails
          },
          quickActions: response.quickActions?.map(action => ({
            ...action,
            icon: getIconComponent(action.icon)
          }))
        };
      }
      
      if (userInput.toLowerCase().includes('monthly report')) {
        const monthlyReport = await chatbotService.getMonthlyReport();
        return {
          id: messageId,
          type: 'bot',
          content: response.message,
          timestamp: new Date(),
          reportData: {
            type: 'summary',
            title: 'Monthly Report',
            data: monthlyReport || null // Ensure data is null if API call fails
          },
          quickActions: response.quickActions?.map(action => ({
            ...action,
            icon: getIconComponent(action.icon)
          }))
        };
      }
      
      return {
        id: messageId,
        type: 'bot',
        content: response.message,
        timestamp: new Date(),
        reportData: response.reportData,
        quickActions: response.quickActions?.map(action => ({
          ...action,
          icon: getIconComponent(action.icon)
        }))
      };
    } catch (error) {
      console.error('Error generating bot response:', error);
      return {
        id: messageId,
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
          maxWidth: '75%',
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
            borderRadius: message.type === 'user' 
              ? '7.5px 7.5px 0 7.5px' 
              : '0 7.5px 7.5px 7.5px',
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            '&::before': message.type === 'user' ? {
              content: '""',
              position: 'absolute',
              right: -8,
              bottom: 0,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '0 0 8px 8px',
              borderColor: 'transparent transparent #DCF8C6 transparent',
            } : {
              content: '""',
              position: 'absolute',
              left: -8,
              bottom: 0,
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: '0 8px 8px 0',
              borderColor: 'transparent white transparent transparent',
            },
          }}
        >
          {message.type === 'user' ? (
            <Typography variant="body1">{message.content}</Typography>
          ) : (
            <Box>{formatMessageContent(message.content)}</Box>
          )}
          {message.reportData && renderReportData(message.reportData)}
          {message.formType && renderForm(message)}
          {message.quickActions && (
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
            backgroundColor: '#25D366',
            '&:hover': {
              backgroundColor: '#20BA5A',
            },
            boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
            width: 60,
            height: 60,
          }}
          onClick={() => setIsOpen(true)}
        >
          <ChatIcon />
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
              {aiEnabled && (
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, opacity: 0.9 }}>
                  <AutoAwesomeIcon sx={{ fontSize: 12 }} />
                  AI Powered
                </Typography>
              )}
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
            <Tooltip title="Toggle AI Mode">
              <IconButton 
                onClick={() => setUseAI(!useAI)}
                sx={{ color: useAI ? 'white' : 'rgba(255,255,255,0.5)' }}
              >
                <PsychologyIcon />
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
            <Box sx={{ display: 'flex', alignItems: 'flex-end', mb: 1.5, px: 0.5, gap: 0.5 }}>
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
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  px: 2,
                  bgcolor: 'white',
                  borderRadius: '0 7.5px 7.5px 7.5px',
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: -8,
                    bottom: 0,
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    borderWidth: '0 8px 8px 0',
                    borderColor: 'transparent white transparent transparent',
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

        {/* Input - WhatsApp style */}
        <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider', backgroundColor: '#F0F0F0' }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              fullWidth
              placeholder={useAI ? "Type a message..." : "Type a message..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(inputValue);
                }
              }}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  borderRadius: '25px',
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
              }}
            />
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
          
          {/* AI Status and Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mt: 1 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  size="small"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: '#25D366',
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: '#25D366',
                    },
                  }}
                />
              }
              label={
                <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.7rem' }}>
                  {useAI ? <AutoAwesomeIcon sx={{ fontSize: 12 }} /> : <BotIcon sx={{ fontSize: 12 }} />}
                  {useAI ? 'AI Mode' : 'Basic Mode'}
                </Typography>
              }
              sx={{ m: 0 }}
            />
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
