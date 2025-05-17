import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { bidService, Bid } from '@/services/bidService';
import { Loader2 } from 'lucide-react';
import axios from 'axios';

interface BidFormProps {
  auctionId: number;
  auctionTitle: string;
  currentPrice: number;
  bidIncrement: number;
  isAuctionActive: boolean;
  onBidSuccess?: (bid: Bid) => void;
}

interface BidFormData {
  bidAmount: number;
}

export const BidForm: React.FC<BidFormProps> = ({
  auctionId,
  auctionTitle,
  currentPrice,
  bidIncrement,
  isAuctionActive,
  onBidSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minBidError, setMinBidError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BidFormData>();

  const minBidAmount = currentPrice + bidIncrement;
  console.log(currentPrice);
  console.log(bidIncrement);
  const onSubmit = async (data: BidFormData) => {
    setMinBidError(null);
    if (!isAuctionActive) {
      toast.error('المزاد غير نشط حالياً');
      return;
    }

    if (data.bidAmount < minBidAmount) {
      toast.error(`يجب أن تكون المزايدة على الأقل ${minBidAmount} ₪`);
      setMinBidError(`يجب أن تكون المزايدة على الأقل ${minBidAmount} ₪`);
      return;
    }

    try {
      setIsSubmitting(true);
      const newBid = await bidService.createBid({
        auctionId,
        bidAmount: data.bidAmount,
        auctionTitle,
      });
      toast.success('تم تقديم المزايدة بنجاح');
      reset();
      onBidSuccess?.(newBid);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        if (error.response?.status === 401) {
          toast.error('يرجى تسجيل الدخول أولاً');
        } else if (error.response?.status === 400) {
          toast.error(errorMessage || 'قيمة المزايدة غير صالحة');
        } else if (error.response?.status === 403) {
          toast.error('لا يمكنك المزايدة على مزادك الخاص');
        } else if (error.response?.status === 409) {
          toast.error('تم تجاوزك بمزايدة أعلى');
        } else {
          toast.error(errorMessage || 'حدث خطأ أثناء تقديم المزايدة');
        }
      } else {
        toast.error('حدث خطأ غير متوقع');
      }
      console.error('Bid error:', error);
    }
    setIsSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {minBidError && (
        <div className="text-red-500 text-sm mb-2 text-center">{minBidError}</div>
      )}
      <div>
        <Input
          type="number"
          step="0.01"
          placeholder="أدخل قيمة المزايدة"
          {...register('bidAmount', {
            required: 'هذا الحقل مطلوب',
            min: {
              value: minBidAmount,
              message: `يجب أن تكون المزايدة على الأقل ${minBidAmount} ₪`,
            },
            validate: (value) => {
              if (value <= currentPrice) {
                return 'يجب أن تكون المزايدة أعلى من السعر الحالي';
              }
              return true;
            }
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
    </form>
  );
}; 