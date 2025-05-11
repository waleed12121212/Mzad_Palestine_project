import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { bidService } from '@/services/bidService';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

interface BidFormProps {
  auctionId: number;
  currentPrice: number;
  bidIncrement: number;
  isAuctionActive: boolean;
}

interface BidFormData {
  bidAmount: number;
}

export const BidForm: React.FC<BidFormProps> = ({
  auctionId,
  currentPrice,
  bidIncrement,
  isAuctionActive,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BidFormData>();

  const onSubmit = async (data: BidFormData) => {
    if (!isAuctionActive) {
      toast.error('المزاد غير نشط حالياً');
      return;
    }

    const minBidAmount = currentPrice + bidIncrement;
    if (data.bidAmount < minBidAmount) {
      toast.error(`يجب أن تكون المزايدة على الأقل ${minBidAmount} ₪`);
      return;
    }

    try {
      setIsSubmitting(true);
      await bidService.createBid({
        auctionId,
        bidAmount: data.bidAmount,
      });
      toast.success('تم تقديم المزايدة بنجاح');
      reset();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          toast.error('يرجى تسجيل الدخول أولاً');
        } else if (error.response?.status === 400) {
          toast.error(error.response.data.message || 'قيمة المزايدة غير صالحة');
        } else if (error.response?.status === 403) {
          toast.error('لا يمكنك المزايدة على مزادك الخاص');
        } else {
          toast.error('حدث خطأ أثناء تقديم المزايدة');
        }
      } else {
        toast.error('حدث خطأ غير متوقع');
      }
      console.error('Bid error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input
          type="number"
          step="0.01"
          placeholder="أدخل قيمة المزايدة"
          {...register('bidAmount', {
            required: 'هذا الحقل مطلوب',
            min: {
              value: currentPrice + bidIncrement,
              message: `يجب أن تكون المزايدة على الأقل ${currentPrice + bidIncrement} ₪`,
            },
          })}
          disabled={!isAuctionActive || isSubmitting}
        />
        {errors.bidAmount && (
          <p className="text-red-500 text-sm mt-1">{errors.bidAmount.message}</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={!isAuctionActive || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            جاري تقديم المزايدة...
          </>
        ) : (
          'قدم مزايدة'
        )}
      </Button>

      <p className="text-sm text-gray-500 text-center">
        الحد الأدنى للمزايدة: {currentPrice + bidIncrement} ₪
      </p>
    </form>
  );
}; 