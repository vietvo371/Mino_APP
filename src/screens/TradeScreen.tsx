import { useAlert } from "../component/AlertCustom";
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';

const TradeScreen = () => {
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState('0');
  const [selectedCoin, setSelectedCoin] = useState('USDT');
  const exchangeRate = 26.389; // Mock exchange rate

  const shortcutAmounts = [
    { label: '300K', value: '300000' },
    { label: '2M', value: '2000000' },
    { label: '8M', value: '8000000' },
    { label: '20M', value: '20000000' },
  ];

  const handleNumberPress = (num: string) => {
    if (amount === '0') {
      setAmount(num);
    } else {
      setAmount(amount + num);
    }
  };

  const handleDelete = () => {
    if (amount.length > 1) {
      setAmount(amount.slice(0, -1));
    } else {
      setAmount('0');
    }
  };

  const handleShortcutPress = (value: string) => {
    setAmount(value);
  };

  const formatNumber = (num: string) => {
    return Number(num).toLocaleString('en-US');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={[theme.colors.primary + '15', theme.colors.white]}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'buy' && styles.activeTab]}
            onPress={() => setActiveTab('buy')}
          >
            <Text style={[styles.tabText, activeTab === 'buy' && styles.activeTabText]}>
              Mua
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'sell' && styles.activeTab]}
            onPress={() => setActiveTab('sell')}
          >
            <Text style={[styles.tabText, activeTab === 'sell' && styles.activeTabText]}>
              Bán
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-variant" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      {/* Coin Selector */}
      <TouchableOpacity style={styles.coinSelector}>
        <Icon name="tether" size={24} color="#26A17B" />
        <Text style={styles.coinText}>{selectedCoin}</Text>
        <Icon name="chevron-down" size={24} color={theme.colors.text} />
      </TouchableOpacity>

      {/* Amount Input */}
      <View style={styles.amountContainer}>
        <Text style={styles.amountPrefix}>đ</Text>
        <Text style={styles.amount}>{formatNumber(amount)}</Text>
        <Text style={styles.currency}>VND</Text>
      </View>

      {/* Exchange Rate */}
      <View style={styles.exchangeRate}>
        <Text style={styles.exchangeText}>₫ {amount} = {(Number(amount) / exchangeRate).toFixed(2)} USDT</Text>
        <Text style={styles.rateText}>1 USDT = {exchangeRate} VND</Text>
      </View>

      {/* Shortcut Amounts */}
      <View style={styles.shortcutContainer}>
        {shortcutAmounts.map((item, index) => (
          <TouchableOpacity
            key={`shortcut-${item.value}-${index}`}
            style={styles.shortcutButton}
            onPress={() => handleShortcutPress(item.value)}
          >
            <Text style={styles.shortcutText}>đ{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Number Pad */}
      <View style={styles.numberPad}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, '.', 0].map((num, index) => (
          <TouchableOpacity
            key={`numpad-${num}-${index}`}
            style={styles.numberButton}
            onPress={() => handleNumberPress(num.toString())}
          >
            <Text style={styles.numberText}>{num}</Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity style={styles.numberButton} onPress={handleDelete}>
          <Icon name="backspace-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.primary + '10',
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.secondary + '10',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.full,
    padding: 4,
  },
  tab: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
  },
  activeTab: {
    backgroundColor: theme.colors.white,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  tabText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textLight,
  },
  activeTabText: {
    color: theme.colors.text,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  coinSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  coinText: {
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  amountPrefix: {
    fontSize: 32,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.textLight,
    marginRight: theme.spacing.xs,
  },
  amount: {
    fontSize: 48,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
  },
  currency: {
    fontSize: 32,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  exchangeRate: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  exchangeText: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  rateText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.regular,
    color: theme.colors.textLight,
  },
  shortcutContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  shortcutButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.full,
    backgroundColor: theme.colors.background,
  },
  shortcutText: {
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.medium,
    color: theme.colors.text,
  },
  numberPad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  numberButton: {
    width: '30%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.white,
    borderRadius: theme.borderRadius.lg,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  numberText: {
    fontSize: 24,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text,
  },
});

export default TradeScreen;
