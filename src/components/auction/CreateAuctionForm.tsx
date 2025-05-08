import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { auctionService, CreateAuctionDto } from '@/services/auctionService';
import { useAuth } from '@/contexts/AuthContext';

const formSchema = z.object({
  name: z.string().min(3, 'اسم المزاد يجب أن يكون 3 أحرف على الأقل'),
  startTime: z.string().min(1, 'يجب تحديد وقت البدء'),
  endTime: z.string().min(1, 'يجب تحديد وقت الانتهاء'),
  reservePrice: z.number().min(1, 'السعر الاحتياطي يجب أن يكون أكبر من 0'),
  bidIncrement: z.number().min(1, 'الزيادة الدنيا يجب أن تكون أكبر من 0'),
  imageUrl: z.string().url('يجب إدخال رابط صورة صحيح'),
}).refine((data) => {
  const start = new Date(data.startTime);
  const end = new Date(data.endTime);
  return end > start;
}, {
  message: 'وقت الانتهاء يجب أن يكون بعد وقت البدء',
  path: ['endTime'],
});

interface CreateAuctionFormProps {
  listingId: number;
  onSuccess?: () => void;
}

export const CreateAuctionForm: React.FC<CreateAuctionFormProps> = ({ listingId, onSuccess }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      startTime: '',
      endTime: '',
      reservePrice: 0,
      bidIncrement: 0,
      imageUrl: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast.error('يجب تسجيل الدخول أولاً');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const auctionData: CreateAuctionDto = {
        ...values,
        listingId,
        reservePrice: Number(values.reservePrice),
        bidIncrement: Number(values.bidIncrement),
      };

      const auction = await auctionService.createAuction(auctionData);
      toast.success('تم إنشاء المزاد بنجاح');
      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/auction/${auction.id}`);
      }
    } catch (error) {
      toast.error('حدث خطأ أثناء إنشاء المزاد');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>اسم المزاد</FormLabel>
              <FormControl>
                <Input placeholder="أدخل اسم المزاد" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>وقت البدء</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>وقت الانتهاء</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="reservePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>السعر الاحتياطي</FormLabel>
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
            name="bidIncrement"
            render={({ field }) => (
              <FormItem>
                <FormLabel>الزيادة الدنيا</FormLabel>
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
        </div>

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>رابط الصورة</FormLabel>
              <FormControl>
                <Input placeholder="أدخل رابط صورة المزاد" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'جاري الإنشاء...' : 'إنشاء المزاد'}
        </Button>
      </form>
    </Form>
  );
}; 