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

// Function to get current location
const getCurrentLocation = (): Promise<LocationData | null> => {
  return new Promise((resolve) => {
    Geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('Location obtained:', { lat: latitude, long: longitude });
        resolve({
          lat: latitude,
          long: longitude,
        });
      },
      (error) => {
        console.log('Location error:', error.message);
        // Always return default location (Da Nang, Vietnam) if location access fails
        console.log('Using default location due to error');
        resolve({
          lat: 16.068882379104995,
          long: 108.24535024604958,
        });
      },
      {
        enableHighAccuracy: false, // Use less accurate but faster location
        timeout: 3000, // Very short timeout to avoid blocking
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
  const location = await getCurrentLocation();
    if (location) {
      config.headers['x-location'] = JSON.stringify(location);
      console.log('Location header added:', location);
    } 

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

    // Validation error, bubble up to caller for field-level handling
    if (error.response?.status === 422) {
      return Promise.reject(error);
    }

    // Unauthorized or token issues -> navigate to Login
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

    // Generic server/network error
    console.log('API error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });
    // Alert.alert('Error', error.response?.data?.message || 'Lỗi Server');
    return Promise.reject(error);
  }
);

export default api;