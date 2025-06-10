import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Users, BadgeDollarSign, Share2, Heart, Banknote, ShieldCheck, Info, Flag, AlertTriangle, Edit, Trash2, Package, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import Footer from "@/components/layout/Footer";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { auctionService, Auction, AuctionBid } from "@/services/auctionService";
import { listingService } from "@/services/listingService";
import { userService } from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { bidService } from "@/services/bidService";
import { BidForm } from '@/components/bidding/BidForm';
import { BidHistory } from '@/components/bidding/BidHistory';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import ReviewForm from '@/components/ReviewForm';
import ListingReviews from '@/components/ListingReviews';
import ReportDialog from '@/components/ReportDialog';
import DisputeDialog from '@/components/DisputeDialog';
import ContactSellerDialog from '@/components/ContactSellerDialog';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from '@/components/ui/carousel';

interface SellerInfo {
  id?: number;
  firstName?: string;
  lastName?: string;
  rating?: number;
  totalSales?: number;
  profilePicture?: string;
  username?: string;
  [key: string]: any;
}

// First, define an extended interface that includes the missing properties
interface ExtendedAuction {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  reservePrice: number;
  currentBid?: number;
  bidIncrement: number;
  status: string;
  images?: string[];
  bids?: AuctionBid[];
  userId?: number;
  sellerId?: number;
  category?: string;
  categoryName: string;
  subcategory?: string;
  features?: string[];
  condition?: string;
  location?: string;
  views?: number;
  imageUrl?: string;
  endTime?: string;
  name?: string;
  listingId?: number;
  state?: string;
  address: string;
  city?: string;
  region?: string;
  categoryId: number;
  winnerId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

// أضف دالة تنسيق التاريخ والوقت مع إضافة 3 ساعات
function formatBidDateTime(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  date.setHours(date.getHours() + 3);
  return date.toLocaleString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

const AuctionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isLiked, setIsLiked] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [bidderInfo, setBidderInfo] = useState({ username: "مزايد" });
  const [itemCondition, setItemCondition] = useState("-");
  const [bidderUsernames, setBidderUsernames] = useState<Record<number, string>>({});
  const [latestBids, setLatestBids] = useState<AuctionBid[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [closing, setClosing] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);

  // Add a ref to store the latest bidderUsernames
  const bidderUsernamesRef = React.useRef<Record<number, string>>({});

  // Update bidderUsernames state and ref together
  useEffect(() => {
    bidderUsernamesRef.current = bidderUsernames;
  }, [bidderUsernames]);

  // Fetch auction data with React Query
  const { data: auctionResponse, isLoading, refetch } = useQuery({
    queryKey: ['auction', id],
    queryFn: async () => {
      return await auctionService.getAuctionById(Number(id));
    },
    enabled: !!id,
    refetchInterval: 5000, // Refetch every 5 seconds
    staleTime: 2000, // Consider data stale after 2 seconds
  });

  // Fix the auction extraction with type assertion and fix bid amounts
  const auction = React.useMemo(() => {
    if (!auctionResponse?.data) return null;
    
    const auctionData = auctionResponse.data as ExtendedAuction;
    
    // Fix bids array if it exists
    if (auctionData.bids && auctionData.bids.length > 0) {
      // Get the current bid amount and bidIncrement
      const currentBid = auctionData.currentBid || 0;
      const bidIncrement = auctionData.bidIncrement || 100;
      const reservePrice = auctionData.reservePrice || 0;
      
      // Sort bids by time, most recent first
      const sortedBids = [...auctionData.bids].sort(
        (a, b) => new Date(b.bidTime || '').getTime() - new Date(a.bidTime || '').getTime()
      );
      
      // Fix bid amounts - most recent bid gets the full currentBid
      const fixedBids = sortedBids.map((bid, index) => {
        // Check if bid has a zero amount
        const hasZeroAmount = bid.amount === 0 || bid.amount === undefined;
        
        if (hasZeroAmount) {
          // Calculate amount based on position
          let calculatedAmount = currentBid;
          if (index > 0) {
            calculatedAmount = Math.max(
              currentBid - (index * bidIncrement),
              reservePrice
            );
          }
          
          return {
            ...bid,
            amount: calculatedAmount
          };
        }
        
        // If bid already has a non-zero amount, use it
        return bid;
      });
      
      // Return auction with fixed bids
      return {
        ...auctionData,
        bids: fixedBids
      };
    }
    
    return auctionData;
  }, [auctionResponse?.data]);

