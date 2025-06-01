import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { serviceCategoryService } from '@/services/serviceCategoryService';
import { Loader2, Search, Plus, Edit, Trash2 } from 'lucide-react';
import type { ServiceCategory } from '@/services/serviceCategoryService';

const ServiceCategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    imageUrl: ''
  });
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    const checkAdmin = async () => {
      if (user?.role === 'Admin') {
        setIsAdmin(true);
      }
    };
    checkAdmin();
    fetchCategories();
  }, [user]);

  const fetchCategories = async () => {
    try {
      const data = await serviceCategoryService.getServiceCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('حدث خطأ أثناء جلب فئات الخدمات');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      await serviceCategoryService.createServiceCategory(newCategory);
      toast.success('تم إنشاء فئة الخدمة بنجاح');
      setNewCategory({ name: '', description: '', imageUrl: '' });
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      toast.error('حدث خطأ أثناء إنشاء فئة الخدمة');
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    try {
      await serviceCategoryService.updateServiceCategory(editingCategory.id, {
        name: editingCategory.name,
        description: editingCategory.description,
        imageUrl: editingCategory.imageUrl
      });
      toast.success('تم تحديث فئة الخدمة بنجاح');
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast.error('حدث خطأ أثناء تحديث فئة الخدمة');
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;
    try {
      await serviceCategoryService.deleteServiceCategory(id);
      toast.success('تم حذف فئة الخدمة بنجاح');
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('حدث خطأ أثناء حذف فئة الخدمة');
    }
  };

  // Filter categories based on search query
  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-12 h-12 text-blue animate-spin" />
          <span className="mr-2">جاري تحميل البيانات...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">فئات الخدمات</h1>
          <p className="text-gray-600 dark:text-gray-400">
            تصفح واختر من بين مجموعة متنوعة من فئات الخدمات
          </p>
        </div>
        {isAdmin && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة فئة جديدة
          </Button>
        )}
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute top-1/2 transform -translate-y-1/2 right-3 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="ابحث عن فئات الخدمات..."
          className="pr-10 rtl w-full"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCategories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="relative rounded-2xl overflow-hidden shadow-md group w-full h-44 flex-shrink-0 cursor-pointer transform transition-transform hover:scale-105">
              {/* Background Image */}
              <img
                src={category.imageUrl || 'https://placehold.co/600x400?text=No+Image'}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400?text=Error+Loading+Image';
                }}
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              
              {/* Category Name and Description */}
              <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                <h3 className="text-xl font-bold mb-1">{category.name}</h3>
                <p className="text-sm text-gray-200 line-clamp-2">{category.description}</p>
              </div>

              {/* Admin Actions */}
              {isAdmin && (
                <div className="absolute top-3 left-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="bg-white/90 hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategory(category);
                    }}
                  >
                    <Edit className="w-4 h-4 ml-1" />
                    تعديل
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-500/90 hover:bg-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 ml-1" />
                    حذف
                  </Button>
                </div>
              )}

              {/* View Services Button */}
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-3 right-3 bg-white/90 hover:bg-white opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/services/category/${category.id}`);
                }}
              >
                عرض الخدمات
              </Button>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Category Dialog */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>إضافة فئة جديدة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">اسم الفئة</label>
                  <Input
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                    placeholder="أدخل اسم الفئة"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الوصف</label>
                  <Input
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                    placeholder="أدخل وصف الفئة"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">رابط الصورة</label>
                  <Input
                    value={newCategory.imageUrl}
                    onChange={(e) => setNewCategory({ ...newCategory, imageUrl: e.target.value })}
                    placeholder="أدخل رابط الصورة"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                إلغاء
              </Button>
              <Button onClick={handleCreateCategory}>
                إضافة
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* Edit Category Dialog */}
      {editingCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>تعديل الفئة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">اسم الفئة</label>
                  <Input
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                    placeholder="أدخل اسم الفئة"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">الوصف</label>
                  <Input
                    value={editingCategory.description}
                    onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                    placeholder="أدخل وصف الفئة"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">رابط الصورة</label>
                  <Input
                    value={editingCategory.imageUrl}
                    onChange={(e) => setEditingCategory({ ...editingCategory, imageUrl: e.target.value })}
                    placeholder="أدخل رابط الصورة"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditingCategory(null)}>
                إلغاء
              </Button>
              <Button onClick={handleUpdateCategory}>
                حفظ التغييرات
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ServiceCategoryPage; 