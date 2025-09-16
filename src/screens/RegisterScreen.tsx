import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Animated, { FadeInDown, FadeInUp, SlideInDown } from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { theme } from '../theme/colors';
import { useAuth } from '../contexts/AuthContext';
import Header from '../component/Header';
import InputCustom from '../component/InputCustom';
import ButtonCustom from '../component/ButtonCustom';
import LoadingOverlay from '../component/LoadingOverlay';

interface RegisterScreenProps {
  navigation: any;
}

const { width, height } = Dimensions.get('window');


const RegisterScreen: React.FC<RegisterScreenProps> = ({ navigation }) => {
  const { signUp } = useAuth();


  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: '',
    password_confirmation: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);


  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Name validation
    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Phone validation
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9+().\-\s]{7,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please enter a valid phone number';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    // Password confirmation
    if (!formData.password_confirmation) {
      newErrors.password_confirmation = 'Please confirm your password';
    } else if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setLoading(true);
    try {
      const registrationData = {
        email: formData.email,
        phone: formData.phone,
        full_name: formData.name,
        date_of_birth: new Date().toISOString().split('T')[0], // Default to today
        user_type: 'individual' as const,
        address: formData.address || undefined,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      };
      await signUp(registrationData);
      navigation.replace('Login');
    } catch (error: any) {
      console.error('Registration error:', error);

      if (error.errors) {
        const newErrors: Record<string, string> = {};
        Object.keys(error.errors).forEach(field => {
          newErrors[field] = error.errors[field][0];
        });
        setErrors(newErrors);
      } else {
        setErrors({
          email: error.message
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (key: string, value: string | Date) => {
    setFormData(prev => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/\d/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 2) return { text: 'Weak', color: theme.colors.error };
    if (strength <= 4) return { text: 'Medium', color: theme.colors.warning };
    return { text: 'Strong', color: theme.colors.success };
  };



  const renderForm = () => (
    <Animated.View
      style={styles.formContainer}
      entering={SlideInDown.duration(800).delay(800).springify()}
    >
      <View style={styles.formHeader}>
        <Text style={styles.formSubtitle}>
          Sign up to start your trading journey
        </Text>
      </View>

      <View style={styles.form}>
        <InputCustom
          label="Full Name"
          placeholder="Enter your full name"
          value={formData.name}
          onChangeText={value => updateFormData('name', value)}
          error={errors.name}
          required
          leftIcon="account-outline"
          containerStyle={styles.input}
        />

        <InputCustom
          label="Phone Number"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChangeText={value => updateFormData('phone', value)}
          keyboardType="phone-pad"
          error={errors.phone}
          required
          leftIcon="phone-outline"
          containerStyle={styles.input}
        />

        <InputCustom
          label="Email Address"
          placeholder="Enter your email address"
          value={formData.email}
          onChangeText={value => updateFormData('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
          error={errors.email}
          required
          leftIcon="email-outline"
          containerStyle={styles.input}
        />

        <InputCustom
          label="Password"
          placeholder="Create a password"
          value={formData.password}
          onChangeText={(text) => {
            updateFormData('password', text);
            setPasswordStrength(calculatePasswordStrength(text));
          }}
          secureTextEntry={!showPassword}
          error={errors.password}
          required
          leftIcon="lock-outline"
          rightIcon={showPassword ? 'eye-off-outline' : 'eye-outline'}
          onRightIconPress={() => setShowPassword(!showPassword)}
          containerStyle={styles.input}
        />

        {/* Password Strength Indicator */}
        {formData.password.length > 0 && (
          <View style={styles.passwordStrengthContainer}>
            <View style={styles.passwordStrengthBar}>
              <View 
                style={[
                  styles.passwordStrengthFill,
                  { 
                    width: `${(passwordStrength / 6) * 100}%`,
                    backgroundColor: getPasswordStrengthText(passwordStrength).color
                  }
                ]} 
              />
            </View>
            <Text style={[
              styles.passwordStrengthText,
              { color: getPasswordStrengthText(passwordStrength).color }
            ]}>
              {getPasswordStrengthText(passwordStrength).text}
            </Text>
          </View>
        )}

        <InputCustom
          label="Confirm Password"
          placeholder="Confirm your password"
          value={formData.password_confirmation}
          onChangeText={value => updateFormData('password_confirmation', value)}
          secureTextEntry={!showConfirmPassword}
          error={errors.password_confirmation}
          required
          leftIcon="lock-check-outline"
          rightIcon={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
          onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
          containerStyle={styles.input}
        />

        <InputCustom
          label="Address"
          placeholder="Enter your address"
          value={formData.address}
          onChangeText={value => updateFormData('address', value)}
          error={errors.address}
          leftIcon="map-marker-outline"
          containerStyle={styles.input}
        />

        <ButtonCustom
          title="Create Account"
          onPress={handleRegister}
          style={styles.registerButton}
          icon="account-plus"
        />
      </View>
    </Animated.View>
  );



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
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.headerIconButton}
            onPress={() => navigation.navigate('Help')}
          >
            <Icon name="headset" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
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
          {/* Header Section */}
          <Animated.View
            style={styles.headerContainer}
            entering={FadeInDown.duration(600).springify()}
          >
            <Animated.Text
              style={styles.welcomeText}
              entering={FadeInDown.duration(800).delay(200).springify()}
            >
              Join MINO Trading
            </Animated.Text>

            <Animated.Text
              style={styles.title}
              entering={FadeInDown.duration(800).delay(400).springify()}
            >
              Create Account
            </Animated.Text>
          </Animated.View>

          {/* Form Section */}
          {renderForm()}

          {/* Footer */}
          <Animated.View
            style={styles.footerContainer}
            entering={FadeInUp.duration(600).delay(1200).springify()}
          >
            <TouchableOpacity
              onPress={() => navigation.navigate('Login')}
              style={styles.loginLink}
            >
              <Text style={styles.loginText}>
                Already have an account?{' '}
                <Text style={styles.loginLinkText}>Sign In</Text>
              </Text>
            </TouchableOpacity>

            {/* Security Badge */}
            <View style={styles.securityBadge}>
              <Icon name="shield-check" size={16} color={theme.colors.success} />
              <Text style={styles.securityText}>
                Your data is protected with enterprise-grade security
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={loading} message="Creating your account..." />
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
  headerContainer: {
    alignItems: 'center',
    paddingTop: height * 0.08,
    paddingBottom: theme.spacing.xl,
  },
  welcomeText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily,
    marginBottom: theme.spacing.xs,
  },
  title: {
    fontFamily: theme.typography.fontFamily,
    fontSize: 36,
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
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
  formHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  formTitle: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  formSubtitle: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textLight,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  input: {
    marginBottom: theme.spacing.lg,
  },
  registerButton: {
    marginBottom: theme.spacing.lg,
    height: 56,
  },

  // Password Strength Styles
  passwordStrengthContainer: {
    marginTop: -theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: theme.spacing.xs,
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily,
    textAlign: 'right',
  },

  // Footer Styles
  footerContainer: {
    alignItems: 'center',
    paddingBottom: theme.spacing.xl,
    gap: theme.spacing.lg,
  },
  loginLink: {
    paddingVertical: theme.spacing.sm,
  },
  loginText: {
    fontFamily: theme.typography.fontFamily,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    textAlign: 'center',
  },
  loginLinkText: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily, 
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

export default RegisterScreen;
