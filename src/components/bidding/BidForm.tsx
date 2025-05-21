import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { bidService } from '@/services/bidService';
import { AuctionBid } from '@/services/auctionService';
import { Loader2 } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '@/contexts/AuthContext';

interface BidFormProps {
  auctionId: number;
  auctionTitle: string;
  currentPrice: number;
  bidIncrement: number;
  isAuctionActive: boolean;
  onBidSuccess?: (bid: AuctionBid) => void;
  onBidError?: (error: any) => void;
}

interface BidFormData {
  amount: number;
}

export const BidForm: React.FC<BidFormProps> = ({
  auctionId,
  auctionTitle,
  currentPrice,
  bidIncrement,
  isAuctionActive,
  onBidSuccess,
  onBidError,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [minBidError, setMinBidError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<BidFormData>();
  const { user } = useAuth();

  const minBidAmount = currentPrice + bidIncrement;
  console.log(currentPrice);
  console.log(bidIncrement);
  const onSubmit = async (data: BidFormData) => {
    setMinBidError(null);
    if (!isAuctionActive) {
      toast.error('المزاد غير نشط حالياً');
      return;
    }

    // Ensure bid amount is a number greater than 0
    const bidAmount = Number(data.amount);
    if (isNaN(bidAmount) || bidAmount <= 0) {
      toast.error('يجب أن يكون مبلغ العرض أكبر من صفر');
      setMinBidError('يجب أن يكون مبلغ العرض أكبر من صفر');
      return;
    }

    if (bidAmount < minBidAmount) {
      toast.error(`يجب أن تكون المزايدة على الأقل ${minBidAmount} ₪`);
      setMinBidError(`يجب أن تكون المزايدة على الأقل ${minBidAmount} ₪`);
      return;
    }

    if (!user?.id) {
      toast.error('يرجى تسجيل الدخول أولاً');
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Enhanced logging for debugging
      console.log('BidForm - Submitting bid with data:', {
        auctionId,
        bidAmount,
        userId: Number(user.id),
        formData: data,
        minBidAmount,
        currentPrice
      });
      
      const bidResponse = await bidService.createBid({
        auctionId,
        amount: bidAmount,
        userId: Number(user.id)
      }, auctionTitle);
      
      console.log('BidForm - Bid response received:', bidResponse);
      
      if (bidResponse.success) {
        toast.success('تم تقديم المزايدة بنجاح');
        reset();
        // Ensure we have the correct bid amount in the response
        const bid = bidResponse.data;
        if (bid && typeof bid.amount === 'undefined') {
          bid.amount = 0; // Set a default value if amount is undefined
        }
        onBidSuccess?.(bidResponse.data);
      } else {
        toast.error('حدث خطأ أثناء تقديم المزايدة');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.message;
        const errorData = error.response?.data;
        
        if (onBidError) {
          onBidError(errorData || error);
        } else {
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
        }
      } else {
        toast.error('حدث خطأ غير متوقع');
        if (onBidError) {
          onBidError(error);
        }
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
          min="0.01"
          placeholder="أدخل قيمة المزايدة"
          {...register('amount', {
            required: 'هذا الحقل مطلوب',
            min: {
              value: 0.01,
              message: 'يجب أن يكون مبلغ العرض أكبر من صفر',
            },
            validate: (value) => {
              const numValue = Number(value);
              if (isNaN(numValue) || numValue <= 0) {
                return 'يجب أن يكون مبلغ العرض أكبر من صفر';
              }
              if (numValue < minBidAmount) {
                return `يجب أن تكون المزايدة على الأقل ${minBidAmount} ₪`;
              }
              return true;
            }
          })}
          disabled={!isAuctionActive || isSubmitting}
        />
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
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