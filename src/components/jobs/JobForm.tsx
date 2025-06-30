import React, { useEffect } from 'react';
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
  onSubmit: (data: Partial<Job>) => void;
  isSubmitting?: boolean;
}

export const JobForm: React.FC<JobFormProps> = ({
  initialData,
  categories,
  onSubmit,
  isSubmitting = false,
}) => {
  const { register, handleSubmit, formState: { errors }, setValue, reset } = useForm<Partial<Job>>({
    defaultValues: initialData,
  });

  useEffect(() => {
    if (initialData) {
      const formattedData = {
        ...initialData,
        applicationDeadline: initialData.applicationDeadline
          ? new Date(initialData.applicationDeadline).toISOString().slice(0, 16)
          : '',
      };
      reset(formattedData);
    }
  }, [initialData, reset]);

  const jobTypes = ['دوام كامل', 'دوام جزئي', 'عن بعد', 'عقد مؤقت'];
  const experienceLevels = ['مبتدئ', 'متوسط', 'متقدم', 'خبير'];
  const jobStatuses = ['Open', 'Closed'];

  return (
    <Card className="w-full max-w-2xl mx-auto bg-background border-border">
      <CardHeader className="border-border">
        <CardTitle className="text-foreground">{initialData ? 'تعديل الوظيفة' : 'إضافة وظيفة جديدة'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="jobCategoryId" className="text-sm font-medium text-foreground">فئة الوظيفة</label>
            <Select
              defaultValue={initialData?.jobCategoryId !== undefined && initialData?.jobCategoryId !== null ? initialData.jobCategoryId.toString() : ''}
              onValueChange={(value) => setValue('jobCategoryId', parseInt(value))}
            >
              <SelectTrigger className="bg-background text-foreground border-input">
                <SelectValue placeholder="اختر فئة الوظيفة" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id?.toString() || ''} className="hover:bg-accent hover:text-accent-foreground">
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.jobCategoryId && (
              <p className="text-sm text-destructive">{errors.jobCategoryId.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-foreground">عنوان الوظيفة</label>
            <Input
              id="title"
              {...register('title', { required: 'هذا الحقل مطلوب' })}
              placeholder="مثال: مبرمج"
              className="bg-background text-foreground border-input"
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">وصف الوظيفة</label>
            <Textarea
              id="description"
              {...register('description', { required: 'هذا الحقل مطلوب' })}
              placeholder="وصف تفصيلي للوظيفة"
              className="bg-background text-foreground border-input"
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="companyName" className="text-sm font-medium text-foreground">اسم الشركة</label>
            <Input
              id="companyName"
              {...register('companyName', { required: 'هذا الحقل مطلوب' })}
              placeholder="اسم الشركة"
              className="bg-background text-foreground border-input"
            />
            {errors.companyName && (
              <p className="text-sm text-destructive">{errors.companyName.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="location" className="text-sm font-medium text-foreground">الموقع</label>
            <Input
              id="location"
              {...register('location', { required: 'هذا الحقل مطلوب' })}
              placeholder="مثال: رام الله"
              className="bg-background text-foreground border-input"
            />
            {errors.location && (
              <p className="text-sm text-destructive">{errors.location.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="jobType" className="text-sm font-medium text-foreground">نوع الوظيفة</label>
              <Select
                defaultValue={initialData?.jobType}
                onValueChange={(value) => setValue('jobType', value)}
              >
                <SelectTrigger className="bg-background text-foreground border-input">
                  <SelectValue placeholder="اختر نوع الوظيفة" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border">
                  {jobTypes.map((type) => (
                    <SelectItem key={type} value={type} className="hover:bg-accent hover:text-accent-foreground">
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label htmlFor="experienceLevel" className="text-sm font-medium text-foreground">مستوى الخبرة</label>
              <Select
                defaultValue={initialData?.experienceLevel}
                onValueChange={(value) => setValue('experienceLevel', value)}
              >
                <SelectTrigger className="bg-background text-foreground border-input">
                  <SelectValue placeholder="اختر مستوى الخبرة" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border">
                  {experienceLevels.map((level) => (
                    <SelectItem key={level} value={level} className="hover:bg-accent hover:text-accent-foreground">
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="salary" className="text-sm font-medium text-foreground">الراتب</label>
              <Input
                id="salary"
                type="number"
                {...register('salary', { required: 'هذا الحقل مطلوب', valueAsNumber: true })}
                placeholder="مثال: 3000"
                className="bg-background text-foreground border-input"
              />
              {errors.salary && (
                <p className="text-sm text-destructive">{errors.salary.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="status" className="text-sm font-medium text-foreground">الحالة</label>
              <Select
                defaultValue={initialData?.status}
                onValueChange={(value) => setValue('status', value)}
              >
                <SelectTrigger className="bg-background text-foreground border-input">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent className="bg-popover text-popover-foreground border-border">
                  {jobStatuses.map((status) => (
                    <SelectItem key={status} value={status} className="hover:bg-accent hover:text-accent-foreground">
                      {status === 'Open' ? 'مفتوحة' : 'مغلقة'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="requirements" className="text-sm font-medium text-foreground">المتطلبات</label>
            <Textarea
              id="requirements"
              {...register('requirements', { required: 'هذا الحقل مطلوب' })}
              placeholder="متطلبات الوظيفة"
              className="bg-background text-foreground border-input"
            />
            {errors.requirements && (
              <p className="text-sm text-destructive">{errors.requirements.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="benefits" className="text-sm font-medium text-foreground">المميزات</label>
            <Textarea
              id="benefits"
              {...register('benefits', { required: 'هذا الحقل مطلوب' })}
              placeholder="مميزات الوظيفة"
              className="bg-background text-foreground border-input"
            />
            {errors.benefits && (
              <p className="text-sm text-destructive">{errors.benefits.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="contactInfo" className="text-sm font-medium text-foreground">معلومات الاتصال</label>
            <Input
              id="contactInfo"
              {...register('contactInfo', { required: 'هذا الحقل مطلوب' })}
              placeholder="مثال: jobs@company.com"
              className="bg-background text-foreground border-input"
            />
            {errors.contactInfo && (
              <p className="text-sm text-destructive">{errors.contactInfo.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="applicationDeadline" className="text-sm font-medium text-foreground">آخر موعد للتقديم</label>
            <Input
              id="applicationDeadline"
              type="datetime-local"
              {...register('applicationDeadline')}
              className="bg-background text-foreground border-input"
            />
            {errors.applicationDeadline && (
              <p className="text-sm text-destructive">{errors.applicationDeadline.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
            {isSubmitting ? 'جاري الحفظ...' : initialData ? 'تحديث' : 'إضافة'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}; 