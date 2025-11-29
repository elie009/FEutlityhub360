import { apiService } from '../../services/api';

export interface ChatbotResponse {
  message: string;
  quickActions?: QuickAction[];
  reportData?: any;
  navigation?: string;
  conversationId?: string;
  tokensUsed?: number;
  suggestedActions?: string[];
}

export interface QuickAction {
  id: string;
  label: string;
  action: string;
  icon: string;
  description?: string;
}

export interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: string;
  tokensUsed?: number;
}

export interface FinancialContext {
  recentTransactions: Array<{
    id: string;
    description: string;
    amount: number;
    date: string;
    category: string;
  }>;
  upcomingBills: Array<{
    id: string;
    name: string;
    amount: number;
    dueDate: string;
  }>;
  activeLoans: Array<{
    id: string;
    purpose: string;
    monthlyPayment: number;
    remainingBalance: number;
  }>;
  savingsAccounts: Array<{
    id: string;
    name: string;
    currentAmount: number;
    targetAmount: number;
  }>;
  financialSummary: {
    totalIncome: number;
    totalExpenses: number;
    disposableAmount: number;
    savingsRate: number;
  };
}

export class ChatbotService {
  private static instance: ChatbotService;
  private currentConversationId: string | null = null;
  private rateLimitTracker: Map<string, number[]> = new Map();
  private readonly RATE_LIMIT_WINDOW = 60000; // 1 minute
  private readonly RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per minute

  public static getInstance(): ChatbotService {
    if (!ChatbotService.instance) {
      ChatbotService.instance = new ChatbotService();
    }
    return ChatbotService.instance;
  }

  async getFinancialSummary(): Promise<any> {
    try {
      // Get bills summary
      const billsResponse = await apiService.getUserBills();
      const billsAnalytics = await apiService.getBillAnalyticsSummary();
      
      // Get bank accounts summary
      const bankAccounts = await apiService.getUserBankAccounts();
      const bankAnalytics = await apiService.getBankAccountAnalyticsSummary();
      
      // Get savings summary
      const savingsAccounts = await apiService.getSavingsAccounts();
      
      return {
        bills: {
          total: billsResponse.data?.length || 0,
          totalAmount: billsAnalytics.totalPendingAmount || 0,
          paidThisMonth: (billsAnalytics.totalPaidAmount as any)?.currentMonth || billsAnalytics.totalPaidAmount || 0,
          upcoming: 0 // Will be calculated separately if needed
        },
        bankAccounts: {
          total: bankAccounts.length,
          totalBalance: bankAnalytics.totalBalance || 0,
          active: bankAnalytics.activeAccounts || 0
        },
        savings: {
          total: savingsAccounts?.length || 0,
          totalAmount: savingsAccounts?.reduce((sum: number, account: any) => sum + (account.currentAmount || 0), 0) || 0
        }
      };
    } catch (error) {
      console.error('Error fetching financial summary:', error);
      return null;
    }
  }

  async getBillAnalytics(): Promise<any> {
    try {
      const analytics = await apiService.getBillAnalyticsSummary();
      const bills = await apiService.getUserBills();
      
      return {
        totalBills: bills.data?.length || 0,
        totalPending: analytics.totalPendingAmount || 0,
        totalPaid: (analytics.totalPaidAmount as any)?.currentMonth || analytics.totalPaidAmount || 0,
        overdue: analytics.totalOverdueAmount || 0,
        categories: this.categorizeBills(bills.data || [])
      };
    } catch (error) {
      console.error('Error fetching bill analytics:', error);
      return null;
    }
  }

  private categorizeBills(bills: any[]): any {
    const categories: { [key: string]: { count: number; total: number } } = {};
    
    bills.forEach(bill => {
      const category = bill.billType || 'Other';
      if (!categories[category]) {
        categories[category] = { count: 0, total: 0 };
      }
      categories[category].count++;
      categories[category].total += bill.amount || 0;
    });
    
    return categories;
  }

