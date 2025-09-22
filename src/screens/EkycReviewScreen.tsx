// components/EkycComponent.tsx
import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { EkycService } from '../services/EkycService';

export const EkycReviewScreen: React.FC = () => {
  // Flow: chạy Full eKYC xong Verify Face so khớp với ảnh tham chiếu
  const handleEkycFull = async () => {
    try {
      const fullResult = await EkycService.startEkycFull();
      console.log('eKYC Full Result:', fullResult);
      // Lấy hash ảnh tham chiếu (ví dụ near_img) từ kết quả full
      const full: any = fullResult;
      const nearImg = full?.LOG_LIVENESS_FACE ? (JSON.parse(full.LOG_LIVENESS_FACE)?.imgs?.near_img || '') : '';
      // Gọi verify face với ảnh tham chiếu
      if (nearImg) {
        const verifyResult = await EkycService.verifyFace(nearImg);
        console.log('eKYC Verify Face Result:', verifyResult);
      } else {
        console.log('No reference hash found to verify face');
      }
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