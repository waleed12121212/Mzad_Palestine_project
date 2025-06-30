import React, { useState, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle, RotateCw, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, verifyEmailCode, sendEmailConfirmation } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [fieldErrors, setFieldErrors] = useState({
    email: false,
    password: false
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (error) setError(null);
    if (fieldErrors[name as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: false
      }));
    }
  };

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

  const handleResendVerificationCode = async () => {
    if (!formData.email) {
      setError("البريد الإلكتروني مطلوب لإرسال رمز التحقق");
      return;
    }

    setResendingCode(true);
    try {
      await sendEmailConfirmation(formData.email);
      
      toast({
        title: "تم إرسال رمز التحقق",
        description: "يرجى التحقق من بريدك الإلكتروني"
      });
    } catch (error: any) {
      setError(error.message || "حدث خطأ أثناء إرسال رمز التحقق");
      
      toast({
        title: "خطأ في إرسال رمز التحقق",
        description: error.message || "حدث خطأ أثناء إرسال رمز التحقق",
        variant: "destructive"
      });
    } finally {
      setResendingCode(false);
    }
  };

  const validateForm = () => {
    const newFieldErrors = {
      email: !formData.email,
      password: !formData.password
    };
    
    setFieldErrors(newFieldErrors);
    
    if (!formData.email || !formData.password) {
      setError("الرجاء إدخال البريد الإلكتروني وكلمة المرور");
      return false;
    }
    return true;
  };

  const validateVerificationCode = () => {
    const code = verificationCode.join('');
    if (!code || code.length !== 6) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رمز التحقق المكون من 6 أرقام",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateVerificationCode()) return;
    
    setVerifying(true);
    try {
      const code = verificationCode.join('');
      await verifyEmailCode({ email: formData.email, verificationCode: code });
      
      toast({
        title: "تم تأكيد البريد الإلكتروني بنجاح",
        description: "يمكنك الآن تسجيل الدخول"
      });
      
      setNeedsEmailVerification(false);
      // Try login again automatically
      handleSubmit(e);
    } catch (error: any) {
      toast({
        title: "خطأ في تأكيد البريد الإلكتروني",
        description: error.message || "رمز التحقق غير صحيح",
        variant: "destructive"
      });
      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await login(formData);
      
      // Only show success message and navigate after successful login
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في مزاد فلسطين"
      });
      
      // Redirect to the previous page or home
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from);
    } catch (error: any) {
      console.log("Login error:", error.message);
      const errorMessage = error.message || "خطأ في البريد الإلكتروني أو كلمة المرور";
      
      // Check for the exact error pattern from the screenshot
      if (errorMessage.includes('يجب تأكيد البريد الإلكتروني أولاً')) {
        console.log("Email verification needed - Setting state");
        setNeedsEmailVerification(true);
        
        // Automatically send verification email when detection unverified email
        try {
          setResendingCode(true);
          await sendEmailConfirmation(formData.email);
          toast({
            title: "تم إرسال رمز التحقق",
            description: "يرجى التحقق من بريدك الإلكتروني وإدخال الرمز"
          });
        } catch (sendError: any) {
          console.error("Failed to send verification code:", sendError);
          toast({
            title: "خطأ في إرسال رمز التحقق",
            description: "حاول مرة أخرى بالضغط على زر إرسال رمز تحقق جديد",
            variant: "destructive"
          });
        } finally {
          setResendingCode(false);
        }
        
        inputRefs.current[0]?.focus();
      } else {
        console.log("Regular login error - Not verification related");
      }
      
      setError(errorMessage);
      
      // Mark both fields as having errors since we don't know which one is wrong
      setFieldErrors({
        email: true,
        password: true
      });
      
      toast({
        title: "خطأ في تسجيل الدخول",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Create reversed array for display (to match RTL layout)
  const displayOrder = [...verificationCode].reverse();

  return (
    <>
      {needsEmailVerification ? (
        <div className="space-y-6" dir="rtl">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <span className="text-blue-700 dark:text-blue-300 text-sm">
              يجب تأكيد البريد الإلكتروني أولاً. يرجى التحقق من بريدك الإلكتروني وإدخال رمز التأكيد
            </span>
          </div>
          
          <form onSubmit={handleSubmitVerification} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-center mb-2">
                رمز التأكيد
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
                      disabled={verifying}
                    />
                  );
                })}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
                disabled={verifying}
              >
                {verifying ? (
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
              <button
                type="button"
                className="flex-1 btn-secondary py-3 rounded-xl"
                onClick={() => setNeedsEmailVerification(false)}
                disabled={verifying}
              >
                العودة للخلف
              </button>
            </div>

            <button
              type="button"
              className="w-full btn-outline py-3 rounded-xl flex items-center justify-center gap-2"
              onClick={handleResendVerificationCode}
              disabled={resendingCode || verifying}
            >
              <RotateCw className={`h-4 w-4 ${resendingCode ? 'animate-spin' : ''}`} />
              {resendingCode ? "جاري إرسال رمز جديد..." : "إرسال رمز تحقق جديد"}
            </button>
          </form>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-red-700 dark:text-red-300 text-sm">{error}</span>
            </div>
          )}
          
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
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="password" className="block text-sm font-medium">
                كلمة المرور
              </label>
              <Link
                to="/auth/forgot-password"
                className="text-sm text-blue dark:text-blue-light hover:underline"
              >
                نسيت كلمة المرور؟
              </Link>
            </div>
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
          </div>

          <button
            type="submit"
            className="w-full btn-primary py-3 rounded-xl"
            disabled={loading}
          >
            {loading ? "جاري تسجيل الدخول..." : "تسجيل الدخول"}
          </button>

          <p className="text-center text-sm text-gray-600 dark:text-gray-300 mt-4">
            ليس لديك حساب؟{' '}
            <Link
              to="/auth/register"
              className="text-blue dark:text-blue-light hover:underline"
            >
              إنشاء حساب جديد
            </Link>
          </p>
        </form>
      )}
    </>
  );
}; 