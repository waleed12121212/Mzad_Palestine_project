import { notificationService } from './notificationService';

export const auctionNotificationService = {
  // When a user places a bid
  notifyBidPlaced: async (userId: number, auctionTitle: string) => {
    try {
      await notificationService.createNotification(
        userId,
        `تمت إضافة مزايدة جديدة على المزاد: ${auctionTitle}. سارع بالمنافسة!`,
        'BidPlaced'
      );
    } catch (error) {
      console.error('Failed to send bid placed notification:', error);
    }
  },

  // When a user's bid is outbid by another user
  notifyBidOutbid: async (userId: number, auctionTitle: string) => {
    try {
      await notificationService.createNotification(
        userId,
        `تم تجاوز مزايدتك في المزاد: ${auctionTitle}. قد ترغب في تقديم مزايدة جديدة.`,
        'BidOutbid'
      );
    } catch (error) {
      console.error('Failed to send outbid notification:', error);
    }
  },

  // When an auction ends
  notifyAuctionEnded: async (userId: number, auctionTitle: string) => {
    try {
      await notificationService.createNotification(
        userId,
        `انتهى المزاد: ${auctionTitle}. نشكرك على مشاركتك!`,
        'AuctionEnded'
      );
    } catch (error) {
      console.error('Failed to send auction ended notification:', error);
    }
  },

  // When a user wins an auction
  notifyAuctionWon: async (userId: number, auctionTitle: string) => {
    try {
      await notificationService.createNotification(
        userId,
        `مبروك! لقد فزت بالمزاد: ${auctionTitle}. سنقوم بالتواصل معك لإتمام العملية.`,
        'AuctionWon'
      );
    } catch (error) {
      console.error('Failed to send auction won notification:', error);
    }
  },

  // When an auction is cancelled
  notifyAuctionCancelled: async (userId: number, auctionTitle: string) => {
    try {
      await notificationService.createNotification(
        userId,
        `تم إلغاء المزاد: ${auctionTitle} من قبل الإدارة.`,
        'AuctionCancelled'
      );
    } catch (error) {
      console.error('Failed to send auction cancelled notification:', error);
    }
  },

  // For general notifications
  notifyGeneral: async (userId: number, message: string = 'لديك إشعار جديد من إدارة المنصة.') => {
    try {
      await notificationService.createNotification(
        userId,
        message,
        'General'
      );
    } catch (error) {
      console.error('Failed to send general notification:', error);
    }
  },

  // For new messages
  notifyNewMessage: async (userId: number, senderName: string, subject?: string) => {
    try {
      const message = subject 
        ? `لديك رسالة جديدة بعنوان: ${subject} من ${senderName}.`
        : `لديك رسالة جديدة من ${senderName}.`;
      
      await notificationService.createNotification(
        userId,
        message,
        'MassageReceived'
      );
    } catch (error) {
      console.error('Failed to send new message notification:', error);
    }
  }
}; 