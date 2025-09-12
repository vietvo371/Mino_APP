import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  RefreshControl,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/colors';
import { componentStyles } from '../theme/components';
import { StackScreen } from '../navigation/types';

const WalletScreen: StackScreen<'Wallet'> = () => {
  const navigation = useNavigation();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={[theme.colors.backgroundDark, theme.colors.secondary]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Wallet</Text>
          <TouchableOpacity
            onPress={() => {}}
            style={styles.headerButton}
          >
            <Icon name="qrcode-scan" size={24} color={theme.colors.textDark} />
          </TouchableOpacity>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={theme.colors.gradientYellow}
            style={styles.balanceGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.balanceHeader}>
              <Text style={styles.balanceLabel}>Total Balance</Text>
              <Icon name="eye-outline" size={24} color={theme.colors.secondary} />
            </View>
            <Text style={styles.balanceAmount}>$12,345.67</Text>
            <View style={styles.balanceFooter}>
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemLabel}>USDT</Text>
                <Text style={styles.balanceItemValue}>10,000.00</Text>
              </View>
              <View style={styles.balanceDivider} />
              <View style={styles.balanceItem}>
                <Text style={styles.balanceItemLabel}>VND</Text>
                <Text style={styles.balanceItemValue}>56,789,000</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Deposit')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.success + '15' }]}>
              <Icon name="arrow-down" size={24} color={theme.colors.success} />
            </View>
            <Text style={styles.actionText}>Deposit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Withdraw')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.error + '15' }]}>
              <Icon name="arrow-up" size={24} color={theme.colors.error} />
            </View>
            <Text style={styles.actionText}>Withdraw</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Transaction')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.info + '15' }]}>
              <Icon name="swap-horizontal" size={24} color={theme.colors.info} />
            </View>
            <Text style={styles.actionText}>Transfer</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('History')}
          >
            <View style={[styles.actionIcon, { backgroundColor: theme.colors.warning + '15' }]}>
              <Icon name="history" size={24} color={theme.colors.warning} />
            </View>
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
        </View>

        {/* Wallet List */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Wallets</Text>
            <TouchableOpacity>
              <Text style={styles.sectionAction}>Add New</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.walletList}>
            {/* USDT Wallet */}
            <View style={styles.walletItem}>
              <View style={styles.walletIcon}>
                <Image
                  source={require('../assets/images/logo.png')}
                  style={styles.walletIconImage}
                />
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>USDT Wallet</Text>
                <Text style={styles.walletAddress}>TRX • 0x1234...5678</Text>
              </View>
              <View style={styles.walletBalance}>
                <Text style={styles.walletAmount}>10,000.00</Text>
                <Text style={styles.walletFiat}>≈ $10,000.00</Text>
              </View>
            </View>

            {/* VND Wallet */}
            <View style={styles.walletItem}>
              <View style={styles.walletIcon}>
                <Image
                  source={require('../assets/images/logo.png')}
                  style={styles.walletIconImage}
                />
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>VND Wallet</Text>
                <Text style={styles.walletAddress}>Bank • **** 5678</Text>
              </View>
              <View style={styles.walletBalance}>
                <Text style={styles.walletAmount}>56,789,000</Text>
                <Text style={styles.walletFiat}>≈ $2,345.67</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.sectionAction}>View All</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionList}>
            {[1, 2, 3].map((_, index) => (
              <View key={index} style={styles.transactionItem}>
                <View style={styles.transactionIcon}>
                  <Icon
                    name={index % 2 === 0 ? 'arrow-down' : 'arrow-up'}
                    size={24}
                    color={index % 2 === 0 ? theme.colors.success : theme.colors.error}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>
                    {index % 2 === 0 ? 'Received USDT' : 'Sent USDT'}
                  </Text>
                  <Text style={styles.transactionDate}>Today, 14:30</Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text
                    style={[
                      styles.transactionValue,
                      { color: index % 2 === 0 ? theme.colors.success : theme.colors.error }
                    ]}
                  >
                    {index % 2 === 0 ? '+' : '-'}1,234.56 USDT
                  </Text>
                  <Text style={styles.transactionFiat}>≈ $1,234.56</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.backgroundDark,
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },

  // Header Styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.bold,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
  },

  // Balance Card Styles
  balanceCard: {
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.yellow,
  },
  balanceGradient: {
    padding: theme.spacing.xl,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  balanceLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamily.medium,
  },
  balanceAmount: {
    fontSize: theme.typography.fontSize['4xl'],
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.lg,
  },
  balanceFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  balanceItem: {
    flex: 1,
  },
  balanceItemLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.secondary + '80',
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: theme.spacing.xs,
  },
  balanceItemValue: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamily.bold,
  },
  balanceDivider: {
    width: 1,
    height: '100%',
    backgroundColor: theme.colors.secondary + '20',
    marginHorizontal: theme.spacing.lg,
  },

  // Quick Actions Styles
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xl,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  actionText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.medium,
  },

  // Section Styles
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.bold,
  },
  sectionAction: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.medium,
  },

  // Wallet List Styles
  walletList: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
  },
  walletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDark,
  },
  walletIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundDark,
    marginRight: theme.spacing.lg,
  },
  walletIconImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: theme.spacing.xs,
  },
  walletAddress: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDarkLight,
    fontFamily: theme.typography.fontFamily.regular,
  },
  walletBalance: {
    alignItems: 'flex-end',
  },
  walletAmount: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.xs,
  },
  walletFiat: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDarkLight,
    fontFamily: theme.typography.fontFamily.regular,
  },

  // Transaction List Styles
  transactionList: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDark,
  },
  transactionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundDark,
    marginRight: theme.spacing.lg,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: theme.spacing.xs,
  },
  transactionDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDarkLight,
    fontFamily: theme.typography.fontFamily.regular,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: theme.typography.fontSize.md,
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.xs,
  },
  transactionFiat: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDarkLight,
    fontFamily: theme.typography.fontFamily.regular,
  },
});

export default WalletScreen;
