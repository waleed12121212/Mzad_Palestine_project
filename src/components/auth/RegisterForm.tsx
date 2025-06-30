import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, User, Phone, Calendar, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';

export const RegisterForm: React.FC = () => {
  const navigate = useNavigate();
  const { register, sendEmailConfirmation } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState({
    username: false,
    email: false,
    phone: false,
    password: false,
    confirmPassword: false
  });

  // Password validation states
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecialChar: false
  });
  
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    bio: '',
    dateOfBirth: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear backend errors when user starts typing
    if (backendError) setBackendError(null);
    
    // Clear field errors
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }

    // Special handling for password field
    if (name === 'password') {
      validatePassword(value);
    }

    // Check if confirm password matches
    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      const confirmValue = name === 'confirmPassword' ? value : formData.confirmPassword;
      const passwordValue = name === 'password' ? value : formData.password;
      setFieldErrors(prev => ({
        ...prev,
        confirmPassword: confirmValue !== '' && confirmValue !== passwordValue
      }));
    }
  };

  const validatePassword = (password: string) => {
    setPasswordCriteria({
      length: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    });
  };

  const validateForm = () => {
    const newFieldErrors = {
      username: !formData.username,
      email: !formData.email,
      phone: !formData.phone,
      password: !formData.password,
      confirmPassword: !formData.confirmPassword || formData.password !== formData.confirmPassword
    };
    
    setFieldErrors(newFieldErrors);
    
    if (Object.values(newFieldErrors).some(error => error)) {
      toast({
        title: "خطأ في التسجيل",
        description: "الرجاء إدخال جميع البيانات المطلوبة بشكل صحيح",
        variant: "destructive"
      });
      return false;
    }

    // Check all password criteria
    const allCriteriaMet = Object.values(passwordCriteria).every(criterion => criterion);
    if (!allCriteriaMet) {
      toast({
        title: "كلمة المرور غير آمنة",
        description: "يرجى استخدام كلمة مرور تلبي جميع المعايير المطلوبة",
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
      console.log('Starting registration process for:', formData.email);
      
      // First register the user
      await register({
        username: formData.username,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        firstName: formData.firstName || undefined,
        lastName: formData.lastName || undefined,
        bio: formData.bio || undefined,
        dateOfBirth: formData.dateOfBirth || undefined
      });
      
      console.log('Registration successful, now sending email confirmation');
      
     
      
      // Show success message
      toast({
        title: "تم إنشاء الحساب بنجاح",
        description: "تم إرسال رمز تحقق إلى بريدك الإلكتروني"
      });
      
      // Navigate to verification page
      navigate('/auth/verify-email-code', { state: { email: formData.email } });
    } catch (error: any) {
      console.error('Registration error:', error);
      
      // Extract password-specific errors
      const errorMsg = error.response?.data?.message || error.message || "حدث خطأ أثناء إنشاء الحساب";
      
      if (errorMsg.includes('كلمة المرور') || errorMsg.includes('password')) {
        setBackendError(errorMsg);
        setFieldErrors(prev => ({
          ...prev,
          password: true
        }));
      } else {
        toast({
          title: "خطأ في التسجيل",
          description: errorMsg,
          variant: "destructive"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {backendError && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
          <span className="text-red-700 dark:text-red-300 text-sm">{backendError}</span>
        </div>
      )}
      
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
            className={`w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base ${
              fieldErrors.username ? 'ring-2 ring-red-500 dark:ring-red-500' : ''
            }`}
            placeholder="اسم المستخدم"
            disabled={loading}
          />
          <User className={`absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 ${
            fieldErrors.username ? 'text-red-500' : 'text-gray-400'
          }`} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium mb-2">
            الاسم الأول (اختياري)
          </label>
          <div className="relative">
            <input
              id="firstName"
              name="firstName"
              type="text"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
              placeholder="الاسم الأول"
              disabled={loading}
            />
            <User className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium mb-2">
            اسم العائلة (اختياري)
          </label>
          <div className="relative">
            <input
              id="lastName"
              name="lastName"
              type="text"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
              placeholder="اسم العائلة"
              disabled={loading}
            />
            <User className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
          </div>
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
            className={`w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base ${
              fieldErrors.phone ? 'ring-2 ring-red-500 dark:ring-red-500' : ''
            }`}
            placeholder="05X-XXXX-XXX"
            disabled={loading}
          />
          <Phone className={`absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 ${
            fieldErrors.phone ? 'text-red-500' : 'text-gray-400'
          }`} />
        </div>
      </div>

      <div>
        <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-2">
          تاريخ الميلاد (اختياري)
        </label>
        <div className="relative">
          <input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange}
            className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
            disabled={loading}
          />
          <Calendar className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
        </div>
      </div>

      <div>
        <label htmlFor="bio" className="block text-sm font-medium mb-2">
          نبذة شخصية (اختياري)
        </label>
        <div className="relative">
          <textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
            placeholder="نبذة قصيرة عنك"
            rows={3}
            disabled={loading}
          />
          <FileText className="absolute top-6 transform right-4 h-5 w-5 text-gray-400" />
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
        
        {/* Password criteria indicators */}
        <div className="mt-2 space-y-1 text-xs">
          <div className="flex items-center gap-1">
            {passwordCriteria.length ? (
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <X className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={passwordCriteria.length ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              8 أحرف على الأقل
            </span>
          </div>
          <div className="flex items-center gap-1">
            {passwordCriteria.hasUppercase ? (
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <X className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={passwordCriteria.hasUppercase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              حرف كبير واحد على الأقل (A-Z)
            </span>
          </div>
          <div className="flex items-center gap-1">
            {passwordCriteria.hasLowercase ? (
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <X className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={passwordCriteria.hasLowercase ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              حرف صغير واحد على الأقل (a-z)
            </span>
          </div>
          <div className="flex items-center gap-1">
            {passwordCriteria.hasNumber ? (
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <X className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={passwordCriteria.hasNumber ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              رقم واحد على الأقل (0-9)
            </span>
          </div>
          <div className="flex items-center gap-1">
            {passwordCriteria.hasSpecialChar ? (
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
            ) : (
              <X className="h-3.5 w-3.5 text-red-500" />
            )}
            <span className={passwordCriteria.hasSpecialChar ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              رمز خاص واحد على الأقل (مثل !@#$%^&*)
            </span>
          </div>
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
            className={`w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base ${
              fieldErrors.confirmPassword ? 'ring-2 ring-red-500 dark:ring-red-500' : ''
            }`}
            placeholder="●●●●●●●●"
            disabled={loading}
          />
          <Lock className={`absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 ${
            fieldErrors.confirmPassword ? 'text-red-500' : 'text-gray-400'
          }`} />
        </div>
        {formData.confirmPassword && fieldErrors.confirmPassword && (
          <p className="mt-1 text-sm text-red-500">كلمتا المرور غير متطابقتين</p>
        )}
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