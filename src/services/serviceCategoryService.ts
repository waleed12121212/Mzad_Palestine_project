import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';

// API URL for ServiceCategory service
const API_URL = '/NewServiceCategory';

// Create a custom axios instance for service category
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  },
  withCredentials: false
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

export interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  imageUrl: string;
}

export interface CreateServiceCategoryData {
  name: string;
  description: string;
  imageUrl: string;
}

export interface UpdateServiceCategoryData {
  name: string;
  description: string;
  imageUrl: string;
}

class ServiceCategoryService {
  // Get all service categories
  async getServiceCategories(): Promise<ServiceCategory[]> {
    try {
      const response = await axiosInstance.get('/get-all');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching service categories:', error);
      return [];
    }
  }

  // Get service category by ID
  async getServiceCategoryById(id: number | string): Promise<ServiceCategory | null> {
    try {
      const categoryId = typeof id === 'string' ? parseInt(id, 10) : id;
      const response = await axiosInstance.get(`/get/${categoryId}`);
      return response.data?.data || response.data || null;
    } catch (error) {
      console.error(`Error fetching service category ${id}:`, error);
      return null;
    }
  }

  // Create new service category (Admin only)
  async createServiceCategory(data: CreateServiceCategoryData): Promise<ServiceCategory> {
    try {
      const response = await axiosInstance.post('/create', data, {
        headers: getAuthHeader()
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error creating service category:', error);
      throw error;
    }
  }

  // Update service category (Admin only)
  async updateServiceCategory(id: string, data: UpdateServiceCategoryData): Promise<ServiceCategory> {
    try {
      const response = await axiosInstance.put(`/update/${id}`, data, {
        headers: getAuthHeader()
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error(`Error updating service category ${id}:`, error);
      throw error;
    }
  }

  // Delete service category (Admin only)
  async deleteServiceCategory(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/delete/${id}`, {
        headers: getAuthHeader()
      });
    } catch (error) {
      console.error(`Error deleting service category ${id}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const serviceCategoryService = new ServiceCategoryService();
export { serviceCategoryService }; 