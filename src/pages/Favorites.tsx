import React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AuctionCard from "@/components/ui/AuctionCard";
import { Heart, Loader2 } from "lucide-react";
import { wishlistService, WishlistItem } from "@/services/wishlistService";
import { toast } from "@/hooks/use-toast";

const Favorites = () => {
  const queryClient = useQueryClient();

  const { data: favorites = [], isLoading, error } = useQuery<WishlistItem[]>({
    queryKey: ["wishlist"],
    queryFn: wishlistService.getWishlist,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const handleRemoveFavorite = async (id: number) => {
    try {
      await wishlistService.removeFromWishlist(id);
      queryClient.setQueryData(["wishlist"], (oldData: WishlistItem[] | undefined) => 
        oldData ? oldData.filter(item => item.listingId !== id) : []
      );
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast({
        title: "تمت إزالة المزاد من المفضلة",
        description: "يمكنك إضافته مرة أخرى في أي وقت",
      });
    } catch (error) {
      toast({
        title: "فشل في إزالة العنصر من المفضلة",
        variant: "destructive",
      });
    }
  };

  // Ensure favorites is always an array and has valid listing data
  const favoriteItems = Array.isArray(favorites) ? favorites.filter(item => item && item.listing) : [];

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
        ) : favoriteItems.length === 0 ? (
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
            {favoriteItems.map((item) => (
              <AuctionCard
                key={item.listingId}
                id={item.listing.id}
                listingId={item.listingId}
                title={item.listing.title}
                description={item.listing.description}
                currentPrice={item.listing.currentPrice}
                minBidIncrement={1000}
                imageUrl={item.listing.images[0] || "/placeholder.svg"}
                endTime={item.listing.endDate}
                bidders={0}
                currency="₪"
                isPopular={false}
                isFavorite={true}
                onFavoriteToggle={() => handleRemoveFavorite(item.listingId)}
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
