// components/EkycComponent.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { EkycService } from '../services/EkycService';

export const EkycReviewScreen: React.FC = () => {
  const handleEkycFull = async () => {
    try {
      const result = await EkycService.startEkycFull();
      console.log('eKYC Full Result:', result);
      // Xử lý kết quả
    } catch (error) {
      console.error('eKYC Full Error:', error);
    }
  };

  const handleEkycOcr = async () => {
    try {
      const result = await EkycService.startEkycOcr();
      console.log('eKYC OCR Result:', result);
      // Xử lý kết quả
    } catch (error) {
      console.error('eKYC OCR Error:', error);
    }
  };

  const handleEkycFace = async () => {
    try {
      const result = await EkycService.startEkycFace();
      console.log('eKYC Face Result:', result);
      // Xử lý kết quả
    } catch (error) {
      console.error('eKYC Face Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.button} onPress={handleEkycFull}>
        <Text style={styles.buttonText}>eKYC luồng đầy đủ</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleEkycOcr}>
        <Text style={styles.buttonText}>Thực hiện OCR giấy tờ</Text>
      </TouchableOpacity>
      
      <TouchableOpacity style={styles.button} onPress={handleEkycFace}>
        <Text style={styles.buttonText}>Thực hiện kiểm tra khuôn mặt</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 100,
    flex: 1,
    padding: 16,
  },
  button: {
    backgroundColor: '#18D696',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});