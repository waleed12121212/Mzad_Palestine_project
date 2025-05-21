import React from "react";
import { useQueryClient } from "@tanstack/react-query";
import AuctionCard from "@/components/ui/AuctionCard";
import ProductCard from "@/components/ui/ProductCard";
import { Heart, Loader2, AlertTriangle } from "lucide-react";
import { useWishlist } from "@/contexts/WishlistContext";
import { toast } from "@/hooks/use-toast";

const Favorites = () => {
  const queryClient = useQueryClient();
  const { wishlistItems, isLoading, error, removeFromWishlist, removeListingFromWishlist } = useWishlist();

  const handleRemoveFavorite = async (id: number, type: 'auction' | 'listing') => {
    try {
      if (type === 'auction') {
        await removeFromWishlist(id);
      } else {
        await removeListingFromWishlist(id);
      }
      
      // Force a refresh of the wishlist data
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      
      toast({
        title: "تمت إزالة العنصر من المفضلة",
        description: "يمكنك إضافته مرة أخرى في أي وقت",
      });
    } catch (error) {
      toast({
        title: "فشل في إزالة العنصر من المفضلة",
        variant: "destructive",
      });
    }
  };

  // Process wishlist items with key for forcing re-render
  const processedItems = React.useMemo(() => {
    console.log('Processing wishlist items', wishlistItems?.length);
    
    // Start with the valid items from the API
    const validApiItems = Array.isArray(wishlistItems) 
      ? wishlistItems.filter(item => item && item.listingId && item.listing)
      : [];
    
    console.log('Valid API items:', validApiItems.length);
    
    return validApiItems;
  }, [wishlistItems]);

  // Separate into auctions and listings
  const auctions = processedItems.filter(item => item.type === 'auction');
  const listings = processedItems.filter(item => item.type === 'listing');

  console.log('Favorites component data:', {
    wishlistItemsCount: wishlistItems?.length || 0,
    processedItemsCount: processedItems.length,
    auctionCount: auctions.length, 
    listingCount: listings.length,
    auctionIds: auctions.map(a => a.listingId),
    listingIds: listings.map(l => l.listingId)
  });

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        <div className="flex items-center mb-8 rtl">
          <Heart className="text-primary h-7 w-7 ml-2" />
          <h1 className="heading-lg">المفضلة</h1>
          {processedItems.length > 0 && (
            <span className="text-sm text-gray-500 mr-2">{processedItems.length} عنصر</span>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="py-12 text-center">
            <p className="text-red-500">حدث خطأ في تحميل المفضلة</p>
            <p className="text-sm mt-2 text-gray-500">{error.toString()}</p>
          </div>
        ) : processedItems.length === 0 ? (
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
          <>
            {/* Auctions Section */}
            {auctions.length > 0 && (
              <>
                {listings.length > 0 && (
                  <div className="mb-6 flex justify-between items-center border-b pb-2">
                    <div className="text-lg font-semibold">المزادات ({auctions.length})</div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
                  {auctions.map((item) => (
                    <AuctionCard
                      key={`${item.type}-${item.listingId}`}
                      id={item.listing.id}
                      listingId={item.listingId}
                      title={item.listing.title}
                      description={item.listing.description || ""}
                      currentPrice={item.listing.currentPrice || 0}
                      minBidIncrement={1000}
                      imageUrl={item.listing.images?.[0] || "/placeholder.svg"}
                      endTime={item.listing.endDate}
                      bidders={0}
                      currency="₪"
                      isPopular={false}
                      isFavorite={true}
                      type={item.type}
                      onFavoriteToggle={() => handleRemoveFavorite(item.listingId, item.type)}
                      errorState={!item.listing.images?.length || item.listing.title.includes('#') || item.listing.title.includes('غير متوفر')}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Listings Section */}
            {listings.length > 0 && (
              <>
                {auctions.length > 0 && (
                  <div className="mb-6 flex justify-between items-center border-b pb-2">
                    <div className="text-lg font-semibold">العناصر ({listings.length})</div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((item) => (
                    <ProductCard
                      key={`${item.type}-${item.listingId}`}
                      id={item.listingId}
                      title={item.listing.title}
                      description={item.listing.description || ""}
                      price={item.listing.currentPrice || 0}
                      imageUrl={item.listing.images?.[0] || "/placeholder.svg"}
                      currency="₪"
                    />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Favorites;
