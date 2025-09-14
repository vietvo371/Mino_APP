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
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

type BankAccount = {
  id: string;
  bank: string;
  accountNumber: string;
  accountName: string;
  isDefault?: boolean;
};

const EditBankAccountScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const account = (route.params as any)?.account as BankAccount;

  const [accountName, setAccountName] = useState(account?.accountName || '');
  const [isDefault, setIsDefault] = useState(account?.isDefault || false);

  const handleSave = () => {
    if (!accountName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên chủ tài khoản');
      return;
    }
    // Save changes and navigate back
    navigation.goBack();
  };

  const handleDelete = () => {
    Alert.alert(
      'Xóa tài khoản',
      'Bạn có chắc chắn muốn xóa tài khoản ngân hàng này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            // Delete account and navigate back
            navigation.goBack();
          },
        },
      ]
    );
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
        <Text style={styles.headerTitle}>Chỉnh sửa tài khoản</Text>
        <TouchableOpacity 
          style={styles.saveButton}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>Lưu</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Bank Info (Non-editable) */}
        <Text style={styles.label}>Ngân hàng</Text>
        <View style={styles.infoField}>
          <Text style={styles.infoText}>{account?.bank}</Text>
        </View>

        {/* Account Number (Non-editable) */}
        <Text style={styles.label}>Số tài khoản</Text>
        <View style={styles.infoField}>
          <Text style={styles.infoText}>{account?.accountNumber}</Text>
        </View>

        {/* Account Name */}
        <Text style={styles.label}>Tên chủ tài khoản</Text>
        <TextInput
          style={styles.input}
          value={accountName}
          onChangeText={setAccountName}
          placeholder="Nhập tên chủ tài khoản"
          autoCapitalize="characters"
          placeholderTextColor="#999"
        />

        {/* Default Account Toggle */}
        <View style={styles.defaultContainer}>
          <View>
            <Text style={styles.defaultTitle}>Đặt làm tài khoản mặc định</Text>
            <Text style={styles.defaultDescription}>
              Tài khoản này sẽ được chọn mặc định khi rút tiền
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
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Icon name="trash-can-outline" size={20} color="#FF3B30" />
          <Text style={styles.deleteText}>Xóa tài khoản này</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Icon name="information" size={20} color="#666" />
          <Text style={styles.infoText}>
            Để thay đổi ngân hàng hoặc số tài khoản, vui lòng xóa và thêm tài khoản mới
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
  infoField: {
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  infoText: {
    fontSize: wp('4%'),
    color: '#666',
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

export default EditBankAccountScreen;
