import axios, { AxiosError } from 'axios';

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

export type TransactionType = 'Payment' | 'Refund';
export type TransactionStatus = 'Pending' | 'Completed' | 'Refunded' | 'Cancelled';

export interface Transaction {
  transactionId: number;
  userId: number;
  amount: number;
  transactionDate: string;
  transactionType: TransactionType;
  status: TransactionStatus;
  description: string;
  user: any | null; // Using any for now since the user type is quite large
}

export interface CreateTransactionInput {
  amount: number;
  transactionType: TransactionType;
  description: string;
}

export interface UpdateTransactionInput {
  amount?: number;
  transactionType?: TransactionType;
  description?: string;
  status?: TransactionStatus;
}

export interface DateRangeParams {
  startDate: string;
  endDate: string;
}

export const transactionService = {
  // Create a new transaction
  createTransaction: async (data: CreateTransactionInput): Promise<Transaction> => {
    const response = await axiosInstance.post('', data);
    return response.data.data;
  },

  // Get transaction by ID
  getTransactionById: async (id: number): Promise<Transaction> => {
    const response = await axiosInstance.get(`/${id}`);
    return response.data.data;
  },

  // Update transaction
  updateTransaction: async (id: number, data: UpdateTransactionInput): Promise<Transaction> => {
    const response = await axiosInstance.put(`/${id}`, data);
    return response.data.data;
  },

  // Delete transaction
  deleteTransaction: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/${id}`);
  },

  // Get transactions by date range
  getTransactionsByDateRange: async (params: DateRangeParams): Promise<Transaction[]> => {
    const response = await axiosInstance.get('/date-range', { params });
    return response.data.data;
  },

  // Get user's transactions
  getUserTransactions: async (): Promise<Transaction[]> => {
    const response = await axiosInstance.get('/user');
    return response.data.data;
  },

  // Process refund for a transaction
  refundTransaction: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post(`/${id}/refund`);
    return response.data;
  },

  // Process payment for a transaction
  processTransaction: async (id: number): Promise<{ success: boolean; message: string }> => {
    const response = await axiosInstance.post(`/${id}/process`);
    return response.data;
  }
}; 