import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import TransactionWithPaymentDetails from '@/components/payment/TransactionWithPaymentDetails';

const TransactionDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionService.getTransactionById(Number(id)),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mr-2">جاري التحميل...</span>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">حدث خطأ</h2>
        <p className="text-gray-600 mb-4">تعذر تحميل بيانات المعاملة</p>
        <Button onClick={() => window.history.back()}>العودة</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">تفاصيل المعاملة</h1>
      
      <div className="grid grid-cols-1 gap-6">
        <TransactionWithPaymentDetails transaction={transaction} />
      </div>
    </div>
  );
};

export default TransactionDetailsPage; 