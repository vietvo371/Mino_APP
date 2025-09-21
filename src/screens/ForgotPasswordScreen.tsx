import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Alert,
  Image,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp, SlideInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';
import InputCustom from '../component/InputCustom';
import ButtonCustom from '../component/ButtonCustom';
import LoadingOverlay from '../component/LoadingOverlay';
import LanguageSelector from '../components/LanguageSelector';
import CountryCodePicker from '../components/CountryCodePicker';
import api from '../utils/Api';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { useTranslation } from '../hooks/useTranslation';

interface ForgotPasswordScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');

const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const { t, getCurrentLanguage } = useTranslation();
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ identifier?: string; otp?: string }>({});
  const [isPhoneNumber, setIsPhoneNumber] = useState(false);
  const [showLanguageSelector, setShowLanguageSelector] = useState(false);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState({
    code: 'VN',
    name: 'Vietnam',
    dialCode: '+84',
    flag: '🇻🇳',
  });

  // OTP states (not used in this screen anymore)
  const [verifying, setVerifying] = useState(false);

  const validateForm = () => {
    const newErrors: { identifier?: string } = {};

    if (!identifier) {
      newErrors.identifier = isPhoneNumber ? t('auth.phoneRequired') : t('auth.emailRequired');
    } else if (isPhoneNumber) {
      if (!/^\d{9,10}$/.test(identifier)) {
        newErrors.identifier = t('auth.validPhone');
      }
    } else {
      if (!/\S+@\S+\.\S+/.test(identifier)) {
        newErrors.identifier = t('auth.validEmail');
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };


  const handleInputTypeChange = (isPhone: boolean) => {
    setIsPhoneNumber(isPhone);
    setIdentifier('');
    setErrors({});
  };


  const handleSendOTPForgot = async () => {
    if (!validateForm()) {
      return;
    }
    console.log('Send OTP for forgot password:', isPhoneNumber);
    console.log('Send OTP for forgot password:', identifier);
    setLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', {
        username: identifier,
        type: isPhoneNumber ? 'phone' : 'email'
      });

      console.log('Send OTP response:', response.data);

      if (response.data.status) {
        navigation.navigate('OTPVerification', {
          identifier: identifier,
          type: isPhoneNumber ? 'phone' : 'email',
          flow: 'forgot',
        })
      } else {
        setErrors({
          identifier: response.data.message
        });
      }
    } catch (error: any) {
      if (error.response?.data?.errors) {
        const newErrors: Record<string, string> = {};
        Object.keys(error.response.data.errors).forEach(field => {
          newErrors[field] = error.response.data.errors[field][0];
        });
        setErrors(newErrors);
      } else if (error.response?.data?.message) {
        setErrors({
          identifier: error.response.data.message
        });
      } else if (error.message) {
        setErrors({
          identifier: error.message
        });
      } else {
        setErrors({
          identifier: 'Failed to send OTP. Please try again.'
        });
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Background */}
      <View style={styles.backgroundContainer}>
        {/* Decorative Elements */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />

        {/* Header Icons */}
        <View style={styles.headerIcons}>
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => setShowLanguageSelector(true)}
          >
            <Image 
              source={getCurrentLanguage() === 'vi' 
                ? require('../assets/images/logo_vietnam.jpg')
                : require('../assets/images/logo_eng.png')
              }
              style={styles.languageFlag}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('Help')}
          >
            <Icon name="headset" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>

        <LanguageSelector
          visible={showLanguageSelector}
          onClose={() => setShowLanguageSelector(false)}
          onSelect={(code) => {
            console.log('Selected language:', code);
          }}
          currentLanguage={getCurrentLanguage()}
        />

        <CountryCodePicker
          visible={showCountryPicker}
          onClose={() => setShowCountryPicker(false)}
          onSelect={(country) => setSelectedCountry(country)}
          selectedCountry={selectedCountry}
        />
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
          {/* Back Button */}
          <Animated.View
            style={styles.backButtonContainer}
            entering={FadeInDown.duration(400).springify()}
          >
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Icon name="arrow-left" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </Animated.View>

          {/* Header Section */}
          <Animated.View
            style={styles.headerContainer}
            entering={FadeInDown.duration(600).delay(200).springify()}
          >
            <View style={styles.iconContainer}>
              <Icon name="lock-reset" size={48} color={theme.colors.primary} />
            </View>

            <Text style={styles.title}>
              {t('auth.forgotPasswordTitle')}
            </Text>
            <Text style={styles.subtitle}>
              {t('auth.forgotPasswordSubtitle')}
            </Text>
          </Animated.View>

          {/* Form Section */}
          <Animated.View
            style={styles.formContainer}
            entering={SlideInDown.duration(800).delay(400).springify()}
          >
            <View style={styles.form}>
              {/* Input Type Indicator */}
              <View style={styles.inputTypeIndicator}>
                <TouchableOpacity
                  style={[
                    styles.inputTypeTab,
                    !isPhoneNumber && styles.inputTypeTabActive
                  ]}
                  onPress={() => handleInputTypeChange(false)}
                >
                  <Icon
                    name="email-outline"
                    size={16}
                    color={!isPhoneNumber ? theme.colors.primary : theme.colors.textLight}
                  />
                  <Text style={[
                    styles.inputTypeText,
                    !isPhoneNumber && styles.inputTypeTextActive
                  ]}>
                    {t('auth.email')}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.inputTypeTab,
                    isPhoneNumber && styles.inputTypeTabActive
                  ]}
                  onPress={() => handleInputTypeChange(true)}
                >
                  <Icon
                    name="phone-outline"
                    size={16}
                    color={isPhoneNumber ? theme.colors.primary : theme.colors.textLight}
                  />
                  <Text style={[
                    styles.inputTypeText,
                    isPhoneNumber && styles.inputTypeTextActive
                  ]}>
                    {t('auth.phone')}
                  </Text>
                </TouchableOpacity>
              </View>

              {isPhoneNumber ? (
                <View style={styles.phoneInputContainer}>
                  <View style={styles.phoneInputWrapper}>
                    <InputCustom
                      label={t('auth.phoneNumber')}
                      placeholder={t('auth.enterPhoneNumber')}
                      value={identifier}
                      onChangeText={setIdentifier}
                      keyboardType="phone-pad"
                      autoCapitalize="none"
                      error={errors.identifier}
                      required
                      leftIcon="phone-outline"
                      containerStyle={styles.phoneInput}
                    />
                  </View>
                </View>
              ) : (
                <InputCustom
                  label={t('auth.emailAddress')}
                  placeholder={t('auth.enterEmail')}
                  value={identifier}
                  onChangeText={setIdentifier}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.identifier}
                  required
                  leftIcon="email-outline"
                  containerStyle={styles.input}
                />
              )}

              <ButtonCustom
                title={t('auth.sendVerificationCode')}
                onPress={handleSendOTPForgot}
                style={styles.resetButton}
                icon="send"
              />
              {/* Back to Login */}
              <TouchableOpacity
                onPress={() => navigation.goBack()}
                style={styles.backToLoginContainer}
              >
                <Text style={styles.backToLoginText}>
                  {t('auth.rememberPassword')}{' '}
                  <Text style={styles.backToLoginLinkText}>{t('auth.signInLink')}</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </Animated.View>

          {/* Footer */}
          <Animated.View
            style={styles.footerContainer}
            entering={FadeInUp.duration(600).delay(800).springify()}
          >
            {/* Security Badge */}
            <View style={styles.securityBadge}>
              <Icon name="shield-check" size={16} color={theme.colors.success} />
              <Text style={styles.securityText}>
                {t('auth.dataProtected')}
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={loading} message={t('auth.sendingVerificationCode')} />
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
  headerIcons: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 70 : 30,
    right: 20,
    flexDirection: 'column',
    gap: theme.spacing.md,
    zIndex: 1,
  },
  headerIconButton: {
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
  languageFlag: {
    width: 24,
    height: 24,
    borderRadius: 12,
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

  // Back Button
  backButtonContainer: {
    paddingTop: height * 0.02,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Header Styles
  headerContainer: {
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 28,
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: theme.spacing.lg,
  },

  // Form Styles
  formContainer: {
    backgroundColor: theme.colors.white,
    borderRadius: 32,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.15,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  form: {
    width: '100%',
  },

  // Input Type Indicator
  inputTypeIndicator: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: 16,
    padding: 4,
    marginBottom: theme.spacing.lg,
  },
  inputTypeTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: 12,
    gap: 6,
  },
  inputTypeTabActive: {
    backgroundColor: theme.colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  inputTypeText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily,
  },
  inputTypeTextActive: {
    color: theme.colors.primary,
  },

  input: {
    marginBottom: theme.spacing.lg,
  },
  phoneInputContainer: {
    marginBottom: theme.spacing.lg,
  },
  phoneInputWrapper: {
    flex: 1,
  },
  phoneInput: {
    flex: 1,
  },
  resetButton: {
    marginBottom: theme.spacing.lg,
    height: 56,
  },

  // Back to Login
  backToLoginContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  backToLoginText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    textAlign: 'center',
  },
  backToLoginLinkText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily,
  },

  // Footer Styles
  footerContainer: {
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
  },
  securityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.colors.success + '10',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.success + '20',
  },
  securityText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center',
    flex: 1,
  },

});

export default ForgotPasswordScreen;
