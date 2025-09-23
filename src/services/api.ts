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
import { mockDataService } from './mockData';
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
      const response = await fetch(url, requestConfig);
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Authentication APIs
  async register(data: RegisterData): Promise<AuthUser> {
    return this.request<AuthUser>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(credentials: LoginCredentials): Promise<AuthUser> {
    return this.request<AuthUser>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me');
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
    return this.request<Loan>('/loans/apply', {
      method: 'POST',
      body: JSON.stringify(application),
    });
  }

  async getLoan(loanId: string): Promise<Loan> {
    if (isMockDataEnabled()) {
      return mockDataService.getLoan(loanId);
    }
    return this.request<Loan>(`/loans/${loanId}`);
  }

  async getUserLoans(userId: string): Promise<Loan[]> {
    if (isMockDataEnabled()) {
      return mockDataService.getUserLoans(userId);
    }
    return this.request<Loan[]>(`/users/${userId}/loans`);
  }

  async getLoanStatus(loanId: string): Promise<{ status: string; outstandingBalance: number }> {
    if (isMockDataEnabled()) {
      const loan = await mockDataService.getLoan(loanId);
      return { status: loan.status, outstandingBalance: loan.outstandingBalance };
    }
    return this.request<{ status: string; outstandingBalance: number }>(`/loans/${loanId}/status`);
  }

  async getLoanSchedule(loanId: string): Promise<RepaymentSchedule[]> {
    if (isMockDataEnabled()) {
      return mockDataService.getLoanSchedule(loanId);
    }
    return this.request<RepaymentSchedule[]>(`/loans/${loanId}/schedule`);
  }

  async getLoanTransactions(loanId: string): Promise<Transaction[]> {
    if (isMockDataEnabled()) {
      return mockDataService.getLoanTransactions(loanId);
    }
    return this.request<Transaction[]>(`/loans/${loanId}/transactions`);
  }

  // Admin APIs
  async approveLoan(loanId: string): Promise<Loan> {
    return this.request<Loan>(`/loans/${loanId}/approve`, {
      method: 'PUT',
    });
  }

  async rejectLoan(loanId: string, reason: string): Promise<Loan> {
    return this.request<Loan>(`/loans/${loanId}/reject`, {
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
    return this.request<Loan>(`/loans/${loanId}/close`, {
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
    return this.request<Payment[]>(`/loans/${loanId}/payments`);
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
}

export const apiService = new ApiService();
export default apiService;
