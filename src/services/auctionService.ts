import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';
import { auctionNotificationService } from './auctionNotificationService';
import { imageService } from './imageService';
import { Bid } from './bidService';

const API_URL = '/Auction';

export interface Auction {
  id: number;
  listingId: number;
  name: string;
  startTime: string;
  endTime: string;
  reservePrice: number;
  bidIncrement: number;
  imageUrl: string;
}

export interface CreateAuctionDto {
  listingId: number;
  name: string;
  startTime: string;
  endTime: string;
  reservePrice: number;
  bidIncrement: number;
  imageUrl: string;
}

class AuctionService {
  async createAuction(data: CreateAuctionDto): Promise<Auction> {
    try {
      // Validate required fields
      if (!data.listingId || !data.name || !data.startTime || !data.endTime || !data.reservePrice || !data.bidIncrement || !data.imageUrl) {
        throw new Error('All fields are required');
      }

      // Handle image upload if it's a blob URL
      let finalImageUrl = data.imageUrl;
      if (data.imageUrl.startsWith('blob:')) {
        try {
          // Convert blob URL to File object
          const response = await fetch(data.imageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'auction-image.jpg', { type: blob.type });
          
          // Upload the image
          const uploadResult = await imageService.uploadImage(file);
          finalImageUrl = uploadResult.url;
        } catch (error) {
          console.error('Image upload error:', error);
          throw new Error('فشل تحميل الصورة');
        }
      }

      // Format the data exactly as the backend expects
      const auctionData = {
        listingId: Number(data.listingId),
        name: String(data.name).trim(),
        startTime: new Date(new Date(data.startTime).getTime() + (3 * 60 * 60 * 1000)).toISOString(),
        endTime: new Date(new Date(data.endTime).getTime() + (3 * 60 * 60 * 1000)).toISOString(),
        reservePrice: Number(data.reservePrice),
        bidIncrement: Number(data.bidIncrement),
        imageUrl: finalImageUrl
      };

      // Validate numeric fields
      if (isNaN(auctionData.listingId) || isNaN(auctionData.reservePrice) || isNaN(auctionData.bidIncrement)) {
        throw new Error('Invalid numeric values');
      }

      // Validate dates
      const startDate = new Date(auctionData.startTime);
      const endDate = new Date(auctionData.endTime);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format');
      }

      // Validate listingId is positive
      if (auctionData.listingId <= 0) {
        throw new Error('Invalid listing ID');
      }

      // Log the exact data being sent
      console.log('Creating auction with data:', JSON.stringify(auctionData, null, 2));
      console.log('Request headers:', {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      });

      // Send the request with the exact data format
      const response = await axios.post(API_URL, auctionData, {
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

  async getAuctionById(id: number): Promise<Auction> {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async getActiveAuctions(): Promise<Auction[]> {
    const response = await axios.get(`${API_URL}/active`, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async getUserAuctions(userId: number): Promise<Auction[]> {
    const response = await axios.get(`${API_URL}/user/${userId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async getOpenAuctions(): Promise<Auction[]> {
    const response = await axios.get(`${API_URL}/open`, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async getClosedAuctions(): Promise<Auction[]> {
    const response = await axios.get(`${API_URL}/closed`, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async closeAuction(auctionId: number): Promise<void> {
    try {
      const auction = await this.getAuctionById(auctionId);
      const response = await axios.get<Bid[]>(`/Bid/auction/${auctionId}`, {
        headers: getAuthHeader()
      });
      const bids = response.data;
      
      await axios.post(`${API_URL}/${auctionId}/close`, {}, {
        headers: getAuthHeader()
      });

      // Get all unique bidders
      const uniqueBidders = Array.from(new Set(bids.map(bid => bid.userId)));
      
      // Notify all participants that the auction has ended
      for (const bidderId of uniqueBidders) {
        await auctionNotificationService.notifyAuctionEnded(
          bidderId,
          auction.name
        );
      }

      // If there's a winner (highest bidder), notify them
      if (bids.length > 0) {
        const highestBid = bids[bids.length - 1];
        await auctionNotificationService.notifyAuctionWon(
          highestBid.userId,
          auction.name
        );
      }
    } catch (error) {
      console.error('Close auction error:', error);
      throw error;
    }
  }

  async updateAuction(auctionId: number, data: Partial<Auction>): Promise<Auction> {
    try {
      // Handle image upload if it's a blob URL
      let finalImageUrl = data.imageUrl;
      if (data.imageUrl?.startsWith('blob:')) {
        try {
          // Convert blob URL to File object
          const response = await fetch(data.imageUrl);
          const blob = await response.blob();
          const file = new File([blob], 'auction-image.jpg', { type: blob.type });
          
          // Upload the image
          const uploadResult = await imageService.uploadImage(file);
          finalImageUrl = uploadResult.url;
        } catch (error) {
          console.error('Image upload error:', error);
          throw new Error('فشل تحميل الصورة');
        }
      }

      // Prepare update data
      const updateData = {
        ...data,
        imageUrl: finalImageUrl,
        // Add timezone offset for dates if they exist
        ...(data.startTime && {
          startTime: new Date(new Date(data.startTime).getTime() + (3 * 60 * 60 * 1000)).toISOString()
        }),
        ...(data.endTime && {
          endTime: new Date(new Date(data.endTime).getTime() + (3 * 60 * 60 * 1000)).toISOString()
        })
      };

      const response = await axios.put(
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

  async deleteAuction(auctionId: number): Promise<void> {
    try {
      // Get the auction first to get the image URL
      const auction = await this.getAuctionById(auctionId);

      // Delete the auction
      await axios.delete(`${API_URL}/${auctionId}`, {
        headers: getAuthHeader()
      });

      // Try to delete the associated image if it exists and is hosted on our server
      if (auction.imageUrl && auction.imageUrl.includes('mazadpalestine.runasp.net')) {
        try {
          await imageService.deleteImage(auction.imageUrl);
        } catch (error) {
          console.error('Failed to delete auction image:', error);
          // Don't throw here as the auction was already deleted
        }
      }
    } catch (error: any) {
      console.error('Delete auction error:', error);
      throw new Error(error.response?.data?.message || 'فشل حذف المزاد');
    }
  }
}

export const auctionService = new AuctionService(); 