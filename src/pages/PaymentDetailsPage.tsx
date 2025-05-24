import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { paymentService } from '@/services/paymentService';
import { transactionService } from '@/services/transactionService';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PaymentDetailsCard from '@/components/payment/PaymentDetailsCard';
import TransactionWithPaymentDetails from '@/components/payment/TransactionWithPaymentDetails';

const PaymentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  // Fetch payment details
  const { 
    data: payment, 
    isLoading: isLoadingPayment, 
    error: paymentError 
  } = useQuery({
    queryKey: ['payment', id],
    queryFn: () => paymentService.getPaymentById(Number(id)),
    enabled: !!id,
  });

  // Fetch related transaction if payment has a transaction ID
  const { 
    data: transaction, 
    isLoading: isLoadingTransaction 
  } = useQuery({
    queryKey: ['transaction', payment?.transactionId],
    queryFn: () => transactionService.getTransactionById(Number(payment?.transactionId)),
    enabled: !!payment?.transactionId,
  });

  const isLoading = isLoadingPayment || (payment?.transactionId && isLoadingTransaction);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    );
  }

  if (paymentError || !payment) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
        <p className="text-gray-600 mb-4">تعذر تحميل بيانات الدفع</p>
        <Button onClick={() => window.history.back()}>العودة</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">تفاصيل الدفع #{payment.id}</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {/* If we have a related transaction, show the combined view */}
        {transaction ? (
          <TransactionWithPaymentDetails transaction={transaction} />
        ) : (
          /* Otherwise, just show the payment details */
          <PaymentDetailsCard payment={payment} />
        )}

        {/* Action buttons based on payment status */}
        <div className="flex justify-end gap-4 mt-4">
          {payment.status === 'Pending' && (
            <Button
              onClick={() => window.location.href = `/payment/verify/${payment.id}`}
            >
              التحقق من الدفع
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            العودة
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsPage; 