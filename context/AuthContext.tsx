import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, UserSettings } from '@/types/auth';
import { 
  verifyOTP, 
  getCurrentUser, 
  logout as authLogout, 
  isAuthenticated as checkAuthStatus 
} from '@/services/authService';

// Types
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithPhone: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Default settings for newly authenticated users
const defaultSettings: UserSettings = {
  locationEnabled: true,
  emergencyAlerts: true,
  biometricEnabled: false,
  language: 'English',
  languageName: 'English',
  darkMode: false,
  soundEnabled: true,
  locationTracking: true,
  dataSharing: false,
  analyticsCollection: false,
  emergencySharing: true,
  thirdPartyIntegration: false,
};

// Development dummy user - for when auth is false
const createDummyUser = (): User => ({
  id: 'dummy_user_001',
  name: 'Ricky Kapoor',
  firstName: 'Ricky',
  lastName: 'Kapoor',
  email: 'ricky.kapoor@example.com',
  phone: '+91 9876543210',
  photo: 'https://via.placeholder.com/150',
  joinDate: new Date().toISOString(),
  digitalID: 'DID_DEMO123',
  verified: true,
  averageSafetyScore: 88,
  checkinsCount: 25,
  recentTrips: [
    {
      id: 'trip_1',
      destination: 'Mumbai',
      startDate: '2024-01-15',
      endDate: '2024-01-20',
      status: 'completed',
      checkpoints: [],
      geofences: [],
      safetyScore: 90,
      companions: []
    },
    {
      id: 'trip_2',
      destination: 'Delhi',
      startDate: '2024-02-10',
      endDate: '2024-02-15',
      status: 'completed',
      checkpoints: [],
      geofences: [],
      safetyScore: 85,
      companions: []
    }
  ],
  settings: defaultSettings,
});

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth state at app startup using Supabase session
  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        // Always load dummy user in development mode first
        if (__DEV__) {
          console.log('Development mode: Loading dummy user by default');
          
          const dummyUser = createDummyUser();
          const dummyToken = 'dummy-dev-token-123';
          
          setUser(dummyUser);
          setToken(dummyToken);
          
          await AsyncStorage.setItem('authUser', JSON.stringify(dummyUser));
          await AsyncStorage.setItem('authToken', dummyToken);
          
          console.log('Dummy user loaded:', dummyUser.name);
          setIsLoading(false);
          return;
        }

        // Production: Check if user is authenticated via Supabase
        const authenticated = await checkAuthStatus();
        
        if (authenticated) {
          // Get current user from Supabase
          const currentUser = await getCurrentUser();
          
          if (currentUser) {
            // Enhance user object with default settings if missing
            const enhancedUser: User = {
              ...currentUser,
              settings: currentUser.settings || defaultSettings,
              name: currentUser.name || `${currentUser.firstName} ${currentUser.lastName}`.trim() || 'User',
              digitalID: currentUser.digitalID || `DID_${currentUser.id.slice(0, 8)}`,
              joinDate: currentUser.joinDate || new Date().toISOString(),
              recentTrips: currentUser.recentTrips || [],
            };
            
            setUser(enhancedUser);
            setToken('supabase-session-active');
            
            // Store user in AsyncStorage for offline access
            await AsyncStorage.setItem('authUser', JSON.stringify(enhancedUser));
            await AsyncStorage.setItem('authToken', 'supabase-session-active');
            
            console.log('Real user authenticated:', enhancedUser.name);
          }
        } else {
          // Production: Clear any stored auth data if not authenticated
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('authUser');
        }
      } catch (error) {
        console.error('Auth restoration error:', error);
        
        if (__DEV__) {
          // Development: Fallback to dummy user on error
          console.log('Auth error in dev mode, falling back to dummy user');
          
          const dummyUser = createDummyUser();
          const dummyToken = 'dummy-fallback-token-456';
          
          setUser(dummyUser);
          setToken(dummyToken);
          
          await AsyncStorage.setItem('authUser', JSON.stringify(dummyUser));
          await AsyncStorage.setItem('authToken', dummyToken);
        } else {
          // Production: Clear stored data on error
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('authUser');
        }
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // Login with phone and OTP using Supabase auth service
  const loginWithPhone = async (phone: string, otp: string) => {
    setIsLoading(true);
    try {
      // **DEVELOPMENT MODE HANDLING**
      if (__DEV__) {
        // Accept any 6-digit OTP in development
        if (otp.length === 6) {
          console.log('Development mode: Accepting any 6-digit OTP');
          
          const mockUser: User = {
            ...createDummyUser(),
            phone: `+91 ${phone}`,
            name: 'Test User',
            firstName: 'Test',
            lastName: 'User',
            digitalID: `DID_${phone.slice(-4)}`,
          };
          
          setUser(mockUser);
          setToken('mock-login-token');
          
          await AsyncStorage.setItem('authToken', 'mock-login-token');
          await AsyncStorage.setItem('authUser', JSON.stringify(mockUser));
          
          console.log('Mock login successful for:', phone);
          return;
        } else {
          throw new Error('Please enter a 6-digit OTP');
        }
      }
      
      // **PRODUCTION: REAL SUPABASE LOGIN**
      console.log('Production mode: Attempting real OTP verification...');
      const response = await verifyOTP(phone, otp);
      
      console.log('OTP verification response:', {
        success: response.success,
        message: response.message,
        hasUser: !!response.user,
        hasToken: !!response.token
      });
      
      if (!response.success) {
        // Handle specific error types with user-friendly messages
        if (response.message?.includes('expired')) {
          throw new Error('OTP has expired. Please request a new code.');
        } else if (response.message?.includes('invalid') || response.message?.includes('Token')) {
          throw new Error('Invalid OTP. Please check your code and try again.');
        } else {
          throw new Error(response.message || 'OTP verification failed');
        }
      }
      
      if (!response.user || !response.token) {
        throw new Error('Authentication successful but user data is missing');
      }
      
      // Enhance user object with default settings
      const enhancedUser: User = {
        ...response.user,
        settings: response.user.settings || defaultSettings,
        name: response.user.name || `${response.user.firstName} ${response.user.lastName}`.trim() || 'User',
        digitalID: response.user.digitalID || `DID_${response.user.id.slice(0, 8)}`,
        joinDate: response.user.joinDate || new Date().toISOString(),
        recentTrips: response.user.recentTrips || [],
      };
      
      console.log('Setting authenticated user:', enhancedUser.name);
      
      setUser(enhancedUser);
      setToken(response.token);
      
      // Store in AsyncStorage
      await AsyncStorage.setItem('authToken', response.token);
      await AsyncStorage.setItem('authUser', JSON.stringify(enhancedUser));
      
      console.log('Login successful, user and token stored');
      
    } catch (error) {
      console.error('Login error details:', error);
      
      // Re-throw with preserved error message
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('An unexpected error occurred during login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Logout using Supabase auth service
  const logout = async () => {
    setIsLoading(true);
    try {
      // **DEVELOPMENT/MOCK LOGOUT**
      const isDevelopmentToken = token?.includes('dummy') || token?.includes('mock');
      
      if (__DEV__ || isDevelopmentToken) {
        console.log('Development mode: Mock logout');
        
        // Clear local state
        setToken(null);
        setUser(null);
        
        // Clear AsyncStorage
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('authUser');
        
        return;
      }
      
      // **PRODUCTION: REAL SUPABASE LOGOUT**
      const success = await authLogout();
      
      if (success) {
        setToken(null);
        setUser(null);
        
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('authUser');
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear local state even if Supabase logout fails
      setToken(null);
      setUser(null);
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('authUser');
      
      if (!__DEV__) {
        throw error;
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Registration - enhanced with dummy user support
  const register = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      // **DEVELOPMENT: MOCK REGISTRATION**
      if (__DEV__) {
        console.log('Development mode: Mock registration');
        
        const newUser: User = {
          ...createDummyUser(),
          ...userData,
          id: `mock_${Date.now()}`,
          digitalID: `DID_${Date.now()}`,
          settings: { ...defaultSettings, ...userData.settings },
        };

        setUser(newUser);
        const newToken = 'mock-registration-token';
        setToken(newToken);

        await AsyncStorage.setItem('authToken', newToken);
        await AsyncStorage.setItem('authUser', JSON.stringify(newUser));
        
        return;
      }
      
      // **PRODUCTION: REAL REGISTRATION**
      // TODO: Implement actual user registration with Supabase
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name || '',
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        email: userData.email || '',
        phone: userData.phone || '',
        photo: userData.photo,
        joinDate: new Date().toISOString(),
        digitalID: `DID_${Date.now()}`,
        verified: false,
        averageSafetyScore: 0,
        checkinsCount: 0,
        recentTrips: [],
        settings: { ...defaultSettings, ...userData.settings },
      };

      setUser(newUser);
      const newToken = 'real-registration-token';
      setToken(newToken);

      await AsyncStorage.setItem('authToken', newToken);
      await AsyncStorage.setItem('authUser', JSON.stringify(newUser));
    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser: User = {
        ...user,
        ...userData,
        settings: userData.settings ? { ...user.settings, ...userData.settings } : user.settings,
      };
      
      setUser(updatedUser);
      await AsyncStorage.setItem('authUser', JSON.stringify(updatedUser));
      
      // TODO: Update user metadata in Supabase (skip in dev mode)
      const isDevelopmentToken = token?.includes('dummy') || token?.includes('mock');
      if (!__DEV__ && !isDevelopmentToken) {
        // await supabase.auth.updateUser({ data: updatedUser });
      }
    } catch (error) {
      console.error('Update user error:', error);
      throw new Error('Failed to update user');
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isAuthenticated: !!token,
    isLoading,
    loginWithPhone,
    logout,
    register,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
