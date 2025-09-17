import React, { useState } from 'react';
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

const { width } = Dimensions.get('window');

// Mock data for transaction history
const MOCK_TRANSACTIONS = {
  pending: [
    {
      id: '1',
      type: 'buy',
      amount: '1000000',
      usdt: '40.82',
      exchangeRate: '24,500',
      status: 'pending',
      date: '13/03/2024',
      time: '15:30',
      transactionId: 'MINO123456',
      fee: '5,000 VND (0.5%)',
      totalAmount: '1,005,000 VND',
      transferInfo: {
        bankName: 'BIDV',
        accountNumber: '963336984884401',
        accountName: 'BAOKIM CONG TY CO PHAN THUONG MAI DIEN TU BAO KIM',
        transferContent: 'Lien ket vi Baokim',
        amount: '1,005,000',
      },
    },
    {
      id: '2',
      type: 'sell',
      amount: '2450000',
      usdt: '100',
      exchangeRate: '24,500',
      status: 'pending',
      date: '13/03/2024',
      time: '14:20',
      transactionId: 'MINO123457',
      fee: '12,250 VND (0.5%)',
      totalAmount: '2,437,750 VND',
      receiveAddress: 'TQn9Y2khEsLJW1ChVWFMSMeRDow5KcbLSE',
      bankAccount: 'Vietcombank - 1234567890',
    },
  ],
  success: [
    {
      id: '3',
      type: 'buy',
      amount: '12250000',
      usdt: '500',
      exchangeRate: '24,500',
      status: 'completed',
      date: '12/03/2024',
      time: '18:45',
    },
    {
      id: '4',
      type: 'sell',
      amount: '4900000',
      usdt: '200',
      exchangeRate: '24,500',
      status: 'completed',
      date: '12/03/2024',
      time: '10:15',
    },
    {
      id: '5',
      type: 'buy',
      amount: '5000000',
      usdt: '204.08',
      exchangeRate: '24,500',
      status: 'completed',
      date: '11/03/2024',
      time: '16:20',
    },
  ],
  fail: [
    {
      id: '6',
      type: 'sell',
      amount: '1000000',
      usdt: '40.82',
      exchangeRate: '24,500',
      status: 'failed',
      date: '10/03/2024',
      time: '09:15',
    },
    {
      id: '7',
      type: 'buy',
      amount: '2500000',
      usdt: '102.04',
      exchangeRate: '24,500',
      status: 'failed',
      date: '09/03/2024',
      time: '11:30',
    },
  ],
};

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

  const handleTimeFilterPress = (filterId: string) => {
    setSelectedTimeFilter(filterId);
  };

  const handleFilterConfirm = () => {
    // Handle data filtering here
    setShowFilterModal(false);
  };

  const renderTransaction = (transaction: any) => {
    const isBuy = transaction.type === 'buy';
    const amount = isBuy 
      ? `${transaction.usdt} USDT`
      : `${parseInt(transaction.amount).toLocaleString('vi-VN')} VND`;
    const exchangeAmount = isBuy
      ? `${parseInt(transaction.amount).toLocaleString('vi-VN')} VND`
      : `${transaction.usdt} USDT`;

    return (
      <TouchableOpacity
        key={transaction.id}
        style={styles.transactionItem}
        onPress={() => {
          // Chỉ cho phép pending transactions vào detail
          if (transaction.status === 'pending') {
            navigation.navigate('DetailHistory', { transaction });
          } else {
            Alert.alert(
              'Transaction Detail',
              'Only pending transactions can be viewed in detail.',
              [{ text: 'OK' }]
            );
          }
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
                  {transaction.date} • {transaction.time}
                </Text>
              </View>
            </View>
            <View style={styles.statusContainer}>
              <View style={[
                styles.statusDot,
                { 
                  backgroundColor: transaction.status === 'completed' ? '#34C759' : 
                                  transaction.status === 'failed' ? '#FF3B30' : '#FF9500' 
                }
              ]} />
              <Text style={[
                styles.transactionStatus,
                { 
                  color: transaction.status === 'completed' ? '#34C759' : 
                        transaction.status === 'failed' ? '#FF3B30' : '#FF9500' 
                }
              ]}>
                {transaction.status === 'completed' ? 'Success' : 
                 transaction.status === 'failed' ? 'Failed' : 'Pending'}
              </Text>
            </View>
          </View>

          <View style={styles.amountContainer}>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Amount:</Text>
              <Text style={[styles.amountValue, { color: isBuy ? '#4A90E2' : '#7B68EE' }]}>
                {amount}
              </Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Exchange:</Text>
              <Text style={styles.exchangeValue}>{exchangeAmount}</Text>
            </View>
            <View style={styles.amountRow}>
              <Text style={styles.amountLabel}>Rate:</Text>
              <Text style={styles.exchangeRateValue}>
                {transaction.exchangeRate} VND/USDT
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const getCurrentTransactions = () => {
    return MOCK_TRANSACTIONS[activeTab];
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Transaction History</Text>
        <TouchableOpacity 
          style={styles.filterButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Icon name="filter-variant" size={24} color="#000" />
        </TouchableOpacity>
      </View>

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
              {MOCK_TRANSACTIONS.pending.length}
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
              {MOCK_TRANSACTIONS.success.length}
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
              {MOCK_TRANSACTIONS.fail.length}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.transactionList}>
          {getCurrentTransactions().map(renderTransaction)}
        </View>
      </ScrollView>

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
});

export default HistoryScreen;
