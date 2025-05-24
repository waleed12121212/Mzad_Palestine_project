import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { categoryService, Category } from '@/services/categoryService';
import { listingService, CreateListingDto } from '@/services/listingService';
import { predictionService } from '@/services/predictionService';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import CategorySpecificForm from '@/components/forms/CategorySpecificForm';
import { 
  Calendar, 
  Clock, 
  Info, 
  Tag, 
  MapPin, 
  X, 
  Upload, 
  PlusCircle, 
  Lightbulb, 
  Camera,
  Building2,
  Car,
  Smartphone,
  Sofa,
  Gem,
  ArrowRight,
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
} from 'lucide-react';
import { imageService } from '@/services/imageService';
import AIPriceSuggestion from "@/components/ui/AIPriceSuggestion";

const CreateListing: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeStep, setActiveStep] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [showPriceSuggestion, setShowPriceSuggestion] = useState(false);
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    price: '',
    categoryId: '',
    endDate: '',
    endTime: '',
    condition: 'new' as 'new' | 'used',
    terms: false,
  });
  const [errors, setErrors] = useState<any>({});
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

  // Add useEffect to log when showCategoryForm changes
  useEffect(() => {
    console.log("showCategoryForm changed to:", showCategoryForm);
  }, [showCategoryForm]);

  useEffect(() => {
    if (!user) {
      toast({ title: 'يجب تسجيل الدخول أولاً', variant: 'destructive' });
      navigate('/login');
      return;
    }
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getAllCategories();
        setCategories(data);
      } catch {
        toast({ title: 'حدث خطأ أثناء تحميل التصنيفات', variant: 'destructive' });
      }
    };
    fetchCategories();
  }, [user, navigate]);

  useEffect(() => {
    if (formData.categoryId) {
      const category = categories.find(c => c.id === Number(formData.categoryId));
      setSelectedCategory(category || null);
      
      // Reset form visibility when categoryId changes
      setShowCategoryForm(false);
    } else {
      setSelectedCategory(null);
      setShowCategoryForm(false);
    }
  }, [formData.categoryId, categories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let checked = false;
    if (type === 'checkbox' && 'checked' in e.target) {
      checked = (e.target as HTMLInputElement).checked;
    }
    
    // Special handling for price field to limit decimal places
    if (name === 'price' && type === 'number') {
      // Allow users to clear the field
      if (value === '') {
        setFormData(prev => ({ ...prev, price: '' }));
        return;
      }
      
      // Limit to 2 decimal places for price
      const parsedValue = parseFloat(value);
      if (!isNaN(parsedValue)) {
        setFormData(prev => ({ ...prev, price: parsedValue.toString() }));
      }
      return;
    }
    
    // Special handling for category changes
    if (name === 'categoryId') {
      console.log("Category changed to:", value);
      // Reset category-specific data when category changes
      setShowCategoryForm(false);
      
      // Reset category-specific data based on the new category
      if (value === "8") { // Laptop
        setLaptopData({
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
      } else if (value === "2") { // Car
        setCarData({
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
      } else if (value === "5") { // Mobile
        setMobileData({
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
      }
    }
    
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
    if (name === 'terms' && checked) setShowTermsError(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
        const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB
        if (!isValidType) toast({ title: "نوع الملف غير مدعوم", description: "الرجاء استخدام صور بصيغة JPG, PNG, أو WEBP", variant: "destructive" });
        if (!isValidSize) toast({ title: "حجم الملف كبير جداً", description: "الحد الأقصى لحجم الصورة هو 5 ميجابايت", variant: "destructive" });
        return isValidType && isValidSize;
      });
      
      if (validFiles.length > 0) {
        setImages(prev => [...prev, ...validFiles.map(file => URL.createObjectURL(file))]);
      }
    }
  };

  const removeImage = (index: number) => {
    const urlToRemove = images[index];
    if (urlToRemove.startsWith('blob:')) {
      URL.revokeObjectURL(urlToRemove);
    }
    setImages(prev => prev.filter((_, i) => i !== index));
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

  const validateStep = () => {
    let stepErrors: any = {};
    if (activeStep === 1) {
      if (!formData.title.trim()) stepErrors.title = 'عنوان المنتج مطلوب';
      if (!formData.description.trim()) stepErrors.description = 'وصف المنتج مطلوب';
      if (!formData.address.trim()) stepErrors.address = 'موقع المنتج مطلوب';
      if (!formData.categoryId) stepErrors.categoryId = 'يجب اختيار تصنيف';

      // Validate category-specific fields only if the form is visible
      if (showCategoryForm) {
        if (formData.categoryId === "8") { // Laptop
          if (!laptopData.brand) stepErrors.laptopBrand = 'العلامة التجارية مطلوبة';
          if (!laptopData.processorName) stepErrors.laptopProcessor = 'نوع المعالج مطلوب';
          if (!laptopData.gpu) stepErrors.laptopGpu = 'كرت الشاشة مطلوب';
        } else if (formData.categoryId === "2") { // Car
          if (!carData.brand) stepErrors.carBrand = 'العلامة التجارية مطلوبة';
          if (!carData.model) stepErrors.carModel = 'موديل السيارة مطلوب';
          if (!carData.engineSize) stepErrors.carEngine = 'حجم المحرك مطلوب';
        } else if (formData.categoryId === "5") { // Mobile
          if (!mobileData.deviceName) stepErrors.mobileName = 'اسم الجهاز مطلوب';
          if (!mobileData.storage) stepErrors.mobileStorage = 'حجم التخزين مطلوب';
          if (!mobileData.ram) stepErrors.mobileRam = 'حجم الرام مطلوب';
        }
      }
    } else if (activeStep === 2) {
      if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
        stepErrors.price = 'السعر يجب أن يكون أكبر من 0';
      }
      if (!formData.endDate) stepErrors.endDate = 'تاريخ انتهاء العرض مطلوب';
      if (!formData.endTime) stepErrors.endDate = 'وقت انتهاء العرض مطلوب';
      if (images.length === 0) stepErrors.images = 'يجب إضافة صورة واحدة على الأقل';
      
      // Validate end date is in the future
      if (formData.endDate && formData.endTime) {
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);
        if (endDateTime <= new Date()) {
          stepErrors.endDate = 'تاريخ ووقت انتهاء العرض يجب أن يكون في المستقبل';
        }
      }
    } else if (activeStep === 3) {
      if (!formData.terms) setShowTermsError(true);
    }
    setErrors(stepErrors);
    return Object.keys(stepErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setActiveStep(s => s + 1);
  };
  const handlePrev = () => setActiveStep(s => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowTermsError(false);
    if (activeStep === 3 && !formData.terms) {
      setShowTermsError(true);
      return;
    }
    
    if (activeStep < 3) {
      if (validateStep()) {
        setActiveStep(prev => prev + 1);
      }
    } else {
      try {
        setIsSubmitting(true);

        // Validate required fields
        if (!formData.title || !formData.description || !formData.categoryId || 
            !formData.price || !formData.endDate || !formData.endTime || !formData.address) {
          toast({
            title: "خطأ في النموذج",
            description: "جميع الحقول المطلوبة يجب ملؤها",
            variant: "destructive",
          });
          return;
        }

        // Process images
        const processedImages: string[] = [];
        for (const imageUrl of images) {
          if (imageUrl.startsWith('blob:')) {
            try {
              const response = await fetch(imageUrl);
              const blob = await response.blob();
              const file = new File([blob], 'listing-image.jpg', { type: blob.type });
              const uploadResult = await imageService.uploadImage(file);
              processedImages.push(uploadResult.url);
            } catch (error) {
              console.error('Image upload error:', error);
              toast({
                title: "خطأ في رفع الصور",
                description: "فشل في رفع إحدى الصور. الرجاء المحاولة مرة أخرى.",
                variant: "destructive"
              });
              return;
            }
          } else {
            processedImages.push(imageUrl);
          }
        }

        // Format the end date with time
        const endDateTime = new Date(`${formData.endDate}T${formData.endTime}`);

        // Create listing data
        const listingData = {
          title: formData.title.trim(),
          description: formData.description.trim(),
          address: formData.address.trim(),
          price: Number(formData.price),
          categoryId: Number(formData.categoryId),
          endDate: endDateTime.toISOString(),
          images: processedImages,
          condition: formData.condition,
          // Add category-specific data
          ...(formData.categoryId === "8" && { laptopData }),
          ...(formData.categoryId === "2" && { carData }),
          ...(formData.categoryId === "5" && { mobileData })
        };

        // Validate listing data
        if (!listingData.title || !listingData.description || !listingData.address || 
            !listingData.price || !listingData.categoryId || !listingData.endDate) {
          throw new Error('Missing required listing fields');
        }

        // Ensure numeric fields are valid
        if (isNaN(listingData.price) || isNaN(listingData.categoryId)) {
          throw new Error('Invalid numeric values');
        }

        // Ensure date is valid
        const endDateTimeValid = new Date(listingData.endDate);
        if (isNaN(endDateTimeValid.getTime())) {
          throw new Error('Invalid date format');
        }

        console.log('Creating listing with data:', JSON.stringify(listingData, null, 2));
        const response = await listingService.createListing(listingData);
        console.log('Listing creation response:', response);

        setShowSuccessModal(true);
      } catch (error: any) {
        console.error('Listing creation error:', error);
        toast({
          title: "خطأ في إنشاء المنتج",
          description: error.message || "حدث خطأ أثناء إنشاء المنتج",
          variant: "destructive"
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const getPredictedPrice = async () => {
    try {
      let price: number;

      if (formData.categoryId === "8") { // Laptop category
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
      } else if (formData.categoryId === "2") { // Car category
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
      } else if (formData.categoryId === "5") { // Mobile category
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
        return;
      }

      if (!price || isNaN(price)) {
        throw new Error('Invalid price received from server');
      }

      // Round to 2 decimal places to keep it neat
      const formattedPrice = Math.round(price * 100) / 100;
      
      setPredictedPrice(formattedPrice);
      setShowPriceSuggestion(true);
      setFormData(prev => ({
        ...prev,
        price: formattedPrice.toString()
      }));

      toast({
        title: "تم التنبؤ بالسعر",
        description: `السعر المقترح: ₪${formattedPrice.toLocaleString()}`,
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
          <h1 className="heading-lg mb-2 text-center">إضافة منتج للبيع</h1>
          <p className="text-gray-600 dark:text-gray-300 text-center">أضف منتجك للبيع مباشرة على المنصة</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden rtl w-full mx-auto">
          {/* Stepper */}
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                {[1,2,3].map(step => (
                  <React.Fragment key={step}>
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${activeStep >= step ? 'bg-blue text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>{step}</span>
                    {step < 3 && <span className="mx-2 h-0.5 w-6 bg-gray-200 dark:bg-gray-700"></span>}
                  </React.Fragment>
                ))}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400">الخطوة {activeStep} من 3</div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {activeStep === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block mb-2 text-sm font-medium">عنوان المنتج <span className="text-red-500">*</span></label>
                  <Input 
                    name="title" 
                    value={formData.title} 
                    onChange={handleChange} 
                    placeholder="أدخل عنوان المنتج"
                    className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600" 
                  />
                  {errors.title && <div className="text-red-500 text-sm mt-1">{errors.title}</div>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">وصف المنتج <span className="text-red-500">*</span></label>
                  <Textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    placeholder="أدخل وصفاً تفصيلياً للمنتج" 
                    className="min-h-[100px] w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600" 
                  />
                  {errors.description && <div className="text-red-500 text-sm mt-1">{errors.description}</div>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">التصنيف <span className="text-red-500">*</span></label>
                  <select 
                    name="categoryId" 
                    value={formData.categoryId} 
                    onChange={handleChange} 
                    className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                  >
                    <option value="">اختر تصنيف</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {errors.categoryId && <div className="text-red-500 text-sm mt-1">{errors.categoryId}</div>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">حالة العنصر <span className="text-red-500">*</span></label>
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
                  <label className="block mb-2 text-sm font-medium">
                    الموقع <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="location"
                    name="address"
                    placeholder="مثال: رام الله، فلسطين"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                    required
                  />
                  {errors.address && <div className="text-red-500 text-sm mt-1">{errors.address}</div>}
                </div>

                {/* Button to show/hide category-specific form */}
                {formData.categoryId && (formData.categoryId === "8" || formData.categoryId === "2" || formData.categoryId === "5") && (
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => {
                        const newValue = !showCategoryForm;
                        console.log("Setting showCategoryForm to:", newValue);
                        setShowCategoryForm(newValue);
                      }}
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
                {formData.categoryId && (
                  <div className={showCategoryForm ? "block" : "hidden"}>
                    <CategorySpecificForm
                      category={formData.categoryId}
                      laptopData={laptopData}
                      carData={carData}
                      mobileData={mobileData}
                      onLaptopDataChange={handleLaptopDataChange}
                      onCarDataChange={handleCarDataChange}
                      onMobileDataChange={handleMobileDataChange}
                      showForm={true}
                    />
                    
                    {/* Display category-specific error messages */}
                    {formData.categoryId === "8" && (
                      <div className="mt-2">
                        {errors.laptopBrand && <div className="text-red-500 text-sm mt-1">{errors.laptopBrand}</div>}
                        {errors.laptopProcessor && <div className="text-red-500 text-sm mt-1">{errors.laptopProcessor}</div>}
                        {errors.laptopGpu && <div className="text-red-500 text-sm mt-1">{errors.laptopGpu}</div>}
                      </div>
                    )}
                    {formData.categoryId === "2" && (
                      <div className="mt-2">
                        {errors.carBrand && <div className="text-red-500 text-sm mt-1">{errors.carBrand}</div>}
                        {errors.carModel && <div className="text-red-500 text-sm mt-1">{errors.carModel}</div>}
                        {errors.carEngine && <div className="text-red-500 text-sm mt-1">{errors.carEngine}</div>}
                      </div>
                    )}
                    {formData.categoryId === "5" && (
                      <div className="mt-2">
                        {errors.mobileName && <div className="text-red-500 text-sm mt-1">{errors.mobileName}</div>}
                        {errors.mobileStorage && <div className="text-red-500 text-sm mt-1">{errors.mobileStorage}</div>}
                        {errors.mobileRam && <div className="text-red-500 text-sm mt-1">{errors.mobileRam}</div>}
                      </div>
                    )}
                  </div>
                )}

                {/* AI Price Prediction Button - Only show when category form is visible */}
                {showCategoryForm && (formData.categoryId === "8" || formData.categoryId === "2" || formData.categoryId === "5") && (
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={getPredictedPrice}
                      className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white rounded-lg transition-all shadow-sm mt-6"
                    >
                      <Lightbulb className="h-5 w-5" />
                      <span>تحديد السعر التلقائي باستخدام الذكاء الاصطناعي</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-6">
                {/* AI Price Info Banner */}
                {(formData.categoryId === "8" || formData.categoryId === "2" || formData.categoryId === "5") && (
                    <div className="bg-blue/5 dark:bg-blue/10 rounded-lg p-4 border border-blue/20 flex items-start gap-3 mb-2">
                      <Lightbulb className="h-5 w-5 text-blue shrink-0 mt-1" />
                      <div>
                        <h3 className="font-medium text-blue">تحديد السعر التلقائي باستخدام الذكاء الاصطناعي</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        يمكنك العودة للخطوة السابقة واستخدام خوارزمية الذكاء الاصطناعي لتحليل السوق واقتراح السعر المثالي لمنتجك.
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
                    category={formData.categoryId}
                    laptopData={laptopData}
                    carData={carData}
                    mobileData={mobileData}
                    onClose={() => setShowPriceSuggestion(false)}
                    onPriceSelect={(price) => {
                      setFormData(prev => ({
                        ...prev,
                        price: price.toString()
                      }));
                    }}
                  />
                )}

                <div>
                  <label className="block mb-2 text-sm font-medium">السعر <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Input 
                      name="price" 
                      type="number" 
                      value={formData.price} 
                      onChange={handleChange} 
                      placeholder="0" 
                      min={1}
                      step="0.01"
                      className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600" 
                    />
                    <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">₪</span>
                  </div>
                  {errors.price && <div className="text-red-500 text-sm mt-1">{errors.price}</div>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">تاريخ انتهاء العرض <span className="text-red-500">*</span></label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                  <Input 
                    name="endDate" 
                    type="date" 
                    value={formData.endDate} 
                    onChange={handleChange} 
                    min={new Date().toISOString().split('T')[0]}
                        className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-right" 
                        required
                        placeholder=""
                      />
                      <Calendar className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                    </div>
                    <div className="relative">
                      <Input 
                        name="endTime" 
                        type="time" 
                        value={formData.endTime} 
                        onChange={handleChange} 
                        className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-right" 
                        required
                        placeholder=""
                      />
                      <Clock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                    </div>
                  </div>
                  {errors.endDate && <div className="text-red-500 text-sm mt-1">{errors.endDate}</div>}
                </div>

                <div>
                  <label className="block mb-2 text-sm font-medium">صور المنتج <span className="text-red-500">*</span></label>
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
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
                          {images.map((src, idx) => (
                            <div key={idx} className="relative group">
                              <img src={src} alt={`Uploaded ${idx + 1}`} className="w-full h-24 object-cover rounded-lg" />
                              <button
                                type="button"
                                onClick={() => removeImage(idx)}
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
                  {errors.images && <div className="text-red-500 text-sm mt-1">{errors.images}</div>}
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2">مراجعة ونشر المنتج</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">راجع تفاصيل المنتج قبل النشر</p>
                </div>

                <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="md:col-span-2 space-y-6">
                    <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                      <Info className="h-6 w-6 text-blue-500" />
                      ملخص المنتج
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <span className="text-gray-500 flex items-center gap-2">
                          <Tag className="h-4 w-4" /> عنوان المنتج
                        </span>
                        <div className="font-semibold text-lg">{formData.title || 'غير محدد'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 flex items-center gap-2">
                          <Tag className="h-4 w-4" /> التصنيف
                        </span>
                        <div className="font-semibold text-lg">
                          {categories.find(c => c.id === Number(formData.categoryId))?.name || 'غير محدد'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 flex items-center gap-2">
                          <Info className="h-4 w-4" /> وصف المنتج
                        </span>
                        <div className="text-base">{formData.description || 'غير محدد'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 flex items-center gap-2">
                          <Tag className="h-4 w-4" /> السعر
                        </span>
                        <div className="font-bold text-blue-600 text-lg">
                          {formData.price ? `₪ ${parseFloat(formData.price).toLocaleString()}` : 'غير محدد'}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> تاريخ ووقت الانتهاء
                        </span>
                        <div className="font-semibold">{formData.endDate && formData.endTime ? 
                          `${formData.endDate} الساعة ${formData.endTime}` : 'غير محدد'}</div>
                      </div>
                      <div>
                        <span className="text-gray-500 flex items-center gap-2">
                          <MapPin className="h-4 w-4" /> الموقع
                        </span>
                        <div className="font-semibold">{formData.address || 'غير محدد'}</div>
                      </div>
                    </div>
                  </div>
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
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveStep(prev => prev - 1)}
                  disabled={isSubmitting}
                >
                  العودة للخطوة السابقة
                </Button>
              ) : (
                <div></div>
              )}
              {activeStep < 3 ? (
                <Button
                  type="button"
                  className="btn-primary flex items-center gap-2"
                  onClick={() => {
                    if (validateStep()) {
                      setActiveStep(prev => prev + 1);
                    }
                  }}
                  disabled={isSubmitting}
                >
                  التالي
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="btn-primary flex items-center gap-2"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'جاري الحفظ...' : 'إنشاء المنتج'}
                </Button>
              )}
            </div>
          </form>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-10 max-w-md w-full text-center relative animate-fade-in">
            <div className="text-green-500 text-6xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800 dark:text-white">تم إنشاء المنتج بنجاح!</h2>
            <p className="mb-6 text-gray-600 dark:text-gray-300">
              سيتم مراجعة المنتج من قبل الإدارة قبل نشره.<br/>
              عند إغلاق هذه النافذة سيتم توجيهك إلى صفحة المنتجات.
            </p>
            <Button
              className="btn-primary w-full py-3 text-lg rounded-lg"
              onClick={() => {
                setShowSuccessModal(false);
                navigate('/buy-now');
              }}
            >
              حسنًا، توجه إلى صفحة المنتجات
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateListing; 