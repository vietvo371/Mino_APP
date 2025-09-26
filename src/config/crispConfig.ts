// Crisp Chat Configuration
export const CRISP_CONFIG = {
  // Replace with your actual Crisp Website ID
  // You can find this in your Crisp Dashboard
  WEBSITE_ID: '4415b3b8-c504-4c41-820e-6cc2021d8e6b',
  
  // Optional: Default user settings
  DEFAULT_USER: {
    email: '',
    nickname: '',
    phone: '',
    tokenId: '',
  },
};

// Helper function to get user token ID
export const getUserTokenId = (userId?: string): string => {
  return userId || `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
