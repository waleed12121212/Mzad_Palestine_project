import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { categoryService, Category } from '@/services/categoryService';
import { listingService, CreateListingDto } from '@/services/listingService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Calendar, Clock, Info, Tag, MapPin, X, Upload, PlusCircle } from 'lucide-react';

const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    price: '',
    categoryId: '',
    endDate: '',
    terms: false,
  });
  const [errors, setErrors] = useState<any>({});

  useEffect(() => {
    if (!user) {
      toast({ title: 'يجب تسجيل الدخول أولاً', variant: 'destructive' });
      navigate('/login');
      return;
    }
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch {
        toast({ title: 'حدث خطأ أثناء تحميل التصنيفات', variant: 'destructive' });
      }
    };
    fetchCategories();
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
    if (name === 'terms' && checked) setShowTermsError(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      setImages(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = () => {
    let stepErrors: any = {};
    if (activeStep === 1) {
      if (!formData.title.trim()) stepErrors.title = 'العنوان مطلوب';
      if (!formData.description.trim()) stepErrors.description = 'الوصف مطلوب';
      if (!formData.address.trim()) stepErrors.address = 'العنوان مطلوب';
      if (!formData.categoryId) stepErrors.categoryId = 'يجب اختيار تصنيف';
    } else if (activeStep === 2) {
      if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) stepErrors.price = 'السعر يجب أن يكون أكبر من 0';
      if (!formData.endDate) stepErrors.endDate = 'تاريخ الانتهاء مطلوب';
      if (imageFiles.length === 0) stepErrors.images = 'يجب إضافة صورة واحدة على الأقل';
    } else if (activeStep === 3) {
      if (!formData.terms) setShowTermsError(true);
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setActiveStep(s => s + 1);
  };
  const handlePrev = () => setActiveStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep() || !formData.terms) return;
    setIsSubmitting(true);
    try {
      // رفع الصور (محاكاة)
      const imageUrls: string[] = images; // استبدل هذا بمنطق رفع الصور الحقيقي إذا لزم
      const listingData: CreateListingDto = {
        title: formData.title,
        description: formData.description,
        address: formData.address,
        price: Number(formData.price),
        categoryId: Number(formData.categoryId),
        endDate: formData.endDate,
        images: imageUrls,
      };
      await listingService.createListing(listingData);
      setShowSuccessModal(true);
    } catch {
      toast({ title: 'فشل في إنشاء المنتج', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        <div className="mb-8 rtl">
          <h1 className="heading-lg mb-2 text-center">إضافة منتج للبيع</h1>
          <p className="text-gray-600 dark:text-gray-300 text-center">أضف منتجك للبيع مباشرة على المنصة</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden rtl max-w-3xl mx-auto">
          {/* Stepper */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {[1,2,3].map(step => (
                  <React.Fragment key={step}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${activeStep >= step ? 'bg-blue text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{step}</span>
                    {step < 3 && <span className="mx-2 h-0.5 w-6 bg-gray-200 dark:bg-gray-700"></span>}
                  </React.Fragment>
                ))}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">الخطوة {activeStep} من 3</div>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="p-6">
            {activeStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium">عنوان المنتج <span className="text-red-500">*</span></label>
                  <Input name="title" value={formData.title} onChange={handleChange} placeholder="أدخل عنوان المنتج" />
                  {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">وصف المنتج <span className="text-red-500">*</span></label>
                  <Textarea name="description" value={formData.description} onChange={handleChange} placeholder="أدخل وصفاً تفصيلياً للمنتج" className="min-h-[100px]" />
                  {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">موقع المنتج <span className="text-red-500">*</span></label>
                  <Input name="address" value={formData.address} onChange={handleChange} placeholder="المدينة، المنطقة" />
                  {errors.address && <div className="text-red-500 text-sm mt-1">{errors.address}</div>}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">التصنيف <span className="text-red-500">*</span></label>
                  <select name="categoryId" value={formData.categoryId} onChange={handleChange} className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600">
                    <option value="">اختر تصنيف</option>
                    {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  {errors.categoryId && <div className="text-red-500 text-sm mt-1">{errors.categoryId}</div>}
                </div>
              </div>
            )}
            {activeStep === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium">السعر <span className="text-red-500">*</span></label>
                  <Input name="price" type="number" value={formData.price} onChange={handleChange} placeholder="0" min={1} />
                  {errors.price && <div className="text-red-500 text-sm mt-1">{errors.price}</div>}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">تاريخ انتهاء العرض <span className="text-red-500">*</span></label>
                  <Input name="endDate" type="date" value={formData.endDate} onChange={handleChange} min={new Date().toISOString().split('T')[0]} />
                  {errors.endDate && <div className="text-red-500 text-sm mt-1">{errors.endDate}</div>}
                </div>
                <div>
                  <label className="block mb-2 text-sm font-medium">صور المنتج <span className="text-red-500">*</span></label>
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    {images.length === 0 ? (
                      <>
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">اسحب وأفلت الصور هنا، أو اضغط لتحميل الصور</p>
                        <input type="file" id="images" name="images" className="hidden" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageUpload} />
                        <button type="button" onClick={() => document.getElementById('images')?.click()} className="mt-4 px-4 py-2 bg-blue/10 dark:bg-blue/20 text-blue dark:text-blue-light rounded-lg hover:bg-blue/20 dark:hover:bg-blue/30 transition-colors inline-flex items-center gap-2">
                          <PlusCircle className="h-4 w-4" />
                          <span>تحميل الصور</span>
                        </button>
                      </>
                    ) : (
                      <div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                          {images.map((src, idx) => (
                            <div key={idx} className="relative group">
                              <img src={src} alt={`Uploaded ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                              <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-4 w-4" /></button>
                            </div>
                          ))}
                          <button type="button" onClick={() => document.getElementById('images')?.click()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-24 flex flex-col items-center justify-center">
                            <PlusCircle className="h-8 w-8 text-gray-400" />
                            <span className="text-xs text-gray-500 mt-1">إضافة المزيد</span>
                          </button>
                        </div>
                        <input type="file" id="images" name="images" className="hidden" accept="image/jpeg,image/png,image/webp" multiple onChange={handleImageUpload} />
                      </div>
                    )}
                  </div>
                  {errors.images && <div className="text-red-500 text-sm mt-1">{errors.images}</div>}
                </div>
              </div>
            )}
            {activeStep === 3 && (
              <div className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2">مراجعة ونشر المنتج</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">راجع تفاصيل المنتج قبل النشر</p>
                </div>
                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Info className="h-6 w-6 text-blue-500" />ملخص المنتج</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div><span className="text-gray-500 flex items-center gap-2"><Tag className="h-4 w-4" /> عنوان المنتج</span><div className="font-semibold text-lg">{formData.title || 'غير محدد'}</div></div>
                      <div><span className="text-gray-500 flex items-center gap-2"><Tag className="h-4 w-4" /> التصنيف</span><div className="font-semibold text-lg">{categories.find(c => c.id === Number(formData.categoryId))?.name || 'غير محدد'}</div></div>
                      <div><span className="text-gray-500 flex items-center gap-2"><Info className="h-4 w-4" /> وصف المنتج</span><div className="text-base">{formData.description || 'غير محدد'}</div></div>
                      <div><span className="text-gray-500 flex items-center gap-2"><Tag className="h-4 w-4" /> السعر</span><div className="font-bold text-blue-600 text-lg">{formData.price ? `₪ ${parseFloat(formData.price).toLocaleString()}` : 'غير محدد'}</div></div>
                      <div><span className="text-gray-500 flex items-center gap-2"><Calendar className="h-4 w-4" /> تاريخ الانتهاء</span><div className="font-semibold">{formData.endDate || 'غير محدد'}</div></div>
                      <div><span className="text-gray-500 flex items-center gap-2"><MapPin className="h-4 w-4" /> الموقع</span><div className="font-semibold">{formData.address || 'غير محدد'}</div></div>
                    </div>
                  </div>
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-2">الصور</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {images.length > 0 ? images.map((src, idx) => (
                        <img key={idx} src={src} alt={`Preview ${idx + 1}`} className="h-24 w-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform" />
                      )) : (<span className="text-gray-400">لا توجد صور</span>)}
                    </div>
                  </div>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer text-base font-medium">
                    <input type="checkbox" name="terms" checked={formData.terms} onChange={handleChange} className="w-5 h-5 accent-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500" />
                    <span>يرجى الموافقة على&nbsp;<a href="/terms" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">الشروط والأحكام</a>&nbsp;قبل المتابعة</span>
                  </label>
                  {showTermsError && (<div className="mt-2 text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded-lg p-2">يجب الموافقة على الشروط والأحكام للمتابعة</div>)}
                </div>
              </div>
            )}
            <div className="mt-8 flex justify-between">
              {activeStep > 1 ? (
                <Button type="button" variant="outline" onClick={handlePrev} disabled={isSubmitting}>العودة للخطوة السابقة</Button>
              ) : (<div></div>)}
              {activeStep < 3 ? (
                <Button type="button" className="btn-primary flex items-center gap-2" onClick={handleNext} disabled={isSubmitting}>التالي</Button>
              ) : (
                <Button type="submit" className="btn-primary flex items-center gap-2" disabled={isSubmitting}>{isSubmitting ? 'جاري الحفظ...' : 'إنشاء المنتج'}</Button>
              )}
            </div>
          </form>
        </div>
      </main>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-10 max-w-md w-full text-center relative animate-fade-in">
            <div className="text-green-500 text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">تم إنشاء المنتج بنجاح!</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">سيتم مراجعة المنتج من قبل الإدارة قبل نشره.<br/>عند إغلاق هذه النافذة سيتم توجيهك إلى صفحة المنتجات.</p>
            <Button className="btn-primary w-full py-3 text-lg rounded-lg" onClick={() => { setShowSuccessModal(false); navigate('/buy-now'); }}>حسنًا، توجه إلى صفحة المنتجات</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateListing; 