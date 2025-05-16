import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';

export const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { forgotPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال البريد الإلكتروني",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      await forgotPassword(email);
      
      toast({
        title: "تم إرسال رمز التحقق",
        description: "تم إرسال رمز التحقق إلى بريدك الإلكتروني"
      });
      
      // Navigate to reset password form with email
      navigate('/auth/reset-password', { state: { email } });
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.message || "حدث خطأ أثناء إرسال رمز التحقق",
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
          <Mail className="h-10 w-10 text-blue-500 dark:text-blue-400" />
        </div>
        <h2 className="text-2xl font-bold">نسيت كلمة المرور؟</h2>
        <p className="text-gray-600 dark:text-gray-300">
          أدخل بريدك الإلكتروني وسنرسل لك رمز تحقق لإعادة تعيين كلمة المرور
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-2">
            البريد الإلكتروني
          </label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full py-3 px-5 rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none"
              placeholder="your.email@example.com"
              disabled={loading}
              dir="ltr"
            />
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
              جاري إرسال الرمز...
            </>
          ) : (
            <>
              <Mail className="h-5 w-5" />
              إرسال رمز التحقق
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