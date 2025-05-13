import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';

const API_URL = '/Report';

export interface Report {
  reportId: number;
  reason: string;
  createdAt: string;
  reporterId: number;
  reportedListingId: number;
  resolvedBy: number | null;
  reporterName: string;
  reportedListingTitle: string;
  resolverName: string | null;
  resolution: string | null;
}

export interface CreateReportDto {
  listingId: number;
  reason: string;
}

export interface UpdateReportDto {
  reason: string;
  resolution: string;
}

class ReportService {
  async createReport(data: CreateReportDto): Promise<Report> {
    console.log('Creating report with data:', JSON.stringify(data, null, 2));
    
    try {
      const response = await axios.post(`${API_URL}/${data.listingId}`, data, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      console.log('Report creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Report creation error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      });
      throw error;
    }
  }

  async getReportById(id: number): Promise<Report> {
    const response = await axios.get(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async getAllReports(): Promise<{ success: boolean, data: Report[] }> {
    const response = await axios.get(API_URL, {
      headers: getAuthHeader()
    });
    return response.data;
  }

  async updateReport(id: number, data: UpdateReportDto): Promise<Report> {
    const response = await axios.put(`${API_URL}/${id}`, data, {
      headers: {
        ...getAuthHeader(),
        'Content-Type': 'application/json'
      }
    });
    return response.data;
  }

  async deleteReport(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
  }
}

export const reportService = new ReportService(); 