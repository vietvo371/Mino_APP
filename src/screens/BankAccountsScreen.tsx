import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

type BankAccount = {
  id: string;
  bank: string;
  accountNumber: string;
  accountName: string;
  isDefault?: boolean;
};

const BANK_ACCOUNTS: BankAccount[] = [
  {
    id: '1',
    bank: 'Vietcombank',
    accountNumber: '1234567890',
    accountName: 'NGUYEN VAN A',
    isDefault: true,
  },
  {
    id: '2',
    bank: 'Techcombank',
    accountNumber: '0987654321',
    accountName: 'NGUYEN VAN A',
  },
];

const BankAccountsScreen = () => {
  const navigation = useNavigation();

  const handleAddAccount = () => {
    navigation.navigate('AddBankAccount');
  };

  const handleEditAccount = (account: BankAccount) => {
    navigation.navigate('EditBankAccount', { account });
  };

  const handleCopyAccount = (accountNumber: string) => {
    // Copy account number to clipboard
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tài khoản ngân hàng</Text>
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddAccount}
        >
          <Icon name="plus" size={24} color="#4A90E2" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Danh sách tài khoản</Text>
        
        {BANK_ACCOUNTS.map((account) => (
          <View key={account.id} style={styles.accountCard}>
            <View style={styles.accountHeader}>
              <Text style={styles.bankName}>{account.bank}</Text>
              {account.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>Mặc định</Text>
                </View>
              )}
            </View>

            <View style={styles.accountInfo}>
              <View>
                <Text style={styles.accountLabel}>Số tài khoản</Text>
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
              <Text style={styles.accountLabel}>Chủ tài khoản</Text>
              <Text style={styles.accountName}>{account.accountName}</Text>
            </View>

            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => handleEditAccount(account)}
            >
              <Icon name="pencil" size={16} color="#666" />
              <Text style={styles.editText}>Chỉnh sửa</Text>
            </TouchableOpacity>
          </View>
        ))}
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
});

export default BankAccountsScreen;
