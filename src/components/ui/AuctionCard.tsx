import React, { useState, useEffect } from "react";
import { Heart, Users, ArrowUpRight, Trash, Clock } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { auctionService } from "@/services/auctionService";
import { useWishlist } from "@/contexts/WishlistContext";
import { useQueryClient } from "@tanstack/react-query";

interface AuctionCardProps {
  id: string | number;
  listingId?: number;
  title: string;
  description: string;
  currentPrice: number;
  minBidIncrement: number;
  imageUrl: string;
  endTime?: string | null;
  bidders: number;
  userId?: string | number;
  currency?: string;
  isPopular?: boolean;
  isFavorite?: boolean;
  type?: 'auction' | 'listing';
  onFavoriteToggle?: (id: number) => void;
  ownerView?: boolean;
  errorState?: boolean;
  isPending?: boolean;
}

const AuctionCard: React.FC<AuctionCardProps> = ({
  id,
  listingId,
  title,
  description,
  currentPrice,
  minBidIncrement,
  imageUrl,
  endTime,
  bidders,
  userId,
  currency = "₪",
  isPopular = false,
  isFavorite = false,
  type = 'auction',
  onFavoriteToggle,
  ownerView = false,
  errorState = false,
  isPending = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localIsFavorite, setLocalIsFavorite] = useState(isFavorite);
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { 
    addToWishlist, 
    removeFromWishlist, 
    addListingToWishlist, 
    removeListingFromWishlist, 
    isInWishlist 
  } = useWishlist();
  
  const numericId = typeof id === 'string' ? parseInt(id) : id;
  const targetId = listingId || numericId;
  
  // Keep local state synchronized with props and wishlist context
  useEffect(() => {
    if (onFavoriteToggle) {
      setLocalIsFavorite(isFavorite);
    } else {
      setLocalIsFavorite(isInWishlist(targetId));
    }
  }, [targetId, isFavorite, isInWishlist, onFavoriteToggle]);

  const toggleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
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
    setLocalIsFavorite(!localIsFavorite);
    
    try {
      if (onFavoriteToggle) {
        onFavoriteToggle(numericId);
      } else {
        if (localIsFavorite) {
          if (type === 'auction') {
            await removeFromWishlist(targetId);
          } else {
            await removeListingFromWishlist(targetId);
          }
        } else {
          if (type === 'auction') {
            await addToWishlist(targetId);
          } else {
            await addListingToWishlist(targetId);
          }
        }
        // Force refresh wishlist data
        queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      }
    } catch (error) {
      // Revert optimistic update on error
      setLocalIsFavorite(!localIsFavorite);
      // Error handling is done in the context
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (errorState) {
      // For error state items, just show a message
      toast({
        title: "العنصر غير متوفر",
        description: "هذا العنصر غير متاح حالياً",
        variant: "destructive",
      });
      return;
    }
    navigate(`/auction/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("هل أنت متأكد أنك تريد حذف هذا المزاد؟")) {
      try {
        const response = await auctionService.deleteAuction(numericId);
        if (response.success) {
          toast({
            title: "تم حذف المزاد بنجاح",
          });
          window.location.reload();
        } else {
          toast({
            title: "حدث خطأ أثناء حذف المزاد",
            variant: "destructive",
          });
        }
      } catch {
        toast({
          title: "حدث خطأ أثناء حذف المزاد",
          variant: "destructive",
        });
      }
    }
  };

  // Add a helper function to format the date correctly
  const formatStartDate = (dateString: string | null | undefined): string => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      
      // Format the date in Arabic style
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      // Format time in 24-hour format
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      
      // Format as DD/MM/YYYY HH:MM
      return `${day}/${month}/${year} ${hours}:${minutes}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString.toString();
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md relative cursor-pointer ${
        errorState ? 'opacity-90 border-red-200 dark:border-red-800' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="relative h-[200px] overflow-hidden">
        {user && userId && String(user.id) === String(userId) && (
          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 10, display: 'flex', gap: '8px' }}>
            <button
              title="تعديل المزاد"
              onClick={e => { e.stopPropagation(); navigate(`/auction/${id}/edit`); }}
              className="bg-white/80 hover:bg-blue-100 text-blue-600 p-2 rounded-full shadow"
            >
              <i className="fa fa-edit" />
            </button>
            <button
              title="حذف المزاد"
              onClick={handleDelete}
              className="bg-white/80 hover:bg-red-100 text-red-600 p-2 rounded-full shadow"
            >
              <i className="fa fa-trash" />
            </button>
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
        
        {errorState && (
          <div className="absolute inset-0 bg-gray-800/60 flex flex-col items-center justify-center z-10">
            <div className="bg-red-500/90 text-white px-3 py-2 rounded font-medium mb-2">
              العنصر غير متوفر
            </div>
            {onFavoriteToggle && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onFavoriteToggle(numericId);
                }}
                className="mt-2 bg-white text-red-500 px-3 py-1 rounded-full text-sm flex items-center"
              >
                <Trash className="h-3 w-3 mr-1" />
                <span>إزالة من المفضلة</span>
              </button>
            )}
          </div>
        )}
        
        <button
          onClick={toggleLike}
          disabled={isLoading}
          className={`absolute top-3 left-3 bg-white/20 backdrop-blur-sm p-2 rounded-full transition-all duration-300 hover:bg-white/40 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label={localIsFavorite ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
        >
          <Heart
            className={`h-5 w-5 ${isLoading ? "animate-pulse" : ""} ${
              localIsFavorite ? "fill-red-500 text-red-500" : "text-white"
            }`}
          />
        </button>

        {isPopular && (
          <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            رائج
          </div>
        )}
        
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm flex items-center">
            <Users className="h-3 w-3 ml-1" />
            <span>{bidders}</span>
          </div>
          {isPending ? (
            <div className="bg-yellow-500/30 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm flex items-center">
              <Clock className="h-3 w-3 ml-1 text-yellow-300" />
              <span>يبدأ: {formatStartDate(endTime)}</span>
            </div>
          ) : (
            <CountdownTimer 
              endTime={endTime ? new Date(endTime) : undefined} 
              className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm rtl"
            />
          )}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2 line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{description}</p>
        
        <div className="flex justify-between items-center mb-4">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">السعر الحالي</p>
            <p className="text-lg font-bold text-blue dark:text-blue-light">
              {currency} {currentPrice.toLocaleString()}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">الحد الأدنى للمزايدة</p>
            <p className="text-sm font-semibold text-green-600">
              +{currency} {minBidIncrement.toLocaleString()}
            </p>
          </div>
        </div>
        
        <button 
          className="w-full bg-blue hover:bg-blue-600 text-white dark:bg-blue-500 dark:hover:bg-blue-600 py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/auction/${id}`);
          }}
        >
          {ownerView ? 'إدارة المزاد' : isPending ? 
            <><span>عرض التفاصيل</span> <ArrowUpRight className="h-4 w-4" /></> : 
            <><span>المزايدة الآن</span> <ArrowUpRight className="h-4 w-4" /></>}
        </button>
      </div>
    </div>
  );
};

export default AuctionCard;
