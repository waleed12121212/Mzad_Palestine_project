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
  showForm?: boolean; // New prop to control form visibility
}

const CategorySpecificForm: React.FC<CategorySpecificFormProps> = ({
  category,
  laptopData,
  carData,
  mobileData,
  onLaptopDataChange,
  onCarDataChange,
  onMobileDataChange,
  showForm = false // Default to false - forms hidden by default
}) => {
  // If showForm is false, don't render anything
  if (!showForm) return null;

  const formClasses = "grid grid-cols-1 md:grid-cols-2 gap-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm";
  const inputClasses = "w-full p-3 rounded-lg bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const numberInputClasses = `${inputClasses} [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`;
  const labelClasses = "block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300";
  const requiredStar = <span className="text-red-500 ml-1">*</span>;

  // ... rest of the component remains the same ...
};

export default CategorySpecificForm; 