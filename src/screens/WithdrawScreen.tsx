import { useAlert } from "../component/AlertCustom";
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/colors';
import { commonStyles } from "../theme/components";import { componentStyles } from '../theme/components';
import { commonStyles } from "../theme/components";import { StackScreen } from '../navigation/types';
import InputCustom from '../component/InputCustom';
import ButtonCustom from '../component/ButtonCustom';

const WithdrawScreen: StackScreen<'Withdraw'> = () => {
  const navigation = useNavigation();
  const [selectedWallet, setSelectedWallet] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [note, setNote] = useState('');

  const handleWithdraw = () => {
    showAlert(
      'Confirm Withdrawal',
      `Are you sure you want to withdraw ${amount} ${selectedWallet}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            // Handle withdrawal
            showAlert('Success', 'Withdrawal request sent successfully');
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <View style={commonStyles.screenContainer}>
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={[theme.colors.backgroundDark, theme.colors.secondary]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color={theme.colors.textDark} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdraw {selectedWallet}</Text>
        <TouchableOpacity
          onPress={() => {}}
          style={styles.headerButton}
        >
          <Icon name="qrcode-scan" size={24} color={theme.colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Wallet Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Wallet</Text>
          <View style={styles.walletList}>
            {/* USDT Wallet */}
            <TouchableOpacity
              style={[
                styles.walletItem,
                selectedWallet === 'USDT' && styles.walletItemActive,
              ]}
              onPress={() => setSelectedWallet('USDT')}
            >
              <View style={styles.walletIcon}>
                <Image
                  source={require('../assets/images/logo.png')}
                  style={styles.walletIconImage}
                />
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>USDT Wallet</Text>
                <Text style={styles.walletBalance}>10,000.00 USDT</Text>
              </View>
              {selectedWallet === 'USDT' && (
                <Icon name="check-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>

            {/* VND Wallet */}
            <TouchableOpacity
              style={[
                styles.walletItem,
                selectedWallet === 'VND' && styles.walletItemActive,
              ]}
              onPress={() => setSelectedWallet('VND')}
            >
              <View style={styles.walletIcon}>
                <Image
                  source={require('../assets/images/logo.png')}
                  style={styles.walletIconImage}
                />
              </View>
              <View style={styles.walletInfo}>
                <Text style={styles.walletName}>VND Wallet</Text>
                <Text style={styles.walletBalance}>56,789,000 VND</Text>
              </View>
              {selectedWallet === 'VND' && (
                <Icon name="check-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {selectedWallet === 'USDT' ? (
          <>
            {/* USDT Withdrawal */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Withdrawal Details</Text>
              <View style={styles.form}>
                <InputCustom
                  label="USDT Address"
                  placeholder="Enter USDT (TRC20) address"
                  value={address}
                  onChangeText={setAddress}
                  leftIcon="wallet"
                  rightIcon="content-paste"
                  onRightIconPress={() => {}}
                  containerStyle={styles.input}
                  darkMode
                  variant="filled"
                />

                <InputCustom
                  label="Amount"
                  placeholder="Enter amount in USDT"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  leftIcon="currency-usd"
                  containerStyle={styles.input}
                  darkMode
                  variant="filled"
                />

                <InputCustom
                  label="Note (Optional)"
                  placeholder="Add a note to this withdrawal"
                  value={note}
                  onChangeText={setNote}
                  leftIcon="note-text"
                  containerStyle={styles.input}
                  darkMode
                  variant="filled"
                />
              </View>
            </View>

            {/* Fee & Limits */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fee & Limits</Text>
              <View style={styles.summary}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Network Fee</Text>
                  <Text style={styles.summaryValue}>1.00 USDT</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Minimum Withdrawal</Text>
                  <Text style={styles.summaryValue}>10.00 USDT</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Maximum Withdrawal</Text>
                  <Text style={styles.summaryValue}>100,000.00 USDT</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryTotal}>Total Amount</Text>
                  <Text style={styles.summaryTotalValue}>
                    {amount ? `${(Number(amount) + 1).toFixed(2)} USDT` : '0.00 USDT'}
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* VND Withdrawal */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bank Account Details</Text>
              <View style={styles.form}>
                <InputCustom
                  label="Bank Name"
                  placeholder="Enter bank name"
                  value={bankName}
                  onChangeText={setBankName}
                  leftIcon="bank"
                  containerStyle={styles.input}
                  darkMode
                  variant="filled"
                />

                <InputCustom
                  label="Account Number"
                  placeholder="Enter account number"
                  value={accountNumber}
                  onChangeText={setAccountNumber}
                  keyboardType="number-pad"
                  leftIcon="credit-card"
                  containerStyle={styles.input}
                  darkMode
                  variant="filled"
                />

                <InputCustom
                  label="Account Name"
                  placeholder="Enter account name"
                  value={accountName}
                  onChangeText={setAccountName}
                  leftIcon="account"
                  containerStyle={styles.input}
                  darkMode
                  variant="filled"
                />

                <InputCustom
                  label="Amount"
                  placeholder="Enter amount in VND"
                  value={amount}
                  onChangeText={setAmount}
                  keyboardType="decimal-pad"
                  leftIcon="currency-usd"
                  containerStyle={styles.input}
                  darkMode
                  variant="filled"
                />

                <InputCustom
                  label="Note (Optional)"
                  placeholder="Add a note to this withdrawal"
                  value={note}
                  onChangeText={setNote}
                  leftIcon="note-text"
                  containerStyle={styles.input}
                  darkMode
                  variant="filled"
                />
              </View>
            </View>

            {/* Fee & Limits */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fee & Limits</Text>
              <View style={styles.summary}>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Bank Fee</Text>
                  <Text style={styles.summaryValue}>22,000 VND</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Minimum Withdrawal</Text>
                  <Text style={styles.summaryValue}>100,000 VND</Text>
                </View>
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryLabel}>Maximum Withdrawal</Text>
                  <Text style={styles.summaryValue}>500,000,000 VND</Text>
                </View>
                <View style={styles.summaryDivider} />
                <View style={styles.summaryItem}>
                  <Text style={styles.summaryTotal}>Total Amount</Text>
                  <Text style={styles.summaryTotalValue}>
                    {amount ? `${(Number(amount) + 22000).toLocaleString()} VND` : '0 VND'}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* Important Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Notes</Text>
          <View style={styles.notesList}>
            <View style={styles.noteItem}>
              <Icon name="information" size={20} color={theme.colors.warning} />
              <Text style={styles.noteText}>
                Please double-check all information before confirming the withdrawal.
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Icon name="clock-outline" size={20} color={theme.colors.warning} />
              <Text style={styles.noteText}>
                {selectedWallet === 'USDT'
                  ? 'USDT withdrawals usually take 10-30 minutes to process.'
                  : 'Bank transfers usually take 5-30 minutes during business hours.'}
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Icon name="alert-circle" size={20} color={theme.colors.warning} />
              <Text style={styles.noteText}>
                {selectedWallet === 'USDT'
                  ? 'Make sure you are using the correct TRC20 network.'
                  : 'Make sure your bank account information is correct.'}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
        <ButtonCustom
          title="Withdraw"
          onPress={handleWithdraw}
          gradient
          fullWidth
          disabled={!amount || (selectedWallet === 'USDT' ? !address : !accountNumber)}
          style={styles.withdrawButton}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xl,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.bold,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
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

  // Section Styles
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.lg,
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
  walletItemActive: {
    backgroundColor: theme.colors.primary + '10',
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
  walletBalance: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDarkLight,
    fontFamily: theme.typography.fontFamily.regular,
  },

  // Form Styles
  form: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
  },
  input: {
    marginBottom: theme.spacing.lg,
  },

  // Summary Styles
  summary: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  summaryLabel: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textDarkLight,
    fontFamily: theme.typography.fontFamily.regular,
  },
  summaryValue: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.medium,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: theme.colors.borderDark,
    marginVertical: theme.spacing.md,
  },
  summaryTotal: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.bold,
  },
  summaryTotalValue: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold,
  },

  // Notes Styles
  notesList: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
    gap: theme.spacing.md,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  noteText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.regular,
  },

  // Footer Styles
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.secondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderDark,
  },
  withdrawButton: {
    height: 56,
  },
});

export default WithdrawScreen;
