import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';

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

      // Format the data exactly as the backend expects
      const auctionData = {
        listingId: Number(data.listingId),
        name: String(data.name).trim(),
        startTime: new Date(data.startTime).toISOString(),
        endTime: new Date(data.endTime).toISOString(),
        reservePrice: Number(data.reservePrice),
        bidIncrement: Number(data.bidIncrement),
        imageUrl: String(data.imageUrl).trim()
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
    await axios.post(`${API_URL}/${auctionId}/close`, {}, {
      headers: getAuthHeader()
    });
  }

  async updateAuction(auctionId: number, data: any): Promise<Auction> {
    try {
      const response = await axios.put(
        `${API_URL}/${auctionId}`,
        data,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error: any) {
      console.error('Auction update error:', error);
      throw error;
    }
  }

  async deleteAuction(auctionId: number): Promise<void> {
    await axios.delete(`${API_URL}/${auctionId}`, {
      headers: getAuthHeader(),
    });
  }
}

export const auctionService = new AuctionService(); 