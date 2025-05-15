// messageService.ts

import axios, { AxiosError } from 'axios';
import { auctionNotificationService } from './auctionNotificationService';
import { userService } from './userService';

const API_URL = '/Message';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': '*/*'
  },
  withCredentials: false
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = token; // بدون Bearer
    }
    if (config.method === 'options') {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    if (!axiosError.response) {
      throw new Error('خطأ في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت الخاص بك');
    }
    if (axiosError.response?.data?.message) {
      throw new Error(axiosError.response.data.message);
    }
    switch (axiosError.response.status) {
      case 400:
        throw new Error('البيانات المدخلة غير صحيحة');
      case 401:
        throw new Error('غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى');
      case 403:
        throw new Error('ليس لديك صلاحية للقيام بهذا الإجراء');
      case 404:
        throw new Error('المورد المطلوب غير موجود');
      case 409:
        throw new Error('يوجد تعارض في البيانات');
      case 422:
        throw new Error('البيانات المدخلة غير صالحة');
      case 500:
        throw new Error('خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً');
      default:
        throw new Error('حدث خطأ غير متوقع');
    }
  }
);

export interface MessagePayload {
  receiverId: number;
  subject?: string;
  content: string;
}

export const messageService = {
  // إرسال رسالة جديدة
  async sendMessage(payload: MessagePayload) {
    const response = await axiosInstance.post('/', payload);
    // Get senderId from localStorage user object
    const user = JSON.parse(localStorage.getItem('user'));
    const senderId = user?.id;
    let senderName = 'مستخدم جديد';
    if (senderId) {
      try {
        const { data } = await userService.getUserById(senderId.toString());
        console.log('Debug: senderProfile =', data);
        senderName = `${data.firstName} ${data.lastName}`;
      } catch (e) {
        console.log('Debug: Error fetching senderProfile', e);
        // fallback to default if error
      }
    }
    console.log('Debug: senderName =', senderName);
    await auctionNotificationService.notifyNewMessage(
      payload.receiverId,
      senderName,
      payload.subject
    );
    return response.data.data;
  },

  // جلب الرسائل الواردة
  async getInbox() {
    const response = await axiosInstance.get('/inbox');
    return response.data.data;
  },

  // جلب الرسائل المرسلة
  async getSent() {
    const response = await axiosInstance.get('/sent');
    return response.data.data;
  },

  // جلب محادثة مع مستخدم
  async getConversation(contactId: number) {
    const response = await axiosInstance.get(`/conversation/${contactId}`);
    return response.data.data;
  },

  // تعليم رسالة كمقروءة
  async markAsRead(messageId: number) {
    const response = await axiosInstance.put(`/${messageId}/read`);
    return response.data.success === true;
  },

  markAllInboxAsRead: () => axiosInstance.put('/inbox/read-all'),

  getUnreadCount: () => axiosInstance.get('/inbox/unread-count').then(response => response.data)
};