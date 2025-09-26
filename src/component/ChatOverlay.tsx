import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import FloatingChatButton from './FloatingChatButton';
import { useChat } from '../contexts/ChatContext';
import { useChatSync } from '../hooks/useChatSync';
import { useChatVisibility } from './ChatVisibilityProvider';
import { getUser } from '../utils/TokenManager';
import {
  setUserEmail as crispSetUserEmail,
  setUserNickname as crispSetUserNickname,
  setUserPhone as crispSetUserPhone,
  // setTokenId is required for session continuity per docs
  // https://docs.crisp.chat/guides/chatbox-sdks/react-native-sdk/
  setTokenId as crispSetTokenId,
} from 'react-native-crisp-chat-sdk';

const ChatOverlay = () => {
  const { userInfo, setUserInfo } = useChat();
  const { isChatButtonVisible } = useChatVisibility();
  
  // Sync user info from AuthContext to ChatContext
  useChatSync();

  console.log('ChatOverlay: isChatButtonVisible:', isChatButtonVisible);

  // Bootstrap user info from AsyncStorage in case AuthContext is not used
  useEffect(() => {
    const bootstrap = async () => {
      try {
        if (!userInfo?.email) {
          const stored = await getUser();
          if (stored && (stored.email || stored.username || stored.name)) {
            setUserInfo({
              email: stored.email,
              nickname: stored.full_name || stored.username,
              phone: stored.number_phone,
            });
          }
        }
      } catch (e) {
        // no-op
      }
    };
    bootstrap();
  }, [userInfo?.email, setUserInfo]);

  // Wire Crisp identity to enable session continuity (load previous chats)
  useEffect(() => {
    try {
      // Try to resolve a stable user id from stored user object shape
      const resolveTokenId = async (): Promise<string | undefined> => {
        const stored = await getUser();
        const candidate = stored?.id || stored?.user_id || stored?.uid;
        if (candidate) return String(candidate);
        // Fallback to email if no numeric/string id is available
        return userInfo?.email ? String(userInfo.email) : undefined;
      };

      (async () => {
        const tokenId = await resolveTokenId();
        if (tokenId) {
          crispSetTokenId(tokenId);
        }
        if (userInfo?.email) {
          crispSetUserEmail(userInfo.email, userInfo.email);
        }
        if (userInfo?.nickname) {
          crispSetUserNickname(userInfo.nickname);
        }
        if (userInfo?.phone) {
          crispSetUserPhone(userInfo.phone);
        }
      })();
    } catch (_) {
      // ignore SDK wiring errors to avoid blocking UI
    }
  }, [userInfo?.email, userInfo?.nickname, userInfo?.phone]);

  if (!isChatButtonVisible) {
    console.log('ChatOverlay: not rendering floating button');
    return null;
  }

  console.log('ChatOverlay: rendering floating button');

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
