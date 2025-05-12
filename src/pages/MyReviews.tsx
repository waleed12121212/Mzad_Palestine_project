import React, { useState, useEffect } from 'react';
import { Rating } from '@mui/material';
import { toast } from 'react-toastify';
import reviewService, { Review } from '../services/reviewService';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

const MyReviews: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    rating: 0,
    comment: ''
  });

  useEffect(() => {
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      setLoading(true);
      const data = await reviewService.getMyReviews();
      setReviews(data);
    } catch (error) {
      toast.error('حدث خطأ أثناء تحميل التقييمات');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review: Review) => {
    setEditingReview(review.id);
    setEditForm({
      rating: review.rating,
      comment: review.comment
    });
  };

  const handleUpdate = async (reviewId: string) => {
    try {
      await reviewService.updateReview(reviewId, editForm);
      toast.success('تم تحديث التقييم بنجاح');
      setEditingReview(null);
      fetchMyReviews();
    } catch (error) {
      toast.error('حدث خطأ أثناء تحديث التقييم');
    }
  };

  const handleDelete = async (reviewId: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId);
      toast.success('تم حذف التقييم بنجاح');
      setReviews(reviews.filter(review => review.id !== reviewId));
    } catch (error) {
      toast.error('حدث خطأ أثناء حذف التقييم');
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري تحميل التقييمات...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">تقييماتي</h1>

      {reviews.length === 0 ? (
        <p className="text-center text-gray-600">لم تقم بإضافة أي تقييمات بعد</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-4 rounded-lg shadow">
              {editingReview === review.id ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-start">
                    <label className="text-sm font-medium mb-1">التقييم</label>
                    <Rating
                      value={editForm.rating}
                      onChange={(_, newValue) => setEditForm({ ...editForm, rating: newValue || 0 })}
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-1">التعليق</label>
                    <textarea
                      value={editForm.comment}
                      onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                      className="border rounded-lg p-2 h-24 resize-none"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdate(review.id)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      حفظ
                    </button>
                    <button
                      onClick={() => setEditingReview(null)}
                      className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-300"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-medium">المنتج: {review.listingId}</h3>
                      <Rating value={review.rating} readOnly size="small" dir="ltr" />
                    </div>
                    <span className="text-sm text-gray-500">
                      {format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: ar })}
                    </span>
                  </div>
                  
                  {review.comment && (
                    <p className="mt-2 text-gray-700">{review.comment}</p>
                  )}

                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEdit(review)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      تعديل
                    </button>
                    <button
                      onClick={() => handleDelete(review.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      حذف
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyReviews; 