import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';

export const SendEmailConfirmationForm: React.FC = () => {
  const navigate = useNavigate();
  const { sendEmailConfirmation } = useAuth();
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
      await sendEmailConfirmation(email);
      
      toast({
        title: "تم إرسال رابط التأكيد",
        description: "يرجى التحقق من بريدك الإلكتروني"
      });
      
      navigate('/auth/login');
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "حدث خطأ أثناء إرسال رابط التأكيد",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">إعادة إرسال رابط التأكيد</h2>
        <p className="text-gray-600 dark:text-gray-300">
          أدخل بريدك الإلكتروني وسنرسل لك رابط تأكيد جديد
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

        <button
          type="submit"
          className="w-full btn-primary py-3 rounded-xl"
          disabled={loading}
        >
          {loading ? "جاري إرسال الرابط..." : "إرسال رابط التأكيد"}
        </button>

        <p className="text-center text-sm text-gray-600 dark:text-gray-300">
          تذكرت أنك قمت بتأكيد بريدك الإلكتروني؟{' '}
          <button
            onClick={() => navigate('/auth/login')}
            className="text-blue dark:text-blue-light hover:underline"
          >
            تسجيل الدخول
          </button>
        </p>
      </form>
    </div>
  );
}; 