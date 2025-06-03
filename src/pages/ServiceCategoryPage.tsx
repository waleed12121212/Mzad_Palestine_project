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
import { Loader2, Search, Plus, Edit, Trash2, Shirt, Smartphone, Car, Gem, BookOpen, Camera, Baby, Coffee, Sofa, User, Truck, Building2 } from 'lucide-react';
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
      toast({ title: 'حدث خطأ أثناء جلب فئات الخدمات', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    try {
      await serviceCategoryService.createServiceCategory(newCategory);
      toast({ title: 'تم إنشاء فئة الخدمة بنجاح', variant: 'default' });
      setNewCategory({ name: '', description: '', imageUrl: '' });
      setIsDialogOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Error creating category:', error);
      toast({ title: 'حدث خطأ أثناء إنشاء فئة الخدمة', variant: 'destructive' });
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory) return;
    try {
      await serviceCategoryService.updateServiceCategory(String(editingCategory.id), {
        name: editingCategory.name,
        description: editingCategory.description,
        imageUrl: editingCategory.imageUrl
      });
      toast({ title: 'تم تحديث فئة الخدمة بنجاح', variant: 'default' });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Error updating category:', error);
      toast({ title: 'حدث خطأ أثناء تحديث فئة الخدمة', variant: 'destructive' });
    }
  };

  const handleDeleteCategory = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;
    try {
      await serviceCategoryService.deleteServiceCategory(String(id));
      toast({ title: 'تم حذف فئة الخدمة بنجاح', variant: 'default' });
      fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      toast({ title: 'حدث خطأ أثناء حذف فئة الخدمة', variant: 'destructive' });
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
        </div>
        {isAdmin && (
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="w-4 h-4 ml-2" />
            إضافة فئة جديدة
          </Button>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCategories.map((category) => (
          <motion.div
            key={category.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div
              className="relative w-80 h-44 mx-auto group cursor-pointer rounded-2xl overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800 transition-transform hover:scale-105"
              onClick={() => navigate(`/services/category/${category.id}`)}
            >
              {/* صورة الخلفية */}
              <img
                src={category.imageUrl || 'https://placehold.co/600x400?text=No+Image'}
                alt={category.name}
                className="absolute inset-0 w-full h-full object-cover z-0 transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = 'https://placehold.co/600x400?text=Error+Loading+Image';
                }}
              />
              {/* تدرج غامق أسفل البطاقة */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10" />
              {/* اسم الفئة وأزرار الأدمن */}
              <div className="absolute top-3 right-3 left-3 flex items-center justify-between z-20">
                <span className="text-lg font-bold text-white drop-shadow-lg truncate max-w-[60%]">{category.name}</span>
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="bg-white/80 hover:bg-white rounded-full p-2"
                      onClick={e => { e.stopPropagation(); setEditingCategory(category); }}
                    >
                      <Edit className="w-5 h-5 text-blue-700" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="bg-white/80 hover:bg-white rounded-full p-2"
                      onClick={e => { e.stopPropagation(); handleDeleteCategory(category.id); }}
                    >
                      <Trash2 className="w-5 h-5 text-red-600" />
                    </Button>
                  </div>
                )}
              </div>
              {/* الوصف وعدد الخدمات */}
              <div className="absolute bottom-3 right-3 left-3 flex flex-col gap-2 z-20">
                <span className="text-sm text-white/90 truncate">{category.description || 'لا يوجد وصف'}</span>
                <span className="text-xs text-white/80 font-bold">{(category as any).serviceNumber || 0} خدمة</span>
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