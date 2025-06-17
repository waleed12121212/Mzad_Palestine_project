import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { auctionService } from '@/services/auctionService';
import { bidService } from '@/services/bidService';
import { paymentService } from '@/services/paymentService';
import { transactionService } from '@/services/transactionService';
import { TransactionType, TransactionStatus } from '@/types/transaction';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { Loader2, CreditCard, ExternalLink, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface WonAuction {
  id?: number;
  auctionId?: number;
  winnerName?: string;
  currentBid?: number;
  currentPrice?: number;
  reservePrice?: number;
  name?: string;
  endTime: string;
  listingId?: number;
  startTime?: string;
  bidIncrement?: number;
  imageUrl?: string;
  paymentStatus?: 'pending' | 'completed' | 'failed';
  status?: 'Open' | 'Close' | 'Pending';
  bids?: any[];
}

// Utility for formatting currency
const formatCurrency = (amount: number) => `${amount.toLocaleString()} ₪`;

// Loading skeleton component
const AuctionCardSkeleton = () => (
  <Card className="flex flex-col">
    <Skeleton className="h-48 w-full rounded-t-lg" />
    <CardHeader>
      <Skeleton className="h-6 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="flex-grow">
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </CardContent>
    <CardFooter className="flex justify-between">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </CardFooter>
  </Card>
);

// Status badge component
const StatusBadge = ({ status }: { status: string }) => {
  const statusConfig = {
    Open: {
      icon: <Clock className="w-4 h-4 mr-1" />,
      bgColor: 'bg-blue-100 text-blue-800',
      text: 'مفتوح'
    },
    Close: {
      icon: <CheckCircle className="w-4 h-4 mr-1" />,
      bgColor: 'bg-green-100 text-green-800',
      text: 'مغلق'
    },
    Pending: {
      icon: <AlertCircle className="w-4 h-4 mr-1" />,
      bgColor: 'bg-yellow-100 text-yellow-800',
      text: 'قيد الانتظار'
    }
  };

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;

  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.bgColor}`}>
      {config.icon}
      {config.text}
    </span>
  );
};

const WonAuctions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch closed auctions and determine winners
  const { data: wonAuctions, isLoading, error } = useQuery({
    queryKey: ['wonAuctions'],
    queryFn: async () => {
      const response = await auctionService.getCompletedAuctions();
      const auctions = Array.isArray(response) ? response : (response as { data: any[] }).data;
      
      // Normalize the data
      const normalizedAuctions = auctions.map(auction => ({
        ...auction,
        id: Number(auction.id ?? auction.auctionId ?? auction.AuctionId),
        auctionId: Number(auction.auctionId ?? auction.AuctionId),
        currentBid: Number(auction.currentBid ?? auction.CurrentBid ?? 0),
        currentPrice: Number(auction.currentPrice ?? auction.CurrentPrice ?? 0),
        reservePrice: Number(auction.reservePrice ?? auction.ReservePrice ?? 0),
        winnerName: auction.winnerName ?? auction.WinnerName,
        name: auction.name ?? auction.Name ?? auction.title ?? auction.Title,
        endTime: auction.endTime ?? auction.EndTime ?? auction.endDate,
        imageUrl: auction.imageUrl ?? auction.ImageUrl ?? (auction.images && auction.images[0]),
        paymentStatus: auction.paymentStatus ?? 'pending',
        status: auction.status ?? 'Close',
        bids: auction.bids || [],
      }));

      // تحديد المزادات الفائزة للمستخدم الحالي
      const userId = String(user?.id);
      return normalizedAuctions.filter((auction: any) => {
        if (auction.status?.toLowerCase() !== 'closed' && auction.status?.toLowerCase() !== 'close') return false;
        if (!auction.bids || !auction.bids.length) return false;
        // أعلى مزايدة
        const topBid = auction.bids.reduce((max: any, bid: any) => (Number(bid.bidAmount ?? bid.amount ?? 0) > Number(max.bidAmount ?? max.amount ?? 0) ? bid : max), auction.bids[0]);
        return String(topBid.userId) === userId;
      });
    },
    enabled: !!user,
  });

  // Handle payment initiation
  const handleInitiatePayment = async (auctionId: number) => {
    try {
      const wonAuction = wonAuctions?.find((a: WonAuction) => (a.id || a.auctionId) === auctionId);
      if (!wonAuction) {
        throw new Error('المزاد غير موجود');
      }

      const amount = wonAuction.currentBid || wonAuction.currentPrice || wonAuction.reservePrice || 0;
      
      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error('قيمة المزايدة غير صحيحة');
      }

      // 1. Create transaction with proper validation
      const transactionData = {
        amount: amount,
        type: TransactionType.AuctionPayment,
        description: `${wonAuction.name}`,
        auctionId: auctionId
      };

      console.log('Creating transaction with data:', transactionData);
      const transaction = await transactionService.createTransaction(transactionData);

      if (!transaction || !transaction.transactionId) {
        throw new Error('فشل في إنشاء المعاملة');
      }

      console.log('Transaction created:', transaction);

      // 2. Create payment with the transaction ID
      const paymentData = {
        auctionId: auctionId,
        amount: amount,
        paymentMethod: 'CreditCard',
        notes: `${wonAuction.name}`,
        transactionId: transaction.transactionId.toString()
      };

      console.log('Creating payment with data:', paymentData);
      const payment = await paymentService.createAuctionPayment(paymentData);

      if (!payment || !payment.id) {
        throw new Error('فشل في إنشاء الدفع');
      }

      console.log('Payment created:', payment);
      
      // Store clientSecret in localStorage if available
      if (payment.clientSecret) {
        console.log('Storing clientSecret in localStorage');
        localStorage.setItem(`payment_${payment.id}_clientSecret`, payment.clientSecret);
      }

      // 3. Navigate to payment page
      navigate(`/payment/${payment.id}`);
    } catch (error: any) {
      console.error('Payment error:', error);
      toast.error(error.message || 'حدث خطأ أثناء بدء عملية الدفع');
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">المزادات الفائزة</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, index) => (
            <AuctionCardSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">المزادات الفائزة</h1>
          <p className="text-lg text-red-500">حدث خطأ أثناء تحميل المزادات الفائزة</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            إعادة المحاولة
          </Button>
        </div>
      </div>
    );
  }

  if (!wonAuctions?.length) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">المزادات الفائزة</h1>
          <p className="text-lg text-gray-500">لم تفز بأي مزاد بعد.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => navigate('/auctions')}
          >
            تصفح المزادات
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">المزادات الفائزة</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wonAuctions.map((auction: WonAuction) => (
          <Card key={auction.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow">
            {auction.imageUrl && (
              <div className="relative h-48 w-full">
                <img
                  src={auction.imageUrl}
                  alt={auction.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2">
                  <StatusBadge status={auction.status || 'Close'} />
                </div>
              </div>
            )}
            <CardHeader>
              <CardTitle className="line-clamp-2">{auction.name}</CardTitle>
              <CardDescription>
                فزت بها بتاريخ {format(new Date(auction.endTime), 'yyyy/MM/dd')}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-semibold">قيمة المزايدة الفائزة:</span>{' '}
                  {formatCurrency(auction.currentBid || auction.currentPrice || auction.reservePrice || 0)}
                </p>
                <p className="text-sm">
                  <span className="font-semibold">حالة الدفع:</span>{' '}
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    auction.paymentStatus === 'completed' 
                      ? 'bg-green-100 text-green-800' 
                      : auction.paymentStatus === 'failed'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {auction.paymentStatus === 'completed' 
                      ? 'تم الدفع' 
                      : auction.paymentStatus === 'failed'
                      ? 'فشل الدفع'
                      : 'قيد الدفع'}
                  </span>
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between gap-2">
              {auction.paymentStatus !== 'completed' && (
                <Button
                  onClick={() => handleInitiatePayment(auction.id || auction.auctionId || 0)}
                  className="flex-1"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  إكمال الدفع
                </Button>
              )}
              <Button
                variant="outline"
                onClick={() => navigate(`/auction/${auction.id || auction.auctionId}`)}
                className="flex-1"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                عرض التفاصيل
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WonAuctions; 