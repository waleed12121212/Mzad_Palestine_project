import axios from 'axios';
import { API_URL } from '@/config/constants';

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
}

class BidService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
  }

  async createBid(bidData: CreateBidDto): Promise<boolean> {
    try {
      const response = await axios.post(`${API_URL}/Bid`, bidData, {
        headers: this.getAuthHeader(),
        withCredentials: true
      });
      return response.status === 200 || response.status === 201;
    } catch (error) {
      console.error('Create bid error:', error);
      throw error;
    }
  }

  async getAuctionBids(auctionId: number): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL}/Bid/auction/${auctionId}`, {
        headers: this.getAuthHeader(),
        withCredentials: true
      });
      return response.status === 200;
    } catch (error) {
      console.error('Get auction bids error:', error);
      throw error;
    }
  }

  async getUserBids(): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL}/Bid/user`, {
        headers: this.getAuthHeader(),
        withCredentials: true
      });
      return response.status === 200;
    } catch (error) {
      console.error('Get user bids error:', error);
      throw error;
    }
  }

  async deleteBid(bidId: number): Promise<boolean> {
    try {
      const response = await axios.delete(`${API_URL}/Bid/${bidId}`, {
        headers: this.getAuthHeader(),
        withCredentials: true
      });
      return response.status === 200;
    } catch (error) {
      console.error('Delete bid error:', error);
      throw error;
    }
  }
}

export const bidService = new BidService(); 