import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ChevronRight, Search, Filter, SlidersHorizontal, Building2, Car, Smartphone, Sofa, Gem, BookOpen, Camera, Baby, Coffee, Shirt, Utensils, Dumbbell, ChevronLeft, Plus, Edit, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import PageWrapper from "@/components/layout/PageWrapper";
import AuctionCard from "@/components/ui/AuctionCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { toast } from '@/components/ui/use-toast';
import { categoryService, Category, CreateCategoryData, UpdateCategoryData } from '@/services/categoryService';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

// دالة استخراج الدور من التوكن
function getRoleFromToken(token) {
  if (!token) return undefined;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.role || payload.Role || payload.roles || payload.Roles;
  } catch {
    return undefined;
  }
}

// دالة اختيار الأيقونة حسب اسم التصنيف
function getCategoryIcon(name) {
  switch (name) {
    case "أزياء":
      return <Shirt className="inline-block w-5 h-5 ml-1" />;
    case "إلكترونيات":
      return <Smartphone className="inline-block w-5 h-5 ml-1" />;
    case "مركبات":
    case "سيارات":
      return <Car className="inline-block w-5 h-5 ml-1" />;
    case "إكسسوارات":
      return <Gem className="inline-block w-5 h-5 ml-1" />;
    case "كتب":
    case "الكتب والمجلات":
      return <BookOpen className="inline-block w-5 h-5 ml-1" />;
    case "كاميرات":
      return <Camera className="inline-block w-5 h-5 ml-1" />;
    case "مستلزمات الأطفال":
      return <Baby className="inline-block w-5 h-5 ml-1" />;
    case "مستلزمات منزلية":
      return <Coffee className="inline-block w-5 h-5 ml-1" />;
    case "أثاث":
      return <Sofa className="inline-block w-5 h-5 ml-1" />;
    default:
      // أيقونة افتراضية
      return <Gem className="inline-block w-5 h-5 ml-1" />;
  }
}

