import axios from 'axios';

// Use relative URL for proxy
const API_URL = '';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = token;
  }
  return config;
});

interface SupportTicket {
  subject: string;
  description: string;
}

interface SupportResponse {
  response: string;
}

interface SupportStatus {
  status: 'Open' | 'InProgress' | 'Resolved' | 'Closed';
}

const handleError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    throw new Error(error.response.data?.message || 'حدث خطأ في الخادم');
  } else if (error.request) {
    // Request made but no response
    throw new Error('لا يمكن الوصول إلى الخادم');
  } else {
    // Error in request setup
    throw new Error('حدث خطأ في الطلب');
  }
};

const supportService = {
  // Create a new support ticket
  createTicket: async (ticket: SupportTicket) => {
    try {
      const response = await api.post('/Support', ticket);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get user's support tickets
  getUserTickets: async () => {
    try {
      const response = await api.get('/Support/user');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get specific ticket details
  getTicketDetails: async (ticketId: string) => {
    try {
      const response = await api.get(`/Support/${ticketId}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Delete a support ticket
  deleteTicket: async (ticketId: string) => {
    try {
      const response = await api.delete(`/Support/${ticketId}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get tickets by status
  getTicketsByStatus: async (status: number) => {
    try {
      const response = await api.get(`/Support/status/${status}`);
      return response.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Add admin response to a ticket
  addResponse: async (ticketId: string, response: string) => {
    try {
      const result = await api.post(`/Support/${ticketId}/response`, JSON.stringify(response), {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Update ticket status
  updateStatus: async (ticketId: string, status: string) => {
    try {
      const result = await api.put(`/Support/${ticketId}/status`, { status }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('json-web-token-Admin')}`
        }
      });
      return result.data;
    } catch (error) {
      handleError(error);
    }
  },

  // Get all support tickets (admin)
  getAllSupport: async () => {
    try {
      const response = await api.get('/Support/all');
      return response.data;
    } catch (error) {
      handleError(error);
    }
  }
};

export default supportService; 