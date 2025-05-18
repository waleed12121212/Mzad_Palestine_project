import React, { useState, useEffect } from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface SlideItem {
  imageUrl: string;
  title: string;
  description: string;
}

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: SlideItem[] = [
    {
      imageUrl: "/images/hero/photo-4.png",
      title: "منصة مزاد فلسطين للمزادات الإلكترونية",
      description: "مزادات آمنة وشفافة بتقنيات حديثة"
    },
    {
      imageUrl: "/images/hero/photo-1.jpeg",
      title: "أفضل العروض والمزادات",
      description: "فرص استثنائية للفوز بمنتجات مميزة"
    },
    {
      imageUrl: "/images/hero/photo-2.avif",
      title: "مزادات عقارية حصرية",
      description: "استثمر في أفضل العقارات بأسعار تنافسية"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-xl">
      <div className="absolute inset-0 bg-gradient-to-br from-blue/30 to-green/30 transform rotate-3 scale-95 blur-xl opacity-60 dark:opacity-40 z-10"></div>
      
      <div className="relative aspect-video">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="w-full h-full object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
            <div className="absolute bottom-8 right-8 text-white rtl text-right">
              <h3 className="text-2xl font-bold mb-2">{slide.title}</h3>
              <p className="text-lg text-white/80">{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm z-20"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm z-20"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentSlide ? 'bg-white w-6' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;