import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { auctionService, AuctionBid } from '@/services/auctionService';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface BidHistoryProps {
  auctionId: number;
  currentUserId?: number;
  bids?: AuctionBid[];
}

export const BidHistory: React.FC<BidHistoryProps> = ({ auctionId, currentUserId, bids: initialBids }) => {
  const queryClient = useQueryClient();
  
  const { data: auctionResponse, isLoading, error } = useQuery({
    queryKey: ['auctionBids', auctionId],
    queryFn: () => auctionService.getAuctionBids(auctionId),
    refetchInterval: 5000,
    staleTime: 2000,
    enabled: !initialBids, // Only fetch if bids weren't provided directly
  });

  // Use provided bids or fetch them
  const bids = initialBids || auctionResponse?.data?.bids;

  // Sort bids by bidTime in descending order
  const sortedBids = bids ? [...bids].sort((a, b) => 
    new Date(b.bidTime).getTime() - new Date(a.bidTime).getTime()
  ) : [];

  if (isLoading && !initialBids) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error && !initialBids) {
    return (
      <div className="text-red-500 text-center py-4">
        حدث خطأ أثناء تحميل تاريخ المزايدات
      </div>
    );
  }

  if (!sortedBids || sortedBids.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        لا توجد مزايدات حتى الآن
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {sortedBids.map((bid) => (
          <div
            key={bid.id}
            className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
              bid.userId === currentUserId
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : 'bg-gray-50 dark:bg-gray-800'
            }`}
          >
            <div className="flex-1 rtl">
              <p className="font-medium">
                {bid.userName || 'مزايد'}
                {bid.userId === currentUserId && (
                  <span className="text-sm text-blue-600 dark:text-blue-400 mr-2">(أنت)</span>
                )}
              </p>
              <p className="text-sm text-gray-500">
                {format(new Date(bid.bidTime), 'PPP p', { locale: ar })}
              </p>
            </div>
            <div className="text-left">
              <p className="font-bold text-lg">{bid.amount} ₪</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 