const Categories = () => {
  const { category } = useParams<{ category?: string }>();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [sortBy, setSortBy] = useState<string>("ending-soon");
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  const roleFromToken = getRoleFromToken(token);
  const isAdmin = (!!user && String(user.role).toLowerCase() === 'admin') ||
                  (!user && String(roleFromToken).toLowerCase() === 'admin');
  
  // Debug: طباعة بيانات المستخدم وصلاحيات الأدمن
  console.log("user:", user, "role:", user?.role || roleFromToken, "isAdmin:", isAdmin);

  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showActiveOnly, setShowActiveOnly] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  // Form states
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: '',
    description: '',
    imageUrl: '',
    parentCategoryId: null
  });
  
  // Mock data for categories
  const mockCategories = [
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

  useEffect(() => {
    fetchCategories();
  }, [showActiveOnly]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = showActiveOnly 
        ? await categoryService.getActiveCategories()
        : await categoryService.getAllCategories();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تحميل التصنيفات');
      setCategories([]);
      toast({
        title: "خطأ",
        description: err.message || 'حدث خطأ أثناء تحميل التصنيفات',
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await categoryService.createCategory(formData);
      toast({
        title: "تمت الإضافة",
        description: "تم إضافة التصنيف بنجاح"
      });
      setIsCreateModalOpen(false);
      setFormData({
        name: '',
        description: '',
        imageUrl: '',
        parentCategoryId: null
      });
      fetchCategories();
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.message || 'حدث خطأ أثناء إضافة التصنيف',
        variant: "destructive"
      });
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory) return;

    try {
      await categoryService.updateCategory(selectedCategory.id, {
        name: formData.name,
        description: formData.description
      });
      toast({
        title: "تم التحديث",
        description: "تم تحديث التصنيف بنجاح"
      });
      setIsEditModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.message || 'حدث خطأ أثناء تحديث التصنيف',
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('هل أنت متأكد من حذف هذا التصنيف؟')) return;

    try {
      await categoryService.deleteCategory(id);
      toast({
        title: "تم الحذف",
        description: "تم حذف التصنيف بنجاح"
      });
      fetchCategories();
    } catch (err: any) {
      toast({
        title: "خطأ",
        description: err.message || 'حدث خطأ أثناء حذف التصنيف',
        variant: "destructive"
      });
    }
  };

  const toggleCategoryExpand = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  // تصميم كرت التصنيف
  const CategoryCard = ({ category }) => (
    <div className="relative rounded-2xl overflow-hidden shadow-md group w-72 h-44 flex-shrink-0">
      {/* صورة الخلفية */}
      <img
        src={category.imageUrl}
        alt={category.name}
        className="absolute inset-0 w-full h-full object-cover transition-transform group-hover:scale-105"
      />
      {/* طبقة شفافة */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      {/* اسم التصنيف والأيقونة في الأعلى يمين */}
      <div className="absolute top-3 right-4 z-10 flex items-center gap-2">
        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/30 backdrop-blur-sm">
          {React.cloneElement(getCategoryIcon(category.name), { className: "w-5 h-5 text-white" })}
        </span>
        <span className="text-lg font-bold text-white drop-shadow">{category.name}</span>
      </div>
      {/* الوصف في الأسفل */}
      <div className="absolute bottom-8 right-4 left-4 z-10">
        <p className="text-sm text-gray-200 line-clamp-2">{category.description}</p>
      </div>
      {/* عدد المنتجات في الأسفل يمين */}
      <div className="absolute bottom-3 right-4 z-10">
        <span className="text-xs text-gray-200">{category.count ? `${category.count} منتج` : ''}</span>
      </div>
      {/* أزرار الأدمن (إن وجد) */}
      {isAdmin && (
        <div className="absolute top-3 left-3 flex gap-2 z-20">
          <button
            onClick={() => {
              setSelectedCategory(category);
              setFormData({
                name: category.name,
                description: category.description,
                imageUrl: category.imageUrl,
                parentCategoryId: category.parentCategoryId
              });
              setIsEditModalOpen(true);
            }}
            className="bg-white/80 hover:bg-blue text-blue hover:text-white rounded-full p-2 transition"
            title="تعديل"
          >
            <Edit className="h-5 w-5" />
          </button>
          <button
            onClick={() => handleDeleteCategory(category.id)}
            className="bg-white/80 hover:bg-red-500 text-red-500 hover:text-white rounded-full p-2 transition"
            title="حذف"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );

  const selectedCategoryObj = Array.isArray(categories) ? categories.find(c => c.id === category) : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-16 md:pt-24 pb-12 md:pb-16 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">التصنيفات</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowActiveOnly(!showActiveOnly)}
                className={`px-4 py-2 rounded-xl ${
                  showActiveOnly
                    ? 'bg-blue text-white dark:bg-blue-light dark:text-gray-900'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {showActiveOnly ? 'عرض الكل' : 'عرض النشطة فقط'}
              </button>
              {user && isAdmin && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-blue text-white dark:bg-blue-light dark:text-gray-900 px-4 py-2 rounded-xl flex items-center gap-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>إضافة تصنيف</span>
                </button>
              )}
                  </div>
                </div>
                
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="w-16 h-16 border-4 border-blue border-t-transparent rounded-full animate-spin"></div>
                    </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-500">{error}</p>
                  </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">لا توجد تصنيفات</p>
                </div>
          ) : (
            <div className="flex flex-wrap gap-6 justify-center">
              {categories.map(category => (
                <CategoryCard key={category.id} category={category} />
            ))}
          </div>
          )}
        </div>
      </main>

      {/* Create Category Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">إضافة تصنيف جديد</h2>
            <form onSubmit={handleCreateCategory} className="space-y-4">
          <div>
                <label className="block text-sm font-medium mb-2">الاسم</label>
                  <input
                    type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  required
                />
                </div>
              <div>
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  rows={3}
                  required
                />
              </div>
                    <div>
                <label className="block text-sm font-medium mb-2">رابط الصورة</label>
                        <input
                  type="url"
                  value={formData.imageUrl}
                  onChange={e => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  required
                        />
                      </div>
              <div>
                <label className="block text-sm font-medium mb-2">التصنيف الأب (اختياري)</label>
                <select
                  value={formData.parentCategoryId || ''}
                  onChange={e => setFormData(prev => ({ ...prev, parentCategoryId: e.target.value || null }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                >
                  <option value="">بدون تصنيف أب</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
                    </div>
              <div className="flex justify-end gap-4 mt-6">
                      <button 
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                      >
                  إلغاء
                      </button>
                      <button 
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue text-white dark:bg-blue-light dark:text-gray-900"
                >
                  إضافة
                      </button>
                    </div>
            </form>
                  </div>
                </div>
              )}

      {/* Edit Category Modal */}
      {isEditModalOpen && selectedCategory && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">تعديل التصنيف</h2>
            <form onSubmit={handleUpdateCategory} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">الاسم</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">الوصف</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
                  rows={3}
                  required
                />
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-200"
                >
                  إلغاء
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue text-white dark:bg-blue-light dark:text-gray-900"
                >
                  حفظ التغييرات
                </button>
              </div>
            </form>
          </div>
          </div>
        )}

      <Footer />
      </div>
  );
};

export default Categories;
