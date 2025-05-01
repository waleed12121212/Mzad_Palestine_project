import React, { useState } from "react";
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
  DollarSign, 
  MapPin, 
  Info, 
  ArrowRight, 
  X,
  Upload,
  Truck
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AIPriceSuggestion from "@/components/ui/AIPriceSuggestion";

const SellProduct = () => {
  const { toast } = useToast();
  const [activeStep, setActiveStep] = useState(1);
  const [images, setImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    subcategory: "",
    price: "",
    negotiable: true,
    location: "",
    condition: "new" as "new" | "used",
    shipping: "seller",
    terms: false
  });

  const categories = [
    {
      id: "real-estate",
      name: "العقارات",
      icon: <Building2 className="h-6 w-6" />,
      subcategories: [
        { id: "apartments", name: "شقق" },
        { id: "lands", name: "أراضي" },
        { id: "commercial", name: "عقارات تجارية" },
      ],
    },
    {
      id: "vehicles",
      name: "المركبات",
      icon: <Car className="h-6 w-6" />,
      subcategories: [
        { id: "cars", name: "سيارات" },
        { id: "motorcycles", name: "دراجات نارية" },
        { id: "trucks", name: "شاحنات" },
      ],
    },
    {
      id: "electronics",
      name: "الإلكترونيات",
      icon: <Smartphone className="h-6 w-6" />,
      subcategories: [
        { id: "mobile", name: "هواتف محمولة" },
        { id: "computers", name: "أجهزة كمبيوتر" },
        { id: "tvs", name: "تلفزيونات" },
      ],
    },
    {
      id: "furniture",
      name: "الأثاث",
      icon: <Sofa className="h-6 w-6" />,
      subcategories: [
        { id: "living", name: "غرف معيشة" },
        { id: "bedroom", name: "غرف نوم" },
        { id: "kitchen", name: "مطابخ" },
      ],
    },
    {
      id: "antiques",
      name: "التحف والمقتنيات",
      icon: <Gem className="h-6 w-6" />,
      subcategories: [
        { id: "jewelry", name: "مجوهرات" },
        { id: "art", name: "فنون" },
        { id: "collectibles", name: "قطع نادرة" },
      ],
    },
  ];

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

  // Add after the categories array
  const [additionalFields, setAdditionalFields] = useState<Record<string, string>>({});
  
  const categorySpecificFields = {
  electronics: {
    computers: [
      { id: 'processor', name: 'المعالج', placeholder: 'مثال: Intel Core i7-11700K' },
      { id: 'ram', name: 'الذاكرة العشوائية', placeholder: 'مثال: 16GB DDR4' },
      { id: 'storage_hdd', name: 'القرص الصلب HDD', placeholder: 'مثال: 1TB HDD' },
      { id: 'storage_ssd', name: 'القرص الصلب SSD', placeholder: 'مثال: 512GB SSD' },
      { id: 'battery_health', name: 'حالة البطارية', placeholder: 'مثال: 85%' },
      { id: 'graphics_card', name: 'كرت الشاشة', placeholder: 'مثال: NVIDIA RTX 3060' }
    ],
    mobile: [
      { id: 'storage', name: 'سعة التخزين', placeholder: 'مثال: 128GB' },
      { id: 'ram', name: 'الذاكرة العشوائية', placeholder: 'مثال: 8GB' },
      { id: 'battery_health', name: 'حالة البطارية', placeholder: 'مثال: 90%' },
      { id: 'screen_condition', name: 'حالة الشاشة', placeholder: 'مثال: ممتازة، بدون خدوش' }
    ],
    tvs: [
      { id: 'screen_size', name: 'حجم الشاشة', placeholder: 'مثال: 55 inch' },
      { id: 'screen_type', name: 'نوع الشاشة', placeholder: 'مثال: OLED, LED' },
      { id: 'resolution', name: 'دقة الشاشة', placeholder: 'مثال: 4K UHD' }
    ]
  },
  vehicles: {
    cars: [
      { id: 'make', name: 'الشركة المصنعة', placeholder: 'مثال: Toyota' },
      { id: 'model', name: 'الموديل', placeholder: 'مثال: Camry' },
      { id: 'year', name: 'سنة الصنع', placeholder: 'مثال: 2020' },
      { id: 'mileage', name: 'عدد الكيلومترات', placeholder: 'مثال: 50000' },
      { id: 'fuel_type', name: 'نوع الوقود', placeholder: 'مثال: بنزين' },
      { id: 'transmission', name: 'ناقل الحركة', placeholder: 'مثال: أوتوماتيك' }
    ]
  },
  'real-estate': {
    apartments: [
      { id: 'area', name: 'المساحة', placeholder: 'مثال: 150 متر مربع' },
      { id: 'rooms', name: 'عدد الغرف', placeholder: 'مثال: 3' },
      { id: 'bathrooms', name: 'عدد الحمامات', placeholder: 'مثال: 2' },
      { id: 'floor', name: 'الطابق', placeholder: 'مثال: الثالث' }
    ]
  }
};

