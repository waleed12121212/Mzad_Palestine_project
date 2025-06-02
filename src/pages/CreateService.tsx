import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { serviceService } from '@/services/serviceService';
import { serviceCategoryService } from '@/services/serviceCategoryService';
import { useAuth } from '@/contexts/AuthContext';
import { imageService } from '@/services/imageService';
import { Camera } from 'lucide-react';

const initialState = {
  newServiceCategoryId: '',
  title: '',
  description: '',
  price: '',
  location: '',
  contactInfo: '',
  images: [] as string[],
};

export default function CreateService() {
  const [form, setForm] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    serviceCategoryService.getServiceCategories().then(setCategories);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
      setImagePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // رفع الصور فعلياً وحفظ الروابط الحقيقية
      const uploadedImages: string[] = [];
      for (const file of imageFiles) {
        const uploadResult = await imageService.uploadImage(file);
        uploadedImages.push(uploadResult.url);
      }
      await serviceService.createService({ ...form, images: uploadedImages }, token);
      toast({ title: 'تمت إضافة الخدمة بنجاح' });
      navigate('/services');
    } catch (error) {
      toast({ title: 'فشل في إضافة الخدمة', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        <div className="mb-8 rtl">
          <h1 className="heading-lg mb-2 text-center">إضافة خدمة جديدة</h1>
          <p className="text-gray-600 dark:text-gray-300 text-center">أضف خدمتك ليشاهدها الجميع ويطلبها بسهولة</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden rtl w-full max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div>
              <label className="block mb-2 text-sm font-medium">تصنيف الخدمة <span className="text-red-500">*</span></label>
              <select name="newServiceCategoryId" className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600" value={form.newServiceCategoryId} onChange={handleChange} required>
                <option value="">اختر تصنيف الخدمة</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">عنوان الخدمة <span className="text-red-500">*</span></label>
              <input name="title" placeholder="عنوان الخدمة" className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600" value={form.title} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">وصف الخدمة <span className="text-red-500">*</span></label>
              <textarea name="description" placeholder="وصف الخدمة" className="min-h-[100px] w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600" value={form.description} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">السعر <span className="text-red-500">*</span></label>
              <input name="price" type="number" placeholder="السعر" className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600" value={form.price} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">الموقع <span className="text-red-500">*</span></label>
              <input name="location" placeholder="الموقع (مثال: رام الله)" className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600" value={form.location} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-2 text-sm font-medium">معلومات التواصل <span className="text-red-500">*</span></label>
              <input name="contactInfo" placeholder="رقم الهاتف أو البريد الإلكتروني" className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600" value={form.contactInfo} onChange={handleChange} required />
            </div>
            <div>
              <label className="block mb-2 font-semibold">صور الخدمة</label>
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition hover:border-blue-400 bg-gray-50 dark:bg-gray-700"
                onClick={() => document.getElementById('service-image-upload')?.click()}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  const files = Array.from(e.dataTransfer.files);
                  if (files.length > 0) {
                    setImageFiles(prev => [...prev, ...files]);
                    setImagePreviews(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
                  }
                }}
                style={{ minHeight: '140px' }}
              >
                <Camera className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <div className="text-gray-600 dark:text-gray-300 mb-1">اسحب وأفلت الصور هنا، أو اضغط لتحميل الصور</div>
                <div className="text-xs text-gray-400 mb-3">أقصى حجم للصورة: 5 ميجابايت | الصيغ المدعومة: JPG, PNG, WEBP</div>
                <Button type="button" variant="secondary" className="mt-2" onClick={e => { e.stopPropagation(); document.getElementById('service-image-upload')?.click(); }}>
                  <span>تحميل الصور</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4" /></svg>
                </Button>
                <input
                  id="service-image-upload"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              {imagePreviews.length > 0 && (
                <div className="flex gap-2 mt-4 flex-wrap justify-center">
                  {imagePreviews.map((img, idx) => (
                    <div key={idx} className="relative w-24 h-24">
                      <img src={img} alt="صورة" className="w-full h-full object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                      <button type="button" className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center" onClick={() => removeImage(idx)}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" className="w-full py-3 text-lg font-bold" disabled={loading}>{loading ? 'جاري الإضافة...' : 'إضافة الخدمة'}</Button>
          </form>
        </div>
      </main>
    </div>
  );
} 