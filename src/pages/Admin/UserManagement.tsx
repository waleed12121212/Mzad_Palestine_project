import React, { useState, useEffect } from 'react';
import { User, Search, Edit2, Trash2, Eye } from 'lucide-react';
import { toast } from "@/components/ui/use-toast";
import { userService, UserProfile } from '@/services/userService';
import Footer from "@/components/layout/Footer";

const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getAllUsers();
      setUsers(data);
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

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const filteredUsers = users.filter(user => 
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewUser = async (userId: string) => {
    try {
      const user = await userService.getUserById(userId);
      setSelectedUser(user);
    } catch (error: any) {
      toast({
        title: "خطأ في تحميل بيانات المستخدم",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: 'User' | 'Admin') => {
    try {
      const updatedUser = await userService.updateUserRole(userId, newRole);
      setUsers(users.map(user => user.id.toString() === userId ? updatedUser : user));
      toast({
        title: "تم تحديث الصلاحية",
        description: "تم تغيير صلاحية المستخدم بنجاح"
      });
    } catch (error: any) {
      toast({
        title: "خطأ في تحديث الصلاحية",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (userId: string) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      await userService.deleteUser(userToDelete);
      setUsers(users.filter(user => user.id.toString() !== userToDelete));
      toast({
        title: "تم حذف المستخدم",
        description: "تم حذف المستخدم بنجاح"
      });
    } catch (error: any) {
      toast({
        title: "خطأ في حذف المستخدم",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setShowDeleteModal(false);
      setUserToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow pt-16 md:pt-24 pb-12 md:pb-16 bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-center h-[50vh]">
              <div className="w-16 h-16 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="flex-grow pt-16 md:pt-24 pb-12 md:pb-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold">إدارة المستخدمين</h1>
              <div className="relative">
                <input
                  type="text"
                  placeholder="بحث عن مستخدم..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-64 px-4 py-2 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue focus:border-transparent"
                />
                <Search className="absolute top-1/2 transform -translate-y-1/2 right-3 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-right py-3 px-4">الاسم</th>
                    <th className="text-right py-3 px-4">البريد الإلكتروني</th>
                    <th className="text-right py-3 px-4">الصلاحية</th>
                    <th className="text-right py-3 px-4">تاريخ الانضمام</th>
                    <th className="text-right py-3 px-4">الإجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <User className="h-4 w-4 text-gray-500" />
                          </div>
                          <span>{`${user.firstName} ${user.lastName}`}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id.toString(), e.target.value as 'User' | 'Admin')}
                          className="px-3 py-1 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-blue focus:border-transparent"
                        >
                          <option value="User">مستخدم</option>
                          <option value="Admin">مدير</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('ar-EG') : ''}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewUser(user.id.toString())}
                            className="p-2 text-blue hover:bg-blue/10 rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user.id.toString())}
                            className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      {/* User Details Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-2xl w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">تفاصيل المستخدم</h2>
              <button
                onClick={() => setSelectedUser(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">{`${selectedUser.firstName} ${selectedUser.lastName}`}</h3>
                  <p className="text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">رقم الهاتف</p>
                  <p>{selectedUser.phoneNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">العنوان</p>
                  <p>{selectedUser.address}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">الصلاحية</p>
                  <p>{selectedUser.role === "Admin" ? "مدير" : "مستخدم"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">تاريخ الانضمام</p>
                  <p>{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('ar-EG') : ''}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">تأكيد الحذف</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              هل أنت متأكد من حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
};

export default UserManagement; 