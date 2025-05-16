import React from 'react';
import { cn } from '@/utils/cn';
import { X } from 'lucide-react';
import { Button } from '..';

interface ToastProps {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  onClose?: () => void;
  duration?: number;
  className?: string;
}

const Toast: React.FC<ToastProps> = ({
  title,
  message,
  type = 'info',
  onClose,
  duration = 5000,
  className,
}) => {
  React.useEffect(() => {
    if (duration && onClose) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const variants = {
    success: 'bg-green-50 dark:bg-green-900/20 border-green-500',
    error: 'bg-red-50 dark:bg-red-900/20 border-red-500',
    warning: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500',
    info: 'bg-blue-50 dark:bg-blue-900/20 border-blue-500',
  };

  const titleColors = {
    success: 'text-green-800 dark:text-green-200',
    error: 'text-red-800 dark:text-red-200',
    warning: 'text-yellow-800 dark:text-yellow-200',
    info: 'text-blue-800 dark:text-blue-200',
  };

  const messageColors = {
    success: 'text-green-700 dark:text-green-300',
    error: 'text-red-700 dark:text-red-300',
    warning: 'text-yellow-700 dark:text-yellow-300',
    info: 'text-blue-700 dark:text-blue-300',
  };

  return (
    <div
      className={cn(
        'w-full max-w-sm rounded-lg border-r-4 p-4 shadow-md',
        'pointer-events-auto transform transition-all duration-300',
        variants[type],
        className
      )}
      dir="rtl"
    >
      <div className="flex items-start">
        <div className="flex-1">
          {title && (
            <h3 className={cn('text-sm font-medium mb-1', titleColors[type])}>
              {title}
            </h3>
          )}
          <p className={cn('text-sm', messageColors[type])}>{message}</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full -mt-1 -mr-1"
          >
            <X className="h-4 w-4 text-gray-500 dark:text-gray-400" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Toast; 