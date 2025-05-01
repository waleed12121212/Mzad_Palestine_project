
import React, { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, ArrowUpRight, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

interface Category {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  subcategories?: Omit<Category, "subcategories" | "icon">[];
}

interface CategorySidebarProps {
  categories: Category[];
  onSelectCategory: (categoryId: string) => void;
  selectedCategoryId?: string;
}

const CategorySidebar: React.FC<CategorySidebarProps> = ({
  categories,
  onSelectCategory,
  selectedCategoryId,
}) => {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCategories, setFilteredCategories] = useState<Category[]>(categories);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCategories(categories);
      return;
    }

    const normalizedSearchTerm = searchTerm.trim().toLowerCase();
    
    const filtered = categories.filter(category => {
      const matchesMainCategory = category.name.toLowerCase().includes(normalizedSearchTerm);
      
      // Also check subcategories
      const hasMatchingSubcategory = category.subcategories?.some(
        subcat => subcat.name.toLowerCase().includes(normalizedSearchTerm)
      );
      
      return matchesMainCategory || hasMatchingSubcategory;
    });
    
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const toggleExpand = (categoryId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const isExpanded = (categoryId: string) => {
    return expandedCategories.includes(categoryId);
  };

  const handleCategoryClick = (categoryId: string) => {
    onSelectCategory(categoryId);
    navigate(`/categories/${categoryId}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden w-full">
      <div className="p-3 md:p-4 border-b border-gray-100 dark:border-gray-700">
        <h2 className="font-semibold text-base md:text-lg rtl">الفئات</h2>
      </div>
      
      {/* Search bar */}
      <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
        <div className="relative rtl">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="بحث في الفئات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-3 pr-9 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue"
          />
        </div>
      </div>
      
      <div className={`py-2 overflow-y-auto scrollbar-thin rtl ${isMobile ? 'max-h-[40vh]' : 'max-h-[60vh]'}`}>
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div key={category.id} className="mb-1 px-2">
              <div
                className={`flex items-center justify-between py-2 px-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200 rounded-md ${
                  selectedCategoryId === category.id ? "bg-blue/5 text-blue dark:bg-blue/10" : ""
                }`}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-gray-500 dark:text-gray-400">
                    {category.icon}
                  </span>
                  <span className="text-sm md:text-base">{category.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    ({category.count})
                  </span>
                </div>
                
                {category.subcategories && category.subcategories.length > 0 && (
                  <button
                    onClick={(e) => toggleExpand(category.id, e)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full"
                    aria-label={isExpanded(category.id) ? "طي القائمة" : "توسيع القائمة"}
                  >
                    {isExpanded(category.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>
                )}
              </div>
              
              {category.subcategories && isExpanded(category.id) && (
                <div className="pl-6 pr-5 py-1 rtl border-r-2 border-gray-100 dark:border-gray-700 mr-3 my-1">
                  {category.subcategories.map((subcat) => (
                    <div
                      key={subcat.id}
                      className={`py-2 px-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 rounded-md my-1 transition-colors duration-200 text-xs md:text-sm flex items-center justify-between ${
                        selectedCategoryId === subcat.id
                          ? "bg-blue/5 text-blue dark:bg-blue/10"
                          : ""
                      }`}
                      onClick={() => handleCategoryClick(subcat.id)}
                    >
                      <span>{subcat.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          ({subcat.count})
                        </span>
                        <ArrowUpRight className="h-3 w-3 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400 rtl">
            لا توجد فئات مطابقة للبحث
          </div>
        )}
      </div>
      
      {/* Show all categories link */}
      <div className="p-3 border-t border-gray-100 dark:border-gray-700 rtl">
        <Link 
          to="/categories" 
          className="text-blue dark:text-blue-light hover:underline text-sm flex items-center justify-center"
        >
          عرض جميع الفئات
          <ArrowUpRight className="h-3 w-3 mr-1" />
        </Link>
      </div>
    </div>
  );
};

export default CategorySidebar;