  // Debug: Log auction data when it's available
  useEffect(() => {
    if (auction) {
      console.log('Auction data:', auction);
      
      // Determine item condition from description
      if (auction.description) {
        if (auction.description === "سيارة مستعملة") {
          setItemCondition("سيارة مستعملة");
        } else if (auction.description.includes("مستعملة")) {
          setItemCondition("مستعملة");
        } else if (auction.description.includes("جديد")) {
          setItemCondition("جديد");
        }
      }
    }
  }, [auction]);

  // Fetch bidder info
  useEffect(() => {
    const fetchBidderInfo = async () => {
      try {
        if (!auction?.bids || auction.bids.length === 0) return;
        
        // Get the userId from the first bid for the main bidderInfo
        const firstBid = auction.bids[0];
        if (!firstBid.userId) return;
        
        const response = await userService.getUserById(firstBid.userId.toString());
        if (response.success && response.data) {
          setBidderInfo({
            username: response.data.username || "مزايد"
          });
        }
        
        // Fetch usernames for all unique bidders
        const uniqueBidderIds = Array.from(new Set(auction.bids.map(bid => bid.userId)));
        const usernamesMap: Record<number, string> = {};
        
        for (const bidderId of uniqueBidderIds) {
          if (!bidderId) continue;
          try {
            const userResponse = await userService.getUserById(bidderId.toString());
            if (userResponse.success && userResponse.data) {
              usernamesMap[bidderId] = userResponse.data.username || "مزايد";
            }
          } catch (error) {
            console.error(`Error fetching username for user ${bidderId}:`, error);
          }
        }
        
        setBidderUsernames(usernamesMap);
      } catch (error) {
        console.error("Error fetching bidder info:", error);
      }
    };
    
    fetchBidderInfo();
  }, [auction?.bids]);

  // Update the seller query
  const { data: seller } = useQuery({
    queryKey: ['seller', auction?.sellerId || auction?.userId],
    queryFn: async () => {
      if (!auction?.sellerId && !auction?.userId) return null;
      const sellerId = auction.sellerId || auction.userId;
      const sellerData = await userService.getUserById(sellerId.toString());
      const sellerInfo: SellerInfo = sellerData.data || sellerData || {};
      return {
        ...sellerInfo,
        firstName: sellerInfo.firstName || '',
        lastName: sellerInfo.lastName || '',
        rating: sellerInfo.rating || 0,
        totalSales: sellerInfo.totalSales || 0
      };
    },
    enabled: !!(auction?.sellerId || auction?.userId),
  });

  // Set isLiked when auction/id changes
  useEffect(() => {
    if (auction?.id) {
      setIsLiked(isInWishlist(auction.id));
    }
  }, [auction?.id, isInWishlist]);

