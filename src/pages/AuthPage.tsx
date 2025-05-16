import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { ChangePasswordForm } from '../components/auth/ChangePasswordForm';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import { ConfirmEmailForm } from '../components/auth/ConfirmEmailForm';
import { SendEmailConfirmationForm } from '../components/auth/SendEmailConfirmationForm';
import { VerifyEmailCodeForm } from '../components/auth/VerifyEmailCodeForm';
import { useAuth } from '../contexts/AuthContext';

export const AuthPage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            مزاد فلسطين
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            منصة المزادات الأولى في فلسطين
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8">
          <Routes>
            <Route path="/" element={<Navigate to="/auth/login" replace />} />
            <Route path="/login" element={<LoginForm />} />
            <Route path="/register" element={<RegisterForm />} />
            <Route path="/change-password" element={<ChangePasswordForm />} />
            <Route path="/forgot-password" element={<ForgotPasswordForm />} />
            <Route path="/reset-password" element={<ResetPasswordForm />} />
            <Route path="/confirm-email" element={<ConfirmEmailForm />} />
            <Route path="/send-email-confirmation" element={<SendEmailConfirmationForm />} />
            <Route path="/verify-email-code" element={<VerifyEmailCodeForm />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}; 