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
import { SafeAreaView } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/colors';
import { componentStyles } from '../theme/components';
import { StackScreen } from '../navigation/types';
import InputCustom from '../component/InputCustom';
import ButtonCustom from '../component/ButtonCustom';

const TransactionScreen: StackScreen<'Transaction'> = () => {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [note, setNote] = useState('');
  const [selectedWallet, setSelectedWallet] = useState('USDT');

  const handleSend = () => {
    Alert.alert(
      'Confirm Transaction',
      `Are you sure you want to send ${amount} ${selectedWallet} to ${address}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: () => {
            // Handle transaction
            Alert.alert('Success', 'Transaction sent successfully');
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
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
        <Text style={styles.headerTitle}>Send {selectedWallet}</Text>
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

        {/* Transaction Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          <View style={styles.form}>
            <InputCustom
              label="Recipient Address"
              placeholder={`Enter ${selectedWallet} address`}
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
              placeholder={`Enter amount in ${selectedWallet}`}
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
              placeholder="Add a note to this transaction"
              value={note}
              onChangeText={setNote}
              leftIcon="note-text"
              containerStyle={styles.input}
              darkMode
              variant="filled"
            />
          </View>
        </View>

        {/* Transaction Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Summary</Text>
          <View style={styles.summary}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Amount</Text>
              <Text style={styles.summaryValue}>
                {amount || '0.00'} {selectedWallet}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Network Fee</Text>
              <Text style={styles.summaryValue}>
                {selectedWallet === 'USDT' ? '1.00 USDT' : '22,000 VND'}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryTotal}>Total</Text>
              <Text style={styles.summaryTotalValue}>
                {amount ? (
                  selectedWallet === 'USDT' ? (
                    `${(Number(amount) + 1).toFixed(2)} USDT`
                  ) : (
                    `${(Number(amount) + 22000).toLocaleString()} VND`
                  )
                ) : (
                  selectedWallet === 'USDT' ? '0.00 USDT' : '0 VND'
                )}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
        <ButtonCustom
          title="Send"
          onPress={handleSend}
          gradient
          fullWidth
          disabled={!amount || !address}
          style={styles.sendButton}
        />
      </View>
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

  // Footer Styles
  footer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.secondary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderDark,
  },
  sendButton: {
    height: 56,
  },
});

export default TransactionScreen;
