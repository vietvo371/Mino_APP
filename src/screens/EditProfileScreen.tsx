import React, { useEffect, useState } from 'react';
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
  Dimensions,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { theme } from '../theme/colors';
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
      }
    } catch (error) {
      console.log('Error fetching profile:', error);
      Alert.alert('Error', 'Cannot load profile information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return;
    }

    if (!address.trim()) {
      Alert.alert('Error', 'Please enter your address');
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        full_name: fullName.trim(),
        address: address.trim(),
      };

      // Only include email if not verified
      if (!isEmailVerified && email.trim()) {
        updateData.email = email.trim();
      }

      // Only include phone if not verified
      if (!isPhoneVerified && phone.trim()) {
        updateData.number_phone = phone.trim();
      }

      const response = await api.put('/client/profile', updateData);
      
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
      let errorMessage = 'Update profile failed. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const renderInputField = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
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
      <View style={[
        styles.inputWrapper,
        isVerified && styles.inputWrapperDisabled
      ]}>
        <Icon name={icon} size={20} color={isVerified ? '#8E8E93' : theme.colors.primary} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          style={[styles.textInput, isVerified && styles.textInputDisabled]}
          placeholderTextColor="#8E8E93"
          editable={!isVerified}
        />
        {isVerified && (
          <Icon name="lock" size={16} color="#8E8E93" />
        )}
      </View>
      {isVerified && (
        <Text style={styles.disabledText}>
          This field has been verified and cannot be edited
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
        >
          {/* Main Card */}
          <Animated.View
            style={styles.card}
            entering={FadeInDown.duration(800).delay(200).springify()}
          >
            {/* Form Fields */}
            <View style={styles.formContainer}>
              {renderInputField(
                'Full Name',
                fullName,
                setFullName,
                'Enter your full name',
                false, // Always editable
                'default',
                'account'
              )}

              {renderInputField(
                'Email',
                email,
                setEmail,
                'Enter your email',
                isEmailVerified,
                'email-address',
                'email'
              )}

              {renderInputField(
                'Phone',
                phone,
                setPhone,
                'Enter your phone',
                isPhoneVerified,
                'phone-pad',
                'phone'
              )}

              {renderInputField(
                'Address',
                address,
                setAddress,
                'Enter your address',
                false, // Always editable
                'default',
                'map-marker'
              )}
            </View>

            {/* Save Button */}
            <TouchableOpacity
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Icon name="content-save" size={20} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Save changes</Text>
                </>
              )}
            </TouchableOpacity>
          </Animated.View>

        </ScrollView>
      </View>
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
  mainContent: {
    flex: 1,
    paddingHorizontal: wp('4%'),
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingTop: hp('3%'),
    paddingBottom: hp('2%'),
    gap: wp('4%'),
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
    fontSize: wp('6%'),
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    marginBottom: hp('0.5%'),
    fontWeight: '600',
  },
  headerSubtitle: {
    fontSize: wp('4%'),
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily,
    lineHeight: wp('5%'),
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: hp('4%'),
  },

  // Card Styles
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: wp('4%'),
    padding: wp('6%'),
    marginBottom: hp('2%'),
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
  cardHeader: {
    alignItems: 'center',
    marginBottom: hp('3%'),
  },
  cardIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: hp('2%'),
  },
  cardTitle: {
    fontSize: wp('5%'),
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    fontWeight: '600',
    marginBottom: hp('0.5%'),
  },
  cardSubtitle: {
    fontSize: wp('4%'),
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily,
    textAlign: 'center',
  },

  // Form Styles
  formContainer: {
    marginBottom: hp('3%'),
  },
  inputGroup: {
    marginBottom: hp('2%'),
  },
  inputLabelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  inputLabel: {
    fontSize: wp('4%'),
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    fontWeight: '600',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: (theme.colors.success || '#34C759') + '15',
    paddingHorizontal: wp('2%'),
    paddingVertical: hp('0.5%'),
    borderRadius: wp('2%'),
    gap: wp('1%'),
  },
  verifiedText: {
    fontSize: wp('3%'),
    color: theme.colors.success || '#34C759',
    fontFamily: theme.typography.fontFamily,
    fontWeight: '600',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: wp('3%'),
    paddingHorizontal: wp('4%'),
    paddingVertical: hp('1.5%'),
    backgroundColor: theme.colors.white,
    gap: wp('3%'),
  },
  inputWrapperDisabled: {
    backgroundColor: '#F8F8F8',
    borderColor: '#E5E5EA',
  },
  textInput: {
    flex: 1,
    fontSize: wp('4%'),
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
  },
  textInputDisabled: {
    color: '#8E8E93',
  },
  disabledText: {
    fontSize: wp('3%'),
    color: '#8E8E93',
    fontFamily: theme.typography.fontFamily,
    marginTop: hp('0.5%'),
    fontStyle: 'italic',
  },

  // Save Button
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: hp('1.5%'),
    paddingHorizontal: wp('8%'),
    borderRadius: wp('3%'),
    gap: wp('2%'),
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  saveButtonDisabled: {
    backgroundColor: theme.colors.textLight,
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: wp('4%'),
    color: theme.colors.white,
    fontFamily: theme.typography.fontFamily,
    fontWeight: '600',
  },

  // Info Card
  infoCard: {
    backgroundColor: theme.colors.primary + '10',
    borderRadius: wp('3%'),
    padding: wp('4%'),
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.primary,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: hp('1%'),
    gap: wp('2%'),
  },
  infoTitle: {
    fontSize: wp('4%'),
    color: theme.colors.text,
    fontFamily: theme.typography.fontFamily,
    fontWeight: '600',
  },
  infoText: {
    fontSize: wp('3.5%'),
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily,
    lineHeight: wp('5%'),
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: wp('4%'),
    color: theme.colors.textLight,
    fontFamily: theme.typography.fontFamily,
    marginTop: hp('2%'),
  },
});

export default EditProfileScreen;
