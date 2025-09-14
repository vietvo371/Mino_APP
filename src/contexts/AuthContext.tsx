import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../utils/Api';
import { saveToken } from '../utils/TokenManager';
import { EkycData, EkycVerifyRequest, EkycVerifyResponse } from '../types/ekyc';

// Constants
const STORAGE_KEYS = {
  USER: '@MINO:user',
  TOKEN: '@MINO:token',
} as const;

// Types
type UserRole = 'farmer' | 'bank' | 'cooperative' | 'verifier' | 'government' | 'buyer';

interface RawUserData extends EkycData {
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
}

interface User extends EkycData {
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
  verifyEkyc: (data: EkycVerifyRequest) => Promise<EkycVerifyResponse>;
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

  const signIn = async (credentials: { identifier: string; type: string }) => {
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

        // eKYC Status
        ekyc_status: rawUserData.ekyc_status,
        ekyc_verified_at: rawUserData.ekyc_verified_at,
        ekyc_score: rawUserData.ekyc_score,
        ekyc_session_id: rawUserData.ekyc_session_id,
        ekyc_transaction_id: rawUserData.ekyc_transaction_id,
        ekyc_verify_type: rawUserData.ekyc_verify_type,
        ekyc_verify_method: rawUserData.ekyc_verify_method,
        
        // ID Card Info
        id_card_type: rawUserData.id_card_type,
        id_card_number: rawUserData.id_card_number,
        id_card_name: rawUserData.id_card_name,
        id_card_dob: rawUserData.id_card_dob,
        id_card_gender: rawUserData.id_card_gender,
        id_card_nationality: rawUserData.id_card_nationality,
        id_card_ethnicity: rawUserData.id_card_ethnicity,
        id_card_religion: rawUserData.id_card_religion,
        id_card_place_of_origin: rawUserData.id_card_place_of_origin,
        id_card_place_of_residence: rawUserData.id_card_place_of_residence,
        id_card_personal_identification: rawUserData.id_card_personal_identification,
        id_card_issuing_authority: rawUserData.id_card_issuing_authority,
        id_card_issue_date: rawUserData.id_card_issue_date,
        id_card_expiry_date: rawUserData.id_card_expiry_date,

        // Document Images
        id_card_front_url: rawUserData.id_card_front_url,
        id_card_back_url: rawUserData.id_card_back_url,
        selfie_url: rawUserData.selfie_url,
        selfie_with_id_url: rawUserData.selfie_with_id_url,
        video_url: rawUserData.video_url,

        // Verification Scores
        face_matching_score: rawUserData.face_matching_score,
        face_matching_result: rawUserData.face_matching_result,
        liveness_score: rawUserData.liveness_score,
        liveness_result: rawUserData.liveness_result,
        mask_detection: rawUserData.mask_detection,
        address_verification: rawUserData.address_verification,
        
        // Verification Results
        ocr_result: rawUserData.ocr_result,
        face_result: rawUserData.face_result,
        liveness_result_details: rawUserData.liveness_result_details,
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

        // eKYC Status
        ekyc_status: rawUserData.ekyc_status,
        ekyc_verified_at: rawUserData.ekyc_verified_at,
        ekyc_score: rawUserData.ekyc_score,
        ekyc_session_id: rawUserData.ekyc_session_id,
        ekyc_transaction_id: rawUserData.ekyc_transaction_id,
        ekyc_verify_type: rawUserData.ekyc_verify_type,
        ekyc_verify_method: rawUserData.ekyc_verify_method,
        
        // ID Card Info
        id_card_type: rawUserData.id_card_type,
        id_card_number: rawUserData.id_card_number,
        id_card_name: rawUserData.id_card_name,
        id_card_dob: rawUserData.id_card_dob,
        id_card_gender: rawUserData.id_card_gender,
        id_card_nationality: rawUserData.id_card_nationality,
        id_card_ethnicity: rawUserData.id_card_ethnicity,
        id_card_religion: rawUserData.id_card_religion,
        id_card_place_of_origin: rawUserData.id_card_place_of_origin,
        id_card_place_of_residence: rawUserData.id_card_place_of_residence,
        id_card_personal_identification: rawUserData.id_card_personal_identification,
        id_card_issuing_authority: rawUserData.id_card_issuing_authority,
        id_card_issue_date: rawUserData.id_card_issue_date,
        id_card_expiry_date: rawUserData.id_card_expiry_date,

        // Document Images
        id_card_front_url: rawUserData.id_card_front_url,
        id_card_back_url: rawUserData.id_card_back_url,
        selfie_url: rawUserData.selfie_url,
        selfie_with_id_url: rawUserData.selfie_with_id_url,
        video_url: rawUserData.video_url,

        // Verification Scores
        face_matching_score: rawUserData.face_matching_score,
        face_matching_result: rawUserData.face_matching_result,
        liveness_score: rawUserData.liveness_score,
        liveness_result: rawUserData.liveness_result,
        mask_detection: rawUserData.mask_detection,
        address_verification: rawUserData.address_verification,
        
        // Verification Results
        ocr_result: rawUserData.ocr_result,
        face_result: rawUserData.face_result,
        liveness_result_details: rawUserData.liveness_result_details,
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

  const verifyEkyc = async (data: EkycVerifyRequest): Promise<EkycVerifyResponse> => {
    try {
      const response = await api.post<EkycVerifyResponse>('/ekyc/verify', data);
      return response.data;
    } catch (error: any) {
      const apiError: ApiError = {
        message: error.response?.data?.message || 'Đã xảy ra lỗi khi xác thực eKYC',
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
        verifyEkyc,
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