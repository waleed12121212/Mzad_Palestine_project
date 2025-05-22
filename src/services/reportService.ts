import axios from 'axios';
import { getAuthHeader } from '@/utils/auth';

const API_URL = '/Report';

export interface Report {
  reportId: number;
  reason: string;
  createdAt: string;
  reporterId: number;
  reportedListingId: number | null;
  reportedAuctionId: number | null;
  resolvedBy: number | null;
  reporterName: string;
  reportedListingTitle: string | null;
  resolverName: string | null;
  resolution: string | null;
  status: ReportStatus;
}

export enum ReportStatus {
  Pending = "Pending",
  Resolved = "Resolved",
  Rejected = "Rejected"
}

export interface CreateReportDto {
  listingId?: number;
  auctionId?: number;
  reason: string;
}

export interface UpdateReportDto {
  reason: string;
  resolution: string;
  status?: ReportStatus;
}

export enum ReportReasonType {
  INAPPROPRIATE_CONTENT = "محتوى غير لائق",
  HATE_SPEECH = "خطاب كراهية أو تمييز",
  VIOLENCE_INCITEMENT = "تحريض على العنف أو الإرهاب",
  MISLEADING_INFO = "معلومات مضللة أو كاذبة",
  ILLEGAL_CONTENT = "محتوى غير قانوني",
  SEXUAL_CONTENT = "محتوى جنسي أو إباحي",
  IMPERSONATION = "انتحال شخصية",
  FRAUD = "احتيال أو خداع",
  COPYRIGHT = "حقوق ملكية فكرية",
  SPAM = "محتوى مكرر أو مزعج",
  IRRELEVANT = "غير متعلق بالموضوع أو القسم",
  MALICIOUS_CONTENT = "محتوى يحتوي على خلل تقني أو رابط ضار",
  OTHER = "غير ذلك"
}

export const ReportReasonDescriptions: Record<ReportReasonType, string> = {
  [ReportReasonType.INAPPROPRIATE_CONTENT]: "صور أو كلمات مسيئة أو خارجة عن الأخلاق العامة.",
  [ReportReasonType.HATE_SPEECH]: "محتوى فيه عنصرية، تنمر، تحريض على الكراهية ضد فئة أو جماعة.",
  [ReportReasonType.VIOLENCE_INCITEMENT]: "دعوات للعنف، الإرهاب أو الجرائم.",
  [ReportReasonType.MISLEADING_INFO]: "أخبار غير صحيحة، شائعات، تلاعب بالمحتوى.",
  [ReportReasonType.ILLEGAL_CONTENT]: "ترويج للمخدرات، أسلحة، تجارة ممنوعة، أو مخالف للقوانين المحلية.",
  [ReportReasonType.SEXUAL_CONTENT]: "صور أو عبارات فيها إيحاءات جنسية أو مواد غير مناسبة.",
  [ReportReasonType.IMPERSONATION]: "المنشور صادر عن حساب يدّعي أنه شخص أو جهة معينة بشكل كاذب.",
  [ReportReasonType.FRAUD]: "محاولات سرقة بيانات، طلبات دفع مشبوهة، أو بيع وهمي.",
  [ReportReasonType.COPYRIGHT]: "نشر صور، فيديوهات، أو نصوص بدون إذن من صاحب الحق.",
  [ReportReasonType.SPAM]: "منشورات متكررة، روابط مزعجة، دعاية غير مرغوبة.",
  [ReportReasonType.IRRELEVANT]: "منشور في غير مكانه الصحيح أو لا علاقة له بالموضوع.",
  [ReportReasonType.MALICIOUS_CONTENT]: "روابط تؤدي لمواقع مشبوهة، فيروسات، أو تسبب مشاكل للمستخدمين.",
  [ReportReasonType.OTHER]: "سبب آخر غير مذكور في القائمة."
}

export const ReportReasonIcons: Record<ReportReasonType, string> = {
  [ReportReasonType.INAPPROPRIATE_CONTENT]: "🚫",
  [ReportReasonType.HATE_SPEECH]: "📛",
  [ReportReasonType.VIOLENCE_INCITEMENT]: "🕊️",
  [ReportReasonType.MISLEADING_INFO]: "⚠️",
  [ReportReasonType.ILLEGAL_CONTENT]: "👮‍♂️",
  [ReportReasonType.SEXUAL_CONTENT]: "🔞",
  [ReportReasonType.IMPERSONATION]: "🧠",
  [ReportReasonType.FRAUD]: "💼",
  [ReportReasonType.COPYRIGHT]: "📸",
  [ReportReasonType.SPAM]: "🧾",
  [ReportReasonType.IRRELEVANT]: "📍",
  [ReportReasonType.MALICIOUS_CONTENT]: "🐞",
  [ReportReasonType.OTHER]: "❓"
}

class ReportService {
  async createListingReport(data: CreateReportDto): Promise<Report> {
    console.log('Creating listing report with data:', JSON.stringify(data, null, 2));
    
    try {
      const response = await axios.post(`${API_URL}/listing/${data.listingId}`, data, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      console.log('Listing report creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Listing report creation error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      });
      throw error;
    }
  }

  async createAuctionReport(data: CreateReportDto): Promise<Report> {
    console.log('Creating auction report with data:', JSON.stringify(data, null, 2));
    
    try {
      const response = await axios.post(`${API_URL}/auction/${data.auctionId}`, data, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      console.log('Auction report creation response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Auction report creation error:', {
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

  async resolveReport(id: number, resolution: string, status: ReportStatus = ReportStatus.Resolved): Promise<Report> {
    console.log('Resolving report with data:', JSON.stringify({ id, resolution, status }, null, 2));
    
    try {
      const response = await axios.put(`${API_URL}/resolve/${id}`, {
        resolution,
        status
      }, {
        headers: {
          ...getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });
      console.log('Report resolution response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Report resolution error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        config: error.config
      });
      throw error;
    }
  }

  async getUserReports(): Promise<Report[]> {
    try {
      const response = await axios.get(`${API_URL}/user`, {
        headers: getAuthHeader()
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user reports:', error);
      throw error;
    }
  }

  async deleteReport(id: number): Promise<void> {
    await axios.delete(`${API_URL}/${id}`, {
      headers: getAuthHeader()
    });
  }

  // Backward compatibility
  async createReport(data: CreateReportDto): Promise<Report> {
    return this.createListingReport(data);
  }
}

export const reportService = new ReportService(); 