import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';
import { toast } from '@/hooks/use-toast';

// Fix: Correct API URLs for production and development
const BASE_API_URL = 'http://mzadpalestine.runasp.net';
const API_URL = '/Listing'; // Use relative path for API requests

// Create a custom axios instance with resilient configuration
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  },
  withCredentials: false
});

// Add request interceptor for auth
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

// Define image base URL for consistent referencing
const IMAGE_BASE_URL = BASE_API_URL;

// Helper to ensure image URLs are properly formatted
const formatImageUrl = (url: string): string => {
  if (!url) return '/placeholder.svg';
  
  // If it's already a full URL, return it
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative URL, add the base URL
  if (url.startsWith('/')) {
    return `${IMAGE_BASE_URL}${url}`;
  }
  
  // Otherwise assume it needs the base URL and a slash
  return `${IMAGE_BASE_URL}/${url}`;
};

// Fix listing images when getting data from API
const processListingData = (listing: any): Listing => {
  if (!listing) return null;
  
  console.log('Processing listing:', listing);
  
  // Handle the API response format - check if data is nested
  const listingData = listing.data || listing;
  
  return {
    ...listingData,
    // Ensure images array exists and URLs are properly formatted
    images: Array.isArray(listingData.images) 
      ? listingData.images.map(formatImageUrl)
      : []
  };
};

// Process listing array
const processListingsData = (listings: any[]): Listing[] => {
  if (!listings || !Array.isArray(listings)) return [];
  
  // Check if data is nested in a data property - handling object with success/data properties
  if (listings.length === 1 && typeof listings[0] === 'object' && 'success' in listings[0] && 'data' in listings[0]) {
    const responseData = listings[0].data;
    return Array.isArray(responseData) ? responseData.map(processListingData) : [];
  }
  
  return listings.map(processListingData);
};

// Function to try multiple URL patterns to find the working one
const tryMultipleUrls = async (id: number): Promise<any> => {
  const urls = [
    { method: 'axiosInstance', url: `/${id}` },
    { method: 'relativeAPI', url: `${API_URL}/${id}` },
    { method: 'absoluteAPI', url: `${BASE_API_URL}/api/Listing/${id}` },
    { method: 'absoluteAPI2', url: `${BASE_API_URL}/Listing/${id}` }
  ];
  
  let lastError = null;
  
  for (const endpoint of urls) {
    try {
      console.log(`Trying ${endpoint.method} with URL: ${endpoint.url}`);
      
      let response;
      if (endpoint.method === 'axiosInstance') {
        response = await axiosInstance.get(endpoint.url);
      } else {
        response = await axios.get(endpoint.url, { headers: getAuthHeader() });
      }
      
      console.log(`${endpoint.method} succeeded with status:`, response.status);
      return response;
    } catch (error) {
      console.warn(`${endpoint.method} failed:`, error.message);
      lastError = error;
    }
  }
  
  // If we get here, all attempts failed
  throw lastError;
};

export interface Listing {
  listingId: number;
  userId: string;
  userName: string;
  title: string;
  description: string;
  categoryId: number;
  categoryName: string;
  subcategoryId?: number;
  subcategoryName?: string;
  price: number;
  images: string[];
  address: string;
  isActive: boolean;
  createdAt: string;
  endDate: string;
  viewCount: number;
  latitude?: number;
  longitude?: number;
}

export interface CreateListingDto {
  title: string;
  description: string;
  address: string;
  price: number;
  categoryId: number;
  endDate: string;
  images: string[];
}

export interface UpdateListingDto {
  title?: string;
  description?: string;
  address?: string;
  price?: number;
  categoryId?: number;
  endDate?: string;
  newImages?: string[];
  imagesToDelete?: string[];
}

export interface SearchListingParams {
  keyword?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  startDate?: string;
  endDate?: string;
  status?: string;
  userId?: number;
}

