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
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackScreen } from '../navigation/types';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import api from '../utils/Api';
import SelectCustom from '../component/SelectCustom';
import { getUser } from '../utils/TokenManager';

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

interface BankAccountData {
  id: number;
  id_bank: number;
  name_ekyc: string;
  bank_number: string;
  is_default: number;
  created_at: string;
  updated_at: string;
}

const EditBankAccountScreen: StackScreen<'EditBankAccount'> = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { account } = route.params as { account: BankAccountData };

  const [banks, setBanks] = useState<BankData[]>([]);
  const [selectedBankId, setSelectedBankId] = useState<string>(account.id_bank.toString());
  const [accountNumber, setAccountNumber] = useState(account.bank_number);
  const [accountName, setAccountName] = useState(account.name_ekyc);
  const [isDefault, setIsDefault] = useState(account.is_default === 1);
  const [loading, setLoading] = useState(false);
  const [loadingBanks, setLoadingBanks] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Fetch banks data from API
  const fetchBanks = async () => {
    try {
      setLoadingBanks(true);
      const response = await api.get('/client/bank/data-all');
      console.log('Banks response:', response.data);

      if (response.data.status) {
        setBanks(response.data.data);
      } else {
        Alert.alert('Error', 'Failed to load banks');
      }
    } catch (error: any) {
      console.log('Fetch banks error:', error);
      Alert.alert('Error', 'Failed to load banks. Please try again.');
    } finally {
      setLoadingBanks(false);
    }
  };

  useEffect(() => {
    fetchBanks();
  }, []);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!selectedBankId) {
      newErrors.bank = 'Please select a bank';
    }
    
    if (!accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (!/^\d{8,20}$/.test(accountNumber.trim())) {
      newErrors.accountNumber = 'Invalid account number format';
    }
    
    if (!accountName.trim()) {
      newErrors.accountName = 'Account holder name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleUpdate = async () => {
    // Clear previous errors
    setErrors({});
    
    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const user = await getUser();
      if (!user?.email) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      const response = await api.post('/client/bank/update', {
        id: account.id,
        id_bank: parseInt(selectedBankId),
        name_ekyc: accountName.trim(),
        bank_number: accountNumber.trim(),
        is_default: isDefault ? 1 : 0,
        email: user?.email,
      });

      console.log('Update bank account response:', response.data);
      
      if (response.data.status) {
        Alert.alert(
          'Success', 
          response.data.message || 'Cập nhật tài khoản ngân hàng thành công!',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to update bank account');
      }
      
    } catch (error: any) {
      console.log('Update bank account error:', error.response);
      
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
        Alert.alert('Validation Error', firstError);
      } else {
        // Handle other errors
        let errorMessage = 'Failed to update bank account. Please try again.';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Bank Account',
      'Are you sure you want to delete this bank account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteBankAccount();
          },
        },
      ]
    );
  };

  const deleteBankAccount = async () => {
    if (!account?.id) {
      Alert.alert('Error', 'Invalid bank account data');
      return;
    }

    setLoading(true);
    try {
      const user = await getUser();
      if (!user?.email) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      const response = await api.post('/client/bank/delete', {
        id: account.id,
        email: user?.email,
      });

      console.log('Delete bank account response:', response.data);

      if (response?.data?.status) {
        Alert.alert('Success', 'Bank account deleted successfully', [
          {
            text: 'OK',
            onPress: () => {
              navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Error', response?.data?.message || 'Failed to delete bank account');
      }
    } catch (error: any) {
      console.log('Delete bank account error:', error.response);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to delete bank account. Please try again.'
      );
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
        <Text style={styles.headerTitle}>Edit Bank Account</Text>
        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]}
          onPress={handleUpdate}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#4A90E2" />
          ) : (
            <Text style={styles.saveText}>Update</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Bank Selection */}
        <SelectCustom
          label="Bank"
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
          placeholder="Select bank"
          error={errors.bank}
          required
          searchable={true}
          searchPlaceholder="Search by name, code..."
          containerStyle={styles.selectContainer}
        />

        {/* Account Number */}
        <Text style={styles.label}>Account Number</Text>
        <TextInput
          style={[styles.input, errors.accountNumber && styles.inputError]}
          value={accountNumber}
          onChangeText={(text) => {
            setAccountNumber(text);
            if (errors.accountNumber) {
              setErrors(prev => ({ ...prev, accountNumber: '' }));
            }
          }}
          placeholder="Enter account number"
          keyboardType="numeric"
          placeholderTextColor="#999"
        />
        {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber}</Text>}

        {/* Account Name */}
        <Text style={styles.label}>Account Holder Name</Text>
        <TextInput
          style={[styles.input, errors.accountName && styles.inputError]}
          value={accountName}
          onChangeText={(text) => {
            setAccountName(text);
            if (errors.accountName) {
              setErrors(prev => ({ ...prev, accountName: '' }));
            }
          }}
          placeholder="Enter account holder name"
          autoCapitalize="characters"
          placeholderTextColor="#999"
        />
        {errors.accountName && <Text style={styles.errorText}>{errors.accountName}</Text>}

        {/* Default Account Toggle */}
        <View style={styles.defaultContainer}>
          <View>
            <Text style={styles.defaultTitle}>Set as default account</Text>
            <Text style={styles.defaultDescription}>
              This account will be selected by default when withdrawing
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
          style={[styles.deleteButton, loading && styles.deleteButtonDisabled]}
          onPress={handleDelete}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FF3B30" />
          ) : (
            <Icon name="trash-can-outline" size={20} color="#FF3B30" />
          )}
          <Text style={styles.deleteText}>Delete this bank account</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Icon name="information" size={20} color="#666" />
          <Text style={styles.infoText}>
            Please check account information carefully before updating to ensure accurate transaction processing
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
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    marginTop: 24,
  },
  deleteButtonDisabled: {
    opacity: 0.5,
  },
  deleteText: {
    fontSize: wp('4%'),
    color: '#FF3B30',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default EditBankAccountScreen;