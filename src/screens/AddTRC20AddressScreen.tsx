import { useAlert } from "../component/AlertCustom";
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import api from '../utils/Api';
import { useTranslation } from '../hooks/useTranslation';
import VerifyOTPBottomSheet from '../component/VerifyOTPBottomSheet';

const AddTRC20AddressScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showOtp, setShowOtp] = useState(false);
  const [identifier, setIdentifier] = useState<string>('');
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');
  const { showAlert } = useAlert();
  // Prefill identifier from profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/client/profile');
        if (response.data?.status) {
          const data = response.data.data || {};
          if (data.email) {
            setIdentifier(data.email);
            setIdentifierType('email');
          } else if (data.phone) {
            setIdentifier(String(data.phone));
            setIdentifierType('phone');
          }
        }
      } catch (e) {
        // silent
      }
    };
    fetchProfile();
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) {
      newErrors.name = t('trc20Addresses.validation.nameRequired');
    }
    
    if (!address.trim()) {
      newErrors.address = t('trc20Addresses.validation.addressRequired');
    } 
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const performSave = async () => {
    setLoading(true);
    try {
      const response = await api.post('/client/wallet/create', {
        name: name.trim(),
        address_wallet: address.trim(),
        is_default: isDefault ? 1 : 0,
      });

      console.log('Create wallet response:', response.data);

      if (response.data.status) {
        showAlert(
          t('common.success'),
          response.data.message || t('trc20Addresses.createSuccess'),
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack(),
            },
          ]
        );
      } else {
        showAlert(t('common.error'), response.data.message || t('trc20Addresses.createFailed'));
      }
    } catch (error: any) {
      console.log('Create wallet error:', error);
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors || {};
        const formattedErrors: { [key: string]: string } = {};
        Object.keys(validationErrors).forEach((key) => {
          if (Array.isArray(validationErrors[key])) {
            formattedErrors[key] = validationErrors[key][0];
          } else {
            formattedErrors[key] = validationErrors[key];
          }
        });
        setErrors(formattedErrors);
        const firstError = Object.values(formattedErrors)[0];
        showAlert(t('trc20Addresses.validation.validationError'), String(firstError));
      } else {
        let errorMessage = t('trc20Addresses.createFailed');
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        showAlert(t('common.error'), errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setErrors({});
    if (!validateForm()) return;
    setShowOtp(true);
  };

  const handlePaste = () => {
    // Implement paste from clipboard
  };

  const handleScan = () => {
    // Navigate to QR scanner
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('trc20Addresses.title')}</Text>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#4A90E2" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Wallet Name */}
        <Text style={styles.label}>{t('trc20Addresses.walletName')}</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) {
              setErrors(prev => ({ ...prev, name: '' }));
            }
          }}
          placeholder={t('trc20Addresses.enterWalletName')}
          placeholderTextColor="#999"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        {/* TRC20 Address */}
        <Text style={styles.label}>{t('trc20Addresses.walletAddress')}</Text>
        <View style={[styles.addressInputContainer, errors.address && styles.inputError]}>
          <TextInput
            style={styles.addressInput}
            value={address}
            onChangeText={(text) => {
              setAddress(text);
              if (errors.address) {
                setErrors(prev => ({ ...prev, address: '' }));
              }
            }}
            placeholder={t('trc20Addresses.enterWalletAddress')}
            placeholderTextColor="#999"
            autoCapitalize="none"
          />
          <View style={styles.addressActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handlePaste}
            >
              <Icon name="content-paste" size={20} color="#4A90E2" />
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleScan}
            >
              <Icon name="qrcode-scan" size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>
        </View>
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

        {/* Default Address Toggle */}
        <View style={styles.defaultContainer}>
          <View>
            <Text style={styles.defaultTitle}>{t('trc20Addresses.setAsDefaultAddress')}</Text>
            <Text style={styles.defaultDescription}>
              {t('trc20Addresses.defaultAddressDescription')}
            </Text>
          </View>
          <Switch
            value={isDefault}
            onValueChange={setIsDefault}
            trackColor={{ false: '#E5E5EA', true: '#4A90E2' }}
            thumbColor="#FFFFFF"
          />
        </View>

        <View style={styles.infoBox}>
          <Icon name="information" size={20} color="#666" />
          <Text style={styles.infoText}>
            {t('trc20Addresses.saveWarning')}
          </Text>
        </View>
       
      </ScrollView>
      <VerifyOTPBottomSheet
        visible={showOtp}
        onClose={() => setShowOtp(false)}
        identifier={identifier}
        typeEnpoints="wallet"
        type="email"
        mode="action"
        onVerified={() => {
          setShowOtp(false);
          performSave();
        }}
      />
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#000',
  },
  saveButton: {
    padding: 8,
  },
  saveText: {
    fontSize: wp('4%'),
    color: '#4A90E2',
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  label: {
    fontSize: wp('3.5%'),
    color: '#000',
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    fontSize: wp('4%'),
    color: '#000',
  },
  addressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  addressInput: {
    flex: 1,
    padding: 12,
    fontSize: wp('4%'),
    color: '#000',
  },
  addressActions: {
    flexDirection: 'row',
    paddingRight: 8,
  },
  actionButton: {
    padding: 8,
    marginLeft: 8,
  },
  defaultContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
  },
  defaultTitle: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  defaultDescription: {
    fontSize: wp('3.5%'),
    color: '#666',
    maxWidth: wp('60%'),
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  infoText: {
    flex: 1,
    fontSize: wp('3.5%'),
    color: '#666',
    marginLeft: 8,
  },
  supportedBox: {
    backgroundColor: '#F8F8F8',
    padding: 16,
    borderRadius: 12,
    marginTop: 24,
  },
  supportedTitle: {
    fontSize: wp('3.5%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  supportedText: {
    fontSize: wp('3.5%'),
    color: '#666',
    lineHeight: 24,
  },
  inputError: {
    borderColor: '#FF6B6B',
    borderWidth: 1,
  },
  errorText: {
    fontSize: wp('3%'),
    color: '#FF6B6B',
    marginTop: 4,
    marginLeft: 4,
  },
});

export default AddTRC20AddressScreen;