class ListingService {
  async createListing(data: CreateListingDto): Promise<Listing> {
    console.log('Creating listing with data:', JSON.stringify(data, null, 2));
    
    try {
      const response = await axios.post(API_URL, data, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      toast({
        title: "تم إنشاء الإعلان بنجاح",
        description: "تم نشر الإعلان بنجاح"
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Listing creation error:', {
        status: error.response?.status,
        data: error.response?.data
      });
      
      toast({
        title: "فشل في إنشاء الإعلان",
        variant: "destructive",
        description: error.response?.data?.message || "حدث خطأ أثناء إنشاء الإعلان"
      });
      
      throw error;
    }
  }

  async getListings(): Promise<Listing[]> {
    try {
      console.log('Fetching all listings');
      const response = await axios.get(API_URL);
      return processListingsData(response.data);
    } catch (error: any) {
      console.error('Get listings error:', error);
      return [];
    }
  }

  async getListingById(id: number): Promise<Listing | null> {
    try {
      console.log(`Fetching listing with ID: ${id}`);
      
      const url = `${API_URL}/${id}`;
      const response = await axios.get(url, {
        headers: getAuthHeader()
      });
      
      if (!response || !response.data) {
        console.error('API returned empty data for listing', id);
        return null;
      }
      
      return processListingData(response.data);
    } catch (error: any) {
      console.error(`Get listing ${id} error:`, error);
      return null;
    }
  }

  async getUserListings(userId: number): Promise<Listing[]> {
    try {
      const response = await axios.get(`${API_URL}/user/${userId}`, {
        headers: getAuthHeader()
      });
      return processListingsData(response.data);
    } catch (error: any) {
      console.error(`Get user ${userId} listings error:`, error);
      if (error.response?.status === 401) {
        console.log('User not authenticated for fetching listings');
        // Return empty array instead of throwing error for 401
        return [];
      }
      throw error;
    }
  }

  async updateListing(id: number, data: UpdateListingDto): Promise<Listing> {
    try {
      const response = await axios.put(`${API_URL}/${id}`, data, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      
      toast({
        title: "تم تحديث الإعلان بنجاح",
      });
      
      return processListingData(response.data);
    } catch (error: any) {
      console.error(`Update listing ${id} error:`, error);
      
      toast({
        title: "فشل في تحديث الإعلان",
        variant: "destructive",
        description: error.response?.data?.message || "حدث خطأ أثناء تحديث الإعلان"
      });
      
      throw error;
    }
  }

  async deleteListing(id: number): Promise<void> {
    try {
      await axios.delete(`${API_URL}/${id}`, {
        headers: getAuthHeader()
      });
      
      toast({
        title: "تم حذف الإعلان بنجاح",
      });
    } catch (error: any) {
      console.error(`Delete listing ${id} error:`, error);
      
      toast({
        title: "فشل في حذف الإعلان",
        variant: "destructive",
        description: error.response?.data?.message || "حدث خطأ أثناء حذف الإعلان"
      });
      
      throw error;
    }
  }

  async getListingsByCategory(categoryId: number): Promise<Listing[]> {
    try {
      const response = await axios.get(`${API_URL}/category/${categoryId}`, {
        headers: getAuthHeader()
      });
      return processListingsData(response.data);
    } catch (error: any) {
      console.error(`Get listings by category ${categoryId} error:`, error);
      throw error;
    }
  }

  async getActiveListings(): Promise<Listing[]> {
    try {
      const response = await axios.get(`${API_URL}/active`, {
        headers: getAuthHeader()
      });
      return processListingsData(response.data);
    } catch (error: any) {
      console.error('Get active listings error:', error);
      if (error.response?.status === 401) {
        console.log('User not authenticated for active listings');
        // Return empty array instead of throwing error
        return [];
      }
      throw error;
    }
  }
  
  async searchListings(params: SearchListingParams): Promise<Listing[]> {
    try {
      // If no search parameters, just get all listings
      if (!params.keyword && !params.category && 
          params.minPrice === undefined && params.maxPrice === undefined) {
        console.log('No search parameters, getting all listings');
        return this.getListings();
      }
      
      // Get all listings and filter them client-side for now
      const allListings = await this.getListings();
      console.log(`Got ${allListings.length} listings, filtering...`);
      
      // Filter the listings based on search params
      return allListings.filter(listing => {
        // Filter by keyword - SEARCH ONLY IN TITLE
        if (params.keyword && 
            !listing.title.toLowerCase().includes(params.keyword.toLowerCase())) {
          return false;
        }
        
        // Filter by category
        if (params.category && listing.categoryName !== params.category) {
          return false;
        }
        
        // Filter by price range
        if (params.minPrice !== undefined && listing.price < params.minPrice) {
          return false;
        }
        
        if (params.maxPrice !== undefined && listing.price > params.maxPrice) {
          return false;
        }
        
        return true;
      });
    } catch (error: any) {
      console.error('Search listings error:', error);
      return [];
    }
  }
  
  async purchaseListing(listingId: number): Promise<any> {
    try {
      // First, call the purchase endpoint
      const purchaseResponse = await axios.post(`${API_URL}/${listingId}`, {}, {
        headers: getAuthHeader()
      });
      
      // Create a payment for this listing with correct payload structure
      const paymentResponse = await axios.post('/Payment/listing/' + listingId, {
        amount: purchaseResponse.data.price || 0,
        type: "ListingPayment",
        description: `دفع المنتج: ${purchaseResponse.data.title || ''}`,
        auctionId: listingId,
        paymentMethod: 'CreditCard'
      }, {
        headers: getAuthHeader()
      });
      
      toast({
        title: "تم بدء عملية الشراء",
        description: "سيتم توجيهك إلى صفحة الدفع"
      });
      
      // Return both responses, with payment ID for redirection
      return {
        purchase: purchaseResponse.data,
        paymentId: paymentResponse.data.data.id || null
      };
    } catch (error: any) {
      console.error(`Purchase listing ${listingId} error:`, error);
      
      if (error.response?.status === 401) {
        toast({
          title: "يرجى تسجيل الدخول أولاً",
          variant: "destructive"
        });
      } else if (error.response?.status === 400) {
        toast({
          title: error.response?.data?.message || "لا يمكن شراء هذا المنتج",
          variant: "destructive"
        });
      } else {
        toast({
          title: "فشل في عملية الشراء",
          variant: "destructive"
        });
      }
      
      throw error;
    }
  }

  async getPublicListings(): Promise<Listing[]> {
    return this.getListings();
  }
}

export const listingService = new ListingService(); 