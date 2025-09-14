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
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const AddTRC20AddressScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  const handleSave = () => {
    // Validate
    if (!name.trim() || !address.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    // Validate TRC20 address format
    if (!address.startsWith('T') || address.length !== 34) {
      Alert.alert('Lỗi', 'Địa chỉ TRC20 không hợp lệ');
      return;
    }

    // Save and navigate back
    navigation.goBack();
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
        <Text style={styles.headerTitle}>Thêm địa chỉ TRC20</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>Lưu</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Wallet Name */}
        <Text style={styles.label}>Tên ví</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="Nhập tên ví (VD: Ví chính)"
          placeholderTextColor="#999"
        />

        {/* TRC20 Address */}
        <Text style={styles.label}>Địa chỉ TRC20</Text>
        <View style={styles.addressInputContainer}>
          <TextInput
            style={styles.addressInput}
            value={address}
            onChangeText={setAddress}
            placeholder="Nhập hoặc dán địa chỉ TRC20"
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

        {/* Default Address Toggle */}
        <View style={styles.defaultContainer}>
          <View>
            <Text style={styles.defaultTitle}>Đặt làm địa chỉ mặc định</Text>
            <Text style={styles.defaultDescription}>
              Địa chỉ này sẽ được chọn mặc định khi nhận USDT
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
            Vui lòng kiểm tra kỹ địa chỉ ví TRC20 trước khi lưu. Địa chỉ không hợp lệ có thể dẫn đến mất tiền và không thể khôi phục.
          </Text>
        </View>

        <View style={styles.supportedBox}>
          <Text style={styles.supportedTitle}>Các sàn giao dịch được hỗ trợ:</Text>
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
});

export default AddTRC20AddressScreen;
