import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../theme/colors';
import { useTranslation } from '../hooks/useTranslation';

const getNotifications = (t: any) => [
  {
    id: '1',
    type: 'transaction',
    title: t('notifications.transactionSuccessful'),
    message: t('notifications.transactionMessage'),
    time: `2 ${t('notifications.hoursAgo')}`,
    read: false,
  },
  {
    id: '2',
    type: 'security',
    title: t('notifications.newLogin'),
    message: t('notifications.loginMessage'),
    time: `1 ${t('notifications.daysAgo')}`,
    read: true,
  },
  {
    id: '3',
    type: 'system',
    title: t('notifications.systemMaintenance'),
    message: t('notifications.maintenanceMessage'),
    time: `2 ${t('notifications.daysAgo')}`,
    read: true,
  },
];

const NotificationsScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const notifications = getNotifications(t);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return { name: 'swap-horizontal', color: '#4A90E2' };
      case 'security':
        return { name: 'shield-alert', color: '#FF3B30' };
      case 'system':
        return { name: 'cog', color: '#FF9500' };
      default:
        return { name: 'bell', color: '#8E8E93' };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Icon name="arrow-left" size={24} color="#1C1C1E" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notifications.title')}</Text>
        <TouchableOpacity style={styles.headerRight}>
          <Icon name="dots-horizontal" size={24} color="#1C1C1E" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {/* Today Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notifications.today')}</Text>
          <View style={styles.notificationList}>
            {notifications.filter(n => n.time.includes(t('notifications.hoursAgo'))).map(notification => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadItem,
                ]}
              >
                <View style={[
                  styles.notificationIcon,
                  { backgroundColor: getNotificationIcon(notification.type).color + '15' }
                ]}>
                  <Icon
                    name={getNotificationIcon(notification.type).name}
                    size={24}
                    color={getNotificationIcon(notification.type).color}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Earlier Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('notifications.earlier')}</Text>
          <View style={styles.notificationList}>
            {notifications.filter(n => n.time.includes(t('notifications.daysAgo'))).map(notification => (
              <TouchableOpacity
                key={notification.id}
                style={[
                  styles.notificationItem,
                  !notification.read && styles.unreadItem,
                ]}
              >
                <View style={[
                  styles.notificationIcon,
                  { backgroundColor: getNotificationIcon(notification.type).color + '15' }
                ]}>
                  <Icon
                    name={getNotificationIcon(notification.type).name}
                    size={24}
                    color={getNotificationIcon(notification.type).color}
                  />
                </View>
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationMessage}>{notification.message}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                {!notification.read && <View style={styles.unreadDot} />}
              </TouchableOpacity>
            ))}
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
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
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
  notificationList: {
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
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  unreadItem: {
    backgroundColor: '#F2F2F7',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4A90E2',
    marginLeft: 8,
  },
});

export default NotificationsScreen;