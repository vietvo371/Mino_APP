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
import QRCode from '../component/QRCode';

const DepositScreen: StackScreen<'Deposit'> = () => {
  const navigation = useNavigation();
  const [selectedWallet, setSelectedWallet] = useState('USDT');
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  const handleCopy = (text: string) => {
    Alert.alert('Copied', `${text} has been copied to clipboard`);
  };

  const handleShare = () => {
    Alert.alert('Share', 'Share functionality will be implemented');
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
        <Text style={styles.headerTitle}>Deposit {selectedWallet}</Text>
        <TouchableOpacity
          onPress={handleShare}
          style={styles.headerButton}
        >
          <Icon name="share-variant" size={24} color={theme.colors.textDark} />
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
            {/* USDT Deposit */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>USDT Deposit Address</Text>
              <View style={styles.qrContainer}>
                <QRCode
                  value="TRX • 0x1234...5678"
                  size={200}
                  backgroundColor={theme.colors.secondary}
                  foregroundColor={theme.colors.textDark}
                />
              </View>
              <View style={styles.addressContainer}>
                <Text style={styles.addressLabel}>TRC20 Network</Text>
                <View style={styles.addressRow}>
                  <Text style={styles.address}>TRX • 0x1234...5678</Text>
                  <TouchableOpacity
                    onPress={() => handleCopy('TRX • 0x1234...5678')}
                    style={styles.copyButton}
                  >
                    <Icon name="content-copy" size={20} color={theme.colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Important Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Important Notes</Text>
              <View style={styles.notesList}>
                <View style={styles.noteItem}>
                  <Icon name="information" size={20} color={theme.colors.warning} />
                  <Text style={styles.noteText}>
                    Only send USDT (TRC20) to this address. Other tokens may be lost.
                  </Text>
                </View>
                <View style={styles.noteItem}>
                  <Icon name="clock-outline" size={20} color={theme.colors.warning} />
                  <Text style={styles.noteText}>
                    Deposits usually take 1-30 minutes to arrive.
                  </Text>
                </View>
                <View style={styles.noteItem}>
                  <Icon name="alert-circle" size={20} color={theme.colors.warning} />
                  <Text style={styles.noteText}>
                    Minimum deposit amount is 10 USDT.
                  </Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* VND Deposit */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Bank Transfer Information</Text>
              <View style={styles.form}>
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

                <View style={styles.bankInfo}>
                  <View style={styles.bankInfoItem}>
                    <Text style={styles.bankInfoLabel}>Bank Name</Text>
                    <Text style={styles.bankInfoValue}>Vietcombank</Text>
                    <TouchableOpacity
                      onPress={() => handleCopy('Vietcombank')}
                      style={styles.copyButton}
                    >
                      <Icon name="content-copy" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.bankInfoItem}>
                    <Text style={styles.bankInfoLabel}>Account Number</Text>
                    <Text style={styles.bankInfoValue}>1234567890</Text>
                    <TouchableOpacity
                      onPress={() => handleCopy('1234567890')}
                      style={styles.copyButton}
                    >
                      <Icon name="content-copy" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.bankInfoItem}>
                    <Text style={styles.bankInfoLabel}>Account Name</Text>
                    <Text style={styles.bankInfoValue}>MIMO WALLET JSC</Text>
                    <TouchableOpacity
                      onPress={() => handleCopy('MIMO WALLET JSC')}
                      style={styles.copyButton}
                    >
                      <Icon name="content-copy" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.bankInfoItem}>
                    <Text style={styles.bankInfoLabel}>Transfer Content</Text>
                    <Text style={styles.bankInfoValue}>MIMO123456</Text>
                    <TouchableOpacity
                      onPress={() => handleCopy('MIMO123456')}
                      style={styles.copyButton}
                    >
                      <Icon name="content-copy" size={20} color={theme.colors.primary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>

            {/* Important Notes */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Important Notes</Text>
              <View style={styles.notesList}>
                <View style={styles.noteItem}>
                  <Icon name="information" size={20} color={theme.colors.warning} />
                  <Text style={styles.noteText}>
                    Please include the transfer content exactly as shown above.
                  </Text>
                </View>
                <View style={styles.noteItem}>
                  <Icon name="clock-outline" size={20} color={theme.colors.warning} />
                  <Text style={styles.noteText}>
                    Deposits usually take 5-15 minutes to arrive after bank confirmation.
                  </Text>
                </View>
                <View style={styles.noteItem}>
                  <Icon name="alert-circle" size={20} color={theme.colors.warning} />
                  <Text style={styles.noteText}>
                    Minimum deposit amount is 100,000 VND.
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>
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

  // QR Code Styles
  qrContainer: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
    marginBottom: theme.spacing.lg,
  },
  addressContainer: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
  },
  addressLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDarkLight,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: theme.spacing.sm,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  address: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.mono,
  },
  copyButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: theme.spacing.md,
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
  bankInfo: {
    gap: theme.spacing.lg,
  },
  bankInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bankInfoLabel: {
    width: 120,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDarkLight,
    fontFamily: theme.typography.fontFamily.medium,
  },
  bankInfoValue: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.mono,
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
});

export default DepositScreen;
