import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';
import { auctionNotificationService } from './auctionNotificationService';
import { AuctionBid } from './auctionService';

const API_URL = '/Bid';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface CreateBidDto {
  auctionId: number;
  amount: number;
  userId: number;
}

class BidService {
  async createBid(bidData: CreateBidDto, auctionTitle: string): Promise<ApiResponse<AuctionBid>> {
    try {
      // Ensure bid amount is a valid number greater than 0
      if (!bidData.amount || bidData.amount <= 0) {
        throw new Error("يجب أن يكون مبلغ العرض أكبر من صفر");
      }
      
      console.log('Submitting bid with data:', bidData);
      
      // Format the request payload according to API expectations
      const requestPayload = {
        BidAmount: bidData.amount,
        auctionId: bidData.auctionId
      };
      
      console.log('Sending bid with payload:', requestPayload);
      
      const response = await axios.post<ApiResponse<AuctionBid>>(`${API_URL}`, requestPayload, {
        headers: getAuthHeader()
      });
      
      console.log('Bid response:', response.data);
      
      // Notify the bidder
      await auctionNotificationService.notifyBidPlaced(
        bidData.userId,
        auctionTitle
      );
      
      // Get the auction with bids to find previous highest bidder
      const auctionResponse = await axios.get<ApiResponse<{bids: AuctionBid[]}>>(`/Auction/${bidData.auctionId}/bids`, {
        headers: getAuthHeader()
      });
      
      const bids = auctionResponse.data.data.bids;
      
      // Find previous highest bid that wasn't from the current user
      const previousHighestBid = bids
        .filter(bid => bid.userId !== bidData.userId)
        .sort((a, b) => b.amount - a.amount)[0];
      
      // If there was a previous bidder, notify them that they've been outbid
      if (previousHighestBid) {
        await auctionNotificationService.notifyBidOutbid(
          previousHighestBid.userId,
          `لقد تم تجاوز مزايدتك في المزاد: ${auctionTitle}. قم بالمزايدة مجددًا!`
        );
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Create bid error:', error);
      
      // Enhanced error logging
      if (error.response) {
        console.error('Bid error response:', {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers
        });
        
        // Handle specific validation error format
        if (error.response.data?.errors?.Amount || error.response.data?.errors?.BidAmount) {
          const errorData = error.response.data;
          console.error('Bid validation error:', errorData);
        }
      } else if (error.request) {
        console.error('Bid error request:', error.request);
      } else {
        console.error('Bid error message:', error.message);
      }
      
      throw error;
    }
  }

  async getUserBids(userId: number): Promise<ApiResponse<AuctionBid[]>> {
    try {
      const response = await axios.get<ApiResponse<AuctionBid[]>>(`${API_URL}/user/${userId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Get user bids error:', error);
      throw error;
    }
  }

  async deleteBid(bidId: number): Promise<ApiResponse<void>> {
    try {
      const response = await axios.delete<ApiResponse<void>>(`${API_URL}/${bidId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Delete bid error:', error);
      throw error;
    }
  }

  async getBidsByAuctionId(auctionId: number): Promise<ApiResponse<AuctionBid[]>> {
    try {
      console.log('Calling getBidsByAuctionId for auction:', auctionId);
      const response = await axios.get<ApiResponse<AuctionBid[]>>(`${API_URL}/auction/${auctionId}`, {
        headers: getAuthHeader()
      });
      console.log('getBidsByAuctionId response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Get bids by auction error:', error);
      throw error;
    }
  }
}

export const bidService = new BidService(); 