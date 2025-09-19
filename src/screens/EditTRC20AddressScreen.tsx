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
  Clipboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import api from '../utils/Api';
import { getUser } from '../utils/TokenManager';

type TRC20Address = {
  id: string;
  name: string;
  address: string;
  isDefault?: boolean;
};

const EditTRC20AddressScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const addressData = (route.params as any)?.address as TRC20Address;

  const [name, setName] = useState(addressData?.name || '');
  const [isDefault, setIsDefault] = useState(addressData?.isDefault || false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter wallet name');
      return;
    }

    if (!addressData?.id) {
      Alert.alert('Error', 'Invalid wallet data');
      return;
    }

    setIsLoading(true);
    try {
      const user = await getUser();
      if (!user?.email) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      const response = await api.post('/client/wallet/update', {
        id: parseInt(addressData.id),
        name: name.trim(),
        address_wallet: addressData.address,
        is_default: isDefault ? 1 : 0,
        email: user?.email,
      });

      if (response?.data?.status) {
        Alert.alert('Success', 'Wallet updated successfully', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back and refresh the list
              (navigation as any).navigate('TRC20Addresses');
            },
          },
        ]);
      } else {
        Alert.alert('Error', response?.data?.message || 'Failed to update wallet');
      }
    } catch (error: any) {
      console.log('Update wallet error:', error.response);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to update wallet. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Address',
      'Are you sure you want to delete this TRC20 address? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteWallet();
          },
        },
      ]
    );
  };

  const deleteWallet = async () => {
    if (!addressData?.id) {
      Alert.alert('Error', 'Invalid wallet data');
      return;
    }

    setIsLoading(true);
    try {
      const user = await getUser();
      if (!user?.email) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }
      console.log('user', user?.email);
      console.log('addressData', addressData.id);
      const response = await api.post('/client/wallet/delete', {
          id: parseInt(addressData.id),
          email: user?.email,
      });

      if (response?.data?.status) {
        Alert.alert('Success', 'Wallet deleted successfully', [
          {
            text: 'OK',
            onPress: () => {
             navigation.goBack();
            },
          },
        ]);
      } else {
        Alert.alert('Error', response?.data?.message || 'Failed to delete wallet');
      }
    } catch (error: any) {
      console.log('Delete wallet error:', error.response);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'Failed to delete wallet. Please try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (addressData?.address) {
      Clipboard.setString(addressData.address);
      Alert.alert('Copied', 'Wallet address copied to clipboard');
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
        <Text style={styles.headerTitle}>Edit Address</Text>
        <TouchableOpacity 
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={isLoading}
        >
          {isLoading ? (
            <Icon name="loading" size={16} color="#4A90E2" />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Wallet Name */}
        <Text style={styles.label}>Wallet Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Enter wallet name"
          placeholderTextColor="#999"
        />

        {/* TRC20 Address (Non-editable) */}
        <Text style={styles.label}>TRC20 Address</Text>
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
          <Text style={styles.deleteText}>Delete this address</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Icon name="information" size={20} color="#666" />
          <Text style={styles.infoText}>
            To change TRC20 address, please delete and add a new address
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
    opacity: 0.5,
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