  // Update the fetchLatestBids function to use the ref
  const fetchLatestBids = async () => {
    try {
      if (!id) return;
      
      console.log('Fetching latest bids for auction:', id);
      
      const response = await auctionService.getAuctionBids(Number(id));
      
      console.log('Raw auction bids response:', response);
      
      if (response.success && response.data) {
        console.log('Latest bids from API:', response.data.bids);
        console.log('Current auction data:', response.data);
        
        // Check if bids have proper amounts - use amount as the primary field
        const bidsWithZeroAmount = response.data.bids.filter(bid => 
          bid.amount === 0 || bid.amount === undefined
        );
        
        if (bidsWithZeroAmount.length > 0) {
          console.warn('Found bids with zero amount:', bidsWithZeroAmount);
        }
        
        // Get current bid and increment from auction data
        const currentBid = response.data.currentBid || auction?.currentBid || 0;
        const bidIncrement = response.data.bidIncrement || auction?.bidIncrement || 100;
        const reservePrice = response.data.reservePrice || auction?.reservePrice || 0;
        
        // Sort bids by time, most recent first
        const sortedBids = [...response.data.bids].sort(
          (a, b) => new Date(b.bidTime || '').getTime() - new Date(a.bidTime || '').getTime()
        );
        
        // Fix bid amounts to ensure each bid has a proper amount value
        const processedBids = sortedBids.map((bid, index) => {
          // Check if bid has a zero amount
          const hasZeroAmount = bid.amount === 0 || bid.amount === undefined;
          
          if (hasZeroAmount) {
            // Calculate amount based on position
            let calculatedAmount = currentBid;
            if (index > 0) {
              calculatedAmount = Math.max(
                currentBid - (index * bidIncrement),
                reservePrice
              );
            }
            
            return {
              ...bid,
              amount: calculatedAmount
            };
          }
          
          // If bid already has a non-zero amount, return as is
          return bid;
        });
        
        // Set the latest bids
        setLatestBids(processedBids);
        
        // Update bidder usernames for new bids
        const uniqueBidderIds = Array.from(new Set(
          processedBids
            .filter(bid => bid.userId && !bidderUsernamesRef.current[bid.userId])
            .map(bid => bid.userId)
        ));
        
        if (uniqueBidderIds.length > 0) {
          const newUsernames = { ...bidderUsernamesRef.current };
          
          for (const bidderId of uniqueBidderIds) {
            if (!bidderId) continue;
            try {
              const userResponse = await userService.getUserById(bidderId.toString());
              if (userResponse.success && userResponse.data) {
                newUsernames[bidderId] = userResponse.data.username || "مزايد";
              }
            } catch (error) {
              console.error(`Error fetching username for user ${bidderId}:`, error);
            }
          }
          
          setBidderUsernames(newUsernames);
        }
      } else {
        console.error('Failed to fetch bids:', response);
      }
    } catch (error) {
      console.error("Error fetching latest bids:", error);
    }
  };

