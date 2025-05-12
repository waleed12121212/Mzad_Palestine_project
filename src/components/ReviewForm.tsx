import React, { useState, useEffect } from 'react';
import { Rating } from '@mui/material';
import { toast } from 'react-toastify';
import reviewService from '../services/reviewService';

interface ReviewFormProps {
  listingId: string;
  onReviewSubmitted?: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ listingId, onReviewSubmitted }) => {
  const [rating, setRating] = useState<number | null>(0);
  const [comment, setComment] = useState('');
  const [hasReviewed, setHasReviewed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkUserReview();
  }, [listingId]);

  const checkUserReview = async () => {
    const reviewed = await reviewService.hasUserReviewed(listingId);
    setHasReviewed(reviewed);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rating) {
      toast.error('الرجاء اختيار تقييم');
      return;
    }

    try {
      setIsSubmitting(true);
      await reviewService.addReview({
        listingId,
        rating,
        comment: comment.trim()
      });
      
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
    return <p className="text-gray-600">لقد قمت بتقييم هذا المنتج مسبقاً</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-4 rounded-lg shadow">
      <div className="flex flex-col items-center">
        <label className="text-lg font-medium mb-2">تقييمك</label>
        <Rating
          value={rating}
          onChange={(_, newValue) => setRating(newValue)}
          size="large"
          dir="ltr"
        />
      </div>
      
      <div className="flex flex-col">
        <label className="text-lg font-medium mb-2">تعليقك</label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="border rounded-lg p-2 h-24 resize-none"
          placeholder="اكتب تعليقك هنا..."
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition
          ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
      </button>
    </form>
  );
};

export default ReviewForm; 