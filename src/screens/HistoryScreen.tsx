import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import api from '../utils/Api';
import LoadingOverlay from '../component/LoadingOverlay';

const { width } = Dimensions.get('window');

// Transaction interface based on API response
interface Transaction {
  id: number;
  type: number;
  address: string;
  network: string;
  detail_bank_id: string | null;
  bank_account: string | null;
  rate: number;
  amount_usdt: number;
  amount_vnd: number;
  amount_vnd_real: number;
  fee_percent: number;
  fee_vnd: number;
  transaction_hash: string | null;
  note: string;
  status: number;
  bank_name: string | null;
  bank_address: string | null;
  created_at: string;
}

interface TransactionHistoryResponse {
  status: boolean;
  data: Transaction[];
}



const TIME_FILTERS = [
  { id: '1d', label: '1 Day' },
  { id: '1w', label: '1 Week' },
  { id: '1m', label: '1 Month' },
  { id: '6m', label: '6 Months' },
];

const HistoryScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState<'pending' | 'success' | 'fail'>('pending');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('1w');
  const [selectedStartDate, setSelectedStartDate] = useState('2025-09-06');
  const [selectedEndDate, setSelectedEndDate] = useState('2025-09-13');
  const [selectedMonth, setSelectedMonth] = useState(9);
  const [selectedYear, setSelectedYear] = useState(2025);
  
  // API state management
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsVerification, setNeedsVerification] = useState(false);

  // API call to fetch transaction history
  const fetchTransactionHistory = async () => {
    setLoading(true);
    setError(null);
    setNeedsVerification(false);
    
    try {
      console.log('Fetching transaction history...');
      
      const response = await api.get<TransactionHistoryResponse>('/client/transactions/history');
      
      console.log('Transaction history response:', response.data);
      
      if (response.data.status === false) {
        setNeedsVerification(true);
        return;
      }
      
      setTransactions(response.data.data || []);
      
    } catch (error: any) {
      console.log('Transaction history error:', error);
      
      let errorMessage = 'Failed to fetch transaction history. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load transaction history on component mount
  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  // Reload history whenever this screen gains focus
  useEffect(() => {
    const unsubscribe = (navigation as any).addListener('focus', () => {
      fetchTransactionHistory();
    });
    return unsubscribe;
  }, [navigation]);

  // Format createdAt timestamp to Vietnamese format
  const formatCreatedAt = (createdAt: string) => {
    try {
      const date = new Date(createdAt);
      const dateStr = date.toLocaleDateString('vi-VN');
      const timeStr = date.toLocaleTimeString('vi-VN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      return {
        date: dateStr,
        time: timeStr
      };
    } catch (error) {
      console.error('Error formatting createdAt:', error);
      // fallback to current date/time
      const now = new Date();
      return {
        date: now.toLocaleDateString('vi-VN'),
        time: now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
    }
  };

  const handleTimeFilterPress = (filterId: string) => {
    setSelectedTimeFilter(filterId);
  };

  const handleFilterConfirm = () => {
    // Handle data filtering here
    setShowFilterModal(false);
    // Refresh data with new filters
    fetchTransactionHistory();
  };

  // Helper function to categorize transactions based on status
  const categorizeTransactions = () => {
    const pending = transactions.filter(t => t.status === 0); // pending
    const success = transactions.filter(t => t.status === 1); // completed/success
    const fail = transactions.filter(t => t.status === 2); // failed
    
    return { pending, success, fail };
  };

  const renderTransaction = (transaction: Transaction, index: number) => {
    const isBuy = transaction.type === 1; // 1 = buy, 2 = sell (based on API response)
    
    // Format amounts based on transaction type (matching DetailHistoryScreen logic)
    let amount, exchangeAmount;
    if (isBuy) {
      // Buy USDT: amount = VND to pay, exchangeAmount = USDT to receive
      amount = `${transaction.amount_vnd_real.toLocaleString('vi-VN')} VND`;
      exchangeAmount = `${transaction.amount_usdt} USDT`;
    } else {
      // Sell USDT: amount = VND to receive, exchangeAmount = USDT to sell  
      amount = `${transaction.amount_vnd_real.toLocaleString('vi-VN')} VND`;
      exchangeAmount = `${transaction.amount_usdt} USDT`;
    }
    
    // Use createdAt for date/time display
    const { date, time } = transaction.created_at 
      ? formatCreatedAt(transaction.created_at)
      : formatCreatedAt(new Date().toISOString()); // fallback if no created_at

    return (
      <TouchableOpacity
        key={`${transaction.note}-${transaction.id}-${index}`} // Use note + id + index for unique key
        style={styles.transactionItem}
        onPress={() => {
          // Determine transaction type for navigation
          const transactionType = transaction.type === 1 ? 'buy' : 'sell';
          
          // Navigate to DetailHistory with idTransaction and type
          (navigation as any).navigate('DetailHistory', { 
            idTransaction: transaction.id, 
            type: transactionType 
          });
        }}
        activeOpacity={0.7}
      >
        <View style={styles.transactionContent}>
          <View style={styles.transactionHeader}>
            <View style={styles.transactionTitleContainer}>
              <View style={[styles.iconContainer, { backgroundColor: isBuy ? '#E8F4FD' : '#F0EFFF' }]}>
                <Icon
                  name={isBuy ? 'arrow-down' : 'arrow-up'}
                  size={20}
                  color={isBuy ? '#4A90E2' : '#7B68EE'}
                />
              </View>
              <View>
                <Text style={styles.transactionType}>
                  {isBuy ? 'Buy USDT' : 'Sell USDT'}
                </Text>
                <Text style={styles.transactionDate}>
                  {date} • {time}
                </Text>
              </View>
            </View>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot,
                { 
                  backgroundColor: transaction.status === 1 ? '#34C759' : 
                                  transaction.status === 2 ? '#FF3B30' : '#FF9500' 
                }
              ]} />
              <Text style={[
                styles.transactionStatus,
                { 
                  color: transaction.status === 1 ? '#34C759' : 
                        transaction.status === 2 ? '#FF3B30' : '#FF9500' 
                }
              ]}>
                {transaction.status === 1 ? 'Success' : 
                 transaction.status === 2 ? 'Failed' : 'Pending'}
              </Text>
            </View>
          </View>

          <View style={styles.amountContainer}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>{isBuy ? 'Total to Pay:' : 'Total to Receive:'}</Text>
              <Text style={[styles.amountValue, { color: isBuy ? '#4A90E2' : '#7B68EE' }]}>
                {amount}
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>{isBuy ? 'USDT to Receive:' : 'USDT to Sell:'}</Text>
              <Text style={styles.exchangeValue}>{exchangeAmount}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Exchange Rate:</Text>
              <Text style={styles.exchangeRateValue}>
                {transaction.rate ? transaction.rate.toLocaleString('vi-VN') : '0'} VND/USDT
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Transaction Fee:</Text>
              <Text style={styles.exchangeRateValue}>
                {transaction.fee_vnd ? transaction.fee_vnd.toLocaleString('vi-VN') : '0'} VND ({transaction.fee_percent ? (transaction.fee_percent * 100).toFixed(2) : '0'}%)
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getCurrentTransactions = () => {
    const categorized = categorizeTransactions();
    return categorized[activeTab] || [];
  };

  const renderEmptyState = () => {
    const counts = categorizeTransactions();
    const isPending = activeTab === 'pending';
    const isSuccess = activeTab === 'success';
    const isFail = activeTab === 'fail';

    let title = 'No transactions';
    let description = 'There are no transactions to display.';
    let iconName = 'information-outline';
    let iconColor = '#999999';
    let bgColor = '#F2F2F7';

    if (isPending) {
      title = 'No pending transactions';
      description = 'Pending transactions will appear here.';
      iconName = 'clock-outline';
      iconColor = '#FF9500';
      bgColor = '#FFF4E6';
    } else if (isSuccess) {
      title = 'No successful transactions';
      description = 'Successful transactions will appear here.';
      iconName = 'check-circle-outline';
      iconColor = '#34C759';
      bgColor = '#E8F5E8';
    } else if (isFail) {
      title = 'No failed transactions';
      description = 'Failed transactions will appear here.';
      iconName = 'close-circle-outline';
      iconColor = '#FF3B30';
      bgColor = '#FFEBEE';
    }

    // Only show when the active tab has zero items
    if (getCurrentTransactions().length > 0) return null;

    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: bgColor }]}>
          <Icon name={iconName} size={48} color={iconColor} />
        </View>
        <Text style={styles.emptyTitle}>{title}</Text>
        <Text style={styles.emptyDescription}>{description}</Text>
      </View>
    );
  };

  // Render verification required view
  const renderVerificationRequired = () => (
    <View style={styles.verificationContainer}>
      <View style={styles.verificationIconContainer}>
        <Icon name="shield-check" size={64} color="#FF9500" />
      </View>
      <Text style={styles.verificationTitle}>Xác thực cần thiết</Text>
      <Text style={styles.verificationDescription}>
        Để xem lịch sử giao dịch, bạn cần hoàn thành xác thực:
      </Text>
      <View style={styles.verificationList}>
        <View style={styles.verificationItem}>
          <Icon name="check-circle" size={20} color="#34C759" />
          <Text style={styles.verificationItemText}>Xác thực eKYC</Text>
        </View>
        <View style={styles.verificationItem}>
          <Icon name="check-circle" size={20} color="#34C759" />
          <Text style={styles.verificationItemText}>Xác thực email</Text>
        </View>
        <View style={styles.verificationItem}>
          <Icon name="check-circle" size={20} color="#34C759" />
          <Text style={styles.verificationItemText}>Xác thực số điện thoại</Text>
        </View>
      </View>
      <TouchableOpacity 
        style={styles.verificationButton}
        onPress={() => {
          // Navigate to verification screen or profile
          (navigation as any).navigate('Profile');
        }}
      >
        <Text style={styles.verificationButtonText}>Đi đến xác thực</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <View style={styles.headerButtons}>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={fetchTransactionHistory}
            disabled={loading}
          >
            <Icon name="refresh" size={24} color="#000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Icon name="filter-variant" size={24} color="#000" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Show verification required view if needed */}
      {needsVerification ? (
        renderVerificationRequired()
      ) : (
        <>
          {/* Tab Navigation */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tabButton, 
                activeTab === 'pending' && [styles.tabButtonActive, styles.tabButtonPending]
              ]}
              onPress={() => setActiveTab('pending')}
            >
              <Text style={[
                styles.tabText, 
                activeTab === 'pending' && [styles.tabTextActive, styles.tabTextPending]
              ]}>
                Pending
              </Text>
              <View style={[
                styles.tabBadge, 
                activeTab === 'pending' && [styles.tabBadgeActive, styles.tabBadgePending]
              ]}>
                <Text style={[
                  styles.tabBadgeText, 
                  activeTab === 'pending' && [styles.tabBadgeTextActive, styles.tabBadgeTextPending]
                ]}>
                  {categorizeTransactions().pending.length}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton, 
                activeTab === 'success' && [styles.tabButtonActive, styles.tabButtonSuccess]
              ]}
              onPress={() => setActiveTab('success')}
            >
              <Text style={[
                styles.tabText, 
                activeTab === 'success' && [styles.tabTextActive, styles.tabTextSuccess]
              ]}>
                Success
              </Text>
              <View style={[
                styles.tabBadge, 
                activeTab === 'success' && [styles.tabBadgeActive, styles.tabBadgeSuccess]
              ]}>
                <Text style={[
                  styles.tabBadgeText, 
                  activeTab === 'success' && [styles.tabBadgeTextActive, styles.tabBadgeTextSuccess]
                ]}>
                  {categorizeTransactions().success.length}
                </Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabButton, 
                activeTab === 'fail' && [styles.tabButtonActive, styles.tabButtonFail]
              ]}
              onPress={() => setActiveTab('fail')}
            >
              <Text style={[
                styles.tabText, 
                activeTab === 'fail' && [styles.tabTextActive, styles.tabTextFail]
              ]}>
                Failed
              </Text>
              <View style={[
                styles.tabBadge, 
                activeTab === 'fail' && [styles.tabBadgeActive, styles.tabBadgeFail]
              ]}>
                <Text style={[
                  styles.tabBadgeText, 
                  activeTab === 'fail' && [styles.tabBadgeTextActive, styles.tabBadgeTextFail]
                ]}>
                  {categorizeTransactions().fail.length}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {getCurrentTransactions().length === 0 ? (
              renderEmptyState()
            ) : (
              <View style={styles.transactionList}>
                {getCurrentTransactions().map((transaction, index) => renderTransaction(transaction, index))}
              </View>
            )}
          </ScrollView>
        </>
      )}

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowFilterModal(false)}
              >
                <Icon name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.filterLabel}>Time</Text>
            <View style={styles.timeFilterContainer}>
              {TIME_FILTERS.map((filter) => (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.timeFilterButton,
                    selectedTimeFilter === filter.id && styles.timeFilterButtonActive
                  ]}
                  onPress={() => handleTimeFilterPress(filter.id)}
                >
                  <Text style={[
                    styles.timeFilterText,
                    selectedTimeFilter === filter.id && styles.timeFilterTextActive
                  ]}>
                    {filter.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.dateRangeContainer}>
              <TouchableOpacity style={styles.dateInput}>
                <Text style={styles.dateInputText}>{selectedStartDate}</Text>
              </TouchableOpacity>
              <Text style={styles.dateRangeSeparator}>to</Text>
              <TouchableOpacity style={styles.dateInput}>
                <Text style={styles.dateInputText}>{selectedEndDate}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.monthYearContainer}>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.monthList}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((month) => (
                  <TouchableOpacity
                    key={month}
                    style={[
                      styles.monthButton,
                      selectedMonth === month && styles.monthButtonActive
                    ]}
                    onPress={() => setSelectedMonth(month)}
                  >
                    <Text style={[
                      styles.monthButtonText,
                      selectedMonth === month && styles.monthButtonTextActive
                    ]}>
                      Month {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                style={styles.yearList}
              >
                {[2022, 2023, 2024, 2025, 2026, 2027].map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.yearButton,
                      selectedYear === year && styles.yearButtonActive
                    ]}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text style={[
                      styles.yearButtonText,
                      selectedYear === year && styles.yearButtonTextActive
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.resetButton}
                onPress={() => {
                  setSelectedTimeFilter('1w');
                  setSelectedStartDate('2025-09-06');
                  setSelectedEndDate('2025-09-13');
                  setSelectedMonth(9);
                  setSelectedYear(2025);
                }}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.confirmButton}
                onPress={handleFilterConfirm}
              >
                <Text style={styles.confirmButtonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <LoadingOverlay visible={loading} message="Loading transaction history..." />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: wp('6%'),
    fontWeight: '700',
    color: '#000',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  refreshButton: {
    padding: 8,
  },
  filterButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F8F8',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 4,
    marginBottom: 20,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#FFFFFF',
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
  tabText: {
    fontSize: wp('3.8%'),
    fontWeight: '500',
    color: '#666',
    marginRight: 6,
  },
  tabTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  tabBadge: {
    backgroundColor: '#E5E5EA',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  tabBadgeActive: {
    backgroundColor: '#000',
  },
  tabBadgeText: {
    fontSize: wp('3%'),
    fontWeight: '600',
    color: '#666',
  },
  tabBadgeTextActive: {
    color: '#FFFFFF',
  },
  // Pending Tab Colors
  tabButtonPending: {
    backgroundColor: '#FFF4E6',
  },
  tabTextPending: {
    color: '#FF9500',
  },
  tabBadgePending: {
    backgroundColor: '#FF9500',
  },
  tabBadgeTextPending: {
    color: '#FFFFFF',
  },
  // Success Tab Colors
  tabButtonSuccess: {
    backgroundColor: '#E8F5E8',
  },
  tabTextSuccess: {
    color: '#34C759',
  },
  tabBadgeSuccess: {
    backgroundColor: '#34C759',
  },
  tabBadgeTextSuccess: {
    color: '#FFFFFF',
  },
  // Failed Tab Colors
  tabButtonFail: {
    backgroundColor: '#FFEBEE',
  },
  tabTextFail: {
    color: '#FF3B30',
  },
  tabBadgeFail: {
    backgroundColor: '#FF3B30',
  },
  tabBadgeTextFail: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  transactionList: {
    gap: 12,
  },
  transactionItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  transactionContent: {
    padding: 16,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  transactionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  transactionType: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: wp('3.5%'),
    color: '#666',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  transactionStatus: {
    fontSize: wp('3.5%'),
    fontWeight: '500',
  },
  amountContainer: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 12,
  },
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amountLabel: {
    fontSize: wp('3.5%'),
    color: '#666',
  },
  amountValue: {
    fontSize: wp('4%'),
    fontWeight: '600',
  },
  exchangeValue: {
    fontSize: wp('4%'),
    color: '#000',
  },
  exchangeRateValue: {
    fontSize: wp('4%'),
    color: '#666',
    fontWeight: '500',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: hp('4%'),
    maxHeight: hp('80%'),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  filterLabel: {
    fontSize: wp('4%'),
    fontWeight: '500',
    color: '#000',
    marginBottom: 12,
  },
  timeFilterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeFilterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  timeFilterButtonActive: {
    backgroundColor: '#000',
  },
  timeFilterText: {
    fontSize: wp('3.5%'),
    color: '#666',
  },
  timeFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  dateInputText: {
    fontSize: wp('3.5%'),
    color: '#000',
  },
  dateRangeSeparator: {
    marginHorizontal: 12,
    color: '#666',
  },
  monthYearContainer: {
    marginBottom: 20,
  },
  monthList: {
    marginBottom: 12,
  },
  monthButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  monthButtonActive: {
    backgroundColor: '#000',
  },
  monthButtonText: {
    fontSize: wp('3.5%'),
    color: '#666',
  },
  monthButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  yearList: {
    marginBottom: 12,
  },
  yearButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
  },
  yearButtonActive: {
    backgroundColor: '#000',
  },
  yearButtonText: {
    fontSize: wp('3.5%'),
    color: '#666',
  },
  yearButtonTextActive: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetButton: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    marginRight: 8,
  },
  resetButtonText: {
    fontSize: wp('4%'),
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 8,
    marginLeft: 8,
  },
  confirmButtonText: {
    fontSize: wp('4%'),
    color: '#FFFFFF',
    fontWeight: '500',
  },
  // Verification Error View Styles
  verificationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  verificationIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF4E6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  verificationTitle: {
    fontSize: wp('6%'),
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  verificationDescription: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  verificationList: {
    width: '100%',
    marginBottom: 40,
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    marginBottom: 8,
  },
  verificationItemText: {
    fontSize: wp('4%'),
    color: '#000',
    marginLeft: 12,
    fontWeight: '500',
  },
  verificationButton: {
    backgroundColor: '#FF9500',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  verificationButtonText: {
    fontSize: wp('4.5%'),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Empty states
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: wp('5%'),
    fontWeight: '700',
    color: '#000',
    marginBottom: 6,
  },
  emptyDescription: {
    fontSize: wp('3.8%'),
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 24,
  },
});

export default HistoryScreen;
