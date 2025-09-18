import React, { useState } from 'react';
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

const AddTRC20AddressScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!name.trim()) {
      newErrors.name = 'Wallet name is required';
    }
    
    if (!address.trim()) {
      newErrors.address = 'TRC20 address is required';
    } else if (!address.startsWith('T') || address.length !== 34) {
      newErrors.address = 'Invalid TRC20 address format';
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
      const response = await api.post('/client/wallet/create', {
        name: name.trim(),
        address_wallet: address.trim(),
        is_default: isDefault ? 1 : 0
      });

      console.log('Create wallet response:', response.data);
      
      if (response.data.status) {
        Alert.alert(
          'Success', 
          response.data.message || 'Tạo ví thành công.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        Alert.alert('Error', response.data.message || 'Failed to create wallet');
      }
      
    } catch (error: any) {
      console.log('Create wallet error:', error);
      
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
        let errorMessage = 'Failed to create wallet. Please try again.';
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
        <Text style={styles.headerTitle}>Add TRC20 Address</Text>
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
        <Text style={styles.label}>Wallet Name</Text>
        <TextInput
          style={[styles.input, errors.name && styles.inputError]}
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (errors.name) {
              setErrors(prev => ({ ...prev, name: '' }));
            }
          }}
          placeholder="Enter wallet name (e.g. Main Wallet)"
          placeholderTextColor="#999"
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        {/* TRC20 Address */}
        <Text style={styles.label}>TRC20 Address</Text>
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
            placeholder="Enter or paste TRC20 address"
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
            <Text style={styles.defaultTitle}>Set as default address</Text>
            <Text style={styles.defaultDescription}>
              This address will be selected by default when receiving USDT
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
            Please check TRC20 wallet address carefully before saving. Invalid addresses may result in loss of funds that cannot be recovered.
          </Text>
        </View>

        <View style={styles.supportedBox}>
          <Text style={styles.supportedTitle}>Supported exchanges:</Text>
          <Text style={styles.supportedText}>
            • Binance{'\n'}
            • Huobi{'\n'}
            • OKX{'\n'}
            • MEXC{'\n'}
            • Gate.io
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
