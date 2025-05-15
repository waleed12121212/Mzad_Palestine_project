import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from '@/hooks/use-toast';
import { auctionService } from '@/services/auctionService';
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
import { CalendarIcon } from 'lucide-react';

export interface Auction {
  startTime: string;
  endTime: string;
  reservePrice: number;
  bidIncrement: number;
  imageUrl: string;
  status: number;
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
  imageUrl: z.string().url('يجب إدخال رابط صورة صحيح'),
  status: z.number().min(0).max(3),
});

const EditAuction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startTime: new Date(),
      endTime: new Date(),
      reservePrice: '',
      bidIncrement: '',
      imageUrl: '',
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
        const auction = await auctionService.getAuctionById(Number(id));
        console.log('Received auction data:', auction);
        
        if (!auction) {
          toast({
            title: "خطأ",
            description: "لم يتم العثور على المزاد",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        // تحقق من أن المستخدم هو صاحب المزاد
        if (auction.userId !== user.id) {
          toast({
            title: "غير مصرح",
            description: "لا يمكنك تعديل هذا المزاد",
            variant: "destructive",
          });
          navigate('/');
          return;
        }

        form.reset({
          startTime: new Date(auction.startTime),
          endTime: new Date(auction.endTime),
          reservePrice: auction.reservePrice.toString(),
          bidIncrement: auction.bidIncrement.toString(),
          imageUrl: auction.imageUrl || '',
          status: auction.status || 1,
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

    if (id && user) {
      loadAuction();
    }
  }, [id, user, navigate, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setSubmitting(true);
      console.log('Submitting update with values:', values);
      
      const updateData = {
        startTime: values.startTime.toISOString(),
        endTime: values.endTime.toISOString(),
        reservePrice: Number(values.reservePrice),
        bidIncrement: Number(values.bidIncrement),
        imageUrl: values.imageUrl,
        status: values.status,
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
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>رابط الصورة</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="أدخل رابط الصورة" />
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