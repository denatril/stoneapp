import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import { simpleStorage, StorageKeys } from '../utils/simpleStorage';
import { crashReporting } from '../services/crashReporting';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLoginAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
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

  // Load user session on app start
  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = useCallback(async () => {
    try {
      setIsLoading(true);
      const savedUser = await simpleStorage.getItem<User>(StorageKeys.USER_SESSION);
      if (savedUser) {
        setUser(savedUser);
      }
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to load user session:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveUserSession = useCallback(async (userData: User) => {
    try {
      await simpleStorage.setItem(StorageKeys.USER_SESSION, userData);
      setUser(userData);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to save user session:', error);
      }
      throw error;
    }
  }, []);

  const clearUserSession = useCallback(async () => {
    try {
      await simpleStorage.removeItem(StorageKeys.USER_SESSION);
      setUser(null);
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to clear user session:', error);
      }
    }
  }, []);

  // Simple local authentication (for MVP - replace with real auth later)
  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For MVP: Simple validation
      if (email.includes('@') && password.length >= 6) {
        const userData: User = {
          id: `user_${Date.now()}`,
          email: email.toLowerCase(),
          name: email.split('@')[0],
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        
        await saveUserSession(userData);
        
        // Track successful login
        crashReporting.setUserId(userData.id);
        crashReporting.trackEvent('user_login', { 
          method: 'email',
          userId: userData.id 
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      if (__DEV__) {
        console.error('Login error:', error);
      }
      
      // Track login failure
      crashReporting.trackEvent('user_login_failed', { method: 'email' });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [saveUserSession]);

  const register = useCallback(async (email: string, password: string, name: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For MVP: Simple validation
      if (email.includes('@') && password.length >= 6 && name.trim().length >= 2) {
        const userData: User = {
          id: `user_${Date.now()}`,
          email: email.toLowerCase(),
          name: name.trim(),
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        
        await saveUserSession(userData);
        
        // Track successful registration
        crashReporting.setUserId(userData.id);
        crashReporting.trackEvent('user_register', { 
          method: 'email',
          userId: userData.id 
        });
        
        return true;
      }
      
      return false;
    } catch (error) {
      if (__DEV__) {
        console.error('Register error:', error);
      }
      
      // Track registration failure
      crashReporting.trackEvent('user_register_failed', { method: 'email' });
      
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [saveUserSession]);

  const logout = useCallback(async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Track logout
      crashReporting.trackEvent('user_logout');
      
      await clearUserSession();
    } catch (error) {
      if (__DEV__) {
        console.error('Logout error:', error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [clearUserSession]);

  const updateProfile = useCallback(async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false;
      
      const updatedUser: User = {
        ...user,
        ...updates,
        id: user.id, // Don't allow ID changes
        createdAt: user.createdAt, // Don't allow createdAt changes
      };
      
      await saveUserSession(updatedUser);
      return true;
    } catch (error) {
      if (__DEV__) {
        console.error('Update profile error:', error);
      }
      return false;
    }
  }, [user, saveUserSession]);

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      // Clear all user data
      await simpleStorage.clear();
      await clearUserSession();
      
      return true;
    } catch (error) {
      if (__DEV__) {
        console.error('Delete account error:', error);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [clearUserSession]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    deleteAccount,
  }), [user, isLoading, login, register, logout, updateProfile, deleteAccount]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
