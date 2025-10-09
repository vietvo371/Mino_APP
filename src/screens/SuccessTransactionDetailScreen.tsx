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
  Animated,
  Share,
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

type SuccessTransactionDetail = {
  id: string;
  type: 'buy' | 'sell';
  amount: string;
  usdt: string;
  exchangeRate: string;
  status: 1;
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

const SuccessTransactionDetailScreen = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute();
  const params: any = route.params || {};
  const transactionParam = params.transaction as SuccessTransactionDetail | undefined;
  const idTransaction = params.idTransaction as number | undefined;
  const typeParam = params.type as 'buy' | 'sell' | undefined;

  const [transaction, setTransaction] = React.useState<SuccessTransactionDetail | undefined>(transactionParam);
  const [loading, setLoading] = useState<boolean>(!!idTransaction && !transactionParam);
  const [user, setUser] = useState<any>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.95));
  const { showAlert } = useAlert();

  const fetchUser = async () => {
    const user = await getUser();
    setUser(user);
  };

  useEffect(() => {
    console.log('SuccessTransactionDetailScreen', idTransaction, transactionParam);
    if (transactionParam) {
      convertTransaction(transactionParam);
    }
    fetchUser();
    if (!idTransaction) {
      setLoading(false);
    }

    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  React.useEffect(() => {
    const fetchSuccessTransaction = async () => {
      if (!idTransaction || transaction || !user?.email) return;
      setLoading(true);
      try {
        const endpoint = typeParam === 'sell' 
          ? '/client/transaction-success/usdt-vnd' 
          : '/client/transaction-success/vnd-usdt';
        
        const res = await api.post(endpoint, {
          email: user.email,
          id_transaction: idTransaction,
        });
        if (res?.data?.status) {
          console.log('Success transaction res', res.data);
          const d = res.data.data || {};
          convertTransaction(d);
        }
      } catch (err : any) {
        console.log('fetch success transaction error', err.response);
      } finally {
        setLoading(false);
      }
    };
    fetchSuccessTransaction();
  }, [idTransaction, transaction, typeParam, user?.email]);

  const convertTransaction = (transactionData: any) => {
    if (!transactionData) return;
    
    const d = transactionData;
    
    if (typeParam === 'sell') {
      const mapped: SuccessTransactionDetail = {
        id: String(d.id),
        type: 'sell',
        amount: parseFloat(String(d.amount_vnd_real ?? '')).toLocaleString('vi-VN'),
        usdt: String(d.amount_usdt ?? ''),
        exchangeRate: parseFloat(String(d.rate ?? '')).toLocaleString('vi-VN'),
        status: 1,
        date: d.created_at ? new Date(d.created_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
        time: d.created_at ? new Date(d.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        transactionId: d.transaction_hash || '',
        fee: `${(d.fee_vnd ?? 0).toLocaleString('vi-VN')} VND`,
        totalAmount: `${(d.amount_vnd_real ?? 0).toLocaleString('vi-VN')} VND`,
        receiveAddress: d.address || undefined,
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
    } else {
      const mapped: SuccessTransactionDetail = {
        id: String(d.id),
        type: 'buy',
        amount: parseFloat(String(d.amount_vnd ?? '')).toLocaleString('vi-VN'),
        usdt: String(d.amount_usdt ?? ''),
        exchangeRate: parseFloat(String(d.rate ?? '')).toLocaleString('vi-VN'),
        status: 1,
        date: d.created_at ? new Date(d.created_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
        time: d.created_at ? new Date(d.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        transactionId: d.transaction_hash || '',
        fee: `${(d.fee_vnd ?? 0).toLocaleString('vi-VN')} VND`,
        totalAmount: `${(d.amount_vnd_real ?? 0).toLocaleString('vi-VN')} VND`,
        qrPayload: d.transaction_hash || undefined,
        createdAt: d.created_at || undefined,
        receiveAddress: d.address || undefined,
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
      return createdAt;
    }
  };

  const copyToClipboard = async (text: string, message: string) => {
    try {
      await Clipboard.setString(text);
      showAlert(`✅ ${t('successTransaction.copied')}`, message, [{ text: t('common.confirm') }]);
    } catch (error) {
      showAlert(`❌ ${t('common.error')}`, t('successTransaction.unableToCopy'));
    }
  };

  const shareTransaction = async () => {
    if (!transaction) return;
    
    const shareContent = `🎉 Transaction Successful!\n\n${transaction.type === 'buy' ? '📈 Buy USDT' : '📉 Sell USDT'}\n💰 Amount: ${transaction.usdt} USDT\n💵 Total: ${transaction.totalAmount}\n🕒 Time: ${transaction.createdAt ? formatCreatedAt(transaction.createdAt) : `${transaction.date} • ${transaction.time}`}\n🔗 TX ID: ${transaction.transactionId}`;
    
    try {
      await Share.share({
        message: shareContent,
        title: 'Transaction Details',
      });
    } catch (error) {
      console.log('Share error:', error);
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
            <Icon name="arrow-left" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('successTransaction.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <View style={styles.loadingSpinner}>
              <ActivityIndicator size="large" color="#00D4AA" />
            </View>
            <Text style={styles.loadingText}>{t('successTransaction.loadingDetails')}</Text>
            <Text style={styles.loadingSubtext}>{t('successTransaction.pleaseWait')}</Text>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <View style={styles.errorIconContainer}>
              <Icon name="alert-circle-outline" size={64} color="#FF6B6B" />
            </View>
            <Text style={styles.errorText}>{t('successTransaction.transactionNotFound')}</Text>
            <Text style={styles.errorSubtext}>{t('successTransaction.transactionDeleted')}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={() => (navigation as any).navigate('MainTabs', { screen: 'History' })}
            >
              <Text style={styles.retryButtonText}>{t('successTransaction.backToHistory')}</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  const isBuy = transaction.type === 'buy';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation as any).navigate('MainTabs', { screen: 'History' })}
        >
          <Icon name="arrow-left" size={24} color="#1A1A1A" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isBuy ? t('successTransaction.buyUsdtSuccess') : t('successTransaction.sellUsdtSuccess')}
        </Text>
        <View style={styles.headerRight} />
      </View>

      <Animated.View 
        style={[
          styles.animatedContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Success Status Card */}
          <View style={styles.successStatusCard}>
            <View style={styles.successIconContainer}>
              <View style={styles.successIconBackground}>
                <Icon name="check-circle" size={32} color="#00D4AA" />
              </View>
              <View style={styles.successRipple1} />
              <View style={styles.successRipple2} />
            </View>
            
            <Text style={styles.successTitle}>{t('successTransaction.transactionSuccessful')}</Text>
            <Text style={styles.successSubtitle}>
              {isBuy 
                ? `${t('successTransaction.successfullyBought')} ${transaction.usdt} USDT`
                : `${t('successTransaction.successfullySold')} ${transaction.usdt} USDT ${t('successTransaction.from')} ${transaction.amount} VND`
              }
            </Text>
            
            <View style={styles.transactionMeta}>
              <View style={styles.transactionMetaItem}>
                <Icon name="clock-outline" size={16} color="#6B7280" />
                <Text style={styles.transactionMetaText}>
                  {transaction.createdAt ? formatCreatedAt(transaction.createdAt) : `${transaction.date} • ${transaction.time}`}
                </Text>
              </View>
              <View style={styles.transactionMetaItem}>
                <Icon name="shield-check" size={16} color="#00D4AA" />
                <Text style={[styles.transactionMetaText, { color: '#00D4AA' }]}>
                  {t('successTransaction.verified')}
                </Text>
              </View>
            </View>
          </View>

          {/* Transaction Amount Card */}
          <View style={styles.amountCard}>
            <View style={styles.amountHeader}>
              <Text style={styles.amountLabel}>
                {isBuy ? t('successTransaction.usdtPurchased') : t('successTransaction.vndReceived')}
              </Text>
              <View style={[styles.typeBadge, isBuy ? styles.buyBadge : styles.sellBadge]}>
                <Icon 
                  name={isBuy ? "trending-up" : "trending-down"} 
                  size={14} 
                  color={isBuy ? "#00D4AA" : "#FF6B35"} 
                />
                <Text style={[styles.typeText, isBuy ? styles.buyText : styles.sellText]}>
                  {isBuy ? 'BUY' : 'SELL'}
                </Text>
              </View>
            </View>
            
            <Text style={[styles.amountValue, isBuy ? styles.buyAmount : styles.sellAmount]}>
              {isBuy ? `${transaction.usdt} USDT` : `${transaction.amount} VND`}
            </Text>
            
            <Text style={styles.amountSecondary}>
              {isBuy ? `${t('successTransaction.paid')} ${transaction.amount} VND` : `${t('successTransaction.from')} ${transaction.usdt} USDT`}
            </Text>
          </View>

          {/* Transaction Details */}
          <View style={styles.detailsCard}>
            <Text style={styles.cardTitle}>
              <Icon name="information-outline" size={18} color="#374151" />
              {'  '}{t('successTransaction.transactionDetails')}
            </Text>
            
            <View style={styles.detailsList}>
              <DetailRow
                label={t('successTransaction.transactionId')}
                value={transaction.transactionId && transaction.transactionId.length > 8 
                  ? `${transaction.transactionId.slice(0, 8)}...` 
                  : transaction.transactionId || 'N/A'
                }
                copyable
                onCopy={() => copyToClipboard(transaction.transactionId || '', t('successTransaction.transactionIdCopied'))}
              />
              
              <DetailRow
                label={t('successTransaction.exchangeRate')}
                value={`${transaction.exchangeRate} VND/USDT`}
                icon="trending-up"
              />
              
              <DetailRow
                label={t('successTransaction.transactionFee')}
                value={transaction.fee}
                icon="cash-minus"
              />

              {isBuy ? (
                <>
                  <DetailRow
                    label={t('successTransaction.usdtWalletAddress')}
                    value={transaction.receiveAddress}
                    copyable
                    onCopy={() => copyToClipboard(transaction.receiveAddress!, t('successTransaction.walletAddressCopied'))}
                    truncate
                  />
                  <DetailRow
                    label={t('successTransaction.amountPaid')}
                    value={`${transaction.amount} VND`}
                    highlight="negative"
                  />
                  <DetailRow
                    label={t('successTransaction.paymentMethod')}
                    value={t('successTransaction.bankTransfer')}
                    icon="bank"
                  />
                </>
              ) : (
                <>
                  <DetailRow
                    label={t('successTransaction.usdtWalletAddress')}
                    value={transaction.receiveAddress}
                    copyable
                    onCopy={() => copyToClipboard(transaction.receiveAddress!, t('successTransaction.walletAddressCopied'))}
                    truncate
                  />
                  <DetailRow
                    label={t('successTransaction.bankAccount')}
                    value={transaction.transferInfo?.bankName}
                    copyable
                    onCopy={() => copyToClipboard(transaction.transferInfo!.bankName, t('successTransaction.bankNameCopied'))}
                  />
                  <DetailRow
                    label={t('successTransaction.accountNumber')}
                    value={transaction.transferInfo?.accountNumber}
                    copyable
                    onCopy={() => copyToClipboard(transaction.transferInfo!.accountNumber, t('successTransaction.accountNumberCopied'))}
                  />
                </>
              )}
            </View>
            
            <View style={styles.totalSection}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  {isBuy ? t('successTransaction.totalPaid') : t('successTransaction.totalReceived')}
                </Text>
                <Text style={[styles.totalValue, isBuy ? styles.totalNegative : styles.totalPositive]}>
                  {transaction.totalAmount}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={[styles.totalLabel, { fontSize: wp('3.5%'), color: '#6B7280' }]}>
                  {isBuy ? t('successTransaction.includingFee') : t('successTransaction.afterFee')}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

// Detail Row Component
const DetailRow = ({ 
  label, 
  value, 
  copyable = false, 
  onCopy, 
  icon, 
  truncate = false,
  highlight 
}: {
  label: string;
  value?: string;
  copyable?: boolean;
  onCopy?: () => void;
  icon?: string;
  truncate?: boolean;
  highlight?: 'positive' | 'negative';
}) => {
  const displayValue = value || 'N/A';
  const truncatedValue = truncate && value && value.length > 20 
    ? `${value.slice(0, 8)}...${value.slice(-8)}`
    : displayValue;

  return (
    <View style={styles.detailRow}>
      <View style={styles.detailLeft}>
        {icon && <Icon name={icon} size={16} color="#6B7280" style={styles.detailIcon} />}
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <View style={styles.detailRight}>
        <Text style={[
          styles.detailValue,
          highlight === 'positive' && styles.positiveValue,
          highlight === 'negative' && styles.negativeValue,
        ]}>
          {truncatedValue}
        </Text>
        {copyable && value && (
          <TouchableOpacity onPress={onCopy} style={styles.copyButton}>
            <Icon name="content-copy" size={16} color="#00D4AA" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  headerTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '700',
    color: '#1A1A1A',
    letterSpacing: 0.3,
  },
  headerRight: {
    width: 40,
  },
  shareButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#E6FFF9',
  },
  animatedContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  loadingSpinner: {
    marginBottom: 24,
  },
  loadingText: {
    fontSize: wp('4.2%'),
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  loadingSubtext: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorIconContainer: {
    marginBottom: 24,
  },
  errorText: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: wp('4.5%'),
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#00D4AA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: wp('3.8%'),
    fontWeight: '600',
  },
  successStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    marginTop: 20,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#00D4AA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E6FFF9',
  },
  successIconContainer: {
    position: 'relative',
    marginBottom: 24,
  },
  successIconBackground: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#E6FFF9',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  successRipple1: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#00D4AA',
    opacity: 0.1,
    top: -12,
    left: -12,
    zIndex: 1,
  },
  successRipple2: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#00D4AA',
    opacity: 0.05,
    top: -24,
    left: -24,
    zIndex: 0,
  },
  successTitle: {
    fontSize: wp('5.5%'),
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: wp('4%'),
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: wp('5%'),
  },
  transactionMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  transactionMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionMetaText: {
    fontSize: wp('3.3%'),
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  amountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  amountHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  amountLabel: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    fontWeight: '500',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  buyBadge: {
    backgroundColor: '#E6FFF9',
  },
  sellBadge: {
    backgroundColor: '#FFF2E6',
  },
  typeText: {
    fontSize: wp('3%'),
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  buyText: {
    color: '#00D4AA',
  },
  sellText: {
    color: '#FF6B35',
  },
  amountValue: {
    fontSize: wp('6.5%'),
    fontWeight: '800',
    marginBottom: 8,
  },
  buyAmount: {
    color: '#00D4AA',
  },
  sellAmount: {
    color: '#FF6B35',
  },
  amountSecondary: {
    fontSize: wp('4%'),
    color: '#9CA3AF',
    fontWeight: '500',
  },
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: wp('4.2%'),
    fontWeight: '700',
    color: '#374151',
    marginBottom: 20,
    textAlign: 'center',
  },
  detailsList: {
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  detailLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailIcon: {
    marginRight: 8,
  },
  detailLabel: {
    fontSize: wp('3.5%'),
    color: '#6B7280',
    fontWeight: '500',
  },
  detailRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  detailValue: {
    fontSize: wp('3.5%'),
    color: '#374151',
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  positiveValue: {
    color: '#00D4AA',
  },
  negativeValue: {
    color: '#FF6B35',
  },
  copyButton: {
    padding: 8,
    marginLeft: 8,
    borderRadius: 6,
    backgroundColor: '#E6FFF9',
  },
  totalSection: {
    borderTopWidth: 2,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: wp('4.2%'),
    fontWeight: '700',
    color: '#374151',
  },
  totalValue: {
    fontSize: wp('4.5%'),
    fontWeight: '800',
  },
  totalPositive: {
    color: '#00D4AA',
  },
  totalNegative: {
    color: '#FF6B35',
  },
  noteCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  noteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  noteTitle: {
    fontSize: wp('3.8%'),
    fontWeight: '600',
    color: '#92400E',
    marginLeft: 8,
  },
  noteText: {
    fontSize: wp('3.3%'),
    color: '#92400E',
    lineHeight: wp('4.5%'),
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 40,
  },
});

export default SuccessTransactionDetailScreen;
