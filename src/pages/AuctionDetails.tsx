import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Users, BadgeDollarSign, Share2, Heart, Banknote, ShieldCheck, Info, Flag, AlertTriangle } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { auctionService, Auction } from "@/services/auctionService";
import { listingService } from "@/services/listingService";
import { userService } from "@/services/userService";
import { useAuth } from "@/contexts/AuthContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { bidService, Bid } from "@/services/bidService";
import { BidForm } from '@/components/bidding/BidForm';
import { BidHistory } from '@/components/bidding/BidHistory';
import { useQueryClient } from '@tanstack/react-query';
import ReviewForm from '@/components/ReviewForm';
import ListingReviews from '@/components/ListingReviews';
import ReportDialog from '@/components/ReportDialog';
import DisputeDialog from '@/components/DisputeDialog';

interface ExtendedAuction extends Omit<Auction, 'imageUrl' | 'endTime'> {
  title?: string;
  description?: string;
  category?: string;
  subcategory?: string;
  condition?: string;
  location?: string;
  features?: string[];
  images?: string[];
  imageUrl?: string;
  userId?: number;
  seller?: any;
  bids?: Bid[];
  startPrice?: number;
  bidders?: number;
  views?: number;
  endTime: string;
}

const AuctionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<ExtendedAuction>(null);
  const [originalStartPrice, setOriginalStartPrice] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isMobile = useIsMobile();
  const [seller, setSeller] = useState<any>(null);
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const [isLiked, setIsLiked] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);

  useEffect(() => {
    if (auction?.listingId) {
      setIsLiked(isInWishlist(auction.listingId));
    }
  }, [auction?.listingId, isInWishlist]);

  const handleBidSuccess = (newBid: Bid) => {
    // Optimistically update the auction data
    setAuction(prev => ({
      ...prev,
      reservePrice: newBid.bidAmount,
      bids: [newBid, ...(prev.bids || [])]
    }));
    
    // Refetch auction data
    queryClient.invalidateQueries({ queryKey: ['auction', id] });
  };

  useEffect(() => {
    const fetchAuction = async () => {
      setLoading(true);
      try {
        const auctionResponse: any = await auctionService.getAuctionById(Number(id));
        console.log('auctionData', auctionResponse);
        const auctionData = auctionResponse.data;
        
        // Debug: log the Listing object
        console.log('Listing data:', auctionData.Listing);
        
        // التحقق من وجود المنتج المرتبط
        if (!auctionData.Listing) {
          throw new Error("المزاد لا يحتوي على منتج مرتبط");
        }

        // تحويل البيانات إلى الشكل المتوقع في الواجهة
        const normalizedAuction = {
          id: auctionData.AuctionId,
          listingId: auctionData.ListingId,
          name: auctionData.Name,
          title: auctionData.Name,
          description: auctionData.Listing?.Description || '',
          imageUrl: auctionData.ImageUrl,
          startTime: auctionData.StartTime,
          endTime: auctionData.EndTime,
          reservePrice: auctionData.ReservePrice,
          currentBid: auctionData.CurrentBid,
          bidIncrement: auctionData.BidIncrement,
          status: auctionData.Status,
          userId: auctionData.UserId,
          bidders: auctionData.Bids?.length || 0,
          bids: auctionData.Bids || [],
          category: typeof auctionData.Listing?.Category === 'object' ? auctionData.Listing.Category?.Name || '' : auctionData.Listing?.Category || '',
          subcategory: typeof auctionData.Listing?.Subcategory === 'object' ? auctionData.Listing.Subcategory?.Name || '' : auctionData.Listing?.Subcategory || '',
          condition: auctionData.Listing?.Condition || auctionData.Listing?.condition || '',
          location: auctionData.Listing?.Location || auctionData.Listing?.location || '',
          features: auctionData.Listing?.Features || [],
          views: 0,
        };

        console.log('Normalized auction data:', normalizedAuction); // للتأكد من البيانات

        setAuction(normalizedAuction);
        setOriginalStartPrice(auctionData.ReservePrice);

        // جلب معلومات البائع
        if (auctionData.UserId || auctionData.userId) {
          try {
            const sellerId = (auctionData.UserId || auctionData.userId).toString();
            const sellerData = await userService.getUserById(sellerId);
            // Debug: log the full sellerData and its keys
            console.log('Fetched sellerData:', sellerData);
            console.log('sellerData keys:', Object.keys(sellerData));
            if (sellerData) {
              // @ts-expect-error: sellerData is not a UserProfile, it has a 'data' property
              const sellerInfo = sellerData.data || sellerData || {};
              setSeller({
                ...sellerInfo,
                firstName: sellerInfo.firstName || '',
                lastName: sellerInfo.lastName || '',
                rating: sellerInfo.rating || 0,
                totalSales: sellerInfo.totalSales || 0
              });
            } else {
              setSeller(null);
              console.error('No seller data returned for ID:', sellerId);
            }
          } catch (error) {
            console.error('Error fetching seller data:', error);
            setSeller(null);
            // Don't show error toast for seller data - just handle gracefully
          }
        } else {
          console.error('No seller ID found in auction data');
          setSeller(null);
        }
      } catch (error) {
        setAuction(null);
        setSeller(null);
        toast({
          title: "خطأ في جلب بيانات المزاد",
          description: error.message || "حدث خطأ غير متوقع."
        });
      } finally {
        setLoading(false);
      }
    };
    fetchAuction();
  }, [id]);

  const toggleLike = async () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "قم بتسجيل الدخول لإضافة العناصر إلى المفضلة",
        variant: "destructive",
      });
      return;
    }

    if (!auction?.listingId) {
      toast({
        title: "خطأ في إضافة المزاد للمفضلة",
        description: "لم يتم العثور على معرف المنتج",
        variant: "destructive",
      });
      return;
    }

    try {
      if (isLiked) {
        await removeFromWishlist(auction.listingId);
      } else {
        await addToWishlist(auction.listingId);
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

  const handleShareClick = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "تم نسخ الرابط",
      description: "تم نسخ رابط المزاد إلى الحافظة",
    });
  };
  
  const navigateToSellerProfile = () => {
    if (auction?.seller?.id) {
      navigate(`/seller/${auction.seller.id}`);
    }
  };
  
  const navigateToChat = () => {
    if (seller?.id) {
      navigate(`/conversations/${seller.id}`);
    }
  };

  // Handle image navigation
  const handleImageClick = (index: number) => {
    setCurrentImageIndex(index);
  };

  const handleNextImage = () => {
    if (auction?.images) {
      setCurrentImageIndex((prev) => (prev + 1) % auction.images.length);
    }
  };

  const handlePrevImage = () => {
    if (auction?.images) {
      setCurrentImageIndex((prev) => 
        prev === 0 ? auction.images.length - 1 : prev - 1
      );
    }
  };

  const handleReport = () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "قم بتسجيل الدخول للإبلاغ عن المزاد",
        variant: "destructive",
      });
      return;
    }

    // TODO: Implement report functionality
    toast({
      title: "تم الإبلاغ عن المزاد",
      description: "سيتم مراجعة البلاغ من قبل فريق العمل",
    });
  };

  const handleDispute = () => {
    if (!user) {
      toast({
        title: "يجب تسجيل الدخول أولاً",
        description: "قم بتسجيل الدخول لفتح نزاع",
        variant: "destructive",
      });
      return;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
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
        <Navbar />
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
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8 rtl">
            <div className="lg:w-8/12">
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                <Link to="/" className="hover:text-blue dark:hover:text-blue-light">الرئيسية</Link>
                <span className="mx-2">›</span>
                <span className="text-gray-900 dark:text-gray-100">{auction.category ?? "الفئة"}</span>
                <span className="mx-2">›</span>
                <span className="text-gray-900 dark:text-gray-100">{auction.title}</span>
              </div>
              
              {/* Main image display with navigation arrows */}
              <div className="mb-4 rounded-xl overflow-hidden relative group">
                {/* Top left action buttons */}
                <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10, display: 'flex', gap: '8px' }}>
                  {user && auction && user.id === auction.userId && (
                    <>
                      <button
                        title="تعديل المزاد"
                        onClick={() => navigate(`/auction/${auction.id}/edit`)}
                        className="bg-white/80 hover:bg-blue-100 text-blue-600 p-2 rounded-full shadow"
                      >
                        <i className="fa fa-edit" />
                      </button>
                      <button
                        title="حذف المزاد"
                        onClick={() => {/* TODO: handle delete logic */}}
                        className="bg-white/80 hover:bg-red-100 text-red-600 p-2 rounded-full shadow"
                      >
                        <i className="fa fa-trash" />
                      </button>
                    </>
                  )}
                </div>
                <img
                  src={(auction.images && auction.images[currentImageIndex]) || auction.imageUrl || "https://via.placeholder.com/400x300?text=No+Image"}
                  alt={auction.title}
                  className="w-full h-[400px] object-cover transition-all duration-500"
                />
                
                {/* Navigation arrows - only show on hover or mobile */}
                <button 
                  onClick={handlePrevImage}
                  className={`absolute left-2 top-1/2 transform -translate-y-1/2 bg-white/70 dark:bg-black/70 p-2 rounded-full text-gray-800 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity ${isMobile ? 'opacity-100' : ''}`}
                  aria-label="Previous image"
                >
                  <ArrowRight className="h-5 w-5" />
                </button>
                
                <button 
                  onClick={handleNextImage}
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 bg-white/70 dark:bg-black/70 p-2 rounded-full text-gray-800 dark:text-gray-200 opacity-0 group-hover:opacity-100 transition-opacity ${isMobile ? 'opacity-100' : ''}`}
                  aria-label="Next image"
                >
                  <ArrowRight className="h-5 w-5 transform rotate-180" />
                </button>
              </div>
              
              {/* Thumbnail gallery */}
              <div className="grid grid-cols-4 gap-4 mb-8">
                {(auction.images ?? []).map((img: string, idx: number) => (
                  <div 
                    key={idx} 
                    className={`rounded-lg overflow-hidden cursor-pointer transition-all duration-300 ${currentImageIndex === idx ? 'ring-2 ring-blue dark:ring-blue-light' : 'hover:opacity-80'}`}
                    onClick={() => handleImageClick(idx)}
                  >
                    <img
                      src={img}
                      alt={`${auction.title} ${idx + 1}`}
                      className="w-full h-24 object-cover"
                    />
                  </div>
                ))}
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
                  <div className="neo-card p-4">
                    <h4 className="font-medium mb-2">الحالة</h4>
                    <p>{auction.condition}</p>
                  </div>
                  <div className="neo-card p-4">
                    <h4 className="font-medium mb-2">الموقع</h4>
                    <p>{auction.location}</p>
                  </div>
                  <div className="neo-card p-4">
                    <h4 className="font-medium mb-2">الفئة</h4>
                    <p>{auction.category} - {auction.subcategory}</p>
                  </div>
                </div>

                {/* التقييمات والمراجعات */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                  <h2 className="text-2xl font-bold mb-6">التقييمات والمراجعات</h2>
                  
                  {user && auction && user.id !== auction.userId && (
                    <div className="mb-8">
                      <ReviewForm 
                        listingId={auction.listingId.toString()} 
                        onReviewSubmitted={() => {
                          // Refresh reviews after submission
                          queryClient.invalidateQueries({
                            queryKey: ['reviews', auction.listingId]
                          });
                        }} 
                      />
                    </div>
                  )}

                  <ListingReviews listingId={auction.listingId.toString()} />
                </div>
              </div>
            </div>
            
            <div className="lg:w-4/12">
              <div className="sticky top-24">
                {/* Dispute button in top left of card */}
                <button
                  onClick={() => {
                    if (!user) {
                      toast({
                        title: "يجب تسجيل الدخول أولاً",
                        description: "قم بتسجيل الدخول لفتح نزاع",
                        variant: "destructive",
                      });
                      return;
                    }
                    setShowDisputeDialog(true);
                  }}
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
                        ₪{(((auction as any).currentBid && (auction as any).currentBid > 0) ? (auction as any).currentBid : (originalStartPrice ?? 0)).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">بدأ من</p>
                      <p className="text-lg font-medium">
                        ₪{(originalStartPrice || 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ينتهي بعد</p>
                        <CountdownTimer endTime={new Date(auction.endTime)} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">عدد المزايدات</p>
                        <p className="font-medium">{(auction as any).Bids?.length || auction.bids?.length || 0}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        الحد الأدنى للمزايدة: ₪{(((auction as any).currentBid ?? originalStartPrice ?? 0) + (auction.bidIncrement ?? 0)).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {auction.views} مشاهدة
                      </span>
                    </div>
                    
                    <BidForm
                      auctionId={Number(id)}
                      currentPrice={auction.reservePrice}
                      bidIncrement={auction.bidIncrement}
                      isAuctionActive={new Date(auction.endTime) > new Date()}
                      onBidSuccess={handleBidSuccess}
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
                        onClick={handleShareClick}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <Share2 className="h-5 w-5" />
                        <span>مشاركة</span>
                      </button>
                      {auction && (
                        <ReportDialog 
                          listingId={auction.listingId} 
                          onReportSubmitted={() => {
                            toast({
                              title: "تم الإبلاغ بنجاح",
                              description: "سيتم مراجعة البلاغ من قبل فريق العمل",
                            });
                          }}
                        />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="neo-card p-6">
                  <BidHistory 
                    auctionId={Number(id)}
                    currentUserId={user?.id}
                  />
                </div>
                
                <div className="neo-card p-6 mb-6">
                  <h3 className="heading-sm mb-4">معلومات البائع</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold cursor-pointer overflow-hidden"
                      onClick={navigateToSellerProfile}
                    >
                      {seller?.profilePicture ? (
                        <img 
                          src={
                            seller.profilePicture.startsWith('http')
                              ? seller.profilePicture
                              : `http://mazadpalestine.runasp.net${seller.profilePicture}`
                          } 
                          alt={`${seller.firstName} ${seller.lastName}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{seller?.firstName?.charAt(0) ?? "؟"}</span>
                      )}
                    </div>
                    <div>
                      <h4 
                        className="text-lg font-medium hover:text-blue transition-colors cursor-pointer"
                        onClick={navigateToSellerProfile}
                      >
                        {seller ? (
                          `${seller.firstName || ''} ${seller.lastName || ''}`.trim() || seller.username || 'مستخدم'
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-t-transparent border-blue rounded-full animate-spin"></div>
                            <span>جاري تحميل معلومات البائع...</span>
                          </div>
                        )}
                      </h4>
                      {seller && (
                        <div className="flex items-center gap-1 text-yellow-500">
                          {'★'.repeat(Math.floor(seller?.rating ?? 0))}
                          <span className="text-gray-600 dark:text-gray-300 text-sm mr-1">
                            ({seller?.rating ?? 0}/5) · {seller?.totalSales ?? 0} عملية بيع
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <button 
                    className="w-full btn-secondary"
                    onClick={navigateToChat}
                    disabled={!seller}
                  >
                    {seller ? "الاتصال بالبائع" : "جاري التحميل..."}
                  </button>
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
      
      <Footer />
    </div>
  );
};

export default AuctionDetails;
