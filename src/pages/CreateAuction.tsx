import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
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
  Lightbulb,
  MapPin,
  Laptop,
  Cpu,
  Monitor,
  Tv,
  Maximize,
  Gauge,
  HardDrive,
  Database,
  Layers,
  Plus,
  Battery,
  RefreshCw,
  Zap,
  Droplets,
  Wind,
  DoorOpen,
  Cog,
  Settings,
  Ruler
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AIPriceSuggestion from "@/components/ui/AIPriceSuggestion";
import { categoryService, Category } from "@/services/categoryService";
import { listingService } from "@/services/listingService";
import { auctionService } from "@/services/auctionService";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import CategorySpecificForm from "@/components/forms/CategorySpecificForm";
import { predictionService } from '@/services/predictionService';

const CreateAuction = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [images, setImages] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false); // New state for form visibility
  const [errors, setErrors] = useState<any>({});
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    startingPrice: "",
    incrementAmount: "",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
    location: "",
    condition: "new" as "new" | "used",
    terms: false
  });

  // Laptop specific data
  const [laptopData, setLaptopData] = useState({
    brand: "",
    processorName: "",
    displayType: "LED",
    gpu: "",
    ramExpandable: true,
    processorSpeed: 0,
    displaySize: 0,
    ssdSize: 0,
    hddSize: 0,
    ramSize: 0
  });

  // Car specific data
  const [carData, setCarData] = useState({
    carId: 1,
    symboling: 3,
    fuelType: "gas",
    aspiration: "std",
    doorNumber: "four",
    carBody: "sedan",
    driveWheel: "fwd",
    engineLocation: "front",
    wheelBase: 0,
    carLength: 0,
    carWidth: 0,
    carHeight: 0,
    curbWeight: 0,
    engineType: "dohc",
    cylinderNumber: "four",
    engineSize: 0,
    fuelSystem: "mpfi",
    boreRatio: 0,
    stroke: 0,
    compressionRatio: 0,
    horsepower: 0,
    peakRPM: 0,
    cityMPG: 0,
    highwayMPG: 0,
    brand: "",
    model: ""
  });

  // Mobile specific data
  const [mobileData, setMobileData] = useState({
    deviceName: "",
    ramExpandable: true,
    batteryCapacity: 0,
    displaySize: 0,
    storage: 0,
    ram: 0,
    refreshRate: 60,
    frontCamera: "",
    rearCamera: "",
    chargingSpeed: 0
  });

  const [showPriceSuggestion, setShowPriceSuggestion] = useState(false);
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [showTermsError, setShowTermsError] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        console.log('Fetching categories...');
        const activeCategories = await categoryService.getAllCategories();
        console.log('Fetched categories:', activeCategories);
        
        if (Array.isArray(activeCategories) && activeCategories.length > 0) {
          setCategories(activeCategories);
        } else {
          console.error('Categories is not an array or is empty:', activeCategories);
        }
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

  useEffect(() => {
    if (formData.category) {
      const categoryId = Number(formData.category);
      const category = categories.find(c => Number(c.id) === categoryId);
      console.log('Category selected:', {
        categoryId,
        category,
        formDataCategory: formData.category,
        type: typeof formData.category,
        categories
      });
      setSelectedCategory(category || null);
      
      // Reset form visibility when category changes
      setShowCategoryForm(false);
    } else {
      setSelectedCategory(null);
      setShowCategoryForm(false);
    }
  }, [formData.category, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
      if (name === 'terms' && checked) {
        setShowTermsError(false);
      }
    } else if (name === 'category') {
      // Ensure category is set as a string
      setFormData({ ...formData, [name]: value.toString() });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleLaptopDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setLaptopData({ ...laptopData, [name]: (e.target as HTMLInputElement).checked });
    } else if (type === 'number') {
      // Allow empty values (will be converted to '' which is falsy)
      setLaptopData({ ...laptopData, [name]: value === '' ? '' : parseFloat(value) });
    } else {
      setLaptopData({ ...laptopData, [name]: value });
    }
  };

  const handleCarDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'number') {
      // Allow empty values (will be converted to '' which is falsy)
      setCarData({ ...carData, [name]: value === '' ? '' : parseFloat(value) });
    } else {
      setCarData({ ...carData, [name]: value });
    }
  };

  const handleMobileDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setMobileData({ ...mobileData, [name]: (e.target as HTMLInputElement).checked });
    } else if (type === 'number') {
      // Allow empty values (will be converted to '' which is falsy)
      setMobileData({ ...mobileData, [name]: value === '' ? '' : parseFloat(value) });
    } else {
      setMobileData({ ...mobileData, [name]: value });
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

  const validateStep = () => {
    let stepErrors: any = {};
    
    if (activeStep === 1) {
      if (!formData.title.trim()) stepErrors.title = 'عنوان المزاد مطلوب';
      if (!formData.description.trim()) stepErrors.description = 'وصف المزاد مطلوب';
      if (!formData.category) stepErrors.category = 'يجب اختيار تصنيف';
      if (!formData.location.trim()) stepErrors.location = 'موقع المزاد مطلوب';
      
      // Skip category-specific validation if the form isn't visible
      // This allows users to proceed without filling in detailed fields
    } else if (activeStep === 2) {
      if (!formData.startingPrice || isNaN(Number(formData.startingPrice)) || Number(formData.startingPrice) <= 0) {
        stepErrors.startingPrice = 'سعر البدء يجب أن يكون أكبر من 0';
      }
      if (!formData.incrementAmount || isNaN(Number(formData.incrementAmount)) || Number(formData.incrementAmount) <= 0) {
        stepErrors.incrementAmount = 'الحد الأدنى للمزايدة يجب أن يكون أكبر من 0';
      }
      if (!formData.startDate) stepErrors.startDate = 'تاريخ بدء المزاد مطلوب';
      if (!formData.startTime) stepErrors.startTime = 'وقت بدء المزاد مطلوب';
      if (!formData.endDate) stepErrors.endDate = 'تاريخ انتهاء المزاد مطلوب';
      if (!formData.endTime) stepErrors.endTime = 'وقت انتهاء المزاد مطلوب';
      if (images.length === 0) stepErrors.images = 'يجب إضافة صورة واحدة على الأقل';
    } else if (activeStep === 3) {
      if (!formData.terms) setShowTermsError(true);
    }
    
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowTermsError(false);
    
    if (activeStep === 3 && !formData.terms) {
      setShowTermsError(true);
      return;
    }
    
    if (activeStep < 3) {
      if (validateStep()) {
        setActiveStep(activeStep + 1);
      }
    } else {
      try {
        setIsSubmitting(true);

        // Validate required fields
        if (!formData.title || !formData.description || !formData.category || !formData.startingPrice || !formData.endDate || !formData.endTime || !formData.location) {
          toast({
            title: "خطأ في النموذج",
            description: "جميع الحقول المطلوبة يجب ملؤها",
            variant: "destructive",
          });
          return;
        }

        // Format dates to match backend requirements
        const startDate = new Date(`${formData.startDate}T${formData.startTime}`);
        const endDate = new Date(`${formData.endDate}T${formData.endTime}`);

        // Validate dates
        if (endDate <= startDate) {
          toast({
            title: "خطأ في التاريخ",
            description: "تاريخ انتهاء المزاد يجب أن يكون بعد تاريخ البدء",
            variant: "destructive",
          });
          return;
        }

        // Create auction with exact backend format
        const auctionData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          address: formData.location.trim(),
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          reservePrice: Number(formData.startingPrice),
          bidIncrement: Number(formData.incrementAmount || 10),
          categoryId: Number(formData.category),
          images: images.length > 0 ? images : ["https://example.com/images/placeholder.jpg"],
          userId: Number(user?.id) || 1
        };

        // Validate auction data before sending
        if (!auctionData.title || !auctionData.description || !auctionData.address || 
            !auctionData.startDate || !auctionData.endDate || 
            !auctionData.reservePrice || !auctionData.bidIncrement || !auctionData.categoryId) {
          throw new Error('Missing required auction fields');
        }

        // Ensure all numeric fields are valid
        if (isNaN(auctionData.reservePrice) || isNaN(auctionData.bidIncrement) || isNaN(auctionData.categoryId)) {
          throw new Error('Invalid numeric values');
        }

        // Ensure dates are valid
        const startDateTime = new Date(auctionData.startDate);
        const endDateTime = new Date(auctionData.endDate);
        if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
          throw new Error('Invalid date format');
        }

        console.log('Creating auction with data:', JSON.stringify(auctionData, null, 2));
        const auctionResponse = await auctionService.createAuction(auctionData);
        console.log('Auction creation response:', auctionResponse);

        // On successful auction creation, show the modal
        setShowSuccessModal(true);
      } catch (error: any) {
        // Only log the error if it's not a successful creation
        if (!error.response?.data?.success) {
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
        }
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

  const getPredictedPrice = async () => {
    try {
      let price: number;

      if (formData.category === "8") { // Laptop category
        // Format laptop data according to API requirements
        const formattedLaptopData = {
          brand: laptopData.brand,
          processorName: laptopData.processorName,
          displayType: laptopData.displayType,
          gpu: laptopData.gpu,
          ramExpandable: laptopData.ramExpandable,
          processorSpeed: Number(laptopData.processorSpeed),
          displaySize: Number(laptopData.displaySize),
          ssdSize: Number(laptopData.ssdSize),
          hddSize: Number(laptopData.hddSize),
          ramSize: Number(laptopData.ramSize)
        };

        console.log('Sending laptop data:', formattedLaptopData);
        price = await predictionService.predictLaptopPrice(formattedLaptopData);
      } else if (formData.category === "2") { // Car category
        // Format car data according to API requirements
        const formattedCarData = {
          carId: Number(carData.carId),
          symboling: Number(carData.symboling),
          fuelType: carData.fuelType,
          aspiration: carData.aspiration,
          doorNumber: carData.doorNumber,
          carBody: carData.carBody,
          driveWheel: carData.driveWheel,
          engineLocation: carData.engineLocation,
          wheelBase: Number(carData.wheelBase),
          carLength: Number(carData.carLength),
          carWidth: Number(carData.carWidth),
          carHeight: Number(carData.carHeight),
          curbWeight: Number(carData.curbWeight),
          engineType: carData.engineType,
          cylinderNumber: carData.cylinderNumber,
          engineSize: Number(carData.engineSize),
          fuelSystem: carData.fuelSystem,
          boreRatio: Number(carData.boreRatio),
          stroke: Number(carData.stroke),
          compressionRatio: Number(carData.compressionRatio),
          horsepower: Number(carData.horsepower),
          peakRPM: Number(carData.peakRPM),
          cityMPG: Number(carData.cityMPG),
          highwayMPG: Number(carData.highwayMPG),
          brand: carData.brand,
          model: carData.model
        };

        console.log('Sending car data:', formattedCarData);
        price = await predictionService.predictCarPrice(formattedCarData);
      } else if (formData.category === "5") { // Mobile category
        // Format mobile data according to API requirements
        const formattedMobileData = {
          deviceName: mobileData.deviceName,
          ramExpandable: mobileData.ramExpandable,
          batteryCapacity: Number(mobileData.batteryCapacity),
          displaySize: Number(mobileData.displaySize),
          storage: Number(mobileData.storage),
          ram: Number(mobileData.ram),
          refreshRate: Number(mobileData.refreshRate),
          frontCamera: mobileData.frontCamera,
          rearCamera: mobileData.rearCamera,
          chargingSpeed: Number(mobileData.chargingSpeed)
        };

        console.log('Sending mobile data:', formattedMobileData);
        price = await predictionService.predictMobilePrice(formattedMobileData);
      } else {
        toast({
          title: "خطأ",
          description: "الرجاء اختيار فئة صحيحة",
          variant: "destructive"
        });
        return null;
      }

      if (!price || isNaN(price)) {
        throw new Error('Invalid price received from server');
      }

      setPredictedPrice(price);
      setShowPriceSuggestion(true);
      setFormData(prev => ({
        ...prev,
        startingPrice: price.toString()
      }));

      toast({
        title: "تم التنبؤ بالسعر",
        description: `السعر المقترح: ₪${price.toLocaleString()}`,
      });
    } catch (error: any) {
      console.error('Prediction error:', error);
      toast({
        title: "خطأ في التنبؤ بالسعر",
        description: error.message || "حدث خطأ أثناء التنبؤ بالسعر",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        <style>
          {`
            /* Chrome, Safari, Edge, Opera */
            input[type=number]::-webkit-inner-spin-button,
            input[type=number]::-webkit-outer-spin-button {
              -webkit-appearance: none;
              margin: 0;
            }
            
            /* Firefox */
            input[type=number] {
              -moz-appearance: textfield;
            }
          `}
        </style>
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
                    {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
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
                    {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                  </div>

                  <div>
                    <label htmlFor="category" className="block mb-2 text-sm font-medium">
                      الفئة <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={e => { handleChange(e); console.log('Selected category value:', e.target.value); }}
                      className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                      required
                    >
                      <option value="">اختر فئة</option>
                      {categories && categories.length > 0 ? (
                        categories.map(category => (
                          <option key={category.id} value={category.id.toString()}>
                            {category.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>جاري تحميل الفئات...</option>
                      )}
                    </select>
                    {errors.category && <div className="text-red-500 text-sm mt-1">{errors.category}</div>}
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
                    {errors.location && <div className="text-red-500 text-sm mt-1">{errors.location}</div>}
                  </div>

                  {/* Button to show/hide category-specific form */}
                  {formData.category && (formData.category === "8" || formData.category === "2" || formData.category === "5") && (
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={() => setShowCategoryForm(prev => !prev)}
                        className={`
                          w-full flex items-center justify-center gap-2 py-4 px-6 
                          ${showCategoryForm 
                            ? "bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-100" 
                            : "bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white"
                          } 
                          rounded-lg transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-1
                          font-semibold text-base
                        `}
                      >
                        {showCategoryForm ? (
                          <>
                            <span>إخفاء التفاصيل المتقدمة</span>
                          </>
                        ) : (
                          <>
                            <span className="animate-pulse">✨</span>
                            <span>إظهار التفاصيل المتقدمة</span>
                            <span className="animate-pulse">✨</span>
                          </>
                        )}
                      </button>
                      {!showCategoryForm && (
                        <div className="text-center mt-2 text-sm text-blue-600">
                          (قم بإدخال المزيد من التفاصيل للحصول على سعر مقترح)
                    </div>
                  )}
                    </div>
                  )}

                  {/* Category Specific Form */}
                  {formData.category && (
                    <CategorySpecificForm
                      category={formData.category}
                      laptopData={laptopData}
                      carData={carData}
                      mobileData={mobileData}
                      onLaptopDataChange={handleLaptopDataChange}
                      onCarDataChange={handleCarDataChange}
                      onMobileDataChange={handleMobileDataChange}
                      showForm={showCategoryForm}
                    />
                  )}

                  {/* AI Price Prediction Button - Only show when category form is visible */}
                  {showCategoryForm && (formData.category === "8" || formData.category === "2" || formData.category === "5") && (
                    <div className="mt-4">
                      <button
                        type="button"
                        onClick={getPredictedPrice}
                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white rounded-lg transition-all shadow-sm"
                      >
                        <Lightbulb className="h-5 w-5" />
                        <span>تحديد السعر التلقائي باستخدام الذكاء الاصطناعي</span>
                      </button>
                    </div>
                  )}
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
                  {(formData.category === "8" || formData.category === "2" || formData.category === "5") && (
                  <div className="bg-blue/5 dark:bg-blue/10 rounded-lg p-4 border border-blue/20 flex items-start gap-3 mb-2">
                    <Lightbulb className="h-5 w-5 text-blue shrink-0 mt-1" />
                    <div>
                      <h3 className="font-medium text-blue">تحديد السعر التلقائي باستخدام الذكاء الاصطناعي</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          يمكنك العودة للخطوة السابقة واظهار التفاصيل المتقدمة لاستخدام خوارزمية الذكاء الاصطناعي لتحليل السوق واقتراح السعر المثالي لمزادك.
                      </p>
                      <Link to="/ai-price-guide" className="text-sm text-blue hover:underline">
                        معرفة المزيد حول كيفية عمل هذه الميزة →
                      </Link>
                    </div>
                  </div>
                  )}

                  {/* Show AI Price Suggestion */}
                  {showPriceSuggestion && (
                    <AIPriceSuggestion
                      category={formData.category}
                      laptopData={laptopData}
                      carData={carData}
                      mobileData={mobileData}
                      onClose={() => setShowPriceSuggestion(false)}
                      onPriceSelect={(price) => {
                        setFormData(prev => ({
                          ...prev,
                          startingPrice: price.toString()
                        }));
                      }}
                    />
                  )}

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
                          step="0.01"
                          className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          required
                          min="1"
                        />
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₪</span>
                      </div>
                      {errors.startingPrice && <div className="text-red-500 text-sm mt-1">{errors.startingPrice}</div>}
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
                          step="0.01"
                          className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          required
                          min="1"
                        />
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₪</span>
                      </div>
                      {errors.incrementAmount && <div className="text-red-500 text-sm mt-1">{errors.incrementAmount}</div>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="startDate" className="block mb-2 text-sm font-medium">
                        تاريخ بدء المزاد <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="startDate"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-right"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          placeholder=""
                        />
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      </div>
                      {errors.startDate && <div className="text-red-500 text-sm mt-1">{errors.startDate}</div>}
                    </div>

                    <div>
                      <label htmlFor="startTime" className="block mb-2 text-sm font-medium">
                        وقت بدء المزاد <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          id="startTime"
                          name="startTime"
                          value={formData.startTime}
                          onChange={handleChange}
                          className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-right"
                          required
                          placeholder=""
                        />
                        <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      </div>
                      {errors.startTime && <div className="text-red-500 text-sm mt-1">{errors.startTime}</div>}
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
                          className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-right"
                          required
                          min={new Date().toISOString().split('T')[0]}
                          placeholder=""
                        />
                        <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      </div>
                      {errors.endDate && <div className="text-red-500 text-sm mt-1">{errors.endDate}</div>}
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
                          className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-right"
                          required
                          placeholder=""
                        />
                        <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      </div>
                      {errors.endTime && <div className="text-red-500 text-sm mt-1">{errors.endTime}</div>}
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
                    {errors.images && <div className="text-red-500 text-sm mt-2">{errors.images}</div>}
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

                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Details Section */}
                  <div className="md:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Info className="h-6 w-6 text-blue-500" />
                      ملخص المزاد
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <span className="text-gray-500 flex items-center gap-2">
                          <Tag className="h-4 w-4" /> عنوان المزاد
                        </span>
                        <div className="font-semibold text-lg">{formData.title || "غير محدد"}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 flex items-center gap-2">
                          <Building2 className="h-4 w-4" /> الفئة
                        </span>
                        <div className="font-semibold text-lg">{selectedCategory?.name || "غير محدد"}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 flex items-center gap-2">
                          <Info className="h-4 w-4" /> وصف المزاد
                        </span>
                        <div className="text-base">{formData.description || "غير محدد"}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 flex items-center gap-2">
                          <Gem className="h-4 w-4" /> سعر البدء
                        </span>
                        <div className="font-bold text-blue-600 text-lg">
                          {formData.startingPrice ? `₪ ${parseFloat(formData.startingPrice).toLocaleString()}` : "غير محدد"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 flex items-center gap-2">
                          <Tag className="h-4 w-4" /> الحد الأدنى للمزايدة
                        </span>
                        <div className="font-semibold">
                          {formData.incrementAmount ? `₪ ${parseFloat(formData.incrementAmount).toLocaleString()}` : "غير محدد"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> تاريخ ووقت البدء
                        </span>
                        <div className="font-semibold">
                          {formData.startDate && formData.startTime ? `${formData.startDate} ${formData.startTime}` : "غير محدد"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> تاريخ ووقت الانتهاء
                        </span>
                        <div className="font-semibold">
                          {formData.endDate && formData.endTime ? `${formData.endDate} ${formData.endTime}` : "غير محدد"}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 flex items-center gap-2">
                          <Sofa className="h-4 w-4" /> حالة العنصر
                        </span>
                        <div className="font-semibold">{formData.condition === "new" ? "جديد" : "مستعمل"}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> الموقع
                        </span>
                        <div className="font-semibold">{formData.location || "غير محدد"}</div>
                      </div>
                    </div>
                  </div>
                  {/* Images Section */}
                  <div className="flex flex-col items-center">
                    <h3 className="text-lg font-semibold mb-2">الصور</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {images.length > 0 ? images.map((src, idx) => (
                        <img
                          key={idx}
                          src={src}
                          alt={`Preview ${idx + 1}`}
                          className="h-24 w-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform"
                        />
                      )) : (
                        <span className="text-gray-400">لا توجد صور</span>
                      )}
                    </div>
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
                  <label className="flex items-center gap-2 cursor-pointer text-base font-medium">
                    <input
                      type="checkbox"
                      name="terms"
                      checked={formData.terms}
                      onChange={handleChange}
                      className="w-5 h-5 accent-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                    <span>
                      يرجى الموافقة على&nbsp;
                      <a href="/terms" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                        الشروط والأحكام
                      </a>
                      &nbsp;قبل المتابعة
                    </span>
                  </label>
                  {showTermsError && (
                    <div className="mt-2 text-red-600 text-sm font-semibold bg-red-50 border border-red-200 rounded-lg p-2">
                      يجب الموافقة على الشروط والأحكام للمتابعة
                    </div>
                  )}
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
                type={activeStep === 3 ? "submit" : "button"}
                className="btn-primary flex items-center gap-2"
                disabled={isSubmitting}
                onClick={(e) => {
                  if (activeStep < 3) {
                    e.preventDefault();
                    validateStep() && setActiveStep(prev => prev + 1);
                  }
                }}
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
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-10 max-w-md w-full text-center relative animate-fade-in">
            <div className="text-green-500 text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">تم إنشاء المزاد بنجاح!</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">سيتم مراجعة المزاد من قبل الإدارة قبل نشره.<br/>عند إغلاق هذه النافذة سيتم توجيهك إلى صفحة المزادات.</p>
            <button
              className="btn-primary w-full py-3 text-lg rounded-lg"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/auctions');
              }}
            >
              حسنًا، توجه إلى صفحة المزادات
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateAuction;
