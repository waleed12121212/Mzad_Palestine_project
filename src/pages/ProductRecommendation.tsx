
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Laptop, 
  Smartphone, 
  Camera, 
  Headphones, 
  Tag, 
  BatteryCharging, 
  Weight, 
  Heart, 
  Star, 
  ArrowRight, 
  ChevronRight,
  CheckCircle2,
  ShoppingCart
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import PageWrapper from "@/components/layout/PageWrapper";

// Mock database of products
const productsDatabase = [
  {
    id: 1,
    name: "MacBook Pro 14 M2 Pro",
    category: "laptop",
    usage: ["design", "programming", "office", "gaming"],
    price: 1999,
    specs: {
      weight: "light", // 1.6kg
      battery: "excellent", // 18 hours
      performance: "high",
      display: "excellent"
    },
    brands: ["apple"],
    imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=2426&auto=format&fit=crop",
    description: "أحدث إصدارات ماك بوك برو مع معالج M2 وأداء خارق للمهام الإبداعية والبرمجية",
    rating: 4.9
  },
  {
    id: 2,
    name: "Dell XPS 15",
    category: "laptop",
    usage: ["design", "programming", "office", "gaming"],
    price: 1599,
    specs: {
      weight: "medium", // 1.9kg
      battery: "good", // 12 hours
      performance: "high",
      display: "excellent"
    },
    brands: ["dell"],
    imageUrl: "https://images.unsplash.com/photo-1593642702749-b7d2a804fbcf?q=80&w=2276&auto=format&fit=crop",
    description: "لابتوب راقي مع شاشة عالية الدقة ومعالج قوي مناسب للمصممين والمحترفين",
    rating: 4.7
  },
  {
    id: 3,
    name: "Lenovo ThinkPad X1 Carbon",
    category: "laptop",
    usage: ["office", "programming"],
    price: 1299,
    specs: {
      weight: "light", // 1.1kg
      battery: "excellent", // 15 hours
      performance: "medium",
      display: "good"
    },
    brands: ["lenovo"],
    imageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?q=80&w=2448&auto=format&fit=crop",
    description: "لابتوب خفيف الوزن ممتاز للأعمال المكتبية والتنقل مع بطارية طويلة العمر",
    rating: 4.6
  },
  {
    id: 4,
    name: "ASUS ROG Zephyrus G14",
    category: "laptop",
    usage: ["gaming", "design"],
    price: 1399,
    specs: {
      weight: "medium", // 1.7kg
      battery: "good", // 10 hours
      performance: "very high",
      display: "excellent"
    },
    brands: ["asus"],
    imageUrl: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?q=80&w=2268&auto=format&fit=crop",
    description: "لابتوب مخصص للألعاب مع معالج رسومات متطور وتبريد فعال للأداء المستمر",
    rating: 4.8
  },
  {
    id: 5,
    name: "iPhone 15 Pro",
    category: "smartphone",
    usage: ["photography", "gaming", "communication"],
    price: 999,
    specs: {
      weight: "light", // 187g
      battery: "good", // 12 hours
      performance: "high",
      camera: "excellent"
    },
    brands: ["apple"],
    imageUrl: "https://images.unsplash.com/photo-1696446702144-ee935ca5bba9?q=80&w=2487&auto=format&fit=crop",
    description: "أحدث هواتف آيفون مع كاميرا متطورة ومعالج A17 Pro للأداء الاستثنائي",
    rating: 4.8
  },
  {
    id: 6,
    name: "Samsung Galaxy S23 Ultra",
    category: "smartphone",
    usage: ["photography", "gaming", "communication"],
    price: 1199,
    specs: {
      weight: "medium", // 234g
      battery: "excellent", // 24 hours
      performance: "very high",
      camera: "excellent"
    },
    brands: ["samsung"],
    imageUrl: "https://images.unsplash.com/photo-1675366748025-a4a8306e1ca8?q=80&w=2316&auto=format&fit=crop",
    description: "هاتف رائد مع قلم S Pen وكاميرا بدقة 200 ميجابكسل وشاشة AMOLED مذهلة",
    rating: 4.9
  },
  {
    id: 7,
    name: "Google Pixel 7 Pro",
    category: "smartphone",
    usage: ["photography", "communication"],
    price: 899,
    specs: {
      weight: "medium", // 212g
      battery: "good", // 15 hours
      performance: "high",
      camera: "excellent"
    },
    brands: ["google"],
    imageUrl: "https://images.unsplash.com/photo-1667202374078-5c79d4a5fe0e?q=80&w=2360&auto=format&fit=crop",
    description: "هاتف بكاميرا متفوقة مدعومة بالذكاء الاصطناعي من جوجل وتجربة اندرويد نقية",
    rating: 4.7
  },
  {
    id: 8,
    name: "Canon EOS R6",
    category: "camera",
    usage: ["photography", "videography"],
    price: 2499,
    specs: {
      weight: "medium", // 680g
      battery: "good", // 500 shots
      performance: "excellent",
      resolution: "20MP"
    },
    brands: ["canon"],
    imageUrl: "https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=2451&auto=format&fit=crop",
    description: "كاميرا احترافية بدون مرآة مع نظام تثبيت متطور وتصوير 4K بجودة عالية",
    rating: 4.8
  },
  {
    id: 9,
    name: "Sony WH-1000XM5",
    category: "headphones",
    usage: ["music", "calls", "travel"],
    price: 399,
    specs: {
      weight: "light", // 250g
      battery: "excellent", // 30 hours
      performance: "excellent",
      noiseCancel: "excellent"
    },
    brands: ["sony"],
    imageUrl: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?q=80&w=2788&auto=format&fit=crop",
    description: "سماعات لاسلكية متطورة مع إلغاء ضوضاء رائد وجودة صوت استثنائية",
    rating: 4.9
  },
  {
    id: 10,
    name: "Bose QuietComfort 45",
    category: "headphones",
    usage: ["music", "calls", "travel"],
    price: 329,
    specs: {
      weight: "light", // 240g
      battery: "good", // 24 hours
      performance: "excellent",
      noiseCancel: "excellent"
    },
    brands: ["bose"],
    imageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=2265&auto=format&fit=crop",
    description: "سماعات مريحة للاستخدام اليومي مع تقنية إلغاء ضوضاء محسنة وصوت متوازن",
    rating: 4.7
  }
];

