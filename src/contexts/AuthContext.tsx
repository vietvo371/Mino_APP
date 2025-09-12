import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/Api';
import { saveToken } from '../utils/TokenManager';

// Constants
const STORAGE_KEYS = {
  USER: '@MINO:user',
  TOKEN: '@MINO:token',
} as const;

// Types
type UserRole = 'farmer' | 'bank' | 'cooperative' | 'verifier' | 'government' | 'buyer';

interface RawUserData {
  id?: number;
  user_id?: number;
  role?: UserRole;
  user_type?: UserRole;
  name?: string;
  full_name?: string;
  dob?: string;
  date_of_birth?: string;
  phone: string;
  email: string;
  gps_location?: string;
  gps_latitude?: string;
  gps_longitude?: string;
  org_name?: string;
  organization_name?: string;
  employee_id?: string;
  created_at: string;
  // eKYC fields
  ekyc_status?: 'pending' | 'verified' | 'rejected';
  ekyc_verified_at?: string;
  id_card_type?: 'cmnd' | 'cccd' | 'passport';
  id_card_number?: string;
  id_card_front_url?: string;
  id_card_back_url?: string;
  selfie_url?: string;
  nationality?: string;
  address?: string;
}

interface User {
  user_id: number;
  role: UserRole;
  name: string;
  dob: string;
  phone: string;
  email: string;
  gps_location: string;
  org_name?: string;
  employee_id?: string;
  created_at: string;
  // eKYC fields
  ekyc_status?: 'pending' | 'verified' | 'rejected';
  ekyc_verified_at?: string;
  id_card_type?: 'cmnd' | 'cccd' | 'passport';
  id_card_number?: string;
  id_card_front_url?: string;
  id_card_back_url?: string;
  selfie_url?: string;
  nationality?: string;
  address?: string;
}

interface SignUpData {
  email: string;
  phone: string;
  full_name: string;
  date_of_birth: string;
  user_type: UserRole;
  gps_latitude?: string;
  gps_longitude?: string;
  organization_name?: string;
  organization_type?: 'bank' | 'cooperative';
  address?: string;
  password: string;
  password_confirmation: string;
}

interface ApiError {
  message: string;
  errors: Record<string, string[]>;
  status: number;
}

interface AuthContextData {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  userRole: UserRole | null;
  signIn: (credentials: { identifier: string; type: string }) => Promise<void>;
  signUp: (userData: SignUpData) => Promise<void>;
  signOut: () => Promise<void>;
}

