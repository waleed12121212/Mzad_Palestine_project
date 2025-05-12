import React, { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Calendar, Save, ArrowLeft, Upload, Camera } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { LogOut, Heart, Bell, Package } from 'lucide-react';
import { userService, UserProfile, UpdateProfileData } from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";

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
  const [adminTab, setAdminTab] = useState<'profile' | 'users'>('profile');
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [roleEdit, setRoleEdit] = useState('User');

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
  const handleDeleteUser = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا المستخدم؟')) return;
    try {
      await userService.deleteUser(id);
      toast({ title: 'تم حذف المستخدم بنجاح' });
      fetchAllUsers();
    } catch (error: any) {
      toast({ title: 'خطأ في حذف المستخدم', description: error.message, variant: 'destructive' });
    }
  };

  // Edit user role
  const handleEditUserRole = async (id: number, newRole: string) => {
    try {
      await userService.updateUserRole(id, newRole);
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
                    onChange={e => handleEditUserRole(u.id, e.target.value)}
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
          { id: 'notifications', to: "#", label: "الإشعارات", icon: Bell },
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
        <button className="flex items-center gap-3 p-3 rounded-xl w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
          <LogOut className="h-5 w-5" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

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
                <button className="bg-blue text-white dark:bg-blue-light dark:text-gray-900 px-4 py-2 rounded-lg flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>إضافة مزاد</span>
                </button>
              </div>
              <EmptyState message="لا يوجد مزادات حالياً" />
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
              <EmptyState message="لا يوجد مزايدات حالياً" icon={ArrowLeft} />
            </div>
          </ContentWrapper>
        );
      
      case 'favorites':
        return (
          <ContentWrapper title="المفضلة">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <input
                  type="text"
                  placeholder="البحث في المفضلة..."
                  className="px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-700 w-64"
                />
                <button className="text-gray-500 hover:text-red-500">
                  <Heart className="h-5 w-5" />
                </button>
              </div>
              <EmptyState message="لا يوجد مزادات في المفضلة" icon={Heart} />
            </div>
          </ContentWrapper>
        );
      
      case 'notifications':
        return (
          <ContentWrapper title="الإشعارات">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <button className="px-4 py-2 rounded-lg bg-blue/10 text-blue dark:text-blue-light">الكل</button>
                  <button className="px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">غير المقروءة</button>
                </div>
                <button className="text-gray-500 hover:text-blue">
                  <Bell className="h-5 w-5" />
                </button>
              </div>
              <EmptyState message="لا يوجد إشعارات جديدة" icon={Bell} />
            </div>
          </ContentWrapper>
        );
      
      default:
        return <ProfileForm />;
    }
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
            </div>
          )}

          <div className="mt-20 md:mt-16 flex flex-col md:flex-row gap-6 md:gap-8 rtl">
            <div className="w-full md:w-1/3 lg:w-1/4 space-y-6">
              <StatsCard />
              <QuickLinks />
            </div>
            <div className="w-full md:w-2/3 lg:w-3/4">
              {/* Show admin users table if admin and tab is users */}
              {userData.role === 'Admin' && adminTab === 'users' ? <AdminUsersTable /> : <MainContent />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;