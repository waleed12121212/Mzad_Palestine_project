import axios from 'axios';
import { toast } from 'sonner';
import { formatRelativeTime } from '@/utils/dateFormatter';

export type NotificationType = 'General' | 'BidPlaced' | 'BidOutbid' | 'AuctionEnded' | 'AuctionWon' | 'AuctionCancelled' | 'MassageReceived';

export interface Notification {
  id: string;
  userId: string | number;
  message: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: string;
  formattedDate?: string;
  relatedId?: number;
  status?: string;
}

export interface CreateNotificationDto {
  userId: string | number;
  message: string;
  type: NotificationType;
}

// Create axios instance with default config
const api = axios.create({
  baseURL: '' // Empty base URL to use relative paths that will work with Vite's proxy
});

// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    const errorMessage = error.response?.data?.message || error.message;
    console.error('Error details:', errorMessage);
    
    if (error.response?.status === 401) {
      toast.error('الرجاء تسجيل الدخول مجدداً');
    } else if (error.response?.status === 404) {
      toast.error('لم يتم العثور على الإشعارات');
    } else if (error.response?.status === 400) {
      toast.error(errorMessage || 'خطأ في البيانات المرسلة');
    } else {
      toast.error('حدث خطأ في النظام');
    }
    return Promise.reject(error);
  }
);

export const notificationService = {
  // Get all notifications for current user
  getAllNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await api.get('/Notification/all');
      console.log('Raw notification response:', response.data);

      // Ensure we have an array to work with
      const notifications = Array.isArray(response.data) ? response.data : 
                          (response.data?.data || response.data?.notifications || []);
      
      console.log('Processed notifications:', notifications);
      
      // Add formatted date to each notification
      return notifications.map((notification: Notification) => ({
        ...notification,
        formattedDate: notification.createdAt ? formatRelativeTime(notification.createdAt) : undefined
      }));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      toast.error('فشل في تحميل الإشعارات');
      return [];
    }
  },

  // Mark single notification as read
  markAsRead: async (id: string): Promise<boolean> => {
    try {
      await api.put(`/Notification/${id}/read`);
      toast.success('تم تحديث حالة الإشعار');
      return true;
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      toast.error('فشل في تحديث حالة الإشعار');
      return false;
    }
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<boolean> => {
    try {
      await api.put('/Notification/read-all');
      toast.success('تم تحديث جميع الإشعارات');
      return true;
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      toast.error('فشل في تحديث الإشعارات');
      return false;
    }
  },

  // Delete single notification
  deleteNotification: async (id: string): Promise<boolean> => {
    try {
      await api.delete(`/Notification/${id}`);
      toast.success('تم حذف الإشعار');
      return true;
    } catch (error) {
      console.error('Failed to delete notification:', error);
      toast.error('فشل في حذف الإشعار');
      return false;
    }
  },

  // Delete all notifications
  clearAllNotifications: async (): Promise<boolean> => {
    try {
      await api.delete('/Notification/clear');
      toast.success('تم حذف جميع الإشعارات');
      return true;
    } catch (error) {
      console.error('Failed to clear all notifications:', error);
      toast.error('فشل في حذف الإشعارات');
      return false;
    }
  },

  // Create a new notification
  createNotification: async (userId: string | number, message: string, type: NotificationType): Promise<boolean> => {
    try {
      const notificationData: CreateNotificationDto = {
        userId,
        message,
        type
      };

      console.log('Sending notification data:', notificationData);
      
      const response = await api.post('/Notification', notificationData, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Notification response:', response.data);
      return true;
    } catch (error) {
      console.error('Failed to create notification:', error);
      if (axios.isAxiosError(error)) {
        console.error('Request data:', error.config?.data);
        console.error('Response data:', error.response?.data);
      }
      return false;
    }
  }
}; 