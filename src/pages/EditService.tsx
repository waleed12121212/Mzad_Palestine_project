import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { serviceService } from '@/services/serviceService';
import { serviceCategoryService } from '@/services/serviceCategoryService';
import { imageService } from '@/services/imageService';
import { useAuth } from '@/contexts/AuthContext';

export default function EditService() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    serviceCategoryService.getServiceCategories().then(setCategories);
    if (id) {
      serviceService.getServiceById(id).then((data) => {
        setForm(data);
        setExistingImages(data?.images || []);
      });
    }
  }, [id]);

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

  const removeImage = (index: number, isExisting: boolean) => {
    if (isExisting) {
      setExistingImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setImageFiles(prev => prev.filter((_, i) => i !== index));
      setImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // التحقق من صحة البيانات
      if (!form.newServiceCategoryId || !form.title || !form.description || !form.price || !form.location || !form.contactInfo) {
        toast({ title: 'يرجى ملء جميع الحقول المطلوبة', variant: 'destructive' });
        return;
      }

      // رفع الصور الجديدة
      const uploadedImages: string[] = [];
      for (const file of imageFiles) {
        const uploadResult = await imageService.uploadImage(file);
        uploadedImages.push(uploadResult.url);
      }

      // اجمع الصور القديمة مع الجديدة
      const allImages = [...existingImages, ...uploadedImages];

      // تحويل القيم إلى الأرقام المناسبة
      const updateData = {
        newServiceCategoryId: parseInt(form.newServiceCategoryId, 10),
        title: form.title.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        location: form.location.trim(),
        contactInfo: form.contactInfo.trim(),
        images: allImages
      };

      // التحقق من صحة الأرقام
      if (isNaN(updateData.newServiceCategoryId) || isNaN(updateData.price)) {
        toast({ title: 'قيم غير صالحة في حقول الأرقام', variant: 'destructive' });
        return;
      }

      console.log('بيانات التحديث:', updateData);
      console.log('أنواع البيانات:', {
        newServiceCategoryId: typeof updateData.newServiceCategoryId,
        title: typeof updateData.title,
        description: typeof updateData.description,
        price: typeof updateData.price,
        location: typeof updateData.location,
        contactInfo: typeof updateData.contactInfo,
        images: Array.isArray(updateData.images) ? 'array' : typeof updateData.images,
        imagesContent: updateData.images
      });

      await serviceService.updateService(parseInt(id!, 10), updateData, token);
      toast({ title: 'تم تحديث الخدمة بنجاح' });
      navigate(`/services/${id}`);
    } catch (error) {
      console.error('خطأ في تحديث الخدمة:', error);
      toast({ title: 'فشل في تحديث الخدمة', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (!form) return <div className="text-center py-8">جاري تحميل بيانات الخدمة...</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8">
          <h1 className="text-2xl font-bold mb-6">تعديل الخدمة</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <select name="newServiceCategoryId" className="input input-bordered w-full" value={form.newServiceCategoryId} onChange={handleChange} required>
              <option value="">اختر تصنيف الخدمة</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <input name="title" placeholder="عنوان الخدمة" className="input input-bordered w-full" value={form.title} onChange={handleChange} required />
            <textarea name="description" placeholder="وصف الخدمة" className="input input-bordered w-full" value={form.description} onChange={handleChange} required />
            <input name="price" type="number" placeholder="السعر" className="input input-bordered w-full" value={form.price} onChange={handleChange} required />
            <input name="location" placeholder="الموقع" className="input input-bordered w-full" value={form.location} onChange={handleChange} required />
            <input name="contactInfo" placeholder="معلومات التواصل" className="input input-bordered w-full" value={form.contactInfo} onChange={handleChange} required />
            <div>
              <label className="block mb-2 font-semibold">صور الخدمة</label>
              <input type="file" accept="image/*" multiple onChange={handleImageUpload} />
              <div className="flex gap-2 mt-2 flex-wrap">
                {existingImages.map((img, idx) => (
                  <div key={img + idx} className="relative w-24 h-24">
                    <img src={img} alt="صورة" className="w-full h-full object-cover rounded" />
                    <button type="button" className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center" onClick={() => removeImage(idx, true)}>×</button>
                  </div>
                ))}
                {imagePreviews.map((img, idx) => (
                  <div key={img + idx} className="relative w-24 h-24">
                    <img src={img} alt="صورة" className="w-full h-full object-cover rounded" />
                    <button type="button" className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center" onClick={() => removeImage(idx, false)}>×</button>
                  </div>
                ))}
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>{loading ? 'جاري التحديث...' : 'تحديث الخدمة'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 