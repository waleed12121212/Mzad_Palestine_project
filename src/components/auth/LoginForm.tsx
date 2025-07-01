import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle, RotateCw, Loader2, XCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';
import axios from 'axios';

export const LoginForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, sendEmailConfirmation } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsEmailVerification, setNeedsEmailVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [verifying, setVerifying] = useState(false);
  const [resendingCode, setResendingCode] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState<boolean>(false);
  const [autoSubmitEnabled, setAutoSubmitEnabled] = useState(true);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fieldErrors, setFieldErrors] = useState({
    email: false,
    password: false
  });
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Effect to handle login after successful verification with a delay
  useEffect(() => {
    if (codeSuccess) {
      const timer = setTimeout(() => {
        // Don't switch back to login form first
        // Instead, perform login directly while keeping verification UI visible
        handleLoginAfterVerification();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [codeSuccess]);

  // Add a separate function to handle login after verification
  const handleLoginAfterVerification = async () => {
    setLoading(true);
    try {
      await login(formData);
      
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في مزاد فلسطين"
      });
      
      // Redirect to the previous page or home
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from);
    } catch (error: any) {
      console.log("Login error after verification:", error.message);
      // If there's an error after verification (rare case), show login form again
      setNeedsEmailVerification(false);
      setError(error.message || "حدث خطأ أثناء تسجيل الدخول");
      
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "حدث خطأ أثناء تسجيل الدخول",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Add auto-clear effect for error state
  useEffect(() => {
    if (codeError) {
      const timer = setTimeout(() => {
        setCodeError(null);
        setAutoSubmitEnabled(true); // Re-enable auto-submit when error is cleared
      }, 3000); // Clear error after 3 seconds
      
      return () => clearTimeout(timer);
    }
  }, [codeError]);

  // Effect to debug verification code changes
  useEffect(() => {
    if (needsEmailVerification) {
      console.log("Current verification code state:", verificationCode);
      
      // Check if all fields are filled
      const allFilled = verificationCode.every(digit => digit !== '');
      if (allFilled) {
        console.log("All verification code fields are filled");
        
        // For immediate response, directly submit when all fields are filled
        if (autoSubmitEnabled && !verifying && !codeSuccess) {
          console.log("Auto-submitting from useEffect for immediate response");
          submitVerification(verificationCode.join(''));
        }
      }
    }
  }, [verificationCode, needsEmailVerification, autoSubmitEnabled, verifying, codeSuccess]);

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

  // Handle paste event on the container
  const handleContainerPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    console.log("Container paste event - Data:", pastedData);
    
    // Clean the pasted data to only include numbers
    const cleanedData = pastedData.replace(/[^0-9]/g, '');
    console.log("Container paste event - Cleaned data:", cleanedData);
    
    // Take only the first 6 digits
    const digits = cleanedData.slice(0, 6).split('');
    console.log("Container paste event - Digits:", digits);
    
    // Fill the verification code array with the pasted digits
    const newCode = [...verificationCode];
    digits.forEach((digit, index) => {
      if (index < 6) {
        newCode[index] = digit;
      }
    });
    
    setVerificationCode(newCode);
    console.log("Container paste event - New code:", newCode);
    
    // If we have all 6 digits and auto-submit is enabled, submit the form
    if (digits.length === 6 && autoSubmitEnabled) {
      console.log("Container paste event - Submitting code:", digits.join(''));
      // Use a slightly longer timeout to ensure state is updated
      setTimeout(() => {
        submitVerification(digits.join(''));
      }, 100);
    } else if (digits.length < 6) {
      // Focus the next empty input
      const nextEmptyIndex = digits.length;
      if (nextEmptyIndex < 6) {
        inputRefs.current[nextEmptyIndex]?.focus();
      }
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    console.log(`handleCodeChange called for index ${index} with value "${value}"`);
    
    if (value.length > 1) {
      // Handle case where user pastes multiple digits into a single input
      const digits = value.replace(/[^0-9]/g, '').slice(0, 6 - index).split('');
      console.log("Input paste event - Digits:", digits);
      
      if (digits.length > 0) {
        const newCode = [...verificationCode];
        digits.forEach((digit, i) => {
          if (index + i < 6) {
            newCode[index + i] = digit;
          }
        });
        
        setVerificationCode(newCode);
        console.log("Input paste event - New code:", newCode);
        
        // Focus the appropriate input after paste
        const nextIndex = Math.min(index + digits.length, 5);
        inputRefs.current[nextIndex]?.focus();
        
        // If all inputs are filled and auto-submit is enabled, submit the form
        if (newCode.every(digit => digit !== '') && autoSubmitEnabled) {
          console.log("Input paste event - Submitting code:", newCode.join(''));
          // Use a slightly longer timeout to ensure state is updated
          setTimeout(() => {
            submitVerification(newCode.join(''));
          }, 100);
        }
        return;
      }
    }

    // Clear any previous error when user starts typing again
    if (codeError) {
      setCodeError(null);
      setAutoSubmitEnabled(true); // Re-enable auto-submit after user starts typing again
    }

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    console.log(`Updated code at index ${index}:`, newCode);

    // Auto-focus next input for LTR
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (value !== '' && index === 5) {
      console.log("Last digit entered:", value);
      
      // If all inputs are filled and auto-submit is enabled, submit the form
      if (newCode.every(digit => digit !== '') && autoSubmitEnabled) {
        // Wait a tiny bit to allow the state to update completely
        console.log("Manual input - Submitting code:", newCode.join(''));
        setTimeout(() => {
          submitVerification(newCode.join(''));
        }, 100);
      }
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

  const submitVerification = async (code: string) => {
    console.log("submitVerification called with code:", code);
    
    if (!validateVerificationCode()) {
      console.error("Verification code validation failed");
      return;
    }
    
    // Prevent duplicate submissions
    if (verifying) {
      console.log("Verification already in progress, ignoring");
      return;
    }
    
    setVerifying(true);
    setCodeError(null);
    
    try {
      console.log("Making API request with:", { email: formData.email, verificationCode: code });
      // Make a direct API call to check the response
      const response = await axios.post('/Auth/verify-email-code', {
        email: formData.email,
        verificationCode: code
      });
      
      // If we reach here, it means the API call was successful
      console.log("Verification API response:", response.data);
      
      // Check if the response contains an error message
      if (response.data && response.data.message === "رمز التحقق غير صحيح") {
        throw new Error("رمز التحقق غير صحيح");
      }
      
      // If we get here, it means verification was successful
      setCodeSuccess(true);
      
      toast({
        title: "تم تأكيد البريد الإلكتروني بنجاح",
        description: "يمكنك الآن تسجيل الدخول"
      });
      
      // Don't proceed immediately - let the user see the success state
      // The useEffect will handle login after a delay
    } catch (error: any) {
      console.error("Verification error:", error);
      
      // Extract the error message from the API response
      let errorMessage = "حدث خطأ أثناء التحقق من الرمز";
      
      if (error.response && error.response.data && error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      // Set the error message
      setCodeError(errorMessage);
      setAutoSubmitEnabled(false); // Disable auto-submit after an error
      
      toast({
        title: "خطأ في تأكيد البريد الإلكتروني",
        description: errorMessage,
        variant: "destructive"
      });
      
      // Clear the verification code and focus the first input
      setTimeout(() => {
        setVerificationCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }, 0);
    } finally {
      setVerifying(false);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join('');
    console.log("Form submitted manually with code:", code);
    await submitVerification(code);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
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
        
        // Reset verification code state when switching to verification mode
        setVerificationCode(['', '', '', '', '', '']);
        setCodeError(null);
        setCodeSuccess(false);
        setAutoSubmitEnabled(true);
        
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
        
        // Focus the first input field after a short delay to ensure the UI has updated
        setTimeout(() => {
          inputRefs.current[0]?.focus();
        }, 100);
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
          
          <form ref={formRef} onSubmit={handleSubmitVerification} className="space-y-6">
            <div className="space-y-4">
              <label className="block text-sm font-medium text-center mb-2">
                رمز التأكيد
              </label>
              
              {codeError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-start gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <span className="text-red-700 dark:text-red-300 text-sm">{codeError}</span>
                </div>
              )}
              
              {codeSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 flex items-start gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-green-700 dark:text-green-300 text-sm">تم تأكيد البريد الإلكتروني بنجاح</span>
                </div>
              )}
              
              <div 
                ref={containerRef}
                onPaste={handleContainerPaste}
                className="flex justify-center gap-2 dir-ltr"
                tabIndex={0} // Make the container focusable for better paste handling
              >
                {displayOrder.map((digit, index) => {
                  const actualIndex = 5 - index; // Convert display index to actual index
                  return (
                    <input
                      key={actualIndex}
                      ref={el => inputRefs.current[actualIndex] = el}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6} // Allow pasting up to 6 digits
                      value={digit}
                      onChange={(e) => handleCodeChange(actualIndex, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(actualIndex, e)}
                      onPaste={(e) => {
                        // Also handle paste events on individual inputs
                        if (actualIndex === 0) {
                          handleContainerPaste(e);
                        }
                      }}
                      className={`w-12 h-14 text-center text-lg font-semibold rounded-xl bg-gray-100 dark:bg-gray-700 border-2 ${
                        codeError ? 'border-red-500 dark:border-red-500' : 
                        codeSuccess ? 'border-green-500 dark:border-green-500' : 
                        'border-transparent'
                      } focus:border-primary focus:outline-none transition-all`}
                      disabled={verifying || codeSuccess}
                    />
                  );
                })}
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                يمكنك لصق الرمز المكون من 6 أرقام مباشرة
              </p>
              {verifying && (
                <div className="flex items-center justify-center gap-2 text-primary">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>جاري التحقق...</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                className="w-full btn-secondary py-3 rounded-xl"
                onClick={() => setNeedsEmailVerification(false)}
                disabled={verifying || codeSuccess}
              >
                العودة للخلف
              </button>
            </div>

            <button
              type="button"
              className="w-full btn-outline py-3 rounded-xl flex items-center justify-center gap-2"
              onClick={handleResendVerificationCode}
              disabled={resendingCode || verifying || codeSuccess}
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
              className="text-sm text-blue dark:text-blue-light hover:underline"
            >
              إنشاء حساب جديد
            </Link>
          </p>
        </form>
      )}
    </>
  );
}; 