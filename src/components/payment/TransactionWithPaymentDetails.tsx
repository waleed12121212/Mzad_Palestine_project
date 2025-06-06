import React, { useState } from 'react';
import { Transaction, TransactionType } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { getTransactionStatusText, getTransactionTypeText } from '@/types/transaction';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { ArrowRight, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface TransactionWithPaymentDetailsProps {
  transaction: Transaction;
}

const TransactionWithPaymentDetails: React.FC<TransactionWithPaymentDetailsProps> = ({ transaction }) => {
  const navigate = useNavigate();
  const [activeTab] = useState<string>("transaction");
  
  // Log transaction for debugging
  console.log('Transaction details:', transaction);
  
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ar });
    } catch (error) {
      return dateString;
    }
  };

  // Helper function to determine if this is a listing payment
  const isListingPayment = () => {
    const typeText = getTransactionTypeText(transaction.type);
    return typeText === "دفع منتج";
  };

  // Helper function to navigate to auction or listing detail
  const navigateToItem = (type: string, id: number) => {
    if (type === "دفع منتج" || transaction.type === TransactionType.ListingPayment) {
      navigate(`/listing/${id}`);
    } else {
      navigate(`/auction/${id}`);
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
            <TabsList className="grid w-full grid-cols-1 mb-4">
              <TabsTrigger value="transaction">تفاصيل المعاملة</TabsTrigger>
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
                    <span className="text-sm text-gray-500">
                      {isListingPayment() ? "رقم المنتج" : "رقم المزاد"}
                    </span>
                    <Button 
                      variant="link" 
                      className="font-medium flex items-center p-0 h-auto"
                      onClick={() => navigateToItem(getTransactionTypeText(transaction.type), transaction.auctionId)}
                    >
                      {transaction.auctionId}
                      <ExternalLink className="h-3 w-3 mr-1" />
                    </Button>
                  </div>
                )}
                
                {transaction.listingId && (
                  <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
                    <span className="text-sm text-gray-500">رقم المنتج</span>
                    <Button 
                      variant="link" 
                      className="font-medium flex items-center p-0 h-auto"
                      onClick={() => navigate(`/listing/${transaction.listingId}`)}
                    >
                      {transaction.listingId}
                      <ExternalLink className="h-3 w-3 mr-1" />
                    </Button>
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
              
              {transaction.paymentIntentId && transaction.paymentIntentId !== "null" && transaction.paymentIntentId !== "undefined" && transaction.paymentIntentId.trim() !== "" && (
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
                  <span className="text-sm text-gray-500">رقم عملية الدفع</span>
                  <Button 
                    variant="link" 
                    className="font-medium flex items-center p-0 h-auto"
                    onClick={() => navigate(`/payment/${transaction.paymentIntentId}`)}
                  >
                    {transaction.paymentIntentId}
                    <ExternalLink className="h-3 w-3 mr-1" />
                  </Button>
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