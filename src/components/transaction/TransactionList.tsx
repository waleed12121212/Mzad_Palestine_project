import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { 
  Transaction, 
  TransactionStatus, 
  TransactionType,
  getTransactionStatusText, 
  getTransactionTypeText 
} from '@/types/transaction';
import { transactionService } from '@/services/transactionService';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { RefreshCw } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatCurrency } from '@/utils/formatters';

interface TransactionListProps {
  userId?: number;
  auctionId?: number;
  listingId?: number;
  showFilters?: boolean;
}

// دالة لتحويل الأرقام العربية إلى إنجليزية
function toEnglishDigits(strOrNum: string | number | undefined | null) {
  if (strOrNum === undefined || strOrNum === null) return '';
  return strOrNum
    .toString()
    .replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);
}

// خرائط تحويل القيم النصية للفلترة
const statusMap: Record<string, string> = {
  "Pending": "Pending",
  "Completed": "Completed",
  "Refunded": "Refunded",
  "Cancelled": "Cancelled"
};

const typeMap: Record<string, string> = {
  "AuctionPayment": "AuctionPayment",
  "ListingPayment": "ListingPayment",
  "Refund": "Refund"
};

export const TransactionList: React.FC<TransactionListProps> = ({
  userId,
  auctionId,
  listingId,
  showFilters = true,
}) => {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string | undefined>(undefined);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);

  // Function to determine which query to use
  const getTransactionQuery = () => {
    if (auctionId) {
      return ['transactions', 'auction', auctionId];
    } else if (listingId) {
      return ['transactions', 'listing', listingId];
    } else if (userId) {
      return ['transactions', 'user', userId];
    } else if (status || type || startDate || endDate) {
      return ['transactions', 'filtered', status, type, startDate, endDate];
    } else {
      return ['transactions', 'user'];
    }
  };

  // Function to fetch transactions based on props
  const fetchTransactions = async (): Promise<Transaction[]> => {
    if (auctionId) {
      return transactionService.getAuctionTransactions(auctionId);
    } else if (listingId) {
      return transactionService.getListingTransactions(listingId);
    } else if ((status && status !== 'all') || (type && type !== 'all') || startDate || endDate) {
      const params: any = {};
      if (status && status !== 'all') params.status = statusMap[status] || status;
      if (type && type !== 'all') params.type = typeMap[type] || type;
      if (startDate) params.startDate = format(startDate, 'yyyy-MM-dd');
      if (endDate) params.endDate = format(endDate, 'yyyy-MM-dd');
      return transactionService.filterTransactions(params);
    } else {
      return transactionService.getUserTransactions();
    }
  };

  // Query to fetch transactions
  const { data: transactions, isLoading, isError, error, refetch } = useQuery({
    queryKey: getTransactionQuery(),
    queryFn: fetchTransactions,
  });

  // Function to handle refund
  const handleRefund = async (transactionId: number) => {
    try {
      await transactionService.refundTransaction(transactionId);
      toast.success('تم استرجاع المبلغ بنجاح');
      refetch();
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

  const formatDateTime = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy hh:mm a', { locale: ar });
    } catch (error) {
      return dateString;
    }
  };

  if (isLoading) {
    return <div className="flex justify-center p-4">جاري التحميل...</div>;
  }

  if (isError) {
    return <div className="text-red-500 p-4">حدث خطأ: {(error as Error).message}</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>المعاملات المالية</CardTitle>
        <CardDescription>قائمة بجميع المعاملات المالية</CardDescription>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="flex flex-wrap gap-4 mb-4">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="حالة المعاملة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="Pending">قيد الانتظار</SelectItem>
                <SelectItem value="Completed">مكتمل</SelectItem>
                <SelectItem value="Refunded">مسترجع</SelectItem>
                <SelectItem value="Cancelled">ملغي</SelectItem>
              </SelectContent>
            </Select>

            <Select value={type} onValueChange={setType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="النوع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">الكل</SelectItem>
                <SelectItem value="AuctionPayment">دفع مزاد</SelectItem>
                <SelectItem value="ListingPayment">دفع منتج</SelectItem>
              </SelectContent>
            </Select>

            <DatePicker
              date={startDate}
              onSelect={setStartDate}
              placeholder="تاريخ البداية"
            />

            <DatePicker
              date={endDate}
              onSelect={setEndDate}
              placeholder="تاريخ النهاية"
            />

            <Button onClick={() => refetch()} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        )}

        <Table>
          <TableCaption>قائمة المعاملات المالية</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>رقم المعاملة</TableHead>
              <TableHead>المبلغ</TableHead>
              <TableHead>النوع</TableHead>
              <TableHead>الحالة</TableHead>
              <TableHead>التاريخ</TableHead>
              <TableHead>الوصف</TableHead>
              <TableHead>الإجراءات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <TableRow key={transaction.transactionId}>
                  <TableCell>{toEnglishDigits(transaction.transactionId)}</TableCell>
                  <TableCell>{toEnglishDigits(formatCurrency(transaction.amount))}</TableCell>
                  <TableCell>{getTransactionTypeText(transaction.type)}</TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeColor(transaction.status)}>
                      {getTransactionStatusText(transaction.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {toEnglishDigits(formatDateTime(transaction.transactionDate))}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Link to={`/transactions/${transaction.transactionId}`}>
                        <Button variant="outline" size="sm" className="ml-2">
                          التفاصيل
                        </Button>
                      </Link>
                      {transaction.status === TransactionStatus.Completed && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRefund(transaction.transactionId)}
                        >
                          استرجاع
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  لا توجد معاملات مالية
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}; 