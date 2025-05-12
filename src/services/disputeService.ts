import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';

const API_URL = '/Dispute';

export interface Dispute {
  id: number;
  auctionId: number;
  userId: number;
  reason: string;
  status: 0 | 1;
  createdAt: string;
  resolvedAt?: string;
  resolution?: string;
}

export interface CreateDisputeDto {
  auctionId: number;
  reason: string;
}

export interface ResolveDisputeDto {
  disputeId: number;
  resolution: string;
}

class DisputeService {
  async createDispute(data: CreateDisputeDto): Promise<Dispute> {
    try {
      if (!data.auctionId || !data.reason) {
        throw new Error('Auction ID and reason are required');
      }

      const disputeData = {
        auctionId: Number(data.auctionId),
        reason: String(data.reason).trim()
      };

      if (isNaN(disputeData.auctionId) || disputeData.auctionId <= 0) {
        throw new Error('Invalid auction ID');
      }

      console.log('Creating dispute with data:', JSON.stringify(disputeData, null, 2));

      const response = await axios.post(API_URL, disputeData, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      console.log('Dispute creation response:', response.data);

      if (!response.data) {
        throw new Error('No response data received from server');
      }

      return response.data;
    } catch (error: any) {
      console.error('Dispute creation error:', {
        data: data,
        error: error.response?.data,
        status: error.response?.status,
        message: error.message
      });

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  }

  async getUserDisputes(): Promise<Dispute[]> {
    try {
      const response = await axios.get(`${API_URL}/user`, {
        headers: getAuthHeader()
      });
      const data = Array.isArray(response.data) ? response.data : response.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Error fetching user disputes:', error);
      throw error;
    }
  }

  async getDisputesByAuction(auctionId: number): Promise<Dispute[]> {
    try {
      const response = await axios.get(`${API_URL}/auction/${auctionId}`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching auction disputes:', error);
      throw error;
    }
  }

  async getAllDisputes(): Promise<Dispute[]> {
    try {
      const response = await axios.get(API_URL, {
        headers: getAuthHeader()
      });
      const data = Array.isArray(response.data) ? response.data : response.data?.data;
      return Array.isArray(data) ? data : [];
    } catch (error: any) {
      console.error('Error fetching all disputes:', error);
      throw error;
    }
  }

  async resolveDispute(data: ResolveDisputeDto): Promise<Dispute> {
    try {
      if (!data.disputeId || !data.resolution) {
        throw new Error('Dispute ID and resolution are required');
      }

      const response = await axios.put(
        `${API_URL}/${data.disputeId}/resolve`,
        data.resolution,
        {
          headers: {
            ...getAuthHeader(),
            'Content-Type': 'application/json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('Error resolving dispute:', error);
      throw error;
    }
  }
}

export const disputeService = new DisputeService(); 