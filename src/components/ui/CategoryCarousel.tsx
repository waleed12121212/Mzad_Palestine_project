import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, EffectCards } from 'swiper/modules';
import { Smartphone, Car, Gem, BookOpen, Camera, Baby, Coffee, Sofa, Shirt, Laptop } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-cards';

interface Category {
  id: string;
  name: string;
  imageUrl: string;
  count: number;
  subcategories?: { id: string; name: string; count: number }[];
}

interface CategoryCarouselProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string) => void;
}

const getCategoryIcon = (name: string) => {
  switch (name.toLowerCase()) {
    case "أزياء":
      return <Shirt className="w-8 h-8" />;
    case "إلكترونيات":
      return <Smartphone className="w-8 h-8" />;
    case "مركبات":
    case "سيارات":
      return <Car className="w-8 h-8" />;
    case "إكسسوارات":
      return <Gem className="w-8 h-8" />;
    case "كتب":
    case "الكتب والمجلات":
      return <BookOpen className="w-8 h-8" />;
    case "كاميرات":
      return <Camera className="w-8 h-8" />;
    case "مستلزمات الأطفال":
      return <Baby className="w-8 h-8" />;
    case "مستلزمات منزلية":
      return <Coffee className="w-8 h-8" />;
    case "أثاث":
      return <Sofa className="w-8 h-8" />;
    case "لابتوبات":
      return <Laptop className="w-8 h-8" />;
    default:
      return <Gem className="w-8 h-8" />;
  }
};

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <Swiper
      modules={[Navigation, Pagination, EffectCards]}
      navigation
      pagination={{ 
        clickable: true,
        dynamicBullets: true
      }}
      spaceBetween={24}
      slidesPerView="auto"
      centeredSlides={false}
      className="category-swiper !overflow-visible !pb-12"
    >
      {categories.map((category) => (
        <SwiperSlide key={category.id} className="!w-40 !h-40">
          <div
            onClick={() => onSelectCategory(category.id)}
            className="w-full h-full"
          >
            <div className="relative w-40 h-40">
              <div className={`
                absolute inset-0
                rounded-full overflow-hidden
                transition-all duration-500
                ${selectedCategory === category.id
                  ? 'ring-4 ring-blue dark:ring-blue-light'
                  : 'hover:ring-2 hover:ring-blue/50 dark:hover:ring-blue-light/50'}
              `}>
                {/* Background Image */}
                <img 
                  src={category.imageUrl} 
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90" />

              {/* Content Container */}
              <div className="absolute inset-0 rounded-full flex flex-col items-center justify-center p-4 transform transition-all duration-500 hover:-translate-y-1">
                {/* Category Icon */}
                <div className="mb-2">
                  <div className="w-12 h-12 rounded-full backdrop-blur-md bg-white/20 flex items-center justify-center transition-transform duration-500 hover:scale-110">
                    {getCategoryIcon(category.name)}
                  </div>
                </div>

                {/* Category Name */}
                <h3 className="text-lg font-bold text-white text-center drop-shadow-lg line-clamp-1 mb-1">
                  {category.name}
                </h3>

                {/* Category Count */}
                <span className="px-2 py-0.5 rounded-full text-xs text-white bg-white/20 backdrop-blur-sm">
                  {category.count} مزاد
                </span>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CategoryCarousel;
