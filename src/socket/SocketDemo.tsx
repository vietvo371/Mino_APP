import React from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { useSocket } from '../contexts/SocketContext';
import { useNotificationStore } from './notificationStore';
import { useEchoChannel } from '../hooks/useEcho';

/**
 * Demo component để minh họa cách sử dụng Laravel Echo + Pusher
 * Component này có thể được sử dụng trong bất kỳ màn hình nào để test
 */
export const SocketDemo: React.FC = () => {
  const { isConnected, isInitialized } = useSocket();
  const { list, push, clear } = useNotificationStore();

  // Demo: Listen to custom events
  useEchoChannel('notifications', '.DemoEvent', (data) => {
    push({
      title: 'Demo Event',
      message: `Received: ${JSON.stringify(data)}`,
      type: 'info',
    });
  });

  const handleTestNotification = () => {
    push({
      title: 'Test Notification',
      message: 'This is a test notification from SocketDemo',
      type: 'success',
    });
  };

  const handleClearNotifications = () => {
    clear();
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Socket Demo</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>
          Status: {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
        </Text>
        <Text style={styles.statusText}>
          Initialized: {isInitialized ? '✅ Yes' : '❌ No'}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Test Notification"
          onPress={handleTestNotification}
          color="#007AFF"
        />
        <View style={styles.spacer} />
        <Button
          title="Clear All"
          onPress={handleClearNotifications}
          color="#FF3B30"
        />
      </View>

      <View style={styles.notificationsContainer}>
        <Text style={styles.notificationsTitle}>
          Notifications ({list.length})
        </Text>
        {list.map((notification) => (
          <View key={notification.id} style={styles.notificationItem}>
            <Text style={styles.notificationTitle}>
              {notification.title || 'No Title'}
            </Text>
            <Text style={styles.notificationMessage}>
              {notification.message}
            </Text>
            <Text style={styles.notificationType}>
              Type: {notification.type}
            </Text>
            <Text style={styles.notificationTime}>
              {notification.at ? new Date(notification.at).toLocaleTimeString() : 'No time'}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  buttonContainer: {
    marginBottom: 20,
  },
  spacer: {
    height: 10,
  },
  notificationsContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  notificationsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
  },
  notificationItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  notificationType: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
});

export default SocketDemo;
