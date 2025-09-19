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
  Image,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute, useFocusEffect } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import QRCode from '../component/QRCode';
import api from '../utils/Api';
import SelectCustom from '../component/SelectCustom';
import { getUser } from '../utils/TokenManager';

// API endpoint: sẽ dùng api.get('/client/exchange/rate')

// Fallback rate nếu API fail
const FALLBACK_RATE = 24500;

// Transaction fee percentage fallback (sẽ được cập nhật từ API)
const TRANSACTION_FEE_PERCENTAGE = 0.5; // %

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

type Wallet = {
  id: number;
  name: string;
  address: string;
  isDefault: boolean;
  createdAt: string;
};

type BankAccount = {
  id: number;
  bank: string;
  code: string;
  logo: string;
  bankId: number;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  createdAt: string;
};

const PaymentScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const paymentInfo = (route.params as any)?.paymentInfo as PaymentInfo;
  const [selectedBank, setSelectedBank] = useState('');
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [selectedReceiveTRC20, setSelectedReceiveTRC20] = useState('');
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');
  const [currentRate, setCurrentRate] = useState<number>(paymentInfo.rate || FALLBACK_RATE);
  const [secondsLeft, setSecondsLeft] = useState<number>(20);
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [feePercent, setFeePercent] = useState<number>(TRANSACTION_FEE_PERCENTAGE);
  const isFetchingRef = useRef<boolean>(false);
  const transactionIdRef = useRef<string>(`MINO${Date.now().toString().slice(-6)}`);
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [banks, setBanks] = useState<{ [key: number]: { name: string; code: string; logo: string; } }>({});
  const [user, setUser] = useState<any>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const fetchUser = async () => {
    const user = await getUser();
    setUser(user);
  };

  // Initialize all required data
  const initializeData = async () => {
    setIsInitialLoading(true);
    try {
      // Fetch user data
      await fetchUser();
      
      // Fetch exchange rate
      await fetchExchangeRate();
      
      // Fetch wallets for buy USDT
      if (paymentInfo.type === 'buy') {
        await fetchWallets();
      }
      
      // Fetch banks and bank accounts for sell USDT
      if (paymentInfo.type === 'sell') {
        await fetchBanks();
        await fetchBankAccounts();
      }
      
    } catch (error) {
      console.log('Error initializing data:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    initializeData();
  }, []);
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
      return () => { };
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

  // Fetch TRC20 wallets to allow inline selection
  const fetchWallets = async () => {
    try {
      const res = await api.get('/client/wallet/data');
      if (res?.data?.status) {
        const list: Wallet[] = (res.data.data || []).map((w: any) => ({
          id: w.id,
          name: w.name,
          address: w.address_wallet,
          isDefault: w.is_default === 1,
          createdAt: w.created_at,
        }));
        setWallets(list);

        // If no selection yet → use default wallet
        const def = list.find((x) => x.isDefault);
        if (!selectedWalletId && def) {
          setSelectedWalletId(String(def.id));
          setSelectedReceiveTRC20(def.address);
        }
      }
    } catch (e) {
      // ignore; keep mock/default
    }
  };

  // Fetch banks data to get bank names and logos
  const fetchBanks = async () => {
    try {
      const response = await api.get('/client/bank/data-all');
      if (response.data.status) {
        const bankData = response.data.data;
        const bankMap: { [key: number]: { name: string; code: string; logo: string; } } = {};
        bankData.forEach((bank: any) => {
          bankMap[bank.id] = { name: bank.name, code: bank.code, logo: bank.logo };
        });
        setBanks(bankMap);
      }
    } catch (error) {
      console.log('Fetch banks error:', error);
    }
  };

  // Fetch bank accounts for sell USDT
  const fetchBankAccounts = async () => {
    try {
      const res = await api.get('/client/bank/data');
      if (res?.data?.status) {
        const list: BankAccount[] = (res.data.data || []).map((b: any) => {
          const bankMeta = banks[b.id_bank];
          return {
            id: b.id,
            bank: b.bank_name || (bankMeta ? bankMeta.name : `Bank ${b.id_bank}`),
            code: bankMeta ? bankMeta.code : '',
            logo: bankMeta ? bankMeta.logo : '',
            bankId: b.id_bank,
            accountNumber: b.bank_number,
            accountName: b.name_ekyc,
            isDefault: b.is_default === 1,
            createdAt: b.created_at,
          };
        });
        setBankAccounts(list);

        // If no selection yet → use default bank account
        const def = list.find((x) => x.isDefault);
        if (!selectedBankId && def) {
          setSelectedBankId(String(def.id));
          setSelectedBank(`${def.bank} - ${def.accountNumber}`);
        }
      }
    } catch (e) {
    }
  };

  // Function to fetch rate/fee from backend API
  const fetchExchangeRate = async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setIsLoadingRate(true);

    try {
      const res = await api.get('/client/exchange/rate');
      const data: any = res.data || {};
      const rate = data.rate ?? data.usdt_vnd_rate ?? data.exchange_rate;
      if (rate && !isNaN(parseFloat(String(rate)))) {
        setCurrentRate(parseFloat(String(rate)));
      } else {
        throw new Error('Invalid rate format');
      }
      const feeValue = parseFloat(String(data.fee));
      if (!isNaN(feeValue)) {
        setFeePercent(feeValue);
      }
    } catch (error) {
      console.log('API failed, using fallback rate:', error);
      setCurrentRate(FALLBACK_RATE);
    } finally {
      isFetchingRef.current = false;
      setIsLoadingRate(false);
    }
  };

  // 60s countdown and auto-refresh (only after initial loading)
  useEffect(() => {
    if (!isInitialLoading) {
      setSecondsLeft(60);
      const timer = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // time to refresh
            fetchExchangeRate();
            return 60;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isInitialLoading]);


  const handleConfirm = () => {
    if (paymentInfo.type === 'buy') {
      const walletId = selectedWalletId
        ? parseInt(selectedWalletId, 10)
        : (wallets.find(w => w.isDefault)?.id || undefined);
      if (!walletId) {
        Alert.alert('Notification', 'Please select a TRC20 wallet to receive USDT');
        return;
      }

      const amountNum = parseFloat(String(paymentInfo.amount));
      const usdtAmount = amountNum / currentRate;

      api.post('/client/create-transactions/vnd-usdt', {
        email: user?.email ?? '',
        amount_usdt: usdtAmount,
        wallet_usdt_id: walletId,
      })
        .then((res) => {
          if (res?.data?.status) {
            console.log('res', res.data);
            const idTx = res?.data?.data?.id_transaction;
            if (idTx) {
              (navigation as any).navigate('DetailHistory', { idTransaction: idTx, type: 'buy' });
            } else {
              Alert.alert('Success', res.data.message || 'Created buy transaction successfully.');
            }
          } else {
            Alert.alert('Error', res?.data?.message || 'Failed to create transaction');
          }
        })
        .catch((err) => {
          console.log('Create buy tx error:', err);
          Alert.alert('Error', err?.response?.data?.message || 'Create transaction failed');
        });
    } else {
      // Determine bank account ID: selected one or default
      const bankAccountId = selectedBankId
        ? parseInt(selectedBankId, 10)
        : (bankAccounts.find(b => b.isDefault)?.id || undefined);
      if (!bankAccountId) {
        Alert.alert('Notification', 'Please select a bank account to receive money');
        return;
      }

      const amountNum = parseFloat(String(paymentInfo.amount));
      api.post('/client/create-transactions/usdt-vnd', {
        email: user?.email ?? '',
        amount_usdt: amountNum,
        detail_bank_id: bankAccountId,
      })
        .then((res) => {
          if (res?.data?.status) {
            console.log('Sell USDT response:', res.data);
            const idTx = res?.data?.data?.id_transaction;
            console.log('idTx', idTx);
            if (idTx) {
              (navigation as any).navigate('DetailHistory', { idTransaction: idTx, type: 'sell' });
            } else {
              Alert.alert('Success', res.data.message || 'Created sell transaction successfully.');
            }
          } else {
            Alert.alert('Error', res?.data?.message || 'Failed to create transaction');
          }
        })
        .catch((err) => {
          console.log('Create sell tx error:', err);
          Alert.alert('Error', err?.response?.data?.message || 'Create transaction failed');
        });
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
      const feeAmount = amountNum * (feePercent / 100);
      const totalVND = amountNum + feeAmount;
      const transactionId = transactionIdRef.current;

      return {
        usdtWant: `${usdtAmount} USDT`,
        exchangeRate: `1 USDT = ${currentRate.toLocaleString('vi-VN')} VND`,
        fee: `${feeAmount.toLocaleString('vi-VN')} VND (${feePercent}%)`,
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
      const feeAmount = amountNum * currentRate * (feePercent / 100);
      const receiveAmount = (amountNum * currentRate) - feeAmount;

      return {
        usdtSell: `${paymentInfo.amount} USDT`,
        exchangeRate: `1 USDT = ${currentRate.toLocaleString('vi-VN')} VND`,
        fee: `${feeAmount.toLocaleString('vi-VN')} VND (${feePercent}%)`,
        receiveVND: `${receiveAmount.toLocaleString('vi-VN')} VND`,
        sendAmount: `${paymentInfo.amount} USDT`,
        receiveAmount: `${receiveAmount.toLocaleString('vi-VN')} VND`,
        feeDisplay: `${feeAmount.toLocaleString('vi-VN')} VND`,
        total: `${receiveAmount.toLocaleString('vi-VN')} VND`,
      };
    }
  };

  

  const transactionInfo = getTransactionInfo();

  // Show loading screen while initializing data
  if (isInitialLoading) {
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
          <View style={styles.headerRight} />
        </View>
        
        <View style={styles.loadingContainer}>
          <Icon name="loading" size={48} color="#4A90E2" />
          <Text style={styles.loadingText}>Đang tải thông tin giao dịch...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
            <SelectCustom
              label="Select TRC20 Wallet to Receive USDT"
              value={selectedWalletId}
              onChange={(val) => {
                setSelectedWalletId(val);
                const w = wallets.find((x) => String(x.id) === val);
                if (w) setSelectedReceiveTRC20(w.address);
              }}
              options={wallets.map((w) => ({
                label: w.name,
                value: String(w.id),
                subtitle: w.address,
                searchText: `${w.name} ${w.address}`,
              }))}
              placeholder={selectedReceiveTRC20 ? selectedReceiveTRC20 : 'Select TRC20 wallet (default if none)'}
              searchable
              searchPlaceholder="Search wallet by name or address..."
              containerStyle={{ marginBottom: 12 }}
            />

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

        {/* Bank Account Selection for Sell USDT */}
        {paymentInfo.type === 'sell' && (
          <>
            <SelectCustom
              label="Select Bank Account to Receive Money"
              value={selectedBankId}
              onChange={(val) => {
                setSelectedBankId(val);
                const b = bankAccounts.find((x) => String(x.id) === val);
                if (b) setSelectedBank(`${b.bank} - ${b.accountNumber}`);
              }}
              options={bankAccounts.map((b) => ({
                label: b.bank,
                value: String(b.id),
                iconUrl: b.logo,
                subtitle: `${b.accountNumber} - ${b.accountName}`,
                searchText: `${b.bank} ${b.accountNumber} ${b.accountName}`,
              }))}
              placeholder={selectedBank ? selectedBank : 'Select bank account (default if none)'}
              searchable
              searchPlaceholder="Search bank account by name or number..."
              containerStyle={{ marginBottom: 12 }}
            />

            {selectedBank ? (
              <View style={styles.walletCard}>
                <View style={styles.walletHeader}>
                  {(() => {
                    const selectedBankAccount = bankAccounts.find(b => String(b.id) === selectedBankId);
                    return selectedBankAccount?.logo ? (
                      <View style={styles.bankLogoContainer}>
                        <Image
                          source={{ uri: selectedBankAccount.logo }}
                          style={styles.bankLogo}
                          resizeMode="contain"
                        />
                      </View>
                    ) : (
                      <Icon name="bank" size={20} color="#4A90E2" />
                    );
                  })()}
                  <Text style={styles.walletTitle}>Receive Bank Account</Text>
                </View>
                <View style={styles.walletAddressContainer}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.walletAddress, { fontFamily: undefined }]}>
                      {selectedBank}
                    </Text>
                    <Text style={{ color: '#666', marginTop: 4 }}>
                      {bankAccounts.find(b => String(b.id) === selectedBankId)?.accountName || DEFAULT_BANK.accountName}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.copyButton}
                    onPress={() => copyToClipboard(selectedBank, 'Bank info copied')}
                  >
                    <Icon name="content-copy" size={16} color="#4A90E2" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.walletNote}>
                  Money will be transferred to this bank account after your USDT is confirmed.
                </Text>
              </View>
            ) : null}
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
            ((paymentInfo.type === 'buy' && !selectedReceiveTRC20) || (paymentInfo.type === 'sell' && !selectedBankId)) && styles.confirmButtonDisabled
          ]}
          onPress={handleConfirm}
          disabled={(paymentInfo.type === 'buy' && !selectedReceiveTRC20) || (paymentInfo.type === 'sell' && !selectedBankId)}
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
  bankLogoContainer: {
    width: 20,
    height: 20,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#F8F8F8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bankLogo: {
    width: 20,
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
  },
});

export default PaymentScreen;
