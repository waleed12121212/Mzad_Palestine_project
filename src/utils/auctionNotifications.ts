import { auctionNotificationService } from '@/services/auctionNotificationService';

interface AuctionItem {
  id: string;
  title: string;
  currentPrice: number;
  endTime: Date;
  winnerId?: number;
  sellerId: number;
}

interface Bid {
  id: string;
  userId: number;
  auctionId: string;
  amount: number;
  createdAt: Date;
}

export const auctionNotifications = {
  // When a user places a bid
  onBidPlaced: async (bid: Bid, auction: AuctionItem) => {
    // Notify the bidder
    await auctionNotificationService.notifyBidPlaced(
      bid.userId,
      auction.title
    );

    // Notify the seller
    await auctionNotificationService.notifyGeneral(
      auction.sellerId,
      `تم وضع مزايدة جديدة على ${auction.title} بقيمة ${bid.amount} ₪`
    );
  },

  // When a user's bid is outbid
  onBidOutbid: async (outbidUserId: number, newBid: Bid, auction: AuctionItem) => {
    await auctionNotificationService.notifyBidOutbid(
      outbidUserId,
      auction.title
    );
  },

  // When an auction is about to end (e.g., 1 hour remaining)
  onAuctionEnding: async (auction: AuctionItem, interestedUserIds: number[]) => {
    // Notify all users who have bid on this auction
    for (const userId of interestedUserIds) {
      await auctionNotificationService.notifyGeneral(
        userId,
        `المزاد على ${auction.title} سينتهي خلال ساعة واحدة. السعر الحالي هو ${auction.currentPrice} ₪`
      );
    }
  },

  // When an auction ends
  onAuctionEnded: async (auction: AuctionItem, interestedUserIds: number[]) => {
    // Notify winner
    if (auction.winnerId) {
      await auctionNotificationService.notifyAuctionWon(
        auction.winnerId,
        auction.title
      );
    }

    // Notify other participants
    for (const userId of interestedUserIds) {
      if (userId !== auction.winnerId) {
        await auctionNotificationService.notifyAuctionEnded(
          userId,
          auction.title
        );
      }
    }

    // Notify seller
    await auctionNotificationService.notifyGeneral(
      auction.sellerId,
      `لقد انتهى المزاد على ${auction.title} بسعر ${auction.currentPrice} ₪`
    );
  },

  // When an auction is cancelled
  onAuctionCancelled: async (auction: AuctionItem, interestedUserIds: number[]) => {
    // Notify all participants
    for (const userId of interestedUserIds) {
      await auctionNotificationService.notifyAuctionCancelled(
        userId,
        auction.title
      );
    }

    // Notify seller
    await auctionNotificationService.notifyGeneral(
      auction.sellerId,
      `تم إلغاء المزاد على ${auction.title}`
    );
  }
}; 