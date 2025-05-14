import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';
import { auctionNotificationService } from './auctionNotificationService';

const API_URL = '/Bid';

export interface Bid {
  id: number;
  auctionId: number;
  userId: number;
  bidAmount: number;
  createdAt: string;
  userName?: string;
}

export interface CreateBidDto {
  auctionId: number;
  bidAmount: number;
  auctionTitle: string;
}

class BidService {
  async createBid(bidData: CreateBidDto): Promise<Bid> {
    try {
      const response = await axios.post(`${API_URL}`, bidData, {
        headers: getAuthHeader()
      });
      
      // Notify the bidder
      await auctionNotificationService.notifyBidPlaced(
        response.data.userId,
        bidData.auctionTitle
      );
      
      // Get the previous highest bidder if exists
      const previousBids = await this.getAuctionBids(bidData.auctionId);
      const previousHighestBid = previousBids.length > 1 ? previousBids[previousBids.length - 2] : null;
      
      // If there was a previous bidder, notify them that they've been outbid
      if (previousHighestBid && previousHighestBid.userId !== response.data.userId) {
        await auctionNotificationService.notifyBidOutbid(
          previousHighestBid.userId,
          `لقد تم تجاوز مزايدتك في المزاد: ${bidData.auctionTitle}. قم بالمزايدة مجددًا!`
        );
      }
      
      return response.data;
    } catch (error) {
      console.error('Create bid error:', error);
      throw error;
    }
  }

  async getAuctionBids(auctionId: number): Promise<Bid[]> {
    try {
      const response = await axios.get(`${API_URL}/auction/${auctionId}`, {
        headers: getAuthHeader()
      });
      return response.data.data;
    } catch (error) {
      console.error('Get auction bids error:', error);
      throw error;
    }
  }

  async getUserBids(): Promise<Bid[]> {
    try {
      const response = await axios.get(`${API_URL}/user`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Get user bids error:', error);
      throw error;
    }
  }

  async deleteBid(bidId: number): Promise<boolean> {
    try {
      const response = await axios.delete(`${API_URL}/${bidId}`, {
        headers: getAuthHeader()
      });
      return response.status === 200;
    } catch (error) {
      console.error('Delete bid error:', error);
      throw error;
    }
  }
}

export const bidService = new BidService(); 