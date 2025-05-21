export interface Category {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  listingsCount?: number;
  auctionCount?: number;
  subCategories?: SubCategory[];
}

export interface SubCategory {
  id: string;
  name: string;
  listingsCount?: number;
}

export interface AuctionBid {
  id: number;
  auctionId: number;
  userId: number;
  userName: string | null;
  amount: number;
  bidTime: string;
  isWinningBid: boolean;
}

export interface Auction {
  id: number;
  title: string;
  description: string;
  address: string;
  startDate: string;
  endDate: string;
  reservePrice: number;
  currentBid: number;
  bidIncrement: number;
  winnerId: number | null;
  status: string;
  categoryId: number;
  categoryName: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  bids: AuctionBid[];
} 