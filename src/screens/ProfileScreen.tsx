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
import ButtonCustom from '../component/ButtonCustom';
import { useAuth } from '../contexts/AuthContext';

const ProfileScreen: StackScreen<'Profile'> = () => {
  const navigation = useNavigation();
  const { signOut } = useAuth();
  const [refreshing, setRefreshing] = React.useState(false);

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          onPress: () => {
            signOut();
            navigation.navigate('Login');
          },
        },
      ]
    );
  };

  const handleVerification = () => {
    Alert.alert('Verification', 'Your account is already verified');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
        <LinearGradient
          colors={[theme.colors.backgroundDark, theme.colors.secondary]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../assets/images/avatar.jpeg')}
              style={styles.avatar}
            />
            <TouchableOpacity style={styles.editAvatarButton}>
              <Icon name="camera" size={20} color={theme.colors.textDark} />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>John Doe</Text>
          <Text style={styles.email}>john.doe@example.com</Text>
          <View style={styles.verificationBadge}>
            <Icon name="shield-check" size={16} color={theme.colors.success} />
            <Text style={styles.verificationText}>Verified Account</Text>
          </View>
        </View>

        {/* Account Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Settings</Text>
          <View style={styles.menuList}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Settings')}
            >
              <View style={styles.menuIcon}>
                <Icon name="cog" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Settings</Text>
                <Text style={styles.menuDescription}>App preferences and settings</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Security')}
            >
              <View style={styles.menuIcon}>
                <Icon name="shield-lock" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Security</Text>
                <Text style={styles.menuDescription}>Password and authentication</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Notifications')}
            >
              <View style={styles.menuIcon}>
                <Icon name="bell" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Notifications</Text>
                <Text style={styles.menuDescription}>Manage notifications</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support</Text>
          <View style={styles.menuList}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => navigation.navigate('Help')}
            >
              <View style={styles.menuIcon}>
                <Icon name="help-circle" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Help Center</Text>
                <Text style={styles.menuDescription}>FAQs and support</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleVerification}
            >
              <View style={styles.menuIcon}>
                <Icon name="shield-check" size={24} color={theme.colors.textDark} />
              </View>
              <View style={styles.menuInfo}>
                <Text style={styles.menuTitle}>Account Verification</Text>
                <Text style={styles.menuDescription}>Verify your identity</Text>
              </View>
              <Icon name="chevron-right" size={24} color={theme.colors.textDarkLight} />
            </TouchableOpacity>
          </View>
        </View>

        {/* About */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About</Text>
          <View style={styles.menuList}>
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

        {/* Sign Out Button */}
        <ButtonCustom
          title="Sign Out"
          onPress={handleSignOut}
          variant="outline"
          style={styles.signOutButton}
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

  // Profile Header Styles
  profileHeader: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.secondary,
  },
  name: {
    fontSize: theme.typography.fontSize['2xl'],
    color: theme.colors.textDark,
    fontFamily: theme.typography.fontFamily.bold,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textDarkLight,
    fontFamily: theme.typography.fontFamily.regular,
    marginBottom: theme.spacing.md,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '15',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.xs,
  },
  verificationText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.success,
    fontFamily: theme.typography.fontFamily.medium,
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

  // Sign Out Button
  signOutButton: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.xxl,
  },
});

export default ProfileScreen;