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
  const [currentRate, setCurrentRate] = useState<number>(paymentInfo.rate || 0);
  const [secondsLeft, setSecondsLeft] = useState<number>(20);
  const isFetchingRef = useRef<boolean>(false);
  const transactionIdRef = useRef<string>(`MINO${Date.now().toString().slice(-6)}`);

  // Fetch USD→VND rate (USDT≈USD)
  const fetchExchangeRate = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    try {
      const res = await fetch('https://api.exchangerate.host/latest?base=USD&symbols=VND');
      const json = await res.json();
      const vnd = json?.rates?.VND;
      if (typeof vnd === 'number' && isFinite(vnd)) {
        setCurrentRate(Math.round(vnd));
      }
    } catch (e) {
      // ignore network errors, keep old rate
    } finally {
      isFetchingRef.current = false;
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

  const handleConfirm = () => {
    if (paymentInfo.type === 'buy') {
      Alert.alert('Success', 'USDT purchase transaction is being processed. Please make payment according to the transfer information.');
      navigation.navigate('History');
    } else {
      if (!selectedBank) {
        Alert.alert('Notification', 'Please select a bank account to receive money');
        return;
      }
      Alert.alert('Success', 'USDT sell transaction is being processed. Please send USDT to the provided wallet address.');
      navigation.navigate('History');
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    Clipboard.setString(text);
    Alert.alert('Copied', message);
  };

  const getTransactionInfo = () => {
    const amountNum = parseFloat(paymentInfo.amount);
    if (paymentInfo.type === 'buy') {
      const usdtAmount = (amountNum / (currentRate || paymentInfo.rate)).toFixed(2);
      const fee = 13500;
      const totalVND = amountNum + fee;
      const transactionId = transactionIdRef.current;

      return {
        usdtWant: `${usdtAmount} USDT`,
        exchangeRate: `1 USDT = ${(currentRate || paymentInfo.rate).toLocaleString('vi-VN')} VND`,
        fee: `${fee.toLocaleString('vi-VN')} VND`,
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
      const feeRate = 0.5; // 0.5%
      const rate = currentRate || paymentInfo.rate;
      const feeAmount = amountNum * rate * (feeRate / 100);
      const receiveAmount = (amountNum * rate) - feeAmount;

      return {
        usdtSell: `${paymentInfo.amount} USDT`,
        exchangeRate: `1 USDT = ${(currentRate || paymentInfo.rate).toLocaleString('vi-VN')} VND`,
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
        transactionId: transactionIdRef.current,
        type: paymentInfo.type,
        amount: paymentInfo.amount,
        currency: 'USDT',
        rate: currentRate || paymentInfo.rate,
        timestamp: new Date().toISOString(),
        status: "pending",
        totalAmount: `${(amountNum * (currentRate || paymentInfo.rate) * 0.995).toLocaleString('vi-VN')} VND`,
        receiveAmount: `${(amountNum * (currentRate || paymentInfo.rate)).toLocaleString('vi-VN')} VND`,
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
          {paymentInfo.type === 'buy' ? 'Buy USDT' : 'Sell USDT'}
        </Text>
        <TouchableOpacity style={styles.headerRight} onPress={fetchExchangeRate}>
          <Icon name="refresh" size={16} color="#4A90E2" />
          <Text style={styles.headerRightText}>
            {secondsLeft}s • {(currentRate || paymentInfo.rate).toLocaleString('vi-VN')}
          </Text>
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

        {/* QR Code Section - Only for BUY USDT */}
        {paymentInfo.type === 'buy' && (
          <View style={styles.qrSection}>
            <Text style={styles.sectionTitle}>Payment QR Code</Text>
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
                Scan QR code with banking app or e-wallet to make payment
              </Text>
            </View>
          </View>
        )}

        {/* Transfer Information - Only for BUY USDT */}
        {paymentInfo.type === 'buy' && (
          <View style={styles.transferSection}>
            <View style={styles.transferCard}>
              {/* Bank Name */}
              <View style={styles.transferRow}>
                <Text style={styles.transferLabel}>Bank Name</Text>
                <View style={styles.transferValueContainer}>
                  <Text style={styles.transferValue}>{transactionInfo.transferInfo?.bankName || 'BIDV'}</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(transactionInfo.transferInfo?.bankName || 'BIDV', 'Bank name copied')}
                    style={styles.copyButton}
                  >
                    <Icon name="content-copy" size={16} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Account Name */}
              <View style={styles.transferRow}>
                <Text style={styles.transferLabel}>Account Name</Text>
                <View style={styles.transferValueContainer}>
                  <Text style={styles.transferValue}>{transactionInfo.transferInfo?.accountName || 'BAOKIM CONG TY CO PHAN THUONG MAI DIEN TU BAO KIM'}</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(transactionInfo.transferInfo?.accountName || 'BAOKIM CONG TY CO PHAN THUONG MAI DIEN TU BAO KIM', 'Account name copied')}
                    style={styles.copyButton}
                  >
                    <Icon name="content-copy" size={16} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Account Number */}
              <View style={styles.transferRow}>
                <Text style={styles.transferLabel}>Account Number</Text>
                <View style={styles.transferValueContainer}>
                  <Text style={styles.transferValue}>{transactionInfo.transferInfo?.accountNumber || '963336984884401'}</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(transactionInfo.transferInfo?.accountNumber || '963336984884401', 'Account number copied')}
                    style={styles.copyButton}
                  >
                    <Icon name="content-copy" size={16} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Amount */}
              <View style={styles.transferRow}>
                <Text style={styles.transferLabel}>Amount</Text>
                <View style={styles.transferValueContainer}>
                  <Text style={styles.transferValueHighlight}>{transactionInfo.transferInfo?.amount || '0'} VND</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(transactionInfo.transferInfo?.amount?.replace(/\./g, '') || '0', 'Amount copied')}
                    style={styles.copyButton}
                  >
                    <Icon name="content-copy" size={16} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Transfer Content */}
              <View style={styles.transferRow}>
                <Text style={styles.transferLabel}>Transfer Content</Text>
                <View style={styles.transferValueContainer}>
                  <Text style={styles.transferValueHighlight}>{transactionInfo.transferInfo?.transferContent || 'Lien ket vi Baokim'}</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(transactionInfo.transferInfo?.transferContent || 'Lien ket vi Baokim', 'Transfer content copied')}
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
                const allInfo = `Bank Name: ${transactionInfo.transferInfo?.bankName || 'BIDV'}\nAccount Name: ${transactionInfo.transferInfo?.accountName || 'BAOKIM CONG TY CO PHAN THUONG MAI DIEN TU BAO KIM'}\nAccount Number: ${transactionInfo.transferInfo?.accountNumber || '963336984884401'}\nAmount: ${transactionInfo.transferInfo?.amount || '0'} VND\nTransfer Content: ${transactionInfo.transferInfo?.transferContent || 'Lien ket vi Baokim'}`;
                copyToClipboard(allInfo, 'All transfer information copied');
              }}
            >
              <Icon name="content-copy" size={20} color="#FFFFFF" />
              <Text style={styles.copyAllText}>Copy All Information</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Payment Methods - Only for SELL USDT */}
        {paymentInfo.type === 'sell' && (
          <>

            {/* QR Code for Wallet */}
            <View style={styles.qrSection}>
              <Text style={styles.sectionTitle}>TRC20 Wallet QR Code</Text>
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
                  Scan QR code to send USDT from your wallet
                </Text>
              </View>
            </View>

            <View style={styles.walletCard}>
              <View style={styles.walletHeader}>
                <Icon name="wallet" size={20} color="#7B68EE" />
                <Text style={styles.walletTitle}>TRC20 Wallet Address</Text>
              </View>
              <View style={styles.walletAddressContainer}>
                <Text style={styles.walletAddress}>TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE</Text>
                <TouchableOpacity
                  style={styles.copyButton}
                  onPress={() => copyToClipboard('TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE', 'Wallet address copied')}
                >
                  <Icon name="content-copy" size={16} color="#4A90E2" />
                </TouchableOpacity>
              </View>

              {/* USDT Amount */}
              <View style={styles.usdtAmountContainer}>
                <View style={styles.usdtAmountHeader}>
                  <Icon name="currency-usd" size={16} color="#7B68EE" />
                  <Text style={styles.usdtAmountLabel}>USDT to Send</Text>
                </View>
                <View style={styles.usdtAmountValueContainer}>
                  <Text style={styles.usdtAmountValue}>{transactionInfo.usdtSell || '0 USDT'}</Text>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyToClipboard(transactionInfo.usdtSell || '0 USDT', 'USDT amount copied')}
                  >
                    <Icon name="content-copy" size={16} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={styles.walletNote}>
                Send {transactionInfo.usdtSell} to this address to complete the transaction
              </Text>
            </View>
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
                    {selectedBank || 'Select bank account'}
                  </Text>
                </View>
              </View>
              <Icon name="chevron-right" size={24} color="#666" />
            </TouchableOpacity>



          </>
        )}

        <View style={styles.noteContainer}>
          <Icon name="information" size={20} color="#666" />
          <Text style={styles.noteText}>
            {paymentInfo.type === 'buy'
              ? 'Please transfer the exact amount and content. Transaction will be processed automatically after payment is received (5-20 minutes).'
              : 'Transaction processing time is 5-20 minutes. Please check the information carefully before confirming.'
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
