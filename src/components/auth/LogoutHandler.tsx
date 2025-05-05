import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../ui/use-toast';

export const LogoutHandler: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await logout();
        toast({
          title: "تم تسجيل الخروج بنجاح",
          description: "نراك قريباً!"
        });
      } catch (error: any) {
        toast({
          title: "خطأ في تسجيل الخروج",
          description: error.response?.data?.message || "حدث خطأ أثناء تسجيل الخروج",
          variant: "destructive"
        });
      } finally {
        navigate('/auth/login');
      }
    };

    handleLogout();
  }, [logout, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">جاري تسجيل الخروج</h2>
        <p className="text-gray-600 dark:text-gray-300">
          يرجى الانتظار...
        </p>
      </div>
    </div>
  );
}; 