const ProductRecommendation = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({
    category: "",
    usage: "",
    priceRange: [0, 3000],
    weightPreference: "",
    batteryPreference: "",
    brandPreferences: [] as string[]
  });
  const [recommendations, setRecommendations] = useState<any[]>([]);

  const handleCategorySelect = (category: string) => {
    setAnswers(prev => ({ ...prev, category }));
    setStep(2);
  };

  const handleUsageSelect = (usage: string) => {
    setAnswers(prev => ({ ...prev, usage }));
    setStep(3);
  };

  const handlePriceRangeChange = (values: number[]) => {
    setAnswers(prev => ({ ...prev, priceRange: values }));
  };

  const handleWeightPreference = (weight: string) => {
    setAnswers(prev => ({ ...prev, weightPreference: weight }));
  };

  const handleBatteryPreference = (battery: string) => {
    setAnswers(prev => ({ ...prev, batteryPreference: battery }));
  };

  const handleBrandToggle = (brand: string) => {
    setAnswers(prev => {
      const brands = [...prev.brandPreferences];
      if (brands.includes(brand)) {
        return { ...prev, brandPreferences: brands.filter(b => b !== brand) };
      } else {
        return { ...prev, brandPreferences: [...brands, brand] };
      }
    });
  };

  const generateRecommendations = () => {
    // Filter products based on user preferences
    let filtered = productsDatabase.filter(product => {
      // Filter by category
      if (answers.category && product.category !== answers.category) return false;
      
      // Filter by usage
      if (answers.usage && !product.usage.includes(answers.usage)) return false;
      
      // Filter by price range
      if (product.price < answers.priceRange[0] || product.price > answers.priceRange[1]) return false;
      
      // Filter by brand preferences if any are selected
      if (answers.brandPreferences.length > 0 && !answers.brandPreferences.some(brand => product.brands.includes(brand))) {
        return false;
      }
      
      // Additional filters for weight and battery if specified
      if (answers.weightPreference && product.specs.weight !== answers.weightPreference) return false;
      if (answers.batteryPreference && product.specs.battery !== answers.batteryPreference) return false;
      
      return true;
    });
    
    // Sort by relevance (this could be more sophisticated in a real app)
    filtered = filtered.sort((a, b) => b.rating - a.rating);
    
    // Limit to top 5 results
    setRecommendations(filtered.slice(0, 5));
    setStep(5);
  };

  const getUsageOptions = () => {
    switch (answers.category) {
      case "laptop":
        return [
          { value: "office", label: "عمل مكتبي", icon: <Laptop size={24} /> },
          { value: "design", label: "تصميم", icon: <Camera size={24} /> },
          { value: "programming", label: "برمجة", icon: <Laptop size={24} /> },
          { value: "gaming", label: "ألعاب", icon: <Laptop size={24} /> }
        ];
      case "smartphone":
        return [
          { value: "communication", label: "مكالمات ومراسلة", icon: <Smartphone size={24} /> },
          { value: "photography", label: "تصوير", icon: <Camera size={24} /> },
          { value: "gaming", label: "ألعاب", icon: <Smartphone size={24} /> },
          { value: "economical", label: "سعر اقتصادي", icon: <Tag size={24} /> }
        ];
      case "camera":
        return [
          { value: "photography", label: "تصوير فوتوغرافي", icon: <Camera size={24} /> },
          { value: "videography", label: "تصوير فيديو", icon: <Camera size={24} /> },
          { value: "travel", label: "سفر وتنقل", icon: <Camera size={24} /> }
        ];
      case "headphones":
        return [
          { value: "music", label: "موسيقى", icon: <Headphones size={24} /> },
          { value: "calls", label: "مكالمات", icon: <Headphones size={24} /> },
          { value: "travel", label: "سفر", icon: <Headphones size={24} /> },
          { value: "noise_cancelling", label: "عزل الضوضاء", icon: <Headphones size={24} /> }
        ];
      default:
        return [];
    }
  };

  const getBrandOptions = () => {
    switch (answers.category) {
      case "laptop":
        return ["apple", "dell", "lenovo", "hp", "asus", "acer"];
      case "smartphone":
        return ["apple", "samsung", "google", "xiaomi", "oppo", "huawei"];
      case "camera":
        return ["canon", "sony", "nikon", "fujifilm", "panasonic"];
      case "headphones":
        return ["sony", "bose", "apple", "samsung", "sennheiser", "jabra"];
      default:
        return [];
    }
  };

  return (
    <PageWrapper>
      <div className="container mx-auto px-4 py-12 rtl">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-4">مساعد اختيار المنتج المناسب</h1>
            <p className="text-gray-600 dark:text-gray-400">أجب عن بعض الأسئلة البسيطة وسنساعدك في العثور على المنتج المثالي لاحتياجاتك</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-12 relative">
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
              <div 
                className="h-2 bg-blue dark:bg-blue-light rounded-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
              <span className={step >= 1 ? "text-blue dark:text-blue-light font-medium" : ""}>نوع المنتج</span>
              <span className={step >= 2 ? "text-blue dark:text-blue-light font-medium" : ""}>الاستخدام</span>
              <span className={step >= 3 ? "text-blue dark:text-blue-light font-medium" : ""}>الميزانية</span>
              <span className={step >= 4 ? "text-blue dark:text-blue-light font-medium" : ""}>تفضيلات إضافية</span>
              <span className={step >= 5 ? "text-blue dark:text-blue-light font-medium" : ""}>التوصيات</span>
            </div>
          </div>

          {/* Step 1: Product Category */}
          {step === 1 && (
            <div className="neo-card p-8">
              <h2 className="text-xl font-bold mb-6">ما نوع المنتج الذي تبحث عنه؟</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <CategoryCard 
                  icon={<Laptop size={36} />}
                  title="لابتوب"
                  onClick={() => handleCategorySelect("laptop")}
                />
                <CategoryCard 
                  icon={<Smartphone size={36} />}
                  title="هاتف ذكي"
                  onClick={() => handleCategorySelect("smartphone")}
                />
                <CategoryCard 
                  icon={<Camera size={36} />}
                  title="كاميرا"
                  onClick={() => handleCategorySelect("camera")}
                />
                <CategoryCard 
                  icon={<Headphones size={36} />}
                  title="سماعات"
                  onClick={() => handleCategorySelect("headphones")}
                />
              </div>
            </div>
          )}

          {/* Step 2: Usage */}
          {step === 2 && (
            <div className="neo-card p-8">
              <div className="flex items-center mb-6">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(1)}
                  className="mr-2"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-bold">ما هو الاستخدام الأساسي لـ {answers.category === "laptop" ? "اللابتوب" : 
                  answers.category === "smartphone" ? "الهاتف الذكي" : 
                  answers.category === "camera" ? "الكاميرا" : 
                  "السماعات"}؟</h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {getUsageOptions().map((option) => (
                  <UsageCard 
                    key={option.value}
                    icon={option.icon}
                    title={option.label}
                    onClick={() => handleUsageSelect(option.value)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Budget */}
          {step === 3 && (
            <div className="neo-card p-8">
              <div className="flex items-center mb-6">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(2)}
                  className="mr-2"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-bold">ما هي ميزانيتك؟</h2>
              </div>
              
              <div className="my-12">
                <Slider 
                  defaultValue={[answers.priceRange[0], answers.priceRange[1]]}
                  max={3000}
                  step={100}
                  onValueChange={handlePriceRangeChange}
                  className="my-6"
                />
                <div className="flex justify-between rtl text-lg">
                  <span>{answers.priceRange[0]} $</span>
                  <span>{answers.priceRange[1]} $</span>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setStep(2)}>
                  السابق
                </Button>
                <Button onClick={() => setStep(4)}>
                  التالي
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Additional Preferences */}
          {step === 4 && (
            <div className="neo-card p-8">
              <div className="flex items-center mb-6">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(3)}
                  className="mr-2"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <h2 className="text-xl font-bold">تفضيلات إضافية</h2>
              </div>
              
              <div className="space-y-8">
                {/* Weight Preference */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Weight className="h-5 w-5 text-blue" />
                    <h3 className="text-lg font-medium">أهمية الوزن</h3>
                  </div>
                  <RadioGroup 
                    value={answers.weightPreference} 
                    onValueChange={handleWeightPreference}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="light" id="weight-light" />
                      <Label htmlFor="weight-light">خفيف جداً</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="medium" id="weight-medium" />
                      <Label htmlFor="weight-medium">متوسط</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="" id="weight-any" />
                      <Label htmlFor="weight-any">غير مهم</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Battery Preference */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <BatteryCharging className="h-5 w-5 text-blue" />
                    <h3 className="text-lg font-medium">أهمية البطارية</h3>
                  </div>
                  <RadioGroup 
                    value={answers.batteryPreference} 
                    onValueChange={handleBatteryPreference}
                    className="flex gap-4"
                  >
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="excellent" id="battery-excellent" />
                      <Label htmlFor="battery-excellent">ممتازة</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="good" id="battery-good" />
                      <Label htmlFor="battery-good">جيدة</Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <RadioGroupItem value="" id="battery-any" />
                      <Label htmlFor="battery-any">غير مهم</Label>
                    </div>
                  </RadioGroup>
                </div>
                
                {/* Brand Preferences */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <Heart className="h-5 w-5 text-blue" />
                    <h3 className="text-lg font-medium">العلامات التجارية المفضلة</h3>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {getBrandOptions().map((brand) => (
                      <div key={brand} className="flex items-center space-x-2 space-x-reverse">
                        <Checkbox 
                          id={`brand-${brand}`} 
                          checked={answers.brandPreferences.includes(brand)}
                          onCheckedChange={() => handleBrandToggle(brand)}
                        />
                        <Label htmlFor={`brand-${brand}`} className="capitalize">{brand}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => setStep(3)}>
                  السابق
                </Button>
                <Button onClick={generateRecommendations}>
                  عرض التوصيات
                </Button>
              </div>
            </div>
          )}

          {/* Step 5: Recommendations */}
          {step === 5 && (
            <div>
              <div className="flex items-center mb-6">
                <Button 
                  variant="ghost" 
                  onClick={() => setStep(4)}
                  className="mr-2"
                >
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <h2 className="text-2xl font-bold">توصياتنا لك</h2>
              </div>
              
              {recommendations.length === 0 ? (
                <div className="neo-card p-8 text-center">
                  <p className="text-xl">عذراً، لم نجد منتجات تطابق تفضيلاتك تماماً.</p>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">حاول تغيير بعض المعايير للحصول على نتائج أفضل.</p>
                  <Button onClick={() => setStep(1)} className="mt-6">
                    البدء من جديد
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {recommendations.map((product, index) => (
                    <ProductRecommendationCard 
                      key={product.id}
                      product={product}
                      rank={index + 1}
                      onBuyNow={() => navigate(`/checkout?productId=${product.id}`)}
                    />
                  ))}
                  
                  <div className="neo-card p-6 mt-8 bg-blue/5 dark:bg-blue-dark/20 border border-blue/10">
                    <div className="flex items-start gap-4">
                      <Star className="h-10 w-10 text-blue shrink-0 mt-1" />
                      <div>
                        <h3 className="text-lg font-bold mb-2">نصيحة للمشتري</h3>
                        <p className="text-gray-700 dark:text-gray-300">
                          تم ترتيب هذه المنتجات بناءً على تفضيلاتك. يمكنك مقارنة المواصفات الفنية ومراجعة التقييمات قبل اتخاذ قرار الشراء النهائي.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-8">
                    <Button onClick={() => setStep(1)} variant="outline" className="mr-4">
                      بحث جديد
                    </Button>
                    <Button onClick={() => navigate("/buy-now")}>
                      تصفح جميع المنتجات
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
};

// Category Card Component
const CategoryCard = ({ 
  icon, 
  title, 
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  onClick: () => void;
}) => {
  return (
    <div 
      className="neo-card p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow border border-transparent hover:border-blue/10 group"
      onClick={onClick}
    >
      <div className="text-blue dark:text-blue-light mb-3 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-medium text-center">{title}</h3>
    </div>
  );
};

// Usage Card Component
const UsageCard = ({ 
  icon, 
  title, 
  onClick 
}: { 
  icon: React.ReactNode; 
  title: string; 
  onClick: () => void;
}) => {
  return (
    <div 
      className="neo-card p-6 flex flex-col items-center justify-center cursor-pointer hover:shadow-md transition-shadow border border-transparent hover:border-blue/10 group"
      onClick={onClick}
    >
      <div className="text-blue dark:text-blue-light mb-3 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="font-medium text-center">{title}</h3>
    </div>
  );
};

// Product Recommendation Card
const ProductRecommendationCard = ({ 
  product, 
  rank,
  onBuyNow
}: { 
  product: any; 
  rank: number;
  onBuyNow: () => void;
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="neo-card overflow-hidden">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/4 p-4 relative">
          <div className="absolute top-2 right-2 bg-blue text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
            {rank}
          </div>
          <img 
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-48 md:h-full object-cover rounded-md"
          />
        </div>
        
        <div className="md:w-3/4 p-6">
          <h3 className="text-xl font-bold mb-2">{product.name}</h3>
          <div className="flex items-center mb-3">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={`text-sm ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}>
                  ★
                </span>
              ))}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
              ({product.rating})
            </span>
          </div>
          
          <p className="text-gray-700 dark:text-gray-300 mb-4">{product.description}</p>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="neo-card px-3 py-1 bg-gray-50 dark:bg-gray-800 text-sm">
              <span className="text-gray-500 dark:text-gray-400">السعر: </span>
              <span className="font-semibold">${product.price}</span>
            </div>
            {product.specs.weight && (
              <div className="neo-card px-3 py-1 bg-gray-50 dark:bg-gray-800 text-sm flex items-center">
                <Weight className="h-3 w-3 mr-1 text-gray-500" />
                <span className="capitalize">
                  {product.specs.weight === "light" ? "خفيف" :
                   product.specs.weight === "medium" ? "متوسط" : "ثقيل"}
                </span>
              </div>
            )}
            {product.specs.battery && (
              <div className="neo-card px-3 py-1 bg-gray-50 dark:bg-gray-800 text-sm flex items-center">
                <BatteryCharging className="h-3 w-3 mr-1 text-gray-500" />
                <span className="capitalize">
                  {product.specs.battery === "excellent" ? "بطارية ممتازة" :
                   product.specs.battery === "good" ? "بطارية جيدة" : "بطارية عادية"}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <button 
              onClick={() => setShowDetails(!showDetails)}
              className="flex items-center text-blue hover:underline"
            >
              <span>{showDetails ? "إخفاء التفاصيل" : "عرض التفاصيل"}</span>
              <ChevronRight className={`h-4 w-4 transition-transform ${showDetails ? 'rotate-90' : ''}`} />
            </button>
            
            <Button onClick={onBuyNow} className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              <span>شراء الآن</span>
            </Button>
          </div>
          
          {showDetails && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h4 className="font-semibold mb-2">المواصفات التفصيلية:</h4>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {Object.entries(product.specs).map(([key, value]) => (
                  <li key={key} className="flex items-center">
                    <CheckCircle2 className="h-4 w-4 text-green mr-2" />
                    <span className="capitalize font-medium">{key}: </span>
                    <span className="text-gray-700 dark:text-gray-300 mr-1 capitalize">{String(value)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductRecommendation;
