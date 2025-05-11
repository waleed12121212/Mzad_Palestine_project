import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { auctionService } from '@/services/auctionService';
import { toast } from 'sonner';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(3, 'اسم المزاد يجب أن يكون 3 أحرف على الأقل'),
  startTime: z.string().min(1, 'يجب تحديد وقت البدء'),
  endTime: z.string().min(1, 'يجب تحديد وقت الانتهاء'),
  reservePrice: z.number().min(1, 'السعر الاحتياطي يجب أن يكون أكبر من 0'),
  bidIncrement: z.number().min(1, 'الزيادة الدنيا يجب أن تكون أكبر من 0'),
  imageUrl: z.string().url('يجب إدخال رابط صورة صحيح'),
  status: z.number().optional(),
});

const EditAuction: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      startTime: '',
      endTime: '',
      reservePrice: 0,
      bidIncrement: 0,
      imageUrl: '',
      status: 1,
    },
  });

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const data = await auctionService.getAuctionById(Number(id));
        form.reset({
          name: data.name || '',
          startTime: data.startTime ? data.startTime.slice(0, 16) : '',
          endTime: data.endTime ? data.endTime.slice(0, 16) : '',
          reservePrice: data.reservePrice,
          bidIncrement: data.bidIncrement,
          imageUrl: data.imageUrl,
          status: data.status ?? 1,
        });
      } catch {
        toast.error('تعذر جلب بيانات المزاد');
      }
    };
    fetchAuction();
    // eslint-disable-next-line
  }, [id]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await auctionService.updateAuction(Number(id), {
        ...values,
        startTime: new Date(values.startTime).toISOString(),
        endTime: new Date(values.endTime).toISOString(),
      });
      toast.success('تم تعديل المزاد بنجاح');
      navigate(`/auction/${id}`);
    } catch {
      toast.error('حدث خطأ أثناء تعديل المزاد');
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-xl">
          <h1 className="heading-lg mb-8 text-center">تعديل المزاد</h1>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>اسم المزاد</FormLabel>
                    <FormControl>
                      <Input placeholder="اسم المزاد" {...field} />
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
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
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
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
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
                      <Input placeholder="رابط الصورة" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full">حفظ التعديلات</Button>
            </form>
          </Form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EditAuction; 