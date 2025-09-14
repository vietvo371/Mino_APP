import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/colors';

const TRANSACTIONS = [
  {
    id: '1',
    type: 'deposit',
    amount: '1000',
    status: 'completed',
    date: '13/03/2024',
  },
  {
    id: '2',
    type: 'withdraw',
    amount: '500',
    status: 'completed',
    date: '12/03/2024',
  },
];

const WalletScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ví của tôi</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <Text style={styles.balanceTitle}>Số dư khả dụng</Text>
          <Text style={styles.balanceAmount}>1,234.56 USDT</Text>
          <View style={styles.verifiedTag}>
            <Icon name="check-circle" size={14} color="#34C759" />
            <Text style={styles.verifiedText}>Đã xác thực</Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Deposit')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#4A90E215' }]}>
              <Icon name="arrow-down" size={24} color="#4A90E2" />
            </View>
            <Text style={styles.actionText}>Nạp tiền</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Withdraw')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#7B68EE15' }]}>
              <Icon name="arrow-up" size={24} color="#7B68EE" />
            </View>
            <Text style={styles.actionText}>Rút tiền</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('History')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#FF980015' }]}>
              <Icon name="history" size={24} color="#FF9800" />
            </View>
            <Text style={styles.actionText}>Lịch sử</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Giao dịch gần đây</Text>
            <TouchableOpacity onPress={() => navigation.navigate('History')}>
              <Text style={styles.sectionAction}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.transactionList}>
            {TRANSACTIONS.map(transaction => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionItem}
                onPress={() => {}}
              >
                <View style={[
                  styles.transactionIcon,
                  { backgroundColor: transaction.type === 'deposit' ? '#4A90E215' : '#7B68EE15' }
                ]}>
                  <Icon
                    name={transaction.type === 'deposit' ? 'arrow-down' : 'arrow-up'}
                    size={24}
                    color={transaction.type === 'deposit' ? '#4A90E2' : '#7B68EE'}
                  />
                </View>
                <View style={styles.transactionInfo}>
                  <Text style={styles.transactionTitle}>
                    {transaction.type === 'deposit' ? 'Nạp USDT' : 'Rút USDT'}
                  </Text>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                </View>
                <View style={styles.transactionAmount}>
                  <Text style={[
                    styles.transactionValue,
                    { color: transaction.type === 'deposit' ? '#4A90E2' : '#7B68EE' }
                  ]}>
                    {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount} USDT
                  </Text>
                  <Text style={styles.transactionStatus}>Hoàn thành</Text>
                </View>
              </TouchableOpacity>
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  balanceCard: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  balanceTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    color: '#1C1C1E',
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  sectionAction: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '500',
  },
  transactionList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
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
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 14,
    color: '#8E8E93',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  transactionValue: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  transactionStatus: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
});

export default WalletScreen;