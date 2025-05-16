import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    email: false,
    password: false
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError(null);
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

  const validateForm = () => {
    const newFieldErrors = {
      email: !formData.email,
      password: !formData.password
    };
    
    setFieldErrors(newFieldErrors);
    
    if (!formData.email || !formData.password) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await login(formData);
      
      // Only show success message and navigate after successful login
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في مزاد فلسطين"
      });
      
      // Redirect to the previous page or home
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from);
    } catch (error: any) {
      // Show the specific error message from the API if available
      setError(error.message || "خطأ في البريد الإلكتروني أو كلمة المرور");
      
      // Mark both fields as having errors since we don't know which one is wrong
      setFieldErrors({
        email: true,
        password: true
      });
      
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "خطأ في البريد الإلكتروني أو كلمة المرور",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
        </div>
      )}
      
      <div>
        <label htmlFor="email" className="block text-sm font-medium mb-2">
          البريد الإلكتروني
        </label>
        <div className="relative">
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base ${
              fieldErrors.email ? 'ring-2 ring-red-500 dark:ring-red-500' : ''
            }`}
            placeholder="your.email@example.com"
            disabled={loading}
          />
          <Mail className={`absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 ${
            fieldErrors.email ? 'text-red-500' : 'text-gray-400'
          }`} />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="password" className="block text-sm font-medium">
            كلمة المرور
          </label>
          <Link
            to="/auth/forgot-password"
            className="text-sm text-blue dark:text-blue-light hover:underline"
          >
            نسيت كلمة المرور؟
          </Link>
        </div>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            className={`w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base ${
              fieldErrors.password ? 'ring-2 ring-red-500 dark:ring-red-500' : ''
            }`}
            placeholder="●●●●●●●●"
            disabled={loading}
          />
          <Lock className={`absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 ${
            fieldErrors.password ? 'text-red-500' : 'text-gray-400'
          }`} />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute top-1/2 transform -translate-y-1/2 left-4 text-gray-400"
            disabled={loading}
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full btn-primary py-3 rounded-xl"
        disabled={loading}
      >
        {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
      </button>

      <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
        ليس لديك حساب؟{' '}
        <Link
          to="/auth/register"
          className="text-blue dark:text-blue-light hover:underline"
        >
          إنشاء حساب جديد
        </Link>
      </p>
    </form>
  );
}; 