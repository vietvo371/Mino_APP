import api from './Api';

export const authApi = {
  // Request OTP
  requestOtp: async (identifier: string, type: 'phone' | 'email') => {
    try {
      const response = await api.post('/auth/request-otp', {
        identifier,
        type
      });
      return response.data;
    } catch (error) {
      console.error('Error requesting OTP:', error);
      throw error;
    }
  },

  // Verify OTP
  verifyOtp: async (identifier: string, type: 'phone' | 'email', otp: string) => {
    try {
      const response = await api.post('/auth/verify-otp', {
        identifier,
        type,
        otp
      });
      return response.data;
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },

  // Get User Profile
  getProfile: async () => {
    try {
      const response = await api.get('/user/profile');
      return response.data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  // Update User Profile
  updateProfile: async (data: {
    fullName?: string;
    dateOfBirth?: string;
    address?: string;
    nationality?: string;
  }) => {
    try {
      const response = await api.put('/user/profile', data);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Logout
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  },
};

export default authApi;
