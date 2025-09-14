import React from 'react';
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
import { StackScreen } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';

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
    id: 'bank_accounts',
    title: 'Tài khoản ngân hàng',
    description: 'Quản lý danh sách ngân hàng',
    icon: 'bank',
    route: 'BankAccounts',
  },
  {
    id: 'trc20_addresses',
    title: 'Địa chỉ TRC20',
    description: 'Quản lý ví TRC20',
    icon: 'wallet',
    route: 'TRC20Addresses',
  },
  {
    id: 'security',
    title: 'Xác thực eKYC',
    description: 'Xác thực danh tính',
    icon: 'shield-lock',
    route: 'EkycIntro',
  },
  {
    id: 'notifications',
    title: 'Thông báo',
    description: 'Cài đặt thông báo',
    icon: 'bell',
    route: 'Notifications',
  },
  {
    id: 'help',
    title: 'Trợ giúp',
    description: 'FAQ và hỗ trợ',
    icon: 'help-circle',
    route: 'Help',
  },
];

const ProfileScreen: StackScreen<'Profile'> = () => {
  const navigation = useNavigation();
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: () => {
            signOut();
          },
        },
      ]
    );
  };

  const renderMenuItem = (item: MenuItem) => {
    const hasItems = 'items' in item;
    
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
            {item.items?.map((subItem, index) => (
              <View 
                key={index} 
                style={[
                  styles.subItem,
                  index < (item.items?.length || 0) - 1 && styles.subItemBorder
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.backgroundContainer}>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
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
            <Text style={styles.name}>John Doe</Text>
            <Text style={styles.email}>john.doe@example.com</Text>
            <View style={styles.verifiedBadge}>
              <Icon name="check-circle" size={16} color="#34C759" />
              <Text style={styles.verifiedText}>Đã xác thực</Text>
            </View>
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
          <Text style={styles.signOutText}>Đăng xuất</Text>
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
    marginBottom: 8,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C75915',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  verifiedText: {
    fontSize: 12,
    color: '#34C759',
    fontWeight: '600',
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
});

export default ProfileScreen;