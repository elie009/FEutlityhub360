import { 
  User, 
  Loan, 
  RepaymentSchedule, 
  Payment, 
  Transaction, 
  Notification, 
  LoanApplication, 
  AuthUser, 
  LoginCredentials, 
  RegisterData,
  PaymentMethod 
} from '../types/loan';
import { Bill, CreateBillRequest, UpdateBillRequest, BillFilters, BillAnalytics, TotalPaidAnalytics, PaginatedBillsResponse } from '../types/bill';
import { mockDataService } from './mockData';
import { mockBillDataService } from './mockBillData';
import { BankAccount, CreateBankAccountRequest, UpdateBankAccountRequest, BankAccountFilters, BankAccountAnalytics, PaginatedBankAccountsResponse } from '../types/bankAccount';
import { mockBankAccountDataService } from './mockBankAccountData';
import { BankAccountTransaction, TransactionFilters, PaginatedTransactionsResponse, TransactionAnalytics } from '../types/transaction';
import { mockTransactionDataService } from './mockTransactionData';
import { config, isMockDataEnabled } from '../config/environment';

const API_BASE_URL = config.apiBaseUrl;

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const requestConfig: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout);
    requestConfig.signal = controller.signal;

    try {
      console.log('API Service: Making fetch request to:', url);
      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId);
      
      console.log('API Service: Response status:', response.status);
      console.log('API Service: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Service: Error response:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const jsonResponse = await response.json();
      console.log('API Service: JSON response:', jsonResponse);
      return jsonResponse;
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('API Service: Request failed:', error);
      throw error;
    }
  }

  // Authentication APIs
  async register(data: RegisterData): Promise<AuthUser> {
    return this.request<AuthUser>('/Auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    console.log('API Service: Making login request to /Auth/login');
    console.log('API Service: Credentials:', credentials);
    
    const response = await this.request<AuthUser>('/Auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    console.log('API Service: Raw response received:', response);
    console.log('API Service: Response type:', typeof response);
    console.log('API Service: Response keys:', Object.keys(response || {}));
    
    return response;
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/Auth/me');
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  // User APIs
  async getUser(userId: string): Promise<User> {
    return this.request<User>(`/users/${userId}`);
  }

  // Loan APIs
  async applyForLoan(application: LoanApplication): Promise<Loan> {
    if (isMockDataEnabled()) {
      return mockDataService.applyForLoan(application);
    }
    return this.request<Loan>('/Loans/user/apply', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  }

  async getLoan(loanId: string): Promise<Loan> {
    if (isMockDataEnabled()) {
      return mockDataService.getLoan(loanId);
    }
    return this.request<Loan>(`/Loans/user/${loanId}`);
  }

  async updateLoan(loanId: string, updateData: {
    purpose?: string;
    additionalInfo?: string;
    status?: string;
    interestRate?: number;
    monthlyPayment?: number;
    remainingBalance?: number;
  }): Promise<Loan> {
    if (isMockDataEnabled()) {
      return mockDataService.updateLoan(loanId, updateData);
    }
    const response = await this.request<any>(`/Loans/${loanId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    
    // Handle the response structure
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async deleteLoan(loanId: string): Promise<boolean> {
    if (isMockDataEnabled()) {
      return mockDataService.deleteLoan(loanId);
    }
    const response = await this.request<any>(`/Loans/${loanId}`, {
      method: 'DELETE',
    });
    
    // Handle the response structure
    if (response && response.data !== undefined) {
      return response.data;
    }
    return response || true;
  }

  async getLoanTransactions(loanId: string): Promise<any[]> {
    if (isMockDataEnabled()) {
      return mockDataService.getLoanTransactions(loanId);
    }
    const response = await this.request<any>(`/loans/${loanId}/transactions`);
    
    // Handle the response structure
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      console.error('Unexpected loan transactions response structure:', response);
      return [];
    }
  }

  async makeLoanPayment(loanId: string, paymentData: {
    amount: number;
    method: string;
    reference: string;
  }): Promise<any> {
    if (isMockDataEnabled()) {
      return mockDataService.makeLoanPayment(loanId, paymentData);
    }
    const response = await this.request<any>('/Payments', {
      method: 'POST',
      body: JSON.stringify({
        loanId,
        amount: paymentData.amount,
        method: paymentData.method,
        reference: paymentData.reference,
      }),
    });
    
    // Handle the response structure
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async getUserLoans(userId: string): Promise<Loan[]> {
    if (isMockDataEnabled()) {
      return mockDataService.getUserLoans(userId);
    }
    const response = await this.request<any>(`/Loans/user/${userId}`);
    console.log('getUserLoans API response:', response);
    
    // Handle paginated response structure
    if (response && response.data && Array.isArray(response.data.data)) {
      return response.data.data;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      console.error('Unexpected response structure:', response);
      return [];
    }
  }

  async getLoanStatus(loanId: string): Promise<{ status: string; outstandingBalance: number }> {
    if (isMockDataEnabled()) {
      const loan = await mockDataService.getLoan(loanId);
      return { status: loan.status, outstandingBalance: loan.outstandingBalance };
    }
    return this.request<{ status: string; outstandingBalance: number }>(`/Loans/user/${loanId}/status`);
  }

  async getLoanSchedule(loanId: string): Promise<RepaymentSchedule[]> {
    if (isMockDataEnabled()) {
      return mockDataService.getLoanSchedule(loanId);
    }
    return this.request<RepaymentSchedule[]>(`/Loans/user/${loanId}/schedule`);
  }


  // Admin APIs
  async approveLoan(loanId: string): Promise<Loan> {
    return this.request<Loan>(`/Loans/user/${loanId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectLoan(loanId: string, reason: string): Promise<Loan> {
    return this.request<Loan>(`/Loans/user/${loanId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async disburseLoan(loanId: string): Promise<Transaction> {
    return this.request<Transaction>('/transactions/disburse', {
      method: 'POST',
      body: JSON.stringify({ loanId }),
    });
  }

  async closeLoan(loanId: string): Promise<Loan> {
    return this.request<Loan>(`/Loans/user/${loanId}/close`, {
      method: 'PUT',
    });
  }

  // Payment APIs
  async makePayment(loanId: string, amount: number, method: PaymentMethod, reference: string): Promise<Payment> {
    if (isMockDataEnabled()) {
      return mockDataService.makePayment(loanId, amount, method, reference);
    }
    return this.request<Payment>('/payments', {
      method: 'POST',
      body: JSON.stringify({
        loanId,
        amount,
        method,
        reference,
      }),
    });
  }

  async getPayment(paymentId: string): Promise<Payment> {
    return this.request<Payment>(`/payments/${paymentId}`);
  }

  async getPayments(loanId: string): Promise<Payment[]> {
    if (isMockDataEnabled()) {
      return mockDataService.getPayments(loanId);
    }
    return this.request<Payment[]>(`/Loans/user/${loanId}/payments`);
  }

  // Notification APIs
  async getNotifications(userId: string): Promise<Notification[]> {
    if (isMockDataEnabled()) {
      return mockDataService.getNotifications(userId);
    }
    return this.request<Notification[]>(`/notifications/${userId}`);
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    return this.request<void>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async sendNotification(userId: string, type: string, message: string): Promise<Notification> {
    return this.request<Notification>('/notifications/send', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        type,
        message,
      }),
    });
  }

  // Report APIs
  async getUserReport(userId: string): Promise<any> {
    return this.request<any>(`/reports/user/${userId}`);
  }

  async getLoanReport(loanId: string): Promise<any> {
    return this.request<any>(`/reports/loan/${loanId}`);
  }

  // ==================== BILL MANAGEMENT APIs ====================

  // Get all bills for the authenticated user
  async getUserBills(filters?: BillFilters): Promise<PaginatedBillsResponse> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockBillDataService.getUserBills(user?.id || 'demo-user-123', filters);
    }
    
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.billType) queryParams.append('billType', filters.billType);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/bills${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<any>(endpoint);
    
    // Handle paginated response structure
    if (response && response.data && Array.isArray(response.data.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return {
        data: response,
        page: 1,
        limit: response.length,
        totalCount: response.length,
      };
    } else {
      console.error('Unexpected response structure:', response);
      return {
        data: [],
        page: 1,
        limit: 10,
        totalCount: 0,
      };
    }
  }

  // Get a specific bill
  async getBill(billId: string): Promise<Bill> {
    if (isMockDataEnabled()) {
      return mockBillDataService.getBill(billId);
    }
    
    const response = await this.request<any>(`/bills/${billId}`);
    
    // Handle the response structure
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  // Create a new bill
  async createBill(billData: CreateBillRequest): Promise<Bill> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockBillDataService.createBill(user?.id || 'demo-user-123', billData);
    }
    
    const response = await this.request<any>('/bills', {
      method: 'POST',
      body: JSON.stringify(billData),
    });
    
    // Handle the response structure
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  // Update a bill
  async updateBill(billId: string, updateData: UpdateBillRequest): Promise<Bill> {
    if (isMockDataEnabled()) {
      return mockBillDataService.updateBill(billId, updateData);
    }
    
    const response = await this.request<any>(`/Bills/${billId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    
    // Handle the response structure
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  // Delete a bill
  async deleteBill(billId: string): Promise<boolean> {
    if (isMockDataEnabled()) {
      return mockBillDataService.deleteBill(billId);
    }
    
    const response = await this.request<any>(`/bills/${billId}`, {
      method: 'DELETE',
    });
    
    return response?.data || response || true;
  }

  // Mark bill as paid
  async markBillAsPaid(billId: string, notes?: string): Promise<Bill> {
    if (isMockDataEnabled()) {
      return mockBillDataService.markBillAsPaid(billId, notes);
    }
    
    const response = await this.request<any>(`/bills/${billId}/mark-paid`, {
      method: 'PUT',
      body: JSON.stringify(notes || ''),
    });
    
    // Handle the response structure
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  // Update bill status
  async updateBillStatus(billId: string, status: string): Promise<boolean> {
    if (isMockDataEnabled()) {
      await mockBillDataService.updateBill(billId, { status: status as any });
      return true;
    }
    
    const response = await this.request<any>(`/bills/${billId}/status`, {
      method: 'PUT',
      body: JSON.stringify(status),
    });
    
    return response?.data || response || true;
  }

  // Get analytics summary
  async getBillAnalyticsSummary(): Promise<BillAnalytics> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockBillDataService.getAnalyticsSummary(user?.id || 'demo-user-123');
    }
    
    const response = await this.request<any>('/bills/analytics/summary');
    
    // Handle the response structure
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  // Get total pending amount
  async getTotalPendingAmount(): Promise<number> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockBillDataService.getTotalPendingAmount(user?.id || 'demo-user-123');
    }
    
    const response = await this.request<any>('/bills/analytics/total-pending');
    
    // Handle the response structure
    if (response && response.data !== undefined) {
      return response.data;
    }
    return response;
  }

  // Get total paid amount
  async getTotalPaidAmount(period: string = 'month'): Promise<TotalPaidAnalytics> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockBillDataService.getTotalPaidAmount(user?.id || 'demo-user-123', period);
    }
    
    const response = await this.request<any>(`/bills/analytics/total-paid?period=${period}`);
    
    // Handle the response structure
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  // Get total overdue amount
  async getTotalOverdueAmount(): Promise<number> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockBillDataService.getTotalOverdueAmount(user?.id || 'demo-user-123');
    }
    
    const response = await this.request<any>('/bills/analytics/total-overdue');
    
    // Handle the response structure
    if (response && response.data !== undefined) {
      return response.data;
    }
    return response;
  }

  // Get overdue bills
  async getOverdueBills(): Promise<Bill[]> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockBillDataService.getOverdueBills(user?.id || 'demo-user-123');
    }
    
    const response = await this.request<any>('/bills/overdue');
    
    // Handle the response structure
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      return [];
    }
  }

  // Get upcoming bills
  async getUpcomingBills(days: number = 7): Promise<Bill[]> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockBillDataService.getUpcomingBills(user?.id || 'demo-user-123', days);
    }
    
    const response = await this.request<any>(`/bills/upcoming?days=${days}`);
    
    // Handle the response structure
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      return [];
    }
  }

  // Helper method to get current user from token (for mock data)
  private getCurrentUserFromToken(): User | null {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) return null;
      
      // In a real app, you'd decode the JWT token
      // For mock purposes, we'll return a demo user
      return {
        id: 'demo-user-123',
        name: 'Demo User',
        email: 'demo@utilityhub360.com',
        phone: '+1234567890',
        kycVerified: true,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      return null;
    }
  }

  // ==================== BANK ACCOUNT MANAGEMENT APIs ====================

  async getUserBankAccounts(filters?: BankAccountFilters): Promise<BankAccount[]> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      const response = await mockBankAccountDataService.getUserBankAccounts(user?.id || 'demo-user-123', filters);
      return response.data;
    }
    const queryParams = new URLSearchParams();
    if (filters?.accountType) queryParams.append('accountType', filters.accountType);
    if (filters?.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
    if (filters?.isConnected !== undefined) queryParams.append('isConnected', filters.isConnected.toString());
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    const queryString = queryParams.toString();
    const endpoint = `/bankaccounts${queryString ? `?${queryString}` : ''}`;
    const response = await this.request<any>(endpoint);
    
    // Handle the new response format: { success: true, data: BankAccount[], errors: [] }
    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    } else if (response && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      console.error('Unexpected response structure:', response);
      return [];
    }
  }

  async getBankAccount(accountId: string): Promise<BankAccount> {
    if (isMockDataEnabled()) {
      return mockBankAccountDataService.getBankAccount(accountId);
    }
    const response = await this.request<any>(`/bankaccounts/${accountId}`);
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async createBankAccount(accountData: CreateBankAccountRequest): Promise<BankAccount> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockBankAccountDataService.createBankAccount(user?.id || 'demo-user-123', accountData);
    }
    const response = await this.request<any>('/bankaccounts', { method: 'POST', body: JSON.stringify(accountData) });
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async updateBankAccount(accountId: string, updateData: UpdateBankAccountRequest): Promise<BankAccount> {
    if (isMockDataEnabled()) {
      return mockBankAccountDataService.updateBankAccount(accountId, updateData);
    }
    const response = await this.request<any>(`/bankaccounts/${accountId}`, { method: 'PUT', body: JSON.stringify(updateData) });
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async deleteBankAccount(accountId: string): Promise<boolean> {
    if (isMockDataEnabled()) {
      return mockBankAccountDataService.deleteBankAccount(accountId);
    }
    const response = await this.request<any>(`/bankaccounts/${accountId}`, { method: 'DELETE' });
    return response?.data || response || true;
  }

  async getBankAccountAnalyticsSummary(): Promise<BankAccountAnalytics> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockBankAccountDataService.getAnalyticsSummary(user?.id || 'demo-user-123');
    }
    const response = await this.request<any>('/BankAccounts/analytics');
    
    // Handle the new response format: { success: true, data: BankAccountAnalytics, errors: [] }
    if (response && response.success && response.data) {
      return response.data;
    } else if (response && response.data) {
      return response.data;
    } else {
      console.error('Unexpected analytics response structure:', response);
      return {
        totalBalance: 0,
        totalAccounts: 0,
        activeAccounts: 0,
        connectedAccounts: 0,
        totalIncoming: 0,
        totalOutgoing: 0,
        accounts: []
      };
    }
  }

  async connectBankAccount(accountId: string): Promise<BankAccount> {
    if (isMockDataEnabled()) {
      return mockBankAccountDataService.connectAccount(accountId);
    }
    const response = await this.request<any>(`/bankaccounts/${accountId}/connect`, { method: 'PUT' });
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async disconnectBankAccount(accountId: string): Promise<BankAccount> {
    if (isMockDataEnabled()) {
      return mockBankAccountDataService.disconnectAccount(accountId);
    }
    const response = await this.request<any>(`/bankaccounts/${accountId}/disconnect`, { method: 'PUT' });
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async syncBankAccount(accountId: string): Promise<BankAccount> {
    if (isMockDataEnabled()) {
      return mockBankAccountDataService.syncAccount(accountId);
    }
    const response = await this.request<any>(`/bankaccounts/${accountId}/sync`, { method: 'POST' });
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  // Utility method for formatting currency
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }

  // ==================== TRANSACTION MANAGEMENT APIs ====================

  async getRecentTransactions(limit: number = 10): Promise<BankAccountTransaction[]> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockTransactionDataService.getRecentTransactions(user?.id || 'demo-user-123', limit);
    }
    const response = await this.request<any>(`/bankaccounts/transactions/recent?limit=${limit}`);
    
    // Handle the new response format: { success: true, data: BankAccountTransaction[], errors: [] }
    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    } else if (response && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      console.error('Unexpected recent transactions response structure:', response);
      return [];
    }
  }

  async getTransactions(filters?: TransactionFilters): Promise<PaginatedTransactionsResponse> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockTransactionDataService.getTransactions(user?.id || 'demo-user-123', filters);
    }
    const queryParams = new URLSearchParams();
    if (filters?.bankAccountId) queryParams.append('bankAccountId', filters.bankAccountId);
    if (filters?.transactionType) queryParams.append('transactionType', filters.transactionType);
    if (filters?.category) queryParams.append('category', filters.category);
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    const queryString = queryParams.toString();
    const endpoint = `/bankaccounts/transactions${queryString ? `?${queryString}` : ''}`;
    const response = await this.request<any>(endpoint);
    
    if (response && response.data && Array.isArray(response.data.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return { data: response, page: 1, limit: response.length, totalCount: response.length };
    } else {
      console.error('Unexpected transactions response structure:', response);
      return { data: [], page: 1, limit: 10, totalCount: 0 };
    }
  }

  async getTransaction(transactionId: string): Promise<BankAccountTransaction> {
    if (isMockDataEnabled()) {
      return mockTransactionDataService.getTransaction(transactionId);
    }
    const response = await this.request<any>(`/bankaccounts/transactions/${transactionId}`);
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async getTransactionAnalytics(): Promise<TransactionAnalytics> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockTransactionDataService.getTransactionAnalytics(user?.id || 'demo-user-123');
    }
    const response = await this.request<any>('/bankaccounts/transactions/analytics');
    if (response && response.data) {
      return response.data;
    }
    return response;
  }
}

export const apiService = new ApiService();
export default apiService;
