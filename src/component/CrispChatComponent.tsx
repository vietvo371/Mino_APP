import React, { useEffect } from 'react';
import CrispChat, {
  configure,
  setUserEmail,
  setUserNickname,
  setUserPhone,
  resetSession,
} from 'react-native-crisp-chat-sdk';

interface CrispChatComponentProps {
  websiteId: string;
  userTokenId?: string;
  userEmail?: string;
  userNickname?: string;
  userPhone?: string;
  onLogout?: () => void;
}

const CrispChatComponent: React.FC<CrispChatComponentProps> = ({
  websiteId,
  userTokenId,
  userEmail,
  userNickname,
  userPhone,
  onLogout,
}) => {
  useEffect(() => {
    // Configure Crisp with website ID
    configure(websiteId);
    if (userEmail) {
      setUserEmail(userEmail, userEmail);
    }
    if (userNickname) {
      setUserNickname(userNickname);
    }
    if (userPhone) {
      setUserPhone(userPhone);
    }

    // Cleanup function to reset session when component unmounts
    return () => {
      if (onLogout) {
        resetSession();
      }
    };
  }, [websiteId, userEmail, userNickname, userPhone, onLogout]);


  return <CrispChat />;
};

export default CrispChatComponent;
