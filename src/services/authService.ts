import axios, { AxiosError } from 'axios';

// Use relative URL and let the proxy handle the requests
const API_URL = '/Auth';

// Create a custom axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 10000, // 10 second timeout
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Log request for debugging
    console.log('Request Config:', {
      url: config.url,
      baseURL: config.baseURL,
      method: config.method,
      headers: config.headers,
      data: config.data
    });
    
    // Get token from localStorage if it exists
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
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
  (response) => {
    console.log('Response:', response.data);
    return response;
  },
  (error: unknown) => {
    const axiosError = error as AxiosError<{ message?: string }>;
    
    if (!axiosError.response) {
      // Network error
      console.error('Network Error:', {
        message: axiosError.message || 'Unknown error',
        code: axiosError.code,
        config: axiosError.config
      });
      
      if (axiosError.message?.includes('Network Error')) {
        throw new Error('خطأ في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت الخاص بك');
      }
      if (axiosError.message?.includes('timeout')) {
        throw new Error('انتهت مهلة الاتصال بالخادم. يرجى المحاولة مرة أخرى');
      }
    } else {
      console.error('API Error:', {
        status: axiosError.response.status,
        statusText: axiosError.response.statusText,
        data: axiosError.response.data,
        headers: axiosError.response.headers,
        config: axiosError.config
      });
      
      // Handle specific error codes
      switch (axiosError.response.status) {
        case 400:
          throw new Error(axiosError.response.data?.message || 'البيانات المدخلة غير صحيحة');
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
          throw new Error(axiosError.response.data?.message || 'حدث خطأ غير متوقع');
      }
    }
    return Promise.reject(error);
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
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
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
      // Validate registration data
      if (!data.username || !data.email || !data.phone || !data.password) {
        throw new Error('جميع الحقول مطلوبة');
      }

      // Ensure email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        throw new Error('البريد الإلكتروني غير صالح');
      }

      // Ensure phone format (assuming Palestinian phone number)
      if (!/^05\d{8}$/.test(data.phone)) {
        throw new Error('رقم الهاتف غير صالح');
      }

      console.log('Sending registration request to:', `${API_URL}/Register`);
      
      const response = await axiosInstance.post('/Register', {
        username: data.username,
        email: data.email,
        phone: data.phone,
        password: data.password
      });

      console.log('Registration successful:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Registration error:', {
        error,
        message: error.message,
        response: error.response?.data
      });
      
      // Handle network errors
      if (!error.response) {
        throw new Error('خطأ في الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت الخاص بك');
      }
      
      // Handle API errors
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      
      // Handle validation errors
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors) {
          const firstError = Object.values(errors)[0];
          if (Array.isArray(firstError) && firstError.length > 0) {
            throw new Error(firstError[0]);
          }
        }
      }
      
      // Handle other errors
      throw new Error(error.message || 'حدث خطأ أثناء إنشاء الحساب');
    }
  },

  login: async (data: LoginData): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post('/Login', data);
      // Store token and user data
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'خطأ في البريد الإلكتروني أو كلمة المرور');
    }
  },

  changePassword: async (data: ChangePasswordData): Promise<void> => {
    try {
      const response = await axiosInstance.post('/Change-Password', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'حدث خطأ أثناء تغيير كلمة المرور');
    }
  },

  forgotPassword: async (email: string): Promise<void> => {
    try {
      const response = await axiosInstance.post('/Forgot-Password', { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور');
    }
  },

  confirmEmail: async (data: ConfirmEmailData): Promise<void> => {
    try {
      const response = await axiosInstance.post('/Confirm-Email', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'حدث خطأ أثناء تأكيد البريد الإلكتروني');
    }
  },

  sendEmailConfirmation: async (email: string): Promise<void> => {
    try {
      const response = await axiosInstance.post('/Send-Email-Confirmation', { email });
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'حدث خطأ أثناء إرسال رابط التأكيد');
    }
  },

  validateToken: async (): Promise<boolean> => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return false;
      
      const response = await axiosInstance.post('/Validate-Token');
      return response.data.isValid;
    } catch (error) {
      return false;
    }
  },

  logout: async (token: string): Promise<void> => {
    try {
      await axiosInstance.post('/Logout');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local cleanup even if server logout fails
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