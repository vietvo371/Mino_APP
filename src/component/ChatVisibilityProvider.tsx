import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ChatVisibilityContextType {
  isChatButtonVisible: boolean;
  setChatButtonVisible: (visible: boolean) => void;
}

const ChatVisibilityContext = createContext<ChatVisibilityContextType | undefined>(undefined);

interface ChatVisibilityProviderProps {
  children: ReactNode;
}

export const ChatVisibilityProvider: React.FC<ChatVisibilityProviderProps> = ({ children }) => {
  const [isChatButtonVisible, setChatButtonVisible] = useState(true);

  return (
    <ChatVisibilityContext.Provider
      value={{
        isChatButtonVisible,
        setChatButtonVisible,
      }}
    >
      {children}
    </ChatVisibilityContext.Provider>
  );
};

export const useChatVisibility = (): ChatVisibilityContextType => {
  const context = useContext(ChatVisibilityContext);
  if (context === undefined) {
    throw new Error('useChatVisibility must be used within a ChatVisibilityProvider');
  }
  return context;
};
