import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Alert,
  ScrollView,
  Dimensions,
  Image,
  ActivityIndicator,
} from 'react-native';
import LoadingOverlay from '../component/LoadingOverlay';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { StackScreen } from '../navigation/types';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import api from '../utils/Api';
import { useTranslation } from '../hooks/useTranslation';

const { width } = Dimensions.get('window');

const MAX_VND_AMOUNT = 999999999999; // 1 tỷ VND
const MAX_USDT_AMOUNT = 999999.99; // 1 triệu USDT

// Fallback rate nếu API fail
const FALLBACK_RATE = 26450;

const formatMoney = (amount: string | number) => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0';

  // Giới hạn số chữ số thập phân
  const formatted = num.toLocaleString('vi-VN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0
  });


  return formatted;
};

const formatNumber = (num: string | number) => {
  const value = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(value)) return '0.00';
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

interface UserProfile {
  full_name: string;
  email: string;
  number_phone: string;
  address: string;
  is_ekyc: number;
  is_active: number;
  is_open: number;
  is_level: number;
  is_active_mail: number;
  is_active_phone: number;
}

interface WalletData {
  id: number;
  client_id: number;
  name: string;
  address_wallet: string;
  is_default: number;
  created_at: string;
  updated_at: string;
}

interface BankAccountData {
  id: number;
  id_bank: number;
  name_ekyc: string;
  bank_number: string;
  is_default: number;
  created_at: string;
  updated_at: string;
  bank_name?: string;
  bank_code?: string;
}

