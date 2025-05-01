
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Search, Filter, SlidersHorizontal, Building2, Car, Smartphone, Sofa, Gem, BookOpen, Camera, Baby, Coffee, Shirt, Utensils, Dumbbell, ChevronLeft } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import AuctionCard from "@/components/ui/AuctionCard";
import { useIsMobile } from "@/hooks/use-mobile";

const Categories = () => {
  const { category } = useParams<{ category?: string }>();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<string>("ending-soon");
  const isMobile = useIsMobile();
  
  // Mock data for categories
  const categories = [
    {
      id: "accessories",
      name: "إكسسوارات",
      icon: <Gem className="h-6 w-6" />,
      count: 950,
      image: "public/lovable-uploads/e9a29170-25e6-4571-9071-208edd24b830.png",
      description: "ساعات ومجوهرات وإكسسوارات"
    },
    {
      id: "clothing",
      name: "أزياء",
      icon: <Shirt className="h-6 w-6" />,
      count: 2800,
      image: "https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      description: "ملابس رجالية ونسائية وأطفال"
    },
    {
      id: "electronics",
      name: "إلكترونيات",
      icon: <Smartphone className="h-6 w-6" />,
      count: 1250,
      image: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      description: "هواتف ذكية أجهزة لوحية وإكسسوارات"
    },
    {
      id: "real-estate",
      name: "العقارات",
      icon: <Building2 className="h-6 w-6" />,
      count: 24,
      image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      description: "شقق وأراضي وعقارات تجارية"
    },
    {
      id: "vehicles",
      name: "المركبات",
      icon: <Car className="h-6 w-6" />,
      count: 36,
      image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      description: "سيارات ودراجات نارية وشاحنات"
    },
    {
      id: "furniture",
      name: "الأثاث",
      icon: <Sofa className="h-6 w-6" />,
      count: 18,
      image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      description: "أثاث منزلي ومكتبي وديكورات"
    },
    {
      id: "antiques",
      name: "التحف والمقتنيات",
      icon: <Gem className="h-6 w-6" />,
      count: 15,
      image: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      description: "قطع أثرية ومقتنيات نادرة"
    },
    {
      id: "books",
      name: "الكتب والمجلات",
      icon: <BookOpen className="h-6 w-6" />,
      count: 28,
      image: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      description: "كتب وروايات ومجلات متنوعة"
    },
    {
      id: "cameras",
      name: "الكاميرات",
      icon: <Camera className="h-6 w-6" />,
      count: 14,
      image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      description: "كاميرات وعدسات وملحقات تصوير"
    },
    {
      id: "baby",
      name: "مستلزمات الأطفال",
      icon: <Baby className="h-6 w-6" />,
      count: 21,
      image: "https://images.unsplash.com/photo-1580447083815-3d435861b7e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      description: "ألعاب وملابس ومستلزمات الأطفال"
    },
    {
      id: "household",
      name: "مستلزمات منزلية",
      icon: <Coffee className="h-6 w-6" />,
      count: 32,
      image: "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      description: "أدوات ومستلزمات المنزل"
    },
    {
      id: "sports",
      name: "الرياضة واللياقة",
      icon: <Dumbbell className="h-6 w-6" />,
      count: 19,
      image: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      description: "معدات رياضية وملابس ومستلزمات"
    },
  ];

  // Mock auctions data
  const mockAuctions = [
    {
      id: "1",
      title: "شقة فاخرة في رام الله",
      description: "شقة حديثة بمساحة 150 متر مربع، 3 غرف نوم، إطلالة رائعة وموقع متميز",
      currentPrice: 120000,
      minBidIncrement: 5000,
      imageUrl: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
      bidders: 5,
      isPopular: true,
      category: "real-estate",
      subcategory: "apartments",
    },
    {
      id: "2",
      title: "سيارة مرسيدس E200 موديل 2019",
      description: "بحالة ممتازة، ماشية 45,000 كم، صيانة دورية بالوكالة، لون أسود",
      currentPrice: 38000,
      minBidIncrement: 1000,
      imageUrl: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 12),
      bidders: 8,
      isPopular: true,
      category: "vehicles",
      subcategory: "cars",
    },
    {
      id: "3",
      title: "iPhone 13 Pro Max - 256GB",
      description: "جهاز بحالة ممتازة، مع جميع الملحقات الأصلية والضمان",
      currentPrice: 3200,
      minBidIncrement: 100,
      imageUrl: "https://images.unsplash.com/photo-1606041011872-596597976b25?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      endTime: new Date(Date.now() + 1000 * 60 * 30),
      bidders: 12,
      category: "electronics",
      subcategory: "mobile",
    },
    {
      id: "4",
      title: "طقم كنب مودرن",
      description: "قماش مستورد فاخر، لون رمادي، يتضمن 3 مقاعد و 2 فردي",
      currentPrice: 1800,
      minBidIncrement: 100,
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 48),
      bidders: 3,
      category: "furniture",
    },
    {
      id: "5",
      title: "ساعة رولكس قديمة (1980)",
      description: "قطعة نادرة للهواة، حالة ممتازة، تعمل بدقة",
      currentPrice: 7500,
      minBidIncrement: 500,
      imageUrl: "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 72),
      bidders: 7,
      isPopular: true,
      category: "antiques",
    },
    {
      id: "6",
      title: "قطعة أرض في بيت لحم",
      description: "مساحة 500 متر مربع، طابو، تصلها جميع الخدمات",
      currentPrice: 85000,
      minBidIncrement: 5000,
      imageUrl: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 5),
      bidders: 4,
      category: "real-estate",
      subcategory: "lands",
    },
    {
      id: "7",
      title: "لابتوب ماك بوك برو 16 بوصة",
      description: "معالج M1 Pro، رام 16GB، تخزين 512GB SSD",
      currentPrice: 4800,
      minBidIncrement: 200,
      imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 8),
      bidders: 9,
      category: "electronics",
      subcategory: "computers",
    },
    {
      id: "8",
      title: "طاولة طعام خشب زان",
      description: "صناعة يدوية فلسطينية، تتسع لـ 8 أشخاص، مع 8 كراسي",
      currentPrice: 1500,
      minBidIncrement: 100,
      imageUrl: "https://images.unsplash.com/photo-1594224457860-23f361ca2128?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 36),
      bidders: 2,
      category: "furniture",
    },
    {
      id: "9",
      title: "مجموعة كتب نادرة عن تاريخ فلسطين",
      description: "مجموعة من 5 كتب قديمة ونادرة تتناول تاريخ فلسطين في القرن العشرين",
      currentPrice: 950,
      minBidIncrement: 50,
      imageUrl: "https://images.unsplash.com/photo-1550399105-c4db5fb85c18?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2),
      bidders: 6,
      category: "books",
    },
    {
      id: "10",
      title: "كاميرا كانون EOS R5 احترافية",
      description: "كاميرا جديدة، دقة 45 ميجابكسل، تصوير 8K، مع عدسة 24-105mm",
      currentPrice: 8700,
      minBidIncrement: 300,
      imageUrl: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 48),
      bidders: 11,
      category: "cameras",
    },
    {
      id: "11",
      title: "سرير أطفال خشبي مع مرتبة",
      description: "سرير أطفال خشب زان، مناسب للأطفال من عمر سنة إلى 7 سنوات، مع مرتبة طبية",
      currentPrice: 750,
      minBidIncrement: 50,
      imageUrl: "https://images.unsplash.com/photo-1580447083815-3d435861b7e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
      bidders: 4,
      category: "baby",
    },
    {
      id: "12",
      title: "ماكينة قهوة احترافية",
      description: "ماكينة قهوة إيطالية، تدعم الاسبريسو والكابتشينو واللاتيه، مع مطحنة بن",
      currentPrice: 2300,
      minBidIncrement: 100,
      imageUrl: "https://images.unsplash.com/photo-1517142089942-ba376ce32a2e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=60",
      endTime: new Date(Date.now() + 1000 * 60 * 60 * 36),
      bidders: 7,
      category: "household",
    }
  ];

  // Filter auctions based on selected category
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      let filteredAuctions = [...mockAuctions];
      
      if (category) {
        filteredAuctions = mockAuctions.filter(auction => auction.category === category);
      }
      
      // Sort based on selection
      if (sortBy === "ending-soon") {
        filteredAuctions.sort((a, b) => a.endTime.getTime() - b.endTime.getTime());
      } else if (sortBy === "price-low") {
        filteredAuctions.sort((a, b) => a.currentPrice - b.currentPrice);
      } else if (sortBy === "price-high") {
        filteredAuctions.sort((a, b) => b.currentPrice - a.currentPrice);
      } else if (sortBy === "most-bids") {
        filteredAuctions.sort((a, b) => b.bidders - a.bidders);
      }
      
      // Filter by price range
      filteredAuctions = filteredAuctions.filter(
        auction => auction.currentPrice >= priceRange[0] && auction.currentPrice <= priceRange[1]
      );
      
      setAuctions(filteredAuctions);
      setLoading(false);
    }, 1000);
  }, [category, sortBy, priceRange]);

  const selectedCategory = categories.find(c => c.id === category);

  return (
    <PageWrapper>
      <div className="container mx-auto px-4">
        {/* Breadcrumbs */}
        <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6 rtl mt-4">
          <Link to="/" className="hover:text-blue dark:hover:text-blue-light">الرئيسية</Link>
          <span className="mx-2">›</span>
          {category ? (
            <>
              <Link to="/categories" className="hover:text-blue dark:hover:text-blue-light">التصنيفات</Link>
              <span className="mx-2">›</span>
              <span className="text-gray-900 dark:text-gray-100">{selectedCategory?.name || category}</span>
            </>
          ) : (
            <span className="text-gray-900 dark:text-gray-100">التصنيفات</span>
          )}
        </div>
        
        {/* Page Header */}
        <div className="mb-8 rtl">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {category ? selectedCategory?.name || category : "تصفح جميع التصنيفات"}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
            {category
              ? `تصفح المزادات المتاحة ضمن تصنيف ${selectedCategory?.name || category}`
              : "استعرض مزادات من مختلف التصنيفات واعثر على ما تبحث عنه"}
          </p>
        </div>
        
        {!category ? (
          // Categories Grid View - Similar to the reference image
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 rtl mb-16">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                to={`/categories/${cat.id}`}
                className="group relative rounded-2xl overflow-hidden h-72 md:h-80 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                {/* Background Image */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/80">
                  <img 
                    src={cat.image} 
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                  />
                </div>
                
                {/* Category Icon */}
                <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <div className="text-white">
                    {cat.icon}
                  </div>
                </div>
                
                {/* Category Info */}
                <div className="absolute bottom-0 right-0 left-0 p-6 flex flex-col items-start">
                  <h3 className="text-2xl font-bold text-white mb-2 group-hover:translate-y-0 transition-transform duration-300">{cat.name}</h3>
                  <p className="text-white/80 mb-3 text-sm tracking-wide line-clamp-2">
                    {cat.description}
                  </p>
                  <div className="flex justify-between items-center w-full">
                    <span className="text-white/90 text-sm font-medium">{cat.count} منتج</span>
                    <div className="flex items-center bg-white/20 backdrop-blur-sm rounded-full py-1 px-3 text-white text-sm">
                      <span className="ml-1">تصفح</span>
                      <ChevronLeft className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          // Category Detail View with Auctions
          <div>
            {/* Search and Filters */}
            <div className="mb-8 rtl">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="ابحث عن منتجات..."
                    className="w-full py-3 px-5 pl-12 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base"
                  />
                  <Search className="absolute top-1/2 transform -translate-y-1/2 left-4 h-5 w-5 text-gray-400" />
                </div>
                <div className="flex gap-2">
                  <select 
                    className="py-3 px-5 rounded-xl bg-gray-100 dark:bg-gray-700 border-none text-base w-full md:w-48"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="ending-soon">ينتهي قريباً</option>
                    <option value="price-low">السعر: من الأقل</option>
                    <option value="price-high">السعر: من الأعلى</option>
                    <option value="most-bids">الأكثر مزايدة</option>
                  </select>
                  <button 
                    className="py-3 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    <Filter className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {showFilters && (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 mb-4">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <h3 className="font-medium mb-2 flex items-center gap-2">
                        <SlidersHorizontal className="h-4 w-4" />
                        <span>نطاق السعر</span>
                      </h3>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                          className="w-28 py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 border-none text-sm"
                          placeholder="الحد الأدنى"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                          className="w-28 py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 border-none text-sm"
                          placeholder="الحد الأقصى"
                        />
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        className="btn-primary py-2 px-4 rounded-lg text-sm"
                        onClick={() => setShowFilters(false)}
                      >
                        تطبيق الفلترة
                      </button>
                      <button 
                        className="btn-secondary py-2 px-4 rounded-lg text-sm"
                        onClick={() => {
                          setPriceRange([0, 10000]);
                          setSortBy("ending-soon");
                        }}
                      >
                        إعادة تعيين
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
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
            ) : auctions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {auctions.map((auction) => (
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
                    isPopular={auction.isPopular}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <Filter className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold mb-2">لم يتم العثور على مزادات</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6 text-center max-w-md">
                  لم نتمكن من العثور على مزادات تطابق معايير البحث الخاصة بك. يرجى تجربة معايير مختلفة.
                </p>
                <button 
                  className="btn-primary py-2 px-6 rounded-lg"
                  onClick={() => {
                    setPriceRange([0, 10000]);
                    setSortBy("ending-soon");
                  }}
                >
                  إعادة تعيين الفلاتر
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default Categories;
