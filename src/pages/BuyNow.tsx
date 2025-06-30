import React, { useState, useEffect, CSSProperties } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Filter, FilterX, ShoppingCart, ChevronDown, Search, Loader2, Sliders, Check, SlidersHorizontal, X, Star, ChevronLeft, Car, Shirt, Smartphone, Book, Gem, CupSoda, Home, Package, Laptop } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { listingService, Listing, SearchListingParams } from "@/services/listingService";
import { categoryService, Category } from "@/services/categoryService";
import ProductCard from "@/components/ui/ProductCard";
import { categorizeListings } from "@/utils/categoryUtils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

// Define the style with correct TypeScript typing
const hideNumberInputSpinners: CSSProperties = {
  WebkitAppearance: "none",
  margin: 0,
};

// Add a CSS class instead of inline styles for better browser compatibility
const inputStyles = `
  input::-webkit-outer-spin-button,
  input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  input[type=number] {
    -moz-appearance: textfield;
  }
`;

const categoryIcons: { [key: string]: React.ReactNode } = {
  "سيارات": <Car className="inline-block ml-2" />,
  "أزياء": <Shirt className="inline-block ml-2" />,
  "إلكترونيات": <Smartphone className="inline-block ml-2" />,
  "هواتف": <Smartphone className="inline-block ml-2" />,
  "كتب": <Book className="inline-block ml-2" />,
  "كونتمكس": <Gem className="inline-block ml-2" />,
  "أثاث": <Package className="inline-block ml-2" />,
  "مستلزمات منزلية": <CupSoda className="inline-block ml-2" />,
  "لابتوبات": <Laptop className="inline-block ml-2" />,
  "عقارات": <Home className="inline-block ml-2" />,
  "ملابس رجالية": <Shirt className="inline-block ml-2" />,
  // fallback/default
};

interface FilterState {
  keyword: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  timeFilter?: string;
}

