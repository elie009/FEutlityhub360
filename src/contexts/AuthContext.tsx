import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthUser, LoginCredentials, RegisterData } from '../types/loan';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasProfile: boolean;
  profileLoading: boolean;
  userProfile: any | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  getUserData: () => User | null;
  //checkUserProfile: () => Promise<boolean>;
  updateUserProfile: (profile: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  // Debug: Log what useAuth is returning
  console.log('useAuth: Returning context with user:', context.user);
  if (context.user) {
    console.log('useAuth: User object details:', {
      id: context.user.id,
      name: context.user.name,
      email: context.user.email,
      phone: context.user.phone,
      isActive: context.user.isActive,
      kycVerified: context.user.kycVerified,
      hasId: !!context.user.id,
      idType: typeof context.user.id,
      idValue: context.user.id
    });
    
    // Check for undefined fields
    const undefinedFields = [];
    if (context.user.id === undefined) undefinedFields.push('id');
    if (context.user.name === undefined) undefinedFields.push('name');
    if (context.user.email === undefined) undefinedFields.push('email');
    if (context.user.phone === undefined) undefinedFields.push('phone');
    if (context.user.isActive === undefined) undefinedFields.push('isActive');
    if (context.user.kycVerified === undefined) undefinedFields.push('kycVerified');
    
    if (undefinedFields.length > 0) {
      console.error('useAuth: Context user has undefined fields:', undefinedFields);
      console.error('useAuth: Full user object:', context.user);
    } else {
      console.log('useAuth: Context user has all fields defined!');
    }
  } else {
    console.log('useAuth: Context user is null/undefined');
  }
  
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const isAuthenticated = !!user;
  
  // Debug logging
  console.log('AuthContext: Current state:', { user, isAuthenticated, isLoading });

  // Monitor user state changes
  useEffect(() => {
    console.log('AuthContext: User state changed:', { user, isAuthenticated });
    if (user) {
      console.log('AuthContext: User object details:', {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        isActive: user.isActive,
        kycVerified: user.kycVerified,
        hasId: !!user.id,
        idType: typeof user.id,
        idValue: user.id
      });
      console.log('AuthContext: Full user object:', JSON.stringify(user, null, 2));
      
      // Check for undefined fields in the actual user state
      const undefinedFields = [];
      if (user.id === undefined) undefinedFields.push('id');
      if (user.name === undefined) undefinedFields.push('name');
      if (user.email === undefined) undefinedFields.push('email');
      if (user.phone === undefined) undefinedFields.push('phone');
      if (user.isActive === undefined) undefinedFields.push('isActive');
      if (user.kycVerified === undefined) undefinedFields.push('kycVerified');
      
      if (undefinedFields.length > 0) {
        console.error('AuthContext: User state has undefined fields:', undefinedFields);
        console.error('AuthContext: This means the userFromLogin object had undefined fields when setUser was called');
      } else {
        console.log('AuthContext: User state has all fields defined!');
      }
    } else {
      console.log('AuthContext: User is null/undefined');
    }
  }, [user, isAuthenticated]);

  const login = async (credentials: LoginCredentials) => {
    try {
      console.log('AuthContext: Starting login process');
      setIsLoading(true);
      // Use real backend API
      console.log('AuthContext: About to call apiService.login...');
      const authUser: AuthUser = await apiService.login(credentials);
      console.log('AuthContext: Login API response received:', authUser);
      console.log('AuthContext: Full authUser object:', JSON.stringify(authUser, null, 2));
      
      // Check if the API call actually succeeded
      if (!authUser) {
        console.error('AuthContext: API returned null/undefined response');
        throw new Error('Login failed: No response from server');
      }
      
      // CRITICAL DEBUG: Let's see exactly what we're getting
      console.log('=== CRITICAL DEBUG: API Response Analysis ===');
      console.log('authUser type:', typeof authUser);
      console.log('authUser is null?', authUser === null);
      console.log('authUser is undefined?', authUser === undefined);
      console.log('authUser keys:', Object.keys(authUser || {}));
      console.log('FULL authUser object:', JSON.stringify(authUser, null, 2));
      
      if (authUser && typeof authUser === 'object') {
        console.log('authUser.data exists?', 'data' in authUser);
        console.log('authUser.data type:', typeof authUser.data);
        if (authUser.data) {
          console.log('authUser.data keys:', Object.keys(authUser.data));
          console.log('FULL authUser.data object:', JSON.stringify(authUser.data, null, 2));
          console.log('authUser.data.user exists?', 'user' in authUser.data);
          if (authUser.data.user) {
            console.log('authUser.data.user keys:', Object.keys(authUser.data.user));
            console.log('FULL authUser.data.user object:', JSON.stringify(authUser.data.user, null, 2));
            console.log('authUser.data.user.id:', authUser.data.user.id);
            console.log('authUser.data.user.name:', authUser.data.user.name);
          }
        }
      }
      console.log('=== END CRITICAL DEBUG ===');
      
      // Debug: Check the actual response structure
      console.log('AuthContext: authUser keys:', Object.keys(authUser));
      console.log('AuthContext: authUser.data exists?', !!authUser.data);
      if (authUser.data) {
        console.log('AuthContext: authUser.data keys:', Object.keys(authUser.data));
        console.log('AuthContext: authUser.data.user exists?', !!authUser.data.user);
        if (authUser.data.user) {
          console.log('AuthContext: authUser.data.user keys:', Object.keys(authUser.data.user));
          console.log('AuthContext: authUser.data.user.id:', authUser.data.user.id);
          console.log('AuthContext: authUser.data.user.name:', authUser.data.user.name);
        }
      }
      
      // Check if user data is at the top level
      console.log('AuthContext: authUser.id:', authUser.id);
      console.log('AuthContext: authUser.name:', authUser.name);
      console.log('AuthContext: authUser.email:', authUser.email);
      
      // Store tokens in localStorage for persistence
      const authData = authUser.data;
      localStorage.setItem('authToken', authData.token);
      localStorage.setItem('refreshToken', authData.refreshToken);
      console.log('AuthContext: Tokens stored in localStorage');
      console.log('AuthContext: Token stored:', authData.token?.substring(0, 20) + '...');
      console.log('AuthContext: Refresh token stored:', authData.refreshToken);
      
      // Get user data from the correct location: authUser.data.user
      const userData = authData.user;
      console.log('AuthContext: Using user data from authUser.data.user');
      console.log('AuthContext: userData structure:', userData);
      console.log('AuthContext: userData keys:', Object.keys(userData || {}));
      console.log('AuthContext: userData.id:', userData?.id);
      console.log('AuthContext: userData.name:', userData?.name);
      console.log('AuthContext: userData.email:', userData?.email);
      
      // Validate userData exists
      if (!userData) {
        console.error('AuthContext: userData is null/undefined!');
        console.error('AuthContext: authData structure:', authData);
        console.error('AuthContext: authData keys:', Object.keys(authData || {}));
        throw new Error('User data not found in API response');
      }
      
      // Validate required fields exist
      if (!userData.id || !userData.name || !userData.email) {
        console.error('AuthContext: Missing required user fields!');
        console.error('AuthContext: userData.id:', userData.id);
        console.error('AuthContext: userData.name:', userData.name);
        console.error('AuthContext: userData.email:', userData.email);
        console.error('AuthContext: Full userData:', userData);
        throw new Error('Invalid user data: missing required fields');
      }
      debugger;
      const profile = await apiService.getUserProfile();
      var isActiveUser = false;
      if (profile && profile.id) {
        // Profile exists - save to session and state
        console.log('AuthContext: ✅ Profile found with ID:', profile.id, 'isActive:', profile.isActive);
        console.log('AuthContext: Profile keys:', Object.keys(profile));
        console.log('AuthContext: Profile.incomeSources:', profile.incomeSources);
        console.log('AuthContext: Profile.incomeSources length:', profile.incomeSources?.length || 0);
        
        setHasProfile(true);
        setUserProfile(profile);
        isActiveUser = true;
        sessionStorage.setItem('userProfile', JSON.stringify(profile));
        console.log('AuthContext: ✅ Profile saved to session and state');
        console.log('AuthContext: hasProfile set to: true');
        console.log('AuthContext: userProfile set to:', profile);
      } else {
        // No profile data - clear session and state
        console.log('AuthContext: ❌ No profile found - profile:', !!profile);
        setHasProfile(false);
        setUserProfile(null);
        sessionStorage.removeItem('userProfile');
      }

      
      // Create user object directly from the API response
      const userFromLogin = {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        kycVerified: userData.isActive, // Map isActive to kycVerified
        isActive: isActiveUser,//userData.isActive,
        createdAt: userData.createdAt,
        updatedAt: userData.updatedAt,
      };
      console.log('AuthContext: User data from login response:', userFromLogin);
      console.log('AuthContext: User data JSON:', JSON.stringify(userFromLogin, null, 2));
      
      // Use the value directly before setting it in state
      console.log('AuthContext: Using userFromLogin directly - ID:', userFromLogin.id);
      console.log('AuthContext: Using userFromLogin directly - Name:', userFromLogin.name);
      console.log('AuthContext: Using userFromLogin directly - Email:', userFromLogin.email);
      console.log('AuthContext: Using userFromLogin directly - Phone:', userFromLogin.phone);
      console.log('AuthContext: Using userFromLogin directly - isActive:', userFromLogin.isActive);
      console.log('AuthContext: Using userFromLogin directly - kycVerified:', userFromLogin.kycVerified);
      
      // Check if userFromLogin has any undefined fields
      const undefinedFields = [];
      if (userFromLogin.id === undefined) undefinedFields.push('id');
      if (userFromLogin.name === undefined) undefinedFields.push('name');
      if (userFromLogin.email === undefined) undefinedFields.push('email');
      if (userFromLogin.phone === undefined) undefinedFields.push('phone');
      if (userFromLogin.isActive === undefined) undefinedFields.push('isActive');
      if (userFromLogin.kycVerified === undefined) undefinedFields.push('kycVerified');
      
      if (undefinedFields.length > 0) {
        console.error('AuthContext: userFromLogin has undefined fields:', undefinedFields);
        console.error('AuthContext: userFromLogin object:', userFromLogin);
      } else {
        console.log('AuthContext: userFromLogin has all fields defined!');
      }
      setUser(userFromLogin);
      // Save user to localStorage for persistence across page reloads
      localStorage.setItem('user', JSON.stringify(userFromLogin));
      console.log('AuthContext: User data set from login response and saved to localStorage');
      
      // The user state won't be immediately available here due to React's async state updates
      // Use useEffect to monitor when the state actually changes
      
      // Test the user state immediately after setting
      setTimeout(() => {
        console.log('AuthContext: User state after setUser (delayed check):', user);
        console.log('AuthContext: User ID after setUser:', user?.id);
        console.log('AuthContext: User name after setUser:', user?.name);
      }, 100);
      
      // User data is already set from login response, no need to call refreshUser
      console.log('AuthContext: User data already set from login response');
      
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
      // Use new backend API
      const response = await apiService.register(data);
      
      // Store tokens in localStorage for persistence
      localStorage.setItem('authToken', response.token);
      localStorage.setItem('refreshToken', response.refreshToken);
      
      // Store user data directly from registration response
      const userFromRegister = {
        id: response.user.id,
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
        kycVerified: response.user.isActive, // Map isActive to kycVerified
        isActive: response.user.isActive,
        createdAt: response.user.createdAt,
        updatedAt: response.user.updatedAt,
      };
      console.log('AuthContext: User data from registration response:', userFromRegister);
      setUser(userFromRegister);
      // Save user to localStorage for persistence across page reloads
      localStorage.setItem('user', JSON.stringify(userFromRegister));
      console.log('AuthContext: User data set from registration response and saved to localStorage');
      
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
    // Clear tokens and user from localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const refreshUser = async () => {
    try {
      console.log('AuthContext: Refreshing user data...');
      // Use real backend API
      const response = await apiService.getCurrentUser();
      console.log('AuthContext: User data received from API:', response);
      
      // The /Auth/me endpoint returns data in response.data
      const userData = (response as any).data || response;
      console.log('AuthContext: Using userData from response.data:', userData);
      console.log('AuthContext: userData keys:', Object.keys(userData || {}));
      
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
      // Save user to localStorage for persistence across page reloads
      localStorage.setItem('user', JSON.stringify(user));
      console.log('AuthContext: User data refreshed successfully and saved to localStorage');
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

  // Helper function to get user data
  const getUserData = () => {
    console.log('AuthContext: getUserData called, returning:', user);
    return user;
  };

  // Check if user has a profile and save to session
  const checkUserProfile = async (): Promise<boolean> => {
    console.log('AuthContext: checkUserProfile called');
    console.log('AuthContext: isAuthenticated:', isAuthenticated);
    console.log('AuthContext: user:', user);
    console.log('AuthContext: token exists:', !!localStorage.getItem('authToken'));
    if (!isAuthenticated) {
      debugger;
      console.log('AuthContext: ❌ Not authenticated, clearing profile');
      console.log('AuthContext: This is why userProfile is null!');
      setHasProfile(false);
      setUserProfile(null);
      return false;
    }

    try {
      debugger;
      setProfileLoading(true);
      const profile = await apiService.getUserProfile();

      console.log('=== AuthContext: Starting profile check ===');
      console.log('=== AuthContext: Profile check result ===');
      console.log('AuthContext: Profile response:', profile);
      console.log('AuthContext: Profile type:', typeof profile);
      console.log('AuthContext: Profile is null:', profile === null);
      console.log('AuthContext: Profile is undefined:', profile === undefined);
      console.log('AuthContext: Profile truthy:', !!profile);
      console.log('AuthContext: Profile id:', profile?.id);
      console.log('AuthContext: Profile isActive:', profile?.isActive);
      console.log('AuthContext: Profile isActive type:', typeof profile?.isActive);
      console.log('AuthContext: Profile isActive === true:', profile?.isActive === true);
      if (profile && profile.id) {
        // Profile exists - save to session and state
        console.log('AuthContext: ✅ Profile found with ID:', profile.id, 'isActive:', profile.isActive);
        console.log('AuthContext: Profile keys:', Object.keys(profile));
        console.log('AuthContext: Profile.incomeSources:', profile.incomeSources);
        console.log('AuthContext: Profile.incomeSources length:', profile.incomeSources?.length || 0);
        
        setHasProfile(true);
        setUserProfile(profile);
        sessionStorage.setItem('userProfile', JSON.stringify(profile));
        console.log('AuthContext: ✅ Profile saved to session and state');
        console.log('AuthContext: hasProfile set to: true');
        console.log('AuthContext: userProfile set to:', profile);
        return true;
      } else {
        // No profile data - clear session and state
        console.log('AuthContext: ❌ No profile found - profile:', !!profile);
        setHasProfile(false);
        setUserProfile(null);
        sessionStorage.removeItem('userProfile');
        return false;
      }
    } catch (error) {
      console.log('AuthContext: ❌ Error checking profile:', error);
      setHasProfile(false);
      setUserProfile(null);
      sessionStorage.removeItem('userProfile');
      return false;
    } finally {
      setProfileLoading(false);
      console.log('=== AuthContext: Profile check completed ===');
    }
  };

  // Update user profile in state and session
  const updateUserProfile = (profile: any) => {
    setUserProfile(profile);
    setHasProfile(!!profile);
    if (profile) {
      sessionStorage.setItem('userProfile', JSON.stringify(profile));
    } else {
      sessionStorage.removeItem('userProfile');
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      console.log('AuthContext: Initializing auth...');
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');
      console.log('AuthContext: Token found:', !!token);
      console.log('AuthContext: Saved user found:', !!savedUser);
      console.log('AuthContext: Current user state:', !!user);
      console.log('AuthContext: isAuthenticated:', isAuthenticated);
      console.log('AuthContext: Token value:', token ? token.substring(0, 20) + '...' : 'null');
      
      if (token && savedUser) {
        console.log('AuthContext: ✅ Token and user found, proceeding with authentication');
        try {
          // Load user from localStorage
          const userData = JSON.parse(savedUser);
          setUser(userData);
          console.log('AuthContext: User data loaded from localStorage:', userData.email);
          
          // Check user profile
          console.log('AuthContext: Checking user profile...');
          //await checkUserProfile();
        } catch (error) {
          console.error('AuthContext: Failed to initialize auth:', error);
          console.log('AuthContext: Clearing invalid data and continuing without auth');
          logout();
        }
      } else if (token && !savedUser) {
        console.log('AuthContext: ⚠️ Token found but no user data, attempting to refresh user');
        try {
          // Try to refresh user data from API
          await refreshUser();
          //await checkUserProfile();
        } catch (error) {
          console.error('AuthContext: Failed to refresh user:', error);
          console.log('AuthContext: Clearing invalid token and continuing without auth');
          logout();
        }
      } else {
        console.log('AuthContext: ❌ No token found, user not authenticated');
        console.log('AuthContext: This means user needs to login first!');
      }
      
      console.log('AuthContext: Setting loading to false');
      setIsLoading(false);
    };

    initAuth();
  }, []);

  // Load profile from session on mount if available
  useEffect(() => {
    const savedProfile = sessionStorage.getItem('userProfile');
    if (savedProfile && isAuthenticated) {
      try {
        const profile = JSON.parse(savedProfile);
        setUserProfile(profile);
        setHasProfile(true);
        console.log('AuthContext: Loaded profile from session');
      } catch (error) {
        console.error('AuthContext: Error parsing saved profile:', error);
        sessionStorage.removeItem('userProfile');
      }
    }
  }, [isAuthenticated]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    hasProfile,
    profileLoading,
    userProfile,
    login,
    register,
    logout,
    refreshUser,
    getUserData,
    //checkUserProfile,
    updateUserProfile,
  };
  
  // Debug: Log what's being passed to the context
  console.log('AuthContext: Creating context value with user:', user);
  if (user) {
    console.log('AuthContext: Context value user details:', {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      isActive: user.isActive,
      kycVerified: user.kycVerified,
      hasId: !!user.id,
      idType: typeof user.id,
      idValue: user.id
    });
    
    // Check for undefined fields in context value
    const undefinedFields = [];
    if (user.id === undefined) undefinedFields.push('id');
    if (user.name === undefined) undefinedFields.push('name');
    if (user.email === undefined) undefinedFields.push('email');
    if (user.phone === undefined) undefinedFields.push('phone');
    if (user.isActive === undefined) undefinedFields.push('isActive');
    if (user.kycVerified === undefined) undefinedFields.push('kycVerified');
    
    if (undefinedFields.length > 0) {
      console.error('AuthContext: Context value user has undefined fields:', undefinedFields);
      console.error('AuthContext: This means the user state has undefined fields when creating context value');
    } else {
      console.log('AuthContext: Context value user has all fields defined!');
    }
  } else {
    console.log('AuthContext: Context value user is null/undefined');
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
