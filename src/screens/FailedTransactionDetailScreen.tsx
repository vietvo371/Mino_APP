import { useAlert } from "../component/AlertCustom";
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  Clipboard,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useRoute } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import { getUser } from '../utils/TokenManager';
import api from '../utils/Api';
import { useTranslation } from '../hooks/useTranslation';

type FailedTransactionDetail = {
  id: string;
  type: 'buy' | 'sell';
  amount: string;
  usdt: string;
  exchangeRate: string;
  status: 2 | 3 | 4; // 2: Failed, 3: Waiting Buy Confirm, 4: Waiting Sell Confirm
  date: string;
  time: string;
  transactionId: string;
  fee: string;
  totalAmount: string;
  receiveAddress?: string;
  bankAccount?: string;
  qrPayload?: string;
  createdAt?: string;
  transferInfo?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    transferContent: string;
    amount: string;
  };
};

const FailedTransactionDetailScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const params: any = route.params || {};
  const transactionParam = params.transaction as FailedTransactionDetail | undefined;
  const idTransaction = params.idTransaction as number | undefined;
  const typeParam = params.type as 'buy' | 'sell' | undefined;

  const [transaction, setTransaction] = React.useState<FailedTransactionDetail | undefined>(transactionParam);
  const [loading, setLoading] = useState<boolean>(!!idTransaction && !transactionParam);
  const [user, setUser] = useState<any>(null);

  const fetchUser = async () => {
    const user = await getUser();
    setUser(user);
  };

  useEffect(() => {
    console.log('FailedTransactionDetailScreen', idTransaction, transactionParam);
    if (transactionParam) {
      convertTransaction(transactionParam);
    }
    fetchUser();
    if (!idTransaction) {
      setLoading(false);
    }
  }, []);

  const convertTransaction = (transactionData: any) => {
    if (!transactionData) return;
    
    const d = transactionData;
    
    if (typeParam === 'sell') {
      // Sell USDT mapping
      const mapped: FailedTransactionDetail = {
        id: String(d.id),
        type: 'sell',
        amount: parseFloat(String(d.amount_vnd_real ?? '')).toLocaleString('vi-VN'), // VND amount that would have been received
        usdt: String(d.amount_usdt ?? ''), // USDT amount that would have been sold
        exchangeRate: parseFloat(String(d.rate ?? '')).toLocaleString('vi-VN'),
        status: d.status || 2, // Use actual status or default to Failed
        date: d.created_at ? new Date(d.created_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
        time: d.created_at ? new Date(d.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        transactionId: d.transaction_hash || '',
        fee: `${(d.fee_vnd ?? 0).toLocaleString('vi-VN')} VND`,
        totalAmount: `${(d.amount_vnd_real ?? 0).toLocaleString('vi-VN')} VND`, // Amount that would have been received
        receiveAddress: d.address || undefined, // TRC20 wallet USDT would have been sent from
        createdAt: d.created_at || undefined,
        transferInfo: {
          bankName: d.bank_name || '',
          accountNumber: d.bank_account || '',
          accountName: d.bank_address || '',
          transferContent: d.transaction_hash || '',
          amount: (d.amount_vnd_real ?? 0).toLocaleString('vi-VN'), // Amount that would have been received
        },
      };
      setTransaction(mapped);
    } else {
      // Buy USDT mapping
      const mapped: FailedTransactionDetail = {
        id: String(d.id),
        type: 'buy',
        amount: parseFloat(String(d.amount_vnd ?? '')).toLocaleString('vi-VN'),
        usdt: String(d.amount_usdt ?? ''),
        exchangeRate: parseFloat(String(d.rate ?? '')).toLocaleString('vi-VN'),
        status: d.status || 2, // Use actual status or default to Failed
        date: d.created_at ? new Date(d.created_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
        time: d.created_at ? new Date(d.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        transactionId: d.transaction_hash || '',
        fee: `${(d.fee_vnd ?? 0).toLocaleString('vi-VN')} VND`,
        totalAmount: `${(d.amount_vnd_real ?? 0).toLocaleString('vi-VN')} VND`,
        qrPayload: d.transaction_hash || undefined,
        createdAt: d.created_at || undefined,
        transferInfo: {
          bankName: d.bank_name || '',
          accountNumber: d.bank_account || '',
          accountName: d.bank_address || '',
          transferContent: d.transaction_hash || '',
          amount: (d.amount_vnd_real ?? 0).toLocaleString('vi-VN'),
        },
      };
      setTransaction(mapped);
    }
  };

  React.useEffect(() => {
    const fetchFailedTransaction = async () => {
      if (!idTransaction || transaction || !user?.email) return;
      setLoading(true);
      try {
        // Determine API endpoint based on transaction type
        const endpoint = typeParam === 'sell' 
          ? '/client/transaction-failed/usdt-vnd' 
          : '/client/transaction-failed/vnd-usdt';
        
        const res = await api.post(endpoint, {
          email: user.email,
          id_transaction: idTransaction,
        });
        if (res?.data?.status) {
          console.log('Failed transaction res', res.data);
          const d = res.data.data || {};
          convertTransaction(d);
        }
      } catch (err : any) {
        console.log('fetch failed transaction error', err.response);
      } finally {
        setLoading(false);
      }
    };
    fetchFailedTransaction();
  }, [idTransaction, transaction, typeParam, user?.email]);

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
      return `${dateStr} • ${timeStr}`;
    } catch (error) {
      console.error('Error formatting createdAt:', error);
      return createdAt; // fallback to original string
    }
  };

  if (!transaction) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => (navigation as any).navigate('MainTabs', { screen: 'History' })}
          >
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('failedTransaction.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>{t('failedTransaction.loadingTransaction')}</Text>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color="#FF3B30" />
            <Text style={styles.errorText}>{t('failedTransaction.transactionNotFound')}</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  const isBuy = transaction.type === 'buy';

  const copyToClipboard = async (text: string, message: string) => {
    try {
      await Clipboard.setString(text);
      showAlert('✅ Copied', message, [{ text: 'OK' }]);
    } catch (error) {
      showAlert('❌ Error', 'Unable to copy. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation as any).navigate('MainTabs', { screen: 'History' })}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isBuy 
            ? (transaction.status === 2 
                ? t('failedTransaction.buyUsdtFailed')
                : t('history.waitingBuyConfirm'))
            : (transaction.status === 2 
                ? t('failedTransaction.sellUsdtFailed')
                : t('history.waitingSellConfirm'))
          }
        </Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Failed Status Card */}
        <View style={[
          styles.failedStatusCard,
          {
            backgroundColor: transaction.status === 2 ? '#FFF8F8' : '#FFFBF5',
            borderColor: transaction.status === 2 ? '#FF3B30' : '#FF9500',
          }
        ]}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIcon, { 
              backgroundColor: transaction.status === 2 ? '#FFEBEE' : '#FFF4E6'
            }]}>
              <Icon 
                name={transaction.status === 2 ? "close-circle" : "clock-outline"}
                size={24} 
                color={transaction.status === 2 ? "#FF3B30" : "#FF9500"}
              />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.transactionType}>
                {isBuy 
                  ? (transaction.status === 2 
                      ? t('failedTransaction.buyUsdtFailed')
                      : t('history.waitingBuyConfirm'))
                  : (transaction.status === 2 
                      ? t('failedTransaction.sellUsdtFailed')
                      : t('history.waitingSellConfirm'))
                }
              </Text>
              <Text style={styles.transactionDate}>
                {transaction.createdAt ? formatCreatedAt(transaction.createdAt) : `${transaction.date} • ${transaction.time}`}
              </Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { 
              backgroundColor: transaction.status === 2 ? '#FF3B30' : '#FF9500'
            }]} />
            <Text style={[styles.statusText, { 
              color: transaction.status === 2 ? '#FF3B30' : '#FF9500'
            }]}>
              {transaction.status === 2 
                ? t('history.failed')
                : (transaction.status === 3 
                    ? t('history.waitingBuyConfirm')
                    : t('history.waitingSellConfirm'))
              }
            </Text>
          </View>
        </View>

        {/* Transaction Info */}
        <View style={[
          styles.failedInfoCard,
          {
            backgroundColor: transaction.status === 2 ? '#FFF8F8' : '#FFFBF5',
            borderColor: transaction.status === 2 ? '#FF3B30' : '#FF9500',
          }
        ]}>
          <Text style={styles.cardTitle}>{t('failedTransaction.transactionInformation')}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('successTransaction.transactionId')}</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>
                {transaction.transactionId && transaction.transactionId.length > 16 
                  ? `${transaction.transactionId.slice(0, 8)}...${transaction.transactionId.slice(-8)}`
                  : transaction.transactionId || 'N/A'
                }
              </Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(transaction.transactionId || '', t('successTransaction.transactionIdCopied'))}
                style={styles.copyButton}
              >
                <Icon name="content-copy" size={16} color="#4A90E2" />
              </TouchableOpacity>
            </View>
          </View>

          {isBuy ? (
            // Buy USDT - Focus on what user would have received
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('failedTransaction.usdtToReceive')}</Text>
                <Text style={[styles.infoValue, { color: '#FF3B30', fontSize: wp('4.2%'), fontWeight: '600' }]}>
                  {transaction.usdt} USDT
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('failedTransaction.wouldReceiveToWallet')}</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={[styles.infoValue, { color: '#FF3B30', fontSize: wp('3.5%') }]}>
                    {transaction.receiveAddress && transaction.receiveAddress.length > 16 
                      ? `${transaction.receiveAddress.slice(0, 8)}...${transaction.receiveAddress.slice(-8)}`
                      : transaction.receiveAddress || 'N/A'
                    }
                  </Text>
                  {transaction.receiveAddress && (
                    <TouchableOpacity
                      onPress={() => copyToClipboard(transaction.receiveAddress!, t('successTransaction.walletAddressCopied'))}
                      style={styles.copyButton}
                    >
                      <Icon name="content-copy" size={16} color="#4A90E2" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('failedTransaction.amountToPay')}</Text>
                <Text style={styles.infoValue}>
                  {transaction.amount} VND
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('successTransaction.exchangeRate')}</Text>
                <Text style={styles.infoValue}>
                  {transaction.exchangeRate} VND/USDT
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('successTransaction.transactionFee')}</Text>
                <Text style={styles.infoValue}>
                  {transaction.fee}
                </Text>
              </View>

              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.totalLabel}>{t('failedTransaction.totalToPay')}</Text>
                <Text style={[styles.totalValue, { color: '#FF3B30' }]}>
                  {transaction.totalAmount}
                </Text>
              </View>
            </>
          ) : (
            // Sell USDT - Focus on what user would have received
            <>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('failedTransaction.usdtToSell')}</Text>
                <Text style={[styles.infoValue, { color: '#FF3B30', fontSize: wp('4.2%'), fontWeight: '600' }]}>
                  {transaction.usdt} USDT
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('failedTransaction.wouldSellFromWallet')}</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={[styles.infoValue, { color: '#FF3B30', fontSize: wp('3.5%') }]}>
                    {transaction.receiveAddress && transaction.receiveAddress.length > 16 
                      ? `${transaction.receiveAddress.slice(0, 8)}...${transaction.receiveAddress.slice(-8)}`
                      : transaction.receiveAddress || 'N/A'
                    }
                  </Text>
                  {transaction.receiveAddress && (
                    <TouchableOpacity
                      onPress={() => copyToClipboard(transaction.receiveAddress!, t('successTransaction.walletAddressCopied'))}
                      style={styles.copyButton}
                    >
                      <Icon name="content-copy" size={16} color="#4A90E2" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('failedTransaction.amountToReceive')}</Text>
                <Text style={[styles.infoValue, { color: '#FF3B30', fontSize: wp('4.2%'), fontWeight: '600' }]}>
                  {transaction.amount} VND
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('failedTransaction.wouldReceiveToBank')}</Text>
                <View style={styles.infoValueContainer}>
                  <Text style={[styles.infoValue, { color: '#FF3B30', fontSize: wp('3.5%') }]}>
                    {transaction.transferInfo?.bankName || 'N/A'}
                  </Text>
                  {transaction.transferInfo?.bankName && (
                    <TouchableOpacity
                      onPress={() => copyToClipboard(transaction.transferInfo!.bankName, t('successTransaction.bankNameCopied'))}
                      style={styles.copyButton}
                    >
                      <Icon name="content-copy" size={16} color="#4A90E2" />
                    </TouchableOpacity>
                  )}
                </View>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('successTransaction.exchangeRate')}</Text>
                <Text style={styles.infoValue}>
                  {transaction.exchangeRate} VND/USDT
                </Text>
              </View>

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>{t('successTransaction.transactionFee')}</Text>
                <Text style={styles.infoValue}>
                  {transaction.fee}
                </Text>
              </View>

              <View style={styles.divider} />
              
              <View style={styles.infoRow}>
                <Text style={styles.totalLabel}>{t('failedTransaction.totalToReceive')}</Text>
                <Text style={[styles.totalValue, { color: '#FF3B30' }]}>
                  {transaction.totalAmount}
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Failure Reason - Only show for failed transactions */}
        {transaction.status === 2 && (
          <View style={[
            styles.failedInfoCard,
            {
              backgroundColor: transaction.status === 2 ? '#FFF8F8' : '#FFFBF5',
              borderColor: transaction.status === 2 ? '#FF3B30' : '#FF9500',
            }
          ]}>
            <Text style={styles.cardTitle}>{t('failedTransaction.failureReason')}</Text>
            <View style={styles.failureReasonContainer}>
              <Icon name="alert-circle" size={20} color="#FF3B30" />
              <Text style={styles.failureReasonText}>
                {t('failedTransaction.transactionNotCompleted')}
              </Text>
            </View>
            <View style={styles.failureReasonsList}>
              <Text style={styles.failureReasonItem}>{t('failedTransaction.paymentNotReceived')}</Text>
              <Text style={styles.failureReasonItem}>{t('failedTransaction.incorrectAmount')}</Text>
              <Text style={styles.failureReasonItem}>{t('failedTransaction.networkIssues')}</Text>
              <Text style={styles.failureReasonItem}>{t('failedTransaction.invalidDetails')}</Text>
            </View>
          </View>
        )}

        {/* Failed Note */}
        {transaction.status === 2 && (
          <View style={styles.failedNoteContainer}>
            <Icon name="close-circle" size={20} color="#FF3B30" />
            <Text style={[styles.noteText, { color: '#FF3B30' }]}>
              {isBuy 
                ? `${t('failedTransaction.transactionFailed')} ${transaction.usdt} USDT ${t('failedTransaction.toWallet')}`
                : `${t('failedTransaction.transactionFailed')} ${transaction.amount} VND ${t('failedTransaction.toBankAccount')}`
              }
            </Text>
          </View>
        )}
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
    width: 32,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: wp('4%'),
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: wp('3.8%'),
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  failedStatusCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  statusInfo: {
    flex: 1,
  },
  transactionType: {
    fontSize: wp('4.5%'),
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
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: wp('4%'),
    fontWeight: '600',
  },
  failedInfoCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
    textAlign: 'center',
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
    flex: 1,
  },
  infoValue: {
    fontSize: wp('3.8%'),
    color: '#000',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E5EA',
    marginVertical: 16,
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
  failedNoteContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderColor: '#FF3B30',
    borderWidth: 1,
  },
  noteText: {
    flex: 1,
    fontSize: wp('3.5%'),
    marginLeft: 12,
    lineHeight: wp('4.5%'),
  },
  // Failure reason styles
  failureReasonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  failureReasonText: {
    fontSize: wp('3.8%'),
    color: '#FF3B30',
    marginLeft: 8,
    flex: 1,
  },
  failureReasonsList: {
    paddingLeft: 20,
  },
  failureReasonItem: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: 6,
    lineHeight: wp('4.5%'),
  },
});

export default FailedTransactionDetailScreen;
