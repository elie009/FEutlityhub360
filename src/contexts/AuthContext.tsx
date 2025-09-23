import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthUser, LoginCredentials, RegisterData } from '../types/loan';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;
  
  // Debug logging
  console.log('AuthContext: Current state:', { user, isAuthenticated, isLoading });

  // Monitor user state changes
  useEffect(() => {
    console.log('AuthContext: User state changed:', { user, isAuthenticated });
  }, [user, isAuthenticated]);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('AuthContext: Starting login process');
      setIsLoading(true);
      // Use real backend API
      const authUser: AuthUser = await apiService.login(credentials);
      console.log('AuthContext: Login API response received:', authUser);
      
      // Store tokens in localStorage for persistence
      localStorage.setItem('authToken', authUser.data.token);
      localStorage.setItem('refreshToken', authUser.data.refreshToken);
      console.log('AuthContext: Tokens stored in localStorage');
      console.log('AuthContext: Token stored:', authUser.data.token.substring(0, 20) + '...');
      console.log('AuthContext: Refresh token stored:', authUser.data.refreshToken);
      
      // Call getCurrentUser to fetch fresh user data with the new token
      console.log('AuthContext: Calling getCurrentUser with new token...');
      await refreshUser();
      console.log('AuthContext: User data refreshed after login');
      
      // Small delay to ensure state updates are processed
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('AuthContext: Login process completed, user should be authenticated');
      
      // Force a re-render by logging the final state
      console.log('AuthContext: Final state after login:', { 
        user: !!user, 
        isAuthenticated: !!user, 
        isLoading 
      });
      
      // Login completed successfully - redirect will be handled by LoginForm
      console.log('AuthContext: Login completed successfully');
    } catch (error) {
      console.error('AuthContext: Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
      console.log('AuthContext: Login process completed');
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      // Use real backend API
      const authUser: AuthUser = await apiService.register(data);
      
      // Store tokens in localStorage for persistence
      localStorage.setItem('authToken', authUser.data.token);
      localStorage.setItem('refreshToken', authUser.data.refreshToken);
      
      // Call getCurrentUser to fetch fresh user data with the new token
      console.log('AuthContext: Calling getCurrentUser after registration...');
      await refreshUser();
      console.log('AuthContext: User data refreshed after registration');
      
      // Registration completed successfully - redirect will be handled by RegisterForm
      console.log('AuthContext: Registration completed successfully');
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    // Clear tokens from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      console.log('AuthContext: Refreshing user data...');
      // Use real backend API
      const userData = await apiService.getCurrentUser();
      console.log('AuthContext: User data received from API:', userData);
      
      const user = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        kycVerified: userData.isActive,
        isActive: userData.isActive,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      };
      
      console.log('AuthContext: Setting user data:', user);
      setUser(user);
      console.log('AuthContext: User data refreshed successfully');
      console.log('AuthContext: After setUser - isAuthenticated should be true');
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      // Only logout if it's not a 401 error (which means token is invalid)
      if (error instanceof Error && error.message.includes('401')) {
        console.log('Token is invalid or expired, clearing auth data');
        logout();
      } else {
        // For other errors, just log but don't logout
        console.log('Non-auth error during refresh, keeping current state');
      }
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      console.log('AuthContext: Initializing auth...');
      const token = localStorage.getItem('authToken');
      console.log('AuthContext: Token found:', !!token);
      console.log('AuthContext: Token value:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (token) {
        try {
          console.log('AuthContext: Refreshing user data with stored token...');
          console.log('AuthContext: Token being used:', token.substring(0, 20) + '...');
          console.log('AuthContext: About to call refreshUser()...');
          await refreshUser();
          console.log('AuthContext: User data refreshed successfully');
        } catch (error) {
          console.error('AuthContext: Failed to initialize auth:', error);
          // Clear invalid token and continue without authentication
          console.log('AuthContext: Clearing invalid token and continuing without auth');
          logout();
        }
      } else {
        console.log('AuthContext: No token found, user not authenticated');
      }
      
      console.log('AuthContext: Setting loading to false');
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
