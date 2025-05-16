import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';

interface LocationState {
  email?: string;
}

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { resetPasswordWithCode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.email) {
      setEmail(state.email);
    }
  }, [location.state]);

  const validatePassword = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      toast({
        title: "كلمة المرور قصيرة",
        description: "يجب أن تكون كلمة المرور 8 أحرف على الأقل",
        variant: "destructive"
      });
      return false;
    }

    if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
      toast({
        title: "كلمة المرور ضعيفة",
        description: "يجب أن تحتوي كلمة المرور على حروف كبيرة وصغيرة وأرقام ورموز خاصة",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !verificationCode || !newPassword || !confirmPassword) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال جميع البيانات المطلوبة",
        variant: "destructive"
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "خطأ",
        description: "كلمتا المرور غير متطابقتين",
        variant: "destructive"
      });
      return;
    }

    if (!validatePassword(newPassword)) {
      return;
    }
    
    setLoading(true);
    try {
      await resetPasswordWithCode({
        email,
        verificationCode,
        newPassword
      });
      
      toast({
        title: "تم إعادة تعيين كلمة المرور",
        description: "يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة"
      });
      
      navigate('/auth/login');
    } catch (error: any) {
      toast({
        title: "خطأ في إعادة تعيين كلمة المرور",
        description: error.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-md mx-auto" dir="rtl">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="h-10 w-10 text-blue-500 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold">إعادة تعيين كلمة المرور</h2>
        <p className="text-gray-600 dark:text-gray-300">
          أدخل رمز التحقق وكلمة المرور الجديدة
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium mb-2">
              رمز التحقق
            </label>
            <input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full py-3 px-5 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
              placeholder="000000"
              maxLength={6}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
              كلمة المرور الجديدة
            </label>
            <div className="relative">
              <input
                id="newPassword"
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                placeholder="●●●●●●●●"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
              تأكيد كلمة المرور
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
                placeholder="●●●●●●●●"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              جاري إعادة التعيين...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              إعادة تعيين كلمة المرور
            </>
          )}
        </button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/auth/login')}
            className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 flex items-center justify-center gap-1"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة إلى تسجيل الدخول
          </button>
        </div>
      </form>
    </div>
  );
}; 