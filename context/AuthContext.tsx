import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserSettings } from '@/types/auth';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
}

// Create the context with undefined as default
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Default user settings
const defaultUserSettings: UserSettings = {
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // Simulate auth check - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user for development - remove in production
      const mockUser: User = {
        id: 'user_1',
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+91-9876543210',
        joinDate: new Date().toISOString(),
        digitalID: 'DID_123456789',
        verified: true,
        averageSafetyScore: 85,
        checkinsCount: 47,
        recentTrips: [],
        settings: defaultUserSettings,
      };
      
      setUser(mockUser);
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Mock login - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const userData: User = {
        id: 'user_1',
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        email,
        phone: '+91-9876543210',
        joinDate: new Date().toISOString(),
        digitalID: 'DID_123456789',
        verified: true,
        averageSafetyScore: 85,
        checkinsCount: 47,
        recentTrips: [],
        settings: defaultUserSettings,
      };
      
      setUser(userData);
    } catch (error) {
      console.error('Login failed:', error);
      throw new Error('Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setIsLoading(true);
      // Mock logout - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 500));
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
      throw new Error('Logout failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: Partial<User>): Promise<void> => {
    try {
      setIsLoading(true);
      // Mock registration - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
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
        settings: { ...defaultUserSettings, ...userData.settings },
      };
      
      setUser(newUser);
    } catch (error) {
      console.error('Registration failed:', error);
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>): Promise<void> => {
    try {
      if (user) {
        const updatedUser: User = {
          ...user,
          ...userData,
          settings: userData.settings ? {
            ...user.settings,
            ...userData.settings,
          } : user.settings,
        };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Update user failed:', error);
      throw new Error('Update failed');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    register,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Export the useAuth hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Export the context for advanced usage
export { AuthContext };
