
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Star, MapPin, Calendar, MessageCircle, Package, Clock, ChevronRight, ArrowRight } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import AuctionCard from "@/components/ui/AuctionCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar } from "@/components/ui/avatar";

interface Auction {
  id: number | string;
  title: string;
  description: string;
  currentPrice: number;
  minBidIncrement: number;
  imageUrl: string;
  endTime: string;
  bidders: number;
}

const SellerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [seller, setSeller] = useState<any>(null);
  const [sellerAuctions, setSellerAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSellerData = async () => {
      // في الواقع، هنا ستقوم بجلب البيانات من API
      setTimeout(() => {
        const sellerData = {
          id: id || "seller123",
          name: "أحمد محمود",
          rating: 4.8,
          totalSales: 24,
          location: "رام الله، فلسطين",
          memberSince: "منذ 2 سنوات",
          responseRate: "95%",
          responseTime: "خلال ساعة",
          description: "مرحباً بكم في صفحتي! أنا متخصص في بيع المنتجات الإلكترونية والمقتنيات النادرة. أسعى دائماً لتقديم منتجات عالية الجودة وخدمة عملاء متميزة.",
          badges: ["بائع موثوق", "خدمة سريعة", "شحن سريع"]
        };

        const auctionsData = [
          {
            id: "301",
            title: "هاتف آيفون 14 برو ماكس",
            description: "هاتف آيفون 14 برو ماكس بسعة 256 جيجابايت، لون أزرق، حالة ممتازة",
            currentPrice: 3200,
            minBidIncrement: 100,
            imageUrl: "https://images.unsplash.com/photo-1621330396173-e41b1cafd17f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
            bidders: 7
          },
          {
            id: "302",
            title: "لابتوب ماك بوك برو",
            description: "لابتوب ماك بوك برو 16 بوصة، معالج M1 برو، ذاكرة 16 جيجابايت",
            currentPrice: 5500,
            minBidIncrement: 200,
            imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
            bidders: 12
          },
          {
            id: "303",
            title: "ساعة أبل الجيل السابع",
            description: "ساعة أبل الجيل السابع، مقاس 45 ملم، اتصال خلوي، لون أسود",
            currentPrice: 1200,
            minBidIncrement: 50,
            imageUrl: "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80",
            endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(),
            bidders: 5
          }
        ];

        setSeller(sellerData);
        setSellerAuctions(auctionsData);
        setLoading(false);
      }, 1000);
    };

    fetchSellerData();
  }, [id]);

  if (loading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center h-[50vh]">
            <div className="w-16 h-16 border-4 border-blue border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400">جاري تحميل معلومات البائع...</p>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (!seller) {
    return (
      <PageWrapper>
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
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 rtl">
          {/* معلومات البائع */}
          <div className="lg:w-1/3">
            <div className="neo-card p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold">معلومات البائع</h1>
                <Link to={`/chat/${seller.id}`} className="text-blue hover:underline text-sm">
                  مراسلة
                </Link>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <Avatar className="h-24 w-24">
                  <div className="bg-gray-200 dark:bg-gray-700 h-full w-full flex items-center justify-center text-3xl font-bold">
                    {seller.name.charAt(0)}
                  </div>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold mb-1">{seller.name}</h2>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(seller.rating)
                              ? "text-yellow-400 fill-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({seller.rating}) · {seller.totalSales} عملية بيع
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
                  <span>عضو {seller.memberSince}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MessageCircle className="h-5 w-5 text-gray-500" />
                  <span>معدل الرد: {seller.responseRate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <span>وقت الرد: {seller.responseTime}</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="font-semibold mb-2">نبذة</h3>
                <p className="text-gray-700 dark:text-gray-300">{seller.description}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">الشارات</h3>
                <div className="flex flex-wrap gap-2">
                  {seller.badges.map((badge: string, index: number) => (
                    <span
                      key={index}
                      className="bg-blue-50 text-blue text-xs px-3 py-1 rounded-full dark:bg-blue-900/20 dark:text-blue-light"
                    >
                      {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="neo-card p-6">
              <h3 className="font-semibold mb-4">روابط سريعة</h3>
              <div className="space-y-2">
                <Link
                  to={`/chat/${seller.id}`}
                  className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
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
            <Tabs defaultValue="auctions" className="w-full">
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

              <TabsContent value="auctions" id="auctions">
                <h2 className="text-xl font-bold mb-6">المزادات النشطة</h2>
                {sellerAuctions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sellerAuctions.map((auction) => (
                      <AuctionCard
                        key={auction.id}
                        id={auction.id}
                        title={auction.title}
                        description={auction.description}
                        currentPrice={auction.currentPrice}
                        minBidIncrement={auction.minBidIncrement}
                        imageUrl={auction.imageUrl}
                        endTime={auction.endTime}
                        bidders={auction.bidders}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">لا توجد مزادات نشطة حالياً</h3>
                    <p className="text-gray-500 dark:text-gray-400">سيظهر هنا أي مزادات نشطة للبائع</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="completed">
                <h2 className="text-xl font-bold mb-6">المزادات المكتملة</h2>
                <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Package className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">لا توجد مزادات مكتملة</h3>
                  <p className="text-gray-500 dark:text-gray-400">ستظهر هنا المزادات المكتملة للبائع</p>
                </div>
              </TabsContent>

              <TabsContent value="reviews" id="reviews">
                <h2 className="text-xl font-bold mb-6">تقييمات البائع</h2>
                <div className="space-y-6">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="neo-card p-6">
                      <div className="flex justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <div className="bg-gray-200 dark:bg-gray-700 h-full w-full flex items-center justify-center text-sm font-bold">
                              م{i}
                            </div>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">مشتري{i}</h4>
                            <p className="text-xs text-gray-500">منذ {i} أشهر</p>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, j) => (
                            <Star
                              key={j}
                              className={`h-4 w-4 ${
                                j < 5 - i % 2
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300">
                        تجربة ممتازة مع البائع. المنتج وصل بالحالة الموصوفة بالضبط والشحن كان سريعاً. أنصح بالتعامل معه!
                      </p>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default SellerProfile;
