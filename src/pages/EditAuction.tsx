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
import axios from 'axios';

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
  categoryId: z.number().min(1, {
    message: 'يرجى اختيار الفئة',
  }),
  status: z.string(),
});

const EditAuction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [originalAuction, setOriginalAuction] = useState<ApiAuction | null>(null);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      address: '',
      startTime: new Date(),
      endTime: new Date(),
      reservePrice: '',
      bidIncrement: '',
      categoryId: 1,
      status: 'Open',
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
        console.log('Raw API response:', response);
        
        // Handle different API response formats
        let auctionData;
        if (response.data) {
          auctionData = response.data;
        } else if (response.success && response.data) {
          auctionData = response.data;
        } else {
          auctionData = response;
        }
        
        console.log('Processed auction data:', auctionData);
        
        // Store the original auction data
        setOriginalAuction(auctionData);
        
        if (!auctionData) {
          toast({
            title: "خطأ",
            description: "لم يتم العثور على المزاد",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // Check user permissions - support both camelCase and PascalCase keys
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

        // Create safe date objects with basic error handling
        const now = new Date();
        const futureDate = new Date();
        futureDate.setDate(now.getDate() + 7);
        
        // Try to parse dates carefully (check all possible date fields)
        let startTime = now;
        let endTime = futureDate;
        
        // Get start date from any available field
        const startDateStr = 
          auctionData.startDate || auctionData.StartDate || 
          auctionData.startTime || auctionData.StartTime;
          
        // Get end date from any available field  
        const endDateStr = 
          auctionData.endDate || auctionData.EndDate || 
          auctionData.endTime || auctionData.EndTime;
        
        console.log('Parsing dates:', { startDateStr, endDateStr });
        
        if (startDateStr) {
          try {
            startTime = new Date(startDateStr);
          } catch (error) {
            console.error("Error parsing start date:", error);
          }
        }
        
        if (endDateStr) {
          try {
            endTime = new Date(endDateStr);
          } catch (error) {
            console.error("Error parsing end date:", error);
          }
        }
        
        // Validate dates (use fallbacks if invalid)
        if (isNaN(startTime.getTime())) startTime = now;
        if (isNaN(endTime.getTime())) endTime = futureDate;
        
        // Get price and increment with fallbacks
        const reservePrice = auctionData.reservePrice || auctionData.ReservePrice || 0;
        const bidIncrement = auctionData.bidIncrement || auctionData.BidIncrement || 100;
        
        console.log('Setting form values:', {
          startTime,
          endTime,
          reservePrice,
          bidIncrement
        });
        
        const getStatusString = (status: any): string => {
          if (typeof status === 'string') return status;
          
          // Convert numeric status to string matching our enum
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
          startTime,
          endTime,
          reservePrice: String(reservePrice),
          bidIncrement: String(bidIncrement),
          categoryId: auctionData.categoryId || auctionData.CategoryId || 1,
          status: getStatusString(auctionData.status || auctionData.Status || 'Open'),
        });
        
        // Try all possible image URLs
        setPreviewUrl(
          auctionData.imageUrl || 
          auctionData.ImageUrl || 
          (auctionData.images && auctionData.images.length > 0 ? auctionData.images[0] : '') ||
          (auctionData.Images && auctionData.Images.length > 0 ? auctionData.Images[0] : '') ||
          ''
        );
        
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

      // Prepare images array
      const images: string[] = [];
      if (imageUrl) {
        images.push(imageUrl);
      } else if (originalAuction?.images && originalAuction.images.length > 0) {
        originalAuction.images.forEach(img => images.push(img));
      } else if (originalAuction?.Images && originalAuction.Images.length > 0) {
        originalAuction.Images.forEach(img => images.push(img));
      } else if (originalAuction?.imageUrl) {
        images.push(originalAuction.imageUrl);
      } else if (originalAuction?.ImageUrl) {
        images.push(originalAuction.ImageUrl);
      }

      // Convert string status to numeric enum value
      let statusEnum: number;
      switch (values.status) {
        case 'Draft': statusEnum = AuctionStatus.Draft; break;
        case 'Open': statusEnum = AuctionStatus.Active; break;
        case 'Closed': statusEnum = AuctionStatus.Completed; break;
        case 'Cancelled': statusEnum = AuctionStatus.Cancelled; break;
        default: statusEnum = AuctionStatus.Active;
      }

      // Create the DTO object as required by the API
      const dto = {
        Title: values.title,
        Description: values.description,
        Address: values.address,
        StartDate: values.startTime.toISOString(),
        EndDate: values.endTime.toISOString(),
        ReservePrice: Number(values.reservePrice),
        BidIncrement: Number(values.bidIncrement),
        CategoryId: Number(values.categoryId),
        Status: statusEnum, // Use the numeric enum value
        Images: images
      };

      console.log('Sending final request data:', { dto });
      
      // Get the ID from the URL parameter
      const auctionId = Number(id);
      if (isNaN(auctionId)) {
        throw new Error('Invalid auction ID');
      }

      try {
        // Use axios directly to ensure proper request format
        const token = localStorage.getItem('token');
        
        console.log('Sending final request data:', { dto });
        
        const response = await axios.put(
          `http://localhost:8081/Auction/${auctionId}`,
          dto, // Send dto directly as the request body
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          }
        );
        
        console.log('Update result:', response.data);
        
        toast({
          title: "تم تحديث المزاد بنجاح",
          description: "تم حفظ التغييرات بنجاح",
        });
        
        // Add a small delay before navigation
        setTimeout(() => {
          navigate(`/auction/${id}`);
        }, 500);
      } catch (error: any) {
        console.error('API Error updating auction:', error);
        
        // Log full error details
        console.error('Error response:', error.response);
        console.error('Error data:', error.response?.data);
        
        // Try to extract and display the detailed error message
        let errorMessage = "حدث خطأ أثناء تحديث المزاد";
        
        if (error.response?.data) {
          const errorData = error.response.data;
          
          // Handle specific validation errors
          if (errorData.errors) {
            try {
              // Convert error object to a readable string
              const errorsString = JSON.stringify(errorData.errors);
              errorMessage = `خطأ في البيانات: ${errorsString}`;
            } catch (e) {
              errorMessage = "خطأ في التحقق من البيانات";
            }
          } else if (errorData.title) {
            errorMessage = errorData.title;
          }
        }
        
        toast({
          title: "فشل في تحديث المزاد",
          description: errorMessage,
          variant: "destructive",
        });
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

            {/* Start Time Field */}
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>وقت بدء المزاد</FormLabel>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="datetime-local"
                      value={(() => {
                        // Safely handle the date
                        try {
                          const date = field.value instanceof Date && !isNaN(field.value.getTime()) 
                            ? field.value 
                            : new Date();
                          return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                            .toISOString()
                            .slice(0, 16);
                        } catch (e) {
                          console.error("Error formatting start date:", e);
                          return new Date().toISOString().slice(0, 16);
                        }
                      })()}
                      onChange={(e) => {
                        if (e.target.value) {
                          try {
                            field.onChange(new Date(e.target.value));
                          } catch (error) {
                            console.error("Error parsing date:", error);
                            field.onChange(new Date());
                          }
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Time Field */}
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>وقت نهاية المزاد</FormLabel>
                  <div className="flex flex-col gap-2">
                    <Input
                      type="datetime-local"
                      value={(() => {
                        // Safely handle the date
                        try {
                          const date = field.value instanceof Date && !isNaN(field.value.getTime()) 
                            ? field.value 
                            : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                          return new Date(date.getTime() - (date.getTimezoneOffset() * 60000))
                            .toISOString()
                            .slice(0, 16);
                        } catch (e) {
                          console.error("Error formatting end date:", e);
                          return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16);
                        }
                      })()}
                      onChange={(e) => {
                        if (e.target.value) {
                          try {
                            field.onChange(new Date(e.target.value));
                          } catch (error) {
                            console.error("Error parsing date:", error);
                            // Set to 1 week from now
                            const futureDate = new Date();
                            futureDate.setDate(futureDate.getDate() + 7);
                            field.onChange(futureDate);
                          }
                        }
                      }}
                      className="w-full"
                    />
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Reserve Price Field */}
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

            {/* Category ID Field */}
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>الفئة</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={String(field.value)}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر فئة المزاد" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="1">ملابس رجالية</SelectItem>
                      <SelectItem value="2">أجهزة إلكترونية</SelectItem>
                      <SelectItem value="3">أثاث منزلي</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status Field */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>حالة المزاد</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="اختر حالة المزاد" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Draft">مسودة</SelectItem>
                      <SelectItem value="Open">نشط</SelectItem>
                      <SelectItem value="Closed">منتهي</SelectItem>
                      <SelectItem value="Cancelled">ملغي</SelectItem>
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