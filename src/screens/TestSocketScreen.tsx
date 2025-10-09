import { useAlert } from "../component/AlertCustom";
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { useSocket } from '../contexts/SocketContext';
import { useNotificationStore } from '../socket/notificationStore';
import { useEchoChannel } from '../hooks/useEcho';
import { getToken } from '../utils/TokenManager';
import { initEcho, getEcho, joinChannel, listenToEvent } from '../socket/echo';

const TestSocketScreen: React.FC = () => {
  const { isConnected, isInitialized } = useSocket();
  const { list, push, clear, remove } = useNotificationStore();
  const [customMessage, setCustomMessage] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const { showAlert } = useAlert();
  useEffect(() => {
    loadToken();
  }, []);

  const loadToken = async () => {
    const userToken = await getToken();
    setToken(userToken);
  };

  // Test custom event listener
  useEchoChannel('notifications', '.TestEvent', (data) => {
    push({
      title: 'Custom Event Received',
      message: `Event: .TestEvent\nData: ${JSON.stringify(data, null, 2)}`,
      type: 'info',
    });
  });

  const handleTestNotification = () => {
    push({
      title: 'Test Notification',
      message: 'This is a test notification from TestSocketScreen',
      type: 'success',
    });
  };

  const handleTestError = () => {
    push({
      title: 'Test Error',
      message: 'This is a test error notification',
      type: 'error',
    });
  };

  const handleTestWarning = () => {
    push({
      title: 'Test Warning',
      message: 'This is a test warning notification',
      type: 'warning',
    });
  };

  const handleClearAll = () => {
    clear();
  };

  const handleRemoveLast = () => {
    if (list.length > 0) {
      const lastNotification = list[list.length - 1];
      remove(lastNotification.id);
    }
  };

  const handleManualConnect = async () => {
    try {
      if (!token) {
        showAlert('Error', 'No token found. Please login first.');
        return;
      }

      const echo = initEcho(token);
      const pusher = (echo as any).connector.pusher;

      pusher.connection.bind('connected', () => {
        push({
          title: 'Manual Connection',
          message: 'Successfully connected manually',
          type: 'success',
        });
      });

      pusher.connection.bind('error', (error: any) => {
        push({
          title: 'Connection Error',
          message: `Error: ${JSON.stringify(error)}`,
          type: 'error',
        });
      });

      // Join test channel
      const channel = joinChannel('test-channel');
      if (channel) {
        listenToEvent(channel, '.TestEvent', (data) => {
          push({
            title: 'Manual Channel Event',
            message: `Received from test-channel: ${JSON.stringify(data)}`,
            type: 'info',
          });
        });
      }
    } catch (error) {
      push({
        title: 'Manual Connection Error',
        message: `Failed to connect: ${error}`,
        type: 'error',
      });
    }
  };

  const handleSendCustomMessage = () => {
    if (!customMessage.trim()) {
      showAlert('Error', 'Please enter a message');
      return;
    }

    push({
      title: 'Custom Message',
      message: customMessage,
      type: 'info',
    });
    setCustomMessage('');
  };

  const getStatusColor = () => {
    if (isInitialized && isConnected) return '#4CAF50';
    if (isInitialized && !isConnected) return '#FF9800';
    return '#F44336';
  };

  const getStatusText = () => {
    if (isInitialized && isConnected) return '🟢 Connected';
    if (isInitialized && !isConnected) return '🟡 Disconnected';
    return '🔴 Not Initialized';
  };

  return (
    <View style={styles.screenContainer}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Socket Test Screen</Text>

        {/* Status Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Connection Status</Text>
          <View style={[styles.statusCard, { borderLeftColor: getStatusColor() }]}>
            <Text style={styles.statusText}>{getStatusText()}</Text>
            <Text style={styles.statusSubText}>
              Initialized: {isInitialized ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.statusSubText}>
              Connected: {isConnected ? 'Yes' : 'No'}
            </Text>
            <Text style={styles.statusSubText}>
              Token: {token ? '✅ Available' : '❌ Missing'}
            </Text>
          </View>
        </View>

        {/* Test Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Notifications</Text>
          <View style={styles.buttonGrid}>
            <TouchableOpacity style={[styles.button, styles.successButton]} onPress={handleTestNotification}>
              <Text style={styles.buttonText}>Test Success</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.errorButton]} onPress={handleTestError}>
              <Text style={styles.buttonText}>Test Error</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.warningButton]} onPress={handleTestWarning}>
              <Text style={styles.buttonText}>Test Warning</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleManualConnect}>
              <Text style={styles.buttonText}>Manual Connect</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Custom Message */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Message</Text>
          <TextInput
            style={styles.textInput}
            value={customMessage}
            onChangeText={setCustomMessage}
            placeholder="Enter custom message..."
            multiline
          />
          <TouchableOpacity style={[styles.button, styles.primaryButton]} onPress={handleSendCustomMessage}>
            <Text style={styles.buttonText}>Send Message</Text>
          </TouchableOpacity>
        </View>

        {/* Notification Management */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Notifications ({list.length})
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleClearAll}>
              <Text style={styles.buttonText}>Clear All</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={handleRemoveLast}>
              <Text style={styles.buttonText}>Remove Last</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Notifications List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications List</Text>
          {list.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          ) : (
            list.map((notification) => (
              <View key={notification.id} style={styles.notificationCard}>
                <View style={styles.notificationHeader}>
                  <Text style={styles.notificationTitle}>
                    {notification.title || 'No Title'}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => remove(notification.id)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.notificationMessage}>
                  {notification.message}
                </Text>
                <View style={styles.notificationFooter}>
                  <Text style={[styles.notificationType, { color: getTypeColor(notification.type) }]}>
                    {notification.type?.toUpperCase()}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {notification.at ? new Date(notification.at).toLocaleTimeString() : 'No time'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const getTypeColor = (type?: string) => {
  switch (type) {
    case 'success': return '#4CAF50';
    case 'error': return '#F44336';
    case 'warning': return '#FF9800';
    default: return '#2196F3';
  }
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#333',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    color: '#333',
  },
  statusSubText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 100,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  errorButton: {
    backgroundColor: '#F44336',
  },
  warningButton: {
    backgroundColor: '#FF9800',
  },
  secondaryButton: {
    backgroundColor: '#9E9E9E',
  },
  textInput: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 16,
  },
  emptyState: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
  notificationCard: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  removeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F44336',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  notificationFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  notificationType: {
    fontSize: 12,
    fontWeight: '600',
  },
  notificationTime: {
    fontSize: 12,
    color: '#999',
  },
});

export default TestSocketScreen;
