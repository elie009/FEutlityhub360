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
  PaymentMethod,
  NotificationsResponse,
  GetNotificationsParams,
  UpcomingPayment,
  OverduePayment
} from '../types/loan';
import { 
  Bill, 
  CreateBillRequest, 
  UpdateBillRequest, 
  BillFilters, 
  BillAnalytics, 
  TotalPaidAnalytics, 
  PaginatedBillsResponse,
  BillHistoryAnalytics,
  BillForecast,
  BillVariance,
  BillBudget,
  CreateBudgetRequest,
  BudgetStatus,
  BillDashboard,
  BillAlert,
  MonthlyBillData,
  ProviderAnalytics,
  BillType
} from '../types/bill';
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
      console.log('API Service: Request config:', {
        method: requestConfig.method,
        headers: requestConfig.headers,
        body: requestConfig.body
      });
      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId);
      
      console.log('API Service: Response status:', response.status);
      console.log('API Service: Response ok:', response.ok);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Service: Error response:', errorData);
        
        // Handle 400 validation errors with detailed field errors
        if (response.status === 400 && errorData.errors) {
          const fieldErrors: string[] = [];
          Object.keys(errorData.errors).forEach(field => {
            const fieldErrorMessages = errorData.errors[field];
            if (Array.isArray(fieldErrorMessages)) {
              fieldErrorMessages.forEach((message: string) => {
                fieldErrors.push(`${field}: ${message}`);
              });
            } else {
              fieldErrors.push(`${field}: ${fieldErrorMessages}`);
            }
          });
          
          if (fieldErrors.length > 0) {
            throw new Error(fieldErrors.join(', '));
          }
        }
        
        // Handle other error responses
        throw new Error(errorData.message || errorData.title || `HTTP error! status: ${response.status}`);
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

  async register(registerData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      userId: string;
      name: string;
      email: string;
      phone: string;
      isEmailConfirmed: boolean;
      createdAt: string;
    } | null;
    errors: Array<{
      field: string;
      message: string;
    }>;
  }> {
    if (isMockDataEnabled()) {
      return mockDataService.register(registerData);
    }
    const response = await this.request<{
      success: boolean;
      message: string;
      data: {
        userId: string;
        name: string;
        email: string;
        phone: string;
        isEmailConfirmed: boolean;
        createdAt: string;
      } | null;
      errors: Array<{
        field: string;
        message: string;
      }>;
    }>('/Auth/register', {
      method: 'POST',
      body: JSON.stringify(registerData),
    });
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

  // User Profile APIs
  async createUserProfile(profileData: {
    jobTitle: string;
    company: string;
    employmentType: string;
    monthlySavingsGoal: number;
    monthlyInvestmentGoal: number;
    monthlyEmergencyFundGoal: number;
    taxRate: number;
    monthlyTaxDeductions: number;
    industry: string;
    location: string;
    notes: string;
    incomeSources: Array<{
      name: string;
      amount: number;
      frequency: string;
      category: string;
      currency: string;
      description: string;
      company: string;
    }>;
  }): Promise<{
    id: string;
    userId: string;
    jobTitle: string;
    company: string;
    employmentType: string;
    monthlySavingsGoal: number;
    monthlyInvestmentGoal: number;
    monthlyEmergencyFundGoal: number;
    taxRate: number;
    monthlyTaxDeductions: number;
    industry: string;
    location: string;
    notes: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    totalMonthlyIncome: number;
    netMonthlyIncome: number;
    totalMonthlyGoals: number;
    disposableIncome: number;
    incomeSources: Array<{
      id: string;
      userId: string;
      name: string;
      amount: number;
      frequency: string;
      category: string;
      currency: string;
      isActive: boolean;
      description: string;
      company: string;
      createdAt: string;
      updatedAt: string;
      monthlyAmount: number;
    }>;
  }> {
    if (isMockDataEnabled()) {
      return mockDataService.createUserProfile(profileData);
    }
    const response = await this.request<any>('/UserProfile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
    if (response && response.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to create user profile');
  }

  async getUserProfile(): Promise<{
    id: string;
    userId: string;
    jobTitle: string;
    company: string;
    employmentType: string;
    monthlySavingsGoal: number;
    monthlyInvestmentGoal: number;
    monthlyEmergencyFundGoal: number;
    taxRate: number;
    monthlyTaxDeductions: number;
    industry: string;
    location: string;
    notes: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    totalMonthlyIncome: number;
    netMonthlyIncome: number;
    totalMonthlyGoals: number;
    disposableIncome: number;
    incomeSources: Array<{
      id: string;
      userId: string;
      name: string;
      amount: number;
      frequency: string;
      category: string;
      currency: string;
      isActive: boolean;
      description: string;
      company: string;
      createdAt: string;
      updatedAt: string;
      monthlyAmount: number;
    }>;
  } | null> {

    if (isMockDataEnabled()) {
      return mockDataService.getUserProfile();
    }
    
    const response = await this.request<any>('/UserProfile');
    console.log('=== API: getUserProfile FULL RESPONSE ===');
    console.log('API: Raw response:', JSON.stringify(response, null, 2));
    console.log('API: Response type:', typeof response);
    console.log('API: Response success:', response?.success);
    console.log('API: Response data:', response?.data);
    console.log('API: Response data type:', typeof response?.data);
    console.log('API: Response data id:', response?.data?.id);
    console.log('API: Response data isActive:', response?.data?.isActive);
    console.log('API: Response data isActive type:', typeof response?.data?.isActive);
    console.log('API: Response data incomeSources:', response?.data?.incomeSources);
    console.log('API: Response data incomeSources length:', response?.data?.incomeSources?.length);
    console.log('=== END API RESPONSE ===');
    if (response && response.success === true && response.data !== null && response.data.id) {
      // Profile found - response.data contains the profile
      console.log('API: ✅ Profile found - returning data');
      console.log('API: Profile ID:', response.data.id);
      console.log('API: Profile isActive:', response.data.isActive);
      console.log('API: Income Sources count:', response.data.incomeSources?.length || 0);
      return response.data;
    } else if (response && response.success === true && response.data === null) {
      // Profile not found - data is null
      console.log('API: ❌ Profile not found - data is null');
      return null;
    } else if (response && response.success === false && response.data === null) {
      // Profile not found - this is a valid response
      console.log('API: ❌ Profile not found - returning null');
      return null;
    } else {
      // Other error or unexpected response format
      console.log('API: ⚠️ Error or unexpected response format');
      console.log('API: Response success:', response?.success);
      console.log('API: Response data:', response?.data);
      throw new Error(response?.message || 'Failed to get user profile');
    }
  }

  async updateUserProfile(profileData: {
    jobTitle: string;
    company: string;
    employmentType: string;
    monthlySavingsGoal: number;
    monthlyInvestmentGoal: number;
    monthlyEmergencyFundGoal: number;
    taxRate: number;
    monthlyTaxDeductions: number;
    industry: string;
    location: string;
    notes: string;
  }): Promise<{
    id: string;
    userId: string;
    jobTitle: string;
    company: string;
    employmentType: string;
    monthlySavingsGoal: number;
    monthlyInvestmentGoal: number;
    monthlyEmergencyFundGoal: number;
    taxRate: number;
    monthlyTaxDeductions: number;
    industry: string;
    location: string;
    notes: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    totalMonthlyIncome: number;
    netMonthlyIncome: number;
    totalMonthlyGoals: number;
    disposableIncome: number;
    incomeSources: Array<{
      id: string;
      userId: string;
      name: string;
      amount: number;
      frequency: string;
      category: string;
      currency: string;
      isActive: boolean;
      description: string;
      company: string;
      createdAt: string;
      updatedAt: string;
      monthlyAmount: number;
    }>;
  }> {
    if (isMockDataEnabled()) {
      return mockDataService.updateUserProfile(profileData);
    }
    const response = await this.request<any>('/UserProfile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    if (response && response.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to update user profile');
  }

  // Loan APIs
  async applyForLoan(application: LoanApplication): Promise<Loan> {
    if (isMockDataEnabled()) {
      return mockDataService.applyForLoan(application);
    }
    
    console.log('API: applyForLoan - Request data:', JSON.stringify(application, null, 2));
    
    const response = await this.request<{ success: boolean; message: string; data: Loan; errors: string[] }>('/Loans/apply', {
      method: 'POST',
      body: JSON.stringify(application),
    });
    
    console.log('API: applyForLoan - Response:', JSON.stringify(response, null, 2));
    
    if (response.success && response.data) {
      return response.data;
    } else {
      // Create error message that includes both message and errors array
      const errorMessage = JSON.stringify({
        message: response.message || 'Failed to apply for loan',
        errors: response.errors || []
      });
      throw new Error(errorMessage);
    }
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
    principal?: number;
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
    bankAccountId?: string;
  }): Promise<any> {
    if (isMockDataEnabled()) {
      return mockDataService.makeLoanPayment(loanId, paymentData);
    }
    const requestBody: any = {
      loanId,
      amount: paymentData.amount,
      method: paymentData.method,
      reference: paymentData.reference,
    };

    // Only include bankAccountId if provided (for bank-related payments)
    if (paymentData.bankAccountId) {
      requestBody.bankAccountId = paymentData.bankAccountId;
    }

    const response = await this.request<any>('/Payments', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
    
    // Handle the response structure
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async deletePayment(paymentId: string): Promise<boolean> {
    if (isMockDataEnabled()) {
      return mockDataService.deletePayment(paymentId);
    }
    
    const response = await this.request<any>(`/Payments/${paymentId}`, {
      method: 'DELETE',
    });
    
    return response?.data || response || true;
  }

  async getOutstandingAmount(): Promise<number> {
    if (isMockDataEnabled()) {
      return mockDataService.getOutstandingAmount();
    }
    const response = await this.request<any>('/Loans/outstanding-amount');
    
    // Handle the response structure
    if (response && response.data !== undefined) {
      return response.data;
    }
    return 0;
  }

  async getMonthlyPaymentTotal(): Promise<{
    totalMonthlyPayment: number;
    totalRemainingBalance: number;
    activeLoanCount: number;
    totalPayment: number;
    totalPaymentRemaining: number;
    totalMonthsRemaining: number;
    loans: Array<{
      id: string;
      purpose: string;
      monthlyPayment: number;
      remainingBalance: number;
      interestRate: number;
      totalInstallments: number;
      installmentsRemaining: number;
      monthsRemaining: number;
    }>;
  }> {
    if (isMockDataEnabled()) {
      return mockDataService.getMonthlyPaymentTotal();
    }
    const response = await this.request<any>('/Loans/monthly-payment-total');
    
    // Handle the response structure
    if (response && response.success && response.data) {
      return response.data;
    } else if (response && response.data) {
      return response.data;
    }
    
    // Return default empty data if response is invalid
    return {
      totalMonthlyPayment: 0,
      totalRemainingBalance: 0,
      activeLoanCount: 0,
      totalPayment: 0,
      totalPaymentRemaining: 0,
      totalMonthsRemaining: 0,
      loans: []
    };
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
    const response = await this.request<any>(`/Loans/${loanId}/schedule`);
    
    // Handle the response structure
    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    } else if (response && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    }
    return [];
  }

  // Due Date Tracking APIs
  async getUpcomingPayments(days: number = 30): Promise<UpcomingPayment[]> {
    if (isMockDataEnabled()) {
      return mockDataService.getUpcomingPayments(days);
    }
    const response = await this.request<any>(`/Loans/upcoming-payments?days=${days}`);
    
    // Handle the response structure
    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    } else if (response && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    }
    return [];
  }

  async getOverduePayments(): Promise<OverduePayment[]> {
    if (isMockDataEnabled()) {
      return mockDataService.getOverduePayments();
    }
    const response = await this.request<any>('/Loans/overdue-payments');
    
    // Handle the response structure
    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    } else if (response && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    }
    return [];
  }

  async getNextDueDate(loanId: string): Promise<string | null> {
    if (isMockDataEnabled()) {
      return mockDataService.getNextDueDate(loanId);
    }
    const response = await this.request<any>(`/Loans/${loanId}/next-due-date`);
    
    // Handle the response structure
    if (response && response.success && response.data !== undefined) {
      return response.data;
    } else if (response && response.data !== undefined) {
      return response.data;
    }
    return null;
  }

  async updateScheduleDueDate(loanId: string, installmentNumber: number, newDueDate: string): Promise<RepaymentSchedule> {
    if (isMockDataEnabled()) {
      return mockDataService.updateScheduleDueDate(loanId, installmentNumber, newDueDate);
    }
    const response = await this.request<any>(`/Loans/${loanId}/schedule/${installmentNumber}`, {
      method: 'PUT',
      body: JSON.stringify({ newDueDate }),
    });
    
    // Handle the response structure
    if (response && response.data) {
      return response.data;
    }
    return response;
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
  async getNotifications(userId: string, params?: GetNotificationsParams): Promise<NotificationsResponse> {
    if (isMockDataEnabled()) {
      return mockDataService.getNotifications(userId, params);
    }
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.unreadOnly) queryParams.append('unreadOnly', params.unreadOnly.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/Notifications/user/${userId}${queryString ? `?${queryString}` : ''}`;
    
    return this.request<NotificationsResponse>(endpoint);
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
    console.log('=== API Service: getUserBills ===');
    console.log('Mock data enabled?', isMockDataEnabled());
    
    if (isMockDataEnabled()) {
      console.log('⚠️ USING MOCK DATA for bills!');
      const user = this.getCurrentUserFromToken();
      return mockBillDataService.getUserBills(user?.id || 'demo-user-123', filters);
    }
    
    console.log('✅ Using REAL API for bills');
    console.log('API Base URL:', API_BASE_URL);
    
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.billType) queryParams.append('billType', filters.billType);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/bills${queryString ? `?${queryString}` : ''}`;
    console.log('Fetching from:', endpoint);
    
    const response = await this.request<any>(endpoint);
    console.log('API Response received:', !!response);
    
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
    
    const response = await this.request<any>(`/Bills/${billId}`, {
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

  // ==================== VARIABLE MONTHLY BILLING APIs ====================

  // Get bill history with analytics
  async getBillHistory(params?: {
    provider?: string;
    billType?: BillType;
    months?: number;
  }): Promise<BillHistoryAnalytics> {
    // If no params provided, call endpoint without query string
    if (!params || (!params.provider && !params.billType && !params.months)) {
      const response = await this.request<any>('/bills/analytics/history');
      
      if (response && response.success && response.data) {
        return response.data;
      }
      throw new Error(response?.message || 'Failed to get bill history');
    }
    
    // With params, build query string
    const queryParams = new URLSearchParams();
    if (params.provider) queryParams.append('provider', params.provider);
    if (params.billType) queryParams.append('billType', params.billType);
    if (params.months) queryParams.append('months', params.months.toString());
    
    const response = await this.request<any>(`/bills/analytics/history?${queryParams}`);
    
    if (response && response.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to get bill history');
  }

  // Get forecast for next month
  async getBillForecast(params: {
    provider?: string;
    billType?: BillType;
    method?: 'simple' | 'weighted' | 'seasonal';
  }): Promise<BillForecast> {
    const queryParams = new URLSearchParams();
    if (params.provider) queryParams.append('provider', params.provider);
    if (params.billType) queryParams.append('billType', params.billType);
    if (params.method) queryParams.append('method', params.method);
    
    const response = await this.request<any>(`/bills/analytics/forecast?${queryParams}`);
    
    if (response && response.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to get forecast');
  }

  // Get variance analysis for a bill
  async getBillVariance(billId: string): Promise<BillVariance> {
    const response = await this.request<any>(`/bills/${billId}/variance`);
    
    if (response && response.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to get variance');
  }

  // Create or update budget
  async setBillBudget(budgetData: CreateBudgetRequest): Promise<BillBudget> {
    const response = await this.request<any>('/bills/budgets', {
      method: 'POST',
      body: JSON.stringify(budgetData),
    });
    
    if (response && response.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to set budget');
  }

  // Update existing budget
  async updateBillBudget(budgetId: string, budgetData: Partial<CreateBudgetRequest>): Promise<BillBudget> {
    const response = await this.request<any>(`/bills/budgets/${budgetId}`, {
      method: 'PUT',
      body: JSON.stringify(budgetData),
    });
    
    if (response && response.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to update budget');
  }

  // Delete budget
  async deleteBillBudget(budgetId: string): Promise<boolean> {
    const response = await this.request<any>(`/bills/budgets/${budgetId}`, {
      method: 'DELETE',
    });
    return response && response.success;
  }

  // Get budget status
  async getBudgetStatus(params: {
    provider?: string;
    billType?: BillType;
  }): Promise<BudgetStatus> {
    const queryParams = new URLSearchParams();
    if (params.provider) queryParams.append('provider', params.provider);
    if (params.billType) queryParams.append('billType', params.billType);
    
    const response = await this.request<any>(`/bills/budgets/status?${queryParams}`);
    
    if (response && response.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to get budget status');
  }

  // Get all budgets
  async getUserBudgets(): Promise<BillBudget[]> {
    const response = await this.request<any>('/bills/budgets');
    
    if (response && response.success && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    return [];
  }

  // Get dashboard data
  async getBillDashboard(): Promise<BillDashboard> {
    const response = await this.request<any>('/bills/dashboard');
    
    if (response && response.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to get dashboard');
  }

  // Get alerts
  async getBillAlerts(): Promise<BillAlert[]> {
    const response = await this.request<any>('/bills/alerts');
    
    if (response && response.success && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    return [];
  }

  // Mark alert as read
  async markAlertAsRead(alertId: string): Promise<void> {
    await this.request<any>(`/bills/alerts/${alertId}/read`, {
      method: 'PUT',
    });
  }

  // Get monthly trend data
  async getMonthlyTrend(params: {
    provider: string;
    billType?: BillType;
    months?: number;
  }): Promise<MonthlyBillData[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('provider', params.provider);
    if (params.billType) queryParams.append('billType', params.billType);
    if (params.months) queryParams.append('months', params.months.toString());
    
    const response = await this.request<any>(`/bills/analytics/trend?${queryParams}`);
    
    if (response && response.success && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    return [];
  }

  // Get provider analytics
  async getProviderAnalytics(provider?: string): Promise<ProviderAnalytics[]> {
    const endpoint = provider 
      ? `/bills/analytics/providers/${encodeURIComponent(provider)}`
      : '/bills/analytics/providers';
    
    const response = await this.request<any>(endpoint);
    
    if (response && response.success && response.data) {
      return Array.isArray(response.data) ? response.data : [response.data];
    }
    return [];
  }

  // ==================== AUTO-RECURRING BILLS APIs ====================

  // Auto-generate next month's bill for a specific provider
  async autoGenerateNextBill(provider: string, billType: BillType): Promise<Bill> {
    const queryParams = new URLSearchParams();
    queryParams.append('provider', provider);
    queryParams.append('billType', billType);
    
    const response = await this.request<any>(`/bills/auto-generate?${queryParams}`, {
      method: 'POST',
    });
    
    if (response && response.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to auto-generate bill');
  }

  // Auto-generate next month's bills for all providers with auto-gen enabled
  async autoGenerateAllBills(): Promise<Bill[]> {
    const response = await this.request<any>('/bills/auto-generate-all', {
      method: 'POST',
    });
    
    if (response && response.success && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    return [];
  }

  // Confirm or update amount for auto-generated bill
  async confirmBillAmount(billId: string, amount: number, notes?: string): Promise<Bill> {
    const response = await this.request<any>(`/bills/${billId}/confirm-amount`, {
      method: 'PUT',
      body: JSON.stringify({ amount, notes }),
    });
    
    if (response && response.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to confirm bill amount');
  }

  // Get auto-generated bills (optionally filter by confirmation status)
  async getAutoGeneratedBills(confirmed?: boolean): Promise<Bill[]> {
    const queryParams = confirmed !== undefined ? `?confirmed=${confirmed}` : '';
    const response = await this.request<any>(`/bills/auto-generated${queryParams}`);
    
    if (response && response.success && response.data) {
      return Array.isArray(response.data) ? response.data : [];
    }
    return [];
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
    const response = await this.request<any>(`/BankAccounts/transactions?limit=${limit}`);
    
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
    const endpoint = `/BankAccounts/transactions${queryString ? `?${queryString}` : ''}`;
    const response = await this.request<any>(endpoint);
    
    // Handle the new response format: { success: true, data: BankAccountTransaction[], errors: [] }
    if (response && response.success && Array.isArray(response.data)) {
      return { 
        data: response.data, 
        page: 1, 
        limit: response.data.length, 
        totalCount: response.data.length 
      };
    } else if (response && response.data && Array.isArray(response.data.data)) {
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
    const response = await this.request<any>(`/BankAccounts/transactions/${transactionId}`);
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async deleteTransaction(transactionId: string): Promise<boolean> {
    if (isMockDataEnabled()) {
      return mockTransactionDataService.deleteTransaction(transactionId);
    }
    
    const response = await this.request<any>(`/BankAccounts/transactions/${transactionId}`, {
      method: 'DELETE',
    });
    
    // Handle the new response format: { success: true, message: "string", data: true, errors: [] }
    if (response && response.success) {
      return response.data || true;
    }
    
    return response?.data || response || true;
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

  async createBankTransaction(transactionData: {
    bankAccountId: string;
    amount: number;
    transactionType: 'DEBIT' | 'CREDIT';
    description: string;
    category?: string;
    merchant?: string;
    location?: string;
    transactionDate: string;
    notes?: string;
    isRecurring?: boolean;
    recurringFrequency?: string;
    referenceNumber?: string;
    externalTransactionId?: string;
    currency?: string;
    // NEW: Reference Fields for Smart Linking
    billId?: string;           // For bill-related transactions
    savingsAccountId?: string; // For savings-related transactions
    loanId?: string;           // For loan-related transactions
  }): Promise<BankAccountTransaction> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockTransactionDataService.createBankTransaction(user?.id || 'demo-user-123', transactionData);
    }
    const response = await this.request<any>('/bankaccounts/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async getBankAccountSummary(): Promise<{
    totalBalance: number;
    totalAccounts: number;
    activeAccounts: number;
    connectedAccounts: number;
    totalIncoming: number;
    totalOutgoing: number;
    accounts: any[];
  }> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockBankAccountDataService.getBankAccountSummary(user?.id || 'demo-user-123');
    }
    const response = await this.request<any>('/BankAccounts/summary');
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  // ==================== SAVINGS MANAGEMENT APIs ====================

  // Create a new savings account
  async createSavingsAccount(accountData: {
    accountName: string;
    savingsType: string;
    targetAmount: number;
    description?: string;
    goal?: string;
    targetDate: string;
    currency?: string;
  }): Promise<any> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockDataService.createSavingsAccount(user?.id || 'demo-user-123', accountData);
    }
    const response = await this.request<any>('/Savings/accounts', {
      method: 'POST',
      body: JSON.stringify(accountData),
    });
    return response.data;
  }

  // Get all savings accounts for the authenticated user
  async getSavingsAccounts(filters?: {
    savingsType?: string;
    isActive?: boolean;
    page?: number;
    limit?: number;
  }): Promise<any> {
    console.log('🔍 getSavingsAccounts called with filters:', filters);
    console.log('🔍 Mock data enabled:', isMockDataEnabled());
    
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      console.log('🔍 Using mock data for user:', user?.id);
      const result = await mockDataService.getSavingsAccounts(user?.id || 'demo-user-123', filters);
      console.log('🔍 Mock data result:', result);
      return result;
    }
    
    const queryParams = new URLSearchParams();
    if (filters?.savingsType) queryParams.append('savingsType', filters.savingsType);
    if (filters?.isActive !== undefined) queryParams.append('isActive', filters.isActive.toString());
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    
    const endpoint = `/Savings/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('🔍 Making API request to:', endpoint);
    
    try {
      const response = await this.request<any>(endpoint);
      console.log('🔍 API response received:', response);
      console.log('🔍 Response data:', response.data);
      // The API returns { success: true, data: [...], errors: [] }
      // So we need to return the nested data array
      return response.data;
    } catch (error) {
      console.error('🔍 API request failed:', error);
      throw error;
    }
  }

  // Get a specific savings account with transactions
  async getSavingsAccount(accountId: string): Promise<any> {
    if (isMockDataEnabled()) {
      return mockDataService.getSavingsAccount(accountId);
    }
    const response = await this.request<any>(`/Savings/accounts/${accountId}`);
    return response.data;
  }

  // Update a savings account
  async updateSavingsAccount(accountId: string, accountData: {
    accountName?: string;
    savingsType?: string;
    targetAmount?: number;
    description?: string;
    goal?: string;
    targetDate?: string;
    currency?: string;
  }): Promise<any> {
    if (isMockDataEnabled()) {
      return mockDataService.updateSavingsAccount(accountId, accountData);
    }
    const response = await this.request<any>(`/Savings/accounts/${accountId}`, {
      method: 'PUT',
      body: JSON.stringify(accountData),
    });
    return response.data;
  }

  // Delete a savings account
  async deleteSavingsAccount(accountId: string): Promise<void> {
    if (isMockDataEnabled()) {
      return mockDataService.deleteSavingsAccount(accountId);
    }
    await this.request<void>(`/Savings/accounts/${accountId}`, {
      method: 'DELETE',
    });
  }

  // Create a savings transaction (creates both SavingsTransaction and Payment records)
  async createSavingsTransaction(transactionData: {
    savingsAccountId: string;
    sourceBankAccountId?: string;
    amount: number;
    transactionType: 'DEPOSIT' | 'WITHDRAWAL';
    description: string;
    category?: string;
    notes?: string;
    transactionDate?: string;
    currency?: string;
    isRecurring?: boolean;
    recurringFrequency?: string;
    method?: string;
  }): Promise<any> {
    if (isMockDataEnabled()) {
      return mockDataService.createSavingsTransaction(transactionData);
    }
    const response = await this.request<any>('/Savings/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
    return response.data;
  }

  // Get savings transactions for an account
  async getSavingsTransactions(accountId: string, filters?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    if (isMockDataEnabled()) {
      return mockDataService.getSavingsTransactions(accountId, filters);
    }
    
    const queryParams = new URLSearchParams();
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    if (filters?.startDate) queryParams.append('startDate', filters.startDate);
    if (filters?.endDate) queryParams.append('endDate', filters.endDate);
    
    const endpoint = `/Savings/accounts/${accountId}/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(endpoint);
    return response.data;
  }

  // Get savings summary
  async getSavingsSummary(): Promise<any> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockDataService.getSavingsSummary(user?.id || 'demo-user-123');
    }
    const response = await this.request<any>('/savings/summary');
    return response.data;
  }

  // Get savings analytics
  async getSavingsAnalytics(period?: string): Promise<any> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockDataService.getSavingsAnalytics(user?.id || 'demo-user-123', period);
    }
    
    const queryParams = new URLSearchParams();
    if (period) queryParams.append('period', period);
    
    const endpoint = `/savings/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(endpoint);
    return response.data;
  }

  // Transfer from bank to savings
  async transferBankToSavings(transferData: {
    bankAccountId: string;
    savingsAccountId: string;
    amount: number;
    description: string;
  }): Promise<any> {
    if (isMockDataEnabled()) {
      return mockDataService.transferBankToSavings(transferData);
    }
    const response = await this.request<any>('/savings/transfer/bank-to-savings', {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
    return response.data;
  }

  // Transfer from savings to bank
  async transferSavingsToBank(transferData: {
    savingsAccountId: string;
    bankAccountId: string;
    amount: number;
    description: string;
  }): Promise<any> {
    if (isMockDataEnabled()) {
      return mockDataService.transferSavingsToBank(transferData);
    }
    const response = await this.request<any>('/savings/transfer/savings-to-bank', {
      method: 'POST',
      body: JSON.stringify(transferData),
    });
    return response.data;
  }

  // Update savings goal
  async updateSavingsGoal(accountId: string, goalData: {
    targetAmount: number;
    targetDate: string;
  }): Promise<any> {
    if (isMockDataEnabled()) {
      return mockDataService.updateSavingsGoal(accountId, goalData);
    }
    const response = await this.request<any>(`/savings/accounts/${accountId}/goal`, {
      method: 'PUT',
      body: JSON.stringify(goalData),
    });
    return response.data;
  }

  // Get total monthly income
  async getTotalMonthlyIncome(): Promise<number> {
    if (isMockDataEnabled()) {
      // Return mock monthly income
      return 5000.00;
    }
    const response = await this.request<{ success: boolean; data: number; message: string | null; errors: string[] }>('/IncomeSource/total-monthly-income');
    return response.data;
  }

  // Get all income sources
  async getIncomeSources(): Promise<any> {
    if (isMockDataEnabled()) {
      // Return mock response with sample income sources matching the real API format
      return {
        success: true,
        message: 'Success',
        data: [
          {
            id: '0cb9d9b1-8ad3-47ea-9ebb-97bd7d888c03',
            userId: '34e5ee71-d06f-4b45-80e2-80dd9e5668f8',
            name: 'Rental my house',
            amount: 480.00,
            frequency: 'MONTHLY',
            category: 'PASSIVE',
            currency: 'USD',
            isActive: true,
            description: 'passive income',
            company: 'Own passive',
            createdAt: '2025-09-29T20:39:07.2149178',
            updatedAt: '2025-09-29T20:39:07.2149634',
            monthlyAmount: 480.00
          },
          {
            id: '88073e74-2151-4021-9f5c-0f9b8e079dea',
            userId: '34e5ee71-d06f-4b45-80e2-80dd9e5668f8',
            name: 'Company Salary',
            amount: 10500.00,
            frequency: 'MONTHLY',
            category: 'PRIMARY',
            currency: 'USD',
            isActive: true,
            description: '',
            company: '',
            createdAt: '2025-09-26T15:06:05.3077854',
            updatedAt: '2025-09-26T15:06:05.3078278',
            monthlyAmount: 10500.00
          }
        ],
        errors: []
      };
    }
    const response = await this.request<{ success: boolean; message: string; data: any[]; errors: string[] }>('/IncomeSource');
    return response;
  }

  // Create income source
  async createIncomeSource(incomeSourceData: {
    name: string;
    amount: number;
    frequency: string;
    category: string;
    currency: string;
    description: string;
    company: string;
  }): Promise<any> {
    if (isMockDataEnabled()) {
      // Return mock response
      return {
        success: true,
        message: 'Income source created successfully',
        data: {
          id: `income-${Date.now()}`,
          userId: 'demo-user-123',
          ...incomeSourceData,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          monthlyAmount: incomeSourceData.frequency === 'monthly' ? incomeSourceData.amount : 
                        incomeSourceData.frequency === 'weekly' ? incomeSourceData.amount * 4.33 :
                        incomeSourceData.frequency === 'yearly' ? incomeSourceData.amount / 12 :
                        incomeSourceData.amount
        },
        errors: []
      };
    }
    const response = await this.request<{ success: boolean; message: string; data: any; errors: string[] }>('/IncomeSource', {
      method: 'POST',
      body: JSON.stringify(incomeSourceData),
    });
    return response.data;
  }

  // Create bulk income sources
  async createBulkIncomeSources(incomeSources: {
    name: string;
    amount: number;
    frequency: string;
    category: string;
    currency: string;
    description: string;
    company: string | null;
  }[]): Promise<any> {
    if (isMockDataEnabled()) {
      // Return mock response with multiple income sources
      const mockData = incomeSources.map((source, index) => ({
        id: `income-bulk-${Date.now()}-${index}`,
        userId: 'demo-user-123',
        ...source,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        monthlyAmount: source.frequency === 'MONTHLY' ? source.amount : 
                      source.frequency === 'WEEKLY' ? source.amount * 4.33 :
                      source.frequency === 'QUARTERLY' ? source.amount / 3 :
                      source.frequency === 'YEARLY' ? source.amount / 12 :
                      source.amount
      }));

      return {
        success: true,
        message: 'All income sources created successfully',
        data: mockData,
        errors: []
      };
    }
    const response = await this.request<{ success: boolean; message: string; data: any[]; errors: string[] }>('/IncomeSource/bulk', {
      method: 'POST',
      body: JSON.stringify({ incomeSources }),
    });
    return response.data;
  }

  // Get income sources with summary
  async getIncomeSourcesWithSummary(activeOnly: boolean = true): Promise<any> {
    if (isMockDataEnabled()) {
      // Return mock response with income sources and summary
      return {
        success: true,
        message: null,
        data: {
          incomeSources: [
            {
              id: 'income-source-id-1',
              userId: 'user-id',
              name: 'Primary Salary',
              amount: 4000.00,
              frequency: 'MONTHLY',
              category: 'PRIMARY',
              currency: 'USD',
              isActive: true,
              description: 'Main job salary',
              company: 'Tech Corp',
              createdAt: '2024-01-01T10:00:00Z',
              updatedAt: '2024-01-01T10:00:00Z',
              monthlyAmount: 4000.00
            },
            {
              id: 'income-source-id-2',
              userId: 'user-id',
              name: 'Freelance Work',
              amount: 250.00,
              frequency: 'WEEKLY',
              category: 'SIDE_HUSTLE',
              currency: 'USD',
              isActive: true,
              description: 'Web development projects',
              company: 'Freelance',
              createdAt: '2024-01-01T10:00:00Z',
              updatedAt: '2024-01-01T10:00:00Z',
              monthlyAmount: 1082.50
            }
          ],
          totalActiveSources: 2,
          totalPrimarySources: 1,
          totalSources: 2,
          totalMonthlyIncome: 5082.50
        },
        errors: []
      };
    }
    const response = await this.request<{ success: boolean; message: string | null; data: any; errors: string[] }>(`/IncomeSource/with-summary?activeOnly=${activeOnly}`);
    return response;
  }

  // Delete income source
  async deleteIncomeSource(incomeSourceId: string): Promise<any> {
    if (isMockDataEnabled()) {
      // Return mock response
      return {
        success: true,
        message: 'Income source deleted successfully',
        data: true,
        errors: []
      };
    }
    const response = await this.request<{ success: boolean; message: string; data: boolean; errors: string[] }>(`/IncomeSource/${incomeSourceId}`, {
      method: 'DELETE',
    });
    return response.data;
  }

  // Update income source
  async updateIncomeSource(incomeSourceId: string, incomeSourceData: {
    name: string;
    amount: number;
    frequency: string;
    category: string;
    currency: string;
    description: string;
    company: string;
    isActive: boolean;
  }): Promise<any> {
    if (isMockDataEnabled()) {
      // Return mock response
      return {
        success: true,
        message: 'Income source updated successfully',
        data: {
          id: incomeSourceId,
          userId: 'demo-user-123',
          ...incomeSourceData,
          createdAt: '2025-10-01T20:24:34.521Z',
          updatedAt: new Date().toISOString(),
          monthlyAmount: incomeSourceData.frequency === 'MONTHLY' ? incomeSourceData.amount : 
                        incomeSourceData.frequency === 'WEEKLY' ? incomeSourceData.amount * 4.33 :
                        incomeSourceData.frequency === 'QUARTERLY' ? incomeSourceData.amount / 3 :
                        incomeSourceData.frequency === 'YEARLY' ? incomeSourceData.amount / 12 :
                        incomeSourceData.amount
        },
        errors: []
      };
    }
    const response = await this.request<{ success: boolean; message: string; data: any; errors: string[] }>(`/IncomeSource/${incomeSourceId}`, {
      method: 'PUT',
      body: JSON.stringify(incomeSourceData),
    });
    return response.data;
  }

  // Get income source by ID
  async getIncomeSourceById(incomeSourceId: string): Promise<any> {
    if (isMockDataEnabled()) {
      // Return mock response
      return {
        success: true,
        message: 'Income source retrieved successfully',
        data: {
          id: incomeSourceId,
          userId: 'demo-user-123',
          name: 'Company Salary',
          amount: 5000.00,
          frequency: 'MONTHLY',
          category: 'PRIMARY',
          currency: 'USD',
          isActive: true,
          description: 'Main job salary',
          company: 'Tech Corp',
          createdAt: '2025-10-01T20:30:07.800Z',
          updatedAt: '2025-10-01T20:30:07.800Z',
          monthlyAmount: 5000.00
        },
        errors: []
      };
    }
    const response = await this.request<{ success: boolean; message: string; data: any; errors: string[] }>(`/IncomeSource/${incomeSourceId}`);
    return response;
  }
}

export const apiService = new ApiService();
export default apiService;
