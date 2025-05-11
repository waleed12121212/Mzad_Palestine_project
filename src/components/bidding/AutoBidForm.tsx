import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { autoBidService } from '@/services/autoBidService';
import { Loader2 } from 'lucide-react';

interface AutoBidFormProps {
  auctionId: number;
  currentPrice: number;
  bidIncrement: number;
  isAuctionActive: boolean;
  existingAutoBid?: {
    id: number;
    maxBid: number;
  } | null;
}

interface AutoBidFormData {
  maxBid: number;
}

export const AutoBidForm: React.FC<AutoBidFormProps> = ({
  auctionId,
  currentPrice,
  bidIncrement,
  isAuctionActive,
  existingAutoBid,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AutoBidFormData>({
    defaultValues: {
      maxBid: existingAutoBid?.maxBid || currentPrice + bidIncrement,
    },
  });

  const onSubmit = async (data: AutoBidFormData) => {
    if (!isAuctionActive) {
      toast.error('المزاد غير نشط حالياً');
      return;
    }

    const minBidAmount = currentPrice + bidIncrement;
    if (data.maxBid < minBidAmount) {
      toast.error(`يجب أن تكون المزايدة على الأقل ${minBidAmount} ₪`);
      return;
    }

    try {
      setIsSubmitting(true);
      if (existingAutoBid) {
        await autoBidService.updateAutoBid(existingAutoBid.id, {
          maxBid: data.maxBid,
        });
        toast.success('تم تحديث المزايدة التلقائية بنجاح');
      } else {
        await autoBidService.createAutoBid({
          auctionId,
          maxBid: data.maxBid,
        });
        toast.success('تم تفعيل المزايدة التلقائية بنجاح');
      }
      reset();
    } catch (error) {
      toast.error('حدث خطأ أثناء تفعيل المزايدة التلقائية');
      console.error('AutoBid error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!existingAutoBid) return;

    try {
      setIsSubmitting(true);
      await autoBidService.deleteAutoBid(existingAutoBid.id);
      toast.success('تم إيقاف المزايدة التلقائية بنجاح');
      reset();
    } catch (error) {
      toast.error('حدث خطأ أثناء إيقاف المزايدة التلقائية');
      console.error('Delete AutoBid error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Input
            type="number"
            step="0.01"
            placeholder="أدخل الحد الأقصى للمزايدة"
            {...register('maxBid', {
              required: 'هذا الحقل مطلوب',
              min: {
                value: currentPrice + bidIncrement,
                message: `يجب أن تكون المزايدة على الأقل ${currentPrice + bidIncrement} ₪`,
              },
            })}
            disabled={!isAuctionActive || isSubmitting}
          />
          {errors.maxBid && (
            <p className="text-red-500 text-sm mt-1">{errors.maxBid.message}</p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            className="flex-1"
            disabled={!isAuctionActive || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : existingAutoBid ? (
              'تحديث المزايدة التلقائية'
            ) : (
              'تفعيل المزايدة التلقائية'
            )}
          </Button>

          {existingAutoBid && (
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isSubmitting}
            >
              إيقاف
            </Button>
          )}
        </div>
      </form>

      <p className="text-sm text-gray-500 text-center">
        {existingAutoBid
          ? `الحد الأقصى الحالي للمزايدة: ${existingAutoBid.maxBid} ₪`
          : `الحد الأدنى للمزايدة: ${currentPrice + bidIncrement} ₪`}
      </p>
    </div>
  );
}; 