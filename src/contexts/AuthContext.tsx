import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { LoginData, RegisterData, ChangePasswordData, ConfirmEmailData } from '../services/authService';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: any | null;
  login: (data: { email: string; password: string }) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  confirmEmail: (data: ConfirmEmailData) => Promise<void>;
  sendEmailConfirmation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(null);

  useEffect(() => {
    if (token) {
      validateToken();
    }
  }, [token]);

  const validateToken = async () => {
    try {
      const isValid = await authService.validateToken();
      if (isValid) {
        setIsAuthenticated(true);
        const user = authService.getCurrentUser();
        setUser(user);
      } else {
        setIsAuthenticated(false);
        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } catch (error) {
      setIsAuthenticated(false);
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  };

  const login = async (data: { email: string; password: string }) => {
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
      await authService.logout(token);
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

  const forgotPassword = async (email: string) => {
    await authService.forgotPassword(email);
  };

  const confirmEmail = async (data: ConfirmEmailData) => {
    await authService.confirmEmail(data);
  };

  const sendEmailConfirmation = async (email: string) => {
    await authService.sendEmailConfirmation(email);
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
        forgotPassword,
        confirmEmail,
        sendEmailConfirmation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 