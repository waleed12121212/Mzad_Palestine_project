
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuctionCard from "@/components/ui/AuctionCard";
import { Heart, Loader2 } from "lucide-react";

// Define interface for Auction
interface Auction {
  id: number;
  title: string;
  description?: string;
  currentPrice: number;
  imageUrl: string;
  endTime: string;
  bidders: number;
  minBidIncrement: number;
  location?: string;
  isFavorite?: boolean;
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<Auction[]>([]);

  // Mock API call to fetch favorites
  const fetchFavorites = async (): Promise<Auction[]> => {
    // Simulate API call
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            title: "شقة فاخرة في وسط المدينة",
            description: "شقة حديثة بمساحة 150 متر مربع، 3 غرف نوم، إطلالة رائعة",
            currentPrice: 150000,
            minBidIncrement: 5000,
            imageUrl: "/placeholder.svg",
            endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
            bidders: 7,
            location: "رام الله",
            isFavorite: true
          },
          {
            id: 2,
            title: "أرض زراعية مساحة 5 دونم",
            description: "أرض خصبة صالحة للزراعة قريبة من الطريق الرئيسي",
            currentPrice: 120000,
            minBidIncrement: 3000,
            imageUrl: "/placeholder.svg",
            endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1).toISOString(),
            bidders: 5,
            location: "الخليل",
            isFavorite: true
          },
          {
            id: 3,
            title: "سيارة مرسيدس 2020",
            description: "سيارة بحالة ممتازة، ماشية 45,000 كم، صيانة دورية",
            currentPrice: 65000,
            minBidIncrement: 1000,
            imageUrl: "/placeholder.svg",
            endTime: new Date(Date.now() + 1000 * 60 * 60 * 6).toISOString(),
            bidders: 15,
            location: "نابلس",
            isFavorite: true
          }
        ]);
      }, 1000);
    });
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["favorites"],
    queryFn: fetchFavorites
  });

  // Update favorites when data is loaded
  React.useEffect(() => {
    if (data) {
      setFavorites(data);
    }
  }, [data]);

  const handleRemoveFavorite = (id: number) => {
    setFavorites(prevFavorites => prevFavorites.filter(fav => fav.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        <div className="flex items-center mb-8 rtl">
          <Heart className="text-primary h-7 w-7 ml-2" />
          <h1 className="heading-lg">المفضلة</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-500">حدث خطأ في تحميل المفضلة</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Heart className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h2 className="text-xl font-semibold mb-2">لا توجد عناصر في المفضلة</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-6">
              عندما تضيف عناصر إلى المفضلة، ستظهر هنا ليسهل عليك متابعتها والرجوع إليها في أي وقت
            </p>
            <a href="/auctions" className="btn-primary inline-block">
              استعرض المزادات الحالية
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((auction) => (
              <AuctionCard
                key={auction.id}
                id={auction.id}
                title={auction.title}
                description={auction.description || ""}
                currentPrice={auction.currentPrice}
                minBidIncrement={auction.minBidIncrement}
                imageUrl={auction.imageUrl}
                endTime={auction.endTime}
                bidders={auction.bidders}
                isPopular={false}
                isFavorite={true}
                onFavoriteToggle={() => handleRemoveFavorite(auction.id)}
              />
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default Favorites;
