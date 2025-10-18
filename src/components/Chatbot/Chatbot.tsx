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

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  quickActions?: QuickAction[];
  reportData?: any;
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

const Chatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [financialSummary, setFinancialSummary] = useState<any>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [showConversations, setShowConversations] = useState(false);
  const [useAI, setUseAI] = useState(true);
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
        content: `Hello${user ? ` ${user.name}` : ''}! 👋 I'm your UtilityHub360 assistant. I can help you with:`,
        timestamp: new Date(),
        quickActions: [
          {
            id: 'setup',
            label: 'Account Setup',
            action: 'setup_guide',
            icon: <Settings />,
            description: 'Complete your profile setup'
          },
          {
            id: 'bills',
            label: 'Manage Bills',
            action: 'bills_guide',
            icon: <Receipt />,
            description: 'Add and track your bills'
          },
          {
            id: 'reports',
            label: 'View Reports',
            action: 'show_reports',
            icon: <Assessment />,
            description: 'See your financial insights'
          },
          {
            id: 'help',
            label: 'Get Help',
            action: 'help_guide',
            icon: <Help />,
            description: 'Learn how to use the app'
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

  const handleQuickAction = (action: QuickAction) => {
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
      default:
        handleSendMessage(action.label);
    }
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

  const renderMessage = (message: Message) => (
    <Box
      key={message.id}
      sx={{
        display: 'flex',
        justifyContent: message.type === 'user' ? 'flex-end' : 'flex-start',
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          maxWidth: '80%',
          flexDirection: message.type === 'user' ? 'row-reverse' : 'row',
        }}
      >
        <Avatar
          sx={{
            bgcolor: message.type === 'user' ? 'primary.main' : 'secondary.main',
            width: 32,
            height: 32,
            mx: 1,
          }}
        >
          {message.type === 'user' ? <PersonIcon /> : <BotIcon />}
        </Avatar>
        <Paper
          sx={{
            p: 2,
            bgcolor: message.type === 'user' ? 'primary.light' : 'grey.100',
            color: message.type === 'user' ? 'primary.contrastText' : 'text.primary',
          }}
        >
          <Typography variant="body1">{message.content}</Typography>
          {message.reportData && renderReportData(message.reportData)}
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
      {/* Floating Action Button - Hide when chat is open */}
      {!isOpen && (
        <Fab
          color="secondary"
          aria-label="chat"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
            zIndex: 9999,
            backgroundColor: '#667eea',
            '&:hover': {
              backgroundColor: '#5a6fd8',
            },
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
            width: 56,
            height: 56,
          }}
          onClick={() => setIsOpen(true)}
        >
          <ChatIcon />
        </Fab>
      )}

      {/* Chat Panel - Slide in from right */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : '-400px',
          width: '400px',
          height: '100vh',
          backgroundColor: 'white',
          boxShadow: '-4px 0 12px rgba(0, 0, 0, 0.15)',
          zIndex: 1000,
          transition: 'right 0.3s ease-in-out',
          display: 'flex',
          flexDirection: 'column',
          borderLeft: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 2,
            borderBottom: 1,
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'primary.main',
            color: 'white',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <BotIcon sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ flex: 1 }}>
              UtilityHub360 Assistant
            </Typography>
            {aiEnabled && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                <Typography variant="caption">
                  AI Powered
                </Typography>
              </Box>
            )}
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

        {/* Messages */}
        <Box
          sx={{
            flex: 1,
            overflow: 'auto',
            p: 2,
            backgroundColor: '#f8f9fa',
          }}
        >
          {messages && messages.map(renderMessage)}
          {isTyping && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar sx={{ bgcolor: 'secondary.main', width: 32, height: 32, mr: 1 }}>
                <BotIcon />
              </Avatar>
              <Paper sx={{ p: 2, bgcolor: 'grey.100' }}>
                <Typography variant="body2">Assistant is typing...</Typography>
              </Paper>
            </Box>
          )}
          <div ref={messagesEndRef} />
        </Box>

        {/* Input */}
        <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider', backgroundColor: 'white' }}>
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            <TextField
              fullWidth
              placeholder={useAI ? "Ask me anything with AI assistance..." : "Ask me anything..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage(inputValue);
                }
              }}
              size="small"
            />
            <Button
              variant="contained"
              onClick={() => handleSendMessage(inputValue)}
              disabled={!inputValue.trim()}
              sx={{ minWidth: 'auto', px: 2 }}
            >
              <SendIcon />
            </Button>
          </Box>
          
          {/* AI Status and Controls */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={useAI}
                    onChange={(e) => setUseAI(e.target.checked)}
                    size="small"
                    color="primary"
                  />
                }
                label={
                  <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {useAI ? <AutoAwesomeIcon sx={{ fontSize: 14 }} /> : <BotIcon sx={{ fontSize: 14 }} />}
                    {useAI ? 'AI Mode' : 'Basic Mode'}
                  </Typography>
                }
                sx={{ m: 0 }}
              />
            </Box>
            
            {tokensUsed > 0 && (
              <Typography variant="caption" color="text.secondary">
                Tokens: {tokensUsed}
              </Typography>
            )}
          </Box>
        </Box>
      </Box>

      {/* Backdrop when chat is open */}
      {isOpen && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            zIndex: 999,
          }}
          onClick={() => setIsOpen(false)}
        />
      )}

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
