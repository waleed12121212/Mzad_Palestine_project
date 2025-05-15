import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bidService, Bid } from '@/services/bidService';
import { Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { auctionService } from '@/services/auctionService';

export const MyBids: React.FC = () => {
  const navigate = useNavigate();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['userBids'],
    queryFn: () => bidService.getUserBids(),
  });
  const bids = Array.isArray(data) ? data : [];

  // New: State to hold auction info for each bid
  const [auctionInfo, setAuctionInfo] = useState<{ [auctionId: number]: any }>({});

  useEffect(() => {
    const fetchAuctions = async () => {
      const ids = [...new Set(bids.map(b => b.auctionId))];
      console.log('MyBids unique auctionIds:', ids);
      const results = await Promise.all(
        ids.map(id => auctionService.getAuctionById(id).catch((e) => { console.log('Error fetching auction', id, e); return null; }))
      );
      console.log('MyBids fetched auctions:', results);
      const info: { [auctionId: number]: any } = {};
      results.forEach((auction, idx) => {
        if (auction) info[ids[idx]] = auction;
      });
      setAuctionInfo(info);
      console.log('MyBids auctionInfo:', info);
    };
    if (bids.length) fetchAuctions();
  }, [bids]);

  console.log('MyBids bids:', bids);

  const handleDeleteBid = async (bidId: number) => {
    try {
      await bidService.deleteBid(bidId);
      toast.success('تم حذف المزايدة بنجاح');
      refetch();
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف المزايدة');
      console.error('Delete bid error:', error);
    }
  };

  const handleAuctionClick = (auctionId: number) => {
    navigate(`/auctions/${auctionId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center py-8">
        حدث خطأ أثناء تحميل المزايدات
      </div>
    );
  }

  if (!bids || bids.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">لا توجد مزايدات حتى الآن</p>
        <Button
          variant="link"
          onClick={() => navigate('/auctions')}
          className="mt-2"
        >
          تصفح المزادات النشطة
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">مزايداتي</h2>
      <div className="space-y-4">
        {bids.map((bid) => {
          const auction = auctionInfo[bid.auctionId];
          return (
            <div key={bid.id} className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex gap-4 items-center">
              {auction && (
                <img
                  src={auction.imageUrl || '/placeholder.svg'}
                  alt={auction.name || 'مزاد'}
                  className="w-20 h-20 object-cover rounded"
                />
              )}
              <div className="flex-1">
                <h3
                  className="text-lg font-semibold cursor-pointer hover:text-blue-500"
                  onClick={() => navigate(`/auctions/${bid.auctionId}`)}
                >
                  {auction ? auction.name : `مزاد #${bid.auctionId}`}
                </h3>
                <p className="text-gray-500 text-sm">
                  {format(new Date(bid.createdAt), 'PPP p', { locale: ar })}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xl font-bold text-blue-500">
                  {bid.bidAmount} ₪
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteBid(bid.id)}
                >
                  <Trash2 className="h-4 w-4 ml-1" />
                  حذف
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}; 