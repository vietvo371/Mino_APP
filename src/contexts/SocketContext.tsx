import React, { createContext, useContext, useEffect, useState } from 'react';
import { initEcho, getEcho, joinChannel, listenToEvent, disconnectEcho } from '../socket/echo';
import { useNotificationStore } from '../socket/notificationStore';
import { getToken } from '../utils/TokenManager';
import { useAuth } from './AuthContext';

interface SocketContextData {
  isConnected: boolean;
  isInitialized: boolean;
}

const SocketContext = createContext<SocketContextData>({} as SocketContextData);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated } = useAuth();
  const push = useNotificationStore((s) => s.push);

  useEffect(() => {
    // if (!isAuthenticated) {
    //   // Disconnect if not authenticated
    //   disconnectEcho();
    //   setIsConnected(false);
    //   setIsInitialized(false);
    //   return;
    // }

    const initializeSocket = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        // Initialize Echo connection
        const echo = initEcho(token);
        const pusher = (echo as any).connector.pusher;
        
        // Connection event listeners
        pusher.connection.bind('connected', () => {
          console.log('[WS] Connected');
          setIsConnected(true);
          // push({ title: 'WS', message: 'Connected to server', type: 'success' });
        });
        
        pusher.connection.bind('disconnected', () => {
          console.log('[WS] Disconnected');
          setIsConnected(false);
        });
        
        pusher.connection.bind('state_change', (state: any) => {
          console.log('[WS] State change:', state);
        });
        
        pusher.connection.bind('error', (error: any) => {
          console.log('[WS] Error:', error);
          // push({ title: 'WS Error', message: String(error?.error ?? error), type: 'error' });
        });
        
        // Join private channel
        const channel = joinChannel('notifications');
        
        if (channel) {
          // Subscription events
          channel.subscription.bind('pusher:subscription_succeeded', () => {
            console.log('[WS] Subscribed to private-notifications');
            // push({ title: 'WS', message: 'Subscribed to notifications', type: 'success' });
          });
          
          channel.subscription.bind('pusher:subscription_error', (err: any) => {
            console.log('[WS] Subscription error:', err);
            // push({ title: 'WS Subscribe Error', message: JSON.stringify(err), type: 'error' });
          });
          
          // Listen to specific events
          listenToEvent(channel, '.NotificationSuccessTransferEvent', (data) => {
            const {
              address,
              amount_usdt,
              amount_vnd,
              amount_vnd_real,
              rate,
              fee_percent,
              fee_vnd,
              bank_account,
              transaction_hash,
              network,
              sent_at,
              status,
              note,
              type,
            } = data ?? {};

            console.log('[WS] Transfer event:', data);

            const nf = new Intl.NumberFormat('vi-VN');
            const toVND = (n?: number) => (n == null ? '-' : `${nf.format(n)} ₫`);
            const toUSDT = (n?: number) => (n == null ? '-' : `${nf.format(n)} USDT`);
            const short = (s?: string, head = 10, tail = 6) =>
              s ? `${s.slice(0, head)}…${s.slice(-tail)}` : '-';
            const time = sent_at ? new Date(sent_at).toLocaleString() : '-';

            const ok = Number(status) === 1;
            const toastType = type ?? (ok ? 'success' : 'error');

            const title = ok ? 'Chuyển khoản thành công' : 'Chuyển khoản';

            const message =
              `Số tiền: ${toUSDT(amount_usdt)}  (~${toVND(amount_vnd_real)})\n` +
              `Tỷ giá: ${rate ? nf.format(rate) : '-'} | Phí: ${toVND(fee_vnd)} (${fee_percent ? fee_percent * 100 : 0}%)\n` +
              `TK nhận: ${bank_account ?? '-'} | Mạng: ${network ?? '-'}\n` +
              (note ? `Ghi chú: ${note}\n` : '') +
              `Tx: ${short(transaction_hash)}\n` +
              `Ví: ${short(address)}\n` +
              `Thời gian: ${time}`;
            push({
              title,
              message,
              type: toastType,
              raw: data,
            });
          });
          
          // Listen to general notification events
          listenToEvent(channel, '.NotificationEvent', (data) => {
            console.log('[WS] Notification event:', data);
            push({
              title: data.title || 'Notification',
              message: data.message,
              type: data.type || 'info',
              raw: data,
            });
          });
        }

        setIsInitialized(true);
      } catch (error) {
        console.error('Socket initialization error:', error);
        push({ title: 'Socket Error', message: 'Failed to initialize socket connection', type: 'error' });
      }
    };

    initializeSocket();

    // Cleanup
    return () => {
      const echo = getEcho();
      if (echo) {
        echo.leave('private-notifications');
      }
    };
  }, [isAuthenticated, push]);

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        isInitialized,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export function useSocket(): SocketContextData {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('useSocket phải được sử dụng trong SocketProvider');
  }

  return context;
}
