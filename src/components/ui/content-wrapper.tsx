import React from 'react';

interface ContentWrapperProps {
  title: string;
  children: React.ReactNode;
}

export const ContentWrapper: React.FC<ContentWrapperProps> = ({ title, children }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
      <h2 className="text-xl font-bold mb-6">{title}</h2>
      {children}
    </div>
  );
}; 