import axios from "axios";
import { Platform } from 'react-native';
import { deriveDashboardStats, deriveRecentBatches, mockUsers } from './mockData';
import { getToken, saveToken } from "./TokenManager";

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
  const token = await getToken();
  if (token) {
    console.log('token', token);
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {

    return Promise.reject(error);
  }
);

export default api;