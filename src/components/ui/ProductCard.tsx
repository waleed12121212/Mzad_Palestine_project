
import React, { useState } from "react";
import { Heart, ShoppingCart, Eye } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

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
}) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  const toggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    
    toast({
      title: isLiked ? "تمت إزالة المنتج من المفضلة" : "تمت إضافة المنتج للمفضلة",
      description: isLiked ? "يمكنك إضافته مرة أخرى في أي وقت" : "يمكنك الوصول للمفضلة من حسابك الشخصي",
    });
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    toast({
      title: "عرض سريع للمنتج",
      description: title,
    });
  };
  
  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/checkout?productId=${id}`);
  };

  const handleCardClick = () => {
    navigate(`/checkout?productId=${id}`);
  };

  const discount = discountedPrice ? Math.round(((price - discountedPrice) / price) * 100) : 0;

  return (
    <div
      className="neo-card overflow-hidden transition-all duration-300 relative cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {isNew && (
        <div className="absolute top-3 right-3 bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          جديد
        </div>
      )}
      
      {isOnSale && discountedPrice && (
        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full z-10">
          خصم {discount}%
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
        <div className="absolute inset-0 bg-black/10" />
        
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center gap-3 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button
            onClick={toggleLike}
            className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label={isLiked ? "إزالة من المفضلة" : "إضافة إلى المفضلة"}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-red-500 text-red-500" : "text-gray-700"}`} />
          </button>
          <button 
            onClick={handleBuyNow}
            className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="شراء الآن"
          >
            <ShoppingCart className="h-5 w-5 text-gray-700" />
          </button>
          <button 
            onClick={handleQuickView}
            className="bg-white p-2 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="عرض سريع"
          >
            <Eye className="h-5 w-5 text-gray-700" />
          </button>
        </div>
      </div>
      
      <div className="p-4 rtl">
        <h3 className="text-lg font-semibold line-clamp-1">{title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 h-10 mb-3">{description}</p>
        
        <div className="flex items-center gap-2 mt-2">
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
          className="w-full btn-primary mt-4 flex items-center justify-center gap-2 group"
        >
          <span>شراء الآن</span>
          <ShoppingCart className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