const HomeScreen: StackScreen<'Home'> = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [binanceRate, setBinanceRate] = useState(0);
  const [isSwapped, setIsSwapped] = useState(false); // true = nhập số muốn nhận, false = nhập số muốn đổi
  const [countdown, setCountdown] = useState(20); // Countdown 20 giây
  const [isLoadingRate, setIsLoadingRate] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [hasTRC20Wallet, setHasTRC20Wallet] = useState(false);
  const [hasBankAccount, setHasBankAccount] = useState(false);
  const [isLoadingWallets, setIsLoadingWallets] = useState(true);
  const [isLoadingBanks, setIsLoadingBanks] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Function to fetch user profile
  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/client/profile');
      if (response.data.status) {
        setUserProfile(response.data.data);
      }
    } catch (error) {
      console.log('Profile fetch error:', error);
    } finally {
      setIsLoadingProfile(false);
    }
  };

  // Function to check TRC20 wallets
  const fetchTRC20Wallets = async () => {
    try {
      setIsLoadingWallets(true);
      const response = await api.get('/client/wallet/data');
      if (response.data.status) {
        const walletData: WalletData[] = response.data.data;
        setHasTRC20Wallet(walletData.length > 0);
      } else {
        setHasTRC20Wallet(false);
      }
    } catch (error) {
      console.log('Fetch TRC20 wallets error:', error);
      setHasTRC20Wallet(false);
    } finally {
      setIsLoadingWallets(false);
    }
  };

  // Function to check bank accounts
  const fetchBankAccounts = async () => {
    try {
      setIsLoadingBanks(true);
      const response = await api.get('/client/bank/data');
      if (response.data.status) {
        const accountData: BankAccountData[] = response.data.data;
        setHasBankAccount(accountData.length > 0);
      } else {
        setHasBankAccount(false);
      }
    } catch (error) {
      console.log('Fetch bank accounts error:', error);
      setHasBankAccount(false);
    } finally {
      setIsLoadingBanks(false);
    }
  };

  // Function to fetch rate from your backend API
  const fetchExchangeRate = async () => {
    setIsLoadingRate(true);
    
    try {
      const response = await api.get('/client/exchange/rate');
      const data = response.data;
      
      console.log('Exchange rate response:', data);
      
      // API trả về format: { "rate": 26450 }
      if (data.rate && !isNaN(parseFloat(data.rate))) {
        setBinanceRate(parseFloat(data.rate));
        console.log('Rate updated from API:', data.rate);
      } else {
        throw new Error('Invalid rate format');
      }
    } catch (error) {
      // console.log('API failed, using fallback rate:', error);
      setBinanceRate(FALLBACK_RATE);
    } finally {
      setIsLoadingRate(false);
    }
  };

  // Chỉ poll mỗi 20s khi màn hình đang focus
  useFocusEffect(
    React.useCallback(() => {
      // Reset countdown và fetch ngay khi focus
      setCountdown(20);
      fetchExchangeRate();

      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            fetchExchangeRate();
            return 20;
          }
          return prev - 1;
        });
      }, 1000);

      // Cleanup khi màn hình mất focus
      return () => clearInterval(countdownInterval);
    }, [])
  );

  // Initial data loading
  useEffect(() => {
    const loadInitialData = async () => {
      setIsInitialLoading(true);
      try {
        await Promise.all([
          fetchUserProfile(),
          fetchTRC20Wallets(),
          fetchBankAccounts()
        ]);
      } finally {
        setIsInitialLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Refresh profile data when screen comes into focus (e.g., after verification)
  useFocusEffect(
    React.useCallback(() => {
      if (!isInitialLoading) {
        const refreshData = async () => {
          setIsRefreshing(true);
          try {
            // Always refresh wallet and bank data when focusing
            await Promise.all([
              fetchTRC20Wallets(),
              fetchBankAccounts(),
              fetchUserProfile()
            ]);
          } finally {
            setIsRefreshing(false);
          }
        };
        
        refreshData();
      }
    }, [isInitialLoading])
  );

  // Function to format amount with commas for display
  const formatAmountForDisplay = (amount: string) => {
    if (!amount || amount === '0') return '0';
    
    // Remove existing commas
    const cleanAmount = amount.replace(/,/g, '');
    
    // Add commas for thousands separator based on input type
    const isInputtingVND = (activeTab === 'buy' && !isSwapped) || (activeTab === 'sell' && isSwapped);
    const isInputtingUSDT = (activeTab === 'sell' && !isSwapped) || (activeTab === 'buy' && isSwapped);
    
    if (isInputtingVND) {
      // For VND, add commas every 3 digits from right
      return cleanAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else if (isInputtingUSDT) {
      // For USDT, keep decimal places but add commas for integer part
      const parts = cleanAmount.split('.');
      if (parts.length === 2) {
        return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + parts[1];
      }
      return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    
    return cleanAmount;
  };

  // Function to calculate dynamic font size based on amount length
  const getAmountFontSize = (amount: string) => {
    if (!amount || amount === '0') return wp("20%");
    
    // Remove commas and count only digits and decimal point
    const cleanAmount = amount.replace(/,/g, '');
    const length = cleanAmount.length;
    
    // More granular font size adjustment
    if (length <= 6) return wp("20%");
    if (length <= 8) return wp("16%");
    if (length <= 10) return wp("12%");
    if (length <= 12) return wp("10%");
    if (length <= 13) return wp("10%");
    if (length <= 14) return wp("6%");
    return wp("6%");
  };

  const handleNumberPress = (num: string) => {
    if (num === '.' && amount.includes('.')) return;

    // Remove commas from current amount for processing
    const cleanAmount = amount.replace(/,/g, '');
    const newAmount = cleanAmount + num;
    
    // Kiểm tra định dạng số theo loại tiền tệ và chế độ swap
    let isValidFormat = false;
    const isInputtingVND = (activeTab === 'buy' && !isSwapped) || (activeTab === 'sell' && isSwapped);
    const isInputtingUSDT = (activeTab === 'sell' && !isSwapped) || (activeTab === 'buy' && isSwapped);
    
    if (isInputtingVND) {
      // VND: chỉ cho phép số nguyên
      isValidFormat = /^\d+$/.test(newAmount);
    } else if (isInputtingUSDT) {
      // USDT: cho phép tối đa 2 chữ số thập phân
      isValidFormat = /^\d*\.?\d{0,2}$/.test(newAmount);
    }
    
    if (isValidFormat) {
      const numValue = parseFloat(newAmount);
      if (!isNaN(numValue)) {
        // Check limit by transaction type
        const maxAmount = activeTab === 'buy' ? MAX_VND_AMOUNT : MAX_USDT_AMOUNT;
        if (numValue > maxAmount) {
          Alert.alert(
            'Notification',
            activeTab === 'buy'
              ? 'Maximum VND amount is 999,999,999,999'
              : 'Maximum USDT amount is 999,999.99'
          );
          return;
        }

        // Always set the amount, let formatAmountForDisplay handle the formatting
        setAmount(newAmount);
      }
    }
  };

  const handleDelete = () => {
    // Remove commas before processing
    const cleanAmount = amount.replace(/,/g, '');
    const newAmount = cleanAmount.slice(0, -1);
    setAmount(newAmount);
  };

  const handleShortcutPress = (shortcut: string) => {
    let value = shortcut;
    
    if (activeTab === 'buy') {
      // For VND (buy tab) - handle K, M shortcuts
      if (shortcut.endsWith('K')) {
        value = (parseFloat(shortcut.replace('K', '')) * 1000).toString();
      } else if (shortcut.endsWith('M')) {
        value = (parseFloat(shortcut.replace('M', '')) * 1000000).toString();
      }
    } else {
      // For USDT (sell tab) - handle direct USDT amounts
      // The shortcuts are already in USDT format (10, 50, 100, 500)
      // Don't add .00 to allow further input
      const numValue = parseFloat(shortcut);
      if (!isNaN(numValue)) {
        value = numValue.toString();
      }
    }

    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Check limit by transaction type
      const maxAmount = activeTab === 'buy' ? MAX_VND_AMOUNT : MAX_USDT_AMOUNT;
      if (numValue > maxAmount) {
        Alert.alert(
          'Notification',
          activeTab === 'buy'
            ? 'Maximum VND amount is 999,999,999,999'
            : 'Maximum USDT amount is 999,999.99'
        );
        return;
      }

      // Set amount without formatting - let formatAmountForDisplay handle it
      if (activeTab === 'buy') {
        // VND round to integer
        setAmount(Math.round(numValue).toString());
      } else {
        // USDT keep as string to allow further input
        setAmount(value);
      }
    }
  };

  const handleSwap = () => {
    setIsSwapped(!isSwapped);
    setAmount(''); // Clear amount when swapping
  };

  // Check verification status
  const checkVerificationStatus = () => {
    if (!userProfile) return false;
    
    const isEkycVerified = userProfile.is_ekyc === 1;
    const isEmailVerified = userProfile.is_active_mail === 1;
    const isPhoneVerified = userProfile.is_active_phone === 1;
    
    return isEkycVerified && isEmailVerified && isPhoneVerified;
  };

  // Check if user can perform transaction based on tab and requirements
  const canPerformTransaction = () => {
    if (!checkVerificationStatus()) return false;
    
    if (activeTab === 'buy' && !hasTRC20Wallet) return false;
    if (activeTab === 'sell' && !hasBankAccount) return false;
    
    return true;
  };

  // Get button text based on current state
  const getButtonText = () => {
    if (!checkVerificationStatus()) {
      return t('verification.completeVerification');
    }
    
    if (activeTab === 'buy' && !hasTRC20Wallet) {
      return t('home.addWalletRequired');
    }
    
    if (activeTab === 'sell' && !hasBankAccount) {
      return t('home.addBankRequired');
    }
    
    return activeTab === 'buy' ? t('home.buyUsdtButton') : t('home.sellUsdtButton');
  };

  const handleAction = () => {
    const cleanAmount = amount.replace(/,/g, '');
    if (!cleanAmount || parseFloat(cleanAmount) === 0) return;

    // Check verification status before allowing transaction
    if (!checkVerificationStatus()) {
      const missingVerifications = [];
      if (userProfile?.is_ekyc !== 1) missingVerifications.push('eKYC Identity Verification');
      if (userProfile?.is_active_mail !== 1) missingVerifications.push('Email Verification');
      if (userProfile?.is_active_phone !== 1) missingVerifications.push('Phone Verification');
      
      Alert.alert(
        'Verification Required',
        `To buy/sell USDT, you need to complete the following verifications:\n\n• ${missingVerifications.join('\n• ')}\n\nPlease complete all verifications in the Security section.`,
        [
          {
            text: 'Go to Security',
            onPress: () => navigation.navigate('Security' as never)
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return;
    }

    // Check wallet/account requirements based on transaction type
    if (activeTab === 'buy' && !hasTRC20Wallet) {
      Alert.alert(
        'TRC20 Wallet Required',
        'To buy USDT, you need to add a TRC20 wallet address first. Please add your wallet address in the TRC20 Addresses section.',
        [
          {
            text: 'Add TRC20 Wallet',
            onPress: () => navigation.navigate('TRC20Addresses' as never)
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return;
    }

    if (activeTab === 'sell' && !hasBankAccount) {
      Alert.alert(
        'Bank Account Required',
        'To sell USDT, you need to add a bank account first. Please add your bank account in the Bank Accounts section.',
        [
          {
            text: 'Add Bank Account',
            onPress: () => navigation.navigate('BankAccounts' as never)
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
      return;
    }

    let finalAmount = cleanAmount;
    let finalType = activeTab;

    // Xử lý logic swap
    if (isSwapped) {
      if (activeTab === 'buy') {
        // Buy tab + swap: nhập USDT muốn nhận → cần tính VND cần đổi
        const usdtAmount = parseFloat(cleanAmount);
        const vndAmount = (usdtAmount * binanceRate).toString();
        finalAmount = vndAmount;
        finalType = 'buy'; // Vẫn là buy nhưng amount là VND
      } else {
        // Sell tab + swap: nhập VND muốn nhận → cần tính USDT cần đổi
        const vndAmount = parseFloat(cleanAmount);
        const usdtAmount = (vndAmount / binanceRate).toFixed(2);
        finalAmount = usdtAmount;
        finalType = 'sell'; // Vẫn là sell nhưng amount là USDT
      }
    }

    // Navigate to payment screen with transaction info
    navigation.navigate('Payment', {
      paymentInfo: {
        type: finalType,
        amount: finalAmount,
        rate: binanceRate,
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Loading Overlay */}
      <LoadingOverlay 
        visible={isInitialLoading} 
        message={t('common.loading')} 
      />
      {/* Buy/Sell Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'buy' && styles.activeTab]}
          onPress={() => {
            setActiveTab('buy');
            setAmount('');
          }}
        >
          <Text style={[styles.tabText, activeTab === 'buy' && styles.activeTabText]}>
            {t('home.vndToUsdt')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sell' && styles.activeTab]}
          onPress={() => {
            setActiveTab('sell');
            setAmount('');
          }}
        >
          <Text style={[styles.tabText, activeTab === 'sell' && styles.activeTabText]}>
            {t('home.usdtToVnd')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
        {/* Refresh Loading Overlay */}
        <LoadingOverlay 
          visible={isRefreshing} 
          message={t('common.loading')} 
        />

        <ScrollView 
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
          {/* Amount Display */}
          <View style={styles.topSection}>
            <View style={styles.amountContainer}>
              <Text style={[styles.amountZero, { fontSize: getAmountFontSize(amount) }]}>
                {formatAmountForDisplay(amount)}
              </Text>
              <Text style={styles.amountLabel}>
                {isSwapped 
                  ? (activeTab === 'buy' ? 'USDT' : 'VND') 
                  : (activeTab === 'buy' ? 'VND' : 'USDT')
                }
              </Text>
            </View>

            {/* Exchange Rate */}
            <View style={styles.exchangeContainer}>
              <View style={styles.exchangeRow}>
                <Text style={styles.exchangeAmount}>
                  ≈ {amount ? (
                    isSwapped 
                      ? (activeTab === 'buy' 
                          ? `${(parseFloat(amount.replace(/,/g, '')) * binanceRate).toLocaleString('vi-VN')} VND`
                          : `${(parseFloat(amount.replace(/,/g, '')) / binanceRate).toFixed(2)} USDT`
                        )
                      : (activeTab === 'buy' 
                          ? `${(parseFloat(amount.replace(/,/g, '')) / binanceRate).toFixed(2)} USDT`
                          : `${(parseFloat(amount.replace(/,/g, '')) * binanceRate).toLocaleString('vi-VN')} VND`
                        )
                  ) : (
                    isSwapped 
                      ? (activeTab === 'buy' ? '0 VND' : '0 USDT')
                      : (activeTab === 'buy' ? '0 USDT' : '0 VND')
                  )}
                </Text>
                <TouchableOpacity style={styles.swapButton} onPress={handleSwap}>
                  <Icon style={{ color: "black" }} name="swap-horizontal" size={20} color="#666" />
                </TouchableOpacity>
              </View>
              <View style={styles.rateContainer}>
                <Text style={styles.exchangeRate}>
                  1 USDT = {binanceRate.toLocaleString('vi-VN')} VND
                </Text>
                <View style={styles.countdownContainer}>
                  <Text style={styles.countdownText}>
                    Update after: {countdown}s
                  </Text>
                  {isLoadingRate && (
                    <Icon name="loading" size={16} color="#666" />
                  )}
                </View>
              </View>
            </View>
          </View>

          <View style={styles.bottomSection}>
            {/* Quick Amount Buttons */}
            <View style={styles.quickAmountContainer}>
              {(activeTab === 'buy' 
                ? ['300K', '2M', '8M', '20M'] 
                : ['10', '50', '100', '500']
              ).map((amount, index) => (
                <TouchableOpacity
                  key={`quick-${activeTab}-${index}`}
                  style={styles.quickAmountButton}
                  onPress={() => handleShortcutPress(amount)}
                >
                  <Text style={styles.quickAmountText}>
                    {activeTab === 'buy' ? `đ${amount}` : `${amount} USDT`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Number Pad */}
            <View style={styles.numberPad}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, ',', 0].map((num, index) => (
                <TouchableOpacity
                  key={`numpad-${activeTab}-${index}`}
                  style={styles.numberButton}
                  onPress={() => handleNumberPress(num.toString())}
                >
                  <Text style={styles.numberText}>{num}</Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.numberButton, styles.deleteButton]}
                onPress={handleDelete}
              >
                <Icon name="backspace-outline" size={24} color="#666" />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Status Banner or Confirm Button */}
        {(activeTab === 'buy' && !hasTRC20Wallet) || (activeTab === 'sell' && !hasBankAccount) ? (
          // Show warning banner when missing wallet/bank
          <View style={styles.statusBanner}>
            {activeTab === 'buy' && !hasTRC20Wallet && (
              <View style={styles.warningBanner}>
                <Icon name="wallet-outline" size={20} color="#FF9500" />
                <Text style={styles.warningText}>
                  {t('wallet.walletRequiredMessage')}
                </Text>
              </View>
            )}
            {activeTab === 'sell' && !hasBankAccount && (
              <View style={styles.warningBanner}>
                <Icon name="bank-outline" size={20} color="#FF9500" />
                <Text style={styles.warningText}>
                  {t('bank.bankRequiredMessage')}
                </Text>
              </View>
            )}
          </View>
        ) : (
          // Show confirm button when user has required wallet/bank
          <TouchableOpacity 
            style={[
              styles.confirmButton,
              (!amount || parseFloat(amount.replace(/,/g, '')) === 0 || !canPerformTransaction()) && styles.confirmButtonDisabled
            ]}
            onPress={handleAction}
            disabled={!amount || parseFloat(amount.replace(/,/g, '')) === 0 || !canPerformTransaction()}
          >
            <Text style={styles.confirmButtonText}>
              {getButtonText()}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    margin: 16,
    borderRadius: 24,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: '#000000',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  filterButton: {
    padding: 8,
    marginLeft: 8,
  },
  mainContent: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollView: {
    flex: 1,
  },
  topSection: {
    minHeight: hp("30%"),
    marginBottom: hp("3%"),
  },
  bottomSection: {
    paddingBottom: hp("2%"),
  },
  amountContainer: {
    alignItems: 'flex-start',
    marginTop: hp("4%"),
    marginBottom: hp("2%"),
    paddingLeft: 20,
  },
  amountZero: {
    fontWeight: '300',
    color: '#000000',
    // fontSize will be set dynamically
  },
  amountLabel: {
    fontSize: wp("8%"),
    color: '#666',
    marginTop: -8,
  },
  exchangeContainer: {
    alignItems: 'flex-start',
    marginTop: hp("2%"),
    paddingLeft: 20,
  },
  exchangeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingRight: 20,
  },
  exchangeAmount: {
    fontSize: wp("5%"),
    color: '#666',
    marginBottom: 4,
    flex: 1,
  },
  swapButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f1d37e',
    marginLeft: 10,
  },
  rateContainer: {
    flexDirection: 'column',
  },
  exchangeRate: {
    fontSize: wp("4%"),
    color: '#666',
  },
  countdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  countdownText: {
    fontSize: wp("3%"),
    color: '#999',
    marginRight: 8,
  },
  quickAmountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: hp("2%"),
  },
  quickAmountButton: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 8,
    paddingHorizontal: 4,
    marginHorizontal: 4,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  quickAmountText: {
    fontSize: wp("3.5%"),
    color: '#000',
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: hp("2%"),
    paddingHorizontal: 20,
  },
  numberButton: {
    width: '30%',
    aspectRatio: 1.5,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  numberText: {
    fontSize: wp("6%"),
    color: '#000',
  },
  deleteButton: {
    backgroundColor: '#F2F2F7',
    borderWidth: 0,
  },
  confirmButton: {
    backgroundColor: '#000000',
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 20,
    position: 'absolute',
    bottom: -15,
    left: 0,
    right: 0,
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCCCCC',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: wp("4%"),
    fontWeight: '600',
    textAlign: 'center',
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3F3',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
  verificationText: {
    flex: 1,
    fontSize: wp("3.5%"),
    color: '#FF6B6B',
    marginLeft: 8,
    fontWeight: '500',
  },
  verifyButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  verifyButtonText: {
    color: '#FFFFFF',
    fontSize: wp("3%"),
    fontWeight: '600',
  },
  statusBanner: {
    position: 'absolute',
    bottom: -15,
    left: 0,
    right: 0,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF4E6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
  warningText: {
    flex: 1,
    fontSize: wp("3.5%"),
    color: '#FF9500',
    marginLeft: 8,
    fontWeight: '500',
  },
  warningButton: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  warningButtonText: {
    color: '#FFFFFF',
    fontSize: wp("3%"),
    fontWeight: '600',
  },
});

export default HomeScreen;