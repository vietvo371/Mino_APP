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

const NotificationsScreen: StackScreen<'Notifications'> = () => {
  const navigation = useNavigation();
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [smsEnabled, setSmsEnabled] = useState(false);

  const [notifications, setNotifications] = useState({
    transactions: true,
    security: true,
    news: false,
    promotions: false,
    priceAlerts: true,
    withdrawals: true,
    deposits: true,
    system: true,
  });

  const handleClearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Clear All',
          onPress: () => {
            Alert.alert('Success', 'All notifications cleared');
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity
          onPress={handleClearAll}
          style={styles.headerButton}
        >
          <Icon name="notification-clear-all" size={24} color={theme.colors.textDark} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Notification Channels */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Channels</Text>
          <View style={styles.menuList}>
            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="bell" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Push Notifications</Text>
                <Text style={styles.menuDescription}>Receive push notifications</Text>
              </View>
              <Switch
                value={pushEnabled}
                onValueChange={setPushEnabled}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="email" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Email Notifications</Text>
                <Text style={styles.menuDescription}>Receive email notifications</Text>
              </View>
              <Switch
                value={emailEnabled}
                onValueChange={setEmailEnabled}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="message" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>SMS Notifications</Text>
                <Text style={styles.menuDescription}>Receive SMS notifications</Text>
              </View>
              <Switch
                value={smsEnabled}
                onValueChange={setSmsEnabled}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>
          </View>
        </View>

        {/* Notification Types */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Types</Text>
          <View style={styles.menuList}>
            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="swap-horizontal" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Transactions</Text>
                <Text style={styles.menuDescription}>Send and receive alerts</Text>
              </View>
              <Switch
                value={notifications.transactions}
                onValueChange={(value) => setNotifications({ ...notifications, transactions: value })}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="shield-check" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Security</Text>
                <Text style={styles.menuDescription}>Login and security alerts</Text>
              </View>
              <Switch
                value={notifications.security}
                onValueChange={(value) => setNotifications({ ...notifications, security: value })}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="newspaper" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>News & Updates</Text>
                <Text style={styles.menuDescription}>Latest news and updates</Text>
              </View>
              <Switch
                value={notifications.news}
                onValueChange={(value) => setNotifications({ ...notifications, news: value })}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="tag" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Promotions</Text>
                <Text style={styles.menuDescription}>Offers and promotions</Text>
              </View>
              <Switch
                value={notifications.promotions}
                onValueChange={(value) => setNotifications({ ...notifications, promotions: value })}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="chart-line" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Price Alerts</Text>
                <Text style={styles.menuDescription}>Market price notifications</Text>
              </View>
              <Switch
                value={notifications.priceAlerts}
                onValueChange={(value) => setNotifications({ ...notifications, priceAlerts: value })}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="arrow-up" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Withdrawals</Text>
                <Text style={styles.menuDescription}>Withdrawal notifications</Text>
              </View>
              <Switch
                value={notifications.withdrawals}
                onValueChange={(value) => setNotifications({ ...notifications, withdrawals: value })}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="arrow-down" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Deposits</Text>
                <Text style={styles.menuDescription}>Deposit notifications</Text>
              </View>
              <Switch
                value={notifications.deposits}
                onValueChange={(value) => setNotifications({ ...notifications, deposits: value })}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>

            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="cog" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>System</Text>
                <Text style={styles.menuDescription}>System notifications</Text>
              </View>
              <Switch
                value={notifications.system}
                onValueChange={(value) => setNotifications({ ...notifications, system: value })}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>
          </View>
        </View>

        {/* Notification History */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification History</Text>
          <View style={styles.menuList}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="history" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>View History</Text>
                <Text style={styles.menuDescription}>See all past notifications</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>
          </View>
        </View>
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
});

export default NotificationsScreen;
