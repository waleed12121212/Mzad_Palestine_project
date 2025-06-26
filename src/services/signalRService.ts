import * as signalR from '@microsoft/signalr';
import { toast } from 'sonner';

// دالة استخراج UserId من التوكن (خارج الكلاس)
function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.sub || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
  } catch {
    return null;
  }
}

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private static instance: SignalRService;
  private messageHandler: ((message: any) => void) | null = null;

  private constructor() {}

  public static getInstance(): SignalRService {
    if (!SignalRService.instance) {
      SignalRService.instance = new SignalRService();
    }
    return SignalRService.instance;
  }

  public async startConnection(): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      // استخراج UserId من التوكن
      const userId = getUserIdFromToken(token);
      console.log('UserId from token:', userId);

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('http://mazadpalestine.runasp.net/chatHub', {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect()
        .build();

      // إعداد معالجات الأحداث
      this.setupEventHandlers();

      await this.connection.start();
      console.log('SignalR Connected!');

      // Setup message handler if exists
      if (this.messageHandler) {
        this.connection.on('ReceiveMessage', this.messageHandler);
      }
    } catch (err) {
      console.error('Error while establishing SignalR connection:', err);
      toast.error('فشل الاتصال بالخادم');
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // معالج الرسائل الجديدة
    this.connection.on('ReceiveMessage', (message) => {
      // سيتم تنفيذ هذا عند استلام رسالة جديدة
      console.log('New message received:', message);
      // يمكنك إضافة منطق إضافي هنا مثل تحديث واجهة المستخدم
    });

    // معالج الإشعارات الجديدة
    this.connection.on('ReceiveNotification', (notification) => {
      console.log('New notification received:', notification);
      toast.info(notification.message);
    });

    // معالج تحديثات المزاد
    this.connection.on('AuctionUpdate', (update) => {
      console.log('Auction update received:', update);
      // تحديث واجهة المستخدم مع معلومات المزاد الجديدة
    });

    // أضف طباعة لأي أحداث أخرى مهمة هنا
  }

  public addMessageHandler(handler: (message: any) => void): void {
    this.messageHandler = handler;
    if (this.connection) {
      this.connection.on('ReceiveMessage', handler);
    }
  }

  public removeMessageHandler(handler: (message: any) => void): void {
    if (this.connection && this.messageHandler === handler) {
      this.connection.off('ReceiveMessage', handler);
      this.messageHandler = null;
    }
  }

  public async sendMessage(receiverId: string, content: string): Promise<void> {
    try {
      if (!this.connection) {
        throw new Error('No SignalR connection');
      }
      await this.connection.invoke('SendMessage', receiverId, content);
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('فشل في إرسال الرسالة');
    }
  }

  public async joinAuctionRoom(auctionId: string): Promise<void> {
    try {
      if (!this.connection) {
        throw new Error('No SignalR connection');
      }
      await this.connection.invoke('JoinAuctionRoom', auctionId);
    } catch (err) {
      console.error('Error joining auction room:', err);
    }
  }

  public async leaveAuctionRoom(auctionId: string): Promise<void> {
    try {
      if (!this.connection) {
        throw new Error('No SignalR connection');
      }
      await this.connection.invoke('LeaveAuctionRoom', auctionId);
    } catch (err) {
      console.error('Error leaving auction room:', err);
    }
  }

  public async stopConnection(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.stop();
        this.connection = null;
        console.log('SignalR Disconnected!');
      }
    } catch (err) {
      console.error('Error stopping SignalR connection:', err);
    }
  }
}

export const signalRService = SignalRService.getInstance(); 