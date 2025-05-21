import React, { useState, useEffect, CSSProperties } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Filter, ShoppingCart, ChevronDown, Search, Loader2, Sliders, Check, SlidersHorizontal, X, Star, ChevronLeft } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import PageWrapper from "@/components/layout/PageWrapper";
import { listingService, Listing, SearchListingParams } from "@/services/listingService";
import { categoryService, Category } from "@/services/categoryService";
import ProductCard from "@/components/ui/ProductCard";
import { categorizeListings } from "@/utils/categoryUtils";

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

interface FilterState {
  keyword: string;
  category: string;
  minPrice: number;
  maxPrice: number;
}

const BuyNow: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    keyword: searchParams.get('keyword') || '',
    category: searchParams.get('category') || '',
    minPrice: Number(searchParams.get('minPrice')) || 0,
    maxPrice: Number(searchParams.get('maxPrice')) || 10000
  });
  const [tempFilters, setTempFilters] = useState<FilterState>({...filters});
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
    const keyword = searchParams.get('keyword') || '';
    const category = searchParams.get('category') || '';
    const minPrice = Number(searchParams.get('minPrice')) || 0;
    const maxPrice = Number(searchParams.get('maxPrice')) || 10000;

    setFilters({
      keyword,
      category,
      minPrice,
      maxPrice
    });

    setTempFilters({
      keyword,
      category,
      minPrice,
      maxPrice
    });

    // Search with these params
    searchListings({
      keyword,
      category,
      minPrice,
      maxPrice
    });
  }, [searchParams]);

  const searchListings = async (searchParams: FilterState) => {
    setIsLoading(true);
    console.log("Searching with params:", searchParams);
    
    // If we don't have any filters, fetch all listings
    if (!searchParams.keyword && !searchParams.category && 
        searchParams.minPrice <= 0 && searchParams.maxPrice >= 10000) {
      // Use the exact same approach as Index.tsx
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
      return;
    }
    
    // If we have filters, we need to fetch all listings first and then filter them
    try {
      // First get all listings
      let allListings: Listing[] = [];
      
      try {
        // Try active listings first (might need auth)
        allListings = await listingService.getActiveListings();
      } catch (error) {
        // Fall back to public listings
        console.log('Falling back to public listings for search');
        allListings = await listingService.getPublicListings();
      }
      
      console.log(`Got ${allListings.length} listings for filtering`);
      
      // Now filter them manually
      const filteredListings = allListings.filter(listing => {
        // Filter by keyword (title only)
        if (searchParams.keyword && 
            !listing.title.toLowerCase().includes(searchParams.keyword.toLowerCase())) {
          return false;
        }
        
        // Filter by category
        if (searchParams.category && listing.categoryName !== searchParams.category) {
          return false;
        }
        
        // Filter by price range
        if (searchParams.minPrice > 0 && listing.price < searchParams.minPrice) {
          return false;
        }
        
        if (searchParams.maxPrice < 10000 && listing.price > searchParams.maxPrice) {
          return false;
        }
        
        return true;
      });
      
      console.log(`Filtered down to ${filteredListings.length} listings`);
      setListings(filteredListings);
    } catch (error) {
      console.error('Error during search:', error);
      setListings([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting search with params:", tempFilters);
    applyFilters();
  };

  const applyFilters = () => {
    // Update the URL with search params
    const params = new URLSearchParams();
    
    if (tempFilters.keyword) params.append('keyword', tempFilters.keyword);
    if (tempFilters.category) params.append('category', tempFilters.category);
    if (tempFilters.minPrice > 0) params.append('minPrice', tempFilters.minPrice.toString());
    if (tempFilters.maxPrice > 0 && tempFilters.maxPrice < 10000) params.append('maxPrice', tempFilters.maxPrice.toString());
    
    console.log("Setting search params:", Object.fromEntries(params.entries()));
    setSearchParams(params);
    setFilters(tempFilters);
    setIsFilterOpen(false);
  };

  const resetFilters = () => {
    setTempFilters({
      keyword: '',
      category: '',
      minPrice: 0,
      maxPrice: 10000
    });
  };

  return (
    <PageWrapper>
      <style>{inputStyles}</style>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">الشراء الفوري</h1>
          <Link to="/" className="text-blue-600 flex items-center">
            <ChevronLeft className="h-5 w-5" />
            <span>العودة للرئيسية</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <Input
              type="text"
              placeholder="ابحث عن منتج..."
              className="flex-grow dark:bg-gray-800 dark:border-gray-700"
              value={tempFilters.keyword}
              onChange={(e) => setTempFilters({...tempFilters, keyword: e.target.value})}
            />
            <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" type="button" className="flex gap-2 dark:border-gray-700 dark:text-gray-200">
                  <Filter className="h-4 w-4" />
                  <span>الفلاتر</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] dark:bg-gray-900 dark:border-gray-800">
                <div className="h-full flex flex-col">
                  <div className="flex justify-between items-center py-4 border-b dark:border-gray-700">
                    <h3 className="font-bold text-lg dark:text-white">الفلاتر</h3>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={resetFilters}
                      className="text-blue-500 dark:text-blue-400 dark:hover:bg-gray-800"
                    >
                      إعادة ضبط
                    </Button>
                  </div>
                  
                  <div className="flex-1 overflow-auto py-4 space-y-6">
                    <div>
                      <h4 className="font-medium mb-2 dark:text-gray-200">الفئة</h4>
                      <select
                        className="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                        value={tempFilters.category}
                        onChange={(e) => setTempFilters({...tempFilters, category: e.target.value})}
                      >
                        <option value="">جميع الفئات</option>
                        {categories.map(category => (
                          <option key={category.id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2 dark:text-gray-200">نطاق السعر</h4>
                      <div className="flex items-center gap-4 mb-6">
                        <Input
                          type="number"
                          placeholder="الحد الأدنى"
                          value={tempFilters.minPrice || ''}
                          onChange={(e) => setTempFilters({
                            ...tempFilters, 
                            minPrice: e.target.value ? Number(e.target.value) : 0
                          })}
                          className="w-1/2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                          style={hideNumberInputSpinners}
                        />
                        <span className="dark:text-gray-400">-</span>
                        <Input
                          type="number"
                          placeholder="الحد الأقصى"
                          value={tempFilters.maxPrice || ''}
                          onChange={(e) => setTempFilters({
                            ...tempFilters, 
                            maxPrice: e.target.value ? Number(e.target.value) : 0
                          })}
                          className="w-1/2 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                          style={hideNumberInputSpinners}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t py-4 dark:border-gray-700">
                    <Button 
                      className="w-full" 
                      onClick={applyFilters}
                    >
                      تطبيق الفلاتر
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            <Button type="submit" className="flex gap-2">
              <Search className="h-4 w-4" />
              <span>بحث</span>
            </Button>
          </form>
          
          {/* Active Filters Display */}
          {(filters.keyword || filters.category || filters.minPrice > 0 || filters.maxPrice < 10000) && (
            <div className="flex flex-wrap gap-2 mb-4">
              {filters.keyword && (
                <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-700 dark:text-gray-200">
                  <span>الكلمة: {filters.keyword}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('keyword');
                      setSearchParams(newParams);
                    }}
                  />
                </Badge>
              )}
              {filters.category && (
                <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-700 dark:text-gray-200">
                  <span>الفئة: {filters.category}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('category');
                      setSearchParams(newParams);
                    }}
                  />
                </Badge>
              )}
              {(filters.minPrice > 0 || filters.maxPrice < 10000) && (
                <Badge variant="outline" className="flex items-center gap-1 dark:border-gray-700 dark:text-gray-200">
                  <span>السعر: {filters.minPrice} - {filters.maxPrice}</span>
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.delete('minPrice');
                      newParams.delete('maxPrice');
                      setSearchParams(newParams);
                    }}
                  />
                </Badge>
              )}
              {(filters.keyword || filters.category || filters.minPrice > 0 || filters.maxPrice < 10000) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-sm dark:hover:bg-gray-800"
                  onClick={() => {
                    setSearchParams(new URLSearchParams());
                  }}
                >
                  مسح الكل
                </Button>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => (
              <div 
                key={index} 
                className="bg-gray-100 dark:bg-gray-800 rounded-lg h-64 animate-pulse"
              />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ProductCard
                key={listing.listingId}
                id={listing.listingId}
                title={listing.title}
                description={listing.description}
                price={listing.price}
                imageUrl={listing.images?.[0] || "https://via.placeholder.com/300"}
                isNew={new Date(listing.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)}
                sellerId={listing.userId}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 dark:text-gray-300">
            <h2 className="text-2xl font-bold mb-4">لا توجد منتجات تطابق معايير البحث</h2>
            <p className="mb-4 dark:text-gray-400">حاول تغيير معايير البحث أو استعرض جميع المنتجات</p>
            <Button 
              onClick={() => setSearchParams(new URLSearchParams())} 
              className="mx-auto"
            >
              عرض جميع المنتجات
            </Button>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default BuyNow;
