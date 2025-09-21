// Mock authentication service for demonstration purposes
// This simulates backend authentication without requiring a real API

import { AuthUser, LoginCredentials, RegisterData, User } from '../types/loan';

// Mock user data
const mockUser: User = {
  id: 'demo-user-123',
  name: 'Demo User',
  email: 'demo@utilityhub360.com',
  phone: '+1-555-0123',
  kycVerified: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

// Mock authentication tokens
const generateMockToken = (): string => {
  return 'mock-jwt-token-' + Date.now();
};

const generateMockRefreshToken = (): string => {
  return 'mock-refresh-token-' + Date.now();
};

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  async login(credentials: LoginCredentials): Promise<AuthUser> {
    await delay(1000); // Simulate network delay
    
    // Check demo credentials
    if (credentials.email === 'demo@utilityhub360.com' && credentials.password === 'Demo123!') {
      const token = generateMockToken();
      const refreshToken = generateMockRefreshToken();
      
      // Store tokens in localStorage for persistence
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      return {
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        phone: mockUser.phone,
        token,
        refreshToken,
      };
    }
    
    // Check other demo users
    if (credentials.email === 'admin@utilityhub360.com' && credentials.password === 'Admin123!') {
      const token = generateMockToken();
      const refreshToken = generateMockRefreshToken();
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      return {
        id: 'admin-user-456',
        name: 'Admin User',
        email: 'admin@utilityhub360.com',
        phone: '+1-555-0124',
        token,
        refreshToken,
      };
    }
    
    throw new Error('Invalid email or password');
  },

  async register(data: RegisterData): Promise<AuthUser> {
    await delay(1500); // Simulate network delay
    
    // Simulate successful registration
    const token = generateMockToken();
    const refreshToken = generateMockRefreshToken();
    
    localStorage.setItem('authToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    
    return {
      id: 'new-user-' + Date.now(),
      name: data.name,
      email: data.email,
      phone: data.phone,
      token,
      refreshToken,
    };
  },

  async getCurrentUser(): Promise<User> {
    await delay(500); // Simulate network delay
    
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Return mock user data
    return mockUser;
  },

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('authToken');
  }
};
