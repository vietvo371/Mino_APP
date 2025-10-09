import { Platform, StyleSheet } from 'react-native';

export const commonStyles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? 20 : 0,
  },
});