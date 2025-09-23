import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthUser, LoginCredentials, RegisterData } from '../types/loan';
import { apiService } from '../services/api';
import { mockAuthService } from '../services/mockAuth';

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

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true);
      // Use mock service for demonstration - replace with apiService.login(credentials) for real backend
      const authUser: AuthUser = await mockAuthService.login(credentials);
      
      // Set user data
      setUser({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        phone: authUser.phone,
        kycVerified: true, // Mock user is verified
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true);
      // Use mock service for demonstration - replace with apiService.register(data) for real backend
      const authUser: AuthUser = await mockAuthService.register(data);
      
      // Set user data
      setUser({
        id: authUser.id,
        name: authUser.name,
        email: authUser.email,
        phone: authUser.phone,
        kycVerified: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    mockAuthService.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      // Use mock service for demonstration - replace with apiService.getCurrentUser() for real backend
      const userData = await mockAuthService.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      logout();
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          await refreshUser();
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          logout();
        }
      }
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
