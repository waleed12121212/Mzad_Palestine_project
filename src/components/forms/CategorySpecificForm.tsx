import React from 'react';
import {
  Laptop,
  Cpu,
  HardDrive,
  Monitor,
  Gauge,
  Car,
  Battery,
  Smartphone,
  Ruler,
  Droplets,
  Settings,
  Wind,
  DoorOpen,
  Cog,
  RefreshCw,
  Camera,
  Zap,
  Plus,
  Tv,
  Maximize,
  Database,
  Layers,
  Tag
} from 'lucide-react';

interface CategorySpecificFormProps {
  category: string;
  laptopData: {
    brand: string;
    processorName: string;
    displayType: string;
    gpu: string;
    ramExpandable: boolean;
    processorSpeed: number;
    displaySize: number;
    ssdSize: number;
    hddSize: number;
    ramSize: number;
  };
  carData: {
    carId: number;
    symboling: number;
    fuelType: string;
    aspiration: string;
    doorNumber: string;
    carBody: string;
    driveWheel: string;
    engineLocation: string;
    wheelBase: number;
    carLength: number;
    carWidth: number;
    carHeight: number;
    curbWeight: number;
    engineType: string;
    cylinderNumber: string;
    engineSize: number;
    fuelSystem: string;
    boreRatio: number;
    stroke: number;
    compressionRatio: number;
    horsepower: number;
    peakRPM: number;
    cityMPG: number;
    highwayMPG: number;
    brand: string;
    model: string;
  };
  mobileData: {
    deviceName: string;
    ramExpandable: boolean;
    batteryCapacity: number;
    displaySize: number;
    storage: number;
    ram: number;
    refreshRate: number;
    frontCamera: string;
    rearCamera: string;
    chargingSpeed: number;
  };
  onLaptopDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onCarDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onMobileDataChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  showForm?: boolean;
}

