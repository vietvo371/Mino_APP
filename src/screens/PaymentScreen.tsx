import React, { useEffect, useRef, useState } from 'react';
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
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import QRCode from '../component/QRCode';

// API endpoint từ backend của bạn
const RATE_API_URL = 'https://your-backend-api.com/api/exchange-rate';

// Fallback rate nếu API fail
const FALLBACK_RATE = 24500;

// Transaction fee percentage - có thể cập nhật từ API sau
const TRANSACTION_FEE_PERCENTAGE = 0.5; // 0.5%

// Mock defaults for preview
const DEFAULT_TRC20_ADDRESS = 'TR7NHqjeKQxCw1234abcdXYZ7890pqrsLMN';
const DEFAULT_BANK = {
  bankName: 'Vietcombank',
  accountNumber: '0123456789',
  accountName: 'NGUYEN VAN A',
};

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
  const [selectedReceiveTRC20, setSelectedReceiveTRC20] = useState('');
  const [currentRate, setCurrentRate] = useState<number>(paymentInfo.rate || FALLBACK_RATE);
  const [secondsLeft, setSecondsLeft] = useState<number>(20);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const isFetchingRef = useRef<boolean>(false);
  const transactionIdRef = useRef<string>(`MINO${Date.now().toString().slice(-6)}`);

  // Sync selected TRC20 address from navigation params (supports default and selection)
  useFocusEffect(
    React.useCallback(() => {
      const params: any = route.params || {};
      const picked = params?.selectedTRC20 || params?.selectedReceiveTRC20 || params?.address;
      const defaultAddr = params?.defaultTRC20 || params?.defaultAddress;
      if (picked && typeof picked === 'string' && picked.trim().length > 0) {
        setSelectedReceiveTRC20(picked.trim());
      } else if (!selectedReceiveTRC20 && defaultAddr && typeof defaultAddr === 'string') {
        setSelectedReceiveTRC20(defaultAddr.trim());
      }
      return () => {};
    }, [route.params, selectedReceiveTRC20])
  );

  // Set mock defaults to preview if nothing selected yet
  useEffect(() => {
    if (paymentInfo.type === 'buy' && !selectedReceiveTRC20) {
      setSelectedReceiveTRC20(DEFAULT_TRC20_ADDRESS);
    }
    if (paymentInfo.type === 'sell' && !selectedBank) {
      setSelectedBank(`${DEFAULT_BANK.bankName} - ${DEFAULT_BANK.accountNumber}`);
    }
  }, []);

  // Function to fetch rate from your backend API
  const fetchExchangeRate = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoadingRate(true);
    
    try {
      const response = await fetch(RATE_API_URL);
      const data = await response.json();
      
      // Giả sử API trả về format: { rate: 24500 } hoặc { usdt_vnd_rate: 24500 }
      const rate = data.rate || data.usdt_vnd_rate || data.exchange_rate;
      
      if (rate && !isNaN(parseFloat(rate))) {
        setCurrentRate(parseFloat(rate));
        console.log('Rate updated from API:', rate);
      } else {
        throw new Error('Invalid rate format');
      }
    } catch (error) {
      console.log('API failed, using fallback rate:', error);
      setCurrentRate(FALLBACK_RATE);
    } finally {
      isFetchingRef.current = false;
      setIsLoadingRate(false);
    }
  };

  // 20s countdown and auto-refresh
  useEffect(() => {
    setSecondsLeft(20);
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          // time to refresh
          fetchExchangeRate();
          return 20;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSelectBank = () => {
    navigation.navigate('BankAccounts');
  };

  const handleSelectTRC20 = () => {
    navigation.navigate('TRC20Addresses');
  };

  const handleSelectReceiveTRC20 = () => {
    navigation.navigate('TRC20Addresses');
  };

  const handleConfirm = () => {
    if (paymentInfo.type === 'buy') {
      if (!selectedReceiveTRC20) {
        Alert.alert('Notification', 'Please select a TRC20 wallet to receive USDT');
        return;
      }
      // Tạo transaction data cho DetailHistoryScreen
      const transactionData = {
        id: `MINO${Date.now().toString().slice(-6)}`,
        type: paymentInfo.type,
        amount: paymentInfo.amount,
        usdt: (parseFloat(paymentInfo.amount) / currentRate).toFixed(2),
        exchangeRate: currentRate.toLocaleString('vi-VN'),
        status: 'pending' as const,
        date: new Date().toLocaleDateString('vi-VN'),
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        transactionId: `MINO${Date.now().toString().slice(-6)}`,
        fee: `${(parseFloat(paymentInfo.amount) * (TRANSACTION_FEE_PERCENTAGE / 100)).toLocaleString('vi-VN')} VND (${TRANSACTION_FEE_PERCENTAGE}%)`,
        totalAmount: `${(parseFloat(paymentInfo.amount) + (parseFloat(paymentInfo.amount) * (TRANSACTION_FEE_PERCENTAGE / 100))).toLocaleString('vi-VN')} VND`,
        transferInfo: {
          bankName: 'BIDV',
          accountNumber: '963336984884401',
          accountName: 'BAOKIM CONG TY CO PHAN THUONG MAI DIEN TU BAO KIM',
          transferContent: 'Lien ket vi Baokim',
          amount: (parseFloat(paymentInfo.amount) + (parseFloat(paymentInfo.amount) * (TRANSACTION_FEE_PERCENTAGE / 100))).toLocaleString('vi-VN'),
        },
        receiveAddress: selectedReceiveTRC20,
      };
      navigation.navigate('DetailHistory', { transaction: transactionData });
    } else {
      if (!selectedBank) {
        Alert.alert('Notification', 'Please select a bank account to receive money');
        return;
      }
      // Tạo transaction data cho DetailHistoryScreen
      const transactionData = {
        id: `MINO${Date.now().toString().slice(-6)}`,
        type: paymentInfo.type,
        amount: paymentInfo.amount,
        usdt: paymentInfo.amount,
        exchangeRate: currentRate.toLocaleString('vi-VN'),
        status: 'pending' as const,
        date: new Date().toLocaleDateString('vi-VN'),
        time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        transactionId: `MINO${Date.now().toString().slice(-6)}`,
        fee: `${(parseFloat(paymentInfo.amount) * currentRate * (TRANSACTION_FEE_PERCENTAGE / 100)).toLocaleString('vi-VN')} VND (${TRANSACTION_FEE_PERCENTAGE}%)`,
        totalAmount: `${((parseFloat(paymentInfo.amount) * currentRate) - (parseFloat(paymentInfo.amount) * currentRate * (TRANSACTION_FEE_PERCENTAGE / 100))).toLocaleString('vi-VN')} VND`,
        receiveAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
        bankAccount: selectedBank,
      };
      navigation.navigate('DetailHistory', { transaction: transactionData });
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', message);
  };

  const getTransactionInfo = () => {
    const amountNum = parseFloat(paymentInfo.amount);
    if (paymentInfo.type === 'buy') {
      const usdtAmount = (amountNum / currentRate).toFixed(2);
      const feeAmount = amountNum * (TRANSACTION_FEE_PERCENTAGE / 100);
      const totalVND = amountNum + feeAmount;
      const transactionId = transactionIdRef.current;

      return {
        usdtWant: `${usdtAmount} USDT`,
        exchangeRate: `1 USDT = ${currentRate.toLocaleString('vi-VN')} VND`,
        fee: `${feeAmount.toLocaleString('vi-VN')} VND (${TRANSACTION_FEE_PERCENTAGE}%)`,
        totalVND: `${totalVND.toLocaleString('vi-VN')} VND`,
        transactionId,
        transferInfo: {
          bankName: 'BIDV',
          accountNumber: '963336984884401',
          accountName: 'BAOKIM CONG TY CO PHAN THUONG MAI DIEN TU BAO KIM',
          transferContent: 'Lien ket vi Baokim',
          amount: totalVND.toLocaleString('vi-VN'),
        }
      };
    } else {
      // Sell USDT: sử dụng phí từ biến cố định
      const feeAmount = amountNum * currentRate * (TRANSACTION_FEE_PERCENTAGE / 100);
      const receiveAmount = (amountNum * currentRate) - feeAmount;

      return {
        usdtSell: `${paymentInfo.amount} USDT`,
        exchangeRate: `1 USDT = ${currentRate.toLocaleString('vi-VN')} VND`,
        fee: `${feeAmount.toLocaleString('vi-VN')} VND (${TRANSACTION_FEE_PERCENTAGE}%)`,
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
      const amountNum = parseFloat(paymentInfo.amount);
      const feeAmount = amountNum * (TRANSACTION_FEE_PERCENTAGE / 100);
      const totalAmount = amountNum + feeAmount;
      
      const qrData = {
        bankName: transactionInfo.transferInfo?.bankName || 'Vietcombank',
        accountNumber: transactionInfo.transferInfo?.accountNumber || '1234567890',
        accountName: transactionInfo.transferInfo?.accountName || 'MINO EXCHANGE',
        amount: totalAmount.toLocaleString('vi-VN').replace(/\./g, ''),
        transferContent: transactionInfo.transferInfo?.transferContent || 'MINO TXN',
        currency: 'VND',
        fee: `${TRANSACTION_FEE_PERCENTAGE}%`
      };

      return JSON.stringify(qrData);
    } else {
      const amountNum = parseFloat(paymentInfo.amount);
      const paymentData = {
        merchant: "Mino Exchange",
        transactionId: transactionIdRef.current,
        type: paymentInfo.type,
        amount: paymentInfo.amount,
        currency: 'USDT',
        rate: currentRate,
        timestamp: new Date().toISOString(),
        status: "pending",
        totalAmount: `${(amountNum * currentRate).toLocaleString('vi-VN')} VND`,
        receiveAmount: `${((amountNum * currentRate) * (1 - TRANSACTION_FEE_PERCENTAGE / 100)).toLocaleString('vi-VN')} VND`,
        fee: `${TRANSACTION_FEE_PERCENTAGE}%`,
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
          {paymentInfo.type === 'buy' ? 'Buy USDT' : 'Sell USDT'}
        </Text>
        <TouchableOpacity style={styles.headerRight} onPress={fetchExchangeRate}>
          <Icon name="refresh" size={16} color="#4A90E2" />
          <Text style={styles.headerRightText}>
            {secondsLeft}s • {currentRate.toLocaleString('vi-VN')}
          </Text>
          {isLoadingRate && (
            <Icon name="loading" size={14} color="#4A90E2" style={{ marginLeft: 4 }} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Transaction Info */}
        <View style={styles.infoCard}>
          {paymentInfo.type === 'buy' ? (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>USDT to Buy</Text>
                <Text style={styles.infoValue}>{transactionInfo.usdtWant}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Exchange Rate</Text>
                <Text style={styles.infoValue}>{transactionInfo.exchangeRate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Transaction Fee</Text>
                <Text style={styles.infoValue}>{transactionInfo.fee}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.totalLabel}>VND to Transfer</Text>
                <Text style={styles.totalValue}>{transactionInfo.totalVND}</Text>
              </View>
            </>
          ) : (
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>USDT to Sell</Text>
                <Text style={styles.infoValue}>{transactionInfo.usdtSell}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Exchange Rate</Text>
                <Text style={styles.infoValue}>{transactionInfo.exchangeRate}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Transaction Fee</Text>
                <Text style={styles.infoValue}>{transactionInfo.fee}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.infoRow}>
                <Text style={styles.totalLabel}>VND to Receive</Text>
                <Text style={styles.totalValue}>{transactionInfo.receiveVND}</Text>
              </View>
            </>
          )}
        </View>


        {/* Wallet Selection for Buy USDT */}
        {paymentInfo.type === 'buy' && (
          <>
            <Text style={styles.sectionTitle}>Select TRC20 Wallet to Receive USDT</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={handleSelectReceiveTRC20}
            >
              <View style={styles.selectLeft}>
                <Icon name="wallet" size={24} color="#7B68EE" />
                <View style={styles.selectInfo}>
                  <Text style={styles.selectTitle}>TRC20 Wallet</Text>
                  <Text style={styles.selectDescription}>
                    {selectedReceiveTRC20 || 'Select TRC20 wallet to receive USDT'}
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            {selectedReceiveTRC20 ? (
              <View style={styles.walletCard}>
                <View style={styles.walletHeader}>
                  <Icon name="wallet" size={20} color="#7B68EE" />
                  <Text style={styles.walletTitle}>Receive USDT Address</Text>
                </View>
                <View style={styles.walletAddressContainer}>
                  <Text style={styles.walletAddress}>{selectedReceiveTRC20}</Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyToClipboard(selectedReceiveTRC20, 'Wallet address copied')}
                  >
                    <Icon name="content-copy" size={16} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.walletNote}>
                  USDT will be received at this address after your payment is confirmed.
                </Text>
              </View>
            ) : null}
          </>
        )}

        {/* Wallet Selection for Sell USDT */}
        {paymentInfo.type === 'sell' && (
          <>
            <Text style={styles.sectionTitle}>Select Bank Account to Receive Money</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={handleSelectBank}
            >
              <View style={styles.selectLeft}>
                <Icon name="bank" size={24} color="#4A90E2" />
                <View style={styles.selectInfo}>
                  <Text style={styles.selectTitle}>Bank Account</Text>
                  <Text style={styles.selectDescription}>
                    {selectedBank || `${DEFAULT_BANK.bankName} - ${DEFAULT_BANK.accountNumber}`}
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>

            {/* Preview selected/default bank info */}
            <View style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <Icon name="bank" size={20} color="#4A90E2" />
                <Text style={styles.walletTitle}>Receive Bank Account</Text>
              </View>
              <View style={styles.walletAddressContainer}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.walletAddress, { fontFamily: undefined }]}>
                    {selectedBank || `${DEFAULT_BANK.bankName} - ${DEFAULT_BANK.accountNumber}`}
                  </Text>
                  <Text style={{ color: '#666', marginTop: 4 }}>
                    {DEFAULT_BANK.accountName}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(selectedBank || `${DEFAULT_BANK.bankName} - ${DEFAULT_BANK.accountNumber}`, 'Bank info copied')}
                >
                  <Icon name="content-copy" size={16} color="#4A90E2" />
                </TouchableOpacity>
              </View>
            </View>
          </>
        )}

        {/* <View style={styles.noteContainer}>
          <Icon name="information" size={20} color="#666" />
          <Text style={styles.noteText}>
            {paymentInfo.type === 'buy'
              ? 'Please transfer the exact amount and content. Transaction will be processed automatically after payment is received (5-20 minutes).'
              : 'Transaction processing time is 5-20 minutes. Please check the information carefully before confirming.'
            }
          </Text>
        </View> */}
      </ScrollView>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.confirmButton,
            ((paymentInfo.type === 'buy' && !selectedReceiveTRC20) || (paymentInfo.type === 'sell' && !selectedBank)) && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirm}
          disabled={(paymentInfo.type === 'buy' && !selectedReceiveTRC20) || (paymentInfo.type === 'sell' && !selectedBank)}
        >
          <Text style={styles.confirmButtonText}>Confirm Transaction</Text>
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: '#EEF5FF',
    borderRadius: 16,
  },
  headerRightText: {
    marginLeft: 6,
    color: '#4A90E2',
    fontSize: wp('3.2%'),
    fontWeight: '600',
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
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 0,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    overflow: 'hidden',
  },
  transferRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  transferLabel: {
    fontSize: wp('3.8%'),
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  transferValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  transferValue: {
    fontSize: wp('3.8%'),
    color: '#000',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  transferValueHighlight: {
    fontSize: wp('3.8%'),
    color: '#4A90E2',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
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
