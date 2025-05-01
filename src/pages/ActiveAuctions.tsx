
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Filter, FilterX, SlidersHorizontal, ChevronDown } from "lucide-react";
import AuctionCard from "@/components/ui/AuctionCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
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
}

const fetchActiveAuctions = async (): Promise<Auction[]> => {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  return [
    {
      id: 1,
      title: "مزهرية خزفية تقليدية",
      description: "مزهرية خزفية مصنوعة يدويًا بتصميم فلسطيني تقليدي",
      currentPrice: 250,
      minBidIncrement: 20,
      imageUrl: "https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?q=80&w=1000",
      endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      bidders: 12,
      category: "ديكور منزلي"
    },
    {
      id: 2,
      title: "ساعة يد أنتيكة",
      description: "ساعة يد أنتيكة من العصر العثماني بحالة ممتازة",
      currentPrice: 1200,
      minBidIncrement: 100,
      imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=2338",
      endTime: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      bidders: 8,
      category: "مجوهرات وإكسسوارات"
    },
    {
      id: 3,
      title: "لوحة فنية أصلية",
      description: "لوحة فنية أصلية تصور القدس القديمة بريشة فنان فلسطيني",
      currentPrice: 850,
      minBidIncrement: 50,
      imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=990",
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      bidders: 15,
      category: "فنون وتحف"
    },
    {
      id: 4,
      title: "سجادة فلسطينية مطرزة",
      description: "سجادة يدوية مطرزة بنقوش فلسطينية تقليدية من الصوف الطبيعي",
      currentPrice: 560,
      minBidIncrement: 30,
      imageUrl: "https://images.unsplash.com/photo-1576859958081-27de5c70262a?q=80&w=2340",
      endTime: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      bidders: 7,
      category: "ديكور منزلي"
    },
    {
      id: 5,
      title: "قلادة فضية قديمة",
      description: "قلادة فضية تراثية من القرن التاسع عشر بتصميم فلسطيني أصيل",
      currentPrice: 380,
      minBidIncrement: 25,
      imageUrl: "https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=2342",
      endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      bidders: 9,
      category: "مجوهرات وإكسسوارات"
    },
    {
      id: 6,
      title: "كتاب نادر عن تاريخ فلسطين",
      description: "كتاب نادر يعود للعام 1920 يوثق تاريخ وجغرافية فلسطين بالصور والخرائط",
      currentPrice: 920,
      minBidIncrement: 50,
      imageUrl: "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=2342",
      endTime: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
      bidders: 18,
      category: "كتب ومخطوطات"
    }
  ];
};

const ActiveAuctions: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState([0, 2000]);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [auctionView, setAuctionView] = useState<"grid" | "list">("grid");
  const [timeFilter, setTimeFilter] = useState<"all" | "ending-soon" | "new">("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["activeAuctions"],
    queryFn: fetchActiveAuctions
  });

  const categories = data 
    ? [...new Set(data.map(auction => auction.category))]
        .filter(Boolean)
        .sort() as string[]
    : [];

  const filteredAuctions = data ? data.filter((auction) => {
    const matchesQuery = auction.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        auction.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesPrice = auction.currentPrice >= priceRange[0] && auction.currentPrice <= priceRange[1];
    
    const matchesCategory = selectedCategories.length === 0 || 
                           (auction.category && selectedCategories.includes(auction.category));
    
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
    
    return matchesQuery && matchesPrice && matchesCategory && matchesTime;
  }) : [];

  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.endTime).getTime() - new Date(a.endTime).getTime();
      case "priceHigh":
        return b.currentPrice - a.currentPrice;
      case "priceLow":
        return a.currentPrice - b.currentPrice;
      case "popularity":
        return b.bidders - a.bidders;
      case "endingSoon":
        return new Date(a.endTime).getTime() - new Date(b.endTime).getTime();
      default:
        return 0;
    }
  });

  const handleCategoryChange = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 2000]);
    setSortBy("newest");
    setSelectedCategories([]);
    setTimeFilter("all");
  };

  const hasActiveFilters = () => {
    return searchQuery !== "" || 
           priceRange[0] !== 0 || 
           priceRange[1] !== 2000 || 
           selectedCategories.length > 0 ||
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
                
                <Accordion type="multiple" defaultValue={["category", "price", "time"]}>
                  <AccordionItem value="category">
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">الفئات</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        {categories.map(category => (
                          <div key={category} className="flex items-center space-x-2 space-x-reverse">
                            <Checkbox 
                              id={`category-${category}`} 
                              checked={selectedCategories.includes(category)}
                              onCheckedChange={() => handleCategoryChange(category)}
                            />
                            <label 
                              htmlFor={`category-${category}`}
                              className="text-sm cursor-pointer select-none"
                            >
                              {category}
                            </label>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="price">
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">نطاق السعر</AccordionTrigger>
                    <AccordionContent>
                      <div className="px-1">
                        <Slider 
                          value={priceRange} 
                          min={0} 
                          max={2000} 
                          step={50} 
                          onValueChange={setPriceRange}
                          className="mb-4"
                        />
                        <div className="flex justify-between items-center">
                          <div className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 text-xs">
                            {priceRange[0]} ₪
                          </div>
                          <div className="text-gray-500 text-xs">إلى</div>
                          <div className="bg-gray-100 dark:bg-gray-800 rounded px-2 py-1 text-xs">
                            {priceRange[1]} ₪
                          </div>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="time">
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">الوقت المتبقي</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1">
                        {/* Fix: Wrap TabsTrigger components in Tabs and TabsList */}
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
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
                
                <div className="mt-6">
                  <h3 className="text-sm font-semibold mb-2">ترتيب حسب</h3>
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="اختر الترتيب" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">الأحدث</SelectItem>
                      <SelectItem value="priceHigh">السعر: من الأعلى للأدنى</SelectItem>
                      <SelectItem value="priceLow">السعر: من الأدنى للأعلى</SelectItem>
                      <SelectItem value="popularity">الأكثر شعبية</SelectItem>
                      <SelectItem value="endingSoon">تنتهي قريبًا</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
                    <SelectItem value="popularity">الأكثر شعبية</SelectItem>
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
                    <h4 className="text-sm font-medium mb-2">الفئات</h4>
                    <div className="flex flex-wrap gap-2">
                      {categories.map(category => (
                        <Badge 
                          key={category}
                          variant={selectedCategories.includes(category) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => handleCategoryChange(category)}
                        >
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">نطاق السعر</h4>
                    <Slider 
                      value={priceRange} 
                      min={0} 
                      max={2000} 
                      step={50} 
                      onValueChange={setPriceRange}
                      className="mb-1"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{priceRange[0]} ₪</span>
                      <span>{priceRange[1]} ₪</span>
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
                    description={auction.description}
                    currentPrice={auction.currentPrice}
                    minBidIncrement={auction.minBidIncrement}
                    imageUrl={auction.imageUrl}
                    endTime={auction.endTime}
                    bidders={auction.bidders}
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
