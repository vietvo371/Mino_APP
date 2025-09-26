import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';

export const useChatSync = () => {
  const { user } = useAuth();
  const { setUserInfo } = useChat();

  useEffect(() => {
    if (user) {
      setUserInfo({
        email: user.email,
        nickname: user.name || user.username,
        phone: user.phone,
      });
    } else {
      setUserInfo({});
    }
  }, [user, setUserInfo]);
};
