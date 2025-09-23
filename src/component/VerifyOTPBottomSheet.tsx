import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  Animated,
  Easing,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';
import LoadingOverlay from './LoadingOverlay';
import api from '../utils/Api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const OTP_LENGTH = 6;

export type OtpMode = 'action' | 'register' | 'forgot';

type EndpointBuilder = {
  url: string;
  buildBody: (p: { identifier: string; type: 'email' | 'phone'; otp?: string }) => any;
};

export interface VerifyOTPBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  identifier: string; // email or phone based on type
  type: 'email' | 'phone';
  typeEnpoints?: 'bank' | 'wallet';
  mode?: OtpMode; // defaults to 'action'
  onVerified: (payload: { otp: string; token?: string; response?: any }) => void;
  title?: string;
  message?: string;
  resendDisabledSeconds?: number;
  endpoints?: {
    verify?: EndpointBuilder;
    resend?: EndpointBuilder;
  };
}

const VerifyOTPBottomSheet: React.FC<VerifyOTPBottomSheetProps> = ({
  visible,
  onClose,
  identifier,
  type,
  typeEnpoints,
  mode = 'action',
  onVerified,
  title,
  message,
  resendDisabledSeconds = 60,
  endpoints,
}) => {
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));
  const [otp, setOtp] = useState<string[]>(Array.from({ length: OTP_LENGTH }, () => ''));
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [otpString, setOtpString] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [timer, setTimer] = useState<number>(resendDisabledSeconds);
  const [canResend, setCanResend] = useState<boolean>(false);
  const [hasVerified, setHasVerified] = useState<boolean>(false);
  const hiddenInputRef = useRef<TextInput>(null);

  // Compute default endpoints if not provided
  const verifyEndpoint: EndpointBuilder = useMemo(() => {
    if (endpoints?.verify) return endpoints.verify;
    // Custom business flow: verify bank/wallet action
    if (typeEnpoints) {
      return {
        url: '/client/verify-otp-bank-wallet',
        buildBody: ({ identifier, type, otp }) => (
          type === 'email'
            ? { email: identifier, type: typeEnpoints, otp }
            : { phone: identifier, type: typeEnpoints, otp }
        ),
      };
    }
    return {
        url: '/client/verify-otp-bank-wallet',
        buildBody: ({ identifier, type, otp }) => (
          type === 'email'
            ? { email: identifier, type: typeEnpoints, otp }
            : { phone: identifier, type: typeEnpoints, otp }
        ),
    };
  }, [endpoints?.verify, mode, typeEnpoints]);

  const resendEndpoint: EndpointBuilder = useMemo(() => {
    if (endpoints?.resend) return endpoints.resend;
    if (typeEnpoints) {
      return {
        url: '/client/send-otp-bank-wallet',
        buildBody: ({ identifier, type }) => (
          type === 'email'
            ? { email: identifier, type: typeEnpoints }
            : { phone: identifier, type: typeEnpoints }
        ),
      };
    }
    return {
      url: '/auth/resend-otp',
      buildBody: ({ identifier, type }) => ({ username: identifier, type }),
    };
  }, [endpoints?.resend, typeEnpoints]);

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 8,
      }).start();
      // reset state
      setOtp(Array.from({ length: OTP_LENGTH }, () => ''));
      setCurrentIndex(0);
      setOtpString('');
      setTimer(resendDisabledSeconds);
      setCanResend(false);
      setHasVerified(false);
      // Auto send OTP on open for action flows
      // Don't await to keep opening smooth
      setTimeout(() => {
        sendOtp(true).catch(() => undefined);
      }, 50);
    } else if (modalVisible) {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 150,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start(() => setModalVisible(false));
    }
  }, [visible]);

  useEffect(() => {
    let interval: number | undefined;
    if (modalVisible && timer > 0 && !canResend) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (modalVisible) {
      setCanResend(true);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [modalVisible, timer, canResend]);

  useEffect(() => {
    const v = otp.join('');
    if (v.length === OTP_LENGTH && !loading && !hasVerified) {
      // small delay for UX
      const t = setTimeout(() => handleVerify(), 400);
      return () => clearTimeout(t);
    }
  }, [otp, loading, hasVerified]);

  const close = () => {
    if (loading) return;
    Animated.timing(slideAnim, {
      toValue: SCREEN_HEIGHT,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start(() => {
      setModalVisible(false);
      onClose();
    });
  };

  const handleKey = (digit: string) => {
    if (currentIndex >= OTP_LENGTH) return;
    if (hasVerified) setHasVerified(false);
    const newOtp = [...otp];
    newOtp[currentIndex] = digit;
    setOtp(newOtp);
    if (currentIndex < OTP_LENGTH - 1) setCurrentIndex(currentIndex + 1);
  };

  const handleDelete = () => {
    if (hasVerified) setHasVerified(false);
    if (currentIndex > 0) {
      const newOtp = [...otp];
      newOtp[currentIndex - 1] = '';
      setOtp(newOtp);
      setCurrentIndex(currentIndex - 1);
    } else if (otp[currentIndex]) {
      const newOtp = [...otp];
      newOtp[currentIndex] = '';
      setOtp(newOtp);
    }
  };

  const handlePasteText = (text: string) => {
    const numeric = text.replace(/[^0-9]/g, '');
    if (!numeric) return;
    if (hasVerified) setHasVerified(false);
    const newOtp = [...otp];
    const start = currentIndex;
    for (let i = 0; i < Math.min(numeric.length, OTP_LENGTH - start); i++) {
      newOtp[start + i] = numeric[i];
    }
    setOtp(newOtp);
    const nextIndex = Math.min(start + numeric.length, OTP_LENGTH - 1);
    setCurrentIndex(nextIndex);
  };

  const handleHiddenTextChange = (text: string) => {
    setOtpString(text);
    if (text.length > otp.filter(Boolean).length) handlePasteText(text);
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) return;
    if (hasVerified || loading) return;
    setHasVerified(true);
    setLoading(true);
    try {
      const body = verifyEndpoint.buildBody({ identifier, type, otp: code });
      const res = await api.post(verifyEndpoint.url, body);
      if (res?.data?.status === false) {
        Alert.alert('OTP', res?.data?.message || 'Verification failed', [
          {
            text: 'OK',
            onPress: () => {
              setHasVerified(false);
              setOtp(Array.from({ length: OTP_LENGTH }, () => ''));
              setCurrentIndex(0);
              setOtpString('');
            },
          },
        ]);
        return;
      }
      const token = res?.data?.data?.token;
      onVerified({ otp: code, token, response: res?.data });
      close();
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Verification error';
      Alert.alert('OTP', msg, [
        {
          text: 'OK',
          onPress: () => {
            setHasVerified(false);
            setOtp(Array.from({ length: OTP_LENGTH }, () => ''));
            setCurrentIndex(0);
            setOtpString('');
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const sendOtp = async (force?: boolean) => {
    if (loading) return;
    if (!force && !canResend) return;
    setLoading(true);
    try {
      const body = resendEndpoint.buildBody({ identifier, type });
      const res = await api.post(resendEndpoint.url, body);
      if (res?.data?.status === false) {
        Alert.alert('OTP', res?.data?.message || 'Failed to send');
      } else {
        if (!force) {
          Alert.alert('OTP', 'Code resent');
        }
        setTimer(resendDisabledSeconds);
        setCanResend(false);
        setOtp(Array.from({ length: OTP_LENGTH }, () => ''));
        setCurrentIndex(0);
        setOtpString('');
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to send';
      Alert.alert('OTP', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => sendOtp(false);

  const headerTitle = title || (mode === 'register' ? 'Xác minh tài khoản' : mode === 'forgot' ? 'Xác minh để đặt lại mật khẩu' : 'Xác minh OTP');
  const headerMessage = message || (mode === 'register' ? `Nhập mã 6 số đã gửi tới ${identifier}` : mode === 'forgot' ? `Nhập mã 6 số đã gửi tới ${identifier}` : `Nhập mã 6 số để tiếp tục`);

  return (
    <Modal
      visible={modalVisible}
      animationType="fade"
      transparent={true}
      onRequestClose={close}
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={close} />

        <Animated.View style={[styles.modalContent, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.modalHeader}>
            <View style={styles.grabber} />
            <View style={styles.modalTitleContainer}>
              <Text style={styles.modalTitle}>{headerTitle}</Text>
              <TouchableOpacity onPress={close} style={styles.closeButton} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                <Icon name="close" size={24} color={theme.colors.textLight} />
              </TouchableOpacity>
            </View>
            <Text style={styles.subtitle}>{headerMessage}</Text>
          </View>

          {/* Hidden input for paste */}
          <TextInput
            ref={hiddenInputRef}
            style={styles.hiddenInput}
            value={otpString}
            onChangeText={handleHiddenTextChange}
            keyboardType="number-pad"
            maxLength={OTP_LENGTH}
            autoFocus={false}
            caretHidden={true}
            contextMenuHidden={false}
            selectTextOnFocus={true}
          />

          {/* OTP Boxes */}
          <TouchableOpacity style={styles.otpContainer} onPress={() => hiddenInputRef.current?.focus()} activeOpacity={1}>
            {otp.map((digit, index) => {
              const isActive = index === currentIndex;
              const isFilled = Boolean(digit);
              return (
                <View key={index} style={[styles.otpBox, isActive && styles.otpBoxActive, isFilled && styles.otpBoxFilled]}>
                  <Text style={[styles.otpText, isFilled && styles.otpTextFilled]}>{digit || (isActive ? '|' : '')}</Text>
                </View>
              );
            })}
          </TouchableOpacity>

          {/* Timer / Resend */}
          <View style={styles.resendRow}>
            {!canResend ? (
              <Text style={styles.timerText}>Resend after <Text style={styles.timerValue}>{timer}s</Text></Text>
            ) : (
              <TouchableOpacity onPress={handleResend} style={styles.resendButton} activeOpacity={0.7}>
                <Text style={styles.resendButtonText}>Resend code</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Number Pad */}
          <View style={styles.pad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <TouchableOpacity key={n} style={styles.padKey} onPress={() => handleKey(String(n))} activeOpacity={0.7}>
                <Text style={styles.padKeyText}>{n}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.padKey} onPress={handleDelete} activeOpacity={0.7}>
              <Icon name="backspace-outline" size={20} color={theme.colors.textLight} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.padKey} onPress={() => handleKey('0')} activeOpacity={0.7}>
              <Text style={styles.padKeyText}>0</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.padKey, styles.padKeyPrimary]} onPress={handleVerify} disabled={otp.join('').length !== OTP_LENGTH} activeOpacity={0.7}>
              <Icon name="check" size={22} color={theme.colors.white} />
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>

      <LoadingOverlay visible={loading} message="Verifying..." />
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContent: {
    backgroundColor: theme.colors.white,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    height: SCREEN_HEIGHT * 0.65,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    paddingBottom: 16,
  },
  modalHeader: {
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    alignItems: 'center',
  },
  grabber: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  modalTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: theme.spacing.lg,
  },
  modalTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    letterSpacing: 0.3,
  },
  closeButton: {
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textLight,
    paddingHorizontal: theme.spacing.lg,
    marginTop: 6,
    textAlign: 'center',
  },
  hiddenInput: {
    position: 'absolute',
    left: -9999,
    opacity: 0,
    width: 1,
    height: 1,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  otpBox: {
    width: 44,
    height: 44,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  otpBoxActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.white,
  },
  otpBoxFilled: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '15',
  },
  otpText: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.textLight,
    fontWeight: '600',
  },
  otpTextFilled: {
    color: theme.colors.primary,
  },
  resendRow: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  timerText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textLight,
  },
  timerValue: {
    color: theme.colors.primary,
    fontWeight: '600',
  },
  resendButton: {
    paddingVertical: 6,
  },
  resendButtonText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
  },
  padKey: {
    width: '30%',
    aspectRatio: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  padKeyPrimary: {
    backgroundColor: theme.colors.primary,
    borderWidth: 0,
  },
  padKeyText: {
    fontSize: 20,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    fontWeight: '600',
  },
});

export default VerifyOTPBottomSheet;


