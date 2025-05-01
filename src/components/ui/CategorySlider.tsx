
import React, { useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
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
    <div className="relative">
      <button 
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 rounded-full p-1.5 md:p-2 shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Previous categories"
      >
        <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
      </button>
      
      <div 
        ref={sliderRef}
        className="flex overflow-x-auto gap-3 md:gap-4 py-3 md:py-4 px-6 md:px-8 scrollbar-hide scroll-smooth"
      >
        {categories.map((category) => (
          <button
            key={category.id}
            data-category-id={category.id}
            onClick={() => onSelectCategory(category.id)}
            className={cn(
              "flex flex-col items-center justify-center min-w-24 md:min-w-36 p-3 md:p-4 rounded-xl transition-all duration-300 border",
              selectedCategory === category.id
                ? "bg-blue/10 border-blue text-blue dark:bg-blue/20 dark:border-blue-light dark:text-blue-light"
                : "bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-blue hover:bg-blue/5 dark:hover:border-blue-dark dark:hover:bg-blue-dark/10"
            )}
          >
            <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mb-3 bg-blue/5 dark:bg-blue/10 rounded-full">
              {category.icon}
            </div>
            <span className="text-sm md:text-base font-medium whitespace-nowrap">{category.name}</span>
            <span className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1">
              ({category.count})
            </span>
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
