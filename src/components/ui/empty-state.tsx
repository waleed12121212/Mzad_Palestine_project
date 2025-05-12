import React from 'react';
import { Package } from 'lucide-react';

interface EmptyStateProps {
  message: string;
  icon?: React.ElementType;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ 
  message,
  icon: Icon = Package 
}) => {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
        <Icon className="h-8 w-8 text-gray-400" />
      </div>
      <p className="text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}; 