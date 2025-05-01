
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';

const DarkModeToggle = () => {
  const { isDark, toggle } = useTheme();

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative overflow-hidden"
      aria-label="Toggle theme"
    >
      <div className="relative z-10">
        {isDark ? (
          <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300 transform transition-transform duration-500" />
        ) : (
          <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300 transform transition-transform duration-500" />
        )}
      </div>
    </button>
  );
};

export default DarkModeToggle;
