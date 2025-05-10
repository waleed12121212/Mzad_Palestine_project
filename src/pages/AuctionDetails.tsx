import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowRight, Clock, Users, BadgeDollarSign, Share2, Heart, Banknote, ShieldCheck, Info } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import CountdownTimer from "@/components/ui/CountdownTimer";
import { toast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { auctionService } from "@/services/auctionService";
import { listingService } from "@/services/listingService";

const AuctionDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [liked, setLiked] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isMobile = useIsMobile();

  useEffect(() => {
    const fetchAuction = async () => {
      setLoading(true);
      try {
        // جلب بيانات المزاد
        const auctionResponse = await auctionService.getAuctionById(Number(id));
        const auctionData = auctionResponse.data;
        console.log('auctionData', auctionData);
        if (!auctionData.listingId) {
          throw new Error("المزاد لا يحتوي على منتج مرتبط (listingId غير موجود)");
        }
        // جلب بيانات المنتج المرتبط بالمزاد
        let listingData;
        try {
          listingData = await listingService.getListingById(auctionData.listingId);
          console.log('listingData', listingData);
        } catch (listingError) {
          throw new Error("المنتج المرتبط بهذا المزاد غير موجود أو تم حذفه.");
        }
        setAuction({
          ...listingData,
          ...auctionData,
        });
        setBidAmount(auctionData.reservePrice + auctionData.bidIncrement);
      } catch (error) {
        setAuction(null);
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

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (bidAmount < (auction?.reservePrice + auction?.bidIncrement)) {
      toast({
        title: "خطأ في المزايدة",
        description: `يجب أن تكون المزايدة أكبر من ${auction?.reservePrice + auction?.bidIncrement} $`,
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "تم تقديم المزايدة بنجاح",
      description: `قدمت مزايدة بقيمة ${bidAmount} $`,
    });
    
    console.log("Bid submitted:", bidAmount);
    
    setAuction({
      ...auction,
      reservePrice: bidAmount,
      bidders: auction.bidders + 1,
      bids: [
        { user: "أنت", amount: bidAmount, time: "الآن" },
        ...auction.bids
      ]
    });
    
    setBidAmount(bidAmount + auction.bidIncrement);
  };

  const toggleLike = () => {
    setLiked(!liked);
    toast({
      title: liked ? "تمت إزالة المزاد من المفضلة" : "تمت إضافة المزاد للمفضلة",
      description: liked ? "يمكنك إضافته مرة أخرى في أي وقت" : "يمكنك الوصول للمفضلة من حسابك الشخصي",
    });
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
    if (auction?.seller?.id) {
      navigate(`/chat/${auction.seller.id}`);
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
                <Link to="/categories" className="hover:text-blue dark:hover:text-blue-light">{auction.category}</Link>
                <span className="mx-2">›</span>
                <Link to={`/categories/${auction.subcategory}`} className="hover:text-blue dark:hover:text-blue-light">{auction.subcategory}</Link>
                <span className="mx-2">›</span>
                <span className="text-gray-900 dark:text-gray-100">{auction.title}</span>
              </div>
              
              {/* Main image display with navigation arrows */}
              <div className="mb-4 rounded-xl overflow-hidden relative group">
                <img
                  src={auction.images[currentImageIndex]}
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
              </div>
              
              <div>
                <h2 className="heading-md mb-6">سجل المزايدات</h2>
                <div className="neo-card overflow-hidden">
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex justify-between">
                    <span className="font-medium">المزايد</span>
                    <span className="font-medium">المبلغ</span>
                    <span className="font-medium">التوقيت</span>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {(auction.bids ?? []).map((bid: any, idx: number) => (
                      <div key={idx} className="p-4 flex justify-between items-center">
                        <span>{bid.user}</span>
                        <span className="font-medium text-blue dark:text-blue-light">${bid.amount.toLocaleString()}</span>
                        <span className="text-gray-500">{bid.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="lg:w-4/12">
              <div className="sticky top-24">
                <div className="neo-card p-6 mb-6">
                  <h1 className="heading-md mb-4">{auction.title}</h1>
                  
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">السعر الحالي</p>
                      <p className="text-3xl font-bold text-blue dark:text-blue-light">
                        ${(auction.reservePrice ?? 0).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">بدأ من</p>
                      <p className="text-lg font-medium">
                        ${(auction.startPrice ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6 mb-6">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">ينتهي بعد</p>
                        <CountdownTimer endTime={auction.endTime} />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">عدد المزايدين</p>
                        <p className="font-medium">{auction.bidders}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        الحد الأدنى للمزايدة: ${(auction.bidIncrement ?? 0).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {auction.views} مشاهدة
                      </span>
                    </div>
                    
                    <form onSubmit={handleBidSubmit}>
                      <div className="flex gap-4 mb-4">
                        <div className="relative flex-grow">
                          <input
                            type="number"
                            value={bidAmount}
                            onChange={(e) => setBidAmount(Number(e.target.value))}
                            className="w-full py-3 px-5 pr-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
                          />
                          <BadgeDollarSign className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
                        </div>
                        <button type="submit" className="btn-primary rounded-xl py-3 px-6">
                          قدم عرض
                        </button>
                      </div>
                    </form>
                    
                    <div className="flex justify-between gap-4">
                      <button 
                        onClick={toggleLike}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border ${liked ? 'bg-red-50 text-red-500 border-red-200 dark:bg-red-900/20 dark:border-red-700' : 'border-gray-200 dark:border-gray-700'}`}
                      >
                        <Heart className={`h-5 w-5 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
                        <span>المفضلة</span>
                      </button>
                      <button 
                        onClick={handleShareClick}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                      >
                        <Share2 className="h-5 w-5" />
                        <span>مشاركة</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="neo-card p-6 mb-6">
                  <h3 className="heading-sm mb-4">معلومات البائع</h3>
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xl font-bold cursor-pointer"
                      onClick={navigateToSellerProfile}
                    >
                      {auction.seller?.name?.charAt(0) ?? "-"}
                    </div>
                    <div>
                      <h4 
                        className="text-lg font-medium hover:text-blue transition-colors cursor-pointer"
                        onClick={navigateToSellerProfile}
                      >
                        {auction.seller?.name ?? "غير معروف"}
                      </h4>
                      <div className="flex items-center gap-1 text-yellow-500">
                        {'★'.repeat(Math.floor(auction.seller?.rating ?? 0))}
                        <span className="text-gray-600 dark:text-gray-300 text-sm mr-1">
                          ({auction.seller?.rating ?? 0}/5) · {auction.seller?.totalSales ?? 0} عملية بيع
                        </span>
                      </div>
                    </div>
                  </div>
                  <button 
                    className="w-full btn-secondary"
                    onClick={navigateToChat}
                  >
                    الاتصال بالبائع
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
