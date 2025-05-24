import React from 'react';
import { Payment } from '@/services/paymentService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Wallet, Banknote, Clock, CheckCircle, AlertTriangle, XCircle, Building2, Truck } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">قيد الانتظار</Badge>;
      case 'Completed':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">مكتمل</Badge>;
      case 'Verified':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">تم التحقق</Badge>;
      case 'Cancelled':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">ملغي</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Pending':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Completed':
      case 'Verified':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Cancelled':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertTriangle className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ar });
    } catch (error) {
      return dateString;
    }
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
              {payment.status === 'Pending' && 'قيد الانتظار'}
              {payment.status === 'Completed' && 'مكتمل'}
              {payment.status === 'Verified' && 'تم التحقق'}
              {payment.status === 'Cancelled' && 'ملغي'}
              {!['Pending', 'Completed', 'Verified', 'Cancelled'].includes(payment.status) && payment.status}
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
    </Card>
  );
};

export default PaymentDetailsCard; 