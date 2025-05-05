import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">رابط غير صالح</h2>
        <p className="text-gray-600 dark:text-gray-300">
          يبدو أن رابط تأكيد البريد الإلكتروني غير صالح أو منتهي الصلاحية
        </p>
        <button
          onClick={() => navigate('/auth/login')}
          className="btn-primary py-2 px-4 rounded-lg"
        >
          العودة إلى تسجيل الدخول
        </button>
      </div>
    );
  }

  return (
    <div className="text-center space-y-4">
      {loading ? (
        <div>
          <h2 className="text-2xl font-bold mb-2">جاري تأكيد البريد الإلكتروني</h2>
          <p className="text-gray-600 dark:text-gray-300">
            يرجى الانتظار...
          </p>
        </div>
      ) : confirmed ? (
        <div>
          <h2 className="text-2xl font-bold mb-2">تم تأكيد البريد الإلكتروني</h2>
          <p className="text-gray-600 dark:text-gray-300">
            سيتم تحويلك إلى صفحة تسجيل الدخول خلال ثوانٍ...
          </p>
        </div>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-2">خطأ في تأكيد البريد الإلكتروني</h2>
          <p className="text-gray-600 dark:text-gray-300">
            حدث خطأ أثناء تأكيد بريدك الإلكتروني. يرجى المحاولة مرة أخرى أو طلب رابط تأكيد جديد.
          </p>
          <button
            onClick={() => navigate('/auth/send-email-confirmation')}
            className="btn-primary py-2 px-4 rounded-lg mt-4"
          >
            طلب رابط تأكيد جديد
          </button>
        </div>
      )}
    </div>
  );
}; 