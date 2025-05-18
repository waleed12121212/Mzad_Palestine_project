import axios, { AxiosError } from 'axios';

// Use the environment variable for API URL
const API_URL = '/User';

// Create a custom axios instance
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
      config.headers.Authorization = token; // بدون Bearer
    }
    // Remove content-type for preflight
    if (config.method === 'options') {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    // Handle network errors
    if (!axiosError.response) {
      if (axiosError.message === 'Network Error' || axiosError.message === 'net::ERR_INTERNET_DISCONNECTED') {
        throw new Error('لا يوجد اتصال بالإنترنت. يرجى التحقق من اتصالك بالإنترنت والمحاولة مرة أخرى');
      }
      throw new Error('خطأ في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت الخاص بك');
    }
    // Handle API errors
    if (axiosError.response?.data?.message) {
      throw new Error(axiosError.response.data.message);
    }
    // Handle specific error codes
    switch (axiosError.response.status) {
      case 400:
        throw new Error('البيانات المدخلة غير صحيحة');
      case 401:
        throw new Error('غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى');
      case 403:
        throw new Error('ليس لديك صلاحية للقيام بهذا الإجراء');
      case 404:
        throw new Error('المورد المطلوب غير موجود');
      case 409:
        throw new Error('يوجد تعارض في البيانات');
      case 422:
        throw new Error('البيانات المدخلة غير صالحة');
      case 500:
        throw new Error('خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً');
      default:
        throw new Error('حدث خطأ غير متوقع');
    }
  }
);

export interface UserProfile {
  id: number;
  username: string;
  profilePicture: string | null;
  role: 'User' | 'Admin';
  createdAt: string;
  isActive: boolean;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address: string;
  dateOfBirth: string | null;
  bio: string | null;
  rating?: number;
  totalSales?: number;
}

export interface UpdateProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  address: string;
  bio?: string;
  dateOfBirth?: string;
}

export const userService = {
  // Get current user profile
  getCurrentUser: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get('/current');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await axiosInstance.put('/profile', data);
    return response.data;
  },

  // Upload profile picture
  uploadProfilePicture: async (file: File): Promise<{ imageUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post('/profile-picture', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get all users (admin only)
  getAllUsers: async (): Promise<UserProfile[]> => {
    const response = await axiosInstance.get('/');
    return response.data;
  },

  // Get user by ID (admin only)
  getUserById: async (id: string): Promise<{ success: boolean, data: UserProfile }> => {
    const response = await axiosInstance.get(`/${id}`);
    return response.data;
  },

  // Update user role (admin only)
  updateUserRole: async (userId: string, newRole: 'User' | 'Admin'): Promise<UserProfile> => {
    const response = await axiosInstance.put(`/${userId}/role`, { newRole });
    return response.data;
  },

  // Delete user (admin only)
  deleteUser: async (userId: string): Promise<void> => {
    await axiosInstance.delete(`/${userId}`);
  },

  // Get user profile by user ID
  getUserProfileByUserId: async (userId: number): Promise<{
    success: boolean;
    data: {
      id: number;
      username: string;
      email: string;
      phoneNumber: string;
      profilePicture: string;
      location: string;
      joinDate: string;
    }
  }> => {
    const response = await axiosInstance.get(`/profile/${userId}`);
    return response.data;
  },
};