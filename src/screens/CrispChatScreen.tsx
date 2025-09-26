import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import CrispChatComponent from '../component/CrispChatComponent';
import { CRISP_CONFIG, getUserTokenId } from '../config/crispConfig';
import { useThemeColor } from '../hooks/useThemeColor';
import { ThemedText } from '../component/ThemedText';
import ButtonCustom from '../component/ButtonCustom';
import { theme } from '../theme/colors';

const CrispChatScreen: React.FC = () => {
  const [isChatVisible, setIsChatVisible] = useState(false);

  const handleShowChat = () => {
    if (CRISP_CONFIG.WEBSITE_ID === 'YOUR_WEBSITE_ID_HERE') {
      Alert.alert(
        'Configuration Required',
        'Please update your Crisp Website ID in src/config/crispConfig.ts',
        [{ text: 'OK' }]
      );
      return;
    }
    setIsChatVisible(true);
  };

  const handleHideChat = () => {
    setIsChatVisible(false);
  };

  const handleLogout = () => {
    setIsChatVisible(false);
    // Add any additional logout logic here
  };

  if (isChatVisible) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleHideChat} style={styles.closeButton}>
            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Support Chat</ThemedText>
        </View>
        <CrispChatComponent
          websiteId={CRISP_CONFIG.WEBSITE_ID}
          userTokenId={getUserTokenId()}
          userEmail="user@example.com" // Replace with actual user email
          userNickname="User" // Replace with actual user nickname
          userPhone="+1234567890" // Replace with actual user phone
          onLogout={handleLogout}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <ThemedText style={styles.title}>Crisp Chat Integration</ThemedText>
        <ThemedText style={styles.description}>
          Tap the button below to open the support chat. Make sure to configure your
          Crisp Website ID in the config file.
        </ThemedText>
        
        <ButtonCustom
          title="Open Support Chat"
          onPress={handleShowChat}
          style={styles.chatButton}
        />
        
        <View style={styles.configInfo}>
          <ThemedText style={styles.configTitle}>Configuration:</ThemedText>
          <ThemedText style={styles.configText}>
            1. Get your Website ID from Crisp Dashboard
          </ThemedText>
          <ThemedText style={styles.configText}>
            2. Update CRISP_CONFIG.WEBSITE_ID in src/config/crispConfig.ts
          </ThemedText>
          <ThemedText style={styles.configText}>
            3. Customize user information as needed
          </ThemedText>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 8,
    marginRight: 12,
  },
  closeButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  chatButton: {
    marginBottom: 32,
  },
  configInfo: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 8,
  },
  configTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  configText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default CrispChatScreen;
