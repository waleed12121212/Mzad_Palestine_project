import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, XCircle, CheckCircle, RotateCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';
import axios from 'axios';

interface LocationState {
  email?: string;
}

export const VerifyEmailCodeForm: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyEmailCode, sendEmailConfirmation } = useAuth();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [codeSuccess, setCodeSuccess] = useState<boolean>(false);
  const [autoSubmitEnabled, setAutoSubmitEnabled] = useState(true);
  const [resendingCode, setResendingCode] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const state = location.state as LocationState;
    if (state?.email) {
      setEmail(state.email);
    }
    inputRefs.current[0]?.focus(); // Focus first input for LTR numbers
  }, [location.state]);

  // Redirect to login page after successful verification with a delay
  useEffect(() => {
    if (codeSuccess) {
      const timer = setTimeout(() => {
        navigate('/auth/login');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [codeSuccess, navigate]);

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

  const handleResendVerificationCode = async () => {
    if (!email) {
      toast({
        title: "خطأ",
        description: "البريد الإلكتروني مطلوب لإرسال رمز التحقق",
        variant: "destructive"
      });
      return;
    }

    setResendingCode(true);
    try {
      await sendEmailConfirmation(email);
      
      toast({
        title: "تم إرسال رمز التحقق",
        description: "يرجى التحقق من بريدك الإلكتروني"
      });
      
      // Reset verification code fields
      setVerificationCode(['', '', '', '', '', '']);
      setCodeError(null);
      
      // Focus the first input field after a short delay
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    } catch (error: any) {
      toast({
        title: "خطأ في إرسال رمز التحقق",
        description: error.message || "حدث خطأ أثناء إرسال رمز التحقق",
        variant: "destructive"
      });
    } finally {
      setResendingCode(false);
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
        submitVerificationCode(digits.join(''));
      }, 300);
    } else if (digits.length < 6) {
      // Focus the next empty input
      const nextEmptyIndex = digits.length;
      if (nextEmptyIndex < 6) {
        inputRefs.current[nextEmptyIndex]?.focus();
      }
    }
  };

  const handleCodeChange = (index: number, value: string) => {
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
            submitVerificationCode(newCode.join(''));
          }, 300);
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

    // Auto-focus next input for LTR
    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    } else if (value !== '' && index === 5 && autoSubmitEnabled) {
      // If all inputs are filled and auto-submit is enabled, submit the form
      if (newCode.every(digit => digit !== '')) {
        // Wait a tiny bit to allow the state to update completely
        console.log("Manual input - Submitting code:", newCode.join(''));
        setTimeout(() => {
          submitVerificationCode(newCode.join(''));
        }, 300);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && verificationCode[index] === '' && index > 0) {
      // Move to previous input on backspace if current is empty (LTR)
      inputRefs.current[index - 1]?.focus();
    }
  };

  const submitVerificationCode = async (code: string) => {
    console.log("submitVerificationCode called with code:", code);
    
    if (!email || !code || code.length !== 6) {
      console.error("Invalid code or email:", { email, code });
      toast({
        title: "خطأ",
        description: "الرجاء إدخال رمز التحقق المكون من 6 أرقام",
        variant: "destructive"
      });
      return;
    }
    
    // Prevent duplicate submissions
    if (loading) {
      console.log("Submission already in progress, ignoring");
      return;
    }
    
    setLoading(true);
    setCodeError(null);
    setCodeSuccess(false);
    
    try {
      console.log("Making API request with:", { email, verificationCode: code });
      // Make a direct API call to check the response
      const response = await axios.post('/Auth/verify-email-code', {
        email,
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
        title: "تم التحقق بنجاح",
        description: "تم تأكيد بريدك الإلكتروني بنجاح"
      });
      
      // Don't navigate immediately - let the user see the success state
      // The useEffect will handle navigation after a delay
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
        title: "خطأ في التحقق",
        description: errorMessage,
        variant: "destructive"
      });
      
      setVerificationCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join('');
    await submitVerificationCode(code);
  };

  // Create reversed array for display
  const displayOrder = [...verificationCode].reverse();

  // Effect to debug verification code changes
  useEffect(() => {
    console.log("Current verification code state:", verificationCode);
    
    // Check if all fields are filled
    const allFilled = verificationCode.every(digit => digit !== '');
    if (allFilled) {
      console.log("All verification code fields are filled");
    }
  }, [verificationCode]);

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

      <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-center mb-4">
            أدخل رمز التحقق المكون من 6 أرقام
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
                  disabled={loading || codeSuccess}
                />
              );
            })}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            يمكنك لصق الرمز المكون من 6 أرقام مباشرة
          </p>
          {loading && (
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
            onClick={() => navigate('/auth/login')}
            disabled={loading || codeSuccess}
          >
            <div className="flex items-center justify-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              <span>العودة إلى تسجيل الدخول</span>
            </div>
          </button>
        </div>

        <button
          type="button"
          className="w-full btn-outline py-3 rounded-xl flex items-center justify-center gap-2"
          onClick={handleResendVerificationCode}
          disabled={resendingCode || loading || codeSuccess}
        >
          <RotateCw className={`h-4 w-4 ${resendingCode ? 'animate-spin' : ''}`} />
          {resendingCode ? "جاري إرسال رمز جديد..." : "إرسال رمز تحقق جديد"}
        </button>
      </form>
    </div>
  );
}; 