import React from 'react';
import { useForm } from 'react-hook-form';
import { JobCategory } from '../../types/job';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface JobCategoryFormProps {
  initialData?: JobCategory;
  onSubmit: (data: JobCategory) => void;
  isSubmitting?: boolean;
}

export const JobCategoryForm: React.FC<JobCategoryFormProps> = ({
  initialData,
  onSubmit,
  isSubmitting = false,
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<JobCategory>({
    defaultValues: initialData
  });

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'تعديل فئة الوظائف' : 'إضافة فئة وظائف جديدة'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">اسم الفئة</label>
            <Input
              id="name"
              {...register('name', { required: 'هذا الحقل مطلوب' })}
              placeholder="مثال: تكنولوجيا المعلومات"
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">الوصف</label>
            <Textarea
              id="description"
              {...register('description', { required: 'هذا الحقل مطلوب' })}
              placeholder="مثال: وظائف في مجال IT"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="imageUrl" className="text-sm font-medium">رابط الصورة</label>
            <Input
              id="imageUrl"
              type="url"
              {...register('imageUrl', { required: 'هذا الحقل مطلوب' })}
              placeholder="https://example.com/image.png"
            />
            {errors.imageUrl && (
              <p className="text-sm text-red-500">{errors.imageUrl.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'جاري الحفظ...' : initialData ? 'تحديث' : 'إضافة'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 