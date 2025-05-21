import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';
import { toast } from '@/hooks/use-toast';
import { Category } from './categoryService';

const API_URL = '/Wishlist';

export interface WishlistResponse {
  id: number;
  userId: number;
  listingId: number | null;
  auctionId: number | null;
  addedAt: string;
}

export interface WishlistItem {
  id: number;
  listingId: number;
  userId: string;
  type: 'auction' | 'listing';
  listing: {
    id: number;
    title: string;
    description: string;
    startingPrice: number;
    currentPrice: number;
    images: string[];
    endDate: string | null;
    categoryId?: number;
    categoryName?: string;
  };
  category?: Category;
}

class WishlistService {
  async getWishlist(): Promise<WishlistItem[]> {
    try {
      // First, get the wishlist items
      const response = await axios.get(API_URL, {
        headers: getAuthHeader()
      });

      console.log('Wishlist API response:', {
        type: typeof response.data,
        isArray: Array.isArray(response.data?.data),
        data: response.data
      });

      // Use the data property if it exists (API returns { success: true, data: [...] })
      const items = response.data?.data || response.data;
      
      if (!Array.isArray(items)) {
        console.warn('Wishlist response is not an array:', items);
        return [];
      }

      // Filter out items with neither listingId nor auctionId
      const validItems = items.filter(item => item && (item.listingId || item.auctionId));
      
      if (validItems.length < items.length) {
        console.warn(`Filtered out ${items.length - validItems.length} wishlist items with no IDs`);
      }

      // Try to get all categories - we'll use this to enrich the wishlist items
      let categories = [];
      try {
        const categoriesResponse = await axios.get('/Category/get-all');
        if (categoriesResponse.data?.success && Array.isArray(categoriesResponse.data.data)) {
          categories = categoriesResponse.data.data;
        }
      } catch (error) {
        console.error('Error fetching categories for wishlist:', error);
      }

      // Then, fetch the details for each item
      const wishlistItems = await Promise.all(
        validItems.map(async (item) => {
          console.log('Processing wishlist item:', item);
          
          // Determine if this is an auction or listing item
          const isAuction = !!item.auctionId;
          const targetId = isAuction ? item.auctionId : item.listingId;
          
          // Different endpoints based on type
          let endpoint = '';
          if (isAuction) {
            endpoint = `/Auction/${targetId}`;
          } else {
            // For listings, there might be a different endpoint structure
            endpoint = `/Listing/${targetId}`;
          }
          
          console.log(`Fetching ${isAuction ? 'auction' : 'listing'} details from endpoint:`, endpoint);
          
          try {
            if (!targetId) {
              console.warn('Skipping wishlist item with no valid ID:', item);
              return null;
            }
            
            // Try to fetch the details of the auction/listing
            const detailsResponse = await axios.get(endpoint, {
              headers: getAuthHeader()
            });

            // Process valid response
            if (detailsResponse.data) {
              // Handle nested data structure if needed
              const actualData = detailsResponse.data.data || detailsResponse.data;
              
              // Find category information if available
              const categoryId = actualData.categoryId;
              const category = categoryId ? 
                categories.find(cat => cat.id === categoryId) : 
                categories.find(cat => {
                  if (isAuction && Array.isArray(cat.auctionIds)) {
                    return cat.auctionIds.includes(targetId);
                  } else if (!isAuction && Array.isArray(cat.listingIds)) {
                    return cat.listingIds.includes(targetId);
                  }
                  return false;
                });
              
              // For listings, we might need to handle different data structures
              if (!isAuction) {
                return {
                  id: item.id,
                  listingId: targetId,
                  userId: item.userId.toString(),
                  type: 'listing' as const,
                  listing: {
                    id: actualData.id || targetId,
                    title: actualData.title || actualData.name || 'Unnamed Item',
                    description: actualData.description || '',
                    startingPrice: parseFloat(String(actualData.price || 0)),
                    currentPrice: parseFloat(String(actualData.price || 0)),
                    images: actualData.images || [actualData.imageUrl].filter(Boolean) || ['/placeholder.svg'],
                    endDate: actualData.endDate || null,
                    categoryId: actualData.categoryId || (category ? category.id : undefined),
                    categoryName: actualData.categoryName || (category ? category.name : undefined)
                  },
                  category: category || undefined
                };
              }
              
              // For auctions
              return {
                id: item.id,
                listingId: targetId,
                userId: item.userId.toString(),
                type: 'auction' as const,
                listing: {
                  id: actualData.id || targetId,
                  title: actualData.title || actualData.name || 'Unnamed Item',
                  description: actualData.description || '',
                  startingPrice: parseFloat(String(actualData.startingPrice || actualData.reservePrice || 0)),
                  currentPrice: parseFloat(String(actualData.currentPrice || actualData.currentBid || 0)),
                  images: actualData.images || [actualData.imageUrl].filter(Boolean) || ['/placeholder.svg'],
                  endDate: actualData.endDate || actualData.endTime || null,
                  categoryId: actualData.categoryId || (category ? category.id : undefined),
                  categoryName: actualData.categoryName || (category ? category.name : undefined)
                },
                category: category || undefined
              };
            }
            
          } catch (error) {
            console.error(`Error fetching details for ${isAuction ? 'auction' : 'listing'} ${targetId}:`, error);
            return null;
          }
        })
      );

      // Filter out any failed fetches (nulls)
      const validWishlistItems = wishlistItems.filter(item => item !== null);
      console.log(`Successfully processed ${validWishlistItems.length} of ${validItems.length} wishlist items`);
      
      return validWishlistItems;
    } catch (error: any) {
      console.error('Get wishlist error:', error);
      
      if (error.response?.status === 401) {
        toast({
          title: "يرجى تسجيل الدخول أولاً",
          description: "قم بتسجيل الدخول لعرض المفضلة",
          variant: "destructive",
        });
      } else if (error.response?.status === 404) {
        // No wishlist found is not an error - just return empty array
        return [];
      } else {
        toast({
          title: "فشل في تحميل المفضلة",
          description: error.response?.data?.message || "حدث خطأ أثناء تحميل المفضلة",
          variant: "destructive",
        });
      }
      
      // For 404 errors (no wishlist), return empty array instead of throwing
      if (error.response?.status === 404) {
        return [];
      }
      
      throw error;
    }
  }

