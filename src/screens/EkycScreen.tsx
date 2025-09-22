import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { mockEkycService as ekycService } from '../services/MockEkycService';
import { useAuth } from '../contexts/AuthContext';
import LoadingOverlay from '../component/LoadingOverlay';
import { theme } from '../theme/colors';


const EkycScreen = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const {
    isInitialized,
    isLoading,
    error,
    initialize,
    captureIdCardFront,
    captureIdCardBack,
    captureSelfie,
    performLiveness,
    verifyEkyc,
  } = useEkyc();

  const [frontImage, setFrontImage] = useState<string>('');
  const [backImage, setBackImage] = useState<string>('');
  const [selfieImage, setSelfieImage] = useState<string>('');
  const [livenessData, setLivenessData] = useState<{
    video: string;
    images: string[];
  } | null>(null);

  useEffect(() => {
    initializeSDK();
  }, []);

  const initializeSDK = async () => {
    try {
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể khởi tạo SDK eKYC. Vui lòng thử lại sau.');
    }
  };

  const handleCaptureFront = async () => {
    try {
      const image = await captureIdCardFront();
      setFrontImage(image);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể chụp mặt trước CCCD/CMND. Vui lòng thử lại.');
    }
  };

  const handleCaptureBack = async () => {
    try {
      const image = await captureIdCardBack();
      setBackImage(image);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể chụp mặt sau CCCD/CMND. Vui lòng thử lại.');
    }
  };

  const handleCaptureSelfie = async () => {
    try {
      const image = await captureSelfie();
      setSelfieImage(image);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể chụp ảnh chân dung. Vui lòng thử lại.');
    }
  };

  const handleLiveness = async () => {
    try {
      const result = await performLiveness();
      setLivenessData(result);
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể thực hiện kiểm tra chống giả mạo. Vui lòng thử lại.');
    }
  };

  const handleVerify = async () => {
    try {
      if (!frontImage || !backImage || !selfieImage) {
        Alert.alert('Lỗi', 'Vui lòng chụp đầy đủ ảnh CCCD/CMND và ảnh chân dung.');
        return;
      }

      const verifyData = {
        id_card_type: 'cccd',
        id_card_number: '',
        id_card_front_image: frontImage,
        id_card_back_image: backImage,
        selfie_image: selfieImage,
        selfie_with_id_image: livenessData?.images[0],
        video_url: livenessData?.video,
        verify_type: 'face',
        verify_method: 'auto',
      };

      const result = await verifyEkyc(verifyData);

      if (result.status === 'verified') {
        Alert.alert('Thành công', 'Xác thực eKYC thành công!');
        navigation.goBack();
      } else {
        Alert.alert('Thất bại', 'Xác thực eKYC thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể xác thực eKYC. Vui lòng thử lại.');
    }
  };

  if (!isInitialized || isLoading) {
    return <LoadingOverlay visible={true} />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeSDK}>
          <Text style={styles.retryText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Xác thực eKYC</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chụp CCCD/CMND</Text>
          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={[styles.button, frontImage ? styles.buttonSuccess : null]}
              onPress={handleCaptureFront}
            >
              <Icon
                name={frontImage ? 'check-circle' : 'camera'}
                size={24}
                color={frontImage ? '#34C759' : '#4A90E2'}
              />
              <Text style={styles.buttonText}>Mặt trước</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, backImage ? styles.buttonSuccess : null]}
              onPress={handleCaptureBack}
            >
              <Icon
                name={backImage ? 'check-circle' : 'camera'}
                size={24}
                color={backImage ? '#34C759' : '#4A90E2'}
              />
              <Text style={styles.buttonText}>Mặt sau</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chụp ảnh chân dung</Text>
          <TouchableOpacity
            style={[styles.button, selfieImage ? styles.buttonSuccess : null]}
            onPress={handleCaptureSelfie}
          >
            <Icon
              name={selfieImage ? 'check-circle' : 'camera-front'}
              size={24}
              color={selfieImage ? '#34C759' : '#4A90E2'}
            />
            <Text style={styles.buttonText}>Chụp ảnh</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Kiểm tra chống giả mạo</Text>
          <TouchableOpacity
            style={[styles.button, livenessData ? styles.buttonSuccess : null]}
            onPress={handleLiveness}
          >
            <Icon
              name={livenessData ? 'check-circle' : 'face-recognition'}
              size={24}
              color={livenessData ? '#34C759' : '#4A90E2'}
            />
            <Text style={styles.buttonText}>Thực hiện</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[
            styles.verifyButton,
            (!frontImage || !backImage || !selfieImage) && styles.verifyButtonDisabled,
          ]}
          onPress={handleVerify}
          disabled={!frontImage || !backImage || !selfieImage}
        >
          <Text style={styles.verifyButtonText}>Xác thực</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  buttonGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    marginHorizontal: 4,
    gap: 8,
  },
  buttonSuccess: {
    backgroundColor: '#34C75915',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  verifyButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  verifyButtonDisabled: {
    backgroundColor: '#4A90E250',
  },
  verifyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default EkycScreen;
