import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { LoginData, RegisterData, ChangePasswordData, ConfirmEmailData, VerifyEmailCodeData, ResetPasswordData } from '../services/authService';

export interface User {
  id: string;
  username: string;
  email: string;
  role: 'User' | 'Admin';
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  register: (data: RegisterData) => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  confirmEmail: (data: ConfirmEmailData) => Promise<void>;
  sendEmailConfirmation: (email: string) => Promise<void>;
  verifyEmailCode: (data: VerifyEmailCodeData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPasswordWithCode: (data: ResetPasswordData) => Promise<void>;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  login: async () => {},
  logout: () => {},
  isAuthenticated: false,
  register: async () => {},
  changePassword: async () => {},
  confirmEmail: async () => {},
  sendEmailConfirmation: async () => {},
  verifyEmailCode: async () => {},
  forgotPassword: async () => {},
  resetPasswordWithCode: async () => {},
  isLoading: true
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // تحميل بيانات المستخدم من localStorage عند تحميل التطبيق
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr && userStr !== "undefined") {
      setUser(JSON.parse(userStr));
      setIsLoading(false);
    } else if (token) {
      fetchUserFromServer();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  async function fetchUserFromServer() {
    try {
      const response = await fetch('/User/current', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        setIsLoading(false);
        return;
      }
      const userData = await response.json();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch {
      // Handle error silently
    } finally {
      setIsLoading(false);
    }
  }

  const login = async (data: LoginData) => {
    const response = await authService.login(data);
    setToken(response.token);
    setUser(response.user);
    setIsAuthenticated(true);
  };

  const register = async (data: RegisterData) => {
    await authService.register(data);
  };

  const logout = async () => {
    if (token) {
      await authService.logout();
    }
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
  };

  const changePassword = async (data: ChangePasswordData) => {
    if (!token) throw new Error('Not authenticated');
    await authService.changePassword(data);
  };

  const confirmEmail = async (data: ConfirmEmailData) => {
    await authService.confirmEmail(data);
  };

  const sendEmailConfirmation = async (email: string) => {
    await authService.sendEmailConfirmation(email);
  };

  const verifyEmailCode = async (data: VerifyEmailCodeData) => {
    await authService.verifyEmailCode(data);
  };

  const forgotPassword = async (email: string) => {
    await authService.forgotPassword(email);
  };

  const resetPasswordWithCode = async (data: ResetPasswordData) => {
    await authService.resetPasswordWithCode(data);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        token,
        user,
        login,
        register,
        logout,
        changePassword,
        confirmEmail,
        sendEmailConfirmation,
        verifyEmailCode,
        forgotPassword,
        resetPasswordWithCode,
        isLoading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 