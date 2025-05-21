import React, { useState, useEffect } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { listingService } from "@/services/listingService";
import { useWishlist } from "@/contexts/WishlistContext";
import { useQueryClient } from "@tanstack/react-query";

interface ProductCardProps {
  id: number | string;
  title: string;
  description: string;
  price: number;
  discountedPrice?: number;
  imageUrl: string;
  currency?: string;
  isNew?: boolean;
  isOnSale?: boolean;
  sellerId?: string | number;
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  title,
  description,
  price,
  discountedPrice,
  imageUrl,
  currency = "₪",
  isNew = false,
  isOnSale = false,
  sellerId,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addListingToWishlist, removeListingFromWishlist, isInWishlist } = useWishlist();
  const queryClient = useQueryClient();
  
  const listingId = typeof id === 'string' ? parseInt(id) : id;
  
  // Update favorite state whenever wishlist changes
  useEffect(() => {
    setIsFavorite(isInWishlist(listingId));
  }, [listingId, isInWishlist]);

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "قم بتسجيل الدخول لإضافة العناصر إلى المفضلة",
        variant: "destructive",
      });
      return;
    }
    
    if (isLoading) return;
    
    setIsLoading(true);
    
    // Optimistically update UI
    setIsFavorite(!isFavorite);
    
    try {
      if (isFavorite) {
        await removeListingFromWishlist(listingId);
      } else {
        await addListingToWishlist(listingId);
      }
      // Force refresh wishlist data
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
    } catch (error) {
      // Revert optimistic update on error
      setIsFavorite(isFavorite);
      // Error handling is done in the context
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) {
      toast({
        title: 'يرجى تسجيل الدخول أولاً',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    
    setIsBuying(true);
    try {
      await listingService.purchaseListing(listingId);
      navigate('/purchases');
    } catch (error) {
      console.error('Error purchasing listing:', error);
    } finally {
      setIsBuying(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/listing/${id}`);
  };

  const discount = discountedPrice ? Math.round(((price - discountedPrice) / price) * 100) : 0;

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <div className="relative h-[220px] overflow-hidden">
        {isNew && (
          <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            جديد
          </div>
        )}
        
        {isOnSale && discountedPrice && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
            خصم {discount}%
          </div>
        )}

        <img
          src={imageUrl || "/placeholder.svg"}
          alt={title}
          className="w-full h-full object-cover transform transition-transform duration-700"
          style={{
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <button
          onClick={toggleLike}
          disabled={isLoading}
          className={`absolute top-3 left-3 bg-white/20 backdrop-blur-sm p-2 rounded-full transition-all duration-300 hover:bg-white/40 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label={isFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
        >
          <Heart
            className={`h-5 w-5 ${isLoading ? "animate-pulse" : ""} ${
              isFavorite ? "fill-red-500 text-red-500" : "text-white"
            }`}
          />
        </button>
      </div>
      
      <div className="p-4 rtl">
        <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{description}</p>
        
        <div className="flex items-center gap-2 mt-2 mb-4">
          {discountedPrice ? (
            <>
              <p className="text-lg font-bold text-blue dark:text-blue-light">
                {currency} {discountedPrice.toLocaleString()}
              </p>
              <p className="text-sm line-through text-gray-500">
                {currency} {price.toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-lg font-bold text-blue dark:text-blue-light">
              {currency} {price.toLocaleString()}
            </p>
          )}
        </div>
        
        <button 
          onClick={handleBuyNow}
          className="w-full bg-blue hover:bg-blue-600 text-white dark:bg-blue-500 dark:hover:bg-blue-600 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          disabled={isBuying}
        >
          <span>{isBuying ? "جارِ الشراء..." : "شراء الآن"}</span>
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
