import axios from "axios";
import { Alert, Platform } from 'react-native';
import { deriveDashboardStats, deriveRecentBatches, mockUsers } from './mockData';
import { getToken, removeToken, saveToken } from "./TokenManager";
import { navigate, resetTo } from "../navigation/NavigationService";
import Geolocation from 'react-native-geolocation-service';

// Types
export interface DashboardStats {
  batches: {
    total: number;
    trend: { value: number; isPositive: boolean; }
  };
  qr_scans: {
    total: number;
    trend: { value: number; isPositive: boolean; }
  };
  products: {
    total: number;
    trend: { value: number; isPositive: boolean; }
  };
}

export interface Batch {
  id: string;
  product_name: string;
  category: string;
  weight: number;
  harvest_date: string;
  cultivation_method: string;
  status: 'active' | 'completed' | 'cancelled';
  image: string;
}

export interface UserProfile {
  full_name: string;
  role: string;
  farm_name: string;
  profile_image: string;
}

// Location interface
interface LocationData {
  lat: number;
  long: number;
}

// Cache location to avoid repeated calls
let cachedLocation: LocationData | null = null;
let locationCacheTime = 0;
const LOCATION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to get current location with caching
const getCurrentLocation = (): Promise<LocationData | null> => {
  return new Promise((resolve) => {
    // Return cached location if still valid
    const now = Date.now();
    if (cachedLocation && (now - locationCacheTime) < LOCATION_CACHE_DURATION) {
      console.log('Using cached location:', cachedLocation);
      resolve(cachedLocation);
      return;
    }

    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const location = {
          lat: latitude,
          long: longitude,
        };
        console.log('Location obtained:', location);
        // Cache the location
        cachedLocation = location;
        locationCacheTime = now;
        
        resolve(location);
      },
      (error) => {
        console.log('Location error:', error.message);
        const defaultLocation = {
          lat: 16.068882379104995,
          long: 108.24535024604958,
        };
        
        // Cache default location too
        cachedLocation = defaultLocation;
        locationCacheTime = now;
        
        resolve(defaultLocation);
      },
      {
        enableHighAccuracy: false, // Use less accurate but faster location
        timeout: 1000, // Reduced timeout to 1 second
        maximumAge: 300000, // 5 minutes cache
        showLocationDialog: false, // Don't show system dialog
        forceRequestLocation: false, // Use cached location if available
      }
    );
  });
};


const baseUrl = Platform.select({
  ios: 'https://mimo.dragonlab.vn/api',
  android: 'https://mimo.dragonlab.vn/api',
});

const api = axios.create({
  baseURL: baseUrl,
  timeout: 15000, // 15 seconds
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Handle redirects manually to avoid React Native networking issues
  maxRedirects: 0,
  validateStatus: function (status) {
    // Accept status codes from 200 to 399
    return status >= 200 && status < 400;
  },
});

api.interceptors.request.use(async (config) => {
  // Add Authorization header
  const token = await getToken();
  if (token) {
    console.log('token', token);
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Get location asynchronously without blocking the request
  getCurrentLocation().then((location) => {
    if (location) {
      config.headers['x-location'] = JSON.stringify(location);
      console.log('Location header added:', location);
    }
  }).catch((error) => {
    console.log('Location error in interceptor:', error);
  });

  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: any) => {
    // Timeout handling
    if (error.code === 'ECONNABORTED' || /timeout/i.test(error.message)) {
      console.log('Timeout', error);
      removeToken(); 
      Alert.alert('Timeout', 'Kết nối quá thời gian. Vui lòng thử lại.',
        [ {
          text: 'OK',
          onPress: () => {
            resetTo('Login');
          },
        },
      ]
      );
      return Promise.reject(error);
    }

    if (error.response?.status === 422) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 || error.response?.status === 403) {
      removeToken(); // enable if you want to clear token
      Alert.alert('Phiên đăng nhập', 'Phiên đã hết hạn, vui lòng đăng nhập lại.', [
        {
          text: 'OK',
          onPress: () => {
            resetTo('Login');
          },
        },
      ]);
      return Promise.reject(error);
    }

    console.log('API error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

export default api;