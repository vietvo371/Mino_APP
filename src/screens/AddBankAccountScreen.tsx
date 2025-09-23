import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  TextInput,
  Switch,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import api from '../utils/Api';
import SelectCustom from '../component/SelectCustom';
import { useTranslation } from '../hooks/useTranslation';

interface BankData {
  id: number;
  name: string;
  code: string;
  bin: string;
  logo: string;
  is_open: number;
  created_at: string | null;
  updated_at: string | null;
}

const AddBankAccountScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [banks, setBanks] = useState<BankData[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Convert to uppercase without diacritics
  const toUpperNoDiacritics = (value: string) => {
    if (!value) return '';
    const stripped = value
      .normalize('NFD')
      .replace(/\p{Diacritic}+/gu, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D');
    return stripped.toUpperCase();
  };

  // Fetch banks data from API
  const fetchBanks = async () => {
    try {
      setLoadingBanks(true);
      const response = await api.get('/client/bank/data-all');
      console.log('Banks response:', response.data);

      if (response.data.status) {
        setBanks(response.data.data);
      } else {
        Alert.alert('', t('editBankAccount.alerts.loadBanksFailed'));
      }
    } catch (error: any) {
      console.log('Fetch banks error:', error);
      Alert.alert(t('common.error'), t('editBankAccount.alerts.loadBanksFailed'));
    } finally {
      setLoadingBanks(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  // Prefill account holder name from profile and disable editing
  useEffect(() => {
    const fetchProfileName = async () => {
      try {
        const response = await api.get('/client/profile');
        if (response.data?.status && response.data?.data?.full_name) {
          setAccountName(toUpperNoDiacritics(response.data.data.full_name));
        }
      } catch (e) {
        // silent fail
      }
    };
    fetchProfileName();
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!selectedBankId) {
      newErrors.bank = t('editBankAccount.validationErrors.selectBank');
    }
    
    if (!accountNumber.trim()) {
      newErrors.accountNumber = t('editBankAccount.validationErrors.accountNumberRequired');
    } 
    if (!accountName.trim()) {
      newErrors.accountName = t('editBankAccount.validationErrors.accountNameRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/client/bank/create', {
        id_bank: parseInt(selectedBankId),
        name_ekyc: accountName.trim(),
        bank_number: accountNumber.trim(),
        is_default: isDefault ? 1 : 0
      });

      console.log('Create bank account response:', response.data);
      
      if (response.data.status) {
        Alert.alert(
          t('common.success'), 
          response.data.message || t('bankAccounts.createSuccess'),
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('', response.data.message || t('bankAccounts.createFailed'));
      }
      
    } catch (error: any) {
      console.log('Create bank account error:', error);
      
      // Handle Laravel 422 validation errors
      if (error.response?.status === 422) {
        const validationErrors = error.response.data.errors || {};
        const formattedErrors: {[key: string]: string} = {};
        
        // Format Laravel validation errors
        Object.keys(validationErrors).forEach(key => {
          if (Array.isArray(validationErrors[key])) {
            formattedErrors[key] = validationErrors[key][0];
          } else {
            formattedErrors[key] = validationErrors[key];
          }
        });
        
        setErrors(formattedErrors);
        
        // Show first error in alert
        const firstError = Object.values(formattedErrors)[0];
        Alert.alert(t('editBankAccount.alerts.validationError'), String(firstError));
      } else {
        // Handle other errors
        let errorMessage = t('bankAccounts.createFailed');
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        Alert.alert(t('common.error'), errorMessage);
      }
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>{t('bankAccounts.title')}</Text>
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
        {/* Bank Selection */}
        <SelectCustom
          label={t('bankAccounts.bank')}
          value={selectedBankId}
          onChange={(value) => {
            setSelectedBankId(value);
            if (errors.bank) {
              setErrors(prev => ({ ...prev, bank: '' }));
            }
          }}
          options={banks.map(bank => ({
            label: bank.name,
            value: bank.id.toString(),
            subtitle: `${bank.code}`,
            iconUrl: bank.logo,
            searchText: `${bank.name} ${bank.code} ${bank.bin}`,
          }))}
          placeholder={t('editBankAccount.selectBank')}
          error={errors.bank}
          required
          searchable={true}
          searchPlaceholder={t('editBankAccount.searchBank')}
          containerStyle={styles.selectContainer}
        />

        {/* Account Number */}
        <Text style={styles.label}>{t('bankAccounts.accountNumber')}</Text>
        <TextInput
          style={[styles.input, errors.accountNumber && styles.inputError]}
          value={accountNumber}
          onChangeText={(text) => {
            setAccountNumber(text);
            if (errors.accountNumber) {
              setErrors(prev => ({ ...prev, accountNumber: '' }));
            }
          }}
          placeholder={t('editBankAccount.enterAccountNumber')}
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
        {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber}</Text>}

        {/* Account Name */}
        <Text style={styles.label}>{t('bankAccounts.accountHolder')}</Text>
        <TextInput
          style={[styles.input, errors.accountName && styles.inputError]}
          value={accountName}
          onChangeText={(text) => {
            setAccountName(toUpperNoDiacritics(text));
            if (errors.accountName) {
              setErrors(prev => ({ ...prev, accountName: '' }));
            }
          }}
          placeholder={t('editBankAccount.enterAccountHolderName')}
          autoCapitalize="characters"
          placeholderTextColor="#999"
          editable={false}
          selectTextOnFocus={false}
        />
        {errors.accountName && <Text style={styles.errorText}>{errors.accountName}</Text>}

        {/* Default Account Toggle */}
        <View style={styles.defaultContainer}>
          <View>
            <Text style={styles.defaultTitle}>{t('bankAccounts.setDefault')}</Text>
            <Text style={styles.defaultDescription}>
              {t('bankAccounts.defaultDescription')}
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
            {t('bankAccounts.info')}
          </Text>
        </View>
      </ScrollView>
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
  selectContainer: {
    marginBottom: 0,
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

export default AddBankAccountScreen;
