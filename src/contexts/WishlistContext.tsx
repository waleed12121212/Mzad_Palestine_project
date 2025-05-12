import React, { createContext, useContext, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { wishlistService, WishlistItem } from '@/services/wishlistService';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  error: Error | null;
  addToWishlist: (listingId: number) => Promise<void>;
  removeFromWishlist: (listingId: number) => Promise<void>;
  isInWishlist: (listingId: number) => boolean;
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
      const newItem = await wishlistService.addToWishlist(listingId);
      queryClient.setQueryData(['wishlist'], (old: WishlistItem[] = []) => [...old, newItem]);
      toast({
        title: "تمت إضافة المزاد للمفضلة",
        description: "يمكنك الوصول للمفضلة من حسابك الشخصي",
      });
    } catch (error) {
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
      await wishlistService.removeFromWishlist(listingId);
      queryClient.setQueryData(['wishlist'], (old: WishlistItem[] = []) => 
        old.filter(item => item.listingId !== listingId)
      );
      toast({
        title: "تمت إزالة المزاد من المفضلة",
        description: "يمكنك إضافته مرة أخرى في أي وقت",
      });
    } catch (error) {
      toast({
        title: "فشل في إزالة العنصر من المفضلة",
        variant: "destructive",
      });
      throw error;
    }
  }, [user, queryClient]);

  const isInWishlist = useCallback((listingId: number) => {
    if (!wishlistItems || !Array.isArray(wishlistItems)) return false;
    return wishlistItems.some(item => item.listingId === listingId);
  }, [wishlistItems]);

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: Array.isArray(wishlistItems) ? wishlistItems : [],
        isLoading,
        error: error as Error | null,
        addToWishlist,
        removeFromWishlist,
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