import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import { 
  Transaction, 
  TransactionStatus, 
  getTransactionStatusText, 
  getTransactionTypeText 
} from '@/types/transaction';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatDateTime } from '@/utils/formatters';
import { toast } from 'react-hot-toast';
import { 
  ArrowLeft, 
  CreditCard, 
  Calendar, 
  User, 
  Tag, 
  FileText, 
  AlertCircle 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TransactionDetailsProps {
  transactionId: number;
  onRefund?: () => void;
  showBackButton?: boolean;
}

export const TransactionDetails: React.FC<TransactionDetailsProps> = ({ 
  transactionId, 
  onRefund,
  showBackButton = true
}) => {
  const navigate = useNavigate();

  // Query to fetch transaction details
  const { 
    data: transaction, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['transaction', transactionId],
    queryFn: () => transactionService.getTransactionById(transactionId),
  });

  // Function to handle refund
  const handleRefund = async () => {
    try {
      await transactionService.refundTransaction(transactionId);
      toast.success('تم استرجاع المبلغ بنجاح');
      refetch();
      if (onRefund) onRefund();
    } catch (error: any) {
      toast.error(error.message || 'حدث خطأ أثناء استرجاع المبلغ');
    }
  };

  // Function to get badge color based on status
  const getStatusBadgeColor = (status: TransactionStatus) => {
    switch (status) {
      case TransactionStatus.Completed:
        return 'bg-green-500';
      case TransactionStatus.Pending:
        return 'bg-yellow-500';
      case TransactionStatus.Refunded:
        return 'bg-blue-500';
      case TransactionStatus.Cancelled:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">جاري التحميل...</div>;
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-500">حدث خطأ</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{(error as Error).message}</p>
        </CardContent>
      </Card>
    );
  }

  if (!transaction) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>المعاملة غير موجودة</CardTitle>
        </CardHeader>
        <CardContent>
          <p>لم يتم العثور على المعاملة المطلوبة</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>تفاصيل المعاملة #{transaction.transactionId}</CardTitle>
          <Badge className={getStatusBadgeColor(transaction.status)}>
            {getTransactionStatusText(transaction.status)}
          </Badge>
        </div>
        <CardDescription>
          تم إنشاء المعاملة في {formatDateTime(transaction.createdAt)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-2 space-x-reverse">
            <CreditCard className="h-5 w-5 ml-2" />
            <div>
              <p className="text-sm text-muted-foreground">المبلغ</p>
              <p className="font-medium">{formatCurrency(transaction.amount)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Tag className="h-5 w-5 ml-2" />
            <div>
              <p className="text-sm text-muted-foreground">نوع المعاملة</p>
              <p className="font-medium">{getTransactionTypeText(transaction.type)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <Calendar className="h-5 w-5 ml-2" />
            <div>
              <p className="text-sm text-muted-foreground">تاريخ المعاملة</p>
              <p className="font-medium">{formatDateTime(transaction.transactionDate)}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 space-x-reverse">
            <User className="h-5 w-5 ml-2" />
            <div>
              <p className="text-sm text-muted-foreground">رقم المستخدم</p>
              <p className="font-medium">{transaction.userId}</p>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t">
          <div className="flex items-start space-x-2 space-x-reverse">
            <FileText className="h-5 w-5 ml-2 mt-1" />
            <div>
              <p className="text-sm text-muted-foreground">وصف المعاملة</p>
              <p className="font-medium">{transaction.description}</p>
            </div>
          </div>
        </div>
        
        {transaction.auctionId && (
          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2 space-x-reverse">
              <AlertCircle className="h-5 w-5 ml-2" />
              <div>
                <p className="text-sm text-muted-foreground">رقم المزاد</p>
                <p className="font-medium">{transaction.auctionId}</p>
              </div>
            </div>
          </div>
        )}
        
        {transaction.listingId && (
          <div className="pt-4 border-t">
            <div className="flex items-center space-x-2 space-x-reverse">
              <AlertCircle className="h-5 w-5 ml-2" />
              <div>
                <p className="text-sm text-muted-foreground">رقم المنتج</p>
                <p className="font-medium">{transaction.listingId}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {showBackButton && (
          <Button 
            variant="outline" 
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="ml-2 h-4 w-4" />
            العودة
          </Button>
        )}
        
        {transaction.status === TransactionStatus.Completed && (
          <Button 
            variant="destructive" 
            onClick={handleRefund}
          >
            استرجاع المبلغ
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}; 