
import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  subcategories?: { id: string; name: string; count: number }[];
}

interface CategoryCarouselProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (id: string) => void;
}

const CategoryCarousel: React.FC<CategoryCarouselProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <Swiper
      modules={[Navigation, Pagination]}
      navigation
      pagination={{ clickable: true }}
      spaceBetween={24}
      slidesPerView="auto"
      className="category-swiper"
    >
      {categories.map((category) => (
        <SwiperSlide key={category.id} className="!w-44">
          <div
            onClick={() => onSelectCategory(category.id)}
            className={`
              cursor-pointer transform transition-all duration-300 hover:-translate-y-2
              ${selectedCategory === category.id ? '-translate-y-2' : ''}
            `}
          >
            <div className={`
              bg-gradient-to-br from-white to-gray-50
              dark:from-gray-800 dark:to-gray-900
              rounded-2xl p-6 relative overflow-hidden
              border transition-all duration-300 h-full group
              ${selectedCategory === category.id
                ? 'border-blue dark:border-blue-light shadow-xl shadow-blue/20'
                : 'border-gray-100 dark:border-gray-700 hover:border-blue/50 dark:hover:border-blue-light/50'}
            `}>
              <div className="absolute inset-0 bg-gradient-to-br from-blue/0 to-blue/5 dark:from-blue-light/0 dark:to-blue-light/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              <div className="flex flex-col items-center text-center gap-4 relative z-10">
                <div className={`
                  w-20 h-20 rounded-2xl flex items-center justify-center
                  transition-all duration-300 transform group-hover:scale-110
                  ${selectedCategory === category.id
                    ? 'bg-blue/20 text-blue dark:bg-blue-light/20 dark:text-blue-light'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}
                `}>
                  {React.cloneElement(category.icon as React.ReactElement, {
                    className: 'w-10 h-10'
                  })}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{category.name}</h3>
                  <span className="text-sm bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {category.count} مزاد
                  </span>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default CategoryCarousel;
