import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Camera, 
  PlusCircle, 
  Building2, 
  Car, 
  Smartphone,
  Sofa, 
  Gem, 
  Tag, 
  Calendar, 
  Clock, 
  Info, 
  ArrowRight, 
  X,
  Upload,
  Lightbulb
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AIPriceSuggestion from "@/components/ui/AIPriceSuggestion";
import { categoryService, Category } from "@/services/categoryService";
import { listingService } from "@/services/listingService";
import { auctionService } from "@/services/auctionService";
import { useAuth } from "@/contexts/AuthContext";

const CreateAuction = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startingPrice: "",
    incrementAmount: "",
    endDate: "",
    endTime: "",
    location: "",
    condition: "new" as "new" | "used",
    terms: false
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const activeCategories = await categoryService.getActiveCategories();
        setCategories(activeCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast({
          title: "خطأ",
          description: "حدث خطأ أثناء تحميل التصنيفات",
          variant: "destructive"
        });
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newImages = Array.from(e.target.files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (activeStep === 3 && !formData.terms) {
      toast({
        title: "خطأ في النموذج",
        description: "يجب الموافقة على الشروط والأحكام للمتابعة",
        variant: "destructive",
      });
      return;
    }
    
    if (activeStep < 3) {
      setActiveStep(activeStep + 1);
    } else {
      try {
        setIsSubmitting(true);

        // Validate required fields
        if (!formData.title || !formData.description || !formData.category || !formData.startingPrice || !formData.endDate || !formData.endTime) {
          toast({
            title: "خطأ في النموذج",
            description: "جميع الحقول المطلوبة يجب ملؤها",
            variant: "destructive",
          });
          return;
        }

        // Format dates to match backend requirements
        const endDate = new Date(`${formData.endDate}T${formData.endTime}`);
        const startDate = new Date(); // Current time for start

        // Validate dates
        if (endDate <= startDate) {
          toast({
            title: "خطأ في التاريخ",
            description: "تاريخ انتهاء المزاد يجب أن يكون في المستقبل",
            variant: "destructive",
          });
          return;
        }

        // Create listing with exact backend format
        const listingData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          startingPrice: Number(formData.startingPrice),
          categoryId: Number(formData.category),
          endDate: endDate.toISOString(),
          images: images.length > 0 ? images : ["https://example.com/images/placeholder.jpg"],
          userId: user?.id?.toString() || "1"
        };

        console.log("Creating listing with data:", JSON.stringify(listingData, null, 2));
        const listing = await listingService.createListing(listingData);
        console.log("Listing created:", listing);

        if (!listing || (!listing.id && !listing.listingId)) {
          throw new Error('Failed to create listing: No listing ID returned');
        }

        // Wait a moment to ensure the listing is fully created
        await new Promise(resolve => setTimeout(resolve, 2000));

        // بعد إنشاء listing
        const plainListing = JSON.parse(JSON.stringify(listing));
        console.log('plainListing:', plainListing);
        let listingId = plainListing.listingId ?? plainListing.id;
        if (typeof listingId === 'string') {
          listingId = parseInt(listingId, 10);
        }
        console.log('Using listingId for auction:', listingId, typeof listingId);
        if (!listingId || isNaN(listingId)) {
          throw new Error('No valid listingId returned from listing creation');
        }

        // Create auction with exact backend format
        const auctionData = {
          listingId: listingId,
          name: formData.title.trim(),
          startTime: startDate.toISOString(),
          endTime: endDate.toISOString(),
          reservePrice: Number(formData.startingPrice),
          bidIncrement: Number(formData.incrementAmount || 10),
          imageUrl: images[0] || "https://example.com/images/placeholder.jpg"
        };

        // Log the exact data being sent
        console.log("Creating auction with data:", JSON.stringify(auctionData, null, 2));
        console.log("Auction data types:", {
          listingId: typeof auctionData.listingId,
          name: typeof auctionData.name,
          startTime: typeof auctionData.startTime,
          endTime: typeof auctionData.endTime,
          reservePrice: typeof auctionData.reservePrice,
          bidIncrement: typeof auctionData.bidIncrement,
          imageUrl: typeof auctionData.imageUrl
        });

        // Validate auction data before sending
        if (!auctionData.listingId || !auctionData.name || !auctionData.startTime || !auctionData.endTime || 
            !auctionData.reservePrice || !auctionData.bidIncrement || !auctionData.imageUrl) {
          throw new Error('Missing required auction fields');
        }

        // Ensure listingId is a number
        auctionData.listingId = Number(auctionData.listingId);
        if (isNaN(auctionData.listingId)) {
          throw new Error('Invalid listing ID');
        }

        // Ensure all numeric fields are valid
        if (isNaN(auctionData.reservePrice) || isNaN(auctionData.bidIncrement)) {
          throw new Error('Invalid numeric values');
        }

        // Ensure dates are valid
        const startTime = new Date(auctionData.startTime);
        const endTime = new Date(auctionData.endTime);
        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
          throw new Error('Invalid date format');
        }

        // Format the data exactly as the backend expects
        const formattedAuctionData = {
          listingId: auctionData.listingId,
          name: auctionData.name,
          startTime: auctionData.startTime,
          endTime: auctionData.endTime,
          reservePrice: auctionData.reservePrice,
          bidIncrement: auctionData.bidIncrement,
          imageUrl: auctionData.imageUrl
        };

        console.log("Sending formatted auction data:", JSON.stringify(formattedAuctionData, null, 2));

        const auction = await auctionService.createAuction(formattedAuctionData);
        console.log("Auction created:", auction);

        if (!auction || !auction.id) {
          throw new Error('Failed to create auction: No auction ID returned');
        }

      toast({
        title: "تم إنشاء المزاد بنجاح",
        description: "سيتم مراجعة المزاد من قبل الإدارة قبل نشره",
      });
      
      setTimeout(() => {
          navigate(`/auction/${auction.id}`);
      }, 2000);
      } catch (error: any) {
        console.error("Error creating auction:", error);
        console.error("Error response data:", error.response?.data);
        console.error("Validation errors:", error.response?.data?.errors);
        console.error("Error response status:", error.response?.status);
        console.error("Error response headers:", error.response?.headers);
        console.error("Request config:", error.config);
        
        const errorMessage = error.response?.data?.message 
          || (error.response?.data?.errors && JSON.stringify(error.response.data.errors))
          || error.message 
          || "حدث خطأ أثناء إنشاء المزاد";
        toast({
          title: "خطأ",
          description: errorMessage,
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const goToPreviousStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const selectedCategory = categories.find(c => c.id === formData.category);

  const handleAIPriceSelect = (price: number) => {
    setFormData(prev => ({
      ...prev,
      startingPrice: price.toString()
    }));
    
    toast({
      title: "تم تطبيق السعر المقترح",
      description: `تم تحديد سعر بدء المزاد تلقائياً: ₪${price.toLocaleString()}`
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        <div className="mb-8 rtl">
          <h1 className="heading-lg mb-2">إنشاء مزاد جديد</h1>
          <p className="text-gray-600 dark:text-gray-300">
            قم بإنشاء مزاد جديد ليتم عرضه على منصة مزاد فلسطين
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden rtl">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  activeStep >= 1 ? "bg-blue text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}>
                  1
                </span>
                <span className="mx-2 h-0.5 w-6 bg-gray-200 dark:bg-gray-700"></span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  activeStep >= 2 ? "bg-blue text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}>
                  2
                </span>
                <span className="mx-2 h-0.5 w-6 bg-gray-200 dark:bg-gray-700"></span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  activeStep >= 3 ? "bg-blue text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}>
                  3
                </span>
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">
                الخطوة {activeStep} من 3
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {activeStep === 1 && (
              <div className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2">معلومات المزاد الأساسية</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    قم بإدخال المعلومات الأساسية للمزاد الخاص بك
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="title" className="block mb-2 text-sm font-medium">
                      عنوان المزاد <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      placeholder="مثال: شقة فاخرة في رام الله"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block mb-2 text-sm font-medium">
                      وصف المزاد <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      placeholder="اكتب وصفاً تفصيلياً للعنصر المعروض في المزاد"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="block mb-2 text-sm font-medium">
                      الفئة <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                      required
                    >
                      <option value="">اختر فئة</option>
                      {categories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      حالة العنصر <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="condition"
                          value="new"
                          checked={formData.condition === "new"}
                          onChange={handleChange}
                          className="ml-2"
                        />
                        جديد
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="condition"
                          value="used"
                          checked={formData.condition === "used"}
                          onChange={handleChange}
                          className="ml-2"
                        />
                        مستعمل
                      </label>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="location" className="block mb-2 text-sm font-medium">
                      الموقع <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      placeholder="مثال: رام الله، فلسطين"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2">تفاصيل المزاد والصور</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    أضف تفاصيل السعر ووقت انتهاء المزاد، وقم بتحميل صور عالية الجودة للعنصر
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {/* AI Price Info Banner */}
                  <div className="bg-blue/5 dark:bg-blue/10 rounded-lg p-4 border border-blue/20 flex items-start gap-3 mb-2">
                    <Lightbulb className="h-5 w-5 text-blue shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-blue">تحديد السعر التلقائي باستخدام الذكاء الاصطناعي</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        يمكنك الاستفادة من خوارزمية الذكاء الاصطناعي لتحليل السوق واقتراح السعر المثالي لمزادك.
                      </p>
                      <Link to="/ai-price-guide" target="_blank" className="text-sm text-blue hover:underline">
                        معرفة المزيد حول كيفية عمل هذه الميزة →
                      </Link>
                    </div>
                  </div>

                  {/* AI Price Suggestion Component */}
                  <AIPriceSuggestion
                    category={formData.category}
                    title={formData.title}
                    description={formData.description}
                    condition={formData.condition}
                    location={formData.location}
                    onPriceSelect={handleAIPriceSelect}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startingPrice" className="block mb-2 text-sm font-medium">
                        سعر البدء (₪) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="startingPrice"
                          name="startingPrice"
                          placeholder="0"
                          value={formData.startingPrice}
                          onChange={handleChange}
                          className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                          required
                          min="1"
                        />
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₪</span>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="incrementAmount" className="block mb-2 text-sm font-medium">
                        الحد الأدنى للمزايدة (₪) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="incrementAmount"
                          name="incrementAmount"
                          placeholder="0"
                          value={formData.incrementAmount}
                          onChange={handleChange}
                          className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                          required
                          min="1"
                        />
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₪</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="endDate" className="block mb-2 text-sm font-medium">
                        تاريخ انتهاء المزاد <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="endDate"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                          required
                          min={new Date().toISOString().split('T')[0]}
                        />
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="endTime" className="block mb-2 text-sm font-medium">
                        وقت انتهاء المزاد <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          id="endTime"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleChange}
                          className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                          required
                        />
                        <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      صور المزاد <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      {images.length === 0 ? (
                        <>
                          <Camera className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            اسحب وأفلت الصور هنا، أو اضغط لتحميل الصور
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            أقصى حجم للصورة: 5 ميجابايت | الصيغ المدعومة: JPG, PNG, WEBP
                          </p>
                          <input
                            type="file"
                            id="images"
                            name="images"
                            className="hidden"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={handleImageUpload}
                          />
                          <button
                            type="button"
                            onClick={() => document.getElementById("images")?.click()}
                            className="mt-4 px-4 py-2 bg-blue/10 dark:bg-blue/20 text-blue dark:text-blue-light rounded-lg hover:bg-blue/20 dark:hover:bg-blue/30 transition-colors inline-flex items-center gap-2"
                          >
                            <Upload className="h-4 w-4" />
                            <span>تحميل الصور</span>
                          </button>
                        </>
                      ) : (
                        <div>
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-4">
                            {images.map((src, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={src}
                                  alt={`Uploaded ${index + 1}`}
                                  className="w-full h-24 object-cover rounded-lg"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeImage(index)}
                                  className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => document.getElementById("images")?.click()}
                              className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg h-24 flex flex-col items-center justify-center"
                            >
                              <PlusCircle className="h-8 w-8 text-gray-400" />
                              <span className="text-xs text-gray-500 mt-1">إضافة المزيد</span>
                            </button>
                          </div>
                          <input
                            type="file"
                            id="images"
                            name="images"
                            className="hidden"
                            accept="image/jpeg,image/png,image/webp"
                            multiple
                            onChange={handleImageUpload}
                          />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                      <Info className="h-4 w-4 mr-1" />
                      يجب إضافة صورة واحدة على الأقل لإنشاء المزاد
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2">مراجعة ونشر المزاد</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    راجع تفاصيل المزاد قبل النشر
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">ملخص المزاد</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">عنوان المزاد</h4>
                        <p className="font-medium">{formData.title || "غير محدد"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">الفئة</h4>
                        <p className="font-medium">
                          {selectedCategory?.name || "غير محدد"}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm text-gray-500 dark:text-gray-400">وصف المزاد</h4>
                      <p>{formData.description || "غير محدد"}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">سعر البدء</h4>
                        <p className="font-medium text-blue dark:text-blue-light">
                          {formData.startingPrice ? `₪ ${parseFloat(formData.startingPrice).toLocaleString()}` : "غير محدد"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">الحد الأدنى للمزايدة</h4>
                        <p className="font-medium">
                          {formData.incrementAmount ? `₪ ${parseFloat(formData.incrementAmount).toLocaleString()}` : "غير محدد"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">تاريخ ووقت الانتهاء</h4>
                        <p className="font-medium">
                          {formData.endDate && formData.endTime 
                            ? `${formData.endDate} ${formData.endTime}` 
                            : "غير محدد"}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">الموقع</h4>
                        <p className="font-medium">{formData.location || "غير محدد"}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400">حالة العنصر</h4>
                        <p className="font-medium">{formData.condition === "new" ? "جديد" : "مستعمل"}</p>
                      </div>
                    </div>

                    {images.length > 0 && (
                      <div>
                        <h4 className="text-sm text-gray-500 dark:text-gray-400 mb-2">الصور</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {images.map((src, index) => (
                            <img
                              key={index}
                              src={src}
                              alt={`Preview ${index + 1}`}
                              className="h-20 w-full object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue/5 dark:bg-blue/10 rounded-lg p-4 border border-blue/20">
                  <div className="flex items-start">
                    <Info className="h-5 w-5 text-blue dark:text-blue-light ml-2 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue dark:text-blue-light mb-1">ملاحظة هامة</h4>
                      <p className="text-sm">
                        سيتم مراجعة المزاد من قبل إدارة المنصة قبل نشره، وقد يستغرق ذلك ما يصل إلى 24 ساعة. ستتلقى إشعاراً عند الموافقة على المزاد.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      name="terms"
                      checked={formData.terms}
                      onChange={handleChange}
                      className="mt-1"
                      required
                    />
                    <span className="mr-2 text-sm">
                      أوافق على <a href="/terms" className="text-blue dark:text-blue-light hover:underline">شروط وأحكام</a> المنصة، وأؤكد أن جميع المعلومات المقدمة صحيحة ودقيقة. كما أتحمل المسؤولية الكاملة عن صحة المعلومات والصور المقدمة.
                    </span>
                  </label>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              {activeStep > 1 ? (
                <button
                  type="button"
                  onClick={goToPreviousStep}
                  className="btn-secondary"
                  disabled={isSubmitting}
                >
                  العودة للخطوة السابقة
                </button>
              ) : (
                <div></div>
              )}
              
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span>جاري الحفظ...</span>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  </>
                ) : activeStep < 3 ? (
                  <>
                    <span>التالي</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                ) : (
                  <span>إنشاء المزاد</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateAuction;
