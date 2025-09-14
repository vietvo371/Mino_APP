import { Platform } from 'react-native';

export const COLORS = {
  // Brand Colors
  primary: 'black',
  // F3BA2F
  secondary: '#181A20',
  background: '#FFFFFF',
  backgroundDark: '#0B0E11',
  
  // Text Colors
  text: '#1E2329',
  textLight: '#707A8A',
  textDark: '#EAECEF',
  textDarkLight: '#B7BDC6',
  
  // Status Colors
  success: '#03A66D',
  successLight: '#E4F4ED',
  error: '#CF304A',
  errorLight: '#FBEBED',
  warning: '#F0B90B',
  warningLight: '#FEF6D8',
  info: '#0ECB81',
  
  // UI Elements
  border: '#E6E8EA',
  borderDark: '#2B3139',
  disabled: '#B7BDC6',
  disabledDark: '#474D57',
  
  // Base Colors
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayDark: 'rgba(255, 255, 255, 0.1)',
  
  // Gradients
  gradientYellow: ['#F3BA2F', '#F0B90B'],
  gradientDark: ['#1E2329', '#0B0E11'],
};

export const theme = {
  colors: COLORS,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 16,
    xl: 24,
    xxl: 32,
  },
  typography: {
    fontFamily: Platform.select({
      ios: 'Inter',
      android: 'Inter-Regular',
    }),
    fontSize: {
      '2xs': 10,
      xs: 12,
      sm: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tighter: -0.8,
      tight: -0.4,
      normal: 0,
      wide: 0.4,
      wider: 0.8,
    },
  },
  shadows: {
    sm: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 8,
    },
    yellow: {
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
  },
  animation: {
    duration: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeInOut: 'ease-in-out',
      easeOut: 'ease-out',
      easeIn: 'ease-in',
    },
  },
  layout: {
    containerPadding: 16,
    maxWidth: 480,
    bottomTabHeight: 60,
    headerHeight: 56,
  },
}; 