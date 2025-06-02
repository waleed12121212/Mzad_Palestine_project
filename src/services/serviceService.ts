import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';

// API URL for Service service
const API_URL = '/NewService';

// Create a custom axios instance for service
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

export interface Service {
  id: number;
  newServiceCategoryId: number;
  title: string;
  description: string;
  price: number;
  location: string;
  contactInfo: string;
  images: string[];
}

export interface CreateServiceData {
  newServiceCategoryId: number;
  title: string;
  description: string;
  price: number;
  location: string;
  contactInfo: string;
}

class ServiceService {
  // Get all services
  async getServices(): Promise<Service[]> {
    try {
      const response = await axiosInstance.get('/get-all');
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error('Error fetching services:', error);
      return [];
    }
  }

  // Get service by ID
  async getServiceById(id: number | string): Promise<Service | null> {
    try {
      const serviceId = typeof id === 'string' ? parseInt(id, 10) : id;
      const response = await axiosInstance.get(`/get/${serviceId}`);
      return response.data?.data || response.data || null;
    } catch (error) {
      console.error(`Error fetching service ${id}:`, error);
      return null;
    }
  }

  // Create new service
  async createService(data: CreateServiceData): Promise<Service> {
    try {
      const response = await axiosInstance.post('/create', data, {
        headers: getAuthHeader()
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Error creating service:', error);
      throw error;
    }
  }

  // Delete service
  async deleteService(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/delete/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
    } catch (error) {
      console.error(`Error deleting service ${id}:`, error);
      throw error;
    }
  }

  // Get services by category ID
  async getServicesByCategoryId(categoryId: number | string): Promise<Service[]> {
    try {
      const response = await axios.get(
        `/NewServiceCategory/get-services/${categoryId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      if (Array.isArray(response.data)) {
        return response.data;
      }
      if (Array.isArray(response.data?.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      console.error(`Error fetching services by category ${categoryId}:`, error);
      return [];
    }
  }

  // Update service
  async updateService(id: number | string, data: any, token?: string): Promise<any> {
    try {
      // تحويل المعرف إلى رقم
      const serviceId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      // التحقق من صحة المعرف
      if (isNaN(serviceId)) {
        throw new Error('معرف الخدمة غير صالح');
      }

      // إعداد الهيدرز
      const headers = {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const response = await axiosInstance.put(`/update/${serviceId}`, data, { headers });
      return response.data?.data || response.data;
    } catch (error: any) {
      console.error('Error updating service:', error.response?.data || error.message);
      throw error;
    }
  }
}

// Create and export a singleton instance
const serviceService = new ServiceService();
export { serviceService }; 