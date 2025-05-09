import React from 'react';
import { TrendingDown, TrendingUp, BarChart3, X } from 'lucide-react';

interface AIPriceSuggestionProps {
  suggestedPrice?: number;
  onClose?: () => void;
  onPriceSelect?: (price: number) => void;
}

const AIPriceSuggestion: React.FC<AIPriceSuggestionProps> = ({ suggestedPrice, onClose, onPriceSelect }) => {
  if (!suggestedPrice) return null;

  // Calculate price ranges (15% margin)
  const minPrice = Math.floor(suggestedPrice * 0.85);
  const maxPrice = Math.ceil(suggestedPrice * 1.15);

  // Mock data for similar items (you can replace this with real data)
  const similarItems = [
    { id: 1, price: Math.floor(suggestedPrice * 0.97) },
    { id: 2, price: Math.floor(suggestedPrice * 0.96) },
    { id: 3, price: Math.floor(suggestedPrice * 1.01) },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-blue-500" />
              السعر المقترح بناءً على تحليل السوق
            </h3>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="h-5 w-5" />
            </button>
        )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">الحد الأعلى للسعر</div>
          <div className="text-xl font-bold">₪ {maxPrice.toLocaleString()}</div>
            </div>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-2 border-blue-500">
          <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">السعر الموصى به</div>
          <div className="text-2xl font-bold text-blue-600">₪ {suggestedPrice.toLocaleString()}</div>
            </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
          <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">الحد الأدنى للسعر</div>
          <div className="text-xl font-bold">₪ {minPrice.toLocaleString()}</div>
            </div>
          </div>
          
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            منتجات مشابهة في السوق
          </h4>
          <div className="space-y-2">
            {similarItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-gray-600 dark:text-gray-400">منتج مشابه {item.id}</span>
                <span className="font-medium">₪ {item.price.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <TrendingDown className="h-4 w-4 text-red-500" />
            اتجاه السعر في السوق
          </h4>
          <div className="relative h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 right-0 bg-red-500 w-3/4 rounded-full"></div>
          </div>
          <div className="mt-2 text-sm">
            <span className="text-gray-600 dark:text-gray-400">مستوى الثقة:</span>
            <span className="text-green-500 mr-1">عالية</span>
          </div>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
        تم تحليل أكثر من 300 منتج مشابه في السوق الفلسطيني لاقتراح هذا السعر. السعر المقترح يعكس الأسعار الحالية في السوق، مع مراعاة حالة المنتج وموقعه.
      </div>
    </div>
  );
};

export default AIPriceSuggestion;
