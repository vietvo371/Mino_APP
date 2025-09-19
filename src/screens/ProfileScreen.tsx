import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/colors';
import { StackScreen } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { getUser, removeUser, removeToken } from '../utils/TokenManager';
import api from '../utils/Api';

type BankAccount = {
  bank: string;
  accountNumber: string;
  accountName: string;
};

type TRC20Address = {
  name: string;
  address: string;
};

type MenuItem = {
  id: string;
  title: string;
  description: string;
  icon: string;
  route: string;
};

const MENU_ITEMS = [
  {
    id: 'security',
    title: 'Verification',
    description: 'Verify eKYC, email, and phone number',
    icon: 'shield-lock',
    route: 'Security',
  },
  {
    id: 'bank_accounts',
    title: 'Bank Accounts',
    description: 'Manage bank account list',
    icon: 'bank',
    route: 'BankAccounts',
  },
  {
    id: 'trc20_addresses',
    title: 'TRC20 Addresses',
    description: 'Manage TRC20 wallets',
    icon: 'wallet',
    route: 'TRC20Addresses',
  },
 
  {
    id: 'notifications',
    title: 'Notifications',
    description: 'Notification settings',
    icon: 'bell',
    route: 'Notifications',
  },
  {
    id: 'help',
    title: 'Help',
    description: 'FAQ and support',
    icon: 'help-circle',
    route: 'Help',
  },
];

interface UserProfile {
  full_name: string;
  email: string;
  number_phone: string;
  address: string;
  is_ekyc: number;
  is_active_mail: number;
  is_active_phone: number;
  is_open: number;
  is_level: number;
}

