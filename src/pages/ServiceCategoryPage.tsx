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
import { Loader2, Search, Plus, Edit, Trash2, Shirt, Smartphone, Car, Gem, BookOpen, Camera, Baby, Coffee, Sofa, Broom, User, Truck, Building2 } from 'lucide-react';
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

  // دالة اختيار الأيقونة حسب اسم الفئة (مطابقة جزئية)
  const getCategoryIcon = (name: string) => {
    if (name.includes("تنظيف") || name.includes("سجاد")) return <Gem className="w-5 h-5 text-gray-700" />; // استبدل Gem بـ Broom إذا كانت متوفرة
    if (name.includes("معلم") || name.includes("تدريس") || name.includes("دروس")) return <BookOpen className="w-5 h-5 text-gray-700" />;
    if (name.includes("سائق") || name.includes("توصيل")) return <Car className="w-5 h-5 text-gray-700" />;
    if (name.includes("بناء") || name.includes("إنشاء")) return <Building2 className="w-5 h-5 text-gray-700" />;
    if (name.includes("أزياء") || name.includes("ملابس")) return <Shirt className="w-5 h-5 text-gray-700" />;
    if (name.includes("إلكترونيات")) return <Smartphone className="w-5 h-5 text-gray-700" />;
    if (name.includes("مركبات") || name.includes("سيارات")) return <Car className="w-5 h-5 text-gray-700" />;
    if (name.includes("إكسسوارات")) return <Gem className="w-5 h-5 text-gray-700" />;
    if (name.includes("كتب") || name.includes("مجلات")) return <BookOpen className="w-5 h-5 text-gray-700" />;
    if (name.includes("كاميرا")) return <Camera className="w-5 h-5 text-gray-700" />;
    if (name.includes("أطفال")) return <Baby className="w-5 h-5 text-gray-700" />;
    if (name.includes("منزلية")) return <Coffee className="w-5 h-5 text-gray-700" />;
    if (name.includes("أثاث")) return <Sofa className="w-5 h-5 text-gray-700" />;
    return <Gem className="w-5 h-5 text-gray-700" />;
  };

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
            <div
              className="relative w-80 h-48 mx-auto group cursor-pointer"
              onClick={() => navigate(`/services/category/${category.id}`)}
            >
              {/* أزرار الأدمن */}
              {isAdmin && (
                <div className="absolute top-2 left-2 flex gap-2 z-20">
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-white/90 hover:bg-white rounded-full p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingCategory(category);
                    }}
                  >
                    <Edit className="w-5 h-5 text-blue-700" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon"
                    className="bg-white/90 hover:bg-white rounded-full p-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteCategory(category.id);
                    }}
                  >
                    <Trash2 className="w-5 h-5 text-red-600" />
                  </Button>
                </div>
              )}
              {/* الصورة الخلفية */}
              <img
                src={category.imageUrl || 'https://placehold.co/600x400?text=No+Image'}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-300"
                style={{ filter: 'brightness(0.7)' }}
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400?text=Error+Loading+Image';
                }}
              />
              {/* تدرج فوق الصورة */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
              {/* محتوى البطاقة */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                {/* أيقونة الفئة */}
                <span className="w-8 h-8 rounded-full bg-white/80 flex items-center justify-center">
                  {getCategoryIcon(category.name)}
                </span>
                {/* اسم الفئة */}
                <span className="text-lg font-bold text-white drop-shadow-lg">{category.name}</span>
              </div>
              {/* الوصف والعدادات */}
              <div className="absolute bottom-4 right-4 left-4 flex flex-col md:flex-row items-end md:items-center justify-between z-20">
                <span className="text-sm text-white/90 mb-2 md:mb-0 md:mr-2">{category.description || 'لا يوجد وصف'}</span>
                <div className="flex gap-4">
                  <span className="flex items-center text-xs text-white/90">
                    {(category.serviceNumber ?? 0)} خدمة
                  </span>
                </div>
              </div>
            </div>
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