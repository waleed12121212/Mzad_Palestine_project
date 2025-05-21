import React, { useState, useEffect } from 'react';
import { Rating } from '@mui/material';
import { toast } from 'react-toastify';
import reviewService from '../services/reviewService';

interface ReviewFormProps {
  listingId?: string;
  auctionId?: string;
  onReviewSubmitted?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ listingId, auctionId, onReviewSubmitted }) => {
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkUserReview();
  }, [listingId, auctionId]);

  const checkUserReview = async () => {
    if (auctionId) {
      // لا يوجد endpoint مباشر للتحقق، يمكن جلب مراجعاتي والتحقق منها أو تجاهل التحقق حالياً
      setHasReviewed(false); // أو يمكنك لاحقاً جلب مراجعاتي والتحقق
    } else if (listingId) {
      const reviewed = await reviewService.hasUserReviewed(listingId);
      setHasReviewed(reviewed);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) {
      toast.error('الرجاء اختيار تقييم');
      return;
    }
    try {
      setIsSubmitting(true);
      if (auctionId) {
        await reviewService.addAuctionReview(auctionId, rating, comment.trim());
      } else if (listingId) {
        await reviewService.addReview({
          listingId,
          rating,
          comment: comment.trim()
        });
      }
      toast.success('تم إضافة تقييمك بنجاح');
      setRating(0);
      setComment('');
      setHasReviewed(true);
      onReviewSubmitted?.();
    } catch (error) {
      toast.error('حدث خطأ أثناء إضافة التقييم');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasReviewed) {
    return <p className="text-gray-600 dark:text-gray-400">لقد قمت بتقييم هذا المنتج مسبقاً</p>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 text-center">
        التقييمات والمراجعات
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col items-center">
          <label className="text-lg font-medium mb-3 text-gray-900 dark:text-white">تقييمك</label>
          <Rating
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            size="large"
            dir="ltr"
            sx={{
              '& .MuiRating-iconFilled': {
                color: '#EAB308',
              },
              '& .MuiRating-iconEmpty': {
                color: 'rgba(234, 179, 8, 0.3)',
              },
              fontSize: '2.5rem'
            }}
          />
        </div>
        
        <div className="flex flex-col">
          <label className="text-lg font-medium mb-2 text-gray-900 dark:text-white">تعليقك</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full min-h-[120px] px-4 py-3 rounded-xl border border-gray-200 
                     dark:border-gray-700 bg-white dark:bg-gray-900 
                     text-gray-900 dark:text-white placeholder-gray-500 
                     dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 
                     focus:border-transparent transition duration-200 resize-none"
            placeholder="اكتب تعليقك هنا..."
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-6 text-lg font-medium text-white 
                     bg-blue-600 hover:bg-blue-700 rounded-xl 
                     transition duration-200 transform hover:scale-[1.02]
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                     disabled:opacity-50 disabled:cursor-not-allowed
                     ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
        </button>
      </form>
    </div>
  );
};

export default ReviewForm; 