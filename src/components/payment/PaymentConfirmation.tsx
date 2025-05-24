import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'react-hot-toast';
import { paymentService, ConfirmPaymentDto } from '@/services/paymentService';
import { Check, AlertCircle } from 'lucide-react';

interface PaymentConfirmationProps {
  paymentId: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({ 
  paymentId, 
  onSuccess, 
  onCancel 
}) => {
  const navigate = useNavigate();
  const [paymentIntentId, setPaymentIntentId] = useState('');
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleConfirmPayment = async () => {
    if (!paymentIntentId.trim()) {
      setError('الرجاء إدخال رمز تأكيد الدفع');
      return;
    }

    setIsConfirming(true);
    setError(null);

    try {
      const confirmData: ConfirmPaymentDto = {
        paymentIntentId: paymentIntentId.trim()
      };

      await paymentService.confirmPayment(confirmData);
      setIsSuccess(true);
      toast.success('تم تأكيد الدفع بنجاح');
      
      if (onSuccess) {
        onSuccess();
      } else {
        // Default redirect if no onSuccess handler
        setTimeout(() => {
          navigate('/auctions/won');
        }, 2000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'حدث خطأ أثناء تأكيد الدفع';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>تأكيد الدفع</CardTitle>
        <CardDescription>
          الرجاء إدخال رمز تأكيد الدفع الذي تلقيته من مزود خدمة الدفع
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 space-y-4">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-medium text-center">تم تأكيد الدفع بنجاح</h3>
            <p className="text-center text-gray-500">
              سيتم تحديث حالة طلبك قريبًا
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="paymentIntentId">رمز تأكيد الدفع</Label>
              <Input
                id="paymentIntentId"
                value={paymentIntentId}
                onChange={(e) => setPaymentIntentId(e.target.value)}
                placeholder="أدخل رمز التأكيد"
                className="rtl"
              />
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
            <Button variant="outline" onClick={handleCancel} disabled={isConfirming}>
              إلغاء
            </Button>
            <Button onClick={handleConfirmPayment} disabled={isConfirming || isSuccess}>
              {isConfirming ? 'جاري التأكيد...' : 'تأكيد الدفع'}
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
  );
};

export default PaymentConfirmation; 