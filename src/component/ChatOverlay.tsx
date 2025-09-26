import React from 'react';
import { View, StyleSheet } from 'react-native';
import FloatingChatButton from './FloatingChatButton';
import { useChat } from '../contexts/ChatContext';
import { useChatSync } from '../hooks/useChatSync';
import { useChatVisibility } from './ChatVisibilityProvider';

const ChatOverlay: React.FC = () => {
  const { userInfo } = useChat();
  const { isChatButtonVisible } = useChatVisibility();
  
  // Sync user info from AuthContext to ChatContext
  useChatSync();

  if (!isChatButtonVisible) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="box-none">
      <FloatingChatButton
        userEmail={userInfo.email}
        userNickname={userInfo.nickname}
        userPhone={userInfo.phone}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
});

export default ChatOverlay;