  async addToWishlist(listingId: number): Promise<WishlistResponse> {
    try {
      const headers = getAuthHeader();
      console.log('Adding to wishlist:', {
        listingId,
        headers,
        url: `${API_URL}/auction/${listingId}`
      });

      const response = await axios({
        method: 'POST',
        url: `${API_URL}/auction/${listingId}`,
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
        url: `${API_URL}/auction/${listingId}`
      });

      await axios({
        method: 'DELETE',
        url: `${API_URL}/auction/${listingId}`,
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

  async addListingToWishlist(listingId: number): Promise<WishlistResponse> {
    try {
      const headers = getAuthHeader();
      console.log('Adding listing to wishlist:', {
        listingId,
        headers,
        url: `${API_URL}/listing/${listingId}`
      });

      const response = await axios({
        method: 'POST',
        url: `${API_URL}/listing/${listingId}`,
        headers: {
          ...headers,
          'Accept': 'application/json'
        }
      });
      
      console.log('Add listing to wishlist response:', response.data);
      
      if (response.data) {
        toast({
          title: "تمت إضافة العنصر للمفضلة",
          description: "يمكنك الوصول للمفضلة من حسابك الشخصي"
        });
        return response.data;
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error: any) {
      console.error('Add listing to wishlist error:', {
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
        const errorMessage = error.response?.data?.error || 'هذا العنصر موجود بالفعل في المفضلة';
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

  async removeListingFromWishlist(listingId: number): Promise<void> {
    try {
      const headers = getAuthHeader();
      console.log('Removing listing from wishlist:', {
        listingId,
        headers,
        url: `${API_URL}/listing/${listingId}`
      });

      await axios({
        method: 'DELETE',
        url: `${API_URL}/listing/${listingId}`,
        headers: {
          ...headers,
          'Accept': 'application/json'
        }
      });
      
      toast({
        title: "تمت إزالة العنصر من المفضلة",
        description: "يمكنك إضافته مرة أخرى في أي وقت"
      });
    } catch (error: any) {
      console.error('Remove listing from wishlist error:', {
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
          title: "هذا العنصر غير موجود في المفضلة",
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
}

// Create and export a singleton instance
const wishlistService = new WishlistService();
export { wishlistService }; 