import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
  Clipboard,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import QRCode from '../component/QRCode';

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
    if (paymentInfo.type === 'buy') {
      Alert.alert('Thành công', 'Giao dịch mua USDT đang được xử lý. Vui lòng thanh toán theo thông tin chuyển khoản.');
      navigation.navigate('History');
    } else {
      if (!selectedBank) {
        Alert.alert('Thông báo', 'Vui lòng chọn tài khoản nhận tiền');
        return;
      }
      Alert.alert('Thành công', 'Giao dịch bán USDT đang được xử lý. Vui lòng gửi USDT đến địa chỉ ví đã cung cấp.');
      navigation.navigate('History');
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    Clipboard.setString(text);
    Alert.alert('Đã sao chép', message);
  };

  const getTransactionInfo = () => {
    const amountNum = parseFloat(paymentInfo.amount);
    if (paymentInfo.type === 'buy') {
      const usdtAmount = (amountNum / paymentInfo.rate).toFixed(2);
      const fee = 13500;
      const totalVND = amountNum + fee;
      const transactionId = `MINO${Date.now().toString().slice(-6)}`;
      
      return {
        usdtWant: `${usdtAmount} USDT`,
        exchangeRate: `1 USDT = ${paymentInfo.rate.toLocaleString('vi-VN')} VND`,
        fee: `${fee.toLocaleString('vi-VN')} VND`,
        totalVND: `${totalVND.toLocaleString('vi-VN')} VND`,
        transactionId,
        transferInfo: {
          bankName: 'Vietcombank',
          accountNumber: '1234567890',
          accountName: 'MINO EXCHANGE',
          transferContent: `MINO ${transactionId} ${usdtAmount}USDT`,
          amount: totalVND.toLocaleString('vi-VN'),
        }
      };
    } else {
      const feeRate = 0.5; // 0.5%
      const feeAmount = amountNum * paymentInfo.rate * (feeRate / 100);
      const receiveAmount = (amountNum * paymentInfo.rate) - feeAmount;
      
      return {
        usdtSell: `${paymentInfo.amount} USDT`,
        exchangeRate: `1 USDT = ${paymentInfo.rate.toLocaleString('vi-VN')} VND`,
        fee: `${feeAmount.toLocaleString('vi-VN')} VND (${feeRate}%)`,
        receiveVND: `${receiveAmount.toLocaleString('vi-VN')} VND`,
        sendAmount: `${paymentInfo.amount} USDT`,
        receiveAmount: `${receiveAmount.toLocaleString('vi-VN')} VND`,
        feeDisplay: `${feeAmount.toLocaleString('vi-VN')} VND`,
        total: `${receiveAmount.toLocaleString('vi-VN')} VND`,
      };
    }
  };

  const generateQRData = () => {
    const transactionInfo = getTransactionInfo();
    
    if (paymentInfo.type === 'buy') {
      const qrData = {
        bankName: transactionInfo.transferInfo?.bankName || 'Vietcombank',
        accountNumber: transactionInfo.transferInfo?.accountNumber || '1234567890',
        accountName: transactionInfo.transferInfo?.accountName || 'MINO EXCHANGE',
        amount: transactionInfo.transferInfo?.amount?.replace(/\./g, '') || '0',
        transferContent: transactionInfo.transferInfo?.transferContent || 'MINO TXN',
        currency: 'VND'
      };
      
      return JSON.stringify(qrData);
    } else {
      const amountNum = parseFloat(paymentInfo.amount);
      const paymentData = {
        merchant: "Mino Exchange",
        transactionId: `TXN${Date.now()}`,
        type: paymentInfo.type,
        amount: paymentInfo.amount,
        currency: 'USDT',
        rate: paymentInfo.rate,
        timestamp: new Date().toISOString(),
        status: "pending",
        totalAmount: `${(amountNum * paymentInfo.rate * 0.995).toLocaleString('vi-VN')} VND`,
        receiveAmount: `${(amountNum * paymentInfo.rate).toLocaleString('vi-VN')} VND`,
        fee: '0.5%',
        paymentMethod: 'crypto_transfer'
      };
      
      return JSON.stringify(paymentData);
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
          {paymentInfo.type === 'buy' ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số USDT muốn mua</Text>
                <Text style={styles.infoValue}>{transactionInfo.usdtWant}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tỷ giá</Text>
                <Text style={styles.infoValue}>{transactionInfo.exchangeRate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phí giao dịch</Text>
                <Text style={styles.infoValue}>{transactionInfo.fee}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.totalLabel}>Số VND cần chuyển</Text>
                <Text style={styles.totalValue}>{transactionInfo.totalVND}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Số USDT muốn bán</Text>
                <Text style={styles.infoValue}>{transactionInfo.usdtSell}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Tỷ giá</Text>
                <Text style={styles.infoValue}>{transactionInfo.exchangeRate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phí giao dịch</Text>
                <Text style={styles.infoValue}>{transactionInfo.fee}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.totalLabel}>Số VND sẽ nhận</Text>
                <Text style={styles.totalValue}>{transactionInfo.receiveVND}</Text>
              </View>
            </>
          )}
        </View>

        {/* Transfer Information - Only for BUY USDT */}
        {paymentInfo.type === 'buy' && (
          <View style={styles.transferSection}>
            <Text style={styles.sectionTitle}>Thông tin chuyển khoản</Text>
            <View style={styles.transferCard}>
              {/* Bank Name */}
              <View style={styles.transferRow}>
                <Text style={styles.transferLabel}>Ngân hàng:</Text>
                <View style={styles.transferValueContainer}>
                  <Text style={styles.transferValue}>{transactionInfo.transferInfo?.bankName || 'Vietcombank'}</Text>
                  <TouchableOpacity 
                    onPress={() => copyToClipboard(transactionInfo.transferInfo?.bankName || 'Vietcombank', 'Đã sao chép tên ngân hàng')}
                    style={styles.copyButton}
                  >
                    <Icon name="content-copy" size={16} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Account Number */}
              <View style={styles.transferRow}>
                <Text style={styles.transferLabel}>Số tài khoản:</Text>
                <View style={styles.transferValueContainer}>
                  <Text style={styles.transferValue}>{transactionInfo.transferInfo?.accountNumber || '1234567890'}</Text>
                  <TouchableOpacity 
                    onPress={() => copyToClipboard(transactionInfo.transferInfo?.accountNumber || '1234567890', 'Đã sao chép số tài khoản')}
                    style={styles.copyButton}
                  >
                    <Icon name="content-copy" size={16} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Account Name */}
              <View style={styles.transferRow}>
                <Text style={styles.transferLabel}>Tên tài khoản:</Text>
                <View style={styles.transferValueContainer}>
                  <Text style={styles.transferValue}>{transactionInfo.transferInfo?.accountName || 'MINO EXCHANGE'}</Text>
                  <TouchableOpacity 
                    onPress={() => copyToClipboard(transactionInfo.transferInfo?.accountName || 'MINO EXCHANGE', 'Đã sao chép tên tài khoản')}
                    style={styles.copyButton}
                  >
                    <Icon name="content-copy" size={16} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Amount */}
              <View style={styles.transferRow}>
                <Text style={styles.transferLabel}>Số tiền:</Text>
                <View style={styles.transferValueContainer}>
                  <Text style={styles.transferValueHighlight}>{transactionInfo.transferInfo?.amount || '0'} VND</Text>
                  <TouchableOpacity 
                    onPress={() => copyToClipboard(transactionInfo.transferInfo?.amount?.replace(/\./g, '') || '0', 'Đã sao chép số tiền')}
                    style={styles.copyButton}
                  >
                    <Icon name="content-copy" size={16} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Transfer Content */}
              <View style={styles.transferRow}>
                <Text style={styles.transferLabel}>Nội dung chuyển khoản:</Text>
                <View style={styles.transferValueContainer}>
                  <Text style={styles.transferValueHighlight}>{transactionInfo.transferInfo?.transferContent || 'MINO TXN'}</Text>
                  <TouchableOpacity 
                    onPress={() => copyToClipboard(transactionInfo.transferInfo?.transferContent || 'MINO TXN', 'Đã sao chép nội dung chuyển khoản')}
                    style={styles.copyButton}
                  >
                    <Icon name="content-copy" size={16} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Copy All Button */}
            <TouchableOpacity 
              style={styles.copyAllButton}
              onPress={() => {
                const allInfo = `Ngân hàng: ${transactionInfo.transferInfo?.bankName || 'Vietcombank'}\nSố tài khoản: ${transactionInfo.transferInfo?.accountNumber || '1234567890'}\nTên tài khoản: ${transactionInfo.transferInfo?.accountName || 'MINO EXCHANGE'}\nSố tiền: ${transactionInfo.transferInfo?.amount || '0'} VND\nNội dung: ${transactionInfo.transferInfo?.transferContent || 'MINO TXN'}`;
                copyToClipboard(allInfo, 'Đã sao chép toàn bộ thông tin chuyển khoản');
              }}
            >
              <Icon name="content-copy" size={20} color="#FFFFFF" />
              <Text style={styles.copyAllText}>Sao chép toàn bộ thông tin</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* QR Code Section - Only for BUY USDT */}
        {paymentInfo.type === 'buy' && (
          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>Mã QR thanh toán</Text>
            <View style={styles.qrContainer}>
              <QRCode
                value={generateQRData()}
                size={wp('60%')}
                showShare={true}
                showDownload={true}
              />
            </View>
            <View style={styles.qrInfo}>
              <Icon name="qrcode-scan" size={20} color="#666" />
              <Text style={styles.qrInfoText}>
                Quét mã QR bằng ứng dụng ngân hàng hoặc ví điện tử để thanh toán
              </Text>
            </View>
          </View>
        )}

        {/* Payment Methods - Only for SELL USDT */}
        {paymentInfo.type === 'sell' && (
          <>
            <Text style={styles.sectionTitle}>Chọn tài khoản nhận tiền</Text>
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

            <Text style={styles.sectionTitle}>Ví gửi USDT</Text>
            <View style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <Icon name="wallet" size={20} color="#7B68EE" />
                <Text style={styles.walletTitle}>Địa chỉ ví TRC20</Text>
              </View>
              <View style={styles.walletAddressContainer}>
                <Text style={styles.walletAddress}>TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE</Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => copyToClipboard('TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE', 'Đã sao chép địa chỉ ví')}
                >
                  <Icon name="content-copy" size={16} color="#4A90E2" />
                </TouchableOpacity>
              </View>
              
              {/* USDT Amount */}
              <View style={styles.usdtAmountContainer}>
                <View style={styles.usdtAmountHeader}>
                  <Icon name="currency-usd" size={16} color="#7B68EE" />
                  <Text style={styles.usdtAmountLabel}>Số USDT cần gửi</Text>
                </View>
                <View style={styles.usdtAmountValueContainer}>
                  <Text style={styles.usdtAmountValue}>{transactionInfo.usdtSell || '0 USDT'}</Text>
                  <TouchableOpacity 
                    style={styles.copyButton}
                    onPress={() => copyToClipboard(transactionInfo.usdtSell || '0 USDT', 'Đã sao chép số USDT')}
                  >
                    <Icon name="content-copy" size={16} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.walletNote}>
                Gửi {transactionInfo.usdtSell} đến địa chỉ này để hoàn tất giao dịch
              </Text>
            </View>

            {/* QR Code for Wallet */}
            <View style={styles.qrSection}>
              <Text style={styles.sectionTitle}>Mã QR ví TRC20</Text>
              <View style={styles.qrContainer}>
                <QRCode
                  value="TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE"
                  size={wp('60%')}
                  showShare={true}
                  showDownload={true}
                />
              </View>
              <View style={styles.qrInfo}>
                <Icon name="qrcode-scan" size={20} color="#666" />
                <Text style={styles.qrInfoText}>
                  Quét mã QR để gửi USDT từ ví của bạn
                </Text>
              </View>
            </View>
          </>
        )}

        <View style={styles.noteContainer}>
          <Icon name="information" size={20} color="#666" />
          <Text style={styles.noteText}>
            {paymentInfo.type === 'buy' 
              ? 'Vui lòng chuyển khoản đúng số tiền và nội dung. Giao dịch sẽ được xử lý tự động sau khi nhận được thanh toán (5-20 phút).'
              : 'Thời gian xử lý giao dịch từ 5-20 phút. Vui lòng kiểm tra kỹ thông tin trước khi xác nhận.'
            }
          </Text>
        </View>
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={[
            styles.confirmButton,
            (paymentInfo.type === 'sell' && !selectedBank) && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirm}
          disabled={paymentInfo.type === 'sell' && !selectedBank}
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
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  transferSection: {
    marginBottom: 24,
  },
  transferCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  transferRow: {
    marginBottom: 16,
  },
  transferLabel: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: 8,
  },
  transferValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  transferValue: {
    fontSize: wp('3.8%'),
    color: '#000',
    fontWeight: '500',
    flex: 1,
  },
  transferValueHighlight: {
    fontSize: wp('3.8%'),
    color: '#4A90E2',
    fontWeight: '600',
    flex: 1,
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
  },
  copyAllButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 8,
  },
  copyAllText: {
    color: '#FFFFFF',
    fontSize: wp('3.8%'),
    fontWeight: '600',
    marginLeft: 8,
  },
  walletCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletTitle: {
    fontSize: wp('3.8%'),
    color: '#000',
    fontWeight: '600',
    marginLeft: 8,
  },
  walletAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 8,
  },
  walletAddress: {
    fontSize: wp('3.5%'),
    color: '#000',
    fontWeight: '500',
    flex: 1,
    fontFamily: 'monospace',
  },
  walletNote: {
    fontSize: wp('3.2%'),
    color: '#666',
    fontStyle: 'italic',
  },
  usdtAmountContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  usdtAmountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  usdtAmountLabel: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginLeft: 6,
    fontWeight: '500',
  },
  usdtAmountValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#7B68EE',
  },
  usdtAmountValue: {
    fontSize: wp('4%'),
    color: '#7B68EE',
    fontWeight: '600',
    flex: 1,
  },
  qrSection: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  qrInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 8,
    width: '100%',
  },
  qrInfoText: {
    flex: 1,
    fontSize: wp('3.5%'),
    color: '#666',
    marginLeft: 8,
    lineHeight: wp('4.5%'),
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
