import { config, isMockDataEnabled } from './environment';
import { mockDataService } from '../services/mockData';
import { CreateUserProfileRequest, UpdateUserProfileRequest, UserProfileResponse } from '../types/userProfile';

// Backend response interfaces
interface BackendResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors: string[];
}

interface AuthResponseData {
  token: string;
  refreshToken: string;
  expiresAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

// API Service class that handles all API calls
export class ApiService {
  private baseUrl: string;
  private timeout: number;

  constructor() {
    this.baseUrl = config.apiBaseUrl;
    this.timeout = config.apiTimeout;
    console.log('API Service: Initialized with baseUrl:', this.baseUrl);
  }

  // Generic request method
  private async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log('Making request to:', url);
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...this.getAuthHeaders(),
      },
    };

    const mergedOptions = { ...defaultOptions, ...options };

    // Add timeout using AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    mergedOptions.signal = controller.signal;

    try {
      const response = await fetch(url, mergedOptions);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // Try to extract error message from response
        try {
          const errorData = await response.json();
          if (errorData.message) {
            throw new Error(errorData.message);
          }
        } catch (parseError) {
          // If we can't parse the error response, use status-based messages
          if (response.status === 401) {
            throw new Error('Invalid email or password');
          } else if (response.status === 404) {
            throw new Error('User not found');
          } else if (response.status === 400) {
            throw new Error('Invalid request data');
          } else if (response.status >= 500) {
            throw new Error('Server error. Please try again later.');
          } else {
            throw new Error(`Request failed with status ${response.status}`);
          }
        }
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('API request failed:', error);
      console.error('Request URL:', url);
      console.error('Request options:', mergedOptions);
      
      // Handle network errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.error('Network fetch error detected');
        throw new Error('Network error. Please check your connection and try again.');
      }
      
      // Handle timeout errors
      if (error instanceof Error && error.name === 'AbortError') {
        console.error('Request timeout detected');
        throw new Error('Request timeout. Please try again.');
      }
      
      throw error;
    }
  }

  // Get authentication headers
  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('authToken');
    if (token) {
      console.log('API Service: Using token for Authorization header:', token.substring(0, 20) + '...');
      return { Authorization: `Bearer ${token}` };
    } else {
      console.log('API Service: No token found in localStorage');
      return {};
    }
  }

  // Authentication endpoints
  async login(credentials: { email: string; password: string }) {
    console.log('API Service: Making login request to /Auth/login');
    const response = await this.request<BackendResponse<AuthResponseData>>('/Auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    console.log('API Service: Login response received:', response);
    
    // Handle the actual backend response format
    if (response.success && response.data) {
      const authData = {
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        expiresAt: response.data.expiresAt,
        data: {
          user: response.data.user
        }
      };
      console.log('API Service: Returning auth data:', authData);
      return authData;
    }
    
    console.error('API Service: Login failed with response:', response);
    throw new Error(response.message || 'Login failed');
  }

  async register(userData: {
    name: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) {
    const response = await this.request<BackendResponse<AuthResponseData>>('/Auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    // Handle the actual backend response format
    if (response.success && response.data) {
      return {
        token: response.data.token,
        refreshToken: response.data.refreshToken,
        expiresAt: response.data.expiresAt,
        data: {
          user: response.data.user
        }
      };
    }
    
    throw new Error(response.message || 'Registration failed');
  }

  async getCurrentUser() {
    console.log('API Service: Making getCurrentUser request to /Auth/me');
    console.log('API Service: Full URL will be:', `${this.baseUrl}/Auth/me`);
    
    const response = await this.request<BackendResponse<{
      id: string;
      name: string;
      email: string;
      phone: string;
      role: string;
      isActive: boolean;
      createdAt: string;
      updatedAt: string;
    }>>('/Auth/me');
    
    console.log('API Service: getCurrentUser response received:', response);
    
    // Handle the actual backend response format
    if (response.success && response.data) {
      console.log('API Service: Returning user data:', response.data);
      return response.data;
    }
    
    console.error('API Service: getCurrentUser failed with response:', response);
    throw new Error(response.message || 'Failed to get current user');
  }

  // User endpoints
  async getUser(userId: string) {
    return this.request(`/users/${userId}`);
  }

  // UserProfile endpoints
  async createUserProfile(profileData: CreateUserProfileRequest) {
    console.log('API Service: Making createUserProfile request to /api/UserProfile');
    const response = await this.request<BackendResponse<UserProfileResponse>>('/api/UserProfile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
    console.log('API Service: createUserProfile response received:', response);
    
    if (response.success && response.data) {
      console.log('API Service: Returning user profile data:', response.data);
      return response.data;
    }
    
    console.error('API Service: createUserProfile failed with response:', response);
    throw new Error(response.message || 'Failed to create user profile');
  }

  async updateUserProfile(profileData: UpdateUserProfileRequest) {
    console.log('API Service: Making updateUserProfile request to /api/UserProfile');
    const response = await this.request<BackendResponse<UserProfileResponse>>('/api/UserProfile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
    console.log('API Service: updateUserProfile response received:', response);
    
    if (response.success && response.data) {
      console.log('API Service: Returning updated user profile data:', response.data);
      return response.data;
    }
    
    console.error('API Service: updateUserProfile failed with response:', response);
    throw new Error(response.message || 'Failed to update user profile');
  }

  async getUserProfile() {
    console.log('API Service: Making getUserProfile request to /api/UserProfile');
    const response = await this.request<BackendResponse<UserProfileResponse>>('/api/UserProfile');
    console.log('API Service: getUserProfile response received:', response);
    
    if (response.success && response.data) {
      console.log('API Service: Returning user profile data:', response.data);
      return response.data;
    }
    
    console.error('API Service: getUserProfile failed with response:', response);
    throw new Error(response.message || 'Failed to get user profile');
  }

  // Loan endpoints
  async applyForLoan(loanData: {
    principal: number;
    interestRate: number;
    purpose: string;
    term: number;
    monthlyIncome: number;
    employmentStatus: string;
    additionalInfo?: string;
  }) {
    if (isMockDataEnabled()) {
      return mockDataService.applyForLoan(loanData);
    }
    const response = await this.request<{ success: boolean; message: string; data: any; errors: string[] }>('/Loans/apply', {
      method: 'POST',
      body: JSON.stringify(loanData),
    });
    
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

  async getLoan(loanId: string) {
    if (isMockDataEnabled()) {
      return mockDataService.getLoan(loanId);
    }
    return this.request(`/Loans/user/${loanId}`);
  }

  async updateLoan(loanId: string, updateData: {
    purpose?: string;
    additionalInfo?: string;
    status?: string;
    interestRate?: number;
    monthlyPayment?: number;
    remainingBalance?: number;
  }) {
    if (isMockDataEnabled()) {
      return mockDataService.updateLoan(loanId, updateData);
    }
    const response = await this.request(`/Loans/${loanId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
    
    // Handle the response structure
    if (response && response.data) {
      return response.data;
    }
    return response;
  }

  async getUserLoans(userId: string, params?: { status?: string; page?: number; limit?: number }) {
    if (isMockDataEnabled()) {
      return mockDataService.getUserLoans(userId);
    }
    
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/Loans/user/${userId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.request(endpoint);
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

  async getLoanStatus(loanId: string) {
    if (isMockDataEnabled()) {
      const loan = await mockDataService.getLoan(loanId);
      return { status: loan.status, outstandingBalance: loan.outstandingBalance };
    }
    return this.request(`/Loans/user/${loanId}/status`);
  }

  async getLoanSchedule(loanId: string) {
    if (isMockDataEnabled()) {
      return mockDataService.getLoanSchedule(loanId);
    }
    return this.request(`/Loans/user/${loanId}/schedule`);
  }

  async getLoanTransactions(loanId: string) {
    if (isMockDataEnabled()) {
      return mockDataService.getLoanTransactions(loanId);
    }
    return this.request(`/Loans/user/${loanId}/transactions`);
  }

  // Admin endpoints
  async approveLoan(loanId: string, data: { approvedBy: string; notes?: string }) {
    return this.request(`/Loans/user/${loanId}/approve`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async rejectLoan(loanId: string, data: { reason: string; rejectedBy: string; notes?: string }) {
    return this.request(`/Loans/user/${loanId}/reject`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async disburseLoan(data: {
    loanId: string;
    disbursedBy: string;
    disbursementMethod: string;
    reference?: string;
  }) {
    return this.request('/transactions/disburse', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async closeLoan(loanId: string, data: { closedBy: string; notes?: string }) {
    return this.request(`/Loans/user/${loanId}/close`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Payment endpoints
  async makePayment(paymentData: {
    loanId: string;
    amount: number;
    method: string;
    reference: string;
    bankAccountId?: string;
  }) {
    if (isMockDataEnabled()) {
      return mockDataService.makeLoanPayment(paymentData.loanId, {
        amount: paymentData.amount,
        method: paymentData.method,
        reference: paymentData.reference,
        bankAccountId: paymentData.bankAccountId,
      });
    }
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  }

  async getPayment(paymentId: string) {
    if (isMockDataEnabled()) {
      // Mock implementation - find payment by ID
      const payments = await mockDataService.getPayments('any-loan-id');
      const payment = payments.find(p => p.id === paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }
      return payment;
    }
    return this.request(`/payments/${paymentId}`);
  }

  async getLoanPayments(loanId: string, params?: { page?: number; limit?: number }) {
    if (isMockDataEnabled()) {
      return mockDataService.getPayments(loanId);
    }
    
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/Loans/user/${loanId}/payments${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  // Notification endpoints
  async getUserNotifications(userId: string, params?: {
    status?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) {
    if (isMockDataEnabled()) {
      return mockDataService.getNotifications(userId);
    }
    
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.type) queryParams.append('type', params.type);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = `/notifications/${userId}${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async markNotificationAsRead(notificationId: string) {
    if (isMockDataEnabled()) {
      // Mock implementation - just return success
      return Promise.resolve();
    }
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async sendNotification(data: {
    userId: string;
    type: string;
    message: string;
  }) {
    return this.request('/notifications/send', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Report endpoints
  async getUserReport(userId: string, params?: {
    period?: string;
    startDate?: string;
    endDate?: string;
  }) {
    if (isMockDataEnabled()) {
      // Mock implementation - return basic report data
      const loans = await mockDataService.getUserLoans(userId);
      return {
        userId,
        totalLoans: loans.length,
        activeLoans: loans.filter(loan => loan.status === 'ACTIVE').length,
        totalBorrowed: loans.reduce((sum, loan) => sum + loan.principal, 0),
        totalOutstanding: loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0),
        generatedAt: new Date().toISOString(),
      };
    }
    
    const queryParams = new URLSearchParams();
    if (params?.period) queryParams.append('period', params.period);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    
    const queryString = queryParams.toString();
    const endpoint = `/reports/user/${userId}${queryString ? `?${queryString}` : ''}`;
    
    return this.request(endpoint);
  }

  async getLoanReport(loanId: string) {
    if (isMockDataEnabled()) {
      // Mock implementation - return basic loan report data
      const loan = await mockDataService.getLoan(loanId);
      const payments = await mockDataService.getPayments(loanId);
      return {
        loanId,
        loan,
        totalPayments: payments.length,
        totalPaid: payments.reduce((sum, payment) => sum + payment.amount, 0),
        remainingBalance: loan.outstandingBalance,
        generatedAt: new Date().toISOString(),
      };
    }
    return this.request(`/reports/loan/${loanId}`);
  }
}

// Create and export a singleton instance
export const apiService = new ApiService();
export default apiService;
