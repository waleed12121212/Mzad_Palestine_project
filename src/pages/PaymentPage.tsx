import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paymentService, Payment } from '@/services/paymentService';
import { transactionService } from '@/services/transactionService';
import { TransactionStatus } from '@/types/transaction';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'react-hot-toast';
import { CreditCard, Wallet, Building2, Truck } from 'lucide-react';

const PaymentPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [selectedMethod, setSelectedMethod] = useState('CreditCard');
  const [isCancelling, setIsCancelling] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch payment details
  const { data: payment, isLoading, error } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentService.getPaymentById(Number(id)),
    enabled: !!id,
  });

  const handleUpdatePayment = async () => {
    if (!payment) return;
    
    setIsProcessing(true);
    try {
      await paymentService.updatePayment(Number(id), {
        paymentMethod: selectedMethod,
      });
      
      // Prepare checkout data
      const checkoutData = {
        id: payment.auctionId || payment.listingId,
        type: payment.auctionId ? 'auction' : 'listing',
        amount: payment.amount,
        title: payment.notes?.replace('Payment for: ', '') || `${payment.auctionId ? 'Auction' : 'Listing'} #${payment.id}`,
        paymentMethod: selectedMethod,
        transactionId: payment.transactionId
      };

      // Navigate to checkout with payment data
      navigate(`/checkout/${id}`, { 
        state: { checkoutData }
      });
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث طريقة الدفع');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancelPayment = async () => {
    if (!payment) return;
    setIsCancelling(true);
    try {
      // Delete the payment
      await paymentService.deletePayment(payment.id);
      // Cancel the transaction if there's a transaction ID
      if (payment.transactionId) {
        // Get the original transaction to preserve its data
        const originalTransaction = await transactionService.getTransactionById(Number(payment.transactionId));
        
        await transactionService.updateTransaction(Number(payment.transactionId), {
          amount: originalTransaction.amount,
          type: originalTransaction.type, // Keep original type
          description: originalTransaction.description, // Keep original description
          status: 3 // Cancelled status
        });
      }
      toast.success('تم إلغاء عملية الدفع');
      navigate('/');
    } catch (error) {
      toast.error('حدث خطأ أثناء إلغاء الدفع');
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  if (error || !payment) {
    return <div className="flex justify-center items-center min-h-screen">حدث خطأ أثناء تحميل بيانات الدفع</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">إكمال عملية الدفع</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الدفع</CardTitle>
            <CardDescription>يرجى اختيار طريقة الدفع المفضلة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 border rounded-lg">
                <span className="font-medium">المبلغ:</span>
                <span className="text-lg font-bold">{payment.amount.toLocaleString()} ₪</span>
              </div>
              
              <div className="space-y-4">
                <Label className="text-lg">اختر طريقة الدفع:</Label>
                <RadioGroup
                  value={selectedMethod}
                  onValueChange={setSelectedMethod}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <RadioGroupItem value="CreditCard" id="credit-card" />
                    <Label htmlFor="credit-card" className="flex items-center gap-2 cursor-pointer">
                      <CreditCard className="w-5 h-5" />
                      بطاقة ائتمان
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <RadioGroupItem value="PayPal" id="paypal" />
                    <Label htmlFor="paypal" className="flex items-center gap-2 cursor-pointer">
                      <Wallet className="w-5 h-5" />
                      باي بال
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <RadioGroupItem value="BankTransfer" id="bank-transfer" />
                    <Label htmlFor="bank-transfer" className="flex items-center gap-2 cursor-pointer">
                      <Building2 className="w-5 h-5" />
                      تحويل بنكي
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2 space-x-reverse p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                    <RadioGroupItem value="CashOnDelivery" id="cash" />
                    <Label htmlFor="cash" className="flex items-center gap-2 cursor-pointer">
                      <Truck className="w-5 h-5" />
                      الدفع عند الاستلام
                    </Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleCancelPayment} disabled={isCancelling || isProcessing}>
              {isCancelling ? 'جاري الإلغاء...' : 'إلغاء'}
            </Button>
            <Button onClick={handleUpdatePayment} disabled={isCancelling || isProcessing}>
              {isProcessing ? 'جاري المعالجة...' : 'متابعة الدفع'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>معلومات إضافية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">تعليمات الدفع:</h3>
                <ul className="list-disc list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li>سيتم معالجة الدفع فور تأكيد طريقة الدفع</li>
                  <li>يمكنك تتبع حالة الدفع في صفحة المزادات الفائزة</li>
                  <li>سيتم إرسال تأكيد الدفع إلى بريدك الإلكتروني</li>
                </ul>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2">معلومات الاتصال:</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  إذا واجهتك أي مشكلة، يرجى التواصل مع خدمة العملاء
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentPage; 