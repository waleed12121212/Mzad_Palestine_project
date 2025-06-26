import * as signalR from '@microsoft/signalr';
import { toast } from 'sonner';

// دالة استخراج UserId من التوكن (خارج الكلاس)
function getUserIdFromToken(token: string | null): string | null {
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const userId = payload.sub || payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] || null;
    console.log('Extracted userId from token:', userId);
    console.log('Full token payload:', payload);
    return userId;
  } catch (error) {
    console.error('Error extracting userId from token:', error);
    return null;
  }
}

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private static instance: SignalRService;
  private messageHandler: ((message: any) => void) | null = null;
  private isConnected: boolean = false;

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
      console.log('SignalR Service - UserId from token:', userId);
      
      if (!userId) {
        console.error('Could not extract userId from token');
        return;
      }

      this.connection = new signalR.HubConnectionBuilder()
        .withUrl('http://mazadpalestine.runasp.net/chatHub', {
          accessTokenFactory: () => token
        })
        .withAutomaticReconnect([0, 2000, 10000, 30000])
        .configureLogging(signalR.LogLevel.Debug)
        .build();

      // إعداد معالجات الأحداث
      this.setupEventHandlers();

      await this.connection.start();
      this.isConnected = true;
      console.log('SignalR Connected successfully!');
      console.log('Connection ID:', this.connection.connectionId);
      console.log('User ID:', userId);

      // Setup message handler if exists
      if (this.messageHandler) {
        this.connection.on('ReceiveMessage', this.messageHandler);
      }
    } catch (err) {
      console.error('Error while establishing SignalR connection:', err);
      this.isConnected = false;
      toast.error('فشل الاتصال بالخادم');
    }
  }

  private setupEventHandlers(): void {
    if (!this.connection) return;

    // معالج الرسائل الجديدة
    this.connection.on('ReceiveMessage', (message) => {
      console.log('SignalR - New message received:', message);
      // يمكنك إضافة منطق إضافي هنا مثل تحديث واجهة المستخدم
    });

    // معالج الإشعارات الجديدة
    this.connection.on('ReceiveNotification', (notification) => {
      console.log('SignalR - New notification received:', notification);
      toast.info(notification.message);
    });

    // معالج تحديثات المزاد
    this.connection.on('AuctionUpdate', (update) => {
      console.log('SignalR - Auction update received:', update);
      // تحديث واجهة المستخدم مع معلومات المزاد الجديدة
    });

    // معالج اتصال جديد
    this.connection.onreconnecting((error) => {
      console.log('SignalR - Reconnecting...', error);
      this.isConnected = false;
    });

    // معالج إعادة الاتصال
    this.connection.onreconnected((connectionId) => {
      console.log('SignalR - Reconnected with connection ID:', connectionId);
      this.isConnected = true;
    });

    // معالج قطع الاتصال
    this.connection.onclose((error) => {
      console.log('SignalR - Connection closed:', error);
      this.isConnected = false;
    });
  }

  public addMessageHandler(handler: (message: any) => void): void {
    this.messageHandler = handler;
    if (this.connection && this.isConnected) {
      this.connection.on('ReceiveMessage', handler);
      console.log('Message handler added to SignalR connection');
    }
  }

  public removeMessageHandler(handler: (message: any) => void): void {
    if (this.connection && this.messageHandler === handler) {
      this.connection.off('ReceiveMessage', handler);
      this.messageHandler = null;
      console.log('Message handler removed from SignalR connection');
    }
  }

  public async sendMessage(receiverId: string, content: string): Promise<void> {
    try {
      if (!this.connection || !this.isConnected) {
        throw new Error('No SignalR connection or not connected');
      }
      
      console.log('Sending message to receiverId:', receiverId, 'content:', content);
      await this.connection.invoke('SendMessage', receiverId, content);
      console.log('Message sent successfully');
    } catch (err) {
      console.error('Error sending message:', err);
      toast.error('فشل في إرسال الرسالة');
    }
  }

  public async joinAuctionRoom(auctionId: string): Promise<void> {
    try {
      if (!this.connection || !this.isConnected) {
        throw new Error('No SignalR connection or not connected');
      }
      console.log('Joining auction room:', auctionId);
      await this.connection.invoke('JoinAuctionRoom', auctionId);
      console.log('Successfully joined auction room:', auctionId);
    } catch (err) {
      console.error('Error joining auction room:', err);
    }
  }

  public async leaveAuctionRoom(auctionId: string): Promise<void> {
    try {
      if (!this.connection || !this.isConnected) {
        throw new Error('No SignalR connection or not connected');
      }
      console.log('Leaving auction room:', auctionId);
      await this.connection.invoke('LeaveAuctionRoom', auctionId);
      console.log('Successfully left auction room:', auctionId);
    } catch (err) {
      console.error('Error leaving auction room:', err);
    }
  }

  public isConnectionActive(): boolean {
    return this.isConnected && this.connection !== null;
  }

  public getConnectionId(): string | null {
    return this.connection?.connectionId || null;
  }

  public async stopConnection(): Promise<void> {
    try {
      if (this.connection) {
        await this.connection.stop();
        this.connection = null;
        this.isConnected = false;
        console.log('SignalR Disconnected!');
      }
    } catch (err) {
      console.error('Error stopping SignalR connection:', err);
    }
  }
}

export const signalRService = SignalRService.getInstance(); 