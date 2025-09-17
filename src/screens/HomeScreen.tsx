import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { StackScreen } from '../navigation/types';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const { width } = Dimensions.get('window');

// Giả lập giá Binance
const MOCK_BINANCE_RATE = 24500;

const MAX_VND_AMOUNT = 999999999999; // 1 tỷ VND
const MAX_USDT_AMOUNT = 999999.99; // 1 triệu USDT

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

const HomeScreen: StackScreen<'Home'> = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('');
  const [binanceRate] = useState(26389);

  // Function to format amount with commas for display
  const formatAmountForDisplay = (amount: string) => {
    if (!amount || amount === '0') return '0';
    
    // Remove existing commas
    const cleanAmount = amount.replace(/,/g, '');
    
    // Add commas for thousands separator
    if (activeTab === 'buy') {
      // For VND, add commas every 3 digits from right
      return cleanAmount.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    } else {
      // For USDT, keep decimal places but add commas for integer part
      const parts = cleanAmount.split('.');
      if (parts.length === 2) {
        return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '.' + parts[1];
      }
      return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
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
    
    // Kiểm tra định dạng số theo loại tiền tệ
    let isValidFormat = false;
    if (activeTab === 'buy') {
      // VND: chỉ cho phép số nguyên
      isValidFormat = /^\d+$/.test(newAmount);
    } else {
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

  const handleAction = () => {
    const cleanAmount = amount.replace(/,/g, '');
    if (!cleanAmount || parseFloat(cleanAmount) === 0) return;

    // Navigate to payment screen with transaction info
    navigation.navigate('Payment', {
      paymentInfo: {
        type: activeTab,
        amount: cleanAmount,
        rate: binanceRate,
      }
    });
  };

  return (
    <SafeAreaView style={styles.container}>
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
            VND → USDT
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
            USDT → VND
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-variant" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContent}>
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
              <Text style={styles.amountLabel}>{activeTab === 'buy' ? 'VND' : 'USDT'}</Text>
            </View>

            {/* Exchange Rate */}
            <View style={styles.exchangeContainer}>
              <Text style={styles.exchangeAmount}>
                ≈ {amount ? (
                  activeTab === 'buy' 
                    ? `${(parseFloat(amount.replace(/,/g, '')) / binanceRate).toFixed(2)} USDT`
                    : `${(parseFloat(amount.replace(/,/g, '')) * binanceRate).toLocaleString('vi-VN')} VND`
                ) : (
                  activeTab === 'buy' ? '0 USDT' : '0 VND'
                )}
              </Text>
              <Text style={styles.exchangeRate}>1 USDT = {binanceRate.toLocaleString('vi-VN')} VND</Text>
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
                  key={index}
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
                  key={index}
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

        {/* Confirm Button - Outside ScrollView to stay fixed at bottom */}
        <TouchableOpacity 
          style={[
            styles.confirmButton,
            (!amount || parseFloat(amount.replace(/,/g, '')) === 0) && styles.confirmButtonDisabled
          ]}
          onPress={handleAction}
          disabled={!amount || parseFloat(amount.replace(/,/g, '')) === 0}
        >
          <Text style={styles.confirmButtonText}>
            {activeTab === 'buy' ? 'Buy USDT' : 'Sell USDT'}
          </Text>
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
  exchangeAmount: {
    fontSize: wp("5%"),
    color: '#666',
    marginBottom: 4,
  },
  exchangeRate: {
    fontSize: wp("4%"),
    color: '#666',
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
});

export default HomeScreen;