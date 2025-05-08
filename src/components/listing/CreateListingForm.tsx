import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ImageUpload } from '@/components/ui/image-upload';
import { listingService, CreateListingDto } from '@/services/listingService';
import { categoryService } from '@/services/categoryService';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  title: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  startingPrice: z.number().min(1, 'السعر يجب أن يكون أكبر من 0'),
  category: z.string().min(1, 'يجب اختيار تصنيف'),
  endDate: z.string().min(1, 'يجب تحديد تاريخ الانتهاء'),
  images: z.array(z.instanceof(File)).min(1, 'يجب إضافة صورة واحدة على الأقل'),
});

export const CreateListingForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      startingPrice: 0,
      category: '',
      endDate: '',
      images: [],
    },
  });

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getActiveCategories();
        setCategories(data);
      } catch (error) {
        toast.error('حدث خطأ أثناء تحميل التصنيفات');
      }
    };
    fetchCategories();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const listingData: CreateListingDto = {
        ...values,
        startingPrice: Number(values.startingPrice),
      };

      const listing = await listingService.createListing(listingData);
      toast.success('تم إنشاء الإدراج بنجاح');
      navigate(`/listing/${listing.id}`);
    } catch (error) {
      toast.error('حدث خطأ أثناء إنشاء الإدراج');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>عنوان الإدراج</FormLabel>
              <FormControl>
                <Input placeholder="أدخل عنوان الإدراج" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>وصف الإدراج</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="أدخل وصفاً تفصيلياً للإدراج"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startingPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>السعر الابتدائي</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="0"
                    {...field}
                    onChange={(e) => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>التصنيف</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر تصنيفاً" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="endDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>تاريخ الانتهاء</FormLabel>
              <FormControl>
                <Input type="datetime-local" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="images"
          render={({ field }) => (
            <FormItem>
              <FormLabel>صور الإدراج</FormLabel>
              <FormControl>
                <ImageUpload
                  value={field.value}
                  onChange={field.onChange}
                  onRemove={(file) => {
                    const newFiles = field.value.filter((f) => f !== file);
                    field.onChange(newFiles);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'جاري الإنشاء...' : 'إنشاء الإدراج'}
        </Button>
      </form>
    </Form>
  );
}; 