interface ApiResponse {
  data?: {
    user?: RawUserData;
    user_data?: RawUserData;
    token?: string;
    access_token?: string;
  };
  token?: string;
  access_token?: string;
  user?: RawUserData;
  user_data?: RawUserData;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStorageData();
  }, []);

  async function loadStorageData(): Promise<void> {
    try {
      const [storedUser, storedToken] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.TOKEN)
      ]);

      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu từ bộ nhớ:', error);
    } finally {
      setLoading(false);
    }
  }

  const signIn = async (credentials: { identifier: string; password: string; type: string }) => {
    try {
      const response = await api.post<ApiResponse>('/auth/login', credentials);
      const payload = response.data?.data ?? response.data;
      const rawUserData = payload?.user ?? payload?.user_data ?? payload as RawUserData;
      const token = payload?.token ?? payload?.access_token;

      if (!rawUserData || !rawUserData.email || !rawUserData.phone || !rawUserData.created_at) {
        throw new Error('Không nhận được dữ liệu người dùng từ máy chủ hoặc dữ liệu không hợp lệ');
      }

      const formattedUser: User = {
        user_id: rawUserData.user_id ?? rawUserData.id ?? 0,
        role: rawUserData.role ?? rawUserData.user_type ?? 'farmer',
        name: rawUserData.name ?? rawUserData.full_name ?? '',
        dob: rawUserData.dob ?? rawUserData.date_of_birth ?? '',
        phone: rawUserData.phone,
        email: rawUserData.email,
        gps_location: rawUserData.gps_location ?? (
          rawUserData.gps_latitude != null && rawUserData.gps_longitude != null
            ? `${rawUserData.gps_latitude},${rawUserData.gps_longitude}`
            : ''
        ),
        org_name: rawUserData.org_name ?? rawUserData.organization_name,
        employee_id: rawUserData.employee_id,
        created_at: rawUserData.created_at,
        // eKYC fields
        ekyc_status: rawUserData.ekyc_status,
        ekyc_verified_at: rawUserData.ekyc_verified_at,
        id_card_type: rawUserData.id_card_type,
        id_card_number: rawUserData.id_card_number,
        id_card_front_url: rawUserData.id_card_front_url,
        id_card_back_url: rawUserData.id_card_back_url,
        selfie_url: rawUserData.selfie_url,
        nationality: rawUserData.nationality,
        address: rawUserData.address,
      };

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(formattedUser)),
        token ? Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
          saveToken(token)
        ]) : Promise.resolve()
      ]);

      setUser(formattedUser);
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || 'Đã xảy ra lỗi khi đăng nhập',
        errors: error.response?.data?.errors || {},
        status: error.response?.status || 500
      };
      throw apiError;
    }
  };

  const signUp = async (userData: SignUpData) => {
    try {
      const response = await api.post<ApiResponse>('/auth/register', userData);
      const payload = response.data?.data ?? response.data;
      const rawUserData = payload?.user ?? payload as RawUserData;
      const token = payload?.token ?? payload?.access_token;

      if (!rawUserData || !rawUserData.email || !rawUserData.phone || !rawUserData.created_at) {
        throw new Error('Không nhận được dữ liệu người dùng từ máy chủ hoặc dữ liệu không hợp lệ');
      }

      const formattedUser: User = {
        user_id: rawUserData.user_id ?? rawUserData.id ?? 0,
        role: rawUserData.role ?? rawUserData.user_type ?? 'farmer',
        name: rawUserData.name ?? rawUserData.full_name ?? '',
        dob: rawUserData.dob ?? rawUserData.date_of_birth ?? '',
        phone: rawUserData.phone,
        email: rawUserData.email,
        gps_location: rawUserData.gps_location ?? (
          rawUserData.gps_latitude != null && rawUserData.gps_longitude != null
            ? `${rawUserData.gps_latitude},${rawUserData.gps_longitude}`
            : ''
        ),
        org_name: rawUserData.org_name ?? rawUserData.organization_name,
        employee_id: rawUserData.employee_id,
        created_at: rawUserData.created_at,
        // eKYC fields
        ekyc_status: rawUserData.ekyc_status,
        ekyc_verified_at: rawUserData.ekyc_verified_at,
        id_card_type: rawUserData.id_card_type,
        id_card_number: rawUserData.id_card_number,
        id_card_front_url: rawUserData.id_card_front_url,
        id_card_back_url: rawUserData.id_card_back_url,
        selfie_url: rawUserData.selfie_url,
        nationality: rawUserData.nationality,
        address: rawUserData.address,
      };

      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(formattedUser)),
        token ? Promise.all([
          AsyncStorage.setItem(STORAGE_KEYS.TOKEN, token),
          saveToken(token)
        ]) : Promise.resolve()
      ]);

      setUser(formattedUser);
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || 'Đã xảy ra lỗi khi đăng ký',
        errors: error.response?.data?.errors || {},
        status: error.response?.status || 500
      };
      throw apiError;
    }
  };

  const signOut = async () => {
    try {
      try {
        await api.post('/auth/logout');
      } catch (e) {
        // Bỏ qua lỗi mạng/đăng xuất
      }

      await Promise.all([
        AsyncStorage.removeItem(STORAGE_KEYS.USER),
        AsyncStorage.removeItem(STORAGE_KEYS.TOKEN)
      ]);
      
      setUser(null);
    } catch (error: any) {
      console.error('Lỗi khi đăng xuất:', error.response?.data);
      throw error;
    }
  };

  const userRole = user?.role ?? null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        loading,
        userRole,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }

  return context;
}