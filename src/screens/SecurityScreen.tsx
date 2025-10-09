import { useAlert } from "../component/AlertCustom";
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { theme } from '../theme/colors';
import { commonStyles } from "../theme/components";import api from '../utils/Api';
import { getUser } from '../utils/TokenManager';
import { useTranslation } from '../hooks/useTranslation';
import { EkycService } from '../services/EkycService';
import LoadingOverlay from '../component/LoadingOverlay';

interface UserProfile {
  full_name: string;
  email: string;
  number_phone: string;
  address: string;
  is_ekyc: number;
  is_active: number;
  is_open: number;
  is_level: number;
  is_active_mail: number;
  is_active_phone: number;
}

const SecurityScreen = () => {
  const navigation = useNavigation();
  const [biometricEnabled, setBiometricEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isEkycLoading, setIsEkycLoading] = useState(false);
  const [ekycLoadingMessage, setEkycLoadingMessage] = useState('');
  const { t  , currentLanguage} = useTranslation();


  // Fetch user profile
  const fetchUserProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get('/client/profile');
      if (response.data.status) {
        setUser(response.data.data);
      }
    } catch (error: any) {
      console.log('Profile fetch error:', error);
      showAlert(t('security.error'), t('security.failedToLoadProfile'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Refresh data when screen comes into focus (e.g., after phone verification)
  useFocusEffect(
    React.useCallback(() => {
      fetchUserProfile();
      
    }, [])
  );

  const onRefresh = () => {
    fetchUserProfile(true);
  };

  // Get verification statuses
  const isEkycVerified = user?.is_ekyc === 1;
  const isEmailVerified = user?.is_active_mail === 1;
  const isPhoneVerified = user?.is_active_phone === 1;

  // Calculate verification progress
  const verificationCount = [isEkycVerified, isEmailVerified, isPhoneVerified].filter(Boolean).length;
  const verificationProgress = (verificationCount / 3) * 100;

  // Start eKYC full flow via native SDK
  const handleStartEkyc = async () => {
    try {
      setEkycLoadingMessage(t('security.performingEkyc'));
      
      const lang = currentLanguage === 'vi' ? 'vi' : 'en';
      const fullResult = await EkycService.startEkycFullWithLanguage(lang);
      console.log('eKYC Full Result:', fullResult);
      setIsEkycLoading(true);

      const logs: any = fullResult;
      const ocr = logs?.LOG_OCR ? JSON.parse(logs.LOG_OCR) : null;
      const lcf = logs?.LOG_LIVENESS_CARD_FRONT ? JSON.parse(logs.LOG_LIVENESS_CARD_FRONT) : null;
      const lcr = logs?.LOG_LIVENESS_CARD_REAR ? JSON.parse(logs.LOG_LIVENESS_CARD_REAR) : null;
      const lf  = logs?.LOG_LIVENESS_FACE ? JSON.parse(logs.LOG_LIVENESS_FACE) : null;
      const mask= logs?.LOG_MASK_FACE ? JSON.parse(logs.LOG_MASK_FACE) : null;
      const cmp = logs?.LOG_COMPARE ? JSON.parse(logs.LOG_COMPARE) : null;

      // Validate step by step with Alerts
      if (!lcf || lcf?.object?.liveness !== 'success') {
        setIsEkycLoading(false);
        showAlert(t('security.cardFrontInvalid'), t('security.cardFrontInvalidMessage'));
        return;
      }
      if (!lcr || lcr?.object?.liveness !== 'success') {
        setIsEkycLoading(false);
        showAlert(t('security.cardRearInvalid'), t('security.cardRearInvalidMessage'));
        return;
      }
      if (!lf || lf?.object?.liveness !== 'success') {
        setIsEkycLoading(false);
        showAlert(t('security.faceInvalid'), t('security.faceInvalidMessage'));
        return;
      }
      if (!mask || mask?.object?.masked !== 'no') {
        setIsEkycLoading(false);
        showAlert(t('security.maskDetected'), t('security.maskDetectedMessage'));
        return;
      }
      if (!ocr || ocr?.statusCode !== 200) {
        setIsEkycLoading(false);
        showAlert(t('security.ocrFailed'), t('security.ocrFailedMessage'));
        return;
      }
      if (cmp) {
        const prob = Number(cmp?.object?.prob || 0);
        if (!(cmp?.object?.msg === 'MATCH' && prob >= 95)) {
          setIsEkycLoading(false);
          showAlert(t('security.faceMatchFailed'), t('security.faceMatchFailedMessage'));
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
        const response = await api.post('/client/verify-ekyc', {
          hash_front : hash_front,
          hash_back : hash_back,
          hash_face_near : hash_face_near,
          hash_face_far : hash_face_far,
          email,
        });
        if (response.data.status) {
          setIsEkycLoading(false);
          showAlert('eKYC', t('security.ekycSuccess'));
          fetchUserProfile();
        } else {
          showAlert('eKYC', response.data.message || t('security.ekycFailed'));
          setIsEkycLoading(false);
        }
      } catch (error: any) {
        if (error.response?.data?.errors) {
          Object.keys(error.response.data.errors).forEach(field => {
            showAlert('eKYC', error.response.data.errors[field][0] || t('security.ekycFailed'));
          });
        }
      } finally {
        setIsEkycLoading(false);
      }
      
    } catch (error: any) {
      console.log('eKYC Full Error:', error.response);
    }
  };


  // Verification items (hub) with dynamic status
  const VERIFICATION_ITEMS = [
    {
      id: 'ekyc',
      title: t('security.identityVerification'),
      description: isEkycVerified ? t('security.identityVerified') : t('security.verifyIdentity'),
      icon: 'shield-check',
      iconColor: isEkycVerified ? '#34C759' : '#7B68EE',
      iconBg: isEkycVerified ? '#34C75915' : '#7B68EE15',
      status: isEkycVerified ? 'verified' : 'pending',
      // onPress: () => navigation.navigate('EkycIntro' as never),
      onPress: isEkycVerified ? () => {} : () => handleStartEkyc(),

    },
    {
      id: 'email',
      title: t('security.emailVerification'),
      description: isEmailVerified ? t('security.emailVerified') : t('security.confirmEmail'),
      icon: 'email',
      iconColor: isEmailVerified ? '#34C759' : '#4A90E2',
      iconBg: isEmailVerified ? '#34C75915' : '#4A90E215',
      status: isEmailVerified ? 'verified' : 'pending',
      onPress: () => navigation.navigate('EmailVerification' as never),
    },
    {
      id: 'phone',
      title: t('security.phoneVerification'),
      description: isPhoneVerified ? t('security.phoneVerified') : t('security.secureAccount'),
      icon: 'phone',
      iconColor: isPhoneVerified ? '#34C759' : '#34C759',
      iconBg: isPhoneVerified ? '#34C75915' : '#34C75915',
      status: isPhoneVerified ? 'verified' : 'pending',
      onPress: () => navigation.navigate('PhoneVerification' as never),
    },
  ];

  const SECURITY_ITEMS = [
    {
      id: 'password',
      title: t('security.changePassword'),
      icon: 'lock',
      onPress: () => { },
    },
    // {
    //   id: 'pin',
    //   title: 'PIN Code',
    //   icon: 'numeric',
    //   onPress: () => {},
    // },
    // {
    //   id: '2fa',
    //   title: 'Two-Factor Authentication',
    //   icon: 'shield-check',
    //   onPress: () => {},
    // },
  ];

  if (loading) {
    return (
      <View style={commonStyles.screenContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Icon name="arrow-left" size={24} color="#1C1C1E" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('security.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>{t('security.loadingSettings')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={commonStyles.screenContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('security.title')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Verification Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Icon name="shield-check" size={20} color="#34C759" />
            <Text style={styles.statusTitle}>{t('security.securityStatus')}</Text>
          </View>
          <Text style={styles.statusText}>
            {t('security.verificationsCompleted', { count: verificationCount })}
          </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${verificationProgress}%` }
                ]}
              />
            </View>
            <Text style={styles.progressText}>{Math.round(verificationProgress)}%</Text>
          </View>
        </View>

        {/* Verification Hub */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('security.verifications')}</Text>
          <View style={styles.optionsList}>
            {VERIFICATION_ITEMS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.optionItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: item.iconBg }]}>
                  <Icon name={item.icon as any} size={24} color={item.iconColor} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  <Text style={styles.optionDescription}>{item.description}</Text>
                </View>
                <View style={styles.optionRight}>
                  {item.status === 'verified' && (
                    <View style={styles.verifiedTag}>
                      <Icon name="check" size={16} color="#34C759" />
                      <Text style={styles.verifiedText}>{t('security.verified')}</Text>
                    </View>
                  )}
                  <Icon name="chevron-right" size={24} color="#8E8E93" />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Security Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('security.securityOptions')}</Text>
          <View style={styles.optionsList}>
            {SECURITY_ITEMS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.optionItem}
                onPress={item.onPress}
              >
                <View style={styles.optionIcon}>
                  <Icon name={item.icon} size={24} color="#4A90E2" />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#8E8E93" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Settings */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Settings</Text>
          <View style={styles.optionsList}>
            <View style={styles.optionItem}>
              <View style={styles.optionIcon}>
                <Icon name="fingerprint" size={24} color="#4A90E2" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Biometric Login</Text>
                <Text style={styles.optionDescription}>Face ID, Touch ID</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: '#D1D1D6', true: '#4A90E2' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.optionItem}>
              <View style={styles.optionIcon}>
                <Icon name="bell" size={24} color="#4A90E2" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Security Notifications</Text>
                <Text style={styles.optionDescription}>Login, Transactions</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#D1D1D6', true: '#4A90E2' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View> */}

        {/* Device Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('security.deviceInformation')}</Text>
          <View style={styles.optionsList}>
            <View style={styles.optionItem}>
              <View style={styles.optionIcon}>
                <Icon name="cellphone" size={24} color="#4A90E2" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>{t('security.currentDevice')}</Text>
                <Text style={styles.optionDescription}>
                  {Platform.OS === 'ios' ? 'iPhone' : 'Android'} • {Platform.OS === 'ios' ? 'iOS' : 'Android'} {Platform.Version}
                </Text>
              </View>
              <View style={styles.activeTag}>
                <Text style={styles.activeText}>{t('security.active')}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <LoadingOverlay 
        visible={isEkycLoading} 
        message={ekycLoadingMessage} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#8E8E93',
  },
  statusCard: {
    backgroundColor: '#34C75910',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statusText: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 12,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  progressBar: {
    flex: 1,
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
    minWidth: 30,
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
  optionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E215',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
  activeTag: {
    backgroundColor: '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
});

export default SecurityScreen;