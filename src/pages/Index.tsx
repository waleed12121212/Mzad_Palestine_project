import React, { useState, useEffect, JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuctionCard from "@/components/ui/AuctionCard";
import CategorySidebar from "@/components/ui/CategorySidebar";
import CategoryCarousel from "@/components/ui/CategoryCarousel";
import ProductCard from "@/components/ui/ProductCard";
import AdCard from "@/components/ui/AdCard";
import UserQuickPanel from "@/components/ui/UserQuickPanel";
import GoogleAdsense from "@/components/GoogleAdsense";
import { 
  ArrowRight, 
  Building2, 
  Car, 
  Smartphone, 
  Sofa, 
  Gem, 
  ChevronRight, 
  Search, 
  Package, 
  User,
  Trophy,
  Shirt,
  Watch,
  Laptop,
  Utensils,
  BookOpen,
  Camera,
  Baby,
  Coffee,
  Clock,
  AlertCircle,
  PlusCircle,
  Briefcase,
  DollarSign
} from "lucide-react";
import HeroSlider from "@/components/ui/HeroSlider";
import { useAuth } from "../contexts/AuthContext";
import { categoryService } from "@/services/categoryService";
import { auctionService, Auction } from "@/services/auctionService";
import { listingService, Listing } from "@/services/listingService";
import { Category as ApiCategory } from "@/services/categoryService";
import { Category, SubCategory } from "@/types";
import { Badge } from "@/components/ui/badge";
import { jobService } from "@/services/jobService";
import { Button } from "@/components/ui/button";

// Add a custom interface for the sidebar category
interface SidebarCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  auctionCount: number;
  subcategories?: { id: string; name: string; count: number }[];
}

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [pendingAuctions, setPendingAuctions] = useState<Auction[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [isListingsLoading, setIsListingsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "pending">("all");
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      
      try {
        const apiCategories = await categoryService.getAllCategories();
        console.log('API categories:', apiCategories);
        
        // Log specific auction count data to debug
        apiCategories.forEach(cat => {
          console.log(`Category ${cat.name}: listing count = ${cat.listingCount}, auction count = ${cat.auctionCount}`);
        });
        
        // Convert API categories to UI categories
        const uiCategories: Category[] = apiCategories.map((apiCat: ApiCategory) => {
          // Convert subcategories if they exist
          const subCategories: SubCategory[] = apiCat.subCategories 
            ? apiCat.subCategories.map(sub => ({
                id: String(sub.id),
                name: sub.name,
                listingsCount: sub.listingCount || 0
              }))
            : [];
            
          // Create UI category
          return {
            id: String(apiCat.id),
            name: apiCat.name,
            description: apiCat.description,
            imageUrl: apiCat.imageUrl,
            listingsCount: apiCat.listingCount || 0,
            auctionCount: apiCat.auctionCount || 0,
            subCategories
          };
        });

        console.log("UI categories for display:", uiCategories);
        setCategories(uiCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      } finally {
        setIsCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchAuctions = async () => {
      setIsLoading(true);
      try {
        // Fetch active auctions
        const activeResponse = await auctionService.getActiveAuctions();
        console.log('Active auctions response:', activeResponse);
        
        if (Array.isArray(activeResponse)) {
          setAuctions(activeResponse);
        } else if (activeResponse && activeResponse.data && Array.isArray(activeResponse.data)) {
          setAuctions(activeResponse.data);
        } else {
          console.error('Unexpected auction response format:', activeResponse);
          setAuctions([]);
        }
        
        // Fetch pending auctions
        const pendingResponse = await auctionService.getPendingAuctions();
        console.log('Pending auctions response:', pendingResponse);
        
        if (Array.isArray(pendingResponse)) {
          setPendingAuctions(pendingResponse);
        } else if (pendingResponse && pendingResponse.data && Array.isArray(pendingResponse.data)) {
          setPendingAuctions(pendingResponse.data);
        } else {
          console.error('Unexpected pending auction response format:', pendingResponse);
          setPendingAuctions([]);
        }
      } catch (error) {
        console.error('Error fetching auctions:', error);
        setAuctions([]);
        setPendingAuctions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      setIsListingsLoading(true);
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
        setIsListingsLoading(false);
      }
    };
    
    fetchListings();
  }, []);

  useEffect(() => {
    jobService.getAllJobs().then(setJobs);
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    // No navigation here - let the filtering happen without redirection
  };

  // Add a new handler for carousel category selection with navigation
  const handleCarouselCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    navigate(`/categories/${categoryId}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/auctions?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const getFilteredAuctions = () => {
    // Combine auctions based on the status filter
    let allAuctions: Auction[] = [];
    if (statusFilter === "all") {
      allAuctions = [...auctions, ...pendingAuctions];
    } else if (statusFilter === "active") {
      allAuctions = [...auctions];
    } else if (statusFilter === "pending") {
      allAuctions = [...pendingAuctions];
    }
    
    if (!selectedCategory) return allAuctions;
    console.log(`Filtering auctions for category ID: ${selectedCategory}`);
    console.log('Available auctions:', allAuctions);
    console.log('Auction category IDs:', allAuctions.map(a => a.categoryId));
    return allAuctions.filter(auction => {
      const match = auction.categoryId?.toString() === selectedCategory;
      console.log(`Auction ${auction.id}: categoryId=${auction.categoryId}, selected=${selectedCategory}, match=${match}`);
      return match;
    });
  };

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case "أزياء":
        return <Shirt className="h-5 w-5" />;
      case "إلكترونيات":
        return <Smartphone className="h-5 w-5" />;
      case "مركبات":
      case "سيارات":
        return <Car className="h-5 w-5" />;
      case "إكسسوارات":
        return <Gem className="h-5 w-5" />;
      case "كتب":
      case "الكتب والمجلات":
        return <BookOpen className="h-5 w-5" />;
      case "كاميرات":
        return <Camera className="h-5 w-5" />;
      case "مستلزمات الأطفال":
        return <Baby className="h-5 w-5" />;
      case "مستلزمات منزلية":
        return <Coffee className="h-5 w-5" />;
      case "أثاث":
        return <Sofa className="h-5 w-5" />;
      default:
        return <Gem className="h-5 w-5" />;
    }
  };

  const products = [
    {
      id: 1,
      title: "هاتف ايفون 15 برو",
      description: "هاتف ذكي مع كاميرا عالية الجودة وأداء ممتاز",
      price: 4500,
      discountedPrice: 4200,
      imageUrl: "https://images.unsplash.com/photo-1696446700088-9bad33ada0f7?q=80&w=2574",
      isNew: true,
      isOnSale: true,
      category: "electronics",
      sellerId: 3,
    },
    {
      id: 2,
      title: "ساعة أبل واتش الجيل 9",
      description: "ساعة ذكية مع ميزات صحية متقدمة ومقاومة للماء",
      price: 1800,
      imageUrl: "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?q=80&w=2672",
      isNew: true,
      category: "watches",
      sellerId: 5,
    },
    {
      id: 3,
      title: "سماعات سوني WH-1000XM5",
      description: "سماعات لاسلكية بخاصية إلغاء الضوضاء وجودة صوت عالية",
      price: 1200,
      discountedPrice: 950,
      imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=2676",
      isOnSale: true,
      category: "electronics",
      sellerId: 1,
    },
    {
      id: 4,
      title: "حقيبة جلدية فاخرة",
      description: "حقيبة يد من الجلد الطبيعي صناعة يدوية فلسطينية",
      price: 750,
      imageUrl: "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?q=80&w=2676",
      category: "collectibles",
      sellerId: 2,
    },
  ];

  const ads = [
    {
      id: 1,
      title: "مزادات خاصة لمنتجات حصرية",
      description: "انضم إلى مجموعة المزايدين المميزين واحصل على فرصة للمشاركة في مزادات خاصة لمنتجات حصرية",
      imageUrl: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2670",
      link: "/auctions?special=exclusive",
      linkText: "انضم الآن",
    },
    {
      id: 2,
      title: "عرض خاص للعقارات",
      description: "مزادات عقارية بأسعار تنافسية وشروط ميسرة، فرصة للاستثمار العقاري",
      imageUrl: "https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=2680",
      link: "/categories/real-estate",
      linkText: "تصفح العقارات",
    },
  ];

  // Sort auctions by bid count or current bid amount
  const featuredAuctions = [...auctions]
    .filter(auction => (auction.bids?.length > 0))
    .sort((a, b) => {
      const aBidCount = a.bids?.length || 0;
      const bBidCount = b.bids?.length || 0;
      return bBidCount - aBidCount;
    })
    .slice(0, 10);
    
  const filteredAuctions = getFilteredAuctions();

  console.log("user from AuthContext:", user);

  return (
    <>
      <section className="pt-28 pb-16 relative bg-gradient-to-b from-blue/5 to-transparent dark:from-blue-dark/10 dark:to-transparent dark-mode-transition">
        <div className="container mx-auto px-4">
          {isAuthenticated && user && (
            <UserQuickPanel userName={user?.username || undefined} />
          )}
          
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="lg:w-1/2 text-right rtl animate-fade-in order-2 lg:order-1">
              <h1 className="heading-xl mb-6">
                <span className="text-blue dark:text-blue-light">مزاد فلسطين</span> للمزادات الإلكترونية
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 mx-auto lg:mx-0 max-w-xl">
                مزادات آمنة وشفافة بتقنيات حديثة. اشترك الآن واحصل على فرصة للفوز بمنتجات وعقارات بأسعار تنافسية.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-end rtl">
                <Link to="/auctions" className="btn-primary rounded-lg flex items-center justify-center gap-2 min-w-36">
                  <span>ابدأ المزايدة</span>
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link to="/how-it-works" className="btn-secondary rounded-lg min-w-36">
                  كيف تعمل المنصة؟
                </Link>
              </div>
            </div>
            <div className="lg:w-1/2 animate-fade-in delay-300 order-1 lg:order-2">
              <HeroSlider />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 -mt-6 relative z-20">
        <div className="container mx-auto px-4">
          {/* تم حذف فورم البحث بناءً على طلب المستخدم */}
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-blue/5 to-transparent dark:from-blue-dark/10 dark:to-transparent">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8 rtl">
            <h2 className="heading-lg">تصفح الفئات</h2>
            <Link to="/categories" className="text-blue dark:text-blue-light hover:underline flex items-center">
              عرض الكل <ChevronRight className="h-5 w-5" />
            </Link>
          </div>
          
          {isCategoriesLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : categories.length > 0 ? (
            <CategoryCarousel
              categories={categories.map(category => {
                console.log('Mapping category for carousel:', category);
                return {
                  id: category.id,
                  name: category.name,
                  imageUrl: category.imageUrl || "",
                  count: (category.listingsCount || 0) + (category.auctionCount || 0),
                  auctionCount: category.auctionCount || 0,
                  listingCount: category.listingsCount || 0,
                  subcategories: category.subCategories?.map(sub => ({
                    id: sub.id,
                    name: sub.name,
                    count: sub.listingsCount || 0
                  }))
                };
              })}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCarouselCategorySelect}
            />
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600 dark:text-gray-300">لا توجد فئات متاحة حالياً</p>
            </div>
          )}
        </div>
      </section>
      <section className="py-12 bg-gradient-to-r from-blue/5 to-green/5 dark:from-blue/10 dark:to-green/10">
        <div className="container mx-auto px-4">
          {/* بطاقة الإعلان الأولى في صف منفصل */}
          <div className="mb-6">
            <div className="relative rounded-xl overflow-hidden shadow-lg w-full">
              <Link to={ads[1].link}>
                <div className="w-full h-full">
                  <AdCard
                    id={ads[1].id}
                    title={ads[1].title}
                    description={ads[1].description}
                    imageUrl={ads[1].imageUrl}
                    link={ads[1].link}
                    linkText={ads[1].linkText || "عرض التفاصيل"}
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8 rtl">
            <h2 className="heading-lg">المزادات الرائجة</h2>
            <Link to="/auctions" className="text-blue dark:text-blue-light hover:underline flex items-center">
              عرض الكل <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="neo-card animate-pulse">
                  <div className="w-full h-56 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between mb-4">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAuctions.map((auction) => (
                <AuctionCard
                  key={auction.id}
                  id={auction.id}
                  title={auction.title}
                  description={auction.description || ""}
                  currentPrice={auction.currentBid > 0 ? auction.currentBid : auction.reservePrice}
                  minBidIncrement={auction.bidIncrement}
                  imageUrl={auction.images?.[0] || ""}
                  endTime={auction.endDate}
                  bidders={auction.bids?.length || 0}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-blue/5 to-transparent dark:from-blue-dark/10 dark:to-transparent">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8 rtl">
            <h2 className="heading-lg">الشراء الفوري</h2>
            <Link to="/buy-now" className="text-blue dark:text-blue-light hover:underline flex items-center">
              عرض الكل <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          {isListingsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="neo-card animate-pulse">
                  <div className="w-full h-56 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                    <div className="flex justify-between mb-4">
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                    </div>
                    <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {listings.slice(0, 8).map((listing) => (
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
            <div className="text-center py-12">
              <h2 className="text-xl font-bold mb-4">لا توجد منتجات للشراء الفوري حالياً</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">عذراً، لم نتمكن من العثور على منتجات متاحة للشراء الفوري</p>
              <Link to="/sell-product" className="text-blue dark:text-blue-light hover:underline inline-block">
                عرض منتج للبيع
              </Link>
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-blue/5 to-green/5 dark:from-blue/10 dark:to-green/10">
        <div className="container mx-auto px-4">
          {/* بطاقة الإعلان الأولى في صف منفصل */}
          <div className="mb-6">
            <div className="relative rounded-xl overflow-hidden shadow-lg w-full">
              <Link to={ads[0].link}>
                <div className="w-full h-full">
                  <AdCard
                    id={ads[0].id}
                    title={ads[0].title}
                    description={ads[0].description}
                    imageUrl={ads[0].imageUrl}
                    link={ads[0].link}
                    linkText={ads[0].linkText || "عرض التفاصيل"}
                  />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gray-50 dark:bg-gray-900/50 dark-mode-transition">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8 rtl">
            <h2 className="heading-lg">تصفح المزادات</h2>
            <Link to="/categories" className="text-blue dark:text-blue-light hover:underline flex items-center">
              جميع الفئات <ChevronRight className="h-5 w-5" />
            </Link>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/4 w-full">
              <div className="mb-6 rtl">
                <h3 className="font-semibold mb-4">الحالة</h3>
                <div className="space-y-2">
                  <button 
                    className={`w-full text-right px-3 py-2 rounded-lg ${statusFilter === "all" ? "bg-blue text-white" : "bg-gray-100 dark:bg-gray-800"}`}
                    onClick={() => setStatusFilter("all")}
                  >
                    جميع المزادات
                  </button>
                  <button 
                    className={`w-full text-right px-3 py-2 rounded-lg ${statusFilter === "active" ? "bg-blue text-white" : "bg-gray-100 dark:bg-gray-800"}`}
                    onClick={() => setStatusFilter("active")}
                  >
                    <span className="flex items-center">
                      المزادات النشطة
                      <Badge variant="outline" className="mr-2 bg-green-100 text-green-800 text-xs">
                        {auctions.length}
                      </Badge>
                    </span>
                  </button>
                  <button 
                    className={`w-full text-right px-3 py-2 rounded-lg ${statusFilter === "pending" ? "bg-blue text-white" : "bg-gray-100 dark:bg-gray-800"}`}
                    onClick={() => setStatusFilter("pending")}
                  >
                    <span className="flex items-center">
                      المزادات المعلقة
                      <Badge variant="outline" className="mr-2 bg-yellow-100 text-yellow-800 text-xs">
                        {pendingAuctions.length}
                      </Badge>
                    </span>
                  </button>
                </div>
              </div>
              
              <CategorySidebar
                categories={categories.map(cat => {
                  console.log('Mapping category for sidebar:', cat);
                  const sidebarCategory: SidebarCategory = {
                    id: cat.id,
                    name: cat.name,
                    icon: getCategoryIcon(cat.name),
                    count: cat.listingsCount || 0,
                    auctionCount: cat.auctionCount || 0,
                    subcategories: cat.subCategories?.map(sub => ({
                      id: sub.id,
                      name: sub.name,
                      count: sub.listingsCount || 0
                    }))
                  };
                  return sidebarCategory;
                })}
                onSelectCategory={handleCategorySelect}
                selectedCategoryId={selectedCategory || undefined}
              />
            </div>

            <div className="lg:w-3/4 w-full">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="neo-card animate-pulse">
                      <div className="w-full h-48 bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                      <div className="p-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4"></div>
                        <div className="flex justify-between mb-4">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                        </div>
                        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAuctions.map((auction) => {
                    const isPending = auction.status === "Pending";
                    const bidIncrement = auction.bidIncrement ?? 0;
                    const currentPrice = auction.currentBid > 0 ? auction.currentBid : auction.reservePrice;
                    const minBid = currentPrice + bidIncrement;
                    const bidsCount = auction.bids?.length || auction.bidsCount || 0;
                    
                    return (
                      <div className="relative" key={auction.id}>
                        {isPending && (
                          <Badge variant="outline" className="absolute top-2 right-2 bg-yellow-100 text-yellow-800 border-yellow-300 flex items-center gap-1 z-20">
                            <Clock className="h-3 w-3" /> معلق
                          </Badge>
                        )}
                        {isPending && (
                          <div className="absolute inset-0 bg-yellow-50/80 dark:bg-yellow-900/30 flex items-center justify-center z-10 rounded-xl">
                            <div className="bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-100 px-4 py-2 rounded-lg font-bold text-center">
                              سيتم عرضه قريبا
                            </div>
                          </div>
                        )}
                        <AuctionCard
                          id={auction.id}
                          listingId={auction.listingId}
                          title={auction.title}
                          description={auction.description || ""}
                          currentPrice={currentPrice}
                          minBidIncrement={minBid}
                          imageUrl={auction.images?.[0] || ""}
                          endTime={isPending ? auction.startDate : auction.endDate}
                          bidders={bidsCount}
                          userId={auction.userId}
                          isPending={isPending}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
              
              {selectedCategory && filteredAuctions.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <p className="text-lg text-gray-600 dark:text-gray-300">لا توجد مزادات في هذه الفئة حاليًا.</p>
                  <Link to="/auctions" className="text-blue dark:text-blue-light hover:underline inline-block mt-4">
                    استعرض جميع المزادات
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-blue/5 to-transparent dark:from-blue-dark/10 dark:to-transparent">
          <div className="my-8 flex justify-center">
            <GoogleAdsense 
              adSlot="YOUR_AD_SLOT_ID"
              style={{ 
                display: 'block',
                minHeight: '100px',
                width: '100%',
                maxWidth: '728px'
              }}
            />
          </div>
      </section>
    </>
  );
};

const HowItWorksCard = ({ number, title, description, icon }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:shadow-md">
      <div className="relative mb-6">
        <div className="w-16 h-16 bg-blue/10 dark:bg-blue/20 rounded-full flex items-center justify-center text-blue dark:text-blue-light">
          {React.cloneElement(icon, { className: "w-8 h-8 text-gray-500" })}
        </div>
        <div className="absolute top-0 right-0 w-8 h-8 bg-blue text-white rounded-full flex items-center justify-center font-bold text-lg transform translate-x-1/4 -translate-y-1/4">
          {number}
        </div>
      </div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
};

export default Index;
