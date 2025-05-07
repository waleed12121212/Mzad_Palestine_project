import axios, { AxiosError } from 'axios';

// Use relative URL to work with the proxy
const API_URL = '/Auth';

// Create a custom axios instance
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
    // Get token from localStorage if it exists
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Remove content-type for preflight
    if (config.method === 'options') {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    
    // Handle network errors
    if (!axiosError.response) {
      throw new Error('خطأ في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت الخاص بك');
    }
    
    // Handle API errors
    if (axiosError.response?.data?.message) {
      throw new Error(axiosError.response.data.message);
    }
    
    // Handle specific error codes
    switch (axiosError.response.status) {
      case 400:
        throw new Error('البيانات المدخلة غير صحيحة');
      case 401:
        throw new Error('غير مصرح لك بالوصول. يرجى تسجيل الدخول مرة أخرى');
      case 403:
        throw new Error('ليس لديك صلاحية للقيام بهذا الإجراء');
      case 404:
        throw new Error('الصفحة المطلوبة غير موجودة');
      case 409:
        throw new Error('البريد الإلكتروني مسجل مسبقاً');
      case 422:
        throw new Error('البيانات المدخلة غير صالحة');
      case 500:
        throw new Error('خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً');
      default:
        throw new Error('حدث خطأ غير متوقع');
    }
  }
);

export interface RegisterData {
  username: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface ChangePasswordData {
  email: string;
  currentPassword: string;
  newPassword: string;
}

export interface ConfirmEmailData {
  userId: string;
  token: string;
}

export interface AuthResponse {
  token: string;
  user: any;
}

export const authService = {
  register: async (data: RegisterData): Promise<void> => {
    try {
      const response = await axiosInstance.post('/Register', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'حدث خطأ أثناء إنشاء الحساب');
    }
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post('/Login', data);
      const token = response.data.token;
      if (
        !token ||
        typeof token !== "string" ||
        token.trim() === "" ||
        token.split('.').length !== 3
      ) {
        throw new Error('خطأ في البريد الإلكتروني أو كلمة المرور');
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'خطأ في البريد الإلكتروني أو كلمة المرور');
    }
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    try {
      const response = await axiosInstance.post('/change-password', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    }
  },

  confirmEmail: async (data: ConfirmEmailData): Promise<void> => {
    try {
      const response = await axiosInstance.post('/confirm-email', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'حدث خطأ أثناء تأكيد البريد الإلكتروني');
    }
  },

  sendEmailConfirmation: async (email: string): Promise<void> => {
    try {
      const response = await axiosInstance.post('/send-email-confirmation', { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'حدث خطأ أثناء إرسال رابط التأكيد');
    }
  },

  validateToken: async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      const response = await axiosInstance.post('/validate-token');
      return response.data.isValid;
    } catch (error) {
      return false;
    }
  },

  logout: async (): Promise<void> => {
    try {
      await axiosInstance.post('/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local cleanup even if server logout fails
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Helper method to get current user
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  // Helper method to get token
  getToken: () => {
    return localStorage.getItem('token');
  }
}; 