import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const DarkModeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="dark-mode-toggle p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-800 relative overflow-hidden"
      aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="relative">
        {theme === 'dark' ? (
          <Sun className="w-5 h-5 text-gray-600 dark:text-gray-300 transform transition-transform duration-800 hover:rotate-180" />
        ) : (
          <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300 transform transition-transform duration-800 hover:-rotate-180" />
        )}
        <div className="absolute inset-0 bg-current opacity-0 hover:opacity-10 rounded-full transition-opacity duration-800" />
      </div>
    </button>
  );
};

export default DarkModeToggle;
