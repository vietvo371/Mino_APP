import { useEffect, useRef } from 'react';
import { getEcho, joinChannel, listenToEvent } from '../socket/echo';

export const useEchoChannel = (channelName: string, eventName: string, callback: (data: any) => void) => {
    const callbackRef = useRef(callback);
    
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const echo = getEcho();
        if (!echo) return;

        const channel = joinChannel(channelName);
        if (!channel) return;

        const handler = (data: any) => callbackRef.current(data);
        
        listenToEvent(channel, eventName, handler);
        
        return () => {
            echo.leave(channelName);
        };
    }, [channelName, eventName]);
};
