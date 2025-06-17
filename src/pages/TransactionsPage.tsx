import React, { useState, useEffect } from 'react';
import { TransactionList } from '@/components/transaction/TransactionList';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import { paymentService, Payment } from '@/services/paymentService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/utils/formatters';
import { Loader2, Search, CreditCard, ChevronLeft, ChevronRight, Filter, Calendar, ExternalLink, ArrowRight } from 'lucide-react';
import PaymentDetailsCard from '@/components/payment/PaymentDetailsCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

const TransactionsPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('transactions');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'card' | 'compact'>('compact');
  const paymentsPerPage = 10;
  
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
    staleTime: 0, // Always refetch when we switch to the payments tab
    refetchOnWindowFocus: true,
  });

  // Filter and search payments
  const filteredPayments = recentPayments
    ? recentPayments
        .filter(payment => {
          if (statusFilter === 'all') return true;
          if (statusFilter === 'pending') 
            return payment.status === 'Pending' || payment.status === '0' || Number(payment.status) === 0;
          if (statusFilter === 'completed') 
            return payment.status === 'Completed' || payment.status === '1' || Number(payment.status) === 1;
          if (statusFilter === 'cancelled') 
            return payment.status === 'Cancelled' || payment.status === '3' || Number(payment.status) === 3;
          return true;
        })
        .filter(payment => {
          if (!searchTerm) return true;
          const searchLower = searchTerm.toLowerCase();
          return (
            (payment.id?.toString().includes(searchLower)) ||
            (payment.notes?.toLowerCase().includes(searchLower)) ||
            (payment.transactionId?.toString().includes(searchLower)) ||
            (payment.amount?.toString().includes(searchLower))
          );
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    : [];

  // Pagination
  const totalPages = Math.ceil((filteredPayments?.length || 0) / paymentsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (currentPage - 1) * paymentsPerPage,
    currentPage * paymentsPerPage
  );

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  // Format date helper
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm', { locale: ar });
    } catch (error) {
      return dateString;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string | number) => {
    if (status === 'Pending' || status === '0' || Number(status) === 0) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">قيد الانتظار</Badge>;
    } else if (status === 'Completed' || status === '1' || Number(status) === 1) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">مكتمل</Badge>;
    } else if (status === '2' || Number(status) === 2) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">قيد المعالجة</Badge>;
    } else if (status === 'Cancelled' || status === '3' || Number(status) === 3) {
      return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">ملغي</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  // Render compact payment row
  const renderCompactPaymentRow = (payment: Payment) => (
    <div 
      key={payment.id}
      className="grid grid-cols-7 gap-2 p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 border-b"
    >
      <div className="font-medium">{payment.id}</div>
      <div className="font-bold">{payment.amount.toLocaleString()} ₪</div>
      <div className="truncate">{payment.notes?.replace('Payment for: ', '') || '-'}</div>
      <div>{getStatusBadge(payment.status)}</div>
      <div>{payment.paymentMethod || <span className="text-gray-400">غير محدد</span>}</div>
      <div>{formatDate(payment.createdAt)}</div>
      <div className="flex justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 px-2"
          onClick={(e) => {
            navigate(payment.transactionId ? `/transactions/${payment.transactionId}` : `/payment/${payment.id}`);
          }}
          title="عرض تفاصيل المعاملة"
        >
          <span>التفاصيل</span>
          <ExternalLink className="h-4 w-4" />
        </Button>
        {/* Check if payment status indicates pending/incomplete */}
{(payment.status === 'Pending' || 
  payment.status === '0' ||  
  Number(payment.status) === 0) && (
  <Button
    variant="default"
    size="sm"
    className="flex items-center gap-1 px-2"
    onClick={() => {
      navigate(`/payment/${payment.id}`);
    }}
    title="اكمال عملية الدفع"
  >
    <span>اكمال الدفع</span>
    <ArrowRight className="h-4 w-4" />
  </Button>
)}
      </div>
    </div>
  );

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
            <CardTitle>المدفوعات</CardTitle>
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
            <div className="space-y-4">
              {/* Filters and Search */}
              <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="البحث في المدفوعات..."
                    className="pl-2 pr-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-[180px] flex gap-2">
                    <Filter className="h-4 w-4" />
                    <SelectValue placeholder="تصفية حسب الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="completed">مكتمل</SelectItem>
                    <SelectItem value="cancelled">ملغي</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Button 
                    variant={viewMode === 'compact' ? 'default' : 'outline'} 
                    className="w-24"
                    onClick={() => setViewMode('compact')}
                  >
                    مختصر
                  </Button>
                  <Button 
                    variant={viewMode === 'card' ? 'default' : 'outline'} 
                    className="w-24"
                    onClick={() => setViewMode('card')}
                  >
                    بطاقات
                  </Button>
                </div>
              </div>

              {/* Results Stats */}
              <div className="text-sm text-gray-500 mb-2">
                إظهار {paginatedPayments.length} من {filteredPayments.length} مدفوعات
              </div>

              {/* Compact View */}
              {viewMode === 'compact' && (
                <Card>
                  <CardContent className="p-0">
                    {/* Table Header */}
                    <div className="grid grid-cols-7 gap-2 bg-gray-50 dark:bg-gray-800/50 p-3 font-semibold border-b">
                      <div>رقم الدفع</div>
                      <div>المبلغ</div>
                      <div>الوصف</div>
                      <div>الحالة</div>
                      <div>طريقة الدفع</div>
                      <div>التاريخ</div>
                      <div className="text-center">الاجراءات</div>
                    </div>
                    {/* Payment Rows */}
                    {paginatedPayments.map(renderCompactPaymentRow)}
                    
                    {/* Empty State */}
                    {paginatedPayments.length === 0 && (
                      <div className="p-8 text-center text-gray-500">
                        لا توجد مدفوعات تطابق معايير البحث
                      </div>
                    )}
                  </CardContent>
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <CardFooter className="flex justify-between p-4 border-t">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronRight className="h-4 w-4 ml-1" />
                        السابق
                      </Button>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">الصفحة</span>
                        <span className="font-medium">{currentPage}</span>
                        <span className="text-sm">من</span>
                        <span className="font-medium">{totalPages}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        التالي
                        <ChevronLeft className="h-4 w-4 mr-1" />
                      </Button>
                    </CardFooter>
                  )}
                </Card>
              )}

              {/* Card View */}
              {viewMode === 'card' && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {paginatedPayments.map(payment => (
                      <div key={payment.id}>
                        <PaymentDetailsCard payment={payment} />
                      </div>
                    ))}
                  </div>
                  
                  {/* Empty State */}
                  {paginatedPayments.length === 0 && (
                    <Card>
                      <CardContent className="py-8 text-center">
                        <p className="text-gray-500">لا توجد مدفوعات تطابق معايير البحث</p>
                      </CardContent>
                    </Card>
                  )}
                  
                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-between items-center mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronRight className="h-4 w-4 ml-1" />
                        السابق
                      </Button>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">الصفحة</span>
                        <span className="font-medium">{currentPage}</span>
                        <span className="text-sm">من</span>
                        <span className="font-medium">{totalPages}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        التالي
                        <ChevronLeft className="h-4 w-4 mr-1" />
                      </Button>
                    </div>
                  )}
                </>
              )}
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