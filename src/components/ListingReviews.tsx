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
  listingId?: string;
  auctionId?: string;
}

interface ReviewWithUser extends Review {
  userName?: string;
  userImage?: string;
}

const ListingReviews: React.FC<ListingReviewsProps> = ({ listingId, auctionId }) => {
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
  }, [listingId, auctionId]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      let reviewsData: ReviewWithUser[] = [];
      let ratingData = { averageRating: 0, totalReviews: 0 };
      if (auctionId) {
        reviewsData = await reviewService.getAuctionReviews(auctionId);
        ratingData = await reviewService.getAverageAuctionRating(auctionId);
      } else if (listingId) {
        reviewsData = await reviewService.getListingReviews(listingId);
        ratingData = await reviewService.getAverageRating(listingId);
      }
      
      // Fetch user information for each review
      const reviewsWithUsers = await Promise.all(
        reviewsData.map(async (review) => {
          try {
            const userDataResponse = await userService.getUserById(review.reviewerId.toString());
            const userData = userDataResponse.data || userDataResponse || {};
            return {
              ...review,
              userName: userData ? `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.username || 'مستخدم' : 'مستخدم',
              userImage: userData.profilePicture
                ? userData.profilePicture.startsWith('http')
                  ? userData.profilePicture
                  : `http://mazadpalestine.runasp.net${userData.profilePicture}`
                : undefined
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
        <p className="mt-2 text-gray-600 dark:text-gray-400">جاري تحميل التقييمات...</p>
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
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Average Rating */}
          <div className="text-center md:text-right">
            <div className="text-5xl font-bold mb-3 text-gray-900 dark:text-white">
              {Number(averageRating || 0).toFixed(1)}
            </div>
            <Rating 
              value={Number(averageRating || 0)} 
              readOnly 
              precision={0.5} 
              size="large" 
              dir="ltr"
              sx={{
                '& .MuiRating-iconFilled': {
                  color: '#EAB308',
                },
                '& .MuiRating-iconEmpty': {
                  color: 'rgba(234, 179, 8, 0.3)',
                },
                fontSize: '2rem'
              }}
            />
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {totalReviews} تقييم
            </div>
          </div>

          {/* Rating Bars */}
          <div className="flex-grow w-full md:w-auto">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingCounts[rating] || 0;
              const percentage = totalReviews > 0 
                ? (count / totalReviews) * 100 
                : 0;
              
              return (
                <div key={rating} className="flex items-center gap-3 mb-3">
                  <div className="text-sm font-medium w-8 text-gray-700 dark:text-gray-300">{rating}</div>
                  <div className="flex-grow h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-yellow-400 dark:bg-yellow-500 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <div className="text-sm font-medium w-12 text-left text-gray-600 dark:text-gray-400">
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="text-center py-8 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
          <p className="text-gray-600 dark:text-gray-400">لا توجد تقييمات بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700">
              {editingReview === review.id ? (
                <div className="space-y-4">
                  <div className="flex flex-col items-start">
                    <label className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">التقييم</label>
                    <Rating
                      value={editForm.rating}
                      onChange={(_, value) => setEditForm({ ...editForm, rating: value || 0 })}
                      size="large"
                      dir="ltr"
                      sx={{
                        '& .MuiRating-iconFilled': {
                          color: '#EAB308',
                        },
                        '& .MuiRating-iconEmpty': {
                          color: 'rgba(234, 179, 8, 0.3)',
                        }
                      }}
                    />
                  </div>
                  <div className="flex flex-col items-start">
                    <label className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">التعليق</label>
                    <textarea
                      value={editForm.comment}
                      onChange={(e) => setEditForm({ ...editForm, comment: e.target.value })}
                      className="w-full min-h-[100px] px-4 py-3 rounded-xl border border-gray-200 
                               dark:border-gray-700 bg-white dark:bg-gray-900 
                               text-gray-900 dark:text-white placeholder-gray-500 
                               dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 
                               focus:border-transparent transition duration-200 resize-none"
                    />
                  </div>
                  <div className="flex gap-2 justify-end">
                    <button
                      onClick={() => setEditingReview(null)}
                      className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 
                               hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={handleUpdate}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
                               hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      حفظ التعديلات
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={review.userImage || '/default-avatar.png'}
                        alt={review.userName}
                        className="w-10 h-10 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {review.userName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {format(new Date(review.createdAt), 'dd MMMM yyyy', { locale: ar })}
                        </p>
                      </div>
                    </div>
                    {user && user.id === review.reviewerId && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(review)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 
                                   dark:hover:text-blue-400 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="p-2 text-gray-600 dark:text-gray-400 hover:text-red-600 
                                   dark:hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <Rating
                      value={review.rating}
                      readOnly
                      size="medium"
                      dir="ltr"
                      sx={{
                        '& .MuiRating-iconFilled': {
                          color: '#EAB308',
                        },
                        '& .MuiRating-iconEmpty': {
                          color: 'rgba(234, 179, 8, 0.3)',
                        }
                      }}
                    />
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {review.comment}
                  </p>
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