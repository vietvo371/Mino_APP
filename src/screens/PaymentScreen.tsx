import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

type PaymentInfo = {
  type: 'buy' | 'sell';
  amount: string;
  rate: number;
};

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const paymentInfo = (route.params as any)?.paymentInfo as PaymentInfo;

  const [selectedBank, setSelectedBank] = useState('');
  const [selectedTRC20, setSelectedTRC20] = useState('');

  const handleSelectBank = () => {
    navigation.navigate('BankAccounts');
  };

  const handleSelectTRC20 = () => {
    navigation.navigate('TRC20Addresses');
  };

  const handleConfirm = () => {
    if (!selectedBank || !selectedTRC20) {
      Alert.alert('Thông báo', 'Vui lòng chọn đầy đủ thông tin thanh toán');
      return;
    }
    // Xử lý xác nhận giao dịch
    Alert.alert('Thành công', 'Giao dịch đang được xử lý');
    navigation.navigate('History');
  };

  const getTransactionInfo = () => {
    const amountNum = parseFloat(paymentInfo.amount);
    if (paymentInfo.type === 'buy') {
      return {
        sendAmount: `${parseInt(paymentInfo.amount).toLocaleString('vi-VN')} VND`,
        receiveAmount: `${(amountNum / paymentInfo.rate).toFixed(2)} USDT`,
        fee: `${(13500).toLocaleString('vi-VN')} VND`,
        total: `${(amountNum + 13500).toLocaleString('vi-VN')} VND`,
      };
    } else {
      return {
        sendAmount: `${paymentInfo.amount} USDT`,
        receiveAmount: `${(amountNum * paymentInfo.rate).toLocaleString('vi-VN')} VND`,
        fee: '0.5%',
        total: `${(amountNum * paymentInfo.rate * 0.995).toLocaleString('vi-VN')} VND`,
      };
    }
  };

  const transactionInfo = getTransactionInfo();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {paymentInfo.type === 'buy' ? 'Mua USDT' : 'Bán USDT'}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Transaction Info */}
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số tiền gửi</Text>
            <Text style={styles.infoValue}>{transactionInfo.sendAmount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Số tiền nhận</Text>
            <Text style={styles.infoValue}>{transactionInfo.receiveAmount}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phí giao dịch</Text>
            <Text style={styles.infoValue}>{transactionInfo.fee}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.infoRow}>
            <Text style={styles.totalLabel}>Tổng thanh toán</Text>
            <Text style={styles.totalValue}>{transactionInfo.total}</Text>
          </View>
        </View>

        {/* Payment Methods */}
        <Text style={styles.sectionTitle}>
          {paymentInfo.type === 'buy' ? 'Chọn tài khoản thanh toán' : 'Chọn tài khoản nhận tiền'}
        </Text>
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={handleSelectBank}
        >
          <View style={styles.selectLeft}>
            <Icon name="bank" size={24} color="#4A90E2" />
            <View style={styles.selectInfo}>
              <Text style={styles.selectTitle}>Tài khoản ngân hàng</Text>
              <Text style={styles.selectDescription}>
                {selectedBank || 'Chọn tài khoản ngân hàng'}
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>
          {paymentInfo.type === 'buy' ? 'Chọn ví nhận USDT' : 'Chọn ví gửi USDT'}
        </Text>
        <TouchableOpacity 
          style={styles.selectButton}
          onPress={handleSelectTRC20}
        >
          <View style={styles.selectLeft}>
            <Icon name="wallet" size={24} color="#7B68EE" />
            <View style={styles.selectInfo}>
              <Text style={styles.selectTitle}>Địa chỉ TRC20</Text>
              <Text style={styles.selectDescription}>
                {selectedTRC20 || 'Chọn địa chỉ ví TRC20'}
              </Text>
            </View>
          </View>
          <Icon name="chevron-right" size={24} color="#666" />
        </TouchableOpacity>

        <View style={styles.noteContainer}>
          <Icon name="information" size={20} color="#666" />
          <Text style={styles.noteText}>
            Thời gian xử lý giao dịch từ 5-20 phút. Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.
          </Text>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.confirmButton,
            (!selectedBank || !selectedTRC20) && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirm}
          disabled={!selectedBank || !selectedTRC20}
        >
          <Text style={styles.confirmButtonText}>Xác nhận giao dịch</Text>
        </TouchableOpacity>
      </View>
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
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  infoCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: wp('3.8%'),
    color: '#666',
  },
  infoValue: {
    fontSize: wp('3.8%'),
    color: '#000',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
  },
  totalValue: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#000',
  },
  sectionTitle: {
    fontSize: wp('3.8%'),
    fontWeight: '500',
    color: '#000',
    marginBottom: 12,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  selectInfo: {
    marginLeft: 12,
    flex: 1,
  },
  selectTitle: {
    fontSize: wp('3.8%'),
    fontWeight: '500',
    color: '#000',
    marginBottom: 4,
  },
  selectDescription: {
    fontSize: wp('3.5%'),
    color: '#666',
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  noteText: {
    flex: 1,
    fontSize: wp('3.5%'),
    color: '#666',
    marginLeft: 8,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
  },
  confirmButton: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontWeight: '600',
  },
});

export default PaymentScreen;