  async getMonthlyReport(): Promise<any> {
    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      
      const disposableAmount = await apiService.getDisposableAmount(year, month);
      const billAnalytics = await apiService.getBillAnalyticsSummary();
      
      return {
        month: currentDate.toLocaleString('default', { month: 'long', year: 'numeric' }),
        disposableAmount: disposableAmount.data?.disposableAmount || 0,
        totalIncome: disposableAmount.data?.totalIncome || 0,
        totalExpenses: disposableAmount.data?.totalFixedExpenses || 0,
        savingsRate: disposableAmount.data?.disposablePercentage || 0,
        bills: {
          total: billAnalytics.totalPendingAmount || 0,
          paid: (billAnalytics.totalPaidAmount as any)?.currentMonth || billAnalytics.totalPaidAmount || 0
        }
      };
    } catch (error) {
      console.error('Error fetching monthly report:', error);
      return null;
    }
  }

  // ==================== AI CHAT INTEGRATION ====================

  // Check rate limiting
  private checkRateLimit(userId: string): boolean {
    const now = Date.now();
    const userRequests = this.rateLimitTracker.get(userId) || [];
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < this.RATE_LIMIT_WINDOW);
    
    if (validRequests.length >= this.RATE_LIMIT_MAX_REQUESTS) {
      return false; // Rate limit exceeded
    }
    
    // Add current request
    validRequests.push(now);
    this.rateLimitTracker.set(userId, validRequests);
    return true;
  }

  // Send message to AI chat
  async sendAIMessage(
    message: string, 
    includeContext: boolean = true,
    userId: string = 'current-user'
  ): Promise<ChatbotResponse> {
    try {
      // Check rate limiting
      if (!this.checkRateLimit(userId)) {
        return {
          message: 'I\'m receiving too many requests right now. Please wait a moment before sending another message.',
          quickActions: [
            {
              id: 'retry',
              label: 'Try Again',
              action: 'retry',
              icon: 'Help',
              description: 'Retry your request'
            }
          ]
        };
      }

      const response = await apiService.sendChatMessage({
        message,
        conversationId: this.currentConversationId || undefined,
        includeTransactionContext: includeContext,
        reportFormat: 'json'
      });

      // Update conversation ID
      if (response.data.conversationId) {
        this.currentConversationId = response.data.conversationId;
      }

      // Convert suggested actions to quick actions
      const quickActions: QuickAction[] = response.data.suggestedActions?.map((action, index) => ({
        id: `ai_action_${index}`,
        label: action,
        action: 'ai_suggested',
        icon: 'CheckCircle',
        description: `AI suggested: ${action}`
      })) || [];

      return {
        message: response.data.message,
        conversationId: response.data.conversationId,
        tokensUsed: response.data.tokensUsed,
        suggestedActions: response.data.suggestedActions,
        quickActions
      };
    } catch (error) {
      console.error('AI chat error:', error);
      return {
        message: 'I apologize, but I\'m having trouble connecting to the AI service right now. Let me help you with some basic guidance instead.',
        quickActions: [
          {
            id: 'retry',
            label: 'Try Again',
            action: 'retry',
            icon: 'Help',
            description: 'Retry your request'
          },
          {
            id: 'fallback',
            label: 'Get Basic Help',
            action: 'help_guide',
            icon: 'Info',
            description: 'Get basic app guidance'
          }
        ]
      };
    }
  }

  // Get conversation history
  async getConversations(): Promise<Conversation[]> {
    try {
      const response = await apiService.getConversations({ page: 1, limit: 20 });
      return response.data.conversations;
    } catch (error) {
      console.error('Error getting conversations:', error);
      return [];
    }
  }

  // Get conversation messages
  async getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const response = await apiService.getConversationMessages(conversationId, { page: 1, limit: 50 });
      return response.data.messages;
    } catch (error) {
      console.error('Error getting conversation messages:', error);
      return [];
    }
  }

  // Delete conversation
  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const response = await apiService.deleteConversation(conversationId);
      if (this.currentConversationId === conversationId) {
        this.currentConversationId = null;
      }
      return response.success;
    } catch (error) {
      console.error('Error deleting conversation:', error);
      return false;
    }
  }

  // Get financial context for AI
  async getFinancialContext(): Promise<FinancialContext | null> {
    try {
      const response = await apiService.getFinancialContext();
      return response.data;
    } catch (error) {
      console.error('Error getting financial context:', error);
      return null;
    }
  }

  // Get bill reminders
  async getBillReminders(): Promise<any[]> {
    try {
      const response = await apiService.getBillReminders();
      return response.data;
    } catch (error) {
      console.error('Error getting bill reminders:', error);
      return [];
    }
  }

  // Get budget suggestions
  async getBudgetSuggestions(): Promise<any> {
    try {
      const response = await apiService.getBudgetSuggestions();
      return response.data;
    } catch (error) {
      console.error('Error getting budget suggestions:', error);
      return null;
    }
  }

  // Generate financial report
  async generateFinancialReport(reportType: string = 'financial_summary', format: string = 'pdf'): Promise<string | null> {
    try {
      const response = await apiService.generateFinancialReport({ reportType, format });
      return response.data.reportUrl;
    } catch (error) {
      console.error('Error generating financial report:', error);
      return null;
    }
  }

  // Set current conversation
  setCurrentConversation(conversationId: string | null) {
    this.currentConversationId = conversationId;
  }

  // Get current conversation ID
  getCurrentConversationId(): string | null {
    return this.currentConversationId;
  }

  // ==================== LEGACY RESPONSE GENERATION ====================

  generateResponse(userInput: string, context: any): ChatbotResponse {
    const input = userInput.toLowerCase();
    
    // Account setup guidance
    if (input.includes('setup') || input.includes('profile') || input.includes('account')) {
      return {
        message: `Great! Let me help you set up your account. ${!context.hasProfile ? 'I can see you haven\'t completed your profile setup yet.' : 'Your profile looks good!'}`,
        quickActions: !context.hasProfile ? [
          {
            id: 'profile_setup',
            label: 'Complete Profile',
            action: 'navigate',
            icon: 'Settings',
            description: 'Set up your profile information'
          }
        ] : [
          {
            id: 'view_profile',
            label: 'View Profile',
            action: 'navigate',
            icon: 'Person',
            description: 'View your current profile'
          }
        ]
      };
    }

    // Bills guidance
    if (input.includes('bill') || input.includes('payment') || input.includes('expense')) {
      return {
        message: 'I can help you manage your bills! What would you like to do?',
        quickActions: [
          {
            id: 'add_bill',
            label: 'Add New Bill',
            action: 'show_add_bill_form',
            icon: 'Receipt',
            description: 'Add a new bill to track'
          },
          {
            id: 'view_bills',
            label: 'View My Bills',
            action: 'show_bills_list',
            icon: 'Assessment',
            description: 'See all your bills'
          },
          {
            id: 'bill_analytics',
            label: 'Bill Analytics',
            action: 'show_bill_reports',
            icon: 'TrendingUp',
            description: 'View bill spending insights'
          }
        ]
      };
    }

    // Loans guidance
    if (input.includes('loan')) {
      return {
        message: 'I can help you manage your loans! What would you like to do?',
        quickActions: [
          {
            id: 'add_loan',
            label: 'Apply for Loan',
            action: 'show_add_loan_form',
            icon: 'AccountBalance',
            description: 'Submit a new loan application'
          },
          {
            id: 'view_loans',
            label: 'View My Loans',
            action: 'show_loans_list',
            icon: 'Assessment',
            description: 'See all your loans'
          }
        ]
      };
    }

    // Bank Accounts guidance
    if (input.includes('bank') || input.includes('account')) {
      return {
        message: 'I can help you manage your bank accounts! What would you like to do?',
        quickActions: [
          {
            id: 'add_bank_account',
            label: 'Add Bank Account',
            action: 'show_add_bank_account_form',
            icon: 'AccountBalance',
            description: 'Add a new bank account'
          },
          {
            id: 'view_bank_accounts',
            label: 'View Accounts',
            action: 'show_bank_accounts_list',
            icon: 'Assessment',
            description: 'See all your bank accounts'
          }
        ]
      };
    }

    // Savings guidance
    if (input.includes('saving')) {
      return {
        message: 'I can help you manage your savings! What would you like to do?',
        quickActions: [
          {
            id: 'add_savings',
            label: 'Create Savings Goal',
            action: 'show_add_savings_form',
            icon: 'Savings',
            description: 'Create a new savings goal'
          },
          {
            id: 'view_savings',
            label: 'View Savings',
            action: 'show_savings_list',
            icon: 'Assessment',
            description: 'See all your savings goals'
          }
        ]
      };
    }

    // Reports and analytics
    if (input.includes('report') || input.includes('analytics') || input.includes('chart') || input.includes('graph')) {
      return {
        message: 'Here are your financial reports and insights:',
        reportData: {
          type: 'summary',
          title: 'Financial Summary',
          data: context.financialSummary || {
            totalBills: 0,
            totalAmount: 0,
            paidThisMonth: 0,
            upcomingPayments: 0,
            savingsRate: 0
          }
        },
        quickActions: [
          {
            id: 'detailed_analytics',
            label: 'Detailed Analytics',
            action: 'navigate',
            icon: 'Assessment',
            description: 'View comprehensive analytics'
          },
          {
            id: 'monthly_report',
            label: 'Monthly Report',
            action: 'show_monthly_report',
            icon: 'TrendingUp',
            description: 'Generate monthly report'
          }
        ]
      };
    }

    // Navigation help
    if (input.includes('navigate') || input.includes('go to') || input.includes('open')) {
      return {
        message: 'I can help you navigate to different sections of the app:',
        quickActions: [
          {
            id: 'dashboard',
            label: 'Dashboard',
            action: 'navigate',
            icon: 'TrendingUp',
            description: 'Go to your main dashboard'
          },
          {
            id: 'bills',
            label: 'Bills',
            action: 'navigate',
            icon: 'Receipt',
            description: 'Manage your bills and payments'
          },
          {
            id: 'bank-accounts',
            label: 'Bank Accounts',
            action: 'navigate',
            icon: 'AccountBalance',
            description: 'View your bank accounts'
          },
          {
            id: 'savings',
            label: 'Savings',
            action: 'navigate',
            icon: 'Savings',
            description: 'Track your savings goals'
          }
        ]
      };
    }

    // Help and guidance
    if (input.includes('help') || input.includes('how') || input.includes('guide')) {
      return {
        message: 'I\'m here to help! Here\'s what I can assist you with:',
        quickActions: [
          {
            id: 'getting_started',
            label: 'Getting Started',
            action: 'getting_started_guide',
            icon: 'Help',
            description: 'Learn the basics'
          },
          {
            id: 'features',
            label: 'App Features',
            action: 'features_guide',
            icon: 'Info',
            description: 'Explore all features'
          },
          {
            id: 'tips',
            label: 'Tips & Tricks',
            action: 'tips_guide',
            icon: 'CheckCircle',
            description: 'Get the most out of the app'
          }
        ]
      };
    }

    // Default response
    return {
      message: 'I understand you\'re looking for help. Here are some things I can assist you with:',
      quickActions: [
        {
          id: 'setup_help',
          label: 'Account Setup',
          action: 'setup_guide',
          icon: 'Settings',
          description: 'Complete your profile'
        },
        {
          id: 'bills_help',
          label: 'Manage Bills',
          action: 'bills_guide',
          icon: 'Receipt',
          description: 'Add and track bills'
        },
        {
          id: 'reports_help',
          label: 'View Reports',
          action: 'show_reports',
          icon: 'Assessment',
          description: 'See your insights'
        }
      ]
    };
  }
}

export const chatbotService = ChatbotService.getInstance();
