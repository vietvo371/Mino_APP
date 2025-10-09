import { useAlert } from "../component/AlertCustom";
import React, { useEffect, useState } from 'react';
import { useNotificationStore } from './notificationStore';
import ToastCustom, { ToastData } from '../component/ToastCustom';

export const NotificationHub = () => {
    const list = useNotificationStore((s) => s.list);
    const remove = useNotificationStore((s) => s.remove);
    const [currentToast, setCurrentToast] = useState<ToastData | null>(null);

    useEffect(() => {
        if (list.length === 0) {
            setCurrentToast(null);
            return;
        }
        
        const last = list[list.length - 1];
        
        // Only show if it's a new notification (not already showing)
        if (!currentToast || currentToast.id !== last.id) {
            setCurrentToast({
                id: last.id,
                title: last.title,
                message: last.message,
                type: last.type,
                duration: 5000, 
            });
        }
    }, [list, currentToast]);

    const handleHideToast = () => {
        if (currentToast) {
            remove(currentToast.id);
        }
        setCurrentToast(null);
    };

    return (
        <ToastCustom 
            toast={currentToast} 
            onHide={handleHideToast}
        />
    );
};
