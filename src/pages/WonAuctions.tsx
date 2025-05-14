import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { auctionService } from '@/services/auctionService';
import { bidService, Bid } from '@/services/bidService';
import { paymentService } from '@/services/paymentService';
import { transactionService } from '@/services/transactionService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

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
}

// Utility for formatting currency
const formatCurrency = (amount: number) => `${amount.toLocaleString()} ₪`;

const WonAuctions: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch closed auctions and determine winners
  const { data: wonAuctions, isLoading, error } = useQuery({
    queryKey: ['wonAuctions'],
    queryFn: async () => {
      const response = await auctionService.getClosedAuctions();
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
        endTime: auction.endTime ?? auction.EndTime,
      }));

      return normalizedAuctions.filter((auction: WonAuction) => auction.winnerName === user?.username);
    },
    enabled: !!user,
  });

  // Handle payment initiation
  const handleInitiatePayment = async (auctionId: number) => {
    try {
      const wonAuction = wonAuctions?.find((a: WonAuction) => (a.id || a.auctionId) === auctionId);
      if (!wonAuction) {
        throw new Error('Auction not found');
      }

      // 1. Create transaction
      const transaction = await transactionService.createTransaction({
        amount: wonAuction.currentBid || wonAuction.currentPrice || wonAuction.reservePrice || 0,
        transactionType: 'Payment',
        description: `Payment for auction #${auctionId}`,
      });

      // 2. Create payment with the transactionId from the transaction
      const payment = await paymentService.createPayment({
        auctionId: auctionId,
        amount: transaction.amount,
        method: 'CreditCard',
        transactionId: String(transaction.transactionId),
        notes: transaction.description,
      });

      // 3. Navigate to payment page
      navigate(`/payment/${payment.id}`);
    } catch (error) {
      toast.error('حدث خطأ أثناء بدء عملية الدفع');
      console.error('Payment error:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center min-h-screen">جاري التحميل...</div>;
  }

  if (error) {
    return <div className="flex justify-center items-center min-h-screen">حدث خطأ أثناء تحميل المزادات الفائزة</div>;
  }

  if (!wonAuctions?.length) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">المزادات الفائزة</h1>
        <p>لم تفز بأي مزاد بعد.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">المزادات الفائزة</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wonAuctions.map((auction: WonAuction) => (
          <Card key={auction.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{auction.name}</CardTitle>
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
                  <span className="font-semibold">الحالة:</span>{' '}
                  قيد الدفع
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                onClick={() => handleInitiatePayment(auction.id || auction.auctionId || 0)}
              >
                إكمال الدفع
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(`/auction/${auction.id || auction.auctionId}`)}
              >
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