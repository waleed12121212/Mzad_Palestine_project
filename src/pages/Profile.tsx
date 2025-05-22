import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Save, ArrowLeft, Upload, Camera, Loader2, Heart, Bell, Package, LogOut, AlertTriangle, Eye, ExternalLink } from "lucide-react";
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
  const { logout } = useAuth();
  
  // Add activeSection state
  const [activeSection, setActiveSection] = useState('profile');
  const [loading, setLoading] = useState(true);
  
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
      navigate('/login');
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
  const handleDeleteUser = async (id: string | number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await userService.deleteUser(id.toString());
      toast({ title: 'تم حذف المستخدم بنجاح' });
      fetchAllUsers();
    } catch (error: any) {
      toast({ title: 'خطأ في حذف المستخدم', description: error.message, variant: 'destructive' });
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
                    onClick={() => handleDeleteUser(u.id)}
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
      <div className="flex flex-col md:flex-row md:items-center gap-2 mt-2 justify-center">
        <span className="bg-white/80 text-blue px-3 py-1 rounded-xl text-sm font-semibold">{userData.username}</span>
        <span className={`px-3 py-1 rounded-xl text-sm font-semibold ${userData.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{userData.isActive ? 'نشط' : 'غير نشط'}</span>
        <span className="px-3 py-1 rounded-xl text-sm font-semibold bg-gray-100 text-gray-700">{userData.role === 'Admin' ? 'مدير' : 'مستخدم'}</span>
      </div>
    </div>
  );

  const StatsCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-lg mb-6 text-center">إحصائيات النشاط</h3>
      <div className="grid grid-cols-3 gap-4">
        {[
          { value: userData.username, label: "اسم المستخدم" },
          { value: userData.role === "Admin" ? "مدير" : "مستخدم", label: "الصلاحية" },
          { value: userData.isActive ? "نشط" : "غير نشط", label: "الحالة" }
        ].map((stat, index) => (
          <div key={index} className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 shadow-sm">
            <div className="text-lg font-semibold text-blue dark:text-blue-light mb-1">{stat.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  const QuickLinks = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="font-semibold text-lg mb-4">روابط سريعة</h3>
      <div className="space-y-2">
        {[
          { id: 'profile', to: "#", label: "البيانات الشخصية", icon: User },
          { id: 'auctions', to: "#", label: "مزاداتي", icon: Package },
          { id: 'bids', to: "#", label: "مزايداتي", icon: ArrowLeft },
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

  // Add UserAuctions component inside Profile (before MainContent):
  const UserAuctions = ({ userId }) => {
    const { data: response = {}, isLoading, error } = useQuery({
      queryKey: ['userAuctions', userId],
      queryFn: () => auctionService.getUserAuctions(userId),
      enabled: !!userId,
    });
    const auctions = (response as any).data || [];
    console.log('UserAuctions userId:', userId);
    console.log('UserAuctions raw auctions:', auctions);
    if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>;
    if (error) return <div className="text-red-500 text-center py-8">حدث خطأ أثناء تحميل المزادات</div>;
    if (!auctions.length) return <EmptyState message="لا يوجد مزادات حالياً" icon={Package} />;

    const normalizedAuctions = auctions.map(auction => ({
      id: auction.auctionId,
      listingId: auction.listingId,
      title: auction.name,
      description: '',
      currentPrice: auction.currentBid > 0 ? auction.currentBid : auction.reservePrice,
      minBidIncrement: auction.bidIncrement,
      imageUrl: auction.imageUrl,
      endTime: auction.endTime,
      bidders: auction.bidsCount,
    }));
    console.log('UserAuctions normalizedAuctions:', normalizedAuctions);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {normalizedAuctions.map(auction => (
          <AuctionCard
            key={auction.id}
            {...auction}
            ownerView={true}
          />
        ))}
      </div>
    );
  };

  // Add content components for each section
  const ProfileForm = () => {
    const InputField = ({ 
      id, 
      label, 
      icon: Icon, 
      value, 
      onChange, 
      type = "text", 
      readonly = false 
    }) => (
      <div>
        <label htmlFor={id} className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-200">
          {label}
        </label>
        <div className="relative">
          <input
            id={id}
            name={id}
            type={type}
            value={value ?? ''}
            onChange={onChange}
            readOnly={readonly}
            className={`w-full py-3 px-5 pr-12 rounded-xl border ${
              !readonly && isEditing 
                ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
                : 'bg-gray-50 dark:bg-gray-700 border-transparent'
            } focus:ring-2 focus:ring-blue focus:border-transparent transition-colors`}
          />
          <Icon className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
        </div>
      </div>
    );

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

        <form onSubmit={handleSaveChanges} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <InputField
              id="firstName"
              label="الاسم الأول"
              icon={User}
              value={isEditing ? formData.firstName : (userData.firstName ?? '')}
              onChange={handleInputChange}
              readonly={!isEditing}
            />
            <InputField
              id="lastName"
              label="الاسم الأخير"
              icon={User}
              value={isEditing ? formData.lastName : (userData.lastName ?? '')}
              onChange={handleInputChange}
              readonly={!isEditing}
            />
            <InputField
              id="username"
              label="اسم المستخدم"
              icon={User}
              value={userData.username ?? ''}
              onChange={() => {}}
              readonly={true}
            />
            <InputField
              id="email"
              label="البريد الإلكتروني"
              icon={Mail}
              type="email"
              value={isEditing ? formData.email : (userData.email ?? '')}
              onChange={handleInputChange}
              readonly={!isEditing}
            />
            <InputField
              id="phoneNumber"
              label="رقم الهاتف"
              icon={Phone}
              type="tel"
              value={isEditing ? formData.phoneNumber : (userData.phoneNumber ?? '')}
              onChange={handleInputChange}
              readonly={!isEditing}
            />
            <InputField
              id="address"
              label="العنوان"
              icon={MapPin}
              value={isEditing ? formData.address : (userData.address ?? '')}
              onChange={handleInputChange}
              readonly={!isEditing}
            />
            <InputField
              id="dateOfBirth"
              label="تاريخ الميلاد"
              icon={Calendar}
              type="date"
              value={isEditing ? (formData.dateOfBirth ? formData.dateOfBirth.substring(0, 10) : '') : (userData.dateOfBirth ? userData.dateOfBirth.substring(0, 10) : '')}
              onChange={handleInputChange}
              readonly={!isEditing}
            />
            <InputField
              id="bio"
              label="نبذة عنك"
              icon={User}
              value={isEditing ? formData.bio : (userData.bio ?? 'غير محدد')}
              onChange={handleInputChange}
              readonly={!isEditing}
            />
            <InputField
              id="createdAt"
              label="تاريخ الانضمام"
              icon={Calendar}
              value={userData.createdAt ? new Date(userData.createdAt).toLocaleDateString('ar-EG') : ''}
              onChange={() => {}}
              readonly={true}
            />
            <InputField
              id="role"
              label="نوع الحساب"
              icon={User}
              value={userData.role === "Admin" ? "مدير" : "مستخدم"}
              onChange={() => {}}
              readonly={true}
            />
            <InputField
              id="isActive"
              label="حالة الحساب"
              icon={User}
              value={userData.isActive ? "نشط" : "غير نشط"}
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
  };

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

    switch (activeSection) {
      case 'profile':
        return <ProfileForm />;
      
      case 'auctions':
        return (
          <ContentWrapper title="مزاداتي">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <button className="px-4 py-2 rounded-lg bg-blue/10 text-blue dark:text-blue-light">الكل</button>
                  <button className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">النشطة</button>
                  <button className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">المنتهية</button>
                </div>
                <button className="bg-blue text-white dark:bg-blue-light dark:text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2" onClick={() => navigate('/create-auction')}>
                  <Package className="h-4 w-4" />
                  <span>إضافة مزاد</span>
                </button>
              </div>
              {userData && <UserAuctions userId={userData.id} />}
            </div>
          </ContentWrapper>
        );
      
      case 'bids':
        return (
          <ContentWrapper title="مزايداتي">
            <div className="space-y-4">
              <div className="flex gap-4">
                <button className="px-4 py-2 rounded-lg bg-blue/10 text-blue dark:text-blue-light">الكل</button>
                <button className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">الفائزة</button>
                <button className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">قيد الانتظار</button>
              </div>
              <MyBids />
            </div>
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
        const filteredNotifications = notifFilter === 'all' ? notifications : notifications.filter(n => n.type === notifFilter);
        return (
          <ContentWrapper title="الإشعارات">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <button onClick={() => setNotifFilter('all')} className={`px-4 py-2 rounded-lg ${notifFilter === 'all' ? 'bg-blue/10 text-blue dark:text-blue-light' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>الكل</button>
                  <button onClick={() => setNotifFilter('AuctionWon')} className={`px-4 py-2 rounded-lg ${notifFilter === 'AuctionWon' ? 'bg-green-500/10 text-green-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>فوز بمزاد</button>
                  <button onClick={() => setNotifFilter('BidOutbid')} className={`px-4 py-2 rounded-lg ${notifFilter === 'BidOutbid' ? 'bg-red-500/10 text-red-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>تم تجاوز مزايدتك</button>
                  <button onClick={() => setNotifFilter('AuctionEnded')} className={`px-4 py-2 rounded-lg ${notifFilter === 'AuctionEnded' ? 'bg-orange-500/10 text-orange-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>مزادات منتهية</button>
                  <button onClick={() => setNotifFilter('BidPlaced')} className={`px-4 py-2 rounded-lg ${notifFilter === 'BidPlaced' ? 'bg-blue/10 text-blue' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>مزايدات جديدة</button>
                  <button onClick={() => setNotifFilter('MassageReceived')} className={`px-4 py-2 rounded-lg ${notifFilter === 'MassageReceived' ? 'bg-purple-500/10 text-purple-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>رسائل جديدة</button>
                  <button onClick={() => setNotifFilter('General')} className={`px-4 py-2 rounded-lg ${notifFilter === 'General' ? 'bg-gray-600/10 text-gray-700' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>إشعارات عامة</button>
                </div>
                <div className="flex gap-2">
                  {notifications.length > 0 && (
                    <>
                      <button onClick={clearAllNotifications} className="text-red-500 hover:text-red-600 transition-colors">حذف الكل</button>
                      <button onClick={markAllAsRead} className="text-blue hover:text-blue-light transition-colors">تعليم الكل كمقروء</button>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4">
                {notifLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin text-blue-500" /></div>
                ) : filteredNotifications.length > 0 ? (
                  <div className="space-y-4">
                    {filteredNotifications.map((notification) => (
                      <div key={notification.id} className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 p-4 mb-4 rtl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition ${!notification.isRead ? 'border-blue-200 dark:border-blue-400' : ''}`}
                        onClick={() => markAsRead(notification.id)}
                      >
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <Bell className="h-5 w-5 text-blue-500" />
                            </div>
                          </div>
                          <div className="flex-1 space-y-1">
                            <div className="flex justify-between items-start">
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                {notification.message}
                              </h3>
                              <div className="flex items-center gap-2">
                                {!notification.isRead && (
                                  <button onClick={e => { e.stopPropagation(); markAsRead(notification.id); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title="تعيين كمقروء">✔️</button>
                                )}
                                <button onClick={e => { e.stopPropagation(); deleteNotification(notification.id); }} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors" title="حذف الإشعار">🗑️</button>
                              </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                              {notification.formattedDate || new Date(notification.createdAt).toLocaleDateString('ar-EG', {
                                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyState message="لا يوجد إشعارات جديدة" icon={Bell} />
                )}
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
        return <ProfileForm />;
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
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClass(report?.status)}`}>
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
                className={`px-6 py-2 rounded-xl font-semibold transition-all ${adminTab === 'profile' ? 'bg-blue text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}
                onClick={() => setAdminTab('profile')}
              >
                البيانات الشخصية
              </button>
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
    </div>
  );
};

export default Profile;