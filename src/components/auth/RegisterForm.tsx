import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      toast({
        title: "خطأ في التسجيل",
        description: "الرجاء إدخال جميع البيانات المطلوبة",
        variant: "destructive"
      });
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "كلمات المرور غير متطابقة",
        description: "الرجاء التأكد من تطابق كلمتي المرور",
        variant: "destructive"
      });
      return false;
    }

    if (formData.password.length < 6) {
      toast({
        title: "كلمة المرور قصيرة",
        description: "يجب أن تكون كلمة المرور 6 أحرف على الأقل",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await register({
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "تم إرسال رسالة تأكيد إلى بريدك الإلكتروني"
      });
      
      navigate('/auth/confirm-email');
    } catch (error: any) {
      toast({
        title: "خطأ في التسجيل",
        description: error.response?.data?.message || "حدث خطأ أثناء إنشاء الحساب",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="username" className="block text-sm font-medium mb-2">
          اسم المستخدم
        </label>
        <div className="relative">
          <input
            id="username"
            name="username"
            type="text"
            value={formData.username}
            onChange={handleChange}
            className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
            placeholder="اسم المستخدم"
            disabled={loading}
          />
          <User className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
        </div>
      </div>

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
            className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
            placeholder="your.email@example.com"
            disabled={loading}
          />
          <Mail className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium mb-2">
          رقم الهاتف
        </label>
        <div className="relative">
          <input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
            placeholder="05X-XXXX-XXX"
            disabled={loading}
          />
          <Phone className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium mb-2">
          كلمة المرور
        </label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={handleChange}
            className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
            placeholder="●●●●●●●●"
            disabled={loading}
          />
          <Lock className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
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

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
          تأكيد كلمة المرور
        </label>
        <div className="relative">
          <input
            id="confirmPassword"
            name="confirmPassword"
            type={showPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
            placeholder="●●●●●●●●"
            disabled={loading}
          />
          <Lock className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <button
        type="submit"
        className="w-full btn-primary py-3 rounded-xl"
        disabled={loading}
      >
        {loading ? "جاري إنشاء الحساب..." : "إنشاء حساب"}
      </button>
    </form>
  );
}; 