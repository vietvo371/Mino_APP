import React, { createContext, useContext, useState, ReactNode } from 'react';

interface UserInfo {
  email?: string;
  nickname?: string;
  phone?: string;
}

interface ChatContextType {
  userInfo: UserInfo;
  setUserInfo: (info: UserInfo) => void;
  isChatVisible: boolean;
  setIsChatVisible: (visible: boolean) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [userInfo, setUserInfo] = useState<UserInfo>({});
  const [isChatVisible, setIsChatVisible] = useState(false);

  return (
    <ChatContext.Provider
      value={{
        userInfo,
        setUserInfo,
        isChatVisible,
        setIsChatVisible,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
