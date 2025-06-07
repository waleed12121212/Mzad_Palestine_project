import axios, { AxiosError } from 'axios';

// Use relative URL to work with the proxy
const API_URL = '/Payment';

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

// TypeScript interfaces
export interface Payment {
  id: number;
  userId: number;
  auctionId: number | null;
  listingId: number | null;
  amount: number;
  paymentMethod: string;
  status: string;
  transactionId: string | null;
  notes: string;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateListingPaymentDto {
  listingId: number;
  amount: number;
  paymentMethod: string;
  notes: string;
  transactionId?: string;
}

export interface CreateAuctionPaymentDto {
  auctionId: number;
  amount: number;
  paymentMethod: string;
  notes: string;
  transactionId?: string;
}

export interface UpdatePaymentDto {
  amount?: number;
  paymentMethod?: string;
  notes?: string;
}

export interface PaymentResponse {
  success: boolean;
  data: Payment | Payment[];
}

export interface ConfirmPaymentDto {
  paymentIntentId: string;
}

class PaymentService {
  // Create a listing payment
  async createListingPayment(data: CreateListingPaymentDto): Promise<Payment> {
    try {
      console.log('Creating listing payment:', data);
      console.log('Listing payment transactionId:', data.transactionId);
      
      const response = await axiosInstance.post<PaymentResponse>('/listing/' + data.listingId, {
        listingId: data.listingId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        transactionId: data.transactionId
      });
      
      console.log('Payment creation response:', response.data);
      console.log('Payment response data with transactionId:', 
        (response.data.data as Payment).transactionId);
      
      if (!response.data || !response.data.data) {
        throw new Error('Invalid response from payment creation');
      }
      
      return response.data.data as Payment;
    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  }

  // Create an auction payment
  async createAuctionPayment(data: CreateAuctionPaymentDto): Promise<Payment> {
    console.log('Creating auction payment:', data);
    console.log('Auction payment transactionId:', data.transactionId);
    
    const response = await axiosInstance.post<PaymentResponse>('/auction/' + data.auctionId, {
      auctionId: data.auctionId,
      amount: data.amount,
      paymentMethod: data.paymentMethod,
      notes: data.notes,
      transactionId: data.transactionId
    });
    
    console.log('Auction payment creation response:', response.data);
    console.log('Auction payment response data with transactionId:', 
      (response.data.data as Payment).transactionId);
    
    return response.data.data as Payment;
  }

  // Get listing payment
  async getListingPayment(listingId: number): Promise<Payment[]> {
    const response = await axiosInstance.get<PaymentResponse>(`/listing/${listingId}`);
    return response.data.data as Payment[];
  }

  // Get auction payment
  async getAuctionPayment(auctionId: number): Promise<Payment[]> {
    const response = await axiosInstance.get<PaymentResponse>(`/auction/${auctionId}`);
    return response.data.data as Payment[];
  }

  // Get payment by ID
  async getPaymentById(id: number): Promise<Payment> {
    const response = await axiosInstance.get<PaymentResponse>(`/${id}`);
    return response.data.data as Payment;
  }

  // Update payment
  async updatePayment(id: number, data: UpdatePaymentDto): Promise<Payment> {
    console.log('[updatePayment] PUT', `${API_URL}/${id}`, data);
    const response = await axiosInstance.put<PaymentResponse>(`/${id}`, data);
    console.log('[updatePayment] response', response.data);
    return response.data.data as Payment;
  }

  // Delete payment
  async deletePayment(id: number): Promise<void> {
    await axiosInstance.delete(`/${id}`);
  }

  // Get user payments
  async getUserPayments(): Promise<Payment[]> {
    const response = await axiosInstance.get<PaymentResponse>('/user');
    return response.data.data as Payment[];
  }

  // Verify payment
  async verifyPayment(id: number): Promise<Payment> {
    const response = await axiosInstance.post<PaymentResponse>(`/verify/${id}`);
    return response.data.data as Payment;
  }

  // Confirm payment
  async confirmPayment(data: ConfirmPaymentDto): Promise<Payment> {
    const response = await axiosInstance.post<PaymentResponse>('/confirm', data);
    return response.data.data as Payment;
  }
}

export const paymentService = new PaymentService(); 