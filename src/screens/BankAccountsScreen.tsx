import { useAlert } from "../component/AlertCustom";
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
  StatusBar,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import api from '../utils/Api';
import { useTranslation } from '../hooks/useTranslation';

interface BankAccountData {
  id: number;
  id_bank: number; // bank id reference
  name_ekyc: string; // owner name
  bank_number: string; // account number
  is_default: number;
  created_at: string;
  updated_at: string;
  bank_name?: string; // optional from API
  bank_code?: string; // optional from API
}

type BankAccount = {
  id: number;
  bank: string;
  bankId: number;
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
  createdAt: string;
};

const BankAccountsScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { showAlert } = useAlert();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [banks, setBanks] = useState<{[key: number]: { name: string; code: string; }}>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);

  // Fetch banks data to get bank names
  const fetchBanks = async () => {
    try {
      const response = await api.get('/client/bank/data-all');
      if (response.data.status) {
        const bankData = response.data.data;
        const bankMap: {[key: number]: { name: string; code: string; }} = {};
        bankData.forEach((bank: any) => {
          bankMap[bank.id] = { name: bank.name, code: bank.code };
        });
        setBanks(bankMap);
      }
    } catch (error) {
      console.log('Fetch banks error:', error);
    }
  };

  // Fetch bank account data from API
  const fetchBankAccounts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const response = await api.get('/client/bank/data');
      console.log('Bank accounts response:', response.data);

      if (response.data.status) {
        const accountData: BankAccountData[] = response.data.data;
        const formattedAccounts: BankAccount[] = accountData.map(account => {
          const bankMeta = banks[account.id_bank];
          return {
            id: account.id,
            bank: account.bank_name || (bankMeta ? `${bankMeta.name} (${bankMeta.code})` : `Bank ${account.id_bank}`),
            bankId: account.id_bank,
            accountNumber: account.bank_number,
            accountName: account.name_ekyc,
            isDefault: account.is_default === 1,
            createdAt: account.created_at,
          };
        });
        setAccounts(formattedAccounts);
        setNeedsVerification(false);
      } else {
        setNeedsVerification(true);
      }
    } catch (error: any) {
      console.log('Fetch bank accounts error:', error);
      let errorMessage = t('bankAccounts.loadAccountsError');
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      showAlert(t('common.error'), errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchBanks();
      await fetchBankAccounts();
    };
    loadData();
  }, []);

  // Re-fetch accounts when banks data is loaded
  useEffect(() => {
    if (Object.keys(banks).length > 0) {
      fetchBankAccounts();
    }
  }, [banks]);

  // Refresh data when screen comes into focus (e.g., after adding new account)
  useFocusEffect(
    React.useCallback(() => {
      fetchBankAccounts();
    }, [])
  );

  const onRefresh = () => {
    fetchBankAccounts(true);
  };

  const handleAddAccount = () => {
    navigation.navigate('AddBankAccount' as never);
  };

  const handleEditAccount = (account: BankAccount) => {
    // Convert BankAccount to BankAccountData format for EditBankAccountScreen
    const accountData: BankAccountData = {
      id: account.id,
      id_bank: account.bankId, // Use stored bankId
      name_ekyc: account.accountName,
      bank_number: account.accountNumber,
      is_default: account.isDefault ? 1 : 0,
      created_at: account.createdAt,
      updated_at: account.createdAt // Use createdAt as fallback
    };
    
    (navigation as any).navigate('EditBankAccount', { account: accountData });
  };

  const handleCopyAccount = (accountNumber: string) => {
    // Copy account number to clipboard
    showAlert(t('bankAccounts.copied'), t('bankAccounts.accountNumberCopied'));
  };

  const renderVerificationRequired = () => (
    <View style={styles.verificationContainer}>
      <View style={styles.verificationIconContainer}>
        <Icon name="shield-check" size={64} color="#FF9500" />
      </View>
      <Text style={styles.verificationTitle}>{t('bankAccounts.verificationRequired')}</Text>
      <Text style={styles.verificationDescription}>
        {t('bankAccounts.verificationDescription')}
      </Text>
      <TouchableOpacity 
        style={styles.verificationButton}
        onPress={() => (navigation as any).navigate('Security')}
      >
        <Text style={styles.verificationButtonText}>{t('bankAccounts.goToVerification')}</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('bankAccounts.title')}</Text>
          <TouchableOpacity 
            style={styles.addButton}
            disabled={needsVerification}
            onPress={handleAddAccount}
          >
            <Icon name="plus" size={24} color="#4A90E2" />
          </TouchableOpacity>
        </View>

        {needsVerification ? (
          renderVerificationRequired()
        ) : (
          <ScrollView 
            style={styles.content}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Text style={styles.sectionTitle}>{t('bankAccounts.accountList')}</Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4A90E2" />
                <Text style={styles.loadingText}>{t('bankAccounts.loadingAccounts')}</Text>
              </View>
            ) : accounts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Icon name="bank-outline" size={64} color="#CCCCCC" />
                <Text style={styles.emptyTitle}>{t('bankAccounts.noBankAccounts')}</Text>
                <Text style={styles.emptyDescription}>
                  {t('bankAccounts.noAccountsDescription')}
                </Text>
                <TouchableOpacity 
                  style={styles.addFirstButton}
                  onPress={handleAddAccount}
                >
                  <Icon name="plus" size={20} color="#FFFFFF" />
                  <Text style={styles.addFirstText}>{t('bankAccounts.addAccount')}</Text>
                </TouchableOpacity>
              </View>
            ) : (
              accounts.map((account) => (
                <View key={account.id} style={styles.accountCard}>
                  <View style={styles.accountHeader}>
                    <Text style={styles.bankName} 
                    numberOfLines={1}
                    ellipsizeMode="tail">{account.bank}</Text>
                    {account.isDefault && (
                      <View style={styles.defaultBadge}>
                        <Text style={styles.defaultText}>{t('bankAccounts.default')}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.accountInfo}>
                    <View>
                      <Text style={styles.accountLabel}>{t('bankAccounts.accountNumber')}</Text>
                      <Text style={styles.accountNumber}>{account.accountNumber}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={() => handleCopyAccount(account.accountNumber)}
                    >
                      <Icon name="content-copy" size={20} color="#4A90E2" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.accountNameContainer}>
                    <Text style={styles.accountLabel}>{t('bankAccounts.accountHolder')}</Text>
                    <Text style={styles.accountName}>{account.accountName}</Text>
                  </View>

                  <View style={styles.accountFooter}>
                    <Text style={styles.createdDate}>
                      {t('bankAccounts.created')} {new Date(account.createdAt).toLocaleDateString()}
                    </Text>
                    <TouchableOpacity 
                      style={styles.editButton}
                      onPress={() => handleEditAccount(account)}
                    >
                      <Icon name="pencil" size={16} color="#666" />
                      <Text style={styles.editText}>{t('bankAccounts.edit')}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingBottom: Platform.OS === 'android' ? hp('6%') : hp('4%'),
  },
  // Verification styles
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
  addButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: wp('4%'),
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  accountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  bankName: {
    fontSize: wp('4.5%'),
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  defaultBadge: {
    backgroundColor: '#4A90E215',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultText: {
    fontSize: wp('3%'),
    color: '#4A90E2',
    fontWeight: '500',
  },
  accountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  accountLabel: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: wp('4%'),
    color: '#000',
    fontWeight: '500',
  },
  copyButton: {
    padding: 8,
    backgroundColor: '#4A90E215',
    borderRadius: 8,
  },
  accountNameContainer: {
    marginBottom: 16,
  },
  accountName: {
    fontSize: wp('4%'),
    color: '#000',
    fontWeight: '500',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    padding: 8,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
  },
  editText: {
    fontSize: wp('3.5%'),
    color: '#666',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 12,
    fontSize: wp('4%'),
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: wp('5%'),
    fontWeight: '600',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: wp('4%'),
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  addFirstButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A90E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstText: {
    color: '#FFFFFF',
    fontSize: wp('4%'),
    fontWeight: '600',
    marginLeft: 8,
  },
  accountFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  createdDate: {
    fontSize: wp('3%'),
    color: '#999',
  },
});

export default BankAccountsScreen;
