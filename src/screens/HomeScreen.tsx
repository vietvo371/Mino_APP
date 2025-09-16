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

  // Nếu số quá dài, hiển thị dạng rút gọn
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(2) + ' B';
  } else if (num >= 1000000) {
    return (num / 1000000).toFixed(2) + ' M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(2) + ' K';
  }

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

  const handleNumberPress = (num: string) => {
    if (num === '.' && amount.includes('.')) return;

    const newAmount = amount + num;
    // Kiểm tra định dạng số và giới hạn
    if (/^\d*\.?\d{0,2}$/.test(newAmount)) {
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

        // Limit decimal places
        if (activeTab === 'buy') {
          // VND has no decimal places
          if (!newAmount.includes('.')) {
            setAmount(newAmount);
          }
        } else {
          // USDT maximum 2 decimal places
          setAmount(newAmount);
        }
      }
    }
  };

  const handleDelete = () => {
    setAmount(amount.slice(0, -1));
  };

  const handleShortcutPress = (shortcut: string) => {
    let value = shortcut;
    // Only process K, M for VND
    if (activeTab === 'buy') {
      if (shortcut.endsWith('K')) {
        value = (parseFloat(shortcut.replace('K', '')) * 1000).toString();
      } else if (shortcut.endsWith('M')) {
        value = (parseFloat(shortcut.replace('M', '')) * 1000000).toString();
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

      // Format number by currency type
      if (activeTab === 'buy') {
        // VND round to integer
        setAmount(Math.round(numValue).toString());
      } else {
        // USDT keep original number to continue input
        setAmount(value);
      }
    }
  };

  const handleAction = () => {
    if (!amount || parseFloat(amount) === 0) return;

    // Navigate to payment screen with transaction info
    navigation.navigate('Payment', {
      paymentInfo: {
        type: activeTab,
        amount: amount,
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
              <Text style={styles.amountZero}>{amount || '0'}</Text>
              <Text style={styles.amountLabel}>{activeTab === 'buy' ? 'VND' : 'USDT'}</Text>
            </View>

            {/* Exchange Rate */}
            <View style={styles.exchangeContainer}>
              <Text style={styles.exchangeAmount}>
                ≈ {amount ? (
                  activeTab === 'buy' 
                    ? `${(parseFloat(amount) / binanceRate).toFixed(2)} USDT`
                    : `${(parseFloat(amount) * binanceRate).toLocaleString('vi-VN')} VND`
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
              {['300K', '2M', '8M', '20M'].map((amount, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.quickAmountButton}
                  onPress={() => handleShortcutPress(amount)}
                >
                  <Text style={styles.quickAmountText}>đ{amount}</Text>
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
            (!amount || parseFloat(amount) === 0) && styles.confirmButtonDisabled
          ]}
          onPress={handleAction}
          disabled={!amount || parseFloat(amount) === 0}
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
    fontSize: wp("20%"),
    fontWeight: '300',
    color: '#000000',
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