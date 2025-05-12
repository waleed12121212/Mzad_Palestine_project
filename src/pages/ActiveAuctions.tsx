import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Filter, FilterX, SlidersHorizontal, ChevronDown } from "lucide-react";
import AuctionCard from "@/components/ui/AuctionCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import PageWrapper from "@/components/layout/PageWrapper";
import { auctionService } from "@/services/auctionService";

interface Auction {
  id: number;
  title: string;
  description: string;
  currentPrice: number;
  minBidIncrement: number;
  imageUrl: string;
  endTime: string;
  bidders: number;
  category?: string;
  userId: number;
}

const ActiveAuctions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(1000000);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [auctionView, setAuctionView] = useState<"grid" | "list">("grid");
  const [timeFilter, setTimeFilter] = useState<"all" | "ending-soon" | "new">("all");

  const priceOptions = [
    { label: "كل الأسعار", value: [0, 1000000] },
    { label: "0 - 1,000 ₪", value: [0, 1000] },
    { label: "1,000 - 5,000 ₪", value: [1000, 5000] },
    { label: "5,000 - 20,000 ₪", value: [5000, 20000] },
    { label: "20,000 - 100,000 ₪", value: [20000, 100000] },
    { label: "100,000+ ₪", value: [100000, 1000000] },
  ];
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["activeAuctions"],
    queryFn: async () => {
      const response: any = await auctionService.getActiveAuctions();
      if (Array.isArray(response)) return response;
      if (response && typeof response === 'object' && Array.isArray(response.data)) return response.data;
      console.error("Expected array or { data: array } from getActiveAuctions, got:", response);
      return [];
    }
  });

  console.log("Raw auctions data:", data);
  const normalizedData = Array.isArray(data)
    ? data
        .map(auction => ({
          ...auction,
          id: Number(auction.id ?? auction.auctionId ?? auction.listingId),
          title: auction.title ?? auction.name ?? "",
          currentPrice: auction.currentBid ?? auction.currentPrice ?? auction.reservePrice ?? 0,
          reservePrice: auction.reservePrice ?? 0,
          currentBid: auction.currentBid ?? 0,
        }))
        .filter(auction => Number.isFinite(auction.id) && auction.id > 0)
    : [];

  const filteredAuctions = normalizedData.filter((auction) => {
    const matchesQuery = auction.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const price = (auction.reservePrice && auction.reservePrice > 0) ? auction.reservePrice : auction.currentBid;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    let matchesTime = true;
    if (timeFilter === "ending-soon") {
      const endTime = new Date(auction.endTime);
      const now = new Date();
      const diffHours = (endTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      matchesTime = diffHours <= 24;
    } else if (timeFilter === "new") {
      const endTime = new Date(auction.endTime);
      const now = new Date();
      const diffHours = (endTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      matchesTime = diffHours >= 72;
    }
    return matchesQuery && matchesPrice && matchesTime;
  });
  console.log("Filtered auctions:", filteredAuctions);

  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
      case "priceHigh":
        return b.currentPrice - a.currentPrice;
      case "priceLow":
        return a.currentPrice - b.currentPrice;
      // Remove popularity and bidders sort if not available
      case "endingSoon":
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      default:
        return 0;
    }
  });

  const handlePriceChange = (type: 'min' | 'max', value: string) => {
    const num = Number(value);
    if (type === 'min') setMinPrice(num);
    else setMaxPrice(num);
  };

  const validatePrices = () => {
    if (minPrice < 0 || maxPrice < 0) {
      setPriceError('يجب أن تكون القيم أكبر من أو تساوي صفر');
      return false;
    }
    if (minPrice > maxPrice) {
      setPriceError('يجب أن يكون الحد الأدنى أقل من أو يساوي الحد الأقصى');
      return false;
    }
    setPriceError(null);
    return true;
  };

  const handleApplyPrice = () => {
    if (validatePrices()) {
      // Filtering is reactive, so just validate
    }
  };

  const handleResetPrice = () => {
    setMinPrice(0);
    setMaxPrice(1000000);
    setPriceError(null);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setMinPrice(0);
    setMaxPrice(1000000);
    setTimeFilter("all");
  };

  const hasActiveFilters = () => {
    return searchQuery !== "" || 
           minPrice !== 0 || 
           maxPrice !== 1000000 || 
           timeFilter !== "all";
  };

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
          <Loader2 className="h-12 w-12 text-blue animate-spin mb-4" />
          <p className="text-lg text-gray-600 dark:text-gray-400">جاري تحميل المزادات النشطة...</p>
        </div>
      </PageWrapper>
    );
  }

  if (error) {
    return (
      <PageWrapper>
        <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="text-red-500 text-xl mb-4">حدث خطأ أثناء تحميل المزادات</div>
          <Button onClick={() => window.location.reload()}>إعادة المحاولة</Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 rtl">
          <h1 className="text-2xl font-bold">المزادات النشطة</h1>
          <Badge variant={sortedAuctions.length > 0 ? "outline" : "secondary"} className="text-sm px-3 py-1">
            {sortedAuctions.length} مزاد
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                          جميع المزادات
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

          <div className="md:col-span-3">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 rtl">
              <div className="relative w-full md:w-auto md:flex-1">
                <Search className="absolute top-1/2 transform -translate-y-1/2 right-3 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="ابحث عن مزاد..."
                  className="pr-10 rtl w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex space-s-2 w-full md:w-auto">
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
                <Button 
                  variant="outline" 
                  size="icon"
                  className="md:hidden"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {showFilters && (
              <div className="md:hidden bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-6 rtl">
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
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">نطاق السعر</h4>
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
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">الوقت المتبقي</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant={timeFilter === "all" ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setTimeFilter("all")}
                      >
                        جميع المزادات
                      </Badge>
                      <Badge 
                        variant={timeFilter === "ending-soon" ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setTimeFilter("ending-soon")}
                      >
                        تنتهي قريبًا
                      </Badge>
                      <Badge 
                        variant={timeFilter === "new" ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setTimeFilter("new")}
                      >
                        مضافة حديثًا
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {sortedAuctions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Filter className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
                <h2 className="text-xl font-semibold mb-2">لا توجد مزادات مطابقة</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  حاول تغيير معايير البحث أو التصفية للعثور على المزادات التي تبحث عنها.
                </p>
                <Button onClick={handleResetFilters}>إعادة ضبط الفلاتر</Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedAuctions.map((auction) => (
                  <AuctionCard
                    key={auction.id}
                    id={auction.id}
                    title={auction.title}
                    description={""}
                    currentPrice={((auction.currentPrice && auction.currentPrice > 0) ? auction.currentPrice : (auction.reservePrice ?? 0))}
                    minBidIncrement={auction.bidIncrement}
                    imageUrl={auction.imageUrl}
                    endTime={auction.endTime}
                    bidders={0}
                    userId={undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

export default ActiveAuctions;