const ProfileScreen: StackScreen<'Profile'> = () => {
  const navigation = useNavigation();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchUserProfile = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      console.log('Fetching user profile...');
      
      const response = await api.get('/client/profile');
      console.log('Profile response:', response.data);
      
      if (response.data.status) {
        setUser(response.data.data);
      } else {
        Alert.alert('Error', 'Failed to load profile data');
      }
    } catch (error: any) {
      console.log('Profile fetch error:', error);
      
      let errorMessage = 'Failed to load profile. Please try again.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    fetchUserProfile(true);
  };

  const signOut = async () => {
    try {
      await removeToken();
      await removeUser();
      (navigation as any).replace('Login');
      await api.get('/client/logout');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Reload profile whenever this screen gains focus
  useEffect(() => {
    const unsubscribe = (navigation as any).addListener('focus', () => {
      fetchUserProfile();
    });
    return unsubscribe;
  }, [navigation]);

  console.log('user', user);
  
  // Get verification statuses from API data
  const isEkycVerified = user?.is_ekyc === 1;
  const isEmailVerified = user?.is_active_mail === 1;
  const isPhoneVerified = user?.is_active_phone === 1;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            signOut();
          },
        },
      ]
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const hasItems = Array.isArray((item as any).items) && ((item as any).items as any[]).length > 0;
    
    return (
      <View key={item.id}>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => {navigation.navigate(item.route as any)}}
          activeOpacity={0.7}
        >
          <View style={[styles.menuIcon, { backgroundColor: '#4A90E215' }]}>
            <Icon name={item.icon} size={24} color="#4A90E2" />
          </View>
          <View style={styles.menuContent}>
            <Text style={styles.menuTitle}>{item.title}</Text>
            <Text style={styles.menuDescription}>{item.description}</Text>
          </View>
          <Icon name="chevron-right" size={20} color="#8E8E93" />
        </TouchableOpacity>

        {hasItems && (
          <View style={styles.subItemsContainer}>
            {(item as any).items?.map((subItem: any, index: number) => (
              <View 
                key={index} 
                style={[
                  styles.subItem,
                  index < (((item as any).items?.length || 0) - 1) && styles.subItemBorder
                ]}
              >
                {item.id === 'bank_accounts' ? (
                  <>
                    <View style={styles.bankInfo}>
                      <Text style={styles.bankName}>{(subItem as BankAccount).bank}</Text>
                      <Text style={styles.accountNumber}>{(subItem as BankAccount).accountNumber}</Text>
                      <Text style={styles.accountName}>{(subItem as BankAccount).accountName}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={() => {
                        // Copy account number to clipboard
                      }}
                    >
                      <Icon name="content-copy" size={20} color="#4A90E2" />
                    </TouchableOpacity>
                  </>
                ) : (
                  <>
                    <View style={styles.walletInfo}>
                      <Text style={styles.walletName}>{(subItem as TRC20Address).name}</Text>
                      <Text style={styles.walletAddress}>{(subItem as TRC20Address).address}</Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.copyButton}
                      onPress={() => {
                        // Copy wallet address to clipboard
                      }}
                    >
                      <Icon name="content-copy" size={20} color="#4A90E2" />
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Icon name="loading" size={40} color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../assets/images/avatar.jpeg')}
              style={styles.avatar}
            />
            <TouchableOpacity 
              style={styles.editButton}
              activeOpacity={0.7}
            >
              <Icon name="pencil" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.name}>{user?.full_name || 'Loading...'}</Text>
            <Text style={styles.email}>{user?.email || 'Loading...'}</Text>
            <TouchableOpacity style={styles.badgesContainer} activeOpacity={0.7} onPress={() => (navigation as any).navigate('Security')}>
              <View style={[styles.badge, { backgroundColor: isEkycVerified ? '#34C75915' : '#E5E5EA' }]}>
                <Icon name="shield-check" size={14} color={isEkycVerified ? '#34C759' : '#8E8E93'} />
                <Text style={[styles.badgeText, { color: isEkycVerified ? '#34C759' : '#8E8E93' }]}>eKYC</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: isEmailVerified ? '#34C75915' : '#E5E5EA' }]}>
                <Icon name="email-check" size={14} color={isEmailVerified ? '#34C759' : '#8E8E93'} />
                <Text style={[styles.badgeText, { color: isEmailVerified ? '#34C759' : '#8E8E93' }]}>Email</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: isPhoneVerified ? '#34C75915' : '#E5E5EA' }]}>
                <Icon name="phone-check" size={14} color={isPhoneVerified ? '#34C759' : '#8E8E93'} />
                <Text style={[styles.badgeText, { color: isPhoneVerified ? '#34C759' : '#8E8E93' }]}>Phone</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

     

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {MENU_ITEMS.map(renderMenuItem)}
        </View>

        {/* Sign Out Button */}
        <TouchableOpacity
          style={styles.signOutButton}
          onPress={handleSignOut}
          activeOpacity={0.7}
        >
          <Icon name="logout" size={20} color="#FF3B30" />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  subItemsContainer: {
    backgroundColor: '#F8F8F8',
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  subItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  subItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  accountNumber: {
    fontSize: 15,
    color: '#666',
    marginBottom: 2,
  },
  accountName: {
    fontSize: 14,
    color: '#666',
  },
  walletInfo: {
    flex: 1,
  },
  walletName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  walletAddress: {
    fontSize: 15,
    color: '#666',
  },
  copyButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#4A90E215',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  editButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
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
  userInfo: {
    alignItems: 'center',
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  phone: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 8,
  },
  badgesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  verificationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 16,
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
  verificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
    gap: 8,
  },
  verificationTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
  verificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  verificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  verificationContent: {
    flex: 1,
  },
  verificationName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  verificationDesc: {
    fontSize: 13,
    color: '#666',
  },
  statusChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  statusChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  balanceCard: {
    backgroundColor: '#4A90E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  balanceTitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.8,
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    gap: 4,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
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
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 14,
    color: '#8E8E93',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 32,
    padding: 16,
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    gap: 8,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF3B30',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 16,
    fontFamily: theme.typography.fontFamily,
  },
});

export default ProfileScreen;