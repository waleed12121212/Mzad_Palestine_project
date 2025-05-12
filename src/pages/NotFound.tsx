import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="flex flex-grow items-center justify-center bg-gray-50 dark:bg-gray-900 dark-mode-transition py-20">
      <div className="text-center max-w-lg px-6">
        <h1 className="text-9xl font-bold text-blue dark:text-blue-light mb-4">404</h1>
        <div className="w-16 h-1 bg-blue dark:bg-blue-light mx-auto mb-6"></div>
        <p className="text-2xl font-semibold mb-4 rtl">عذراً، الصفحة غير موجودة</p>
        <p className="text-gray-600 dark:text-gray-400 mb-8 rtl">
          الصفحة التي تبحث عنها غير موجودة أو تم نقلها. يرجى التحقق من العنوان أو العودة إلى الصفحة الرئيسية.
        </p>
        <Link 
          to="/" 
          className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-lg mx-auto"
        >
          <Home className="h-5 w-5" />
          <span className="rtl">العودة للرئيسية</span>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
