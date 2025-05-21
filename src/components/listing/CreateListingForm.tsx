import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { ImageUpload } from '@/components/ui/image-upload';
import { listingService, CreateListingDto } from '@/services/listingService';
import { categoryService, Category } from '@/services/categoryService';
import { useAuth } from '@/contexts/AuthContext';
import { imageService } from '@/services/imageService';

const formSchema = z.object({
  title: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  address: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل'),
  price: z.number().min(1, 'السعر يجب أن يكون أكبر من 0'),
  categoryId: z.number().min(1, 'يجب اختيار تصنيف'),
  endDate: z.string().min(1, 'يجب تحديد تاريخ الانتهاء'),
  images: z.array(z.instanceof(File)).min(1, 'يجب إضافة صورة واحدة على الأقل'),
});

export const CreateListingForm: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [priceDisplayValue, setPriceDisplayValue] = useState('');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      address: '',
      price: 0,
      categoryId: 0,
      endDate: '',
      images: [],
    },
  });

  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (error) {
        toast({
          title: 'حدث خطأ أثناء تحميل التصنيفات',
          variant: 'destructive',
        });
      }
    };
    fetchCategories();
  }, []);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: 'يجب تسجيل الدخول أولاً',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      // Upload each image file individually and collect URLs
      const imageUrls: string[] = [];
      for (const file of values.images) {
        const result = await imageService.uploadImage(file);
        imageUrls.push(result.url);
      }
      
      const listingData: CreateListingDto = {
        title: values.title,
        description: values.description,
        address: values.address,
        price: values.price,
        categoryId: values.categoryId,
        endDate: values.endDate,
        images: imageUrls,
      };

      const listing = await listingService.createListing(listingData);
      navigate(`/listing/${listing.listingId}`);
    } catch (error) {
      console.error('Error creating listing:', error);
      toast({
        title: 'فشل في إنشاء المنتج',
        variant: 'destructive',
      });
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
              <FormLabel>عنوان المنتج</FormLabel>
              <FormControl>
                <Input placeholder="أدخل عنوان المنتج" {...field} />
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
              <FormLabel>وصف المنتج</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="أدخل وصفاً تفصيلياً للمنتج"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>موقع المنتج</FormLabel>
              <FormControl>
                <Input placeholder="المدينة، المنطقة" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => {
              // Initialize display value if needed
              React.useEffect(() => {
                setPriceDisplayValue(field.value === 0 ? '' : String(field.value));
              }, []);
              
              const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value;
                setPriceDisplayValue(val);
                
                const numValue = val === '' ? 0 : Number(val);
                field.onChange(numValue);
              };
              
              return (
                <FormItem>
                  <FormLabel>السعر</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      className="text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={priceDisplayValue}
                      onChange={handleInputChange}
                      onBlur={() => {
                        if (priceDisplayValue === '') {
                          field.onChange(0);
                          setPriceDisplayValue('0');
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>التصنيف</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(Number(value))} 
                  defaultValue={field.value ? String(field.value) : undefined}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر تصنيفاً" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={String(category.id)} value={String(category.id)}>
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
              <FormLabel>صور المنتج</FormLabel>
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
          {isLoading ? 'جاري الإنشاء...' : 'إضافة منتج للبيع'}
        </Button>
      </form>
    </Form>
  );
}; 