const CategorySpecificForm: React.FC<CategorySpecificFormProps> = ({
  category,
  laptopData,
  carData,
  mobileData,
  onLaptopDataChange,
  onCarDataChange,
  onMobileDataChange,
  showForm = false
}) => {
  if (!showForm) return null;

  const formClasses = "grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm";
  const inputClasses = "w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const numberInputClasses = `${inputClasses} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`;
  const labelClasses = "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300";
  const requiredStar = <span className="text-red-500 ml-1">*</span>;

  const cat = category?.toString();
  if (cat === "8") { // Laptop
    return (
      <div className={formClasses}>
        <div className="col-span-2 mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Laptop className="h-5 w-5" />
          <h3 className="font-semibold text-lg">معلومات اللابتوب</h3>
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Tag className="h-4 w-4 text-gray-500" />
            العلامة التجارية {requiredStar}
          </label>
          <input
            type="text"
            name="brand"
            value={laptopData.brand}
            onChange={onLaptopDataChange}
            className={inputClasses}
            placeholder="مثال: Lenovo"
            required
          />
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Cpu className="h-4 w-4 text-gray-500" />
            اسم المعالج {requiredStar}
          </label>
          <input
            type="text"
            name="processorName"
            value={laptopData.processorName}
            onChange={onLaptopDataChange}
            className={inputClasses}
            placeholder="مثال: Intel Core i7-12700H"
            required
          />
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Tv className="h-4 w-4 text-gray-500" />
            نوع الشاشة {requiredStar}
          </label>
          <select
            name="displayType"
            value={laptopData.displayType}
            onChange={onLaptopDataChange}
            className={inputClasses}
            required
          >
            <option value="LED">LED</option>
            <option value="OLED">OLED</option>
            <option value="LCD">LCD</option>
          </select>
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Monitor className="h-4 w-4 text-gray-500" />
            كرت الشاشة {requiredStar}
          </label>
          <input
            type="text"
            name="gpu"
            value={laptopData.gpu}
            onChange={onLaptopDataChange}
            className={inputClasses}
            placeholder="مثال: NVIDIA GeForce RTX 3060"
            required
          />
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Gauge className="h-4 w-4 text-gray-500" />
            سرعة المعالج (GHz) {requiredStar}
          </label>
          <input
            type="number"
            name="processorSpeed"
            value={laptopData.processorSpeed || ''}
            onChange={onLaptopDataChange}
            className={numberInputClasses}
            placeholder="مثال: 3.5"
            step="0.1"
            min="0"
            required
          />
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Maximize className="h-4 w-4 text-gray-500" />
            حجم الشاشة (بوصة) {requiredStar}
          </label>
          <input
            type="number"
            name="displaySize"
            value={laptopData.displaySize || ''}
            onChange={onLaptopDataChange}
            className={numberInputClasses}
            placeholder="مثال: 15.6"
            step="0.1"
            min="0"
            required
          />
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <HardDrive className="h-4 w-4 text-gray-500" />
            حجم SSD (GB) {requiredStar}
          </label>
          <input
            type="number"
            name="ssdSize"
            value={laptopData.ssdSize || ''}
            onChange={onLaptopDataChange}
            className={numberInputClasses}
            placeholder="مثال: 512"
            min="0"
            required
          />
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Database className="h-4 w-4 text-gray-500" />
            حجم HDD (GB) {requiredStar}
          </label>
          <input
            type="number"
            name="hddSize"
            value={laptopData.hddSize || ''}
            onChange={onLaptopDataChange}
            className={numberInputClasses}
            placeholder="مثال: 1000"
            min="0"
            required
          />
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Layers className="h-4 w-4 text-gray-500" />
            حجم الرام (GB) {requiredStar}
          </label>
          <input
            type="number"
            name="ramSize"
            value={laptopData.ramSize || ''}
            onChange={onLaptopDataChange}
            className={numberInputClasses}
            placeholder="مثال: 16"
            min="0"
            required
          />
        </div>

        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            name="ramExpandable"
            checked={laptopData.ramExpandable}
            onChange={onLaptopDataChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <Plus className="h-4 w-4 text-gray-500" />
            الرام قابل للتوسعة
          </label>
        </div>
      </div>
    );
  }

  if (cat === "2") { // Car
    return (
      <div className={formClasses}>
        <div className="col-span-2 mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Car className="h-5 w-5" />
          <h3 className="font-semibold text-lg">معلومات السيارة</h3>
        </div>

        <input type="hidden" name="carId" value="1" />
        <input type="hidden" name="symboling" value="3" />

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Car className="h-4 w-4 text-gray-500" />
            العلامة التجارية {requiredStar}
          </label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={carData.brand}
            onChange={onCarDataChange}
            className={inputClasses}
            required
          />
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Car className="h-4 w-4 text-gray-500" />
            الموديل {requiredStar}
          </label>
          <input
            type="text"
            id="model"
            name="model"
            value={carData.model}
            onChange={onCarDataChange}
            className={inputClasses}
            required
          />
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Droplets className="h-4 w-4 text-gray-500" />
            نوع الوقود {requiredStar}
          </label>
          <select
            id="fuelType"
            name="fuelType"
            value={carData.fuelType}
            onChange={onCarDataChange}
            className={inputClasses}
            required
          >
            <option value="">اختر نوع الوقود</option>
            <option value="gas">بنزين</option>
            <option value="diesel">ديزل</option>
          </select>
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Wind className="h-4 w-4 text-gray-500" />
            نوع الشحن {requiredStar}
          </label>
          <select
            id="aspiration"
            name="aspiration"
            value={carData.aspiration}
            onChange={onCarDataChange}
            className={inputClasses}
            required
          >
            <option value="">اختر نوع الشحن</option>
            <option value="std">عادي</option>
            <option value="turbo">تيربو</option>
          </select>
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <DoorOpen className="h-4 w-4 text-gray-500" />
            عدد الأبواب {requiredStar}
          </label>
          <select
            id="doorNumber"
            name="doorNumber"
            value={carData.doorNumber}
            onChange={onCarDataChange}
            className={inputClasses}
            required
          >
            <option value="">اختر عدد الأبواب</option>
            <option value="two">بابين</option>
            <option value="four">أربعة أبواب</option>
          </select>
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Car className="h-4 w-4 text-gray-500" />
            نوع الهيكل {requiredStar}
          </label>
          <select
            id="carBody"
            name="carBody"
            value={carData.carBody}
            onChange={onCarDataChange}
            className={inputClasses}
            required
          >
            <option value="">اختر نوع الهيكل</option>
            <option value="sedan">سيدان</option>
            <option value="hatchback">هاتشباك</option>
            <option value="wagon">واجن</option>
            <option value="hardtop">هارد توب</option>
            <option value="convertible">مكشوف</option>
          </select>
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Cog className="h-4 w-4 text-gray-500" />
            نظام الدفع {requiredStar}
          </label>
          <select
            id="driveWheel"
            name="driveWheel"
            value={carData.driveWheel}
            onChange={onCarDataChange}
            className={inputClasses}
            required
          >
            <option value="">اختر نظام الدفع</option>
            <option value="fwd">دفع أمامي</option>
            <option value="rwd">دفع خلفي</option>
            <option value="4wd">دفع رباعي</option>
          </select>
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Settings className="h-4 w-4 text-gray-500" />
            موقع المحرك {requiredStar}
          </label>
          <select
            id="engineLocation"
            name="engineLocation"
            value={carData.engineLocation}
            onChange={onCarDataChange}
            className={inputClasses}
            required
          >
            <option value="front">أمامي</option>
            <option value="rear">خلفي</option>
          </select>
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Ruler className="h-4 w-4 text-gray-500" />
            قاعدة العجلات (بوصة) {requiredStar}
          </label>
          <input
            type="number"
            id="wheelBase"
            name="wheelBase"
            value={carData.wheelBase || ''}
            onChange={onCarDataChange}
            step="0.1"
            className={numberInputClasses}
            required
          />
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Ruler className="h-4 w-4 text-gray-500" />
            طول السيارة (بوصة) {requiredStar}
          </label>
          <input
            type="number"
            id="carLength"
            name="carLength"
            value={carData.carLength || ''}
            onChange={onCarDataChange}
            step="0.1"
            className={numberInputClasses}
            required
          />
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Ruler className="h-4 w-4 text-gray-500" />
            عرض السيارة (بوصة) {requiredStar}
          </label>
          <input
            type="number"
            id="carWidth"
            name="carWidth"
            value={carData.carWidth || ''}
            onChange={onCarDataChange}
            step="0.1"
            className={numberInputClasses}
            required
          />
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Ruler className="h-4 w-4 text-gray-500" />
            ارتفاع السيارة (بوصة) {requiredStar}
          </label>
          <input
            type="number"
            id="carHeight"
            name="carHeight"
            value={carData.carHeight || ''}
            onChange={onCarDataChange}
            step="0.1"
            className={numberInputClasses}
            required
          />
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Gauge className="h-4 w-4 text-gray-500" />
            وزن السيارة (كجم) {requiredStar}
          </label>
          <input
            type="number"
            id="curbWeight"
            name="curbWeight"
            value={carData.curbWeight || ''}
            onChange={onCarDataChange}
            className={numberInputClasses}
            required
          />
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Settings className="h-4 w-4 text-gray-500" />
            نوع المحرك {requiredStar}
          </label>
          <select
            id="engineType"
            name="engineType"
            value={carData.engineType}
            onChange={onCarDataChange}
            className={inputClasses}
            required
          >
            <option value="dohc">DOHC</option>
            <option value="ohc">OHC</option>
            <option value="l">L</option>
            <option value="ohcv">OHCV</option>
            <option value="ohcf">OHCF</option>
          </select>
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Ruler className="h-4 w-4 text-gray-500" />
            عدد الاسطوانات {requiredStar}
          </label>
          <select
            id="cylinderNumber"
            name="cylinderNumber"
            value={carData.cylinderNumber}
            onChange={onCarDataChange}
            className={inputClasses}
            required
          >
            <option value="two">2 اسطوانة</option>
            <option value="three">3 اسطوانات</option>
            <option value="four">4 اسطوانات</option>
            <option value="five">5 اسطوانات</option>
            <option value="six">6 اسطوانات</option>
            <option value="eight">8 اسطوانات</option>
            <option value="twelve">12 اسطوانة</option>
          </select>
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Ruler className="h-4 w-4 text-gray-500" />
            حجم المحرك (CC) {requiredStar}
          </label>
          <input
            type="number"
            id="engineSize"
            name="engineSize"
            value={carData.engineSize || ''}
            onChange={onCarDataChange}
            step="0.1"
            className={numberInputClasses}
            required
          />
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Droplets className="h-4 w-4 text-gray-500" />
            نظام الوقود {requiredStar}
          </label>
          <select
            id="fuelSystem"
            name="fuelSystem"
            value={carData.fuelSystem}
            onChange={onCarDataChange}
            className={inputClasses}
            required
          >
            <option value="mpfi">MPFI</option>
            <option value="2bbl">2BBL</option>
            <option value="mfi">MFI</option>
            <option value="1bbl">1BBL</option>
            <option value="spfi">SPFI</option>
            <option value="4bbl">4BBL</option>
            <option value="idi">IDI</option>
          </select>
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Settings className="h-4 w-4 text-gray-500" />
            نسبة التجويف {requiredStar}
          </label>
          <input
            type="number"
            id="boreRatio"
            name="boreRatio"
            value={carData.boreRatio || ''}
            onChange={onCarDataChange}
            step="0.01"
            className={numberInputClasses}
            required
          />
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Settings className="h-4 w-4 text-gray-500" />
            الشوط {requiredStar}
          </label>
          <input
            type="number"
            id="stroke"
            name="stroke"
            value={carData.stroke || ''}
            onChange={onCarDataChange}
            step="0.01"
            className={numberInputClasses}
            required
          />
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Settings className="h-4 w-4 text-gray-500" />
            نسبة الانضغاط {requiredStar}
          </label>
          <input
            type="number"
            id="compressionRatio"
            name="compressionRatio"
            value={carData.compressionRatio || ''}
            onChange={onCarDataChange}
            step="0.1"
            className={numberInputClasses}
            required
          />
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Gauge className="h-4 w-4 text-gray-500" />
            القوة الحصانية {requiredStar}
          </label>
          <input
            type="number"
            id="horsepower"
            name="horsepower"
            value={carData.horsepower || ''}
            onChange={onCarDataChange}
            className={numberInputClasses}
            required
          />
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Gauge className="h-4 w-4 text-gray-500" />
            الدوران الأقصى (RPM) {requiredStar}
          </label>
          <input
            type="number"
            id="peakRPM"
            name="peakRPM"
            value={carData.peakRPM || ''}
            onChange={onCarDataChange}
            className={numberInputClasses}
            required
          />
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Droplets className="h-4 w-4 text-gray-500" />
            استهلاك الوقود في المدينة (MPG) {requiredStar}
          </label>
          <input
            type="number"
            id="cityMPG"
            name="cityMPG"
            value={carData.cityMPG || ''}
            onChange={onCarDataChange}
            className={numberInputClasses}
            required
          />
        </div>
        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Droplets className="h-4 w-4 text-gray-500" />
            استهلاك الوقود على الطريق السريع (MPG) {requiredStar}
          </label>
          <input
            type="number"
            id="highwayMPG"
            name="highwayMPG"
            value={carData.highwayMPG || ''}
            onChange={onCarDataChange}
            className={numberInputClasses}
            required
          />
        </div>
      </div>
    );
  }

  if (cat === "5") { // Mobile
    return (
      <div className={formClasses}>
        <div className="col-span-2 mb-4 flex items-center gap-2 text-blue-600 dark:text-blue-400">
          <Smartphone className="h-5 w-5" />
          <h3 className="font-semibold text-lg">معلومات الهاتف المحمول</h3>
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Smartphone className="h-4 w-4 text-gray-500" />
            اسم الجهاز {requiredStar}
          </label>
          <input
            type="text"
            name="deviceName"
            value={mobileData.deviceName}
            onChange={onMobileDataChange}
            className={inputClasses}
            placeholder="مثال: Samsung Galaxy S24 Ultra"
            required
          />
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Battery className="h-4 w-4 text-gray-500" />
            سعة البطارية (mAh) {requiredStar}
          </label>
          <input
            type="number"
            name="batteryCapacity"
            value={mobileData.batteryCapacity || ''}
            onChange={onMobileDataChange}
            className={numberInputClasses}
            placeholder="مثال: 5000"
            min="0"
            required
          />
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Monitor className="h-4 w-4 text-gray-500" />
            حجم الشاشة (بوصة) {requiredStar}
          </label>
          <input
            type="number"
            name="displaySize"
            value={mobileData.displaySize || ''}
            onChange={onMobileDataChange}
            className={numberInputClasses}
            placeholder="مثال: 6.9"
            step="0.1"
            min="0"
            required
          />
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <HardDrive className="h-4 w-4 text-gray-500" />
            حجم التخزين (GB) {requiredStar}
          </label>
          <input
            type="number"
            name="storage"
            value={mobileData.storage || ''}
            onChange={onMobileDataChange}
            className={numberInputClasses}
            placeholder="مثال: 256"
            min="0"
            required
          />
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Cpu className="h-4 w-4 text-gray-500" />
            حجم الرام (GB) {requiredStar}
          </label>
          <input
            type="number"
            name="ram"
            value={mobileData.ram || ''}
            onChange={onMobileDataChange}
            className={numberInputClasses}
            placeholder="مثال: 12"
            min="0"
            required
          />
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <RefreshCw className="h-4 w-4 text-gray-500" />
            معدل تحديث الشاشة (Hz) {requiredStar}
          </label>
          <input
            type="number"
            name="refreshRate"
            value={mobileData.refreshRate || ''}
            onChange={onMobileDataChange}
            className={numberInputClasses}
            placeholder="مثال: 120"
            min="0"
            required
          />
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Camera className="h-4 w-4 text-gray-500" />
            الكاميرا الأمامية {requiredStar}
          </label>
          <input
            type="text"
            name="frontCamera"
            value={mobileData.frontCamera}
            onChange={onMobileDataChange}
            className={inputClasses}
            placeholder="مثال: 40 MP"
            required
          />
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Camera className="h-4 w-4 text-gray-500" />
            الكاميرا الخلفية {requiredStar}
          </label>
          <input
            type="text"
            name="rearCamera"
            value={mobileData.rearCamera}
            onChange={onMobileDataChange}
            className={inputClasses}
            placeholder="مثال: 108 MP, 12 MP, 10 MP"
            required
          />
        </div>

        <div>
          <label className={`${labelClasses} flex items-center gap-1`}>
            <Zap className="h-4 w-4 text-gray-500" />
            سرعة الشحن (واط) {requiredStar}
          </label>
          <input
            type="number"
            name="chargingSpeed"
            value={mobileData.chargingSpeed || ''}
            onChange={onMobileDataChange}
            className={numberInputClasses}
            placeholder="مثال: 45"
            min="0"
            required
          />
        </div>

        <div className="flex items-center mt-2">
          <input
            type="checkbox"
            name="ramExpandable"
            checked={mobileData.ramExpandable}
            onChange={onMobileDataChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="ml-2 text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
            <Plus className="h-4 w-4 text-gray-500" />
            الرام قابل للتوسعة
          </label>
        </div>
      </div>
    );
  }

  return null;
};

export default CategorySpecificForm; 