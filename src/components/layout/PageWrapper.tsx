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
        /* Theme transition for all elements */
        *, *::before, *::after {
          transition: background-color 0.8s ease,
                      color 0.8s ease,
                      border-color 0.8s ease,
                      fill 0.8s ease,
                      stroke 0.8s ease,
                      opacity 0.8s ease,
                      box-shadow 0.8s ease,
                      transform 0.8s ease !important;
        }

        /* Special transitions for specific elements */
        .theme-transition {
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Smooth transition for background overlays */
        .dark-mode-transition {
          transition: background-color 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                      backdrop-filter 0.8s cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Enhanced transitions for interactive elements */
        button, a, input, select, textarea {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        /* Smooth icon transitions */
        svg {
          transition: transform 0.6s ease,
                      fill 0.6s ease,
                      stroke 0.6s ease,
                      opacity 0.6s ease !important;
        }

        /* Theme toggle icon rotation */
        .dark-mode-toggle svg {
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }
        .dark-mode-toggle:hover svg {
          transform: rotate(180deg);
        }

        /* Rest of your existing styles */
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
