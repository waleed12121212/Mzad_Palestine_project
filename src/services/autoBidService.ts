import axios from 'axios';
import { API_URL } from '@/config/constants';

export interface AutoBid {
  id: number;
  auctionId: number;
  userId: number;
  maxBid: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAutoBidDto {
  auctionId: number;
  maxBid: number;
}

export interface UpdateAutoBidDto {
  maxBid: number;
}

class AutoBidService {
  async createAutoBid(autoBidData: CreateAutoBidDto): Promise<AutoBid> {
    const response = await axios.post(`${API_URL}/AutoBid`, autoBidData);
    return response.data;
  }

  async updateAutoBid(id: number, updateData: UpdateAutoBidDto): Promise<AutoBid> {
    const response = await axios.put(`${API_URL}/AutoBid/${id}`, updateData);
    return response.data;
  }

  async getAuctionAutoBid(auctionId: number): Promise<AutoBid | null> {
    const response = await axios.get(`${API_URL}/AutoBid/auction/${auctionId}`);
    return response.data;
  }

  async getAutoBid(id: number): Promise<AutoBid> {
    const response = await axios.get(`${API_URL}/AutoBid/${id}`);
    return response.data;
  }

  async deleteAutoBid(id: number): Promise<void> {
    await axios.delete(`${API_URL}/AutoBid/${id}`);
  }
}

export const autoBidService = new AutoBidService(); 