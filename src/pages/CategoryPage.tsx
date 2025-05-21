import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Card, 
  CardContent 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Search, 
  Filter, 
  FilterX, 
  Loader2,
  Gavel,
  Tag
} from 'lucide-react';

import PageWrapper from '@/components/layout/PageWrapper';
import AuctionCard from '@/components/ui/AuctionCard';
import ProductCard from '@/components/ui/ProductCard';
import { categoryService } from '@/services/categoryService';
import { auctionService } from '@/services/auctionService';
import { listingService, Listing } from '@/services/listingService';
import type { Category as ServiceCategory } from '@/services/categoryService';
import type { Category } from '@/types';

const CategoryPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  
  // State for category data
  const [category, setCategory] = useState<Category | null>(null);
  
  // State for auctions and listings
  const [auctions, setAuctions] = useState<any[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // UI state
  const [activeTab, setActiveTab] = useState<"all" | "auctions" | "listings">("all");
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);
  const [sortBy, setSortBy] = useState("newest");
  const [timeFilter, setTimeFilter] = useState<"all" | "ending-soon" | "new">("all");
  
  const priceOptions = [
    { label: "كل الأسعار", value: [0, 1000000] },
    { label: "0 - 1,000 ₪", value: [0, 1000] },
    { label: "1,000 - 5,000 ₪", value: [1000, 5000] },
    { label: "5,000 - 20,000 ₪", value: [5000, 20000] },
    { label: "20,000 - 100,000 ₪", value: [20000, 100000] },
    { label: "100,000+ ₪", value: [100000, 1000000] },
  ];

  // Fetch all data
  useEffect(() => {
    const fetchCategoryData = async () => {
      if (!categoryId) return;
      
      setIsLoading(true);
      setError(null);

      try {
        console.log(`Fetching data for category ID: ${categoryId}`);
        
        // 1. Fetch category details
        const categoryIdNum = parseInt(categoryId, 10);
        const categoryData = await categoryService.getCategoryById(categoryIdNum);
        
        if (!categoryData) {
          throw new Error(`Category with ID ${categoryId} not found`);
        }
        
        console.log('Category data:', categoryData);
        
        // Convert from service category to UI category
        const uiCategory: Category = {
          id: categoryData.id.toString(),
          name: categoryData.name,
          description: categoryData.description,
          imageUrl: categoryData.imageUrl,
          listingsCount: categoryData.listingCount,
          auctionCount: categoryData.auctionCount
        };
        
        setCategory(uiCategory);
        document.title = `${categoryData.name} - مزاد فلسطين`;

        // 2. Fetch auctions
        const allAuctionsResponse = await auctionService.getActiveAuctions();
        console.log('All auctions response:', allAuctionsResponse);
        
        const allAuctions = allAuctionsResponse?.data || [];
        
        // Use category.auctionIds to filter auctions if available
        const categoryAuctionIds = categoryData.auctionIds || [];
        console.log('Category auction IDs:', categoryAuctionIds);
        
        // Normalize auction data
        const normalizedAuctions = Array.isArray(allAuctions)
          ? allAuctions
              .map(auction => {
                const auctionId = Number(auction.id ?? auction['auctionId'] ?? auction['AuctionId']);
                return {
                  ...auction,
                  id: auctionId,
                  listingId: Number(auction.listingId ?? auction['ListingId']),
                  title: auction.title ?? auction['Title'] ?? "",
                  description: auction.description ?? auction['Description'] ?? "",
                  reservePrice: auction.reservePrice ?? auction['ReservePrice'] ?? 0,
                  currentBid: auction.currentBid ?? auction['CurrentBid'] ?? 0,
                  bidIncrement: auction.bidIncrement ?? auction['BidIncrement'] ?? 0,
                  bids: auction.bids ?? [],
                  bidsCount: auction.bidsCount ?? auction['BidsCount'] ?? 0,
                  userId: auction.userId ?? auction['UserId'],
                  images: Array.isArray(auction.images) 
                    ? auction.images 
                    : (auction['ImageUrl'] ? [auction['ImageUrl']] : []),
                  endDate: auction.endDate ?? auction['EndDate'] ?? auction['EndTime'],
                  categoryId: String(auction.categoryId ?? auction['CategoryId']),
                  status: auction.status ?? auction['Status'] ?? 'active',
                  startDate: auction.startDate ?? auction['StartDate'] ?? new Date().toISOString(),
                  createdAt: auction.createdAt ?? auction['CreatedAt'] ?? new Date().toISOString(),
                  updatedAt: auction.updatedAt ?? auction['UpdatedAt'] ?? new Date().toISOString(),
                  winnerId: auction.winnerId ?? auction['WinnerId'] ?? null
                };
              })
              .filter(auction => {
                // Primary filter: auction is in category.auctionIds if available
                if (categoryAuctionIds.length > 0) {
                  return categoryAuctionIds.includes(auction.id);
                }
                
                // Fallback: check categoryId
                return String(auction.categoryId) === String(categoryId);
              })
          : [];
          
        console.log('Normalized auctions for this category:', normalizedAuctions);
        setAuctions(normalizedAuctions);

        // 3. Fetch listings
        try {
          const categoryListings = await listingService.getListingsByCategory(categoryIdNum);
          console.log('Category listings:', categoryListings);
          setListings(categoryListings);
        } catch (listingError) {
          console.error('Error fetching listings:', listingError);
          // Fallback: try to use the categoryData.listingIds if available
          if (categoryData.listingIds && categoryData.listingIds.length > 0) {
            try {
              const allListings = await listingService.getActiveListings();
              const filteredListings = allListings.filter(listing => 
                categoryData.listingIds.includes(listing.listingId)
              );
              setListings(filteredListings);
            } catch (fallbackError) {
              console.error('Error fetching listings fallback:', fallbackError);
              setListings([]);
            }
          } else {
            setListings([]);
          }
        }
      } catch (err) {
        console.error('Error fetching category data:', err);
        setError('حدث خطأ أثناء تحميل البيانات');
      } finally {
        setIsLoading(false);
      }
    };

      fetchCategoryData();
  }, [categoryId]);

  // Filter functions
  const filterItems = (items: any[], isAuction: boolean) => {
    return items.filter(item => {
      // Price filter
      const price = isAuction 
        ? (item.currentBid > 0 ? item.currentBid : item.reservePrice) 
        : item.price;
      const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
      
      // Search query filter
      const matchesQuery = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Time filter
      let matchesTime = true;
      if (timeFilter === "ending-soon") {
        const endTime = new Date(item.endDate);
        const now = new Date();
        const diffHours = (endTime.getTime() - now.getTime()) / (1000 * 60 * 60);
        matchesTime = diffHours <= 24;
      } else if (timeFilter === "new") {
        const createdTime = new Date(item.createdAt);
        const now = new Date();
        const diffHours = (now.getTime() - createdTime.getTime()) / (1000 * 60 * 60);
        matchesTime = diffHours <= 72;
      }
      
      return matchesPrice && matchesQuery && matchesTime;
    });
  };
  
  // Sort functions
  const sortItems = (items: any[], isAuction: boolean) => {
    return [...items].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "priceHigh":
          if (isAuction) {
            const priceA = a.currentBid > 0 ? a.currentBid : a.reservePrice;
            const priceB = b.currentBid > 0 ? b.currentBid : b.reservePrice;
            return priceB - priceA;
          } else {
            return b.price - a.price;
          }
        case "priceLow":
          if (isAuction) {
            const priceA = a.currentBid > 0 ? a.currentBid : a.reservePrice;
            const priceB = b.currentBid > 0 ? b.currentBid : b.reservePrice;
            return priceA - priceB;
          } else {
            return a.price - b.price;
          }
        case "endingSoon":
          const dateA = new Date(a.endDate);
          const dateB = new Date(b.endDate);
          return dateA.getTime() - dateB.getTime();
        default:
          return 0;
      }
    });
  };
  
  // Get filtered and sorted items
  const filteredAuctions = filterItems(auctions, true);
  const filteredListings = filterItems(listings, false);
  
  const sortedAuctions = sortItems(filteredAuctions, true);
  const sortedListings = sortItems(filteredListings, false);
  
  // Reset filters
  const handleResetFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 1000000]);
    setTimeFilter("all");
    setSortBy("newest");
  };
  
  // Check if any filters are active
  const hasActiveFilters = () => {
    return searchQuery !== "" || 
           priceRange[0] !== 0 || 
           priceRange[1] !== 1000000 || 
           timeFilter !== "all" ||
           sortBy !== "newest";
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 text-blue animate-spin" />
            <span className="mr-2">جاري تحميل البيانات...</span>
          </div>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">{error}</h2>
            <Button 
              onClick={() => navigate('/')} 
              className="btn-primary"
            >
              العودة للصفحة الرئيسية
            </Button>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        {/* Category Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">{category?.name}</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            {category?.description}
          </p>
          <div className="flex justify-center gap-4">
            <Badge variant="outline" className="text-sm px-3 py-1 flex items-center">
              <Gavel className="w-4 h-4 ml-1" />
              {auctions.length} مزاد
            </Badge>
            <Badge variant="outline" className="text-sm px-3 py-1 flex items-center">
              <Tag className="w-4 h-4 ml-1" />
              {listings.length} منتج
            </Badge>
          </div>
        </div>

        {/* Filter and Content Area */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Filters Side Panel */}
          <div className="md:col-span-1 rtl">
            <Card className="sticky top-20">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold">الفلاتر</h3>
                  {hasActiveFilters() && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-blue hover:text-blue-700 p-0 h-auto"
                      onClick={handleResetFilters}
                    >
                      <FilterX className="h-4 w-4 ml-1" />
                      <span>إعادة ضبط</span>
                    </Button>
                  )}
                </div>
                
                <Accordion type="multiple" defaultValue={["price", "time"]}>
                  <AccordionItem value="price">
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">نطاق السعر</AccordionTrigger>
                    <AccordionContent>
                      <div className="px-1">
                        <Select value={JSON.stringify(priceRange)} onValueChange={val => setPriceRange(JSON.parse(val))}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="اختر نطاق السعر" />
                          </SelectTrigger>
                          <SelectContent>
                            {priceOptions.map(opt => (
                              <SelectItem key={opt.label} value={JSON.stringify(opt.value)}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="time">
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">الوقت المتبقي</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1">
                        <Button 
                          variant={timeFilter === "all" ? "default" : "outline"}
                          className="w-full justify-start text-right px-2 py-1.5 h-auto mb-1"
                          onClick={() => setTimeFilter("all")}
                        >
                          جميع العناصر
                        </Button>
                        <Button 
                          variant={timeFilter === "ending-soon" ? "default" : "outline"}
                          className="w-full justify-start text-right px-2 py-1.5 h-auto mb-1"
                          onClick={() => setTimeFilter("ending-soon")}
                        >
                          تنتهي قريبًا (خلال 24 ساعة)
                        </Button>
                        <Button 
                          variant={timeFilter === "new" ? "default" : "outline"}
                          className="w-full justify-start text-right px-2 py-1.5 h-auto"
                          onClick={() => setTimeFilter("new")}
                        >
                          مضافة حديثًا
                        </Button>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-3">
            {/* Search and Sort Controls */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 rtl">
              <div className="relative w-full md:w-auto md:flex-1">
                <Search className="absolute top-1/2 transform -translate-y-1/2 right-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="ابحث عن منتجات ومزادات..."
                  className="pr-10 rtl w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="ترتيب حسب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">الأحدث</SelectItem>
                  <SelectItem value="priceHigh">السعر: من الأعلى للأدنى</SelectItem>
                  <SelectItem value="priceLow">السعر: من الأدنى للأعلى</SelectItem>
                  <SelectItem value="endingSoon">تنتهي قريبًا</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabs for All/Auctions/Listings */}
            <Tabs defaultValue="all" className="w-full mb-6" onValueChange={(value) => setActiveTab(value as any)}>
              <TabsList className="grid grid-cols-3 mb-6 rtl">
                <TabsTrigger value="all">الكل</TabsTrigger>
                <TabsTrigger value="auctions">المزادات</TabsTrigger>
                <TabsTrigger value="listings">المنتجات</TabsTrigger>
              </TabsList>
              
              {/* All Items */}
              <TabsContent value="all">
                {sortedAuctions.length === 0 && sortedListings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <Filter className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">لا توجد عناصر مطابقة</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                      حاول تغيير معايير البحث أو التصفية للعثور على المنتجات والمزادات التي تبحث عنها.
                    </p>
                    <Button onClick={handleResetFilters}>إعادة ضبط الفلاتر</Button>
                  </div>
                ) : (
                  <>
                    {/* Auctions Section */}
                    {sortedAuctions.length > 0 && (
                      <>
                        <h2 className="text-xl font-bold mb-4 rtl">المزادات ({sortedAuctions.length})</h2>
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
                        >
                          {sortedAuctions.map((auction) => (
                            <motion.div key={auction.id} variants={itemVariants}>
                              <AuctionCard
                                key={auction.id}
                                id={auction.id}
                                listingId={auction.listingId}
                                title={auction.title}
                                description={auction.description || ""}
                                currentPrice={auction.currentBid > 0 ? auction.currentBid : auction.reservePrice}
                                minBidIncrement={auction.bidIncrement}
                                imageUrl={Array.isArray(auction.images) && auction.images.length > 0 ? auction.images[0] : ''}
                                endTime={auction.endDate}
                                bidders={auction.bidsCount || auction.bids?.length || 0}
                                userId={auction.userId}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      </>
                    )}
                    
                    {/* Listings Section */}
                    {sortedListings.length > 0 && (
                      <>
                        <h2 className="text-xl font-bold mb-4 rtl">المنتجات ({sortedListings.length})</h2>
                        <motion.div
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                          {sortedListings.map((listing) => (
                            <motion.div key={listing.listingId} variants={itemVariants}>
                              <ProductCard
                                id={listing.listingId}
                                title={listing.title}
                                description={listing.description}
                                price={listing.price}
                                imageUrl={listing.images?.[0] || ""}
                                isNew={new Date(listing.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
                                sellerId={listing.userId}
                              />
                            </motion.div>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </>
                )}
              </TabsContent>
              
              {/* Auctions Tab */}
              <TabsContent value="auctions">
                {sortedAuctions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <Gavel className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">لا توجد مزادات مطابقة</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                      حاول تغيير معايير البحث أو التصفية للعثور على المزادات التي تبحث عنها.
                    </p>
                    <Button onClick={handleResetFilters}>إعادة ضبط الفلاتر</Button>
                  </div>
                ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
                    {sortedAuctions.map((auction) => (
              <motion.div key={auction.id} variants={itemVariants}>
                <AuctionCard
                  key={auction.id}
                  id={auction.id}
                  listingId={auction.listingId}
                  title={auction.title}
                  description={auction.description || ""}
                  currentPrice={auction.currentBid > 0 ? auction.currentBid : auction.reservePrice}
                  minBidIncrement={auction.bidIncrement}
                  imageUrl={Array.isArray(auction.images) && auction.images.length > 0 ? auction.images[0] : ''}
                  endTime={auction.endDate}
                  bidders={auction.bidsCount || auction.bids?.length || 0}
                  userId={auction.userId}
                />
              </motion.div>
            ))}
          </motion.div>
                )}
              </TabsContent>
              
              {/* Listings Tab */}
              <TabsContent value="listings">
                {sortedListings.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <Tag className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
                    <h2 className="text-xl font-semibold mb-2">لا توجد منتجات مطابقة</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                      حاول تغيير معايير البحث أو التصفية للعثور على المنتجات التي تبحث عنها.
                    </p>
                    <Button onClick={handleResetFilters}>إعادة ضبط الفلاتر</Button>
                  </div>
                ) : (
                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  >
                    {sortedListings.map((listing) => (
                      <motion.div key={listing.listingId} variants={itemVariants}>
                        <ProductCard
                          id={listing.listingId}
                          title={listing.title}
                          description={listing.description}
                          price={listing.price}
                          imageUrl={listing.images?.[0] || ""}
                          isNew={new Date(listing.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
                          sellerId={listing.userId}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default CategoryPage; 