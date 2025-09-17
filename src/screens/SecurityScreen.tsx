import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/colors';

const SecurityScreen = () => {
  const navigation = useNavigation();
  const [biometricEnabled, setBiometricEnabled] = React.useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);

  // Verification items (hub)
  const VERIFICATION_ITEMS = [
    {
      id: 'ekyc',
      title: 'Identity Verification (eKYC)',
      description: 'Verify your identity to unlock all features',
      icon: 'shield-check',
      iconColor: '#7B68EE',
      iconBg: '#7B68EE15',
      onPress: () => navigation.navigate('EkycIntro' as never),
    },
    {
      id: 'email',
      title: 'Email Verification',
      description: 'Confirm your email address',
      icon: 'email',
      iconColor: '#4A90E2',
      iconBg: '#4A90E215',
      onPress: () => navigation.navigate('EmailVerification' as never),
    },
    {
      id: 'phone',
      title: 'Phone Verification',
      description: 'Secure your account with phone verification',
      icon: 'phone',
      iconColor: '#34C759',
      iconBg: '#34C75915',
      onPress: () => navigation.navigate('PhoneVerification' as never),
    },
  ];

  const SECURITY_ITEMS = [
    {
      id: 'password',
      title: 'Change Password',
      icon: 'lock',
      onPress: () => {},
    },
    // {
    //   id: 'pin',
    //   title: 'PIN Code',
    //   icon: 'numeric',
    //   onPress: () => {},
    // },
    // {
    //   id: '2fa',
    //   title: 'Two-Factor Authentication',
    //   icon: 'shield-check',
    //   onPress: () => {},
    // },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Security</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView style={styles.content}>
        {/* Verification Hub */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Verifications</Text>
          <View style={styles.optionsList}>
            {VERIFICATION_ITEMS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.optionItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.optionIcon, { backgroundColor: item.iconBg }]}>
                  <Icon name={item.icon as any} size={24} color={item.iconColor} />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  <Text style={styles.optionDescription}>{item.description}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#8E8E93" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Security Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Options</Text>
          <View style={styles.optionsList}>
            {SECURITY_ITEMS.map(item => (
              <TouchableOpacity
                key={item.id}
                style={styles.optionItem}
                onPress={item.onPress}
              >
                <View style={styles.optionIcon}>
                  <Icon name={item.icon} size={24} color="#4A90E2" />
                </View>
                <View style={styles.optionInfo}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                </View>
                <Icon name="chevron-right" size={24} color="#8E8E93" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Settings */}
        {/* <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Settings</Text>
          <View style={styles.optionsList}>
            <View style={styles.optionItem}>
              <View style={styles.optionIcon}>
                <Icon name="fingerprint" size={24} color="#4A90E2" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Biometric Login</Text>
                <Text style={styles.optionDescription}>Face ID, Touch ID</Text>
              </View>
              <Switch
                value={biometricEnabled}
                onValueChange={setBiometricEnabled}
                trackColor={{ false: '#D1D1D6', true: '#4A90E2' }}
                thumbColor="#FFFFFF"
              />
            </View>

            <View style={styles.optionItem}>
              <View style={styles.optionIcon}>
                <Icon name="bell" size={24} color="#4A90E2" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Security Notifications</Text>
                <Text style={styles.optionDescription}>Login, Transactions</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#D1D1D6', true: '#4A90E2' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        </View> */}

        {/* Device Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Device Information</Text>
          <View style={styles.optionsList}>
            <View style={styles.optionItem}>
              <View style={styles.optionIcon}>
                <Icon name="cellphone" size={24} color="#4A90E2" />
              </View>
              <View style={styles.optionInfo}>
                <Text style={styles.optionTitle}>Current Device</Text>
                <Text style={styles.optionDescription}>iPhone 12 Pro • iOS 15.5</Text>
              </View>
              <View style={styles.activeTag}>
                <Text style={styles.activeText}>Active</Text>
              </View>
            </View>
          </View>
        </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  headerRight: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    backgroundColor: '#34C75910',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  statusText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  optionsList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4A90E215',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optionInfo: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  activeTag: {
    backgroundColor: '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '500',
  },
});

export default SecurityScreen;