// Add these functions after the handleChange function
const handleAdditionalFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target;
  setAdditionalFields(prev => ({ ...prev, [name]: value }));
};

// Add this function to render the additional fields
const renderAdditionalFields = () => {
  const category = formData.category as keyof typeof categorySpecificFields;
  const subcategory = formData.subcategory;
  
  if (!categorySpecificFields[category] || !categorySpecificFields[category][subcategory]) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium mb-2">معلومات إضافية</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {categorySpecificFields[category][subcategory].map(field => (
          <div key={field.id}>
            <label htmlFor={field.id} className="block mb-2 text-sm font-medium">
              {field.name}
            </label>
            <input
              type="text"
              id={field.id}
              name={field.id}
              placeholder={field.placeholder}
              value={additionalFields[field.id] || ''}
              onChange={handleAdditionalFieldChange}
              className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Add this inside the form, after the location input in Step 1
{activeStep === 1 && renderAdditionalFields()}

// Modify the handleSubmit function to include additional fields
const handleSubmit = (e: React.FormEvent) => {
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
    console.log("Form submitted", { 
      ...formData, 
      images,
      additionalFields  // Additional fields included in submission
    });
    toast({
      title: "تم إنشاء الإعلان بنجاح",
      description: "سيتم مراجعة الإعلان من قبل الإدارة قبل نشره",
    });
    
    setTimeout(() => {
      window.location.href = "/";
    }, 2000);
  }
};

  const goToPreviousStep = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleAIPriceSelect = (suggestedPrice: number) => {
    setFormData(prev => ({ ...prev, price: suggestedPrice.toString() }));
  };

  const selectedCategory = categories.find(c => c.id === formData.category);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        <div className="mb-8 rtl">
          <h1 className="heading-lg mb-2">بيع منتج</h1>
          <p className="text-gray-600 dark:text-gray-300">
            قم بإنشاء إعلان بيع جديد لعرض منتجك على منصة مزاد فلسطين
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden rtl">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  activeStep >= 1 ? "bg-green text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}>
                  1
                </span>
                <span className="mx-2 h-0.5 w-6 bg-gray-200 dark:bg-gray-700"></span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  activeStep >= 2 ? "bg-green text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                }`}>
                  2
                </span>
                <span className="mx-2 h-0.5 w-6 bg-gray-200 dark:bg-gray-700"></span>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  activeStep >= 3 ? "bg-green text-white" : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
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
                  <h2 className="text-xl font-semibold mb-2">معلومات المنتج الأساسية</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    قم بإدخال المعلومات الأساسية للمنتج الذي ترغب في بيعه
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="title" className="block mb-2 text-sm font-medium">
                      عنوان المنتج <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      placeholder="مثال: iPhone 13 Pro Max - 256GB"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="description" className="block mb-2 text-sm font-medium">
                      وصف المنتج <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      rows={4}
                      placeholder="اكتب وصفاً تفصيلياً للمنتج"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      <label htmlFor="subcategory" className="block mb-2 text-sm font-medium">
                        الفئة الفرعية <span className="text-red-500">*</span>
                      </label>
                      <select
                        id="subcategory"
                        name="subcategory"
                        value={formData.subcategory}
                        onChange={handleChange}
                        className="w-full py-3 px-4 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                        disabled={!formData.category}
                        required
                      >
                        <option value="">اختر فئة فرعية</option>
                        {selectedCategory?.subcategories.map(subcat => (
                          <option key={subcat.id} value={subcat.id}>
                            {subcat.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      حالة المنتج <span className="text-red-500">*</span>
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
                    <div className="relative">
                      <input
                        type="text"
                        id="location"
                        name="location"
                        placeholder="مثال: رام الله، فلسطين"
                        value={formData.location}
                        onChange={handleChange}
                        className="w-full py-3 px-4 pl-10 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                        required
                      />
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 2 && (
              <div className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2">تفاصيل السعر والصور</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    أضف تفاصيل السعر وصور المنتج
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <AIPriceSuggestion
                    category={formData.category}
                    subcategory={formData.subcategory}
                    title={formData.title}
                    description={formData.description}
                    condition={formData.condition}
                    location={formData.location}
                    onPriceSelect={handleAIPriceSelect}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                      <label htmlFor="price" className="block mb-2 text-sm font-medium">
                        السعر (₪) <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          id="price"
                          name="price"
                          placeholder="0"
                          value={formData.price}
                          onChange={handleChange}
                          className="w-full py-3 px-4 pl-10 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600"
                          required
                          min="1"
                        />
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-5 w-5" />
                      </div>
                    </div>

                    <div>
                      <label className="block mb-2 text-sm font-medium">
                        قابل للتفاوض؟
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="negotiable"
                            value="true"
                            checked={formData.negotiable === true}
                            onChange={() => setFormData({...formData, negotiable: true})}
                            className="ml-2"
                          />
                          نعم
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="negotiable"
                            value="false"
                            checked={formData.negotiable === false}
                            onChange={() => setFormData({...formData, negotiable: false})}
                            className="ml-2"
                          />
                          لا
                        </label>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      خيارات الشحن <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <input
                          type="radio"
                          name="shipping"
                          value="seller"
                          checked={formData.shipping === "seller"}
                          onChange={handleChange}
                          className="ml-3"
                        />
                        <div>
                          <h4 className="font-medium">توصيل البائع</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">سأقوم بتوصيل المنتج بنفسي</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                        <input
                          type="radio"
                          name="shipping"
                          value="buyer"
                          checked={formData.shipping === "buyer"}
                          onChange={handleChange}
                          className="ml-3"
                        />
                        <div>
                          <h4 className="font-medium">استلام المشتري</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400">على المشتري الحضور لاستلام المنتج</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      صور المنتج <span className="text-red-500">*</span>
                    </label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                      {images.length === 0 ? (
                        <>
                          <Camera className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                            اسحب وأفلت الصور هنا، أو اضغط لتحميل الصور
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
                            className="mt-4 px-4 py-2 bg-green/10 text-green rounded-lg hover:bg-green/20 transition-colors"
                          >
                            <Upload className="h-4 w-4 inline-block mr-2" />
                            تحميل الصور
                          </button>
                        </>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
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
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 3 && (
              <div className="space-y-6">
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-2">مراجعة ونشر الإعلان</h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    راجع تفاصيل المنتج قبل النشر
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                  <h3 className="font-semibold text-lg mb-4">ملخص الإعلان</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm text-gray-500">عنوان المنتج</h4>
                        <p className="font-medium">{formData.title}</p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-500">الفئة</h4>
                        <p className="font-medium">
                          {selectedCategory?.name}
                          {formData.subcategory && selectedCategory && (
                            <span> / {selectedCategory.subcategories.find(s => s.id === formData.subcategory)?.name}</span>
                          )}
                        </p>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm text-gray-500">وصف المنتج</h4>
                      <p>{formData.description}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <h4 className="text-sm text-gray-500">السعر</h4>
                        <p className="font-medium text-green">
                          ₪ {parseFloat(formData.price).toLocaleString()}
                          {formData.negotiable && <span className="text-sm text-gray-500 mr-2">(قابل للتفاوض)</span>}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-500">طريقة التسليم</h4>
                        <p className="font-medium">
                          {formData.shipping === "seller" ? "توصيل البائع" : "استلام المشتري"}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-sm text-gray-500">حالة المنتج</h4>
                        <p className="font-medium">{formData.condition === "new" ? "جديد" : "مستعمل"}</p>
                      </div>
                    </div>

                    {/* Additional fields review section */}
                    {Object.keys(additionalFields).length > 0 && (
                      <div>
                        <h4 className="text-sm text-gray-500 mb-2">معلومات إضافية</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(additionalFields).map(([key, value]) => {
                            const field = categorySpecificFields[formData.category as keyof typeof categorySpecificFields]?.[formData.subcategory]?.find(f => f.id === key);
                            return field ? (
                              <div key={key}>
                                <h5 className="text-sm text-gray-500">{field.name}</h5>
                                <p className="font-medium">{value}</p>
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}

                    {images.length > 0 && (
                      <div>
                        <h4 className="text-sm text-gray-500 mb-2">الصور</h4>
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
                      أوافق على <a href="/terms" className="text-blue hover:underline">شروط وأحكام</a> المنصة
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
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  السابق
                </button>
              ) : (
                <div></div>
              )}
              
              <button
                type="submit"
                className="bg-green text-white px-6 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                {activeStep < 3 ? (
                  <>
                    التالي
                    <ArrowRight className="h-4 w-4 inline-block mr-2" />
                  </>
                ) : (
                  "نشر الإعلان"
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

export default SellProduct;