const BuyNow: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const initialSearchQuery = searchParams.get("search") || "";
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [sortBy, setSortBy] = useState("newest");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [timeFilter, setTimeFilter] = useState<"all" | "ending-soon" | "new">("all");
  const [priceError, setPriceError] = useState<string | null>(null);

  const priceOptions = [
    { label: "كل الأسعار", value: [0, 1000000] },
    { label: "0 - 1,000 ₪", value: [0, 1000] },
    { label: "1,000 - 5,000 ₪", value: [1000, 5000] },
    { label: "5,000 - 20,000 ₪", value: [5000, 20000] },
    { label: "20,000 - 100,000 ₪", value: [20000, 100000] },
    { label: "100,000+ ₪", value: [100000, 1000000] },
  ];
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    // Parse search params when the component mounts or URL changes
    const keyword = searchParams.get('search') || '';
    const category = searchParams.get('category') || 'all';
    const minPrice = Number(searchParams.get('minPrice')) || 0;
    const maxPrice = Number(searchParams.get('maxPrice')) || 1000000;
    const time = searchParams.get('timeFilter') as "all" | "ending-soon" | "new" || "all";

    setSearchQuery(keyword);
    setSelectedCategory(category);
    setPriceRange([minPrice, maxPrice]);
    setTimeFilter(time);

    // Search with these params
    searchListings();
  }, [searchParams]);

  const searchListings = async () => {
    setIsLoading(true);
    
      try {
        // First try to get active listings (requires auth)
        const response = await listingService.getActiveListings();
        console.log('Active listings response:', response);
        setListings(response);
      } catch (error) {
        console.error('Error fetching active listings:', error);
        try {
          // Fallback to public listings
          console.log('Falling back to public listings');
          const publicData = await listingService.getPublicListings();
          setListings(publicData);
        } catch (fallbackError) {
          console.error('Error fetching public listings:', fallbackError);
          setListings([]);
        }
      } finally {
        setIsLoading(false);
      }
  };

  const filteredListings = listings.filter((listing) => {
    const matchesQuery = listing.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const price = listing.price;
    const matchesPrice = price >= priceRange[0] && price <= priceRange[1];
    let matchesTime = true;
    if (timeFilter === "ending-soon") {
      const createdDate = new Date(listing.createdAt);
      const now = new Date();
      const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      matchesTime = diffDays <= 3; // Ending soon for listings means recently added (within 3 days)
    } else if (timeFilter === "new") {
      const createdDate = new Date(listing.createdAt);
      const now = new Date();
      const diffDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      matchesTime = diffDays <= 7; // New means added within a week
    }
    const matchesCategory = selectedCategory === "all" || String(listing.categoryId) === selectedCategory;
    return matchesQuery && matchesPrice && matchesTime && matchesCategory;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case "priceHigh":
        return b.price - a.price;
      case "priceLow":
        return a.price - b.price;
      default:
        return 0;
    }
  });

  const handleResetFilters = () => {
    setSearchQuery("");
    setPriceRange([0, 1000000]);
    setSelectedCategory("all");
    setTimeFilter("all");
    setSearchParams({});
  };

  const hasActiveFilters = () => {
    return searchQuery !== "" || 
           priceRange[0] !== 0 || 
           priceRange[1] !== 1000000 || 
           selectedCategory !== "all" ||
           timeFilter !== "all";
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setSearchQuery(newQuery);
    updateSearchParams();
  };

  const updateSearchParams = () => {
    const params = new URLSearchParams();
    
    if (searchQuery) params.set('search', searchQuery);
    if (selectedCategory !== "all") params.set('category', selectedCategory);
    if (priceRange[0] > 0) params.set('minPrice', priceRange[0].toString());
    if (priceRange[1] < 1000000) params.set('maxPrice', priceRange[1].toString());
    if (timeFilter !== "all") params.set('timeFilter', timeFilter);
    
    setSearchParams(params);
  };

  return (
    <>
      <style>{inputStyles}</style>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">الشراء الفوري</h1>
          <Link to="/" className="text-blue-600 flex items-center">
            <ChevronLeft className="h-5 w-5" />
            <span>العودة للرئيسية</span>
          </Link>
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
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">الفئة</AccordionTrigger>
                    <AccordionContent>
                      <div className="px-1">
                        <Select value={selectedCategory} onValueChange={(value) => {
                          setSelectedCategory(value);
                          updateSearchParams();
                        }}>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="اختر الفئة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">كل الفئات</SelectItem>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={String(cat.id)}>
                                {categoryIcons[cat.name] || <Gem className="inline-block ml-2" />} {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="price">
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">نطاق السعر</AccordionTrigger>
                    <AccordionContent>
                      <div className="px-1">
                        <Select 
                          value={JSON.stringify(priceRange)} 
                          onValueChange={val => {
                            setPriceRange(JSON.parse(val));
                            updateSearchParams();
                          }}
                        >
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
                    <AccordionTrigger className="py-3 text-sm hover:no-underline">الوقت</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-1">
                        <Button 
                          variant={timeFilter === "all" ? "default" : "outline"}
                          className="w-full justify-start text-right px-2 py-1.5 h-auto mb-1"
                          onClick={() => {
                            setTimeFilter("all");
                            updateSearchParams();
                          }}
                        >
                          جميع المنتجات
                        </Button>
                        <Button 
                          variant={timeFilter === "ending-soon" ? "default" : "outline"}
                          className="w-full justify-start text-right px-2 py-1.5 h-auto mb-1"
                          onClick={() => {
                            setTimeFilter("ending-soon");
                            updateSearchParams();
                          }}
                        >
                          أضيفت مؤخرًا (خلال 3 أيام)
                        </Button>
                        <Button 
                          variant={timeFilter === "new" ? "default" : "outline"}
                          className="w-full justify-start text-right px-2 py-1.5 h-auto"
                          onClick={() => {
                            setTimeFilter("new");
                            updateSearchParams();
                          }}
                        >
                          جديدة (خلال أسبوع)
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
              placeholder="ابحث عن منتج..."
                  className="pr-10 rtl w-full"
                  value={searchQuery}
                  onChange={handleSearchChange}
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
                    <h4 className="text-sm font-medium mb-2">الفئة</h4>
                    <Select value={selectedCategory} onValueChange={(value) => {
                      setSelectedCategory(value);
                      updateSearchParams();
                    }}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">كل الفئات</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat.id} value={String(cat.id)}>
                            {categoryIcons[cat.name] || <Gem className="inline-block ml-2" />} {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                    <div>
                    <h4 className="text-sm font-medium mb-2">نطاق السعر</h4>
                    <div className="px-1">
                      <Select 
                        value={JSON.stringify(priceRange)} 
                        onValueChange={val => {
                          setPriceRange(JSON.parse(val));
                          updateSearchParams();
                        }}
                      >
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
                    <h4 className="text-sm font-medium mb-2">الوقت</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant={timeFilter === "all" ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setTimeFilter("all");
                          updateSearchParams();
                        }}
                      >
                        جميع المنتجات
                      </Badge>
                      <Badge 
                        variant={timeFilter === "ending-soon" ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setTimeFilter("ending-soon");
                          updateSearchParams();
                        }}
                      >
                        أضيفت مؤخرًا
                      </Badge>
                      <Badge 
                        variant={timeFilter === "new" ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setTimeFilter("new");
                          updateSearchParams();
                        }}
                      >
                        جديدة
                      </Badge>
                    </div>
                  </div>
                </div>
            </div>
          )}

        {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(8)].map((_, index) => (
              <div 
                key={index} 
                className="bg-gray-100 dark:bg-gray-800 rounded-lg h-64 animate-pulse"
              />
            ))}
          </div>
            ) : sortedListings.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sortedListings.map((listing) => (
                  <ProductCard
                    key={listing.listingId}
                    id={listing.listingId}
                    title={listing.title}
                    description={listing.description}
                    price={listing.price}
                    discountedPrice={listing.discount && listing.discount > 0 ? listing.price - listing.discount : undefined}
                    imageUrl={listing.images?.[0]||"https://via.placeholder.com/300"}
                    isNew={new Date(listing.createdAt).getTime() > new Date().getTime() - 7 * 24 * 60 * 60 * 1000}
                    isOnSale={!!listing.discount && listing.discount > 0}
                    sellerId={listing.userId}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center bg-gray-50 dark:bg-gray-900 rounded-lg">
                <Filter className="h-16 w-16 text-gray-300 dark:text-gray-700 mb-4" />
                <h2 className="text-xl font-semibold mb-2">لا توجد منتجات مطابقة</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
                  حاول تغيير معايير البحث أو التصفية للعثور على المنتجات التي تبحث عنها.
                </p>
                <Button onClick={handleResetFilters}>إعادة ضبط الفلاتر</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default BuyNow;
