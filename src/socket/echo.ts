import 'react-native-get-random-values';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js/react-native';

// @ts-ignore
global.Pusher = Pusher;

// Cấu hình server của bạn
const API_BASE = 'https://mimo.dragonlab.vn';
const BROADCAST_HOST = 'mimo.dragonlab.vn';
const PUSHER_KEY = 'mgo7rulpwxlwtslgbr4k';

let echoInstance: Echo<any> | null = null;

export const initEcho = (token: string) => {
    if (echoInstance) return echoInstance;

    const pusher = new Pusher(PUSHER_KEY, {
        cluster: 'mt1', // Thay đổi cluster của bạn
        wsHost: BROADCAST_HOST,
        wsPort: 443,
        wssPort: 443,
        forceTLS: true,
        enabledTransports: ['ws', 'wss'],
        disableStats: true,

        // Cấu hình reconnection
        activityTimeout: 30000,
        pongTimeout: 6000,

        channelAuthorization: {
            endpoint: `${API_BASE}/api/broadcasting/auth`,
            transport: 'ajax',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
            },
        },
    });

    echoInstance = new Echo({
        broadcaster: 'pusher',
        client: pusher,
    });

    return echoInstance;
};

// Lấy tên kênh riêng theo token (server trả về ví dụ: "notifications.token.<id>")
export const fetchTokenChannel = async (bearerToken: string): Promise<string> => {
    const res = await fetch(`${API_BASE}/api/me/broadcast-channel`, {
        headers: {
            Authorization: `Bearer ${bearerToken}`,
            Accept: 'application/json',
        },
    });
    if (!res.ok) {
        throw new Error(`fetchTokenChannel failed: ${res.status}`);
    }
    const json = await res.json();
    const channel = String(json?.channel ?? '');
    // Echo sẽ tự thêm tiền tố "private-" khi subscribe
    return channel.replace(/^private-/, '');
};

export const getEcho = () => echoInstance;

export const disconnectEcho = () => { 
    echoInstance?.disconnect(); 
    echoInstance = null; 
};

// Helper functions để subscribe/unsubscribe channels
export const joinChannel = (channelName: string) => {
    if (echoInstance) {
        return echoInstance.private(channelName);
    }
    return null;
};

export const leaveChannel = (channelName: string) => {
    if (echoInstance) {
        echoInstance.leave(channelName);
    }
};

// Helper function để listen events
export const listenToEvent = (channel: any, eventName: string, callback: (data: any) => void) => {
    if (channel) {
        channel.listen(eventName, callback);
    }
};
