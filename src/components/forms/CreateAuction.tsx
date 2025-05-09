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
  Lightbulb,
  MapPin
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import AIPriceSuggestion from "@/components/ui/AIPriceSuggestion";
import { categoryService, Category } from "@/services/categoryService";
import { listingService } from "@/services/listingService";
import { auctionService } from "@/services/auctionService";
import { useAuth } from "@/contexts/AuthContext";
import axios from "axios";
import CategorySpecificForm from "@/components/forms/CategorySpecificForm";

const CreateAuction = () => {
  const [formData, setFormData] = useState({
    category: '',
    startingPrice: '',
    laptopData: {},
    carData: {},
    mobileData: {}
  });
  const [predictedPrice, setPredictedPrice] = useState<number | null>(null);
  const [showPriceSuggestion, setShowPriceSuggestion] = useState(false);

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

  const getPredictedPrice = async () => {
    try {
      let response;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      if (formData.category === "1") { // Laptop category
        // Format laptop data
        const formattedLaptopData = {
          ...laptopData,
          processorSpeed: Number(laptopData.processorSpeed),
          displaySize: Number(laptopData.displaySize),
          ssdSize: Number(laptopData.ssdSize),
          hddSize: Number(laptopData.hddSize),
          ramSize: Number(laptopData.ramSize)
        };

        console.log('Sending laptop data:', formattedLaptopData);

        response = await axios.post(
          "http://mazadpalestine.runasp.net/LaptopPrediction/predict",
          formattedLaptopData,
          config
        );
      } else if (formData.category === "2") { // Car category
        // Ensure all numeric fields are properly formatted
        const formattedCarData = {
          ...formData.carData,
          carId: Number(formData.carData.carId),
          symboling: Number(formData.carData.symboling),
          wheelBase: Number(formData.carData.wheelBase),
          carLength: Number(formData.carData.carLength),
          carWidth: Number(formData.carData.carWidth),
          carHeight: Number(formData.carData.carHeight),
          curbWeight: Number(formData.carData.curbWeight),
          engineSize: Number(formData.carData.engineSize),
          boreRatio: Number(formData.carData.boreRatio),
          stroke: Number(formData.carData.stroke),
          compressionRatio: Number(formData.carData.compressionRatio),
          horsepower: Number(formData.carData.horsepower),
          peakRPM: Number(formData.carData.peakRPM),
          cityMPG: Number(formData.carData.cityMPG),
          highwayMPG: Number(formData.carData.highwayMPG)
        };

        console.log('Sending car data:', formattedCarData); // For debugging

        response = await axios.post(
          "http://mazadpalestine.runasp.net/CarPrediction/predict",
          formattedCarData,
          config
        );
      } else if (formData.category === "3") { // Mobile category
        // Format mobile data
        const formattedMobileData = {
          ...mobileData,
          batteryCapacity: Number(mobileData.batteryCapacity),
          displaySize: Number(mobileData.displaySize),
          storage: Number(mobileData.storage),
          ram: Number(mobileData.ram),
          refreshRate: Number(mobileData.refreshRate),
          chargingSpeed: Number(mobileData.chargingSpeed)
        };

        console.log('Sending mobile data:', formattedMobileData);

        response = await axios.post(
          "http://mazadpalestine.runasp.net/PhonePrediction/predict",
          formattedMobileData,
          config
        );
      } else {
        toast({
          title: "خطأ",
          description: "الرجاء اختيار فئة صحيحة",
          variant: "destructive"
        });
        return null;
      }

      if (response?.data) {
        const price = Number(response.data);
        if (!isNaN(price)) {
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
        } else {
          throw new Error('Invalid price received from server');
        }
      }
    } catch (error: any) {
      console.error("Error predicting price:", error);
      let errorMessage = "حدث خطأ أثناء التنبؤ بالسعر";
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error("Error response:", error.response.data);
        console.error("Error status:", error.response.status);
        errorMessage = error.response.data?.message || errorMessage;
      } else if (error.request) {
        // The request was made but no response was received
        console.error("Error request:", error.request);
        errorMessage = "لم نتمكن من الوصول إلى الخادم. يرجى التحقق من اتصال الإنترنت الخاص بك.";
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error("Error message:", error.message);
        errorMessage = error.message;
      }

      toast({
        title: "خطأ",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8 pt-28">
        {/* ... existing JSX ... */}
        
        {/* AI Price Prediction Button */}
        {(formData.category === "1" || formData.category === "2" || formData.category === "3") && (
          <div className="mt-4">
            <button
              type="button"
              onClick={getPredictedPrice}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white rounded-lg transition-all shadow-sm"
            >
              <Lightbulb className="h-5 w-5" />
              <span>تحديد السعر التلقائي باستخدام الذكاء الاصطناعي</span>
            </button>

            {/* Show AI Price Suggestion */}
            {showPriceSuggestion && predictedPrice && (
              <AIPriceSuggestion
                suggestedPrice={predictedPrice}
                onClose={() => setShowPriceSuggestion(false)}
              />
            )}
          </div>
        )}
        
        {/* ... rest of the existing JSX ... */}
      </main>
      <Footer />
    </div>
  );
};

export default CreateAuction; 