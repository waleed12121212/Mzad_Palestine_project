import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Payment, paymentService } from '@/services/paymentService';
import { Transaction } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getTransactionStatusText, getTransactionTypeText } from '@/types/transaction';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Loader2, ArrowRight } from 'lucide-react';
import PaymentDetailsCard from './PaymentDetailsCard';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TransactionWithPaymentDetailsProps {
  transaction: Transaction;
}

const TransactionWithPaymentDetails: React.FC<TransactionWithPaymentDetailsProps> = ({ transaction }) => {
  const navigate = useNavigate();
  
  // Fetch payment details if there's a payment ID in the transaction
  const { data: payment, isLoading: isLoadingPayment } = useQuery({
    queryKey: ['payment', transaction.paymentIntentId],
    queryFn: () => paymentService.getPaymentById(Number(transaction.paymentIntentId)),
    enabled: !!transaction.paymentIntentId,
  });

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ar });
    } catch (error) {
      return dateString;
    }
  };

  return (
    <>
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/transactions')}
          className="flex items-center text-primary"
        >
          <ArrowRight className="ml-2 h-4 w-4" />
          العودة إلى قائمة المعاملات
        </Button>
      </div>
    
      <Card className="overflow-hidden">
        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>تفاصيل المعاملة #{transaction.transactionId}</span>
            <Badge 
              variant="outline"
              className={
                transaction.status === 0 ? "bg-yellow-50 text-yellow-700 border-yellow-200" :
                transaction.status === 1 ? "bg-green-50 text-green-700 border-green-200" :
                transaction.status === 2 ? "bg-blue-50 text-blue-700 border-blue-200" :
                "bg-red-50 text-red-700 border-red-200"
              }
            >
              {getTransactionStatusText(transaction.status)}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <Tabs defaultValue="transaction" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="transaction">تفاصيل المعاملة</TabsTrigger>
              <TabsTrigger value="payment" disabled={!payment && !isLoadingPayment}>
                تفاصيل الدفع
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="transaction" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
                  <span className="text-sm text-gray-500">رقم المعاملة</span>
                  <span className="font-medium">{transaction.transactionId}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
                  <span className="text-sm text-gray-500">المبلغ</span>
                  <span className="font-bold">{transaction.amount.toLocaleString()} ₪</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
                <span className="text-sm text-gray-500">نوع المعاملة</span>
                <span className="font-medium">{getTransactionTypeText(transaction.type)}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
                <span className="text-sm text-gray-500">حالة المعاملة</span>
                <span className="font-medium">{getTransactionStatusText(transaction.status)}</span>
              </div>
              
              {transaction.description && (
                <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
                  <span className="text-sm text-gray-500 block mb-1">الوصف</span>
                  <p className="text-sm">{transaction.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transaction.auctionId && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
                    <span className="text-sm text-gray-500">رقم المزاد</span>
                    <span className="font-medium">{transaction.auctionId}</span>
                  </div>
                )}
                
                {transaction.listingId && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
                    <span className="text-sm text-gray-500">رقم المنتج</span>
                    <span className="font-medium">{transaction.listingId}</span>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
                  <span className="text-sm text-gray-500">تاريخ المعاملة</span>
                  <span className="font-medium">{formatDate(transaction.transactionDate)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
                  <span className="text-sm text-gray-500">تاريخ الإنشاء</span>
                  <span className="font-medium">{formatDate(transaction.createdAt)}</span>
                </div>
              </div>
              
              {transaction.paymentIntentId && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
                  <span className="text-sm text-gray-500">رقم عملية الدفع</span>
                  <span className="font-medium">{transaction.paymentIntentId}</span>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="payment">
              {isLoadingPayment ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="mr-2">جاري تحميل تفاصيل الدفع...</span>
                </div>
              ) : payment ? (
                <PaymentDetailsCard payment={payment} showHeader={false} />
              ) : (
                <div className="text-center py-8 text-gray-500">
                  لا توجد معلومات دفع متاحة
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
};

export default TransactionWithPaymentDetails; 