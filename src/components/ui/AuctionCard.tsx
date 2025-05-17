import React, { useState } from "react";
import { Heart, Users, ArrowUpRight } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { auctionService } from "@/services/auctionService";
import { useWishlist } from "@/contexts/WishlistContext";

interface AuctionCardProps {
  id: string;
  listingId?: number;
  categoryId?: number;
  title: string;
  description: string;
  currentPrice: number;
  minBidIncrement: number;
  imageUrl: string;
  endTime: string;
  bidders: number;
  userId?: number;
  currency?: string;
  isPopular?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
  ownerView?: boolean;
}

const AuctionCard: React.FC<AuctionCardProps> = ({
  id,
  listingId,
  categoryId,
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
  onFavoriteToggle,
  ownerView = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const isLiked = onFavoriteToggle ? isFavorite : isInWishlist(listingId || Number(id));

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
    try {
      if (onFavoriteToggle) {
        onFavoriteToggle(id);
      } else {
        if (isLiked) {
          await removeFromWishlist(listingId || Number(id));
        } else {
          await addToWishlist(listingId || Number(id));
        }
      }
    } catch (error) {
      // Error handling is done in the context
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    navigate(`/auction/${id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("هل أنت متأكد أنك تريد حذف هذا المزاد؟")) {
      try {
        await auctionService.deleteAuction(Number(id));
        toast({
          title: "تم حذف المزاد بنجاح",
        });
        window.location.reload();
      } catch {
        toast({
          title: "حدث خطأ أثناء حذف المزاد",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div
      className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="relative h-[200px] overflow-hidden">
        {/* @ts-expect-error: user.id and userId may be different types (string vs number) but this is intentional */}
        {user && userId && user.id === userId && (
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
        
        <button
          onClick={toggleLike}
          disabled={isLoading}
          className={`absolute top-3 left-3 bg-white/20 backdrop-blur-sm p-2 rounded-full transition-all duration-300 hover:bg-white/40 ${
            isLoading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          aria-label={isLiked ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
        >
          <Heart
            className={`h-5 w-5 ${isLoading ? "animate-pulse" : ""} ${
              isLiked ? "fill-red-500 text-red-500" : "text-white"
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
          <CountdownTimer 
            endTime={new Date(endTime)} 
            className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm" 
          />
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
              {currency} {(currentPrice + (minBidIncrement - currentPrice)).toLocaleString()}
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
          {ownerView ? 'إدارة المزاد' : <><span>المزايدة الآن</span> <ArrowUpRight className="h-4 w-4" /></>}
        </button>
      </div>
    </div>
  );
};

export default AuctionCard;
