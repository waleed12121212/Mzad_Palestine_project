import React, { useEffect, useState } from "react";
import { Package, PlusCircle, User } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { userService, UserProfile } from "../../services/userService";
import { toast } from "sonner";

interface UserQuickPanelProps {
  userName?: string;
}

const UserQuickPanel: React.FC<UserQuickPanelProps> = ({ userName }) => {
  const { isAuthenticated, user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (isAuthenticated && user) {
        try {
          const profile = await userService.getCurrentUser();
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    };

    fetchUserProfile();
  }, [isAuthenticated, user]);

  const displayName = isAuthenticated && userProfile 
    ? `${userProfile.firstName} ${userProfile.lastName}` 
    : isAuthenticated && userName 
      ? userName 
      : "المستخدم";

  if (!isAuthenticated) {
    return null;
  }

  const handleSellProduct = (e: React.MouseEvent) => {
    e.preventDefault();
    toast("هذه الميزة ستكون متوفرة قريبًا", {
      description: "لتجربة أفضل على موقعنا. تابعنا لمعرفة موعد الإطلاق!"
    });
  };

  return (
    <div className="flex flex-wrap justify-end gap-4 mb-6 rtl">
      <Link 
        to="/profile" 
        className="flex items-center bg-white dark:bg-gray-800 rounded-full px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="mr-3 text-right">
          <p className="font-bold text-base">{displayName}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">عرض الملف الشخصي</p>
        </div>
        <div className="w-10 h-10 bg-blue/10 dark:bg-blue-dark/20 rounded-full flex items-center justify-center text-blue dark:text-blue-light">
          <User className="h-5 w-5" />
        </div>
      </Link>

      <Link 
        to="/create-auction" 
        className="flex items-center bg-white dark:bg-gray-800 rounded-full px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="mr-3 text-right">
          <p className="font-bold text-base">إنشاء مزاد</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">ابدأ مزاد جديد</p>
        </div>
        <div className="w-10 h-10 bg-green/10 dark:bg-green/20 rounded-full flex items-center justify-center text-green">
          <PlusCircle className="h-5 w-5" />
        </div>
      </Link>

      <Link 
        to="/sell-product" 
        onClick={handleSellProduct}
        className="flex items-center bg-white dark:bg-gray-800 rounded-full px-4 py-3 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="mr-3 text-right">
          <p className="font-bold text-base">بيع منتج</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">اعرض منتجك للبيع</p>
        </div>
        <div className="w-10 h-10 bg-blue/10 dark:bg-blue-dark/20 rounded-full flex items-center justify-center text-blue dark:text-blue-light">
          <Package className="h-5 w-5" />
        </div>
      </Link>
    </div>
  );
};

export default UserQuickPanel;
