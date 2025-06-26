import React, { useState, useEffect, useMemo } from "react";
import { User, Mail, Phone, MapPin, Calendar, Save, ArrowLeft, Upload, Camera, Loader2, Heart, Bell, Package, LogOut, AlertTriangle, Eye, ExternalLink, Award, AlertCircle, Clock, Tag, MessageCircle, BellRing, CheckCheck, Trash2, X, Settings, Lock, EyeOff, ChevronDown } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { ContentWrapper } from "@/components/ui/content-wrapper";
import { userService, UserProfile, UpdateProfileData } from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import AuctionCard from "@/components/ui/AuctionCard";
import ReportTable from './Admin/ReportManagement';
import DisputeManagement from './Admin/DisputeManagement';
import UserDisputes from "@/components/profile/UserDisputes";
import Support from './Admin/Support';
import { useQuery } from '@tanstack/react-query';
import { auctionService } from '@/services/auctionService';
import { MyBids } from '@/components/bidding/MyBids';
import { useNotifications } from '@/hooks/useNotifications';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Table, TableHeader, TableBody, TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { reportService, Report } from '@/services/reportService';

const Profile = () => {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { logout, changePassword } = useAuth();
  
  // Add activeSection state
  const [activeSection, setActiveSection] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Password change states
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: ''
  });
  
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<UpdateProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    bio: '',
    dateOfBirth: ''
  });

  // Admin user management section
  const [adminTab, setAdminTab] = useState<'profile' | 'users' | 'reports' | 'disputes' | 'support'>('profile');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [roleEdit, setRoleEdit] = useState('User');

  const [searchQuery, setSearchQuery] = useState("");
  const { wishlistItems: favoriteItems, isLoading, error, removeFromWishlist } = useWishlist();

  // Add isSettingsOpen state to parent component
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Add at the top, after imports and inside the component:
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | number | null>(null);

  // Add effect to manage dropdown visibility based on active section
  useEffect(() => {
    if (activeSection === 'profile' || activeSection === 'settings') {
      setIsSettingsOpen(true);
    } else {
      setIsSettingsOpen(false);
    }
  }, [activeSection]);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const data = await userService.getCurrentUser();
      console.log('بيانات المستخدم:', data);
      setUserData(data);
      setFormData({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        address: data.address,
        bio: data.bio || '',
        dateOfBirth: data.dateOfBirth || ''
      });
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل البيانات",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
      toast({
        title: "خطأ في حفظ البيانات",
        description: "الرجاء إدخال جميع البيانات المطلوبة",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const updatedUser = await userService.updateProfile(formData);
      setUserData(updatedUser);
      setIsEditing(false);
      toast({
        title: "تم تحديث البيانات",
        description: "تم حفظ بياناتك الشخصية بنجاح"
      });
    } catch (error: any) {
      toast({
        title: "خطأ في حفظ البيانات",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleProfilePictureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { imageUrl } = await userService.uploadProfilePicture(file);
      setUserData(prev => prev ? { ...prev, profilePicture: imageUrl } : null);
      toast({
        title: "تم تحديث الصورة",
        description: "تم تحديث صورة الملف الشخصي بنجاح"
      });
    } catch (error: any) {
      toast({
        title: "خطأ في رفع الصورة",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth/login');
    } catch (error: any) {
      toast({
        title: "خطأ في تسجيل الخروج",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const toggleEditMode = () => {
    if (isEditing) {
      setFormData({
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || '',
        email: userData?.email || '',
        phoneNumber: userData?.phoneNumber || '',
        address: userData?.address || '',
        bio: userData?.bio || '',
        dateOfBirth: userData?.dateOfBirth || ''
      });
    }
    setIsEditing(!isEditing);
  };

  // Fetch all users for admin
  const fetchAllUsers = async () => {
    setUsersLoading(true);
    try {
      const users = await userService.getAllUsers();
      setAllUsers(users);
    } catch (error: any) {
      toast({
        title: 'خطأ في تحميل المستخدمين',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUsersLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      await userService.deleteUser(userToDelete.toString());
      toast({ title: 'تم حذف المستخدم بنجاح' });
      fetchAllUsers();
    } catch (error: any) {
      toast({ title: 'خطأ في حذف المستخدم', description: error.message, variant: 'destructive' });
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  // Edit user role
  const handleEditUserRole = async (id: string | number, newRole: 'User' | 'Admin') => {
    try {
      await userService.updateUserRole(id.toString(), newRole);
      toast({ title: 'تم تحديث الصلاحية بنجاح' });
      fetchAllUsers();
    } catch (error: any) {
      toast({ title: 'خطأ في تحديث الصلاحية', description: error.message, variant: 'destructive' });
    }
  };

  // Admin users table
  const AdminUsersTable = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 mt-8">
      <h2 className="text-xl font-bold mb-6">إدارة المستخدمين</h2>
      {usersLoading ? (
        <div className="text-center py-8">جاري التحميل...</div>
      ) : (
        <table className="w-full text-center">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700">
              <th className="p-2">#</th>
              <th className="p-2">اسم المستخدم</th>
              <th className="p-2">البريد الإلكتروني</th>
              <th className="p-2">الصلاحية</th>
              <th className="p-2">الحالة</th>
              <th className="p-2">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {allUsers.map((u, idx) => (
              <tr key={u.id} className="border-b border-gray-100 dark:border-gray-700">
                <td className="p-2">{idx + 1}</td>
                <td className="p-2">{u.username}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">
                  <select
                    value={u.role}
                    onChange={e => handleEditUserRole(u.id, e.target.value as 'User' | 'Admin')}
                    className="rounded px-2 py-1 border border-gray-200 dark:bg-gray-800"
                  >
                    <option value="User">مستخدم</option>
                    <option value="Admin">مدير</option>
                  </select>
                </td>
                <td className="p-2">{u.isActive ? 'نشط' : 'غير نشط'}</td>
                <td className="p-2">
                  <button
                    className="text-red-500 hover:underline"
                    onClick={() => { setUserToDelete(u.id); setShowDeleteModal(true); }}
                  >
                    حذف
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  // Fetch users when admin tab is opened
  useEffect(() => {
    if (userData?.role === 'Admin' && adminTab === 'users') {
      fetchAllUsers();
    }
  }, [userData, adminTab]);

  const handleRemoveFavorite = async (id: string) => {
    try {
      await removeFromWishlist(Number(id));
      toast({
        title: "تمت إزالة المزاد من المفضلة",
        description: "يمكنك إضافته مرة أخرى في أي وقت",
      });
    } catch (error) {
      toast({
        title: "فشل في إزالة العنصر من المفضلة",
        variant: "destructive",
      });
    }
  };

  // --- إحصائيات المزادات ---
  const { data: userAuctionsCount } = useQuery({
    queryKey: ["userAuctionsCount", userData?.id],
    queryFn: async () => {
      if (!userData?.id) return 0;
      const response = await auctionService.getUserAuctions(userData.id);
      const auctions = Array.isArray(response) ? response : response.data || [];
      return auctions.length;
    },
    enabled: !!userData?.id,
  });

  const { data: wonAuctionsCount } = useQuery({
    queryKey: ["wonAuctionsCount", userData?.id],
    queryFn: async () => {
      if (!userData?.id) return 0;
      const response = await auctionService.getCompletedAuctions();
      const auctions = Array.isArray(response) ? response : response.data || [];
      // المزادات الفائزة لهذا المستخدم فقط
      return auctions.filter((auction) => {
        if (!auction.bids || !auction.bids.length) return false;
        const topBid = auction.bids.reduce((max, bid) => (Number(bid.amount ?? 0) > Number(max.amount ?? 0) ? bid : max), auction.bids[0]);
        return String(topBid.userId) === String(userData.id);
      }).length;
    },
    enabled: !!userData?.id,
  });

  const handlePasswordDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordData.currentPassword || !passwordData.newPassword) {
      toast({
        title: "خطأ",
        description: "الرجاء إدخال جميع البيانات المطلوبة",
        variant: "destructive"
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast({
        title: "خطأ",
        description: "يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل",
        variant: "destructive"
      });
      return;
    }

    setIsChangingPassword(true);
    try {
      await changePassword({
        email: userData?.email || '',
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      toast({
        title: "تم تغيير كلمة المرور بنجاح",
        description: "يمكنك الآن استخدام كلمة المرور الجديدة"
      });
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: ''
      });
    } catch (error: any) {
      toast({
        title: "خطأ في تغيير كلمة المرور",
        description: error.message || "حدث خطأ أثناء تغيير كلمة المرور",
        variant: "destructive"
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex items-center justify-center h-[50vh]">
          <div className="w-16 h-16 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <h2 className="text-2xl font-bold mb-4">لم يتم العثور على البيانات</h2>
          <p className="text-lg text-gray-600 mb-6">
            عذراً، لا يمكن العثور على بيانات المستخدم
          </p>
          <Link to="/" className="btn-primary flex items-center gap-2">
            <span>العودة للرئيسية</span>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>
      </div>
    );
  }

  const ProfileHeader = () => (
    <div className="flex flex-col items-center mb-12">
      <div className="relative w-36 h-36 rounded-full border-4 border-white dark:border-gray-800 bg-white dark:bg-gray-800 flex items-center justify-center shadow-lg group cursor-pointer mt-8">
        {userData.profilePicture ? (
          <img
            src={
              userData.profilePicture.startsWith('http')
                ? userData.profilePicture
                : `http://mazadpalestine.runasp.net${userData.profilePicture}`
            }
            alt={userData.username}
            className="w-full h-full object-cover rounded-full"
            onClick={() => document.getElementById('profile-upload')?.click()}
            onError={(e) => { e.currentTarget.src = '/default-avatar.png'; }}
          />
        ) : (
          <span
            className="text-6xl font-bold text-blue dark:text-blue-light select-none flex items-center justify-center w-full h-full"
            onClick={() => document.getElementById('profile-upload')?.click()}
          >
            {userData.username?.charAt(0)?.toUpperCase() || <User className="w-16 h-16" />}
          </span>
        )}
        <button
          className="absolute bottom-2 right-2 bg-blue text-white p-2 rounded-full shadow hover:bg-blue-600 transition"
          onClick={() => document.getElementById('profile-upload')?.click()}
          title="تغيير الصورة"
          type="button"
        >
          <Camera className="w-5 h-5" />
        </button>
        <input
          id="profile-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleProfilePictureUpload}
        />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{userData.firstName + ' ' + userData.lastName}</h1>
      {userData.bio && (
        <div className="mt-2 text-gray-600 dark:text-gray-300 text-center max-w-md">
          {userData.bio}
        </div>
      )}
    </div>
  );

  const StatsCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-4 border border-gray-100 dark:border-gray-700">
      <h3 className="font-bold text-base mb-5 text-center tracking-wide text-blue-900 dark:text-blue-200">إحصائيات النشاط</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* اسم المستخدم */}
        <div className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200 dark:from-blue-900 dark:via-blue-800 dark:to-blue-700 shadow border border-blue-100 dark:border-blue-900 transition-transform hover:-translate-y-0.5 hover:shadow-lg min-h-[90px]">
          <div className="text-[10px] text-gray-500 dark:text-gray-300 mb-1">اسم المستخدم</div>
          <div className="text-lg font-extrabold text-blue-900 dark:text-blue-100 break-all">{userData.username}</div>
        </div>
        {/* عدد المزادات */}
        <div className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-green-50 via-green-100 to-green-200 dark:from-green-900 dark:via-green-800 dark:to-green-700 shadow border border-green-100 dark:border-green-800 transition-transform hover:-translate-y-0.5 hover:shadow-lg min-h-[90px]">
          <div className="text-[10px] text-gray-500 dark:text-gray-300 mb-1">عدد المزادات</div>
          <div className="text-lg font-extrabold text-green-900 dark:text-green-100">{userAuctionsCount ?? '-'}</div>
        </div>
        {/* عدد المزادات الفائزة */}
        <div className="group flex flex-col items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-yellow-50 via-yellow-100 to-yellow-200 dark:from-yellow-900 dark:via-yellow-800 dark:to-yellow-700 shadow border border-yellow-100 dark:border-yellow-800 transition-transform hover:-translate-y-0.5 hover:shadow-lg min-h-[90px]">
          <div className="text-[10px] text-gray-500 dark:text-gray-300 mb-1">المزادات الفائزة</div>
          <div className="text-lg font-extrabold text-yellow-900 dark:text-yellow-100">{wonAuctionsCount ?? '-'}</div>
        </div>
      </div>
    </div>
  );

  // Memoize QuickLinks component
  const QuickLinks = React.memo(() => {
    return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-lg mb-4">روابط سريعة</h3>
      <div className="space-y-2">
          {/* Other Quick Links */}
        {[
          { id: 'auctions', to: "#", label: "مزاداتي", icon: Package },
          { id: 'favorites', to: "#", label: "المفضلة", icon: Heart },
          { id: 'disputes', to: "#", label: "نزاعاتي", icon: AlertTriangle },
          { id: 'notifications', to: "#", label: "الإشعارات", icon: Bell },
          { id: 'reports', to: "#", label: "بلاغاتي", icon: AlertTriangle },
        ].map((link) => (
          <button
            key={link.id}
            onClick={() => setActiveSection(link.id)}
            className={`flex items-center gap-3 p-3 rounded-xl w-full transition-colors ${
              activeSection === link.id 
                ? 'bg-blue/10 text-blue dark:bg-blue-light/10 dark:text-blue-light'
                : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
            }`}
          >
            <link.icon className={`h-5 w-5 ${
              activeSection === link.id 
                ? 'text-blue dark:text-blue-light'
                : 'text-gray-500 dark:text-gray-400'
            }`} />
            <span>{link.label}</span>
          </button>
        ))}

          {/* Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl w-full transition-colors ${
                isSettingsOpen || activeSection === 'profile' || activeSection === 'settings'
                  ? 'bg-blue/10 text-blue dark:bg-blue-light/10 dark:text-blue-light'
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <div className="flex items-center gap-3">
                <Settings className={`h-5 w-5 ${
                  isSettingsOpen || activeSection === 'profile' || activeSection === 'settings'
                    ? 'text-blue dark:text-blue-light'
                    : 'text-gray-500 dark:text-gray-400'
                }`} />
                <span>الإعدادات</span>
              </div>
              <ChevronDown className={`h-4 w-4 transition-transform ${isSettingsOpen ? 'rotate-180' : ''} ${
                isSettingsOpen || activeSection === 'profile' || activeSection === 'settings'
                  ? 'text-blue dark:text-blue-light'
                  : 'text-gray-500 dark:text-gray-400'
              }`} />
            </button>
            
            {/* Settings Dropdown Menu */}
            {isSettingsOpen && (
              <div className="mr-8 mt-1 space-y-1">
                <button
                  onClick={() => {
                    setActiveSection('profile');
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl w-full transition-colors ${
                    activeSection === 'profile'
                      ? 'bg-blue/10 text-blue dark:bg-blue-light/10 dark:text-blue-light'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <User className={`h-5 w-5 ${
                    activeSection === 'profile'
                      ? 'text-blue dark:text-blue-light'
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span>البيانات الشخصية</span>
                </button>
                <button
                  onClick={() => {
                    setActiveSection('settings');
                  }}
                  className={`flex items-center gap-3 p-3 rounded-xl w-full transition-colors ${
                    activeSection === 'settings'
                      ? 'bg-blue/10 text-blue dark:bg-blue-light/10 dark:text-blue-light'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <Lock className={`h-5 w-5 ${
                    activeSection === 'settings'
                      ? 'text-blue dark:text-blue-light'
                      : 'text-gray-500 dark:text-gray-400'
                  }`} />
                  <span>الخصوصية والأمان</span>
                </button>
              </div>
            )}
          </div>

        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 rounded-xl w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
  });

  // Add UserAuctions component inside Profile (before MainContent):
  const UserAuctions = ({ userId }) => {
    const [filter, setFilter] = useState('all');
    const { data: auctions, isLoading, error } = useQuery({
      queryKey: ['userAuctions', userId],
      queryFn: async () => {
        const response = await auctionService.getUserAuctions(userId);
        return Array.isArray(response) ? response : response.data || [];
      },
      enabled: !!userId,
    });

    const filteredAuctions = useMemo(() => {
      if (!auctions) return [];
      
      switch (filter) {
        case 'active':
          return auctions.filter(auction => 
            auction.status === 'Active' || 
            (new Date(auction.endDate) > new Date() && auction.status !== 'Cancelled')
          );
        case 'ended':
          return auctions.filter(auction => 
            auction.status === 'Ended' || 
            new Date(auction.endDate) <= new Date()
          );
        default:
          return auctions;
      }
    }, [auctions, filter]);

    if (isLoading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h3 className="text-lg font-semibold mb-2">حدث خطأ</h3>
          <p className="text-gray-500">لم نتمكن من تحميل المزادات الخاصة بك</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex gap-4">
            <button 
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all' 
                  ? 'bg-blue/10 text-blue dark:text-blue-light' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              الكل ({auctions?.length || 0})
            </button>
            <button 
              onClick={() => setFilter('active')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'active' 
                  ? 'bg-blue/10 text-blue dark:text-blue-light' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              النشطة ({auctions?.filter(a => a.status === 'Active' || (new Date(a.endDate) > new Date() && a.status !== 'Cancelled')).length || 0})
            </button>
            <button 
              onClick={() => setFilter('ended')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'ended' 
                  ? 'bg-blue/10 text-blue dark:text-blue-light' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              المنتهية ({auctions?.filter(a => a.status === 'Ended' || new Date(a.endDate) <= new Date()).length || 0})
            </button>
          </div>
          <Link 
            to="/create-auction"
            className="bg-blue text-white dark:bg-blue-light dark:text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-600 dark:hover:bg-blue-400 transition-colors"
          >
            <Package className="h-4 w-4" />
            <span>إضافة مزاد</span>
          </Link>
        </div>

        {!filteredAuctions.length ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <Package className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold mb-2">لا توجد مزادات {filter !== 'all' ? 'في هذه الحالة' : ''}</h3>
            <p className="text-gray-500 mb-4">
              {filter === 'all' 
                ? 'لم تقم بإنشاء أي مزادات حتى الآن' 
                : filter === 'active' 
                  ? 'لا توجد مزادات نشطة حالياً'
                  : 'لا توجد مزادات منتهية'
              }
            </p>
            {filter === 'all' && (
              <Link 
                to="/create-auction"
                className="inline-flex items-center gap-2 bg-blue text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Package className="h-4 w-4" />
                <span>إنشاء مزاد جديد</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAuctions.map(auction => (
              <AuctionCard
                key={auction.id}
                id={auction.id}
                title={auction.title || auction.name}
                description={auction.description || ''}
                currentPrice={auction.currentBid || auction.startingPrice}
                minBidIncrement={auction.bidIncrement}
                imageUrl={auction.images?.[0] || auction.imageUrl || ''}
                endTime={auction.endDate}
                bidders={auction.bidsCount || (auction.bids?.length || 0)}
                ownerView={true}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  // Add content components for each section
  const ProfileForm = React.memo(() => {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateProfileData>({
      firstName: userData?.firstName || '',
      lastName: userData?.lastName || '',
      email: userData?.email || '',
      phoneNumber: userData?.phoneNumber || '',
      address: userData?.address || '',
      bio: userData?.bio || '',
      dateOfBirth: userData?.dateOfBirth || ''
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const toggleEditMode = () => {
      if (isEditing) {
        setFormData({
          firstName: userData?.firstName || '',
          lastName: userData?.lastName || '',
          email: userData?.email || '',
          phoneNumber: userData?.phoneNumber || '',
          address: userData?.address || '',
          bio: userData?.bio || '',
          dateOfBirth: userData?.dateOfBirth || ''
        });
      }
      setIsEditing(!isEditing);
    };

    const handleSaveChanges = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!formData.firstName || !formData.lastName || !formData.email || !formData.phoneNumber) {
        toast({
          title: "خطأ في حفظ البيانات",
          description: "الرجاء إدخال جميع البيانات المطلوبة",
          variant: "destructive"
        });
        return;
      }
      
      try {
        const updatedUser = await userService.updateProfile(formData);
        setUserData(updatedUser);
        setIsEditing(false);
        toast({
          title: "تم تحديث البيانات",
          description: "تم حفظ بياناتك الشخصية بنجاح"
        });
      } catch (error: any) {
        toast({
          title: "خطأ في حفظ البيانات",
          description: error.message,
          variant: "destructive"
        });
      }
    };

    // Memoize InputField component to prevent unnecessary re-renders
    interface InputFieldProps {
      id: string;
      label: string;
      icon: React.ElementType;
      value: string;
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
      type?: string;
      readonly?: boolean;
    }

    const InputField = React.memo(({ 
      id, 
      label, 
      icon: Icon, 
      value, 
      onChange, 
      type = "text",
      readonly = false 
    }: InputFieldProps) => {
      if (id === "dateOfBirth" && readonly) {
        const formatted = value ? new Date(value).toISOString().slice(0, 10) : '';
        return (
          <div className="flex flex-col gap-1">
            <label htmlFor={id} className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200 text-right pr-2">
              {label}
            </label>
            <div className="relative">
              <div className="w-full py-3 px-5 pr-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-right text-base shadow-sm flex items-center min-h-[48px]">
                <span className="flex-1">{formatted}</span>
                <Icon className="ml-2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        );
      }
      if (id === "createdAt" && readonly) {
        const formatted = value ? new Date(value).toISOString().slice(0, 10) : '';
        return (
          <div className="flex flex-col gap-1">
            <label htmlFor={id} className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200 text-right pr-2">
              {label}
            </label>
            <div className="relative">
              <div className="w-full py-3 px-5 pr-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-right text-base shadow-sm flex items-center min-h-[48px]">
                <span className="flex-1">{formatted}</span>
                <Icon className="ml-2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>
        );
      }
      const inputType = id === "dateOfBirth" && !readonly ? "date" : type;
      return (
        <div className="flex flex-col gap-1">
          <label htmlFor={id} className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-200 text-right pr-2">
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            name={id}
              type={inputType}
            value={value ?? ''}
            onChange={onChange}
            readOnly={readonly}
              className={`w-full py-3 px-5 pr-10 rounded-xl border-0 ${readonly ? 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold' : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white'} text-right text-base shadow-sm focus:ring-2 focus:ring-blue focus:border-transparent transition-colors`}
            />
            <Icon className="absolute top-1/2 transform -translate-y-1/2 right-3 h-5 w-5 text-gray-400 pointer-events-none" />
        </div>
      </div>
    );
    });

    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">البيانات الشخصية</h2>
          <button 
            onClick={toggleEditMode}
            className={`
              py-2.5 px-5 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2
              ${isEditing 
                ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                : 'bg-blue text-white hover:bg-blue-600 dark:bg-blue-light dark:text-gray-900 dark:hover:bg-blue-400'
              }
            `}
          >
            {isEditing ? (
              <>
                <span>إلغاء</span>
              </>
            ) : (
              <>
                <User className="h-4 w-4" />
                <span>تعديل</span>
              </>
            )}
          </button>
        </div>

        <form onSubmit={handleSaveChanges} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <InputField
              key="firstName"
              id="firstName"
              label="الاسم الأول"
              icon={User}
              type="text"
              value={isEditing ? formData.firstName : (userData?.firstName ?? '')}
              onChange={handleInputChange}
              readonly={!isEditing}
            />
            <InputField
              key="lastName"
              id="lastName"
              label="الاسم الأخير"
              icon={User}
              type="text"
              value={isEditing ? formData.lastName : (userData?.lastName ?? '')}
              onChange={handleInputChange}
              readonly={!isEditing}
            />
            <InputField
              key="username"
              id="username"
              label="اسم المستخدم"
              icon={User}
              type="text"
              value={userData?.username ?? ''}
              onChange={() => {}}
              readonly={true}
            />
            <InputField
              key="email"
              id="email"
              label="البريد الإلكتروني"
              icon={Mail}
              type="email"
              value={isEditing ? formData.email : (userData?.email ?? '')}
              onChange={handleInputChange}
              readonly={!isEditing}
            />
            <InputField
              key="phoneNumber"
              id="phoneNumber"
              label="رقم الهاتف"
              icon={Phone}
              type="tel"
              value={isEditing ? formData.phoneNumber : (userData?.phoneNumber ?? '')}
              onChange={handleInputChange}
              readonly={!isEditing}
            />
            <InputField
              key="address"
              id="address"
              label="العنوان"
              icon={MapPin}
              type="text"
              value={isEditing ? formData.address : (userData?.address ?? '')}
              onChange={handleInputChange}
              readonly={!isEditing}
            />
           <InputField
           key="dateOfBirth"
           id="dateOfBirth"
          label="تاريخ الميلاد"
          icon={Calendar}
          type="date"
          value={isEditing 
    ? (formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : '') 
    : (userData?.dateOfBirth ? userData.dateOfBirth.split('T')[0] : '')
  }
  onChange={handleInputChange}
  readonly={!isEditing}
/>
            <InputField
              key="bio"
              id="bio"
              label="نبذة عنك"
              icon={User}
              type="text"
              value={isEditing ? formData.bio : (userData?.bio ?? 'غير محدد')}
              onChange={handleInputChange}
              readonly={!isEditing}
            />
            <InputField
              key="createdAt"
              id="createdAt"
              label="تاريخ الانضمام"
              icon={Calendar}
              type="text"
              value={userData?.createdAt ?? ''}
              onChange={() => {}}
              readonly={true}
            />
            <InputField
              key="role"
              id="role"
              label="نوع الحساب"
              icon={User}
              type="text"
              value={userData?.role === "Admin" ? "مدير" : "مستخدم"}
              onChange={() => {}}
              readonly={true}
            />
            <InputField
              key="isActive"
              id="isActive"
              label="حالة الحساب"
              icon={User}
              type="text"
              value={userData?.isActive ? "نشط" : "غير نشط"}
              onChange={() => {}}
              readonly={true}
            />
          </div>
          {isEditing && (
            <div className="pt-6 border-t border-gray-100 dark:border-gray-700 flex justify-end">
              <button
                type="submit"
                className="bg-blue text-white dark:bg-blue-light dark:text-gray-900 py-2.5 px-6 rounded-xl flex items-center gap-2 hover:bg-blue-600 dark:hover:bg-blue-400 transition-colors"
              >
                <Save className="h-4 w-4" />
                <span>حفظ التغييرات</span>
              </button>
            </div>
          )}
        </form>
      </div>
    );
  });

  // Add PasswordChangeForm component before MainContent
  const PasswordChangeForm = React.memo(() => {
    const { changePassword } = useAuth();
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [showSuccessState, setShowSuccessState] = useState(false);
    const [showPasswords, setShowPasswords] = useState({
      current: false,
      new: false
    });
    const [passwordData, setPasswordData] = useState({
      currentPassword: '',
      newPassword: ''
    });

    const resetForm = () => {
      setPasswordData({
        currentPassword: '',
        newPassword: ''
      });
      setShowPasswords({
        current: false,
        new: false
      });
    };

    const handlePasswordDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setPasswordData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const togglePasswordVisibility = (field: 'current' | 'new') => {
      setShowPasswords(prev => ({
        ...prev,
        [field]: !prev[field]
      }));
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!passwordData.currentPassword || !passwordData.newPassword) {
        toast({
          title: "خطأ",
          description: "الرجاء إدخال جميع البيانات المطلوبة",
          variant: "destructive"
        });
        return;
      }

      if (passwordData.newPassword.length < 6) {
        toast({
          title: "خطأ",
          description: "يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل",
          variant: "destructive"
        });
        return;
      }

      setIsChangingPassword(true);
      try {
        await changePassword({
          email: userData?.email || '',
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        });
        
        // Show success state
        setShowSuccessState(true);
        
        // Reset form
        resetForm();
        
        // Hide success state after 3 seconds
        setTimeout(() => {
          setShowSuccessState(false);
        }, 3000);
        
      } catch (error: any) {
        toast({
          title: "خطأ في تغيير كلمة المرور",
          description: error.message || "حدث خطأ أثناء تغيير كلمة المرور",
          variant: "destructive"
        });
      } finally {
        setIsChangingPassword(false);
      }
    };

    if (showSuccessState) {
      return (
        <div className="flex flex-col items-center justify-center py-8 space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-scale-up">
              <CheckCheck className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="absolute -top-1 -right-1 w-20 h-20 border-4 border-green-500 rounded-full animate-success-circle"></div>
          </div>
          <h3 className="text-xl font-semibold text-green-600 dark:text-green-400">
            تم تغيير كلمة المرور بنجاح
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            يمكنك الآن استخدام كلمة المرور الجديدة لتسجيل الدخول
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Privacy & Security Section */}
        <div>
          <h3 className="text-lg font-semibold mb-4">الخصوصية والأمان</h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-6">
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <label htmlFor="currentPassword" className="block text-sm font-medium mb-2">
                  كلمة المرور الحالية
                </label>
                <div className="relative">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={handlePasswordDataChange}
                    className="w-full py-3 px-5 pr-12 rounded-xl bg-white dark:bg-gray-800 border-none text-base"
                    placeholder="●●●●●●●●"
                  />
                  <Lock className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('current')}
                    className="absolute top-1/2 transform -translate-y-1/2 left-4 text-gray-400"
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
                    value={passwordData.newPassword}
                    onChange={handlePasswordDataChange}
                    className="w-full py-3 px-5 pr-12 rounded-xl bg-white dark:bg-gray-800 border-none text-base"
                    placeholder="●●●●●●●●"
                  />
                  <Lock className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => togglePasswordVisibility('new')}
                    className="absolute top-1/2 transform -translate-y-1/2 left-4 text-gray-400"
                  >
                    {showPasswords.new ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3 rounded-xl flex items-center justify-center gap-2"
                disabled={isChangingPassword}
              >
                {isChangingPassword ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>جاري تغيير كلمة المرور...</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5" />
                    <span>تغيير كلمة المرور</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  });

  // Then define MainContent after ProfileForm
  const MainContent = () => {
    const ContentWrapper = ({ 
      title, 
      children 
    }: { 
      title: string; 
      children: React.ReactNode;
    }) => (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold mb-6">{title}</h2>
        {children}
      </div>
    );

    const EmptyState = ({ 
      message,
      icon: Icon = Package 
    }: { 
      message: string;
      icon?: React.ElementType;
    }) => (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
          <Icon className="h-8 w-8 text-gray-400" />
        </div>
        <p className="text-gray-500 dark:text-gray-400">{message}</p>
      </div>
    );

    // If no section is selected, return null
    if (!activeSection) {
      return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative w-20 h-20 mb-8">
              <div className="absolute inset-0 bg-blue/5 dark:bg-blue-light/5 rounded-xl animate-pulse"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex flex-col items-center gap-1">
                  <Package className="h-6 w-6 text-blue dark:text-blue-light" />
                  <Heart className="h-5 w-5 text-blue/70 dark:text-blue-light/70" />
                  <Bell className="h-4 w-4 text-blue/40 dark:text-blue-light/40" />
                </div>
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
              اختر قسماً من القائمة
            </h3>
            <p className="text-gray-500 dark:text-gray-400 max-w-md">
              يمكنك اختيار أي قسم من القائمة الجانبية لعرض محتواه هنا
            </p>
          </div>
        </div>
      );
    }

    switch (activeSection) {
      case 'profile':
        return <ProfileForm />;
      
      case 'settings':
        return (
          <ContentWrapper title="">
            <PasswordChangeForm />
          </ContentWrapper>
        );
      
      case 'auctions':
        return (
          <ContentWrapper title="مزاداتي">
            <UserAuctions userId={userData.id} />
          </ContentWrapper>
        );
      
      case 'favorites':
        return (
          <ContentWrapper title="المفضلة">
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-6">
                <input
                  type="text"
                  placeholder="البحث في المفضلة..."
                  className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 w-64"
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Link to="/favorites" className="text-blue hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                  عرض الكل
                </Link>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500">حدث خطأ أثناء تحميل المفضلة</p>
                </div>
              ) : favoriteItems.length === 0 ? (
                <EmptyState message="لا توجد عناصر في المفضلة" icon={Heart} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteItems.map((item) => (
                    <AuctionCard
                      key={item.listingId}
                      id={String(item.listing.id)}
                      listingId={item.listingId}
                      title={item.listing.title}
                      description={item.listing.description}
                      currentPrice={item.listing.currentPrice}
                      minBidIncrement={1000}
                      imageUrl={item.listing.images[0] || "/placeholder.svg"}
                      endTime={item.listing.endDate}
                      bidders={0}
                      currency="₪"
                      isPopular={false}
                      isFavorite={true}
                      onFavoriteToggle={() => handleRemoveFavorite(String(item.listingId))}
                    />
                  ))}
                </div>
              )}
            </div>
          </ContentWrapper>
        );
      
      case 'disputes':
        return (
          <ContentWrapper title="نزاعاتي">
            <UserDisputes />
          </ContentWrapper>
        );
      
      case 'notifications':
        // Notifications section with filters and actions
        const {
          notifications,
          isLoading: notifLoading,
          markAsRead,
          markAllAsRead,
          deleteNotification,
          clearAllNotifications,
        } = useNotifications();
        const [notifFilter, setNotifFilter] = useState('all');
        // ترتيب الإشعارات من الأحدث للأقدم
        const sortedNotifications = [...notifications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const filteredNotifications = notifFilter === 'all' ? sortedNotifications : sortedNotifications.filter(n => n.type === notifFilter);

        // NotificationItem بنفس نمط صفحة Notifications
        const NotificationItem = ({ notification, onClick }) => {
          const getNotificationContent = (type) => {
            switch (type) {
              case 'AuctionWon':
                return {
                  icon: <Award className="h-5 w-5 text-green-500" />,
                  bgColor: 'bg-green-500/10',
                  title: 'تهانينا! لقد فزت بالمزاد'
                };
              case 'BidOutbid':
                return {
                  icon: <AlertCircle className="h-5 w-5 text-red-500" />,
                  bgColor: 'bg-red-500/10',
                  title: 'تم تجاوز مزايدتك'
                };
              case 'AuctionEnded':
                return {
                  icon: <Clock className="h-5 w-5 text-orange-500" />,
                  bgColor: 'bg-orange-500/10',
                  title: 'المزاد انتهى'
                };
              case 'BidPlaced':
                return {
                  icon: <Tag className="h-5 w-5 text-blue-500" />,
                  bgColor: 'bg-blue-500/10',
                  title: 'تمت مزايدة جديدة'
                };
              case 'MassageReceived':
                return {
                  icon: <MessageCircle className="h-5 w-5 text-purple-500" />,
                  bgColor: 'bg-purple-500/10',
                  title: 'رسالة جديدة'
                };
              case 'AuctionCancelled':
                return {
                  icon: <BellRing className="h-5 w-5 text-red-500" />,
                  bgColor: 'bg-red-500/10',
                  title: 'تم إلغاء المزاد'
                };
              default:
                return {
                  icon: <BellRing className="h-5 w-5 text-gray-500" />,
                  bgColor: 'bg-gray-500/10',
                  title: 'إشعار'
                };
            }
          };
          const content = getNotificationContent(notification.type);
          const unreadBg = notification.status === "Read" ? "bg-white dark:bg-gray-800" : "bg-blue-50 dark:bg-blue-900/30";
          const handleClick = () => {
            if (notification.status !== "Read") {
              markAsRead(notification.id);
            }
            if (onClick) onClick();
          };
          return (
            <div
              className={`rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4 rtl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${unreadBg}`}
              onClick={handleClick}
              tabIndex={0}
              role="button"
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full ${content.bgColor} flex items-center justify-center`}>
                    {content.icon}
                  </div>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {content.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={e => { e.stopPropagation(); deleteNotification(notification.id); }}
                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                        title="حذف الإشعار"
                      >
                        <X className="h-4 w-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                    {notification.message}
                  </p>
                  <div className="text-xs text-gray-500">
                    {notification.formattedDate || new Date(notification.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        };

        return (
          <ContentWrapper title="الإشعارات">
            <div className="container mx-auto px-0 py-0 rtl">
              <div className="flex justify-between items-center mb-8 rtl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue/10 dark:bg-blue/20 rounded-full flex items-center justify-center text-blue dark:text-blue-light">
                    <BellRing className="w-5 h-5" />
                  </div>
                  <h1 className="heading-lg">الإشعارات</h1>
                </div>
                <div className="flex gap-4">
                  {notifications.length > 0 && (
                    <button 
                      onClick={clearAllNotifications}
                      className="flex items-center gap-2 text-red-500 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>حذف الكل</span>
                    </button>
                  )}
                  {notifications.some(n => !n.isRead) && (
                    <button 
                      onClick={markAllAsRead}
                      className="flex items-center gap-2 text-blue hover:text-blue-light transition-colors"
                    >
                      <CheckCheck className="h-4 w-4" />
                      <span>تعليم الكل كمقروء</span>
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="border-b border-gray-100 dark:border-gray-700 p-4 rtl">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    <button 
                      onClick={() => setNotifFilter('all')}
                      className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${notifFilter === 'all' ? 'bg-blue text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'}`}
                    >
                      الكل
                    </button>
                    <button 
                      onClick={() => setNotifFilter('AuctionWon')}
                      className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${notifFilter === 'AuctionWon' ? 'bg-green-500 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'}`}
                    >
                      فوز بمزاد
                    </button>
                    <button 
                      onClick={() => setNotifFilter('BidOutbid')}
                      className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${notifFilter === 'BidOutbid' ? 'bg-red-500 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'}`}
                    >
                      تم تجاوز مزايدتك
                    </button>
                    <button 
                      onClick={() => setNotifFilter('AuctionEnded')}
                      className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${notifFilter === 'AuctionEnded' ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'}`}
                    >
                      مزادات منتهية
                    </button>
                    <button 
                      onClick={() => setNotifFilter('BidPlaced')}
                      className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${notifFilter === 'BidPlaced' ? 'bg-blue text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'}`}
                    >
                      مزايدات جديدة
                    </button>
                    <button 
                      onClick={() => setNotifFilter('MassageReceived')}
                      className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${notifFilter === 'MassageReceived' ? 'bg-purple-500 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'}`}
                    >
                      رسائل جديدة
                    </button>
                    <button 
                      onClick={() => setNotifFilter('General')}
                      className={`px-4 py-2 rounded-full text-sm whitespace-nowrap ${notifFilter === 'General' ? 'bg-gray-600 text-white' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors'}`}
                    >
                      إشعارات عامة
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  {notifLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="animate-pulse flex items-start gap-4 p-4 rounded-lg rtl">
                          <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  ) : filteredNotifications.length > 0 ? (
                    <div className="space-y-4">
                      {filteredNotifications.map((notification) => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onClick={() => markAsRead(notification.id)}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                        <BellRing className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">لا توجد إشعارات</h3>
                      <p className="text-gray-500 dark:text-gray-400">
                        ستظهر هنا الإشعارات المتعلقة بمزايداتك ونشاطاتك على المنصة
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ContentWrapper>
        );
      
      case 'reports':
        return (
          <ContentWrapper title="بلاغاتي">
            <UserReports />
          </ContentWrapper>
        );
      
      default:
        return null;
    }
  };

  // Add this component before ProfileForm
  const UserReports = () => {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedReport, setSelectedReport] = useState<Report | null>(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
      fetchUserReports();
    }, []);

    const fetchUserReports = async () => {
      try {
        setLoading(true);
        const response = await reportService.getUserReports();
        // Make sure we're handling both possible response formats (direct array or object with data property)
        const reportsData = Array.isArray(response) ? response : 
                         (response as any)?.data ? (response as any).data : [];
        console.log('Reports data:', reportsData);
        setReports(reportsData);
      } catch (error) {
        console.error('Error fetching reports:', error);
        toast({
          title: "خطأ في تحميل البلاغات",
          description: "حدث خطأ أثناء تحميل البلاغات",
          variant: "destructive",
        });
        setReports([]);
      } finally {
        setLoading(false);
      }
    };

    const handleViewDetails = (report: Report) => {
      setSelectedReport(report);
      setShowDetailsDialog(true);
    };

    const navigateToReportedItem = (report: Report) => {
      if (report?.reportedListingId) {
        navigate(`/listing/${report.reportedListingId}`);
      } else if (report?.reportedAuctionId) {
        navigate(`/auction/${report.reportedAuctionId}`);
      } else {
        toast({
          title: "عذراً",
          description: "لا يمكن الوصول إلى العنصر المبلغ عنه",
          variant: "destructive",
        });
      }
    };

    const getStatusBadgeClass = (status: string | undefined) => {
      if (!status) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      
      switch (status) {
        case 'Resolved':
          return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
        case 'Rejected':
          return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
        case 'Pending':
        default:
          return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      }
    };

    const getStatusText = (status: string | undefined) => {
      if (!status) return "قيد المراجعة";
      
      switch (status) {
        case 'Resolved':
          return "تم الحل";
        case 'Rejected':
          return "مرفوض";
        case 'Pending':
        default:
          return "قيد المراجعة";
      }
    };

    return (
      <>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue"></div>
          </div>
        ) : reports && Array.isArray(reports) && reports.length > 0 ? (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>نوع البلاغ</TableHead>
                  <TableHead>سبب البلاغ</TableHead>
                  <TableHead>تاريخ البلاغ</TableHead>
                  <TableHead>الحالة</TableHead>
                  <TableHead>الإجراءات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report?.reportId || Math.random()}>
                    <TableCell>
                      <button 
                        onClick={() => navigateToReportedItem(report)}
                        className="text-blue-600 hover:underline flex items-center"
                      >
                        {report?.reportedListingId ? 'منتج' : report?.reportedAuctionId ? 'مزاد' : 'آخر'}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </button>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">{report?.reason || ''}</TableCell>
                    <TableCell>
                      {report?.createdAt ? 
                        format(new Date(report.createdAt), 'dd MMM yyyy', { locale: ar }) : 
                        '-'
                      }
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${getStatusBadgeClass(report?.status)}`}>
                        {getStatusText(report?.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(report)}
                          title="عرض التفاصيل"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigateToReportedItem(report)}
                          className="text-blue-600"
                          title="الذهاب إلى العنصر المبلغ عنه"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-500 dark:text-gray-400">لا يوجد لديك أي بلاغات</p>
          </div>
        )}

        <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>تفاصيل البلاغ</DialogTitle>
            </DialogHeader>
            {selectedReport && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">نوع البلاغ:</h3>
                  <button 
                    onClick={() => {
                      setShowDetailsDialog(false);
                      navigateToReportedItem(selectedReport);
                    }}
                    className="text-blue-600 hover:underline flex items-center"
                  >
                    {selectedReport?.reportedListingId ? 'منتج' : selectedReport?.reportedAuctionId ? 'مزاد' : 'آخر'}
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </button>
                </div>
                {selectedReport?.reportedListingTitle && (
                  <div>
                    <h3 className="font-medium">عنوان المنتج:</h3>
                    <button 
                      onClick={() => {
                        setShowDetailsDialog(false);
                        navigateToReportedItem(selectedReport);
                      }}
                      className="text-blue-600 hover:underline flex items-center"
                    >
                      {selectedReport.reportedListingTitle}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </button>
                  </div>
                )}
                <div>
                  <h3 className="font-medium">سبب البلاغ:</h3>
                  <p>{selectedReport?.reason || ''}</p>
                </div>
                <div>
                  <h3 className="font-medium">تاريخ البلاغ:</h3>
                  <p>{selectedReport?.createdAt ? 
                    format(new Date(selectedReport.createdAt), 'dd MMMM yyyy', { locale: ar }) :
                    '-'
                  }</p>
                </div>
                <div>
                  <h3 className="font-medium">الحالة:</h3>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(selectedReport?.status)}`}>
                    {getStatusText(selectedReport?.status)}
                  </span>
                </div>
                {selectedReport?.resolverName && (
                  <div>
                    <h3 className="font-medium">تم معالجة البلاغ بواسطة:</h3>
                    <p>{selectedReport.resolverName}</p>
                  </div>
                )}
                {selectedReport?.resolution && (
                  <div>
                    <h3 className="font-medium">رد الإدارة:</h3>
                    <p className="mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm">
                      {selectedReport.resolution}
                    </p>
                  </div>
                )}
                
                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={() => {
                      setShowDetailsDialog(false);
                      navigateToReportedItem(selectedReport);
                    }}
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span>عرض العنصر المبلغ عنه</span>
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow pt-16 md:pt-24 pb-12 md:pb-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <ProfileHeader />

          {/* Admin tab navigation */}
          {userData.role === 'Admin' && (
            <div className="flex justify-center gap-4 mt-8 mb-8">
              <button
                className={`px-6 py-2 rounded-xl font-semibold transition-all ${adminTab === 'users' ? 'bg-blue text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                onClick={() => setAdminTab('users')}
              >
                إدارة المستخدمين
              </button>
              <button
                className={`px-6 py-2 rounded-xl font-semibold transition-all ${adminTab === 'reports' ? 'bg-blue text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                onClick={() => setAdminTab('reports')}
              >
                إدارة البلاغات
              </button>
              <button
                className={`px-6 py-2 rounded-xl font-semibold transition-all ${adminTab === 'disputes' ? 'bg-blue text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                onClick={() => setAdminTab('disputes')}
              >
                إدارة النزاعات
              </button>
              <button
                className={`px-6 py-2 rounded-xl font-semibold transition-all ${adminTab === 'support' ? 'bg-blue text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                onClick={() => setAdminTab('support')}
              >
                الدعم الفني
              </button>
            </div>
          )}

          <div className="mt-20 md:mt-16 flex flex-col md:flex-row gap-6 md:gap-8 rtl">
            <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
              <StatsCard />
              <QuickLinks />
            </div>
            <div className="w-full md:w-2/3 lg:w-3/4">
              {/* Show admin users table if admin and tab is users */}
              {userData.role === 'Admin' && adminTab === 'users' ? (
                <AdminUsersTable />
              ) : userData.role === 'Admin' && adminTab === 'reports' ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <ReportTable />
                </div>
              ) : userData.role === 'Admin' && adminTab === 'disputes' ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <DisputeManagement />
                </div>
              ) : userData.role === 'Admin' && adminTab === 'support' ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                  <Support />
                </div>
              ) : (
                <MainContent />
              )}
            </div>
          </div>
        </div>
      </main>
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">تأكيد الحذف</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => { setShowDeleteModal(false); setUserToDelete(null); }}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;