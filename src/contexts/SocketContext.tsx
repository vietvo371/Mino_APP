import { useAlert } from "../component/AlertCustom";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { initEcho, getEcho, listenToEvent, disconnectEcho, fetchTokenChannel } from '../socket/echo';
import { useNotificationStore } from '../socket/notificationStore';
import { getToken } from '../utils/TokenManager';
import { useAuth } from './AuthContext';
import { useTranslation } from '../hooks/useTranslation';

interface SocketContextData {
  isConnected: boolean;
  isInitialized: boolean;
}

const SocketContext = createContext<SocketContextData>({} as SocketContextData);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const { isAuthenticated } = useAuth();
  const { t } = useTranslation();
  const push = useNotificationStore((s) => s.push);

  useEffect(() => {
    let mounted = true;
    let subscribedChannel = '';

    const initializeSocket = async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const echo = initEcho(token);
        const pusher = (echo as any).connector.pusher;

        pusher.connection.bind('connected', () => {
          console.log('[WS] Connected');
          setIsConnected(true);
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
        });

        const channelName = await fetchTokenChannel(token); // e.g. notifications.token.<id>
        if (!mounted) return;
        subscribedChannel = channelName;

        const channel = (echo as any).private(channelName);

        channel.subscription.bind('pusher:subscription_succeeded', () => {
          console.log('[WS] Subscribed to', `private-${channelName}`);
        });

        channel.subscription.bind('pusher:subscription_error', (err: any) => {
          console.log('[WS] Subscription error:', err);
        });

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
          
          // Determine transaction type based on type field
          // type = 1: Buy USDT (VND → USDT)
          // type = 2: Sell USDT (USDT → VND)
          const isBuyTransaction = Number(data.type) === 1;
          const isSellTransaction = Number(data.type) === 2;
          
          const transactionTypeText = isSellTransaction ? t('detailHistory.sellUsdt') : 
                                     isBuyTransaction ? t('detailHistory.buyUsdt') : 
                                     t('toast.transaction');
          
          const title = ok ? t('toast.transactionSuccess') : t('toast.transactionFailed');
       
          let message = '';
          
          if (isSellTransaction) {
            // Sell USDT transaction message
            message =
              `${transactionTypeText}\n` +
              `${t('toast.amount')}: ${toUSDT(amount_usdt)} → ${toVND(amount_vnd_real)}\n` +
              `${t('toast.exchangeRate')}: ${rate ? nf.format(rate) : '-'} | ${t('toast.fee')}: ${toVND(fee_vnd)} (${fee_percent ? fee_percent * 100 : 0}%)\n` +
              `${t('toast.bankName')}: ${data.bank_name || '-'}\n` +
              `${t('toast.accountNumber')}: ${data.bank_account || '-'}\n` +
              `${t('toast.time')}: ${time}`;
          } else if (isBuyTransaction) {
            // Buy USDT transaction message
            message =
              `${transactionTypeText}\n` +
              `${t('toast.amount')}: ${toVND(amount_vnd)} → ${toUSDT(amount_usdt)}\n` +
              `${t('toast.exchangeRate')}: ${rate ? nf.format(rate) : '-'} | ${t('toast.fee')}: ${toVND(fee_vnd)} (${fee_percent ? fee_percent * 100 : 0}%)\n` +
              `${t('toast.bankName')}: ${data.bank_name || '-'}\n` +
              `${t('toast.accountNumber')}: ${data.bank_account || '-'}\n` +
              `${t('toast.time')}: ${time}`;
          } else {
            // Generic transaction message
            message =
              `${t('toast.transaction')}\n` +
              `${t('toast.amount')}: ${toUSDT(amount_usdt)} / ${toVND(amount_vnd_real)}\n` +
              `${t('toast.exchangeRate')}: ${rate ? nf.format(rate) : '-'} | ${t('toast.fee')}: ${toVND(fee_vnd)} (${fee_percent ? fee_percent * 100 : 0}%)\n` +
              `${t('toast.time')}: ${time}`;
          }
          
          push({ title, message, type: toastType, raw: data });
        });

        // Global WS error toasts
        (echo as any).connector.pusher.connection.bind('error', (e: any) => {
          console.log('[WS] Global error:', e);
          // push({ 
          //   title: t('toast.socketError'), 
          //   message: t('toast.socketError'), 
          //   type: 'error' 
          // });
        });

        setIsInitialized(true);
      } catch (error) {
        console.error('Socket initialization error:', error);
        // push({ 
        //   title: t('toast.socketError'), 
        //   message: t('toast.socketError'), 
        //   type: 'error' 
        // });
      }
    };

    initializeSocket();

    return () => {
      mounted = false;
      const echo = getEcho();
      if (echo && subscribedChannel) {
        echo.leave(`private-${subscribedChannel}`);
      }
      disconnectEcho();
    };
  }, [isAuthenticated, push, t]);

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
