import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';

// API URL for Category service
const API_URL = '/Category'; // This uses Vite's proxy configuration

// Create a custom axios instance for category service
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
    // Get token from localStorage if it exists
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

export interface Category {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  parentCategoryId?: number | null;
  parentCategory?: string | null;
  isActive?: boolean;
  listingsCount?: number;
  listingCount: number;
  auctionCount: number;
  listingIds: number[];
  auctionIds: number[];
  subCategories?: Category[];
  listings?: any[];
  createdAt?: string;
  updatedAt?: string | null;
}

export interface CategoryResponse {
  success: boolean;
  data: Category[];
}

export interface CreateCategoryData {
  name: string;
  description: string;
  imageUrl: string;
  parentCategoryId: string | null;
}

export interface UpdateCategoryData {
  name: string;
  description: string;
}

class CategoryService {
  // Get all categories
  async getCategories(): Promise<Category[]> {
    try {
      console.log('Fetching categories from API');
      
      try {
        // Based on Postman, the endpoint is /Category/get-all
        const response = await axiosInstance.get('/get-all');
        console.log('Categories API response:', response.status);
        
        if (response.data?.success && Array.isArray(response.data.data)) {
          console.log('Categories found in response.data.data:', response.data.data.length);
          return response.data.data;
        } else if (Array.isArray(response.data)) {
          console.log('Categories found directly in response.data:', response.data.length);
          return response.data;
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    } catch (error) {
      console.error('Error in getCategories:', error);
      return [];
    }
  }

  // Get category by ID
  async getCategoryById(id: number | string): Promise<Category | null> {
    try {
      // Convert id to number if it's a string
      const categoryId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      console.log(`Fetching category with ID: ${categoryId}`);
      
      // Based on Postman, the endpoint is /Category/get/1
      try {
        const response = await axiosInstance.get(`/get/${categoryId}`);
        console.log(`Category ${categoryId} response status:`, response.status);
        
        if (response.data?.success && response.data.data) {
          return response.data.data;
        } else if (response.data && !response.data.success) {
          console.log('API returned success:false for category');
          return null;
        } else {
          return response.data;
        }
      } catch (error) {
        console.log(`Error fetching category ${categoryId}:`, error);
        return null;
      }
    } catch (error) {
      console.error(`Error in getCategoryById(${id}):`, error);
      return null;
    }
  }

  // For backward compatibility
  async getAllCategories(): Promise<Category[]> {
    return this.getCategories();
  }

  // Active categories
  async getActiveCategories(): Promise<Category[]> {
    try {
      const response = await axiosInstance.get('/active');
      console.log('Active categories response status:', response.status);
      
      if (response.data?.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching active categories:', error);
      return this.getCategories(); // Fallback to regular categories
    }
  }

  // Get subcategories by parent ID
  async getSubcategoriesByParentId(parentId: string): Promise<Category[]> {
    try {
      console.log(`Fetching subcategories for parent ID: ${parentId}`);
      const parentIdNum = parseInt(parentId, 10);
      
      // Based on Postman, the endpoint is /Category/by-parent/2
      try {
        const response = await axiosInstance.get(`/by-parent/${parentId}`, {
          headers: getAuthHeader()
        });
        console.log(`Subcategories response status:`, response.status);
        
        if (response.data?.success && Array.isArray(response.data.data)) {
          return response.data.data;
        } else if (Array.isArray(response.data)) {
          return response.data;
        }
        
        return [];
      } catch (error) {
        console.log(`Error fetching subcategories for parent ${parentId}:`, error);
        
        // Fallback: get all categories and filter
        const categories = await this.getCategories();
        return categories.filter(c => c.parentCategoryId === parentIdNum);
      }
    } catch (error) {
      console.error(`Error in getSubcategoriesByParentId(${parentId}):`, error);
      return [];
    }
  }

  // Create new category (Admin only)
  async createCategory(data: CreateCategoryData): Promise<Category> {
    console.log("Creating category:", data);
    try {
      // Based on Postman, the endpoint is /Category/Create
      const response = await axiosInstance.post('/Create', data, {
        headers: getAuthHeader()
      });
      console.log('Create category response status:', response.status);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Update category (Admin only)
  async updateCategory(id: string, data: UpdateCategoryData): Promise<Category> {
    try {
      // Based on Postman, the endpoint is /Category/update/18
      const response = await axiosInstance.put(`/update/${id}`, data, {
        headers: getAuthHeader()
      });
      console.log(`Update category ${id} response status:`, response.status);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating category ${id}:`, error);
      throw error;
    }
  }

  // Delete category (Admin only)
  async deleteCategory(id: string): Promise<void> {
    try {
      // Based on Postman, the endpoint is /Category/delete/17
      const response = await axiosInstance.delete(`/delete/${id}`, {
        headers: getAuthHeader()
      });
      console.log(`Category ${id} deleted successfully, status:`, response.status);
    } catch (error) {
      console.error(`Error deleting category ${id}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const categoryService = new CategoryService();
export { categoryService }; 