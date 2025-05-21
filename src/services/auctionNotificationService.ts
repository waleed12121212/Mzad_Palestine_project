import { notificationService } from './notificationService';

export const auctionNotificationService = {
  // When a user places a bid
  notifyBidPlaced: async (userId: number, auctionTitle: string) => {
    try {
      console.debug('[auctionNotificationService] notifyBidPlaced auctionTitle:', auctionTitle);
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
      console.debug('[auctionNotificationService] notifyBidOutbid auctionTitle:', auctionTitle);
      // Debug for message content
      if (auctionTitle.includes('المزاد رقم')) {
        console.debug('[auctionNotificationService] المزاد رقم detected in auctionTitle:', auctionTitle);
      }
      await notificationService.createNotification(
        userId,
        auctionTitle,
        'BidOutbid'
      );
    } catch (error) {
      console.error('Failed to send outbid notification:', error);
    }
  },

  // When an auction ends
  notifyAuctionEnded: async (userId: number, auctionTitle: string) => {
    try {
      console.debug('[auctionNotificationService] notifyAuctionEnded auctionTitle:', auctionTitle);
      await notificationService.createNotification(
        userId,
        auctionTitle,
        'AuctionEnded'
      );
    } catch (error) {
      console.error('Failed to send auction ended notification:', error);
    }
  },

  // When a user wins an auction
  notifyAuctionWon: async (userId: number, auctionTitle: string) => {
    try {
      console.debug('[auctionNotificationService] notifyAuctionWon auctionTitle:', auctionTitle);
      await notificationService.createNotification(
        userId,
        auctionTitle,
        'AuctionWon'
      );
    } catch (error) {
      console.error('Failed to send auction won notification:', error);
    }
  },

  // When an auction is cancelled
  notifyAuctionCancelled: async (userId: number, auctionTitle: string) => {
    try {
      console.debug('[auctionNotificationService] notifyAuctionCancelled auctionTitle:', auctionTitle);
      await notificationService.createNotification(
        userId,
        auctionTitle,
        'AuctionCancelled'
      );
    } catch (error) {
      console.error('Failed to send auction cancelled notification:', error);
    }
  },

  // For general notifications
  notifyGeneral: async (userId: number, message: string = 'لديك إشعار جديد من إدارة المنصة.') => {
    try {
      if (message.includes('المزاد رقم')) {
        console.debug('[auctionNotificationService] المزاد رقم detected in general message:', message);
      }
      if (message.includes('تم تجواز مزايدتك')) {
        console.debug('[auctionNotificationService] تم تجواز مزايدتك detected in general message:', message);
      }
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
  notifyNewMessage: async (userId: string | number, senderName: string, subject?: string) => {
    try {
      const message = subject === "default" 
  ? `لديك رسالة جديدة من ${senderName}.` // Case 1: Explicit string "default"
  : `لديك رسالة جديدة ${subject ? `بعنوان: ${subject}` : ""} من ${senderName}.`; // Case 2: All other values
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