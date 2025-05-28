import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { JobCategory } from '../types/job';
import { jobCategoryService } from '../services/jobCategoryService';
import { JobCategoryForm } from '../components/jobs/JobCategoryForm';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useToast } from '../components/ui/use-toast';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Edit, Trash2, Plus } from 'lucide-react';

export const JobCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCategory, setEditingCategory] = useState<JobCategory | undefined>();
  const [showModal, setShowModal] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const isAdmin = user && String(user.role).toLowerCase() === 'admin';

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const data = await jobCategoryService.getAllJobCategories();
      setCategories(data);
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء تحميل فئات الوظائف',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: JobCategory) => {
    setIsSubmitting(true);
    try {
      if (editingCategory?.id) {
        await jobCategoryService.updateJobCategory(String(editingCategory.id), {
          name: data.name,
          description: data.description || '',
          imageUrl: data.imageUrl || ''
        });
        toast({
          title: 'تم التحديث',
          description: 'تم تحديث فئة الوظائف بنجاح',
        });
      } else {
        await jobCategoryService.createJobCategory({
          name: data.name,
          description: data.description || '',
          imageUrl: data.imageUrl || ''
        });
        toast({
          title: 'تم الإضافة',
          description: 'تم إضافة فئة الوظائف بنجاح',
        });
      }
      setEditingCategory(undefined);
      setShowModal(false);
      loadCategories();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حفظ فئة الوظائف',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذه الفئة؟')) return;

    try {
      await jobCategoryService.deleteJobCategory(String(id));
      toast({
        title: 'تم الحذف',
        description: 'تم حذف فئة الوظائف بنجاح',
      });
      loadCategories();
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'حدث خطأ أثناء حذف فئة الوظائف',
        variant: 'destructive',
      });
    }
  };

  const openAddModal = () => {
    setEditingCategory(undefined);
    setShowModal(true);
  };

  const openEditModal = (category: JobCategory) => {
    setEditingCategory(category);
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingCategory(undefined);
    setShowModal(false);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <h1 className="text-3xl font-bold">إدارة فئات الوظائف</h1>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/jobs')}>العودة إلى الوظائف</Button>
          {isAdmin && (
            <Button onClick={openAddModal} className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              إضافة فئة
            </Button>
          )}
        </div>
      </div>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md relative">
            <button onClick={closeModal} className="absolute left-4 top-4 text-gray-400 hover:text-red-500 text-2xl font-bold">×</button>
            <JobCategoryForm
              initialData={editingCategory}
              onSubmit={handleSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      )}
      <div className="space-y-4 flex flex-wrap gap-6 justify-center">
        {categories.map((category) => (
          <div
            key={category.id}
            className="relative rounded-2xl overflow-hidden shadow-md group w-72 h-44 flex-shrink-0 cursor-pointer transform transition-transform hover:scale-105"
          >
            {/* صورة الخلفية */}
            <img
              src={category.imageUrl || 'https://placehold.co/600x400?text=No+Image'}
              alt={category.name}
              className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/600x400?text=Error+Loading+Image';
              }}
            />
            {/* طبقة شفافة */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            {/* اسم التصنيف والأيقونة في الأعلى يمين */}
            <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm">
                <Briefcase className="w-5 h-5 text-white" />
              </span>
              <span className="text-lg font-bold text-white drop-shadow">{category.name}</span>
            </div>
            {/* تفاصيل الفئة وعدد الوظائف في الأسفل */}
            <div className="absolute bottom-0 right-0 left-0 z-10 flex flex-col gap-1 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
              <p className="text-xs text-gray-100 mb-1 min-h-[18px]">{category.description || 'لا يوجد وصف'}</p>
              <div className="flex gap-3 items-center">
                <span className="text-xs text-gray-200 bg-black/30 rounded-full px-2 py-1">{typeof category.jobsCount !== 'undefined' ? `${category.jobsCount} وظيفة` : '0 وظيفة'}</span>
              </div>
            </div>
            {/* أزرار الأدمن */}
            {isAdmin && (
              <div className="absolute top-3 left-3 flex gap-2 z-20">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); openEditModal(category); }}
                  className="bg-white/80 hover:bg-blue text-blue hover:text-white rounded-full p-2 transition"
                  title="تعديل"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); category.id && handleDelete(category.id); }}
                  className="bg-white/80 hover:bg-red-500 text-red-500 hover:text-white rounded-full p-2 transition"
                  title="حذف"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}; 