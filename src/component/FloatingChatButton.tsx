import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  BackHandler,
  Modal,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { theme } from '../theme/colors';
import CrispChatComponent from './CrispChatComponent';
import { CRISP_CONFIG, getUserTokenId } from '../config/crispConfig';

const { width, height } = Dimensions.get('window');

interface FloatingChatButtonProps {
  userEmail?: string;
  userNickname?: string;
  userPhone?: string;
}

const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  userEmail,
  userNickname,
  userPhone,
}) => {
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [scaleValue] = useState(new Animated.Value(1));

  // Handle back button on Android
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      if (isChatVisible) {
        setIsChatVisible(false);
        return true; // Prevent default behavior
      }
      return false; // Allow default behavior
    });

    return () => backHandler.remove();
  }, [isChatVisible]);

  // Auto close chat after a timeout (fallback)
  useEffect(() => {
    if (isChatVisible) {
      const timeout = setTimeout(() => {
        setIsChatVisible(false);
      }, 30000); // 30 seconds timeout

      return () => clearTimeout(timeout);
    }
  }, [isChatVisible]);

  const handlePress = () => {
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    // Toggle chat visibility
    if (isChatVisible) {
      setIsChatVisible(false);
    } else {
      setIsChatVisible(true);
    }
  };

  return (
    <>
      {/* Chat Modal */}
      <Modal
        visible={isChatVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setIsChatVisible(false)}
      >
        <View style={styles.chatContainer}>
          <CrispChatComponent
            websiteId={CRISP_CONFIG.WEBSITE_ID}
            userTokenId={getUserTokenId()}
            userEmail={userEmail}
            userNickname={userNickname}
            userPhone={userPhone}
            onLogout={() => setIsChatVisible(false)}
          />
          {/* Close button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsChatVisible(false)}
          >
            <Icon name="close" size={24} color={theme.colors.white} />
          </TouchableOpacity>
        </View>
      </Modal>
      
      {/* Floating button - always show */}
      <Animated.View style={[styles.container, { transform: [{ scale: scaleValue }] }]}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Icon 
            name={isChatVisible ? "close" : "message-text"} 
            size={24} 
            color={theme.colors.white} 
          />
        </TouchableOpacity>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 150,
    right: 20,
    zIndex: 1000,
  },
  floatingButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  chatContainer: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: theme.colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
});

export default FloatingChatButton;
