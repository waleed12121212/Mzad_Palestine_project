import React from 'react';
import { useForm } from 'react-hook-form';
import { Job, JobCategory } from '../../types/job';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface JobFormProps {
  initialData?: Job;
  categories: JobCategory[];
  onSubmit: (data: Job) => void;
  isSubmitting?: boolean;
}

export const JobForm: React.FC<JobFormProps> = ({
  initialData,
  categories,
  onSubmit,
  isSubmitting = false,
}) => {
  const { register, handleSubmit, formState: { errors }, setValue } = useForm<Job>({
    defaultValues: initialData
  });

  const jobTypes = ['دوام كامل', 'دوام جزئي', 'عن بعد', 'عقد مؤقت'];
  const experienceLevels = ['مبتدئ', 'متوسط', 'متقدم', 'خبير'];

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{initialData ? 'تعديل الوظيفة' : 'إضافة وظيفة جديدة'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="jobCategoryId" className="text-sm font-medium">فئة الوظيفة</label>
            <Select
              defaultValue={initialData?.jobCategoryId.toString()}
              onValueChange={(value) => setValue('jobCategoryId', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر فئة الوظيفة" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id?.toString() || ''}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.jobCategoryId && (
              <p className="text-sm text-red-500">{errors.jobCategoryId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">عنوان الوظيفة</label>
            <Input
              id="title"
              {...register('title', { required: 'هذا الحقل مطلوب' })}
              placeholder="مثال: مبرمج"
            />
            {errors.title && (
              <p className="text-sm text-red-500">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium">وصف الوظيفة</label>
            <Textarea
              id="description"
              {...register('description', { required: 'هذا الحقل مطلوب' })}
              placeholder="وصف تفصيلي للوظيفة"
            />
            {errors.description && (
              <p className="text-sm text-red-500">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="companyName" className="text-sm font-medium">اسم الشركة</label>
            <Input
              id="companyName"
              {...register('companyName', { required: 'هذا الحقل مطلوب' })}
              placeholder="اسم الشركة"
            />
            {errors.companyName && (
              <p className="text-sm text-red-500">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium">الموقع</label>
            <Input
              id="location"
              {...register('location', { required: 'هذا الحقل مطلوب' })}
              placeholder="مثال: رام الله"
            />
            {errors.location && (
              <p className="text-sm text-red-500">{errors.location.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="jobType" className="text-sm font-medium">نوع الوظيفة</label>
              <Select
                defaultValue={initialData?.jobType}
                onValueChange={(value) => setValue('jobType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر نوع الوظيفة" />
                </SelectTrigger>
                <SelectContent>
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="experienceLevel" className="text-sm font-medium">مستوى الخبرة</label>
              <Select
                defaultValue={initialData?.experienceLevel}
                onValueChange={(value) => setValue('experienceLevel', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="اختر مستوى الخبرة" />
                </SelectTrigger>
                <SelectContent>
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="salary" className="text-sm font-medium">الراتب</label>
            <Input
              id="salary"
              type="number"
              {...register('salary', { required: 'هذا الحقل مطلوب', min: 0 })}
              placeholder="مثال: 3000"
            />
            {errors.salary && (
              <p className="text-sm text-red-500">{errors.salary.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="requirements" className="text-sm font-medium">المتطلبات</label>
            <Textarea
              id="requirements"
              {...register('requirements', { required: 'هذا الحقل مطلوب' })}
              placeholder="متطلبات الوظيفة"
            />
            {errors.requirements && (
              <p className="text-sm text-red-500">{errors.requirements.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="benefits" className="text-sm font-medium">المميزات</label>
            <Textarea
              id="benefits"
              {...register('benefits', { required: 'هذا الحقل مطلوب' })}
              placeholder="مميزات الوظيفة"
            />
            {errors.benefits && (
              <p className="text-sm text-red-500">{errors.benefits.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="contactInfo" className="text-sm font-medium">معلومات الاتصال</label>
            <Input
              id="contactInfo"
              {...register('contactInfo', { required: 'هذا الحقل مطلوب' })}
              placeholder="مثال: jobs@company.com"
            />
            {errors.contactInfo && (
              <p className="text-sm text-red-500">{errors.contactInfo.message}</p>
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