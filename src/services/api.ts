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
  OverduePayment,
  AddCustomScheduleRequest,
  ExtendLoanTermRequest,
  RegenerateScheduleRequest,
  UpdateScheduleRequest,
  MarkAsPaidRequest,
  UpdateDueDateRequest,
  ScheduleOperationResponse,
  DisbursementResponse
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
import { Receivable, CreateReceivableRequest, UpdateReceivableRequest, ReceivableFilters, ReceivableAnalytics, PaginatedReceivablesResponse, ReceivablePayment, CreateReceivablePaymentRequest } from '../types/receivable';
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
        console.error('API Service: Error status:', response.status);
        
        // Redirect to login on unauthorized/session timeout
        if (response.status === 401 || response.status === 440) {
          try {
            localStorage.removeItem('authToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
          } catch {}
          // Use hard redirect to ensure full app reset
          if (typeof window !== 'undefined') {
            window.location.href = '/auth';
          }
        }
        
        // Create error with status code and error data
        const error = new Error(errorData.message || errorData.title || `HTTP error! status: ${response.status}`);
        (error as any).status = response.status;
        (error as any).errorData = errorData;
        
        // Handle 400 validation errors with detailed field errors
        if (response.status === 400) {
          if (errorData.errors && Array.isArray(errorData.errors)) {
            // Handle array of error messages
            const errorMessages = errorData.errors.join(', ');
            (error as any).message = errorData.message || 'Validation failed';
            (error as any).errors = errorData.errors;
            throw error;
          } else if (errorData.errors && typeof errorData.errors === 'object') {
            // Handle object with field errors
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
              (error as any).message = errorData.message || 'Validation failed';
              (error as any).errors = fieldErrors;
              throw error;
            }
          }
        }
        
        // Handle 404 and 403 errors
        if (response.status === 404 || response.status === 403) {
          (error as any).message = errorData.message || errorData.title || (response.status === 404 ? 'User not found' : 'Forbidden');
          (error as any).errors = errorData.errors || [];
          throw error;
        }
        
        // Handle other error responses
        throw error;
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

  async forgotPassword(email: string): Promise<{
    success: boolean;
    message: string;
    data: {};
  }> {
    const response = await this.request<{
      success: boolean;
      message: string;
      data: {};
    }>('/Auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return response;
  }

  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: {} | null;
    errors: string[];
  }> {
    if (isMockDataEnabled()) {
      // Mock implementation
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        return {
          success: false,
          message: 'New password and confirm password do not match',
          data: null,
          errors: ['New password and confirm password do not match'],
        };
      }
      return {
        success: true,
        message: 'Password changed successfully',
        data: {},
        errors: [],
      };
    }

    const response = await this.request<{
      success: boolean;
      message: string;
      data: {} | null;
      errors: string[];
    }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      }),
    });
    return response;
  }

  async clearAllUserData(clearData: {
    password: string;
    agreementConfirmed: boolean;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      message: string;
      deletedRecords: {
        payments?: number;
        loans?: number;
        bills?: number;
        bankAccounts?: number;
        savingsAccounts?: number;
        notifications?: number;
        incomeSources?: number;
        variableExpenses?: number;
        [key: string]: number | undefined;
      };
      totalRecordsDeleted: number;
    } | null;
    errors: string[];
  }> {
    if (isMockDataEnabled()) {
      // Mock implementation
      if (!clearData.agreementConfirmed) {
        return {
          success: false,
          message: 'You must confirm the agreement to delete all your data',
          data: null,
          errors: ['You must confirm the agreement to delete all your data'],
        };
      }
      return {
        success: true,
        message: 'Successfully deleted 150 records across 8 categories.',
        data: {
          message: 'All user data has been cleared successfully',
          deletedRecords: {
            payments: 20,
            loans: 5,
            bills: 10,
            bankAccounts: 2,
            savingsAccounts: 1,
            notifications: 15,
            incomeSources: 3,
            variableExpenses: 8,
          },
          totalRecordsDeleted: 150,
        },
        errors: [],
      };
    }

    const response = await this.request<{
      success: boolean;
      message: string;
      data: {
        message: string;
        deletedRecords: {
          payments?: number;
          loans?: number;
          bills?: number;
          bankAccounts?: number;
          savingsAccounts?: number;
          notifications?: number;
          incomeSources?: number;
          variableExpenses?: number;
          [key: string]: number | undefined;
        };
        totalRecordsDeleted: number;
      } | null;
      errors: string[];
    }>('/auth/clear-all-data', {
      method: 'POST',
      body: JSON.stringify({
        password: clearData.password,
        agreementConfirmed: clearData.agreementConfirmed,
      }),
    });
    return response;
  }

  async resetPassword(resetData: {
    token: string;
    email: string;
    newPassword: string;
    confirmPassword: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: {};
    errors: string[];
  }> {
    if (isMockDataEnabled()) {
      // Mock implementation
      if (resetData.newPassword !== resetData.confirmPassword) {
        return {
          success: false,
          message: 'New password and confirm password do not match',
          data: {},
          errors: ['New password and confirm password do not match'],
        };
      }
      return {
        success: true,
        message: 'Password reset successfully',
        data: {},
        errors: [],
      };
    }

    const response = await this.request<{
      success: boolean;
      message: string;
      data: {};
      errors: string[];
    }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: resetData.token,
        email: resetData.email,
        newPassword: resetData.newPassword,
        confirmPassword: resetData.confirmPassword,
      }),
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

  async updateUser(userId: string, userData: { name: string; phone: string }): Promise<{
    success: boolean;
    message: string;
    data: User | null;
    errors: string[];
  }> {
    if (isMockDataEnabled()) {
      // Mock implementation
      return {
        success: true,
        message: 'User updated successfully',
        data: {
          id: userId,
          name: userData.name,
          email: '',
          phone: userData.phone,
          kycVerified: false,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        errors: [],
      };
    }

    const response = await this.request<{
      success: boolean;
      message: string;
      data: User | null;
      errors: string[];
    }>(`/Users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
    return response;
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
    preferredCurrency: string;
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
    preferredCurrency: string;
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
      console.log('API: Profile preferredCurrency:', response.data.preferredCurrency);
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

  async updateUserProfileCurrency(currency: string): Promise<{
    success: boolean;
    message: string;
    data: any | null;
    errors: string[];
  }> {
    if (isMockDataEnabled()) {
      return {
        success: true,
        message: 'Currency updated successfully',
        data: { preferredCurrency: currency },
        errors: [],
      };
    }

    const response = await this.request<{
      success: boolean;
      message: string;
      data: any | null;
      errors: string[];
    }>('/UserProfile/currency', {
      method: 'PUT',
      body: JSON.stringify({ currency }),
    });
    return response;
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
    preferredCurrency: string;
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
    preferredCurrency: string;
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
    
    // Use the new accounting system endpoint: POST /api/loans/{loanId}/payment
    const requestBody: any = {
      amount: paymentData.amount,
      method: paymentData.method,
      reference: paymentData.reference,
    };

    // Only include bankAccountId if provided (for bank-related payments)
    if (paymentData.bankAccountId) {
      requestBody.bankAccountId = paymentData.bankAccountId;
    }

    const response = await this.request<any>(`/Loans/${loanId}/payment`, {
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

  // ==================== PAYMENT SCHEDULE MANAGEMENT APIs ====================

  // 📅 Add Payment Schedule APIs

  // Add Custom Payment Installments
  async addCustomPaymentSchedule(loanId: string, request: AddCustomScheduleRequest): Promise<ScheduleOperationResponse> {
    if (isMockDataEnabled()) {
      // Mock implementation for adding custom schedule
      const mockSchedules: RepaymentSchedule[] = [];
      for (let i = 0; i < request.numberOfMonths; i++) {
        const dueDate = new Date(request.firstDueDate);
        dueDate.setMonth(dueDate.getMonth() + i);
        
        mockSchedules.push({
          id: `schedule-${Date.now()}-${i}`,
          loanId,
          installmentNumber: request.startingInstallmentNumber + i,
          dueDate: dueDate.toISOString(),
          totalAmount: request.monthlyPayment,
          principalAmount: request.monthlyPayment * 0.8,
          interestAmount: request.monthlyPayment * 0.2,
          status: 'PENDING' as any
        });
      }
      
      return {
        success: true,
        message: `Added ${request.numberOfMonths} custom payment installments successfully`,
        data: mockSchedules
      };
    }

    const response = await this.request<ScheduleOperationResponse>(`/Loans/${loanId}/add-schedule`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    return response;
  }

  // Extend Loan Term (Adds Months)
  async extendLoanTerm(loanId: string, request: ExtendLoanTermRequest): Promise<ScheduleOperationResponse> {
    if (isMockDataEnabled()) {
      return {
        success: true,
        message: `Extended loan term by ${request.additionalMonths} months successfully`,
        data: true
      };
    }

    const response = await this.request<ScheduleOperationResponse>(`/Loans/${loanId}/extend-term`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    return response;
  }

  // Regenerate Entire Schedule
  async regeneratePaymentSchedule(loanId: string, request: RegenerateScheduleRequest): Promise<ScheduleOperationResponse> {
    if (isMockDataEnabled()) {
      return {
        success: true,
        message: 'Payment schedule regenerated successfully',
        data: true
      };
    }

    const response = await this.request<ScheduleOperationResponse>(`/Loans/${loanId}/regenerate-schedule`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    return response;
  }

  // ✏️ Update Payment Schedule APIs

  // Simple Schedule Update (MAIN UPDATE API)
  async updatePaymentSchedule(loanId: string, installmentNumber: number, request: UpdateScheduleRequest): Promise<ScheduleOperationResponse> {
    if (isMockDataEnabled()) {
      return {
        success: true,
        message: 'Payment schedule updated successfully',
        data: {
          id: `schedule-${loanId}-${installmentNumber}`,
          loanId,
          installmentNumber,
          dueDate: request.dueDate || new Date().toISOString(),
          totalAmount: request.amount || 825.00,
          principalAmount: (request.amount || 825.00) * 0.8,
          interestAmount: (request.amount || 825.00) * 0.2,
          status: request.status || 'PENDING' as any,
          paidDate: request.paidDate,
          paymentMethod: request.paymentMethod,
          paymentReference: request.paymentReference,
          notes: request.notes
        }
      };
    }

    const response = await this.request<ScheduleOperationResponse>(`/Loans/${loanId}/schedule/${installmentNumber}`, {
      method: 'PATCH',
      body: JSON.stringify(request),
    });
    
    return response;
  }

  // Mark Installment as Paid
  async markInstallmentAsPaid(loanId: string, installmentNumber: number, request: MarkAsPaidRequest): Promise<ScheduleOperationResponse> {
    if (isMockDataEnabled()) {
      return {
        success: true,
        message: 'Installment marked as paid successfully',
        data: {
          id: `schedule-${loanId}-${installmentNumber}`,
          loanId,
          installmentNumber,
          dueDate: new Date().toISOString(),
          totalAmount: request.amount,
          principalAmount: request.amount * 0.8,
          interestAmount: request.amount * 0.2,
          status: 'PAID' as any,
          paidDate: request.paymentDate,
          paymentMethod: request.method,
          paymentReference: request.reference,
          notes: request.notes
        }
      };
    }

    const response = await this.request<ScheduleOperationResponse>(`/Loans/${loanId}/schedule/${installmentNumber}/mark-paid`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    return response;
  }

  // Update Due Date Only
  async updateInstallmentDueDate(loanId: string, installmentNumber: number, request: UpdateDueDateRequest): Promise<ScheduleOperationResponse> {
    if (isMockDataEnabled()) {
      return {
        success: true,
        message: 'Due date updated successfully',
        data: {
          id: `schedule-${loanId}-${installmentNumber}`,
          loanId,
          installmentNumber,
          dueDate: request.newDueDate,
          totalAmount: 825.00,
          principalAmount: 660.00,
          interestAmount: 165.00,
          status: 'PENDING' as any
        }
      };
    }

    const response = await this.request<ScheduleOperationResponse>(`/Loans/${loanId}/schedule/${installmentNumber}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
    
    return response;
  }

  // 🗑️ Delete Payment Schedule APIs

  // Delete Specific Installment
  async deletePaymentInstallment(loanId: string, installmentNumber: number): Promise<ScheduleOperationResponse> {
    if (isMockDataEnabled()) {
      return {
        success: true,
        message: 'Payment installment deleted successfully',
        data: true
      };
    }

    const response = await this.request<ScheduleOperationResponse>(`/Loans/${loanId}/schedule/${installmentNumber}`, {
      method: 'DELETE',
    });
    
    return response;
  }


  // Admin APIs
  async approveLoan(loanId: string, notes?: string): Promise<Loan> {
    const body: any = {};
    if (notes) {
      body.notes = notes;
    }
    return this.request<Loan>(`/Loans/${loanId}/approve`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async rejectLoan(loanId: string, reason: string): Promise<Loan> {
    return this.request<Loan>(`/Loans/user/${loanId}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
  }

  async disburseLoan(loanId: string, disbursementData?: {
    disbursementMethod?: 'BANK_TRANSFER' | 'CASH' | 'CHECK' | 'CASH_PICKUP';
    reference?: string;
    bankAccountId?: string; // ✅ NEW: Optional - If provided, credits loan to this account
    disbursedBy?: string; // Admin user ID
  }): Promise<DisbursementResponse> {
    const body: any = {
      loanId,
    };
    
    if (disbursementData?.disbursementMethod) {
      body.disbursementMethod = disbursementData.disbursementMethod;
    }
    
    if (disbursementData?.reference) {
      body.reference = disbursementData.reference;
    }
    
    if (disbursementData?.bankAccountId) {
      body.bankAccountId = disbursementData.bankAccountId;
    }
    
    if (disbursementData?.disbursedBy) {
      body.disbursedBy = disbursementData.disbursedBy;
    }
    
    // Use admin endpoint as per documentation: POST /api/admin/transactions/disburse
    const response = await this.request<any>('/admin/transactions/disburse', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    
    // Handle the response structure
    if (response && response.success && response.data) {
      return response;
    }
    // Fallback: if response doesn't have expected structure, wrap it
    return {
      success: true,
      message: response?.message || 'Loan disbursed successfully',
      data: {
        loanId,
        disbursedAmount: response?.disbursedAmount || 0,
        disbursedAt: response?.disbursedAt || new Date().toISOString(),
        disbursementMethod: disbursementData?.disbursementMethod || 'BANK_TRANSFER',
        reference: disbursementData?.reference,
        bankAccountCredited: !!response?.bankAccountCredited,
        bankAccountId: response?.bankAccountId,
        message: response?.data?.message || response?.message || 'Loan disbursed successfully',
      },
    };
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
  async deleteBill(billId: string): Promise<{ success: boolean; message: string }> {
    console.log('🗑️ deleteBill API called with billId:', billId);
    
    if (isMockDataEnabled()) {
      console.log('📝 Using mock data');
      const result = await mockBillDataService.deleteBill(billId);
      return { 
        success: result, 
        message: result ? 'Bill deleted successfully' : 'Failed to delete bill' 
      };
    }
    
    try {
      console.log('🌐 Making DELETE request to:', `/Bills/${billId}`);
      const response = await this.request<{
        success: boolean;
        message: string;
        data: boolean;
        errors: any[];
      }>(`/Bills/${billId}`, {
        method: 'DELETE',
      });
      
      console.log('✅ Delete API response:', response);
      
      if (response && response.success) {
        return {
          success: true,
          message: response.message || 'Bill and all related records deleted successfully'
        };
      } else {
        console.error('❌ Delete failed, response.success is false');
        throw new Error(response?.message || 'Failed to delete bill');
      }
    } catch (error: any) {
      console.error('❌ Delete API error:', error);
      // Handle 404 specifically
      if (error.response?.status === 404 || error.message?.includes('not found')) {
        throw new Error('Bill not found');
      }
      throw error;
    }
  }

  // Mark bill as paid
  async markBillAsPaid(billId: string, request: { notes?: string; bankAccountId?: string }): Promise<Bill> {
    if (isMockDataEnabled()) {
      return mockBillDataService.markBillAsPaid(billId, request.notes);
    }
    
    const response = await this.request<any>(`/bills/${billId}/mark-paid`, {
      method: 'PUT',
      body: JSON.stringify({
        notes: request.notes || '',
        bankAccountId: request.bankAccountId || '',
      }),
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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }

  // ==================== RECEIVABLES MANAGEMENT APIs ====================

  async getUserReceivables(filters?: ReceivableFilters): Promise<Receivable[]> {
    if (isMockDataEnabled()) {
      // For now, return empty array - mock data can be added later
      return [];
    }
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append('status', filters.status);
    if (filters?.borrowerName) queryParams.append('borrowerName', filters.borrowerName);
    if (filters?.page) queryParams.append('page', filters.page.toString());
    if (filters?.limit) queryParams.append('limit', filters.limit.toString());
    const queryString = queryParams.toString();
    const endpoint = `/api/receivables${queryString ? `?${queryString}` : ''}`;
    const response = await this.request<any>(endpoint);
    
    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    } else if (response && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    } else {
      console.error('Unexpected receivables response structure:', response);
      return [];
    }
  }

  async getReceivable(receivableId: string): Promise<Receivable> {
    if (isMockDataEnabled()) {
      throw new Error('Mock data not implemented for receivables');
    }
    const response = await this.request<any>(`/api/receivables/${receivableId}`);
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async createReceivable(receivableData: CreateReceivableRequest): Promise<Receivable> {
    if (isMockDataEnabled()) {
      throw new Error('Mock data not implemented for receivables');
    }
    const response = await this.request<any>('/api/receivables', {
      method: 'POST',
      body: JSON.stringify(receivableData),
    });
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async updateReceivable(receivableId: string, updateData: UpdateReceivableRequest): Promise<Receivable> {
    if (isMockDataEnabled()) {
      throw new Error('Mock data not implemented for receivables');
    }
    const response = await this.request<any>(`/api/receivables/${receivableId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async deleteReceivable(receivableId: string): Promise<boolean> {
    if (isMockDataEnabled()) {
      throw new Error('Mock data not implemented for receivables');
    }
    const response = await this.request<any>(`/api/receivables/${receivableId}`, {
      method: 'DELETE',
    });
    return response?.data || response || true;
  }

  async getReceivablePayments(receivableId: string): Promise<ReceivablePayment[]> {
    if (isMockDataEnabled()) {
      return [];
    }
    const response = await this.request<any>(`/api/receivables/${receivableId}/payments`);
    
    if (response && response.success && Array.isArray(response.data)) {
      return response.data;
    } else if (response && Array.isArray(response.data)) {
      return response.data;
    } else if (Array.isArray(response)) {
      return response;
    }
    return [];
  }

  async createReceivablePayment(receivableId: string, paymentData: CreateReceivablePaymentRequest): Promise<ReceivablePayment> {
    if (isMockDataEnabled()) {
      throw new Error('Mock data not implemented for receivables');
    }
    const response = await this.request<any>(`/api/receivables/${receivableId}/payments`, {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async getReceivableAnalytics(): Promise<ReceivableAnalytics> {
    if (isMockDataEnabled()) {
      return {
        totalOutstanding: 0,
        totalPaid: 0,
        totalReceivables: 0,
        activeReceivables: 0,
        completedReceivables: 0,
        overdueReceivables: 0,
      };
    }
    const response = await this.request<any>('/api/receivables/analytics');
    
    if (response && response.success && response.data) {
      return response.data;
    } else if (response && response.data) {
      return response.data;
    }
    return {
      totalOutstanding: 0,
      totalPaid: 0,
      totalReceivables: 0,
      activeReceivables: 0,
      completedReceivables: 0,
      overdueReceivables: 0,
    };
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
    // Support both startDate/endDate and dateFrom/dateTo
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

  // Get bank account transactions with dateFrom/dateTo parameters (for modal)
  async getBankAccountTransactions(params: {
    bankAccountId: string;
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: BankAccountTransaction[];
  }> {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.dateFrom) queryParams.append('dateFrom', params.dateFrom);
    if (params.dateTo) queryParams.append('dateTo', params.dateTo);
    
    // Use bankAccountId in the URL path instead of query parameter
    const endpoint = `/BankAccounts/${params.bankAccountId}/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await this.request<any>(endpoint);
    
    // Handle the response format: { success: true, message: string, data: BankAccountTransaction[] }
    if (response && response.success && Array.isArray(response.data)) {
      return response;
    } else if (Array.isArray(response.data)) {
      return {
        success: true,
        message: 'Transactions retrieved successfully',
        data: response.data,
      };
    } else if (Array.isArray(response)) {
      return {
        success: true,
        message: 'Transactions retrieved successfully',
        data: response,
      };
    } else {
      console.error('Unexpected transactions response structure:', response);
      return {
        success: false,
        message: 'Failed to retrieve transactions',
        data: [],
      };
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

  async analyzeTransactionText(
    transactionText: string, 
    bankAccountId?: string,
    billId?: string,
    loanId?: string,
    savingsAccountId?: string
  ): Promise<{
    success: boolean;
    message: string;
    data: BankAccountTransaction | null;
    errors: any;
  }> {
    if (isMockDataEnabled()) {
      // Mock implementation - return a mock transaction
      const user = this.getCurrentUserFromToken();
      const mockTransaction: BankAccountTransaction = {
        id: `mock-${Date.now()}`,
        bankAccountId: bankAccountId || 'mock-bank-account-id',
        accountName: 'Mock Bank Account',
        userId: user?.id || 'demo-user-123',
        amount: 9.50,
        transactionType: 'DEBIT',
        description: 'POS Purchase AZDEHAR A',
        category: '',
        referenceNumber: `SMS_${Date.now()}`,
        externalTransactionId: undefined,
        transactionDate: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        notes: `Parsed from SMS: ${transactionText}`,
        merchant: 'AZDEHAR A',
        location: undefined,
        isRecurring: false,
        recurringFrequency: undefined,
        currency: 'SAR',
        balanceAfterTransaction: 990.50,
      };
      return {
        success: true,
        message: 'Transaction created successfully',
        data: mockTransaction,
        errors: null,
      };
    }
    
    // Use a custom request handler to properly handle 400 errors
    const url = `${API_BASE_URL}/BankAccounts/transactions/analyze-text`;
    const requestBody: { 
      transactionText: string; 
      bankAccountId?: string;
      billId?: string;
      loanId?: string;
      savingsAccountId?: string;
    } = { transactionText };
    
    if (bankAccountId) {
      requestBody.bankAccountId = bankAccountId;
    }
    if (billId) {
      requestBody.billId = billId;
    }
    if (loanId) {
      requestBody.loanId = loanId;
    }
    if (savingsAccountId) {
      requestBody.savingsAccountId = savingsAccountId;
    }
    
    const requestConfig: RequestInit = {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestBody),
    };

    try {
      const response = await fetch(url, requestConfig);
      const jsonResponse = await response.json();
      
      // If response is not ok, return the error response in the expected format
      if (!response.ok) {
        return {
          success: false,
          message: jsonResponse.message || `HTTP error! status: ${response.status}`,
          data: null,
          errors: jsonResponse.errors || null,
        };
      }
      
      return jsonResponse;
    } catch (error: any) {
      // Network or other errors
      throw error;
    }
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
    toBankAccountId?: string;  // For bank transfer transactions
  }): Promise<BankAccountTransaction> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockTransactionDataService.createBankTransaction(user?.id || 'demo-user-123', transactionData);
    }
    const response = await this.request<any>('/BankAccounts/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async getBankAccountSummary(year?: number, month?: number): Promise<{
    totalBalance: number;
    totalAccounts: number;
    activeAccounts: number;
    connectedAccounts: number;
    totalIncoming: number;
    totalOutgoing: number;
    accounts: any[];
    spendingByCategory?: {
      LOAN_PAYMENT?: number;
      transactions?: {
        totalDebit?: number;
        totalCredit?: number;
      };
      [key: string]: number | any | undefined;
    };
  }> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockBankAccountDataService.getBankAccountSummary(user?.id || 'demo-user-123', year, month);
    }
    
    // Build query parameters
    const params: string[] = [];
    if (year !== undefined) {
      params.push(`year=${year}`);
    }
    if (month !== undefined) {
      params.push(`month=${month}`);
    }
    const queryString = params.length > 0 ? `?${params.join('&')}` : '';
    
    const response = await this.request<any>(`/BankAccounts/summary${queryString}`);
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  // Get total balance from all bank accounts
  async getTotalBalance(): Promise<number> {
    if (isMockDataEnabled()) {
      // Return mock total balance
      return 125000.00;
    }
    const response = await this.request<any>('/BankAccounts/total-balance');
    if (response && response.success && response.data !== undefined) {
      return response.data;
    }
    return 0;
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
    startDate?: string;
    currency?: string;
  }): Promise<any> {
    if (isMockDataEnabled()) {
      const user = this.getCurrentUserFromToken();
      return mockDataService.createSavingsAccount(user?.id || 'demo-user-123', accountData);
    }
    const response = await this.request<any>('/savings/accounts', {
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
    
    const endpoint = `/savings/accounts${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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
    const response = await this.request<any>(`/savings/accounts/${accountId}`);
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
    startDate?: string;
    currency?: string;
  }): Promise<any> {
    if (isMockDataEnabled()) {
      return mockDataService.updateSavingsAccount(accountId, accountData);
    }
    const response = await this.request<any>(`/savings/accounts/${accountId}`, {
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
    await this.request<void>(`/savings/accounts/${accountId}`, {
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
    
    const endpoint = `/savings/accounts/${accountId}/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
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
      };
    }
    const queryString = activeOnly ? '?activeOnly=true' : '';
    const response = await this.request<any>(`/IncomeSource/with-summary${queryString}`);
    // Handle response structure - if wrapped in data, extract it
    if (response && response.data) {
      return response.data;
    }
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

  // ==================== AI CHAT APIs ====================

  // Send a message to AI chat
  async sendChatMessage(request: {
    message: string;
    conversationId?: string;
    includeTransactionContext?: boolean;
    reportFormat?: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      message: string;
      conversationId: string;
      suggestedActions: string[];
      tokensUsed: number;
      timestamp: string;
    };
  }> {
    const response = await this.request<any>('/chat/message', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    if (response && response.success && response.data) {
      return response;
    }
    throw new Error(response?.message || 'Failed to send chat message');
  }

  // Get conversation history
  async getConversations(params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      conversations: Array<{
        id: string;
        title: string;
        lastMessage: string;
        messageCount: number;
        createdAt: string;
        updatedAt: string;
      }>;
      totalCount: number;
      page: number;
      limit: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/chat/conversations${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<any>(endpoint);
    
    if (response && response.success && response.data) {
      return response;
    }
    throw new Error(response?.message || 'Failed to get conversations');
  }

  // Get conversation messages
  async getConversationMessages(conversationId: string, params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      messages: Array<{
        id: string;
        type: 'user' | 'assistant';
        content: string;
        timestamp: string;
        tokensUsed?: number;
      }>;
      totalCount: number;
      page: number;
      limit: number;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/chat/conversations/${conversationId}/messages${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<any>(endpoint);
    
    if (response && response.success && response.data) {
      return response;
    }
    throw new Error(response?.message || 'Failed to get conversation messages');
  }

  // Delete conversation
  async deleteConversation(conversationId: string): Promise<{
    success: boolean;
    message: string;
    data: boolean;
  }> {
    const response = await this.request<any>(`/chat/conversations/${conversationId}`, {
      method: 'DELETE',
    });
    
    if (response && response.success) {
      return response;
    }
    throw new Error(response?.message || 'Failed to delete conversation');
  }

  // Generate financial report
  async generateFinancialReport(request: {
    reportType: string;
    format: string;
  }): Promise<{
    success: boolean;
    message: string;
    data: {
      reportUrl: string;
      reportType: string;
      format: string;
      generatedAt: string;
    };
  }> {
    const response = await this.request<any>('/chat/generate-report', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    
    if (response && response.success && response.data) {
      return response;
    }
    throw new Error(response?.message || 'Failed to generate financial report');
  }

  // Get bill reminders
  async getBillReminders(): Promise<{
    success: boolean;
    message: string;
    data: Array<{
      id: string;
      billName: string;
      amount: number;
      dueDate: string;
      daysUntilDue: number;
      status: string;
    }>;
  }> {
    const response = await this.request<any>('/chat/bill-reminders');
    
    if (response && response.success && response.data) {
      return response;
    }
    throw new Error(response?.message || 'Failed to get bill reminders');
  }

  // Get budget suggestions
  async getBudgetSuggestions(): Promise<{
    success: boolean;
    message: string;
    data: {
      suggestions: Array<{
        category: string;
        currentSpending: number;
        suggestedBudget: number;
        reason: string;
        priority: 'high' | 'medium' | 'low';
      }>;
      totalCurrentSpending: number;
      totalSuggestedBudget: number;
      potentialSavings: number;
    };
  }> {
    const response = await this.request<any>('/chat/budget-suggestions');
    
    if (response && response.success && response.data) {
      return response;
    }
    throw new Error(response?.message || 'Failed to get budget suggestions');
  }

  // Get financial context
  async getFinancialContext(): Promise<{
    success: boolean;
    message: string;
    data: {
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
    };
  }> {
    const response = await this.request<any>('/chat/financial-context');
    
    if (response && response.success && response.data) {
      return response;
    }
    throw new Error(response?.message || 'Failed to get financial context');
  }

  // ==================== FINANCIAL REPORTS & ANALYTICS APIs ====================

  // Get full financial report
  async getFullFinancialReport(params?: {
    period?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
    startDate?: string;
    endDate?: string;
    includeComparison?: boolean;
    includeInsights?: boolean;
    includePredictions?: boolean;
    includeTransactions?: boolean;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.includeComparison !== undefined) queryParams.append('includeComparison', params.includeComparison.toString());
    if (params?.includeInsights !== undefined) queryParams.append('includeInsights', params.includeInsights.toString());
    if (params?.includePredictions !== undefined) queryParams.append('includePredictions', params.includePredictions.toString());
    if (params?.includeTransactions !== undefined) queryParams.append('includeTransactions', params.includeTransactions.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/Reports/full${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<any>(endpoint);
    
    if (response && response.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to get financial report');
  }

  // Get financial summary
  async getFinancialSummary(date?: string): Promise<any> {
    const queryParams = new URLSearchParams();
    if (date) queryParams.append('date', date);
    
    const queryString = queryParams.toString();
    const endpoint = `/Reports/summary${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<any>(endpoint);
    
    if (response && response.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to get financial summary');
  }

  // Get income report
  async getIncomeReport(params?: {
    period?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    const endpoint = `/Reports/income${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<any>(endpoint);
    
    if (response && response.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to get income report');
  }

  // Get expense report
  async getExpenseReport(params?: {
    period?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
    startDate?: string;
    endDate?: string;
  }): Promise<any> {
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    const endpoint = `/Reports/expenses${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<any>(endpoint);
    
    if (response && response.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to get expense report');
  }

  // Get financial insights
  async getFinancialInsights(date?: string): Promise<any> {
    const queryParams = new URLSearchParams();
    if (date) queryParams.append('date', date);
    
    const queryString = queryParams.toString();
    const endpoint = `/Reports/insights${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<any>(endpoint);
    
    if (response && response.success && response.data) {
      return response.data;
    }
    return [];
  }

  // Get financial predictions
  async getFinancialPredictions(): Promise<any> {
    const response = await this.request<any>('/Reports/predictions');
    
    if (response && response.success && response.data) {
      return response.data;
    }
    return [];
  }

  // Get recent transactions for reports
  async getRecentTransactionsForReports(limit: number = 20): Promise<any> {
    const response = await this.request<any>(`/Reports/transactions/recent?limit=${limit}`);
    
    if (response && response.success && response.data) {
      return response.data;
    }
    return [];
  }

  // Get monthly cash flow
  async getMonthlyCashFlow(year?: number): Promise<any> {
    const queryParams = new URLSearchParams();
    if (year) queryParams.append('year', year.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/Analytics/monthly-cash-flow${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request<any>(endpoint);
    
    if (response && response.success && response.data) {
      return response.data;
    }
    throw new Error(response?.message || 'Failed to get monthly cash flow');
  }

  // ==================== DISPOSABLE AMOUNT APIs ====================

  // Get disposable amount with detailed breakdown
  async getDisposableAmount(year: number, month: number): Promise<any> {
    if (isMockDataEnabled()) {
      // Return mock response matching the API structure
      return {
        success: true,
        message: 'Disposable amount calculated successfully',
        data: {
          userId: 'demo-user-123',
          period: 'MONTHLY',
          startDate: `${year}-${String(month).padStart(2, '0')}-01T00:00:00Z`,
          endDate: `${year}-${String(month).padStart(2, '0')}-30T23:59:59Z`,
          totalIncome: 50000.00,
          incomeBreakdown: [
            {
              sourceName: 'Monthly Salary',
              category: 'PRIMARY',
              amount: 45000.00,
              monthlyAmount: 45000.00,
              frequency: 'MONTHLY'
            },
            {
              sourceName: 'Freelance Work',
              category: 'SIDE_HUSTLE',
              amount: 5000.00,
              monthlyAmount: 5000.00,
              frequency: 'MONTHLY'
            }
          ],
          totalFixedExpenses: 19500.00,
          totalBills: 15500.00,
          billsBreakdown: [
            {
              id: 'bill123',
              name: 'Meralco Electricity',
              type: 'utility',
              amount: 2500.00,
              status: 'PAID',
              dueDate: `${year}-${String(month).padStart(2, '0')}-15T00:00:00Z`
            },
            {
              id: 'bill124',
              name: 'Rent',
              type: 'housing',
              amount: 12000.00,
              status: 'PAID',
              dueDate: `${year}-${String(month).padStart(2, '0')}-05T00:00:00Z`
            },
            {
              id: 'bill125',
              name: 'Internet - PLDT',
              type: 'utility',
              amount: 1500.00,
              status: 'PAID',
              dueDate: `${year}-${String(month).padStart(2, '0')}-10T00:00:00Z`
            }
          ],
          totalLoans: 4000.00,
          loansBreakdown: [
            {
              id: 'loan123',
              name: 'Personal Loan',
              type: 'LOAN',
              amount: 4000.00,
              status: 'ACTIVE'
            }
          ],
          totalVariableExpenses: 12990.00,
          variableExpensesBreakdown: [
            {
              category: 'GROCERIES',
              totalAmount: 7794.00,
              count: 12,
              percentage: 60.00
            },
            {
              category: 'TRANSPORTATION',
              totalAmount: 3031.00,
              count: 8,
              percentage: 23.33
            },
            {
              category: 'FOOD',
              totalAmount: 2165.00,
              count: 15,
              percentage: 16.67
            }
          ],
          disposableAmount: 17510.00,
          disposablePercentage: 35.02,
          targetSavings: null,
          investmentAllocation: null,
          netDisposableAmount: null,
          insights: [
            'Your disposable income increased by 8.2% compared to the previous period.',
            'Your highest spending category is GROCERIES at ₱7,794.00 (60.0% of variable expenses).',
            'Consider saving at least ₱3,502 per month (20% of your disposable income) to build your financial cushion.',
            'Reducing your variable expenses by 15% (₱1,948) can increase your savings by 11.1%.'
          ],
          comparison: {
            previousPeriodDisposableAmount: 16200.00,
            changeAmount: 1310.00,
            changePercentage: 8.09,
            trend: 'UP'
          }
        }
      };
    }
    
    const response = await this.request<any>(`/Dashboard/disposable-amount?year=${year}&month=${month}`);
    return response;
  }
}

export const apiService = new ApiService();
export default apiService;
