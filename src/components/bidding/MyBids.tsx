import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { bidService, Bid } from '@/services/bidService';
import { Loader2, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

export const MyBids: React.FC = () => {
  const navigate = useNavigate();
  const { data: bids, isLoading, error, refetch } = useQuery({
    queryKey: ['userBids'],
    queryFn: () => bidService.getUserBids(),
  });

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
        {bids.map((bid) => (
          <div
            key={bid.id}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-4"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3
                  className="text-lg font-semibold cursor-pointer hover:text-blue-500"
                  onClick={() => handleAuctionClick(bid.auctionId)}
                >
                  {bid.auctionTitle || 'مزاد'}
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
          </div>
        ))}
      </div>
    </div>
  );
}; 