import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle2, Loader2, ArrowLeft } from 'lucide-react';
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
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.email) {
      setEmail(state.email);
    }
    inputRefs.current[0]?.focus(); // Focus first input for LTR numbers
  }, [location.state]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);

    // Auto-focus next input for LTR
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && verificationCode[index] === '' && index > 0) {
      // Move to previous input on backspace if current is empty (LTR)
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const code = verificationCode.join('');
    if (!email || !code || code.length !== 6) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رمز التحقق المكون من 6 أرقام",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    try {
      await verifyEmailCode({ email, verificationCode: code });
      
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
      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // Create reversed array for display
  const displayOrder = [...verificationCode].reverse();

  return (
    <div className="space-y-6 max-w-md mx-auto" dir="rtl">
      <div className="text-center space-y-4">
        <div className="w-20 h-20 bg-primary/10 dark:bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Mail className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">التحقق من البريد الإلكتروني</h2>
        <div className="space-y-2">
          <p className="text-gray-600 dark:text-gray-300">
            تم إرسال رمز التحقق إلى
          </p>
          <p className="font-medium text-primary dir-ltr">
            {email}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-center mb-4">
            أدخل رمز التحقق المكون من 6 أرقام
          </label>
          <div className="flex justify-center gap-2 dir-ltr">
            {displayOrder.map((digit, index) => {
              const actualIndex = 5 - index; // Convert display index to actual index
              return (
                <input
                  key={actualIndex}
                  ref={el => inputRefs.current[actualIndex] = el}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(actualIndex, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(actualIndex, e)}
                  className="w-12 h-14 text-center text-lg font-semibold rounded-xl bg-gray-100 dark:bg-gray-700 border-2 border-transparent focus:border-primary focus:outline-none transition-all"
                  disabled={loading}
                />
              );
            })}
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90 text-white py-4 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
              تأكيد الرمز
            </>
          )}
        </button>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>لم تستلم الرمز؟</span>
            <button
              type="button"
              onClick={() => navigate('/auth/send-email-confirmation')}
              className="text-primary hover:underline font-medium"
            >
              إعادة إرسال
            </button>
          </div>
          
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