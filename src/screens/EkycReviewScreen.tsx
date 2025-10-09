import { useAlert } from "../component/AlertCustom";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import React, { useState } from 'react';
import { EkycService } from '../services/EkycService';
import { useTranslation } from '../hooks/useTranslation';
import api from '../utils/Api';
import { getUser } from '../utils/TokenManager';

export const EkycReviewScreen: React.FC = () => {
  const [verifyId, setVerifyId] = useState('');
  const { getCurrentLanguage } = useTranslation();
  // Flow: chạy Full eKYC xong Verify Face so khớp với ảnh tham chiếu
  const handleEkycFull = async () => {
    try {
      const lang = getCurrentLanguage() === 'en' ? 'en' : 'vi';
      const fullResult = await EkycService.startEkycFullWithLanguage(lang);
      console.log('eKYC Full Result:', fullResult);

      const logs: any = fullResult;
      const ocr = logs?.LOG_OCR ? JSON.parse(logs.LOG_OCR) : null;
      const lcf = logs?.LOG_LIVENESS_CARD_FRONT ? JSON.parse(logs.LOG_LIVENESS_CARD_FRONT) : null;
      const lcr = logs?.LOG_LIVENESS_CARD_REAR ? JSON.parse(logs.LOG_LIVENESS_CARD_REAR) : null;
      const lf  = logs?.LOG_LIVENESS_FACE ? JSON.parse(logs.LOG_LIVENESS_FACE) : null;
      const mask= logs?.LOG_MASK_FACE ? JSON.parse(logs.LOG_MASK_FACE) : null;
      const cmp = logs?.LOG_COMPARE ? JSON.parse(logs.LOG_COMPARE) : null;

      // Validate step by step with Alerts
      if (!lcf || lcf?.object?.liveness !== 'success') {
        showAlert('Giấy tờ mặt trước', 'Giấy tờ không hợp lệ, vui lòng chụp lại.');
        return;
      }
      if (!lcr || lcr?.object?.liveness !== 'success') {
        showAlert('Giấy tờ mặt sau', 'Giấy tờ không hợp lệ, vui lòng chụp lại.');
        return;
      }
      if (!lf || lf?.object?.liveness !== 'success') {
        showAlert('Chân dung', 'Không nhận diện được người thật, vui lòng chụp lại.');
        return;
      }
      if (!mask || mask?.object?.masked !== 'no') {
        showAlert('Che mặt', 'Vui lòng không che mặt khi chụp.');
        return;
      }
      if (!ocr || ocr?.statusCode !== 200) {
        showAlert('OCR', 'Bóc tách thông tin thất bại, vui lòng chụp lại.');
        return;
      }
      if (cmp) {
        const prob = Number(cmp?.object?.prob || 0);
        if (!(cmp?.object?.msg === 'MATCH' && prob >= 95)) {
          showAlert('So khớp khuôn mặt', 'Khuôn mặt chưa khớp thông tin eKYC.');
          return;
        }
      }

      // Collect hashes
      const hash_front = ocr?.imgs?.img_front || '';
      const hash_back  = ocr?.imgs?.img_back || '';
      const hash_face_near = lf?.imgs?.near_img || '';
      const hash_face_far  = lf?.imgs?.far_img || '';

      // Get user email
      let email = '';
      try {
        const user: any = await getUser();
        email = user?.email || '';
      } catch {}

      // Send to backend
      try {
        console.log('hash_front', hash_front);
        console.log('hash_back', hash_back);
        console.log('hash_face_near', hash_face_near);
        console.log('hash_face_far', hash_face_far);
        console.log('email', email);
        // await api.post('/client/verify-ekyc', {
        //   hash_front,
        //   hash_back,
        //   hash_face_near,
        //   hash_face_far,
        //   email,
        // });
        // showAlert('eKYC', 'Đã xác thực danh tính.');
      } catch (e) {
        showAlert('eKYC', 'Gửi kết quả lên máy chủ thất bại.');
      }
    } catch (error) {
      console.error('eKYC Full Error:', error);
    }
  };

  const handleEkycOcr = async () => {
    try {
      const lang = getCurrentLanguage() === 'en' ? 'en' : 'vi';
      const result = await EkycService.startEkycOcrWithLanguage(lang);
      console.log('eKYC OCR Result:', result);
      // Xử lý kết quả
    } catch (error) {
      console.error('eKYC OCR Error:', error);
    }
  };

  const handleEkycFace = async () => {
    try {
      const lang = getCurrentLanguage() === 'en' ? 'en' : 'vi';
      const result = await EkycService.startEkycFaceWithLanguage(lang);
      console.log('eKYC Face Result:', result);
      // Xử lý kết quả
    } catch (error) {
      console.error('eKYC Face Error:', error);
    }
  };

  const handleVerifyFaceById = async () => {
    try {
      if (!verifyId) {
        showAlert('Verify Face', 'Nhập Verify ID trước khi chạy');
        return;
      }
      const result = await EkycService.verifyFaceById(verifyId);
      console.log('Verify Face by ID Result:', result);
    } catch (error) {
      console.error('Verify Face by ID Error:', error);
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

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="Nhập Verify ID"
          value={verifyId}
          onChangeText={setVerifyId}
        />
        <TouchableOpacity style={[styles.button, styles.buttonInline]} onPress={handleVerifyFaceById}>
          <Text style={styles.buttonText}>Verify Face (ID)</Text>
        </TouchableOpacity>
      </View>
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
  buttonInline: {
    marginVertical: 0,
    marginLeft: 8,
    paddingVertical: 12,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    backgroundColor: '#fff',
  },
});