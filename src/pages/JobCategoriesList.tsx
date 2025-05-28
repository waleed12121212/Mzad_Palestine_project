import React, { useEffect, useState } from "react";
import { jobCategoryService, JobCategory } from "@/services/jobCategoryService";
import { Briefcase, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const JobCategoriesList: React.FC = () => {
  const [categories, setCategories] = useState<JobCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const isAdmin = user && String(user.role).toLowerCase() === 'admin';

  useEffect(() => {
    jobCategoryService.getAllJobCategories()
      .then(setCategories)
      .finally(() => setLoading(false));
  }, []);

  const handleEdit = (category: JobCategory) => {
    // ضع هنا منطق التعديل (مثلاً فتح مودال)
    alert(`تعديل: ${category.name}`);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("هل أنت متأكد من حذف هذا التصنيف؟")) {
      await jobCategoryService.deleteJobCategory(String(id));
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    }
  };

  if (loading) return <div className="text-center py-10">جاري التحميل...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-right">تصنيفات الوظائف</h1>
      <div className="flex flex-wrap gap-6 justify-center">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="relative rounded-2xl overflow-hidden shadow-md group w-72 h-44 flex-shrink-0 cursor-pointer transform transition-transform hover:scale-105"
          >
            {/* صورة الخلفية */}
            <img
              src={cat.imageUrl || 'https://placehold.co/600x400?text=No+Image'}
              alt={cat.name}
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
              <span className="text-lg font-bold text-white drop-shadow">{cat.name}</span>
            </div>
            {/* تفاصيل الفئة وعدد الوظائف في الأسفل */}
            <div className="absolute bottom-0 right-0 left-0 z-10 flex flex-col gap-1 p-3 bg-gradient-to-t from-black/70 via-black/30 to-transparent">
              <p className="text-xs text-gray-100 mb-1 min-h-[18px]">{cat.description || 'لا يوجد وصف'}</p>
              <div className="flex gap-3 items-center">
                <span className="text-xs text-gray-200 bg-black/30 rounded-full px-2 py-1">{typeof cat.jobsCount !== 'undefined' ? `${cat.jobsCount} وظيفة` : '0 وظيفة'}</span>
              </div>
            </div>
            {/* أزرار الأدمن */}
            {isAdmin && (
              <div className="absolute top-3 left-3 flex gap-2 z-20">
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleEdit(cat); }}
                  className="bg-white/80 hover:bg-blue text-blue hover:text-white rounded-full p-2 transition"
                  title="تعديل"
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(cat.id); }}
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

export default JobCategoriesList; 