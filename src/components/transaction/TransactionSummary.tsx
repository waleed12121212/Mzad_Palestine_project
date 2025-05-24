import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { transactionService } from '@/services/transactionService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/utils/formatters';
import { Skeleton } from '@/components/ui/skeleton';
import { CreditCard } from 'lucide-react';

interface TransactionSummaryProps {
  title?: string;
  description?: string;
}

export const TransactionSummary: React.FC<TransactionSummaryProps> = ({
  title = 'إجمالي المعاملات',
  description = 'إجمالي قيمة جميع المعاملات المالية'
}) => {
  // Query to fetch total amount
  const { data: totalAmount, isLoading } = useQuery({
    queryKey: ['transactions', 'total'],
    queryFn: transactionService.getTotalAmount,
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <CreditCard className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-10 w-[100px]" />
        ) : (
          <div className="text-2xl font-bold">{formatCurrency(totalAmount || 0)}</div>
        )}
      </CardContent>
    </Card>
  );
}; 