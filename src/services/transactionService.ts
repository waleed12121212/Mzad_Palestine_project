import axios, { AxiosError } from 'axios';
import {
  Transaction,
  CreateTransactionInput,
  UpdateTransactionInput,
  FilterTransactionParams,
  ApiResponse,
  TotalAmountResponse,
  TransactionType,
  TransactionStatus
} from '@/types/transaction';

// Use relative URL to work with the proxy
const API_URL = '/Transaction';

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
      config.headers.Authorization = token;
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

export const transactionService = {
  // Create a new transaction
  createTransaction: async (data: CreateTransactionInput): Promise<Transaction> => {
    const response = await axiosInstance.post('', data);
    return response.data.data;
  },

  // Get transaction by ID
  getTransactionById: async (id: number): Promise<Transaction> => {
    const response = await axiosInstance.get<ApiResponse<Transaction>>(`/${id}`);
    return response.data.data;
  },

  // Update transaction
  updateTransaction: async (id: number, data: UpdateTransactionInput): Promise<Transaction> => {
    const response = await axiosInstance.put<ApiResponse<Transaction>>(`/${id}`, data);
    return response.data.data;
  },

  // Get user's transactions
  getUserTransactions: async (id?: number): Promise<Transaction[]> => {
    try {
      // Get current user ID from localStorage if not provided
      if (!id) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        id = user.id; // Get user ID from the stored user object
      }
      
      if (!id) {
        throw new Error('لم يتم العثور على معرف المستخدم');
      }
      
      const response = await axiosInstance.get<ApiResponse<Transaction[]>>(`/user/${id}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  },

  // Get auction transactions
  getAuctionTransactions: async (auctionId: number): Promise<Transaction[]> => {
    const response = await axiosInstance.get<ApiResponse<Transaction[]>>(`/auction/${auctionId}`);
    return response.data.data;
  },

  // Get listing transactions
  getListingTransactions: async (listingId: number): Promise<Transaction[]> => {
    const response = await axiosInstance.get<ApiResponse<Transaction[]>>(`/listing/${listingId}`);
    return response.data.data;
  },

  // Process refund for a transaction
  refundTransaction: async (id: number): Promise<ApiResponse<any>> => {
    const response = await axiosInstance.post<ApiResponse<any>>(`/${id}/refund`);
    return response.data;
  },

  // Get total amount of transactions
  getTotalAmount: async (): Promise<number> => {
    try {
      const response = await axiosInstance.get<TotalAmountResponse>('/total');
      // Always return a number, never undefined
      if (response.data && response.data.data && typeof response.data.data.total === 'number') {
        return response.data.data.total;
      }
      return 0;
    } catch (error) {
      // Optionally log the error
      console.error('Error fetching total amount:', error);
      return 0;
    }
  },

  // Filter transactions by status and date range
  filterTransactions: async (params: FilterTransactionParams): Promise<Transaction[]> => {
    const response = await axiosInstance.get<ApiResponse<Transaction[]>>('/filter', { params });
    return response.data.data;
  }
}; 