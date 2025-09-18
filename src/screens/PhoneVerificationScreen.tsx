import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import api from '../utils/Api';

const PhoneVerificationScreen = () => {
  const navigation = useNavigation();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const handleSendCode = async () => {
    if (!phone || phone.length < 8) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại hợp lệ');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/client/send-otp-phone', {
        email: phone, // API expects phone number in 'email' field
        type: 'phone'
      });

      console.log('Send OTP response:', response.data);
      
      if (response.data.status) {
        setIsCodeSent(true);
        setCountdown(60); // 60 seconds countdown
        startCountdown();
        Alert.alert('Thành công', response.data.message || 'Gửi mã OTP về số điện thoại thành công!');
      } else {
        Alert.alert('Lỗi', response.data.message || 'Không thể gửi OTP');
      }
    } catch (error: any) {
      console.log('Send OTP error:', error);
      let errorMessage = 'Không thể gửi OTP. Vui lòng thử lại.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerify = async () => {
    if (!code || code.length < 4) {
      Alert.alert('Lỗi', 'Vui lòng nhập mã OTP');
      return;
    }

    setVerifying(true);
    try {
      const response = await api.post('/client/verify-phone', {
        number_phone: phone,
        otp: code
      });

      console.log('Verify OTP response:', response.data);
      
      if (response.data.status) {
        Alert.alert('Thành công', 'Số điện thoại đã được xác thực thành công!', [
          {
            text: 'OK',
            onPress: () => {
              // Replace to SecurityScreen to refresh verification status
              (navigation as any).replace('Security');
            }
          }
        ]);
      } else {
        Alert.alert('Lỗi', response.data.message || 'Mã OTP không đúng. Vui lòng thử lại.');
      }
      
    } catch (error: any) {
      console.log('Verify OTP error:', error);
      let errorMessage = 'Mã OTP không đúng. Vui lòng thử lại.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = () => {
    if (countdown > 0) return;
    handleSendCode();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Phone Verification</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.content}>
        <View style={styles.card}>
          <Text style={styles.title}>Verify your phone</Text>
          <Text style={styles.subtitle}>Enter your phone number to receive an OTP</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <View style={styles.inputWrapper}>
              <Icon name="phone" size={20} color="#34C759" />
              <TextInput
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
                style={styles.textInput}
                placeholderTextColor="#8E8E93"
              />
            </View>
            <TouchableOpacity 
              style={[styles.primaryButton, loading && styles.disabledButton]} 
              onPress={handleSendCode}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryButtonText}>Gửi OTP</Text>
              )}
            </TouchableOpacity>
          </View>

          {isCodeSent && (
            <View style={styles.inputGroup}>
              <View style={styles.otpHeader}>
                <Text style={styles.inputLabel}>Mã OTP</Text>
                <Text style={styles.otpInfo}>
                  Đã gửi mã OTP đến {phone}
                </Text>
              </View>
              <View style={styles.inputWrapper}>
                <Icon name="shield-key" size={20} color="#7B68EE" />
                <TextInput
                  value={code}
                  onChangeText={setCode}
                  placeholder="Nhập mã OTP"
                  keyboardType="number-pad"
                  style={styles.textInput}
                  placeholderTextColor="#8E8E93"
                  maxLength={6}
                />
              </View>
              <TouchableOpacity 
                style={[styles.primaryButton, styles.verifyButton, verifying && styles.disabledButton]} 
                onPress={handleVerify}
                disabled={verifying}
              >
                {verifying ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.primaryButtonText}>Xác thực</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.resendButton} 
                onPress={handleResendCode}
                disabled={countdown > 0}
              >
                <Text style={[styles.resendText, countdown > 0 && styles.disabledText]}>
                  {countdown > 0 ? `Gửi lại sau ${countdown}s` : 'Gửi lại mã OTP'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '600', color: '#1C1C1E' },
  headerRight: { width: 40 },
  content: { flex: 1, padding: 16 },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    ...Platform.select({ ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 }, android: { elevation: 2 } }),
  },
  title: { fontSize: 18, fontWeight: '700', color: '#000', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#8E8E93', marginBottom: 16 },
  inputGroup: { marginTop: 8, marginBottom: 8 },
  inputLabel: { fontSize: 14, color: '#666', marginBottom: 6 },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#E5E5EA', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10 },
  textInput: { flex: 1, color: '#000', fontSize: 16 },
  primaryButton: { marginTop: 12, backgroundColor: '#4A90E2', borderRadius: 10, paddingVertical: 12, alignItems: 'center' },
  verifyButton: { backgroundColor: '#7B68EE' },
  disabledButton: { backgroundColor: '#8E8E93', opacity: 0.6 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  otpHeader: { marginBottom: 8 },
  otpInfo: { fontSize: 12, color: '#8E8E93', marginTop: 2 },
  resendButton: { marginTop: 12, alignItems: 'center' },
  resendText: { fontSize: 14, color: '#4A90E2', fontWeight: '500' },
  disabledText: { color: '#8E8E93' },
});

export default PhoneVerificationScreen;


