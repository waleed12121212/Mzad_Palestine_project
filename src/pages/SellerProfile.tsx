import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Calendar, MessageCircle, Package, Clock, ChevronRight, ArrowRight } from "lucide-react";
import AuctionCard from "@/components/ui/AuctionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";
import { userService } from "@/services/userService";
import { auctionService } from "@/services/auctionService";
import { toast } from "sonner";
import ContactSellerDialog from '@/components/ContactSellerDialog';

interface Auction {
  id: string;
  title: string;
  description: string;
  currentPrice: number;
  minBidIncrement: number;
  imageUrl: string;
  endTime: string;
  bidders: number;
  currentBid?: number;
  reservePrice?: number;
  name?: string;
  bidIncrement?: number;
}

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<any>(null);
  const [sellerAuctions, setSellerAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'auctions' | 'completed'>('auctions');
  const [showContactDialog, setShowContactDialog] = useState(false);

  useEffect(() => {
    const fetchSellerData = async () => {
      try {
        if (!id) return;
        
        // Fetch seller profile
        const sellerResponse = await userService.getUserProfileByUserId(parseInt(id));
        // @ts-ignore
        setSeller(sellerResponse.data);

        // Fetch seller auctions
        const auctionsResponse = await auctionService.getUserAuctions(parseInt(id));
        console.log('استجابة المزادات:', auctionsResponse);
        const auctions = Array.isArray(auctionsResponse)
          ? auctionsResponse
          : (auctionsResponse as any).data || [];
        const normalizedAuctions = auctions.map(auction => ({
          id: String(auction.id ?? auction.auctionId ?? auction.AuctionId ?? ''),
          listingId: Number(auction.listingId ?? auction.ListingId ?? 0),
          categoryId: Number(auction.categoryId ?? auction.CategoryId ?? 0),
          title: auction.title ?? auction.name ?? auction.Name ?? '',
          description: auction.description ?? '',
          currentPrice: auction.currentBid ?? auction.currentPrice ?? auction.reservePrice ?? auction.ReservePrice ?? 0,
          minBidIncrement: auction.minBidIncrement ?? auction.bidIncrement ?? auction.BidIncrement ?? 0,
          imageUrl: auction.imageUrl ?? auction.ImageUrl ?? '',
          endTime: auction.endTime ?? auction.EndTime ?? '',
          bidders: auction.bidders ?? auction.bidsCount ?? auction.BidsCount ?? 0,
          userId: auction.userId ?? auction.UserId ?? 0,
          currency: '₪',
        }));
        setSellerAuctions(normalizedAuctions);
      } catch (error: any) {
        console.error('Error fetching seller data:', error);
        toast.error(error.message || 'حدث خطأ أثناء تحميل بيانات البائع');
      } finally {
        setLoading(false);
      }
    };

    fetchSellerData();
  }, [id]);

  // فلترة المزادات حسب الحالة
  const now = new Date();
  const activeAuctions = sellerAuctions.filter(a => new Date(a.endTime) > now);
  const completedAuctions = sellerAuctions.filter(a => new Date(a.endTime) <= now);

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <div className="w-16 h-16 border-4 border-blue border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400">جاري تحميل معلومات البائع...</p>
          </div>
        </div>
    );
  }

  if (!seller) {
    return (
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <h2 className="text-2xl font-bold mb-4">لم يتم العثور على البائع</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
              عذراً، لا يمكن العثور على البائع المطلوب
            </p>
            <Link to="/" className="btn-primary flex items-center gap-2">
              <span>العودة للرئيسية</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 rtl">
          {/* معلومات البائع */}
          <div className="lg:w-1/3">
            <div className="neo-card p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">معلومات البائع</h1>
                <button onClick={() => setShowContactDialog(true)} className="text-blue hover:underline text-sm bg-transparent border-0 cursor-pointer">
                  مراسلة
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-24 w-24">
                  {seller.profilePicture ? (
                    <img
                      src={seller.profilePicture.startsWith('http') ? seller.profilePicture : `http://mazadpalestine.runasp.net${seller.profilePicture}`}
                      alt={seller.username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="bg-gray-200 dark:bg-gray-700 h-full w-full flex items-center justify-center text-3xl font-bold">
                      {seller.username.charAt(0)}
                    </div>
                  )}
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold mb-1">{seller.username}</h2>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(seller.rating || 0)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({seller.rating || 0}) · {seller.totalSales || 0} عملية بيع
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span>{seller.location}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <span>عضو منذ {new Date(seller.joinDate).toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-gray-500" />
                  <span>البريد الإلكتروني: {seller.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span>رقم الهاتف: {seller.phoneNumber}</span>
                </div>
              </div>
            </div>

            <div className="neo-card p-6">
              <h3 className="font-semibold mb-4">روابط سريعة</h3>
              <div className="space-y-2">
                <Link
                  to="#"
                  onClick={e => { e.preventDefault(); setShowContactDialog(true); }}
                  className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle className="h-5 w-5 text-blue" />
                    <span>مراسلة البائع</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
                <Link
                  to="#reviews"
                  className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <span>التقييمات</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
                <Link
                  to="#auctions"
                  className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Package className="h-5 w-5 text-green" />
                    <span>المزادات النشطة</span>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>

          {/* محتوى المزادات والتقييمات */}
          <div className="lg:w-2/3">
            <Tabs defaultValue="auctions" className="w-full" onValueChange={tab => setActiveTab(tab as 'auctions' | 'completed')}>
              <TabsList className="mb-6 w-full justify-start">
                <TabsTrigger value="auctions" className="text-base">
                  المزادات النشطة
                </TabsTrigger>
                <TabsTrigger value="completed" className="text-base">
                  المزادات المكتملة
                </TabsTrigger>
                <TabsTrigger value="reviews" className="text-base">
                  التقييمات
                </TabsTrigger>
              </TabsList>

              <TabsContent value="auctions" className="space-y-6">
                {activeAuctions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">لا توجد مزادات نشطة حالياً</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {activeAuctions.map((auction) => (
                      <AuctionCard
                        key={auction.id}
                        {...auction}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed">
                {completedAuctions.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">لا توجد مزادات مكتملة حالياً</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {completedAuctions.map((auction) => (
                      <AuctionCard
                        key={auction.id}
                        {...auction}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="reviews">
                <div className="text-center py-8">
                  <p className="text-gray-500">لا توجد تقييمات حالياً</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
      {seller && (
        <ContactSellerDialog
          isOpen={showContactDialog}
          onClose={() => setShowContactDialog(false)}
          sellerId={seller.id}
          sellerName={seller.username}
          showAuctionInfo={false}
        />
      )}
    </>
  );
};

export default SellerProfile;
