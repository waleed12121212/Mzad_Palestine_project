import { useState, useEffect } from 'react';
import { messageService } from '@/services/messageService';

export const useUnreadMessages = () => {
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const fetchUnreadCount = async () => {
    try {
      const response = await messageService.getUnreadCount();
      setUnreadCount(response.data);
    } catch (error) {
      console.error('Error fetching unread messages count:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    
    // Fetch every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    unreadCount,
    loading,
    refetch: fetchUnreadCount
  };
}; 