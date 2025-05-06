import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';

export const ConfirmEmailForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { confirmEmail } = useAuth();
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const userId = searchParams.get('userId');
    const token = searchParams.get('token');

    if (userId && token) {
      handleConfirmEmail(userId, token);
    }
  }, [searchParams]);

  const handleConfirmEmail = async (userId: string, token: string) => {
    setLoading(true);
    try {
      await confirmEmail({ userId, token });
      
      setConfirmed(true);
      toast({
        title: "تم تأكيد البريد الإلكتروني",
        description: "يمكنك الآن تسجيل الدخول إلى حسابك"
      });
      
      setTimeout(() => {
        navigate('/auth/login');
      }, 3000);
    } catch (error: any) {
      toast({
        title: "خطأ في تأكيد البريد الإلكتروني",
        description: error.response?.data?.message || "حدث خطأ أثناء تأكيد البريد الإلكتروني",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!searchParams.get('userId') || !searchParams.get('token')) {
    return (
      <div className="flex flex-col items-center justify-center space-y-6 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-auto">
        <div className="w-16 h-16 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
          <XCircle className="w-10 h-10 text-red-600 dark:text-red-300" />
        </div>
        
        <h2 className="text-2xl font-bold text-center">رابط غير صالح</h2>
        
        <div className="text-center space-y-2">
          <p className="text-gray-600 dark:text-gray-300">
            يبدو أن رابط تأكيد البريد الإلكتروني غير صالح أو منتهي الصلاحية
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            يرجى طلب رابط جديد أو العودة إلى صفحة تسجيل الدخول
          </p>
        </div>
        
        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => navigate('/auth/send-email-confirmation')}
            className="w-full btn-secondary py-2 px-4 rounded-lg flex items-center justify-center gap-2"
          >
            <Mail className="w-5 h-5" />
            طلب رابط تأكيد جديد
          </button>
          
          <button
            onClick={() => navigate('/auth/login')}
            className="w-full btn-primary py-2 px-4 rounded-lg"
          >
            العودة إلى تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-6 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md mx-auto">
      {loading ? (
        <>
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <Loader2 className="w-10 h-10 text-blue-600 dark:text-blue-300 animate-spin" />
          </div>
          
          <h2 className="text-2xl font-bold text-center">جاري تأكيد البريد الإلكتروني</h2>
          
          <p className="text-gray-600 dark:text-gray-300 text-center">
            يرجى الانتظار بينما نتحقق من بريدك الإلكتروني...
          </p>
        </>
      ) : confirmed ? (
        <>
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-300" />
          </div>
          
          <h2 className="text-2xl font-bold text-center">تم تأكيد البريد الإلكتروني</h2>
          
          <div className="text-center space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              تم تأكيد حسابك بنجاح
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              سيتم تحويلك إلى صفحة تسجيل الدخول خلال ثوانٍ...
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <AlertCircle className="w-10 h-10 text-yellow-600 dark:text-yellow-300" />
          </div>
          
          <h2 className="text-2xl font-bold text-center">خطأ في تأكيد البريد الإلكتروني</h2>
          
          <div className="text-center space-y-2">
            <p className="text-gray-600 dark:text-gray-300">
              حدث خطأ أثناء تأكيد بريدك الإلكتروني
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              يرجى المحاولة مرة أخرى أو طلب رابط تأكيد جديد
            </p>
          </div>
          
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => navigate('/auth/send-email-confirmation')}
              className="w-full btn-primary py-2 px-4 rounded-lg flex items-center justify-center gap-2"
            >
              <Mail className="w-5 h-5" />
              طلب رابط تأكيد جديد
            </button>
          </div>
        </>
      )}
    </div>
  );
}; 