import React, { useState, useEffect } from 'react';
import { Rating } from '@mui/material';
import reviewService, { Review } from '../services/reviewService';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { userService } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { Pencil, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ListingReviewsProps {
  listingId: string;
}

interface ReviewWithUser extends Review {
  userName?: string;
  userImage?: string;
}

const ListingReviews: React.FC<ListingReviewsProps> = ({ listingId }) => {
  const [reviews, setReviews] = useState<ReviewWithUser[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({
    rating: 0,
    comment: ''
  });
  const { user } = useAuth();

  useEffect(() => {
    fetchReviews();
  }, [listingId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const [reviewsData, ratingData] = await Promise.all([
        reviewService.getListingReviews(listingId),
        reviewService.getAverageRating(listingId)
      ]);
      
      // Fetch user information for each review
      const reviewsWithUsers = await Promise.all(
        reviewsData.map(async (review) => {
          try {
            const userData = await userService.getUserById(review.reviewerId.toString());
            return {
              ...review,
              userName: userData ? `${userData.firstName} ${userData.lastName}` : 'مستخدم',
              userImage: userData?.profilePicture
            };
          } catch (error) {
            console.error('Error fetching user data:', error);
            return {
              ...review,
              userName: 'مستخدم'
            };
          }
        })
      );

      setReviews(reviewsWithUsers);
      setAverageRating(ratingData.averageRating);
      setTotalReviews(ratingData.totalReviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
      setAverageRating(0);
      setTotalReviews(0);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (review: ReviewWithUser) => {
    setEditingReview(review.id);
    setEditForm({
      rating: review.rating,
      comment: review.comment
    });
  };

  const handleUpdate = async () => {
    if (!editingReview) return;

    try {
      await reviewService.updateReview(editingReview.toString(), editForm);
      toast({
        title: "تم تحديث التقييم بنجاح",
        description: "تم تحديث تقييمك بنجاح"
      });
      setEditingReview(null);
      fetchReviews(); // Refresh reviews
    } catch (error) {
      toast({
        title: "خطأ في تحديث التقييم",
        description: "حدث خطأ أثناء تحديث التقييم",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      return;
    }

    try {
      await reviewService.deleteReview(reviewId.toString());
      toast({
        title: "تم حذف التقييم",
        description: "تم حذف تقييمك بنجاح"
      });
      fetchReviews(); // Refresh reviews
    } catch (error) {
      toast({
        title: "خطأ في حذف التقييم",
        description: "حدث خطأ أثناء حذف التقييم",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue border-t-transparent"></div>
        <p className="mt-2 text-gray-600">جاري تحميل التقييمات...</p>
      </div>
    );
  }

  // Calculate rating counts
  const ratingCounts = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Average Rating */}
          <div className="text-center md:text-right">
            <div className="text-4xl font-bold mb-2">{Number(averageRating || 0).toFixed(1)}</div>
            <Rating value={Number(averageRating || 0)} readOnly precision={0.5} size="large" dir="ltr" />
            <div className="text-sm text-gray-500 mt-1">
              {totalReviews} تقييم
            </div>
          </div>

          {/* Rating Bars */}
          <div className="flex-grow">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingCounts[rating] || 0;
              const percentage = totalReviews > 0 
                ? (count / totalReviews) * 100 
                : 0;
              
              return (
                <div key={rating} className="flex items-center gap-2 mb-2">
                  <div className="text-sm w-8">{rating}</div>
                  <div className="flex-grow h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm w-12 text-left">{count}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-gray-500">لا توجد تقييمات بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              {editingReview === review.id ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-start">
                    <label className="text-sm font-medium mb-2">التقييم</label>
                    <Rating
                      value={editForm.rating}
                      onChange={(_, newValue) => setEditForm({ ...editForm, rating: newValue || 0 })}
                      size="large"
                      dir="ltr"
                    />
                  </div>
                  
                  <div className="flex flex-col">
                    <label className="text-sm font-medium mb-2">التعليق</label>
                    <textarea
                      value={editForm.comment}
                      onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                      className="w-full p-3 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-blue text-white rounded-lg hover:bg-blue-600 transition"
                    >
                      حفظ التعديلات
                    </button>
                    <button
                      onClick={() => setEditingReview(null)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
                    >
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-3">
                      {review.userImage ? (
                        <img 
                          src={review.userImage} 
                          alt={review.userName} 
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                          <span className="text-blue-600 dark:text-blue-300 font-medium">
                            {review.userName?.charAt(0) || 'م'}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-lg">{review.userName}</h3>
                        <Rating value={review.rating} readOnly size="small" dir="ltr" />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">
                  {format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: ar })}
                </span>
                      {user && review.reviewerId === user.id && (
                        <div className="flex gap-2 mr-4">
                          <button
                            onClick={() => handleEdit(review)}
                            className="p-1.5 text-blue hover:bg-blue-50 rounded-full transition"
                            title="تعديل التقييم"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition"
                            title="حذف التقييم"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
              </div>
              {review.comment && (
                    <p className="mt-3 text-gray-700 dark:text-gray-300 mr-13">{review.comment}</p>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ListingReviews; 