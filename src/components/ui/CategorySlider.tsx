import React, { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  imageUrl?: string;
  auctionCount?: number;
}

interface CategorySliderProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (categoryId: string) => void;
}

const CategorySlider: React.FC<CategorySliderProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  const sliderRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  // Initialize horizontal scroll position based on selected category
  useEffect(() => {
    if (selectedCategory && sliderRef.current) {
      const selectedElement = sliderRef.current.querySelector(`[data-category-id="${selectedCategory}"]`) as HTMLElement;
      if (selectedElement) {
        const containerRect = sliderRef.current.getBoundingClientRect();
        const elementRect = selectedElement.getBoundingClientRect();
        const isRTL = document.dir === "rtl" || document.documentElement.dir === "rtl";
        
        const elementCenter = isRTL
          ? containerRect.right - (elementRect.right - elementRect.width / 2)
          : elementRect.left + elementRect.width / 2 - containerRect.left;
          
        const containerCenter = containerRect.width / 2;
        const scrollOffset = elementCenter - containerCenter;
        
        sliderRef.current.scrollBy({
          left: isRTL ? -scrollOffset : scrollOffset,
          behavior: "smooth",
        });
      }
    }
  }, [selectedCategory]);

  const scroll = (direction: "left" | "right") => {
    if (!sliderRef.current) return;
    
    const scrollAmount = isMobile ? 200 : 300;
    const isRTL = document.dir === "rtl" || document.documentElement.dir === "rtl";
    
    if (direction === "left") {
      sliderRef.current.scrollBy({
        left: isRTL ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    } else {
      sliderRef.current.scrollBy({
        left: isRTL ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative w-full max-w-full overflow-x-auto">
      <button 
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-1.5 md:p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Previous categories"
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
      </button>
      
      <div 
        ref={sliderRef}
        className="flex gap-3 md:gap-4 py-3 md:py-4 px-4 md:px-8 scrollbar-hide scroll-smooth w-full"
        style={{overflowX: 'auto', maxWidth: '100%'}}
      >
        {categories.map((category) => (
          <button
            key={category.id}
            data-category-id={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "flex flex-col items-center justify-center min-w-32 md:min-w-48 p-0 rounded-full transition-all duration-300 border aspect-square bg-white dark:bg-gray-800 overflow-hidden relative",
              selectedCategory === category.id
                ? "ring-4 ring-blue border-blue text-blue dark:ring-blue-light dark:border-blue-light dark:text-blue-light"
                : "border-gray-100 dark:border-gray-700 hover:border-blue hover:bg-blue/5 dark:hover:border-blue-dark dark:hover:bg-blue-dark/10"
            )}
            style={{ width: 140, height: 140 }}
          >
            {/* صورة الخلفية إذا وجدت */}
            {category.imageUrl && (
              <img src={category.imageUrl} alt={category.name} className="absolute inset-0 w-full h-full object-cover opacity-80" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
            {/* اسم الفئة */}
            <span className="relative z-10 text-lg md:text-xl font-bold text-white text-center mt-10 mb-2 drop-shadow-lg">{category.name}</span>
            {/* عدد المنتجات والمزادات */}
            <div className="relative z-10 flex flex-row items-center justify-center gap-3 mt-auto mb-4">
              <span className="flex items-center gap-1 text-xs text-white bg-green-700/80 rounded-full px-3 py-1">
                {typeof category.count !== 'undefined' ? category.count : 0} منتج
              </span>
              <span className="flex items-center gap-1 text-xs text-white bg-blue-900/80 rounded-full px-3 py-1">
                {typeof category.auctionCount !== 'undefined' ? category.auctionCount : 0} مزاد
              </span>
            </div>
          </button>
        ))}
      </div>
      
      <button 
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-1.5 md:p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Next categories"
      >
        <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
      </button>
    </div>
  );
};

export default CategorySlider;
