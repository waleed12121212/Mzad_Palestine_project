import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { bidService, Bid } from '@/services/bidService';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface BidHistoryProps {
  auctionId: number;
  currentUserId?: number;
}

export const BidHistory: React.FC<BidHistoryProps> = ({ auctionId, currentUserId }) => {
  const queryClient = useQueryClient();
  
  const { data: bids, isLoading, error } = useQuery({
    queryKey: ['auctionBids', auctionId],
    queryFn: () => bidService.getAuctionBids(auctionId),
    refetchInterval: 5000,
    staleTime: 2000,
    select: (data) => data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-4">
        حدث خطأ أثناء تحميل تاريخ المزايدات
      </div>
    );
  }

  if (!bids || bids.length === 0) {
    return (
      <div className="text-gray-500 text-center py-4">
        لا توجد مزايدات حتى الآن
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">تاريخ المزايدات</h3>
      <div className="space-y-2">
        {bids.map((bid) => (
          <div
            key={bid.id}
            className={`flex justify-between items-center p-3 rounded-lg transition-colors ${
              bid.userId === currentUserId
                ? 'bg-blue-50 dark:bg-blue-900/20'
                : 'bg-gray-50 dark:bg-gray-800'
            }`}
          >
            <div className="flex-1">
              <p className="font-medium">
                {bid.userName || 'مزايد'}
                {bid.userId === currentUserId && (
                  <span className="text-sm text-blue-600 dark:text-blue-400 mr-2">(أنت)</span>
                )}
              </p>
              <p className="text-sm text-gray-500">
                {format(new Date(bid.createdAt), 'PPP p', { locale: ar })}
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">{bid.bidAmount} ₪</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 