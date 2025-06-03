import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';
import { JobCategory } from '@/types/job';
import { Job } from '@/types/job';

// API URL for JobCategory service
const API_URL = '/JobCategory'; // This uses Vite's proxy configuration

// Create a custom axios instance for job category service
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

export interface JobCategoryResponse {
  success: boolean;
  data: JobCategory[];
}

export interface CreateJobCategoryData {
  name: string;
  description: string;
  imageUrl: string;
}

export interface UpdateJobCategoryData {
  name: string;
  description: string;
  imageUrl?: string;
}

class JobCategoryService {
  // Get all job categories
  async getJobCategories(): Promise<JobCategory[]> {
    try {
      console.log('Fetching job categories from API');
      
      try {
        const response = await axiosInstance.get('/get-all');
        console.log('Job Categories API response:', response.status);
        
        if (response.data?.success && Array.isArray(response.data.data)) {
          console.log('Job Categories found in response.data.data:', response.data.data.length);
          return response.data.data;
        } else if (Array.isArray(response.data)) {
          console.log('Job Categories found directly in response.data:', response.data.length);
          return response.data;
        }
        
        return [];
      } catch (error) {
        console.error('Error fetching job categories:', error);
        return [];
      }
    } catch (error) {
      console.error('Error in getJobCategories:', error);
      return [];
    }
  }

  // Get jobs by category ID
  async getJobsByCategoryId(categoryId: string): Promise<Job[]> {
    try {
      const response = await axiosInstance.get(`/get-jobs/${categoryId}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching jobs by category:', error);
      throw error;
    }
  }

  // Get job category by ID
  async getJobCategoryById(id: number | string): Promise<JobCategory | null> {
    try {
      // Convert id to number if it's a string
      const categoryId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      console.log(`Fetching job category with ID: ${categoryId}`);
      
      try {
        const response = await axiosInstance.get(`/get/${categoryId}`);
        console.log(`Job Category ${categoryId} response status:`, response.status);
        
        if (response.data?.success && response.data.data) {
          return response.data.data;
        } else if (response.data && !response.data.success) {
          console.log('API returned success:false for job category');
          return null;
        } else {
          return response.data;
        }
      } catch (error) {
        console.log(`Error fetching job category ${categoryId}:`, error);
        return null;
      }
    } catch (error) {
      console.error(`Error in getJobCategoryById(${id}):`, error);
      return null;
    }
  }

  // For backward compatibility
  async getAllJobCategories(): Promise<JobCategory[]> {
    return this.getJobCategories();
  }

  // Create new job category (Admin only)
  async createJobCategory(data: CreateJobCategoryData): Promise<JobCategory> {
    console.log("Creating job category:", data);
    try {
      const response = await axiosInstance.post('/create', data, {
        headers: getAuthHeader()
      });
      console.log('Create job category response status:', response.status);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating job category:', error);
      throw error;
    }
  }

  // Update job category (Admin only)
  async updateJobCategory(id: string, data: UpdateJobCategoryData): Promise<JobCategory> {
    try {
      const response = await axiosInstance.put(`/update/${id}`, data, {
        headers: getAuthHeader()
      });
      console.log(`Update job category ${id} response status:`, response.status);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error updating job category ${id}:`, error);
      throw error;
    }
  }

  // Delete job category (Admin only)
  async deleteJobCategory(id: string): Promise<void> {
    try {
      const response = await axiosInstance.delete(`/delete/${id}`, {
        headers: getAuthHeader()
      });
      console.log(`Job category ${id} deleted successfully, status:`, response.status);
    } catch (error) {
      console.error(`Error deleting job category ${id}:`, error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const jobCategoryService = new JobCategoryService();
export { jobCategoryService }; 