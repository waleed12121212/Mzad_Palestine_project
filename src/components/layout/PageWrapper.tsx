
import React, { useEffect } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface PageWrapperProps {
  children: React.ReactNode;
}

const PageWrapper: React.FC<PageWrapperProps> = ({ children }) => {
  // Add the style element for theme transition
  useEffect(() => {
    // Add the theme transition CSS if it doesn't exist
    if (!document.getElementById('theme-transition-style')) {
      const style = document.createElement('style');
      style.id = 'theme-transition-style';
      style.innerHTML = `
        .theme-transition {
          transition: background-color 0.5s ease, color 0.5s ease;
        }
        .theme-transition * {
          transition: background-color 0.5s ease, color 0.5s ease, border-color 0.5s ease, box-shadow 0.5s ease;
        }
        .dark-mode-transition {
          transition: all 0.5s ease;
        }
        .swiper-pagination-bullet {
          background: rgba(128, 128, 128, 0.8);
          opacity: 0.7;
        }
        .swiper-pagination-bullet-active {
          background: var(--color-blue);
          opacity: 1;
        }
        .dark .swiper-pagination-bullet {
          background: rgba(200, 200, 200, 0.8);
        }
        .dark .swiper-pagination-bullet-active {
          background: var(--color-blue-light);
        }
        .swiper-button-next, .swiper-button-prev {
          color: var(--color-blue);
        }
        .dark .swiper-button-next, .dark .swiper-button-prev {
          color: var(--color-blue-light);
        }
        
        /* Enhanced animation for category carousel */
        .category-card {
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          border: 2px solid transparent;
        }
        .category-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.06);
        }
        .category-icon {
          transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          position: relative;
          z-index: 1;
        }
        .category-card:hover .category-icon {
          transform: scale(1.15);
        }
        .category-icon:after {
          content: '';
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(var(--color-blue-rgb), 0.1) 0%, rgba(var(--color-blue-rgb), 0) 70%);
          z-index: -1;
          opacity: 0;
          transform: scale(0.8);
          transition: all 0.4s ease;
        }
        .category-card:hover .category-icon:after {
          opacity: 1;
          transform: scale(1.5);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow pt-16 md:pt-24 overflow-hidden">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default PageWrapper;
