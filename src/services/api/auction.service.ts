import axiosInstance from './axios.config';
import { API_ENDPOINTS } from '@/utils/constants';
import type { 
  Auction, 
  ApiResponse, 
  PaginationParams,
  FilterParams 
} from '@/types';
import { handleError } from '@/utils/helpers';

export class AuctionService {
  async createAuction(data: Partial<Auction>): Promise<Auction> {
    try {
      const response = await axiosInstance.post<ApiResponse<Auction>>(
        API_ENDPOINTS.AUCTION.CREATE,
        data
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  }

  async getAuctions(params?: PaginationParams & FilterParams): Promise<Auction[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Auction[]>>(
        API_ENDPOINTS.AUCTION.LIST,
        { params }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  }

  async getAuctionById(id: number): Promise<Auction> {
    try {
      const response = await axiosInstance.get<ApiResponse<Auction>>(
        API_ENDPOINTS.AUCTION.DETAILS(id.toString())
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  }

  async updateAuction(id: number, data: Partial<Auction>): Promise<Auction> {
    try {
      const response = await axiosInstance.put<ApiResponse<Auction>>(
        API_ENDPOINTS.AUCTION.UPDATE(id.toString()),
        data
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  }

  async deleteAuction(id: number): Promise<void> {
    try {
      await axiosInstance.delete(API_ENDPOINTS.AUCTION.DELETE(id.toString()));
    } catch (error) {
      throw new Error(handleError(error));
    }
  }

  async placeBid(auctionId: number, amount: number): Promise<void> {
    try {
      await axiosInstance.post(API_ENDPOINTS.AUCTION.BID(auctionId.toString()), {
        amount
      });
    } catch (error) {
      throw new Error(handleError(error));
    }
  }

  async getUserAuctions(userId: number): Promise<Auction[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Auction[]>>(
        `/Auction/user/${userId}`
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  }

  async getActiveAuctions(): Promise<Auction[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Auction[]>>(
        '/Auction/active'
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  }

  async getEndedAuctions(): Promise<Auction[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Auction[]>>(
        '/Auction/ended'
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  }

  async searchAuctions(query: string): Promise<Auction[]> {
    try {
      const response = await axiosInstance.get<ApiResponse<Auction[]>>(
        '/Auction/search',
        { params: { query } }
      );
      return response.data.data;
    } catch (error) {
      throw new Error(handleError(error));
    }
  }
}

export const auctionService = new AuctionService(); 