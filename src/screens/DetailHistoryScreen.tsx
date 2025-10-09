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
import QRCode from '../component/QRCode';
import api from '../utils/Api';
import { getUser } from '../utils/TokenManager';
import { useTranslation } from '../hooks/useTranslation';

type TransactionDetail = {
  id: string;
  type: 'buy' | 'sell';
  amount: string;
  usdt: string;
  exchangeRate: string;
  status: 0 | 1| 2;
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

const DetailHistoryScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const params: any = route.params || {};
  const transactionParam = params.transaction as TransactionDetail | undefined;
  const idTransaction = params.idTransaction as number | undefined;
  const typeParam = params.type as 'buy' | 'sell' | undefined;
  const { t } = useTranslation();

  const [transaction, setTransaction] = React.useState<TransactionDetail | undefined>(transactionParam);
  const [loading, setLoading] = useState<boolean>(!!idTransaction && !transactionParam);
  const [user, setUser] = useState<any>(null);
  const [bankAccounts, setBankAccounts] = useState<{bank_name: string; bank_number: string}[]>([]);

  const fetchUser = async () => {
    const user = await getUser();
    setUser(user);
  };

  const fetchBankAccounts = async () => {
    try {
      const response = await api.get('/client/bank/data');
      if (response.data.status) {
        const accounts = response.data.data.map((acc: any) => ({
          bank_name: acc.bank_code,
          bank_number: acc.bank_number
        }));
        console.log('accounts', response.data.data);
        setBankAccounts(accounts);
      }
    } catch (error) {
      console.log('Error fetching bank accounts:', error);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchBankAccounts();
    if (!idTransaction) {
      setLoading(false);
    }
  }, []);

  // 15-minute validity timer
  const [secondsLeft, setSecondsLeft] = React.useState(900);
  const isExpired = secondsLeft <= 0;

  React.useEffect(() => {
    // Calculate remaining time based on created_at if available
    const interval = setInterval(() => {
      if (transaction?.createdAt) {
        const created = new Date(transaction.createdAt).getTime();
        const expiresAt = created + 15 * 60 * 1000;
        const remainingMs = Math.max(0, expiresAt - Date.now());
        setSecondsLeft(Math.floor(remainingMs / 1000));
      } else {
        // Fallback: decrement from current secondsLeft if createdAt not available
        setSecondsLeft(prev => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [transaction?.createdAt]);

  React.useEffect(() => {
    const fetchPending = async () => {
      if (!idTransaction || transaction || !user?.email) return;
      setLoading(true);
      try {
        // Determine API endpoint based on transaction type
        const endpoint = typeParam === 'sell' 
          ? '/client/transaction-pending/usdt-vnd' 
          : '/client/transaction-pending/vnd-usdt';
        
        const res = await api.post(endpoint, {
          email: user.email,
          id_transaction: idTransaction,
        });
        if (res?.data?.status) {
          console.log('res', res.data);
          const d = res.data.data || {};
          
          if (typeParam === 'sell') {
            // Sell USDT mapping
            const mapped: TransactionDetail = {
              id: String(idTransaction),
              type: 'sell',
              amount: parseFloat(String(d.amount_vnd ?? '')).toLocaleString('vi-VN'), // USDT amount to sell
              usdt: String(d.amount_usd ?? ''), // USDT amount to sell
              exchangeRate: parseFloat(String(d.rate ?? '')).toLocaleString('vi-VN'),
              status: 0,
              date: d.created_at ? new Date(d.created_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
              time: d.created_at ? new Date(d.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              transactionId: d.order_code || '',
              fee: `${(d.fee_vnd ?? 0).toLocaleString('vi-VN')} VND`,
              totalAmount: `${(d.total_vnd ?? 0).toLocaleString('vi-VN')} VND`, // Amount to receive
              receiveAddress: d.address_wallet || undefined, // TRC20 wallet to send USDT to
              createdAt: d.created_at || undefined,
              transferInfo: {
                bankName: d.bank_name || '',
                accountNumber: d.bank_number || '',
                accountName: d.bank_account || '',
                transferContent: d.order_code || '',
                amount: (d.total_vnd ?? 0).toLocaleString('vi-VN'), // Amount to receive
              },
            };
            setTransaction(mapped);
          } else {
            // Buy USDT mapping (existing)
            const mapped: TransactionDetail = {
              id: String(idTransaction),
              type: 'buy',
              amount: parseFloat(String(d.amount_vnd ?? '')).toLocaleString('vi-VN'),
              usdt: String(d.amount_usd ?? ''),
              exchangeRate: parseFloat(String(d.rate ?? '')).toLocaleString('vi-VN'),
              status: 0,
              date: d.created_at ? new Date(d.created_at).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
              time: d.created_at ? new Date(d.created_at).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              transactionId: d.order_code || '',
              fee: `${(d.fee_vnd ?? 0).toLocaleString('vi-VN')} VND`,
              totalAmount: `${(d.total_vnd ?? 0).toLocaleString('vi-VN')} VND`,
              qrPayload: d.qr_code || undefined,
              createdAt: d.created_at || undefined,
              transferInfo: {
                bankName: d.bank_name || '',
                accountNumber: d.bank_number || '',
                accountName: d.bank_account || '',
                transferContent: d.qr_code ? (d.order_code || '') : (d.order_code || ''),
                amount: (d.total_vnd ?? 0).toLocaleString('vi-VN'),
              },
            };
            setTransaction(mapped);
          }
        }
      } catch (err : any) {
        console.log('fetch pending error', err.response);
      } finally {
        setLoading(false);
      }
    };
    fetchPending();
  }, [idTransaction, transaction, typeParam, user?.email]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const ss = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${ss}`;
  };

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
          <Text style={styles.headerTitle}>{t('detailHistory.title')}</Text>
          <View style={styles.headerRight} />
        </View>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>{t('detailHistory.loadingTransaction')}</Text>
          </View>
        ) : (
          <View style={styles.errorContainer}>
            <Icon name="alert-circle" size={48} color="#FF3B30" />
            <Text style={styles.errorText}>{t('detailHistory.transactionNotFound')}</Text>
          </View>
        )}
      </SafeAreaView>
    );
  }

  const isBuy = transaction.type === 'buy';
  const isPending = transaction.status === 0;

  const getStatusColor = () => {
    switch (transaction.status) {
      case 1:
        return '#34C759';
      case 2:
        return '#FF3B30';
      case 0:
      default:
        return '#FF9500';
    }
  };

  const getStatusText = () => {
    switch (transaction.status) {
      case 1:
        return t('detailHistory.success');
      case 2:
        return t('detailHistory.failed');
      case 0:
      default:
        return t('detailHistory.pending');
    }
  };


  const copyToClipboard = (text: string, message: string) => {
    Clipboard.setString(text);
    showAlert(t('detailHistory.copied'), message);
  };

  // Render Buy USDT Transaction
  const renderBuyTransaction = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation as any).navigate('MainTabs', { screen: 'History' })}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('detailHistory.buyTransaction')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Validity Banner (5 minutes) */}
        <View style={[styles.validityBar, { backgroundColor: isExpired ? '#FFEBEE' : '#FFF4E6', borderColor: isExpired ? '#FF3B30' : '#FF9500' }]}>
          <Icon name={isExpired ? 'timer-off' : 'timer'} size={18} color={isExpired ? '#FF3B30' : '#FF9500'} />
          <Text style={[styles.validityText, { color: isExpired ? '#FF3B30' : '#FF9500' }]}>
            {isExpired ? t('detailHistory.expired') : t('detailHistory.validFor15Minutes', { time: formatTime(secondsLeft) })}
          </Text>
        </View>

        {/* Transaction Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIcon, { backgroundColor: getStatusColor() + '20' }]}>
              <Icon name="arrow-down" size={24} color={getStatusColor()} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.transactionType}>{t('detailHistory.buyUsdt')}</Text>
              <Text style={styles.transactionDate}>
                {transaction.createdAt ? formatCreatedAt(transaction.createdAt) : `${transaction.date} • ${transaction.time}`}
              </Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        {/* Transaction Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t('detailHistory.transactionInformation')}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('detailHistory.transactionId')}</Text>
            <View style={styles.infoValueContainer}>
              <Text style={styles.infoValue}>{transaction.transactionId}</Text>
              <TouchableOpacity
                onPress={() => copyToClipboard(transaction.transactionId, t('detailHistory.transactionIdCopied'))}
                style={styles.copyButton}
              >
                <Icon name="content-copy" size={16} color="#4A90E2" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('detailHistory.usdtToReceive')}</Text>
            <Text style={[styles.infoValue, { color: '#4A90E2' }]}>
              {transaction.usdt} USDT
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('detailHistory.vndToPay')}</Text>
            <Text style={styles.infoValue}>
              {transaction.amount} VND
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('detailHistory.exchangeRate')}</Text>
            <Text style={styles.infoValue}>
              {transaction.exchangeRate} VND/USDT
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('detailHistory.transactionFee')}</Text>
            <Text style={styles.infoValue}>
              {transaction.fee}
            </Text>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.totalLabel}>{t('detailHistory.totalToPay')}</Text>
            <Text style={styles.totalValue}>
              {transaction.totalAmount}
            </Text>
          </View>
        </View>
         {/* Note */}
         <View style={styles.noteContainer}>
          <Icon name="information" size={20} color="#E65100" />
          <View style={{flex: 1}}>
            <Text style={styles.noteText}>
              {t('detailHistory.verifiedBankAccountsOnly')}
            </Text>
            {bankAccounts.length > 0 ? (
              <View style={{marginTop: 8}}>
                {bankAccounts.map((account, index) => (
                  <Text key={index} style={[styles.noteText, {marginLeft: 8, marginTop: 4}]}>
                    • {account.bank_name}: {account.bank_number}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={[styles.noteText, {marginTop: 4}]}>
                {t('detailHistory.noVerifiedBankAccounts')}
              </Text>
            )}
          </View>
        </View>

        {/* QR Code Section */}
        <View style={[styles.qrCard, isExpired && { opacity: 0.5 }]}>
          <Text style={styles.qrCardTitle}>{t('detailHistory.paymentQrCode')}</Text>
          <View style={styles.qrContainer}>
            <QRCode
              value={transaction.qrPayload || ''}
              size={wp('70%')}
              quietZone={12}
              showShare={!isExpired}
              showDownload={!isExpired}
            />
          </View>
          <View style={styles.qrInfo}>
            <Icon name={isExpired ? 'alert' : 'qrcode-scan'} size={18} color={isExpired ? '#FF3B30' : '#666'} />
            <Text style={styles.qrInfoText}>
              {isExpired 
                ? t('detailHistory.qrCodeInvalid')
                : t('detailHistory.scanQrCode')}
            </Text>
          </View>
        </View>

        {/* Bank Transfer Information */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t('detailHistory.bankTransferInformation')}</Text>
          
          {transaction.transferInfo ? (
            <>
              <View style={styles.transferCard}>
                <View style={styles.transferRow}>
                  <Text style={styles.transferLabel}>{t('detailHistory.bankName')}</Text>
                  <View style={styles.transferValueContainer}>
                    <Text style={styles.transferValue}>{transaction.transferInfo.bankName}</Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(transaction.transferInfo!.bankName, t('detailHistory.bankNameCopied'))}
                      style={styles.copyButton}
                    >
                      <Icon name="content-copy" size={16} color="#4A90E2" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.transferRow}>
                  <Text style={styles.transferLabel}>{t('detailHistory.accountName')}</Text>
                  <View style={styles.transferValueContainer}>
                    <Text style={styles.transferValue}>{transaction.transferInfo.accountName}</Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(transaction.transferInfo!.accountName, t('detailHistory.accountNameCopied'))}
                      style={styles.copyButton}
                    >
                      <Icon name="content-copy" size={16} color="#4A90E2" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.transferRow}>
                  <Text style={styles.transferLabel}>{t('detailHistory.accountNumber')}</Text>
                  <View style={styles.transferValueContainer}>
                    <Text style={styles.transferValue}>{transaction.transferInfo.accountNumber}</Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(transaction.transferInfo!.accountNumber, t('detailHistory.accountNumberCopied'))}
                      style={styles.copyButton}
                    >
                      <Icon name="content-copy" size={16} color="#4A90E2" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.transferRow}>
                  <Text style={styles.transferLabel}>{t('detailHistory.amountToTransfer')}</Text>
                  <View style={styles.transferValueContainer}>
                    <Text style={[styles.transferValue, { color: '#4A90E2', fontWeight: '600' }]}>
                      {transaction.transferInfo.amount} VND
                    </Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(transaction.transferInfo!.amount.replace(/\./g, ''), t('detailHistory.amountCopied'))}
                      style={styles.copyButton}
                    >
                      <Icon name="content-copy" size={16} color="#4A90E2" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.transferRow}>
                  <Text style={styles.transferLabel}>{t('detailHistory.transferContent')}</Text>
                  <View style={styles.transferValueContainer}>
                    <Text style={[styles.transferValue, { color: '#4A90E2', fontWeight: '600' }]}>
                      {transaction.transferInfo.transferContent}
                    </Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(transaction.transferInfo!.transferContent, t('detailHistory.transferContentCopied'))}
                      style={styles.copyButton}
                    >
                      <Icon name="content-copy" size={16} color="#4A90E2" />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={styles.copyAllButton}
                onPress={() => {
                  if (transaction.transferInfo) {
                    const allInfo = `Bank Name: ${transaction.transferInfo.bankName}\nAccount Name: ${transaction.transferInfo.accountName}\nAccount Number: ${transaction.transferInfo.accountNumber}\nAmount: ${transaction.transferInfo.amount} VND\nTransfer Content: ${transaction.transferInfo.transferContent}`;
                    copyToClipboard(allInfo, t('detailHistory.allInfoCopied'));
                  }
                }}
              >
                <Icon name="content-copy" size={18} color="#FFFFFF" />
                <Text style={styles.copyAllText}>{t('detailHistory.copyAllInformation')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Icon name="bank" size={48} color="#666" />
              <Text style={styles.noDataText}>{t('detailHistory.noTransferInfo')}</Text>
            </View>
          )}
        </View>

       
      </ScrollView>
    </SafeAreaView>
  );

  // Render Sell USDT Transaction
  const renderSellTransaction = () => (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => (navigation as any).navigate('MainTabs', { screen: 'History' })}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('detailHistory.sellTransaction')}</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Validity Banner (5 minutes) */}
        <View style={[styles.validityBar, { backgroundColor: isExpired ? '#FFEBEE' : '#FFF4E6', borderColor: isExpired ? '#FF3B30' : '#FF9500' }]}>
          <Icon name={isExpired ? 'timer-off' : 'timer'} size={18} color={isExpired ? '#FF3B30' : '#FF9500'} />
          <Text style={[styles.validityText, { color: isExpired ? '#FF3B30' : '#FF9500' }]}>
            {isExpired ? t('detailHistory.expired') : t('detailHistory.validFor15Minutes', { time: formatTime(secondsLeft) })}
          </Text>
        </View>

        {/* Transaction Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <View style={[styles.statusIcon, { backgroundColor: getStatusColor() + '20' }]}>
              <Icon name="arrow-up" size={24} color={getStatusColor()} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.transactionType}>{t('detailHistory.sellUsdt')}</Text>
              <Text style={styles.transactionDate}>
                {transaction.createdAt ? formatCreatedAt(transaction.createdAt) : `${transaction.date} • ${transaction.time}`}
              </Text>
            </View>
          </View>
          <View style={styles.statusContainer}>
            <View style={[styles.statusDot, { backgroundColor: getStatusColor() }]} />
            <Text style={[styles.statusText, { color: getStatusColor() }]}>
              {getStatusText()}
            </Text>
          </View>
        </View>

        {/* Transaction Info */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t('detailHistory.transactionInformation')}</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('detailHistory.usdtToSell')}</Text>
            <Text style={[styles.infoValue, { color: '#7B68EE' }]}>
              {transaction.usdt} USDT
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('detailHistory.vndToReceive')}</Text>
            <Text style={styles.infoValue}>
              {transaction.amount} VND
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('detailHistory.exchangeRate')}</Text>
            <Text style={styles.infoValue}>
              {transaction.exchangeRate} VND/USDT
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('detailHistory.transactionFee')}</Text>
            <Text style={styles.infoValue}>
              {transaction.fee}
            </Text>
          </View>

          <View style={styles.divider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.totalLabel}>{t('detailHistory.totalToReceive')}</Text>
            <Text style={styles.totalValue}>
              {transaction.totalAmount}
            </Text>
          </View>
        </View>

        {/* QR Code for USDT Transfer */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t('detailHistory.qrCodeForUsdtTransfer')}</Text>
          
          {transaction.receiveAddress && transaction.receiveAddress.trim() !== '' ? (
            <View style={styles.qrContainer}>
              <QRCode 
                value={transaction.receiveAddress}
                size={wp('50%')}
                quietZone={12}
                showShare={!isExpired}
                showDownload={!isExpired}
              />
            </View>
          ) : (
            <View style={styles.noDataContainer}>
              <Icon name="qr-code" size={48} color="#666" />
              <Text style={styles.noDataText}>{t('detailHistory.noQrCode')}</Text>
            </View>
          )}
        </View>

        {/* TRC20 Wallet Information */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>{t('detailHistory.trc20WalletInformation')}</Text>
          
          {transaction.receiveAddress && transaction.receiveAddress.trim() !== '' ? (
            <>
              <View style={styles.walletCard}>
                <View style={styles.walletHeader}>
                  <Icon name="wallet" size={20} color="#7B68EE" />
                  <Text style={styles.walletTitle}>{t('detailHistory.sendUsdtTo')}</Text>
                </View>
                
                <View style={styles.walletAddressContainer}>
                  <Text style={styles.walletAddress}>{transaction.receiveAddress}</Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(transaction.receiveAddress!, t('detailHistory.walletAddressCopied'))}
                    style={styles.copyButton}
                  >
                    <Icon name="content-copy" size={16} color="#4A90E2" />
                  </TouchableOpacity>
                </View>

                <View style={styles.usdtAmountContainer}>
                  <View style={styles.usdtAmountHeader}>
                    <Icon name="currency-usd" size={16} color="#7B68EE" />
                    <Text style={styles.usdtAmountLabel}>{t('detailHistory.usdtToSend')}</Text>
                  </View>
                  <View style={styles.usdtAmountValueContainer}>
                    <Text style={styles.usdtAmountValue}>{transaction.usdt} USDT</Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard(`${transaction.usdt} USDT`, t('detailHistory.usdtAmountCopied'))}
                      style={styles.copyButton}
                    >
                      <Icon name="content-copy" size={16} color="#4A90E2" />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.walletNoteContainer}>
                  <Icon name="information" size={16} color="#FF9500" />
                  <Text style={styles.walletNote}>
                    {t('detailHistory.sendUsdtNote', { amount: transaction.usdt })}
                  </Text>
                </View>
              </View>
            </>
          ) : (
            <View style={styles.noDataContainer}>
              <Icon name="wallet" size={48} color="#666" />
              <Text style={styles.noDataText}>{t('detailHistory.noWalletInfo')}</Text>
            </View>
          )}
        </View>

        {/* Note */}
        <View style={styles.noteContainer}>
          <Icon name="information" size={20} color="#666" />
          <Text style={styles.noteText}>
            {isPending 
              ? t('detailHistory.sellPendingNote')
              : t('detailHistory.completedNote')
            }
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );

  // Main return - DetailHistoryScreen only handles pending transactions
  // Success and Failed transactions are handled by separate screens
  return isBuy ? renderBuyTransaction() : renderSellTransaction();
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
  statusCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  infoCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  qrCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  qrCardTitle: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  qrSection: {
    marginTop: 20,
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  qrContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  actionContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF3B30',
    backgroundColor: '#FFFFFF',
  },
  cancelButtonText: {
    fontSize: wp('3.8%'),
    fontWeight: '600',
    color: '#FF3B30',
    marginLeft: 8,
  },
  refreshButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#4A90E2',
  },
  refreshButtonText: {
    fontSize: wp('3.8%'),
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  noteContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF4E6',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
  },
  validityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 12,
  },
  validityText: {
    flex: 1,
    fontSize: wp('3.5%'),
    fontWeight: '600',
  },
  noteText: {
    flex: 1,
    fontSize: wp('3.5%'),
    color: '#E65100',
    marginLeft: 12,
    lineHeight: wp('4.5%'),
  },
  // Additional styles for new components
  transferCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  transferRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  transferLabel: {
    fontSize: wp('3.8%'),
    color: '#666',
    flex: 1,
  },
  transferValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    justifyContent: 'flex-end',
  },
  transferValue: {
    fontSize: wp('3.8%'),
    color: '#000',
    textAlign: 'right',
    flex: 1,
  },
  copyAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  copyAllText: {
    color: '#FFFFFF',
    fontSize: wp('3.8%'),
    fontWeight: '500',
    marginLeft: 8,
  },
  qrInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  qrInfoText: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginLeft: 8,
    textAlign: 'center',
    lineHeight: wp('4.5%'),
  },
  noDataContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noDataText: {
    fontSize: wp('3.8%'),
    color: '#666',
    marginTop: 12,
    textAlign: 'center',
  },
  walletCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  walletTitle: {
    fontSize: wp('3.8%'),
    fontWeight: '600',
    color: '#000',
    marginLeft: 8,
  },
  walletAddressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  walletAddress: {
    fontSize: wp('3.2%'),
    color: '#000',
    flex: 1,
    fontFamily: 'monospace',
  },
  usdtAmountContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  usdtAmountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  usdtAmountLabel: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginLeft: 6,
  },
  usdtAmountValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  usdtAmountValue: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#7B68EE',
  },
  walletNoteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF4E6',
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  walletNote: {
    fontSize: wp('3.2%'),
    color: '#E65100',
    flex: 1,
    marginLeft: 8,
    lineHeight: wp('4.2%'),
    fontWeight: '500',
  },
});

export default DetailHistoryScreen;
