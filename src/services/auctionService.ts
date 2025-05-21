import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';
import { auctionNotificationService } from './auctionNotificationService';
import { imageService } from './imageService';

const API_URL = '/Auction';

export interface AuctionBid {
  id: number;
  auctionId: number;
  userId: number;
  userName: string | null;
  amount: number;
  bidTime: string;
  isWinningBid: boolean;
}

export interface Auction {
  id: number;
  title: string;
  description: string;
  address: string;
  startDate: string;
  endDate: string;
  reservePrice: number;
  currentBid: number;
  bidIncrement: number;
  winnerId: number | null;
  status: string;
  categoryId: number;
  categoryName: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  bids: AuctionBid[];
  bidsCount?: number;
  listingId?: number;
  userId?: string | number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface CreateAuctionDto {
  title: string;
  description: string;
  address: string;
  startDate: string;
  endDate: string;
  reservePrice: number;
  bidIncrement: number;
  categoryId: number;
  images: string[];
  userId: number;
}

class AuctionService {
  async createAuction(data: CreateAuctionDto): Promise<ApiResponse<Auction>> {
    try {
      // Validate required fields
      if (!data.title || !data.description || !data.address || !data.startDate || 
          !data.endDate || !data.reservePrice || !data.bidIncrement || !data.categoryId) {
        throw new Error('All fields are required');
      }

      // Handle image upload if there are blob URLs
      const processedImages: string[] = [];
      
      for (const imageUrl of data.images) {
        if (imageUrl.startsWith('blob:')) {
          try {
            // Convert blob URL to File object
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const file = new File([blob], 'auction-image.jpg', { type: blob.type });
            
            // Upload the image
            const uploadResult = await imageService.uploadImage(file);
            processedImages.push(uploadResult.url);
          } catch (error) {
            console.error('Image upload error:', error);
            throw new Error('فشل تحميل الصورة');
          }
        } else {
          processedImages.push(imageUrl);
        }
      }

      // Format the data exactly as the backend expects
      const auctionData = {
        title: String(data.title).trim(),
        description: String(data.description).trim(),
        address: String(data.address).trim(),
        startDate: data.startDate,
        endDate: data.endDate,
        reservePrice: Number(data.reservePrice),
        bidIncrement: Number(data.bidIncrement),
        categoryId: Number(data.categoryId),
        images: processedImages,
        userId: data.userId
      };

      // Log the exact data being sent
      console.log('Creating auction with data:', JSON.stringify(auctionData, null, 2));

      // Send the request with the exact data format
      const response = await axios.post<ApiResponse<Auction>>(API_URL, auctionData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      // Log the response
      console.log('Auction creation response:', response.data);

      if (!response.data) {
        throw new Error('No response data received from server');
      }

      return response.data;
    } catch (error: any) {
      console.error('Auction creation error:', {
        data: data,
        error: error.response?.data,
        status: error.response?.status,
        message: error.message,
        config: error.config
      });

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async getAuctionById(id: number): Promise<ApiResponse<Auction>> {
    const response = await axios.get<ApiResponse<Auction>>(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async getActiveAuctions(): Promise<ApiResponse<Auction[]>> {
    const response = await axios.get<ApiResponse<Auction[]>>(`${API_URL}/active`, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async getUserAuctions(userId: number): Promise<ApiResponse<Auction[]>> {
    const response = await axios.get<ApiResponse<Auction[]>>(`${API_URL}/user/${userId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async getCompletedAuctions(): Promise<ApiResponse<Auction[]>> {
    const response = await axios.get<ApiResponse<Auction[]>>(`${API_URL}/completed`, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async getPendingAuctions(): Promise<ApiResponse<Auction[]>> {
    const response = await axios.get<ApiResponse<Auction[]>>(`${API_URL}/pending`, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async getAuctionBids(auctionId: number): Promise<ApiResponse<Auction>> {
    const response = await axios.get<ApiResponse<Auction>>(`${API_URL}/${auctionId}/bids`, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async closeAuction(auctionId: number): Promise<void> {
    try {
      const auctionResponse = await this.getAuctionById(auctionId);
      const auction = auctionResponse.data;
      
      await axios.post(`${API_URL}/${auctionId}/close`, {}, {
        headers: getAuthHeader()
      });

      // Get all unique bidders
      const uniqueBidders = Array.from(new Set(auction.bids.map(bid => bid.userId)));
      
      // Notify all participants that the auction has ended
      for (const bidderId of uniqueBidders) {
        await auctionNotificationService.notifyAuctionEnded(
          bidderId,
          auction.title
        );
      }

      // If there's a winner (highest bidder), notify them
      if (auction.bids.length > 0) {
        const winningBid = auction.bids.find(bid => bid.isWinningBid);
        if (winningBid) {
          await auctionNotificationService.notifyAuctionWon(
            winningBid.userId,
            auction.title
          );
        }
      }
    } catch (error) {
      console.error('Close auction error:', error);
      throw error;
    }
  }

  async updateAuction(auctionId: number, data: Partial<CreateAuctionDto>): Promise<ApiResponse<Auction>> {
    try {
      // Handle image upload if there are blob URLs
      const processedImages: string[] = [];
      
      if (data.images && data.images.length > 0) {
        for (const imageUrl of data.images) {
          if (imageUrl.startsWith('blob:')) {
            try {
              // Convert blob URL to File object
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              const file = new File([blob], 'auction-image.jpg', { type: blob.type });
              
              // Upload the image
              const uploadResult = await imageService.uploadImage(file);
              processedImages.push(uploadResult.url);
            } catch (error) {
              console.error('Image upload error:', error);
              throw new Error('فشل تحميل الصورة');
            }
          } else {
            processedImages.push(imageUrl);
          }
        }
      }

      // Prepare update data
      const updateData = {
        ...data,
        ...(data.images && { images: processedImages })
      };

      const response = await axios.put<ApiResponse<Auction>>(
        `${API_URL}/${auctionId}`,
        updateData,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Update auction error:', error);
      throw new Error(error.response?.data?.message || 'فشل تحديث المزاد');
    }
  }

  async deleteAuction(auctionId: number): Promise<ApiResponse<void>> {
    try {
      const response = await axios.delete<ApiResponse<void>>(`${API_URL}/${auctionId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      console.error('Delete auction error:', error);
      throw new Error(error.response?.data?.message || 'فشل حذف المزاد');
    }
  }
}

export const auctionService = new AuctionService(); 