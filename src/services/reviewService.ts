import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';

const API_URL = '/Review';

export interface Review {
  id: number;
  reviewerId: number;
  reviewedUserId: number;
  listingId: number;
  comment: string;
  rating: number;
  createdAt: string;
  userName?: string; // Optional field we might add from user data
}

export interface ReviewInput {
  listingId: string;
  rating: number;
  comment: string;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

interface AverageRatingResponse {
  averageRating: number;
  totalReviews: number;
}

class ReviewService {
  // Add a new review
  async addReview(review: ReviewInput): Promise<void> {
    try {
      await axios.post(
        `/Review/listing/${review.listingId}`,
        {
          rating: Number(review.rating),
          comment: review.comment.trim(),
        },
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error: any) {
      console.error('Error adding review:', error);
      throw error;
    }
  }

  // Get reviews for a specific listing
  async getListingReviews(listingId: string): Promise<Review[]> {
    try {
      const response = await axios.get<ApiResponse<Review[]>>(`${API_URL}/listing/${listingId}`, {
        headers: getAuthHeader()
      });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching listing reviews:', error);
      return [];
    }
  }

  // Get average rating for a listing
  async getAverageRating(listingId: string): Promise<AverageRatingResponse> {
    try {
      const response = await axios.get<ApiResponse<AverageRatingResponse>>(`${API_URL}/${listingId}/average`, {
        headers: getAuthHeader()
      });
      return response.data.success ? response.data.data : { averageRating: 0, totalReviews: 0 };
    } catch (error) {
      console.error('Error fetching average rating:', error);
      return { averageRating: 0, totalReviews: 0 };
    }
  }

  // Get reviews by user ID
  async getUserReviews(userId: string): Promise<Review[]> {
    try {
      const response = await axios.get<ApiResponse<Review[]>>(`${API_URL}/user/${userId}`, {
        headers: getAuthHeader()
      });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching user reviews:', error);
      return [];
    }
  }

  // Get current user's reviews
  async getMyReviews(): Promise<Review[]> {
    try {
      const response = await axios.get<ApiResponse<Review[]>>(`${API_URL}/my-reviews`, {
        headers: getAuthHeader()
      });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching my reviews:', error);
      return [];
    }
  }

  // Update a review
  async updateReview(reviewId: string, review: Partial<ReviewInput>): Promise<Review> {
    try {
      const response = await axios.put<ApiResponse<Review>>(`${API_URL}/${reviewId}`, review, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    try {
      await axios.delete(`${API_URL}/${reviewId}`, {
        headers: getAuthHeader()
      });
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  // Check if user has reviewed a listing
  async hasUserReviewed(listingId: string): Promise<boolean> {
    try {
      const reviews = await this.getMyReviews();
      return reviews.some(review => review.listingId === Number(listingId));
    } catch (error) {
      console.error('Error checking if user has reviewed:', error);
      return false;
    }
  }

  // Add a new auction review
  async addAuctionReview(auctionId: string, rating: number, comment: string): Promise<void> {
    try {
      await axios.post(
        `/Review/auction/${auctionId}`,
        { rating, comment },
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error: any) {
      console.error('Error adding auction review:', error);
      throw error;
    }
  }

  // Get reviews for a specific auction
  async getAuctionReviews(auctionId: string): Promise<Review[]> {
    try {
      const response = await axios.get<ApiResponse<Review[]>>(`/Review/auction/${auctionId}`, {
        headers: getAuthHeader(),
      });
      return response.data.success ? response.data.data : [];
    } catch (error) {
      console.error('Error fetching auction reviews:', error);
      return [];
    }
  }

  // Get average rating for an auction
  async getAverageAuctionRating(auctionId: string): Promise<AverageRatingResponse> {
    try {
      const response = await axios.get<ApiResponse<AverageRatingResponse>>(`/Review/auction/${auctionId}/average`, {
        headers: getAuthHeader(),
      });
      return response.data.success ? response.data.data : { averageRating: 0, totalReviews: 0 };
    } catch (error) {
      console.error('Error fetching average auction rating:', error);
      return { averageRating: 0, totalReviews: 0 };
    }
  }

  // Update an auction review
  async updateAuctionReview(reviewId: string, rating: number, comment: string): Promise<void> {
    try {
      await axios.put(
        `/Review/${reviewId}`,
        { rating, comment },
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error: any) {
      console.error('Error updating auction review:', error);
      throw error;
    }
  }
}

export const reviewService = new ReviewService();
export default reviewService; 