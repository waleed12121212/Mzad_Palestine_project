import React from 'react';
import { cn } from '@/utils/cn';
import { User } from 'lucide-react';

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
  onClick?: () => void;
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  size = 'md',
  fallback,
  className,
  onClick,
}) => {
  const [error, setError] = React.useState(false);

  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
    xl: 'w-8 h-8',
  };

  const getFallback = () => {
    if (fallback) {
      return (
        <span className="text-gray-500 dark:text-gray-400 font-medium">
          {fallback.slice(0, 2).toUpperCase()}
        </span>
      );
    }
    return <User className={cn('text-gray-500 dark:text-gray-400', iconSizes[size])} />;
  };

  return (
    <div
      className={cn(
        'relative rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800',
        'flex items-center justify-center',
        sizes[size],
        onClick && 'cursor-pointer hover:opacity-90',
        className
      )}
      onClick={onClick}
    >
      {src && !error ? (
        <img
          src={src}
          alt={alt || 'Avatar'}
          className="w-full h-full object-cover"
          onError={() => setError(true)}
        />
      ) : (
        getFallback()
      )}
    </div>
  );
};

export default Avatar; 