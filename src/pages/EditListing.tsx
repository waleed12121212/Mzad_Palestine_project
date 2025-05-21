import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
import { listingService, UpdateListingDto, Listing } from '@/services/listingService';
import { categoryService, Category } from '@/services/categoryService';
import { useAuth } from '@/contexts/AuthContext';
import { imageService } from '@/services/imageService';
import PageWrapper from '@/components/layout/PageWrapper';
import { Card } from '@/components/ui/card';

const formSchema = z.object({
  title: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل'),
  description: z.string().min(10, 'الوصف يجب أن يكون 10 أحرف على الأقل'),
  address: z.string().min(3, 'العنوان يجب أن يكون 3 أحرف على الأقل'),
  price: z.number().min(1, 'السعر يجب أن يكون أكبر من 0'),
  categoryId: z.number().min(1, 'يجب اختيار تصنيف'),
  endDate: z.string().min(1, 'يجب تحديد تاريخ الانتهاء'),
  newImages: z.array(z.instanceof(File)).optional(),
  imagesToDelete: z.array(z.string()).optional(),
});

const EditListing: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [priceDisplayValue, setPriceDisplayValue] = useState('');
  const [listing, setListing] = useState<Listing | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      address: '',
      price: 0,
      categoryId: 0,
      endDate: '',
      newImages: [],
      imagesToDelete: [],
    },
  });

  const listingId = id ? parseInt(id) : 0;

  // Fetch categories
  useEffect(() => {
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

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      if (!listingId) return;
      
      try {
        const data = await listingService.getListingById(listingId);
        
        if (!data) {
          toast({
            title: 'لم يتم العثور على المنتج',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        // Check if the user is the owner of the listing
        if (user && data.userId !== user.id) {
          toast({
            title: 'غير مصرح',
            description: 'لا يمكنك تعديل هذا المنتج',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        setListing(data);
        setCurrentImages(data.images || []);
        
        // Format the date to local datetime format for the input
        const endDate = new Date(data.endDate);
        const formattedEndDate = endDate.toISOString().slice(0, 16);
        
        form.reset({
          title: data.title,
          description: data.description,
          address: data.address,
          price: data.price,
          categoryId: data.categoryId,
          endDate: formattedEndDate,
          newImages: [],
          imagesToDelete: [],
        });
        
        setPriceDisplayValue(String(data.price));
      } catch (error) {
        console.error('Error fetching listing:', error);
        toast({
          title: 'حدث خطأ أثناء تحميل بيانات المنتج',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (listingId) {
      fetchListing();
    }
  }, [listingId, navigate, user, form]);

  const handleImageRemove = (imageUrl: string) => {
    const updatedImages = currentImages.filter(img => img !== imageUrl);
    setCurrentImages(updatedImages);
    
    // Add to images to delete
    const imagesToDelete = form.getValues('imagesToDelete') || [];
    form.setValue('imagesToDelete', [...imagesToDelete, imageUrl]);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!listingId) return;
    
    setIsSubmitting(true);
    try {
      // Upload new images if any
      const newImageUrls: string[] = [];
      if (values.newImages && values.newImages.length > 0) {
        for (const file of values.newImages) {
          const result = await imageService.uploadImage(file);
          newImageUrls.push(result.url);
        }
      }
      
      const updateData: UpdateListingDto = {
        title: values.title,
        description: values.description,
        address: values.address,
        price: values.price,
        categoryId: values.categoryId,
        endDate: values.endDate,
        newImages: newImageUrls,
        imagesToDelete: values.imagesToDelete || [],
      };

      await listingService.updateListing(listingId, updateData);
      
      toast({
        title: 'تم تحديث المنتج بنجاح',
        description: 'تم حفظ التغييرات بنجاح',
      });
      
      navigate(`/listing/${listingId}`);
    } catch (error) {
      console.error('Error updating listing:', error);
      toast({
        title: 'فشل في تحديث المنتج',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 text-center">تعديل المنتج</h1>
          <p className="text-center text-gray-600 dark:text-gray-300 mb-8">قم بتعديل بيانات المنتج الخاص بك</p>

          <Card className="p-6">
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

                {/* Current Images */}
                <div>
                  <FormLabel>الصور الحالية</FormLabel>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-2">
                    {currentImages.length > 0 ? (
                      currentImages.map((imageUrl, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={imageUrl}
                            alt={`صورة ${index + 1}`}
                            className="h-32 w-full object-cover rounded-md"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/placeholder.svg';
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleImageRemove(imageUrl)}
                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 col-span-full">لا توجد صور حالية</p>
                    )}
                  </div>
                </div>

                {/* New Images */}
                <FormField
                  control={form.control}
                  name="newImages"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>إضافة صور جديدة</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || []}
                          onChange={field.onChange}
                          onRemove={(file) => {
                            field.onChange((field.value || []).filter(f => f !== file));
                          }}
                          maxFiles={5 - currentImages.length}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate(`/listing/${listingId}`)}
                  >
                    إلغاء
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </Button>
                </div>
              </form>
            </Form>
          </Card>
        </div>
      </div>
    </PageWrapper>
  );
};

export default EditListing; 