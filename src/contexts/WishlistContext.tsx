import React, { createContext, useContext, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistService, WishlistItem } from '@/services/wishlistService';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';
import { categoryService } from '@/services/categoryService';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  error: Error | null;
  addToWishlist: (listingId: number) => Promise<void>;
  removeFromWishlist: (listingId: number) => Promise<void>;
  addListingToWishlist: (listingId: number) => Promise<void>;
  removeListingFromWishlist: (listingId: number) => Promise<void>;
  isInWishlist: (listingId: number, type?: 'auction' | 'listing') => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: wishlistItems = [], isLoading, error } = useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistService.getWishlist,
    enabled: !!user, // Only fetch if user is logged in
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Only retry once
  });

  const addToWishlist = useCallback(async (listingId: number) => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "قم بتسجيل الدخول لإضافة العناصر إلى المفضلة",
        variant: "destructive",
      });
      return;
    }

    try {
      // Optimistically update the UI first
      const tempId = Date.now(); // Generate a temporary ID
      const optimisticItem: WishlistItem = {
        id: tempId,
        listingId: listingId,
        userId: user.id.toString(),
        type: 'auction',
        listing: {
          id: listingId,
          title: "...",
          description: "...",
          startingPrice: 0,
          currentPrice: 0,
          images: ["/placeholder.svg"],
          endDate: null,
          categoryId: 0,
          categoryName: ""
        }
      };
      
      // Update the cache immediately
      queryClient.setQueryData(['wishlist'], (old: WishlistItem[] = []) => {
        // Don't add if it already exists
        if (old.some(item => item.listingId === listingId && item.type === 'auction')) {
          return old;
        }
        return [...old, optimisticItem];
      });
      
      // Then make the actual API call
      const newItem = await wishlistService.addToWishlist(listingId);
      
      // Update with the real data
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      
      toast({
        title: "تمت إضافة المزاد للمفضلة",
        description: "يمكنك الوصول للمفضلة من حسابك الشخصي",
      });
    } catch (error) {
      // Revert the optimistic update
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      
      toast({
        title: "فشل في إضافة العنصر للمفضلة",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, queryClient]);

  const removeFromWishlist = useCallback(async (listingId: number) => {
    if (!user) return;

    try {
      // Optimistically update the UI first
      queryClient.setQueryData(['wishlist'], (old: WishlistItem[] = []) => 
        old.filter(item => !(item.listingId === listingId && item.type === 'auction'))
      );
      
      // Then make the actual API call
      await wishlistService.removeFromWishlist(listingId);
      
      // Make sure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    } catch (error) {
      // Revert the optimistic update
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      
      toast({
        title: "فشل في إزالة العنصر من المفضلة",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, queryClient]);

  const addListingToWishlist = useCallback(async (listingId: number) => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "قم بتسجيل الدخول لإضافة العناصر إلى المفضلة",
        variant: "destructive",
      });
      return;
    }

    try {
      // Optimistically update the UI first
      const tempId = Date.now(); // Generate a temporary ID
      const optimisticItem: WishlistItem = {
        id: tempId,
        listingId: listingId,
        userId: user.id.toString(),
        type: 'listing',
        listing: {
          id: listingId,
          title: "...",
          description: "...",
          startingPrice: 0,
          currentPrice: 0,
          images: ["/placeholder.svg"],
          endDate: null,
          categoryId: 0,
          categoryName: ""
        }
      };
      
      // Update the cache immediately
      queryClient.setQueryData(['wishlist'], (old: WishlistItem[] = []) => {
        // Don't add if it already exists
        if (old.some(item => item.listingId === listingId && item.type === 'listing')) {
          return old;
        }
        return [...old, optimisticItem];
      });
      
      // Then make the actual API call
      const newItem = await wishlistService.addListingToWishlist(listingId);
      
      // Update with the real data
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      
      toast({
        title: "تمت إضافة العنصر للمفضلة",
        description: "يمكنك الوصول للمفضلة من حسابك الشخصي",
      });
    } catch (error) {
      // Revert the optimistic update
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      
      toast({
        title: "فشل في إضافة العنصر للمفضلة",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, queryClient]);

  const removeListingFromWishlist = useCallback(async (listingId: number) => {
    if (!user) return;

    try {
      // Optimistically update the UI first
      queryClient.setQueryData(['wishlist'], (old: WishlistItem[] = []) => 
        old.filter(item => !(item.listingId === listingId && item.type === 'listing'))
      );
      
      // Then make the actual API call
      await wishlistService.removeListingFromWishlist(listingId);
      
      // Make sure we have the latest data
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    } catch (error) {
      // Revert the optimistic update
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      
      toast({
        title: "فشل في إزالة العنصر من المفضلة",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, queryClient]);

  const isInWishlist = useCallback((listingId: number, type?: 'auction' | 'listing') => {
    if (!wishlistItems || !Array.isArray(wishlistItems)) return false;
    
    if (type) {
      // Check for specific type if provided
      return wishlistItems.some(item => item.listingId === listingId && item.type === type);
    } else {
      // Check for any type if not specified
      return wishlistItems.some(item => item.listingId === listingId);
    }
  }, [wishlistItems]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: Array.isArray(wishlistItems) ? wishlistItems : [],
        isLoading,
        error: error as Error | null,
        addToWishlist,
        removeFromWishlist,
        addListingToWishlist,
        removeListingFromWishlist,
        isInWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}; 