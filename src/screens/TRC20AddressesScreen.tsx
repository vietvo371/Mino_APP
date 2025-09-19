import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import api from '../utils/Api';

interface WalletData {
  id: number;
  client_id: number;
  name: string;
  address_wallet: string;
  is_default: number;
  created_at: string;
  updated_at: string;
}

type TRC20Address = {
  id: number;
  name: string;
  address: string;
  isDefault: boolean;
  createdAt: string;
};

const TRC20AddressesScreen = () => {
  const navigation = useNavigation();
  const [addresses, setAddresses] = useState<TRC20Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  // Fetch wallet data from API
  const fetchWalletData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get('/client/wallet/data');
      console.log('Wallet data response:', response.data);

      if (response.data.status) {
        const walletData: WalletData[] = response.data.data;
        const formattedAddresses: TRC20Address[] = walletData.map(wallet => ({
          id: wallet.id,
          name: wallet.name,
          address: wallet.address_wallet,
          isDefault: wallet.is_default === 1,
          createdAt: wallet.created_at
        }));
        setAddresses(formattedAddresses);
        setNeedsVerification(false);
      } else {
        setNeedsVerification(true);
      }
    } catch (error: any) {
      console.log('Fetch wallet data error:', error);
      let errorMessage = 'Failed to load wallet data. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  // Refresh data when screen comes into focus (e.g., after adding new wallet)
  useFocusEffect(
    React.useCallback(() => {
      fetchWalletData();
    }, [])
  );

  const onRefresh = () => {
    fetchWalletData(true);
  };

  const handleAddAddress = () => {
    navigation.navigate('AddTRC20Address' as never);
  };

  const handleEditAddress = (address: TRC20Address) => {
    navigation.navigate('EditTRC20Address', { address } as never);
  };

  const handleCopyAddress = (address: string) => {
    // Copy address to clipboard
    // You can implement clipboard functionality here
    Alert.alert('Copied', 'Address copied to clipboard');
  };

  const renderVerificationRequired = () => (
    <View style={styles.verificationContainer}>
      <View style={styles.verificationIconContainer}>
        <Icon name="shield-check" size={64} color="#FF9500" />
      </View>
      <Text style={styles.verificationTitle}>Xác thực cần thiết</Text>
      <Text style={styles.verificationDescription}>
        Vui lòng hoàn thành xác thực eKYC, email và số điện thoại trước khi quản lý địa chỉ TRC20.
      </Text>
      <TouchableOpacity 
        style={styles.verificationButton}
        onPress={() => (navigation as any).navigate('Security')}
      >
        <Text style={styles.verificationButtonText}>Đi đến xác thực</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>TRC20 Addresses</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddAddress}
        >
          <Icon name="plus" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      {needsVerification ? (
        renderVerificationRequired()
      ) : (
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>Address List</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>Loading wallet addresses...</Text>
          </View>
        ) : addresses.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Icon name="wallet-outline" size={64} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No wallet addresses</Text>
            <Text style={styles.emptyDescription}>
              Add your first TRC20 wallet address to start receiving USDT
            </Text>
            <TouchableOpacity 
              style={styles.addFirstButton}
              onPress={handleAddAddress}
            >
              <Icon name="plus" size={20} color="#FFFFFF" />
              <Text style={styles.addFirstText}>Add Address</Text>
            </TouchableOpacity>
          </View>
        ) : (
          addresses.map((item) => (
            <View key={item.id} style={styles.addressCard}>
              <View style={styles.addressHeader}>
                <Text style={styles.addressName}>{item.name}</Text>
                {item.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultText}>Default</Text>
                  </View>
                )}
              </View>

              <View style={styles.addressInfo}>
                <View style={styles.addressContainer}>
                  <Text style={styles.addressLabel}>Wallet Address</Text>
                  <Text style={styles.address}>{item.address}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => handleCopyAddress(item.address)}
                >
                  <Icon name="content-copy" size={20} color="#4A90E2" />
                </TouchableOpacity>
              </View>

              <View style={styles.addressFooter}>
                <Text style={styles.createdDate}>
                  Created: {new Date(item.createdAt).toLocaleDateString()}
                </Text>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => handleEditAddress(item)}
                >
                  <Icon name="pencil" size={16} color="#666" />
                  <Text style={styles.editText}>Edit</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}

        <View style={styles.infoBox}>
          <Icon name="information" size={20} color="#666" />
          <Text style={styles.infoText}>
            Only accept TRC20 wallet addresses from supported exchanges or e-wallets
          </Text>
        </View>
      </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  // Verification styles
  verificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  verificationIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF4E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  verificationTitle: {
    fontSize: wp('6%'),
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  verificationDescription: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  verificationButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  verificationButtonText: {
    fontSize: wp('4.5%'),
    color: '#FFFFFF',
    fontWeight: '600',
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
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  addressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  addressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addressName: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#000',
  },
  defaultBadge: {
    backgroundColor: '#4A90E215',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: wp('3%'),
    color: '#4A90E2',
    fontWeight: '500',
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  addressContainer: {
    flex: 1,
    marginRight: 12,
  },
  addressLabel: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: 4,
  },
  address: {
    fontSize: wp('4%'),
    color: '#000',
    fontWeight: '500',
  },
  copyButton: {
    padding: 8,
    backgroundColor: '#4A90E215',
    borderRadius: 8,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  editText: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginLeft: 4,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  infoText: {
    flex: 1,
    fontSize: wp('3.5%'),
    color: '#666',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: wp('4%'),
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstText: {
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontWeight: '600',
    marginLeft: 8,
  },
  addressFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createdDate: {
    fontSize: wp('3%'),
    color: '#999',
  },
});

export default TRC20AddressesScreen;
