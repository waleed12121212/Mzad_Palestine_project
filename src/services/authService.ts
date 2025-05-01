import axios from 'axios';

const API_URL = 'http://mzadpalestine.runasp.net/Auth';

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

export const authService = {
  register: async (data: RegisterData) => {
    const response = await axios.post(`${API_URL}/Register`, data);
    return response.data;
  },

  login: async (data: { email: string; password: string }) => {
    const response = await axios.post(`${API_URL}/login`, data);
    return response.data;
  },

  changePassword: async (data: ChangePasswordData, token: string) => {
    const response = await axios.post(`${API_URL}/change-password`, data, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  forgotPassword: async (email: string, token: string) => {
    const response = await axios.post(`${API_URL}/forgot-password`, { email }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  confirmEmail: async (data: ConfirmEmailData) => {
    const response = await axios.post(`${API_URL}/confirm-email`, data);
    return response.data;
  },

  sendEmailConfirmation: async (email: string, token: string) => {
    const response = await axios.post(`${API_URL}/send-email-confirmation`, { email }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  },

  validateToken: async (token: string) => {
    const response = await axios.post(`${API_URL}/validate-token`, { token });
    return response.data;
  },

  logout: async (token: string) => {
    const response = await axios.post(`${API_URL}/logout`, null, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data;
  }
}; 