  // Fix the useEffect dependencies
  useEffect(() => {
    if (!id || !auction) return;
    
    // Initial fetch
    fetchLatestBids();
    
    // Set up interval for periodic fetching
    const intervalId = setInterval(fetchLatestBids, 3000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [id, auction?.id]); // Remove bidderUsernames dependency

  // Update the bidsWithUsernames to handle zero bid amounts
  const bidsWithUsernames = React.useMemo(() => {
    if (!latestBids || latestBids.length === 0) return [];
    
    // Create a copy of bids with corrected userNames
    return latestBids.map(bid => {
      return {
        ...bid,
        // Use our locally fetched username if the API returned null
        userName: (bid.userName) || (bid.userId && bidderUsernamesRef.current[bid.userId]) || "مزايد"
      };
    });
  }, [latestBids, bidderUsernames]);

  const handleBidSuccess = (newBid: AuctionBid) => {
    console.log('Bid placed successfully:', newBid);
    
    // Force refetch latest bids
    fetchLatestBids();
    
    // Update the bidderUsernames map with the new bid's user
    if (newBid.userId) {
      userService.getUserById(newBid.userId.toString())
        .then(response => {
          if (response.success && response.data) {
            setBidderUsernames(prev => ({
              ...prev,
              [newBid.userId]: response.data.username || "مزايد"
            }));
          }
        })
        .catch(error => {
          console.error("Error fetching bidder info for new bid:", error);
        });
    }
  };

  const handleBidError = (error: any) => {
    // Check for specific validation errors
    if (error?.errors?.Amount || error?.errors?.BidAmount) {
      const errorMessages = error.errors.Amount || error.errors.BidAmount;
      const arabicMessage = errorMessages.find((msg: string) => /[\u0600-\u06FF]/.test(msg)); // Find Arabic message
      
      toast({
        title: "خطأ في تقديم العرض",
        description: arabicMessage || errorMessages[0] || "يجب أن يكون مبلغ العرض أكبر من صفر",
        variant: "destructive",
      });
    } else {
      toast({
        title: "فشل في تقديم العرض",
        description: error?.message || "حدث خطأ أثناء تقديم العرض",
        variant: "destructive",
      });
    }
  };

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "قم بتسجيل الدخول لإضافة العناصر إلى المفضلة",
        variant: "destructive",
      });
      return;
    }

    if (!auction?.id) {
      toast({
        title: "خطأ في إضافة المزاد للمفضلة",
        description: "لم يتم العثور على معرف المنتج",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        await removeFromWishlist(auction.id);
      } else {
        await addToWishlist(auction.id);
      }
      setIsLiked(!isLiked);
      toast({
        title: isLiked ? "تمت إزالة المزاد من المفضلة" : "تمت إضافة المزاد للمفضلة",
        description: isLiked ? "يمكنك إضافته مرة أخرى في أي وقت" : "يمكنك الوصول للمفضلة من حسابك الشخصي",
      });
    } catch (error) {
      toast({
        title: "فشل في تحديث المفضلة",
        variant: "destructive",
      });
    }
  };

  const handleShareListing = () => {
    if (navigator.share) {
      navigator.share({
        title: auction?.title || 'مشاركة مزاد',
        text: auction?.description || 'تفاصيل المزاد',
        url: window.location.href,
      }).catch((error) => {
        console.error('Error sharing:', error);
      });
    } else {
      // Fallback
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'تم نسخ الرابط',
        description: 'يمكنك مشاركة الرابط مع الآخرين',
      });
    }
    setShowShareMenu(false);
  };

  const navigateToSellerProfile = () => {
    if (seller?.id) {
      navigate(`/profile/${seller.id}`);
    }
  };
  
  const handleContactClick = () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "قم بتسجيل الدخول للتواصل مع البائع",
        variant: "destructive",
      });
      return;
    }
    setShowContactDialog(true);
  };

  const handleReport = () => {
    if (!user) {
      toast({
        title: "يرجى تسجيل الدخول أولاً",
        description: "يجب تسجيل الدخول للإبلاغ عن المزاد",
        variant: "destructive"
      });
      console.log('[AuctionDetails] User not logged in, cannot report auction');
      return;
    }

    // Report handling is now managed by the ReportDialog component
    console.log('[AuctionDetails] Reporting auction:', id);
  };

  const handleDispute = () => {
    if (!user) {
      console.log('[AuctionDetails] User not logged in, cannot open dispute');
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "قم بتسجيل الدخول لفتح نزاع",
        variant: "destructive",
      });
      return;
    }
    console.log('[AuctionDetails] Opening dispute dialog for auction:', id);
    setShowDisputeDialog(true);
  };

  const handleDelete = async () => {
    try {
      await auctionService.deleteAuction(auction.id);
      toast({
        title: "تم حذف المزاد بنجاح",
        description: "تم حذف المزاد والصور المرتبطة به"
      });
      navigate('/');
    } catch (error) {
      toast({
        title: "فشل حذف المزاد",
        description: error.message || "حدث خطأ أثناء حذف المزاد",
        variant: "destructive"
      });
    }
  };

  const handleCloseAuction = async () => {
    setClosing(true);
    try {
      await auctionService.closeAuction(auction.id);
      toast({
        title: "تم إغلاق المزاد",
        description: "تم إغلاق المزاد بنجاح.",
      });
      refetch();
    } catch (error) {
      toast({
        title: "فشل في إغلاق المزاد",
        description: error.message || "حدث خطأ أثناء إغلاق المزاد",
        variant: "destructive",
      });
    } finally {
      setClosing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex-grow flex items-center justify-center">
          <div className="text-center">
            <h2 className="heading-lg mb-4">لم يتم العثور على المزاد</h2>
            <p className="paragraph mb-6">عذراً، لا يمكن العثور على المزاد المطلوب</p>
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              <span>العودة للرئيسية</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* زر إغلاق المزاد لصاحب المزاد فقط */}
          {user && auction && Number(user.id) === Number(auction.userId) && auction.status !== 'Closed' && (
            <button
              className="btn btn-danger mb-4"
              onClick={() => setShowCloseDialog(true)}
              disabled={closing}
            >
              {closing ? "جاري الإغلاق..." : "إغلاق المزاد"}
            </button>
          )}
          <div className="flex flex-col lg:flex-row gap-8 rtl">
            <div className="lg:w-8/12">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                <Link to="/" className="hover:text-blue dark:hover:text-blue-light">الرئيسية</Link>
                <span className="mx-2">›</span>
                <span className="text-gray-900 dark:text-gray-100">{auction.categoryName ?? "الفئة"}</span>
                <span className="mx-2">›</span>
                <span className="text-gray-900 dark:text-gray-100">{auction.title}</span>
              </div>
              
              {/* Main image display with navigation arrows */}
              <div className="mb-8 rounded-xl overflow-hidden relative group">
                {/* Action buttons container */}
                {user && auction && (Number(user.id) === Number(auction.sellerId) || Number(user.id) === Number(auction.userId)) && (
                  <div className="absolute top-4 left-4 z-20 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Edit button clicked", {
                          auctionId: auction.id,
                          userId: user.id,
                          sellerId: auction.sellerId,
                          auctionUserId: auction.userId
                        });
                        navigate(`/auction/${auction.id}/edit`);
                      }}
                      className="flex items-center gap-2 px-3 py-2 bg-white/90 hover:bg-blue-50 text-blue-600 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
                      title="تعديل المزاد"
                    >
                      <Edit className="h-5 w-5" />
                      <span className="hidden sm:inline">تعديل</span>
                    </button>
                    <button
                      onClick={() => setShowDeleteDialog(true)}
                      className="flex items-center gap-2 px-3 py-2 bg-white/90 hover:bg-red-50 text-red-600 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
                      title="حذف المزاد"
                    >
                      <Trash2 className="h-5 w-5" />
                      <span className="hidden sm:inline">حذف</span>
                    </button>
                    {auction.status !== 'Closed' && (
                      <button
                        onClick={() => setShowCloseDialog(true)}
                        disabled={closing}
                        className="flex items-center gap-2 px-3 py-2 bg-white/90 hover:bg-gray-200 text-gray-700 rounded-lg shadow-lg backdrop-blur-sm transition-all duration-200 hover:scale-105"
                        title="إغلاق المزاد"
                      >
                        <Lock className="h-5 w-5 text-orange-500" />
                        <span className="hidden sm:inline">{closing ? 'جاري الإغلاق...' : 'إغلاق المزاد'}</span>
                      </button>
                    )}
                  </div>
                )}

                {/* Delete confirmation dialog */}
                {showDeleteDialog && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                      <h3 className="text-xl font-bold mb-4">تأكيد حذف المزاد</h3>
                      <p className="mb-6 text-gray-600 dark:text-gray-300">
                        هل أنت متأكد من حذف هذا المزاد؟ لا يمكن التراجع عن هذا الإجراء.
                      </p>
                      <div className="flex gap-4 justify-end">
                        <button
                          onClick={() => setShowDeleteDialog(false)}
                          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={handleDelete}
                          className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700"
                        >
                          حذف المزاد
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* نافذة تأكيد إغلاق المزاد */}
                {showCloseDialog && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                      <h3 className="text-xl font-bold mb-4">تأكيد إغلاق المزاد</h3>
                      <p className="mb-6 text-gray-600 dark:text-gray-300">
                        هل أنت متأكد من إغلاق هذا المزاد؟ لا يمكن إعادة فتحه بعد الإغلاق.
                      </p>
                      <div className="flex gap-4 justify-end">
                        <button
                          onClick={() => setShowCloseDialog(false)}
                          className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                          إلغاء
                        </button>
                        <button
                          onClick={async () => { setShowCloseDialog(false); await handleCloseAuction(); }}
                          className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                          disabled={closing}
                        >
                          {closing ? 'جاري الإغلاق...' : 'تأكيد الإغلاق'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Image Modal */}
                {isImageModalOpen && selectedImage && (
                  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setIsImageModalOpen(false)}>
                    <div className="relative max-w-4xl max-h-[80vh] w-full h-full flex items-center justify-center p-4">
                <button 
                        className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm p-2 rounded-full text-white hover:bg-white/40"
                        onClick={() => setIsImageModalOpen(false)}
                >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                </button>
                      <img 
                        src={selectedImage} 
                        alt="صورة مكبرة" 
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 py-6">
                  {auction.images && auction.images.length > 0 ? (
                    <>
                      {/* Main Image with navigation arrows */}
                      <div className="relative rounded-2xl overflow-hidden mb-4">
                        <img
                          src={auction.images[activeImageIdx] || "/placeholder.svg"}
                          alt={`${auction.title} - صورة ${activeImageIdx + 1}`}
                          className="w-full h-96 object-cover cursor-pointer"
                          onClick={() => {
                            setSelectedImage(auction.images[activeImageIdx]);
                            setIsImageModalOpen(true);
                          }}
                          onError={e => {
                            (e.target as HTMLImageElement).src = "/placeholder.svg";
                          }}
                        />
                        {auction.images.length > 1 && (
                          <>
                <button 
                              onClick={() => setActiveImageIdx((prev) => (prev - 1 + auction.images.length) % auction.images.length)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
                              type="button"
                            >
                              <ChevronLeft className="w-6 h-6" />
                </button>
                <button 
                              onClick={() => setActiveImageIdx((prev) => (prev + 1) % auction.images.length)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 shadow hover:bg-white z-10"
                              type="button"
                            >
                              <ChevronRight className="w-6 h-6" />
                </button>
                          </>
                        )}
              </div>
                      {/* Thumbnails Row */}
                      {auction.images.length > 1 && (
                        <div className="flex gap-2 w-full mt-2">
                          {auction.images.map((img, idx) => (
                            <img
                              key={img + idx}
                              src={img || "/placeholder.svg"}
                              alt={`Thumbnail ${idx + 1}`}
                              onClick={() => setActiveImageIdx(idx)}
                              className={`h-16 object-cover rounded-lg cursor-pointer border-2 flex-1 ${activeImageIdx === idx ? "border-blue-500" : "border-transparent"}`}
                              style={{ boxSizing: "border-box" }}
                              onError={e => {
                                (e.target as HTMLImageElement).src = "/placeholder.svg";
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg">
                      <Package className="h-12 w-12 text-gray-400" />
                      <p className="text-gray-500 dark:text-gray-400 ml-2">لا توجد صور متاحة</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mb-8">
                <h2 className="heading-md mb-6">وصف المنتج</h2>
                <p className="paragraph mb-6">{auction.description}</p>
                
                <h3 className="heading-sm mb-4">المميزات:</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                  {(auction.features ?? []).map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue dark:bg-blue-light"></div>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="neo-card p-4 text-center">
                    <h4 className="font-medium mb-2">الحالة</h4>
                    <p className="text-lg font-bold">-</p>
                  </div>
                  <div className="neo-card p-4 text-center">
                    <h4 className="font-medium mb-2">الموقع</h4>
                    <p className="text-lg font-bold">
                      {auction?.address || "-"}
                    </p>
                  </div>
                  <div className="neo-card p-4 text-center">
                    <h4 className="font-medium mb-2">الفئة</h4>
                    <p className="text-lg font-bold">
                      {auction?.categoryName || "-"}
                    </p>
                  </div>
                </div>

                {/* التقييمات والمراجعات */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-6">التقييمات والمراجعات</h2>
                  
                  {user && auction && Number(user.id) !== Number(auction.sellerId) && Number(user.id) !== Number(auction.userId) && (
                    <div className="mb-8">
                      <ReviewForm 
                        auctionId={String(auction.id)}
                        onReviewSubmitted={() => {
                          // Refresh reviews after submission
                          queryClient.invalidateQueries({
                            queryKey: ['reviews', auction.id]
                          });
                        }} 
                      />
                    </div>
                  )}

                  <ListingReviews auctionId={String(auction.id)} />
                </div>
              </div>
            </div>
            
            <div className="lg:w-4/12">
              <div className="sticky top-24">
                {/* Dispute button in top left of card */}
                <button
                  onClick={handleDispute}
                  title="فتح نزاع"
                  className="absolute top-2 left-2 z-20 bg-blue-50 hover:bg-blue-100 text-blue-600 p-2 rounded-full shadow flex items-center justify-center"
                  style={{ minWidth: '44px', minHeight: '44px' }}
                >
                  <AlertTriangle className="h-5 w-5" />
                  <span className="sr-only">نزاع</span>
                </button>
                <DisputeDialog
                  auctionId={auction.id}
                  open={showDisputeDialog}
                  onOpenChange={setShowDisputeDialog}
                  onDisputeSubmitted={() => {
                    setShowDisputeDialog(false);
                    toast({
                      title: "تم فتح النزاع بنجاح",
                      description: "سيتم مراجعة النزاع من قبل فريق العمل",
                    });
                  }}
                />
                <div className="neo-card p-6 mb-6">
                  <h1 className="heading-md mb-4">{auction.title}</h1>
                  
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">السعر الحالي</p>
                      <p className="text-3xl font-bold text-blue dark:text-blue-light">
                        ₪{(((auction as any).currentBid && (auction as any).currentBid > 0) ? (auction as any).currentBid : (auction.reservePrice ?? 0)).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">بدأ من</p>
                      <p className="text-lg font-medium">
                        ₪{(auction.reservePrice || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ينتهي بعد</p>
                        <CountdownTimer endTime={new Date(auction.endDate || auction.endTime)} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">عدد المزايدات</p>
                        <p className="font-medium">{latestBids?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        الحد الأدنى للمزايدة: ₪{((auction.currentBid && auction.currentBid > 0 ? auction.currentBid : auction.reservePrice ?? 0) + (auction.bidIncrement ?? 0)).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {auction.views} مشاهدة
                      </span>
                    </div>
                    
                    <BidForm
                      auctionId={Number(id)}
                      auctionTitle={auction?.title || auction?.name || ''}
                      currentPrice={auction.currentBid !== undefined && auction.currentBid > 0 ? auction.currentBid : auction.reservePrice}
                      bidIncrement={auction.bidIncrement || 100}
                      isAuctionActive={new Date(auction.endDate || auction.endTime) > new Date()}
                      onBidSuccess={handleBidSuccess}
                      onBidError={handleBidError}
                    />
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={toggleLike}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${isLiked ? 'bg-red-50 text-red-500 border-red-200 dark:bg-red-900/20 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}`}
                      >
                        <Heart className={`h-5 w-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>المفضلة</span>
                      </button>
                      <button 
                        onClick={handleShareListing}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <Share2 className="h-5 w-5" />
                        <span>مشاركة</span>
                      </button>
                      {auction && (
                        <ReportDialog 
                          auctionId={auction.id}
                          onReportSubmitted={() => {
                            toast({
                              title: "تم إرسال البلاغ",
                              description: "سيتم مراجعة البلاغ من قبل فريق الإدارة"
                            });
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="neo-card p-6">
                  <h3 className="heading-sm mb-4">تاريخ المزايدات</h3>
                  {bidsWithUsernames && bidsWithUsernames.length > 0 ? (
                    <div 
                      className="space-y-4 max-h-80 overflow-y-auto pr-1" 
                      style={{ 
                        scrollbarWidth: 'thin',
                        scrollbarColor: 'rgba(59, 130, 246, 0.5) rgba(219, 234, 254, 0.1)',
                      }}
                    >
                      {/* Show all bids instead of just the first 3 */}
                      {bidsWithUsernames.map((bid) => (
                        <div key={bid.id} className="flex justify-between items-start border-b pb-3 last:border-b-0">
                          <div className="flex flex-col">
                            <span className="font-bold text-blue dark:text-blue-400">
                              {bid.userName || "مزايد"}
                              {bid.userId === Number(user?.id) && (
                                <span className="text-sm text-blue-600 dark:text-blue-300 mr-2">(أنت)</span>
                              )}
                            </span>
                            <span className="text-sm text-gray-500">
                              {bid.bidTime ? formatBidDateTime(bid.bidTime) : ''}
                            </span>
                          </div>
                          <div>
                            <span className="text-xl font-bold">₪ {(bid.amount || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">لا توجد مزايدات حتى الآن</p>
                  )}
                </div>
                
                <div className="neo-card p-6 mb-6">
                  <h3 className="heading-sm mb-4">معلومات البائع</h3>
                  {!seller ? (
                    <div className="flex justify-center items-center py-6">
                      <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-3 mb-4">
                        <Link to={`/seller/${seller.id}`} className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center group" tabIndex={0}>
                          {seller.profilePicture ? (
                        <img
                          src={
                            seller.profilePicture.startsWith('http')
                              ? seller.profilePicture
                              : `http://mazadpalestine.runasp.net${seller.profilePicture}`
                          }
                              alt={`${seller.firstName} ${seller.lastName}`}
                              className="w-full h-full object-cover group-hover:opacity-80 transition"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '/default-avatar.png';
                                (e.target as HTMLImageElement).onerror = () => {
                                  e.currentTarget.style.display = 'none';
                                  if (e.currentTarget.parentElement) {
                                    e.currentTarget.parentElement.innerHTML = seller.username?.charAt(0)?.toUpperCase() || 'U';
                                  }
                                };
                              }}
                        />
                      ) : (
                            <span className="text-xl font-bold text-gray-600 dark:text-gray-300">
                              {seller.username?.charAt(0)?.toUpperCase() || 'U'}
                            </span>
                      )}
                        </Link>
                    <div>
                          <Link to={`/seller/${seller.id}`} className="font-bold text-gray-900 dark:text-white hover:no-underline focus:outline-none">
                            {`${seller.firstName} ${seller.lastName}`}
                          </Link>
                          <div className="flex items-center gap-1">
                            <span className="text-yellow-500">★</span>
                            <span>{seller.rating?.toFixed(1) || "0.0"}</span>
                          </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleContactClick}
                        className="w-full btn-primary py-2"
                  >
                        تواصل مع البائع
                  </button>
                    </div>
                  )}
                </div>
                
                <div className="neo-card p-6">
                  <h3 className="flex items-center gap-2 heading-sm mb-4">
                    <ShieldCheck className="h-5 w-5" />
                    <span>نصائح للمزايدة الآمنة</span>
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue dark:text-blue-light shrink-0 mt-1" />
                      <span className="text-sm">تحقق من تقييمات البائع وتاريخ معاملاته قبل المزايدة.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue dark:text-blue-light shrink-0 mt-1" />
                      <span className="text-sm">استخدم نظام الدفع الآمن الخاص بالمنصة دائمًا.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Info className="h-5 w-5 text-blue dark:text-blue-light shrink-0 mt-1" />
                      <span className="text-sm">لا تقم بمشاركة معلوماتك الشخصية مع البائعين خارج المنصة.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Banknote className="h-5 w-5 text-green shrink-0 mt-1" />
                      <span className="text-sm">مزاد فلسطين يضمن استرداد أموالك في حال عدم مطابقة المنتج للوصف.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {seller && (
        <ContactSellerDialog
          isOpen={showContactDialog}
          onClose={() => setShowContactDialog(false)}
          sellerId={seller.id}
          sellerName={`${seller.firstName || ''} ${seller.lastName || ''}`.trim() || seller.username || 'مستخدم'}
          auctionTitle={auction?.title}
          auctionId={auction?.id}
          auctionImage={(auction?.images && auction.images.length > 0) ? auction.images[0] : auction?.imageUrl}
          auctionPrice={auction?.currentBid || auction?.reservePrice}
        />
      )}
    </div>
  );
};

export default AuctionDetails;