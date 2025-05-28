import axios from 'axios';
import { Job, JobResponse } from '@/types/job';

const API_URL = '/job';

// إنشاء نسخة مخصصة من axios مع الإعدادات الافتراضية
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  },
  withCredentials: false
});

// إضافة معالج للطلبات
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token && config.headers) {
    // تأكد من أن التوكن يبدأ بـ "Bearer "
    const authToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    config.headers.Authorization = authToken;
  }
  
  // Remove content-type for preflight requests
  if (config.method?.toLowerCase() === 'options') {
    delete config.headers['Content-Type'];
  }
  
  return config;
}, (error) => {
  console.error('Request Error:', error);
  return Promise.reject(error);
});

// إضافة معالج للاستجابات
api.interceptors.response.use(
  (response) => {
    // Check if response has the expected format
    if (response.data && typeof response.data === 'object') {
      // If the response is already in the expected format, return it
      if ('data' in response.data && 'success' in response.data) {
        return response;
      }
      // If the response is an array, wrap it in the expected format
      if (Array.isArray(response.data)) {
        response.data = {
          data: response.data,
          success: true,
          message: 'تم جلب البيانات بنجاح'
        };
      }
    }
    return response;
  },
  (error) => {
    if (error.response) {
      // معالجة أخطاء الاستجابة
      console.error('API Error:', error.response.data);
      throw new Error(error.response.data.message || 'حدث خطأ في الخادم');
    } else if (error.request) {
      // معالجة أخطاء الشبكة
      console.error('Network Error:', error.request);
      throw new Error('فشل الاتصال بالخادم');
    } else {
      // معالجة الأخطاء الأخرى
      console.error('Error:', error.message);
      throw error;
    }
  }
);

export const jobService = {
  createJob: async (data: Omit<Job, "id">): Promise<Job> => {
    try {
      const response = await api.post<JobResponse>('/create', {
        jobCategoryId: data.jobCategoryId,
        title: data.title,
        description: data.description,
        companyName: data.companyName,
        location: data.location,
        jobType: data.jobType,
        experienceLevel: data.experienceLevel,
        salary: data.salary,
        requirements: data.requirements,
        benefits: data.benefits,
        contactInfo: data.contactInfo
      });
      return response.data.data[0];
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  },

  getAllJobs: async (): Promise<Job[]> => {
    try {
      const response = await api.get<JobResponse>('/get-all');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  getJobById: async (id: number): Promise<Job> => {
    try {
      const response = await api.get<JobResponse>(`/get/${id}`);
      if (Array.isArray(response.data.data)) {
        return response.data.data[0];
      }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  },

  updateJob: async (id: number, data: Omit<Job, "id">): Promise<Job> => {
    try {
      const response = await api.put<JobResponse>(`/update/${id}`, {
        jobCategoryId: data.jobCategoryId,
        title: data.title,
        description: data.description,
        companyName: data.companyName,
        location: data.location,
        jobType: data.jobType,
        experienceLevel: data.experienceLevel,
        salary: data.salary,
        requirements: data.requirements,
        benefits: data.benefits,
        contactInfo: data.contactInfo
      });
      return response.data.data[0];
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  },

  deleteJob: async (id: number): Promise<void> => {
    try {
      await api.delete<JobResponse>(`/delete/${id}`);
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }
}; 