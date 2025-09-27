import React, { useEffect } from 'react';
import Toast from 'react-native-toast-message';
import { useNotificationStore } from './notificationStore';

export const NotificationHub = () => {
    const list = useNotificationStore((s) => s.list);
    const remove = useNotificationStore((s) => s.remove);

    useEffect(() => {
        if (list.length === 0) return;
        const last = list[list.length - 1];
        
        Toast.show({
            type:
                last.type === 'success' ? 'success' :
                last.type === 'warning' ? 'info' :
                last.type === 'error' ? 'error' : 'info',
            text1: last.title ?? 'Notification',
            text2: last.message,
            position: 'top',
            visibilityTime: 3500,
            onHide: () => remove(last.id), // Tự động xóa sau khi hiển thị
        });
    }, [list, remove]);

    return <Toast />;
};
