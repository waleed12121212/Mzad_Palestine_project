import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { auctionService } from '@/services/auctionService';
import { imageService } from '@/services/imageService';
import { categoryService } from '@/services/categoryService';
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
import axios from 'axios';
import { ImageUpload } from '@/components/ui/image-upload';

interface ApiAuction {
  id?: number;
  auctionId?: number;
  userId?: number;
  sellerId?: number;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  reservePrice?: number;
  bidIncrement?: number;
  currentBid?: number;
  status?: string | number;
  imageUrl?: string;
  images?: string[];
  title?: string;
  description?: string;
  address?: string;
  categoryId?: number;
  features?: string;
  condition?: number;
  // API response fields (PascalCase)
  Id?: number;
  AuctionId?: number;
  UserId?: number;
  SellerId?: number;
  StartDate?: string;
  EndDate?: string;
  StartTime?: string;
  EndTime?: string;
  ReservePrice?: number;
  BidIncrement?: number;
  CurrentBid?: number;
  Status?: string | number;
  ImageUrl?: string;
  Images?: string[];
  Title?: string;
  Description?: string;
  Address?: string;
  CategoryId?: number;
  Features?: string;
  Condition?: number;
}

// AuctionStatus enum that matches backend expectations
enum AuctionStatus {
  Draft = 0,
  Active = 1,
  Completed = 2,
  Cancelled = 3
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
  title: z.string().min(2, {
    message: 'يجب أن يكون العنوان أكثر من حرفين',
  }),
  description: z.string().min(10, {
    message: 'يجب أن يكون الوصف أكثر من 10 أحرف',
  }),
  address: z.string().min(2, {
    message: 'يرجى إدخال العنوان',
  }),
  bidIncrement: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: 'يجب أن تكون قيمة الزيادة رقماً موجباً',
  }),
  features: z.string().optional(),
  condition: z.number().optional(),
});

const EditAuction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [auction, setAuction] = useState<ApiAuction | null>(null);
  const [hasBids, setHasBids] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      address: '',
      bidIncrement: '',
      newImages: [],
      imagesToDelete: [],
      features: '',
      condition: 0,
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

        const response = await auctionService.getAuctionById(Number(id));
        let auctionData = response.data || response;
        
        if (!auctionData) {
          toast({
            title: "خطأ",
            description: "لم يتم العثور على المزاد",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // Check user permissions
        const auctionUserId = auctionData.userId || auctionData.UserId || auctionData.sellerId || auctionData.SellerId;
        if (Number(auctionUserId) !== Number(user.id)) {
          toast({
            title: "غير مصرح",
            description: "لا يمكنك تعديل هذا المزاد",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        setAuction(auctionData);
        setCurrentImages(auctionData.images || auctionData.Images || []);
        
        // Check if auction has bids
        const bids = auctionData.bids || auctionData.Bids || [];
        setHasBids(bids.length > 0);
        
        // Parse dates
        const startTime = new Date(auctionData.startDate || auctionData.StartDate || auctionData.startTime || auctionData.StartTime);
        const endTime = new Date(auctionData.endDate || auctionData.EndDate || auctionData.endTime || auctionData.EndTime);
        
        // Get price and increment
        const reservePrice = auctionData.reservePrice || auctionData.ReservePrice || 0;
        const bidIncrement = auctionData.bidIncrement || auctionData.BidIncrement || 100;
        
        const getStatusString = (status: any): string => {
          if (typeof status === 'string') return status;
          switch (Number(status)) {
            case AuctionStatus.Draft: return 'Draft';
            case AuctionStatus.Active: return 'Open';
            case AuctionStatus.Completed: return 'Closed';
            case AuctionStatus.Cancelled: return 'Cancelled';
            default: return 'Open';
          }
        };

        form.reset({
          title: auctionData.title || auctionData.Title || '',
          description: auctionData.description || auctionData.Description || '',
          address: auctionData.address || auctionData.Address || '',
          bidIncrement: String(bidIncrement),
          newImages: [],
          imagesToDelete: [],
          features: auctionData.features || auctionData.Features || '',
          condition: auctionData.condition || auctionData.Condition || 0,
        });
        
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

    const loadCategories = async () => {
      try {
        const response = await categoryService.getCategories();
        if (response) {
          setCategories(response);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
        toast({
          title: "خطأ في تحميل الفئات",
          description: "حدث خطأ أثناء تحميل قائمة الفئات",
          variant: "destructive",
        });
      }
    };

    if (id && user) {
      loadAuction();
      loadCategories();
    }
  }, [id, user, navigate, form]);

  const handleImageRemove = (imageUrl: string) => {
    // Remove from current images
    const updatedImages = currentImages.filter(img => img !== imageUrl);
    setCurrentImages(updatedImages);
    
    // Add to images to delete
    const imagesToDelete = form.getValues('imagesToDelete') || [];
    form.setValue('imagesToDelete', [...imagesToDelete, imageUrl]);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!id) return;
    
    setSubmitting(true);
    try {
      // Upload new images if any
      const newImageUrls: string[] = [];
      if (values.newImages && values.newImages.length > 0) {
        for (const file of values.newImages) {
          try {
            const result = await imageService.uploadImage(file);
            newImageUrls.push(result.url);
          } catch (error) {
            console.error('Error uploading image:', error);
            toast({
              title: "خطأ في تحميل الصور",
              description: "فشل في تحميل بعض الصور. يرجى المحاولة مرة أخرى",
              variant: "destructive",
            });
            return;
          }
        }
      }

      // Delete removed images
      const imagesToDelete = form.getValues('imagesToDelete') || [];
      for (const imageUrl of imagesToDelete) {
        try {
          await imageService.deleteImage(imageUrl);
        } catch (error) {
          console.error('Error deleting image:', error);
          // Continue with other images even if one fails
        }
      }

      // Prepare update data
      const updateData = {
        title: values.title.trim(),
        description: values.description.trim(),
        address: values.address.trim(),
        bidIncrement: Number(values.bidIncrement),
        imagesToDelete: imagesToDelete,
        newImages: newImageUrls,
        features: values.features,
        condition: Number(values.condition),
      };

      console.log('Sending update data:', updateData);

      await auctionService.updateAuction(Number(id), updateData);
      
      toast({
        title: "تم تحديث المزاد بنجاح",
        description: "تم حفظ التغييرات بنجاح",
      });
      
      navigate(`/auction/${id}`);
    } catch (error: any) {
      console.error('Error updating auction:', error);
      toast({
        title: "فشل في تحديث المزاد",
        description: error.response?.data?.message || "حدث خطأ أثناء تحديث المزاد",
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
            {/* Current Images */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                الصور الحالية
              </label>
              <div className="grid grid-cols-3 gap-4">
                {currentImages.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="h-32 w-full object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(url)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      ×
                    </button>
                  </div>
                ))}
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

            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>عنوان المزاد</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="أدخل عنوان المزاد" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description Field */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>وصف المزاد</FormLabel>
                  <FormControl>
                    <textarea 
                      {...field} 
                      rows={3}
                      className="flex h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" 
                      placeholder="أدخل وصف المزاد"
                    ></textarea>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Address Field */}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>العنوان</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="أدخل عنوان المزاد" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Bid Increment Field */}
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

            {/* Features Field */}
            <FormField
              control={form.control}
              name="features"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الميزات</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="أدخل الميزات" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Condition Field */}
            <FormField
              control={form.control}
              name="condition"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حالة العنصر</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(Number(value))} 
                    defaultValue={String(field.value || 1)}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة العنصر" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">جديد</SelectItem>
                      <SelectItem value="2">مستعمل</SelectItem>
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