import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/services/paymentService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

const VerifyPaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch payment details
  const { data: payment, isLoading, error: fetchError } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentService.getPaymentById(Number(id)),
    enabled: !!id,
  });

  const handleVerifyPayment = async () => {
    if (!id) return;
    
    setIsVerifying(true);
    setError(null);
    
    try {
      await paymentService.verifyPayment(Number(id));
      setIsSuccess(true);
      toast.success('تم التحقق من الدفع بنجاح');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء التحقق من الدفع';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    );
  }

  if (fetchError || !payment) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
        <p className="text-gray-600 mb-4">تعذر تحميل بيانات الدفع</p>
        <Button onClick={() => navigate(-1)}>العودة</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-center">التحقق من الدفع</h1>
      
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>تفاصيل الدفع</CardTitle>
          <CardDescription>
            يرجى التحقق من تفاصيل الدفع قبل المتابعة
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 space-y-4">
              <div className="rounded-full bg-green-100 p-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium text-center">تم التحقق من الدفع بنجاح</h3>
              <p className="text-center text-gray-500">
                سيتم تحديث حالة طلبك قريبًا
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border-b">
                <span className="font-medium">رقم الدفع:</span>
                <span>{payment.id}</span>
              </div>
              <div className="flex justify-between items-center p-3 border-b">
                <span className="font-medium">المبلغ:</span>
                <span className="text-lg font-bold">{payment.amount.toLocaleString()} ₪</span>
              </div>
              <div className="flex justify-between items-center p-3 border-b">
                <span className="font-medium">طريقة الدفع:</span>
                <span>{payment.method}</span>
              </div>
              <div className="flex justify-between items-center p-3 border-b">
                <span className="font-medium">الحالة:</span>
                <span className={`font-medium ${payment.status === 'Verified' ? 'text-green-600' : 'text-yellow-600'}`}>
                  {payment.status === 'Verified' ? 'تم التحقق' : 'بانتظار التحقق'}
                </span>
              </div>
              
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3 flex items-start space-x-3 space-x-reverse rtl">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          {!isSuccess && (
            <>
              <Button variant="outline" onClick={() => navigate(-1)} disabled={isVerifying}>
                العودة
              </Button>
              <Button onClick={handleVerifyPayment} disabled={isVerifying || payment.status === 'Verified'}>
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    جاري التحقق...
                  </>
                ) : (
                  'التحقق من الدفع'
                )}
              </Button>
            </>
          )}
          {isSuccess && (
            <Button className="w-full" onClick={() => navigate('/auctions/won')}>
              العودة إلى المزادات
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyPaymentPage; 