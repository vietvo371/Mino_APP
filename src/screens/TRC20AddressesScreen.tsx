import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

type TRC20Address = {
  id: string;
  name: string;
  address: string;
  isDefault?: boolean;
};

const TRC20_ADDRESSES: TRC20Address[] = [
  {
    id: '1',
    name: 'Ví chính',
    address: 'TRC20abc...xyz',
    isDefault: true,
  },
  {
    id: '2',
    name: 'Ví phụ',
    address: 'TRC20def...uvw',
  },
];

const TRC20AddressesScreen = () => {
  const navigation = useNavigation();

  const handleAddAddress = () => {
    navigation.navigate('AddTRC20Address');
  };

  const handleEditAddress = (address: TRC20Address) => {
    navigation.navigate('EditTRC20Address', { address });
  };

  const handleCopyAddress = (address: string) => {
    // Copy address to clipboard
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
        <Text style={styles.headerTitle}>Địa chỉ TRC20</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddAddress}
        >
          <Icon name="plus" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Danh sách địa chỉ</Text>
        
        {TRC20_ADDRESSES.map((item) => (
          <View key={item.id} style={styles.addressCard}>
            <View style={styles.addressHeader}>
              <Text style={styles.addressName}>{item.name}</Text>
              {item.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Mặc định</Text>
                </View>
              )}
            </View>

            <View style={styles.addressInfo}>
              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>Địa chỉ ví</Text>
                <Text style={styles.address}>{item.address}</Text>
              </View>
              <TouchableOpacity 
                style={styles.copyButton}
                onPress={() => handleCopyAddress(item.address)}
              >
                <Icon name="content-copy" size={20} color="#4A90E2" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditAddress(item)}
            >
              <Icon name="pencil" size={16} color="#666" />
              <Text style={styles.editText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.infoBox}>
          <Icon name="information" size={20} color="#666" />
          <Text style={styles.infoText}>
            Chỉ chấp nhận địa chỉ ví TRC20 từ các sàn giao dịch hoặc ví điện tử được hỗ trợ
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
});

export default TRC20AddressesScreen;
