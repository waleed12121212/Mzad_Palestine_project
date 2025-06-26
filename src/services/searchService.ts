import axios, { AxiosError } from 'axios';

// Use relative URL to work with the proxy
const API_URL = '/Search';

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
      config.headers.Authorization = `Bearer ${token}`;
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
        throw new Error('لا توجد نتائج للبحث');
      case 500:
        throw new Error('خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً');
      default:
        throw new Error('حدث خطأ غير متوقع');
    }
  }
);

// Define interfaces for search results based on the actual API response
export interface SearchListing {
  id: number;
  title: string;
  description: string;
  price: number;
  address: string;
  categoryId: number;
  categoryName: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  sellerId: number;
  sellerName: string;
}

export interface SearchAuction {
  id: number;
  title: string;
  description: string;
  address: string;
  startDate: string;
  endDate: string;
  reservePrice: number;
  currentBid: number;
  bidIncrement: number;
  winnerId: number | null;
  winnerName: string | null;
  sellerId: number;
  sellerName: string;
  status: string;
  categoryId: number;
  categoryName: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  bids: AuctionBid[];
}

export interface AuctionBid {
  id: number;
  auctionId: number;
  userId: number;
  userName: string;
  amount: number;
  bidTime: string;
  isWinningBid: boolean;
}

export interface SearchJob {
  id: number;
  title: string;
  description: string;
  salary: string;
  address: string;
  categoryId: number;
  categoryName: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  userName: string;
}

export interface SearchService {
  id: number;
  title: string;
  description: string;
  price: number;
  categoryId: number;
  categoryName: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  userId: number;
  userName: string;
}

export interface SearchUser {
  id: number;
  username: string;
  profilePicture: string | null;
  role: string;
  createdAt: string;
  isActive: boolean;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  address: string;
  dateOfBirth: string | null;
  bio: string | null;
}

export interface SearchResponse {
  listings: SearchListing[];
  auctions: SearchAuction[];
  jobs: SearchJob[];
  services: SearchService[];
  users: SearchUser[];
}

export const searchService = {
  // Search across all entities with simple query parameter
  search: async (query: string): Promise<SearchResponse> => {
    try {
      console.log(`Original query: ${query}`);
      
      // Use the raw query directly in the URL without the extra slash
      // Changed from '?q=' to directly using query parameter
      const response = await axios.get(`${API_URL}?q=${query}`, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': '*/*'
        }
      });
      console.log('Search response:', response.data);
      
      // Ensure all arrays exist even if the API doesn't return them
      const result: SearchResponse = {
        listings: response.data.listings || [],
        auctions: response.data.auctions || [],
        jobs: response.data.jobs || [],
        services: response.data.services || [],
        users: response.data.users || []
      };
      
      return result;
    } catch (error: any) {
      console.error('Search error:', error);
      throw new Error(error.message || 'حدث خطأ أثناء البحث');
    }
  }
}; 