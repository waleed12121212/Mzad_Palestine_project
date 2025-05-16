import React, { useState, useEffect, JSX } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuctionCard from "@/components/ui/AuctionCard";
import CategorySidebar from "@/components/ui/CategorySidebar";
import CategoryCarousel from "@/components/ui/CategoryCarousel";
import ProductCard from "@/components/ui/ProductCard";
import AdCard from "@/components/ui/AdCard";
import UserQuickPanel from "@/components/ui/UserQuickPanel";
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
  Coffee
} from "lucide-react";
import HeroSlider from "@/components/ui/HeroSlider";
import { useAuth } from "../contexts/AuthContext";
import { categoryService, Category } from "@/services/categoryService";
import { auctionService } from "@/services/auctionService";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [auctions, setAuctions] = useState([]);
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isCategoriesLoading, setIsCategoriesLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsCategoriesLoading(true);
      try {
        const activeCategories = await categoryService.getActiveCategories();
        console.log('Active categories:', activeCategories);
        
        // Fetch detailed information for each category
        const detailedCategories = await Promise.all(
          activeCategories.map(async (category) => {
            try {
              const detailedCategory = await categoryService.getCategoryById(category.id.toString());
              console.log(`Detailed category ${category.id}:`, detailedCategory);
              return {
                ...category,
                listingsCount: detailedCategory.listingsCount ?? 0
              };
            } catch (error) {
              console.error(`Error fetching details for category ${category.id}:`, error);
              return {
                ...category,
                listingsCount: 0
              };
            }
          })
        );

        console.log("Final detailed categories:", detailedCategories);
        setCategories(detailedCategories);
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
        const response: any = await auctionService.getActiveAuctions();
        if (Array.isArray(response)) {
          setAuctions(response);
        } else if (response && Array.isArray(response.data)) {
          setAuctions(response.data);
        } else {
          setAuctions([]);
        }
      } catch {
        setAuctions([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAuctions();
  }, []);

  const handleCategorySelect = (categoryId: string) => {
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
    if (!selectedCategory) return auctions;
    return auctions.filter(auction => auction.category === selectedCategory);
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

  const featuredAuctions = [...auctions]
    .filter(auction => auction.bidders && auction.bidders > 0)
    .sort((a, b) => b.bidders - a.bidders)
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
          
          <div className="mb-4 rtl text-right">
            <span className="text-sm font-medium text-blue dark:text-blue-light">طريقة جديدة للمزايدة</span>
          </div>
          
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="lg:w-1/2 text-right rtl animate-fade-in order-2 lg:order-1">
              <h1 className="heading-xl mb-6">
                منصة <span className="text-blue dark:text-blue-light">مزاد فلسطين</span> للمزادات الإلكترونية
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
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-5 glass-morphism animate-slide-up">
            <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row items-center gap-4 rtl">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="ابحث عن منتجات، عقارات، سيارات..."
                  className="w-full py-3 px-5 pl-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="submit" className="absolute top-1/2 transform -translate-y-1/2 left-4">
                  <Search className="h-5 w-5 text-gray-400" />
                </button>
              </div>
              <select 
                className="py-3 px-5 rounded-xl bg-gray-100 dark:bg-gray-700 border-none w-full md:w-48 text-base focus:ring-2"
                onChange={(e) => setSelectedCategory(e.target.value || null)}
                value={selectedCategory || ""}
              >
                <option value="">كل الفئات</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-primary rounded-xl py-3 w-full md:w-auto md:px-8">
                بحث
              </button>
            </form>
          </div>
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
          ) : categories.length > 0 && (
            <CategoryCarousel
              categories={categories.map(category => ({
                id: category.id,
                name: category.name,
                imageUrl: category.imageUrl,
                count: category.listingsCount ?? 0,
                subcategories: category.subCategories?.map(sub => ({
                  id: sub.id,
                  name: sub.name,
                  count: sub.listingsCount ?? 0
                }))
              }))}
              selectedCategory={selectedCategory}
              onSelectCategory={handleCategorySelect}
            />
          )}
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
                  key={auction.auctionId ?? auction.id}
                  id={auction.auctionId ?? auction.id}
                  title={auction.name ?? auction.title}
                  description={auction.description ?? ""}
                  currentPrice={auction.currentBid > 0 ? auction.currentBid : auction.reservePrice}
                  minBidIncrement={auction.bidIncrement}
                  imageUrl={auction.imageUrl}
                  endTime={auction.endTime}
                  bidders={auction.bidsCount ?? auction.bidders}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-12 bg-gradient-to-r from-blue/5 to-green/5 dark:from-blue/10 dark:to-green/10">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8 rtl">
            <h2 className="heading-lg">عروض خاصة</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ads.map(ad => (
              <div key={ad.id} className="relative rounded-xl overflow-hidden shadow-lg">
                <Link to={ad.link}>
                  <div className="w-full h-full">
                    <AdCard
                      id={ad.id}
                      title={ad.title}
                      description={ad.description}
                      imageUrl={ad.imageUrl}
                      link={ad.link}
                      linkText={ad.linkText || "عرض التفاصيل"}
                    />
                  </div>
                </Link>
              </div>
            ))}
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
              <CategorySidebar
                categories={categories.map(cat => ({
                  ...cat,
                  icon: getCategoryIcon(cat.name),
                  count: cat.listingsCount || 0
                }))}
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
                  {filteredAuctions.map((auction) => (
                    <AuctionCard
                      key={auction.auctionId ?? auction.id}
                      id={auction.auctionId ?? auction.id}
                      title={auction.name ?? auction.title}
                      description={auction.description ?? ""}
                      currentPrice={auction.currentBid > 0 ? auction.currentBid : auction.reservePrice}
                      minBidIncrement={auction.bidIncrement}
                      imageUrl={auction.imageUrl}
                      endTime={auction.endTime}
                      bidders={auction.bidsCount ?? auction.bidders}
                    />
                  ))}
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

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block bg-blue/10 text-blue dark:bg-blue/20 dark:text-blue-light px-4 py-1 rounded-full text-sm font-medium mb-4">
              خطوات بسيطة
            </span>
            <h2 className="heading-lg mb-4">كيف تعمل منصة مزاد فلسطين؟</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              المزايدة على منصتنا سهلة وآمنة. اتبع هذه الخطوات البسيطة للبدء في المزايدة والفوز بالمنتجات التي ترغب بها.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 rtl">
            <HowItWorksCard
              number={1}
              title="إنشاء حساب"
              description="سجل حسابًا جديدًا وأضف معلوماتك الشخصية ووسائل الدفع الآمنة"
              icon={<User className="h-7 w-7" />}
            />
            <HowItWorksCard
              number={2}
              title="تصفح المزادات"
              description="استعرض المزادات النشطة واختر المنتجات التي تهمك للمزايدة عليها"
              icon={<Search className="h-7 w-7" />}
            />
            <HowItWorksCard
              number={3}
              title="قدم عرضك"
              description="ضع مزايدتك بسهولة وتابع حالة المزاد في الوقت الحقيقي"
              icon={<ArrowRight className="h-7 w-7" />}
            />
            <HowItWorksCard
              number={4}
              title="استلم مشترياتك"
              description="عند الفوز بالمزاد، أكمل عملية الدفع واستلم مشترياتك بكل سهولة"
              icon={<Package className="h-7 w-7" />}
            />
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-blue to-blue-dark text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="heading-lg mb-6">ابدأ المزايدة الآن واحصل على أفضل الصفقات</h2>
            <p className="text-white/80 mb-8 text-lg">
              انضم إلى الآلاف من المستخدمين الذين يستفيدون من منصتنا للحصول على منتجات بأسعار تنافسية
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth" className="px-8 py-3 bg-white text-blue hover:bg-gray-100 transition-colors duration-300 rounded-lg font-medium shadow-lg">
                إنشاء حساب
              </Link>
              <Link to="/how-it-works" className="px-8 py-3 bg-transparent border-2 border-white hover:bg-white/10 transition-colors duration-300 rounded-lg font-medium">
                معرفة المزيد
              </Link>
            </div>
          </div>
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
