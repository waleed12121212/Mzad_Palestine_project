
import React, { useState } from "react";
import { 
  Lightbulb, 
  BarChart, 
  TrendingUp, 
  TrendingDown, 
  BadgeDollarSign, 
  ChevronsUpDown, 
  Check, 
  X, 
  Info,
  Loader2
} from "lucide-react";

interface AIPriceSuggestionProps {
  category: string;
  subcategory?: string;
  title: string;
  description: string;
  condition: "new" | "used";
  location: string;
  onPriceSelect: (price: number) => void;
}

interface PriceSuggestion {
  recommendedPrice: number;
  minPrice: number;
  maxPrice: number;
  priceTrend: "up" | "down" | "stable";
  confidenceScore: number;
  similarItems: {
    title: string;
    price: number;
  }[];
}

const AIPriceSuggestion: React.FC<AIPriceSuggestionProps> = ({
  category,
  subcategory,
  title,
  description,
  condition,
  location,
  onPriceSelect
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<PriceSuggestion | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const generatePriceSuggestion = async () => {
    if (!title || !category) {
      setError("يرجى إدخال عنوان المنتج والفئة أولاً");
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // In a real implementation, this would be an API call to an AI model
      // Here we're simulating the API response
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock price suggestion based on product details
      const mockSuggestion: PriceSuggestion = {
        recommendedPrice: generateMockPrice(category, condition),
        minPrice: 0,
        maxPrice: 0,
        priceTrend: Math.random() > 0.5 ? "up" : "down",
        confidenceScore: Math.random() * 0.3 + 0.7, // 0.7 to 1.0
        similarItems: generateMockSimilarItems(category, condition),
      };
      
      // Calculate min and max based on the recommended price
      mockSuggestion.minPrice = Math.floor(mockSuggestion.recommendedPrice * 0.85);
      mockSuggestion.maxPrice = Math.ceil(mockSuggestion.recommendedPrice * 1.15);
      
      setSuggestion(mockSuggestion);
      setIsOpen(true);
    } catch (err) {
      setError("حدث خطأ أثناء تحليل بيانات المنتج. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockPrice = (category: string, condition: string): number => {
    // Generate reasonable prices based on category
    const basePrice = {
      'real-estate': condition === 'new' ? 250000 : 180000,
      'vehicles': condition === 'new' ? 85000 : 45000,
      'electronics': condition === 'new' ? 3500 : 1800,
      'furniture': condition === 'new' ? 8000 : 3500,
      'antiques': 12000, // Antiques are usually valuable regardless of condition
    }[category] || 1000;
    
    // Add some randomness
    return Math.round(basePrice * (0.9 + Math.random() * 0.2));
  };
  
  const generateMockSimilarItems = (category: string, condition: string) => {
    const basePrice = generateMockPrice(category, condition);
    return [
      { title: "منتج مشابه 1", price: Math.round(basePrice * (0.95 + Math.random() * 0.1)) },
      { title: "منتج مشابه 2", price: Math.round(basePrice * (0.98 + Math.random() * 0.04)) },
      { title: "منتج مشابه 3", price: Math.round(basePrice * (1.02 + Math.random() * 0.08)) },
    ];
  };

  const handleSelectPrice = () => {
    if (suggestion) {
      onPriceSelect(suggestion.recommendedPrice);
      setIsOpen(false);
    }
  };

  const getConfidenceText = (score: number) => {
    if (score >= 0.9) return "عالية جداً";
    if (score >= 0.8) return "عالية";
    if (score >= 0.7) return "متوسطة";
    return "منخفضة";
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.9) return "text-green dark:text-green-light";
    if (score >= 0.8) return "text-green-600 dark:text-green-400";
    if (score >= 0.7) return "text-amber-600 dark:text-amber-400";
    return "text-red-500";
  };

  return (
    <div className="rtl mb-4">
      <button
        type="button"
        onClick={generatePriceSuggestion}
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white rounded-lg transition-all shadow-sm"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span>جاري تحليل بيانات المنتج...</span>
          </>
        ) : (
          <>
            <Lightbulb className="h-5 w-5" />
            <span>تحديد السعر التلقائي باستخدام الذكاء الاصطناعي</span>
          </>
        )}
      </button>
      
      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}
      
      {isOpen && suggestion && (
        <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BadgeDollarSign className="h-5 w-5 text-blue" />
              السعر المقترح بناءً على تحليل السوق
            </h3>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">الحد الأدنى للسعر</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">₪ {suggestion.minPrice.toLocaleString()}</p>
            </div>
            
            <div className="bg-blue/5 dark:bg-blue/20 p-4 rounded-lg shadow-sm text-center border-2 border-blue">
              <p className="text-sm text-blue mb-1 font-medium">السعر الموصى به</p>
              <p className="text-3xl font-bold text-blue">₪ {suggestion.recommendedPrice.toLocaleString()}</p>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">الحد الأعلى للسعر</p>
              <p className="text-2xl font-bold text-gray-700 dark:text-gray-200">₪ {suggestion.maxPrice.toLocaleString()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">اتجاه السعر في السوق</h4>
                {suggestion.priceTrend === "up" ? (
                  <div className="flex items-center text-green-600 dark:text-green-400">
                    <TrendingUp className="h-5 w-5 mr-1" />
                    <span>ارتفاع</span>
                  </div>
                ) : suggestion.priceTrend === "down" ? (
                  <div className="flex items-center text-red-500">
                    <TrendingDown className="h-5 w-5 mr-1" />
                    <span>انخفاض</span>
                  </div>
                ) : (
                  <div className="flex items-center text-amber-600 dark:text-amber-400">
                    <ChevronsUpDown className="h-5 w-5 mr-1" />
                    <span>مستقر</span>
                  </div>
                )}
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-600 rounded-full">
                <div 
                  className={`h-2 rounded-full ${suggestion.priceTrend === "up" ? "bg-green-500" : suggestion.priceTrend === "down" ? "bg-red-500" : "bg-amber-500"}`}
                  style={{ width: `${(suggestion.confidenceScore * 100)}%` }}
                ></div>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <span className="text-sm text-gray-500 dark:text-gray-400">مستوى الثقة: </span>
                <span className={`text-sm font-medium ${getConfidenceColor(suggestion.confidenceScore)}`}>
                  {getConfidenceText(suggestion.confidenceScore)}
                </span>
              </div>
            </div>
            
            <div className="bg-white dark:bg-gray-700 p-4 rounded-lg shadow-sm">
              <h4 className="font-medium mb-3 flex items-center">
                <BarChart className="h-5 w-5 mr-2 text-blue" />
                منتجات مشابهة في السوق
              </h4>
              <ul className="space-y-2">
                {suggestion.similarItems.map((item, index) => (
                  <li key={index} className="flex justify-between items-center pb-2 border-b border-gray-100 dark:border-gray-600 last:border-0">
                    <span className="text-sm">{item.title}</span>
                    <span className="font-medium">₪ {item.price.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="flex items-start rounded-lg bg-gray-100 dark:bg-gray-750 p-3 mb-6">
            <Info className="h-5 w-5 text-blue mr-2 mt-0.5" />
            <p className="text-sm text-gray-600 dark:text-gray-300">
              تم تحليل أكثر من 300 منتج مشابه في السوق الفلسطيني لاقتراح هذا السعر. السعر المقترح يعكس الأسعار الحالية في السوق مع مراعاة حالة المنتج وموقعه.
            </p>
          </div>
          
          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              تجاهل
            </button>
            <button
              type="button"
              onClick={handleSelectPrice}
              className="px-4 py-2 bg-blue text-white rounded-md hover:bg-blue-light flex items-center gap-2 transition-colors"
            >
              <Check className="h-4 w-4" />
              <span>استخدام السعر المقترح</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPriceSuggestion;
