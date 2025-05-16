import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { auctionService } from '@/services/auctionService';
import { imageService } from '@/services/imageService';
import { useAuth } from '@/contexts/AuthContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CalendarIcon, Upload } from 'lucide-react';

interface ApiAuction {
  AuctionId: number;
  UserId: number;
  StartTime: string;
  EndTime: string;
  ReservePrice: number;
  BidIncrement: number;
  ImageUrl: string;
  Status: number;
}

interface ApiResponse {
  data: ApiAuction;
}

export interface Auction {
  id?: number;
  userId?: number;
  startTime: string;
  endTime: string;
  reservePrice: number;
  bidIncrement: number;
  imageUrl: string;
  status?: number;
}

// Form validation schema
const formSchema = z.object({
  startTime: z.date({
    required_error: 'يرجى تحديد وقت بدء المزاد',
  }),
  endTime: z.date({
    required_error: 'يرجى تحديد وقت نهاية المزاد',
  }),
  reservePrice: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'يجب أن يكون السعر الابتدائي رقماً موجباً',
  }),
  bidIncrement: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'يجب أن تكون قيمة الزيادة رقماً موجباً',
  }),
  status: z.number().min(0).max(3),
});

const EditAuction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startTime: new Date(),
      endTime: new Date(),
      reservePrice: '',
      bidIncrement: '',
      status: 1,
    },
  });

  useEffect(() => {
    const loadAuction = async () => {
      try {
        if (!user?.id) {
          toast({
            title: "غير مصرح",
            description: "يجب تسجيل الدخول لتعديل المزاد",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        console.log('Fetching auction with ID:', id);
        const response = await auctionService.getAuctionById(Number(id));
        const auctionData = (response as unknown as ApiResponse).data;
        console.log('Received auction data:', auctionData);
        
        if (!auctionData) {
          toast({
            title: "خطأ",
            description: "لم يتم العثور على المزاد",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        if (Number(auctionData.UserId) !== Number(user.id)) {
          toast({
            title: "غير مصرح",
            description: "لا يمكنك تعديل هذا المزاد",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        form.reset({
          startTime: new Date(auctionData.StartTime),
          endTime: new Date(auctionData.EndTime),
          reservePrice: auctionData.ReservePrice.toString(),
          bidIncrement: auctionData.BidIncrement.toString(),
          status: auctionData.Status || 1,
        });
        setPreviewUrl(auctionData.ImageUrl || '');
        setLoading(false);
      } catch (error: any) {
        console.error('Error loading auction:', error);
        toast({
          title: "خطأ في تحميل بيانات المزاد",
          description: error.message || "حدث خطأ أثناء تحميل بيانات المزاد",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    if (id && user) {
      loadAuction();
    }
  }, [id, user, navigate, form]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    try {
      const uploadResult = await imageService.uploadImage(file);
      return uploadResult.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setSubmitting(true);
      console.log('Submitting update with values:', values);
      
      let imageUrl = previewUrl;
      if (selectedImage) {
        try {
          imageUrl = await uploadImage(selectedImage);
        } catch (error) {
          toast({
            title: "فشل في رفع الصورة",
            description: "حدث خطأ أثناء رفع الصورة، يرجى المحاولة مرة أخرى",
            variant: "destructive",
          });
          return;
        }
      }

      const updateData = {
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        reservePrice: Number(values.reservePrice),
        bidIncrement: Number(values.bidIncrement),
        imageUrl: imageUrl,
        status: values.status,
      };

      console.log('Sending update data:', updateData);
      const result = await auctionService.updateAuction(Number(id), updateData);
      console.log('Update result:', result);

      if (result) {
        toast({
          title: "تم تحديث المزاد بنجاح",
          description: "تم حفظ التغييرات بنجاح",
        });
        
        // Add a small delay before navigation
        setTimeout(() => {
          navigate(`/auction/${id}`);
        }, 500);
      }
    } catch (error: any) {
      console.error('Error updating auction:', error);
      toast({
        title: "فشل في تحديث المزاد",
        description: error.message || "حدث خطأ أثناء تحديث المزاد",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">تعديل المزاد</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Image Upload Section */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                صورة المزاد
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="mx-auto h-32 w-auto object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedImage(null);
                          setPreviewUrl('');
                        }}
                        className="absolute top-0 right-0 -mr-2 -mt-2 bg-red-500 text-white rounded-full p-1"
                      >
                        ×
                      </button>
                    </div>
                  ) : (
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600 dark:text-gray-400">
                    <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>رفع صورة</span>
                      <input
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pr-2">أو اسحب وأفلت</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    PNG, JPG, GIF حتى 10MB
                  </p>
                </div>
              </div>
            </div>

            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>وقت بدء المزاد</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-right font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ar })
                          ) : (
                            <span>اختر التاريخ</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date()
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>وقت نهاية المزاد</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full pl-3 text-right font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP", { locale: ar })
                          ) : (
                            <span>اختر التاريخ</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < form.getValues("startTime")
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reservePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>السعر الابتدائي</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" placeholder="أدخل السعر الابتدائي" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bidIncrement"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>قيمة الزيادة</FormLabel>
                  <FormControl>
                    <Input {...field} type="number" min="0" placeholder="أدخل قيمة الزيادة" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حالة المزاد</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة المزاد" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">مسودة</SelectItem>
                      <SelectItem value="1">نشط</SelectItem>
                      <SelectItem value="2">منتهي</SelectItem>
                      <SelectItem value="3">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/auction/${id}`)}
              >
                إلغاء
              </Button>
              <Button
                type="submit"
                disabled={submitting}
              >
                {submitting ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default EditAuction; 