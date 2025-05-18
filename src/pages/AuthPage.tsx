import React from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
  const location = useLocation();
  const navigate = useNavigate();

  // Redirect to home if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // تحديد التبويب النشط بناءً على المسار
  const isLogin = location.pathname.endsWith('/login');
  const isRegister = location.pathname.endsWith('/register');

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
          {/* شريط التبويب */}
          <div className="flex mb-8 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <button
              className={`flex-1 py-3 text-lg font-semibold transition-colors duration-150 focus:outline-none ${isLogin ? 'bg-blue text-white' : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => navigate('/auth/login')}
              type="button"
              style={{ borderLeft: '1px solid #e5e7eb' }}
            >
              تسجيل الدخول
            </button>
            <button
              className={`flex-1 py-3 text-lg font-semibold transition-colors duration-150 focus:outline-none ${isRegister ? 'bg-blue text-white' : 'bg-transparent text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
              onClick={() => navigate('/auth/register')}
              type="button"
            >
              إنشاء حساب
            </button>
          </div>
          {/* نهاية شريط التبويب */}
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