import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';

const API_URL = '/Listing';

export interface Listing {
  id: number;
  listingId?: number;
  title: string;
  description: string;
  startingPrice: number;
  categoryId: number;
  endDate: string;
  images: string[];
  userId: string;
}

export interface CreateListingDto {
  title: string;
  description: string;
  startingPrice: number;
  categoryId: number;
  endDate: string;
  images: string[];
  userId: string;
}

export interface UpdateListingDto {
  title?: string;
  description?: string;
  startingPrice?: number;
  categoryId?: number;
  endDate?: string;
  images?: string[];
  status?: 'active' | 'closed';
}

class ListingService {
  async createListing(data: CreateListingDto): Promise<Listing> {
    console.log('Creating listing with data:', JSON.stringify(data, null, 2));
    console.log('Request headers:', {
      ...getAuthHeader(),
      'Content-Type': 'application/json'
    });

    try {
      const response = await axios.post(API_URL, data, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      console.log('Listing creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Listing creation error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      });
      throw error;
    }
  }

  async getListings(): Promise<Listing[]> {
    const response = await axios.get(API_URL, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async getListingById(id: number): Promise<Listing> {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async getUserListings(userId: number): Promise<Listing[]> {
    const response = await axios.get(`${API_URL}/user/${userId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async updateListing(id: number, data: UpdateListingDto): Promise<Listing> {
    const response = await axios.put(`${API_URL}/${id}`, data, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  async deleteListing(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
  }

  async getListingsByCategory(categoryId: number): Promise<Listing[]> {
    const response = await axios.get(`${API_URL}/category/${categoryId}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async getActiveListings(): Promise<Listing[]> {
    const response = await axios.get(`${API_URL}/active`, {
      headers: getAuthHeader()
    });
    return response.data;
  }
}

export const listingService = new ListingService(); 