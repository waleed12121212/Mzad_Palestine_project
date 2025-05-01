
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Filter, ShoppingCart, ChevronDown, Search, Loader2, Sliders, Check, SlidersHorizontal, X, Star } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import PageWrapper from "@/components/layout/PageWrapper";

interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  rating: number;
  inStock: boolean;
  category: string;
  featured: boolean;
  brand?: string;
  discount?: number;
}

const BuyNow = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState(0);
  const navigate = useNavigate();

  // Load products
  useEffect(() => {
    const loadProducts = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample data
      const sampleProducts: Product[] = [
        {
          id: "101",
          title: "هاتف سامسونج جالاكسي S22",
          description: "هاتف ذكي بشاشة 6.1 بوصة، ذاكرة داخلية 128GB، رام 8GB",
          price: 2499,
          imageUrl: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?q=80&w=2342&auto=format&fit=crop",
          rating: 4.7,
          inStock: true,
          category: "electronics",
          featured: true,
          brand: "Samsung",
          discount: 10
        },
        {
          id: "102",
          title: "حقيبة جلدية فاخرة",
          description: "حقيبة يد نسائية من الجلد الطبيعي بتصميم عصري وأنيق",
          price: 899,
          imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=2340&auto=format&fit=crop",
          rating: 4.5,
          inStock: true,
          category: "fashion",
          featured: false,
          brand: "Louis Vuitton"
        },
        {
          id: "103",
          title: "طقم أواني طهي استانلس ستيل",
          description: "مجموعة من 10 قطع من أواني الطهي المصنوعة من الاستانلس ستيل عالي الجودة",
          price: 1299,
          imageUrl: "https://images.unsplash.com/photo-1620865266196-a7f7486ff72a?q=80&w=2232&auto=format&fit=crop",
          rating: 4.8,
          inStock: true,
          category: "home",
          featured: true,
          brand: "Tefal",
          discount: 15
        },
        {
          id: "104",
          title: "سماعة بلوتوث لاسلكية",
          description: "سماعة رأس لاسلكية مع خاصية إلغاء الضوضاء وبطارية تدوم طويلًا",
          price: 599,
          imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=2265&auto=format&fit=crop",
          rating: 4.6,
          inStock: true,
          category: "electronics",
          featured: false,
          brand: "Sony"
        },
        {
          id: "105",
          title: "كرسي مكتب بتصميم مريح",
          description: "كرسي مكتب متعدد الوضعيات مع دعم لأسفل الظهر ومساند للذراعين",
          price: 1799,
          imageUrl: "https://images.unsplash.com/photo-1596162954151-cdcb4c0f70a8?q=80&w=2187&auto=format&fit=crop",
          rating: 4.4,
          inStock: false,
          category: "furniture",
          featured: true,
          brand: "IKEA"
        },
        {
          id: "106",
          title: "طاولة طعام خشبية",
          description: "طاولة طعام مصنوعة من خشب السنديان الطبيعي تتسع لـ 6 أشخاص",
          price: 3499,
          imageUrl: "https://images.unsplash.com/photo-1577140917170-285929fb55b7?q=80&w=2340&auto=format&fit=crop",
          rating: 4.9,
          inStock: true,
          category: "furniture",
          featured: true,
          brand: "Ashley",
          discount: 5
        },
        {
          id: "107",
          title: "ساعة يد رجالية فاخرة",
          description: "ساعة يد أنيقة مع حزام جلدي وميناء مقاوم للخدش",
          price: 1299,
          imageUrl: "https://images.unsplash.com/photo-1539874754764-5a96559165b0?q=80&w=2342&auto=format&fit=crop",
          rating: 4.5,
          inStock: true,
          category: "accessories",
          featured: false,
          brand: "Rolex"
        },
        {
          id: "108",
          title: "نظارة شمسية كلاسيكية",
          description: "نظارة شمسية بإطار معدني وعدسات مستقطبة لحماية العين من الأشعة فوق البنفسجية",
          price: 499,
          imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=2160&auto=format&fit=crop",
          rating: 4.3,
          inStock: true,
          category: "accessories",
          featured: false,
          brand: "Ray-Ban"
        }
      ];
      
      setProducts(sampleProducts);
      setIsLoading(false);
    };
    
    loadProducts();
  }, []);

  useEffect(() => {
    // Count active filters
    let count = 0;
    if (priceRange[0] > 0 || priceRange[1] < 5000) count++;
    if (selectedCategories.length > 0) count++;
    if (selectedBrands.length > 0) count++;
    if (onlyInStock) count++;
    if (minRating > 0) count++;
    
    setActiveFilters(count);
  }, [priceRange, selectedCategories, selectedBrands, onlyInStock, minRating]);

  // Filter products based on all criteria
  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchQuery && !product.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !product.description.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Price range filter
    if (product.price < priceRange[0] || product.price > priceRange[1]) {
      return false;
    }
    
    // Category filter
    if (selectedCategories.length > 0 && !selectedCategories.includes(product.category)) {
      return false;
    }
    
    // Brand filter
    if (selectedBrands.length > 0 && product.brand && !selectedBrands.includes(product.brand)) {
      return false;
    }
    
    // In stock filter
    if (onlyInStock && !product.inStock) {
      return false;
    }
    
    // Rating filter
    if (product.rating < minRating) {
      return false;
    }
    
    return true;
  });

  const featuredProducts = filteredProducts.filter(product => product.featured);
  
  const handlePriceChange = (values: number[]) => {
    setPriceRange(values);
  };
  
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category) 
        : [...prev, category]
    );
  };
  
  const handleBrandToggle = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand) 
        : [...prev, brand]
    );
  };
  
  const handleRatingFilter = (rating: number) => {
    setMinRating(rating === minRating ? 0 : rating);
  };
  
  const clearAllFilters = () => {
    setPriceRange([0, 5000]);
    setSelectedCategories([]);
    setSelectedBrands([]);
    setOnlyInStock(false);
    setMinRating(0);
    setSearchQuery("");
  };
  
  const handleBuyNow = (productId: string) => {
    toast({
      title: "تمت إضافة المنتج إلى سلة التسوق",
      description: "يمكنك الآن متابعة عملية الشراء",
    });
    
    // التنقل لصفحة الدفع
    navigate('/checkout');
  };

  // استخراج الفئات والعلامات التجارية الفريدة
  const categories = [...new Set(products.map(product => product.category))];
  const brands = [...new Set(products.filter(p => p.brand).map(product => product.brand as string))];

  // تحويل أسماء الفئات من الإنجليزية إلى العربية
  const categoryNameMap: Record<string, string> = {
    'electronics': 'الإلكترونيات',
    'fashion': 'الأزياء',
    'home': 'المنزل والحديقة',
    'furniture': 'الأثاث',
    'accessories': 'الإكسسوارات'
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8 rtl">
          <h1 className="text-2xl font-bold">الشراء الفوري</h1>
          
          <div className="flex gap-2">
            {/* Mobile Filters Button */}
            <Sheet>
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-1 md:hidden relative"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  <span>الفلاتر</span>
                  {activeFilters > 0 && (
                    <Badge className="h-5 w-5 p-0 flex items-center justify-center absolute -top-2 -right-2 bg-blue text-white">
                      {activeFilters}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] rtl overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold">الفلاتر</h3>
                  {activeFilters > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllFilters}
                      className="h-8 px-2 text-xs"
                    >
                      مسح الكل
                    </Button>
                  )}
                </div>
                
                <div className="space-y-6">
                  {/* فلتر الفئات */}
                  <div>
                    <h4 className="font-medium mb-3">الفئات</h4>
                    <div className="space-y-2">
                      {categories.map(category => (
                        <div key={category} className="flex items-center gap-2">
                          <Checkbox 
                            id={`mobile-category-${category}`} 
                            checked={selectedCategories.includes(category)}
                            onCheckedChange={() => handleCategoryToggle(category)}
                          />
                          <label htmlFor={`mobile-category-${category}`} className="text-sm cursor-pointer">
                            {categoryNameMap[category] || category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* فلتر العلامات التجارية */}
                  <div>
                    <h4 className="font-medium mb-3">العلامات التجارية</h4>
                    <div className="space-y-2">
                      {brands.map(brand => (
                        <div key={brand} className="flex items-center gap-2">
                          <Checkbox 
                            id={`mobile-brand-${brand}`} 
                            checked={selectedBrands.includes(brand)}
                            onCheckedChange={() => handleBrandToggle(brand)}
                          />
                          <label htmlFor={`mobile-brand-${brand}`} className="text-sm cursor-pointer">
                            {brand}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* فلتر نطاق السعر */}
                  <div>
                    <h4 className="font-medium mb-3">نطاق السعر</h4>
                    <Slider 
                      value={priceRange}
                      max={5000}
                      step={100}
                      onValueChange={handlePriceChange}
                      className="my-6"
                    />
                    <div className="flex justify-between">
                      <span>{priceRange[0]} ₪</span>
                      <span>{priceRange[1]} ₪</span>
                    </div>
                  </div>
                  
                  {/* فلتر التوفر */}
                  <div>
                    <div className="flex items-center gap-2">
                      <Checkbox 
                        id="mobile-in-stock" 
                        checked={onlyInStock}
                        onCheckedChange={(checked) => setOnlyInStock(!!checked)}
                      />
                      <label htmlFor="mobile-in-stock" className="text-sm cursor-pointer">
                        متوفر في المخزن فقط
                      </label>
                    </div>
                  </div>
                  
                  {/* فلتر التقييم */}
                  <div>
                    <h4 className="font-medium mb-3">التقييم</h4>
                    <div className="space-y-2">
                      {[5, 4, 3, 2, 1].map(rating => (
                        <div 
                          key={rating} 
                          className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${minRating === rating ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                          onClick={() => handleRatingFilter(rating)}
                        >
                          <div className="flex items-center">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm">و أعلى</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Active Filters Count - Desktop */}
            {activeFilters > 0 && (
              <Button 
                variant="outline" 
                className="hidden md:flex items-center gap-2"
                onClick={clearAllFilters}
              >
                <X className="h-4 w-4" />
                <span>مسح الفلاتر ({activeFilters})</span>
              </Button>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Filters - Desktop */}
          <div className="hidden md:block md:w-1/4 sticky top-24 h-fit bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 rtl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold">الفلاتر</h3>
              {activeFilters > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearAllFilters}
                  className="h-8 px-2 text-xs"
                >
                  مسح الكل
                </Button>
              )}
            </div>
            
            <div className="space-y-6">
              {/* فلتر الفئات */}
              <div>
                <h4 className="font-medium mb-3">الفئات</h4>
                <div className="space-y-2">
                  {categories.map(category => (
                    <div key={category} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id={`category-${category}`} 
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => handleCategoryToggle(category)}
                        />
                        <label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                          {categoryNameMap[category] || category}
                        </label>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {products.filter(p => p.category === category).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* فلتر العلامات التجارية */}
              <div>
                <h4 className="font-medium mb-3">العلامات التجارية</h4>
                <div className="space-y-2">
                  {brands.map(brand => (
                    <div key={brand} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox 
                          id={`brand-${brand}`} 
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => handleBrandToggle(brand)}
                        />
                        <label htmlFor={`brand-${brand}`} className="text-sm cursor-pointer">
                          {brand}
                        </label>
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {products.filter(p => p.brand === brand).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              
              {/* فلتر نطاق السعر */}
              <div>
                <h4 className="font-medium mb-3">نطاق السعر</h4>
                <Slider 
                  value={priceRange}
                  max={5000}
                  step={100}
                  onValueChange={handlePriceChange}
                  className="my-6"
                />
                <div className="flex justify-between">
                  <span>{priceRange[0]} ₪</span>
                  <span>{priceRange[1]} ₪</span>
                </div>
              </div>
              
              {/* فلتر التوفر */}
              <div>
                <div className="flex items-center gap-2">
                  <Checkbox 
                    id="in-stock" 
                    checked={onlyInStock}
                    onCheckedChange={(checked) => setOnlyInStock(!!checked)}
                  />
                  <label htmlFor="in-stock" className="text-sm cursor-pointer">
                    متوفر في المخزن فقط
                  </label>
                </div>
              </div>
              
              {/* فلتر التقييم */}
              <div>
                <h4 className="font-medium mb-3">التقييم</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => (
                    <div 
                      key={rating} 
                      className={`flex items-center gap-2 p-2 rounded-md cursor-pointer ${minRating === rating ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      onClick={() => handleRatingFilter(rating)}
                    >
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm">و أعلى</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="md:w-3/4">
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ابحث عن منتجات..."
                  className="w-full py-3 px-4 pr-12 rounded-lg bg-gray-100 dark:bg-gray-800 border-none text-base rtl"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute top-1/2 transform -translate-y-1/2 right-4 h-5 w-5 text-gray-400" />
              </div>
            </div>
            
            {/* Active Filters */}
            {activeFilters > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 rtl">
                {priceRange[0] > 0 || priceRange[1] < 5000 ? (
                  <Badge variant="outline" className="flex items-center gap-1 py-1 px-3">
                    <span>السعر: {priceRange[0]} - {priceRange[1]} ₪</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setPriceRange([0, 5000])}
                    />
                  </Badge>
                ) : null}
                
                {selectedCategories.map(category => (
                  <Badge key={category} variant="outline" className="flex items-center gap-1 py-1 px-3">
                    <span>{categoryNameMap[category] || category}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleCategoryToggle(category)}
                    />
                  </Badge>
                ))}
                
                {selectedBrands.map(brand => (
                  <Badge key={brand} variant="outline" className="flex items-center gap-1 py-1 px-3">
                    <span>{brand}</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => handleBrandToggle(brand)}
                    />
                  </Badge>
                ))}
                
                {onlyInStock && (
                  <Badge variant="outline" className="flex items-center gap-1 py-1 px-3">
                    <span>متوفر في المخزن</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setOnlyInStock(false)}
                    />
                  </Badge>
                )}
                
                {minRating > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1 py-1 px-3">
                    <span>التقييم: {minRating}+ نجوم</span>
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => setMinRating(0)}
                    />
                  </Badge>
                )}
              </div>
            )}
            
            {/* Featured Products */}
            {!isLoading && featuredProducts.length > 0 && (
              <div className="mb-10">
                <h2 className="text-xl font-bold mb-4 rtl">منتجات مميزة</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProducts.map((product) => (
                    <ProductCard 
                      key={product.id} 
                      product={product} 
                      onBuyNow={handleBuyNow} 
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* All Products */}
            <h2 className="text-xl font-bold mb-4 rtl">جميع المنتجات</h2>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-12 w-12 text-blue animate-spin mb-4" />
                <p className="text-gray-500 dark:text-gray-400">جاري تحميل المنتجات...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    onBuyNow={handleBuyNow} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <Search className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">لم يتم العثور على منتجات</p>
                <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">جرّب تعديل الفلاتر للحصول على نتائج</p>
                <Button variant="outline" onClick={clearAllFilters}>
                  مسح جميع الفلاتر
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
};

// Product Card Component
const ProductCard: React.FC<{ 
  product: Product; 
  onBuyNow: (id: string) => void;
}> = ({ product, onBuyNow }) => {
  const navigate = useNavigate();
  
  const discountedPrice = product.discount 
    ? Math.round(product.price * (1 - product.discount / 100)) 
    : product.price;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden hover:shadow-md transition-shadow duration-300">
      <div 
        className="h-48 overflow-hidden cursor-pointer relative"
        onClick={() => navigate(`/product/${product.id}`)}
      >
        <img 
          src={product.imageUrl} 
          alt={product.title} 
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        {product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {product.discount}% خصم
          </div>
        )}
      </div>
      
      <div className="p-4 rtl">
        <h3 
          className="font-bold mb-1 cursor-pointer hover:text-blue dark:hover:text-blue-light transition-colors"
          onClick={() => navigate(`/product/${product.id}`)}
        >
          {product.title}
        </h3>
        
        <div className="flex items-center mb-2">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
            ({product.rating})
          </span>
        </div>
        
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
          {product.description}
        </p>
        
        <div className="flex justify-between items-center">
          <div>
            {product.discount ? (
              <div className="flex flex-col">
                <span className="font-bold text-lg">
                  {discountedPrice} ₪
                </span>
                <span className="text-gray-500 line-through text-sm">
                  {product.price} ₪
                </span>
              </div>
            ) : (
              <div className="font-bold text-lg">
                {product.price} ₪
              </div>
            )}
          </div>
          
          <Button 
            onClick={() => onBuyNow(product.id)}
            className="bg-blue hover:bg-blue-dark text-white"
            disabled={!product.inStock}
          >
            {product.inStock ? "شراء الآن" : "غير متوفر"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BuyNow;
