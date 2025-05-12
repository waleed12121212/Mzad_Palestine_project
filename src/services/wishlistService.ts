import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';
import { toast } from '@/hooks/use-toast';

const API_URL = '/Wishlist';

export interface WishlistResponse {
  id: number;
  userId: number;
  listingId: number;
  addedAt: string;
}

export interface WishlistItem {
  id: number;
  listingId: number;
  userId: string;
  listing: {
    id: number;
    title: string;
    description: string;
    startingPrice: number;
    currentPrice: number;
    images: string[];
    endDate: string;
  };
}

class WishlistService {
  async getWishlist(): Promise<WishlistItem[]> {
    try {
      // First, get the wishlist items
      const response = await axios.get<WishlistResponse[]>(API_URL, {
        headers: getAuthHeader()
      });

      // Then, fetch the listing details for each item
      const wishlistItems = await Promise.all(
        response.data.map(async (item) => {
          try {
            const listingResponse = await axios.get(`/Listing/${item.listingId}`, {
              headers: getAuthHeader()
            });

            return {
              id: item.id,
              listingId: item.listingId,
              userId: item.userId.toString(),
              listing: {
                id: listingResponse.data.id,
                title: listingResponse.data.title || listingResponse.data.name,
                description: listingResponse.data.description,
                startingPrice: listingResponse.data.startingPrice || listingResponse.data.reservePrice,
                currentPrice: listingResponse.data.currentPrice || listingResponse.data.currentBid || listingResponse.data.startingPrice,
                images: listingResponse.data.images || [listingResponse.data.imageUrl],
                endDate: listingResponse.data.endDate || listingResponse.data.endTime
              }
            };
          } catch (error) {
            console.error(`Error fetching listing ${item.listingId}:`, error);
            return null;
          }
        })
      );

      // Filter out any failed listing fetches
      return wishlistItems.filter(item => item !== null);
    } catch (error: any) {
      console.error('Get wishlist error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
      toast({
        title: "فشل في تحميل المفضلة",
        variant: "destructive",
      });
      throw error;
    }
  }

  async addToWishlist(listingId: number): Promise<WishlistResponse> {
    try {
      const headers = getAuthHeader();
      console.log('Adding to wishlist:', {
        listingId,
        headers,
        url: `${API_URL}/${listingId}`
      });

      const response = await axios({
        method: 'POST',
        url: `${API_URL}/${listingId}`,
        headers: {
          ...headers,
          'Accept': 'application/json'
        }
      });
      
      console.log('Add to wishlist response:', response.data);
      
      if (response.data) {
        toast({
          title: "تمت إضافة المزاد للمفضلة",
          description: "يمكنك الوصول للمفضلة من حسابك الشخصي"
        });
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Add to wishlist error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        requestHeaders: error.config?.headers
      });

      if (error.response?.status === 401) {
        toast({
          title: "يرجى تسجيل الدخول أولاً",
          variant: "destructive"
        });
      } else if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || 'هذا المزاد موجود بالفعل في المفضلة';
        toast({
          title: errorMessage,
          variant: "destructive"
        });
      } else {
        toast({
          title: "فشل في إضافة العنصر للمفضلة",
          variant: "destructive"
        });
      }
      throw error;
    }
  }

  async removeFromWishlist(listingId: number): Promise<void> {
    try {
      const headers = getAuthHeader();
      console.log('Removing from wishlist:', {
        listingId,
        headers,
        url: `${API_URL}/${listingId}`
      });

      await axios({
        method: 'DELETE',
        url: `${API_URL}/${listingId}`,
        headers: {
          ...headers,
          'Accept': 'application/json'
        }
      });
      
      toast({
        title: "تمت إزالة المزاد من المفضلة",
        description: "يمكنك إضافته مرة أخرى في أي وقت"
      });
    } catch (error: any) {
      console.error('Remove from wishlist error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        requestHeaders: error.config?.headers
      });

      if (error.response?.status === 401) {
        toast({
          title: "يرجى تسجيل الدخول أولاً",
          variant: "destructive"
        });
      } else if (error.response?.status === 404) {
        toast({
          title: "هذا المزاد غير موجود في المفضلة",
          variant: "destructive"
        });
      } else {
        toast({
          title: "فشل في إزالة العنصر من المفضلة",
          variant: "destructive"
        });
      }
      throw error;
    }
  }

  async isInWishlist(listingId: number): Promise<boolean> {
    try {
      const wishlist = await this.getWishlist();
      return wishlist.some(item => item.listingId === listingId);
    } catch (error) {
      return false;
    }
  }
}

export const wishlistService = new WishlistService(); 