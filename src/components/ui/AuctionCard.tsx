
import React, { useState } from "react";
import { Heart, Users, ArrowUpRight } from "lucide-react";
import CountdownTimer from "./CountdownTimer";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

interface AuctionCardProps {
  id: number | string;
  title: string;
  description: string;
  currentPrice: number;
  minBidIncrement: number;
  imageUrl: string;
  endTime: string;
  bidders: number;
  currency?: string;
  isPopular?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: number | string) => void;
}

const AuctionCard: React.FC<AuctionCardProps> = ({
  id,
  title,
  description,
  currentPrice,
  minBidIncrement,
  imageUrl,
  endTime,
  bidders,
  currency = "₪",
  isPopular = false,
  isFavorite = false,
  onFavoriteToggle
}) => {
  const [isLiked, setIsLiked] = useState(isFavorite);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (onFavoriteToggle) {
      onFavoriteToggle(id);
    } else {
      setIsLiked(!isLiked);
      
      toast({
        title: isLiked ? "تمت إزالة المزاد من المفضلة" : "تمت إضافة المزاد للمفضلة",
        description: isLiked ? "يمكنك إضافته مرة أخرى في أي وقت" : "يمكنك الوصول للمفضلة من حسابك الشخصي",
      });
    }
  };

  const handleClick = () => {
    navigate(`/auction/${id}`);
  };

  return (
    <div
      className="neo-card overflow-hidden transition-all duration-300 relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {isPopular && (
        <div className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          رائج
        </div>
      )}
      
      <div className="relative overflow-hidden" style={{ height: "220px" }}>
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover transform transition-transform duration-700"
          style={{
            transform: isHovered ? "scale(1.05)" : "scale(1)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        <button
          onClick={toggleLike}
          className="absolute top-3 left-3 bg-white/20 backdrop-blur-sm p-2 rounded-full transition-all duration-300 hover:bg-white/40"
          aria-label={isLiked ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
        >
          <Heart
            className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : "text-white"}`}
          />
        </button>
        
        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm flex items-center">
            <Users className="h-3 w-3 mr-2" />
            <span>{bidders}</span>
          </div>
          <CountdownTimer 
            endTime={new Date(endTime)} 
            className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-white text-sm" 
          />
        </div>
      </div>
      
      <div className="p-4 rtl">
        <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 mb-3">{description}</p>
        
        <div className="flex justify-between items-center mt-2">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">السعر الحالي</p>
            <p className="text-lg font-bold text-blue dark:text-blue-light">
              {currency} {currentPrice.toLocaleString()}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">الحد الأدنى للمزايدة</p>
            <p className="text-sm font-semibold text-green">
              + {currency} {minBidIncrement.toLocaleString()}
            </p>
          </div>
        </div>
        
        <button 
          className="w-full btn-primary mt-4 flex items-center justify-center gap-2 group"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/auction/${id}`);
          }}
        >
          <span>المزايدة الآن</span>
          <ArrowUpRight className="h-4 w-4 transform transition-transform group-hover:translate-x-[-2px] group-hover:translate-y-[-2px]" />
        </button>
      </div>
    </div>
  );
};

export default AuctionCard;
