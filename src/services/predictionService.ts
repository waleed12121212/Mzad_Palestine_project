import axios from 'axios';
import { API_BASE_URL } from '@/config';

// Create a custom axios instance for prediction services
const predictionAxios = axios.create({
  baseURL: '', // Empty baseURL to use relative paths with Vite proxy
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  withCredentials: false
});

// Add request interceptor for error handling
predictionAxios.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
predictionAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Prediction Service Error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data?.message || 'خطأ في خدمة التنبؤ');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('لا يمكن الوصول إلى خدمة التنبؤ. يرجى التحقق من اتصال الإنترنت');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error('حدث خطأ أثناء إرسال الطلب');
    }
  }
);

export interface LaptopPredictionData {
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
}

export interface CarPredictionData {
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
}

export interface MobilePredictionData {
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
}

class PredictionService {
  async predictLaptopPrice(data: LaptopPredictionData): Promise<number> {
    try {
      const response = await predictionAxios.post('/LaptopPrediction/predict', data);
      // Check if response.data exists and has the predictedPrice property
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      const price = Number(response.data.predictedPrice);
      if (isNaN(price)) {
        console.error('Invalid price received:', response.data);
        throw new Error('Invalid price format received from server');
      }
      
      return price;
    } catch (error) {
      console.error('Laptop prediction error:', error);
      throw error;
    }
  }

  async predictCarPrice(data: CarPredictionData): Promise<number> {
    try {
      const response = await predictionAxios.post('/CarPrediction/predict', data);
      
      // Handle direct number response
      if (typeof response.data === 'number') {
        return response.data;
      }
      
      // Handle object response (for backward compatibility)
      if (response.data && typeof response.data === 'object') {
        const price = Number(response.data.predictedPrice || response.data.price);
        if (!isNaN(price)) {
          return price;
        }
      }
      
      throw new Error('Invalid response format from server');
    } catch (error) {
      console.error('Car prediction error:', error);
      throw error;
    }
  }

  async predictMobilePrice(data: MobilePredictionData): Promise<number> {
    try {
      const response = await predictionAxios.post('/Phone/predict', data);
      // Check if response.data exists and has the predictedPrice property
      if (!response.data || typeof response.data !== 'object') {
        throw new Error('Invalid response format from server');
      }
      
      const price = Number(response.data.predictedPrice);
      if (isNaN(price)) {
        console.error('Invalid price received:', response.data);
        throw new Error('Invalid price format received from server');
      }
      
      return price;
    } catch (error) {
      console.error('Mobile prediction error:', error);
      throw error;
    }
  }
}

export const predictionService = new PredictionService(); 