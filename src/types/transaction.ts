// Transaction types based on API response
export enum TransactionType {
  AuctionPayment = 0,
  ListingPayment = 1,
  Refund = 2
}

// Transaction status based on API response
export enum TransactionStatus {
  Pending = 0,
  Completed = 1,
  Refunded = 2,
  Cancelled = 3
}

export interface Transaction {
  transactionId: number;
  userId: number;
  amount: number;
  transactionDate: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string;
  auctionId: number | null;
  listingId: number | null;
  paymentIntentId: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateTransactionInput {
  amount: number;
  type: TransactionType;
  description: string;
  auctionId?: number;
  listingId?: number;
}

export interface UpdateTransactionInput {
  amount?: number;
  status?: TransactionStatus;
}

export interface FilterTransactionParams {
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface TotalAmountResponse {
  success: boolean;
  total: number;
}

// Helper function to convert numeric status to string representation
export const getTransactionStatusText = (status: TransactionStatus): string => {
  switch (status) {
    case TransactionStatus.Pending:
      return 'قيد الانتظار';
    case TransactionStatus.Completed:
      return 'مكتمل';
    case TransactionStatus.Refunded:
      return 'مسترجع';
    case TransactionStatus.Cancelled:
      return 'ملغي';
    default:
      return 'غير معروف';
  }
};

// Helper function to convert numeric type to string representation
export const getTransactionTypeText = (type: TransactionType): string => {
  switch (type) {
    case TransactionType.AuctionPayment:
      return 'دفع مزاد';
    case TransactionType.ListingPayment:
      return 'دفع منتج';
    case TransactionType.Refund:
      return 'استرجاع';
    default:
      return 'غير معروف';
  }
}; 