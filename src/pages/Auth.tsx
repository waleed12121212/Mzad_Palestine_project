import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User, Phone, ArrowRight } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '../contexts/AuthContext';

const Auth = () => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [showPassword, setShowPassword] = useState(false);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  
  // Signup form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState<"buyer" | "seller">("buyer");
  
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: "الرجاء إدخال البريد الإلكتروني وكلمة المرور",
        variant: "destructive"
      });
      return;
    }
    try {
      await login({ email: loginEmail, password: loginPassword });
      toast({
        title: "تم تسجيل الدخول بنجاح",
        description: "مرحباً بك في مزاد فلسطين"
      });
      setTimeout(() => {
        window.location.reload();
      }, 700); // إعادة تحميل الصفحة بعد النجاح
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الدخول",
        description: error.message || "خطأ في البريد الإلكتروني أو كلمة المرور",
        variant: "destructive"
      });
    }
  };
  
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!name || !email || !phone || !password || !confirmPassword) {
      toast({
        title: "خطأ في إنشاء الحساب",
        description: "الرجاء إدخال جميع البيانات المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "كلمات المرور غير متطابقة",
        description: "الرجاء التأكد من تطابق كلمتي المرور",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate signup API call
    console.log("Signup:", { name, email, phone, password, userType });
    
    toast({
      title: "تم إنشاء الحساب بنجاح",
      description: "مرحباً بك في مزاد فلسطين"
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <div className="flex-grow pt-28 pb-16 bg-gradient-to-b from-blue/5 to-transparent dark:from-blue-dark/10 dark:to-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-8">
              <h1 className="heading-lg mb-2">مرحباً بك في مزاد فلسطين</h1>
              <p className="text-gray-600 dark:text-gray-300">
                {activeTab === "login" ? "سجّل دخولك للوصول إلى حسابك" : "أنشئ حسابك الجديد للمشاركة في المزادات"}
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
              {/* Tabs */}
              <div className="flex rtl">
                <button
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    activeTab === "login"
                      ? "bg-blue text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("login")}
                >
                  تسجيل الدخول
                </button>
                <button
                  className={`flex-1 py-4 text-center font-medium transition-colors ${
                    activeTab === "signup"
                      ? "bg-blue text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("signup")}
                >
                  إنشاء حساب
                </button>
              </div>
              
              <div className="p-6 rtl">
                {activeTab === "login" ? (
                  <form onSubmit={handleLoginSubmit}>
                    <div className="mb-4">
                      <label htmlFor="login-email" className="block text-sm font-medium mb-2">
                        البريد الإلكتروني
                      </label>
                      <div className="relative">
                        <input
                          id="login-email"
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
                          placeholder="your.email@example.com"
                        />
                        <Mail className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-2">
                        <label htmlFor="login-password" className="block text-sm font-medium">
                          كلمة المرور
                        </label>
                        <Link to="/reset-password" className="text-sm text-blue dark:text-blue-light hover:underline">
                          نسيت كلمة المرور؟
                        </Link>
                      </div>
                      <div className="relative">
                        <input
                          id="login-password"
                          type={showPassword ? "text" : "password"}
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
                          placeholder="●●●●●●●●"
                        />
                        <Lock className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 transform -translate-y-1/2 left-4 text-gray-400"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <button type="submit" className="w-full btn-primary py-3 rounded-xl mb-4">
                      تسجيل الدخول
                    </button>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        ليس لديك حساب؟{" "}
                        <button
                          type="button"
                          className="text-blue dark:text-blue-light hover:underline"
                          onClick={() => setActiveTab("signup")}
                        >
                          إنشاء حساب
                        </button>
                      </p>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleSignupSubmit}>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium mb-2">
                        الاسم
                      </label>
                      <div className="relative">
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
                          placeholder="الاسم الكامل"
                        />
                        <User className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="mb-4">
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
                        />
                        <Mail className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        رقم الهاتف
                      </label>
                      <div className="relative">
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
                          placeholder="05X-XXXX-XXX"
                        />
                        <Phone className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label htmlFor="password" className="block text-sm font-medium mb-2">
                        كلمة المرور
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
                          placeholder="●●●●●●●●"
                        />
                        <Lock className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute top-1/2 transform -translate-y-1/2 left-4 text-gray-400"
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label htmlFor="confirm-password" className="block text-sm font-medium mb-2">
                        تأكيد كلمة المرور
                      </label>
                      <div className="relative">
                        <input
                          id="confirm-password"
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
                          placeholder="●●●●●●●●"
                        />
                        <Lock className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                    
                    <div className="mb-6">
                      <label className="block text-sm font-medium mb-2">نوع الحساب</label>
                      <div className="flex space-x-4 space-x-reverse">
                        <div
                          className={`flex-1 border rounded-lg p-4 cursor-pointer transition-colors ${
                            userType === "buyer"
                              ? "border-blue bg-blue/10 dark:border-blue-light dark:bg-blue-light/10"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                          onClick={() => setUserType("buyer")}
                        >
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                userType === "buyer"
                                  ? "bg-blue dark:bg-blue-light"
                                  : "border-2 border-gray-300 dark:border-gray-600"
                              }`}
                            ></div>
                            <span className="font-medium">مشتري</span>
                          </div>
                          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            المشاركة في المزادات وشراء المنتجات
                          </p>
                        </div>
                        <div
                          className={`flex-1 border rounded-lg p-4 cursor-pointer transition-colors ${
                            userType === "seller"
                              ? "border-blue bg-blue/10 dark:border-blue-light dark:bg-blue-light/10"
                              : "border-gray-200 dark:border-gray-700"
                          }`}
                          onClick={() => setUserType("seller")}
                        >
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <div
                              className={`w-4 h-4 rounded-full ${
                                userType === "seller"
                                  ? "bg-blue dark:bg-blue-light"
                                  : "border-2 border-gray-300 dark:border-gray-600"
                              }`}
                            ></div>
                            <span className="font-medium">بائع</span>
                          </div>
                          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            إنشاء مزادات وبيع منتجات
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <button type="submit" className="w-full btn-primary py-3 rounded-xl mb-4">
                      إنشاء حساب
                    </button>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        لديك حساب بالفعل؟{" "}
                        <button
                          type="button"
                          className="text-blue dark:text-blue-light hover:underline"
                          onClick={() => setActiveTab("login")}
                        >
                          تسجيل الدخول
                        </button>
                      </p>
                    </div>
                  </form>
                )}
              </div>
            </div>
            
            <div className="mt-8 text-center rtl">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                بتسجيلك الدخول، أنت توافق على{" "}
                <Link to="/terms" className="text-blue dark:text-blue-light hover:underline">
                  شروط الاستخدام
                </Link>{" "}
                و{" "}
                <Link to="/privacy" className="text-blue dark:text-blue-light hover:underline">
                  سياسة الخصوصية
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Auth;
