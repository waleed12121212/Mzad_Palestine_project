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
  confirmEmail: (data: ConfirmEmailData) => Promise<void>;
  sendEmailConfirmation: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<any | null>(null);

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