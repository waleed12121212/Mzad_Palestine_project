import React, { useState } from 'react';
import { TransactionList } from '@/components/transaction/TransactionList';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import { paymentService } from '@/services/paymentService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/formatters';
import { Loader2 } from 'lucide-react';
import PaymentDetailsCard from '@/components/payment/PaymentDetailsCard';

const TransactionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('transactions');

  // Query to fetch total amount
  const { data: totalAmount, isLoading: isLoadingTotal } = useQuery({
    queryKey: ['transactions', 'total'],
    queryFn: transactionService.getTotalAmount,
  });

  // Query to fetch recent payments
  const { data: recentPayments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ['payments', 'user', 'recent'],
    queryFn: paymentService.getUserPayments,
    enabled: activeTab === 'payments',
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">المعاملات المالية</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>إجمالي المعاملات</CardTitle>
            <CardDescription>إجمالي قيمة جميع المعاملات المالية</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingTotal ? 'جاري التحميل...' : formatCurrency(totalAmount || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المدفوعات الأخيرة</CardTitle>
            <CardDescription>عدد المدفوعات المسجلة في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingPayments ? 'جاري التحميل...' : recentPayments ? recentPayments.length : 0}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="transactions" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="transactions">المعاملات المالية</TabsTrigger>
          <TabsTrigger value="payments">المدفوعات</TabsTrigger>
        </TabsList>
        
        <TabsContent value="transactions">
          <TransactionList showFilters={true} />
        </TabsContent>
        
        <TabsContent value="payments">
          {isLoadingPayments ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="mr-2">جاري تحميل المدفوعات...</span>
            </div>
          ) : recentPayments && recentPayments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentPayments.slice(0, 6).map(payment => (
                <div key={payment.id}>
                  <PaymentDetailsCard payment={payment} />
                </div>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-gray-500">لا توجد مدفوعات متاحة</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TransactionsPage; 