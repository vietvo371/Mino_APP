import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown, FadeInUp, SlideInDown } from 'react-native-reanimated';
import { theme } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import ButtonCustom from '../component/ButtonCustom';
import LoadingOverlay from '../component/LoadingOverlay';
import api from '../utils/Api';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import { StackScreen } from '../navigation/types';

interface OTPVerificationScreenProps {
  navigation: any;
  route: {
    params: {
      identifier: string;
      type: 'phone' | 'email';
    };
  };
}

const { width, height } = Dimensions.get('window');
const OTP_LENGTH = 6;

const OTPVerificationScreen: StackScreen<'OTPVerification'> = ({ navigation, route }) => {
  const { signIn } = useAuth();
  const { identifier, type } = route.params;

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  useEffect(() => {
    // Focus first input
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 500);
  }, []);

  useEffect(() => {
    let interval: number;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [timer, canResend]);

  const handleOtpChange = (value: string, index: number) => {
    // Chỉ cho phép nhập số
    if (!/^\d*$/.test(value)) return;

    // Nếu paste nhiều số
    if (value.length > 1) {
      const digits = value.split('').slice(0, OTP_LENGTH - index);
      const newOtp = [...otp];
      
      digits.forEach((digit, i) => {
        const targetIndex = index + i;
        if (targetIndex < OTP_LENGTH) {
          newOtp[targetIndex] = digit;
        }
      });

      setOtp(newOtp);

      // Focus vào ô tiếp theo sau chuỗi số vừa paste
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();

      // Nếu đã đủ số thì verify
      if (newOtp.every(digit => digit)) {
        setTimeout(() => handleVerifyOTP(), 300);
      }
      return;
    }

    // Xử lý nhập từng số
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Tự động focus ô tiếp theo khi nhập số
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Tự động verify khi đủ số
    if (value && newOtp.every(digit => digit)) {
      setTimeout(() => handleVerifyOTP(), 300);
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = () => {
    const otpString = otp.join('');
    // if (otpString.length !== OTP_LENGTH) {
    //   Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ mã OTP');
    //   return;
    // }

    // Giả lập loading 1 giây
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Luôn chuyển đến flow eKYC cho demo
      navigation.replace('EkycIntro');
    }, 1000);
  };

  const handleResendOTP = () => {
    if (!canResend) return;

    // Giả lập loading 1 giây
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setTimer(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      Alert.alert('Thành công', 'Mã OTP đã được gửi lại');
    }, 1000);
  };

  const formatIdentifier = (id: string) => {
    if (type === 'phone') {
      return id.replace(/(\d{3})(\d{3})(\d{4})/, '***-***-$3');
    }
    const [username, domain] = id.split('@');
    return `${username.charAt(0)}***@${domain}`;
  };

  const getActiveInputIndex = () => {
    return otp.findIndex(digit => !digit);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={[theme.colors.primary + '15', theme.colors.white]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animated.View
            style={styles.header}
            entering={FadeInDown.duration(600).springify()}
          >
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Icon name="arrow-left" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.headerContent}>
              <Text style={styles.headerTitle}>Verify OTP</Text>
              <Text style={styles.headerSubtitle}>
                Enter the verification code sent to {formatIdentifier(identifier)}
              </Text>
            </View>
          </Animated.View>

          {/* Form Container */}
          <Animated.View
            style={styles.formContainer}
            entering={FadeInDown.duration(800).delay(200).springify()}
          >
            {/* OTP Input Section */}
            <View style={styles.otpContainer}>
              {otp.map((digit, index) => {
                const isActive = index === getActiveInputIndex();
                const isFilled = Boolean(digit);
                
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.otpInputWrapper,
                      isActive && styles.otpInputWrapperActive
                    ]}>
                    <Animated.View
                      entering={FadeInDown.duration(400).delay(index * 100)}
                      style={styles.otpInputContainer}
                    >
                      <TextInput
                        ref={el => { inputRefs.current[index] = el }}
                        style={[
                          styles.otpInput,
                          isFilled && styles.otpInputFilled,
                          isActive && styles.otpInputActive
                        ]}
                        value={digit}
                        onChangeText={(value) => handleOtpChange(value, index)}
                        onKeyPress={(e) => handleKeyPress(e, index)}
                        keyboardType="number-pad"
                        maxLength={6}
                        selectTextOnFocus
                        autoFocus={index === 0}
                      />
                      {isFilled && (
                        <Animated.View
                          entering={FadeInDown.duration(200)}
                          style={styles.otpInputCheck}
                        >
                          <Icon name="check" size={12} color={theme.colors.primary} />
                        </Animated.View>
                      )}
                    </Animated.View>
                  </View>
                );
              })}
            </View>

            {/* Progress Bar */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <LinearGradient
                  colors={theme.colors.gradientYellow}
                  style={[
                    styles.progressFill,
                    { width: `${(otp.filter(d => d).length / OTP_LENGTH) * 100}%` }
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                />
              </View>
              <Text style={styles.progressText}>
                {otp.filter(d => d).length}/{OTP_LENGTH}
              </Text>
            </View>

            <ButtonCustom
              title="Verify"
              onPress={handleVerifyOTP}
              style={styles.verifyButton}
              disabled={otp.join('').length !== OTP_LENGTH}
              gradient
              fullWidth
            />

            {/* Resend Section */}
            <View style={styles.resendContainer}>
              {!canResend ? (
                <Text style={styles.timerText}>
                  Resend code in <Text style={styles.timer}>{timer}s</Text>
                </Text>
              ) : (
                <TouchableOpacity 
                  onPress={handleResendOTP}
                  style={styles.resendButton}
                  activeOpacity={0.7}>
                  <Text style={styles.resendButtonText}>Resend Code</Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={loading} message="Verifying..." />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.primary + '10',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.secondary + '10',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily.regular,
  },

  // Form Styles
  formContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },

  // OTP Input Styles
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  otpInputWrapper: {
    position: 'relative',
    alignItems: 'center',
  },
  otpInputWrapperActive: {
    transform: [{ scale: 1.05 }],
  },
  otpInputContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  otpInput: {
    width: (width - 120) / 6,
    height: 56,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    textAlign: 'center',
    fontSize: theme.typography.fontSize.xl,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  otpInputFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
    color: theme.colors.primary,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  otpInputActive: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
    backgroundColor: theme.colors.white,
  },
  otpInputCheck: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },

  // Progress Bar Styles
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    marginRight: theme.spacing.md,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: theme.typography.fontFamily.medium,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textLight,
  },

  // Button Styles
  verifyButton: {
    height: 56,
    marginBottom: theme.spacing.xl,
  },

  // Resend Section Styles
  resendContainer: {
    alignItems: 'center',
  },
  timerText: {
    fontFamily: theme.typography.fontFamily.regular,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textLight,
  },
  timer: {
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.primary,
  },
  resendButton: {
    paddingVertical: theme.spacing.sm,
  },
  resendButtonText: {
    fontFamily: theme.typography.fontFamily.bold,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
  },
});

export default OTPVerificationScreen;
