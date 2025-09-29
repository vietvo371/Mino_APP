// Crisp Chat Configuration
export const CRISP_CONFIG = {
  // Replace with your actual Crisp Website ID
  // You can find this in your Crisp Dashboard
  WEBSITE_ID: '86adb5ef-5e42-4b5d-8d58-78ec327b0181',
  
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
