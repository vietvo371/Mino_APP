import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
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
import ButtonCustom from '../component/ButtonCustom';

const SecurityScreen: StackScreen<'Security'> = () => {
  const navigation = useNavigation();
  const [biometrics, setBiometrics] = useState(true);
  const [twoFactor, setTwoFactor] = useState(true);
  const [pinCode, setPinCode] = useState(true);
  const [withdrawalConfirmation, setWithdrawalConfirmation] = useState(true);

  const handleChangePassword = () => {
    Alert.alert('Change Password', 'This feature will be implemented soon');
  };

  const handleChangePIN = () => {
    Alert.alert('Change PIN', 'This feature will be implemented soon');
  };

  const handleSetupTwoFactor = () => {
    Alert.alert('Setup 2FA', 'This feature will be implemented soon');
  };

  const handleDevices = () => {
    Alert.alert('Manage Devices', 'This feature will be implemented soon');
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
        <Text style={styles.headerTitle}>Security</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Security Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Status</Text>
          <View style={styles.securityStatus}>
            <View style={styles.securityScore}>
              <Text style={styles.scoreValue}>85%</Text>
              <Text style={styles.scoreLabel}>Security Score</Text>
            </View>
            <View style={styles.securityRecommendation}>
              <Text style={styles.recommendationTitle}>
                Your account security is good
              </Text>
              <Text style={styles.recommendationText}>
                Enable all security features for maximum protection
              </Text>
            </View>
          </View>
        </View>

        {/* Authentication */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Authentication</Text>
          <View style={styles.menuList}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleChangePassword}
            >
              <View style={styles.menuIcon}>
                <Icon name="lock" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Change Password</Text>
                <Text style={styles.menuDescription}>Last changed 30 days ago</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleChangePIN}
            >
              <View style={styles.menuIcon}>
                <Icon name="dialpad" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>PIN Code</Text>
                <Text style={styles.menuDescription}>Change your PIN code</Text>
              </View>
              <Switch
                value={pinCode}
                onValueChange={setPinCode}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </TouchableOpacity>

            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="fingerprint" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Biometric Authentication</Text>
                <Text style={styles.menuDescription}>Use fingerprint or face ID</Text>
              </View>
              <Switch
                value={biometrics}
                onValueChange={setBiometrics}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleSetupTwoFactor}
            >
              <View style={styles.menuIcon}>
                <Icon name="two-factor-authentication" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Two-Factor Authentication</Text>
                <Text style={styles.menuDescription}>Add extra layer of security</Text>
              </View>
              <Switch
                value={twoFactor}
                onValueChange={setTwoFactor}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Transaction Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Security</Text>
          <View style={styles.menuList}>
            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="cash-lock" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Withdrawal Confirmation</Text>
                <Text style={styles.menuDescription}>Require 2FA for withdrawals</Text>
              </View>
              <Switch
                value={withdrawalConfirmation}
                onValueChange={setWithdrawalConfirmation}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>
          </View>
        </View>

        {/* Device Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Management</Text>
          <View style={styles.menuList}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleDevices}
            >
              <View style={styles.menuIcon}>
                <Icon name="devices" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Manage Devices</Text>
                <Text style={styles.menuDescription}>2 devices connected</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Emergency */}
        <ButtonCustom
          title="Lock Account"
          onPress={() => Alert.alert('Lock Account', 'Are you sure you want to lock your account?')}
          variant="outline"
          style={styles.emergencyButton}
        />
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

  // Security Status Styles
  securityStatus: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
  },
  securityScore: {
    alignItems: 'center',
    marginRight: theme.spacing.xl,
  },
  scoreValue: {
    fontSize: theme.typography.fontSize['3xl'],
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamily.bold,
  },
  scoreLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDarkLight,
    fontFamily: theme.typography.fontFamily.medium,
  },
  securityRecommendation: {
    flex: 1,
  },
  recommendationTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: theme.spacing.xs,
  },
  recommendationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDarkLight,
    fontFamily: theme.typography.fontFamily.regular,
  },

  // Menu List Styles
  menuList: {
    backgroundColor: theme.colors.secondary,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 1,
    borderColor: theme.colors.borderDark,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.borderDark,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  menuInfo: {
    flex: 1,
  },
  menuTitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.medium,
    marginBottom: theme.spacing.xs,
  },
  menuDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textDarkLight,
    fontFamily: theme.typography.fontFamily.regular,
  },

  // Emergency Button
  emergencyButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
  },
});

export default SecurityScreen;
