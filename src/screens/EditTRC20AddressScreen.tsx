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
  Clipboard,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import api from '../utils/Api';
import VerifyOTPBottomSheet from '../component/VerifyOTPBottomSheet';
import { getUser } from '../utils/TokenManager';
import useTranslation from '../hooks/useTranslation';

type TRC20Address = {
  id: string;
  name: string;
  address: string;
  isDefault?: boolean;
};

const EditTRC20AddressScreen = () => {
  const navigation = useNavigation();
  const { showAlert } = useAlert();
  const route = useRoute();
  const addressData = (route.params as any)?.address as TRC20Address;
  const { t } = useTranslation();

  const [name, setName] = useState(addressData?.name || '');
  const [isDefault, setIsDefault] = useState(addressData?.isDefault || false);
  const [isLoading, setIsLoading] = useState(false);
  const [showOtp, setShowOtp] = useState(false);
  const [pendingAction, setPendingAction] = useState<'update' | 'delete' | null>(null);
  const [identifier, setIdentifier] = useState<string>('');
  const [identifierType, setIdentifierType] = useState<'email' | 'phone'>('email');

  // Prefill identifier from stored user profile via API
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

  const performUpdate = async () => {
    if (!name.trim()) {
      showAlert(t('common.error'), t('editTrc20Address.alerts.enterWalletName'));
      return;
    }

    if (!addressData?.id) {
      showAlert(t('common.error'), t('editTrc20Address.alerts.invalidWalletData'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/client/wallet/update', {
        id: parseInt(addressData.id),
        name: name.trim(),
        address_wallet: addressData.address,
        is_default: isDefault ? 1 : 0,
        email: identifier,
      });

      if (response?.data?.status) {
        showAlert(t('common.success'), t('editTrc20Address.alerts.updateSuccess'), [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back and refresh the list
              (navigation as any).navigate('TRC20Addresses');
            },
          },
        ]);
      } else {
        showAlert(t('common.error'), response?.data?.message || t('editTrc20Address.alerts.updateFailed'));
      }
    } catch (error: any) {
      console.log('Update wallet error:', error.response);
      showAlert(
        t('common.error'),
        error?.response?.data?.message || t('editTrc20Address.alerts.updateFailed')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (!name.trim()) {
      showAlert(t('common.error'), t('editTrc20Address.alerts.enterWalletName'));
      return;
    }
    if (!addressData?.id) {
      showAlert(t('common.error'), t('editTrc20Address.alerts.invalidWalletData'));
      return;
    }
    setPendingAction('update');
    setShowOtp(true);
  };

  const handleDelete = () => {
    showAlert(
      t('editTrc20Address.alerts.deleteConfirmTitle'),
      t('editTrc20Address.alerts.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            setPendingAction('delete');
            setShowOtp(true);
          },
        },
      ]
    );
  };

  const deleteWallet = async () => {
    if (!addressData?.id) {
      showAlert(t('common.error'), t('editTrc20Address.alerts.invalidWalletData'));
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/client/wallet/delete', {
          id: parseInt(addressData.id),
          email: identifier,
      });

      if (response?.data?.status) {
        showAlert(t('common.success'), t('editTrc20Address.alerts.deleteSuccess'), [
          {
            text: 'OK',
            onPress: () => {
             navigation.goBack();
            },
          },
        ]);
      } else {
        showAlert(t('common.error'), response?.data?.message || t('editTrc20Address.alerts.deleteFailed'));
      }
    } catch (error: any) {
      console.log('Delete wallet error:', error.response);
      showAlert(
        t('common.error'),
        error?.response?.data?.message || t('editTrc20Address.alerts.deleteFailed')
      );
    } finally {
      setIsLoading(false);
    }
  };

  const onOtpVerified = async () => {
    setShowOtp(false);
    if (pendingAction === 'update') {
      await performUpdate();
    } else if (pendingAction === 'delete') {
      await deleteWallet();
    }
    setPendingAction(null);
  };

  const handleCopy = () => {
    if (addressData?.address) {
      Clipboard.setString(addressData.address);
      showAlert(t('editTrc20Address.alerts.copiedTitle'), t('editTrc20Address.alerts.copiedAddress'));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('editTrc20Address.title')}</Text>
          <TouchableOpacity 
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isLoading}
          >
            {isLoading ? (
              <Icon name="loading" size={16} color="#4A90E2" />
            ) : (
              <Text style={styles.saveText}>{t('common.save')}</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Wallet Name */}
          <Text style={styles.label}>{t('editTrc20Address.walletNameLabel')}</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t('editTrc20Address.walletNamePlaceholder')}
            placeholderTextColor="#999"
          />

          {/* TRC20 Address (Non-editable) */}
          <Text style={styles.label}>{t('editTrc20Address.polygonAddressLabel')}</Text>
          <View style={styles.addressContainer}>
            <Text style={styles.addressText}>{addressData?.address}</Text>
            <TouchableOpacity 
              style={styles.copyButton}
              onPress={handleCopy}
            >
              <Icon name="content-copy" size={20} color="#4A90E2" />
            </TouchableOpacity>
          </View>

          {/* Default Address Toggle */}
          <View style={styles.defaultContainer}>
            <View>
              <Text style={styles.defaultTitle}>{t('editTrc20Address.setDefaultTitle')}</Text>
              <Text style={styles.defaultDescription}>
                {t('editTrc20Address.setDefaultDescription')}
              </Text>
            </View>
            <Switch
              value={isDefault}
              onValueChange={setIsDefault}
              trackColor={{ false: '#E5E5EA', true: '#4A90E2' }}
              thumbColor="#FFFFFF"
            />
          </View>

          {/* Delete Button */}
          <TouchableOpacity
            style={[styles.deleteButton, isLoading && styles.deleteButtonDisabled]}
            onPress={handleDelete}
            disabled={isLoading}
          >
            {isLoading ? (
              <Icon name="loading" size={20} color="#FF3B30" />
            ) : (
              <Icon name="trash-can-outline" size={20} color="#FF3B30" />
            )}
            <Text style={styles.deleteText}>{t('editTrc20Address.deleteButton')}</Text>
          </TouchableOpacity>

          <View style={styles.infoBox}>
            <Icon name="information" size={20} color="#666" />
            <Text style={styles.infoText}>{t('editTrc20Address.infoText')}</Text>
          </View>
        </ScrollView>
      </View>
      <VerifyOTPBottomSheet
        visible={showOtp}
        onClose={() => setShowOtp(false)}
        identifier={identifier}
        typeEnpoints="wallet"
        type="email"
        mode="action"
        onVerified={onOtpVerified}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
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
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'android' ? 40 : 24,
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
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  addressText: {
    flex: 1,
    fontSize: wp('4%'),
    color: '#666',
    marginRight: 12,
  },
  copyButton: {
    padding: 8,
    backgroundColor: '#4A90E215',
    borderRadius: 8,
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    marginTop: 24,
  },
  deleteText: {
    fontSize: wp('4%'),
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 8,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
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
});

export default EditTRC20AddressScreen;
