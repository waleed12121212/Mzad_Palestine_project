import React from 'react';
import { Payment } from '@/services/paymentService';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CreditCard, Wallet, Banknote, Clock, CheckCircle, AlertTriangle, XCircle, Building2, Truck, ExternalLink, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

interface PaymentDetailsCardProps {
  payment: Payment;
  showHeader?: boolean;
  className?: string;
}

const PaymentDetailsCard: React.FC<PaymentDetailsCardProps> = ({ 
  payment, 
  showHeader = true,
  className = ''
}) => {
  const navigate = useNavigate();

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'CreditCard':
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case 'PayPal':
        return <Wallet className="h-5 w-5 text-blue-500" />;
      case 'BankTransfer':
        return <Building2 className="h-5 w-5 text-blue-500" />;
      case 'CashOnDelivery':
        return <Truck className="h-5 w-5 text-green-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string | number): string => {
    // Handle numeric status
    if (typeof status === 'number' || !isNaN(Number(status))) {
      switch (Number(status)) {
        case 0:
          return 'قيد الانتظار';
        case 1:
          return 'مكتمل';
        case 2:
          return 'مسترجع';
        case 3:
          return 'ملغي';
        default:
          return 'غير معروف';
      }
    }
    
    // Handle string status
    switch (status) {
      case 'Pending':
        return 'قيد الانتظار';
      case 'Completed':
        return 'مكتمل';
      case 'Verified':
        return 'تم التحقق';
      case 'Cancelled':
        return 'ملغي';
      default:
        return status;
    }
  };

  const getStatusBadge = (status: string | number) => {
    const statusText = getStatusText(status);
    const statusNumber = typeof status === 'number' ? status : Number(status);
    
    let className = '';
    if (statusText === 'قيد الانتظار' || status === 'Pending' || statusNumber === 0) {
      className = "bg-yellow-50 text-yellow-700 border-yellow-200";
    } else if (statusText === 'مكتمل' || status === 'Completed' || statusNumber === 1) {
      className = "bg-green-50 text-green-700 border-green-200";
    } else if (statusText === 'تم التحقق' || status === 'Verified') {
      className = "bg-blue-50 text-blue-700 border-blue-200";
    } else if (statusText === 'ملغي' || status === 'Cancelled' || statusNumber === 3) {
      className = "bg-red-50 text-red-700 border-red-200";
    }
    
    return <Badge variant="outline" className={className}>{statusText}</Badge>;
  };

  const getStatusIcon = (status: string | number) => {
    const statusText = getStatusText(status);
    const statusNumber = typeof status === 'number' ? status : Number(status);
    
    if (statusText === 'قيد الانتظار' || status === 'Pending' || statusNumber === 0) {
      return <Clock className="h-5 w-5 text-yellow-500" />;
    } else if (statusText === 'مكتمل' || status === 'Completed' || statusNumber === 1 || statusText === 'تم التحقق' || status === 'Verified') {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (statusText === 'ملغي' || status === 'Cancelled' || statusNumber === 3) {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
    return <AlertTriangle className="h-5 w-5 text-gray-500" />;
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ar });
    } catch (error) {
      return dateString;
    }
  };

  const isPaymentPending = () => {
    const statusText = getStatusText(payment.status);
    const statusNumber = typeof payment.status === 'number' ? payment.status : Number(payment.status);
    return statusText === 'قيد الانتظار' || payment.status === 'Pending' || statusNumber === 0;
  };

  const handleCompletePayment = () => {
    navigate(`/payment/${payment.id}`);
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      {showHeader && (
        <CardHeader className="bg-gray-50 dark:bg-gray-800/50 pb-3">
          <CardTitle className="text-lg flex items-center justify-between">
            <span>تفاصيل الدفع</span>
            {getStatusBadge(payment.status)}
          </CardTitle>
        </CardHeader>
      )}
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
              <span className="text-sm text-gray-500">رقم الدفع</span>
              <span className="font-medium">{payment.id}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
              <span className="text-sm text-gray-500">المبلغ</span>
              <span className="font-bold">{payment.amount.toLocaleString()} ₪</span>
            </div>
          </div>

          {payment.transactionId && (
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
              <span className="text-sm text-gray-500">رقم المعاملة</span>
              <Button 
                variant="link" 
                className="font-medium flex items-center p-0 h-auto"
                onClick={() => navigate(`/transactions/${payment.transactionId}`)}
              >
                {payment.transactionId}
                <ExternalLink className="h-3 w-3 mr-1" />
              </Button>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
            <div className="flex items-center">
              <span className="text-sm text-gray-500 ml-2">طريقة الدفع</span>
              {getPaymentMethodIcon(payment.method)}
            </div>
            <span className="font-medium">
              {payment.method === 'CreditCard' && 'بطاقة ائتمان'}
              {payment.method === 'PayPal' && 'باي بال'}
              {payment.method === 'BankTransfer' && 'تحويل بنكي'}
              {payment.method === 'CashOnDelivery' && 'الدفع عند الاستلام'}
              {!['CreditCard', 'PayPal', 'BankTransfer', 'CashOnDelivery'].includes(payment.method) && payment.method}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
            <div className="flex items-center">
              <span className="text-sm text-gray-500 ml-2">الحالة</span>
              {getStatusIcon(payment.status)}
            </div>
            <span className="font-medium">
              {getStatusText(payment.status)}
            </span>
          </div>

          {payment.notes && (
            <div className="p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
              <span className="text-sm text-gray-500 block mb-1">ملاحظات</span>
              <p className="text-sm">{payment.notes}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
              <span className="text-sm text-gray-500">تاريخ الإنشاء</span>
              <span className="font-medium">{formatDate(payment.createdAt)}</span>
            </div>
            {payment.updatedAt && (
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/30 rounded-md">
                <span className="text-sm text-gray-500">تاريخ التحديث</span>
                <span className="font-medium">{formatDate(payment.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
      {isPaymentPending() && (
        <CardFooter className="bg-gray-50 dark:bg-gray-800/30 px-4 py-3 border-t">
          <Button 
            onClick={handleCompletePayment} 
            className="w-full"
            variant="default"
          >
            اكمال الدفع
            <ArrowRight className="h-4 w-4 mr-2" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PaymentDetailsCard; 