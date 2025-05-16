import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle2, Loader2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';

interface LocationState {
  email?: string;
}

export const VerifyEmailCodeForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmailCode } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');

  useEffect(() => {
    // Get email from location state if available
    const state = location.state as LocationState;
    if (state?.email) {
      setEmail(state.email);
    }
  }, [location.state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !verificationCode) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال البريد الإلكتروني ورمز التحقق",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      await verifyEmailCode({ email, verificationCode });
      
      toast({
        title: "تم التحقق بنجاح",
        description: "تم تأكيد بريدك الإلكتروني بنجاح"
      });
      
      navigate('/auth/login');
    } catch (error: any) {
      toast({
        title: "خطأ في التحقق",
        description: error.response?.data?.message || "رمز التحقق غير صحيح أو منتهي الصلاحية",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">التحقق من البريد الإلكتروني</h2>
        <p className="text-gray-600 dark:text-gray-300">
          أدخل بريدك الإلكتروني ورمز التحقق الذي تم إرساله إليك
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
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
              className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
              placeholder="your.email@example.com"
              disabled={loading}
            />
            <Mail className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="verificationCode" className="block text-sm font-medium mb-2">
            رمز التحقق
          </label>
          <div className="relative">
            <input
              id="verificationCode"
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              className="w-full py-3 px-5 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
              placeholder="000000"
              disabled={loading}
              maxLength={6}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              جاري التحقق...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-5 w-5" />
              تأكيد البريد الإلكتروني
            </>
          )}
        </button>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            لم تستلم رمز التحقق؟{' '}
            <button
              type="button"
              onClick={() => navigate('/auth/send-email-confirmation')}
              className="text-blue dark:text-blue-light hover:underline"
            >
              إعادة إرسال الرمز
            </button>
          </p>
          
          <p className="text-sm text-gray-600 dark:text-gray-300">
            هل لديك حساب؟{' '}
            <button
              type="button"
              onClick={() => navigate('/auth/login')}
              className="text-blue dark:text-blue-light hover:underline"
            >
              تسجيل الدخول
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}; 