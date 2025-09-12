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

const SettingsScreen: StackScreen<'Settings'> = () => {
  const navigation = useNavigation();
  const [darkMode, setDarkMode] = useState(true);
  const [biometrics, setBiometrics] = useState(true);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');
  const [currency, setCurrency] = useState('USD');

  const handleLanguageChange = () => {
    Alert.alert(
      'Select Language',
      'Choose your preferred language',
      [
        { text: 'English', onPress: () => setLanguage('English') },
        { text: 'Vietnamese', onPress: () => setLanguage('Vietnamese') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const handleCurrencyChange = () => {
    Alert.alert(
      'Select Currency',
      'Choose your preferred currency',
      [
        { text: 'USD', onPress: () => setCurrency('USD') },
        { text: 'VND', onPress: () => setCurrency('VND') },
        { text: 'Cancel', style: 'cancel' },
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
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Appearance */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={styles.menuList}>
            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="theme-light-dark" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Dark Mode</Text>
                <Text style={styles.menuDescription}>Enable dark theme</Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={setDarkMode}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleLanguageChange}
            >
              <View style={styles.menuIcon}>
                <Icon name="translate" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Language</Text>
                <Text style={styles.menuDescription}>{language}</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleCurrencyChange}
            >
              <View style={styles.menuIcon}>
                <Icon name="currency-usd" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Currency</Text>
                <Text style={styles.menuDescription}>{currency}</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Security */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <View style={styles.menuList}>
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

            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="bell" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Push Notifications</Text>
                <Text style={styles.menuDescription}>Enable notifications</Text>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: theme.colors.borderDark, true: theme.colors.primary }}
                thumbColor={theme.colors.white}
              />
            </View>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.menuList}>
            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="file-document" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Terms of Service</Text>
                <Text style={styles.menuDescription}>Read our terms</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="shield-lock" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Privacy Policy</Text>
                <Text style={styles.menuDescription}>Read our privacy policy</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>

            <View style={styles.menuItem}>
              <View style={styles.menuIcon}>
                <Icon name="information" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Version</Text>
                <Text style={styles.menuDescription}>1.0.0 (Build 100)</Text>
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

export default SettingsScreen;
