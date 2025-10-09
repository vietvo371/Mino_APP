import { useAlert } from "../component/AlertCustom";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, User, SignUpData } from '../utils/authApi';
import { EkycVerifyRequest, EkycVerifyResponse } from '../types/ekyc';

// Types
type UserRole = 'individual' | 'business' | 'farmer' | 'bank' | 'cooperative' | 'verifier' | 'government' | 'buyer';

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

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStoredUser();
  }, []);

  const loadStoredUser = async () => {
    try {
      const storedUser = await authApi.loadStoredUser();
      setUser(storedUser);
    } catch (error) {
      console.log('Error loading stored user:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (credentials: { identifier: string; type: string }) => {
    try {
      const result = await authApi.signIn(credentials);
      setUser(result.user);
    } catch (error: any) {
      console.log('Sign in error:', error);
      throw error;
    }
  };

  const signUp = async (userData: SignUpData) => {
    try {
      await authApi.signUp(userData);
    } catch (error: any) {
      console.log('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await authApi.signOut();
      setUser(null);
    } catch (error: any) {
      console.log('Sign out error:', error);
      throw error;
    }
  };

  const verifyEkyc = async (data: EkycVerifyRequest): Promise<EkycVerifyResponse> => {
    try {
      return await authApi.verifyEkyc(data);
    } catch (error: any) {
      console.log('eKYC verification error:', error);
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