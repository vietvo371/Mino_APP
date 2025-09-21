import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Animated, { FadeInDown, FadeInUp, SlideInDown } from 'react-native-reanimated';
import { theme } from '../theme/colors';
import InputCustom from '../component/InputCustom';
import ButtonCustom from '../component/ButtonCustom';
import LoadingOverlay from '../component/LoadingOverlay';
import api from '../utils/Api';

const { width, height } = Dimensions.get('window');

interface UserProfile {
  full_name: string;
  email: string;
  number_phone: string;
  address: string;
  is_ekyc: number;
  is_active_mail: number;
  is_active_phone: number;
  is_open: number;
  is_level: number;
}

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Verification statuses
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isEkycVerified, setIsEkycVerified] = useState(false);

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get('/client/profile');
      
      if (response.data.status) {
        const profileData = response.data.data;
        setUser(profileData);
        setFullName(profileData.full_name || '');
        setEmail(profileData.email || '');
        setPhone(profileData.number_phone || '');
        setAddress(profileData.address || '');
        
        // Check verification statuses
        setIsEmailVerified(profileData.is_active_mail === 1);
        setIsPhoneVerified(profileData.is_active_phone === 1);
        setIsEkycVerified(profileData.is_ekyc === 1);
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
      Alert.alert('Error', 'Cannot load profile information');
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Only validate full name if not eKYC verified
    if (!isEkycVerified) {
      if (!fullName.trim()) {
        newErrors.full_name = 'Full name is required';
      } else if (fullName.trim().length < 2) {
        newErrors.full_name = 'Full name must be at least 2 characters';
      }
    }

    if (!address.trim()) {
      newErrors.address = 'Address is required';
    }

    // Only validate email if not verified and has value
    if (!isEmailVerified && email.trim()) {
      if (!/\S+@\S+\.\S+/.test(email.trim())) {
        newErrors.email = 'Please enter a valid email';
      }
    }

    // Only validate phone if not verified and has value
    if (!isPhoneVerified && phone.trim()) {
      if (!/^[0-9+().\-\s]{7,15}$/.test(phone.trim())) {
        newErrors.number_phone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    const isValid = validateForm();
    if (!isValid) {
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        address: address.trim(),
      };

      // Only include full name if not eKYC verified
      if (!isEkycVerified) {
        updateData.full_name = fullName.trim();
      }

      // Only include email if not verified
      if (!isEmailVerified && email.trim()) {
        updateData.email = email.trim();
      }

      // Only include phone if not verified
      if (!isPhoneVerified && phone.trim()) {
        updateData.number_phone = phone.trim();
      }

      const response = await api.post('/client/update-profile',   );
      
      if (response.data.status) {
        Alert.alert('Success', 'Update profile successfully!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]);
      } else {
        Alert.alert('Error', response.data.message || 'Update profile failed');
      }
    } catch (error: any) {
      console.log('Update profile error:', error);
      if (error.response?.data?.errors) {
        const newErrors: Record<string, string> = {};
        Object.keys(error.response.data.errors).forEach(field => {
          newErrors[field] = error.response.data.errors[field][0];
        });
        setErrors(newErrors);
      } else {
        let errorMessage = 'Update profile failed. Please try again.';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setSaving(false);
    }
  };

  const updateFormData = (key: string, value: string) => {
    switch (key) {
      case 'full_name':
        setFullName(value);
        break;
      case 'email':
        setEmail(value);
        break;
      case 'number_phone':
        setPhone(value);
        break;
      case 'address':
        setAddress(value);
        break;
    }
    
    if (errors[key]) {
      setErrors(prev => ({ ...prev, [key]: '' }));
    }
  };

  const renderInputField = (
    fieldKey: string,
    label: string,
    value: string,
    placeholder: string,
    isVerified: boolean,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default',
    icon: string
  ) => (
    <View style={styles.inputGroup}>
      <View style={styles.inputLabelContainer}>
        <Text style={styles.inputLabel}>{label}</Text>
        {isVerified && (
          <View style={styles.verifiedBadge}>
            <Icon name="check-circle" size={14} color={theme.colors.success || '#34C759'} />
            <Text style={styles.verifiedText}>Verified</Text>
          </View>
        )}
      </View>
      
      <InputCustom
        // placeholder={placeholder}
        value={value}
        onChangeText={(text) => updateFormData(fieldKey, text)}
        keyboardType={keyboardType}
        error={errors[fieldKey]}
        required={!isVerified}
        leftIcon={icon}
        rightIcon={isVerified ? 'lock' : undefined}
        editable={!isVerified}
        containerStyle={styles.input}
      />
      
      {isVerified && (
        <Text style={styles.disabledText}>
          {fieldKey === 'full_name' 
            ? 'This field has been verified through eKYC and cannot be edited'
            : 'This field has been verified and cannot be edited'
          }
        </Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading information...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.mainContent}>
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
              <Text style={styles.headerTitle}>Edit Profile</Text>
            </View>
          </Animated.View>

          <ScrollView
            style={styles.scrollView}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {/* Main Card */}
            <Animated.View
              style={styles.card}
              entering={SlideInDown.duration(800).delay(200).springify()}
            >
              {/* Form Fields */}
              <View style={styles.formContainer}>
                {renderInputField(
                  'full_name',
                  'Full Name',
                  fullName,
                  'Enter your full name',
                  isEkycVerified, // Not editable if eKYC verified
                  'default',
                  'account-outline'
                )}

                {renderInputField(
                  'email',
                  'Email',
                  email,
                  'Enter your email',
                  isEmailVerified,
                  'email-address',
                  'email-outline'
                )}

                {renderInputField(
                  'number_phone',
                  'Phone',
                  phone,
                  'Enter your phone',
                  isPhoneVerified,
                  'phone-pad',
                  'phone-outline'
                )}

                {renderInputField(
                  'address',
                  'Address',
                  address,
                  'Enter your address',
                  false, // Always editable
                  'default',
                  'map-marker-outline'
                )}
              </View>

              {/* Save Button */}
              <ButtonCustom
                title="Save Changes"
                onPress={handleSave}
                style={styles.saveButton}
                icon="content-save"
                loading={saving}
              />
            </Animated.View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <LoadingOverlay visible={saving} message="Saving changes..." />
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
  mainContent: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: height * 0.03,
    paddingBottom: theme.spacing.lg,
    gap: theme.spacing.md,
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
    fontSize: 28,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    fontWeight: '600',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.xl,
  },

  // Card Styles
  card: {
    backgroundColor: theme.colors.white,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.xl,
  },

  // Form Styles
  formContainer: {
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  inputLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: (theme.colors.success || '#34C759') + '15',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    gap: theme.spacing.xs,
  },
  verifiedText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.success || '#34C759',
    fontFamily: theme.typography.fontFamily,
    fontWeight: '600',
  },
  input: {
    marginBottom: 0,
  },
  disabledText: {
    fontSize: theme.typography.fontSize.xs,
    color: '#8E8E93',
    fontFamily: theme.typography.fontFamily,
    marginTop: theme.spacing.xs,
    fontStyle: 'italic',
  },

  // Save Button
  saveButton: {
    height: 56,
    marginTop: theme.spacing.lg,
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily,
    marginTop: theme.spacing.md,
  },
});

export default EditProfileScreen;
