export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  listingsCount?: number;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  listingsCount?: number;
}

export interface Auction {
  id: string;
  name: string;
  title: string;
  description: string;
  currentBid: number;
  bidIncrement: number;
  imageUrl: string;
  startTime: string;
  endTime: string;
  bidders: number;
  categoryId: string;
  sellerId: string;
  reservePrice?: number;
  status: 'active' | 'ended' | 'cancelled';
  bidsCount?: number;
  auctionId?: string;
} 