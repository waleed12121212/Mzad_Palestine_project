import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [isDark, setIsDark] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark-theme-transition');
      root.classList.add('dark');
    } else {
      root.classList.add('dark-theme-transition');
      root.classList.remove('dark');
    }

    localStorage.setItem('theme', isDark ? 'dark' : 'light');

    const timeout = setTimeout(() => {
      root.classList.remove('dark-theme-transition');
    }, 300);

    return () => clearTimeout(timeout);
  }, [isDark]);

  const toggle = () => setIsDark(!isDark);

  return { isDark, toggle };
};