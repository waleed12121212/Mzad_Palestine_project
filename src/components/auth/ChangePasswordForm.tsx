import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';

export const ChangePasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { changePassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validateForm = () => {
    if (!formData.currentPassword || !formData.newPassword || !formData.confirmNewPassword) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال جميع كلمات المرور",
        variant: "destructive"
      });
      return false;
    }

    if (formData.newPassword !== formData.confirmNewPassword) {
      toast({
        title: "خطأ",
        description: "كلمة المرور الجديدة غير متطابقة",
        variant: "destructive"
      });
      return false;
    }

    if (formData.newPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل",
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
      await changePassword(formData);
      
      toast({
        title: "تم تغيير كلمة المرور بنجاح",
        description: "يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة"
      });
      
      navigate('/auth/login');
    } catch (error: any) {
      toast({
        title: "خطأ",
        description: error.response?.data?.message || "حدث خطأ أثناء تغيير كلمة المرور",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">تغيير كلمة المرور</h2>
        <p className="text-gray-600 dark:text-gray-300">
          قم بإدخال كلمة المرور الحالية وكلمة المرور الجديدة
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
            كلمة المرور الحالية
          </label>
          <div className="relative">
            <input
              id="currentPassword"
              name="currentPassword"
              type={showPasswords.current ? "text" : "password"}
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
              placeholder="●●●●●●●●"
              disabled={loading}
            />
            <Lock className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('current')}
              className="absolute top-1/2 transform -translate-y-1/2 left-4 text-gray-400"
              disabled={loading}
            >
              {showPasswords.current ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium mb-2">
            كلمة المرور الجديدة
          </label>
          <div className="relative">
            <input
              id="newPassword"
              name="newPassword"
              type={showPasswords.new ? "text" : "password"}
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
              placeholder="●●●●●●●●"
              disabled={loading}
            />
            <Lock className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute top-1/2 transform -translate-y-1/2 left-4 text-gray-400"
              disabled={loading}
            >
              {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="confirmNewPassword" className="block text-sm font-medium mb-2">
            تأكيد كلمة المرور الجديدة
          </label>
          <div className="relative">
            <input
              id="confirmNewPassword"
              name="confirmNewPassword"
              type={showPasswords.confirm ? "text" : "password"}
              value={formData.confirmNewPassword}
              onChange={handleChange}
              className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
              placeholder="●●●●●●●●"
              disabled={loading}
            />
            <Lock className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute top-1/2 transform -translate-y-1/2 left-4 text-gray-400"
              disabled={loading}
            >
              {showPasswords.confirm ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="w-full btn-primary py-3 rounded-xl"
          disabled={loading}
        >
          {loading ? "جاري تغيير كلمة المرور..." : "تغيير كلمة المرور"}
        </button>
      </form>
    </div>
  );
}; 